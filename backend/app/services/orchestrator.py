from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.agents.conversation import ConversationAgent
from backend.app.agents.document import DocumentAgent
from backend.app.agents.listing import ListingCopilotAgent
from backend.app.agents.market import MarketIntelligenceAgent
from backend.app.agents.matchmaker import MatchmakerAgent
from backend.app.agents.spatial import SpatialAgent
from backend.app.models.models import (
    AgentRun,
    Document,
    Message,
    Property,
    RecommendationResult,
    RecommendationRun,
    SessionRecord,
)
from backend.app.schemas.admin import AdminOverviewResponse, AgentRunSummary
from backend.app.schemas.chat import ChatRequest, ChatResponse, SessionDetailResponse, SessionMessage
from backend.app.schemas.documents import DocumentAnalysisRequest, DocumentAnalysisResponse
from backend.app.schemas.listings import ListingCreateRequest, ListingCreateResponse
from backend.app.schemas.recommendations import PropertyCard, RecommendationRequest, RecommendationResponse
from backend.app.services.gemini import GeminiService


class OrchestratorService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.gemini = GeminiService()
        self.conversation_agent = ConversationAgent(self.gemini)
        self.matchmaker_agent = MatchmakerAgent(self.gemini)
        self.spatial_agent = SpatialAgent(self.gemini)
        self.market_agent = MarketIntelligenceAgent(self.gemini)
        self.listing_agent = ListingCopilotAgent()
        self.document_agent = DocumentAgent()

    def handle_chat(self, payload: ChatRequest) -> ChatResponse:
        session = self._get_or_create_session(payload.session_id, payload.user_id)
        self.db.add(
            Message(
                session_id=session.id,
                sender_type="user",
                message_type="text",
                content_text=payload.message,
                extracted_entities={},
            )
        )
        self.db.flush()
        result = self.conversation_agent.run(payload.model_dump())
        session.workflow_stage = result["intent"]
        self.db.add(
            Message(
                session_id=session.id,
                sender_type="assistant",
                message_type="text",
                content_text=result["reply"],
                extracted_entities=result["extracted_preferences"],
            )
        )
        self.db.commit()
        self._log_agent_run(
            self.conversation_agent.agent_name,
            {**payload.model_dump(), "session_id": session.id},
            result,
            session_id=session.id,
        )
        return ChatResponse(
            session_id=session.id,
            reply=result["reply"],
            intent=result["intent"],
            extracted_preferences=result["extracted_preferences"],
            next_actions=result["next_actions"],
        )

    def build_recommendations(self, payload: RecommendationRequest) -> RecommendationResponse:
        normalized_request = self._normalize_recommendation_request(payload)
        query = select(Property).where(
            Property.bhk == normalized_request["bhk"],
            Property.property_type.ilike(normalized_request["property_type"]),
            Property.price >= normalized_request["budget_min"],
            Property.price <= normalized_request["budget_max"],
        )
        candidate_cities = normalized_request["candidate_cities"]
        if len(candidate_cities) == 1:
            query = query.where(Property.city.ilike(candidate_cities[0]))
        else:
            query = query.where(Property.city.in_(candidate_cities))
        properties = self.db.scalars(query).all()
        ranked = []
        for property_item in properties:
            match_score, match_note, match_confidence = self.matchmaker_agent.score_property(
                normalized_request, property_item
            )
            spatial_score, spatial_note, spatial_confidence = self.spatial_agent.score_property(
                property_item, normalized_request["commute_anchor"]
            )
            market_score, market_note, market_confidence = self.market_agent.score_property(
                property_item, normalized_request["purpose"]
            )
            final_score = round((match_score * 0.45) + (spatial_score * 0.3) + (market_score * 0.25), 2)
            ranked.append(
                {
                    "card": PropertyCard(
                    property_id=property_item.id,
                    title=property_item.title,
                    city=property_item.city,
                    locality=property_item.locality,
                    price=property_item.price,
                    bhk=property_item.bhk,
                    area_sqft=property_item.area_sqft,
                    match_score=final_score,
                    explanation=(
                        f"Match: {match_score:.2f}. Spatial: {spatial_score:.2f}. Market: {market_score:.2f}. "
                        f"{match_note} {spatial_note} {market_note}"
                    ),
                    ),
                    "match_score": match_score,
                    "match_note": match_note,
                    "match_confidence": match_confidence,
                    "spatial_score": spatial_score,
                    "spatial_note": spatial_note,
                    "spatial_confidence": spatial_confidence,
                    "market_score": market_score,
                    "market_note": market_note,
                    "market_confidence": market_confidence,
                    "final_score": final_score,
                }
            )
        ranked.sort(key=lambda item: item["final_score"], reverse=True)
        run = RecommendationRun(query_json=payload.model_dump())
        self.db.add(run)
        self.db.flush()
        for item in ranked[:5]:
            self.db.add(
                RecommendationResult(
                    run_id=run.id,
                    property_id=item["card"].property_id,
                    match_score=item["match_score"],
                    spatial_score=item["spatial_score"],
                    market_score=item["market_score"],
                    final_score=item["final_score"],
                    reason_json={"explanation": item["card"].explanation},
                )
            )
        self.db.commit()
        ranked_summary = [
            {
                "property_id": item["card"].property_id,
                "title": item["card"].title,
                "locality": item["card"].locality,
                "final_score": item["final_score"],
                "explanation": item["card"].explanation,
            }
            for item in ranked[:5]
        ]
        recommendation_summary = self.gemini.summarize_recommendations(
            normalized_request,
            ranked_summary,
        )
        self._log_agent_run(
            self.matchmaker_agent.agent_name,
            normalized_request,
            {
                "results": len(ranked),
                "confidence": self._average_confidence(ranked, "match_confidence"),
            },
        )
        self._log_agent_run(
            self.spatial_agent.agent_name,
            normalized_request,
            {
                "results": len(ranked),
                "commute_anchor": normalized_request["commute_anchor"],
                "confidence": self._average_confidence(ranked, "spatial_confidence"),
            },
        )
        self._log_agent_run(
            self.market_agent.agent_name,
            normalized_request,
            {
                "results": len(ranked),
                "purpose": normalized_request["purpose"],
                "confidence": self._average_confidence(ranked, "market_confidence"),
            },
        )
        query_summary = recommendation_summary["query_summary"]
        if normalized_request["resolution_note"]:
            query_summary = f"{recommendation_summary['query_summary']} Resolution note: {normalized_request['resolution_note']}"
        return RecommendationResponse(
            query_summary=query_summary,
            properties=[item["card"] for item in ranked[:5]],
            market_summary=recommendation_summary["market_summary"],
            next_actions=recommendation_summary["next_actions"],
        )

    def create_listing(self, payload: ListingCreateRequest) -> ListingCreateResponse:
        description = payload.description or (
            f"{payload.bhk} BHK {payload.property_type} in {payload.locality}, {payload.city}."
        )
        property_record = Property(
            title=payload.title,
            description=description,
            city=payload.city,
            locality=payload.locality,
            address=f"{payload.locality}, {payload.city}",
            lat=0.0,
            lng=0.0,
            property_type=payload.property_type,
            bhk=payload.bhk,
            bathrooms=payload.bathrooms,
            area_sqft=payload.area_sqft,
            price=payload.price,
            furnishing=payload.furnishing,
            amenities=payload.amenities,
            features_embedding=[0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        )
        self.db.add(property_record)
        self.db.commit()
        self.db.refresh(property_record)
        listing_result = self.listing_agent.run(payload.model_dump())
        self._log_agent_run(
            self.listing_agent.agent_name,
            payload.model_dump(),
            {"property_id": property_record.id, **listing_result},
        )
        return ListingCreateResponse(
            property_id=property_record.id,
            generated_title=listing_result["generated_title"],
            generated_description=listing_result["generated_description"],
            pricing_guidance=listing_result["pricing_guidance"],
            missing_fields=listing_result["missing_fields"],
        )

    def analyze_document(self, payload: DocumentAnalysisRequest) -> DocumentAnalysisResponse:
        agent_result = self.document_agent.run(payload.model_dump())
        document = Document(
            user_id=payload.user_id,
            property_id=payload.property_id,
            document_type=payload.document_type,
            file_url=payload.file_url,
            ocr_text=payload.raw_text,
            extracted_fields=agent_result["extracted_fields"],
            review_status="needs_review" if agent_result["requires_human_review"] else "parsed",
            confidence=agent_result["confidence"],
        )
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        self._log_agent_run(
            self.document_agent.agent_name,
            payload.model_dump(),
            {"document_id": document.id, **agent_result},
        )
        return DocumentAnalysisResponse(
            document_id=document.id,
            summary=agent_result["summary"],
            extracted_fields=agent_result["extracted_fields"],
            missing_items=agent_result["missing_items"],
            confidence=document.confidence,
            requires_human_review=agent_result["requires_human_review"],
        )

    def get_session_detail(self, session_id: int) -> SessionDetailResponse:
        session = self.db.get(SessionRecord, session_id)
        if session is None:
            return SessionDetailResponse(session_id=session_id, workflow_stage="missing", messages=[])
        messages = self.db.scalars(
            select(Message).where(Message.session_id == session_id).order_by(Message.created_at.asc())
        ).all()
        return SessionDetailResponse(
            session_id=session.id,
            workflow_stage=session.workflow_stage,
            messages=[
                SessionMessage(
                    sender_type=message.sender_type,
                    message_type=message.message_type,
                    content_text=message.content_text,
                    extracted_entities=message.extracted_entities,
                    created_at=message.created_at.isoformat(),
                )
                for message in messages
            ],
        )

    def get_admin_overview(self) -> AdminOverviewResponse:
        queued_reviews = self.db.scalar(
            select(func.count()).select_from(Document).where(Document.review_status == "needs_review")
        ) or 0
        active_sessions = self.db.scalar(
            select(func.count()).select_from(SessionRecord).where(SessionRecord.status == "active")
        ) or 0
        total_properties = self.db.scalar(select(func.count()).select_from(Property)) or 0
        recent_runs = self.db.scalars(
            select(AgentRun).order_by(AgentRun.created_at.desc()).limit(8)
        ).all()
        return AdminOverviewResponse(
            queued_reviews=queued_reviews,
            active_sessions=active_sessions,
            total_properties=total_properties,
            llm_mode=self.gemini.active_provider,
            recent_agent_runs=[
                AgentRunSummary(
                    agent_name=run.agent_name,
                    status=run.status,
                    confidence=run.confidence,
                    created_at=run.created_at.isoformat(),
                )
                for run in recent_runs
            ],
        )

    def _get_or_create_session(self, session_id: int | None, user_id: int | None) -> SessionRecord:
        if session_id is not None:
            session = self.db.get(SessionRecord, session_id)
            if session is not None:
                return session
        session = SessionRecord(user_id=user_id, status="active", workflow_stage="property_discovery")
        self.db.add(session)
        self.db.flush()
        return session

    def _log_agent_run(
        self, agent_name: str, input_json: dict, output_json: dict, session_id: int | None = None
    ) -> None:
        run = AgentRun(
            session_id=session_id,
            agent_name=agent_name,
            input_json=input_json,
            output_json=output_json,
            confidence=float(output_json.get("confidence", 0.8)),
            latency_ms=120,
            status="completed",
        )
        self.db.add(run)
        self.db.commit()

    def _average_confidence(self, ranked: list[dict], key: str) -> float:
        if not ranked:
            return 0.0
        total = sum(float(item.get(key, 0.0)) for item in ranked)
        return round(total / len(ranked), 2)

    def _normalize_recommendation_request(self, payload: RecommendationRequest) -> dict:
        city_aliases = {
            "ncr": ["Noida", "Gurgaon"],
            "delhi ncr": ["Noida", "Gurgaon"],
            "bangalore": ["Bangalore"],
            "bengaluru": ["Bangalore"],
            "gurugram": ["Gurgaon"],
        }
        locality_to_city = {
            "whitefield": "Bangalore",
            "sarjapur road": "Bangalore",
            "electronic city": "Bangalore",
            "hebbal": "Bangalore",
            "indirapuram": "Noida",
            "sector 150": "Noida",
            "sohna road": "Gurgaon",
            "golf course extension": "Gurgaon",
        }

        raw_city = payload.city.strip()
        city_key = raw_city.lower()
        candidate_cities = city_aliases.get(city_key, [raw_city])
        locality_hits = {
            locality: locality_to_city[locality.lower()]
            for locality in payload.preferred_localities
            if locality.lower() in locality_to_city
        }

        resolution_note = ""
        if locality_hits:
            inferred_cities = sorted(set(locality_hits.values()))
            if len(inferred_cities) == 1 and inferred_cities[0] not in candidate_cities:
                resolution_note = (
                    f"Input city '{payload.city}' was adjusted to '{inferred_cities[0]}' "
                    f"because locality preference matched that city."
                )
                candidate_cities = inferred_cities
            elif len(inferred_cities) == 1 and candidate_cities != inferred_cities and city_key in city_aliases:
                if inferred_cities[0] in candidate_cities:
                    candidate_cities = [inferred_cities[0]]
                    resolution_note = (
                        f"Regional city input '{payload.city}' was narrowed to '{inferred_cities[0]}' "
                        f"using the preferred locality."
                    )

        return {
            "city": payload.city,
            "candidate_cities": candidate_cities,
            "budget_min": payload.budget_min,
            "budget_max": payload.budget_max,
            "bhk": payload.bhk,
            "property_type": payload.property_type,
            "preferred_localities": payload.preferred_localities,
            "purpose": payload.purpose,
            "commute_anchor": payload.commute_anchor,
            "resolution_note": resolution_note,
        }
