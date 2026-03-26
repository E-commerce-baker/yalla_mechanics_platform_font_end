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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const features = [
    {
      icon: "🔧",
      title: "ميكانيكيون معتمدون",
      desc: "كل ميكانيكي على المنصة مُراجَع ومعتمد من فريقنا. لا تخاطر بسيارتك مع غرباء.",
      color: "#FF6B35",
    },
    {
      icon: "📍",
      title: "ابحث بالموقع",
      desc: "اعثر على أقرب ميكانيكي لمكانك الآن. GPS دقيق، مواقع محدثة لحظياً.",
      color: "#4ECDC4",
    },
    {
      icon: "⭐",
      title: "تقييمات حقيقية",
      desc: "آراء مستخدمين حقيقيين، لا تقييمات مزيفة. اختر بثقة بناءً على تجارب الآخرين.",
      color: "#FFE66D",
    },
  ];

  const steps = [
    { num: "١", title: "سجّل حسابك", desc: "بدقيقة واحدة، أنشئ حسابك واحصل على وصول كامل للمنصة.", icon: "👤" },
    { num: "٢", title: "ابحث عن ميكانيكي", desc: "استعرض الميكانيكيين القريبين منك مع تقييماتهم ومواقعهم.", icon: "🔍" },
    { num: "٣", title: "قيّم تجربتك", desc: "بعد الخدمة، شارك تجربتك وساعد الآخرين على الاختيار الصحيح.", icon: "⭐" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Bebas+Neue&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --orange: #FF6B35;
          --teal: #4ECDC4;
          --yellow: #FFE66D;
          --dark: #0A0A0F;
          --dark2: #12121A;
          --dark3: #1A1A28;
          --card: #16161F;
          --border: rgba(255,255,255,0.07);
          --text: #F0EEF8;
          --muted: #8888AA;
          --font: 'Tajawal', sans-serif;
          --brand: 'Bebas Neue', sans-serif;
        }

        html { scroll-behavior: smooth; direction: rtl; }
        body { background: var(--dark); color: var(--text); font-family: var(--font); overflow-x: hidden; }

        /* Noise texture overlay */
        body::before {
          content: '';
          position: fixed; inset: 0; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.4;
        }

        /* NAV */
        nav {
          position: fixed; top: 0; width: 100%; z-index: 100;
          padding: 0 5%;
          display: flex; align-items: center; justify-content: space-between;
          height: 72px;
          transition: all 0.4s ease;
        }
        nav.scrolled {
          background: rgba(10,10,15,0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .logo-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, var(--orange), #FF3D00);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 20px rgba(255,107,53,0.4);
        }
        .logo-text {
          font-family: var(--font); font-weight: 900; font-size: 22px;
          color: var(--text); letter-spacing: -0.5px;
        }
        .logo-text span { color: var(--orange); }
        .nav-links {
          display: flex; align-items: center; gap: 32px;
          list-style: none;
        }
        .nav-links a {
          color: var(--muted); text-decoration: none; font-size: 15px; font-weight: 500;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-cta {
          display: flex; gap: 12px;
        }
        .btn-ghost {
          padding: 9px 22px; border-radius: 10px; font-size: 14px; font-weight: 600;
          border: 1px solid var(--border); color: var(--text); background: transparent;
          cursor: pointer; transition: all 0.2s; font-family: var(--font);
          text-decoration: none;
        }
        .btn-ghost:hover { border-color: var(--orange); color: var(--orange); }
        .btn-primary {
          padding: 9px 22px; border-radius: 10px; font-size: 14px; font-weight: 700;
          border: none;
          background: linear-gradient(135deg, var(--orange), #FF3D00);
          color: white; cursor: pointer; transition: all 0.25s; font-family: var(--font);
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(255,107,53,0.35);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,107,53,0.45); }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 120px 5% 80px;
          position: relative; overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 70% 60% at 80% 20%, rgba(255,107,53,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 10% 80%, rgba(78,205,196,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255,230,109,0.04) 0%, transparent 60%);
        }
        .hero-grid {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
        }
        .hero-inner {
          position: relative; z-index: 2;
          max-width: 900px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 28px;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.25);
          padding: 8px 18px; border-radius: 50px;
          font-size: 13px; font-weight: 600; color: var(--orange);
          animation: fadeDown 0.6s ease both;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--orange);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        .hero-title {
          font-family: var(--font); font-weight: 900;
          font-size: clamp(44px, 7vw, 86px);
          line-height: 1.05; letter-spacing: -2px;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .hero-title .line1 { display: block; color: var(--text); }
        .hero-title .line2 {
          display: block;
          background: linear-gradient(90deg, var(--orange), #FF3D00 40%, var(--yellow));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-title .line3 { display: block; color: var(--teal); }
        .hero-sub {
          font-size: clamp(16px, 2vw, 20px); color: var(--muted); max-width: 560px;
          line-height: 1.7; font-weight: 400;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .hero-actions {
          display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
          animation: fadeUp 0.7s 0.3s ease both;
        }
        .btn-xl {
          padding: 16px 36px; border-radius: 14px; font-size: 17px; font-weight: 700;
          background: linear-gradient(135deg, var(--orange), #FF3D00);
          color: white; border: none; cursor: pointer; font-family: var(--font);
          text-decoration: none; display: inline-block;
          box-shadow: 0 6px 30px rgba(255,107,53,0.4);
          transition: all 0.25s;
        }
        .btn-xl:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(255,107,53,0.5); }
        .btn-xl-outline {
          padding: 16px 36px; border-radius: 14px; font-size: 17px; font-weight: 700;
          background: transparent; color: var(--text); font-family: var(--font);
          border: 1.5px solid var(--border); cursor: pointer; text-decoration: none; display: inline-block;
          transition: all 0.25s;
        }
        .btn-xl-outline:hover { border-color: var(--teal); color: var(--teal); transform: translateY(-2px); }

        .hero-scroll-hint {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: var(--muted); font-size: 12px;
          animation: fadeUp 0.7s 0.5s ease both;
          margin-top: 10px;
        }
        .scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(var(--orange), transparent);
          animation: scrollPulse 2s infinite;
        }
        @keyframes scrollPulse {
          0% { opacity: 0.3; transform: scaleY(0.5); }
          50% { opacity: 1; transform: scaleY(1); }
          100% { opacity: 0.3; transform: scaleY(0.5); }
        }

        /* FLOATING CARDS */
        .hero-cards {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
        }
        .float-card {
          position: absolute;
          background: var(--card); border: 1px solid var(--border);
          border-radius: 16px; padding: 14px 18px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 600;
          backdrop-filter: blur(12px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .fc1 { top: 20%; right: 8%; animation: float1 4s ease-in-out infinite; }
        .fc2 { bottom: 25%; left: 7%; animation: float2 5s ease-in-out infinite; }
        .fc3 { top: 55%; right: 6%; animation: float1 3.5s 1s ease-in-out infinite; }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-10px) rotate(-1deg); }
        }
        .fc-icon { font-size: 22px; }
        .fc-text { display: flex; flex-direction: column; gap: 2px; }
        .fc-label { color: var(--muted); font-size: 11px; font-weight: 400; }
        .fc-val { color: var(--text); font-size: 14px; font-weight: 700; }
        .stars { color: var(--yellow); letter-spacing: 1px; }

        /* SECTION */
        section { position: relative; z-index: 1; }
        .section-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: var(--orange); margin-bottom: 16px;
        }
        .section-label::before {
          content: ''; display: block; width: 24px; height: 2px; background: var(--orange);
        }
        .section-title {
          font-size: clamp(32px, 4vw, 52px); font-weight: 900;
          line-height: 1.1; letter-spacing: -1.5px; color: var(--text);
          margin-bottom: 16px;
        }
        .section-sub {
          font-size: 17px; color: var(--muted); max-width: 520px; line-height: 1.7;
        }

        /* STATS */
        .stats-section {
          padding: 80px 5%;
          background: linear-gradient(180deg, var(--dark) 0%, var(--dark2) 100%);
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
          background: var(--border);
          border-radius: 20px; overflow: hidden;
          border: 1px solid var(--border);
        }
        .stat-item {
          background: var(--card);
          padding: 40px 32px; text-align: center;
          transition: background 0.3s;
        }
        .stat-item:hover { background: var(--dark3); }
        .stat-num {
          font-family: var(--font); font-weight: 900;
          font-size: clamp(36px, 4vw, 56px);
          line-height: 1;
          background: linear-gradient(135deg, var(--orange), var(--yellow));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-suffix { font-size: 0.6em; }
        .stat-label { color: var(--muted); font-size: 15px; margin-top: 8px; font-weight: 500; }

        /* FEATURES */
        .features-section { padding: 100px 5%; }
        .features-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        .features-text { display: flex; flex-direction: column; gap: 0; }
        .feature-tab {
          border-right: 2px solid var(--border);
          padding: 28px 32px 28px 0;
          cursor: pointer; transition: all 0.3s;
        }
        .feature-tab.active { border-right-color: var(--orange); }
        .feature-tab-title {
          font-size: 20px; font-weight: 800; color: var(--muted);
          display: flex; align-items: center; gap: 12px;
          transition: color 0.3s;
        }
        .feature-tab.active .feature-tab-title { color: var(--text); }
        .feature-tab-desc {
          font-size: 15px; color: var(--muted); line-height: 1.7;
          margin-top: 10px; max-height: 0; overflow: hidden;
          transition: max-height 0.4s ease, opacity 0.3s;
          opacity: 0;
        }
        .feature-tab.active .feature-tab-desc { max-height: 100px; opacity: 1; }
        .features-visual {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 24px; padding: 48px; text-align: center;
          position: relative; overflow: hidden;
          min-height: 320px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 20px;
        }
        .features-visual::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 70% at 50% 0%, rgba(255,107,53,0.08), transparent);
          pointer-events: none;
        }
        .feature-emoji { font-size: 72px; animation: featurePop 0.4s ease; }
        @keyframes featurePop {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .feature-visual-title { font-size: 24px; font-weight: 800; }
        .feature-visual-desc { font-size: 15px; color: var(--muted); max-width: 260px; line-height: 1.6; }
        .feature-visual-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--orange);
          box-shadow: 0 0 20px var(--orange);
          position: absolute; top: 24px; left: 24px;
          animation: pulse 2s infinite;
        }

        /* STEPS */
        .steps-section {
          padding: 100px 5%;
          background: linear-gradient(180deg, var(--dark2), var(--dark3));
        }
        .steps-inner { max-width: 1100px; margin: 0 auto; }
        .steps-header { text-align: center; margin-bottom: 64px; }
        .steps-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
          position: relative;
        }
        .steps-grid::before {
          content: '';
          position: absolute; top: 52px; right: calc(33.3% + 24px); left: calc(33.3% + 24px);
          height: 1px; background: linear-gradient(90deg, var(--orange), var(--teal));
          z-index: 0;
        }
        .step-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; padding: 36px 28px;
          text-align: center; position: relative;
          transition: transform 0.3s, border-color 0.3s;
        }
        .step-card:hover { transform: translateY(-6px); border-color: rgba(255,107,53,0.3); }
        .step-num {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, var(--orange), #FF3D00);
          color: white; font-size: 22px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; position: relative; z-index: 1;
          box-shadow: 0 4px 24px rgba(255,107,53,0.4);
        }
        .step-icon { font-size: 32px; margin-bottom: 12px; }
        .step-title { font-size: 20px; font-weight: 800; margin-bottom: 10px; }
        .step-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

        /* WHO */
        .who-section { padding: 100px 5%; }
        .who-inner { max-width: 1100px; margin: 0 auto; }
        .who-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 56px; }
        .who-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 24px; padding: 44px;
          transition: transform 0.3s, border-color 0.3s;
          position: relative; overflow: hidden;
        }
        .who-card:hover { transform: translateY(-6px); }
        .who-card.user-card { border-color: rgba(78,205,196,0.2); }
        .who-card.user-card:hover { border-color: rgba(78,205,196,0.5); }
        .who-card.mech-card { border-color: rgba(255,107,53,0.2); }
        .who-card.mech-card:hover { border-color: rgba(255,107,53,0.5); }
        .who-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
        }
        .user-card::before { background: linear-gradient(90deg, var(--teal), transparent); }
        .mech-card::before { background: linear-gradient(90deg, var(--orange), transparent); }
        .who-icon { font-size: 52px; margin-bottom: 20px; }
        .who-title { font-size: 28px; font-weight: 900; margin-bottom: 12px; }
        .who-sub { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 28px; }
        .who-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .who-list li {
          display: flex; align-items: center; gap: 10px;
          font-size: 15px; font-weight: 500;
        }
        .who-list li::before { content: '✓'; color: var(--teal); font-weight: 900; }
        .mech-card .who-list li::before { content: '✓'; color: var(--orange); }
        .who-btn {
          display: inline-block; padding: 14px 28px; border-radius: 12px;
          font-size: 15px; font-weight: 700; text-decoration: none; font-family: var(--font);
          transition: all 0.25s;
        }
        .user-card .who-btn {
          background: rgba(78,205,196,0.1); color: var(--teal);
          border: 1.5px solid rgba(78,205,196,0.3);
        }
        .user-card .who-btn:hover { background: var(--teal); color: var(--dark); transform: translateY(-2px); }
        .mech-card .who-btn {
          background: rgba(255,107,53,0.1); color: var(--orange);
          border: 1.5px solid rgba(255,107,53,0.3);
        }
        .mech-card .who-btn:hover { background: var(--orange); color: white; transform: translateY(-2px); }

        /* CTA */
        .cta-section {
          padding: 100px 5%;
          background: linear-gradient(180deg, var(--dark3), var(--dark));
        }
        .cta-inner {
          max-width: 800px; margin: 0 auto; text-align: center;
          background: var(--card); border: 1px solid var(--border);
          border-radius: 32px; padding: 72px 56px;
          position: relative; overflow: hidden;
        }
        .cta-inner::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,107,53,0.12), transparent),
            radial-gradient(ellipse 60% 60% at 100% 100%, rgba(78,205,196,0.06), transparent);
          pointer-events: none;
        }
        .cta-title {
          font-size: clamp(32px, 4vw, 52px); font-weight: 900;
          letter-spacing: -1.5px; margin-bottom: 16px; position: relative;
        }
        .cta-sub { font-size: 17px; color: var(--muted); margin-bottom: 40px; line-height: 1.7; position: relative; }
        .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }
        .cta-note { font-size: 13px; color: var(--muted); margin-top: 20px; position: relative; }

        /* FOOTER */
        footer {
          padding: 48px 5%; border-top: 1px solid var(--border);
          background: var(--dark);
        }
        .footer-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px;
        }
        .footer-copy { font-size: 14px; color: var(--muted); }
        .footer-links { display: flex; gap: 28px; }
        .footer-links a { font-size: 14px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: var(--text); }

        /* ANIMATIONS */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* MOBILE */
        .hamburger { display: none; background: none; border: none; color: var(--text); font-size: 24px; cursor: pointer; }
        @media (max-width: 900px) {
          .nav-links, .nav-cta { display: none; }
          .hamburger { display: block; }
          .features-inner { grid-template-columns: 1fr; gap: 40px; }
          .steps-grid { grid-template-columns: 1fr; gap: 16px; }
          .steps-grid::before { display: none; }
          .who-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-cards { display: none; }
          .cta-inner { padding: 48px 28px; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .hero-actions { flex-direction: column; }
          .btn-xl, .btn-xl-outline { width: 100%; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className={scrollY > 40 ? "scrolled" : ""}>
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
          <Link href="/auth" className="btn-ghost">تسجيل الدخول</Link>
          <Link href="/auth" className="btn-primary">انضم الآن</Link>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />

        {/* Floating cards */}
        <div className="hero-cards">
          <div className="float-card fc1">
            <span className="fc-icon">⭐</span>
            <div className="fc-text">
              <span className="fc-label">تقييم المنصة</span>
              <span className="fc-val">4.9 / 5.0</span>
              <span className="stars">★★★★★</span>
            </div>
          </div>
          <div className="float-card fc2">
            <span className="fc-icon">🔧</span>
            <div className="fc-text">
              <span className="fc-label">ميكانيكيون متاحون الآن</span>
            </div>
          </div>
          <div className="float-card fc3">
            <span className="fc-icon">✅</span>
            <div className="fc-text">
              <span className="fc-label">آخر طلب تم قبول</span>
              <span className="fc-val">منذ 3 دقائق</span>
            </div>
          </div>
        </div>

        <div className="hero-inner">
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
            <Link href="/auth" className="btn-xl">ابدأ الآن مجاناً →</Link>
            <a href="#how" className="btn-xl-outline">كيف يعمل التطبيق</a>
          </div>

          <div className="hero-scroll-hint">
            <div className="scroll-line" />
            <span>اسحب للأسفل</span>
          </div>
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
              <div
                key={i}
                className={`feature-tab ${activeFeature === i ? "active" : ""}`}
                onClick={() => setActiveFeature(i)}
              >
                <div className="feature-tab-title">
                  <span>{f.icon}</span> {f.title}
                </div>
                <div className="feature-tab-desc">{f.desc}</div>
              </div>
            ))}
          </div>

          <div className="features-visual">
            <div className="feature-visual-dot" />
            <div key={activeFeature} className="feature-emoji">{features[activeFeature].icon}</div>
            <div className="feature-visual-title" style={{ color: features[activeFeature].color }}>
              {features[activeFeature].title}
            </div>
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
          <p className="cta-sub">
            انضم إلى آلاف المستخدمين والميكانيكيين على المنصة.<br />
            التسجيل مجاني ويستغرق أقل من دقيقة.
          </p>
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