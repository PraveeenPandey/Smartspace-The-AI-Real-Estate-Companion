import streamlit as st

from streamlit_app.api_client.client import SmartSpaceApiClient


client = SmartSpaceApiClient()

st.title("Operations Console")
st.caption("Monitor review queues, active discovery sessions, and recent workflow activity.")

try:
    overview = client.get_admin_overview()
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Queued Reviews", overview["queued_reviews"])
    col2.metric("Active Sessions", overview["active_sessions"])
    col3.metric("Properties", overview["total_properties"])
    col4.metric("LLM Mode", overview["llm_mode"])

    st.subheader("Recent Workflow Activity")
    if overview["recent_agent_runs"]:
        st.dataframe(overview["recent_agent_runs"], use_container_width=True)
    else:
        st.info("No agent runs recorded yet.")
except Exception as exc:
    st.error(f"Backend request failed: {exc}")
