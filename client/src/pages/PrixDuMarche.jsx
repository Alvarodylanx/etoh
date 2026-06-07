import { useState, useEffect } from 'react';
import { getPriceItems, getPrices, submitPrice } from '../api';
import { useLang } from '../context/LanguageContext';

const CITIES = ['Douala','Yaoundé','Bamenda','Buea','Bafoussam','Kribi','Limbe','Ngaoundéré'];

const ITEM_ICONS = {
  'Tomates':        '🍅',
  'Plantains':      '🍌',
  'Huile de palme': '🫙',
  'Riz blanc':      '🍚',
  'Ndolé':          '🥬',
  'Bœuf':           '🥩',
  'Poulet entier':  '🍗',
  'Poisson fumé':   '🐟',
  'Manioc':         '🌿',
  'Haricots':       '🫘',
  'Piment rouge':   '🌶️',
  'Gombo':          '🥒',
};

function PriceCard({ item, summary, t }) {
  const icon = ITEM_ICONS[item.name] || '🛒';
  const s    = summary?.find(r => r.item_name === item.name);

  return (
    <div className="prix-card">
      <div className="prix-card-header">
        <span className="prix-icon">{icon}</span>
        <div>
          <div className="prix-name">{item.name}</div>
          <div className="prix-unit">/ {item.unit}</div>
        </div>
        {s && (
          <div className="prix-count">
            {s.report_count} {t('todayReports')}
          </div>
        )}
      </div>

      {s ? (
        <div className="prix-stats">
          <div className="prix-stat">
            <div className="prix-stat-label">{t('minPrice')}</div>
            <div className="prix-stat-val" style={{ color: '#10b981' }}>{Math.round(s.min_price).toLocaleString()}</div>
          </div>
          <div className="prix-stat prix-stat-avg">
            <div className="prix-stat-label">{t('avgPrice')}</div>
            <div className="prix-stat-val">{Math.round(s.avg_price).toLocaleString()}</div>
            <div className="prix-cfa">CFA</div>
          </div>
          <div className="prix-stat">
            <div className="prix-stat-label">{t('maxPrice')}</div>
            <div className="prix-stat-val" style={{ color: '#ef4444' }}>{Math.round(s.max_price).toLocaleString()}</div>
          </div>
        </div>
      ) : (
        <div className="prix-no-data">{t('noReports')}</div>
      )}
    </div>
  );
}

export default function PrixDuMarche() {
  const { t } = useLang();
  const [items,    setItems]    = useState([]);
  const [summary,  setSummary]  = useState([]);
  const [city,     setCity]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ item_name:'', price_cfa:'', unit:'kg', market_name:'', city:'Douala', reporter:'' });
  const [submitting, setSub]    = useState(false);
  const [submitted,  setDone]   = useState(false);
  const [error,      setError]  = useState('');

  const loadPrices = (c = city) =>
    getPrices(c).then(r => setSummary(r.data.summary || []));

  useEffect(() => {
    getPriceItems().then(r => setItems(r.data));
    loadPrices();
  }, []);

  useEffect(() => { loadPrices(); }, [city]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.item_name || !form.price_cfa || !form.city) { setError('Please fill required fields.'); return; }
    setSub(true); setError('');
    try {
      await submitPrice(form);
      setDone(true);
      setShowForm(false);
      setForm(f => ({ ...f, price_cfa:'', market_name:'', reporter:'' }));
      loadPrices(form.city);
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed.');
    } finally { setSub(false); }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="prix-header">
        <div>
          <h1 className="prix-main-title">🏷️ {t('priceBoardTitle')}</h1>
          <p className="prix-main-sub">{t('priceBoardSubtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : `+ ${t('submitPrice')}`}
        </button>
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          ✅ Prix soumis ! Merci pour votre contribution. / Price submitted! Thank you.
        </div>
      )}

      {/* Submit form */}
      {showForm && (
        <div className="prix-form-wrap">
          <div className="prix-form-title">📝 {t('submitPriceTitle')}</div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">{t('itemLabel')} *</label>
                <select className="form-select" value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value, unit: items.find(i=>i.name===e.target.value)?.unit || 'kg' }))} required>
                  <option value="">-- {t('itemLabel')} --</option>
                  {items.map(i => <option key={i.name} value={i.name}>{ITEM_ICONS[i.name] || '🛒'} {i.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('priceLabel')} *</label>
                <input className="form-input" type="number" min="1" value={form.price_cfa} onChange={e => setForm(f => ({ ...f, price_cfa: e.target.value }))} placeholder="e.g. 500" required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('cityLabel')} *</label>
                <select className="form-select" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('marketNameLabel')}</label>
                <input className="form-input" value={form.market_name} onChange={e => setForm(f => ({ ...f, market_name: e.target.value }))} placeholder="e.g. Marché Central, New-Bell…" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">{t('reporterLabel')}</label>
                <input className="form-input" value={form.reporter} onChange={e => setForm(f => ({ ...f, reporter: e.target.value }))} placeholder="e.g. Marie" />
              </div>
            </div>
            <button className="btn btn-primary btn-full" disabled={submitting} style={{ padding: 12 }}>
              {submitting ? t('submittingBtn') : t('submitBtn')}
            </button>
          </form>
        </div>
      )}

      {/* City filter */}
      <div style={{ marginBottom: 20 }}>
        <div className="cat-bar">
          <button className={`cat-chip ${city === '' ? 'active' : ''}`} onClick={() => setCity('')}>🌍 All Cities</button>
          {CITIES.map(c => (
            <button key={c} className={`cat-chip ${city === c ? 'active' : ''}`} onClick={() => setCity(c)}>📍 {c}</button>
          ))}
        </div>
      </div>

      {/* Price grid */}
      <div className="prix-grid">
        {items.map(item => (
          <PriceCard key={item.name} item={item} summary={summary} t={t} />
        ))}
      </div>

      {/* How it works */}
      <div className="prix-info-box">
        <div className="prix-info-title">ℹ️ Comment ça marche / How it works</div>
        <p>
          🇫🇷 <strong>Participatif :</strong> Chaque achat que vous signalez aide les autres à négocier un juste prix. Les prix se réinitialisent chaque jour.
          <br />
          🇬🇧 <strong>Community-powered:</strong> Every price you report helps others negotiate fairly. Prices reset daily.
        </p>
      </div>
    </div>
  );
}
