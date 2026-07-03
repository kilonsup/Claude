import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

function AppointmentFormModal({ patients, doctors, isPatientUser, onClose, onSaved }) {
  const [form, setForm] = useState({ patient: "", doctor: "", scheduled_date: "", scheduled_time: "", reason: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (isPatientUser) delete payload.patient;
      await api.post("/appointments/", payload);
      onSaved();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "string" ? data : data?.non_field_errors?.[0] || JSON.stringify(data) || "Could not book appointment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Book Appointment</h2>
        <form onSubmit={handleSubmit}>
          {!isPatientUser && (
            <div className="form-field">
              <label>Patient</label>
              <select required value={form.patient} onChange={(e) => setForm((f) => ({ ...f, patient: e.target.value }))}>
                <option value="">Select a patient…</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
          )}
          <div className="form-field">
            <label>Doctor</label>
            <select required value={form.doctor} onChange={(e) => setForm((f) => ({ ...f, doctor: e.target.value }))}>
              <option value="">Select a doctor…</option>
              {doctors.map((d) => <option key={d.user} value={d.user}>{d.full_name} — {d.specialization || d.department}</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label>Date</label>
              <input type="date" required value={form.scheduled_date} onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Time</label>
              <input type="time" required value={form.scheduled_time} onChange={(e) => setForm((f) => ({ ...f, scheduled_time: e.target.value }))} />
            </div>
          </div>
          <div className="form-field">
            <label>Reason for visit</label>
            <textarea rows={2} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Booking…" : "Book Appointment"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const isPatientUser = user.role === "PATIENT";
  const canManage = user.role === "ADMIN" || user.role === "NURSE";

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/appointments/", { params: statusFilter ? { status: statusFilter } : {} })
      .then(({ data }) => setAppointments(data.results || data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  useEffect(() => {
    if (!isPatientUser) {
      api.get("/patients/").then(({ data }) => setPatients(data.results || data)).catch(() => {});
    }
    api.get("/staff/").then(({ data }) => {
      const results = data.results || data;
      setDoctors(results.filter((s) => s.role === "DOCTOR"));
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(appt, status) {
    await api.patch(`/appointments/${appt.id}/`, { status });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>{isPatientUser ? "Book and manage your appointments." : "Schedule and coordinate patient appointments."}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Book Appointment</button>
      </div>

      <div className="toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RESCHEDULED">Rescheduled</option>
        </select>
      </div>

      <div className="card">
        {loading && <p className="empty-state">Loading appointments…</p>}
        {!loading && appointments.length === 0 && <p className="empty-state">No appointments found.</p>}
        {!loading && appointments.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.patient_name}</td>
                  <td>Dr. {a.doctor_name}</td>
                  <td>{a.scheduled_date}</td>
                  <td>{a.scheduled_time?.slice(0, 5)}</td>
                  <td>{a.reason || "—"}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status === "SCHEDULED" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        {(canManage || user.role === "DOCTOR") && (
                          <button className="btn btn-sm" onClick={() => updateStatus(a, "COMPLETED")}>Complete</button>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={() => updateStatus(a, "CANCELLED")}>Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <AppointmentFormModal
          patients={patients}
          doctors={doctors}
          isPatientUser={isPatientUser}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}
