import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function Profile() {
  const { user, saveLogin } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', whatsapp: user?.whatsapp || '' });
  const [picFile, setPicFile]     = useState(null);
  const [picPreview, setPicPreview] = useState(user?.profile_picture || null);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');
  const fileRef = useRef();

  function onPicChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('bio', form.bio);
    fd.append('whatsapp', form.whatsapp);
    if (picFile) fd.append('profile_picture', picFile);
    try {
      const res = await updateProfile(fd);
      const token = localStorage.getItem('etoh_token');
      saveLogin(token, { ...user, ...res.data });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally { setSaving(false); }
  }

  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-lg">
            {picPreview ? <img src={picPreview} alt="Profile" /> : initial}
          </div>
          <button className="profile-avatar-edit" onClick={() => fileRef.current.click()} title="Change photo">📷</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPicChange} />
        </div>
        <div className="profile-name">{form.name || user?.name}</div>
        <div className="profile-bio">{form.bio || t('addBio')}</div>
        {form.whatsapp && <div className="whatsapp-chip">📱 WhatsApp: {form.whatsapp}</div>}
      </div>

      <div className="page" style={{ maxWidth: 560 }}>
        {success && <div className="alert alert-success">✅ {success}</div>}
        {error   && <div className="alert alert-error">⚠️ {error}</div>}

        <div className="card" style={{ padding: '28px' }}>
          <div style={{ fontWeight: 800, marginBottom: '20px', fontSize: '1rem' }}>{t('editProfile')}</div>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">{t('fullName')}</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('bio')}</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell buyers about you..." style={{ minHeight: '80px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('whatsAppNumber')}</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ background: '#f3f4f6', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '.9rem', border: '2px solid var(--border)' }}>+237</span>
                <input className="form-input" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="6 XX XX XX XX" style={{ flex: 1 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('profilePicture')}</label>
              <div className="file-upload-area" onClick={() => fileRef.current.click()} style={{ padding: '16px' }}>
                <div className="file-upload-icon">🖼️</div>
                <div className="file-upload-text">{t('clickToUpload')}</div>
                {picFile && <div className="file-preview-name">✅ {picFile.name}</div>}
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={saving} style={{ padding: '13px' }}>
              {saving ? t('saving') : t('saveProfile')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
