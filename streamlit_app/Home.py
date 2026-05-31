import streamlit as st


st.set_page_config(page_title="SmartSpace", page_icon="🏠", layout="wide")

st.title("SmartSpace")
st.caption("Multimodal and spatial AI companion for property discovery, listing, and review.")

col1, col2 = st.columns(2)

with col1:
    st.subheader("Buyer Flow")
    st.write(
        "Capture needs through chat, images, and voice, then route through matching, spatial, and market logic."
    )
    st.page_link("pages/1_Buyer_Chat.py", label="Open Buyer Chat")

with col2:
    st.subheader("Seller + Ops Flow")
    st.write(
        "Draft listings, analyze documents, and keep risky outputs behind human review."
    )
    st.page_link("pages/2_Seller_Listing.py", label="Open Seller Listing")
    st.page_link("pages/3_Document_Review.py", label="Open Document Review")
    st.page_link("pages/4_Admin_Dashboard.py", label="Open Admin Dashboard")

st.divider()
st.markdown(
    """
    **Current mode**

    - Backend: FastAPI
    - Database: PostgreSQL + PostGIS + pgvector
    - LLM: mock adapter until Gemini API key is added
    """
)

