const TONES = {
  PLANNING: "info", CONFIRMED: "success", COMPLETED: "muted", CANCELLED: "danger",
  REQUESTED: "warn", DECLINED: "danger",
  PENDING: "warn", ACCEPTED: "success", MAYBE: "info",
  TODO: "muted", IN_PROGRESS: "info", DONE: "success",
  PAID: "success", REFUNDED: "muted",
};

export default function StatusBadge({ value }) {
  if (!value) return null;
  const tone = TONES[value] || "muted";
  return <span className={`badge badge-${tone}`}>{value.replace(/_/g, " ")}</span>;
}
