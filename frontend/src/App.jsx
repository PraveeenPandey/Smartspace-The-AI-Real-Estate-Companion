import { useEffect, useState } from "react";

import {
  analyzeDocument,
  createListing,
  fetchAdminOverview,
  fetchRecommendations,
  fetchSessionDetail,
  sendChatMessage,
} from "./api";

const workspaceItems = [
  {
    id: "discovery",
    eyebrow: "01",
    label: "Discovery Workspace",
    description: "Capture buyer context and translate it into shortlist decisions.",
  },
  {
    id: "listing",
    eyebrow: "02",
    label: "Listing Studio",
    description: "Shape owner inputs into clean, market-facing listing drafts.",
  },
  {
    id: "documents",
    eyebrow: "03",
    label: "Document Intelligence",
    description: "Triage property documents and flag uncertainty for review.",
  },
  {
    id: "operations",
    eyebrow: "04",
    label: "Operations Console",
    description: "Monitor sessions, review load, and workflow activity.",
  },
];

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

const initialDocument = {
  document_type: "sale_deed",
  file_url: "https://example.com/sample.pdf",
  raw_text: "",
};

function App() {
  const [activeWorkspace, setActiveWorkspace] = useState("discovery");
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminError, setAdminError] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [chatSummary, setChatSummary] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [discoveryForm, setDiscoveryForm] = useState(initialDiscovery);
  const [discoveryBusy, setDiscoveryBusy] = useState(false);
  const [discoveryError, setDiscoveryError] = useState("");

  const [listingForm, setListingForm] = useState(initialListing);
  const [listingResult, setListingResult] = useState(null);
  const [listingBusy, setListingBusy] = useState(false);
  const [listingError, setListingError] = useState("");

  const [documentForm, setDocumentForm] = useState(initialDocument);
  const [documentResult, setDocumentResult] = useState(null);
  const [documentBusy, setDocumentBusy] = useState(false);
  const [documentError, setDocumentError] = useState("");

  useEffect(() => {
    loadAdminOverview();
  }, []);

  async function loadAdminOverview() {
    try {
      setAdminError("");
      const data = await fetchAdminOverview();
      setAdminOverview(data);
    } catch (error) {
      setAdminError(error.message);
    }
  }

  async function refreshSession(nextSessionId) {
    if (!nextSessionId) return;
    const data = await fetchSessionDetail(nextSessionId);
    setSessionDetail(data);
  }

  async function handleCaptureRequirements(event) {
    event.preventDefault();
    setDiscoveryBusy(true);
    setDiscoveryError("");

    try {
      const payload = {
        session_id: sessionId,
        message: discoveryForm.brief,
        language: "en",
      };
      const data = await sendChatMessage(payload);
      setChatSummary(data);
      setSessionId(data.session_id);
      setDiscoveryForm((current) => ({
        ...current,
        city: data.extracted_preferences.city || current.city,
        bhk: data.extracted_preferences.bhk || current.bhk,
      }));
      await refreshSession(data.session_id);
      await loadAdminOverview();
    } catch (error) {
      setDiscoveryError(error.message);
    } finally {
      setDiscoveryBusy(false);
    }
  }

  async function handleGenerateRecommendations(event) {
    event.preventDefault();
    setDiscoveryBusy(true);
    setDiscoveryError("");

    try {
      const payload = {
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
      };
      const data = await fetchRecommendations(payload);
      setRecommendations(data);
      await loadAdminOverview();
    } catch (error) {
      setDiscoveryError(error.message);
    } finally {
      setDiscoveryBusy(false);
    }
  }

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
        amenities: {
          gated: true,
          clubhouse: true,
        },
      });
      setListingResult(data);
      await loadAdminOverview();
    } catch (error) {
      setListingError(error.message);
    } finally {
      setListingBusy(false);
    }
  }

  async function handleReviewDocument(event) {
    event.preventDefault();
    setDocumentBusy(true);
    setDocumentError("");

    try {
      const data = await analyzeDocument(documentForm);
      setDocumentResult(data);
      await loadAdminOverview();
    } catch (error) {
      setDocumentError(error.message);
    } finally {
      setDocumentBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-seal">SS</div>
          <div>
            <p className="eyebrow">SmartSpace</p>
            <h1>AI Real-Estate Companion</h1>
          </div>
        </div>

        <div className="status-panel">
          <p className="eyebrow">Platform Status</p>
          <div className="status-pill-row">
            <span className="status-pill">API Live</span>
            <span className="status-pill muted">Gemini Pending</span>
          </div>
          <p className="status-copy">
            React workspace layered over the FastAPI orchestration and low-cost local data stack.
          </p>
        </div>

        <nav className="workspace-nav">
          {workspaceItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`workspace-tab ${activeWorkspace === item.id ? "active" : ""}`}
              onClick={() => setActiveWorkspace(item.id)}
            >
              <span className="workspace-tab-id">{item.eyebrow}</span>
              <span className="workspace-tab-body">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Production UI Direction</p>
            <h2>Operational intelligence for buyers, sellers, and review teams.</h2>
            <p className="hero-copy">
              The interface is organized into decision workspaces instead of generic pages. Each
              surface is designed to support a concrete real-estate workflow with clear next actions.
            </p>
          </div>
          <div className="hero-metrics">
            <MetricCard
              label="Active Sessions"
              value={adminOverview?.active_sessions ?? "--"}
              tone="emerald"
            />
            <MetricCard
              label="Queued Reviews"
              value={adminOverview?.queued_reviews ?? "--"}
              tone="amber"
            />
            <MetricCard
              label="Tracked Properties"
              value={adminOverview?.total_properties ?? "--"}
              tone="blue"
            />
          </div>
        </section>

        {adminError ? <div className="banner error">{adminError}</div> : null}

        {activeWorkspace === "discovery" ? (
          <section className="workspace-grid">
            <Panel
              title="Buyer Intake"
              subtitle="Capture the brief and preserve a running discovery session."
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
                  <button className="primary-button" type="submit" disabled={discoveryBusy}>
                    {discoveryBusy ? "Capturing..." : "Capture Requirements"}
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

              {discoveryError ? <div className="banner error">{discoveryError}</div> : null}
            </Panel>

            <Panel
              title="Search Strategy"
              subtitle="Refine shortlist criteria before recommendation generation."
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
                      setDiscoveryForm((current) => ({
                        ...current,
                        budgetMin: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Budget To</span>
                  <input
                    type="number"
                    value={discoveryForm.budgetMax}
                    onChange={(event) =>
                      setDiscoveryForm((current) => ({
                        ...current,
                        budgetMax: event.target.value,
                      }))
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
                      setDiscoveryForm((current) => ({
                        ...current,
                        localities: event.target.value,
                      }))
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
                  <button className="primary-button" type="submit" disabled={discoveryBusy}>
                    {discoveryBusy ? "Scoring..." : "Generate Recommendations"}
                  </button>
                </div>
              </form>
            </Panel>

            <Panel
              title="Conversation Timeline"
              subtitle="Persisted history for the current discovery session."
            >
              {sessionDetail?.messages?.length ? (
                <div className="timeline">
                  {sessionDetail.messages.map((message, index) => (
                    <article
                      className={`timeline-item ${message.sender_type === "assistant" ? "assistant" : "user"}`}
                      key={`${message.created_at}-${index}`}
                    >
                      <div className="timeline-item-head">
                        <strong>
                          {message.sender_type === "assistant" ? "SmartSpace" : "Client Brief"}
                        </strong>
                        <span>{message.created_at.replace("T", " ").slice(0, 16)}</span>
                      </div>
                      <p>{message.content_text}</p>
                      {Object.keys(message.extracted_entities).length ? (
                        <div className="chip-row">
                          {Object.entries(message.extracted_entities).map(([key, value]) => (
                            <span key={key} className="chip muted">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      ) : null}
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
              subtitle="Combined match, spatial, and market scoring."
            >
              {recommendations?.properties?.length ? (
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
              ) : (
                <EmptyState
                  title="No shortlist generated yet"
                  copy="Set criteria and generate recommendations to populate the discovery board."
                />
              )}
            </Panel>
          </section>
        ) : null}

        {activeWorkspace === "listing" ? (
          <section className="workspace-grid single">
            <Panel
              title="Listing Studio"
              subtitle="Create structured listing drafts with clearer market-facing language."
            >
              <form className="form-grid" onSubmit={handleCreateListing}>
                <label className="field">
                  <span>Owner or Seller Name</span>
                  <input
                    value={listingForm.owner_name}
                    onChange={(event) =>
                      setListingForm((current) => ({
                        ...current,
                        owner_name: event.target.value,
                      }))
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
                      setListingForm((current) => ({
                        ...current,
                        locality: event.target.value,
                      }))
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
                      setListingForm((current) => ({
                        ...current,
                        bathrooms: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Built-up Area (sqft)</span>
                  <input
                    type="number"
                    value={listingForm.area_sqft}
                    onChange={(event) =>
                      setListingForm((current) => ({
                        ...current,
                        area_sqft: event.target.value,
                      }))
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
                      setListingForm((current) => ({
                        ...current,
                        furnishing: event.target.value,
                      }))
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
        ) : null}

        {activeWorkspace === "documents" ? (
          <section className="workspace-grid single">
            <Panel
              title="Document Intelligence"
              subtitle="Extract key fields, surface confidence, and route uncertainty for manual review."
            >
              <form className="form-grid" onSubmit={handleReviewDocument}>
                <label className="field">
                  <span>Document Type</span>
                  <select
                    value={documentForm.document_type}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        document_type: event.target.value,
                      }))
                    }
                  >
                    <option value="sale_deed">Sale Deed</option>
                    <option value="lease_agreement">Lease Agreement</option>
                    <option value="tax_receipt">Tax Receipt</option>
                  </select>
                </label>
                <label className="field field-full">
                  <span>Document URL</span>
                  <input
                    value={documentForm.file_url}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        file_url: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="field field-full">
                  <span>OCR or Extracted Text</span>
                  <textarea
                    rows="8"
                    value={documentForm.raw_text}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        raw_text: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="form-actions">
                  <button className="primary-button" type="submit" disabled={documentBusy}>
                    {documentBusy ? "Reviewing..." : "Review Document"}
                  </button>
                </div>
              </form>

              {documentError ? <div className="banner error">{documentError}</div> : null}

              {documentResult ? (
                <div className="result-split">
                  <div className="response-card">
                    <div className="response-head">
                      <h3>Review Outcome</h3>
                      <span
                        className={`badge ${documentResult.requires_human_review ? "alert" : "success"}`}
                      >
                        {documentResult.requires_human_review ? "Needs Human Review" : "Ready"}
                      </span>
                    </div>
                    <p>{documentResult.summary}</p>
                  </div>
                  <div className="response-card">
                    <h3>Extracted Fields</h3>
                    <div className="chip-row">
                      {Object.entries(documentResult.extracted_fields).map(([key, value]) => (
                        <span key={key} className="chip muted">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="response-card">
                    <h3>Confidence and Gaps</h3>
                    <p>Confidence: {documentResult.confidence}</p>
                    <div className="chip-row">
                      {documentResult.missing_items.map((item) => (
                        <span key={item} className="chip muted">
                          Missing: {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </Panel>
          </section>
        ) : null}

        {activeWorkspace === "operations" ? (
          <section className="workspace-grid single">
            <Panel
              title="Operations Console"
              subtitle="Review current system load, tracking posture, and recent workflow activity."
            >
              <div className="operations-grid">
                <MetricCard
                  label="Active Sessions"
                  value={adminOverview?.active_sessions ?? "--"}
                  tone="emerald"
                />
                <MetricCard
                  label="Queued Reviews"
                  value={adminOverview?.queued_reviews ?? "--"}
                  tone="amber"
                />
                <MetricCard
                  label="Property Records"
                  value={adminOverview?.total_properties ?? "--"}
                  tone="blue"
                />
                <MetricCard
                  label="LLM Mode"
                  value={adminOverview?.llm_mode ?? "--"}
                  tone="slate"
                />
              </div>

              <div className="table-shell">
                <div className="response-head">
                  <h3>Recent Workflow Activity</h3>
                  <button className="secondary-button" type="button" onClick={loadAdminOverview}>
                    Refresh
                  </button>
                </div>
                {adminOverview?.recent_agent_runs?.length ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Agent</th>
                        <th>Status</th>
                        <th>Confidence</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminOverview.recent_agent_runs.map((run, index) => (
                        <tr key={`${run.agent_name}-${run.created_at}-${index}`}>
                          <td>{run.agent_name}</td>
                          <td>{run.status}</td>
                          <td>{run.confidence}</td>
                          <td>{run.created_at.replace("T", " ").slice(0, 16)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState
                    title="No workflow activity yet"
                    copy="Run discovery, listing, or document actions to populate the operational audit view."
                  />
                )}
              </div>
            </Panel>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Workspace Module</p>
          <h2>{title}</h2>
        </div>
        <p className="panel-copy">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, tone = "emerald" }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function EmptyState({ title, copy }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}

export default App;

