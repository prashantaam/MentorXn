/* Row of headline numbers at the top of a dashboard. */
function StatRow({ stats }) {
  return (
    <div className="mx-stat-row">
      {stats.map((stat) => (
        <div key={stat.label} className="mx-stat-card">
          <b>{stat.value}</b>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

export default StatRow;
