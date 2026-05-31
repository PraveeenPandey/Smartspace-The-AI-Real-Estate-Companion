import streamlit as st

from streamlit_app.api_client.client import SmartSpaceApiClient


client = SmartSpaceApiClient()

st.title("Seller Listing")
st.caption("Create structured listings and AI-assisted copy from seller inputs.")

with st.form("seller_listing_form"):
    owner_name = st.text_input("Owner Name", value="Seller Demo")
    title = st.text_input("Property Title", value="Premium 3 BHK in Whitefield")
    city = st.text_input("City", value="Bangalore")
    locality = st.text_input("Locality", value="Whitefield")
    property_type = st.selectbox("Property Type", ["apartment", "villa", "plot"])
    bhk = st.number_input("BHK", min_value=1, max_value=10, value=3)
    bathrooms = st.number_input("Bathrooms", min_value=1, max_value=10, value=3)
    area_sqft = st.number_input("Area (sqft)", min_value=300, max_value=10000, value=1650)
    price = st.number_input("Price", min_value=1000000, max_value=100000000, value=14500000)
    furnishing = st.selectbox("Furnishing", ["unfurnished", "semi-furnished", "furnished"])
    submitted = st.form_submit_button("Create Listing Draft")

if submitted:
    payload = {
        "owner_name": owner_name,
        "title": title,
        "city": city,
        "locality": locality,
        "property_type": property_type,
        "bhk": bhk,
        "bathrooms": bathrooms,
        "area_sqft": area_sqft,
        "price": price,
        "furnishing": furnishing,
        "amenities": {"gated": True},
    }
    try:
        st.json(client.create_listing(payload))
    except Exception as exc:
        st.error(f"Backend request failed: {exc}")

