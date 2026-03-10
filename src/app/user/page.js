'use client'
// ════════════════════════════════════════════════════════════════════════════
//  UserDashboard.jsx  — complete user panel (single file)
//
//  Covers ALL /api/users routes:
//  GET  /api/users/profile
//  PUT  /api/users/profile
//  GET  /api/users/mechanics
//  GET  /api/users/mechanics/:mechanicId/reviews
//  POST /api/users/reviews
//  GET  /api/users/my-reviews
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api/users';

/* ── tiny fetch helper ── */
const useApi = (accessToken) =>
  useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Request failed');
    return data;
  }, [accessToken]);

/* ── star rating component ── */
const Stars = ({ value, onChange, readonly = false }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <span
        key={n}
        onClick={() => !readonly && onChange && onChange(n)}
        style={{
          fontSize: readonly ? '1rem' : '1.4rem',
          cursor: readonly ? 'default' : 'pointer',
          color: n <= value ? '#f59e0b' : 'rgba(255,255,255,.15)',
          transition: 'color .15s',
          userSelect: 'none',
        }}
      >★</span>
    ))}
  </div>
);

/* ── toast ── */
const Toast = ({ msg, onClose }) => {
  if (!msg.text) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      padding: '0.8rem 1.2rem', borderRadius: 12, fontSize: '.88rem', fontWeight: 600,
      cursor: 'pointer', animation: 'toastIn .3s ease',
      background: msg.type === 'error' ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.15)',
      color: msg.type === 'error' ? '#fca5a5' : '#6ee7b7',
      border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`,
      backdropFilter: 'blur(12px)',
    }}>
      {msg.type === 'error' ? '❌' : '✅'} {msg.text}
    </div>
  );
};

/* ── spinner ── */
const Spin = () => (
  <span style={{
    display: 'inline-block', width: 16, height: 16,
    border: '2px solid rgba(255,255,255,.2)', borderTopColor: '#fff',
    borderRadius: '50%', animation: 'rot .6s linear infinite', verticalAlign: 'middle',
  }} />
);

/* ════════════════════════ PAGES ════════════════════════ */

/* 1 ── Profile page */
const ProfilePage = ({ api, initialUser, onUpdate, setToast }) => {
  const [form, setForm] = useState({
    username: initialUser?.username || '',
    fullName: initialUser?.fullName || '',
    email:    initialUser?.email    || '',
    bio:      initialUser?.profileData?.bio   || '',
    phone:    initialUser?.profileData?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          username:    form.username,
          fullName:    form.fullName,
          email:       form.email,
          profileData: { bio: form.bio, phone: form.phone },
        }),
      });
      onUpdate(res.data);
      setToast({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح!' });
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="page">
      <div className="page-hdr">
        <div className="page-title">الملف الشخصي</div>
        <div className="page-sub">عدّل بياناتك الشخصية</div>
      </div>

      <div className="card-glass">
        <div className="profile-avatar-row">
          <div className="big-avatar">{initialUser?.role === 'mechanic' ? '🔧' : '👤'}</div>
          <div>
            <div className="pname">{initialUser?.fullName}</div>
            <div className="pemail">@{initialUser?.username}</div>
            <div className="prole-badge">{initialUser?.role}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="fg">
            <label className="lbl">الاسم الكامل</label>
            <div className="inp-wrap"><span className="ico">👤</span>
              <input className="inp" value={form.fullName} onChange={f('fullName')} placeholder="الاسم الكامل" /></div>
          </div>
          <div className="fg">
            <label className="lbl">اسم المستخدم</label>
            <div className="inp-wrap"><span className="ico">🪪</span>
              <input className="inp" value={form.username} onChange={f('username')} placeholder="username" /></div>
          </div>
          <div className="fg full">
            <label className="lbl">البريد الإلكتروني</label>
            <div className="inp-wrap"><span className="ico">✉️</span>
              <input className="inp" type="email" value={form.email} onChange={f('email')} placeholder="email@example.com" /></div>
          </div>
          <div className="fg">
            <label className="lbl">رقم الهاتف</label>
            <div className="inp-wrap"><span className="ico">📞</span>
              <input className="inp" value={form.phone} onChange={f('phone')} placeholder="+966 5x xxx xxxx" /></div>
          </div>
          <div className="fg full">
            <label className="lbl">نبذة شخصية</label>
            <textarea className="inp" rows={3} value={form.bio} onChange={f('bio')} placeholder="اكتب نبذة عن نفسك..." style={{ resize: 'vertical', paddingTop: '.75rem' }} />
          </div>
          <div className="fg full">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><Spin /> جاري الحفظ...</> : '💾 حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* 2 ── Mechanics list page */
const MechanicsPage = ({ api, setToast, onSelectMechanic }) => {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    api('/mechanics')
      .then(r => setMechanics(r.data))
      .catch(err => setToast({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = mechanics.filter(m =>
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-hdr">
        <div className="page-title">الميكانيكيون</div>
        <div className="page-sub">{mechanics.length} ميكانيكي متاح</div>
      </div>

      <div className="inp-wrap" style={{ marginBottom: '1.2rem' }}>
        <span className="ico">🔍</span>
        <input className="inp" placeholder="ابحث باسم الميكانيكي..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="center-msg"><Spin /> جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="center-msg">لا توجد نتائج</div>
      ) : (
        <div className="mech-grid">
          {filtered.map(m => (
            <div key={m._id} className="mech-card">
              <div className="mech-avatar">🔧</div>
              <div className="mech-name">{m.fullName}</div>
              <div className="mech-user">@{m.username}</div>
              {m.profileData?.bio && <div className="mech-bio">{m.profileData.bio}</div>}
              {m.profileData?.phone && <div className="mech-phone">📞 {m.profileData.phone}</div>}
              {m.location && (
                <div className="mech-loc">
                  📍 {m.location.lat?.toFixed(4)}, {m.location.lng?.toFixed(4)}
                </div>
              )}
              <div className="mech-actions">
                <button className="btn-sm btn-outline" onClick={() => onSelectMechanic(m, 'reviews')}>
                  ⭐ التقييمات
                </button>
                <button className="btn-sm btn-primary-sm" onClick={() => onSelectMechanic(m, 'write')}>
                  ✍️ قيّم
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* 3 ── Mechanic Reviews page */
const MechanicReviewsPage = ({ api, mechanic, setToast, onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api(`/mechanics/${mechanic._id}/reviews`)
      .then(r => setReviews(r.data))
      .catch(err => setToast({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, [api, mechanic._id]);

  useEffect(() => { load(); }, [load]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← رجوع</button>
      <div className="page-hdr">
        <div className="page-title">تقييمات {mechanic.fullName}</div>
        {avgRating && (
          <div className="avg-row">
            <Stars value={Math.round(avgRating)} readonly />
            <span className="avg-num">{avgRating} / 5</span>
            <span className="rev-count">({reviews.length} تقييم)</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="center-msg"><Spin /> جاري التحميل...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>💬</div>
          <div>لا توجد تقييمات بعد</div>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(r => (
            <div key={r._id} className="review-card">
              <div className="review-top">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">👤</div>
                  <div>
                    <div className="reviewer-name">{r.userId?.fullName || 'مستخدم'}</div>
                    <div className="reviewer-user">@{r.userId?.username}</div>
                  </div>
                </div>
                <div className="review-right">
                  <Stars value={r.rating} readonly />
                  <div className="review-date">{new Date(r.createdAt).toLocaleDateString('ar')}</div>
                </div>
              </div>
              <div className="review-comment">{r.comment}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* 4 ── Write Review page */
const WriteReviewPage = ({ api, mechanic, setToast, onBack }) => {
  const [form, setForm]     = useState({ rating: 0, comment: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { setToast({ type: 'error', text: 'اختر تقييماً من 1 إلى 5.' }); return; }
    try {
      setLoading(true);
      await api('/reviews', {
        method: 'POST',
        body: JSON.stringify({ mechanicId: mechanic._id, rating: form.rating, comment: form.comment }),
      });
      setToast({ type: 'success', text: 'تم إرسال التقييم بنجاح!' });
      onBack();
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← رجوع</button>
      <div className="page-hdr">
        <div className="page-title">تقييم {mechanic.fullName}</div>
        <div className="page-sub">شاركنا تجربتك مع هذا الميكانيكي</div>
      </div>

      <div className="card-glass" style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="mech-avatar" style={{ fontSize: '1.5rem', width: 52, height: 52 }}>🔧</div>
          <div>
            <div className="mech-name">{mechanic.fullName}</div>
            <div className="mech-user">@{mechanic.username}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="fg full">
            <label className="lbl">التقييم</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginTop: '.3rem' }}>
              <Stars value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} />
              {form.rating > 0 && <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.1rem' }}>{form.rating}/5</span>}
            </div>
          </div>

          <div className="fg full">
            <label className="lbl">تعليقك ({form.comment.length}/1000)</label>
            <textarea className="inp" rows={5} required maxLength={1000}
              value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
              placeholder="اكتب تجربتك مع هذا الميكانيكي..."
              style={{ resize: 'vertical', paddingTop: '.75rem' }} />
          </div>

          <div className="fg full">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><Spin /> جاري الإرسال...</> : '🌟 إرسال التقييم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* 5 ── My Reviews page */
const MyReviewsPage = ({ api, setToast }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/my-reviews')
      .then(r => setReviews(r.data))
      .catch(err => setToast({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-hdr">
        <div className="page-title">تقييماتي</div>
        <div className="page-sub">{reviews.length} تقييم قدّمته</div>
      </div>

      {loading ? (
        <div className="center-msg"><Spin /> جاري التحميل...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>📋</div>
          <div>لم تقدّم أي تقييمات بعد</div>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(r => (
            <div key={r._id} className="review-card">
              <div className="review-top">
                <div className="reviewer-info">
                  <div className="mech-avatar" style={{ width: 42, height: 42, fontSize: '1.1rem' }}>🔧</div>
                  <div>
                    <div className="reviewer-name">{r.mechanicId?.fullName || 'ميكانيكي'}</div>
                    <div className="reviewer-user">@{r.mechanicId?.username}</div>
                  </div>
                </div>
                <div className="review-right">
                  <Stars value={r.rating} readonly />
                  <div className="review-date">{new Date(r.createdAt).toLocaleDateString('ar')}</div>
                </div>
              </div>
              <div className="review-comment">{r.comment}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ════════════════════ MAIN APP ════════════════════ */
export default function UserDashboard() {
  const [accessToken] = useState(() => localStorage.getItem('accessToken') || '');
  const [user, setUser]     = useState(null);
  const [page, setPage]     = useState('profile'); // profile | mechanics | my-reviews
  const [subPage, setSubPage] = useState(null);    // { type: 'reviews'|'write', mechanic }
  const [toast, setToastState] = useState({ type: '', text: '' });
  const [mounted, setMounted] = useState(false);

  const api = useApi(accessToken);

  const setToast = (msg) => {
    setToastState(msg);
    setTimeout(() => setToastState({ type: '', text: '' }), 3500);
  };

  useEffect(() => {
    setMounted(true);
    if (!accessToken) return;
    api('/profile')
      .then(r => setUser(r.data))
      .catch(() => {});
  }, []);

  const navItems = [
    { key: 'profile',    icon: '👤', label: 'الملف الشخصي' },
    { key: 'mechanics',  icon: '🔧', label: 'الميكانيكيون' },
    { key: 'my-reviews', icon: '⭐', label: 'تقييماتي' },
  ];

  const goPage = (k) => { setPage(k); setSubPage(null); };

  const handleSelectMechanic = (mechanic, type) => {
    setSubPage({ type, mechanic });
  };

  if (!mounted) return null;

  if (!accessToken) {
    return (
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal,sans-serif', color: '#fff', direction: 'rtl', fontSize: '1.1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <div>يجب تسجيل الدخول أولاً</div>
          <div style={{ color: 'rgba(255,255,255,.4)', marginTop: '.5rem', fontSize: '.9rem' }}>لا يوجد accessToken في localStorage</div>
        </div>
      </div>
    );
  }

  /* ── render active page ── */
  const renderPage = () => {
    if (subPage?.type === 'reviews') return (
      <MechanicReviewsPage api={api} mechanic={subPage.mechanic} setToast={setToast}
        onBack={() => setSubPage(null)} />
    );
    if (subPage?.type === 'write') return (
      <WriteReviewPage api={api} mechanic={subPage.mechanic} setToast={setToast}
        onBack={() => setSubPage(null)} />
    );
    if (page === 'profile')    return <ProfilePage    api={api} initialUser={user} onUpdate={setUser} setToast={setToast} />;
    if (page === 'mechanics')  return <MechanicsPage  api={api} setToast={setToast} onSelectMechanic={handleSelectMechanic} />;
    if (page === 'my-reviews') return <MyReviewsPage  api={api} setToast={setToast} />;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Sora:wght@600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        body,html{background:#080810;font-family:'Tajawal',sans-serif;direction:rtl;color:#e2e8f0}

        @keyframes rot{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

        .layout{display:flex;min-height:100vh}

        /* ── sidebar ── */
        .sidebar{
          width:240px;flex-shrink:0;
          background:rgba(255,255,255,.03);
          border-left:1px solid rgba(255,255,255,.07);
          display:flex;flex-direction:column;
          padding:1.5rem 1rem;
          position:sticky;top:0;height:100vh;
          backdrop-filter:blur(20px);
        }
        .sidebar-brand{display:flex;align-items:center;gap:.6rem;margin-bottom:2rem;padding:.3rem .5rem}
        .sb-icon{width:38px;height:38px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
        .sb-name{font-family:'Sora',sans-serif;font-size:1.1rem;font-weight:700;color:#fff}

        .user-mini{background:rgba(255,255,255,.05);border-radius:14px;padding:.85rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:.7rem}
        .um-av{width:38px;height:38px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
        .um-name{font-size:.88rem;font-weight:700;color:#fff;line-height:1.2}
        .um-role{font-size:.72rem;color:rgba(255,255,255,.38)}

        .nav-item{
          display:flex;align-items:center;gap:.7rem;
          padding:.72rem .9rem;border-radius:12px;
          font-size:.92rem;font-weight:500;color:rgba(255,255,255,.45);
          cursor:pointer;transition:all .2s;margin-bottom:.25rem;
          border:none;background:transparent;width:100%;text-align:right;
        }
        .nav-item:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.8)}
        .nav-item.active{background:rgba(14,165,233,.14);color:#38bdf8;font-weight:700;border:1px solid rgba(14,165,233,.22)}
        .nav-ico{font-size:1.1rem;width:22px;text-align:center}

        /* ── main content ── */
        .main{flex:1;overflow-y:auto;padding:2rem}
        .page{animation:up .35s ease}
        .page-hdr{margin-bottom:1.8rem}
        .page-title{font-size:1.6rem;font-weight:900;color:#fff;margin-bottom:.3rem}
        .page-sub{font-size:.9rem;color:rgba(255,255,255,.35)}

        /* ── glass card ── */
        .card-glass{background:rgba(255,255,255,.042);border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:1.8rem;backdrop-filter:blur(16px)}

        /* ── form ── */
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .fg{display:flex;flex-direction:column}
        .fg.full{grid-column:1/-1}
        .lbl{font-size:.8rem;font-weight:600;color:rgba(255,255,255,.4);margin-bottom:.35rem}
        .inp-wrap{position:relative}
        .ico{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:.9rem;opacity:.4;pointer-events:none}
        .inp{width:100%;padding:.78rem 2.5rem .78rem .9rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);border-radius:11px;color:#fff;font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none;transition:border-color .2s,background .2s,box-shadow .2s;text-align:right}
        .inp::placeholder{color:rgba(255,255,255,.2)}
        .inp:focus{border-color:#0ea5e9;background:rgba(14,165,233,.08);box-shadow:0 0 0 3px rgba(14,165,233,.15)}
        textarea.inp{padding-right:.9rem}

        /* ── buttons ── */
        .btn-primary{padding:.82rem 1.4rem;background:linear-gradient(135deg,#0ea5e9,#6366f1);border:none;border-radius:12px;color:#fff;font-family:'Tajawal',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;box-shadow:0 4px 18px rgba(14,165,233,.35);width:100%}
        .btn-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 24px rgba(14,165,233,.5)}
        .btn-primary:disabled{opacity:.55;cursor:not-allowed}
        .btn-back{display:inline-flex;align-items:center;gap:.4rem;padding:.45rem .9rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:rgba(255,255,255,.6);font-family:'Tajawal',sans-serif;font-size:.85rem;cursor:pointer;margin-bottom:1.2rem;transition:all .2s}
        .btn-back:hover{background:rgba(255,255,255,.12);color:#fff}
        .btn-sm{padding:.42rem .9rem;border-radius:9px;font-family:'Tajawal',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;border:none}
        .btn-outline{background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.12)}
        .btn-outline:hover{background:rgba(255,255,255,.12);color:#fff}
        .btn-primary-sm{background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;box-shadow:0 2px 10px rgba(14,165,233,.3)}
        .btn-primary-sm:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(14,165,233,.45)}

        /* ── profile ── */
        .profile-avatar-row{display:flex;align-items:center;gap:1.2rem;margin-bottom:1.8rem;padding-bottom:1.4rem;border-bottom:1px solid rgba(255,255,255,.07)}
        .big-avatar{width:64px;height:64px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0}
        .pname{font-size:1.15rem;font-weight:700;color:#fff}
        .pemail{font-size:.83rem;color:rgba(255,255,255,.4);margin:.2rem 0}
        .prole-badge{display:inline-block;font-size:.7rem;font-weight:700;padding:.18rem .55rem;border-radius:20px;background:rgba(14,165,233,.18);color:#38bdf8;letter-spacing:.4px}

        /* ── mechanics grid ── */
        .mech-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
        .mech-card{background:rgba(255,255,255,.042);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:1.3rem;transition:border-color .2s,transform .2s;backdrop-filter:blur(12px)}
        .mech-card:hover{border-color:rgba(14,165,233,.3);transform:translateY(-2px)}
        .mech-avatar{width:48px;height:48px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:.8rem}
        .mech-name{font-size:1rem;font-weight:700;color:#fff;margin-bottom:.15rem}
        .mech-user{font-size:.8rem;color:rgba(255,255,255,.38);margin-bottom:.5rem}
        .mech-bio{font-size:.82rem;color:rgba(255,255,255,.5);margin-bottom:.4rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .mech-phone,.mech-loc{font-size:.78rem;color:rgba(255,255,255,.35);margin-bottom:.25rem}
        .mech-actions{display:flex;gap:.5rem;margin-top:.9rem}

        /* ── reviews ── */
        .avg-row{display:flex;align-items:center;gap:.6rem;margin-top:.5rem}
        .avg-num{font-size:1.2rem;font-weight:900;color:#f59e0b}
        .rev-count{font-size:.85rem;color:rgba(255,255,255,.35)}
        .reviews-list{display:flex;flex-direction:column;gap:.9rem}
        .review-card{background:rgba(255,255,255,.042);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:1.2rem}
        .review-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.8rem}
        .reviewer-info{display:flex;align-items:center;gap:.7rem}
        .reviewer-avatar{width:38px;height:38px;background:linear-gradient(135deg,#64748b,#334155);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0}
        .reviewer-name{font-size:.9rem;font-weight:700;color:#fff}
        .reviewer-user{font-size:.75rem;color:rgba(255,255,255,.35)}
        .review-right{text-align:left;display:flex;flex-direction:column;align-items:flex-end;gap:.3rem}
        .review-date{font-size:.75rem;color:rgba(255,255,255,.3)}
        .review-comment{font-size:.88rem;color:rgba(255,255,255,.65);line-height:1.6}

        /* ── misc ── */
        .center-msg{text-align:center;padding:3rem;color:rgba(255,255,255,.35);font-size:.95rem;display:flex;align-items:center;justify-content:center;gap:.6rem}
        .empty-state{text-align:center;padding:4rem 2rem;color:rgba(255,255,255,.3);font-size:.95rem}

        /* ── mobile ── */
        @media(max-width:700px){
          .sidebar{display:none}
          .main{padding:1rem}
          .form-grid{grid-template-columns:1fr}
          .fg.full{grid-column:1}
        }
      `}</style>

      <div className="layout">
        {/* ── Sidebar ── */}
        <nav className="sidebar">
          <div className="sidebar-brand">
            <div className="sb-icon">🚗</div>
            <div className="sb-name">AutoCare</div>
          </div>

          {user && (
            <div className="user-mini">
              <div className="um-av">{user.role === 'mechanic' ? '🔧' : '👤'}</div>
              <div>
                <div className="um-name">{user.fullName}</div>
                <div className="um-role">{user.role}</div>
              </div>
            </div>
          )}

          {navItems.map(n => (
            <button key={n.key}
              className={`nav-item ${page === n.key && !subPage ? 'active' : ''}`}
              onClick={() => goPage(n.key)}>
              <span className="nav-ico">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* ── Main ── */}
        <main className="main">
          {renderPage()}
        </main>
      </div>

      <Toast msg={toast} onClose={() => setToastState({ type: '', text: '' })} />
    </>
  );
}