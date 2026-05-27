// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LayoutProvider } from './hooks/useLayout';
import { LoginPage } from './pages/Login/LoginPage';
import { MainLayout } from './components/Layout/MainLayout/MainLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
//import { CalendarPage } from './pages/CalendarPage/CalendarPage';
//import { ClientsPage } from './pages/Clients/ClientsPage';
// import { Dashboard } from './components/Dashboard/Dashboard';

// Заглушки страниц пр
const StudentsPage = React.lazy(() => import('./pages/Students/StudentsPage').then(m => ({ default: m.StudentsPage })));
const ClientProfilePage = React.lazy(() => import('./pages/ClientProfile/ClientProfilePage').then(m => ({ default: m.ClientProfilePage })));
const TeacherProfilePage = React.lazy(() => import('./pages/TeacherProfile/TeacherProfilePage').then(m => ({ default: m.TeacherProfilePage })));
const AdminProfilePage = React.lazy(() => import('./pages/AdminProfile/AdminProfilePage').then(m => ({ default: m.AdminProfilePage })));
const TeachersPage = React.lazy(() => import('./pages/Teachers/TeachersPage').then(m => ({ default: m.TeachersPage })));
const ClientsPage = React.lazy(() => import('./pages/Clients/ClientsPage').then(m => ({ default: m.ClientsPage })));
const CoursesPage = React.lazy(() => import('./pages/Courses/CoursesPage').then(m => ({ default: m.CoursesPage })));
// const LessonsPage = React.lazy(() => import('./pages/Lessons/LessonsPage').then(m => ({ default: m.LessonsPage })));
const ProgressPage = React.lazy(() => import('./pages/Progress/ProgressPage').then(m => ({ default: m.ProgressPage })));
// const AnalyticsPage = React.lazy(() => import('./pages/Analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const CalendarPage = React.lazy(() => import('./pages/Calendar/CalendarPage').then(m => ({ default: m.CalendarPage })));
const Train = React.lazy(() => import('./pages/Train/TrainPage').then(m => ({ default: m.TrainPage })));
// const SettingsPage = React.lazy(() => import('./pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/calendar" replace /> : <LoginPage />} 
      />
      
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<div>Dashboard</div>} />
      <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
      <Route path="/teacher/schedule" element={<div>Teacher Schedule</div>} />
      <Route path="/client/schedule" element={<div>Client Schedule</div>} />
      <Route path="/students" element={<StudentsPage />} />
      <Route path="/profile" element={<ClientProfilePage />} />
      <Route path="/profileteacher" element={<TeacherProfilePage />} />
      <Route path="/profileadmin" element={<AdminProfilePage />} />
      <Route path="/teachers" element={<TeachersPage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/train" element={<Train />} />
      <Route path="/calendar" element={<CalendarPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
      
      <Route path="/" element={<Navigate to="/calendar" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
        <LayoutProvider>
          <React.Suspense fallback={<div>Загрузка...</div>}>
             <AppRoutes /> 
          </React.Suspense>
        </LayoutProvider>
    </BrowserRouter>
  );
};

export default App;