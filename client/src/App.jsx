import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore.js';
import Spinner from './components/shared/Spinner.jsx';

// Lazy-loaded pages
const Landing       = lazy(() => import('./pages/Landing.jsx'));
const Login         = lazy(() => import('./pages/auth/Login.jsx'));
const Register      = lazy(() => import('./pages/auth/Register.jsx'));
const TalentDash    = lazy(() => import('./pages/dashboards/TalentDashboard.jsx'));
const IGDash        = lazy(() => import('./pages/dashboards/IGPageDashboard.jsx'));
const BrandDash     = lazy(() => import('./pages/dashboards/BrandDashboard.jsx'));
const AdminDash     = lazy(() => import('./pages/dashboards/AdminDashboard.jsx'));
const NotFound      = lazy(() => import('./pages/NotFound.jsx'));

// Route guards
const PrivateRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    const dest = { talent: '/dashboard/talent', igpage: '/dashboard/igpage', brand: '/dashboard/brand', admin: '/dashboard/admin' };
    return <Navigate to={dest[user.role] || '/'} replace />;
  }
  return children;
};

export default function App() {
  return (
    <Suspense fallback={<Spinner fullScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/"       element={<Landing />} />
        <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected dashboards */}
        <Route path="/dashboard/talent/*" element={
          <PrivateRoute roles={['talent']}><TalentDash /></PrivateRoute>
        } />
        <Route path="/dashboard/igpage/*" element={
          <PrivateRoute roles={['igpage']}><IGDash /></PrivateRoute>
        } />
        <Route path="/dashboard/brand/*" element={
          <PrivateRoute roles={['brand']}><BrandDash /></PrivateRoute>
        } />
        <Route path="/dashboard/admin/*" element={
          <PrivateRoute roles={['admin']}><AdminDash /></PrivateRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
