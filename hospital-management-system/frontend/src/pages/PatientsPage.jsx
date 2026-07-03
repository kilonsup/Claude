import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const EMPTY_FORM = {
  first_name: "", last_name: "", date_of_birth: "", gender: "M",
  phone_number: "", email: "", address: "", blood_group: "",
  allergies: "", emergency_contact_name: "", emergency_contact_phone: "",
};

function PatientFormModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/patients/", form);
      onSaved();
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || "Could not save patient.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Register New Patient</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>First name</label>
              <input required value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Last name</label>
              <input required value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Date of birth</label>
              <input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div className="form-field">
              <label>Phone number</label>
              <input value={form.phone_number} onChange={(e) => update("phone_number", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Blood group</label>
              <input value={form.blood_group} onChange={(e) => update("blood_group", e.target.value)} placeholder="O+" />
            </div>
            <div className="form-field">
              <label>Emergency contact name</label>
              <input value={form.emergency_contact_name} onChange={(e) => update("emergency_contact_name", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Emergency contact phone</label>
              <input value={form.emergency_contact_phone} onChange={(e) => update("emergency_contact_phone", e.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <label>Address</label>
            <textarea rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="form-field">
            <label>Known allergies</label>
            <textarea rows={2} value={form.allergies} onChange={(e) => update("allergies", e.target.value)} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Patient"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/patients/", { params: search ? { search } : {} })
      .then(({ data }) => setPatients(data.results || data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Patient Records</h1>
          <p>Search, register, and manage patient information.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Register Patient</button>
      </div>

      <div className="toolbar">
        <input placeholder="Search by name, phone, or email…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: 280 }} />
      </div>

      <div className="card">
        {loading && <p className="empty-state">Loading patients…</p>}
        {!loading && patients.length === 0 && <p className="empty-state">No patients found.</p>}
        {!loading && patients.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Gender</th><th>Date of Birth</th><th>Phone</th><th>Blood Group</th><th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name}</td>
                  <td>{p.gender}</td>
                  <td>{p.date_of_birth || "—"}</td>
                  <td>{p.phone_number || "—"}</td>
                  <td>{p.blood_group || "—"}</td>
                  <td><Link className="btn btn-sm" to={`/patients/${p.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <PatientFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}
