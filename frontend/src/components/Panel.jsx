function Panel({ title, subtitle, children, eyebrow = "Workspace Module" }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <p className="panel-copy">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default Panel;
