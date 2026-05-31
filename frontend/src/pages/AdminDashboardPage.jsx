import { useEffect, useState } from "react";

import { fetchAdminOverview } from "../api";
import { BarGraph, DonutGraph, SparkGraph } from "../components/charts";
import EmptyState from "../components/EmptyState";
import MetricCard from "../components/MetricCard";
import Panel from "../components/Panel";

function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview() {
    try {
      setError("");
      const data = await fetchAdminOverview();
      setOverview(data);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const activityPoints = (overview?.recent_agent_runs || []).map((_, index, array) => index + 1);

  return (
    <>
      <section className="hero-panel admin-hero">
        <div>
          <p className="eyebrow">Admin Board</p>
          <h2>Operational visibility for sessions, review queues, and system activity.</h2>
          <p className="hero-copy">
            This board is restricted to admin users. It shows monitoring-focused visuals rather than
            buyer-facing portfolio charts.
          </p>
        </div>
        <div className="hero-metrics">
          <MetricCard label="Queued Reviews" value={overview?.queued_reviews ?? "--"} tone="amber" />
          <MetricCard label="Active Sessions" value={overview?.active_sessions ?? "--"} tone="emerald" />
          <MetricCard label="Property Records" value={overview?.total_properties ?? "--"} tone="blue" />
          <MetricCard label="LLM Mode" value={overview?.llm_mode ?? "--"} tone="slate" />
        </div>
      </section>

      {error ? <div className="banner error">{error}</div> : null}

      <section className="workspace-grid">
        <Panel
          title="Operational Load Split"
          subtitle="Separate review pressure from active session volume and monitored inventory."
          eyebrow="Admin Graph"
        >
          <DonutGraph
            title="Current Load Mix"
            subtitle="Review pressure vs live workload"
            segments={[
              { label: "Queued Reviews", value: overview?.queued_reviews ?? 0, color: "#f7b955" },
              { label: "Active Sessions", value: overview?.active_sessions ?? 0, color: "#2ee6a6" },
              { label: "Tracked Properties", value: overview?.total_properties ?? 0, color: "#5ec3ff" },
            ]}
          />
        </Panel>

        <Panel
          title="Agent Throughput"
          subtitle="Monitor current workflow activity across major agent surfaces."
          eyebrow="Admin Graph"
        >
          <BarGraph
            title="Recent Agent Coverage"
            subtitle="Count by agent name from the latest audit trail"
            items={buildAgentCounts(overview?.recent_agent_runs || [])}
            tone="blue"
          />
        </Panel>

        <Panel
          title="Activity Trace"
          subtitle="A simplified trend line for recent workflow records entering the admin audit trail."
          eyebrow="Admin Graph"
        >
          <SparkGraph
            title="Workflow Pulse"
            subtitle="Recent run accumulation"
            points={activityPoints.length ? activityPoints : [0, 0, 0, 0]}
            tone="#f7b955"
          />
        </Panel>

        <Panel
          title="Recent Workflow Activity"
          subtitle="Protected audit snapshot for admin review."
          eyebrow="Admin Audit"
        >
          <div className="response-head">
            <h3>Latest Agent Runs</h3>
            <button className="secondary-button" type="button" onClick={loadOverview}>
              Refresh
            </button>
          </div>
          {overview?.recent_agent_runs?.length ? (
            <div className="table-shell">
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
                  {overview.recent_agent_runs.map((run, index) => (
                    <tr key={`${run.agent_name}-${run.created_at}-${index}`}>
                      <td>{run.agent_name}</td>
                      <td>{run.status}</td>
                      <td>{run.confidence}</td>
                      <td>{run.created_at.replace("T", " ").slice(0, 16)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No workflow activity yet"
              copy="Run user workflows first to populate the protected admin audit board."
            />
          )}
        </Panel>
      </section>
    </>
  );
}

function buildAgentCounts(runs) {
  if (!runs.length) {
    return [
      { label: "Conversation", value: 0 },
      { label: "Matchmaker", value: 0 },
      { label: "Spatial", value: 0 },
      { label: "Market", value: 0 },
    ];
  }

  const counts = runs.reduce((accumulator, run) => {
    accumulator[run.agent_name] = (accumulator[run.agent_name] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

export default AdminDashboardPage;
