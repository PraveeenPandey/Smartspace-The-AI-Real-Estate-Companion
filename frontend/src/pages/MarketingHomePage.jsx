import { Link } from "react-router-dom";

function MarketingHomePage() {
  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <div className="landing-brand">
          <div className="brand-seal">SS</div>
          <div>
            <p className="eyebrow">SmartSpace</p>
            <h1>AI Real-Estate Companion</h1>
          </div>
        </div>
        <div className="landing-actions">
          <Link className="secondary-button" to="/login">
            Sign In
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Buyer, Seller, and Admin Journeys</p>
          <h2>One product surface for property discovery, listing operations, and admin oversight.</h2>
          <p>
            SmartSpace combines Gemini-backed recommendations, document intelligence, and
            operational review flows into separate role-aware workspaces.
          </p>
          <div className="landing-cta-row">
            <Link className="primary-button" to="/login">
              Launch Workspace
            </Link>
            <a className="ghost-link" href="#capabilities">
              Explore Capabilities
            </a>
          </div>
        </div>

        <div className="hero-grid">
          <article className="hero-card tall">
            <span className="eyebrow">Discovery</span>
            <h3>Buyer requirement intake with shortlist scoring</h3>
            <p>Structured buyer briefs, recommendation generation, and timeline persistence.</p>
          </article>
          <article className="hero-card">
            <span className="eyebrow">Listings</span>
            <h3>Market-ready listing drafts</h3>
          </article>
          <article className="hero-card">
            <span className="eyebrow">Admin</span>
            <h3>Protected operational board</h3>
          </article>
        </div>
      </section>

      <section className="capability-band" id="capabilities">
        <article>
          <span>01</span>
          <h3>Role Separation</h3>
          <p>Normal users and admins land in different interfaces with different tools and charts.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Gemini Agent Flow</h3>
          <p>Recommendation logic is structured through conversation, match, spatial, and market agents.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Operational Visibility</h3>
          <p>Graphs and dashboard summaries make session health and review pressure immediately visible.</p>
        </article>
      </section>
    </div>
  );
}

export default MarketingHomePage;
