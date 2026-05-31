import { useState } from "react";

import { createListing } from "../api";
import Panel from "../components/Panel";

const initialListing = {
  owner_name: "Seller Demo",
  title: "Premium 3 BHK in Whitefield",
  city: "Bangalore",
  locality: "Whitefield",
  property_type: "apartment",
  bhk: 3,
  bathrooms: 3,
  area_sqft: 1650,
  price: 14500000,
  furnishing: "semi-furnished",
};

function ListingPage() {
  const [listingForm, setListingForm] = useState(initialListing);
  const [listingResult, setListingResult] = useState(null);
  const [listingBusy, setListingBusy] = useState(false);
  const [listingError, setListingError] = useState("");

  async function handleCreateListing(event) {
    event.preventDefault();
    setListingBusy(true);
    setListingError("");

    try {
      const data = await createListing({
        ...listingForm,
        bhk: Number(listingForm.bhk),
        bathrooms: Number(listingForm.bathrooms),
        area_sqft: Number(listingForm.area_sqft),
        price: Number(listingForm.price),
        amenities: { gated: true, clubhouse: true },
      });
      setListingResult(data);
    } catch (requestError) {
      setListingError(requestError.message);
    } finally {
      setListingBusy(false);
    }
  }

  return (
    <section className="workspace-grid single">
      <Panel
        title="Listing Studio"
        subtitle="Create structured listing drafts and expose missing listing inputs before publishing."
      >
        <form className="form-grid" onSubmit={handleCreateListing}>
          <label className="field">
            <span>Owner or Seller Name</span>
            <input
              value={listingForm.owner_name}
              onChange={(event) =>
                setListingForm((current) => ({ ...current, owner_name: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Listing Title</span>
            <input
              value={listingForm.title}
              onChange={(event) =>
                setListingForm((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>City</span>
            <input
              value={listingForm.city}
              onChange={(event) =>
                setListingForm((current) => ({ ...current, city: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Locality</span>
            <input
              value={listingForm.locality}
              onChange={(event) =>
                setListingForm((current) => ({ ...current, locality: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Property Type</span>
            <select
              value={listingForm.property_type}
              onChange={(event) =>
                setListingForm((current) => ({
                  ...current,
                  property_type: event.target.value,
                }))
              }
            >
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
            </select>
          </label>
          <label className="field">
            <span>Bedrooms</span>
            <input
              type="number"
              value={listingForm.bhk}
              onChange={(event) =>
                setListingForm((current) => ({ ...current, bhk: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Bathrooms</span>
            <input
              type="number"
              value={listingForm.bathrooms}
              onChange={(event) =>
                setListingForm((current) => ({ ...current, bathrooms: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Built-up Area (sqft)</span>
            <input
              type="number"
              value={listingForm.area_sqft}
              onChange={(event) =>
                setListingForm((current) => ({ ...current, area_sqft: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Expected Price</span>
            <input
              type="number"
              value={listingForm.price}
              onChange={(event) =>
                setListingForm((current) => ({ ...current, price: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Furnishing</span>
            <select
              value={listingForm.furnishing}
              onChange={(event) =>
                setListingForm((current) => ({ ...current, furnishing: event.target.value }))
              }
            >
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-furnished</option>
              <option value="furnished">Furnished</option>
            </select>
          </label>
          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={listingBusy}>
              {listingBusy ? "Generating..." : "Generate Listing Draft"}
            </button>
          </div>
        </form>

        {listingError ? <div className="banner error">{listingError}</div> : null}

        {listingResult ? (
          <div className="result-split">
            <div className="response-card">
              <div className="response-head">
                <h3>Generated Title</h3>
                <span className="badge">Property #{listingResult.property_id}</span>
              </div>
              <p>{listingResult.generated_title}</p>
            </div>
            <div className="response-card">
              <h3>Generated Description</h3>
              <p>{listingResult.generated_description}</p>
            </div>
            <div className="response-card">
              <h3>Pricing Guidance</h3>
              <p>{listingResult.pricing_guidance}</p>
              <div className="chip-row">
                {listingResult.missing_fields.map((field) => (
                  <span key={field} className="chip muted">
                    Missing: {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Panel>
    </section>
  );
}

export default ListingPage;
