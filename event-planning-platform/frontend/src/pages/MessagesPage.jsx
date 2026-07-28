import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

export default function MessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const bottomRef = useRef(null);

  const loadThreads = useCallback(() => {
    api.get("/messaging/threads/").then(({ data }) => setThreads(data.results));
  }, []);
  useEffect(loadThreads, [loadThreads]);

  const openThread = useCallback(async (thread) => {
    setActive(thread);
    const { data } = await api.get(`/messaging/messages/?thread=${thread.id}`);
    setMessages(data);
    await api.post(`/messaging/threads/${thread.id}/mark-read/`);
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!body.trim() || !active) return;
    const { data } = await api.post("/messaging/messages/", { thread: active.id, body });
    setMessages([...messages, data]);
    setBody("");
  }

  const counterpart = (t) => (user.role === "VENDOR" ? t.planner_name : t.vendor_name);

  return (
    <div className="messages-layout">
      <aside className="thread-list">
        <h2>Conversations</h2>
        {threads.length === 0 && (
          <p className="muted small">No conversations yet. Threads open automatically when a booking is requested.</p>
        )}
        {threads.map((t) => (
          <button
            key={t.id}
            className={`thread-item ${active?.id === t.id ? "active" : ""}`}
            onClick={() => openThread(t)}
          >
            <div className="row-between">
              <strong>{counterpart(t)}</strong>
              {t.unread_count > 0 && <span className="unread-dot">{t.unread_count}</span>}
            </div>
            <span className="small muted">{t.event_title}</span>
            {t.last_message && <span className="small muted preview">{t.last_message.body}</span>}
          </button>
        ))}
      </aside>

      <section className="chat-pane">
        {active ? (
          <>
            <header className="chat-head">
              <strong>{counterpart(active)}</strong>
              <span className="muted small">{active.event_title}</span>
              <StatusBadge value={active.booking_status} />
            </header>
            <div className="chat-scroll">
              {messages.map((m) => (
                <div key={m.id} className={`bubble ${m.sender === user.id ? "mine" : ""}`}>
                  <p>{m.body}</p>
                  <span className="small muted">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form className="chat-input" onSubmit={send}>
              <input placeholder="Type a message…" value={body} onChange={(e) => setBody(e.target.value)} />
              <button className="btn btn-primary">Send</button>
            </form>
          </>
        ) : (
          <div className="empty-state">
            <h2>Pick a conversation</h2>
            <p className="muted">Coordinate details with {user.role === "VENDOR" ? "planners" : "your vendors"} without leaving Festiva.</p>
          </div>
        )}
      </section>
    </div>
  );
}
