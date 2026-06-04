import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, createPost, deletePost, likePost, getMyStands } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

/* ── Video Slide ───────────────────────────────────────── */
function VideoSlide({ post, onBecomeActive }) {
  const videoRef  = useRef(null);
  const [paused,   setPaused]   = useState(false);
  const [muted,    setMuted]    = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        video.play().catch(() => {}); setPaused(false); onBecomeActive(post);
      } else { video.pause(); video.currentTime = 0; setProgress(0); }
    }, { threshold: 0.6 });
    const onTimeUpdate = () => { if (video.duration) setProgress((video.currentTime / video.duration) * 100); };
    observer.observe(video);
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => { observer.disconnect(); video.removeEventListener('timeupdate', onTimeUpdate); };
  }, [post, onBecomeActive]);

  function togglePlay() {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPaused(false); } else { v.pause(); setPaused(true); }
  }
  function toggleMute() { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); }

  return (
    <div className="buzz-video-wrap">
      <div className="reel-progress-bar"><div className="reel-progress-fill" style={{ width: `${progress}%` }} /></div>
      <video ref={videoRef} className="buzz-video" src={post.media_path} muted={muted} loop playsInline onClick={togglePlay} />
      {paused && <div className="reel-pause-icon" onClick={togglePlay}>▶</div>}
      <button className="buzz-mute-btn" onClick={toggleMute}>{muted ? '🔇' : '🔊'}</button>
    </div>
  );
}

/* ── Left Info Panel ────────────────────────────────────── */
function LeftPanel({ post, t }) {
  const initial = post?.author_name?.charAt(0).toUpperCase() || '?';
  return (
    <div className="buzz-left">
      {post ? (
        <div className="buzz-left-inner" key={post.id}>
          <div className="buzz-vendor-row">
            <div className="buzz-vendor-avatar">
              {post.author_pic ? <img src={post.author_pic} alt="" /> : initial}
            </div>
            <div>
              <div className="buzz-vendor-name" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {post.author_name}
                {post.is_verified ? <span className="vendor-verified" style={{ fontSize: '.65rem' }}>✓</span> : null}
              </div>
              {post.vendor_name && <div className="buzz-vendor-stand">🏪 {post.vendor_name}</div>}
            </div>
          </div>

          {post.stand_id && (
            <Link to={`/stands/${post.stand_id}`} className="buzz-visit-btn">{t('visitStand')}</Link>
          )}

          <div className="buzz-divider" />
          <div className="buzz-post-title">{post.title}</div>
          {post.description && <div className="buzz-post-desc">{post.description}</div>}

          <div className="buzz-left-footer">
            <div className="buzz-footer-label">{t('marketBuzzTitle')}</div>
            <p>{t('shortClips')}</p>
          </div>
        </div>
      ) : (
        <div className="buzz-left-inner">
          <div className="buzz-left-placeholder">
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📢</div>
            <div>{t('scrollToReel')}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Right Actions Panel ────────────────────────────────── */
function RightActions({ post, user, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post?.likes || 0);

  async function handleLike() {
    if (!post || liked) return;
    setLiked(true); setLikes(l => l + 1);
    try { await likePost(post.id); } catch {}
  }

  if (!post) return <div className="buzz-right" />;

  return (
    <div className="buzz-right">
      <button className={`buzz-action-btn${liked ? ' liked' : ''}`} onClick={handleLike}>
        <span className="buzz-action-icon">{liked ? '❤️' : '🤍'}</span>
        <span className="buzz-action-label">{likes}</span>
      </button>
      {post.stand_id && (
        <Link to={`/stands/${post.stand_id}`} className="buzz-action-btn">
          <span className="buzz-action-icon">🛒</span>
          <span className="buzz-action-label">Shop</span>
        </Link>
      )}
      {user && post.user_id === user.id && (
        <button className="buzz-action-btn" style={{ color: '#ff6b6b' }} onClick={() => onDelete(post.id)}>
          <span className="buzz-action-icon">🗑️</span>
          <span className="buzz-action-label">Del</span>
        </button>
      )}
    </div>
  );
}

/* ── Upload Modal ───────────────────────────────────────── */
function UploadModal({ onClose, onUploaded, myStands, t }) {
  const [form, setForm]       = useState({ title: '', description: '', stand_id: '' });
  const [videoFile, setVideo] = useState(null);
  const [submitting, setSub]  = useState(false);
  const [error, setError]     = useState('');
  const inputRef = useRef();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!videoFile)         { setError('Please select a video file.'); return; }
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSub(true); setError('');
    const fd = new FormData();
    fd.append('title', form.title); fd.append('description', form.description);
    if (form.stand_id) fd.append('stand_id', form.stand_id);
    fd.append('media', videoFile);
    try { await createPost(fd); onUploaded(); onClose(); }
    catch (err) { setError(err.response?.data?.error || 'Upload failed.'); }
    finally { setSub(false); }
  }

  return (
    <div className="reel-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="reel-modal">
        <div className="reel-modal-header">
          <span>{t('postAReelTitle')}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,255,255,.8)' }}>{t('titleLabel')}</label>
            <input className="form-input reel-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t('titlePlaceholder')} required />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,255,255,.8)' }}>{t('captionLabel')}</label>
            <textarea className="form-textarea reel-input" style={{ minHeight: 60 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={t('captionPlaceholder')} />
          </div>
          {myStands.length > 0 && (
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,.8)' }}>{t('linkStand')}</label>
              <select className="form-select reel-input" value={form.stand_id} onChange={e => setForm(f => ({ ...f, stand_id: e.target.value }))}>
                <option value="">{t('noStandLink')}</option>
                {myStands.map(s => <option key={s.id} value={s.id}>{s.vendor_name}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,255,255,.8)' }}>{t('videoFileLabel')}</label>
            <div className="file-upload-area" style={{ borderColor: '#555', background: '#2a2a2a', color: 'white' }} onClick={() => inputRef.current.click()}>
              <input ref={inputRef} type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} />
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>🎬</div>
              <div style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.6)' }}>{t('clickToSelect')}</div>
              {videoFile && <div style={{ marginTop: 8, fontSize: '.85rem', color: '#4ade80', fontWeight: 600 }}>✅ {videoFile.name}</div>}
            </div>
          </div>
          <button className="btn btn-primary btn-full" disabled={submitting} style={{ padding: 13 }}>
            {submitting ? t('publishing') : t('publishReel')}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function Reels() {
  const { user }  = useAuth();
  const { t }     = useLang();
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [myStands,   setMyStands]   = useState([]);
  const [activePost, setActivePost] = useState(null);

  const loadPosts = () =>
    getPosts()
      .then(r => {
        const videos = r.data.filter(p => p.media_type === 'video');
        setPosts(videos);
        if (videos.length > 0) setActivePost(videos[0]);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    loadPosts();
    if (user) getMyStands().then(r => setMyStands(r.data));
  }, [user]);

  const handleBecomeActive = useCallback(post => setActivePost(post), []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this reel?')) return;
    await deletePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div className="buzz-page">
      <div className="buzz-topbar">
        <span className="buzz-topbar-title">{t('marketBuzzTitle')}</span>
        {user
          ? <button className="reels-upload-btn" onClick={() => setShowForm(true)}>{t('postReel')}</button>
          : <Link to="/login" className="reels-upload-btn">{t('logInToPost')}</Link>}
      </div>

      {loading ? (
        <div className="reels-empty"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="reels-empty">
          <div style={{ fontSize: '4rem', marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🎬</div>
          <h3>{t('noVideoReels')}</h3>
          <p>{t('beFirstVendor')}</p>
          {user
            ? <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>{t('postFirstReel')}</button>
            : <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>{t('logInToPost')}</Link>}
        </div>
      ) : (
        <div className="buzz-layout">
          <LeftPanel post={activePost} t={t} />

          <div className="buzz-center">
            {posts.map(post => (
              <div key={post.id} className="buzz-slot">
                <VideoSlide post={post} onBecomeActive={handleBecomeActive} />
              </div>
            ))}
            <div className="buzz-slot buzz-end-card">
              <div style={{ fontSize: '3rem', animation: 'bounce .6s ease', marginBottom: 12 }}>🎬</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 6 }}>{t('allCaughtUp')}</div>
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.88rem' }}>{t('checkBackLater')}</div>
              {user && <button className="reels-upload-btn" style={{ marginTop: 20 }} onClick={() => setShowForm(true)}>{t('postYourReel')}</button>}
            </div>
          </div>

          <RightActions key={activePost?.id} post={activePost} user={user} onDelete={handleDelete} />
        </div>
      )}

      {showForm && (
        <UploadModal myStands={myStands} onClose={() => setShowForm(false)} t={t}
          onUploaded={() => { setLoading(true); loadPosts(); }} />
      )}
    </div>
  );
}
