'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:3001/api/auth';

const ROLES = [
  { value: 'user',     label: '👤 مستخدم عادي' },
  { value: 'mechanic', label: '🔧 ميكانيكي' },
];

const ROLE_ROUTES = {
  user:     '/user',
  mechanic: '/mechanics',
  admin:    '/admin',
};

export default function AuthPage() {
  const router = useRouter();

  const [isLogin,  setIsLogin]  = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', email: '', role: 'user' });
  const [message,  setMessage]  = useState({ type: '', text: '' });
  const [loading,  setLoading]  = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
    const at   = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    if (at && role && ROLE_ROUTES[role]) {
      router.replace(ROLE_ROUTES[role]);
    } else {
      setChecking(false);
    }
  }, [router]);

  const authFetch = useCallback(async (path, options = {}, tok = '') => {
    const headers = { 'Content-Type': 'application/json' };
    if (tok) headers['Authorization'] = `Bearer ${tok}`;
    const res  = await fetch(`${API_URL}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || data.message || 'طلب فاشل');
    return data;
  }, []);

  const handleSuccess = (accessToken, refreshToken, user) => {
    localStorage.setItem('accessToken',  accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userRole',     user.role);
    localStorage.setItem('userData',     JSON.stringify(user));

    const dest = ROLE_ROUTES[user.role] || '/';
    router.push(dest);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const res = await authFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });
      const { accessToken, refreshToken, user } = res.data;
      
      setMessage({ type: 'success', text: `مرحباً ${user.fullName} 👋  جاري التوجيه...` });
      setTimeout(() => handleSuccess(accessToken, refreshToken, user), 700);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const res = await authFetch('/register', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email:    formData.email,
          role:     formData.role,
        }),
      });
      const { accessToken, refreshToken, user } = res.data;
      setMessage({ type: 'success', text: 'تم إنشاء الحساب! جاري التوجيه...' });
      setTimeout(() => handleSuccess(accessToken, refreshToken, user), 700);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  const field     = (k) => (e) => setFormData(p => ({ ...p, [k]: e.target.value }));
  const switchView = (v) => { setIsLogin(v); setMessage({ type: '', text: '' }); };

  if (!mounted || checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#07080f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,.15)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Sora:wght@400;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{font-family:'Tajawal',sans-serif;direction:rtl;background:#07080f;color:#e2e8f0;min-height:100vh}

        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rot{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-20px,30px) scale(1.06)}}
        @keyframes blobFloat2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(25px,-20px) scale(1.04)}}
        @keyframes toastPop{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}

        .shell{
          min-height:100vh;display:grid;
          grid-template-columns:1fr 1fr;
          position:relative;overflow:hidden;
        }
        @media(max-width:768px){.shell{grid-template-columns:1fr}.left-panel{display:none!important}}

        .left-panel{
          background:linear-gradient(145deg,#0f0f1a 0%,#111128 60%,#0a0a15 100%);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:3rem;position:relative;overflow:hidden;
          border-left:1px solid rgba(255,255,255,.06);
        }
        .lp-blob1{position:absolute;width:420px;height:420px;background:radial-gradient(circle,rgba(99,102,241,.22) 0%,transparent 70%);top:-80px;left:-100px;border-radius:50%;animation:blobFloat 8s ease-in-out infinite}
        .lp-blob2{position:absolute;width:340px;height:340px;background:radial-gradient(circle,rgba(236,72,153,.16) 0%,transparent 70%);bottom:-60px;right:-80px;border-radius:50%;animation:blobFloat2 10s ease-in-out infinite}
        .lp-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px);background-size:40px 40px;opacity:.7}
        .lp-content{position:relative;z-index:1;text-align:center}
        .lp-logo{width:72px;height:72px;background:linear-gradient(135deg,#6366f1,#ec4899);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 1.5rem;box-shadow:0 0 40px rgba(99,102,241,.4)}
        .lp-title{font-family:'Sora',sans-serif;font-size:2.4rem;font-weight:800;line-height:1.2;margin-bottom:.8rem;
          background:linear-gradient(135deg,#fff 0%,#a5b4fc 50%,#f9a8d4 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .lp-sub{font-size:1rem;color:rgba(255,255,255,.38);line-height:1.65;max-width:320px;margin:0 auto 2.5rem}
        .lp-features{display:flex;flex-direction:column;gap:.9rem;text-align:right}
        .lp-feat{display:flex;align-items:center;gap:.75rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:.85rem 1rem}
        .lp-feat-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
        .lp-feat-text .ft{font-size:.9rem;font-weight:700;color:#fff}
        .lp-feat-text .fs{font-size:.78rem;color:rgba(255,255,255,.35)}

        .right-panel{
          display:flex;align-items:center;justify-content:center;
          padding:2rem 1rem;
          background:#07080f;position:relative;overflow:hidden;
        }
        .rp-blob{position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(99,102,241,.08) 0%,transparent 60%);top:50%;left:50%;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none}

        .card{
          width:100%;max-width:430px;position:relative;z-index:1;
          background:rgba(255,255,255,.038);
          border:1px solid rgba(255,255,255,.08);
          border-radius:28px;padding:2.5rem 2.2rem;
          backdrop-filter:blur(30px);
          animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both;
        }

        .mobile-brand{display:none;align-items:center;gap:.7rem;justify-content:center;margin-bottom:1.8rem}
        @media(max-width:768px){.mobile-brand{display:flex}}
        .mob-logo{width:44px;height:44px;background:linear-gradient(135deg,#6366f1,#ec4899);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem}
        .mob-name{font-family:'Sora',sans-serif;font-size:1.3rem;font-weight:700;color:#fff}

        .card-title{font-family:'Sora',sans-serif;font-size:1.5rem;font-weight:800;color:#fff;margin-bottom:.3rem}
        .card-sub{font-size:.88rem;color:rgba(255,255,255,.32);margin-bottom:1.8rem}

        .tabs{display:flex;background:rgba(255,255,255,.05);border-radius:14px;padding:4px;margin-bottom:1.8rem;gap:4px}
        .tab{flex:1;padding:.6rem;border:none;border-radius:11px;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:500;cursor:pointer;transition:all .22s;background:transparent;color:rgba(255,255,255,.35)}
        .tab.on{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;box-shadow:0 4px 18px rgba(99,102,241,.4)}

        .form{display:flex;flex-direction:column;gap:.85rem}
        .fg{display:flex;flex-direction:column;gap:.32rem}
        .lbl{font-size:.78rem;font-weight:600;color:rgba(255,255,255,.4);padding-right:2px}
        .iw{position:relative}
        .iico{position:absolute;right:13px;top:50%;transform:translateY(-50%);font-size:.9rem;opacity:.38;pointer-events:none;z-index:1}
        .inp{
          width:100%;padding:.8rem 2.6rem .8rem .9rem;
          background:rgba(255,255,255,.055);
          border:1.5px solid rgba(255,255,255,.09);
          border-radius:13px;color:#fff;
          font-family:'Tajawal',sans-serif;font-size:.96rem;
          outline:none;transition:border-color .2s,background .2s,box-shadow .2s;
          text-align:right;
        }
        .inp::placeholder{color:rgba(255,255,255,.2)}
        .inp:focus{border-color:#6366f1;background:rgba(99,102,241,.09);box-shadow:0 0 0 3px rgba(99,102,241,.18)}

        .role-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
        .role-btn{
          padding:.68rem .5rem;border-radius:12px;
          border:1.5px solid rgba(255,255,255,.09);
          background:rgba(255,255,255,.04);
          color:rgba(255,255,255,.5);
          font-family:'Tajawal',sans-serif;font-size:.88rem;font-weight:500;
          cursor:pointer;transition:all .2s;text-align:center;
        }
        .role-btn.sel{background:rgba(99,102,241,.18);border-color:rgba(99,102,241,.55);color:#a5b4fc;font-weight:700}
        .role-btn:hover:not(.sel){background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}

        .btn-sub{
          margin-top:.3rem;padding:.9rem;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          border:none;border-radius:14px;color:#fff;
          font-family:'Tajawal',sans-serif;font-size:1.05rem;font-weight:700;
          cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;
          box-shadow:0 4px 24px rgba(99,102,241,.42);width:100%;
          display:flex;align-items:center;justify-content:center;gap:.5rem;
        }
        .btn-sub:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(99,102,241,.58)}
        .btn-sub:active:not(:disabled){transform:translateY(0)}
        .btn-sub:disabled{opacity:.55;cursor:not-allowed}

        .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:rot .65s linear infinite;flex-shrink:0}

        .toast{
          display:flex;align-items:center;gap:.55rem;
          padding:.75rem 1rem;border-radius:12px;
          font-size:.87rem;font-weight:500;
          margin-bottom:1.2rem;cursor:pointer;
          animation:toastPop .25s ease;
        }
        .t-ok{background:rgba(16,185,129,.11);color:#6ee7b7;border:1px solid rgba(16,185,129,.22)}
        .t-err{background:rgba(239,68,68,.11);color:#fca5a5;border:1px solid rgba(239,68,68,.22)}

        .divider{display:flex;align-items:center;gap:.75rem;margin:.5rem 0}
        .div-line{flex:1;height:1px;background:rgba(255,255,255,.07)}
        .div-txt{font-size:.75rem;color:rgba(255,255,255,.22)}

        .flink{text-align:center;margin-top:1.1rem;font-size:.85rem;color:rgba(255,255,255,.3)}
        .flink span{color:#818cf8;cursor:pointer;font-weight:600;transition:color .2s}
        .flink span:hover{color:#a5b4fc}

        .redirect-hints{display:flex;flex-direction:column;gap:.45rem;margin-top:1.4rem;padding-top:1.2rem;border-top:1px solid rgba(255,255,255,.06)}
        .rh-row{display:flex;align-items:center;gap:.6rem;font-size:.78rem;color:rgba(255,255,255,.28)}
        .rh-arrow{color:#6366f1;font-weight:700}
      `}</style>

      <div className="shell">

        <div className="left-panel">
          <div className="lp-blob1" />
          <div className="lp-blob2" />
          <div className="lp-grid" />
          <div className="lp-content">
            <div className="lp-logo">🔐</div>
            <div className="lp-title">منصة يلاّ</div>
            <div className="lp-sub">ربط المستخدمين بأقرب الميكانيكيين المعتمدين في منطقتك</div>

            <div className="lp-features">
              <div className="lp-feat">
                <div className="lp-feat-ico" style={{ background: 'rgba(99,102,241,.18)', color: '#a5b4fc' }}>👤</div>
                <div className="lp-feat-text">
                  <div className="ft">مستخدم عادي</div>
                  <div className="fs">ابحث وتواصل مع الميكانيكيين</div>
                </div>
              </div>
              <div className="lp-feat">
                <div className="lp-feat-ico" style={{ background: 'rgba(245,158,11,.16)', color: '#fbbf24' }}>🔧</div>
                <div className="lp-feat-text">
                  <div className="ft">ميكانيكي</div>
                  <div className="fs">سجّل نشاطك وابدأ باستقبال العملاء</div>
                </div>
              </div>
              <div className="lp-feat">
                <div className="lp-feat-ico" style={{ background: 'rgba(16,185,129,.15)', color: '#6ee7b7' }}>🛡️</div>
                <div className="lp-feat-text">
                  <div className="ft">مدير النظام</div>
                  <div className="fs">إدارة كاملة للمنصة والمستخدمين</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="rp-blob" />
          <div className="card">

            <div className="mobile-brand">
              <div className="mob-logo">🔐</div>
              <div className="mob-name">منصة يلاّ</div>
            </div>

            <div className="card-title">{isLogin ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}</div>
            <div className="card-sub">{isLogin ? 'سجّل دخولك للمتابعة' : 'انضم إلى منصة يلاّ اليوم'}</div>

            <div className="tabs">
              <button className={`tab ${isLogin ? 'on' : ''}`}  onClick={() => switchView(true)}>تسجيل الدخول</button>
              <button className={`tab ${!isLogin ? 'on' : ''}`} onClick={() => switchView(false)}>حساب جديد</button>
            </div>

            {message.text && (
              <div className={`toast ${message.type === 'error' ? 't-err' : 't-ok'}`}
                onClick={() => setMessage({ type: '', text: '' })}>
                {message.type === 'error' ? '❌' : '✅'} {message.text}
              </div>
            )}

            <form onSubmit={isLogin ? handleLogin : handleRegister} className="form">

              {!isLogin && (
                <>
                  <div className="fg">
                    <label className="lbl">الاسم الكامل</label>
                    <div className="iw"><span className="iico">👤</span>
                      <input className="inp" type="text" placeholder="الاسم الكامل" required
                        value={formData.fullName} onChange={field('fullName')} />
                    </div>
                  </div>
                  <div className="fg">
                    <label className="lbl">البريد الإلكتروني</label>
                    <div className="iw"><span className="iico">✉️</span>
                      <input className="inp" type="email" placeholder="example@email.com" required
                        value={formData.email} onChange={field('email')} />
                    </div>
                  </div>
                </>
              )}

              <div className="fg">
                <label className="lbl">اسم المستخدم</label>
                <div className="iw"><span className="iico">🪪</span>
                  <input className="inp" type="text" placeholder="username" required
                    autoComplete="username"
                    value={formData.username} onChange={field('username')} />
                </div>
              </div>

              <div className="fg">
                <label className="lbl">كلمة المرور {!isLogin && '(6 أحرف على الأقل)'}</label>
                <div className="iw"><span className="iico">🔑</span>
                  <input className="inp" type="password" placeholder="••••••••" required
                    minLength={isLogin ? undefined : 6}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={formData.password} onChange={field('password')} />
                </div>
              </div>

              {!isLogin && (
                <div className="fg">
                  <label className="lbl">نوع الحساب</label>
                  <div className="role-grid">
                    {ROLES.map(r => (
                      <button key={r.value} type="button"
                        className={`role-btn ${formData.role === r.value ? 'sel' : ''}`}
                        onClick={() => setFormData(p => ({ ...p, role: r.value }))}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="btn-sub" disabled={loading}>
                {loading ? <><div className="spin" /> جاري المعالجة...</> : isLogin ? '← دخول' : '← إنشاء الحساب'}
              </button>
            </form>

            <div className="flink">
              {isLogin
                ? <>ليس لديك حساب؟ <span onClick={() => switchView(false)}>أنشئ واحداً الآن</span></>
                : <>لديك حساب بالفعل؟ <span onClick={() => switchView(true)}>قم بتسجيل الدخول</span></>}
            </div>

            <div className="redirect-hints">
              <div className="rh-row"><span>👤 مستخدم</span><span className="rh-arrow">←</span><span>/user</span></div>
              <div className="rh-row"><span>🔧 ميكانيكي</span><span className="rh-arrow">←</span><span>/mechanics</span></div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}