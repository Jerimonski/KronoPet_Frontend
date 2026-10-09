import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import ProtectedRoute from "../core/ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import HomePage from "../features/landing/pages/HomePage";

// El panel interno se carga bajo demanda para no inflar la landing pública.
const DashboardLayout = lazy(() => import("../shared/layouts/DashboardLayout"));
const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const TutorsPage = lazy(() => import("../features/tutors/pages/TutorsPage"));
const TutorDetailPage = lazy(() => import("../features/tutors/pages/TutorDetailPage"));
const PetsPage = lazy(() => import("../features/pets/pages/PetsPage"));
const PetDetailPage = lazy(() => import("../features/pets/pages/PetDetailPage"));
const MedicalHistoryPage = lazy(() => import("../features/history/pages/MedicalHistoryPage"));
const VaccinesPage = lazy(() => import("../features/vaccines/pages/VaccinesPage"));
const StaffPage = lazy(() => import("../features/staff/pages/StaffPage"));
const RemindersPage = lazy(() => import("../features/reminders/pages/RemindersPage"));
const AuditPage = lazy(() => import("../features/audit/pages/AuditPage"));

function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-600" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="tutores" element={<TutorsPage />} />
              <Route path="tutores/:tutorId" element={<TutorDetailPage />} />
              <Route path="mascotas" element={<PetsPage />} />
              <Route path="mascotas/:petId" element={<PetDetailPage />} />
              <Route path="historial" element={<MedicalHistoryPage />} />
              <Route path="vacunas" element={<VaccinesPage />} />
              <Route path="recordatorios" element={<RemindersPage />} />
              <Route path="equipo" element={<StaffPage />} />
              <Route path="auditoria" element={<AuditPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
