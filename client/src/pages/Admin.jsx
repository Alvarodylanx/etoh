import { useState, useEffect, useRef } from 'react';

const ADMIN_KEY_SS = 'etoh_admin_key';
const BASE = '/api/admin';
const CATS = ['fashion','food','produce','electronics','beauty','home','crafts','services','general'];

function adminFetch(path, opts = {}) {
  const key = sessionStorage.getItem(ADMIN_KEY_SS) || '';
  return fetch(BASE + path, {
    ...opts,
    headers: { 'x-admin-key': key, ...(opts.headers || {}) },
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Request failed');
    return data;
  });
}

function fmtPrice(n) {
  const num = Number(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0','') + 'M';
  return num.toLocaleString();
}

/* ── Stat card ─────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', gap: 16, borderLeft: `4px solid ${color}` }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0f172a' }}>{value ?? '—'}</div>
        <div style={{ fontSize: '.82rem', color: '#64748b', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Admin Login ───────────────────────────────────────────────────── */
function AdminLogin({ onAuth }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      sessionStorage.setItem(ADMIN_KEY_SS, pw);
      await adminFetch('/stats');
      onAuth(pw);
    } catch {
      sessionStorage.removeItem(ADMIN_KEY_SS);
      setErr('Wrong admin password.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#1e293b', borderRadius: 16, padding: 40, width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🛡️</div>
          <div style={{ color: 'white', fontWeight: 900, fontSize: '1.3rem' }}>ETOH Admin</div>
          <div style={{ color: '#94a3b8', fontSize: '.85rem', marginTop: 4 }}>Enter the admin password to continue</div>
        </div>
        {err && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: '.88rem', marginBottom: 16 }}>⚠️ {err}</div>}
        <form onSubmit={submit}>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Admin password"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #334155', background: '#0f172a', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
            autoFocus
          />
          <button disabled={loading} style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
            {loading ? 'Checking…' : '🔑 Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Dashboard section ─────────────────────────────────────────────── */
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    adminFetch('/stats').then(setStats);
    adminFetch('/orders').then(setOrders);
  }, []);

  return (
    <div>
      <h2 style={sh}>Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Users"    value={stats?.users}    icon="👤" color="#6366f1" />
        <StatCard label="Stands"   value={stats?.stands}   icon="🏪" color="#f59e0b" />
        <StatCard label="Products" value={stats?.products} icon="🛍️" color="#10b981" />
        <StatCard label="Reels"    value={stats?.reels}    icon="🎬" color="#ef4444" />
        <StatCard label="Orders"   value={stats?.orders}   icon="🛵" color="#3b82f6" />
      </div>

      <h3 style={{ fontWeight: 800, marginBottom: 12, color: '#0f172a' }}>Recent Orders</h3>
      <div style={tableWrap}>
        <table style={tbl}>
          <thead><tr>{['Order ID','Product','Vendor','Buyer','City / Quarter','Landmark','Date'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {orders.slice(0, 20).map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={td}>#{o.id}</td>
                <td style={td}>{o.product_name}</td>
                <td style={td}>{o.vendor_name}</td>
                <td style={td}>{o.buyer_name}</td>
                <td style={td}>{o.target_city} / {o.target_quarter}</td>
                <td style={td}>{o.near_landmark}</td>
                <td style={td}>{new Date(o.order_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Products section ──────────────────────────────────────────────── */
function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch]     = useState('');
  const [cat, setCat]           = useState('');
  const [editing, setEditing]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const imgRef  = useRef();
  const vidRef  = useRef();
  const [imgFile, setImgFile]   = useState(null);
  const [vidFile, setVidFile]   = useState(null);

  const load = () => {
    setLoading(true);
    adminFetch(`/products?search=${encodeURIComponent(search)}&category=${cat}`)
      .then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, cat]);

  async function saveEdit(e) {
    e.preventDefault();
    setSaving(true); setMsg('');
    const fd = new FormData();
    fd.append('product_name', editing.product_name);
    fd.append('price_cfa',    editing.price_cfa);
    fd.append('category',     editing.category);
    if (imgFile) fd.append('image', imgFile);
    if (vidFile) fd.append('video', vidFile);
    try {
      await adminFetch(`/products/${editing.id}`, { method: 'PUT', body: fd });
      setMsg('✅ Product updated!');
      setImgFile(null); setVidFile(null);
      load();
    } catch (err) { setMsg('❌ ' + err.message); }
    finally { setSaving(false); }
  }

  async function del(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await adminFetch(`/products/${id}`, { method: 'DELETE' });
    setProducts((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div>
      <h2 style={sh}>Products ({products.length})</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input style={si} placeholder="🔍 Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={{ ...si, maxWidth: 180 }} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading…</div> : (
        <div style={tableWrap}>
          <table style={tbl}>
            <thead><tr>{['Image','Name','Category','Price (CFA)','Stand','City','Actions'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={td}>
                    {p.image_path
                      ? <img src={p.image_path} alt="" style={{ width:48, height:48, objectFit:'cover', borderRadius:6, background:'#f3f4f6' }} onError={(e)=>{ e.target.style.display='none'; }} />
                      : <div style={{ width:48, height:48, background:'#f1f5f9', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>📦</div>}
                  </td>
                  <td style={{ ...td, fontWeight:600, maxWidth:180 }}>{p.product_name}</td>
                  <td style={td}><span style={badge}>{p.category}</span></td>
                  <td style={{ ...td, fontWeight:700 }}>{fmtPrice(p.price_cfa)} CFA</td>
                  <td style={td}>{p.vendor_name || '—'}</td>
                  <td style={td}>{p.city || '—'}</td>
                  <td style={td}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button style={btnEdit} onClick={() => { setEditing({ ...p }); setMsg(''); setImgFile(null); setVidFile(null); }}>✏️ Edit</button>
                      <button style={btnDel}  onClick={() => del(p.id, p.product_name)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div style={modalOverlay} onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div style={modal}>
            <div style={modalHead}>
              <span>✏️ Edit Product #{editing.id}</span>
              <button style={closeBtn} onClick={() => setEditing(null)}>✕</button>
            </div>
            {msg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:14, background: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b', fontSize:'.88rem' }}>{msg}</div>}
            <form onSubmit={saveEdit}>
              <div style={fg}>
                <label style={fl}>Product Name</label>
                <input style={fi} value={editing.product_name} onChange={(e) => setEditing((x) => ({ ...x, product_name: e.target.value }))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div style={fg}>
                  <label style={fl}>Price (CFA)</label>
                  <input style={fi} type="number" value={editing.price_cfa} onChange={(e) => setEditing((x) => ({ ...x, price_cfa: e.target.value }))} />
                </div>
                <div style={fg}>
                  <label style={fl}>Category</label>
                  <select style={fi} value={editing.category} onChange={(e) => setEditing((x) => ({ ...x, category: e.target.value }))}>
                    {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Current image preview */}
              {editing.image_path && (
                <div style={fg}>
                  <label style={fl}>Current Image</label>
                  <img src={editing.image_path} alt="" style={{ width:'100%', height:140, objectFit:'cover', borderRadius:8 }} onError={(e)=>{e.target.style.display='none';}} />
                </div>
              )}

              <div style={fg}>
                <label style={fl}>Replace Image</label>
                <div style={uploadArea} onClick={() => imgRef.current.click()}>
                  <input ref={imgRef} type="file" accept="image/*" style={{ display:'none' }} onChange={(e) => setImgFile(e.target.files[0])} />
                  <span style={{ fontSize:'1.3rem' }}>🖼️</span>
                  <span style={{ fontSize:'.85rem', color:'#64748b' }}>{imgFile ? `✅ ${imgFile.name}` : 'Click to upload new image'}</span>
                </div>
              </div>

              <div style={fg}>
                <label style={fl}>Replace Video</label>
                <div style={uploadArea} onClick={() => vidRef.current.click()}>
                  <input ref={vidRef} type="file" accept="video/*" style={{ display:'none' }} onChange={(e) => setVidFile(e.target.files[0])} />
                  <span style={{ fontSize:'1.3rem' }}>🎬</span>
                  <span style={{ fontSize:'.85rem', color:'#64748b' }}>{vidFile ? `✅ ${vidFile.name}` : 'Click to upload product video'}</span>
                </div>
              </div>

              <div style={{ display:'flex', gap:10, marginTop:8 }}>
                <button type="submit" disabled={saving} style={{ ...btnPrimary, flex:1 }}>{saving ? 'Saving…' : '✅ Save Changes'}</button>
                <button type="button" style={btnSecondary} onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reels section ─────────────────────────────────────────────────── */
function Reels() {
  const [reels,    setReels]    = useState([]);
  const [stands,   setStands]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ title:'', description:'', stand_id:'' });
  const [vidFile,  setVidFile]  = useState(null);
  const [editing,  setEditing]  = useState(null);
  const [submitting,setSub]     = useState(false);
  const [msg, setMsg]           = useState('');
  const vidRef = useRef();

  const load = () => {
    setLoading(true);
    Promise.all([adminFetch('/reels'), adminFetch('/stands-list')])
      .then(([r, s]) => { setReels(r); setStands(s); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function upload(e) {
    e.preventDefault();
    if (!vidFile || !form.title) { setMsg('❌ Title and video are required.'); return; }
    setSub(true); setMsg('');
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    if (form.stand_id) fd.append('stand_id', form.stand_id);
    fd.append('user_id', '1');
    fd.append('video', vidFile);
    try {
      await adminFetch('/reels', { method:'POST', body: fd });
      setMsg('✅ Reel uploaded!');
      setForm({ title:'', description:'', stand_id:'' });
      setVidFile(null);
      load();
    } catch (err) { setMsg('❌ ' + err.message); }
    finally { setSub(false); }
  }

  async function saveEdit(e) {
    e.preventDefault();
    setSub(true);
    try {
      await adminFetch(`/reels/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editing.title, description: editing.description }),
      });
      setEditing(null); load();
    } catch (err) { alert(err.message); }
    finally { setSub(false); }
  }

  async function del(id, title) {
    if (!window.confirm(`Delete reel "${title}"?`)) return;
    await adminFetch(`/reels/${id}`, { method:'DELETE' });
    setReels((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h2 style={{ ...sh, margin:0 }}>Market Buzz Reels ({reels.length})</h2>
        <button style={btnPrimary} onClick={() => { setShowForm((s) => !s); setMsg(''); }}>
          {showForm ? '✕ Cancel' : '+ Upload New Reel'}
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div style={{ background:'#f8fafc', border:'2px dashed #e2e8f0', borderRadius:12, padding:24, marginBottom:24 }}>
          <div style={{ fontWeight:800, marginBottom:16, color:'#0f172a' }}>🎬 Upload New Video Reel</div>
          {msg && <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:14, background: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b', fontSize:'.88rem' }}>{msg}</div>}
          <form onSubmit={upload}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div style={fg}>
                <label style={fl}>Title *</label>
                <input style={fi} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Reel title..." required />
              </div>
              <div style={fg}>
                <label style={fl}>Link to Stand</label>
                <select style={fi} value={form.stand_id} onChange={(e) => setForm((f) => ({ ...f, stand_id: e.target.value }))}>
                  <option value="">-- No stand --</option>
                  {stands.map((s) => <option key={s.id} value={s.id}>{s.vendor_name} ({s.city})</option>)}
                </select>
              </div>
            </div>
            <div style={fg}>
              <label style={fl}>Caption / Description</label>
              <textarea style={{ ...fi, height:70, resize:'vertical' }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What's in this video?" />
            </div>
            <div style={fg}>
              <label style={fl}>Video File * (MP4, MOV, WebM — max 200MB)</label>
              <div style={uploadArea} onClick={() => vidRef.current.click()}>
                <input ref={vidRef} type="file" accept="video/*" style={{ display:'none' }} onChange={(e) => setVidFile(e.target.files[0])} />
                <span style={{ fontSize:'1.5rem' }}>🎬</span>
                <span style={{ color:'#64748b', fontSize:'.88rem' }}>{vidFile ? `✅ ${vidFile.name}` : 'Click to select video file'}</span>
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ ...btnPrimary, padding:'11px 24px' }}>
              {submitting ? 'Uploading…' : '🚀 Upload Reel'}
            </button>
          </form>
        </div>
      )}

      {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading…</div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {reels.map((r) => (
            <div key={r.id} style={{ background:'white', borderRadius:12, overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,.08)', border:'1px solid #f1f5f9' }}>
              <div style={{ position:'relative', background:'#111', height:160 }}>
                <video src={r.media_path} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.85 }} muted />
                <div style={{ position:'absolute', bottom:8, left:8, background:'rgba(0,0,0,.65)', color:'white', borderRadius:6, padding:'3px 10px', fontSize:'.75rem', fontWeight:700 }}>
                  🎬 Video
                </div>
                <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,.65)', color:'white', borderRadius:6, padding:'3px 10px', fontSize:'.75rem' }}>
                  ❤️ {r.likes}
                </div>
              </div>
              <div style={{ padding:'12px 14px' }}>
                <div style={{ fontWeight:700, fontSize:'.88rem', marginBottom:4, color:'#0f172a', lineHeight:1.35 }}>{r.title}</div>
                <div style={{ fontSize:'.78rem', color:'#64748b', marginBottom:2 }}>By {r.author_name}</div>
                {r.vendor_name && <div style={{ fontSize:'.78rem', color:'#6366f1', marginBottom:10 }}>🏪 {r.vendor_name}</div>}
                <div style={{ fontSize:'.75rem', color:'#94a3b8', marginBottom:10 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                <div style={{ display:'flex', gap:6 }}>
                  <button style={{ ...btnEdit, flex:1, justifyContent:'center' }} onClick={() => setEditing({ ...r })}>✏️ Edit</button>
                  <button style={btnDel} onClick={() => del(r.id, r.title)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {reels.length === 0 && <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:'#94a3b8' }}>No reels yet. Upload one above!</div>}
        </div>
      )}

      {/* Edit reel modal */}
      {editing && (
        <div style={modalOverlay} onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ ...modal, maxWidth:440 }}>
            <div style={modalHead}><span>✏️ Edit Reel #{editing.id}</span><button style={closeBtn} onClick={() => setEditing(null)}>✕</button></div>
            <form onSubmit={saveEdit}>
              <div style={fg}><label style={fl}>Title</label><input style={fi} value={editing.title} onChange={(e) => setEditing((x) => ({ ...x, title: e.target.value }))} /></div>
              <div style={fg}><label style={fl}>Description</label><textarea style={{ ...fi, height:80, resize:'vertical' }} value={editing.description || ''} onChange={(e) => setEditing((x) => ({ ...x, description: e.target.value }))} /></div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" disabled={submitting} style={{ ...btnPrimary, flex:1 }}>{submitting ? 'Saving…' : '✅ Save'}</button>
                <button type="button" style={btnSecondary} onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stands section ────────────────────────────────────────────────── */
function Stands() {
  const [stands, setStands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/stands').then(setStands).finally(() => setLoading(false));
  }, []);

  async function del(id, name) {
    if (!window.confirm(`Delete stand "${name}" and ALL its products?`)) return;
    await adminFetch(`/stands/${id}`, { method: 'DELETE' });
    setStands((s) => s.filter((x) => x.id !== id));
  }

  async function toggleVerify(stand) {
    const next = !stand.is_verified;
    await adminFetch(`/stands/${stand.id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: next }),
    });
    setStands(s => s.map(x => x.id === stand.id ? { ...x, is_verified: next ? 1 : 0 } : x));
  }

  return (
    <div>
      <h2 style={sh}>Stands ({stands.length})</h2>
      {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading…</div> : (
        <div style={tableWrap}>
          <table style={tbl}>
            <thead><tr>{['Stand Name','City','Owner','Email','Products','Joined','Verified','Actions'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {stands.map((s) => (
                <tr key={s.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ ...td, fontWeight:600 }}>
                    {s.vendor_name}
                    {s.is_verified ? <span style={{ marginLeft:6, background:'#d1fae5', color:'#065f46', borderRadius:999, padding:'2px 8px', fontSize:'.72rem', fontWeight:800 }}>🦁 Certified</span> : null}
                  </td>
                  <td style={td}><span style={badge}>{s.city || '—'}</span></td>
                  <td style={td}>{s.owner_name || '—'}</td>
                  <td style={td}>{s.owner_email || '—'}</td>
                  <td style={{ ...td, textAlign:'center', fontWeight:700 }}>{s.product_count}</td>
                  <td style={td}>{new Date(s.creation_date).toLocaleDateString()}</td>
                  <td style={{ ...td, textAlign:'center' }}>
                    {s.is_verified ? '🟢' : '⚪'}
                  </td>
                  <td style={td}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button
                        style={s.is_verified ? { ...btnDel, background:'#fef9c3', color:'#854d0e' } : { ...btnEdit }}
                        onClick={() => toggleVerify(s)}
                      >
                        {s.is_verified ? '✗ Remove' : '✓ Verify'}
                      </button>
                      <button style={btnDel} onClick={() => del(s.id, s.vendor_name)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Users section ─────────────────────────────────────────────────── */
function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/users').then(setUsers).finally(() => setLoading(false));
  }, []);

  async function del(id, name) {
    if (!window.confirm(`Delete user "${name}" and all their data?`)) return;
    await adminFetch(`/users/${id}`, { method: 'DELETE' });
    setUsers((u) => u.filter((x) => x.id !== id));
  }

  return (
    <div>
      <h2 style={sh}>Users ({users.length})</h2>
      {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading…</div> : (
        <div style={tableWrap}>
          <table style={tbl}>
            <thead><tr>{['Avatar','Name','Email','WhatsApp','Stands','Joined','Actions'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={td}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'#6366f1', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'.9rem', overflow:'hidden' }}>
                      {u.profile_picture ? <img src={u.profile_picture} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : u.name.charAt(0).toUpperCase()}
                    </div>
                  </td>
                  <td style={{ ...td, fontWeight:600 }}>{u.name}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>{u.whatsapp || '—'}</td>
                  <td style={{ ...td, textAlign:'center', fontWeight:700 }}>{u.stand_count}</td>
                  <td style={td}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={td}><button style={btnDel} onClick={() => del(u.id, u.name)}>🗑️ Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Shared styles ─────────────────────────────────────────────────── */
const sh = { fontWeight:900, fontSize:'1.25rem', color:'#0f172a', marginBottom:20 };
const tableWrap = { overflowX:'auto', background:'white', borderRadius:12, boxShadow:'0 1px 6px rgba(0,0,0,.08)', border:'1px solid #f1f5f9' };
const tbl = { width:'100%', borderCollapse:'collapse', fontSize:'.85rem' };
const th  = { padding:'12px 14px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:'.78rem', textTransform:'uppercase', letterSpacing:'.4px', background:'#f8fafc', borderBottom:'2px solid #e2e8f0', whiteSpace:'nowrap' };
const td  = { padding:'12px 14px', color:'#0f172a', verticalAlign:'middle' };
const badge = { background:'#eff6ff', color:'#1d4ed8', borderRadius:999, padding:'3px 10px', fontSize:'.75rem', fontWeight:700 };
const si  = { padding:'9px 13px', border:'2px solid #e2e8f0', borderRadius:8, fontSize:'.88rem', outline:'none', minWidth:180 };
const fg  = { marginBottom:14 };
const fl  = { display:'block', fontWeight:600, fontSize:'.85rem', color:'#374151', marginBottom:5 };
const fi  = { width:'100%', padding:'9px 12px', border:'2px solid #e2e8f0', borderRadius:8, fontSize:'.9rem', outline:'none', boxSizing:'border-box', transition:'border-color .2s', fontFamily:'inherit' };
const uploadArea = { border:'2px dashed #e2e8f0', borderRadius:8, padding:'16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', background:'#f8fafc' };
const modalOverlay = { position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(4px)' };
const modal = { background:'white', borderRadius:16, padding:28, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,.2)' };
const modalHead = { display:'flex', alignItems:'center', justifyContent:'space-between', fontWeight:800, fontSize:'1rem', marginBottom:20, paddingBottom:14, borderBottom:'1px solid #f1f5f9' };
const closeBtn = { background:'#f1f5f9', border:'none', borderRadius:'50%', width:30, height:30, cursor:'pointer', fontSize:'.9rem', display:'flex', alignItems:'center', justifyContent:'center' };
const btnPrimary   = { background:'#6366f1', color:'white', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:'.85rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 };
const btnSecondary = { background:'#f1f5f9', color:'#374151', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:'.85rem', cursor:'pointer' };
const btnEdit = { background:'#eff6ff', color:'#1d4ed8', border:'none', borderRadius:6, padding:'6px 12px', fontWeight:700, fontSize:'.8rem', cursor:'pointer', display:'flex', alignItems:'center', gap:4 };
const btnDel  = { background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:6, padding:'6px 12px', fontWeight:700, fontSize:'.8rem', cursor:'pointer' };

const NAV = [
  { id:'dashboard', label:'Dashboard',  icon:'📊' },
  { id:'products',  label:'Products',   icon:'🛍️' },
  { id:'reels',     label:'Reels',      icon:'🎬' },
  { id:'stands',    label:'Stands',     icon:'🏪' },
  { id:'users',     label:'Users',      icon:'👤' },
];

/* ── Main Admin App ────────────────────────────────────────────────── */
export default function Admin() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(ADMIN_KEY_SS));
  const [page,   setPage]   = useState('dashboard');

  if (!authed) return <AdminLogin onAuth={(pw) => { sessionStorage.setItem(ADMIN_KEY_SS, pw); setAuthed(true); }} />;

  const PAGES = { dashboard: <Dashboard />, products: <Products />, reels: <Reels />, stands: <Stands />, users: <Users /> };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f8fafc', fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width:220, background:'#0f172a', display:'flex', flexDirection:'column', flexShrink:0 }}>
        {/* Logo */}
        <div style={{ padding:'24px 20px', borderBottom:'1px solid #1e293b' }}>
          <div style={{ color:'white', fontWeight:900, fontSize:'1.1rem' }}>🛡️ ETOH Admin</div>
          <div style={{ color:'#64748b', fontSize:'.75rem', marginTop:3 }}>Control Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ padding:'12px 0', flex:1 }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'10px 20px', background: page === n.id ? '#1e293b' : 'transparent',
              border:'none', cursor:'pointer', textAlign:'left',
              color: page === n.id ? 'white' : '#94a3b8',
              fontWeight: page === n.id ? 700 : 500,
              fontSize:'.88rem',
              borderLeft: page === n.id ? '3px solid #6366f1' : '3px solid transparent',
              transition:'all .15s',
            }}>
              <span style={{ fontSize:'1rem' }}>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid #1e293b' }}>
          <a href="/" target="_blank" style={{ color:'#64748b', fontSize:'.78rem', textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
            ↗ View Live Site
          </a>
          <button onClick={() => { sessionStorage.removeItem(ADMIN_KEY_SS); setAuthed(false); }}
            style={{ marginTop:10, background:'transparent', border:'none', color:'#ef4444', fontSize:'.78rem', cursor:'pointer', padding:0, fontWeight:600 }}>
            ↩ Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1, overflowY:'auto' }}>
        <div style={{ padding:'28px 32px', maxWidth:1100 }}>
          {PAGES[page]}
        </div>
      </main>
    </div>
  );
}
