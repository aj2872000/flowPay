import { fmt } from "../../../utils/helpers";
import "./MRRChart.css";

export default function MRRChart({ history = [], currentMrr = 0, change = 0 }) {
  const max = Math.max(...history.map((d) => d.value), 1);

  return (
    <div className="mrr-chart">
      <div className="mrr-chart__header">
        <div>
          <div className="mrr-chart__label">Monthly Recurring Revenue</div>
          <div className="mrr-chart__value">{fmt(currentMrr)}</div>
        </div>
        <div className={`mrr-chart__change ${change >= 0 ? "mrr-chart__change--up" : "mrr-chart__change--down"}`}>
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
        </div>
      </div>

      {history.length > 0 ? (
        <div className="mrr-chart__bars">
          {history.map((d, i) => {
            const h      = (d.value / max) * 100;
            const isLast = i === history.length - 1;
            return (
              <div className="mrr-chart__bar-wrap" key={d.month}>
                <div
                  className={`mrr-chart__bar ${isLast ? "mrr-chart__bar--active" : ""}`}
                  style={{ height: `${h}%` }}
                  title={fmt(d.value)}
                />
                <div className="mrr-chart__month">{d.month}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mrr-chart__empty">No history yet</div>
      )}
    </div>
  );
}
