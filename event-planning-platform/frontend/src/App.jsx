import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import DiscoverPage from "./pages/DiscoverPage";
import EventDetailPage from "./pages/EventDetailPage";
import EventsPage from "./pages/EventsPage";
import GalleryPage from "./pages/GalleryPage";
import Login from "./pages/Login";
import MessagesPage from "./pages/MessagesPage";
import RsvpPage from "./pages/RsvpPage";
import VendorDashboard from "./pages/VendorDashboard";
import VendorDetailPage from "./pages/VendorDetailPage";
import VendorsPage from "./pages/VendorsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/rsvp/:token" element={<RsvpPage />} />

      <Route element={<Layout />}>
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/vendors/:id" element={<VendorDetailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/messages" element={<MessagesPage />} />

          <Route element={<RoleRoute roles={["PLANNER", "ADMIN"]} />}>
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
          </Route>

          <Route element={<RoleRoute roles={["VENDOR"]} />}>
            <Route path="/vendor-hub" element={<VendorDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
