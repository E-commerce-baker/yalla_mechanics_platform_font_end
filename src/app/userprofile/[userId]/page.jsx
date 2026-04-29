'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccessToken } from '../../useAccessToken';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Stars = ({ value, size = '1rem' }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[1,2,3,4,5].map(n => (
      <span key={n} style={{
        fontSize: size,
        color: n <= value ? '#f59e0b' : '#ffffff15',
        filter: n <= value ? 'drop-shadow(0 0 4px #f59e0b60)' : 'none',
      }}>★</span>
    ))}
  </div>
);

export default function UserProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const accessToken = useAccessToken();
  const [mechanic, setMechanic] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !userId) return;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    Promise.all([
      fetch(`${API_BASE_URL}/api/users/mechanics/${userId}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/users/mechanics/${userId}/reviews`, { headers }).then(r => r.json()),
    ])
      .then(([mechData, revData]) => {
        if (mechData.success) setMechanic(mechData.data);
        if (revData.success) setReviews(revData.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken, userId]);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const satisfaction = reviews.length
    ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)
    : 0;

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0,2) || '?';

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <div style={pageStyle}>
      <div style={{ color: 'rgba(255,255,255,.3)', fontSize: '1rem', textAlign: 'center', marginTop: '5rem' }}>
        جاري التحميل...
      </div>
    </div>
  );

  if (!mechanic) return (
    <div style={pageStyle}>
      <div style={{ color: '#f87171', textAlign: 'center', marginTop: '5rem' }}>الميكانيكي غير موجود</div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <button onClick={() => router.back()} style={backBtnStyle}>← رجوع</button>

      {/* Hero Card */}
      <div style={heroCardStyle}>
        <div style={heroGlowStyle} />
        <div style={heroGridStyle} />
        <div style={topBadgeStyle}>⭐ ميكانيكي موثوق</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginTop: '1rem' }}>
          <div style={{ position: 'relative', width: 70, height: 70, flexShrink: 0 }}>
            <div style={avatarStyle}>🔧</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
              {mechanic.fullName}
            </div>
            <div style={{ fontSize: '.82rem', color: '#94a3b8', marginTop: '.15rem' }}>
              @{mechanic.username}
            </div>
            <div style={roleBadgeStyle}>🔩 ميكانيكي محترف</div>

            {avg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '.8rem' }}>
                <Stars value={Math.round(avg)} />
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b' }}>{avg}</span>
                <span style={{ fontSize: '.78rem', color: '#94a3b8', background: '#ffffff08',
                  padding: '.2rem .5rem', borderRadius: 6, border: '1px solid #ffffff0d' }}>
                  {reviews.length} تقييم
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem', marginTop: '1.4rem' }}>
          <div style={{ ...infoCardStyle, gridColumn: '1/-1' }}>
            <div style={infoLabelStyle}>📧 البريد الإلكتروني</div>
            <div style={{ ...infoValStyle, color: '#60a5fa' }}>{mechanic.email}</div>
          </div>
          {mechanic.profileData?.phone && (
            <div style={infoCardStyle}>
              <div style={infoLabelStyle}>📞 الهاتف</div>
              <div style={infoValStyle}>{mechanic.profileData.phone}</div>
            </div>
          )}
          {mechanic.location && (
            <div style={infoCardStyle}>
              <div style={infoLabelStyle}>📍 الموقع</div>
              <div style={infoValStyle}>{mechanic.location.businessName || mechanic.location.address}</div>
            </div>
          )}
          <div style={infoCardStyle}>
            <div style={infoLabelStyle}>👤 الدور</div>
            <div style={{ ...infoValStyle, color: '#a5b4fc' }}>ميكانيكي</div>
          </div>
          <div style={infoCardStyle}>
            <div style={infoLabelStyle}>📅 تاريخ الانضمام</div>
            <div style={infoValStyle}>{formatDate(mechanic.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={statBarStyle}>
        <div style={statItemStyle}>
          <div style={{ ...statValStyle, color: '#f59e0b' }}>{avg || '—'}</div>
          <div style={statLabelStyle}>متوسط التقييم</div>
        </div>
        <div style={statDividerStyle} />
        <div style={statItemStyle}>
          <div style={statValStyle}>{reviews.length}</div>
          <div style={statLabelStyle}>إجمالي التقييمات</div>
        </div>
        <div style={statDividerStyle} />
        <div style={statItemStyle}>
          <div style={{ ...statValStyle, color: '#4ade80' }}>{satisfaction}%</div>
          <div style={statLabelStyle}>رضا العملاء</div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <>
          <div style={sectionTitleStyle}>التقييمات والآراء</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
            {reviews.map(r => (
              <div key={r._id} style={reviewCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.7rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <div style={reviewerAvatarStyle}>
                      {initials(r.userId?.fullName)}
                    </div>
                    <div>
                      <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#fff' }}>
                        {r.userId?.fullName || 'مستخدم'}
                      </div>
                      <div style={{ fontSize: '.72rem', color: '#94a3b8' }}>@{r.userId?.username}</div>
                      <Stars value={r.rating} size=".85rem" />
                    </div>
                  </div>
                  <div style={ratingPillStyle}>{r.rating} / 5</div>
                </div>
                <div style={{ fontSize: '.88rem', color: '#cbd5e1', lineHeight: 1.65 }}>{r.comment}</div>
                <div style={{ fontSize: '.7rem', color: '#ffffff25', marginTop: '.6rem', textAlign: 'left' }}>
                  {formatDate(r.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle = {
  minHeight: '100vh', background: '#09090f',
  fontFamily: 'Tajawal, sans-serif', direction: 'rtl',
  padding: '2rem 1rem', maxWidth: 700, margin: '0 auto', color: '#f1f5f9',
};
const backBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '.4rem',
  padding: '.45rem .9rem', background: 'rgba(255,255,255,.07)',
  border: '1px solid rgba(255,255,255,.12)', borderRadius: 9,
  color: 'rgba(255,255,255,.55)', fontFamily: 'Tajawal, sans-serif',
  fontSize: '.85rem', cursor: 'pointer', marginBottom: '1.5rem',
};
const heroCardStyle = {
  position: 'relative', borderRadius: 24, overflow: 'hidden',
  background: '#111118', border: '1px solid rgba(255,255,255,.1)',
  padding: '2rem 1.8rem 1.6rem', marginBottom: '1.5rem',
};
const heroGlowStyle = {
  position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
  width: 300, height: 200, pointerEvents: 'none',
  background: 'radial-gradient(ellipse, rgba(99,102,241,.18) 0%, transparent 70%)',
};
const heroGridStyle = {
  position: 'absolute', inset: 0, opacity: .03, pointerEvents: 'none',
  backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
  backgroundSize: '32px 32px',
};
const topBadgeStyle = {
  position: 'absolute', top: '1rem', left: '1rem',
  padding: '.3rem .7rem', borderRadius: 8,
  background: 'linear-gradient(135deg,#f59e0b,#f97316)',
  color: '#fff', fontSize: '.68rem', fontWeight: 700,
  boxShadow: '0 2px 8px rgba(245,158,11,.3)',
};
const avatarStyle = {
  width: 70, height: 70, borderRadius: '50%',
  background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1.9rem', border: '2px solid rgba(99,102,241,.3)',
};
const roleBadgeStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '.3rem',
  padding: '.25rem .7rem', borderRadius: 99, fontSize: '.72rem', fontWeight: 700,
  background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(14,165,233,.12))',
  border: '1px solid rgba(99,102,241,.25)', color: '#a5b4fc', marginTop: '.5rem',
};
const infoCardStyle = {
  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
  borderRadius: 14, padding: '.9rem 1rem',
};
const infoLabelStyle = { fontSize: '.7rem', color: '#94a3b8', fontWeight: 500, marginBottom: '.3rem' };
const infoValStyle = { fontSize: '.88rem', color: '#f1f5f9', fontWeight: 600 };
const statBarStyle = {
  display: 'flex', alignItems: 'center', gap: '1rem',
  background: '#111118', border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 16, padding: '1.2rem 1.4rem', marginBottom: '1.5rem',
};
const statItemStyle = { textAlign: 'center', flex: 1 };
const statValStyle = { fontSize: '1.6rem', fontWeight: 900, color: '#fff' };
const statLabelStyle = { fontSize: '.72rem', color: '#94a3b8', marginTop: '.2rem' };
const statDividerStyle = { width: 1, height: 40, background: 'rgba(255,255,255,.1)' };
const sectionTitleStyle = {
  fontSize: '.75rem', fontWeight: 700, color: '#94a3b8',
  letterSpacing: '.1em', display: 'flex', alignItems: 'center',
  gap: '.5rem', marginBottom: '1rem',
};
const reviewCardStyle = {
  background: '#111118', border: '1px solid rgba(255,255,255,.07)',
  borderRadius: 16, padding: '1.1rem 1.2rem', position: 'relative',
};
const reviewerAvatarStyle = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '.78rem', fontWeight: 800, color: '#fff', flexShrink: 0,
};
const ratingPillStyle = {
  background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.2)',
  color: '#f59e0b', fontSize: '.7rem', fontWeight: 700,
  padding: '.2rem .6rem', borderRadius: 8,
};