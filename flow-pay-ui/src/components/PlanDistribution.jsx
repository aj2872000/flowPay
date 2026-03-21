import { fmtNum } from "../utils/formatters";
import { DUMMY_PLANS } from "../data";


function PlanDistribution() {
  const total = DUMMY_PLANS.reduce((s, p) => s + p.subscribers, 0);
  return (
    <div>
      <div className="card-header">
        <span className="card-title">Plan Distribution</span>
        <span className="mono">{fmtNum(total)} total</span>
      </div>
      {DUMMY_PLANS.map(p => {
        const pct = ((p.subscribers / total) * 100).toFixed(1);
        return (
          <div key={p.id} style={{ marginBottom: 14 }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.name}</span>
              <span className="mono">{p.subscribers} <span className="text-muted">({pct}%)</span></span>
            </div>
            <div className="mini-progress">
              <div className="mini-progress-fill" style={{ width: `${pct}%`, background: p.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default PlanDistribution;