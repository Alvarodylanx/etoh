import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function Register() {
  const { saveLogin } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function onSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError(t('pwMismatch')); return; }
    setLoading(true); setError('');
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      saveLogin(res.data.token, res.data.user);
      navigate('/my-stands');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏪</div>
        <h1 className="auth-title">{t('createAccount')}</h1>
        <p className="auth-subtitle">{t('registerSubtitle')}</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">{t('nameLabel')}</label>
            <input className="form-input" name="name" value={form.name} onChange={onChange} placeholder="e.g. Josephine Mbarga" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">{t('emailLabel')}</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('passwordLabel')}</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={onChange} placeholder="At least 6 characters" required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('confirmPassword')}</label>
            <input className="form-input" type="password" name="confirm" value={form.confirm} onChange={onChange} placeholder="Repeat your password" required />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: '8px', padding: '12px' }}>
            {loading ? t('registering') : t('registerBtn')}
          </button>
        </form>

        <div className="auth-footer">
          {t('hasAccount')}{' '}
          <Link to="/login" className="auth-link">{t('logInLink')}</Link>
        </div>
      </div>
    </div>
  );
}
