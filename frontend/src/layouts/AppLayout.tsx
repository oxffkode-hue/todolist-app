import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { getCategoryDisplayName } from '../utils/categoryName';
import { TagIcon, getCategoryIconComponent } from '../components/common/CategoryIcons';
import { useUiStore } from '../stores/uiStore';
import { useCategoriesQuery } from '../queries/useCategoriesQuery';
import { useToggleDarkModeMutation } from '../mutations/useToggleDarkModeMutation';
import { useToggleLanguageMutation } from '../mutations/useToggleLanguageMutation';
import { ROUTES } from '../constants';
import { logout } from '../api/auth.api';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const navigate = useNavigate();
  const { data: categories } = useCategoriesQuery();
  const darkModeMutation = useToggleDarkModeMutation();
  const languageMutation = useToggleLanguageMutation();

  const handleDarkModeToggle = () => {
    const next = !(user?.darkMode ?? false);
    darkModeMutation.mutate(next);
  };

  const handleLanguageToggle = () => {
    const next = user?.language === 'ko' ? 'en' : 'ko';
    languageMutation.mutate(next);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <button className={styles.menuBtn} onClick={toggleSidebar} aria-label={t('nav.menu')}>
          ☰
        </button>
        <span className={styles.logo}>{t('app.name')}</span>
        <div className={styles.headerRight}>
          {user && <span className={styles.userName}>{user.name}님</span>}
          <button
            className={styles.darkModeBtn}
            onClick={handleDarkModeToggle}
            aria-label={user?.darkMode ? t('darkMode.switchToLight') : t('darkMode.switchToDark')}
            title={user?.darkMode ? t('darkMode.light') : t('darkMode.dark')}
          >
            {user?.darkMode ? '☀' : '🌙'}
          </button>
          <button
            className={styles.langBtn}
            onClick={handleLanguageToggle}
            title={t('language.switchTo')}
          >
            {t('language.switchTo')}
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>{t('auth.logout')}</button>
        </div>
      </header>

      {isSidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <nav className={styles.nav}>
          <NavLink
            to={ROUTES.HOME}
            end
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {t('nav.todos')}
          </NavLink>
          <NavLink
            to={ROUTES.CATEGORIES}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {t('nav.categories')}
          </NavLink>
          <NavLink
            to={ROUTES.PROFILE}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {t('nav.settings')}
          </NavLink>
        </nav>

        {categories && categories.length > 0 && (
          <div className={styles.categorySection}>
            <p className={styles.categorySectionTitle}>{t('nav.categories')}</p>
            {categories.map((cat) => {
              const CatIcon = cat.isDefault ? TagIcon : getCategoryIconComponent(cat.icon);
              return (
                <NavLink
                  key={cat.id}
                  to={`${ROUTES.HOME}?categoryId=${cat.id}`}
                  className={styles.categoryItem}
                  onClick={() => setSidebarOpen(false)}
                >
                  <CatIcon size={13} />
                  {getCategoryDisplayName(cat, t)}
                </NavLink>
              );
            })}
          </div>
        )}
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
