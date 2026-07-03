const LABELS = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
  MISSED: "Missed",
};

export default function StatusBadge({ status }) {
  const cls = `badge badge-${status.toLowerCase()}`;
  return (
    <span className={cls}>
      <span className="badge-dot" />
      {LABELS[status] || status}
    </span>
  );
}
