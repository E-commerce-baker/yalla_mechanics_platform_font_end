const ReportViewPage = ({ api, breakdown, setToast, onBack }) => {
  const [report, setReport]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [reviewed, setReviewed]     = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating:0, comment:'' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api(`/breakdowns/${breakdown._id}/report`)
      .then(r => setReport(r.data))
      .catch(err => setToast({ type:'error', text:err.message }))
      .finally(() => setLoading(false));
  }, []);

  const submitReview = async () => {
    if (reviewForm.rating === 0) { setToast({ type:'error', text:'اختر تقييماً من 1 إلى 5' }); return; }
    if (!reviewForm.comment.trim()) { setToast({ type:'error', text:'اكتب تعليقاً على الخدمة' }); return; }
    try {
      setSubmitting(true);
      await api('/reviews', {
        method:'POST',
        body: JSON.stringify({
          mechanicId: report.assignedMechanic._id,
          rating:     reviewForm.rating,
          comment:    reviewForm.comment,
        }),
      });
      setToast({ type:'success', text:'🌟 شكراً! تم إرسال تقييمك.' });
      setReviewed(true);
    } catch(err) {
      setToast({ type:'error', text:err.message });
    } finally { setSubmitting(false); }
  };

  const pdfUrl = report?.reportPdf?.path
    ? `http://localhost:3001${report.reportPdf.path}`
    : null;

  if (loading) return <div className="center-msg"><span style={{ display:'inline-block',width:22,height:22,border:'2px solid rgba(255,255,255,.2)',borderTopColor:'#fff',borderRadius:'50%',animation:'rot .6s linear infinite'}}/><span>جاري التحميل...</span></div>;

  const rd   = report?.reportData  || {};
  const mech = report?.assignedMechanic || {};
  const car  = report?.carInfo || breakdown.carInfo || {};

  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← رجوع</button>
      <div className="page-hdr">
        <div className="page-title">📄 تقرير الإصلاح</div>
        <div style={{ background:'rgba(255,255,255,.06)', borderRadius:10, padding:'.4rem .9rem', fontSize:'.85rem', color:'rgba(255,255,255,.55)', marginTop:'.5rem', display:'inline-flex', alignItems:'center', gap:'.5rem' }}>
          🚗 {car.brand} {car.model} {car.year && `(${car.year})`} — {breakdown.title}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem', maxWidth:860 }}>

        {/* ── عمود يسار: تفاصيل التقرير ── */}
        <div>
          {/* ميكانيكي */}
          <div className="card-glass" style={{ marginBottom:'1rem' }}>
            <div className="sec-title" style={{ marginBottom:'1rem' }}>🔧 الميكانيكي</div>
            <div style={{ display:'flex', alignItems:'center', gap:'.85rem' }}>
              <div style={{ width:48, height:48, background:'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>🔧</div>
              <div>
                <div style={{ fontWeight:700, color:'#fff', fontSize:'1rem' }}>{mech.fullName || '—'}</div>
                <div style={{ fontSize:'.8rem', color:'rgba(255,255,255,.38)' }}>@{mech.username}</div>
                {mech.profileData?.phone && <div style={{ fontSize:'.8rem', color:'rgba(255,255,255,.38)', marginTop:'.2rem' }}>📞 {mech.profileData.phone}</div>}
              </div>
            </div>
          </div>

          {/* ملخص الحل */}
          {rd.solutionSummary && (
            <div className="card-glass" style={{ marginBottom:'1rem' }}>
              <div className="sec-title" style={{ marginBottom:'.8rem' }}>✅ ملخص الحل</div>
              <div style={{ fontSize:'.9rem', color:'rgba(255,255,255,.65)', lineHeight:1.7 }}>{rd.solutionSummary}</div>
            </div>
          )}

          {/* قطع الغيار */}
          {rd.spareParts?.length > 0 && rd.spareParts.some(p=>p.name) && (
            <div className="card-glass" style={{ marginBottom:'1rem' }}>
              <div className="sec-title" style={{ marginBottom:'.8rem' }}>🔩 قطع الغيار</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'.4rem' }}>
                {rd.spareParts.filter(p=>p.name).map((p,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.45rem .6rem', background:'rgba(255,255,255,.04)', borderRadius:9 }}>
                    <span style={{ fontSize:'.87rem', color:'rgba(255,255,255,.7)' }}>🔩 {p.name} × {p.quantity}</span>
                    <span style={{ fontSize:'.87rem', fontWeight:700, color:'#fbbf24' }}>{(p.quantity*p.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* السعر النهائي */}
          <div className="card-glass">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'1rem', color:'rgba(255,255,255,.55)' }}>💳 إجمالي الفاتورة</span>
              <span style={{ fontSize:'1.5rem', fontWeight:900, color:'#f59e0b' }}>
                {rd.finalPrice != null ? rd.finalPrice.toFixed(2) : '—'}
                <span style={{ fontSize:'.9rem', fontWeight:400, color:'rgba(245,158,11,.6)', marginRight:'.3rem' }}> د.أ</span>
              </span>
            </div>
            {rd.submittedAt && (
              <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,.25)', marginTop:'.5rem' }}>
                تاريخ التقرير: {new Date(rd.submittedAt).toLocaleString('ar')}
              </div>
            )}
          </div>
        </div>

        {/* ── عمود يمين: PDF + التقييم ── */}
        <div>
          {/* PDF */}
          {pdfUrl && (
            <div className="card-glass" style={{ marginBottom:'1rem' }}>
              <div className="sec-title" style={{ marginBottom:'1rem' }}>📄 ملف التقرير</div>
              <iframe src={pdfUrl} width="100%" height="340px" style={{ borderRadius:10, border:'1px solid rgba(255,255,255,.1)', display:'block' }} title="Repair Report"/>
              <a href={pdfUrl} download={`repair-report.pdf`} className="btn-download-pdf">
                ⬇️ تحميل الـ PDF
              </a>
            </div>
          )}

          {/* تقييم الخدمة */}
          <div className={`card-glass ${reviewed ? 'reviewed-box' : ''}`}>
            {reviewed ? (
              <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'.6rem' }}>🌟</div>
                <div style={{ fontSize:'1rem', fontWeight:700, color:'#6ee7b7' }}>شكراً على تقييمك!</div>
                <div style={{ fontSize:'.83rem', color:'rgba(255,255,255,.35)', marginTop:'.3rem' }}>يساعد تقييمك الميكانيكيين الآخرين</div>
              </div>
            ) : (
              <>
                <div className="sec-title" style={{ marginBottom:'1rem' }}>⭐ قيّم الخدمة</div>
                <div style={{ marginBottom:'1rem' }}>
                  <div style={{ fontSize:'.82rem', color:'rgba(255,255,255,.4)', marginBottom:'.5rem' }}>تقييمك للميكانيكي</div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[1,2,3,4,5].map(n=>(
                      <span key={n} onClick={()=>setReviewForm(p=>({...p,rating:n}))}
                        style={{ fontSize:'1.8rem', cursor:'pointer', color:n<=reviewForm.rating?'#f59e0b':'rgba(255,255,255,.15)', transition:'color .15s, transform .15s', transform:n<=reviewForm.rating?'scale(1.15)':'scale(1)', userSelect:'none' }}>★</span>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <div style={{ fontSize:'.82rem', color:'rgba(255,255,255,.4)', marginBottom:'.4rem' }}>تعليقك ({reviewForm.comment.length}/1000)</div>
                  <textarea
                    className="inp" rows={4} maxLength={1000}
                    value={reviewForm.comment}
                    onChange={e=>setReviewForm(p=>({...p,comment:e.target.value}))}
                    placeholder="كيف كانت تجربتك مع هذا الميكانيكي؟ هل أنجز العمل بشكل احترافي؟..."
                    style={{ resize:'vertical', paddingTop:'.75rem', paddingRight:'.9rem' }}/>
                </div>
                <button className="btn-primary" disabled={submitting || reviewed} onClick={submitReview}>
                  {submitting
                    ? <><span style={{ display:'inline-block',width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'rot .6s linear infinite',verticalAlign:'middle'}}/> جاري الإرسال...</>
                    : '🌟 إرسال التقييم'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   CSS الجديد — أضفه داخل <style> في UserDashboard
   ══════════════════════════════════════════════════════════════════ */
const REPORT_VIEW_CSS = `
  .btn-view-report{padding:.4rem .85rem;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.28);border-radius:9px;color:#a78bfa;font-family:'Tajawal',sans-serif;font-size:.8rem;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
  .btn-view-report:hover{background:rgba(167,139,250,.22)}

  .btn-download-pdf{display:flex;align-items:center;justify-content:center;gap:.5rem;margin-top:.8rem;padding:.65rem;background:rgba(14,165,233,.1);border:1px solid rgba(14,165,233,.28);border-radius:11px;color:#38bdf8;font-family:'Tajawal',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;text-decoration:none;width:100%}
  .btn-download-pdf:hover{background:rgba(14,165,233,.2)}

  .reviewed-box{border-color:rgba(16,185,129,.3)!important;background:rgba(16,185,129,.04)!important}

  @media(max-width:700px){
    .report-grid{grid-template-columns:1fr!important}
  }
`;

export { ReportViewPage, REPORT_VIEW_CSS };