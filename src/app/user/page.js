'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { useAccessToken } from '../useAccessToken';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE =`${API_BASE_URL}/api/users`;

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

const Stars = ({ value, onChange, readonly = false }) => (
  <div style={{ display:'flex', gap:4 }}>
    {[1,2,3,4,5].map(n => (
      <span key={n} onClick={()=>!readonly&&onChange&&onChange(n)} style={{ fontSize:readonly?'1rem':'1.4rem', cursor:readonly?'default':'pointer', color:n<=value?'#f59e0b':'rgba(255,255,255,.15)', transition:'color .15s', userSelect:'none' }}>★</span>
    ))}
  </div>
);

const Toast = ({ msg, onClose }) => {
  if (!msg.text) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', bottom:24, right:24, zIndex:9999, padding:'.8rem 1.2rem', borderRadius:12, fontSize:'.88rem', fontWeight:600, cursor:'pointer', animation:'toastIn .3s ease', background:msg.type==='error'?'rgba(239,68,68,.15)':'rgba(16,185,129,.15)', color:msg.type==='error'?'#fca5a5':'#6ee7b7', border:`1px solid ${msg.type==='error'?'rgba(239,68,68,.3)':'rgba(16,185,129,.3)'}`, backdropFilter:'blur(12px)' }}>
      {msg.type==='error'?'❌':'✅'} {msg.text}
    </div>
  );
};

const Spin = () => (
  <span style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(255,255,255,.2)', borderTopColor:'#fff', borderRadius:'50%', animation:'rot .6s linear infinite', verticalAlign:'middle' }} />
);

const StatusBadge = ({ status }) => {
  const map = {
    pending:    { color:'#fbbf24', bg:'rgba(251,191,36,.12)',  icon:'⏳', label:'قيد الانتظار' },
    inProgress: { color:'#38bdf8', bg:'rgba(56,189,248,.12)',  icon:'🔧', label:'جاري العمل'   },
    resolved:   { color:'#6ee7b7', bg:'rgba(110,231,183,.12)', icon:'✅', label:'تم الحل'      },
    cancelled:  { color:'#f87171', bg:'rgba(248,113,113,.12)', icon:'❌', label:'ملغي'          },
  };
  const s = map[status] || map.pending;
  return <span style={{ fontSize:'.72rem', fontWeight:700, padding:'.2rem .6rem', borderRadius:20, background:s.bg, color:s.color, border:`1px solid ${s.color}33` }}>{s.icon} {s.label}</span>;
};

const ProfilePage = ({ api, initialUser, onUpdate, setToast }) => {
  const [form, setForm] = useState({ username:initialUser?.username||'', fullName:initialUser?.fullName||'', email:initialUser?.email||'', bio:initialUser?.profileData?.bio||'', phone:initialUser?.profileData?.phone||'' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
  e.preventDefault();

  // ✅ تحقق من التاريخ
  if (form.problemStarted) {
    const selectedDate = new Date(form.problemStarted);
    const today = new Date();

    // إزالة الوقت للمقارنة فقط بالتاريخ
    today.setHours(0,0,0,0);

    // ❌ إذا التاريخ في المستقبل
    if (selectedDate > today) {
      setToast({ type: 'error', text: '❌ لا يمكن اختيار تاريخ في المستقبل' });
      return;
    }

    // ❌ إذا التاريخ أقدم من سنة السيارة
    if (form.carYear && selectedDate.getFullYear() < Number(form.carYear)) {
      setToast({ type: 'error', text: '❌ تاريخ المشكلة لا يمكن أن يكون قبل سنة صنع السيارة' });
      return;
    }
  }

  if(!form.lat || !form.lng){
    setToast({type:'error',text:'يرجى تحديد الموقع الجغرافي'});
    return;
  }

  try {
    setLoading(true);
    const fd = new FormData();
    fd.append('title',form.title);
    fd.append('description',form.description);

    fd.append('carInfo',JSON.stringify({
      brand:form.carBrand,
      model:form.carModel,
      year:Number(form.carYear),
      fuelType:form.fuelType,
      transmission:form.transmission,
      mileage:Number(form.mileage)
    }));

    fd.append('problemDetails',JSON.stringify({
      startedAt:form.problemStarted,
      isRecurring:form.isRecurring,
      warningLights:form.warningLights,
      carRunning:form.carRunning
    }));

    fd.append('location',JSON.stringify({
      lat:Number(form.lat),
      lng:Number(form.lng),
      note:form.locationNote
    }));

    images.forEach(img=>fd.append('photos',img.file));

    const res = await fetch(`${API_BASE}/breakdowns`,{
      method:'POST',
      headers:{ Authorization:`Bearer ${accessToken}` },
      body:fd
    });

    const data = await res.json();
    if(!res.ok||!data.success) throw new Error(data.error||'Request failed');

    setToast({ type:'success', text:'تم نشر منشور العطل بنجاح! 🚗' });
    onDone();

  } catch(err){
    setToast({type:'error',text:err.message});
  } finally {
    setLoading(false);
  }
};
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));
  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">الملف الشخصي</div><div className="page-sub">عدّل بياناتك الشخصية</div></div>
      <div className="card-glass">
        <div className="profile-avatar-row">
          <div className="big-avatar">👤</div>
          <div><div className="pname">{initialUser?.fullName}</div><div className="pemail">@{initialUser?.username}</div></div>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="fg"><label className="lbl">الاسم الكامل</label><div className="inp-wrap"><span className="ico">👤</span><input className="inp" value={form.fullName} onChange={f('fullName')} placeholder="الاسم الكامل"/></div></div>
          <div className="fg"><label className="lbl">اسم المستخدم</label><div className="inp-wrap"><span className="ico">🪪</span><input className="inp" value={form.username} onChange={f('username')} placeholder="username"/></div></div>
          <div className="fg full"><label className="lbl">البريد الإلكتروني</label><div className="inp-wrap"><span className="ico">✉️</span><input className="inp" type="email" value={form.email} onChange={f('email')} placeholder="email@example.com"/></div></div>
          <div className="fg"><label className="lbl">رقم الهاتف</label><div className="inp-wrap"><span className="ico">📞</span><input className="inp" value={form.phone} onChange={f('phone')} placeholder="+962 7x xxx xxxx"/></div></div>
          <div className="fg full"><label className="lbl">نبذة شخصية</label><textarea className="inp" rows={3} value={form.bio} onChange={f('bio')} placeholder="اكتب نبذة..." style={{ resize:'vertical', paddingTop:'.75rem' }}/></div>
          <div className="fg full"><button type="submit" className="btn-primary" disabled={loading}>{loading?<><Spin/> جاري الحفظ...</>:'💾 حفظ التغييرات'}</button></div>
        </form>
      </div>
    </div>
  );
};

const MechanicsPage = ({ api, setToast, onSelectMechanic }) => {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  useEffect(() => { api('/mechanics').then(r=>setMechanics(r.data)).catch(err=>setToast({type:'error',text:err.message})).finally(()=>setLoading(false)); }, []);
  const filtered = mechanics.filter(m=>m.fullName.toLowerCase().includes(search.toLowerCase())||m.username.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">الميكانيكيون</div><div className="page-sub">{mechanics.length} ميكانيكي متاح</div></div>
      <div className="inp-wrap" style={{ marginBottom:'1.2rem' }}><span className="ico">🔍</span><input className="inp" placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      {loading ? <div className="center-msg"><Spin/> جاري التحميل...</div>
        : filtered.length===0 ? <div className="center-msg">لا توجد نتائج</div>
        : <div className="mech-grid">{filtered.map(m=>(
          <div key={m._id} className="mech-card">
            <div className="mech-avatar">🔧</div>
            <div className="mech-name">{m.fullName}</div>
            <div className="mech-user">@{m.username}</div>
            {m.profileData?.bio    && <div className="mech-bio">{m.profileData.bio}</div>}
            {m.profileData?.phone  && <div className="mech-phone">📞 {m.profileData.phone}</div>}
            <div className="mech-actions">
              <button className="btn-sm btn-outline" onClick={()=>onSelectMechanic(m,'reviews')}>⭐ التقييمات</button>
              <button className="btn-sm btn-primary-sm" onClick={()=>onSelectMechanic(m,'write')}>✍️ قيّم</button>
            </div>
          </div>
        ))}</div>}
    </div>
  );
};

const MechanicReviewsPage = ({ api, mechanic, setToast, onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => { setLoading(true); api(`/mechanics/${mechanic._id}/reviews`).then(r=>setReviews(r.data)).catch(err=>setToast({type:'error',text:err.message})).finally(()=>setLoading(false)); }, [api,mechanic._id]);
  useEffect(()=>{ load(); },[load]);
  const avg = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null;
  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← رجوع</button>
      <div className="page-hdr">
        <div className="page-title">تقييمات {mechanic.fullName}</div>
        {avg&&<div className="avg-row"><Stars value={Math.round(avg)} readonly/><span className="avg-num">{avg}/5</span><span className="rev-count">({reviews.length} تقييم)</span></div>}
      </div>
      {loading?<div className="center-msg"><Spin/> جاري التحميل...</div>:reviews.length===0?<div className="empty-state"><div style={{fontSize:'3rem',marginBottom:'.5rem'}}>💬</div><div>لا توجد تقييمات</div></div>
        :<div className="reviews-list">{reviews.map(r=>(
          <div key={r._id} className="review-card">
            <div className="review-top"><div className="reviewer-info"><div className="reviewer-avatar">👤</div><div><div className="reviewer-name">{r.userId?.fullName||'مستخدم'}</div><div className="reviewer-user">@{r.userId?.username}</div></div></div><div className="review-right"><Stars value={r.rating} readonly/><div className="review-date">{new Date(r.createdAt).toLocaleDateString('ar')}</div></div></div>
            <div className="review-comment">{r.comment}</div>
          </div>
        ))}</div>}
    </div>
  );
};

const WriteReviewPage = ({ api, mechanic, setToast, onBack }) => {
  const [form, setForm] = useState({ rating:0, comment:'' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    if (form.rating===0){ setToast({type:'error',text:'اختر تقييماً من 1 إلى 5.'}); return; }
    try { setLoading(true); await api('/reviews',{ method:'POST', body:JSON.stringify({ mechanicId:mechanic._id, rating:form.rating, comment:form.comment }) }); setToast({type:'success',text:'تم إرسال التقييم!'}); onBack(); }
    catch(err){ setToast({type:'error',text:err.message}); } finally { setLoading(false); }
  };
  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← رجوع</button>
      <div className="page-hdr"><div className="page-title">تقييم {mechanic.fullName}</div><div className="page-sub">شاركنا تجربتك</div></div>
      <div className="card-glass" style={{ maxWidth:520 }}>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="fg full"><label className="lbl">التقييم</label><div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginTop:'.3rem' }}><Stars value={form.rating} onChange={r=>setForm(p=>({...p,rating:r}))}/>{form.rating>0&&<span style={{ color:'#f59e0b', fontWeight:700, fontSize:'1.1rem' }}>{form.rating}/5</span>}</div></div>
          <div className="fg full"><label className="lbl">تعليقك ({form.comment.length}/1000)</label><textarea className="inp" rows={5} required maxLength={1000} value={form.comment} onChange={e=>setForm(p=>({...p,comment:e.target.value}))} placeholder="اكتب تجربتك..." style={{ resize:'vertical', paddingTop:'.75rem' }}/></div>
          <div className="fg full"><button type="submit" className="btn-primary" disabled={loading}>{loading?<><Spin/> جاري الإرسال...</>:'🌟 إرسال التقييم'}</button></div>
        </form>
      </div>
    </div>
  );
};

const MyReviewsPage = ({ api, setToast }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ api('/my-reviews').then(r=>setReviews(r.data)).catch(err=>setToast({type:'error',text:err.message})).finally(()=>setLoading(false)); },[]);
  return (
    <div className="page">
      <div className="page-hdr"><div className="page-title">تقييماتي</div><div className="page-sub">{reviews.length} تقييم</div></div>
      {loading?<div className="center-msg"><Spin/> جاري التحميل...</div>:reviews.length===0?<div className="empty-state"><div style={{fontSize:'3rem',marginBottom:'.5rem'}}>📋</div><div>لم تقدّم أي تقييمات بعد</div></div>
        :<div className="reviews-list">{reviews.map(r=>(
          <div key={r._id} className="review-card">
            <div className="review-top"><div className="reviewer-info"><div className="mech-avatar" style={{width:42,height:42,fontSize:'1.1rem'}}>🔧</div><div><div className="reviewer-name">{r.mechanicId?.fullName||'ميكانيكي'}</div><div className="reviewer-user">@{r.mechanicId?.username}</div></div></div><div className="review-right"><Stars value={r.rating} readonly/><div className="review-date">{new Date(r.createdAt).toLocaleDateString('ar')}</div></div></div>
            <div className="review-comment">{r.comment}</div>
          </div>
        ))}</div>}
    </div>
  );
};

const CAR_BRANDS = ['تويوتا','هوندا','نيسان','كيا','هيونداي','فورد','شيفروليه','بي إم دبليو','مرسيدس','أودي','فولكس واجن','مازدا','ميتسوبيشي','سوزوكي','جيب','لكزس','إنفينيتي','بورشه','لاند روفر','فولفو','أخرى'];
const FUEL_TYPES  = ['بنزين','ديزل','كهربائي','هايبرد'];
const TRANS_TYPES = ['أوتوماتيك','يدوي (عادي)'];

const PostBreakdownPage = ({ accessToken, setToast, onDone }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [address, setAddress] = useState('');
  const [form, setForm] = useState({
    carBrand: '',
    carModel: '',
    carYear: '',
    fuelType: '',
    transmission: '',
    mileage: '',
    title: '',
    description: '',
    problemStarted: '',
    isRecurring: false,
    warningLights: false,
    carRunning: true,
    lat: '',
    lng: '',
    locationNote: '',
  });

  const handleImages = e => {
    const files = Array.from(e.target.files);
    const valid = files.filter(
      f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );

    if (valid.length !== files.length) {
      setToast({ type: 'error', text: 'بعض الصور تجاوزت 5MB' });
    }

    const combined = [
      ...images,
      ...valid.map(file => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ].slice(0, 5);

    setImages(combined);
  };

  const removeImage = idx =>
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const fb = k => e => setForm(p => ({ ...p, [k]: e.target.checked }));

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const data = await res.json();

      if (data?.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress('تم تحديد الموقع');
      }
    } catch (err) {
      setAddress('تم تحديد الموقع');
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setToast({ type: 'error', text: 'المتصفح لا يدعم تحديد الموقع' });
      return;
    }

    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        setForm(p => ({ ...p, lat, lng }));
        await fetchAddressFromCoords(lat, lng);
        setLocLoading(false);
      },
      () => {
        setToast({ type: 'error', text: 'تعذّر تحديد الموقع' });
        setLocLoading(false);
      }
    );
  };

  const handleManualLocationBlur = async () => {
    if (form.lat && form.lng) {
      await fetchAddressFromCoords(form.lat, form.lng);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (form.problemStarted) {
      const selectedDate = new Date(form.problemStarted);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(selectedDate.getTime())) {
        setToast({ type: 'error', text: '❌ تاريخ المشكلة غير صالح' });
        return;
      }

      if (selectedDate > today) {
        setToast({ type: 'error', text: '❌ لا يمكن اختيار تاريخ في المستقبل' });
        return;
      }

      if (form.carYear && selectedDate.getFullYear() < Number(form.carYear)) {
        setToast({
          type: 'error',
          text: '❌ تاريخ المشكلة لا يمكن أن يكون قبل سنة صنع السيارة',
        });
        return;
      }
    }

    if (!form.lat || !form.lng) {
      setToast({ type: 'error', text: 'يرجى تحديد الموقع الجغرافي' });
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);

      fd.append(
        'carInfo',
        JSON.stringify({
          brand: form.carBrand,
          model: form.carModel,
          year: Number(form.carYear),
          fuelType: form.fuelType,
          transmission: form.transmission,
          mileage: Number(form.mileage),
        })
      );

      fd.append(
        'problemDetails',
        JSON.stringify({
          startedAt: form.problemStarted,
          isRecurring: form.isRecurring,
          warningLights: form.warningLights,
          carRunning: form.carRunning,
        })
      );

      fd.append(
        'location',
        JSON.stringify({
          lat: Number(form.lat),
          lng: Number(form.lng),
          note: form.locationNote,
          address,
        })
      );

      images.forEach(img => fd.append('photos', img.file));

      const res = await fetch(`${API_BASE}/breakdowns`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Request failed');
      }

      setToast({ type: 'success', text: 'تم نشر منشور العطل بنجاح! 🚗' });
      onDone();
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const canNext1 =
    form.carBrand &&
    form.carModel &&
    form.carYear &&
    form.fuelType &&
    form.transmission;

  const canNext2 = form.title && form.description;

  const StepDots = () => (
    <div style={{ display: 'flex', gap: 8, marginBottom: '1.8rem', alignItems: 'center' }}>
      {[1, 2, 3].map(s => (
        <React.Fragment key={s}>
          <div
            style={{
              width: step === s ? 32 : 10,
              height: 10,
              borderRadius: 99,
              background:
                s <= step
                  ? 'linear-gradient(135deg,#0ea5e9,#6366f1)'
                  : 'rgba(255,255,255,.1)',
              transition: 'all .3s',
              flexShrink: 0,
            }}
          />
          {s < 3 && (
            <div
              style={{
                flex: 1,
                height: 1,
                background:
                  s < step ? 'rgba(14,165,233,.4)' : 'rgba(255,255,255,.08)',
              }}
            />
          )}
        </React.Fragment>
      ))}
      <span
        style={{
          color: 'rgba(255,255,255,.3)',
          fontSize: '.8rem',
          marginRight: 4,
        }}
      >
        {step === 1
          ? 'معلومات السيارة'
          : step === 2
          ? 'وصف المشكلة'
          : 'الموقع الجغرافي'}
      </span>
    </div>
  );

  return (
    <div className="page">
      <div className="page-hdr">
        <div className="page-title">🚨 نشر عطل سيارة</div>
        <div className="page-sub">أخبر الميكانيكيين بمشكلة سيارتك</div>
      </div>

      <div className="card-glass" style={{ maxWidth: 620 }}>
        <StepDots />

        <form onSubmit={step < 3 ? e => { e.preventDefault(); setStep(s => s + 1); } : handleSubmit}>
          {step === 1 && (
            <div className="form-grid">
              <div className="fg">
                <label className="lbl">الماركة *</label>
                <div className="inp-wrap">
                  <span className="ico">🚗</span>
                  <select
                    className="inp inp-select"
                    value={form.carBrand}
                    onChange={f('carBrand')}
                    required
                  >
                    <option value="">اختر الماركة...</option>
                    {CAR_BRANDS.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fg">
                <label className="lbl">الموديل *</label>
                <div className="inp-wrap">
                  <span className="ico">🏷️</span>
                  <input
                    className="inp"
                    value={form.carModel}
                    onChange={f('carModel')}
                    placeholder="مثلاً: كامري"
                    required
                  />
                </div>
              </div>

              <div className="fg">
                <label className="lbl">سنة الصنع *</label>
                <div className="inp-wrap">
                  <span className="ico">📅</span>
                  <input
                    className="inp"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    value={form.carYear}
                    onChange={f('carYear')}
                    placeholder="2019"
                    required
                  />
                </div>
              </div>

              <div className="fg">
                <label className="lbl">نوع الوقود *</label>
                <div className="inp-wrap">
                  <span className="ico">⛽</span>
                  <select
                    className="inp inp-select"
                    value={form.fuelType}
                    onChange={f('fuelType')}
                    required
                  >
                    <option value="">اختر...</option>
                    {FUEL_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fg">
                <label className="lbl">ناقل الحركة *</label>
                <div className="inp-wrap">
                  <span className="ico">⚙️</span>
                  <select
                    className="inp inp-select"
                    value={form.transmission}
                    onChange={f('transmission')}
                    required
                  >
                    <option value="">اختر...</option>
                    {TRANS_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fg">
                <label className="lbl">الكيلومترات</label>
                <div className="inp-wrap">
                  <span className="ico">🔢</span>
                  <input
                    className="inp"
                    type="number"
                    min="0"
                    value={form.mileage}
                    onChange={f('mileage')}
                    placeholder="85000"
                  />
                </div>
              </div>

              <div className="fg full">
                <label className="lbl">صور السيارة (اختياري — حتى 5 صور)</label>
                <label className="img-upload-area" htmlFor="car-imgs">
                  <input
                    id="car-imgs"
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImages}
                  />

                  {images.length === 0 ? (
                    <div className="img-upload-placeholder">
                      <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>📷</div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: 'rgba(255,255,255,.5)',
                          fontSize: '.9rem',
                        }}
                      >
                        اضغط لرفع الصور
                      </div>
                    </div>
                  ) : (
                    <div className="img-thumbs-row">
                      {images.map((img, i) => (
                        <div key={i} className="img-thumb-wrap">
                          <img src={img.preview} className="img-thumb" alt="" />
                          <button
                            type="button"
                            className="img-remove"
                            onClick={e => {
                              e.preventDefault();
                              removeImage(i);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {images.length < 5 && (
                        <div className="img-add-more">
                          <div style={{ fontSize: '1.4rem' }}>+</div>
                        </div>
                      )}
                    </div>
                  )}
                </label>
              </div>

              <div className="fg full">
                <button type="submit" className="btn-primary" disabled={!canNext1}>
                  التالي: وصف المشكلة ←
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-grid">
              <div className="fg full">
                <label className="lbl">عنوان المشكلة *</label>
                <div className="inp-wrap">
                  <span className="ico">📝</span>
                  <input
                    className="inp"
                    value={form.title}
                    onChange={f('title')}
                    placeholder="مثلاً: صوت غريب من المحرك"
                    required
                    maxLength={120}
                  />
                </div>
              </div>

              <div className="fg full">
                <label className="lbl">وصف المشكلة * ({form.description.length}/1000)</label>
                <textarea
                  className="inp"
                  rows={5}
                  required
                  maxLength={1000}
                  value={form.description}
                  onChange={f('description')}
                  placeholder="اشرح المشكلة بالتفصيل..."
                  style={{ resize: 'vertical', paddingTop: '.75rem' }}
                />
              </div>

              <div className="fg">
                <label className="lbl">متى بدأت المشكلة؟</label>
                <div className="inp-wrap">
                  <span className="ico">📅</span>
                  <input
                    className="inp"
                    type="date"
                    value={form.problemStarted}
                    onChange={f('problemStarted')}
                    max={new Date().toISOString().split('T')[0]}
                    min={form.carYear ? `${form.carYear}-01-01` : undefined}
                  />
                </div>
              </div>

              <div className="fg">
                <div className="toggle-group">
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      className="toggle-cb"
                      checked={form.isRecurring}
                      onChange={fb('isRecurring')}
                    />
                    <div className="toggle-track">
                      <div className="toggle-thumb" />
                    </div>
                    <span className="toggle-lbl">المشكلة تتكرر</span>
                  </label>

                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      className="toggle-cb"
                      checked={form.warningLights}
                      onChange={fb('warningLights')}
                    />
                    <div className="toggle-track">
                      <div className="toggle-thumb" />
                    </div>
                    <span className="toggle-lbl">لمبة تحذير ظهرت</span>
                  </label>

                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      className="toggle-cb"
                      checked={form.carRunning}
                      onChange={fb('carRunning')}
                    />
                    <div className="toggle-track">
                      <div className="toggle-thumb" />
                    </div>
                    <span className="toggle-lbl">السيارة لا تزال تعمل</span>
                  </label>
                </div>
              </div>

              <div className="fg full" style={{ display: 'flex', gap: '.75rem' }}>
                <button
                  type="button"
                  className="btn-back"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setStep(1)}
                >
                  → رجوع
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2 }}
                  disabled={!canNext2}
                >
                  التالي: الموقع ←
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-grid">
              <div className="fg full">
                <button
                  type="button"
                  className="btn-locate"
                  onClick={getLocation}
                  disabled={locLoading}
                >
                  {locLoading ? (
                    <>
                      <Spin /> جاري تحديد الموقع...
                    </>
                  ) : (
                    '📡 تحديد موقعي الحالي تلقائياً'
                  )}
                </button>
              </div>

              {form.lat && form.lng && (
                <div className="fg full">
                  <div
                    className="loc-preview"
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${form.lat},${form.lng}`,
                        '_blank'
                      )
                    }
                    title="افتح الموقع على الخريطة"
                  >
                    <div className="loc-pin">📍</div>
                    <div>
                      <div
                        style={{
                          color: '#6ee7b7',
                          fontWeight: 700,
                          fontSize: '.88rem',
                        }}
                      >
                        تم تحديد الموقع
                      </div>

                      <div
                        style={{
                          color: 'rgba(255,255,255,.6)',
                          fontSize: '.85rem',
                          marginTop: '.15rem',
                        }}
                      >
                        {address || 'جاري تحميل اسم الموقع...'}
                      </div>

                      <div
                        style={{
                          color: 'rgba(255,255,255,.35)',
                          fontSize: '.75rem',
                          marginTop: '.15rem',
                        }}
                      >
                        {form.lat}, {form.lng}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="fg">
                <label className="lbl">خط العرض</label>
                <div className="inp-wrap">
                  <span className="ico">↕️</span>
                  <input
                    className="inp"
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={f('lat')}
                    onBlur={handleManualLocationBlur}
                    placeholder="31.9539"
                  />
                </div>
              </div>

              <div className="fg">
                <label className="lbl">خط الطول</label>
                <div className="inp-wrap">
                  <span className="ico">↔️</span>
                  <input
                    className="inp"
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={f('lng')}
                    onBlur={handleManualLocationBlur}
                    placeholder="35.9106"
                  />
                </div>
              </div>

              <div className="fg full">
                <label className="lbl">ملاحظة الموقع</label>
                <div className="inp-wrap">
                  <span className="ico">🗺️</span>
                  <input
                    className="inp"
                    value={form.locationNote}
                    onChange={f('locationNote')}
                    placeholder="أمام مجمع..."
                  />
                </div>
              </div>

              <div className="fg full">
                <div className="summary-card">
                  <div className="summary-title">📋 ملخص المنشور</div>
                  <div className="summary-row">
                    <span className="sk">السيارة:</span>
                    <span className="sv">
                      {form.carBrand} {form.carModel} {form.carYear}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="sk">الوقود:</span>
                    <span className="sv">{form.fuelType}</span>
                  </div>
                  <div className="summary-row">
                    <span className="sk">المشكلة:</span>
                    <span className="sv">{form.title || '—'}</span>
                  </div>
                  <div className="summary-row">
                    <span className="sk">الموقع:</span>
                    <span className="sv">
                      {address || (form.lat && form.lng ? `${form.lat}, ${form.lng}` : 'لم يُحدَّد')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="fg full" style={{ display: 'flex', gap: '.75rem' }}>
                <button
                  type="button"
                  className="btn-back"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setStep(2)}
                >
                  → رجوع
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2 }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spin /> جاري النشر...
                    </>
                  ) : (
                    '🚨 نشر منشور العطل'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};


const MyBreakdownsPage = ({ api, setToast, onNew, onViewProposals }) => {
  const [breakdowns, setBreakdowns] = useState([]);
  const [loading, setLoading]       = useState(true);
  const load = useCallback(()=>{ setLoading(true); api('/my-breakdowns').then(r=>setBreakdowns(r.data)).catch(err=>setToast({type:'error',text:err.message})).finally(()=>setLoading(false)); },[api]);
  useEffect(()=>{ load(); },[load]);

  return (
    <div className="page">
      <div className="page-hdr" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
        <div><div className="page-title">منشوراتي 🚗</div><div className="page-sub">{breakdowns.length} منشور</div></div>
        <div style={{ display:'flex', gap:'.7rem' }}>
          <button className="btn-outline-sm" onClick={load}>🔄</button>
          <button className="btn-new" onClick={onNew}>+ نشر عطل جديد</button>
        </div>
      </div>
      {loading ? <div className="center-msg"><Spin/> جاري التحميل...</div>
        : breakdowns.length===0 ? (
          <div className="empty-state">
            <div style={{ fontSize:'3.5rem', marginBottom:'.7rem' }}>🚗</div>
            <div style={{ marginBottom:'1rem' }}>لم تنشر أي منشور بعد</div>
            <button className="btn-primary" style={{ maxWidth:220 }} onClick={onNew}>🚨 نشر أول منشور</button>
          </div>
        ) : (
          <div className="bd-list">
            {breakdowns.map(b=>{
              const hasProposals = (b.proposalCount||0) > 0;
              return (
                <div key={b._id} className="bd-card">
                  <div className="bd-card-top">
                    <div className="bd-car-info">
                      <div className="bd-car-icon">🚗</div>
                      <div>
                        <div className="bd-car-name">{b.carInfo?.brand} {b.carInfo?.model}{b.carInfo?.year&&<span className="bd-year"> — {b.carInfo.year}</span>}</div>
                        <div className="bd-meta">
                          {b.carInfo?.fuelType     && <span className="bd-tag">{b.carInfo.fuelType}</span>}
                          {b.carInfo?.transmission && <span className="bd-tag">{b.carInfo.transmission}</span>}
                          {b.carInfo?.mileage      && <span className="bd-tag">🔢 {b.carInfo.mileage.toLocaleString()} كم</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'.5rem' }}>
                      <StatusBadge status={b.status||'pending'}/>
                      {b.status==='pending'&&(
                        <span style={{ fontSize:'.72rem', padding:'.18rem .55rem', borderRadius:20, background:hasProposals?'rgba(56,189,248,.12)':'rgba(255,255,255,.06)', color:hasProposals?'#38bdf8':'rgba(255,255,255,.3)', border:`1px solid ${hasProposals?'rgba(56,189,248,.3)':'rgba(255,255,255,.1)'}` }}>
                          💬 {b.proposalCount||0} اقتراح
                        </span>
                      )}
                      {b.assignedMechanic&&<span style={{ fontSize:'.72rem', padding:'.18rem .55rem', borderRadius:20, background:'rgba(16,185,129,.1)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,.25)' }}>🔧 {b.assignedMechanic.fullName}</span>}
                    </div>
                  </div>
                  <div className="bd-title">{b.title}</div>
                  <div className="bd-desc">{b.description}</div>
                  <div className="bd-footer">
                    <div className="bd-footer-row">
                      {b.location?.lat && <span className="bd-info-chip">📍 {Number(b.location.lat).toFixed(4)}, {Number(b.location.lng).toFixed(4)}</span>}
                      {b.problemDetails?.warningLights   && <span className="bd-info-chip warn">⚠️ لمبة تحذير</span>}
                      {b.problemDetails?.isRecurring     && <span className="bd-info-chip">🔁 متكررة</span>}
                      {b.problemDetails?.carRunning===false && <span className="bd-info-chip err">🔴 واقفة</span>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'.7rem' }}>
                      <span className="bd-date">{new Date(b.createdAt).toLocaleDateString('ar')}</span>
                      {b.status==='pending'&&hasProposals&&(
                        <button className="btn-view-proposals" onClick={()=>onViewProposals(b)}>
                          👀 اقتراحات ({b.proposalCount})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

const BreakdownProposalsPage = ({ api, breakdown, setToast, onBack, onAccepted }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [acting, setActing]       = useState(null);

  const load = useCallback(()=>{ setLoading(true); api(`/breakdowns/${breakdown._id}/proposals`).then(r=>setProposals(r.data)).catch(err=>setToast({type:'error',text:err.message})).finally(()=>setLoading(false)); },[api,breakdown._id]);
  useEffect(()=>{ load(); },[load]);

  const accept = async id => {
    try { setActing(id); await api(`/breakdowns/${breakdown._id}/proposals/${id}/accept`,{method:'POST'}); setToast({type:'success',text:'🎉 تم قبول الاقتراح! سيبدأ الميكانيكي بالعمل.'}); onAccepted(); }
    catch(err){ setToast({type:'error',text:err.message}); setActing(null); }
  };
  const reject = async id => {
    try { setActing(`r-${id}`); await api(`/breakdowns/${breakdown._id}/proposals/${id}/reject`,{method:'POST'}); setToast({type:'success',text:'تم رفض الاقتراح.'}); await load(); }
    catch(err){ setToast({type:'error',text:err.message}); } finally { setActing(null); }
  };
  const complete = async () => {
    try { setActing('done'); await api(`/breakdowns/${breakdown._id}/complete`,{method:'POST'}); setToast({type:'success',text:'✅ تم إغلاق الطلب كمكتمل'}); onAccepted(); }
    catch(err){ setToast({type:'error',text:err.message}); setActing(null); }
  };

  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← رجوع</button>
      <div className="page-hdr">
        <div className="page-title">اقتراحات الميكانيكيين 💬</div>
        <div style={{ display:'flex', alignItems:'center', gap:'.8rem', marginTop:'.5rem', flexWrap:'wrap' }}>
          <div style={{ background:'rgba(255,255,255,.06)', borderRadius:10, padding:'.4rem .8rem', fontSize:'.85rem', color:'rgba(255,255,255,.55)' }}>
            🚗 {breakdown.carInfo?.brand} {breakdown.carInfo?.model} — {breakdown.title}
          </div>
          {breakdown.status==='inProgress'&&(
            <button className="btn-complete" disabled={acting==='done'} onClick={complete}>
              {acting==='done'?<><Spin size={14}/> جاري...</>:'🏁 أعلن اكتمال الإصلاح'}
            </button>
          )}
        </div>
      </div>

      {loading ? <div className="center-msg"><Spin/> جاري التحميل...</div>
        : proposals.length===0 ? (
          <div className="empty-state">
            <div style={{ fontSize:'3rem', marginBottom:'.6rem' }}>💬</div>
            <div>لا توجد اقتراحات بعد</div>
            <div style={{ fontSize:'.82rem', marginTop:'.5rem', color:'rgba(255,255,255,.25)' }}>انتظر حتى يتقدم الميكانيكيون</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {proposals.map(p=>{
              const mech = p.mechanicId||{};
              const isAcc = p.status==='accepted';
              return (
                <div key={p._id} className={`proposal-card ${isAcc?'proposal-accepted':''}`}>
                  {isAcc&&<div className="accepted-banner">🎉 هذا الاقتراح مقبول — الميكانيكي يعمل على طلبك الآن</div>}
                  <div className="proposal-head">
                    <div style={{ display:'flex', alignItems:'center', gap:'.85rem', flex:1 }}>
                      <div className="mech-av">🔧</div>
                      <div>
                        <div className="mech-pname">{mech.fullName||'ميكانيكي'}</div>
                        <div className="mech-pusername">@{mech.username}</div>
                        {mech.profileData?.phone&&<div className="mech-pphone">📞 {mech.profileData.phone}</div>}
                        {mech.profileData?.bio&&<div style={{ fontSize:'.78rem', color:'rgba(255,255,255,.35)', marginTop:'.2rem' }}>{mech.profileData.bio}</div>}
                      </div>
                    </div>
                    <div className="proposal-price"><div className="price-val">{p.price}</div><div className="price-cur">{p.currency}</div></div>
                  </div>
                  <div className="proposal-details">
                    <div className="prop-chip">{p.serviceType==='onsite'?'🚘 يأتي إليك':'🏭 تذهب للورشة'}</div>
                    {p.estimatedTime&&<div className="prop-chip">⏱️ {p.estimatedTime}</div>}
                  </div>
                  <div className="proposal-desc">{p.serviceDescription}</div>
                  {p.notes&&<div className="proposal-notes">📝 {p.notes}</div>}
                  <div className="proposal-date">تقدّم في: {new Date(p.createdAt).toLocaleString('ar')}</div>
                  {p.status==='pending'&&breakdown.status==='pending'&&(
                    <div className="proposal-actions">
                      <button className="btn-accept-prop" disabled={!!acting} onClick={()=>accept(p._id)}>
                        {acting===p._id?<><Spin size={14}/> جاري...</>:'✅ قبول الاقتراح'}
                      </button>
                      <button className="btn-reject-prop" disabled={!!acting} onClick={()=>reject(p._id)}>
                        {acting===`r-${p._id}`?<><Spin size={14}/> جاري...</>:'❌ رفض'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};


export default function UserDashboard() {
const accessToken = useAccessToken();
  const [user, setUser]       = useState(null);
  const [page, setPage]       = useState('my-breakdowns');
  const [subPage, setSubPage] = useState(null);
  const [toast, setToastState] = useState({ type:'', text:'' });
  const [mounted, setMounted]  = useState(false);
  const api = useApi(accessToken);
  const setToast = msg => { setToastState(msg); setTimeout(()=>setToastState({type:'',text:''}),3500); };

  useEffect(()=>{ setMounted(true); if(!accessToken) return; api('/profile').then(r=>setUser(r.data)).catch(()=>{}); },[]);

  const navItems = [
    { key:'my-breakdowns', icon:'🚗', label:'منشوراتي'       },
    { key:'mechanics',     icon:'🔧', label:'الميكانيكيون'   },
    { key:'my-reviews',    icon:'⭐', label:'تقييماتي'       },
    { key:'profile',       icon:'👤', label:'الملف الشخصي'   },
  ];

  const goPage = k => { setPage(k); setSubPage(null); };

  if (!mounted) return null;
  if (!accessToken) return (
    <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Tajawal,sans-serif', color:'#fff', direction:'rtl', fontSize:'1.1rem' }}>
      <div style={{ textAlign:'center' }}><div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔐</div><div>يجب تسجيل الدخول أولاً</div></div>
    </div>
  );

  const renderPage = () => {
    if (subPage?.type==='reviews')             return <MechanicReviewsPage   api={api} mechanic={subPage.mechanic} setToast={setToast} onBack={()=>setSubPage(null)}/>;
    if (subPage?.type==='write')               return <WriteReviewPage        api={api} mechanic={subPage.mechanic} setToast={setToast} onBack={()=>setSubPage(null)}/>;
    if (subPage?.type==='post-breakdown')      return <PostBreakdownPage      accessToken={accessToken} setToast={setToast} onDone={()=>{ setSubPage(null); setPage('my-breakdowns'); }}/>;
    if (subPage?.type==='breakdown-proposals') return <BreakdownProposalsPage api={api} breakdown={subPage.breakdown} setToast={setToast} onBack={()=>setSubPage(null)} onAccepted={()=>{ setSubPage(null); setPage('my-breakdowns'); }}/>;
    if (page==='profile')       return <ProfilePage    api={api} initialUser={user} onUpdate={setUser} setToast={setToast}/>;
    if (page==='mechanics')     return <MechanicsPage  api={api} setToast={setToast} onSelectMechanic={(m,t)=>setSubPage({type:t,mechanic:m})}/>;
    if (page==='my-reviews')    return <MyReviewsPage  api={api} setToast={setToast}/>;
    if (page==='my-breakdowns') return <MyBreakdownsPage api={api} setToast={setToast} onNew={()=>setSubPage({type:'post-breakdown'})} onViewProposals={bd=>setSubPage({type:'breakdown-proposals',breakdown:bd})}/>;
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
        body,html{background:#080810;font-family:'Tajawal',sans-serif;direction:rtl;color:#e2e8f0}
        @keyframes rot{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

        .layout{display:flex;min-height:100vh}
        .sidebar{width:240px;flex-shrink:0;background:rgba(255,255,255,.03);border-left:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;padding:1.5rem 1rem;position:sticky;top:0;height:100vh;backdrop-filter:blur(20px)}
        .sidebar-brand{display:flex;align-items:center;gap:.6rem;margin-bottom:2rem;padding:.3rem .5rem}
        .sb-icon{width:38px;height:38px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
        .sb-name{font-family:'Sora',sans-serif;font-size:1.1rem;font-weight:700;color:#fff}
        .user-mini{background:rgba(255,255,255,.05);border-radius:14px;padding:.85rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:.7rem}
        .um-av{width:38px;height:38px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
        .um-name{font-size:.88rem;font-weight:700;color:#fff;line-height:1.2}
        .um-role{font-size:.72rem;color:rgba(255,255,255,.38)}
        .nav-item{display:flex;align-items:center;gap:.7rem;padding:.72rem .9rem;border-radius:12px;font-size:.92rem;font-weight:500;color:rgba(255,255,255,.45);cursor:pointer;transition:all .2s;margin-bottom:.25rem;border:none;background:transparent;width:100%;text-align:right}
        .nav-item:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.8)}
        .nav-item.active{background:rgba(14,165,233,.14);color:#38bdf8;font-weight:700;border:1px solid rgba(14,165,233,.22)}
        .nav-ico{font-size:1.1rem;width:22px;text-align:center}
        .main{flex:1;overflow-y:auto;padding:2rem}
        .page{animation:up .35s ease}
        .page-hdr{margin-bottom:1.8rem}
        .page-title{font-size:1.6rem;font-weight:900;color:#fff;margin-bottom:.3rem}
        .page-sub{font-size:.9rem;color:rgba(255,255,255,.35)}
        .card-glass{background:rgba(255,255,255,.042);border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:1.8rem;backdrop-filter:blur(16px)}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .fg{display:flex;flex-direction:column}
        .fg.full{grid-column:1/-1}
        .lbl{font-size:.8rem;font-weight:600;color:rgba(255,255,255,.4);margin-bottom:.35rem}
        .inp-wrap{position:relative}
        .ico{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:.9rem;opacity:.4;pointer-events:none}
        .inp{width:100%;padding:.78rem 2.5rem .78rem .9rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);border-radius:11px;color:#fff;font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none;transition:border-color .2s,background .2s,box-shadow .2s;text-align:right}
        .inp::placeholder{color:rgba(255,255,255,.2)}
        .inp:focus{border-color:#0ea5e9;background:rgba(14,165,233,.08);box-shadow:0 0 0 3px rgba(14,165,233,.15)}
        .inp-select{appearance:none;padding-left:1.8rem;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,.3)'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:left 10px center}
        .inp-select option{background:#1a1a2e;color:#fff}
        textarea.inp{padding-right:.9rem}
        .toggle-group{display:flex;flex-direction:column;gap:.8rem;padding:.8rem;background:rgba(255,255,255,.04);border-radius:14px;border:1px solid rgba(255,255,255,.07)}
        .toggle-row{display:flex;align-items:center;gap:.8rem;cursor:pointer}
        .toggle-cb{display:none}
        .toggle-track{width:38px;height:22px;background:rgba(255,255,255,.1);border-radius:99px;position:relative;flex-shrink:0;transition:background .2s}
        .toggle-thumb{width:16px;height:16px;background:#fff;border-radius:50%;position:absolute;top:3px;right:3px;transition:transform .2s}
        .toggle-cb:checked + .toggle-track{background:linear-gradient(135deg,#0ea5e9,#6366f1)}
        .toggle-cb:checked + .toggle-track .toggle-thumb{transform:translateX(-16px)}
        .toggle-lbl{font-size:.85rem;color:rgba(255,255,255,.55)}
        .btn-primary{padding:.82rem 1.4rem;background:linear-gradient(135deg,#0ea5e9,#6366f1);border:none;border-radius:12px;color:#fff;font-family:'Tajawal',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;box-shadow:0 4px 18px rgba(14,165,233,.35);width:100%}
        .btn-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 24px rgba(14,165,233,.5)}
        .btn-primary:disabled{opacity:.55;cursor:not-allowed}
        .btn-back{display:inline-flex;align-items:center;gap:.4rem;padding:.45rem .9rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:rgba(255,255,255,.6);font-family:'Tajawal',sans-serif;font-size:.85rem;cursor:pointer;margin-bottom:1.2rem;transition:all .2s}
        .btn-back:hover{background:rgba(255,255,255,.12);color:#fff}
        .btn-outline-sm{padding:.44rem .95rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:9px;color:rgba(255,255,255,.6);font-family:'Tajawal',sans-serif;font-size:.83rem;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:.4rem}
        .btn-outline-sm:hover{background:rgba(255,255,255,.12);color:#fff}
        .btn-sm{padding:.42rem .9rem;border-radius:9px;font-family:'Tajawal',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s;border:none}
        .btn-outline{background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.12)}
        .btn-outline:hover{background:rgba(255,255,255,.12);color:#fff}
        .btn-primary-sm{background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;box-shadow:0 2px 10px rgba(14,165,233,.3)}
        .btn-new{padding:.6rem 1.2rem;background:linear-gradient(135deg,#f59e0b,#ef4444);border:none;border-radius:11px;color:#fff;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;box-shadow:0 3px 14px rgba(239,68,68,.3);transition:all .2s;white-space:nowrap}
        .btn-new:hover{transform:translateY(-2px);box-shadow:0 5px 18px rgba(239,68,68,.4)}
        .btn-locate{width:100%;padding:.9rem 1.4rem;background:rgba(16,185,129,.12);border:1px dashed rgba(16,185,129,.4);border-radius:12px;color:#6ee7b7;font-family:'Tajawal',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.5rem}
        .btn-locate:hover:not(:disabled){background:rgba(16,185,129,.2)}
        .btn-locate:disabled{opacity:.55;cursor:not-allowed}
        .btn-view-proposals{padding:.4rem .85rem;background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.25);border-radius:9px;color:#38bdf8;font-family:'Tajawal',sans-serif;font-size:.8rem;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
        .btn-view-proposals:hover{background:rgba(56,189,248,.2)}
        .btn-complete{padding:.55rem 1.1rem;background:rgba(167,139,250,.14);border:1px solid rgba(167,139,250,.3);border-radius:10px;color:#a78bfa;font-family:'Tajawal',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:.4rem}
        .btn-complete:hover:not(:disabled){background:rgba(167,139,250,.25)}
        .btn-complete:disabled{opacity:.5;cursor:not-allowed}
        .profile-avatar-row{display:flex;align-items:center;gap:1.2rem;margin-bottom:1.8rem;padding-bottom:1.4rem;border-bottom:1px solid rgba(255,255,255,.07)}
        .big-avatar{width:64px;height:64px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0}
        .pname{font-size:1.15rem;font-weight:700;color:#fff}
        .pemail{font-size:.83rem;color:rgba(255,255,255,.4);margin:.2rem 0}
        .mech-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
        .mech-card{background:rgba(255,255,255,.042);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:1.3rem;transition:border-color .2s,transform .2s}
        .mech-card:hover{border-color:rgba(14,165,233,.3);transform:translateY(-2px)}
        .mech-avatar{width:48px;height:48px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:.8rem}
        .mech-name{font-size:1rem;font-weight:700;color:#fff;margin-bottom:.15rem}
        .mech-user{font-size:.8rem;color:rgba(255,255,255,.38);margin-bottom:.5rem}
        .mech-bio{font-size:.82rem;color:rgba(255,255,255,.5);margin-bottom:.4rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .mech-phone{font-size:.78rem;color:rgba(255,255,255,.35);margin-bottom:.25rem}
        .mech-actions{display:flex;gap:.5rem;margin-top:.9rem}
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
        .bd-list{display:flex;flex-direction:column;gap:1rem}
        .bd-card{background:rgba(255,255,255,.042);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:1.4rem;transition:border-color .2s,transform .2s}
        .bd-card:hover{border-color:rgba(239,68,68,.25);transform:translateY(-1px)}
        .bd-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem;gap:1rem}
        .bd-car-info{display:flex;align-items:center;gap:.85rem}
        .bd-car-icon{width:44px;height:44px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
        .bd-car-name{font-size:1rem;font-weight:700;color:#fff;margin-bottom:.3rem}
        .bd-year{color:rgba(255,255,255,.4);font-weight:400}
        .bd-meta{display:flex;flex-wrap:wrap;gap:.35rem}
        .bd-tag{font-size:.72rem;padding:.15rem .5rem;background:rgba(255,255,255,.07);border-radius:6px;color:rgba(255,255,255,.45);border:1px solid rgba(255,255,255,.08)}
        .bd-title{font-size:1rem;font-weight:700;color:#f8fafc;margin-bottom:.4rem}
        .bd-desc{font-size:.85rem;color:rgba(255,255,255,.5);line-height:1.6;margin-bottom:1rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .bd-footer{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;padding-top:.9rem;border-top:1px solid rgba(255,255,255,.06)}
        .bd-footer-row{display:flex;flex-wrap:wrap;gap:.4rem}
        .bd-info-chip{font-size:.72rem;padding:.2rem .55rem;border-radius:8px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.08)}
        .bd-info-chip.warn{background:rgba(251,191,36,.1);color:#fbbf24;border-color:rgba(251,191,36,.2)}
        .bd-info-chip.err{background:rgba(239,68,68,.1);color:#f87171;border-color:rgba(239,68,68,.2)}
        .bd-date{font-size:.75rem;color:rgba(255,255,255,.28)}
        .loc-preview{display:flex;align-items:center;gap:.9rem;padding:.9rem 1.1rem;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:12px}
        .loc-pin{font-size:1.4rem}
        .summary-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1rem 1.2rem}
        .summary-title{font-size:.85rem;font-weight:700;color:rgba(255,255,255,.45);margin-bottom:.8rem}
        .summary-row{display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;border-bottom:1px solid rgba(255,255,255,.05)}
        .summary-row:last-child{border-bottom:none}
        .sk{font-size:.8rem;color:rgba(255,255,255,.3)}
        .sv{font-size:.85rem;font-weight:600;color:rgba(255,255,255,.7);text-align:left}
        .img-upload-area{display:block;cursor:pointer;border:1px dashed rgba(255,255,255,.18);border-radius:14px;transition:border-color .2s,background .2s;overflow:hidden}
        .img-upload-area:hover{border-color:rgba(14,165,233,.5);background:rgba(14,165,233,.04)}
        .img-upload-placeholder{padding:1.8rem;text-align:center}
        .img-thumbs-row{display:flex;flex-wrap:wrap;gap:.7rem;padding:.9rem}
        .img-thumb-wrap{position:relative;width:90px;height:90px;border-radius:10px;overflow:hidden;flex-shrink:0}
        .img-thumb{width:100%;height:100%;object-fit:cover}
        .img-remove{position:absolute;top:4px;left:4px;width:22px;height:22px;border-radius:50%;background:rgba(239,68,68,.85);border:none;color:#fff;font-size:.7rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .img-add-more{width:90px;height:90px;border-radius:10px;border:1px dashed rgba(255,255,255,.2);display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,.35);cursor:pointer}
        .center-msg{text-align:center;padding:3rem;color:rgba(255,255,255,.35);font-size:.95rem;display:flex;align-items:center;justify-content:center;gap:.6rem}
        .empty-state{text-align:center;padding:4rem 2rem;color:rgba(255,255,255,.3);font-size:.95rem;display:flex;flex-direction:column;align-items:center}

        .proposal-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:1.3rem 1.5rem;transition:border-color .2s,transform .15s}
        .proposal-card:hover{border-color:rgba(14,165,233,.25);transform:translateY(-1px)}
        .proposal-accepted{border-color:rgba(16,185,129,.35)!important;background:rgba(16,185,129,.04)!important}
        .accepted-banner{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.25);border-radius:10px;padding:.6rem 1rem;font-size:.85rem;font-weight:700;color:#6ee7b7;margin-bottom:1rem;text-align:center}
        .proposal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem}
        .mech-av{width:48px;height:48px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}
        .mech-pname{font-size:1rem;font-weight:700;color:#fff}
        .mech-pusername{font-size:.78rem;color:rgba(255,255,255,.35);margin:.15rem 0}
        .mech-pphone{font-size:.78rem;color:rgba(255,255,255,.35)}
        .proposal-price{text-align:left;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:12px;padding:.6rem 1rem;min-width:80px;flex-shrink:0}
        .price-val{font-size:1.4rem;font-weight:900;color:#f59e0b;line-height:1}
        .price-cur{font-size:.72rem;color:rgba(245,158,11,.6);margin-top:.1rem}
        .proposal-details{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.8rem}
        .prop-chip{font-size:.78rem;padding:.25rem .65rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:20px;color:rgba(255,255,255,.55)}
        .proposal-desc{font-size:.9rem;color:rgba(255,255,255,.65);line-height:1.65;margin-bottom:.6rem}
        .proposal-notes{font-size:.8rem;color:rgba(255,255,255,.35);padding:.4rem .7rem;border-right:2px solid rgba(255,255,255,.12);margin-bottom:.6rem}
        .proposal-date{font-size:.75rem;color:rgba(255,255,255,.25);margin-bottom:.8rem}
        .proposal-actions{display:flex;gap:.75rem;padding-top:.9rem;border-top:1px solid rgba(255,255,255,.07)}
        .btn-accept-prop{flex:2;padding:.75rem;background:linear-gradient(135deg,rgba(16,185,129,.2),rgba(16,185,129,.12));border:1px solid rgba(16,185,129,.35);border-radius:12px;color:#6ee7b7;font-family:'Tajawal',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.4rem}
        .btn-accept-prop:hover:not(:disabled){background:rgba(16,185,129,.3);border-color:rgba(16,185,129,.55);transform:translateY(-1px)}
        .btn-accept-prop:disabled{opacity:.5;cursor:not-allowed}
        .btn-reject-prop{flex:1;padding:.75rem;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:12px;color:#fca5a5;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.4rem}
        .btn-reject-prop:hover:not(:disabled){background:rgba(239,68,68,.18)}
        .btn-reject-prop:disabled{opacity:.5;cursor:not-allowed}

        @media(max-width:700px){.sidebar{display:none}.main{padding:1rem}.form-grid{grid-template-columns:1fr}.fg.full{grid-column:1}}
      `}</style>

      <div className="layout">
        <nav className="sidebar">
          <div className="sidebar-brand"><div className="sb-icon">🚗</div><div className="sb-name">AutoCare</div></div>
          {user&&<div className="user-mini"><div className="um-av">👤</div><div><div className="um-name">{user.fullName}</div><div className="um-role">مستخدم</div></div></div>}
          {navItems.map(n=>(
            <button key={n.key} className={`nav-item ${page===n.key&&!subPage?'active':''}`} onClick={()=>goPage(n.key)}>
              <span className="nav-ico">{n.icon}</span>{n.label}
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
      <Toast msg={toast} onClose={()=>setToastState({type:'',text:''})}/>
    </>
  );
}