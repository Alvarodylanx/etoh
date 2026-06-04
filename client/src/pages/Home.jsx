import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStands, getProducts } from '../api';
import { CATEGORIES, getCategoryMeta } from '../constants/categories';
import { useLang } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';

const REGIONS = ['Douala', 'Yaoundé', 'Bamenda', 'Buea', 'Bafoussam', 'Kribi', 'Limbe', 'Ngaoundéré'];

export default function Home() {
  const { t } = useLang();
  const [stands, setStands]           = useState([]);
  const [products, setProducts]       = useState([]);
  const [search, setSearch]           = useState('');
  const [tab, setTab]                 = useState('products');
  const [activeCategory, setCategory] = useState('all');
  const [activeRegion, setRegion]     = useState('all');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([getStands(), getProducts()])
      .then(([s, p]) => { setStands(s.data); setProducts(p.data); })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase();
    return (p.product_name.toLowerCase().includes(q) || (p.vendor_name || '').toLowerCase().includes(q))
        && (activeCategory === 'all' || p.category === activeCategory)
        && (activeRegion   === 'all' || p.city === activeRegion);
  });

  const filteredStands = stands.filter(s => {
    const q = search.toLowerCase();
    return (s.vendor_name.toLowerCase().includes(q) || (s.stand_description || '').toLowerCase().includes(q))
        && (activeRegion === 'all' || s.city === activeRegion);
  });

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">{t('heroTagline')}</div>
        <h1>{t('heroTitle')}</h1>
        <p>{t('heroSubtitle')}</p>
        <div className="hero-actions">
          <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--primary-dark)', fontWeight: 700 }}>
            {t('openMyStand')}
          </Link>
          <Link to="/market-buzz" className="btn" style={{ background: 'rgba(255,255,255,.18)', color: 'white', border: '2px solid rgba(255,255,255,.4)' }}>
            {t('watchReels')}
          </Link>
        </div>
        <div className="hero-cities">
          {REGIONS.slice(0, 5).map(c => <span key={c} className="city-pill">📍 {c}</span>)}
        </div>
      </div>

      <div className="page">
        {/* Stats */}
        <div className="stats-strip">
          <div className="stat-item"><div className="stat-value">{stands.length}</div><div className="stat-label">{t('activeStands')}</div></div>
          <div className="stat-item"><div className="stat-value">{products.length}</div><div className="stat-label">{t('productsListed')}</div></div>
          <div className="stat-item"><div className="stat-value">12+</div><div className="stat-label">{t('reelsLabel')}</div></div>
          <div className="stat-item"><div className="stat-value">CFA</div><div className="stat-label">{t('localCurrency')}</div></div>
        </div>

        {/* Tabs + Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid var(--border)' }}>
            <button className={`tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
              🛍️ {t('productsTab')} ({filteredProducts.length})
            </button>
            <button className={`tab-btn ${tab === 'stands' ? 'active' : ''}`} onClick={() => setTab('stands')}>
              🏪 {t('standsTab')} ({filteredStands.length})
            </button>
          </div>
          <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input placeholder="Search products, vendors..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>✕</button>}
          </div>
        </div>

        {/* Region filter */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>{t('filterByRegion')}</div>
          <div className="cat-bar">
            <button className={`cat-chip ${activeRegion === 'all' ? 'active' : ''}`} onClick={() => setRegion('all')}>{t('allCities')}</button>
            {REGIONS.map(r => (
              <button key={r} className={`cat-chip ${activeRegion === r ? 'active' : ''}`} onClick={() => setRegion(r)}>📍 {r}</button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        {tab === 'products' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>{t('categoryLabel')}</div>
            <div className="cat-bar">
              <button className={`cat-chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>{t('allProducts')}</button>
              {CATEGORIES.filter(c => c.id !== 'general').map(c => (
                <button key={c.id} className={`cat-chip ${activeCategory === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>{c.icon} {c.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Active filter summary */}
        {(activeRegion !== 'all' || activeCategory !== 'all') && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>{t('showing')}</span>
            {activeRegion !== 'all' && (
              <span className="stand-badge" style={{ cursor: 'pointer' }} onClick={() => setRegion('all')}>📍 {activeRegion} ✕</span>
            )}
            {activeCategory !== 'all' && tab === 'products' && (
              <span className="stand-badge" style={{ cursor: 'pointer' }} onClick={() => setCategory('all')}>
                {getCategoryMeta(activeCategory).icon} {getCategoryMeta(activeCategory).label} ✕
              </span>
            )}
            <button onClick={() => { setRegion('all'); setCategory('all'); setSearch(''); }}
              style={{ fontSize: '.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              {t('clearAll')}
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tab === 'products' ? (
          filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h3>{t('noProductsMatch')}</h3>
              <p>{t('tryDifferent')}</p>
              <button className="btn btn-outline" style={{ marginTop: '16px' }} onClick={() => { setRegion('all'); setCategory('all'); setSearch(''); }}>
                {t('clearFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-3">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )
        ) : (
          filteredStands.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏪</div>
              <h3>{t('noStandsArea')}</h3>
              <p>{t('tryDifferentCity')}</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {filteredStands.map(s => (
                <Link key={s.id} to={`/stands/${s.id}`} className="card stand-card">
                  <div className="stand-banner">🏪</div>
                  <div className="stand-info">
                    <div className="stand-name">
                      {s.vendor_name}
                      {s.is_verified ? <span className="vendor-verified" style={{ marginLeft: 6 }}>✓ {t('trustedVendor')}</span> : null}
                    </div>
                    <div className="stand-desc">{s.stand_description || 'Welcome to my stand!'}</div>
                    <div className="stand-meta">
                      {s.city && <span className="stand-badge">📍 {s.city}</span>}
                      <span className="stand-badge">📅 {new Date(s.creation_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Market Buzz banner */}
        <div style={{ marginTop: '52px', background: 'linear-gradient(135deg,#111,#1a1a1a)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 32px', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>{t('buzzBannerLabel')}</div>
            <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>{t('buzzBannerTitle')}</div>
            <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem' }}>{t('buzzBannerDesc')}</div>
          </div>
          <Link to="/market-buzz" className="btn" style={{ background: 'white', color: '#111', fontWeight: 700, padding: '12px 24px', flexShrink: 0, animation: 'waPulse 2.5s infinite' }}>
            {t('watchReels')}
          </Link>
        </div>
      </div>
    </>
  );
}
