'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccessToken } from '../../useAccessToken'; // عدّل المسار حسب مشروعك

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Stars = ({ value }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1,2,3,4,5].map(n => (
      <span key={n} style={{ fontSize: '1rem', color: n <= value ? '#f59e0b' : 'rgba(255,255,255,.15)' }}>★</span>
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

  if (loading) return (
    <div style={pageStyle}>
      <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '1rem' }}>جاري التحميل...</div>
    </div>
  );

  if (!mechanic) return (
    <div style={pageStyle}>
      <div style={{ color: '#f87171' }}>الميكانيكي غير موجود</div>
    </div>
  );

  return (
    <div style={pageStyle}>
      {/* زر رجوع */}
      <button onClick={() => router.back()} style={backBtnStyle}>← رجوع</button>

      {/* بطاقة الملف الشخصي */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
          <div style={avatarStyle}>🔧</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{mechanic.fullName}</div>
            <div style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.4)', marginTop: '.2rem' }}>@{mechanic.username}</div>
            {avg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.5rem' }}>
                <Stars value={Math.round(avg)} />
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{avg}/5</span>
                <span style={{ color: 'rgba(255,255,255,.3)', fontSize: '.8rem' }}>({reviews.length} تقييم)</span>
              </div>
            )}
          </div>
        </div>

        {mechanic.profileData?.bio && (
          <div style={infoRowStyle}>
            <span style={labelStyle}>نبذة</span>
            <span style={valueStyle}>{mechanic.profileData.bio}</span>
          </div>
        )}
        {mechanic.profileData?.phone && (
          <div style={infoRowStyle}>
            <span style={labelStyle}>📞 الهاتف</span>
            <span style={valueStyle}>{mechanic.profileData.phone}</span>
          </div>
        )}
        {mechanic.location && (
          <div style={infoRowStyle}>
            <span style={labelStyle}>📍 الموقع</span>
            <span style={valueStyle}>{mechanic.location.businessName || mechanic.location.address}</span>
          </div>
        )}
      </div>

      {/* التقييمات */}
      {reviews.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>التقييمات</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
            {reviews.map(r => (
              <div key={r._id} style={reviewCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{r.userId?.fullName || 'مستخدم'}</span>
                  <Stars value={r.rating} />
                </div>
                <div style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.6)' }}>{r.comment}</div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.25)', marginTop: '.4rem' }}>
                  {new Date(r.createdAt).toLocaleDateString('ar')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── الستايلات ──
const pageStyle = {
  minHeight: '100vh',
  background: '#080810',
  color: '#e2e8f0',
  fontFamily: 'Tajawal, sans-serif',
  direction: 'rtl',
  padding: '2rem',
  maxWidth: 700,
  margin: '0 auto',
};
const backBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '.4rem',
  padding: '.45rem .9rem', background: 'rgba(255,255,255,.07)',
  border: '1px solid rgba(255,255,255,.1)', borderRadius: 9,
  color: 'rgba(255,255,255,.6)', fontFamily: 'Tajawal, sans-serif',
  fontSize: '.85rem', cursor: 'pointer', marginBottom: '1.5rem',
};
const cardStyle = {
  background: 'rgba(255,255,255,.042)', border: '1px solid rgba(255,255,255,.09)',
  borderRadius: 20, padding: '1.8rem',
};
const avatarStyle = {
  width: 64, height: 64, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
  borderRadius: '50%', display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0,
};
const infoRowStyle = {
  display: 'flex', gap: '1rem', padding: '.65rem 0',
  borderTop: '1px solid rgba(255,255,255,.06)',
};
const labelStyle = { fontSize: '.82rem', color: 'rgba(255,255,255,.3)', minWidth: 80 };
const valueStyle = { fontSize: '.9rem', color: 'rgba(255,255,255,.75)' };
const reviewCardStyle = {
  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 14, padding: '1rem 1.2rem',
};