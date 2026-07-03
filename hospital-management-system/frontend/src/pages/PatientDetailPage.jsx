import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function RecordFormModal({ patientId, doctors, currentUser, onClose, onSaved }) {
  const [form, setForm] = useState({ diagnosis: "", treatment_plan: "", prescription: "", notes: "", doctor: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, patient: patientId };
      if (currentUser.role === "DOCTOR") delete payload.doctor;
      if (!payload.doctor) delete payload.doctor;
      await api.post("/patients/records/", payload);
      onSaved();
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || "Could not save record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Medical Record</h2>
        <form onSubmit={handleSubmit}>
          {currentUser.role !== "DOCTOR" && (
            <div className="form-field">
              <label>Attending doctor</label>
              <select required value={form.doctor} onChange={(e) => setForm((f) => ({ ...f, doctor: e.target.value }))}>
                <option value="">Select a doctor…</option>
                {doctors.map((d) => (
                  <option key={d.user} value={d.user}>{d.full_name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-field">
            <label>Diagnosis</label>
            <input required value={form.diagnosis} onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Treatment plan</label>
            <textarea rows={2} value={form.treatment_plan} onChange={(e) => setForm((f) => ({ ...f, treatment_plan: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Prescription</label>
            <textarea rows={2} value={form.prescription} onChange={(e) => setForm((f) => ({ ...f, prescription: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Add Record"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState("");

  function load() {
    api.get(`/patients/${id}/`).then(({ data }) => setPatient(data)).catch(() => setErr("Patient not found."));
  }

  useEffect(() => {
    load();
    api.get("/staff/").then(({ data }) => {
      const results = data.results || data;
      setDoctors(results.filter((s) => s.role === "DOCTOR"));
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (err) return <p className="error-text">{err}</p>;
  if (!patient) return <p className="empty-state">Loading…</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/patients" style={{ fontSize: 13, color: "var(--text-secondary)" }}>&larr; Back to patients</Link>
          <h1>{patient.full_name}</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Medical Record</button>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Medical History</h3>
          {patient.medical_records.length === 0 && <p className="empty-state">No records yet.</p>}
          {patient.medical_records.map((r) => (
            <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--gridline)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{r.diagnosis}</strong>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(r.visit_date).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Doctor: {r.doctor_name || "—"}</div>
              {r.treatment_plan && <div style={{ fontSize: 13, marginTop: 6 }}><em>Treatment:</em> {r.treatment_plan}</div>}
              {r.prescription && <div style={{ fontSize: 13, marginTop: 4 }}><em>Prescription:</em> {r.prescription}</div>}
              {r.notes && <div style={{ fontSize: 13, marginTop: 4, color: "var(--text-secondary)" }}>{r.notes}</div>}
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Patient Information</h3>
          <dl>
            {[
              ["Date of birth", patient.date_of_birth || "—"],
              ["Gender", patient.gender],
              ["Phone", patient.phone_number || "—"],
              ["Email", patient.email || "—"],
              ["Blood group", patient.blood_group || "—"],
              ["Address", patient.address || "—"],
              ["Allergies", patient.allergies || "None recorded"],
              ["Emergency contact", patient.emergency_contact_name ? `${patient.emergency_contact_name} (${patient.emergency_contact_phone})` : "—"],
              ["Registered by", patient.registered_by_name || "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.3 }}>{label}</div>
                <div style={{ fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {showForm && (
        <RecordFormModal
          patientId={patient.id}
          doctors={doctors}
          currentUser={user}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}
