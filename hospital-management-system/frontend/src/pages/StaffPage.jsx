import { useEffect, useState } from "react";
import api from "../api/client";

const DEPARTMENTS = ["GENERAL", "PEDIATRICS", "SURGERY", "CARDIOLOGY", "EMERGENCY", "NURSING", "ADMIN"];

const EMPTY_FORM = {
  first_name: "", last_name: "", username: "", email: "", password: "",
  role: "DOCTOR", employee_id: "", department: "GENERAL", specialization: "", designation: "",
};

function StaffFormModal({ onClose, onSaved }) {
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
      const { data: newUser } = await api.post("/accounts/users/", {
        username: form.username, email: form.email, password: form.password,
        first_name: form.first_name, last_name: form.last_name, role: form.role,
      });
      await api.post("/staff/", {
        user: newUser.id, employee_id: form.employee_id, department: form.department,
        specialization: form.specialization, designation: form.designation,
      });
      onSaved();
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || "Could not add staff member.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Medical Staff</h2>
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
              <label>Username</label>
              <input required value={form.username} onChange={(e) => update("username", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Temporary password</label>
              <input type="password" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Role</label>
              <select value={form.role} onChange={(e) => update("role", e.target.value)}>
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
              </select>
            </div>
            <div className="form-field">
              <label>Employee ID</label>
              <input required value={form.employee_id} onChange={(e) => update("employee_id", e.target.value)} placeholder="DOC-004" />
            </div>
            <div className="form-field">
              <label>Department</label>
              <select value={form.department} onChange={(e) => update("department", e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Specialization</label>
              <input value={form.specialization} onChange={(e) => update("specialization", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Designation</label>
              <input value={form.designation} onChange={(e) => update("designation", e.target.value)} />
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Add Staff"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    api.get("/staff/").then(({ data }) => setStaff(data.results || data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleAvailability(member) {
    await api.patch(`/staff/${member.id}/`, { is_available: !member.is_available });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Medical Staff</h1>
          <p>Manage doctors and nurses, their department, and availability.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Staff Member</button>
      </div>

      <div className="card">
        {loading && <p className="empty-state">Loading staff…</p>}
        {!loading && staff.length === 0 && <p className="empty-state">No staff members yet.</p>}
        {!loading && staff.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Employee ID</th><th>Name</th><th>Role</th><th>Department</th><th>Specialization</th><th>Available</th><th></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>{s.employee_id}</td>
                  <td>{s.full_name}</td>
                  <td>{s.role}</td>
                  <td>{s.department}</td>
                  <td>{s.specialization || "—"}</td>
                  <td>{s.is_available ? "Yes" : "No"}</td>
                  <td><button className="btn btn-sm" onClick={() => toggleAvailability(s)}>Toggle</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <StaffFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}
