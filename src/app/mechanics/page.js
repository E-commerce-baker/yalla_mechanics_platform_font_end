'use client'
import React, { useState, useEffect, useCallback } from 'react';

const API_MECH = 'http://localhost:3001/api/mechanics';

const useApi = (accessToken) =>
  useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_MECH}${path}`, {
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

const Stars = ({ value, readonly = false }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[1,2,3,4,5].map(n => (
      <span key={n} style={{ fontSize: readonly ? '.95rem' : '1.3rem', color: n <= value ? '#f59e0b' : 'rgba(255,255,255,.13)', userSelect: 'none' }}>★</span>
    ))}
  </div>
);

const Spin = ({ size = 16 }) => (
  <span style={{ display:'inline-block', width:size, height:size, border:'2px solid rgba(255,255,255,.2)', borderTopColor:'#fff', borderRadius:'50%', animation:'rot .65s linear infinite', verticalAlign:'middle' }} />
);

const Toast = ({ msg, onClose }) => {
  if (!msg.text) return null;
  return (
    <div onClick={onClose} style={{
      position:'fixed', bottom:24, right:24, zIndex:9999,
      padding:'.78rem 1.2rem', borderRadius:12, fontSize:'.87rem', fontWeight:600,
      cursor:'pointer', animation:'toastIn .3s ease',
      background: msg.type === 'error' ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.14)',
      color: msg.type === 'error' ? '#fca5a5' : '#6ee7b7',
      border:`1px solid ${msg.type === 'error' ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`,
      backdropFilter:'blur(12px)', maxWidth:340,
    }}>
      {msg.type === 'error' ? '❌' : '✅'} {msg.text}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    pending:    { label:'قيد الانتظار', color:'#f59e0b', bg:'rgba(245,158,11,.14)'  },
    approved:   { label:'مقبول',        color:'#10b981', bg:'rgba(16,185,129,.14)'  },
    rejected:   { label:'مرفوض',        color:'#ef4444', bg:'rgba(239,68,68,.14)'   },
    accepted:   { label:'مقبول',        color:'#10b981', bg:'rgba(16,185,129,.14)'  },
    inProgress: { label:'جاري العمل',   color:'#38bdf8', bg:'rgba(56,189,248,.14)'  },
    resolved:   { label:'مكتمل',        color:'#a78bfa', bg:'rgba(167,139,250,.14)' },
    cancelled:  { label:'ملغي',         color:'#6b7280', bg:'rgba(107,114,128,.14)' },
    withdrawn:  { label:'مسحوب',        color:'#6b7280', bg:'rgba(107,114,128,.14)' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ fontSize:'.72rem', fontWeight:700, padding:'.2rem .6rem', borderRadius:20, background:s.bg, color:s.color, border:`1px solid ${s.color}44` }}>{s.label}</span>
  );
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={onClose}>
      <div style={{ background:'#0f1117', border:'1px solid rgba(255,255,255,.12)', borderRadius:20, padding:'1.8rem', width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', animation:'up .25s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.3rem' }}>
          <div style={{ fontSize:'1.1rem', fontWeight:800, color:'#fff' }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.4)', fontSize:'1.3rem', cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const OverviewPage = ({ api, user, setToast }) => {
  const [reviews, setReviews]       = useState(null);
  const [location, setLocation]     = useState(null);
  const [notifs, setNotifs]         = useState([]);
  const [breakdowns, setBreakdowns] = useState([]);
  const [proposals, setProposals]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [rv, loc, nt, bd, pr] = await Promise.all([
          api('/reviews'), api('/location'), api('/notifications'),
          api('/all-breakdowns'), api('/my-proposals'),
        ]);
        setReviews(rv.data); setLocation(loc.data); setNotifs(nt.data);
        setBreakdowns(bd.data || []); setProposals(pr.data || []);
      } catch (err) { setToast({ type:'error', text:err.message }); }
      finally { setLoading(false); }
    })();
  }, []);

  const unread   = notifs.filter(n => !n.read).length;
  const newBd    = breakdowns.filter(b => b.status === 'pending' && !b.myProposal).length;
  const active   = breakdowns.filter(b => b.status === 'inProgress').length;
  const accepted = proposals.filter(p => p.status === 'accepted').length;

  if (loading) return <div className="center-msg"><Spin size={22}/><span>جاري التحميل...</span></div>;

  return (
    <div className="page">
      <div className="page-hdr">
        <div className="page-title">مرحباً، {user?.fullName?.split(' ')[0]} 👋</div>
        <div className="page-sub">لوحة تحكم الميكانيكي</div>
      </div>
      <div className="stat-grid">
        {[
          { ico:'⭐', val:reviews?.averageRating||'0.0', lbl:'متوسط التقييم',    c:'#f59e0b', bg:'rgba(245,158,11,.12)' },
          { ico:'🚗', val:newBd,    lbl:'أعطال جديدة',        c:'#fbbf24', bg:'rgba(245,158,11,.12)' },
          { ico:'🔧', val:active,   lbl:'طلبات نشطة',         c:'#38bdf8', bg:'rgba(56,189,248,.12)'  },
          { ico:'✅', val:accepted, lbl:'اقتراحات مقبولة',     c:'#6ee7b7', bg:'rgba(16,185,129,.12)'  },
          { ico:'🔔', val:unread,   lbl:'إشعارات غير مقروءة', c:unread>0?'#fca5a5':'#6ee7b7', bg:unread>0?'rgba(239,68,68,.12)':'rgba(16,185,129,.12)' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-ico" style={{ background:s.bg, color:s.c }}>{s.ico}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>
      {location && (
        <div className="card-glass" style={{ marginTop:'1.2rem' }}>
          <div className="sec-title">📍 موقعي الحالي</div>
          <div className="loc-info-row">
            <div className="loc-pill">🏢 {location.businessName||'بدون اسم تجاري'}</div>
            <div className="loc-pill">🗺️ {location.address}</div>
          </div>
        </div>
      )}
      {active > 0 && (
        <div className="card-glass" style={{ marginTop:'1.2rem' }}>
          <div className="sec-title" style={{ marginBottom:'1rem' }}>🔧 طلباتي النشطة</div>
          {breakdowns.filter(b => b.status==='inProgress').map(b => (
            <div key={b._id} className="mini-review" style={{ marginBottom:'.6rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:700, color:'#fff', fontSize:'.9rem' }}>🚗 {b.carInfo?.brand} {b.carInfo?.model}</span>
                <StatusBadge status="inProgress"/>
              </div>
              <div style={{ fontSize:'.8rem', color:'rgba(255,255,255,.4)', marginTop:'.3rem' }}>{b.title}</div>
            </div>
          ))}
        </div>
      )}
      {reviews?.reviews?.length > 0 && (
        <div className="card-glass" style={{ marginTop:'1.2rem' }}>
          <div className="sec-title" style={{ marginBottom:'1rem' }}>⭐ أحدث التقييمات</div>
          {reviews.reviews.slice(0,3).map(r => (
            <div key={r._id} className="mini-review" style={{ marginBottom:'.6rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.3rem' }}>
                <span style={{ fontSize:'.85rem', fontWeight:700, color:'#fff' }}>{r.userId?.fullName}</span>
                <Stars value={r.rating} readonly/>
              </div>
              <div style={{ fontSize:'.82rem', color:'rgba(255,255,255,.55)' }}>{r.comment}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfilePage = ({ api, user, onUpdate, setToast }) => {
  const [form, setForm] = useState({ username:user?.username||'', fullName:user?.fullName||'', email:user?.email||'', bio:user?.profileData?.bio||'', phone:user?.profileData?.phone||'' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    try { setLoading(true); const res = await api('/profile',{ method:'PUT', body:JSON.stringify({ username:form.username, fullName:form.fullName, email:form.email, profileData:{ bio:form.bio, phone:form.phone } }) }); onUpdate(res.data); setToast({ type:'success', text:'تم تحديث الملف الشخصي!' }); }
    catch(err){ setToast({ type:'error', text:err.message }); } finally { setLoading(false); }
  };
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));
  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">الملف الشخصي</div><div className="page-sub">بيانات حسابك كميكانيكي</div></div>
      <div className="card-glass">
        <div className="profile-hero">
          <div className="hero-avatar">🔧</div>
          <div><div className="hero-name">{user?.fullName}</div><div className="hero-user">@{user?.username}</div><span className="role-badge">ميكانيكي</span></div>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="fg"><label className="lbl">الاسم الكامل</label><div className="inp-wrap"><span className="ico">👤</span><input className="inp" value={form.fullName} onChange={f('fullName')} placeholder="الاسم الكامل"/></div></div>
          <div className="fg"><label className="lbl">اسم المستخدم</label><div className="inp-wrap"><span className="ico">🪪</span><input className="inp" value={form.username} onChange={f('username')} placeholder="username"/></div></div>
          <div className="fg full"><label className="lbl">البريد الإلكتروني</label><div className="inp-wrap"><span className="ico">✉️</span><input className="inp" type="email" value={form.email} onChange={f('email')} placeholder="email@example.com"/></div></div>
          <div className="fg"><label className="lbl">رقم الهاتف</label><div className="inp-wrap"><span className="ico">📞</span><input className="inp" value={form.phone} onChange={f('phone')} placeholder="+962 7x xxx xxxx"/></div></div>
          <div className="fg full"><label className="lbl">نبذة عن خدماتك</label><textarea className="inp" rows={3} value={form.bio} onChange={f('bio')} placeholder="اكتب نبذة..." style={{ resize:'vertical', paddingTop:'.75rem', paddingRight:'.9rem' }}/></div>
          <div className="fg full"><button type="submit" className="btn-primary" disabled={loading}>{loading ? <><Spin/> جاري الحفظ...</> : '💾 حفظ التغييرات'}</button></div>
        </form>
      </div>
    </div>
  );
};

const LocationPage = ({ api, setToast }) => {
  const [location, setLocation]     = useState(null);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ businessName:'', address:'' });
  const load = useCallback(async () => {
    try { const [loc,reqs] = await Promise.all([api('/location'),api('/location-requests')]); setLocation(loc.data); setRequests(reqs.data); }
    catch(err){ setToast({ type:'error', text:err.message }); } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);
  const hasPending = requests.some(r => r.status==='pending');
  const handleSubmit = async e => {
    e.preventDefault();
    try { setSubmitting(true); await api('/location-requests',{ method:'POST', body:JSON.stringify(form) }); setToast({ type:'success', text:'تم إرسال طلب الموقع!' }); setForm({ businessName:'', address:'' }); await load(); }
    catch(err){ setToast({ type:'error', text:err.message }); } finally { setSubmitting(false); }
  };
  if (loading) return <div className="center-msg"><Spin size={22}/><span>جاري التحميل...</span></div>;
  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">إدارة الموقع</div><div className="page-sub">موقعك الحالي وطلبات التحديث</div></div>
      <div className="card-glass" style={{ marginBottom:'1.2rem' }}>
        <div className="sec-title">📍 موقعي الحالي</div>
        {location ? (
          <div style={{ marginTop:'.8rem' }}>
            <div className="detail-row"><span className="detail-lbl">الاسم التجاري</span><span className="detail-val">{location.businessName||'—'}</span></div>
            <div className="detail-row"><span className="detail-lbl">العنوان</span><span className="detail-val">{location.address}</span></div>
            {location.locationData && <div className="detail-row"><span className="detail-lbl">الإحداثيات</span><span className="detail-val" style={{ fontFamily:'monospace', fontSize:'.8rem' }}>{location.locationData.lat?.toFixed(5)}, {location.locationData.lng?.toFixed(5)}</span></div>}
            <div className="detail-row"><span className="detail-lbl">آخر تحديث</span><span className="detail-val">{new Date(location.updatedAt).toLocaleString('ar')}</span></div>
          </div>
        ) : <div className="empty-inline">لم يتم تحديد موقع بعد</div>}
      </div>
      <div className="card-glass" style={{ marginBottom:'1.2rem' }}>
        <div className="sec-title">📝 طلب تحديث الموقع</div>
        {hasPending ? <div className="info-banner">⏳ لديك طلب قيد الانتظار.</div> : (
          <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop:'.9rem' }}>
            <div className="fg"><label className="lbl">الاسم التجاري (اختياري)</label><div className="inp-wrap"><span className="ico">🏢</span><input className="inp" value={form.businessName} onChange={e=>setForm(p=>({...p,businessName:e.target.value}))} placeholder="ورشة المثالية"/></div></div>
            <div className="fg full"><label className="lbl">العنوان <span style={{ color:'#ef4444' }}>*</span></label><div className="inp-wrap"><span className="ico">🗺️</span><input className="inp" required value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} placeholder="الشارع، المدينة..."/></div></div>
            <div className="fg full"><button type="submit" className="btn-primary" disabled={submitting}>{submitting ? <><Spin/> جاري الإرسال...</> : '📤 إرسال الطلب'}</button></div>
          </form>
        )}
      </div>
      <div className="card-glass">
        <div className="sec-title">🕓 سجل الطلبات ({requests.length})</div>
        {requests.length === 0 ? <div className="empty-inline">لا توجد طلبات سابقة</div> : (
          <div style={{ display:'flex', flexDirection:'column', gap:'.7rem', marginTop:'.9rem' }}>
            {requests.map(r => (
              <div key={r._id} className="req-card">
                <div className="req-top">
                  <div>{r.businessName && <div style={{ fontWeight:700, color:'#fff', fontSize:'.9rem', marginBottom:'.15rem' }}>{r.businessName}</div>}<div style={{ fontSize:'.85rem', color:'rgba(255,255,255,.55)' }}>🗺️ {r.address}</div></div>
                  <StatusBadge status={r.status}/>
                </div>
                <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,.3)', marginTop:'.5rem', display:'flex', gap:'1.2rem' }}>
                  <span>طُلب: {new Date(r.requestedAt).toLocaleDateString('ar')}</span>
                  {r.processedAt && <span>عولج: {new Date(r.processedAt).toLocaleDateString('ar')}</span>}
                </div>
                {r.rejectionReason && <div style={{ marginTop:'.5rem', fontSize:'.8rem', color:'#fca5a5', background:'rgba(239,68,68,.08)', padding:'.4rem .7rem', borderRadius:8, borderRight:'3px solid #ef4444' }}>سبب الرفض: {r.rejectionReason}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationsPage = ({ api, setToast, onRead }) => {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  useEffect(() => { api('/notifications').then(r=>setNotifs(r.data)).catch(err=>setToast({type:'error',text:err.message})).finally(()=>setLoading(false)); }, []);
  const markRead = async () => {
    try { setMarking(true); await api('/notifications/read',{method:'POST'}); setNotifs(p=>p.map(n=>({...n,read:true}))); onRead(); setToast({type:'success',text:'تم تحديد جميع الإشعارات كمقروءة.'}); }
    catch(err){ setToast({type:'error',text:err.message}); } finally { setMarking(false); }
  };
  const typeIcon = { info:'ℹ️', success:'✅', warning:'⚠️', error:'❌' };
  const unread = notifs.filter(n=>!n.read).length;
  return (
    <div className="page">
      <div className="page-hdr" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div><div className="page-title">الإشعارات {unread>0&&<span className="notif-count">{unread}</span>}</div><div className="page-sub">{notifs.length} إشعار إجمالاً</div></div>
        {unread>0 && <button className="btn-outline-sm" onClick={markRead} disabled={marking}>{marking?<Spin size={13}/>:'✔'} تحديد الكل كمقروء</button>}
      </div>
      {loading ? <div className="center-msg"><Spin size={22}/><span>جاري التحميل...</span></div>
        : notifs.length===0 ? <div className="empty-state"><div style={{ fontSize:'3rem', marginBottom:'.6rem' }}>🔔</div><div>لا توجد إشعارات</div></div>
        : <div style={{ display:'flex', flexDirection:'column', gap:'.65rem' }}>
          {notifs.map(n => (
            <div key={n._id} className={`notif-card ${n.read?'':'notif-unread'}`}>
              <div className="notif-ico">{typeIcon[n.type]||'ℹ️'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'.9rem', color:n.read?'rgba(255,255,255,.55)':'#fff', fontWeight:n.read?400:600 }}>{n.message}</div>
                <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,.28)', marginTop:'.25rem' }}>{new Date(n.createdAt).toLocaleString('ar')}</div>
              </div>
              {!n.read && <div className="unread-dot"/>}
            </div>
          ))}
        </div>}
    </div>
  );
};

const ReviewsPage = ({ api, setToast }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api('/reviews').then(r=>setData(r.data)).catch(err=>setToast({type:'error',text:err.message})).finally(()=>setLoading(false)); }, []);
  if (loading) return <div className="center-msg"><Spin size={22}/><span>جاري التحميل...</span></div>;
  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">تقييماتي</div><div className="page-sub">ما يقوله العملاء عنك</div></div>
      <div className="reviews-summary"><div className="rs-big">{data?.averageRating||'0.0'}</div><div><Stars value={Math.round(data?.averageRating||0)} readonly/><div style={{ fontSize:'.82rem', color:'rgba(255,255,255,.4)', marginTop:'.3rem' }}>مبني على {data?.totalReviews||0} تقييم</div></div></div>
      {!data?.reviews?.length ? <div className="empty-state"><div style={{ fontSize:'3rem', marginBottom:'.6rem' }}>💬</div><div>لا توجد تقييمات بعد</div></div>
        : <div style={{ display:'flex', flexDirection:'column', gap:'.9rem', marginTop:'1.2rem' }}>
          {data.reviews.map(r => (
            <div key={r._id} className="review-card">
              <div className="review-top">
                <div className="reviewer-row"><div className="rev-avatar">👤</div><div><div className="rev-name">{r.userId?.fullName||'مستخدم'}</div><div className="rev-user">@{r.userId?.username}</div></div></div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'.3rem' }}><Stars value={r.rating} readonly/><div className="rev-date">{new Date(r.createdAt).toLocaleDateString('ar')}</div></div>
              </div>
              <div className="rev-comment">{r.comment}</div>
            </div>
          ))}
        </div>}
    </div>
  );
};

const BreakdownsPage = ({ api, setToast, onReport }) => {
  const [breakdowns, setBreakdowns] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [expanded, setExpanded]     = useState(null);
  const [proposalModal, setProposalModal] = useState(null);
  const [proposalForm, setProposalForm]   = useState({ price:'', currency:'JOD', serviceDescription:'', serviceType:'onsite', estimatedTime:'', notes:'' });
  const [submitting, setSubmitting]       = useState(false);
  const [withdrawing, setWithdrawing]     = useState(null);

  const load = useCallback(async () => {
    try { setLoading(true); const res = await api('/all-breakdowns'); setBreakdowns(res.data||[]); }
    catch(err){ setToast({ type:'error', text:err.message }); } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const openProposalModal = (b) => {
    setProposalForm({ price:'', currency:'JOD', serviceDescription:'', serviceType:'onsite', estimatedTime:'', notes:'' });
    setProposalModal(b);
  };

  const submitProposal = async e => {
    e.preventDefault();
    if (!proposalForm.price || Number(proposalForm.price) < 0) { setToast({ type:'error', text:'أدخل سعراً صحيحاً' }); return; }
    try {
      setSubmitting(true);
      await api(`/breakdowns/${proposalModal._id}/proposals`, { method:'POST', body: JSON.stringify({ ...proposalForm, price: Number(proposalForm.price) }) });
      setToast({ type:'success', text:'تم إرسال اقتراحك بنجاح! ✅' });
      setProposalModal(null);
      await load();
    } catch(err){ setToast({ type:'error', text:err.message }); }
    finally { setSubmitting(false); }
  };

  const withdrawProposal = async (proposalId) => {
    try {
      setWithdrawing(proposalId);
      await api(`/proposals/${proposalId}`, { method:'DELETE' });
      setToast({ type:'success', text:'تم سحب الاقتراح.' });
      await load();
    } catch(err){ setToast({ type:'error', text:err.message }); }
    finally { setWithdrawing(null); }
  };

  const filters = [
    { key:'all',        label:'الكل'        },
    { key:'pending',    label:'متاحة'        },
    { key:'inProgress', label:'نشطة (لي)'   },
    { key:'resolved',   label:'مكتملة (لي)' },
  ];

  const visible = filter === 'all' ? breakdowns
    : filter === 'inProgress' ? breakdowns.filter(b => b.status==='inProgress')
    : filter === 'resolved'   ? breakdowns.filter(b => b.status==='resolved')
    : breakdowns.filter(b => b.status === filter);

  const fuelIcon  = { بنزين:'⛽', كهربائي:'⚡', ديزل:'🛢️', هايبرد:'🔋' };
  const transIcon = { 'أوتوماتيك':'🔄', 'يدوي (عادي)':'🕹️' };
  const pf = k => e => setProposalForm(p=>({...p,[k]:e.target.value}));

  return (
    <div className="page">
      <div className="page-hdr" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div className="page-title">طلبات الأعطال 🚗</div>
          <div className="page-sub">
            {breakdowns.filter(b=>b.status==='pending').length} طلب متاح —{' '}
            {breakdowns.filter(b=>b.status==='pending'&&b.myProposal).length} قدّمت عليها اقتراح
          </div>
        </div>
        <button className="btn-outline-sm" onClick={load}>🔄 تحديث</button>
      </div>

      <div className="filter-tabs">
        {filters.map(f => {
          const count = f.key==='all' ? breakdowns.length
            : f.key==='inProgress' ? breakdowns.filter(b=>b.status==='inProgress').length
            : f.key==='resolved'   ? breakdowns.filter(b=>b.status==='resolved').length
            : breakdowns.filter(b=>b.status===f.key).length;
          return (
            <button key={f.key} className={`filter-tab ${filter===f.key?'active':''}`} onClick={()=>setFilter(f.key)}>
              {f.label}{count>0 && <span className="tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? <div className="center-msg"><Spin size={22}/><span>جاري التحميل...</span></div>
        : visible.length===0 ? <div className="empty-state"><div style={{ fontSize:'3rem', marginBottom:'.6rem' }}>🚗</div><div>لا توجد طلبات في هذه الفئة</div></div>
        : (
        <div style={{ display:'flex', flexDirection:'column', gap:'.9rem', marginTop:'1rem' }}>
          {visible.map(b => {
            const isOpen    = expanded === b._id;
            const car       = b.carInfo        || {};
            const usr       = b.userId         || {};
            const loc       = b.location       || {};
            const prob      = b.problemDetails || {};
            const mp        = b.myProposal;
            const hasMyProp = !!mp;

            return (
              <div key={b._id} className={`bd-card ${isOpen?'bd-open':''} ${b.status==='inProgress'?'bd-mine':''}`} onClick={()=>setExpanded(isOpen?null:b._id)}>
                <div className="bd-head">
                  <div style={{ display:'flex', alignItems:'center', gap:'.75rem', flex:1, minWidth:0 }}>
                    <div className={`bd-car-ico ${b.status==='inProgress'?'bd-car-ico-active':''}`}>🚗</div>
                    <div style={{ minWidth:0 }}>
                      <div className="bd-car-name">{car.brand||'—'} {car.model||''}<span style={{ fontWeight:400, opacity:.5, marginRight:'.4rem', fontSize:'.82rem' }}>({car.year||'—'})</span></div>
                      <div className="bd-user-name">👤 {usr.fullName||usr.username||'مجهول'}{usr.username&&<span style={{ opacity:.4, marginRight:'.3rem' }}>@{usr.username}</span>}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'.5rem', flexShrink:0 }}>
                    {hasMyProp && mp.status==='pending'  && <span className="prop-mine-badge prop-mine-pending">💬 {mp.price} {mp.currency}</span>}
                    {hasMyProp && mp.status==='accepted' && <span className="prop-mine-badge prop-mine-accepted">🎉 مقبول!</span>}
                    {hasMyProp && mp.status==='rejected' && <span className="prop-mine-badge prop-mine-rejected">❌ مرفوض</span>}
                    <StatusBadge status={b.status}/>
                    {b.proposalCount>0 && <span className="prop-count-badge">{b.proposalCount} 💬</span>}
                    <span style={{ fontSize:'.75rem', color:'rgba(255,255,255,.25)', transition:'transform .2s', transform:isOpen?'rotate(180deg)':'none' }}>▼</span>
                  </div>
                </div>

                <div className="bd-quick">
                  {car.fuelType     && <span className="bd-tag">{fuelIcon[car.fuelType]||'⛽'} {car.fuelType}</span>}
                  {car.transmission && <span className="bd-tag">{transIcon[car.transmission]||'⚙️'} {car.transmission}</span>}
                  {car.mileage      && <span className="bd-tag">📏 {car.mileage.toLocaleString()} كم</span>}
                  {prob.isRecurring   && <span className="bd-tag bd-tag-warn">🔁 متكرر</span>}
                  {prob.warningLights && <span className="bd-tag bd-tag-warn">⚠️ أضواء تحذير</span>}
                  {prob.carRunning !== undefined && <span className={`bd-tag ${prob.carRunning?'':'bd-tag-warn'}`}>{prob.carRunning?'✅ السيارة تعمل':'❌ السيارة متوقفة'}</span>}
                </div>

                {isOpen && (
                  <div className="bd-details" onClick={e=>e.stopPropagation()}>
                    <div className="bd-section-title">📋 تفاصيل العطل</div>
                    {b.title       && <div className="bd-detail-item"><span className="bd-detail-lbl">العنوان</span><span className="bd-detail-val">{b.title}</span></div>}
                    {b.description && <div className="bd-detail-item"><span className="bd-detail-lbl">الوصف</span><span className="bd-detail-val">{b.description}</span></div>}

                    <div className="bd-section-title" style={{ marginTop:'.9rem' }}>🚘 معلومات السيارة</div>
                    <div className="bd-detail-grid">
                      {[['الماركة',car.brand],['الموديل',car.model],['السنة',car.year],['الكيلومترات',car.mileage?car.mileage.toLocaleString()+' كم':null],['الوقود',car.fuelType],['ناقل الحركة',car.transmission]].map(([l,v])=>v?(
                        <div key={l} className="bd-detail-item"><span className="bd-detail-lbl">{l}</span><span className="bd-detail-val">{v}</span></div>
                      ):null)}
                    </div>

                    {(loc.lat||loc.note) && (
                      <>
                        <div className="bd-section-title" style={{ marginTop:'.9rem' }}>📍 الموقع</div>
                        {loc.note && <div className="bd-detail-item"><span className="bd-detail-lbl">ملاحظة</span><span className="bd-detail-val">{loc.note}</span></div>}
                        {loc.lat && loc.lng && (
                          <button className="btn-map" onClick={()=>window.open(`https://www.google.com/maps?q=${loc.lat},${loc.lng}`,'_blank')}>
                            🗺️ فتح على الخريطة ({Number(loc.lat).toFixed(4)}, {Number(loc.lng).toFixed(4)})
                          </button>
                        )}
                      </>
                    )}

                    {hasMyProp && (
                      <div className="my-proposal-box">
                        <div className="bd-section-title" style={{ marginBottom:'.7rem' }}>📤 اقتراحي المقدَّم</div>
                        <div className="bd-detail-grid">
                          <div className="bd-detail-item"><span className="bd-detail-lbl">السعر</span><span className="bd-detail-val" style={{ color:'#fbbf24', fontWeight:800 }}>{mp.price} {mp.currency}</span></div>
                          <div className="bd-detail-item"><span className="bd-detail-lbl">الحالة</span><span className="bd-detail-val"><StatusBadge status={mp.status}/></span></div>
                          <div className="bd-detail-item"><span className="bd-detail-lbl">نوع الخدمة</span><span className="bd-detail-val">{mp.serviceType==='onsite'?'🚘 عند العميل':'🏭 في الورشة'}</span></div>
                          {mp.estimatedTime && <div className="bd-detail-item"><span className="bd-detail-lbl">الوقت المتوقع</span><span className="bd-detail-val">{mp.estimatedTime}</span></div>}
                        </div>
                        {mp.status==='pending' && (
                          <button className="btn-withdraw" disabled={withdrawing===mp._id} onClick={()=>withdrawProposal(mp._id)}>
                            {withdrawing===mp._id ? <Spin size={13}/> : '↩️'} سحب الاقتراح
                          </button>
                        )}
                      </div>
                    )}

                    <div className="bd-actions">
                      {b.status==='pending' && !hasMyProp && (
                        <button className="btn-accept" onClick={()=>openProposalModal(b)}>💬 تقديم اقتراح</button>
                      )}
                      {b.status==='pending' && hasMyProp && mp.status==='pending' && (
                        <div style={{ fontSize:'.83rem', color:'rgba(255,255,255,.35)', padding:'.5rem 0' }}>⏳ بانتظار رد العميل...</div>
                      )}
                      {b.status==='pending' && hasMyProp && mp.status==='rejected' && (
                        <button className="btn-accept" onClick={()=>openProposalModal(b)}>🔄 تقديم اقتراح جديد</button>
                      )}
                      {b.status==='inProgress' && (
                        <button className="btn-report" onClick={e=>{ e.stopPropagation(); onReport(b); }}>
                          📄 رفع تقرير الإصلاح
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!proposalModal} onClose={()=>setProposalModal(null)} title="💬 تقديم اقتراح">
        {proposalModal && (
          <>
            <div className="modal-bd-info">
              <div style={{ fontWeight:700, color:'#fff', marginBottom:'.2rem' }}>🚗 {proposalModal.carInfo?.brand} {proposalModal.carInfo?.model} {proposalModal.carInfo?.year&&`(${proposalModal.carInfo.year})`}</div>
              <div style={{ fontSize:'.82rem', color:'rgba(255,255,255,.45)' }}>{proposalModal.title}</div>
            </div>
            <form onSubmit={submitProposal} className="form-grid">
              <div className="fg"><label className="lbl">السعر المقترح <span style={{ color:'#ef4444' }}>*</span></label><div className="inp-wrap"><span className="ico">💰</span><input className="inp" type="number" min="0" step="0.5" required value={proposalForm.price} onChange={pf('price')} placeholder="0.00"/></div></div>
              <div className="fg"><label className="lbl">العملة</label><div className="inp-wrap"><span className="ico">🏦</span><select className="inp inp-select" value={proposalForm.currency} onChange={pf('currency')}>{['JOD','SAR','USD','AED','EGP'].map(c=><option key={c} value={c}>{c}</option>)}</select></div></div>
              <div className="fg full">
                <label className="lbl">نوع الخدمة <span style={{ color:'#ef4444' }}>*</span></label>
                <div style={{ display:'flex', gap:'.7rem', marginTop:'.3rem' }}>
                  {[['onsite','🚘 أذهب إلى العميل'],['workshop','🏭 العميل يأتي للورشة']].map(([v,l])=>(
                    <label key={v} className={`service-type-btn ${proposalForm.serviceType===v?'active':''}`}>
                      <input type="radio" name="serviceType" value={v} checked={proposalForm.serviceType===v} onChange={pf('serviceType')} style={{ display:'none' }}/>{l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="fg full"><label className="lbl">وصف الخدمة <span style={{ color:'#ef4444' }}>*</span></label><textarea className="inp" rows={3} required minLength={5} maxLength={600} value={proposalForm.serviceDescription} onChange={pf('serviceDescription')} placeholder="ماذا ستعمل بالضبط؟" style={{ resize:'vertical', paddingTop:'.75rem', paddingRight:'.9rem' }}/></div>
              <div className="fg"><label className="lbl">الوقت المتوقع</label><div className="inp-wrap"><span className="ico">⏱️</span><input className="inp" value={proposalForm.estimatedTime} onChange={pf('estimatedTime')} placeholder="مثلاً: ساعتين"/></div></div>
              <div className="fg"><label className="lbl">ملاحظات إضافية</label><div className="inp-wrap"><span className="ico">📝</span><input className="inp" value={proposalForm.notes} onChange={pf('notes')} placeholder="أي تفاصيل..."/></div></div>
              <div className="fg full"><button type="submit" className="btn-primary" disabled={submitting}>{submitting ? <><Spin/> جاري الإرسال...</> : '📤 إرسال الاقتراح'}</button></div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
};

const MyProposalsPage = ({ api, setToast, onReport }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [withdrawing, setWithdrawing] = useState(null);

  const load = useCallback(async () => {
    try { setLoading(true); const res = await api('/my-proposals'); setProposals(res.data||[]); }
    catch(err){ setToast({ type:'error', text:err.message }); } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const withdraw = async id => {
    try { setWithdrawing(id); await api(`/proposals/${id}`,{method:'DELETE'}); setToast({type:'success',text:'تم سحب الاقتراح.'}); await load(); }
    catch(err){ setToast({type:'error',text:err.message}); } finally { setWithdrawing(null); }
  };

  const filters = [
    { key:'all',       label:'الكل'         },
    { key:'pending',   label:'بانتظار الرد'  },
    { key:'accepted',  label:'مقبولة'        },
    { key:'rejected',  label:'مرفوضة'        },
    { key:'withdrawn', label:'مسحوبة'        },
  ];
  const visible = filter==='all' ? proposals : proposals.filter(p=>p.status===filter);

  return (
    <div className="page">
      <div className="page-hdr" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div className="page-title">اقتراحاتي 💬</div>
          <div className="page-sub">{proposals.length} اقتراح — {proposals.filter(p=>p.status==='accepted').length} مقبول</div>
        </div>
        <button className="btn-outline-sm" onClick={load}>🔄 تحديث</button>
      </div>
      <div className="filter-tabs">
        {filters.map(f=>{
          const count = f.key==='all' ? proposals.length : proposals.filter(p=>p.status===f.key).length;
          return (
            <button key={f.key} className={`filter-tab ${filter===f.key?'active':''}`} onClick={()=>setFilter(f.key)}>
              {f.label}{count>0&&<span className="tab-count">{count}</span>}
            </button>
          );
        })}
      </div>
      {loading ? <div className="center-msg"><Spin size={22}/><span>جاري التحميل...</span></div>
        : visible.length===0 ? <div className="empty-state"><div style={{ fontSize:'3rem', marginBottom:'.6rem' }}>💬</div><div>لا توجد اقتراحات</div></div>
        : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {visible.map(p=>{
            const bd  = p.breakdownId || {};
            const usr = bd.userId     || {};
            return (
              <div key={p._id} className={`prop-card ${p.status==='accepted'?'prop-card-accepted':p.status==='rejected'?'prop-card-rejected':''}`}>
                <div className="prop-top">
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="prop-bd-title">🚗 {bd.carInfo?.brand||'—'} {bd.carInfo?.model||''} — <span style={{ fontWeight:400, opacity:.65 }}>{bd.title||'بدون عنوان'}</span></div>
                    <div className="prop-bd-user">👤 {usr.fullName||'مستخدم'}{usr.username&&<span style={{ opacity:.4, marginRight:'.3rem' }}>@{usr.username}</span>}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'.4rem', flexShrink:0 }}>
                    <StatusBadge status={p.status}/>
                    <div style={{ fontSize:'1.1rem', fontWeight:900, color:'#fbbf24' }}>{p.price} {p.currency}</div>
                  </div>
                </div>
                <div className="prop-details">
                  <div className="prop-detail"><span className="prop-lbl">نوع الخدمة</span><span className="prop-val">{p.serviceType==='onsite'?'🚘 عند العميل':'🏭 في الورشة'}</span></div>
                  {p.estimatedTime && <div className="prop-detail"><span className="prop-lbl">الوقت المتوقع</span><span className="prop-val">⏱️ {p.estimatedTime}</span></div>}
                  <div className="prop-detail"><span className="prop-lbl">تاريخ التقديم</span><span className="prop-val">{new Date(p.createdAt).toLocaleDateString('ar')}</span></div>
                </div>
                <div className="prop-desc">{p.serviceDescription}</div>
                {p.notes && <div className="prop-notes">📝 {p.notes}</div>}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'.8rem', paddingTop:'.8rem', borderTop:'1px solid rgba(255,255,255,.06)' }}>
                  <span style={{ fontSize:'.78rem', color:'rgba(255,255,255,.3)' }}>حالة العطل: <StatusBadge status={bd.status||'pending'}/></span>
                  {p.status==='pending' && (
                    <button className="btn-withdraw" disabled={withdrawing===p._id} onClick={()=>withdraw(p._id)}>
                      {withdrawing===p._id?<Spin size={13}/>:'↩️'} سحب
                    </button>
                  )}
                  {p.status==='accepted' && bd.status==='inProgress' && (
                    <button className="btn-report" onClick={()=>onReport(bd)}>
                      📄 رفع تقرير الإصلاح
                    </button>
                  )}
                  {p.status==='accepted' && bd.status==='resolved' && (
                    <span style={{ fontSize:'.82rem', color:'#a78bfa', fontWeight:700 }}>✅ تم إرسال التقرير</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ReportPage = ({ api, accessToken, breakdown, setToast, onDone }) => {
  const [step, setStep]           = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [pdfBlob, setPdfBlob]     = useState(null);
  const [pdfUrl, setPdfUrl]       = useState(null);
  const [form, setForm] = useState({
    solutionSummary: '',
    finalPrice: '',
    currency: 'JOD',
    spareParts: [{ name:'', quantity:1, price:0 }],
    mechanicNotes: '',
  });

  const f   = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const sp  = (i,k) => e => setForm(p=>{ const parts=[...p.spareParts]; parts[i]={...parts[i],[k]:k==='name'?e.target.value:Number(e.target.value)}; return {...p,spareParts:parts}; });
  const addPart    = () => setForm(p=>({...p,spareParts:[...p.spareParts,{name:'',quantity:1,price:0}]}));
  const removePart = i  => setForm(p=>({...p,spareParts:p.spareParts.filter((_,idx)=>idx!==i)}));

  const totalParts = form.spareParts.reduce((s,p)=>s+(p.quantity*p.price),0);
  const grandTotal = form.finalPrice ? Number(form.finalPrice) : totalParts;

  const generatePdf = async () => {
    if (!window.jspdf) {
      await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    const W=210, margin=18;
    let y=20;

    const color = { primary:[30,130,230], dark:[20,20,35], gray:[100,110,130], light:[240,242,246], white:[255,255,255], green:[16,185,129], amber:[245,158,11] };
    const rect = (x,yy,w,h,r)=>{ doc.setFillColor(...r); doc.rect(x,yy,w,h,'F'); };
    const txt  = (t,x,yy,sz,c,bold=false,align='left')=>{ doc.setFont('helvetica',bold?'bold':'normal'); doc.setFontSize(sz); doc.setTextColor(...c); doc.text(String(t),x,yy,{align}); };
    const line = (x1,y1,x2,y2,c,w=0.3)=>{ doc.setDrawColor(...c); doc.setLineWidth(w); doc.line(x1,y1,x2,y2); };

    rect(0,0,W,38,color.primary);
    txt('Repair Report',W/2,15,20,color.white,true,'center');
    txt('AutoCare Platform',W/2,23,9,[180,220,255],false,'center');
    txt(`Date: ${new Date().toLocaleDateString('en-GB')}`,W-margin,32,8,[200,230,255],false,'right');
    y=48;

    const car=breakdown.carInfo||{};
    rect(margin,y,W-margin*2,22,color.light);
    doc.setDrawColor(...color.primary); doc.setLineWidth(0.4); doc.rect(margin,y,W-margin*2,22);
    rect(margin,y,3,22,color.primary);
    txt('Vehicle Information',margin+6,y+6,10,color.dark,true);
    txt(`${car.brand||'-'} ${car.model||''} (${car.year||'-'})`,margin+6,y+12,9,color.gray);
    txt(`Fuel: ${car.fuelType||'-'}   Transmission: ${car.transmission||'-'}   KM: ${car.mileage?.toLocaleString()||'-'}`,margin+6,y+18,8,color.gray);
    y+=28;

    txt('Problem',margin,y,11,color.dark,true);
    line(margin,y+2,W-margin,y+2,color.primary,0.4); y+=8;
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...color.gray);
    const titleLines=doc.splitTextToSize(breakdown.title||'-',W-margin*2);
    doc.text(titleLines,margin,y); y+=titleLines.length*5+4;

    txt('Solution Summary',margin,y,11,color.dark,true);
    line(margin,y+2,W-margin,y+2,color.green,0.4); y+=8;
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...color.gray);
    const solLines=doc.splitTextToSize(form.solutionSummary||'-',W-margin*2);
    doc.text(solLines,margin,y); y+=solLines.length*5+6;

    const validParts=form.spareParts.filter(p=>p.name.trim());
    if (validParts.length>0) {
      txt('Spare Parts',margin,y,11,color.dark,true);
      line(margin,y+2,W-margin,y+2,color.amber,0.4); y+=7;
      const cols={name:margin,qty:margin+80,price:margin+105,total:margin+140};
      rect(margin,y,W-margin*2,8,color.primary);
      ['Part Name','Qty','Unit Price','Total'].forEach((h,i)=>{ txt(h,[cols.name,cols.qty,cols.price,cols.total][i]+2,y+5.5,8,color.white,true); }); y+=8;
      validParts.forEach((p,idx)=>{ const rowBg=idx%2===0?color.white:color.light; rect(margin,y,W-margin*2,7,rowBg); txt(p.name,cols.name+2,y+5,8,color.dark); txt(String(p.quantity),cols.qty+2,y+5,8,color.gray); txt(`${p.price} ${form.currency}`,cols.price+2,y+5,8,color.gray); txt(`${(p.quantity*p.price).toFixed(2)} ${form.currency}`,cols.total+2,y+5,8,color.dark,true); y+=7; });
      rect(margin,y,W-margin*2,7,color.light); txt('Parts Subtotal',cols.name+2,y+5,8,color.dark,true); txt(`${totalParts.toFixed(2)} ${form.currency}`,cols.total+2,y+5,8,color.dark,true); y+=10;
    }

    rect(margin,y,W-margin*2,16,color.primary);
    txt('Total Price',margin+6,y+10,12,color.white,true);
    txt(`${grandTotal.toFixed(2)} ${form.currency}`,W-margin-4,y+10,14,color.amber,true,'right');
    y+=22;

    if (form.mechanicNotes.trim()) {
      txt('Mechanic Notes',margin,y,11,color.dark,true);
      line(margin,y+2,W-margin,y+2,color.gray,0.3); y+=8;
      doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...color.gray);
      const noteLines=doc.splitTextToSize(form.mechanicNotes,W-margin*2);
      doc.text(noteLines,margin,y); y+=noteLines.length*5+6;
    }

    rect(0,285,W,12,color.primary);
    txt('AutoCare Platform — Professional Repair Report',W/2,293,8,[180,220,255],false,'center');

    const blob=doc.output('blob');
    const url=URL.createObjectURL(blob);
    setPdfBlob(blob); setPdfUrl(url); setStep(2);
  };

  const submitReport = async () => {
    if (!pdfBlob) { setToast({ type:'error', text:'يرجى توليد الـ PDF أولاً' }); return; }
    try {
      setSubmitting(true);
      const fd=new FormData();
      fd.append('reportPdf', pdfBlob, `report_${breakdown._id}.pdf`);
      fd.append('solutionSummary', form.solutionSummary);
      fd.append('finalPrice', String(grandTotal));
      fd.append('spareParts', JSON.stringify(form.spareParts.filter(p=>p.name.trim())));
      const res=await fetch(`http://localhost:3001/api/mechanics/breakdowns/${breakdown._id}/report`,{ method:'POST', headers:{ Authorization:`Bearer ${accessToken}` }, body:fd });
      const data=await res.json();
      if (!res.ok||!data.success) throw new Error(data.error||'فشل الرفع');
      setToast({ type:'success', text:'✅ تم إرسال التقرير للعميل! تم إغلاق الطلب.' });
      setStep(3);
      setTimeout(onDone, 2000);
    } catch(err){ setToast({ type:'error', text:err.message }); } finally { setSubmitting(false); }
  };

  const car=breakdown.carInfo||{};

  return (
    <div className="page">
      <div className="page-hdr">
        <div className="page-title">📄 تقرير الإصلاح</div>
        <div style={{ background:'rgba(255,255,255,.06)', borderRadius:10, padding:'.4rem .9rem', fontSize:'.85rem', color:'rgba(255,255,255,.55)', marginTop:'.5rem', display:'inline-flex', alignItems:'center', gap:'.5rem' }}>
          🚗 {car.brand} {car.model} {car.year&&`(${car.year})`} — {breakdown.title}
        </div>
      </div>

      <div className="rpt-steps">
        {[['1','تعبئة البيانات'],['2','معاينة الـ PDF'],['3','تم الإرسال']].map(([n,l],i)=>(
          <div key={n} className={`rpt-step ${step>=Number(n)?'rpt-step-done':''} ${step===Number(n)?'rpt-step-active':''}`}>
            <div className="rpt-step-num">{step>Number(n)?'✓':n}</div>
            <div className="rpt-step-lbl">{l}</div>
            {i<2&&<div className="rpt-step-line"/>}
          </div>
        ))}
      </div>

      {step===1 && (
        <div className="card-glass" style={{ maxWidth:680 }}>
          <div className="form-grid">
            <div className="fg full">
              <label className="lbl">ملخص الحل <span style={{ color:'#ef4444' }}>*</span></label>
              <textarea className="inp" rows={4} required value={form.solutionSummary} onChange={f('solutionSummary')} placeholder="اشرح ما تم عمله لحل المشكلة..." style={{ resize:'vertical', paddingTop:'.75rem', paddingRight:'.9rem' }}/>
            </div>
            <div className="fg full">
              <div className="sec-title" style={{ marginBottom:'.8rem' }}>🔩 قطع الغيار المستخدمة</div>
              {form.spareParts.map((p,i)=>(
                <div key={i} className="part-row">
                  <div className="inp-wrap" style={{ flex:3 }}><span className="ico">🔩</span><input className="inp" value={p.name} onChange={sp(i,'name')} placeholder={`قطعة ${i+1}`}/></div>
                  <div className="inp-wrap" style={{ flex:1 }}><input className="inp" type="number" min="1" value={p.quantity} onChange={sp(i,'quantity')} placeholder="كمية" style={{ paddingRight:'.7rem' }}/></div>
                  <div className="inp-wrap" style={{ flex:1.5 }}><input className="inp" type="number" min="0" step="0.5" value={p.price} onChange={sp(i,'price')} placeholder="السعر" style={{ paddingRight:'.7rem' }}/></div>
                  <div style={{ fontSize:'.8rem', color:'#fbbf24', minWidth:50, textAlign:'center', fontWeight:700 }}>{(p.quantity*p.price).toFixed(2)}</div>
                  {form.spareParts.length>1&&<button type="button" onClick={()=>removePart(i)} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, color:'#fca5a5', width:32, height:32, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>}
                </div>
              ))}
              <button type="button" onClick={addPart} className="btn-add-part">+ إضافة قطعة</button>
              {totalParts>0&&<div style={{ textAlign:'left', marginTop:'.5rem', fontSize:'.85rem', color:'rgba(255,255,255,.4)' }}>مجموع القطع: <span style={{ color:'#fbbf24', fontWeight:700 }}>{totalParts.toFixed(2)} {form.currency}</span></div>}
            </div>
            <div className="fg">
              <label className="lbl">السعر النهائي الإجمالي</label>
              <div className="inp-wrap"><span className="ico">💰</span><input className="inp" type="number" min="0" step="0.5" value={form.finalPrice} onChange={f('finalPrice')} placeholder={totalParts>0?`${totalParts.toFixed(2)} (تلقائي)`:'ادخل المبلغ'}/></div>
            </div>
            <div className="fg">
              <label className="lbl">العملة</label>
              <div className="inp-wrap"><span className="ico">🏦</span><select className="inp inp-select" value={form.currency} onChange={f('currency')}>{['JOD','SAR','USD','AED','EGP'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div className="fg full">
              <label className="lbl">ملاحظات إضافية (اختياري)</label>
              <textarea className="inp" rows={2} value={form.mechanicNotes} onChange={f('mechanicNotes')} placeholder="توصيات للصيانة القادمة..." style={{ resize:'vertical', paddingTop:'.75rem', paddingRight:'.9rem' }}/>
            </div>
            <div className="fg full">
              <div className="total-box">
                <span style={{ fontSize:'.95rem', color:'rgba(255,255,255,.55)' }}>إجمالي الفاتورة</span>
                <span style={{ fontSize:'1.6rem', fontWeight:900, color:'#f59e0b' }}>{grandTotal.toFixed(2)} <span style={{ fontSize:'1rem', fontWeight:400 }}>{form.currency}</span></span>
              </div>
            </div>
            <div className="fg full">
              <button className="btn-primary" disabled={!form.solutionSummary.trim()||(!form.finalPrice&&totalParts===0)} onClick={generatePdf}>
                👁️ معاينة وتوليد الـ PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {step===2 && pdfUrl && (
        <div style={{ maxWidth:680 }}>
          <div className="card-glass" style={{ marginBottom:'1rem' }}>
            <div className="sec-title" style={{ marginBottom:'1rem' }}>👁️ معاينة التقرير</div>
            <iframe src={pdfUrl} width="100%" height="500px" style={{ borderRadius:10, border:'1px solid rgba(255,255,255,.1)' }} title="PDF Preview"/>
          </div>
          <div style={{ display:'flex', gap:'.9rem' }}>
            <button className="btn-outline-sm" style={{ flex:1, justifyContent:'center', padding:'.8rem' }} onClick={()=>setStep(1)}>✏️ تعديل</button>
            <a href={pdfUrl} download={`repair-report.pdf`} className="btn-outline-sm" style={{ flex:1, justifyContent:'center', padding:'.8rem', textDecoration:'none', textAlign:'center' }}>⬇️ تحميل</a>
            <button className="btn-primary" style={{ flex:2 }} disabled={submitting} onClick={submitReport}>
              {submitting?<><Spin/> جاري الإرسال...</>:'📤 إرسال للعميل'}
            </button>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="card-glass" style={{ textAlign:'center', padding:'3rem', maxWidth:500 }}>
          <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🎉</div>
          <div style={{ fontSize:'1.3rem', fontWeight:900, color:'#6ee7b7', marginBottom:'.5rem' }}>تم إرسال التقرير بنجاح!</div>
          <div style={{ color:'rgba(255,255,255,.45)', fontSize:'.9rem' }}>وصل الـ PDF للعميل ويمكنه تحميله وتقييم خدمتك الآن.</div>
        </div>
      )}
    </div>
  );
};

export default function MechanicDashboard() {
  const [accessToken] = useState(() => (typeof window!=='undefined'?localStorage.getItem('accessToken'):'')||'');
  const [user, setUser]               = useState(null);
  const [page, setPage]               = useState('overview');
  const [toast, setToastSt]           = useState({ type:'', text:'' });
  const [unread, setUnread]           = useState(0);
  const [mounted, setMounted]         = useState(false);
  const [reportBreakdown, setReportBreakdown] = useState(null);

  const api = useApi(accessToken);
  const setToast = msg => { setToastSt(msg); setTimeout(()=>setToastSt({type:'',text:''}),3500); };

  useEffect(() => {
    setMounted(true);
    if (!accessToken) return;
    Promise.all([api('/profile'),api('/notifications')])
      .then(([prof,notifs])=>{ setUser(prof.data); setUnread(notifs.data.filter(n=>!n.read).length); })
      .catch(()=>{});
  }, []);

  const handleReport = (breakdown) => {
    setReportBreakdown(breakdown);
    setPage('report');
  };

  const navItems = [
    { key:'overview',     icon:'📊', label:'نظرة عامة'    },
    { key:'profile',      icon:'👤', label:'ملفي الشخصي'  },
    { key:'location',     icon:'📍', label:'الموقع'        },
    { key:'breakdowns',   icon:'🚗', label:'طلبات الأعطال' },
    { key:'my-proposals', icon:'💬', label:'اقتراحاتي'     },
    { key:'notifications',icon:'🔔', label:'الإشعارات', badge:unread },
    { key:'reviews',      icon:'⭐', label:'التقييمات'     },
  ];

  if (!mounted) return null;
  if (!accessToken) return (
    <div style={{ minHeight:'100vh', background:'#06080f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Tajawal,sans-serif', color:'#fff', direction:'rtl', fontSize:'1.1rem' }}>
      <div style={{ textAlign:'center' }}><div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔐</div><div>يجب تسجيل الدخول أولاً</div></div>
    </div>
  );

  const renderPage = () => {
    if (page==='report' && reportBreakdown)
      return <ReportPage api={api} accessToken={accessToken} breakdown={reportBreakdown} setToast={setToast} onDone={()=>{ setPage('breakdowns'); setReportBreakdown(null); }}/>;
    if (page==='overview')      return <OverviewPage      api={api} user={user} setToast={setToast}/>;
    if (page==='profile')       return <ProfilePage       api={api} user={user} onUpdate={setUser} setToast={setToast}/>;
    if (page==='location')      return <LocationPage      api={api} setToast={setToast}/>;
    if (page==='breakdowns')    return <BreakdownsPage    api={api} setToast={setToast} onReport={handleReport}/>;
    if (page==='my-proposals')  return <MyProposalsPage   api={api} setToast={setToast} onReport={handleReport}/>;
    if (page==='notifications') return <NotificationsPage api={api} setToast={setToast} onRead={()=>setUnread(0)}/>;
    if (page==='reviews')       return <ReviewsPage       api={api} setToast={setToast}/>;
  };

  const handleLogout = () => {
  localStorage.removeItem('accessToken');
  window.location.href = '/auth';
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Sora:wght@600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body,html{background:#06080f;font-family:'Tajawal',sans-serif;direction:rtl;color:#e2e8f0;min-height:100vh}
        @keyframes rot{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes bdSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .layout{display:flex;min-height:100vh}
        .sidebar{width:235px;flex-shrink:0;background:rgba(255,255,255,.025);border-left:1px solid rgba(255,255,255,.065);display:flex;flex-direction:column;padding:1.4rem .9rem;position:sticky;top:0;height:100vh;backdrop-filter:blur(20px)}
        .sb-brand{display:flex;align-items:center;gap:.65rem;margin-bottom:1.8rem;padding:.25rem .5rem}
        .sb-logo{width:40px;height:40px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
        .sb-title{font-family:'Sora',sans-serif;font-size:1.1rem;font-weight:700;color:#fff}
        .user-chip{display:flex;align-items:center;gap:.65rem;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.18);border-radius:13px;padding:.8rem .9rem;margin-bottom:1.5rem}
        .uc-av{width:38px;height:38px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
        .uc-name{font-size:.86rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .uc-role{font-size:.7rem;color:rgba(245,158,11,.7)}
        .nav-btn{display:flex;align-items:center;justify-content:space-between;padding:.68rem .9rem;border-radius:11px;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:500;color:rgba(255,255,255,.42);cursor:pointer;transition:all .2s;margin-bottom:.22rem;border:none;background:transparent;width:100%;text-align:right}
        .nav-btn:hover{background:rgba(255,255,255,.055);color:rgba(255,255,255,.78)}
        .nav-btn.active{background:rgba(245,158,11,.12);color:#fbbf24;font-weight:700;border:1px solid rgba(245,158,11,.22)}
        .nav-left{display:flex;align-items:center;gap:.6rem}
        .nav-ico{font-size:1rem;width:20px;text-align:center}
        .nav-badge{background:#ef4444;color:#fff;font-size:.65rem;font-weight:800;padding:.15rem .45rem;border-radius:20px;min-width:18px;text-align:center;animation:pulse 2s infinite}
        .main{flex:1;overflow-y:auto;padding:2rem;max-width:900px}
        .page{animation:up .35s ease}
        .page-hdr{margin-bottom:1.8rem}
        .page-title{font-size:1.55rem;font-weight:900;color:#fff;display:flex;align-items:center;gap:.6rem}
        .page-sub{font-size:.88rem;color:rgba(255,255,255,.32);margin-top:.25rem}
        .card-glass{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:1.6rem;backdrop-filter:blur(16px)}
        .sec-title{font-size:1rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:.5rem}
        .stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.9rem}
        .stat-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:1.2rem;text-align:center;transition:border-color .2s,transform .2s}
        .stat-card:hover{border-color:rgba(245,158,11,.25);transform:translateY(-2px)}
        .stat-ico{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin:0 auto .7rem}
        .stat-val{font-size:1.6rem;font-weight:900;color:#fff;margin-bottom:.2rem}
        .stat-lbl{font-size:.78rem;color:rgba(255,255,255,.38)}
        .loc-info-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.7rem}
        .loc-pill{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.35rem .75rem;font-size:.82rem;color:rgba(255,255,255,.6)}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .fg{display:flex;flex-direction:column}
        .fg.full{grid-column:1/-1}
        .lbl{font-size:.78rem;font-weight:600;color:rgba(255,255,255,.38);margin-bottom:.32rem}
        .inp-wrap{position:relative}
        .ico{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:.88rem;opacity:.38;pointer-events:none}
        .inp{width:100%;padding:.76rem 2.5rem .76rem .9rem;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);border-radius:11px;color:#fff;font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none;transition:border-color .2s,background .2s,box-shadow .2s;text-align:right}
        .inp::placeholder{color:rgba(255,255,255,.2)}
        .inp:focus{border-color:#f59e0b;background:rgba(245,158,11,.07);box-shadow:0 0 0 3px rgba(245,158,11,.14)}
        .inp-select{appearance:none;padding-left:1.8rem;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,.3)'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:left 10px center}
        .inp-select option{background:#1a1a2e}
        textarea.inp{padding-right:.9rem}
        .profile-hero{display:flex;align-items:center;gap:1.1rem;margin-bottom:1.8rem;padding-bottom:1.4rem;border-bottom:1px solid rgba(255,255,255,.07)}
        .hero-avatar{width:62px;height:62px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.7rem;flex-shrink:0}
        .hero-name{font-size:1.12rem;font-weight:700;color:#fff}
        .hero-user{font-size:.82rem;color:rgba(255,255,255,.38);margin:.18rem 0}
        .role-badge{display:inline-block;font-size:.7rem;font-weight:700;padding:.18rem .55rem;border-radius:20px;background:rgba(245,158,11,.15);color:#fbbf24;letter-spacing:.4px}
        .btn-primary{padding:.82rem;background:linear-gradient(135deg,#f59e0b,#ef4444);border:none;border-radius:12px;color:#fff;font-family:'Tajawal',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;box-shadow:0 4px 18px rgba(245,158,11,.35);width:100%}
        .btn-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 24px rgba(245,158,11,.5)}
        .btn-primary:disabled{opacity:.55;cursor:not-allowed}
        .btn-outline-sm{padding:.44rem .95rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:9px;color:rgba(255,255,255,.6);font-family:'Tajawal',sans-serif;font-size:.83rem;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:.4rem}
        .btn-outline-sm:hover{background:rgba(255,255,255,.12);color:#fff}
        .btn-outline-sm:disabled{opacity:.5;cursor:not-allowed}
        .detail-row{display:flex;justify-content:space-between;align-items:flex-start;padding:.55rem 0;border-bottom:1px solid rgba(255,255,255,.05)}
        .detail-row:last-child{border-bottom:none}
        .detail-lbl{font-size:.82rem;color:rgba(255,255,255,.38)}
        .detail-val{font-size:.88rem;color:#fff;font-weight:500;text-align:left;max-width:60%;word-break:break-word}
        .info-banner{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:11px;padding:.85rem 1rem;font-size:.87rem;color:#fbbf24;margin-top:.9rem;display:flex;align-items:center;gap:.6rem}
        .empty-inline{font-size:.85rem;color:rgba(255,255,255,.3);padding:.9rem 0}
        .empty-state{text-align:center;padding:4rem 2rem;color:rgba(255,255,255,.3);font-size:.92rem}
        .center-msg{display:flex;align-items:center;justify-content:center;gap:.7rem;padding:3rem;color:rgba(255,255,255,.35);font-size:.92rem}
        .req-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:13px;padding:1rem 1.1rem}
        .req-top{display:flex;align-items:flex-start;justify-content:space-between;gap:.7rem}
        .notif-count{background:#ef4444;color:#fff;font-size:.7rem;font-weight:800;padding:.15rem .5rem;border-radius:20px;vertical-align:middle}
        .notif-card{display:flex;align-items:flex-start;gap:.8rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:.9rem 1rem;transition:border-color .2s}
        .notif-unread{border-color:rgba(245,158,11,.22);background:rgba(245,158,11,.04)}
        .notif-ico{font-size:1.1rem;flex-shrink:0;margin-top:.1rem}
        .unread-dot{width:8px;height:8px;border-radius:50%;background:#f59e0b;flex-shrink:0;margin-top:.35rem;animation:pulse 2s infinite}
        .reviews-summary{display:flex;align-items:center;gap:1.2rem;background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.18);border-radius:18px;padding:1.3rem 1.5rem}
        .rs-big{font-size:3rem;font-weight:900;color:#f59e0b;line-height:1}
        .review-card{background:rgba(255,255,255,.038);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:1.1rem}
        .review-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.7rem}
        .reviewer-row{display:flex;align-items:center;gap:.65rem}
        .rev-avatar{width:38px;height:38px;background:rgba(99,102,241,.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0}
        .rev-name{font-size:.9rem;font-weight:700;color:#fff}
        .rev-user{font-size:.75rem;color:rgba(255,255,255,.33)}
        .rev-date{font-size:.74rem;color:rgba(255,255,255,.28)}
        .rev-comment{font-size:.87rem;color:rgba(255,255,255,.6);line-height:1.65}
        .mini-review{background:rgba(255,255,255,.03);border-radius:10px;padding:.7rem .9rem}
        .filter-tabs{display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:.5rem}
        .filter-tab{padding:.38rem .85rem;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.45);font-family:'Tajawal',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:.35rem}
        .filter-tab:hover{background:rgba(255,255,255,.09);color:#fff}
        .filter-tab.active{background:rgba(245,158,11,.14);border-color:rgba(245,158,11,.35);color:#fbbf24}
        .tab-count{background:rgba(255,255,255,.12);border-radius:20px;padding:.05rem .42rem;font-size:.72rem}
        .filter-tab.active .tab-count{background:rgba(245,158,11,.2);color:#f59e0b}
        .bd-card{background:rgba(255,255,255,.036);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:1.1rem 1.2rem;cursor:pointer;transition:border-color .2s,background .2s,transform .15s}
        .bd-card:hover{border-color:rgba(245,158,11,.2);background:rgba(255,255,255,.05);transform:translateY(-1px)}
        .bd-card.bd-open{border-color:rgba(245,158,11,.32);background:rgba(245,158,11,.04);transform:none}
        .bd-card.bd-mine{border-color:rgba(56,189,248,.25)!important}
        .bd-head{display:flex;align-items:center;justify-content:space-between;gap:.7rem}
        .bd-car-ico{width:44px;height:44px;background:rgba(245,158,11,.1);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0}
        .bd-car-ico-active{background:rgba(56,189,248,.15)!important}
        .bd-car-name{font-size:.98rem;font-weight:700;color:#fff;margin-bottom:.18rem}
        .bd-user-name{font-size:.8rem;color:rgba(255,255,255,.4)}
        .bd-quick{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.75rem}
        .bd-tag{font-size:.74rem;padding:.22rem .62rem;border-radius:20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55)}
        .bd-tag-warn{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.25);color:#fbbf24}
        .bd-details{margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.07);animation:bdSlide .25s ease}
        .bd-section-title{font-size:.8rem;font-weight:700;color:rgba(255,255,255,.35);letter-spacing:.8px;margin-bottom:.55rem}
        .bd-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:.3rem .9rem}
        .bd-detail-item{display:flex;justify-content:space-between;align-items:flex-start;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.04)}
        .bd-detail-item:last-child{border-bottom:none}
        .bd-detail-lbl{font-size:.8rem;color:rgba(255,255,255,.35);flex-shrink:0}
        .bd-detail-val{font-size:.85rem;color:#fff;font-weight:500;text-align:left;word-break:break-word;max-width:58%}
        .btn-map{display:flex;align-items:center;gap:.5rem;margin-top:.6rem;padding:.55rem 1rem;background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.25);border-radius:10px;color:#38bdf8;font-family:'Tajawal',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s;width:100%;justify-content:center}
        .btn-map:hover{background:rgba(56,189,248,.2)}
        .bd-actions{display:flex;gap:.7rem;margin-top:1rem;padding-top:.9rem;border-top:1px solid rgba(255,255,255,.07);flex-wrap:wrap}
        .btn-accept{flex:1;padding:.7rem;background:rgba(16,185,129,.14);border:1px solid rgba(16,185,129,.3);border-radius:11px;color:#6ee7b7;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.4rem}
        .btn-accept:hover:not(:disabled){background:rgba(16,185,129,.25);border-color:rgba(16,185,129,.5)}
        .btn-accept:disabled{opacity:.5;cursor:not-allowed}
        .btn-report{width:100%;padding:.7rem;background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.3);border-radius:11px;color:#a78bfa;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.4rem;margin-top:.3rem}
        .btn-report:hover{background:rgba(167,139,250,.22);border-color:rgba(167,139,250,.5)}
        .prop-count-badge{font-size:.7rem;padding:.18rem .5rem;background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.25);border-radius:20px;color:#38bdf8}
        .prop-mine-badge{font-size:.72rem;font-weight:700;padding:.2rem .6rem;border-radius:20px}
        .prop-mine-pending{background:rgba(245,158,11,.14);color:#fbbf24;border:1px solid rgba(245,158,11,.3)}
        .prop-mine-accepted{background:rgba(16,185,129,.14);color:#6ee7b7;border:1px solid rgba(16,185,129,.3)}
        .prop-mine-rejected{background:rgba(239,68,68,.1);color:#fca5a5;border:1px solid rgba(239,68,68,.25)}
        .my-proposal-box{background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.18);border-radius:14px;padding:1rem;margin-top:.9rem}
        .btn-withdraw{padding:.45rem .9rem;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:9px;color:#fca5a5;font-family:'Tajawal',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:.35rem;margin-top:.7rem}
        .btn-withdraw:hover:not(:disabled){background:rgba(239,68,68,.2)}
        .btn-withdraw:disabled{opacity:.5;cursor:not-allowed}
        .modal-bd-info{background:rgba(255,255,255,.05);border-radius:11px;padding:.8rem 1rem;margin-bottom:1.2rem;border-right:3px solid #f59e0b}
        .service-type-btn{flex:1;padding:.65rem;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);font-family:'Tajawal',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;text-align:center;transition:all .2s}
        .service-type-btn.active{background:rgba(245,158,11,.14);border-color:rgba(245,158,11,.35);color:#fbbf24}
        .prop-card{background:rgba(255,255,255,.036);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:1.2rem 1.4rem}
        .prop-card-accepted{border-color:rgba(16,185,129,.3)!important;background:rgba(16,185,129,.04)!important}
        .prop-card-rejected{border-color:rgba(239,68,68,.2)!important;opacity:.7}
        .prop-top{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:.9rem}
        .prop-bd-title{font-size:.95rem;font-weight:700;color:#fff;margin-bottom:.25rem}
        .prop-bd-user{font-size:.8rem;color:rgba(255,255,255,.38)}
        .prop-details{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;margin-bottom:.7rem}
        .prop-detail{display:flex;align-items:center;gap:.4rem}
        .prop-lbl{font-size:.78rem;color:rgba(255,255,255,.35)}
        .prop-val{font-size:.82rem;color:rgba(255,255,255,.65);font-weight:600}
        .prop-desc{font-size:.87rem;color:rgba(255,255,255,.55);line-height:1.6;padding:.6rem .8rem;background:rgba(255,255,255,.04);border-radius:10px;margin-bottom:.5rem}
        .prop-notes{font-size:.8rem;color:rgba(255,255,255,.35);padding:.4rem .7rem;border-right:2px solid rgba(255,255,255,.12)}

        .rpt-steps{display:flex;align-items:center;margin-bottom:1.8rem;gap:0}
        .rpt-step{display:flex;flex-direction:column;align-items:center;position:relative;flex:1}
        .rpt-step-num{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:700;color:rgba(255,255,255,.35);transition:all .3s;z-index:1}
        .rpt-step-lbl{font-size:.72rem;color:rgba(255,255,255,.3);margin-top:.4rem;white-space:nowrap}
        .rpt-step-line{position:absolute;top:17px;right:calc(50% + 17px);left:calc(-50% + 17px);height:2px;background:rgba(255,255,255,.1);z-index:0}
        .rpt-step-done .rpt-step-num{background:rgba(16,185,129,.2);border-color:#10b981;color:#6ee7b7}
        .rpt-step-done .rpt-step-lbl{color:#6ee7b7}
        .rpt-step-done .rpt-step-line{background:rgba(16,185,129,.4)}
        .rpt-step-active .rpt-step-num{background:rgba(245,158,11,.2);border-color:#f59e0b;color:#fbbf24;box-shadow:0 0 0 4px rgba(245,158,11,.15)}
        .rpt-step-active .rpt-step-lbl{color:#fbbf24}
        .part-row{display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem}
        .btn-add-part{margin-top:.4rem;padding:.4rem .85rem;background:rgba(56,189,248,.08);border:1px dashed rgba(56,189,248,.3);border-radius:9px;color:#38bdf8;font-family:'Tajawal',sans-serif;font-size:.83rem;cursor:pointer;transition:all .2s}
        .btn-add-part:hover{background:rgba(56,189,248,.15)}
        .total-box{display:flex;justify-content:space-between;align-items:center;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:14px;padding:1rem 1.2rem}

        @media(max-width:680px){
          .sidebar{display:none}.main{padding:1rem}.form-grid{grid-template-columns:1fr}.fg.full{grid-column:1}
          .bd-detail-grid{grid-template-columns:1fr}.bd-actions{flex-direction:column}
        }
      `}</style>

      <div className="layout">
        <nav className="sidebar">
          <div className="sb-brand"><div className="sb-logo">🔧</div><div className="sb-title">MechPanel</div></div>
          {user && (
            <div className="user-chip">
              <div className="uc-av">🔧</div>
              <div style={{ overflow:'hidden' }}><div className="uc-name">{user.fullName}</div><div className="uc-role">ميكانيكي</div></div>
            </div>
          )}
          {navItems.map(n => (
            <button key={n.key} className={`nav-btn ${page===n.key?'active':''}`} onClick={()=>{ setPage(n.key); setReportBreakdown(null); }}>
              <div className="nav-left"><span className="nav-ico">{n.icon}</span>{n.label}</div>
              {n.badge>0 && <span className="nav-badge">{n.badge}</span>}
            </button>
          ))}
          <div style={{ marginTop:'auto', paddingTop:'1rem' }}>
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
</div>
        </nav>
        <main className="main">{renderPage()}</main>
      </div>
      <Toast msg={toast} onClose={()=>setToastSt({type:'',text:''})}/>
    </>
  );
}