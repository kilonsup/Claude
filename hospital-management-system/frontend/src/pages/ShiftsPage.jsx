import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function ShiftFormModal({ staffList, onClose, onSaved }) {
  const [form, setForm] = useState({ staff: "", date: "", start_time: "", end_time: "", department: "GENERAL", notes: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function onStaffChange(id) {
    const chosen = staffList.find((s) => String(s.id) === id);
    setForm((f) => ({ ...f, staff: id, department: chosen?.department || f.department }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/staff/shifts/", form);
      onSaved();
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || "Could not create shift.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Assign Shift</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Staff member</label>
            <select required value={form.staff} onChange={(e) => onStaffChange(e.target.value)}>
              <option value="">Select staff…</option>
              {staffList.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label>Date</label>
              <input type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Department</label>
              <input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Start time</label>
              <input type="time" required value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>End time</label>
              <input type="time" required value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>
          <div className="form-field">
            <label>Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Assign Shift"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ShiftsPage() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    api.get("/staff/shifts/", { params: date ? { date } : {} }).then(({ data }) => setShifts(data.results || data)).finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  useEffect(() => {
    if (user.role === "ADMIN") {
      api.get("/staff/").then(({ data }) => setStaffList(data.results || data)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Shift Schedule</h1>
          <p>{user.role === "ADMIN" ? "Assign shifts and track staff availability." : "Your assigned shifts."}</p>
        </div>
        {user.role === "ADMIN" && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Assign Shift</button>}
      </div>

      <div className="toolbar">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {date && <button className="btn btn-sm" onClick={() => setDate("")}>Clear</button>}
      </div>

      <div className="card">
        {loading && <p className="empty-state">Loading shifts…</p>}
        {!loading && shifts.length === 0 && <p className="empty-state">No shifts found.</p>}
        {!loading && shifts.length > 0 && (
          <table>
            <thead>
              <tr><th>Staff</th><th>Date</th><th>Start</th><th>End</th><th>Department</th><th>Status</th></tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id}>
                  <td>{s.staff_name}</td>
                  <td>{s.date}</td>
                  <td>{s.start_time?.slice(0, 5)}</td>
                  <td>{s.end_time?.slice(0, 5)}</td>
                  <td>{s.department}</td>
                  <td>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <ShiftFormModal staffList={staffList} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}
