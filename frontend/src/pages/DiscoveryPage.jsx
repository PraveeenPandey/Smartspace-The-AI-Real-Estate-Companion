import { useState } from "react";

import { fetchRecommendations, fetchSessionDetail, sendChatMessage } from "../api";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";

const initialDiscovery = {
  brief: "Need a 3 BHK in Bangalore near metro under 1.5 Cr for family use.",
  city: "Bangalore",
  budgetMin: 9000000,
  budgetMax: 15000000,
  bhk: 3,
  propertyType: "apartment",
  localities: "Whitefield",
  purpose: "self_use",
  commuteAnchor: "nearest metro",
};

function DiscoveryPage() {
  const [sessionId, setSessionId] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [chatSummary, setChatSummary] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [discoveryForm, setDiscoveryForm] = useState(initialDiscovery);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refreshSession(nextSessionId) {
    if (!nextSessionId) return;
    const data = await fetchSessionDetail(nextSessionId);
    setSessionDetail(data);
  }

  async function handleCaptureRequirements(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const data = await sendChatMessage({
        session_id: sessionId,
        message: discoveryForm.brief,
        language: "en",
      });
      setChatSummary(data);
      setSessionId(data.session_id);
      setDiscoveryForm((current) => ({
        ...current,
        city: data.extracted_preferences.city || current.city,
        bhk: data.extracted_preferences.bhk || current.bhk,
      }));
      await refreshSession(data.session_id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateRecommendations(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const data = await fetchRecommendations({
        city: discoveryForm.city,
        budget_min: Number(discoveryForm.budgetMin),
        budget_max: Number(discoveryForm.budgetMax),
        bhk: Number(discoveryForm.bhk),
        property_type: discoveryForm.propertyType,
        preferred_localities: discoveryForm.localities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        purpose: discoveryForm.purpose,
        commute_anchor: discoveryForm.commuteAnchor || null,
      });
      setRecommendations(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="workspace-grid">
      <Panel
        title="Buyer Intake"
        subtitle="Capture the brief, persist the conversation, and start the recommendation path."
      >
        <form className="form-grid" onSubmit={handleCaptureRequirements}>
          <label className="field field-full">
            <span>Buyer Brief</span>
            <textarea
              rows="6"
              value={discoveryForm.brief}
              onChange={(event) =>
                setDiscoveryForm((current) => ({ ...current, brief: event.target.value }))
              }
            />
          </label>
          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? "Capturing..." : "Capture Requirements"}
            </button>
          </div>
        </form>

        {chatSummary ? (
          <div className="response-card">
            <div className="response-head">
              <h3>Requirement Summary</h3>
              <span className="badge">Session #{chatSummary.session_id}</span>
            </div>
            <p>{chatSummary.reply}</p>
            <div className="chip-row">
              <span className="chip">Intent: {chatSummary.intent}</span>
              {Object.entries(chatSummary.extracted_preferences).map(([key, value]) => (
                <span key={key} className="chip muted">
                  {key}: {String(value)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </Panel>

      <Panel
        title="Search Strategy"
        subtitle="Refine filters, purpose, and localities before scoring the shortlist."
      >
        <form className="form-grid" onSubmit={handleGenerateRecommendations}>
          <label className="field">
            <span>Target City</span>
            <input
              value={discoveryForm.city}
              onChange={(event) =>
                setDiscoveryForm((current) => ({ ...current, city: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Property Type</span>
            <select
              value={discoveryForm.propertyType}
              onChange={(event) =>
                setDiscoveryForm((current) => ({
                  ...current,
                  propertyType: event.target.value,
                }))
              }
            >
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
            </select>
          </label>
          <label className="field">
            <span>Budget From</span>
            <input
              type="number"
              value={discoveryForm.budgetMin}
              onChange={(event) =>
                setDiscoveryForm((current) => ({ ...current, budgetMin: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Budget To</span>
            <input
              type="number"
              value={discoveryForm.budgetMax}
              onChange={(event) =>
                setDiscoveryForm((current) => ({ ...current, budgetMax: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Bedrooms</span>
            <input
              type="number"
              value={discoveryForm.bhk}
              onChange={(event) =>
                setDiscoveryForm((current) => ({ ...current, bhk: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Purchase Purpose</span>
            <select
              value={discoveryForm.purpose}
              onChange={(event) =>
                setDiscoveryForm((current) => ({ ...current, purpose: event.target.value }))
              }
            >
              <option value="self_use">Self Use</option>
              <option value="investment">Investment</option>
            </select>
          </label>
          <label className="field field-full">
            <span>Preferred Localities</span>
            <input
              value={discoveryForm.localities}
              onChange={(event) =>
                setDiscoveryForm((current) => ({ ...current, localities: event.target.value }))
              }
            />
          </label>
          <label className="field field-full">
            <span>Commute or Landmark Anchor</span>
            <input
              value={discoveryForm.commuteAnchor}
              onChange={(event) =>
                setDiscoveryForm((current) => ({
                  ...current,
                  commuteAnchor: event.target.value,
                }))
              }
            />
          </label>
          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? "Scoring..." : "Generate Recommendations"}
            </button>
          </div>
        </form>
        {error ? <div className="banner error">{error}</div> : null}
      </Panel>

      <Panel
        title="Conversation Timeline"
        subtitle="A persisted view of the current discovery session and extracted details."
      >
        {sessionDetail?.messages?.length ? (
          <div className="timeline">
            {sessionDetail.messages.map((message, index) => (
              <article
                className={`timeline-item ${message.sender_type === "assistant" ? "assistant" : "user"}`}
                key={`${message.created_at}-${index}`}
              >
                <div className="timeline-item-head">
                  <strong>{message.sender_type === "assistant" ? "SmartSpace" : "Client Brief"}</strong>
                  <span>{message.created_at.replace("T", " ").slice(0, 16)}</span>
                </div>
                <p>{message.content_text}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active discovery timeline"
            copy="Capture the buyer brief to create a persistent session record."
          />
        )}
      </Panel>

      <Panel
        title="Recommended Properties"
        subtitle="Gemini-guided match, spatial, and market outputs merged into one shortlist."
      >
        {recommendations?.properties?.length ? (
          <>
            <div className="response-card">
              <div className="response-head">
                <h3>Query Summary</h3>
                <span className="badge subtle">Resolution Aware</span>
              </div>
              <p>{recommendations.query_summary}</p>
              <p>{recommendations.market_summary}</p>
            </div>
            <div className="property-grid">
              {recommendations.properties.map((property) => (
                <article key={property.property_id} className="property-card">
                  <div className="property-card-top">
                    <span className="badge subtle">{property.locality}</span>
                    <span className="score-pill">{property.match_score.toFixed(2)}</span>
                  </div>
                  <h3>{property.title}</h3>
                  <p className="property-meta">
                    {property.city} · {property.bhk} BHK · {property.area_sqft} sqft
                  </p>
                  <p className="property-price">₹ {property.price.toLocaleString("en-IN")}</p>
                  <p className="property-explainer">{property.explanation}</p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="No shortlist generated yet"
            copy="Set criteria and run the recommendation flow to populate the shortlist."
          />
        )}
      </Panel>
    </section>
  );
}

export default DiscoveryPage;
