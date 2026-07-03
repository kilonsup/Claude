import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

const CHART_TOKENS = {
  grid: "#e1e0d9",
  axis: "#898781",
  line: "#2a78d6",
};

function StaffDashboard() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [today, setToday] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/reports/overview/"),
      api.get("/reports/appointments-trend/?days=14"),
      api.get("/appointments/?date=" + new Date().toISOString().slice(0, 10)),
    ])
      .then(([o, t, a]) => {
        setOverview(o.data);
        setTrend(t.data.map((d) => ({ ...d, label: d.date.slice(5) })));
        setToday(a.data.results || a.data);
      })
      .catch(() => setErr("Could not load dashboard data."));
  }, []);

  if (err) return <p className="error-text">{err}</p>;
  if (!overview) return <p className="empty-state">Loading dashboard…</p>;

  return (
    <>
      <div className="stat-grid">
        <div className="stat-tile">
          <div className="label">Total Patients</div>
          <div className="value">{overview.total_patients}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Appointments Today</div>
          <div className="value">{overview.appointments_today}</div>
        </div>
        <div className="stat-tile">
          <div className="label">This Week</div>
          <div className="value">{overview.appointments_this_week}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Staff On Shift Today</div>
          <div className="value">{overview.staff_on_shift_today}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Appointment volume — last 14 days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={CHART_TOKENS.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART_TOKENS.axis }} axisLine={{ stroke: CHART_TOKENS.grid }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHART_TOKENS.axis }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9", fontSize: 13 }} />
              <Line type="monotone" dataKey="count" name="Appointments" stroke={CHART_TOKENS.line} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Today's schedule</h3>
          {today.length === 0 && <p className="empty-state">No appointments today.</p>}
          {today.map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--gridline)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.patient_name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.scheduled_time?.slice(0, 5)} · Dr. {a.doctor_name}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
          <Link to="/appointments" className="btn btn-sm" style={{ display: "inline-block", marginTop: 14 }}>
            View all appointments
          </Link>
        </div>
      </div>
    </>
  );
}

function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .get("/patients/")
      .then(({ data }) => {
        const results = data.results || data;
        if (results.length === 0) return null;
        return api.get(`/patients/${results[0].id}/`);
      })
      .then((res) => res && setPatient(res.data))
      .catch(() => setErr("No patient record is linked to your account yet. Please contact the front desk."));

    api
      .get("/appointments/")
      .then(({ data }) => setAppointments(data.results || data))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>My upcoming appointments</h3>
          {appointments.length === 0 && <p className="empty-state">No appointments scheduled.</p>}
          {appointments.map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--gridline)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. {a.doctor_name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.scheduled_date} at {a.scheduled_time?.slice(0, 5)}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
          <Link to="/appointments" className="btn btn-sm" style={{ display: "inline-block", marginTop: 14 }}>
            Manage appointments
          </Link>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>My medical history</h3>
          {err && <p className="error-text">{err}</p>}
          {!err && !patient && <p className="empty-state">Loading…</p>}
          {patient && patient.medical_records.length === 0 && <p className="empty-state">No medical records yet.</p>}
          {patient?.medical_records.map((r) => (
            <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--gridline)" }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{r.diagnosis}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {new Date(r.visit_date).toLocaleDateString()} · Dr. {r.doctor_name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {user.first_name || user.username}</h1>
          <p>Here's what's happening today.</p>
        </div>
      </div>
      {user.role === "PATIENT" ? <PatientDashboard /> : <StaffDashboard />}
    </div>
  );
}
