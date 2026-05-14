import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../constants';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return (
    <div className={styles.container}>
      <Outlet />
    </div>
  );
}
