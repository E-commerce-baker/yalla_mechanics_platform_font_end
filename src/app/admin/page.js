'use client'
// ════════════════════════════════════════════════════════════════════════════
//  AdminDashboard.jsx  — complete admin panel (single file)
//
//  GET    /api/admin/profile
//  PUT    /api/admin/profile
//  GET    /api/admin/stats
//  GET    /api/admin/location-requests/pending
//  GET    /api/admin/location-requests
//  GET    /api/admin/location-requests/:id/verify
//  POST   /api/admin/location-requests/:id/approve
//  POST   /api/admin/location-requests/:id/reject
//  GET    /api/admin/mechanics
//  DELETE /api/admin/mechanics/:id/location
//  DELETE /api/admin/mechanics/:id
//  GET    /api/admin/users
//  DELETE /api/admin/users/:id
//  GET    /api/admin/breakdowns          ← NEW
//  PATCH  /api/admin/breakdowns/:id/status ← NEW
//  DELETE /api/admin/breakdowns/:id        ← NEW
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api/admin';

/* ── fetch helper ── */
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

/* ── Spinner ── */
const Spin = ({ size = 16 }) => (
  <span style={{ display: 'inline-block', width: size, height: size, border: '2px solid rgba(255,255,255,.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rot .65s linear infinite', verticalAlign: 'middle' }} />
);

/* ── Toast ── */
const Toast = ({ msg, onClose }) => {
  if (!msg.text) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '.8rem 1.2rem', borderRadius: 12, fontSize: '.87rem', fontWeight: 600, cursor: 'pointer', animation: 'toastIn .3s ease', background: msg.type === 'error' ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.14)', color: msg.type === 'error' ? '#fca5a5' : '#6ee7b7', border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`, backdropFilter: 'blur(12px)', maxWidth: 360 }}>
      {msg.type === 'error' ? '❌' : '✅'} {msg.text}
    </div>
  );
};

/* ── Confirm modal ── */
const ConfirmModal = ({ open, title, body, onConfirm, onCancel, danger = true }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '2rem', maxWidth: 400, width: '100%', animation: 'up .25s ease' }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '.6rem' }}>{title}</div>
        <div style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.5)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{body}</div>
        <div style={{ display: 'flex', gap: '.7rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn-ghost">إلغاء</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-success'}>تأكيد</button>
        </div>
      </div>
    </div>
  );
};

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const m = {
    pending:    ['قيد الانتظار', '#f59e0b', 'rgba(245,158,11,.14)'],
    approved:   ['مقبول',        '#10b981', 'rgba(16,185,129,.14)'],
    rejected:   ['مرفوض',        '#ef4444', 'rgba(239,68,68,.14)'],
    inProgress: ['جاري العمل',   '#38bdf8', 'rgba(56,189,248,.14)'],
    resolved:   ['تم الحل',      '#6ee7b7', 'rgba(110,231,183,.14)'],
    cancelled:  ['ملغي',         '#f87171', 'rgba(248,113,113,.14)'],
  };
  const [label, color, bg] = m[status] || m.pending;
  return <span style={{ fontSize: '.7rem', fontWeight: 700, padding: '.18rem .6rem', borderRadius: 20, background: bg, color, border: `1px solid ${color}44` }}>{label}</span>;
};

/* ── Stat card ── */
const StatCard = ({ icon, value, label, color, bg }) => (
  <div className="stat-card">
    <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '.7rem' }}>{icon}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: color || '#fff', lineHeight: 1 }}>{value ?? '—'}</div>
    <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.35)', marginTop: '.25rem' }}>{label}</div>
  </div>
);

/* ════════════════════════════════ PAGES ════════════════════════════════ */

/* 1 ── Overview */
const OverviewPage = ({ api, setToast }) => {
  const [stats,   setStats]   = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api('/stats'), api('/location-requests/pending')])
      .then(([s, p]) => { setStats(s.data); setPending(p.data); })
      .catch(err => setToast({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-msg"><Spin size={22} /><span>جاري التحميل...</span></div>;

  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">نظرة عامة</div><div className="page-sub">إحصائيات المنصة</div></div>
      <div className="stat-grid">
        <StatCard icon="🔧" value={stats?.totalMechanics}       label="ميكانيكي"             color="#818cf8" bg="rgba(129,140,248,.12)" />
        <StatCard icon="👤" value={stats?.totalUsers}            label="مستخدم"               color="#38bdf8" bg="rgba(56,189,248,.12)"  />
        <StatCard icon="⏳" value={stats?.pendingRequests}       label="طلبات معلقة"          color="#f59e0b" bg="rgba(245,158,11,.12)"  />
        <StatCard icon="✅" value={stats?.approvedRequests}      label="طلبات مقبولة"         color="#10b981" bg="rgba(16,185,129,.12)"  />
        <StatCard icon="❌" value={stats?.rejectedRequests}      label="طلبات مرفوضة"         color="#ef4444" bg="rgba(239,68,68,.12)"   />
        <StatCard icon="📍" value={stats?.mechanicsWithLocation} label="ميكانيكي بموقع محدد" color="#a78bfa" bg="rgba(167,139,250,.12)" />
      </div>

      {pending.length > 0 && (
        <div className="card-glass" style={{ marginTop: '1.4rem' }}>
          <div className="sec-title">⏳ أحدث الطلبات المعلقة ({pending.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem', marginTop: '1rem' }}>
            {pending.slice(0, 4).map(r => (
              <div key={r._id} className="mini-row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '.9rem' }}>{r.mechanicId?.fullName}</div>
                  <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.4)' }}>🗺️ {r.address}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* 2 ── Profile */
const ProfilePage = ({ api, user, onUpdate, setToast }) => {
  const [form, setForm]       = useState({ username: user?.username || '', fullName: user?.fullName || '', email: user?.email || '', bio: user?.profileData?.bio || '', phone: user?.profileData?.phone || '' });
  const [loading, setLoading] = useState(false);
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api('/profile', { method: 'PUT', body: JSON.stringify({ username: form.username, fullName: form.fullName, email: form.email, profileData: { bio: form.bio, phone: form.phone } }) });
      onUpdate(res.data);
      setToast({ type: 'success', text: 'تم تحديث الملف الشخصي!' });
    } catch (err) { setToast({ type: 'error', text: err.message }); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">الملف الشخصي</div><div className="page-sub">بيانات حساب المدير</div></div>
      <div className="card-glass">
        <div className="profile-hero">
          <div className="hero-av">🛡️</div>
          <div>
            <div className="hero-name">{user?.fullName}</div>
            <div className="hero-user">@{user?.username}</div>
            <span className="role-badge admin-badge">مدير النظام</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="fg"><label className="lbl">الاسم الكامل</label><div className="inp-wrap"><span className="ico">👤</span><input className="inp" value={form.fullName} onChange={f('fullName')} /></div></div>
          <div className="fg"><label className="lbl">اسم المستخدم</label><div className="inp-wrap"><span className="ico">🪪</span><input className="inp" value={form.username} onChange={f('username')} /></div></div>
          <div className="fg full"><label className="lbl">البريد الإلكتروني</label><div className="inp-wrap"><span className="ico">✉️</span><input className="inp" type="email" value={form.email} onChange={f('email')} /></div></div>
          <div className="fg"><label className="lbl">رقم الهاتف</label><div className="inp-wrap"><span className="ico">📞</span><input className="inp" value={form.phone} onChange={f('phone')} /></div></div>
          <div className="fg full"><label className="lbl">ملاحظات</label><textarea className="inp" rows={3} value={form.bio} onChange={f('bio')} style={{ resize: 'vertical', paddingTop: '.75rem', paddingRight: '.9rem' }} /></div>
          <div className="fg full"><button type="submit" className="btn-primary" disabled={loading}>{loading ? <><Spin /> جاري الحفظ...</> : '💾 حفظ التغييرات'}</button></div>
        </form>
      </div>
    </div>
  );
};

/* 3 ── Location Requests */
const LocationRequestsPage = ({ api, setToast }) => {
  const [requests,   setRequests]   = useState([]);
  const [filter,     setFilter]     = useState('all');
  const [loading,    setLoading]    = useState(true);
  const [verifying,  setVerifying]  = useState(null);
  const [verifyData, setVerifyData] = useState({});
  const [processing, setProcessing] = useState(null);
  const [rejectForm, setRejectForm] = useState({ open: false, id: null, reason: '' });

  const load = useCallback(async () => {
    try {
      const endpoint = filter === 'pending' ? '/location-requests/pending' : '/location-requests';
      const res = await api(endpoint);
      const data = filter === 'pending' ? res.data : res.data.filter(r => filter === 'all' || r.status === filter);
      setRequests(data);
    } catch (err) { setToast({ type: 'error', text: err.message }); }
    finally { setLoading(false); }
  }, [api, filter]);

  useEffect(() => { setLoading(true); load(); }, [filter]);

  const verify = async (id) => {
    try {
      setVerifying(id);
      const res = await api(`/location-requests/${id}/verify`);
      setVerifyData(p => ({ ...p, [id]: res.data }));
    } catch (err) { setToast({ type: 'error', text: err.message }); }
    finally { setVerifying(null); }
  };

  const approve = async (id, selectedLocation = null) => {
    try {
      setProcessing(id);
      await api(`/location-requests/${id}/approve`, { method: 'POST', body: JSON.stringify({ selectedLocation }) });
      setToast({ type: 'success', text: 'تمت الموافقة على الطلب بنجاح!' });
      setVerifyData(p => { const n = { ...p }; delete n[id]; return n; });
      load();
    } catch (err) { setToast({ type: 'error', text: err.message }); }
    finally { setProcessing(null); }
  };

  const reject = async () => {
    try {
      setProcessing(rejectForm.id);
      await api(`/location-requests/${rejectForm.id}/reject`, { method: 'POST', body: JSON.stringify({ reason: rejectForm.reason }) });
      setToast({ type: 'success', text: 'تم رفض الطلب.' });
      setRejectForm({ open: false, id: null, reason: '' });
      load();
    } catch (err) { setToast({ type: 'error', text: err.message }); }
    finally { setProcessing(null); }
  };

  const FILTERS = [['all', 'الكل'], ['pending', 'معلقة'], ['approved', 'مقبولة'], ['rejected', 'مرفوضة']];

  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">طلبات الموقع</div><div className="page-sub">{requests.length} طلب</div></div>
      <div className="filter-tabs">
        {FILTERS.map(([k, l]) => <button key={k} className={`ftab ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>{l}</button>)}
      </div>

      {loading ? <div className="center-msg"><Spin size={20} /><span>جاري التحميل...</span></div>
        : requests.length === 0 ? <div className="empty-state"><div style={{ fontSize: '3rem', marginBottom: '.6rem' }}>📋</div><div>لا توجد طلبات</div></div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
            {requests.map(r => {
              const vd = verifyData[r._id];
              return (
                <div key={r._id} className="req-card">
                  <div className="req-header">
                    <div>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginBottom: '.2rem' }}>{r.mechanicId?.fullName || '—'}</div>
                      <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.4)' }}>@{r.mechanicId?.username} · {r.mechanicId?.email}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="req-body">
                    {r.businessName && <div className="req-detail"><span className="rdl">🏢 الاسم التجاري</span><span className="rdv">{r.businessName}</span></div>}
                    <div className="req-detail"><span className="rdl">🗺️ العنوان</span><span className="rdv">{r.address}</span></div>
                    <div className="req-detail"><span className="rdl">📅 طُلب في</span><span className="rdv">{new Date(r.requestedAt).toLocaleString('ar')}</span></div>
                    {r.processedAt && <div className="req-detail"><span className="rdl">⚙️ عولج في</span><span className="rdv">{new Date(r.processedAt).toLocaleString('ar')}</span></div>}
                    {r.rejectionReason && <div className="rejection-reason">سبب الرفض: {r.rejectionReason}</div>}
                  </div>
                  {vd && (
                    <div className="verify-box">
                      <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#a78bfa', marginBottom: '.6rem' }}>🔍 نتائج التحقق ({vd.results?.length || 0} نتيجة)</div>
                      {vd.results?.length === 0
                        ? <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.35)' }}>لم يتم العثور على نتائج مطابقة</div>
                        : vd.results.slice(0, 3).map((loc, i) => (
                          <div key={i} className="verify-result">
                            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: '#fff', fontSize: '.85rem' }}>{loc.title}</div><div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)' }}>{loc.address}</div></div>
                            <button className="btn-xs btn-approve" disabled={processing === r._id} onClick={() => approve(r._id, loc)}>{processing === r._id ? <Spin size={12} /> : '✓ اختر'}</button>
                          </div>
                        ))
                      }
                    </div>
                  )}
                  {r.status === 'pending' && (
                    <div className="req-actions">
                      <button className="btn-xs btn-verify" disabled={verifying === r._id} onClick={() => verify(r._id)}>{verifying === r._id ? <><Spin size={12} /> جاري التحقق...</> : '🔍 تحقق'}</button>
                      <button className="btn-xs btn-approve" disabled={processing === r._id} onClick={() => approve(r._id)}>{processing === r._id ? <Spin size={12} /> : '✅ قبول'}</button>
                      <button className="btn-xs btn-reject" onClick={() => setRejectForm({ open: true, id: r._id, reason: '' })}>❌ رفض</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {rejectForm.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '2rem', maxWidth: 420, width: '100%', animation: 'up .25s ease' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>❌ سبب الرفض</div>
            <textarea className="inp" rows={4} value={rejectForm.reason} onChange={e => setRejectForm(p => ({ ...p, reason: e.target.value }))} placeholder="اكتب سبب الرفض (اختياري)..." style={{ resize: 'vertical', paddingTop: '.75rem', paddingRight: '.9rem', marginBottom: '1rem', width: '100%' }} />
            <div style={{ display: 'flex', gap: '.7rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setRejectForm({ open: false, id: null, reason: '' })}>إلغاء</button>
              <button className="btn-danger" disabled={processing === rejectForm.id} onClick={reject}>{processing === rejectForm.id ? <Spin size={13} /> : 'تأكيد الرفض'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* 4 ── Mechanics */
const MechanicsPage = ({ api, setToast }) => {
  const [mechanics, setMechanics] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [confirm,   setConfirm]   = useState({ open: false, type: null, id: null, name: '' });

  const load = useCallback(() => {
    setLoading(true);
    api('/mechanics').then(r => setMechanics(r.data)).catch(err => setToast({ type: 'error', text: err.message })).finally(() => setLoading(false));
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const removeLocation = async (id) => {
    try {
      await api(`/mechanics/${id}/location`, { method: 'DELETE' });
      setToast({ type: 'success', text: 'تم حذف الموقع وإخطار الميكانيكي.' });
      load();
    } catch (err) { setToast({ type: 'error', text: err.message }); }
    finally { setConfirm({ open: false }); }
  };

  const deleteMechanic = async (id) => {
    try {
      await api(`/mechanics/${id}`, { method: 'DELETE' });
      setToast({ type: 'success', text: 'تم حذف حساب الميكانيكي.' });
      load();
    } catch (err) { setToast({ type: 'error', text: err.message }); }
    finally { setConfirm({ open: false }); }
  };

  const filtered = mechanics.filter(m =>
    m.fullName.toLowerCase().includes(search.toLowerCase()) || m.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">الميكانيكيون</div><div className="page-sub">{mechanics.length} ميكانيكي</div></div>
      <div className="inp-wrap" style={{ marginBottom: '1.2rem' }}><span className="ico">🔍</span><input className="inp" placeholder="ابحث..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      {loading ? <div className="center-msg"><Spin size={20} /><span>جاري التحميل...</span></div>
        : filtered.length === 0 ? <div className="empty-state"><div style={{ fontSize: '3rem', marginBottom: '.6rem' }}>🔧</div><div>لا توجد نتائج</div></div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            {filtered.map(m => (
              <div key={m._id} className="user-row">
                <div className="urow-av mech-color">🔧</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '.95rem' }}>{m.fullName}</div>
                  <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.38)' }}>@{m.username} · {m.email}</div>
                  {m.location
                    ? <div style={{ fontSize: '.76rem', color: '#a78bfa', marginTop: '.2rem' }}>📍 {m.location.address}</div>
                    : <div style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.28)', marginTop: '.2rem' }}>📍 لا يوجد موقع</div>}
                  {m.pendingRequests > 0 && <div style={{ fontSize: '.72rem', color: '#f59e0b', marginTop: '.15rem' }}>⏳ {m.pendingRequests} طلب معلق</div>}
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                  {m.location && <button className="btn-xs btn-warn" onClick={() => setConfirm({ open: true, type: 'loc', id: m._id, name: m.fullName })}>🗑 الموقع</button>}
                  <button className="btn-xs btn-reject" onClick={() => setConfirm({ open: true, type: 'del', id: m._id, name: m.fullName })}>🗑 الحساب</button>
                </div>
              </div>
            ))}
          </div>
        )}

      <ConfirmModal
        open={confirm.open}
        title={confirm.type === 'del' ? '⚠️ حذف الميكانيكي' : '⚠️ حذف الموقع'}
        body={confirm.type === 'del'
          ? `هل أنت متأكد من حذف حساب "${confirm.name}"؟ سيتم حذف جميع بياناته وتقييماته وطلباته.`
          : `هل تريد حذف موقع "${confirm.name}"؟ سيتم إخطاره بذلك.`}
        onConfirm={() => confirm.type === 'del' ? deleteMechanic(confirm.id) : removeLocation(confirm.id)}
        onCancel={() => setConfirm({ open: false })}
      />
    </div>
  );
};

/* 5 ── Users */
const UsersPage = ({ api, setToast }) => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });

  const load = useCallback(() => {
    setLoading(true);
    api('/users').then(r => setUsers(r.data)).catch(err => setToast({ type: 'error', text: err.message })).finally(() => setLoading(false));
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const deleteUser = async () => {
    try {
      await api(`/users/${confirm.id}`, { method: 'DELETE' });
      setToast({ type: 'success', text: `تم حذف حساب "${confirm.name}".` });
      load();
    } catch (err) { setToast({ type: 'error', text: err.message }); }
    finally { setConfirm({ open: false }); }
  };

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">المستخدمون</div><div className="page-sub">{users.length} مستخدم</div></div>
      <div className="inp-wrap" style={{ marginBottom: '1.2rem' }}><span className="ico">🔍</span><input className="inp" placeholder="ابحث بالاسم أو البريد..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      {loading ? <div className="center-msg"><Spin size={20} /><span>جاري التحميل...</span></div>
        : filtered.length === 0 ? <div className="empty-state"><div style={{ fontSize: '3rem', marginBottom: '.6rem' }}>👤</div><div>لا توجد نتائج</div></div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {filtered.map(u => (
              <div key={u._id} className="user-row">
                <div className="urow-av user-color">👤</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '.95rem' }}>{u.fullName}</div>
                  <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.38)' }}>@{u.username} · {u.email}</div>
                  <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.26)', marginTop: '.2rem' }}>انضم: {new Date(u.createdAt).toLocaleDateString('ar')}</div>
                </div>
                <button className="btn-xs btn-reject" onClick={() => setConfirm({ open: true, id: u._id, name: u.fullName })}>🗑 حذف</button>
              </div>
            ))}
          </div>
        )}

      <ConfirmModal
        open={confirm.open}
        title="⚠️ حذف المستخدم"
        body={`هل أنت متأكد من حذف حساب "${confirm.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        onConfirm={deleteUser}
        onCancel={() => setConfirm({ open: false })}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   6 ── Breakdowns Page  (NEW)
   يعرض كل منشورات العطل مع فلترة + تغيير حالة + حذف
   ══════════════════════════════════════════════════════════════════════ */
const BreakdownsPage = ({ api, setToast }) => {
  const [breakdowns, setBreakdowns] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all');
  const [search,     setSearch]     = useState('');
  const [confirm,    setConfirm]    = useState({ open: false, id: null, title: '' });
  const [expanded,   setExpanded]   = useState(null); // منشور مفتوح للتفاصيل
  const [statusLoading, setStatusLoading] = useState(null);

  const STATUS_FILTERS = [
    ['all',        'الكل'],
    ['pending',    'قيد الانتظار'],
    ['inProgress', 'جاري العمل'],
    ['resolved',   'تم الحل'],
    ['cancelled',  'ملغي'],
  ];

  const STATUS_OPTIONS = [
    { value: 'pending',    label: '⏳ قيد الانتظار' },
    { value: 'inProgress', label: '🔧 جاري العمل'   },
    { value: 'resolved',   label: '✅ تم الحل'       },
    { value: 'cancelled',  label: '❌ ملغي'          },
  ];

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api(`/breakdowns${params}`);
      setBreakdowns(res.data);
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  }, [api, filter]);

  useEffect(() => { load(); }, [filter]);

  /* تغيير الحالة */
  const changeStatus = async (id, newStatus) => {
    try {
      setStatusLoading(id);
      await api(`/breakdowns/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setToast({ type: 'success', text: 'تم تحديث حالة المنشور' });
      setBreakdowns(prev =>
        prev.map(b => b._id === id ? { ...b, status: newStatus } : b)
      );
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally { setStatusLoading(null); }
  };

  /* حذف المنشور */
  const deleteBreakdown = async () => {
    try {
      await api(`/breakdowns/${confirm.id}`, { method: 'DELETE' });
      setToast({ type: 'success', text: 'تم حذف المنشور.' });
      setBreakdowns(prev => prev.filter(b => b._id !== confirm.id));
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally { setConfirm({ open: false }); }
  };

  /* فلترة بالبحث */
  const filtered = breakdowns.filter(b => {
    const q = search.toLowerCase();
    return !q ||
      b.title?.toLowerCase().includes(q) ||
      b.userId?.fullName?.toLowerCase().includes(q) ||
      b.carInfo?.brand?.toLowerCase().includes(q) ||
      b.carInfo?.model?.toLowerCase().includes(q);
  });

  /* إحصائيات سريعة */
  const counts = breakdowns.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page">
      {/* Header */}
      <div className="page-hdr" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="page-title">🚨 منشورات العطل</div>
          <div className="page-sub">{breakdowns.length} منشور إجمالاً</div>
        </div>
        <button className="btn-xs btn-verify" onClick={load} style={{ padding: '.5rem 1rem', fontSize: '.85rem' }}>
          🔄 تحديث
        </button>
      </div>

      {/* Quick stats row */}
      <div className="bd-stats-row">
        {[
          { key: 'pending',    icon: '⏳', label: 'معلقة',        color: '#f59e0b' },
          { key: 'inProgress', icon: '🔧', label: 'جاري العمل',  color: '#38bdf8' },
          { key: 'resolved',   icon: '✅', label: 'محلولة',       color: '#6ee7b7' },
          { key: 'cancelled',  icon: '❌', label: 'ملغية',        color: '#f87171' },
        ].map(s => (
          <div key={s.key} className="bd-stat-chip" style={{ borderColor: `${s.color}33` }}
            onClick={() => setFilter(s.key)}>
            <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
            <span style={{ fontWeight: 900, color: s.color, fontSize: '1.1rem' }}>{counts[s.key] || 0}</span>
            <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ display: 'flex', gap: '.7rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          {STATUS_FILTERS.map(([k, l]) => (
            <button key={k} className={`ftab ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <div className="inp-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="ico">🔍</span>
          <input className="inp" placeholder="بحث بالعنوان أو اسم المستخدم أو السيارة..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="center-msg"><Spin size={20} /><span>جاري التحميل...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3.5rem', marginBottom: '.7rem' }}>🚗</div>
          <div>لا توجد منشورات</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
          {filtered.map(b => {
            const isOpen = expanded === b._id;
            return (
              <div key={b._id} className="bd-admin-card">

                {/* ── Card Top ── */}
                <div className="bd-admin-top">
                  {/* user info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flex: 1, minWidth: 0 }}>
                    <div className="urow-av user-color" style={{ width: 38, height: 38, fontSize: '.95rem', flexShrink: 0 }}>👤</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.userId?.fullName || 'مستخدم محذوف'}
                      </div>
                      <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)' }}>
                        @{b.userId?.username} · {new Date(b.createdAt).toLocaleDateString('ar')}
                      </div>
                    </div>
                  </div>

                  {/* status badge */}
                  <StatusBadge status={b.status} />
                </div>

                {/* ── Car info bar ── */}
                <div className="bd-car-bar">
                  <div className="bd-car-icon-sm">🚗</div>
                  <div style={{ flex: 1 }}>
                    <span className="bd-car-label">{b.carInfo?.brand} {b.carInfo?.model}</span>
                    {b.carInfo?.year && <span className="bd-car-year"> {b.carInfo.year}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                    {b.carInfo?.fuelType     && <span className="bd-tag">{b.carInfo.fuelType}</span>}
                    {b.carInfo?.transmission && <span className="bd-tag">{b.carInfo.transmission}</span>}
                    {b.carInfo?.mileage      && <span className="bd-tag">🔢 {b.carInfo.mileage.toLocaleString()} كم</span>}
                  </div>
                </div>

                {/* ── Title & desc ── */}
                <div className="bd-admin-title">{b.title}</div>
                <div className="bd-admin-desc">{b.description}</div>

                {/* ── Chips ── */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginBottom: '.8rem' }}>
                  {b.location?.lat && (
                    <span className="bd-info-chip">📍 {Number(b.location.lat).toFixed(4)}, {Number(b.location.lng).toFixed(4)}{b.location.note ? ` — ${b.location.note}` : ''}</span>
                  )}
                  {b.problemDetails?.warningLights && <span className="bd-info-chip warn">⚠️ لمبة تحذير</span>}
                  {b.problemDetails?.isRecurring   && <span className="bd-info-chip">🔁 متكررة</span>}
                  {b.problemDetails?.carRunning === false && <span className="bd-info-chip err">🔴 السيارة واقفة</span>}
                  {b.problemDetails?.startedAt && (
                    <span className="bd-info-chip">📅 بدأت: {new Date(b.problemDetails.startedAt).toLocaleDateString('ar')}</span>
                  )}
                  {b.photos?.length > 0 && <span className="bd-info-chip">📷 {b.photos.length} صور</span>}
                </div>

                {/* ── Expandable photos ── */}
                {isOpen && b.photos?.length > 0 && (
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.8rem' }}>
                    {b.photos.map((p, i) => (
                      <img key={i} src={`http://localhost:3001${p.url}`} alt={`photo-${i}`}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 9, border: '1px solid rgba(255,255,255,.1)' }} />
                    ))}
                  </div>
                )}

                {/* ── Actions ── */}
                <div className="bd-admin-actions">
                  {/* Status changer */}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <select
                      className="inp inp-select"
                      style={{ padding: '.42rem 2.2rem .42rem .7rem', fontSize: '.82rem', height: 'auto' }}
                      value={b.status}
                      disabled={statusLoading === b._id}
                      onChange={e => changeStatus(b._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {statusLoading === b._id && (
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}><Spin size={12} /></span>
                    )}
                  </div>

                  {/* Expand / collapse details */}
                  <button className="btn-xs btn-verify"
                    onClick={() => setExpanded(isOpen ? null : b._id)}>
                    {isOpen ? '▲ إخفاء' : '▼ تفاصيل'}
                  </button>

                  {/* Delete */}
                  <button className="btn-xs btn-reject"
                    onClick={() => setConfirm({ open: true, id: b._id, title: b.title })}>
                    🗑 حذف
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={confirm.open}
        title="⚠️ حذف المنشور"
        body={`هل أنت متأكد من حذف منشور "${confirm.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        onConfirm={deleteBreakdown}
        onCancel={() => setConfirm({ open: false })}
      />
    </div>
  );
};

/* ════════════════════ MAIN APP ════════════════════ */
export default function AdminDashboard() {
  const [accessToken] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '') || '');
  const [user,    setUser]    = useState(null);
  const [page,    setPage]    = useState('overview');
  const [toast,   setToastSt] = useState({ type: '', text: '' });
  const [pending, setPending] = useState(0);
  const [mounted, setMounted] = useState(false);

  const api = useApi(accessToken);

  const setToast = (msg) => {
    setToastSt(msg);
    setTimeout(() => setToastSt({ type: '', text: '' }), 3800);
  };

  useEffect(() => {
    setMounted(true);
    if (!accessToken) return;
    Promise.all([api('/profile'), api('/stats')])
      .then(([prof, stats]) => {
        setUser(prof.data);
        setPending(stats.data.pendingRequests || 0);
      }).catch(() => {});
  }, []);

  const navItems = [
    { key: 'overview',    icon: '📊', label: 'نظرة عامة'      },
    { key: 'profile',     icon: '🛡️', label: 'ملفي الشخصي'   },
    { key: 'requests',    icon: '📋', label: 'طلبات الموقع', badge: pending },
    { key: 'mechanics',   icon: '🔧', label: 'الميكانيكيون'   },
    { key: 'users',       icon: '👥', label: 'المستخدمون'     },
    { key: 'breakdowns',  icon: '🚨', label: 'منشورات العطل'  }, // ← NEW
  ];

  if (!mounted) return null;

  if (!accessToken) {
    return (
      <div style={{ minHeight: '100vh', background: '#050710', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal,sans-serif', color: '#fff', direction: 'rtl', fontSize: '1.1rem' }}>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div><div>يجب تسجيل الدخول أولاً</div></div>
      </div>
    );
  }
  const handleLogout = () => {
  localStorage.removeItem('accessToken');
  window.location.href = '/auth'; // أو أي مسار تسجيل الدخول لديك
};
  const renderPage = () => {
    if (page === 'overview')   return <OverviewPage         api={api} setToast={setToast} />;
    if (page === 'profile')    return <ProfilePage          api={api} user={user} onUpdate={setUser} setToast={setToast} />;
    if (page === 'requests')   return <LocationRequestsPage api={api} setToast={setToast} />;
    if (page === 'mechanics')  return <MechanicsPage        api={api} setToast={setToast} />;
    if (page === 'users')      return <UsersPage            api={api} setToast={setToast} />;
    if (page === 'breakdowns') return <BreakdownsPage       api={api} setToast={setToast} />; // ← NEW
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Sora:wght@600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body,html{background:#050710;font-family:'Tajawal',sans-serif;direction:rtl;color:#e2e8f0;min-height:100vh}
        @keyframes rot{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}

        .layout{display:flex;min-height:100vh}

        /* ── sidebar ── */
        .sidebar{width:240px;flex-shrink:0;background:rgba(255,255,255,.022);border-left:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;padding:1.4rem .9rem;position:sticky;top:0;height:100vh;backdrop-filter:blur(20px)}
        .sb-brand{display:flex;align-items:center;gap:.65rem;margin-bottom:1.8rem;padding:.25rem .5rem}
        .sb-logo{width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.2rem}
        .sb-title{font-family:'Sora',sans-serif;font-size:1.1rem;font-weight:700;color:#fff}
        .user-chip{display:flex;align-items:center;gap:.65rem;background:rgba(99,102,241,.09);border:1px solid rgba(99,102,241,.2);border-radius:13px;padding:.8rem .9rem;margin-bottom:1.5rem}
        .uc-av{width:38px;height:38px;background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
        .uc-name{font-size:.86rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .uc-role{font-size:.7rem;color:rgba(167,139,250,.7)}
        .nav-btn{display:flex;align-items:center;justify-content:space-between;padding:.68rem .9rem;border-radius:11px;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:500;color:rgba(255,255,255,.4);cursor:pointer;transition:all .2s;margin-bottom:.22rem;border:none;background:transparent;width:100%;text-align:right}
        .nav-btn:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.75)}
        .nav-btn.active{background:rgba(99,102,241,.14);color:#a5b4fc;font-weight:700;border:1px solid rgba(99,102,241,.25)}
        .nav-left{display:flex;align-items:center;gap:.6rem}
        .nav-ico{font-size:1rem;width:20px;text-align:center}
        .nav-badge{background:#ef4444;color:#fff;font-size:.64rem;font-weight:800;padding:.15rem .45rem;border-radius:20px;min-width:18px;text-align:center;animation:pulse 2s infinite}

        /* ── main ── */
        .main{flex:1;overflow-y:auto;padding:2rem;max-width:960px}
        .page{animation:up .35s ease}
        .page-hdr{margin-bottom:1.8rem}
        .page-title{font-size:1.55rem;font-weight:900;color:#fff;display:flex;align-items:center;gap:.6rem}
        .page-sub{font-size:.87rem;color:rgba(255,255,255,.3);margin-top:.25rem}

        /* ── glass card ── */
        .card-glass{background:rgba(255,255,255,.032);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:1.6rem;backdrop-filter:blur(16px)}
        .sec-title{font-size:.95rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:.5rem}

        /* ── stat grid ── */
        .stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.85rem}
        .stat-card{background:rgba(255,255,255,.038);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:1.2rem;text-align:center;transition:border-color .2s,transform .2s}
        .stat-card:hover{transform:translateY(-2px);border-color:rgba(99,102,241,.28)}

        /* ── filter tabs ── */
        .filter-tabs{display:flex;gap:.4rem;margin-bottom:1.2rem;flex-wrap:wrap}
        .ftab{padding:.42rem .9rem;border-radius:9px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.04);color:rgba(255,255,255,.45);font-family:'Tajawal',sans-serif;font-size:.83rem;font-weight:500;cursor:pointer;transition:all .2s}
        .ftab.on{background:rgba(99,102,241,.16);border-color:rgba(99,102,241,.35);color:#a5b4fc;font-weight:700}

        /* ── request cards ── */
        .req-card{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:1.2rem;transition:border-color .2s}
        .req-header{display:flex;align-items:flex-start;justify-content:space-between;gap:.7rem;margin-bottom:.9rem}
        .req-body{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.8rem}
        .req-detail{display:flex;justify-content:space-between;align-items:flex-start;font-size:.82rem}
        .rdl{color:rgba(255,255,255,.35);flex-shrink:0;margin-left:.7rem}
        .rdv{color:#fff;font-weight:500;text-align:left;word-break:break-word;max-width:65%}
        .rejection-reason{background:rgba(239,68,68,.08);border-right:3px solid #ef4444;padding:.4rem .7rem;border-radius:6px;font-size:.78rem;color:#fca5a5}
        .req-actions{display:flex;gap:.5rem;flex-wrap:wrap;padding-top:.7rem;border-top:1px solid rgba(255,255,255,.06)}
        .verify-box{background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.18);border-radius:12px;padding:1rem;margin-bottom:.8rem}
        .verify-result{display:flex;align-items:center;gap:.7rem;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.05)}
        .verify-result:last-child{border-bottom:none}

        /* ── user rows ── */
        .user-row{display:flex;align-items:center;gap:.9rem;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:.9rem 1rem;transition:border-color .2s}
        .user-row:hover{border-color:rgba(99,102,241,.22)}
        .urow-av{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
        .mech-color{background:linear-gradient(135deg,#f59e0b,#ef4444)}
        .user-color{background:linear-gradient(135deg,#0ea5e9,#6366f1)}
        .mini-row{display:flex;align-items:center;justify-content:space-between;gap:.7rem;padding:.6rem 0;border-bottom:1px solid rgba(255,255,255,.05)}
        .mini-row:last-child{border-bottom:none}

        /* ── form ── */
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .fg{display:flex;flex-direction:column}
        .fg.full{grid-column:1/-1}
        .lbl{font-size:.78rem;font-weight:600;color:rgba(255,255,255,.37);margin-bottom:.32rem}
        .inp-wrap{position:relative}
        .ico{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:.88rem;opacity:.36;pointer-events:none}
        .inp{width:100%;padding:.76rem 2.5rem .76rem .9rem;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);border-radius:11px;color:#fff;font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none;transition:border-color .2s,background .2s,box-shadow .2s;text-align:right}
        .inp::placeholder{color:rgba(255,255,255,.18)}
        .inp:focus{border-color:#6366f1;background:rgba(99,102,241,.08);box-shadow:0 0 0 3px rgba(99,102,241,.16)}
        textarea.inp{padding-right:.9rem}
        .inp-select{appearance:none;-webkit-appearance:none;padding-left:2rem;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,.3)'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:left 10px center}
        .inp-select option{background:#1a1a2e;color:#fff}

        /* ── profile ── */
        .profile-hero{display:flex;align-items:center;gap:1.1rem;margin-bottom:1.8rem;padding-bottom:1.4rem;border-bottom:1px solid rgba(255,255,255,.07)}
        .hero-av{width:62px;height:62px;background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.7rem;flex-shrink:0}
        .hero-name{font-size:1.12rem;font-weight:700;color:#fff}
        .hero-user{font-size:.82rem;color:rgba(255,255,255,.36);margin:.18rem 0}
        .role-badge{display:inline-block;font-size:.7rem;font-weight:700;padding:.18rem .55rem;border-radius:20px;letter-spacing:.4px}
        .admin-badge{background:rgba(99,102,241,.18);color:#a5b4fc}

        /* ── breakdown admin cards ── */
        .bd-stats-row{display:flex;gap:.7rem;margin-bottom:1.2rem;flex-wrap:wrap}
        .bd-stat-chip{display:flex;align-items:center;gap:.5rem;padding:.55rem 1rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;cursor:pointer;transition:all .2s}
        .bd-stat-chip:hover{background:rgba(255,255,255,.08)}
        .bd-admin-card{background:rgba(255,255,255,.038);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:1.3rem;transition:border-color .2s}
        .bd-admin-card:hover{border-color:rgba(239,68,68,.22)}
        .bd-admin-top{display:flex;align-items:center;justify-content:space-between;gap:.7rem;margin-bottom:.85rem}
        .bd-car-bar{display:flex;align-items:center;gap:.7rem;padding:.6rem .8rem;background:rgba(255,255,255,.04);border-radius:10px;margin-bottom:.75rem;flex-wrap:wrap}
        .bd-car-icon-sm{width:30px;height:30px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.85rem;flex-shrink:0}
        .bd-car-label{font-size:.88rem;font-weight:700;color:#fff}
        .bd-car-year{font-size:.82rem;color:rgba(255,255,255,.38)}
        .bd-tag{font-size:.7rem;padding:.12rem .45rem;background:rgba(255,255,255,.07);border-radius:6px;color:rgba(255,255,255,.42);border:1px solid rgba(255,255,255,.08)}
        .bd-admin-title{font-size:.97rem;font-weight:700;color:#f8fafc;margin-bottom:.35rem}
        .bd-admin-desc{font-size:.83rem;color:rgba(255,255,255,.48);line-height:1.6;margin-bottom:.75rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .bd-info-chip{font-size:.72rem;padding:.2rem .55rem;border-radius:8px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.08)}
        .bd-info-chip.warn{background:rgba(251,191,36,.1);color:#fbbf24;border-color:rgba(251,191,36,.2)}
        .bd-info-chip.err{background:rgba(239,68,68,.1);color:#f87171;border-color:rgba(239,68,68,.2)}
        .bd-admin-actions{display:flex;gap:.6rem;align-items:center;padding-top:.85rem;border-top:1px solid rgba(255,255,255,.06);flex-wrap:wrap}

        /* ── buttons ── */
        .btn-primary{padding:.82rem;background:linear-gradient(135deg,#6366f1,#a855f7);border:none;border-radius:12px;color:#fff;font-family:'Tajawal',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;box-shadow:0 4px 18px rgba(99,102,241,.38);width:100%}
        .btn-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 24px rgba(99,102,241,.52)}
        .btn-primary:disabled{opacity:.55;cursor:not-allowed}
        .btn-xs{padding:.38rem .8rem;border-radius:8px;border:none;font-family:'Tajawal',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;gap:.35rem}
        .btn-xs:disabled{opacity:.5;cursor:not-allowed}
        .btn-verify{background:rgba(167,139,250,.14);color:#c4b5fd;border:1px solid rgba(167,139,250,.25)}
        .btn-verify:hover:not(:disabled){background:rgba(167,139,250,.25)}
        .btn-approve{background:rgba(16,185,129,.14);color:#6ee7b7;border:1px solid rgba(16,185,129,.25)}
        .btn-approve:hover:not(:disabled){background:rgba(16,185,129,.24)}
        .btn-reject{background:rgba(239,68,68,.12);color:#fca5a5;border:1px solid rgba(239,68,68,.22)}
        .btn-reject:hover:not(:disabled){background:rgba(239,68,68,.22)}
        .btn-warn{background:rgba(245,158,11,.12);color:#fcd34d;border:1px solid rgba(245,158,11,.22)}
        .btn-warn:hover:not(:disabled){background:rgba(245,158,11,.22)}
        .btn-ghost{padding:.6rem 1.1rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:rgba(255,255,255,.6);font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s}
        .btn-ghost:hover{background:rgba(255,255,255,.12);color:#fff}
        .btn-danger{padding:.6rem 1.1rem;background:rgba(239,68,68,.18);border:1px solid rgba(239,68,68,.3);border-radius:10px;color:#fca5a5;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:.4rem}
        .btn-danger:hover{background:rgba(239,68,68,.28)}
        .btn-danger:disabled{opacity:.5;cursor:not-allowed}
        .btn-success{padding:.6rem 1.1rem;background:rgba(16,185,129,.16);border:1px solid rgba(16,185,129,.28);border-radius:10px;color:#6ee7b7;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s}
        .btn-success:hover{background:rgba(16,185,129,.26)}

        /* ── misc ── */
        .center-msg{display:flex;align-items:center;justify-content:center;gap:.7rem;padding:3rem;color:rgba(255,255,255,.33);font-size:.92rem}
        .empty-state{text-align:center;padding:4rem 2rem;color:rgba(255,255,255,.28);font-size:.92rem}

        @media(max-width:700px){.sidebar{display:none}.main{padding:1rem}.form-grid{grid-template-columns:1fr}.fg.full{grid-column:1}}
      `}</style>

      <div className="layout">
        <nav className="sidebar">
          <div className="sb-brand">
            <div className="sb-logo">🛡️</div>
            <div className="sb-title">AdminPanel</div>
          </div>
          {user && (
            <div className="user-chip">
              <div className="uc-av">🛡️</div>
              <div style={{ overflow: 'hidden' }}>
                <div className="uc-name">{user.fullName}</div>
                <div className="uc-role">مدير النظام</div>
              </div>
            </div>
          )}
          {navItems.map(n => (
            <button key={n.key} className={`nav-btn ${page === n.key ? 'active' : ''}`} onClick={() => setPage(n.key)}>
              <div className="nav-left"><span className="nav-ico">{n.icon}</span>{n.label}</div>
              {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
            </button>
          ))}
            <button
    className="nav-btn"
    onClick={handleLogout}
    style={{ color:'rgba(239,68,68,.7)', width:'100%' }}
  >
    <div className="nav-left">
      <span className="nav-ico">🚪</span>
      تسجيل الخروج
    </div>
  </button>
        </nav>

        <main className="main">{renderPage()}</main>
      </div>

      <Toast msg={toast} onClose={() => setToastSt({ type: '', text: '' })} />
    </>
  );
}

