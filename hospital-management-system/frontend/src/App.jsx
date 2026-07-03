import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientsPage from "./pages/PatientsPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import StaffPage from "./pages/StaffPage";
import ShiftsPage from "./pages/ShiftsPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/appointments" element={<AppointmentsPage />} />

          <Route element={<RoleRoute roles={["ADMIN", "DOCTOR", "NURSE"]} />}>
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/shifts" element={<ShiftsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          <Route element={<RoleRoute roles={["ADMIN"]} />}>
            <Route path="/staff" element={<StaffPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
