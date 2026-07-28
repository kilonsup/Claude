export default function Wordmark({ stacked = false, light = false }) {
  if (stacked) {
    return (
      <span className={`wordmark wordmark-stacked ${light ? "wordmark-light" : ""}`}>
        <span className="wordmark-main">Black Sand</span>
        <span className="wordmark-rule" aria-hidden="true">◆</span>
        <span className="wordmark-sub">Events</span>
      </span>
    );
  }
  return (
    <span className={`wordmark ${light ? "wordmark-light" : ""}`}>
      Black Sand <em>Events</em>
    </span>
  );
}
