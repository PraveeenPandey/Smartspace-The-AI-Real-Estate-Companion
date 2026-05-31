import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchAdminOverview } from "../api";
import { BarGraph, DonutGraph, SparkGraph } from "../components/charts";
import MetricCard from "../components/MetricCard";
import Panel from "../components/Panel";

function UserHomePage() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    fetchAdminOverview().then(setOverview).catch(() => setOverview(null));
  }, []);

  const trackedProperties = overview?.total_properties ?? 9;

  return (
    <>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Buyer Overview</p>
          <h2>Track search direction, shortlist quality, and portfolio momentum.</h2>
          <p className="hero-copy">
            This user dashboard is intentionally different from the admin board. It focuses on
            recommendation progress, buyer decision clarity, and the next best workflow entrypoints.
          </p>
          <div className="landing-cta-row">
            <Link className="primary-button" to="/app/discovery">
              Open Discovery
            </Link>
            <Link className="secondary-button" to="/app/documents">
              Review Documents
            </Link>
          </div>
        </div>
        <div className="hero-metrics">
          <MetricCard label="Tracked Properties" value={trackedProperties} tone="emerald" />
          <MetricCard label="Live Sessions" value={overview?.active_sessions ?? "--"} tone="blue" />
          <MetricCard label="Open Reviews" value={overview?.queued_reviews ?? "--"} tone="amber" />
        </div>
      </section>

      <section className="workspace-grid">
        <Panel
          title="Buyer Opportunity Mix"
          subtitle="Visualize how current inventory breaks across buyer personas and price buckets."
          eyebrow="User Graph"
        >
          <DonutGraph
            title="Inventory Orientation"
            subtitle="Family, investor, and budget tracks"
            segments={[
              { label: "Family-fit", value: 4, color: "#2ee6a6" },
              { label: "Investor-fit", value: 3, color: "#5ec3ff" },
              { label: "Budget-led", value: 2, color: "#f7b955" },
            ]}
          />
        </Panel>

        <Panel
          title="Shortlist Readiness"
          subtitle="A simple readiness view for how close a buyer is to a confident shortlist."
          eyebrow="User Graph"
        >
          <BarGraph
            title="Decision Stages"
            subtitle="Typical progress across active user sessions"
            items={[
              { label: "Requirement Capture", value: 82 },
              { label: "Shortlist Quality", value: 64 },
              { label: "Visit Readiness", value: 41 },
              { label: "Document Confidence", value: 57 },
            ]}
          />
        </Panel>

        <Panel
          title="Preference Fit Trend"
          subtitle="A directional view of shortlist fit as filters and locality choices improve."
          eyebrow="User Graph"
        >
          <SparkGraph
            title="Fit Trajectory"
            subtitle="Rolling fit score trend"
            points={[42, 48, 50, 58, 60, 68, 72, 75, 79]}
            tone="#2ee6a6"
          />
        </Panel>

        <Panel
          title="Quick Access"
          subtitle="Jump directly into the next user-facing workflow."
          eyebrow="User Actions"
        >
          <div className="action-stack">
            <Link className="action-card" to="/app/discovery">
              <strong>Discovery Workspace</strong>
              <span>Capture a new buyer brief and generate recommendations.</span>
            </Link>
            <Link className="action-card" to="/app/listing">
              <strong>Listing Studio</strong>
              <span>Create a listing draft from seller-provided details.</span>
            </Link>
            <Link className="action-card" to="/app/documents">
              <strong>Document Intelligence</strong>
              <span>Review extracted fields and identify document gaps.</span>
            </Link>
          </div>
        </Panel>
      </section>
    </>
  );
}

export default UserHomePage;
