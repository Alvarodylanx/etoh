import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function Login() {
  const { saveLogin } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await login(form);
      saveLogin(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🛒</div>
        <h1 className="auth-title">{t('welcomeBack')}</h1>
        <p className="auth-subtitle">{t('loginSubtitle')}</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">{t('emailLabel')}</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">{t('passwordLabel')}</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={onChange} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: '8px', padding: '12px' }}>
            {loading ? t('loggingIn') : t('loginBtn')}
          </button>
        </form>

        <div className="auth-footer">
          {t('noAccount')}{' '}
          <Link to="/register" className="auth-link">{t('createFree')}</Link>
        </div>
      </div>
    </div>
  );
}
