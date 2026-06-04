import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, t, toggle } = useLang();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/'); }

  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">ETOH <span>Market</span></Link>

      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>{t('market')}</NavLink>
        <NavLink to="/market-buzz" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>{t('buzz')}</NavLink>

        {user ? (
          <>
            <NavLink to="/my-stands" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>{t('myStands')}</NavLink>
            <div className="user-chip">
              <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="user-avatar">
                  {user.profile_picture ? <img src={user.profile_picture} alt={user.name} /> : initial}
                </div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </Link>
              <button className="logout-btn" onClick={handleLogout} title={t('logIn')}>↩</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login"    className="navbar-link">{t('logIn')}</Link>
            <Link to="/register" className="btn-nav">{t('joinFree')}</Link>
          </>
        )}

        <button className="lang-toggle" onClick={toggle} title="Switch language">
          {lang === 'en' ? '🇫🇷 FR' : '🇬🇧 EN'}
        </button>
      </div>
    </nav>
  );
}
