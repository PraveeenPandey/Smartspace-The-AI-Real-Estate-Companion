import streamlit as st

from streamlit_app.api_client.client import SmartSpaceApiClient


client = SmartSpaceApiClient()

if "buyer_session_id" not in st.session_state:
    st.session_state.buyer_session_id = None
if "buyer_preferences" not in st.session_state:
    st.session_state.buyer_preferences = {}
if "buyer_recommendations" not in st.session_state:
    st.session_state.buyer_recommendations = None

st.title("Discovery Workspace")
st.caption("Capture buyer requirements, retain context, and generate market-aware property shortlists.")

left, right = st.columns([1.1, 0.9])

with left:
    with st.form("buyer_chat_form"):
        message = st.text_area(
            "Buyer brief",
            placeholder="I need a 3 BHK in Bangalore near metro under 1.5 Cr for family use.",
        )
        submitted = st.form_submit_button("Capture Requirements")

    if submitted and message:
        try:
            chat_result = client.send_chat_message(
                {
                    "session_id": st.session_state.buyer_session_id,
                    "message": message,
                    "language": "en",
                }
            )
            st.session_state.buyer_session_id = chat_result["session_id"]
            st.session_state.buyer_preferences = chat_result.get("extracted_preferences", {})
            st.subheader("Requirement Summary")
            st.json(chat_result)
        except Exception as exc:
            st.error(f"Backend request failed: {exc}")

    preferences = st.session_state.buyer_preferences
    with st.form("buyer_recommendation_form"):
        st.subheader("Search Criteria")
        city = st.text_input("Target City", value=preferences.get("city", "Bangalore"))
        col1, col2 = st.columns(2)
        with col1:
            budget_min = st.number_input("Budget From", min_value=1000000, value=9000000, step=500000)
        with col2:
            budget_max = st.number_input("Budget To", min_value=1000000, value=15000000, step=500000)
        col3, col4 = st.columns(2)
        with col3:
            bhk = st.number_input("Bedrooms", min_value=1, max_value=10, value=preferences.get("bhk", 3))
        with col4:
            property_type = st.selectbox("Property Type", ["apartment", "villa", "plot"])
        preferred_localities = st.text_input("Preferred Localities", value="Whitefield")
        col5, col6 = st.columns(2)
        with col5:
            purpose = st.selectbox("Purchase Purpose", ["self_use", "investment"])
        with col6:
            commute_anchor = st.text_input("Commute or Landmark Anchor", value="nearest metro")
        search_submitted = st.form_submit_button("Generate Recommendations")

    if search_submitted:
        payload = {
            "city": city,
            "budget_min": budget_min,
            "budget_max": budget_max,
            "bhk": bhk,
            "property_type": property_type,
            "preferred_localities": [item.strip() for item in preferred_localities.split(",") if item.strip()],
            "purpose": purpose,
            "commute_anchor": commute_anchor or None,
        }
        try:
            st.session_state.buyer_recommendations = client.search_recommendations(payload)
        except Exception as exc:
            st.error(f"Backend request failed: {exc}")

with right:
    st.subheader("Conversation Timeline")
    if st.session_state.buyer_session_id:
        try:
            session_detail = client.get_session_detail(st.session_state.buyer_session_id)
            st.caption(
                f"Session #{session_detail['session_id']} | workflow: {session_detail['workflow_stage']}"
            )
            for message in session_detail["messages"]:
                with st.chat_message(message["sender_type"]):
                    st.write(message["content_text"])
                    if message["extracted_entities"]:
                        st.caption(f"Captured details: {message['extracted_entities']}")
        except Exception as exc:
            st.error(f"Could not load session trace: {exc}")
    else:
        st.info("Capture a buyer brief to start a persisted discovery session.")

if st.session_state.buyer_recommendations:
    result = st.session_state.buyer_recommendations
    st.divider()
    st.subheader("Recommended Properties")
    st.write(result["query_summary"])
    st.caption(result["market_summary"])
    for property_card in result["properties"]:
        with st.container(border=True):
            st.markdown(
                f"**{property_card['title']}**  \n"
                f"{property_card['locality']}, {property_card['city']}  \n"
                f"Price: {property_card['price']:,.0f} | {property_card['bhk']} BHK | {property_card['area_sqft']} sqft"
            )
            st.progress(min(max(property_card["match_score"], 0.0), 1.0))
            st.write(property_card["explanation"])
    st.write("Recommended next steps:")
    for action in result["next_actions"]:
        st.write(f"- {action}")
