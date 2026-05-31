export function BarGraph({ title, subtitle, items, tone = "emerald" }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="graph-card">
      <div className="graph-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="bar-graph">
        {items.map((item) => (
          <div className="bar-row" key={item.label}>
            <div className="bar-label">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="bar-track">
              <div
                className={`bar-fill ${tone}`}
                style={{ width: `${Math.max((item.value / maxValue) * 100, 6)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutGraph({ title, subtitle, segments, size = 140 }) {
  const total = Math.max(segments.reduce((sum, segment) => sum + segment.value, 0), 1);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="graph-card donut-card">
      <div className="graph-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="donut-wrap">
        <svg className="donut-chart" width={size} height={size} viewBox="0 0 120 120">
          <circle className="donut-base" cx="60" cy="60" r={radius} />
          {segments.map((segment) => {
            const dash = (segment.value / total) * circumference;
            const strokeDasharray = `${dash} ${circumference - dash}`;
            const strokeDashoffset = -offset;
            offset += dash;

            return (
              <circle
                key={segment.label}
                className="donut-segment"
                cx="60"
                cy="60"
                r={radius}
                stroke={segment.color}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
        <div className="donut-center">
          <strong>{total}</strong>
          <span>Total</span>
        </div>
      </div>
      <div className="legend">
        {segments.map((segment) => (
          <div className="legend-row" key={segment.label}>
            <span className="legend-chip" style={{ background: segment.color }} />
            <span>{segment.label}</span>
            <strong>{segment.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SparkGraph({ title, subtitle, points, tone = "#2ee6a6" }) {
  const width = 320;
  const height = 120;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = Math.max(max - min, 1);
  const step = width / Math.max(points.length - 1, 1);

  const path = points
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point - min) / span) * (height - 12) - 6;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="graph-card">
      <div className="graph-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      <svg className="spark-chart" viewBox={`0 0 ${width} ${height}`}>
        <path d={path} fill="none" stroke={tone} strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
