'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/auth`;

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
  const [carDriving, setCarDriving] = useState(false);

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

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
      setCarDriving(true);
      setTimeout(() => handleSuccess(accessToken, refreshToken, user), 1800);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) {
      setMessage({ type: 'error', text: 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)' });
      return;
    }
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const res = await authFetch('/register', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email:     formData.email,
          role:      formData.role,
        }),
      });
      const { accessToken, refreshToken, user } = res.data;
      setMessage({ type: 'success', text: 'تم إنشاء الحساب! جاري التوجيه...' });
      setCarDriving(true);
      setTimeout(() => handleSuccess(accessToken, refreshToken, user), 1800);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  const field      = (k) => (e) => setFormData(p => ({ ...p, [k]: e.target.value }));
  const switchView = (v) => { setIsLogin(v); setMessage({ type: '', text: '' }); };

  if (!mounted || checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,.15)', borderTopColor: '#e53e1a', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Sora:wght@400;600;700;800&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{font-family:'Tajawal',sans-serif;direction:rtl;background:#080a10;color:#e2e8f0;min-height:100vh}

        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rot{to{transform:rotate(360deg)}}
        @keyframes toastPop{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes speed-line{0%{opacity:0;transform:translateX(0)}50%{opacity:.5}100%{opacity:0;transform:translateX(-120px)}}
        @keyframes speed-line-fast{0%{opacity:0;transform:translateX(0)}30%{opacity:.9}100%{opacity:0;transform:translateX(-500px)}}
        @keyframes flicker{0%,95%,100%{opacity:1}96%,99%{opacity:.6}}

        /* === حركة الانطلاق عند تسجيل الدخول === */
        @keyframes car-launch{
          0%   { transform:translateX(0);          opacity:1; }
          10%  { transform:translateX(-3%);         opacity:1; }
          18%  { transform:translateX(5%);          opacity:1; }
          28%  { transform:translateX(0%);          opacity:1; }
          100% { transform:translateX(-140vw);      opacity:0; }
        }
        @keyframes smoke{
          0%  { opacity:.55; transform:translate(0,0) scale(1); }
          100%{ opacity:0;   transform:translate(80px,-30px) scale(4); }
        }

        /* ── BACKGROUND SCENE ── */
        .bg-scene{
          position:fixed;inset:0;z-index:0;
          background:linear-gradient(180deg,#050608 0%,#0a0c15 30%,#0d0e18 60%,#080a0f 100%);
          overflow:hidden;
        }

        /* Road */
        .road{
          position:absolute;bottom:0;left:0;right:0;height:38%;
          background:linear-gradient(180deg,#0f1117 0%,#141720 40%,#1a1d28 100%);
          clip-path:polygon(0 25%,100% 0%,100% 100%,0 100%);
        }
        .road-line{
          position:absolute;height:3px;border-radius:2px;
          background:linear-gradient(90deg,transparent,rgba(255,90,20,.7),transparent);
          animation:speed-line 1.8s linear infinite;
        }
        .road-line.fast{
          animation:speed-line-fast .28s linear infinite !important;
          background:linear-gradient(90deg,transparent,rgba(255,160,50,.95),transparent) !important;
        }
        .road-line:nth-child(1){width:180px;bottom:14%;left:70%;animation-delay:0s}
        .road-line:nth-child(2){width:240px;bottom:20%;left:55%;animation-delay:.4s}
        .road-line:nth-child(3){width:130px;bottom:10%;left:80%;animation-delay:.9s}
        .road-line:nth-child(4){width:200px;bottom:26%;left:40%;animation-delay:1.3s}
        .road-line:nth-child(5){width:160px;bottom:18%;left:20%;animation-delay:.6s}

        .road-divider{
          position:absolute;bottom:0;left:50%;transform:translateX(-50%);
          width:6px;height:38%;
          background:repeating-linear-gradient(180deg,rgba(255,90,20,.6) 0px,rgba(255,90,20,.6) 30px,transparent 30px,transparent 60px);
          clip-path:polygon(30% 20%,70% 20%,100% 100%,0% 100%);
          opacity:.4;
        }

        .city{
          position:absolute;bottom:37%;left:0;right:0;height:180px;
          background:
            linear-gradient(180deg,transparent 0%,transparent 60%,#0d0f18 100%),
            repeating-linear-gradient(90deg,
              #0d0f18 0px,#0d0f18 18px,transparent 18px,transparent 22px,
              #0d0f18 22px,#0d0f18 48px,transparent 48px,transparent 52px,
              #0d0f18 52px,#0d0f18 62px,transparent 62px,transparent 66px,
              #0d0f18 66px,#0d0f18 90px,transparent 90px,transparent 95px,
              #0d0f18 95px,#0d0f18 110px,transparent 110px,transparent 115px
            );
          opacity:.7;
        }

        .windows{
          position:absolute;bottom:37%;left:0;right:0;height:160px;
          background:
            radial-gradient(circle 1px at 60px 40px,rgba(255,200,60,.6) 0%,transparent 3px),
            radial-gradient(circle 1px at 120px 60px,rgba(255,200,60,.4) 0%,transparent 3px),
            radial-gradient(circle 1px at 200px 30px,rgba(255,150,50,.5) 0%,transparent 3px),
            radial-gradient(circle 1px at 280px 50px,rgba(255,200,60,.6) 0%,transparent 3px),
            radial-gradient(circle 1px at 350px 25px,rgba(255,200,60,.3) 0%,transparent 3px),
            radial-gradient(circle 1px at 430px 70px,rgba(255,200,60,.5) 0%,transparent 3px),
            radial-gradient(circle 1px at 500px 40px,rgba(255,150,50,.4) 0%,transparent 3px),
            radial-gradient(circle 1px at 580px 55px,rgba(255,200,60,.6) 0%,transparent 3px),
            radial-gradient(circle 1px at 650px 30px,rgba(255,200,60,.4) 0%,transparent 3px),
            radial-gradient(circle 1px at 720px 65px,rgba(255,150,50,.5) 0%,transparent 3px),
            radial-gradient(circle 1px at 800px 35px,rgba(255,200,60,.6) 0%,transparent 3px),
            radial-gradient(circle 1px at 880px 50px,rgba(255,200,60,.3) 0%,transparent 3px),
            radial-gradient(circle 1px at 950px 42px,rgba(255,150,50,.5) 0%,transparent 3px),
            radial-gradient(circle 1px at 1030px 28px,rgba(255,200,60,.6) 0%,transparent 3px),
            radial-gradient(circle 1px at 1100px 60px,rgba(255,200,60,.4) 0%,transparent 3px);
          background-size:1200px 160px;
          animation:flicker 5s ease infinite;
        }

        .stars{
          position:absolute;top:0;left:0;right:0;bottom:62%;
          background:
            radial-gradient(circle 1px at 10% 15%,rgba(255,255,255,.8) 0%,transparent 2px),
            radial-gradient(circle 1px at 18% 30%,rgba(255,255,255,.5) 0%,transparent 2px),
            radial-gradient(circle 1px at 27% 8%,rgba(255,255,255,.7) 0%,transparent 2px),
            radial-gradient(circle 1px at 35% 22%,rgba(255,255,255,.4) 0%,transparent 2px),
            radial-gradient(circle 1px at 45% 12%,rgba(255,255,255,.9) 0%,transparent 2px),
            radial-gradient(circle 1px at 52% 35%,rgba(255,255,255,.5) 0%,transparent 2px),
            radial-gradient(circle 1px at 62% 18%,rgba(255,255,255,.7) 0%,transparent 2px),
            radial-gradient(circle 1px at 70% 6%,rgba(255,255,255,.6) 0%,transparent 2px),
            radial-gradient(circle 1px at 78% 28%,rgba(255,255,255,.8) 0%,transparent 2px),
            radial-gradient(circle 1px at 88% 14%,rgba(255,255,255,.5) 0%,transparent 2px),
            radial-gradient(circle 1px at 93% 32%,rgba(255,255,255,.4) 0%,transparent 2px),
            radial-gradient(circle 1px at 5% 42%,rgba(255,255,255,.6) 0%,transparent 2px),
            radial-gradient(circle 1px at 40% 40%,rgba(255,255,255,.3) 0%,transparent 2px),
            radial-gradient(circle 1px at 65% 38%,rgba(255,255,255,.5) 0%,transparent 2px),
            radial-gradient(circle 1px at 82% 44%,rgba(255,255,255,.4) 0%,transparent 2px);
        }

        .glow-red{position:absolute;width:500px;height:300px;background:radial-gradient(ellipse,rgba(220,40,20,.18) 0%,transparent 70%);bottom:28%;left:-100px;pointer-events:none;}
        .glow-orange{position:absolute;width:400px;height:200px;background:radial-gradient(ellipse,rgba(255,100,10,.12) 0%,transparent 70%);bottom:32%;right:0;pointer-events:none;}
        .glow-top{position:absolute;width:800px;height:400px;background:radial-gradient(ellipse,rgba(180,20,10,.08) 0%,transparent 70%);top:-100px;left:50%;transform:translateX(-50%);pointer-events:none;}

        .scanline{
          position:absolute;inset:0;pointer-events:none;
          background:repeating-linear-gradient(180deg,transparent 0px,transparent 3px,rgba(0,0,0,.06) 3px,rgba(0,0,0,.06) 4px);
          z-index:1;
        }

        /* ── السيارة — أكبر بـ ~5 مرات ── */
        .car-wrap{
          position:absolute;bottom:9%;left:0;width:100%;
          pointer-events:none;z-index:2;
          display:flex;justify-content:center;
        }
        /* حالة الانطلاق */
        .car-wrap.driving{
          animation:car-launch 1.8s cubic-bezier(.25,0,.1,1) forwards;
        }
        .race-car{
          /* ~5x: الأصل كان min(520px,70vw) → الآن min(900px,95vw) */
          width:min(900px,95vw);
          filter:drop-shadow(0 0 40px rgba(230,50,10,.65)) drop-shadow(0 0 12px rgba(255,100,20,.5));
          transition:filter .3s;
        }
        .car-wrap.driving .race-car{
          filter:drop-shadow(0 0 70px rgba(255,100,10,.95)) drop-shadow(0 0 25px rgba(255,200,50,.7));
        }

        /* أشعة المصابيح */
        .beam-left,.beam-right{
          position:absolute;bottom:12%;
          width:min(300px,38vw);height:min(100px,14vw);
          pointer-events:none;z-index:1;
        }
        .beam-left{
          right:calc(50% + min(300px,40vw));
          background:linear-gradient(270deg,rgba(255,220,120,.25) 0%,transparent 90%);
          clip-path:polygon(100% 0%,100% 100%,0% 70%,0% 30%);
          transform:skewX(-10deg);
        }
        .beam-right{
          left:calc(50% + min(300px,40vw));
          background:linear-gradient(90deg,rgba(255,220,120,.25) 0%,transparent 90%);
          clip-path:polygon(0% 0%,0% 100%,100% 70%,100% 30%);
          transform:skewX(10deg);
        }

        /* ── LAYOUT ── */
        .shell{
          min-height:100vh;display:flex;align-items:center;justify-content:flex-end;
          position:relative;z-index:10;padding:2rem clamp(1rem,5vw,5rem);
        }
        @media(max-width:640px){.shell{justify-content:center;padding:1.5rem 1rem}}

        /* ── CARD ── */
        .card{
          width:100%;max-width:420px;position:relative;z-index:10;
          background:rgba(8,10,18,.82);border:1px solid rgba(220,60,10,.28);
          border-radius:24px;padding:2.2rem 2rem;
          backdrop-filter:blur(24px);
          animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both;
          box-shadow:0 0 0 1px rgba(220,60,10,.1),0 20px 60px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,100,30,.12);
        }
        .card::before{
          content:'';position:absolute;top:0;left:10%;right:10%;height:2px;
          background:linear-gradient(90deg,transparent,#e53e1a,#ff6b1a,#e53e1a,transparent);
          border-radius:0 0 4px 4px;
        }

        .brand-row{display:flex;align-items:center;gap:.6rem;margin-bottom:1.5rem;}
        .brand-icon{width:38px;height:38px;background:linear-gradient(135deg,#e53e1a,#ff6b1a);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;box-shadow:0 0 16px rgba(229,62,26,.5);flex-shrink:0;}
        .brand-name{font-family:'Sora',sans-serif;font-size:1.1rem;font-weight:800;background:linear-gradient(90deg,#ff6b1a,#ffd54f);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .brand-tag{font-size:.7rem;color:rgba(255,107,26,.5);font-weight:500;letter-spacing:.05em}

        .card-title{font-family:'Sora',sans-serif;font-size:1.45rem;font-weight:800;color:#fff;margin-bottom:.25rem;}
        .card-sub{font-size:.87rem;color:rgba(255,255,255,.32);margin-bottom:1.6rem}

        .tabs{display:flex;background:rgba(255,255,255,.04);border:1px solid rgba(220,60,10,.15);border-radius:12px;padding:3px;margin-bottom:1.6rem;gap:3px;}
        .tab{flex:1;padding:.55rem;border:none;border-radius:9px;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:500;cursor:pointer;transition:all .22s;background:transparent;color:rgba(255,255,255,.3);}
        .tab.on{background:linear-gradient(135deg,#c0330f,#e53e1a);color:#fff;font-weight:700;box-shadow:0 3px 14px rgba(229,62,26,.45);}

        .form{display:flex;flex-direction:column;gap:.8rem}
        .fg{display:flex;flex-direction:column;gap:.28rem}
        .lbl{font-size:.77rem;font-weight:600;color:rgba(255,255,255,.36);padding-right:2px}
        .iw{position:relative}
        .iico{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:.88rem;opacity:.35;pointer-events:none;z-index:1;}
        .inp{width:100%;padding:.78rem 2.4rem .78rem .9rem;background:rgba(255,255,255,.045);border:1.5px solid rgba(255,255,255,.08);border-radius:12px;color:#fff;font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none;transition:border-color .2s,background .2s,box-shadow .2s;text-align:right;}
        .inp:focus{border-color:#e53e1a;background:rgba(229,62,26,.08);box-shadow:0 0 0 3px rgba(229,62,26,.15);}
        .inp::placeholder{color:rgba(255,255,255,.2)}

        .role-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
        .role-btn{padding:.65rem .5rem;border-radius:11px;border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(255,255,255,.45);font-family:'Tajawal',sans-serif;font-size:.87rem;font-weight:500;cursor:pointer;transition:all .2s;text-align:center;}
        .role-btn.sel{background:rgba(229,62,26,.15);border-color:rgba(229,62,26,.5);color:#ff8a5b;font-weight:700;}

        .btn-sub{margin-top:.25rem;padding:.88rem;background:linear-gradient(135deg,#c0330f 0%,#e53e1a 50%,#ff5a20 100%);border:none;border-radius:13px;color:#fff;font-family:'Tajawal',sans-serif;font-size:1.05rem;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;box-shadow:0 4px 22px rgba(229,62,26,.5);width:100%;display:flex;align-items:center;justify-content:center;gap:.5rem;letter-spacing:.02em;}
        .btn-sub:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(229,62,26,.65);}
        .btn-sub:disabled{opacity:.5;cursor:not-allowed}
        .btn-sub:active:not(:disabled){transform:translateY(0)}

        .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:rot .65s linear infinite;flex-shrink:0;}

        .toast{display:flex;align-items:center;gap:.5rem;padding:.7rem .9rem;border-radius:11px;font-size:.86rem;font-weight:500;margin-bottom:1.1rem;cursor:pointer;animation:toastPop .25s ease;}
        .t-ok{background:rgba(16,185,129,.1);color:#6ee7b7;border:1px solid rgba(16,185,129,.2)}
        .t-err{background:rgba(229,62,26,.12);color:#ff9a7a;border:1px solid rgba(229,62,26,.25)}

        .flink{text-align:center;margin-top:1rem;font-size:.84rem;color:rgba(255,255,255,.28)}
        .flink span{color:#ff6b1a;cursor:pointer;font-weight:600;transition:color .2s}
        .flink span:hover{color:#ff8a4a}

        .redirect-hints{display:flex;flex-direction:column;gap:.4rem;margin-top:1.2rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.06);}
        .rh-row{display:flex;align-items:center;gap:.5rem;font-size:.77rem;color:rgba(255,255,255,.25)}
        .rh-arrow{color:#e53e1a;font-weight:700}

        .stripe-deco{position:absolute;top:12px;left:-1px;display:flex;flex-direction:column;gap:3px;pointer-events:none;}
        .stripe{height:3px;border-radius:0 2px 2px 0;}
        .stripe:nth-child(1){width:18px;background:#e53e1a;opacity:.8}
        .stripe:nth-child(2){width:12px;background:#ff6b1a;opacity:.6}
        .stripe:nth-child(3){width:7px;background:#ffd54f;opacity:.5}
      `}</style>

      {/* ── BACKGROUND SCENE ── */}
      <div className="bg-scene" aria-hidden="true">
        <div className="stars" />
        <div className="glow-top" />

        {/* أشعة المصابيح */}
        <div className="beam-left" />
        <div className="beam-right" />

        {/* ── السيارة الكبيرة ── */}
        <div className={`car-wrap${carDriving ? ' driving' : ''}`}>
          <svg className="race-car" viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#e53e1a"/>
                <stop offset="60%" stopColor="#b02e0c"/>
                <stop offset="100%" stopColor="#6b1a06"/>
              </radialGradient>
              <radialGradient id="windowGrad" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#9ecfff" stopOpacity=".9"/>
                <stop offset="100%" stopColor="#0a2040" stopOpacity=".95"/>
              </radialGradient>
              <radialGradient id="tireGrad" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#3a3a3a"/>
                <stop offset="100%" stopColor="#111"/>
              </radialGradient>
            </defs>

            {/* ظل السيارة */}
            <ellipse cx="260" cy="166" rx="180" ry="10" fill="rgba(0,0,0,.5)"/>

            {/* دخان العادم عند الانطلاق */}
            {carDriving && (
              <g style={{ animation: 'smoke .45s ease-out infinite' }}>
                <circle cx="504" cy="127" r="9"  fill="rgba(200,120,50,.4)" />
                <circle cx="516" cy="121" r="7"  fill="rgba(180,90,30,.3)" />
                <circle cx="526" cy="116" r="5"  fill="rgba(160,70,20,.2)" />
              </g>
            )}

            {/* Front spoiler */}
            <path d="M60 138 Q50 142 30 145 L40 150 Q70 148 90 142 Z" fill="#8a2a08"/>
            <rect x="30" y="144" width="40" height="4" rx="2" fill="#e53e1a" opacity=".7"/>

            {/* Rear spoiler wing */}
            <rect x="400" y="85" width="80" height="7" rx="3" fill="#c5330f"/>
            <rect x="420" y="92" width="8" height="30" rx="2" fill="#8a2a08"/>
            <rect x="452" y="92" width="8" height="30" rx="2" fill="#8a2a08"/>

            {/* Main car body */}
            <path d="M80 140 Q60 138 50 130 Q45 118 60 108
                     L120 98 Q150 72 200 65 L310 62
                     Q360 62 390 75 L440 92 Q470 100 480 112
                     Q490 122 485 132 Q478 140 460 142 Z"
              fill="url(#bodyGrad)"/>

            {/* Body highlight stripe */}
            <path d="M130 98 Q200 80 310 78 Q370 78 410 88 L400 82 Q360 72 310 68 L200 70 Q145 78 110 96 Z"
              fill="rgba(255,150,80,.25)"/>

            {/* Cockpit / windscreen */}
            <path d="M195 95 Q215 68 270 64 L320 64 Q360 66 380 82 L360 95 Q330 82 280 80 Q230 80 210 95 Z"
              fill="url(#windowGrad)" opacity=".92"/>

            {/* Roll cage/halo */}
            <path d="M240 92 Q260 76 300 76 Q330 76 345 90"
              fill="none" stroke="#bbb" strokeWidth="5" strokeLinecap="round"/>
            <path d="M240 92 Q260 78 300 78 Q330 78 345 90"
              fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" strokeLinecap="round"/>

            {/* Side intake vents */}
            <path d="M110 128 L120 118 L145 118 L135 128 Z" fill="#5a1a06" opacity=".9"/>
            <path d="M112 126 L119 120 L130 120 L124 126 Z" fill="rgba(255,80,20,.3)"/>

            {/* Rear diffuser vents */}
            <path d="M440 128 L448 120 L465 120 L458 128 Z" fill="#5a1a06" opacity=".9"/>
            <path d="M442 126 L449 122 L460 122 L455 126 Z" fill="rgba(255,80,20,.2)"/>

            {/* F1-style nose cone */}
            <path d="M80 132 Q60 130 40 128 Q28 127 25 132 Q28 138 50 138 L80 138 Z" fill="#9b2d0c"/>
            <rect x="24" y="130" width="8" height="5" rx="2" fill="#ffcc00" opacity=".9"/>

            {/* Racing number plate */}
            <rect x="152" y="108" width="46" height="26" rx="5" fill="#fff" opacity=".92"/>
            <text x="175" y="126" textAnchor="middle" fontFamily="'Sora',sans-serif"
                  fontSize="16" fontWeight="800" fill="#e53e1a">1</text>

            {/* Racing stripes along body */}
            <path d="M160 140 L440 140" stroke="#ffcc00" strokeWidth="3" opacity=".6" strokeLinecap="round"/>
            <path d="M170 136 L430 136" stroke="rgba(255,200,0,.25)" strokeWidth="1.5" opacity=".8"/>

            {/* Front tire */}
            <ellipse cx="140" cy="150" rx="32" ry="22" fill="url(#tireGrad)"/>
            <ellipse cx="140" cy="150" rx="32" ry="22" fill="none" stroke="#333" strokeWidth="4"/>
            <ellipse cx="140" cy="150" rx="20" ry="14" fill="#222"/>
            <ellipse cx="140" cy="150" rx="8"  ry="6"  fill="#444"/>
            <path d="M127 142 Q135 138 145 140" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>

            {/* Rear tire */}
            <ellipse cx="380" cy="150" rx="34" ry="23" fill="url(#tireGrad)"/>
            <ellipse cx="380" cy="150" rx="34" ry="23" fill="none" stroke="#333" strokeWidth="4"/>
            <ellipse cx="380" cy="150" rx="21" ry="15" fill="#222"/>
            <ellipse cx="380" cy="150" rx="8"  ry="6"  fill="#444"/>
            <path d="M366 142 Q375 138 386 140" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>

            {/* Brake disc glow */}
            <ellipse cx="140" cy="150" rx="12" ry="8"
              fill={carDriving ? 'rgba(255,180,20,.4)' : 'rgba(255,120,20,.12)'}/>
            <ellipse cx="380" cy="150" rx="13" ry="9"
              fill={carDriving ? 'rgba(255,160,20,.35)' : 'rgba(255,120,20,.1)'}/>

            {/* Exhaust glow */}
            <ellipse cx="490" cy="132" rx={carDriving ? 20 : 10} ry={carDriving ? 12 : 6}
              fill="rgba(255,80,10,.3)"/>
            <ellipse cx="500" cy="132" rx={carDriving ? 14 : 6}  ry={carDriving ? 9 : 4}
              fill="rgba(255,160,30,.45)"/>

            {/* Headlights */}
            <ellipse cx="46" cy="124" rx="9" ry="6" fill="#ffe082" opacity=".9"/>
            <ellipse cx="46" cy="124" rx="6" ry="4" fill="#fff"    opacity=".95"/>

            {/* Tail lights — تتوهج أكثر عند الانطلاق */}
            <ellipse cx="482" cy="122" rx={carDriving ? 11 : 7} ry={carDriving ? 8 : 5}
              fill="#ff1a00" opacity=".9"/>
            <ellipse cx="482" cy="122" rx={carDriving ? 7  : 4} ry={carDriving ? 5 : 3}
              fill="#ff6060" opacity=".95"/>

            {/* Axle details */}
            <rect x="108" y="148" width="32" height="4" rx="2" fill="#333"/>
            <rect x="346" y="149" width="34" height="4" rx="2" fill="#333"/>

            {/* Cooling fins */}
            <path d="M420 105 L435 105 M420 110 L435 110 M420 115 L435 115"
              stroke="rgba(255,80,20,.4)" strokeWidth="1.5" strokeLinecap="round"/>

            {/* خطوط السرعة خلف السيارة — تظهر فقط عند الانطلاق */}
            {carDriving && <>
              <line x1="502" y1="115" x2="520" y2="115" stroke="rgba(255,200,60,.8)"  strokeWidth="2"   strokeLinecap="round"/>
              <line x1="504" y1="122" x2="520" y2="122" stroke="rgba(255,130,30,.65)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="504" y1="129" x2="520" y2="129" stroke="rgba(255,100,20,.7)"  strokeWidth="2"   strokeLinecap="round"/>
              <line x1="506" y1="136" x2="520" y2="136" stroke="rgba(255,200,60,.5)"  strokeWidth="1"   strokeLinecap="round"/>
            </>}
          </svg>
        </div>

        <div className="city" />
        <div className="windows" />
        <div className="road">
          <div className={`road-line${carDriving ? ' fast' : ''}`}/>
          <div className={`road-line${carDriving ? ' fast' : ''}`}/>
          <div className={`road-line${carDriving ? ' fast' : ''}`}/>
          <div className={`road-line${carDriving ? ' fast' : ''}`}/>
          <div className={`road-line${carDriving ? ' fast' : ''}`}/>
        </div>
        <div className="road-divider" />
        <div className="glow-red" />
        <div className="glow-orange" />
        <div className="scanline" />
      </div>

      {/* ── MAIN SHELL ── */}
      <div className="shell">
        <div className="card">
          <div className="stripe-deco">
            <div className="stripe"/>
            <div className="stripe"/>
            <div className="stripe"/>
          </div>

          <div className="brand-row">
            <div className="brand-icon">🏎️</div>
            <div>
              <div className="brand-name">منصة يلاّ</div>
              <div className="brand-tag">YALLA PLATFORM</div>
            </div>
          </div>

          <div className="card-title">{isLogin ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}</div>
          <div className="card-sub">{isLogin ? 'سجّل دخولك للانطلاق 🚀' : 'انضم إلى منصة يلاّ اليوم'}</div>

          <div className="tabs">
            <button className={`tab ${isLogin ? 'on' : ''}`}  onClick={() => switchView(true)}>تسجيل الدخول</button>
            <button className={`tab ${!isLogin ? 'on' : ''}`} onClick={() => switchView(false)}>إنشاء حساب</button>
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
                  <label className="lbl">الاسم الثلاثي</label>
                  <div className="iw"><span className="iico">👤</span>
                    <input className="inp" type="text" placeholder="الاسم الثلاثي" required
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

            <button type="submit" className="btn-sub" disabled={loading || carDriving}>
              {loading
                ? <><div className="spin" /> جاري المعالجة...</>
                : carDriving
                ? '🏎️ جاري الانطلاق...'
                : isLogin ? '🏁 دخول' : '🏎️ إنشاء الحساب'}
            </button>
          </form>

          <div className="flink">
            {isLogin
              ? <>ليس لديك حساب؟ <span onClick={() => switchView(false)}>أنشئ حسابك الآن</span></>
              : <>لديك حساب بالفعل؟ <span onClick={() => switchView(true)}>قم بتسجيل الدخول</span></>}
          </div>

          <div className="redirect-hints">
            <div className="rh-row"><span>👤 مستخدم</span><span className="rh-arrow">←</span><span>/user</span></div>
            <div className="rh-row"><span>🔧 ميكانيكي</span><span className="rh-arrow">←</span><span>/mechanics</span></div>
          </div>
        </div>
      </div>
    </>
  );
}