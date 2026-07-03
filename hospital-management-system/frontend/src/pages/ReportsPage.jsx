import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/client";

const TOKENS = { grid: "#e1e0d9", axis: "#898781", line: "#2a78d6" };
const SERIES = { upcoming: "#2a78d6", completed: "#1baf7a", cancelled: "#e34948" };

export default function ReportsPage() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [staffToday, setStaffToday] = useState([]);

  useEffect(() => {
    api.get("/reports/overview/").then(({ data }) => setOverview(data));
    api.get("/reports/appointments-trend/?days=30").then(({ data }) => setTrend(data.map((d) => ({ ...d, label: d.date.slice(5) }))));
    api.get("/reports/doctor-workload/").then(({ data }) => setWorkload(data));
    api.get("/reports/staff-availability/").then(({ data }) => setStaffToday(data));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p>Operational performance across patients, appointments, and staff.</p>
        </div>
      </div>

      {overview && (
        <div className="stat-grid">
          <div className="stat-tile"><div className="label">Total Patients</div><div className="value">{overview.total_patients}</div></div>
          <div className="stat-tile"><div className="label">Doctors</div><div className="value">{overview.total_doctors}</div></div>
          <div className="stat-tile"><div className="label">Nurses</div><div className="value">{overview.total_nurses}</div></div>
          <div className="stat-tile"><div className="label">Appointments this week</div><div className="value">{overview.appointments_this_week}</div></div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 18 }}>
        <h3 style={{ marginTop: 0 }}>Appointment volume — last 30 days</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={TOKENS.grid} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: TOKENS.axis }} axisLine={{ stroke: TOKENS.grid }} tickLine={false} interval={2} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: TOKENS.axis }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9", fontSize: 13 }} />
            <Line type="monotone" dataKey="count" name="Appointments" stroke={TOKENS.line} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Doctor workload</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={workload} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={TOKENS.grid} vertical={false} />
              <XAxis dataKey="doctor_name" tick={{ fontSize: 12, fill: TOKENS.axis }} axisLine={{ stroke: TOKENS.grid }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: TOKENS.axis }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="upcoming" name="Upcoming" fill={SERIES.upcoming} radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill={SERIES.completed} radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" name="Cancelled" fill={SERIES.cancelled} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Staff on shift today</h3>
          {staffToday.length === 0 && <p className="empty-state">No shifts scheduled today.</p>}
          {staffToday.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--gridline)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.staff_name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.department}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
