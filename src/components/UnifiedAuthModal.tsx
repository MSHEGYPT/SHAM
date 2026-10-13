import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Phone,
  ShieldCheck,
  Sparkles,
  Crown,
  UserCheck,
  Coins,
  Truck,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  KeyRound,
  IdCard,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { UserRole, StaffRole } from '../types';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'LOGIN' | 'REGISTER';
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'LOGIN',
}) => {
  const { loginUser, registerUser, quickSwitchUser, currentUser } = useLogistics();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(defaultMode);
  const [selectedRole, setSelectedRole] = useState<string>('GENERAL_MANAGER');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [regForm, setRegForm] = useState({
    fullName: '',
    phone: '',
    nationalId: '',
    role: 'COURIER',
    zone: 'القاهرة الكبرى',
    vehicleType: 'MOTORCYCLE',
    vehiclePlate: '',
    businessType: 'ملابس وأزياء',
    brandName: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedbackNotice(null);
    setAiReport(null);

    try {
      const result = await loginUser(identifier || '01011122334', selectedRole);
      if (result.aiAudit) {
        setAiReport(result.aiAudit);
      }
      setFeedbackNotice(`تم تسجيل الدخول بنجاح وتعيين الصلاحيات الأمنية للدائرة المخصصة.`);
      setTimeout(() => {
        onClose();
        setFeedbackNotice(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setFeedbackNotice('حدث خطأ أثناء فحص الحساب.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName || !regForm.phone) return;

    setIsLoading(true);
    setFeedbackNotice(null);
    setAiReport(null);

    try {
      const result = await registerUser(regForm);
      if (result.aiAudit) {
        setAiReport(result.aiAudit);
      }
      setFeedbackNotice(result.message);
      setTimeout(() => {
        onClose();
        setFeedbackNotice(null);
      }, 2000);
    } catch (err) {
      console.error(err);
      setFeedbackNotice('فشل تسجيل الحساب، يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastSwitch = (preset: 'OWNER' | 'SUPERVISOR' | 'ACCOUNTANT' | 'COURIER' | 'MERCHANT') => {
    quickSwitchUser(preset);
    setFeedbackNotice('تم التبديل الفوري بنجاح!');
    setTimeout(() => {
      onClose();
      setFeedbackNotice(null);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">بوابة الدخول وإنشاء الحسابات الموحدة</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  مدير العمليات والذكاء الاصطناعي
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تدقيق أمني ذكي يفرز صلاحيات المدير، المشرفين، المحاسبين، والمناديب وفق نموذج دوائر البصلة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Fast Login Bar (Demo Presets) */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0">
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            دخول تجريبي سريع بضغطة زر:
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleFastSwitch('OWNER')}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-[11px] border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Crown className="w-3 h-3 text-amber-700" />
              <span>المدير (الدائرة 1)</span>
            </button>

            <button
              onClick={() => handleFastSwitch('SUPERVISOR')}
              className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg font-bold text-[11px] border border-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <UserCheck className="w-3 h-3 text-blue-700" />
              <span>المشرف (الدائرة 2)</span>
            </button>

            <button
              onClick={() => handleFastSwitch('ACCOUNTANT')}
              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-bold text-[11px] border border-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Coins className="w-3 h-3 text-emerald-700" />
              <span>المحاسب (الدائرة 3)</span>
            </button>

            <button
              onClick={() => handleFastSwitch('COURIER')}
              className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg font-bold text-[11px] border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Truck className="w-3 h-3 text-purple-700" />
              <span>المندوب (الدائرة 4)</span>
            </button>

            <button
              onClick={() => handleFastSwitch('MERCHANT')}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Building2 className="w-3 h-3 text-slate-700" />
              <span>التاجر (الدائرة 5)</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="flex border-b border-slate-200 bg-white">
          <button
            onClick={() => setMode('LOGIN')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
              mode === 'LOGIN'
                ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            تسجيل الدخول إلى الدائرة المخصصة
          </button>

          <button
            onClick={() => setMode('REGISTER')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
              mode === 'REGISTER'
                ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            إنشاء حساب جديد (عامل / متجر / موظف)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {feedbackNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center animate-in fade-in">
              ✓ {feedbackNotice}
            </div>
          )}

          {/* AI Access Report Banner if generated */}
          {aiReport && (
            <div className="p-4 bg-slate-50 border border-amber-300 rounded-2xl text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  تقرير مدير الصلاحيات الذكي (AI Gatekeeper):
                </span>
                <span className="font-black px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400">
                  {aiReport.assignedRing?.ringName || 'الدائرة الأمنية المخصصة'}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">{aiReport.aiSecurityAudit}</p>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  اختر المستوى الوظيفي والدائرة الأمنية:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'GENERAL_MANAGER', label: 'المدير العام (صاحب الموقع)', ring: 'دائرة 1 (النواة)', icon: Crown },
                    { id: 'OPERATIONS_SUPERVISOR', label: 'مشرف العمليات', ring: 'دائرة 2 (الإدارية)', icon: UserCheck },
                    { id: 'ACCOUNTANT', label: 'المحاسب والمالية', ring: 'دائرة 3 (المالية)', icon: Coins },
                    { id: 'COURIER', label: 'مندوب التوصيل', ring: 'دائرة 4 (الميدانية)', icon: Truck },
                    { id: 'MERCHANT', label: 'التاجر / المتجر', ring: 'دائرة 5 (الشركاء)', icon: Building2 },
                    { id: 'CUSTOMER', label: 'عميل المنصة والتتبع', ring: 'دائرة 5 (الخارجية)', icon: User },
                  ].map((roleItem) => {
                    const Icon = roleItem.icon;
                    const isSelected = selectedRole === roleItem.id;
                    return (
                      <button
                        type="button"
                        key={roleItem.id}
                        onClick={() => setSelectedRole(roleItem.id)}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                            {roleItem.ring}
                          </span>
                        </div>
                        <div className="font-bold text-xs">{roleItem.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  رقم الهاتف أو المعرّف الوظيفي:
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="01xxxxxxxxx أو المعرف المسجل"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">كلمة المرور / الرمز السري:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-[11px] border border-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  نظام التشفير الرقابي: يتم فحص صلاحيات الجلسة آلياً وعزل أي محاولة وصول خارج الدائرة المعتمدة.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>جاري التحقق عبر مدير العمليات الذكي...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>تسجيل الدخول وفتح الدائرة الأمنية</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: REGISTER FORM */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الاسم بالكامل:</label>
                  <input
                    type="text"
                    required
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    placeholder="الاسم الرباعي الرسمي"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع الحساب المطلوب:</label>
                  <select
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                  >
                    <option value="COURIER">مندوب توصيل واستلام ميداني (الدائرة 4)</option>
                    <option value="MERCHANT">متجر / تاجر إلكتروني (الدائرة 5)</option>
                    <option value="OPERATIONS_SUPERVISOR">مشرف عمليات وتوزيع (الدائرة 2)</option>
                    <option value="ACCOUNTANT">محاسب ومدقق مالي (الدائرة 3)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الهاتف أو الواتساب:</label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الرقم القومي (للتدقيق الأمني):</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={regForm.nationalId}
                    onChange={(e) => setRegForm({ ...regForm, nationalId: e.target.value })}
                    placeholder="14 رقم بالبطاقة"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {regForm.role === 'COURIER' && (
                <div className="grid grid-cols-2 gap-3 bg-purple-50/50 p-3 rounded-xl border border-purple-200">
                  <div>
                    <label className="font-bold text-purple-900 block mb-1">وسيلة النقل:</label>
                    <select
                      value={regForm.vehicleType}
                      onChange={(e) => setRegForm({ ...regForm, vehicleType: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900"
                    >
                      <option value="MOTORCYCLE">دراجة نارية (موتوسيكل)</option>
                      <option value="CAR">سيارة ملاكي</option>
                      <option value="VAN">سيارة فان بضائع</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-purple-900 block mb-1">رقم اللوحة المعدنية:</label>
                    <input
                      type="text"
                      value={regForm.vehiclePlate}
                      onChange={(e) => setRegForm({ ...regForm, vehiclePlate: e.target.value })}
                      placeholder="مثال: س ق ص 718"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono"
                    />
                  </div>
                </div>
              )}

              {regForm.role === 'MERCHANT' && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">اسم المتجر أو البراند:</label>
                    <input
                      type="text"
                      value={regForm.brandName}
                      onChange={(e) => setRegForm({ ...regForm, brandName: e.target.value })}
                      placeholder="اسم العلامة التجارية"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">نوع المنتجات:</label>
                    <input
                      type="text"
                      value={regForm.businessType}
                      onChange={(e) => setRegForm({ ...regForm, businessType: e.target.value })}
                      placeholder="ملابس، إلكترونيات، عطور..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl text-amber-950 text-[11px] border border-amber-200">
                🛡️ سيقوم مدير العمليات الذكي بالتحقق الفوري من المستندات، وإرسال ملف العاملين للدائرة الإدارية
                للمراجعة والاعتماد النهائي.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>جاري تدقيق البيانات وتعيين الدائرة الأمنية...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>إنشاء الحساب والتحقق الذكي بالأهليّة</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
