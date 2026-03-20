import { fmt } from "../utils/formatters";
import { MRR_CHART_DATA } from "../data";

function MRRChart() {
  const max = Math.max(...MRR_CHART_DATA.map(d => d.value));
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>Monthly Recurring Revenue</div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, color: "var(--text)" }}>{fmt(48320)}</div>
        </div>
        <span className="badge succeeded">↑ 12.4%</span>
      </div>
      <div className="chart-container">
        {MRR_CHART_DATA.map((d, i) => {
          const h = (d.value / max) * 100;
          const isLast = i === MRR_CHART_DATA.length - 1;
          return (
            <div className="chart-bar-wrap" key={d.month}>
              <div className={`chart-bar ${isLast ? "active-bar" : ""}`} style={{ height: `${h}%` }}
                title={fmt(d.value)} />
              <div className="chart-month">{d.month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MRRChart;