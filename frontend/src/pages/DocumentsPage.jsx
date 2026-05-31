import { useState } from "react";

import { analyzeDocument } from "../api";
import Panel from "../components/Panel";

const initialDocument = {
  document_type: "sale_deed",
  file_url: "https://example.com/sample.pdf",
  raw_text: "",
};

function DocumentsPage() {
  const [documentForm, setDocumentForm] = useState(initialDocument);
  const [documentResult, setDocumentResult] = useState(null);
  const [documentBusy, setDocumentBusy] = useState(false);
  const [documentError, setDocumentError] = useState("");

  async function handleReviewDocument(event) {
    event.preventDefault();
    setDocumentBusy(true);
    setDocumentError("");

    try {
      const data = await analyzeDocument(documentForm);
      setDocumentResult(data);
    } catch (requestError) {
      setDocumentError(requestError.message);
    } finally {
      setDocumentBusy(false);
    }
  }

  return (
    <section className="workspace-grid single">
      <Panel
        title="Document Intelligence"
        subtitle="Extract key fields, show confidence, and mark uncertain property paperwork for review."
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
                setDocumentForm((current) => ({ ...current, file_url: event.target.value }))
              }
            />
          </label>
          <label className="field field-full">
            <span>OCR or Extracted Text</span>
            <textarea
              rows="8"
              value={documentForm.raw_text}
              onChange={(event) =>
                setDocumentForm((current) => ({ ...current, raw_text: event.target.value }))
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
  );
}

export default DocumentsPage;
