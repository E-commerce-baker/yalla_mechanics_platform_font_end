const ReportPage = ({ api, accessToken, breakdown, setToast, onDone }) => {
  const [step, setStep]         = useState(1); 
  const [submitting, setSubmitting] = useState(false);
  const [pdfBlob, setPdfBlob]   = useState(null);
  const [pdfUrl, setPdfUrl]     = useState(null);

  const [form, setForm] = useState({
    solutionSummary: '',
    finalPrice: '',
    currency: 'JOD',
    spareParts: [{ name: '', quantity: 1, price: 0 }],
    mechanicNotes: '',
  });

  const f   = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const sp  = (i, k) => e => setForm(p => {
    const parts = [...p.spareParts];
    parts[i] = { ...parts[i], [k]: k === 'name' ? e.target.value : Number(e.target.value) };
    return { ...p, spareParts: parts };
  });
  const addPart    = () => setForm(p => ({ ...p, spareParts: [...p.spareParts, { name:'', quantity:1, price:0 }] }));
  const removePart = i  => setForm(p => ({ ...p, spareParts: p.spareParts.filter((_,idx)=>idx!==i) }));

  const totalParts = form.spareParts.reduce((s, p) => s + (p.quantity * p.price), 0);
  const grandTotal = form.finalPrice ? Number(form.finalPrice) : totalParts;


  const generatePdf = async () => {
    if (!window.jspdf) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W  = 210;
    const margin = 18;
    let y = 20;

   
    const rtl = (text) => text; 

    const color = {
      primary:  [30,  130, 230],
      dark:     [20,  20,  35 ],
      gray:     [100, 110, 130],
      light:    [240, 242, 246],
      white:    [255, 255, 255],
      green:    [16,  185, 129],
      amber:    [245, 158, 11 ],
    };

    const rect  = (x,yy,w,h,r)=>{ doc.setFillColor(...r); doc.rect(x,yy,w,h,'F'); };
    const line  = (x1,y1,x2,y2,c,w=0.3)=>{ doc.setDrawColor(...c); doc.setLineWidth(w); doc.line(x1,y1,x2,y2); };
    const txt   = (t,x,yy,sz,c,bold=false,align='left')=>{ doc.setFont('helvetica', bold?'bold':'normal'); doc.setFontSize(sz); doc.setTextColor(...c); doc.text(String(t),x,yy,{align}); };

    rect(0, 0, W, 38, color.primary);
    txt('Repair Report', W/2, 15, 20, color.white, true, 'center');
    txt('AutoCare Platform', W/2, 23, 9, [180,220,255], false, 'center');

    const now = new Date().toLocaleDateString('en-GB');
    txt(`Date: ${now}`, W - margin, 32, 8, [200,230,255], false, 'right');
    y = 48;

    rect(margin, y, W - margin*2, 22, color.light);
    doc.setDrawColor(...color.primary); doc.setLineWidth(0.4);
    doc.rect(margin, y, W - margin*2, 22);
    rect(margin, y, 3, 22, color.primary);

    const car = breakdown.carInfo || {};
    txt('Vehicle Information', margin + 6, y + 6, 10, color.dark, true);
    txt(`${car.brand || '-'} ${car.model || ''} (${car.year || '-'})`, margin + 6, y + 12, 9, color.gray);
    txt(`Fuel: ${car.fuelType || '-'}   Transmission: ${car.transmission || '-'}   KM: ${car.mileage?.toLocaleString() || '-'}`, margin + 6, y + 18, 8, color.gray);
    y += 28;

    txt('Problem', margin, y, 11, color.dark, true);
    line(margin, y+2, W-margin, y+2, color.primary, 0.4);
    y += 8;
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...color.gray);
    const titleLines = doc.splitTextToSize(breakdown.title || '-', W - margin*2);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 5 + 4;

    txt('Solution Summary', margin, y, 11, color.dark, true);
    line(margin, y+2, W-margin, y+2, color.green, 0.4);
    y += 8;
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...color.gray);
    const solLines = doc.splitTextToSize(form.solutionSummary || '-', W - margin*2);
    doc.text(solLines, margin, y);
    y += solLines.length * 5 + 6;

    const validParts = form.spareParts.filter(p => p.name.trim());
    if (validParts.length > 0) {
      txt('Spare Parts', margin, y, 11, color.dark, true);
      line(margin, y+2, W-margin, y+2, color.amber, 0.4);
      y += 7;

      // table header
      const cols = { name: margin, qty: margin+80, price: margin+105, total: margin+140 };
      rect(margin, y, W - margin*2, 8, color.primary);
      ['Part Name', 'Qty', 'Unit Price', 'Total'].forEach((h,i) => {
        txt(h, [cols.name, cols.qty, cols.price, cols.total][i] + 2, y+5.5, 8, color.white, true);
      });
      y += 8;

      validParts.forEach((p, idx) => {
        const rowBg = idx % 2 === 0 ? color.white : color.light;
        rect(margin, y, W - margin*2, 7, rowBg);
        txt(p.name, cols.name + 2, y+5, 8, color.dark);
        txt(String(p.quantity), cols.qty + 2, y+5, 8, color.gray);
        txt(`${p.price} ${form.currency}`, cols.price + 2, y+5, 8, color.gray);
        txt(`${(p.quantity * p.price).toFixed(2)} ${form.currency}`, cols.total + 2, y+5, 8, color.dark, true);
        y += 7;
      });

      rect(margin, y, W - margin*2, 7, color.light);
      txt('Parts Subtotal', cols.name + 2, y+5, 8, color.dark, true);
      txt(`${totalParts.toFixed(2)} ${form.currency}`, cols.total + 2, y+5, 8, color.dark, true);
      y += 10;
    }

    rect(margin, y, W - margin*2, 16, color.primary);
    txt('Total Price', margin + 6, y + 10, 12, color.white, true);
    txt(`${grandTotal.toFixed(2)} ${form.currency}`, W - margin - 4, y + 10, 14, color.amber, true, 'right');
    y += 22;

    if (form.mechanicNotes.trim()) {
      txt('Mechanic Notes', margin, y, 11, color.dark, true);
      line(margin, y+2, W-margin, y+2, color.gray, 0.3);
      y += 8;
      doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...color.gray);
      const noteLines = doc.splitTextToSize(form.mechanicNotes, W - margin*2);
      doc.text(noteLines, margin, y);
      y += noteLines.length * 5 + 6;
    }

    const user = breakdown.assignedMechanicInfo || {};
    if (y < 240) y = 240;
    line(margin, y, W-margin, y, color.light, 0.4);
    y += 6;
    txt('Prepared by:', margin, y, 9, color.gray);
    txt(user.fullName || 'Mechanic', margin + 30, y, 9, color.dark, true);
    y += 5;
    if (user.phone) { txt('Phone:', margin, y, 8, color.gray); txt(user.phone, margin+18, y, 8, color.dark); y += 4; }

    rect(0, 285, W, 12, color.primary);
    txt('AutoCare Platform — Professional Repair Report', W/2, 293, 8, [180,220,255], false, 'center');

    const blob = doc.output('blob');
    const url  = URL.createObjectURL(blob);
    setPdfBlob(blob);
    setPdfUrl(url);
    setStep(2);
  };

  const submitReport = async () => {
    if (!pdfBlob) { setToast({ type:'error', text:'يرجى توليد الـ PDF أولاً' }); return; }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('reportPdf', pdfBlob, `report_${breakdown._id}.pdf`);
      fd.append('solutionSummary', form.solutionSummary);
      fd.append('finalPrice', String(grandTotal));
      fd.append('spareParts', JSON.stringify(form.spareParts.filter(p=>p.name.trim())));

      const res = await fetch(
        `http://localhost:3001/api/mechanics/breakdowns/${breakdown._id}/report`,
        { method:'POST', headers:{ Authorization:`Bearer ${accessToken}` }, body: fd }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'فشل الرفع');

      setToast({ type:'success', text:'✅ تم إرسال التقرير للعميل بنجاح! تم إغلاق الطلب.' });
      setStep(3);
      setTimeout(onDone, 2000);
    } catch(err) {
      setToast({ type:'error', text:err.message });
    } finally { setSubmitting(false); }
  };

  const car = breakdown.carInfo || {};

  return (
    <div className="page">
      <div className="page-hdr">
        <div className="page-title">📄 تقرير الإصلاح</div>
        <div style={{ background:'rgba(255,255,255,.06)', borderRadius:10, padding:'.4rem .9rem', fontSize:'.85rem', color:'rgba(255,255,255,.55)', marginTop:'.5rem', display:'inline-flex', alignItems:'center', gap:'.5rem' }}>
          🚗 {car.brand} {car.model} {car.year && `(${car.year})`} — {breakdown.title}
        </div>
      </div>

      <div className="rpt-steps">
        {[['1','تعبئة البيانات'],['2','معاينة الـ PDF'],['3','تم الإرسال']].map(([n,l],i)=>(
          <div key={n} className={`rpt-step ${step >= Number(n) ? 'rpt-step-done' : ''} ${step === Number(n) ? 'rpt-step-active' : ''}`}>
            <div className="rpt-step-num">{step > Number(n) ? '✓' : n}</div>
            <div className="rpt-step-lbl">{l}</div>
            {i < 2 && <div className="rpt-step-line"/>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="card-glass" style={{ maxWidth:680 }}>
          <div className="form-grid">

            <div className="fg full">
              <label className="lbl">ملخص الحل <span style={{ color:'#ef4444' }}>*</span></label>
              <textarea className="inp" rows={4} required value={form.solutionSummary} onChange={f('solutionSummary')}
                placeholder="اشرح ما تم عمله لحل المشكلة..."
                style={{ resize:'vertical', paddingTop:'.75rem', paddingRight:'.9rem' }}/>
            </div>

            <div className="fg full">
              <div className="sec-title" style={{ marginBottom:'.8rem' }}>🔩 قطع الغيار المستخدمة</div>
              {form.spareParts.map((p, i) => (
                <div key={i} className="part-row">
                  <div className="inp-wrap" style={{ flex:3 }}>
                    <span className="ico">🔩</span>
                    <input className="inp" value={p.name} onChange={sp(i,'name')} placeholder={`قطعة ${i+1} (الاسم)`}/>
                  </div>
                  <div className="inp-wrap" style={{ flex:1 }}>
                    <input className="inp" type="number" min="1" value={p.quantity} onChange={sp(i,'quantity')} placeholder="كمية" style={{ paddingRight:'.7rem' }}/>
                  </div>
                  <div className="inp-wrap" style={{ flex:1.5 }}>
                    <input className="inp" type="number" min="0" step="0.5" value={p.price} onChange={sp(i,'price')} placeholder="السعر" style={{ paddingRight:'.7rem' }}/>
                  </div>
                  <div style={{ fontSize:'.8rem', color:'#fbbf24', minWidth:50, textAlign:'center', fontWeight:700 }}>
                    {(p.quantity * p.price).toFixed(2)}
                  </div>
                  {form.spareParts.length > 1 && (
                    <button type="button" onClick={()=>removePart(i)} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, color:'#fca5a5', width:32, height:32, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addPart} className="btn-add-part">+ إضافة قطعة</button>
              {totalParts > 0 && (
                <div style={{ textAlign:'left', marginTop:'.5rem', fontSize:'.85rem', color:'rgba(255,255,255,.4)' }}>
                  مجموع القطع: <span style={{ color:'#fbbf24', fontWeight:700 }}>{totalParts.toFixed(2)} {form.currency}</span>
                </div>
              )}
            </div>

            <div className="fg">
              <label className="lbl">السعر النهائي الإجمالي <span style={{ color:'#ef4444' }}>*</span></label>
              <div className="inp-wrap">
                <span className="ico">💰</span>
                <input className="inp" type="number" min="0" step="0.5" value={form.finalPrice} onChange={f('finalPrice')}
                  placeholder={totalParts > 0 ? `${totalParts.toFixed(2)} (تلقائي)` : 'ادخل المبلغ'}/>
              </div>
            </div>
            <div className="fg">
              <label className="lbl">العملة</label>
              <div className="inp-wrap">
                <span className="ico">🏦</span>
                <select className="inp inp-select" value={form.currency} onChange={f('currency')}>
                  {['JOD','SAR','USD','AED','EGP'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="fg full">
              <label className="lbl">ملاحظات إضافية للعميل (اختياري)</label>
              <textarea className="inp" rows={2} value={form.mechanicNotes} onChange={f('mechanicNotes')}
                placeholder="توصيات للصيانة القادمة، تحذيرات..."
                style={{ resize:'vertical', paddingTop:'.75rem', paddingRight:'.9rem' }}/>
            </div>

            <div className="fg full">
              <div className="total-box">
                <span style={{ fontSize:'.95rem', color:'rgba(255,255,255,.55)' }}>إجمالي الفاتورة</span>
                <span style={{ fontSize:'1.6rem', fontWeight:900, color:'#f59e0b' }}>{grandTotal.toFixed(2)} <span style={{ fontSize:'1rem', fontWeight:400 }}>{form.currency}</span></span>
              </div>
            </div>

            <div className="fg full">
              <button className="btn-primary" disabled={!form.solutionSummary.trim() || (!form.finalPrice && totalParts === 0)} onClick={generatePdf}>
                👁️ معاينة وتوليد الـ PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && pdfUrl && (
        <div style={{ maxWidth:680 }}>
          <div className="card-glass" style={{ marginBottom:'1rem' }}>
            <div className="sec-title" style={{ marginBottom:'1rem' }}>👁️ معاينة التقرير</div>
            <iframe src={pdfUrl} width="100%" height="500px" style={{ borderRadius:10, border:'1px solid rgba(255,255,255,.1)' }} title="PDF Preview"/>
          </div>
          <div style={{ display:'flex', gap:'.9rem' }}>
            <button className="btn-outline-sm" style={{ flex:1, justifyContent:'center', padding:'.8rem' }} onClick={()=>setStep(1)}>
              ✏️ تعديل البيانات
            </button>
            <a href={pdfUrl} download={`repair-report-${breakdown._id}.pdf`} className="btn-outline-sm" style={{ flex:1, justifyContent:'center', padding:'.8rem', textDecoration:'none', textAlign:'center' }}>
              ⬇️ تحميل محلياً
            </a>
            <button className="btn-primary" style={{ flex:2 }} disabled={submitting} onClick={submitReport}>
              {submitting ? <><span style={{ display:'inline-block',width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'rot .6s linear infinite',verticalAlign:'middle'}}/> جاري الإرسال...</> : '📤 إرسال للعميل'}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Done ── */}
      {step === 3 && (
        <div className="card-glass" style={{ textAlign:'center', padding:'3rem', maxWidth:500 }}>
          <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🎉</div>
          <div style={{ fontSize:'1.3rem', fontWeight:900, color:'#6ee7b7', marginBottom:'.5rem' }}>تم إرسال التقرير بنجاح!</div>
          <div style={{ color:'rgba(255,255,255,.45)', fontSize:'.9rem' }}>وصل الـ PDF للعميل ويمكنه تحميله وتقييم خدمتك الآن.</div>
        </div>
      )}
    </div>
  );
};

const REPORT_CSS = `
  /* Steps */
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

  /* Spare parts row */
  .part-row{display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem}

  /* Add part button */
  .btn-add-part{margin-top:.4rem;padding:.4rem .85rem;background:rgba(56,189,248,.08);border:1px dashed rgba(56,189,248,.3);border-radius:9px;color:#38bdf8;font-family:'Tajawal',sans-serif;font-size:.83rem;cursor:pointer;transition:all .2s}
  .btn-add-part:hover{background:rgba(56,189,248,.15)}

  /* Total box */
  .total-box{display:flex;justify-content:space-between;align-items:center;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:14px;padding:1rem 1.2rem}

  /* Report button in breakdown card */
  .btn-report{width:100%;padding:.65rem;background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.3);border-radius:11px;color:#a78bfa;font-family:'Tajawal',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.4rem;margin-top:.5rem}
  .btn-report:hover{background:rgba(167,139,250,.22);border-color:rgba(167,139,250,.5)}
`;

export { ReportPage, REPORT_CSS };