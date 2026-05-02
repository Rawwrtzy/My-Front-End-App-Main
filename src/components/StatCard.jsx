export default function StatCard({ number, label, statusClass = "" }) {
  return (
    <div className="stat-card">
      <div className={`stat-number ${statusClass.toLowerCase()}`}>
        {number}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}