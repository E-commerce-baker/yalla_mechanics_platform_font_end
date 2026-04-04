"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [counters, setCounters] = useState({ mechanics: 0, users: 0, cities: 0, reviews: 0 });
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // ✅ الإصلاح الرئيسي — نطبّق الكلاس على document.body مباشرة
  // بهذه الطريقة كل الـ CSS المعرّف على body.dark-theme و body.light-theme يشتغل على الصفحة كاملة
  useEffect(() => {
    document.body.classList.remove("dark-theme", "light-theme");
    document.body.classList.add(darkMode ? "dark-theme" : "light-theme");
  }, [darkMode]);

  // نضبط الكلاس الأول عند أول تحميل
  useEffect(() => {
    document.body.classList.add("dark-theme");
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = { mechanics: 340, users: 12000, cities: 18, reviews: 8400 };
    const duration = 2000;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters({
        mechanics: Math.floor(ease * targets.mechanics),
        users: Math.floor(ease * targets.users),
        cities: Math.floor(ease * targets.cities),
        reviews: Math.floor(ease * targets.reviews),
      });
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [statsVisible]);

  const handleToggle = () => {
    setIsToggling(true);
    setTimeout(() => {
      setDarkMode((prev) => !prev);
      setIsToggling(false);
    }, 300);
  };

  const features = [
    { icon: "🔧", title: "ميكانيكيون معتمدون", desc: "كل ميكانيكي على المنصة مُراجَع ومعتمد من فريقنا. لا تخاطر بسيارتك مع غرباء.", color: "#FF6B35" },
    { icon: "📍", title: "ابحث بالموقع", desc: "اعثر على أقرب ميكانيكي لمكانك الآن. GPS دقيق، مواقع محدثة لحظياً.", color: "#4ECDC4" },
    { icon: "⭐", title: "تقييمات حقيقية", desc: "آراء مستخدمين حقيقيين، لا تقييمات مزيفة. اختر بثقة بناءً على تجارب الآخرين.", color: "#FFE66D" },
  ];

  const steps = [
    { num: "١", title: "سجّل حسابك", desc: "بدقيقة واحدة، أنشئ حسابك واحصل على وصول كامل للمنصة.", icon: "👤" },
    { num: "٢", title: "ابحث عن ميكانيكي", desc: "استعرض الميكانيكيين القريبين منك مع تقييماتهم ومواقعهم.", icon: "🔍" },
    { num: "٣", title: "قيّم تجربتك", desc: "بعد الخدمة، شارك تجربتك وساعد الآخرين على الاختيار الصحيح.", icon: "⭐" },
  ];

  const tiltX = mousePos.y * -8;
  const tiltY = mousePos.x * 8;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ══════════════════════════════════════════
           DARK THEME — مطبّق على body مباشرة
        ══════════════════════════════════════════ */
        body.dark-theme {
          --orange: #FF6B35;
          --orange2: #FF3D00;
          --orange-glow: rgba(255,107,53,0.35);
          --teal: #4ECDC4;
          --yellow: #FFE66D;

          --bg: #08080E;
          --bg2: #0E0E18;
          --bg3: #141420;
          --bg4: #0A0A14;

          --card: #13131C;
          --card2: #1A1A28;
          --card3: #1F1F30;

          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.12);
          --border3: rgba(255,255,255,0.18);

          --text: #F0EEF8;
          --text2: #C8C6D8;
          --muted: #7A7A9A;
          --muted2: #5A5A76;

          --nav-bg: rgba(8,8,14,0.88);
          --stat-bg: #13131C;
          --hero-grid: rgba(255,255,255,0.018);

          --shadow-sm: 0 2px 8px rgba(0,0,0,0.4);
          --shadow-md: 0 8px 32px rgba(0,0,0,0.5);
          --shadow-lg: 0 24px 64px rgba(0,0,0,0.6);
          --shadow-orange: 0 8px 32px rgba(255,107,53,0.4);
        }

        /* ══════════════════════════════════════════
           LIGHT THEME — مطبّق على body مباشرة
        ══════════════════════════════════════════ */
        body.light-theme {
          --orange: #E05515;
          --orange2: #B83C00;
          --orange-glow: rgba(224,85,21,0.22);
          --teal: #1A9E96;
          --yellow: #C89600;

          --bg: #F7F4EE;
          --bg2: #EEE9E0;
          --bg3: #E6E0D6;
          --bg4: #F2EEE8;

          --card: #FFFFFF;
          --card2: #FAF8F4;
          --card3: #F4F1EB;

          --border: rgba(180,160,130,0.18);
          --border2: rgba(160,140,110,0.28);
          --border3: rgba(140,120,90,0.38);

          --text: #1C1814;
          --text2: #3A342C;
          --muted: #7A7060;
          --muted2: #A09080;

          --nav-bg: rgba(247,244,238,0.92);
          --stat-bg: #FFFFFF;
          --hero-grid: rgba(100,80,50,0.055);

          --shadow-sm: 0 2px 8px rgba(80,60,30,0.1);
          --shadow-md: 0 8px 32px rgba(80,60,30,0.14);
          --shadow-lg: 0 24px 64px rgba(80,60,30,0.18);
          --shadow-orange: 0 8px 32px rgba(224,85,21,0.28);
        }

        html { scroll-behavior: smooth; direction: rtl; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Tajawal', sans-serif;
          overflow-x: hidden;
          transition: background 0.6s cubic-bezier(0.4,0,0.2,1),
                      color 0.6s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── Page flash overlay on theme switch ── */
        .theme-flash {
          position: fixed; inset: 0; z-index: 9999;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .theme-flash.active { opacity: 1; }
        body.dark-theme .theme-flash { background: radial-gradient(circle at 50% 50%, rgba(255,107,53,0.12), transparent 70%); }
        body.light-theme .theme-flash { background: radial-gradient(circle at 50% 50%, rgba(255,230,180,0.25), transparent 70%); }

        /* ══════════════════════════════════════════
           THEME TOGGLE BUTTON
        ══════════════════════════════════════════ */
        .theme-toggle {
          position: relative;
          width: 64px; height: 34px;
          border-radius: 17px;
          border: 1.5px solid var(--border2);
          background: var(--card2);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
          display: flex; align-items: center;
          padding: 4px;
          flex-shrink: 0;
          overflow: hidden;
        }
        .theme-toggle:hover {
          border-color: var(--orange);
          box-shadow: 0 0 0 3px var(--orange-glow), var(--shadow-sm);
          transform: scale(1.04);
        }
        .theme-toggle:active { transform: scale(0.97); }

        .toggle-track {
          position: absolute; inset: 0; border-radius: 17px;
          transition: opacity 0.5s ease;
        }
        body.dark-theme .toggle-track {
          background: linear-gradient(135deg, #1A1A2E 0%, #0D0D1A 100%);
        }
        body.light-theme .toggle-track {
          background: linear-gradient(135deg, #FFF8E8 0%, #FFE9C8 100%);
        }

        .toggle-deco {
          position: absolute; inset: 0; border-radius: 17px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 9px; pointer-events: none; overflow: hidden;
        }
        .deco-icon {
          font-size: 12px;
          transition: opacity 0.4s ease, transform 0.4s ease;
          line-height: 1;
        }
        body.dark-theme .deco-moon { opacity: 1; transform: scale(1) rotate(0deg); }
        body.dark-theme .deco-sun  { opacity: 0; transform: scale(0.5) rotate(90deg); }
        body.light-theme .deco-moon { opacity: 0; transform: scale(0.5) rotate(-90deg); }
        body.light-theme .deco-sun  { opacity: 1; transform: scale(1) rotate(0deg); }

        .toggle-thumb {
          position: relative; z-index: 2;
          width: 24px; height: 24px; border-radius: 50%;
          transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1),
                      background 0.4s ease,
                      box-shadow 0.4s ease;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }
        body.dark-theme .toggle-thumb {
          transform: translateX(0px);
          background: linear-gradient(135deg, #6060C0, #3030A0);
          box-shadow: 0 2px 10px rgba(80,80,200,0.6), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        body.light-theme .toggle-thumb {
          transform: translateX(-30px);
          background: linear-gradient(135deg, #FFD040, #FFA020);
          box-shadow: 0 2px 10px rgba(255,180,30,0.7), inset 0 1px 0 rgba(255,255,255,0.4);
        }

        /* ══════════════════════════════════════════
           NAV
        ══════════════════════════════════════════ */
        nav {
          position: fixed; top: 0; width: 100%; z-index: 100;
          padding: 0 5%; display: flex; align-items: center; justify-content: space-between;
          height: 72px;
          transition: all 0.5s cubic-bezier(0.23,1,0.32,1);
        }
        nav.scrolled {
          background: var(--nav-bg);
          backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 1px solid var(--border2);
          box-shadow: var(--shadow-md);
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, var(--orange), var(--orange2));
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; box-shadow: 0 0 24px var(--orange-glow);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .logo-icon:hover { transform: scale(1.1) rotate(-5deg); box-shadow: 0 0 36px var(--orange-glow); }
        .logo-text { font-weight: 900; font-size: 22px; color: var(--text); letter-spacing: -0.5px; transition: color 0.5s; }
        .logo-text span { color: var(--orange); }

        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a {
          color: var(--muted); text-decoration: none; font-size: 15px; font-weight: 500;
          transition: color 0.25s; position: relative;
        }
        .nav-links a::after {
          content: ''; position: absolute; bottom: -4px; right: 0; left: 0;
          height: 1.5px; background: var(--orange);
          transform: scaleX(0); transition: transform 0.25s ease;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-links a:hover::after { transform: scaleX(1); }

        .nav-cta { display: flex; gap: 12px; align-items: center; }
        .btn-ghost {
          padding: 9px 22px; border-radius: 10px; font-size: 14px; font-weight: 600;
          border: 1.5px solid var(--border2); color: var(--text); background: transparent;
          cursor: pointer; transition: all 0.25s; font-family: 'Tajawal', sans-serif;
          text-decoration: none;
        }
        .btn-ghost:hover { border-color: var(--orange); color: var(--orange); transform: translateY(-1px); }
        .btn-primary {
          padding: 9px 22px; border-radius: 10px; font-size: 14px; font-weight: 700;
          border: none; background: linear-gradient(135deg, var(--orange), var(--orange2));
          color: white; cursor: pointer; transition: all 0.25s;
          font-family: 'Tajawal', sans-serif; text-decoration: none;
          box-shadow: var(--shadow-orange);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 36px var(--orange-glow); }

        /* ══════════════════════════════════════════
           HERO
        ══════════════════════════════════════════ */
        .hero {
          min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; padding: 100px 5% 60px;
          position: relative; overflow: hidden; gap: 40px;
        }
        .hero-bg {
          position: absolute; inset: 0; z-index: 0;
          transition: background 0.6s;
        }
        body.dark-theme .hero-bg {
          background:
            radial-gradient(ellipse 60% 80% at 70% 40%, rgba(255,107,53,0.1) 0%, transparent 65%),
            radial-gradient(ellipse 50% 60% at 10% 70%, rgba(78,205,196,0.06) 0%, transparent 55%);
        }
        body.light-theme .hero-bg {
          background:
            radial-gradient(ellipse 70% 80% at 75% 35%, rgba(224,85,21,0.09) 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 15% 65%, rgba(26,158,150,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 40% 50% at 50% 100%, rgba(200,150,0,0.06) 0%, transparent 50%);
        }
        .hero-grid {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(var(--hero-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px);
          background-size: 55px 55px;
          mask-image: radial-gradient(ellipse 90% 90% at 60% 50%, black 20%, transparent 80%);
        }

        .hero-text-col {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; gap: 28px;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.28);
          padding: 8px 18px; border-radius: 50px;
          font-size: 13px; font-weight: 600; color: var(--orange);
          width: fit-content;
          opacity: 0; transform: translateY(-16px);
          animation: fadeDown 0.7s 0.1s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        body.light-theme .hero-badge {
          background: rgba(224,85,21,0.08);
          border-color: rgba(224,85,21,0.25);
          box-shadow: 0 2px 12px rgba(224,85,21,0.1);
        }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--orange); animation: pulse 1.8s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }

        .hero-title {
          font-weight: 900; font-size: clamp(40px, 5.5vw, 78px);
          line-height: 1.05; letter-spacing: -2px;
          opacity: 0; transform: translateY(28px);
          animation: fadeUp 0.8s 0.25s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        .hero-title .line1 { display: block; color: var(--text); }
        .hero-title .line2 {
          display: block;
          background: linear-gradient(100deg, var(--orange) 0%, var(--orange2) 45%, #FF8C42 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-title .line3 { display: block; color: var(--teal); }

        .hero-sub {
          font-size: clamp(15px, 1.8vw, 18px); color: var(--muted);
          line-height: 1.75; font-weight: 400; max-width: 480px;
          opacity: 0; transform: translateY(20px);
          animation: fadeUp 0.8s 0.4s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        .hero-actions {
          display: flex; gap: 14px; flex-wrap: wrap;
          opacity: 0; transform: translateY(20px);
          animation: fadeUp 0.8s 0.55s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        .btn-xl {
          padding: 16px 34px; border-radius: 14px; font-size: 16px; font-weight: 700;
          background: linear-gradient(135deg, var(--orange), var(--orange2));
          color: white; border: none; cursor: pointer; font-family: 'Tajawal', sans-serif;
          text-decoration: none; display: inline-block;
          box-shadow: var(--shadow-orange);
          transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
        }
        .btn-xl:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 18px 50px var(--orange-glow); }

        .btn-xl-outline {
          padding: 16px 34px; border-radius: 14px; font-size: 16px; font-weight: 700;
          color: var(--text); font-family: 'Tajawal', sans-serif;
          border: 1.5px solid var(--border2); cursor: pointer; text-decoration: none; display: inline-block;
          transition: all 0.3s cubic-bezier(0.23,1,0.32,1); backdrop-filter: blur(8px);
        }
        body.dark-theme .btn-xl-outline { background: rgba(255,255,255,0.04); }
        body.light-theme .btn-xl-outline {
          background: rgba(255,255,255,0.7);
          border-color: var(--border3);
          box-shadow: var(--shadow-sm);
        }
        .btn-xl-outline:hover { border-color: var(--teal); color: var(--teal); transform: translateY(-2px); }

        /* ── HERO SCENE ── */
        .hero-scene-col {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; animation: fadeUp 1s 0.3s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        .scene-3d-wrapper { width: 100%; max-width: 640px; perspective: 1400px; }
        .scene-3d { width: 100%; transform-style: preserve-3d; transition: transform 0.12s ease-out; }
        .scene-svg-container {
          width: 100%;
          filter: drop-shadow(0 50px 100px rgba(255,107,53,0.3)) drop-shadow(0 0 140px rgba(78,205,196,0.15));
        }
        body.light-theme .scene-svg-container {
          filter: drop-shadow(0 40px 80px rgba(224,85,21,0.2)) drop-shadow(0 0 100px rgba(26,158,150,0.12));
        }

        .scene-glow { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); }
        .sg1 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(255,107,53,0.22), transparent 70%);
          top: 5%; left: 0%; animation: orbFloat 6s ease-in-out infinite;
        }
        .sg2 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(78,205,196,0.14), transparent 70%);
          bottom: 0%; right: 5%; animation: orbFloat 8s 2s ease-in-out infinite reverse;
        }
        body.light-theme .sg1 { background: radial-gradient(circle, rgba(224,85,21,0.12), transparent 70%); }
        body.light-theme .sg2 { background: radial-gradient(circle, rgba(26,158,150,0.1), transparent 70%); }
        @keyframes orbFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }

        .scene-badge-live {
          position: absolute; top: 8%; left: -8%;
          background: var(--card2); border: 1px solid rgba(78,205,196,0.3);
          border-radius: 14px; padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 600;
          box-shadow: var(--shadow-md), 0 0 0 1px rgba(78,205,196,0.1);
          animation: floatBadge1 4.5s ease-in-out infinite;
          backdrop-filter: blur(16px); white-space: nowrap;
          transition: background 0.5s, border-color 0.5s, box-shadow 0.5s;
        }
        body.light-theme .scene-badge-live {
          background: rgba(255,255,255,0.92);
          border-color: rgba(26,158,150,0.35);
          box-shadow: var(--shadow-lg), 0 0 0 1px rgba(26,158,150,0.1);
        }
        .scene-badge-rating {
          position: absolute; bottom: 12%; right: -6%;
          background: var(--card2); border: 1px solid rgba(255,230,109,0.3);
          border-radius: 14px; padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 600;
          box-shadow: var(--shadow-md), 0 0 0 1px rgba(255,230,109,0.1);
          animation: floatBadge2 5s 1s ease-in-out infinite;
          backdrop-filter: blur(16px); white-space: nowrap;
          transition: background 0.5s, border-color 0.5s, box-shadow 0.5s;
        }
        body.light-theme .scene-badge-rating {
          background: rgba(255,255,255,0.92);
          border-color: rgba(200,150,0,0.4);
          box-shadow: var(--shadow-lg);
        }
        @keyframes floatBadge1 { 0%,100%{transform:translateY(0) rotate(-1.5deg)} 50%{transform:translateY(-12px) rotate(1deg)} }
        @keyframes floatBadge2 { 0%,100%{transform:translateY(0) rotate(1.5deg)} 50%{transform:translateY(-10px) rotate(-1deg)} }
        .badge-dot-live { width: 8px; height: 8px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 10px var(--teal); animation: pulse 1.4s infinite; }
        .badge-stars { color: var(--yellow); font-size: 11px; letter-spacing: 1px; }
        body.light-theme .badge-stars { color: #C89600; }
        .badge-label { color: var(--muted); font-size: 11px; }
        .badge-val { color: var(--text); font-weight: 800; }

        .hero-scroll-hint {
          display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
          color: var(--muted); font-size: 12px;
          opacity: 0; animation: fadeUp 0.8s 0.9s ease forwards;
        }
        .scroll-line { width: 1px; height: 38px; background: linear-gradient(var(--orange), transparent); animation: scrollPulse 2.2s infinite; }
        @keyframes scrollPulse { 0%{opacity:0.2;transform:scaleY(0.4)} 50%{opacity:1;transform:scaleY(1)} 100%{opacity:0.2;transform:scaleY(0.4)} }

        /* ── CAR ANIMATIONS ── */
        .car-bob { animation: carBob 3.5s ease-in-out infinite; }
        @keyframes carBob { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
        .wheel-spin-f { animation: wSpin 2s linear infinite; transform-origin: 430px 310px; }
        .wheel-spin-r { animation: wSpin 2s linear infinite; transform-origin: 155px 310px; }
        @keyframes wSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .arm-anim { animation: armWork 0.6s ease-in-out infinite alternate; transform-origin: 550px 200px; }
        @keyframes armWork { from{transform:rotate(-20deg) translateY(0)} to{transform:rotate(15deg) translateY(-5px)} }
        .wrench-anim { animation: wrenchTwist 0.6s ease-in-out infinite alternate; transform-origin: 565px 215px; }
        @keyframes wrenchTwist { from{transform:rotate(-25deg)} to{transform:rotate(20deg)} }
        .spark-a { animation: spkA 0.5s 0s ease-in-out infinite alternate; }
        .spark-b { animation: spkA 0.5s 0.15s ease-in-out infinite alternate; }
        .spark-c { animation: spkA 0.5s 0.08s ease-in-out infinite alternate; }
        @keyframes spkA { from{opacity:0;transform:scale(0.3) translate(-3px,3px)} to{opacity:1;transform:scale(1.4) translate(4px,-5px)} }
        .smoke-1 { animation: smokeRise 1.8s 0s ease-out infinite; }
        .smoke-2 { animation: smokeRise 1.8s 0.6s ease-out infinite; }
        .smoke-3 { animation: smokeRise 1.8s 1.2s ease-out infinite; }
        @keyframes smokeRise { 0%{opacity:0.5;transform:scale(0.5) translateY(0)} 100%{opacity:0;transform:scale(2.2) translateY(-30px)} }
        .diag-pulse { animation: diagBlink 0.9s ease-in-out infinite; }
        @keyframes diagBlink { 0%,100%{opacity:1} 50%{opacity:0.1} }
        .shadow-pulse { animation: sPulse 3.5s ease-in-out infinite; }
        @keyframes sPulse { 0%,100%{transform:scaleX(1);opacity:0.4} 50%{transform:scaleX(0.88);opacity:0.22} }
        .engine-glow-anim { animation: engGlow 1.5s ease-in-out infinite alternate; }
        @keyframes engGlow { from{opacity:0.3} to{opacity:0.7} }
        .oil-drip { animation: oilDrip 2.5s ease-in infinite; }
        @keyframes oilDrip { 0%{transform:translateY(0);opacity:0.9} 80%{transform:translateY(22px);opacity:0.4} 100%{transform:translateY(25px);opacity:0} }

        /* ══════════════════════════════════════════
           STATS
        ══════════════════════════════════════════ */
        .stats-section {
          padding: 80px 5%;
          background: linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%);
          position: relative; z-index: 1;
          transition: background 0.6s;
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
          background: var(--border); border-radius: 22px; overflow: hidden;
          border: 1px solid var(--border2); max-width: 1100px; margin: 0 auto;
          box-shadow: var(--shadow-md);
        }
        .stat-item {
          background: var(--stat-bg); padding: 44px 28px; text-align: center;
          transition: background 0.3s, transform 0.3s;
          position: relative; overflow: hidden;
        }
        .stat-item::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--orange), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .stat-item:hover { background: var(--card2); }
        .stat-item:hover::before { opacity: 1; }
        .stat-num {
          font-weight: 900; font-size: clamp(36px, 4vw, 54px); line-height: 1;
          background: linear-gradient(135deg, var(--orange), var(--yellow));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        body.light-theme .stat-num {
          background: linear-gradient(135deg, var(--orange), #CC8000);
          -webkit-background-clip: text; background-clip: text;
        }
        .stat-suffix { font-size: 0.55em; }
        .stat-label { color: var(--muted); font-size: 14px; margin-top: 10px; font-weight: 500; }

        /* ══════════════════════════════════════════
           FEATURES
        ══════════════════════════════════════════ */
        .features-section { padding: 110px 5%; position: relative; z-index: 1; }
        .features-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .features-text { display: flex; flex-direction: column; gap: 0; }
        .feature-tab {
          border-right: 2px solid var(--border); padding: 28px 32px 28px 0;
          cursor: pointer; transition: all 0.35s;
        }
        .feature-tab.active { border-right-color: var(--orange); }
        .feature-tab-title { font-size: 20px; font-weight: 800; color: var(--muted); display: flex; align-items: center; gap: 12px; transition: color 0.3s; }
        .feature-tab.active .feature-tab-title { color: var(--text); }
        .feature-tab-desc { font-size: 15px; color: var(--muted); line-height: 1.7; margin-top: 10px; max-height: 0; overflow: hidden; transition: max-height 0.5s, opacity 0.35s; opacity: 0; }
        .feature-tab.active .feature-tab-desc { max-height: 120px; opacity: 1; }

        .features-visual {
          background: var(--card); border: 1px solid var(--border); border-radius: 28px; padding: 48px;
          text-align: center; position: relative; overflow: hidden;
          min-height: 320px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 20px;
          transition: border-color 0.4s, background 0.5s, box-shadow 0.4s;
          box-shadow: var(--shadow-sm);
        }
        body.light-theme .features-visual {
          background: var(--card);
          box-shadow: var(--shadow-md);
          border-color: var(--border2);
        }
        .features-visual:hover { border-color: rgba(255,107,53,0.3); box-shadow: var(--shadow-md); }
        .features-visual::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 70% at 50% 0%, rgba(255,107,53,0.09), transparent);
          pointer-events: none;
        }
        body.light-theme .features-visual::before {
          background: radial-gradient(ellipse 70% 70% at 50% 0%, rgba(224,85,21,0.06), transparent);
        }
        .feature-emoji { font-size: 72px; animation: featurePop 0.45s cubic-bezier(0.34,1.56,0.64,1); display: block; }
        @keyframes featurePop { from{transform:scale(0.6) rotate(-10deg);opacity:0} to{transform:scale(1) rotate(0deg);opacity:1} }
        .feature-visual-title { font-size: 24px; font-weight: 800; transition: color 0.4s; }
        .feature-visual-desc { font-size: 15px; color: var(--muted); max-width: 260px; line-height: 1.6; }
        .feature-visual-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--orange); box-shadow: 0 0 20px var(--orange); position: absolute; top: 24px; left: 24px; animation: pulse 2s infinite; }

        section { position: relative; z-index: 1; }
        .section-label { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--orange); margin-bottom: 16px; }
        .section-label::before { content: ''; display: block; width: 24px; height: 2px; background: var(--orange); }
        .section-title { font-size: clamp(30px, 4vw, 50px); font-weight: 900; line-height: 1.1; letter-spacing: -1.5px; color: var(--text); margin-bottom: 16px; }
        .section-sub { font-size: 17px; color: var(--muted); max-width: 520px; line-height: 1.7; }

        /* ══════════════════════════════════════════
           STEPS
        ══════════════════════════════════════════ */
        .steps-section {
          padding: 110px 5%;
          background: linear-gradient(180deg, var(--bg2), var(--bg3));
          transition: background 0.6s;
        }
        .steps-inner { max-width: 1100px; margin: 0 auto; }
        .steps-header { text-align: center; margin-bottom: 64px; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .step-card {
          background: var(--card); border: 1px solid var(--border); border-radius: 22px; padding: 36px 28px;
          text-align: center;
          transition: transform 0.4s, border-color 0.3s, box-shadow 0.4s, background 0.5s;
          box-shadow: var(--shadow-sm);
        }
        body.light-theme .step-card {
          background: var(--card);
          box-shadow: var(--shadow-md);
          border-color: var(--border2);
        }
        .step-card:hover { transform: translateY(-8px); border-color: rgba(255,107,53,0.35); box-shadow: var(--shadow-lg); }
        .step-num {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, var(--orange), var(--orange2));
          color: white; font-size: 22px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; box-shadow: var(--shadow-orange);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .step-card:hover .step-num { transform: scale(1.1); }
        .step-icon { font-size: 32px; margin-bottom: 12px; }
        .step-title { font-size: 20px; font-weight: 800; margin-bottom: 10px; color: var(--text); }
        .step-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

        /* ══════════════════════════════════════════
           WHO
        ══════════════════════════════════════════ */
        .who-section { padding: 110px 5%; }
        .who-inner { max-width: 1100px; margin: 0 auto; }
        .who-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 56px; }
        .who-card {
          background: var(--card); border: 1px solid var(--border); border-radius: 28px; padding: 44px;
          transition: transform 0.4s, border-color 0.3s, box-shadow 0.4s, background 0.5s;
          position: relative; overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        body.light-theme .who-card { box-shadow: var(--shadow-md); border-color: var(--border2); }
        .who-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); }
        .who-card.user-card { border-color: rgba(78,205,196,0.2); }
        .who-card.user-card:hover { border-color: rgba(78,205,196,0.5); }
        body.light-theme .who-card.user-card { border-color: rgba(26,158,150,0.25); }
        .who-card.mech-card { border-color: rgba(255,107,53,0.2); }
        .who-card.mech-card:hover { border-color: rgba(255,107,53,0.5); }
        body.light-theme .who-card.mech-card { border-color: rgba(224,85,21,0.25); }
        .who-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .user-card::before { background: linear-gradient(90deg, var(--teal), transparent); }
        .mech-card::before { background: linear-gradient(90deg, var(--orange), transparent); }
        .who-icon { font-size: 52px; margin-bottom: 20px; }
        .who-title { font-size: 26px; font-weight: 900; margin-bottom: 12px; color: var(--text); }
        .who-sub { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 28px; }
        .who-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .who-list li { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; color: var(--text); }
        .who-list li::before { content: '✓'; color: var(--teal); font-weight: 900; }
        .mech-card .who-list li::before { color: var(--orange); }
        .who-btn { display: inline-block; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 700; text-decoration: none; font-family: 'Tajawal', sans-serif; transition: all 0.3s; }
        .user-card .who-btn { background: rgba(78,205,196,0.1); color: var(--teal); border: 1.5px solid rgba(78,205,196,0.35); }
        .user-card .who-btn:hover { background: var(--teal); color: white; transform: translateY(-2px); }
        body.light-theme .user-card .who-btn { background: rgba(26,158,150,0.08); }
        .mech-card .who-btn { background: rgba(255,107,53,0.1); color: var(--orange); border: 1.5px solid rgba(255,107,53,0.35); }
        .mech-card .who-btn:hover { background: var(--orange); color: white; transform: translateY(-2px); }

        /* ══════════════════════════════════════════
           CTA
        ══════════════════════════════════════════ */
        .cta-section {
          padding: 110px 5%;
          background: linear-gradient(180deg, var(--bg3), var(--bg));
          transition: background 0.6s;
        }
        .cta-inner {
          max-width: 820px; margin: 0 auto; text-align: center;
          background: var(--card); border: 1px solid var(--border);
          border-radius: 36px; padding: 80px 60px; position: relative; overflow: hidden;
          transition: border-color 0.4s, background 0.5s, box-shadow 0.4s;
          box-shadow: var(--shadow-md);
        }
        body.light-theme .cta-inner {
          box-shadow: var(--shadow-lg);
          border-color: var(--border2);
        }
        .cta-inner:hover { border-color: rgba(255,107,53,0.25); }
        .cta-inner::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 90% 70% at 50% -10%, rgba(255,107,53,0.1), transparent);
          pointer-events: none;
        }
        body.light-theme .cta-inner::before {
          background: radial-gradient(ellipse 90% 70% at 50% -10%, rgba(224,85,21,0.07), transparent);
        }
        .cta-title { font-size: clamp(32px, 4.5vw, 54px); font-weight: 900; letter-spacing: -1.5px; margin-bottom: 16px; position: relative; color: var(--text); }
        .cta-sub { font-size: 17px; color: var(--muted); margin-bottom: 40px; line-height: 1.7; position: relative; }
        .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }
        .cta-note { font-size: 13px; color: var(--muted2); margin-top: 20px; position: relative; }

        /* ══════════════════════════════════════════
           FOOTER
        ══════════════════════════════════════════ */
        footer {
          padding: 48px 5%; border-top: 1px solid var(--border);
          background: var(--bg);
          transition: background 0.6s, border-color 0.6s;
        }
        body.light-theme footer { border-top-color: var(--border2); }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px; }
        .footer-copy { font-size: 14px; color: var(--muted); }
        .footer-links { display: flex; gap: 28px; }
        .footer-links a { font-size: 14px; color: var(--muted); text-decoration: none; transition: color 0.25s; }
        .footer-links a:hover { color: var(--text); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }

        .hamburger { display: none; background: none; border: none; color: var(--text); font-size: 24px; cursor: pointer; }

        @media (max-width: 1000px) {
          .hero { grid-template-columns: 1fr; padding: 120px 5% 80px; text-align: center; }
          .hero-text-col { align-items: center; }
          .hero-sub { text-align: center; }
          .hero-scroll-hint { align-items: center; }
          .hero-scene-col { margin-top: 20px; }
          .scene-badge-live { left: 0; top: -5%; }
          .scene-badge-rating { right: 0; }
        }
        @media (max-width: 900px) {
          .nav-links, .nav-cta { display: none; }
          .hamburger { display: block; }
          .features-inner { grid-template-columns: 1fr; gap: 40px; }
          .steps-grid { grid-template-columns: 1fr; gap: 16px; }
          .who-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .cta-inner { padding: 48px 28px; }
        }
        @media (max-width: 480px) {
          .hero-actions { flex-direction: column; }
          .btn-xl, .btn-xl-outline { width: 100%; text-align: center; }
        }
      `}</style>

      {/* Theme flash overlay */}
      <div className={`theme-flash ${isToggling ? 'active' : ''}`} />

      {/* NAV */}
      <nav className={scrollY > 40 ? "scrolled" : ""} style={{ background: scrollY > 40 ? undefined : 'transparent' }}>
        <Link href="/" className="nav-logo">
          <div className="logo-icon">🔧</div>
          <span className="logo-text">يلا <span>ميكانيكي</span></span>
        </Link>
        <ul className="nav-links">
          <li><a href="#features">المميزات</a></li>
          <li><a href="#how">كيف يعمل</a></li>
          <li><a href="#for-who">لمن المنصة</a></li>
        </ul>
        <div className="nav-cta">
          <button
            className="theme-toggle"
            onClick={handleToggle}
            title={darkMode ? "الوضع الفاتح" : "الوضع الداكن"}
            aria-label="تبديل الثيم"
          >
            <div className="toggle-track" />
            <div className="toggle-deco">
              <span className="deco-icon deco-moon">🌙</span>
              <span className="deco-icon deco-sun">☀️</span>
            </div>
            <div className="toggle-thumb">
              {darkMode ? "🌙" : "☀️"}
            </div>
          </button>
          <Link href="/auth" className="btn-ghost">تسجيل الدخول</Link>
          <Link href="/auth" className="btn-primary">انضم الآن</Link>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />

        <div className="hero-text-col">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            المنصة الأولى للميكانيكيين في المنطقة
          </div>
          <h1 className="hero-title">
            <span className="line1">سيارتك تعطّلت؟</span>
            <span className="line2">يلا ميكانيكي</span>
            <span className="line3">بأقرب وقت</span>
          </h1>
          <p className="hero-sub">
            ابحث عن أفضل الميكانيكيين المعتمدين في منطقتك، قارن التقييمات، وتواصل معهم مباشرة. سريع، موثوق، وشفاف.
          </p>
          <div className="hero-actions">
            <Link href="/auth" className="btn-xl">ابدأ الآن مجاناً ←</Link>
            <a href="#how" className="btn-xl-outline">كيف يعمل التطبيق</a>
          </div>
          <div className="hero-scroll-hint">
            <div className="scroll-line" />
            <span>اسحب للأسفل</span>
          </div>
        </div>

        {/* 3D SCENE */}
        <div className="hero-scene-col">
          <div className="scene-glow sg1" />
          <div className="scene-glow sg2" />

          <div className="scene-badge-live">
            <div className="badge-dot-live" />
            <div>
              <div className="badge-label">ميكانيكيون متاحون الآن</div>
              <div className="badge-val">١٢ ميكانيكي قريب منك</div>
            </div>
          </div>

          <div className="scene-badge-rating">
            <span style={{ fontSize: 22 }}>⭐</span>
            <div>
              <div className="badge-stars">★★★★★</div>
              <div className="badge-val">4.9 / 5.0</div>
            </div>
          </div>

          <div className="scene-3d-wrapper">
            <div className="scene-3d" style={{ transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)` }}>
              <svg className="scene-svg-container" viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="floorG" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={darkMode ? "#1C1A2A" : "#C8C4BC"} />
                    <stop offset="100%" stopColor={darkMode ? "#0A0810" : "#B0ACA4"} />
                  </linearGradient>
                  <linearGradient id="bodyPaint" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={darkMode ? "#1C2E52" : "#2A4480"} />
                    <stop offset="30%" stopColor={darkMode ? "#152240" : "#1E3468"} />
                    <stop offset="65%" stopColor={darkMode ? "#0E1830" : "#162858"} />
                    <stop offset="100%" stopColor={darkMode ? "#080E1C" : "#0E1E42"} />
                  </linearGradient>
                  <linearGradient id="bodyTop" x1="0%" y1="0%" x2="10%" y2="100%">
                    <stop offset="0%" stopColor={darkMode ? "#3A5088" : "#4E6AAE"} />
                    <stop offset="50%" stopColor={darkMode ? "#1E2E54" : "#2C4080"} />
                    <stop offset="100%" stopColor={darkMode ? "#101828" : "#182A50"} />
                  </linearGradient>
                  <linearGradient id="hoodPaint" x1="0%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor={darkMode ? "#2C4472" : "#3C589A"} />
                    <stop offset="100%" stopColor={darkMode ? "#0E1C38" : "#162044"} />
                  </linearGradient>
                  <linearGradient id="roofPaint" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={darkMode ? "#4A6898" : "#5A7CB8"} />
                    <stop offset="100%" stopColor={darkMode ? "#1A2840" : "#223458"} />
                  </linearGradient>
                  <linearGradient id="shineH" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
                    <stop offset="40%" stopColor="rgba(255,255,255,0.06)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </linearGradient>
                  <linearGradient id="glassG" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(120,220,220,0.42)" />
                    <stop offset="55%" stopColor="rgba(60,140,210,0.30)" />
                    <stop offset="100%" stopColor="rgba(20,60,130,0.58)" />
                  </linearGradient>
                  <linearGradient id="glassSh" x1="0%" y1="0%" x2="55%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                  <radialGradient id="tyreG" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1C1C28" />
                    <stop offset="72%" stopColor="#0A0A14" />
                    <stop offset="100%" stopColor="#040408" />
                  </radialGradient>
                  <radialGradient id="rimG" cx="40%" cy="36%" r="60%">
                    <stop offset="0%" stopColor="#D8E8F0" />
                    <stop offset="35%" stopColor="#8AB0C0" />
                    <stop offset="75%" stopColor="#485C68" />
                    <stop offset="100%" stopColor="#182028" />
                  </radialGradient>
                  <radialGradient id="headG" cx="44%" cy="38%" r="56%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="25%" stopColor="#FFFACC" />
                    <stop offset="65%" stopColor="#FFD060" />
                    <stop offset="100%" stopColor="#FF8000" stopOpacity="0.2" />
                  </radialGradient>
                  <radialGradient id="tailG" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FF7070" />
                    <stop offset="60%" stopColor="#CC1A1A" />
                    <stop offset="100%" stopColor="#880000" stopOpacity="0.3" />
                  </radialGradient>
                  <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C0D0DA" />
                    <stop offset="40%" stopColor="#EEF4F8" />
                    <stop offset="70%" stopColor="#9AB0BC" />
                    <stop offset="100%" stopColor="#506070" />
                  </linearGradient>
                  <linearGradient id="skinG" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#D4956A" />
                    <stop offset="100%" stopColor="#A86840" />
                  </linearGradient>
                  <linearGradient id="skinDark" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#B87848" />
                    <stop offset="100%" stopColor="#8A5428" />
                  </linearGradient>
                  <linearGradient id="uniformG" x1="0%" y1="0%" x2="20%" y2="100%">
                    <stop offset="0%" stopColor="#1E3050" />
                    <stop offset="100%" stopColor="#0E1C34" />
                  </linearGradient>
                  <linearGradient id="uniformLight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#283C58" />
                    <stop offset="100%" stopColor="#1A2844" />
                  </linearGradient>
                  <linearGradient id="wrenchG" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#B0C8D8" />
                    <stop offset="40%" stopColor="#D8EEF8" />
                    <stop offset="100%" stopColor="#6888A0" />
                  </linearGradient>
                  <linearGradient id="toolboxG" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E03C00" />
                    <stop offset="100%" stopColor="#8C2000" />
                  </linearGradient>
                  <linearGradient id="engineBlock" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2A2A3C" />
                    <stop offset="100%" stopColor="#141420" />
                  </linearGradient>
                  <radialGradient id="engineGlowR" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FF6020" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FF2000" stopOpacity="0" />
                  </radialGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="bigGlow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="12" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="sparkF" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="2" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="9"/>
                  </filter>
                  <filter id="bodyShad">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(0,0,0,0.6)" floodOpacity="1"/>
                  </filter>
                  <filter id="headBeam" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="7"/>
                  </filter>
                  <pattern id="floorPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <rect width="40" height="40" fill="url(#floorG)"/>
                    <rect width="39" height="39" fill="none" stroke={darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} strokeWidth="0.5"/>
                  </pattern>
                </defs>

                {/* FLOOR */}
                <rect x="0" y="355" width="680" height="65" fill="url(#floorPattern)"/>
                <line x1="0" y1="355" x2="680" y2="355" stroke={darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"} strokeWidth="1"/>
                <ellipse cx="310" cy="358" rx="220" ry="12" fill={darkMode ? "rgba(255,100,40,0.08)" : "rgba(255,100,40,0.05)"} filter="url(#bigGlow)"/>

                <g className="shadow-pulse">
                  <ellipse cx="285" cy="358" rx="190" ry="12" fill={darkMode ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.22)"} filter="url(#shadow)"/>
                </g>
                <ellipse cx="240" cy="360" rx="22" ry="5" fill={darkMode ? "rgba(30,20,60,0.7)" : "rgba(20,15,40,0.3)"}/>
                <ellipse cx="240" cy="360" rx="18" ry="3.5" fill={darkMode ? "rgba(80,60,140,0.4)" : "rgba(60,40,110,0.2)"}/>

                {/* CAR */}
                <g className="car-bob">
                  <ellipse cx="285" cy="356" rx="175" ry="9" fill="rgba(0,0,0,0.38)"/>
                  <rect x="98" y="318" width="360" height="15" rx="5" fill={darkMode ? "#070712" : "#0B0C18"}/>
                  <rect x="100" y="316" width="356" height="3" rx="1.5" fill="url(#chrome)" opacity="0.35"/>
                  <path d="M 100 318 Q 96 330 100 334 L 456 334 Q 462 330 458 318 Z" fill={darkMode ? "#06060E" : "#0A0A16"}/>
                  <path d="M 56 260 Q 50 280 54 318 L 100 318 L 100 260 Z" fill={darkMode ? "#0C0C1C" : "#10101E"}/>
                  <rect x="57" y="300" width="40" height="8" rx="4" fill="url(#chrome)" opacity="0.5"/>
                  {[62,70,78,86].map((x,i) => <rect key={i} x={x} y="308" width="5" height="10" rx="2" fill={darkMode ? "#04040A" : "#080812"}/>)}
                  <path d="M 57 256 Q 54 260 57 268 L 98 268 L 98 256 Z" fill={darkMode ? "#180808" : "#1C0808"}/>
                  <path d="M 59 257 Q 56 261 59 267 L 88 267 L 88 257 Z" fill="url(#tailG)" filter="url(#glow)"/>
                  <rect x="88" y="257" width="8" height="10" rx="2" fill={darkMode ? "#cccccc" : "#e0e0e0"} opacity="0.5"/>
                  <circle cx="70" cy="280" r="6" fill={darkMode ? "#120808" : "#180A0A"}/>
                  <circle cx="70" cy="280" r="4" fill="url(#tailG)" opacity="0.4"/>
                  <ellipse cx="76" cy="316" rx="8" ry="4" fill={darkMode ? "#050510" : "#080812"}/>
                  <ellipse cx="76" cy="316" rx="6" ry="3" fill={darkMode ? "#0A0A16" : "#0E0E1C"}/>
                  <circle className="smoke-1" cx="64" cy="310" r="8" fill={darkMode ? "rgba(100,90,130,0.22)" : "rgba(80,75,100,0.15)"}/>
                  <circle className="smoke-2" cx="58" cy="305" r="6" fill={darkMode ? "rgba(80,75,110,0.18)" : "rgba(65,60,85,0.12)"}/>
                  <circle className="smoke-3" cx="68" cy="300" r="5" fill={darkMode ? "rgba(90,80,120,0.14)" : "rgba(70,65,90,0.1)"}/>
                  <path d="M 100 262 L 100 318 L 458 318 L 458 262 Q 472 258 476 252 L 476 310 Q 492 302 498 288 L 498 264 Q 476 250 458 248 L 360 243 L 100 243 Z" fill="url(#bodyPaint)" filter="url(#bodyShad)"/>
                  <path d="M 103 243 L 355 243 L 355 252 Q 228 250 103 247 Z" fill="rgba(255,255,255,0.09)"/>
                  <line x1="158" y1="247" x2="155" y2="318" stroke="rgba(0,0,0,0.4)" strokeWidth="1.8"/>
                  <line x1="160" y1="247" x2="157" y2="318" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
                  <line x1="276" y1="245" x2="276" y2="318" stroke="rgba(0,0,0,0.4)" strokeWidth="1.8"/>
                  <line x1="278" y1="245" x2="278" y2="318" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
                  <path d="M 162 258 Q 165 255 270 254 L 270 306 Q 165 306 162 303 Z" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                  <path d="M 280 255 Q 282 252 392 250 L 392 304 Q 282 305 280 302 Z" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                  <rect x="228" y="277" width="24" height="6" rx="3" fill="url(#chrome)"/>
                  <rect x="230" y="278" width="20" height="2" rx="1" fill="rgba(255,255,255,0.3)"/>
                  <rect x="340" y="274" width="24" height="6" rx="3" fill="url(#chrome)"/>
                  <rect x="342" y="275" width="20" height="2" rx="1" fill="rgba(255,255,255,0.3)"/>
                  <path d="M 105 285 Q 250 275 458 278" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.8"/>
                  <path d="M 160 243 Q 163 185 192 168 L 350 163 Q 372 165 382 195 L 392 243 Z" fill="url(#roofPaint)"/>
                  <path d="M 188 172 L 295 165 L 308 176 L 195 183 Z" fill="rgba(255,255,255,0.18)"/>
                  <path d="M 360 243 L 390 243 L 440 165 L 500 168 L 500 200 L 450 235 L 420 243 Z" fill="url(#hoodPaint)"/>
                  <path d="M 362 243 L 392 243 L 442 167 L 448 170 L 398 245 Z" fill={darkMode ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.3)"}/>
                  <path d="M 360 243 L 420 243" stroke="url(#chrome)" strokeWidth="2.5"/>
                  <path d="M 370 243 L 415 200 L 430 204 L 385 244 Z" fill="url(#shineH)" opacity="0.6"/>
                  <line x1="416" y1="240" x2="440" y2="165" stroke={darkMode ? "#405060" : "#506070"} strokeWidth="2.5"/>
                  <circle cx="416" cy="240" r="3.5" fill="url(#chrome)"/>
                  <circle cx="440" cy="165" r="4" fill="url(#chrome)"/>
                  <rect x="412" y="237" width="8" height="6" rx="2" fill="url(#chrome)" opacity="0.8"/>
                  <path d="M 362 200 L 498 204 L 498 243 L 362 243 Z" fill="url(#engineBlock)"/>
                  <rect x="372" y="208" width="80" height="30" rx="5" fill={darkMode ? "#222232" : "#2A2A3E"}/>
                  <rect x="373" y="209" width="78" height="8" rx="3" fill={darkMode ? "#2A2A3E" : "#32324A"}/>
                  {[380,390,400,410,420,430,440].map((x,i) => <rect key={i} x={x} y="217" width="5" height="20" rx="1.5" fill={darkMode ? "#1A1A28" : "#222230"}/>)}
                  <ellipse className="engine-glow-anim" cx="416" cy="224" rx="45" ry="20" fill="url(#engineGlowR)" filter="url(#bigGlow)"/>
                  <rect x="460" y="210" width="28" height="22" rx="4" fill={darkMode ? "#181828" : "#1E1E30"}/>
                  {[213,218,223,228].map((y,i) => <rect key={i} x="462" y={y} width="24" height="3" rx="1.5" fill={darkMode ? "#242430" : "#2A2A3C"}/>)}
                  <path d="M 455 218 Q 465 226 478 222 Q 490 218 495 228" fill="none" stroke={darkMode ? "#2A4060" : "#364A70"} strokeWidth="3" strokeLinecap="round"/>
                  <path d="M 385 222 Q 395 232 405 228 Q 418 224 425 234" fill="none" stroke={darkMode ? "#442020" : "#4A2020"} strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="396" cy="210" r="5" fill={darkMode ? "#303040" : "#383848"}/>
                  <circle cx="396" cy="210" r="3" fill={darkMode ? "#202028" : "#282830"}/>
                  <rect x="470" y="228" width="22" height="14" rx="3" fill={darkMode ? "#1C3020" : "#243828"}/>
                  <rect x="477" y="225" width="4" height="4" rx="1" fill="#4A9A30"/>
                  <rect x="483" y="225" width="4" height="4" rx="1" fill="#CC4040"/>
                  <rect x="363" y="210" width="12" height="18" rx="3" fill={darkMode ? "#142838" : "#1C3444"} stroke="rgba(78,205,196,0.4)" strokeWidth="0.8"/>
                  <rect x="365" y="218" width="8" height="8" rx="2" fill="rgba(78,205,196,0.2)"/>
                  <path d="M 458 248 L 500 254 L 500 320 L 458 320 Z" fill={darkMode ? "#09091A" : "#0C0C18"}/>
                  <path d="M 458 316 L 503 317 L 505 326 L 458 328 Z" fill={darkMode ? "#08081A" : "#0A0A14"}/>
                  <rect x="460" y="320" width="42" height="4" rx="2" fill="url(#chrome)" opacity="0.45"/>
                  <rect x="462" y="265" width="34" height="28" rx="4" fill={darkMode ? "#060610" : "#09090F"}/>
                  {[268,272,277,282,288].map((y,i) => <line key={i} x1="463" y1={y} x2="495" y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="0.9"/>)}
                  {[466,472,478,484,490].map((x,i) => <line key={i} x1={x} y1="265" x2={x} y2="293" stroke="rgba(255,255,255,0.07)" strokeWidth="0.9"/>)}
                  <rect x="460" y="264" width="36" height="30" rx="5" fill="none" stroke="url(#chrome)" strokeWidth="1.5"/>
                  <rect x="465" y="300" width="28" height="8" rx="3" fill={darkMode ? "#050510" : "#070712"}/>
                  {[302,305,308].map((y,i) => <line key={i} x1="466" y1={y} x2="492" y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>)}
                  <path d="M 458 248 L 498 254 L 498 266 L 458 263 Z" fill={darkMode ? "#070712" : "#0A0A14"}/>
                  <rect x="460" y="249" width="36" height="4.5" rx="2.2" fill="#FFF0B0" opacity="0.9" filter="url(#glow)"/>
                  <ellipse cx="477" cy="258" rx="14" ry="8.5" fill={darkMode ? "#0A0A16" : "#0E0E1C"}/>
                  <ellipse cx="477" cy="258" rx="11" ry="7" fill="url(#headG)" filter="url(#glow)"/>
                  <ellipse cx="475" cy="256" rx="5" ry="3.5" fill="white" opacity="0.92"/>
                  <ellipse cx="477" cy="258" rx="14" ry="8.5" fill="none" stroke="rgba(200,220,240,0.35)" strokeWidth="1.2"/>
                  <rect x="461" y="255" width="10" height="7" rx="2" fill="#FFB020" opacity="0.6" filter="url(#glow)"/>
                  <path d="M 497 252 L 610 225 L 610 278 L 497 264 Z" fill="rgba(255,240,140,0.055)" filter="url(#headBeam)"/>
                  <path d="M 354 165 L 390 196 L 394 243 L 354 243 L 340 206 Z" fill="url(#glassG)" stroke="rgba(100,210,210,0.2)" strokeWidth="1"/>
                  <path d="M 357 168 L 370 186 L 360 184 Z" fill="url(#glassSh)" opacity="0.85"/>
                  <path d="M 375 167 L 389 196 L 381 194 L 368 168 Z" fill="url(#glassSh)" opacity="0.4"/>
                  <path d="M 356 243 Q 378 226 390 243" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.8"/>
                  <path d="M 282 168 L 346 164 L 342 198 L 284 204 Z" fill="url(#glassG)" stroke="rgba(100,210,210,0.14)" strokeWidth="0.8"/>
                  <path d="M 285 171 L 328 168 L 327 176 L 285 179 Z" fill="url(#glassSh)" opacity="0.5"/>
                  <path d="M 196 174 L 278 170 L 280 204 L 198 208 Z" fill="url(#glassG)" stroke="rgba(100,210,210,0.1)" strokeWidth="0.8"/>
                  <path d="M 164 192 L 192 188 L 194 244 L 162 244 L 147 214 Z" fill="url(#glassG)" stroke="rgba(100,210,210,0.1)" strokeWidth="0.8"/>
                  <path d="M 167 192 L 196 188 L 280 170 L 346 164 L 348 168 L 280 174 L 196 192 L 168 196 Z" fill="url(#chrome)" opacity="0.45"/>
                  <path d="M 388 195 L 404 192 L 406 206 L 388 208 Z" fill={darkMode ? "#162038" : "#1E2E50"}/>
                  <path d="M 389 196 L 403 194 L 404 204 L 389 206 Z" fill="url(#glassG)" opacity="0.7"/>
                  <circle cx="430" cy="220" r="10" fill={darkMode ? "#121E38" : "#1A2C50"} stroke="var(--orange)" strokeWidth="1.8"/>
                  <text x="430" y="224" textAnchor="middle" fontSize="9" fill="#FF6B35" fontWeight="900">م</text>
                  <rect x="296" y="236" width="20" height="14" rx="4" fill={darkMode ? "#18243A" : "#1E2E4A"} stroke="rgba(78,205,196,0.65)" strokeWidth="0.9"/>
                  <circle className="diag-pulse" cx="299" cy="240" r="2.5" fill="#4ECDC4"/>
                  <rect x="302" y="239" width="10" height="2.5" rx="1" fill="rgba(78,205,196,0.4)"/>
                  <circle cx="306" cy="246" r="2" fill="rgba(255,100,50,0.85)"/>
                  <path d="M 316 243 Q 330 258 345 254 Q 358 250 365 260" fill="none" stroke="rgba(78,205,196,0.55)" strokeWidth="2" strokeDasharray="4,3"/>
                  <circle cx="110" cy="270" r="9" fill={darkMode ? "#141828" : "#1A1E30"} stroke="url(#chrome)" strokeWidth="1.2"/>
                  <circle cx="110" cy="270" r="5.5" fill={darkMode ? "#0A0C18" : "#101420"}/>
                </g>

                {/* WHEELS */}
                <g className="wheel-spin-f">
                  <circle cx="430" cy="324" r="40" fill="url(#tyreG)"/>
                  <circle cx="430" cy="324" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" strokeDasharray="8,6"/>
                  <circle cx="430" cy="324" r="36" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2"/>
                  <circle cx="430" cy="324" r="29" fill="url(#rimG)"/>
                  <circle cx="430" cy="324" r="26.5" fill={darkMode ? "#1A2830" : "#223040"}/>
                  {[0,72,144,216,288].map((deg, i) => {
                    const r = (deg - 90) * Math.PI / 180;
                    const cos = Math.cos(r), sin = Math.sin(r);
                    const ix = 430 + cos * 9, iy = 324 + sin * 9;
                    const lx = 430 + Math.cos(r + 0.3) * 24, ly = 324 + Math.sin(r + 0.3) * 24;
                    const rx2 = 430 + Math.cos(r - 0.3) * 24, ry2 = 324 + Math.sin(r - 0.3) * 24;
                    return (
                      <g key={i}>
                        <path d={`M${ix+1} ${iy+1} L${lx+1} ${ly+1} L${rx2+1} ${ry2+1} Z`} fill="rgba(0,0,0,0.5)"/>
                        <path d={`M${ix} ${iy} L${lx} ${ly} L${rx2} ${ry2} Z`} fill="#B8CCD8"/>
                        <line x1={ix} y1={iy} x2={430 + cos*25} y2={324 + sin*25} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                      </g>
                    );
                  })}
                  <circle cx="430" cy="324" r="26.5" fill="none" stroke="rgba(180,210,225,0.55)" strokeWidth="1.8"/>
                  <circle cx="430" cy="324" r="9" fill={darkMode ? "#1A2430" : "#202E3A"}/>
                  <circle cx="430" cy="324" r="8" fill="url(#rimG)"/>
                  <circle cx="430" cy="324" r="5" fill="#FF6B35" opacity="0.95"/>
                  <circle cx="428" cy="322" r="1.8" fill="rgba(255,255,255,0.65)"/>
                  <path d="M 418 310 Q 410 324 418 338" fill="none" stroke="#CC3020" strokeWidth="5" strokeLinecap="round" opacity="0.65"/>
                </g>
                <g className="wheel-spin-r">
                  <circle cx="155" cy="324" r="40" fill="url(#tyreG)"/>
                  <circle cx="155" cy="324" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" strokeDasharray="8,6"/>
                  <circle cx="155" cy="324" r="36" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2"/>
                  <circle cx="155" cy="324" r="29" fill="url(#rimG)"/>
                  <circle cx="155" cy="324" r="26.5" fill={darkMode ? "#1A2830" : "#223040"}/>
                  {[0,72,144,216,288].map((deg, i) => {
                    const r = (deg - 90) * Math.PI / 180;
                    const cos = Math.cos(r), sin = Math.sin(r);
                    const ix = 155 + cos * 9, iy = 324 + sin * 9;
                    const lx = 155 + Math.cos(r + 0.3) * 24, ly = 324 + Math.sin(r + 0.3) * 24;
                    const rx2 = 155 + Math.cos(r - 0.3) * 24, ry2 = 324 + Math.sin(r - 0.3) * 24;
                    return (
                      <g key={i}>
                        <path d={`M${ix+1} ${iy+1} L${lx+1} ${ly+1} L${rx2+1} ${ry2+1} Z`} fill="rgba(0,0,0,0.5)"/>
                        <path d={`M${ix} ${iy} L${lx} ${ly} L${rx2} ${ry2} Z`} fill="#B8CCD8"/>
                        <line x1={ix} y1={iy} x2={155 + Math.cos(r)*25} y2={324 + Math.sin(r)*25} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                      </g>
                    );
                  })}
                  <circle cx="155" cy="324" r="26.5" fill="none" stroke="rgba(180,210,225,0.55)" strokeWidth="1.8"/>
                  <circle cx="155" cy="324" r="9" fill={darkMode ? "#1A2430" : "#202E3A"}/>
                  <circle cx="155" cy="324" r="8" fill="url(#rimG)"/>
                  <circle cx="155" cy="324" r="5" fill="#FF6B35" opacity="0.95"/>
                  <circle cx="153" cy="322" r="1.8" fill="rgba(255,255,255,0.65)"/>
                  <path d="M 143 310 Q 135 324 143 338" fill="none" stroke="#CC3020" strokeWidth="5" strokeLinecap="round" opacity="0.65"/>
                </g>

                {/* MECHANIC */}
                <g>
                  <ellipse cx="576" cy="358" rx="36" ry="9" fill="rgba(0,0,0,0.4)"/>
                  <path d="M 554 335 Q 550 350 546 358 Q 543 364 555 365 L 568 365 L 570 335 Z" fill={darkMode ? "#121218" : "#161620"}/>
                  <rect x="544" y="360" width="26" height="5" rx="2" fill={darkMode ? "#0A0A0E" : "#0E0E12"}/>
                  <path d="M 578 335 Q 582 350 586 358 Q 590 364 578 365 L 565 365 L 565 335 Z" fill={darkMode ? "#0E0E14" : "#121218"}/>
                  <rect x="562" y="360" width="30" height="5" rx="2" fill={darkMode ? "#080810" : "#0A0A0E"}/>
                  <path d="M 556 270 Q 551 295 552 335 L 570 335 L 572 275 Z" fill="url(#uniformG)"/>
                  <path d="M 576 272 L 584 335 L 600 335 L 596 275 Z" fill="url(#uniformLight)"/>
                  <path d="M 548 215 Q 546 262 550 270 L 598 270 Q 606 262 602 215 Z" fill="url(#uniformG)"/>
                  <path d="M 555 218 L 555 265 L 595 265 L 595 218 Z" fill="rgba(255,255,255,0.035)"/>
                  <rect x="547" y="262" width="54" height="9" rx="4" fill={darkMode ? "#0A1018" : "#0E141E"}/>
                  <rect x="568" y="263" width="12" height="7" rx="2" fill="url(#chrome)" opacity="0.75"/>
                  <rect x="556" y="232" width="18" height="15" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                  <rect x="567" y="232" width="2.5" height="8" rx="1.2" fill="#4ECDC4" opacity="0.7"/>
                  <circle cx="588" cy="232" r="9" fill="rgba(255,107,53,0.2)" stroke="var(--orange)" strokeWidth="1.5"/>
                  <text x="588" y="236" textAnchor="middle" fontSize="8" fill="#FF6B35" fontWeight="900">م</text>
                  <path d="M 550 242 L 600 242" stroke="rgba(255,220,0,0.35)" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M 550 252 L 600 252" stroke="rgba(255,220,0,0.28)" strokeWidth="3.5" strokeLinecap="round"/>
                  <path d="M 550 222 Q 538 244 534 258 L 542 264 Q 548 250 554 228 Z" fill={darkMode ? "#162030" : "#1E2C42"}/>
                  <ellipse cx="537" cy="261" rx="7" ry="5" fill={darkMode ? "#142030" : "#1C2C40"}/>
                  <path d="M 534 258 Q 524 268 516 272 L 520 280 Q 530 275 542 264 Z" fill={darkMode ? "#162030" : "#1E2C42"}/>
                  <circle cx="516" cy="275" r="9" fill="url(#skinG)"/>
                  <g className="arm-anim">
                    <path d="M 598 224 Q 614 242 620 256 L 612 262 Q 604 248 596 230 Z" fill={darkMode ? "#1A2840" : "#222E4A"}/>
                    <ellipse cx="616" cy="258" rx="7" ry="5" fill={darkMode ? "#162030" : "#1C2C40"}/>
                    <path d="M 616 256 Q 624 265 628 275 L 620 282 Q 614 270 608 260 Z" fill={darkMode ? "#162030" : "#1E2C42"}/>
                    <circle cx="624" cy="277" r="9.5" fill="url(#skinG)"/>
                    <g className="wrench-anim">
                      <rect x="618" y="268" width="10" height="38" rx="5" fill={darkMode ? "#1A1A28" : "#222230"} transform="rotate(-22 623 287)"/>
                      {[272,278,284,290,296,302].map((y,i) => (
                        <rect key={i} x="618" y={y} width="10" height="3" rx="1.5" fill="rgba(255,255,255,0.08)" transform="rotate(-22 623 287)"/>
                      ))}
                      <rect x="619" y="266" width="8" height="14" rx="3" fill="url(#wrenchG)" transform="rotate(-22 623 287)"/>
                      <path d="M 616 264 Q 608 256 610 248 Q 612 240 620 242 L 621 258 Z" fill="url(#wrenchG)" transform="rotate(-22 623 287)"/>
                      <path d="M 621 258 L 628 256 Q 634 248 632 240 Q 630 232 620 242 Z" fill="url(#wrenchG)" transform="rotate(-22 623 287)"/>
                      <rect x="614" y="240" width="12" height="10" rx="2" fill={darkMode ? "#12182A" : "#18202E"} transform="rotate(-22 623 287)"/>
                    </g>
                  </g>
                  <rect x="567" y="218" width="14" height="10" rx="4" fill="url(#skinG)"/>
                  <ellipse cx="574" cy="200" rx="24" ry="22" fill="url(#skinG)"/>
                  <ellipse cx="595" cy="200" rx="10" ry="16" fill="rgba(0,0,0,0.18)"/>
                  <ellipse cx="550" cy="202" rx="5" ry="7" fill="url(#skinDark)"/>
                  <ellipse cx="598" cy="202" rx="5" ry="7" fill="url(#skinDark)"/>
                  <path d="M 551 196 Q 554 178 574 176 Q 594 178 597 196 Q 586 184 574 184 Q 562 184 551 196 Z" fill="#1A0E04"/>
                  <path d="M 558 191 Q 563 188 569 190" fill="none" stroke="#1A0E04" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M 579 189 Q 584 186 589 188" fill="none" stroke="#1A0E04" strokeWidth="2.5" strokeLinecap="round"/>
                  <ellipse cx="563" cy="200" rx="5" ry="5.5" fill="#140C04"/>
                  <ellipse cx="585" cy="200" rx="5" ry="5.5" fill="#140C04"/>
                  <ellipse cx="563" cy="201" rx="3.5" ry="4" fill="#3D2810"/>
                  <ellipse cx="585" cy="201" rx="3.5" ry="4" fill="#3D2810"/>
                  <circle cx="563" cy="201" r="2.5" fill="#080404"/>
                  <circle cx="585" cy="201" r="2.5" fill="#080404"/>
                  <circle cx="564.5" cy="199.5" r="1.5" fill="white" opacity="0.88"/>
                  <circle cx="586.5" cy="199.5" r="1.5" fill="white" opacity="0.88"/>
                  <path d="M 573 202 Q 571 210 574 213 Q 577 215 579 213 Q 582 210 580 202" fill="none" stroke="rgba(140,80,40,0.45)" strokeWidth="1.2"/>
                  <path d="M 566 218 Q 574 222 582 218" fill="none" stroke="#8A4E28" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M 549 200 Q 549 172 574 168 Q 599 172 599 200 Z" fill="#FF6B35"/>
                  <path d="M 552 200 Q 553 174 574 170 Q 595 174 596 200" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5"/>
                  <ellipse cx="564" cy="178" rx="12" ry="6" fill="rgba(255,255,255,0.25)" transform="rotate(-15 564 178)"/>
                  <rect x="547" y="197" width="54" height="7" rx="3.5" fill="#CC4A1A"/>
                  <rect x="547" y="197" width="54" height="3" rx="1.5" fill="rgba(255,255,255,0.12)"/>
                  <circle cx="601" cy="200" r="5" fill="#CC4A1A" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>
                  {[558,568,578,588].map((x,i) => (
                    <rect key={i} x={x} y="177" width="5" height="10" rx="2.5" fill="rgba(0,0,0,0.28)"/>
                  ))}
                  <circle cx="574" cy="184" r="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
                  <text x="574" y="188" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.7)" fontWeight="900">M</text>
                </g>

                {/* TOOLBOX */}
                <g>
                  <circle cx="626" cy="360" r="5" fill={darkMode ? "#161620" : "#1A1A22"}/>
                  <circle cx="650" cy="360" r="5" fill={darkMode ? "#161620" : "#1A1A22"}/>
                  <circle cx="626" cy="360" r="2.5" fill={darkMode ? "#0A0A12" : "#0E0E16"}/>
                  <circle cx="650" cy="360" r="2.5" fill={darkMode ? "#0A0A12" : "#0E0E16"}/>
                  <rect x="614" y="295" width="52" height="64" rx="6" fill="url(#toolboxG)"/>
                  <rect x="614" y="295" width="52" height="64" rx="6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
                  <rect x="611" y="286" width="58" height="18" rx="6" fill="#E04200"/>
                  <rect x="611" y="286" width="58" height="7" rx="4" fill="rgba(255,255,255,0.1)"/>
                  <rect x="611" y="286" width="58" height="18" rx="6" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>
                  <path d="M 629 286 Q 640 272 651 286" fill="none" stroke="#B03200" strokeWidth="5" strokeLinecap="round"/>
                  <line x1="615" y1="314" x2="665" y2="314" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5"/>
                  <line x1="615" y1="330" x2="665" y2="330" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5"/>
                  <line x1="615" y1="346" x2="665" y2="346" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5"/>
                  <rect x="630" y="320" width="20" height="4" rx="2" fill="rgba(255,200,60,0.6)"/>
                  <rect x="630" y="336" width="20" height="4" rx="2" fill="rgba(255,200,60,0.55)"/>
                  <rect x="630" y="350" width="20" height="4" rx="2" fill="rgba(255,200,60,0.5)"/>
                  <circle cx="640" cy="305" r="4" fill={darkMode ? "#2A1800" : "#301E00"}/>
                  <rect x="617" y="270" width="6" height="20" rx="3" fill="url(#wrenchG)" transform="rotate(10 620 280)"/>
                  <circle cx="617" cy="271" r="5" fill="url(#wrenchG)" transform="rotate(10 620 280)"/>
                  <rect x="630" y="272" width="4.5" height="18" rx="2.2" fill="#CC3030" transform="rotate(-8 632 281)"/>
                  <rect x="643" y="275" width="5" height="15" rx="2.5" fill={darkMode ? "#606070" : "#707080"} transform="rotate(5 645 282)"/>
                </g>

                {/* SPARKS */}
                <g filter="url(#sparkF)">
                  <line className="spark-a" x1="512" y1="250" x2="524" y2="238" stroke="#FFE840" strokeWidth="3" strokeLinecap="round"/>
                  <line className="spark-b" x1="517" y1="244" x2="530" y2="250" stroke="#FF9020" strokeWidth="2.5" strokeLinecap="round"/>
                  <line className="spark-c" x1="507" y1="248" x2="496" y2="237" stroke="#FFE840" strokeWidth="3" strokeLinecap="round"/>
                  <line className="spark-a" x1="520" y1="240" x2="528" y2="232" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle className="spark-a" cx="524" cy="238" r="3" fill="#FFE840"/>
                  <circle className="spark-b" cx="530" cy="250" r="2.5" fill="#FF9020"/>
                  <circle className="spark-c" cx="496" cy="237" r="3" fill="#FFE840"/>
                  <circle className="spark-a" cx="528" cy="232" r="2" fill="#FFFFFF"/>
                  <circle className="spark-b" cx="515" cy="233" r="1.8" fill="#FFF0A0"/>
                  <circle className="spark-c" cx="505" cy="255" r="1.8" fill="#FFD040"/>
                  <line className="spark-c" x1="502" y1="258" x2="508" y2="248" stroke="#FFC030" strokeWidth="1.5" strokeLinecap="round"/>
                </g>

                <g className="oil-drip">
                  <ellipse cx="405" cy="240" rx="2" ry="4" fill={darkMode ? "rgba(80,50,20,0.8)" : "rgba(60,35,10,0.7)"}/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-grid">
          {[
            { num: counters.mechanics, suffix: "+", label: "ميكانيكي معتمد" },
            { num: counters.users.toLocaleString("ar-SA"), suffix: "+", label: "مستخدم نشط" },
            { num: counters.cities, suffix: "", label: "مدينة مغطاة" },
            { num: counters.reviews.toLocaleString("ar-SA"), suffix: "+", label: "تقييم حقيقي" },
          ].map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-num">{s.num}<span className="stat-suffix">{s.suffix}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="features-inner">
          <div className="features-text">
            <div className="section-label">المميزات</div>
            <h2 className="section-title">لماذا يلا ميكانيكي؟</h2>
            <p className="section-sub" style={{ marginBottom: 40 }}>
              منصة مصممة بعناية لتوصيل أصحاب السيارات بالمختصين الموثوقين، بدون عناء ومن غير مفاجآت.
            </p>
            {features.map((f, i) => (
              <div key={i} className={`feature-tab ${activeFeature === i ? "active" : ""}`} onClick={() => setActiveFeature(i)}>
                <div className="feature-tab-title"><span>{f.icon}</span> {f.title}</div>
                <div className="feature-tab-desc">{f.desc}</div>
              </div>
            ))}
          </div>
          <div className="features-visual">
            <div className="feature-visual-dot" />
            <div key={activeFeature} className="feature-emoji">{features[activeFeature].icon}</div>
            <div className="feature-visual-title" style={{ color: features[activeFeature].color }}>{features[activeFeature].title}</div>
            <div className="feature-visual-desc">{features[activeFeature].desc}</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="steps-section" id="how">
        <div className="steps-inner">
          <div className="steps-header">
            <div className="section-label" style={{ justifyContent: "center" }}>كيف يعمل</div>
            <h2 className="section-title">ثلاث خطوات فقط</h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>من التسجيل إلى إيجاد ميكانيكي في دقائق معدودة</p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-num">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="who-section" id="for-who">
        <div className="who-inner">
          <div className="section-label">لمن المنصة</div>
          <h2 className="section-title">منصة للجميع</h2>
          <div className="who-grid">
            <div className="who-card user-card">
              <div className="who-icon">🚗</div>
              <div className="who-title">أنت صاحب سيارة</div>
              <div className="who-sub">لا تضيع وقتك في البحث عشوائياً. الحل بين يديك.</div>
              <ul className="who-list">
                <li>ابحث عن الميكانيكيين القريبين منك</li>
                <li>اقرأ تقييمات حقيقية قبل الاختيار</li>
                <li>قيّم تجربتك وساعد الآخرين</li>
                <li>أدر ملفك الشخصي بسهولة</li>
              </ul>
              <Link href="/auth" className="who-btn">ابدأ كمستخدم →</Link>
            </div>
            <div className="who-card mech-card">
              <div className="who-icon">🔧</div>
              <div className="who-title">أنت ميكانيكي محترف</div>
              <div className="who-sub">وسّع قاعدة عملائك وابنِ سمعتك الرقمية.</div>
              <ul className="who-list">
                <li>سجّل موقع ورشتك ليجدك العملاء</li>
                <li>تابع طلبات الموقع ومتطلباتها</li>
                <li>استقبل التقييمات وبنِ ثقة العملاء</li>
                <li>لوحة تحكم خاصة بك كميكانيكي</li>
              </ul>
              <Link href="/auth" className="who-btn">انضم كميكانيكي →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">جاهز تبدأ؟<br /><span style={{ color: "var(--orange)" }}>يلا ميكانيكي</span></h2>
          <p className="cta-sub">انضم إلى آلاف المستخدمين والميكانيكيين على المنصة.<br />التسجيل مجاني ويستغرق أقل من دقيقة.</p>
          <div className="cta-btns">
            <Link href="/auth" className="btn-xl">إنشاء حساب مجاني</Link>
            <Link href="/auth" className="btn-xl-outline">تسجيل الدخول</Link>
          </div>
          <p className="cta-note">لا يلزم بطاقة ائتمانية · مجاني تماماً للمستخدمين</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div className="logo-icon" style={{ width: 32, height: 32, borderRadius: 8, fontSize: 16 }}>🔧</div>
              <span className="logo-text" style={{ fontSize: 18 }}>يلا <span>ميكانيكي</span></span>
            </div>
            <p className="footer-copy">المنصة الأولى للميكانيكيين المعتمدين</p>
          </div>
          <div className="footer-links">
            <a href="#">سياسة الخصوصية</a>
            <a href="#">شروط الاستخدام</a>
            <a href="#">تواصل معنا</a>
          </div>
          <p className="footer-copy">© 2025 يلا ميكانيكي. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </>
  );
}