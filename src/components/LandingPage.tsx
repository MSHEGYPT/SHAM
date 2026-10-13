import React, { useState } from 'react';
import {
  Truck,
  ShieldCheck,
  Search,
  Building2,
  Package,
  Clock,
  Sparkles,
  CheckCircle2,
  MapPin,
  Phone,
  ArrowLeft,
  Coins,
  Lock,
  RotateCcw,
  Star,
  Users,
  Send,
  Loader2,
  Calendar,
  Zap,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { BostaEcosystemHub } from './BostaEcosystemHub';

interface LandingPageProps {
  onOpenAiChat: () => void;
  onOpenOrderParser: () => void;
  onOpenComplaintsDesk?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAiChat,
  onOpenOrderParser,
  onOpenComplaintsDesk,
}) => {
  const { shipments, getShipmentByTracking, addAgendaTask, setCurrentRole, governoratesCoverage } = useLogistics();

  // Tracking Search State
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedShipment, setTrackedShipment] = useState<any>(null);
  const [trackError, setTrackError] = useState(false);

  // Shipping Calculator State
  const [calcGovCode, setCalcGovCode] = useState('CAI');
  const [calcWeight, setCalcWeight] = useState(1);
  const [calcSpeed, setCalcSpeed] = useState<'SAME_DAY' | 'NEXT_DAY'>('NEXT_DAY');

  // Partnership Application State
  const [partnerForm, setPartnerForm] = useState({
    brandName: '',
    ownerName: '',
    phone: '',
    city: 'القاهرة',
    businessType: 'ملابس وأزياء',
    expectedVolume: '100 - 300 شحنة شهرياً',
  });
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerEvaluation, setPartnerEvaluation] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    const found = getShipmentByTracking(trackingInput);
    if (found) {
      setTrackedShipment(found);
      setTrackError(false);
    } else {
      setTrackedShipment(null);
      setTrackError(true);
    }
  };

  const calculateCost = () => {
    const gov = governoratesCoverage.find((g) => g.code === calcGovCode);
    let base = gov ? gov.baseFee : 35;
    if (calcSpeed === 'SAME_DAY') base += 25;
    if (calcWeight > 2) base += (calcWeight - 2) * 5;
    return base;
  };

  const handlePartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.brandName || !partnerForm.phone) return;

    setPartnerLoading(true);
    setPartnerEvaluation(null);

    try {
      const res = await fetch('/api/ai/partnership-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantInfo: partnerForm }),
      });
      const data = await res.json();
      setPartnerEvaluation(data);

      // Auto-archive into Operations Agenda!
      addAgendaTask({
        title: `طلب تعاقد متجر: ${partnerForm.brandName}`,
        source: 'WEB_FORM',
        clientName: partnerForm.ownerName || partnerForm.brandName,
        clientPhone: partnerForm.phone,
        type: 'merchant_partnership',
        priority: 'high',
        status: 'NEW',
        summary: `نشاط: ${partnerForm.businessType} - الحجم المتوقع: ${partnerForm.expectedVolume} - تقييم الذكاء الاصطناعي: ${data.partnershipTier}`,
        suggestedAction: 'تجهيز مسودة التعاقد والتواصل لتحديد موعد أول جولة استلام.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setPartnerLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* 1. Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-amber-400 text-xs font-bold border border-slate-800 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>منظومة التوصيل الأولى بميثاق "زيرو فساد" والتحقق برمز الأمان OTP</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
          لوجستيات ذكية تربط <span className="text-amber-600 underline decoration-amber-300">التجار بالعملاء</span> بأمانة مطلقة
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          منصة متكاملة لإدارة أسطول التوصيل، جدولة الاستلامات اللحظية، وتوريد أموال الـ COD يومياً
          لحسابات التجار، مع ذكاء اصطناعي يراجع طلباتك ويؤرشفها لحظياً في جدول أعمال الشركة.
        </p>

        {/* Live Tracking Box */}
        <div className="max-w-xl mx-auto pt-2">
          <form
            onSubmit={handleTrack}
            className="flex items-center gap-2 p-1.5 bg-white border-2 border-slate-300 focus-within:border-slate-900 rounded-2xl shadow-lg transition-all"
          >
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="أدخل رقم بوليصة الشحنة (مثال: SND-8041)..."
                className="w-full bg-transparent text-sm text-slate-900 focus:outline-hidden font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
            >
              تتبع الشحنة
            </button>
          </form>

          {/* Quick Demo Tracking chips */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
            <span>شحنات تجريبية للتتبع:</span>
            {['SND-8041', 'SND-8042', 'SND-8044'].map((code) => (
              <button
                key={code}
                onClick={() => {
                  setTrackingInput(code);
                  const found = getShipmentByTracking(code);
                  if (found) setTrackedShipment(found);
                }}
                className="font-mono text-slate-800 hover:text-amber-600 font-bold underline cursor-pointer"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Track Result Card */}
        {trackedShipment && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-5 shadow-xl text-right animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block">رقم التتبع:</span>
                <strong className="text-base font-mono font-bold text-slate-900">
                  {trackedShipment.trackingNumber}
                </strong>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  trackedShipment.status === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : trackedShipment.status === 'OUT_FOR_DELIVERY'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {trackedShipment.status === 'DELIVERED'
                  ? 'تم التسليم بنجاح ✓'
                  : trackedShipment.status === 'OUT_FOR_DELIVERY'
                  ? 'مع المندوب في الطريق'
                  : 'قيد التجهيز'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">المستلم:</span>
                <strong className="text-slate-900">{trackedShipment.recipientName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">المتجر الراسل:</span>
                <strong className="text-slate-900">{trackedShipment.merchantName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">مبلغ التحصيل (COD):</span>
                <strong className="text-slate-900 font-mono">{trackedShipment.codAmount} ج.م</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">رمز الأمان السري (OTP):</span>
                <strong className="text-amber-800 font-mono bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {trackedShipment.otpSecret}
                </strong>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">سجل حركة الشحنة:</span>
              <div className="space-y-2 text-xs">
                {trackedShipment.timeline.map((evt: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{evt.notes}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Complaint Trigger for this shipment */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">واجهت مشكلة أو سلوك غير لائق من المندوب؟</span>
              <button
                type="button"
                onClick={onOpenComplaintsDesk}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>رفع شكوى لمكتب النزاعات</span>
              </button>
            </div>
          </div>
        )}

        {trackError && (
          <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
            لم يتم العثور على شحنة بهذا الرقم. تأكد من إدخال الرمز بصيغة SND-8041 أو تواصل مع المساعد الذكي.
          </div>
        )}
      </section>

      {/* Dedicated Smart Complaints & Dispute Resolution Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="text-xs font-black text-rose-400 uppercase tracking-wide">
                  الشكاوى والدعم الفني الذكي
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                مكتب حل النزاعات والشكاوى المباشر
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                هل واجهت تأخيراً، أو طلب مندوب مبالغ إضافية خارج البوليصة، أو وصل الطرد متضرراً؟
                تحدث فوراً مع <strong className="text-amber-400">أ. معتز الشناوي</strong> مدير النزاعات
                والشكاوى بالذكاء الاصطناعي لحسم مشكلتك وتطبيق الإجراءات الإدارية الصارمة فوراً.
              </p>
            </div>

            <button
              onClick={onOpenComplaintsDesk}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>تحدث مع مدير الشكاوى الآن</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Interactive Instant Shipping Calculator */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-lg mx-auto mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              حاسبة تكلفة التوصيل اللحظية
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              شفافية مطلقة في الأسعار بدون أي رسوم خفية أو زيادات غير معلنة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">محافظة التسليم (27 محافظة):</label>
              <select
                value={calcGovCode}
                onChange={(e) => setCalcGovCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
              >
                {governoratesCoverage.map((gov) => (
                  <option key={gov.code} value={gov.code}>
                    {gov.nameAr} ({gov.deliverySlaHours} ساعة)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">وزن الطرد التقريبي:</label>
              <select
                value={calcWeight}
                onChange={(e) => setCalcWeight(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
              >
                <option value={1}>حتى 1 كجم (ملابس/إكسسوارات)</option>
                <option value={3}>من 1 إلى 3 كجم (أحذية/إلكترونيات)</option>
                <option value={5}>من 3 إلى 5 كجم (طرود متوسطة)</option>
                <option value={10}>أكثر من 5 كجم (طرود كبيرة)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">سرعة التوصيل المطلوبة:</label>
              <select
                value={calcSpeed}
                onChange={(e) => setCalcSpeed(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
              >
                <option value="NEXT_DAY">توصيل عادي (وفق مدة المحافظة)</option>
                <option value="SAME_DAY">توصيل فوري (نفس اليوم - القاهرة والجيزة)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">التكلفة التقديرية للشحنة:</span>
              <strong className="text-2xl font-mono text-amber-400 font-bold">
                {calculateCost()} جنيه مصري
              </strong>
            </div>

            <button
              onClick={onOpenAiChat}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors"
            >
              طلب عرض أسعار مخصص لمتاجرك
            </button>
          </div>
        </div>
      </section>

      {/* 3. Comprehensive Bosta Innovation & Ecosystem Hub */}
      <section className="max-w-6xl mx-auto px-4">
        <BostaEcosystemHub />
      </section>

      {/* 4. The 4 Anti-Corruption Guarantees (ميثاق النزاهة المؤسسي) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            معايير صارمة
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            لماذا تثق المتاجر الكبرى في شركة سند؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            صممنا المنظومة هندسياً لمنع أي تلاعب وحماية كل قرش يخص التاجر والعميل
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              رمز أمان رقمي (OTP) مع العميل
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              لا يمكن للمندوب تأكيد تسليم الشحنة وتحصيل كاش الـ COD إلا بعد إدخال الرمز السري المستلم
              على هاتف العميل فقط. لن تسمع أبداً عبارة "المندوب بيقول سلم ومستلمتش".
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              توريد يومي كاش وسقف عهدة مشدد
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              يتم تحويل أموالك المحصلة يومياً دون تأخير مع كشف حساب لحظي. كما نحدد سقفاً صارماً لعهدة
              المناديب يمنع احتجاز الأموال لأكثر من 24 ساعة.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              توثيق صارم لأسباب المرتجعات
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              يُحظر تسجيل أي مرتجع دون 3 محاولات اتصال مثبتة بالسجلات وتطابق زمني للمسافة المقطوعة، مع
              إشعار فوري للتاجر وإمكانية إعادة المحاولة في اليوم التالي.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Merchant Partnership Form with AI Instant Review & Auto-Archiving */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" />
              تعاقد فوري مدعوم بالذكاء الاصطناعي
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              ابدأ شحن أوردراتك اليوم مع شركة سند
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              سجل بيانات متجرك الآن، وسيقوم الذكاء الاصطناعي بتقييم حجم شحناتك فوراً وتقديم باقة أسعار
              مخصصة وأرشفة طلبك تلقائياً في جدول أعمال مشرفي العمليات.
            </p>
          </div>

          <form onSubmit={handlePartnershipSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">اسم المتجر أو البراند:</label>
              <input
                type="text"
                required
                value={partnerForm.brandName}
                onChange={(e) => setPartnerForm({ ...partnerForm, brandName: e.target.value })}
                placeholder="مثال: براند الفخامة للأزياء"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">اسم صاحب المتجر / المسؤول:</label>
              <input
                type="text"
                required
                value={partnerForm.ownerName}
                onChange={(e) => setPartnerForm({ ...partnerForm, ownerName: e.target.value })}
                placeholder="اسمك الكريم"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">رقم الهاتف أو الواتساب:</label>
              <input
                type="tel"
                required
                value={partnerForm.phone}
                onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">المحافظة الرئيسية للمخزن:</label>
              <select
                value={partnerForm.city}
                onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
              >
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="الإسكندرية">الإسكندرية</option>
                <option value="الدلتا">محافظات الدلتا</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">نشاط المتجر:</label>
              <select
                value={partnerForm.businessType}
                onChange={(e) => setPartnerForm({ ...partnerForm, businessType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
              >
                <option value="ملابس وأزياء">ملابس وأزياء وأحذية</option>
                <option value="إلكترونيات وهواتف">إلكترونيات وهواتف</option>
                <option value="مستحضرات تجميل">مستحضرات تجميل وعناية</option>
                <option value="عطور وساعات">عطور وساعات وإكسسوارات</option>
                <option value="أخرى">منتجات تجارية أخرى</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">حجم الشحنات المتوقع شهرياً:</label>
              <select
                value={partnerForm.expectedVolume}
                onChange={(e) => setPartnerForm({ ...partnerForm, expectedVolume: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
              >
                <option value="50 - 150 شحنة">من 50 إلى 150 شحنة شهرياً</option>
                <option value="150 - 400 شحنة">من 150 إلى 400 شحنة شهرياً</option>
                <option value="400 - 1000 شحنة">من 400 إلى 1000 شحنة شهرياً</option>
                <option value="أكثر من 1000 شحنة">أكثر من 1000 شحنة شهرياً (VIP)</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={partnerLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {partnerLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>جاري دراسة الطلب وتقديم العرض بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>إرسال طلب التعاقد والحصول على العرض المخصص فوراً</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Partnership Review Response Box */}
          {partnerEvaluation && (
            <div className="mt-6 p-5 bg-white text-slate-900 rounded-2xl shadow-xl space-y-3 animate-in fade-in slide-in-from-top-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm">
                    تهانينا! تم قبول طلبك وترقية باقتك إلى: {partnerEvaluation.partnershipTier}
                  </h4>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  {partnerEvaluation.feasibilityStatus}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {partnerEvaluation.welcomeLetter}
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block mb-1">
                  جدول مواعيد الاستلام المخصص لمتجرك:
                </span>
                <p className="text-slate-700">{partnerEvaluation.pickupSchedule}</p>
                <p className="text-emerald-700 font-semibold mt-1">
                  شروط التوريد: {partnerEvaluation.securityDepositOrLimit}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-200 flex items-center justify-between">
                <span>تم إدراج طلبك في جدول أعمال الإدارة لمتابعة توقيع التعاقد اللحظي.</span>
                <button
                  onClick={() => setCurrentRole('MERCHANT')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer hover:bg-slate-800"
                >
                  فتح بوابة التاجر
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
