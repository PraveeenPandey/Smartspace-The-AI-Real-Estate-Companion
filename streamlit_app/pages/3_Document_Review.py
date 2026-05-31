import streamlit as st

from streamlit_app.api_client.client import SmartSpaceApiClient


client = SmartSpaceApiClient()

st.title("Document Intelligence")
st.caption("Review extracted property document details, identify gaps, and route uncertain cases for manual validation.")

with st.form("document_review_form"):
    document_type = st.selectbox("Document Type", ["sale_deed", "lease_agreement", "tax_receipt"])
    file_url = st.text_input("Document URL", value="https://example.com/sample.pdf")
    raw_text = st.text_area(
        "OCR or extracted text",
        placeholder="Paste OCR text here until the file pipeline is integrated.",
    )
    submitted = st.form_submit_button("Review Document")

if submitted:
    payload = {
        "document_type": document_type,
        "file_url": file_url,
        "raw_text": raw_text,
    }
    try:
        st.json(client.analyze_document(payload))
    except Exception as exc:
        st.error(f"Backend request failed: {exc}")
