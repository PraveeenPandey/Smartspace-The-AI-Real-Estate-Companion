import streamlit as st


st.set_page_config(page_title="SmartSpace", page_icon="🏠", layout="wide")

st.title("SmartSpace")
st.caption("AI real-estate companion for discovery, listing operations, and document intelligence.")

col1, col2 = st.columns(2)

with col1:
    st.subheader("Property Discovery")
    st.write(
        "Understand buyer intent across conversation, then turn it into shortlist-ready property recommendations."
    )
    st.page_link("pages/1_Buyer_Chat.py", label="Open Discovery Workspace")

with col2:
    st.subheader("Listing and Review Operations")
    st.write(
        "Create better listing drafts, review property documents, and monitor operational activity."
    )
    st.page_link("pages/2_Seller_Listing.py", label="Open Listing Studio")
    st.page_link("pages/3_Document_Review.py", label="Open Document Intelligence")
    st.page_link("pages/4_Admin_Dashboard.py", label="Open Operations Console")

st.divider()
st.markdown(
    """
    **Platform Status**

    - Application layer: FastAPI
    - Local data layer: SQLite by default, optional PostgreSQL for production-shaped development
    - LLM integration: mock mode until Gemini credentials are enabled
    """
)
