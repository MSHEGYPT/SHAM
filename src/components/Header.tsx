import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Package,
  Truck,
  Building2,
  Sparkles,
  Bot,
  RefreshCw,
  Search,
  Layers,
  Crown,
  User,
  LogIn,
  LogOut,
  HelpCircle,
  Coins,
  ChevronDown,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenAiChat: () => void;
  onOpenOrderParser: () => void;
  onOpenTracking: () => void;
  onOpenNewPickup: () => void;
  onOpenAuthModal: () => void;
  onOpenComplaintsDesk: () => void;
  onToggleOnionView?: () => void;
  showOnionView?: boolean;
  onSelectAdminTab?: (tab: string) => void;
  ownerPreviewRole?: UserRole | null;
  onSwitchOwnerPreview?: (role: UserRole | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAiChat,
  onOpenOrderParser,
  onOpenTracking,
  onOpenNewPickup,
  onOpenAuthModal,
  onOpenComplaintsDesk,
  onToggleOnionView,
  showOnionView,
  onSelectAdminTab,
  ownerPreviewRole = null,
  onSwitchOwnerPreview,
}) => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    currentRingLevel,
    fraudAnomalies,
    agenda,
    resetToDemoData,
    logoutUser,
    staff,
  } = useLogistics();

  const [isOwnerMenuOpen, setIsOwnerMenuOpen] = useState(false);

  const pendingAnomaliesCount = fraudAnomalies.filter((a) => a.status === 'PENDING_INVESTIGATION').length;
  const newAgendaCount = agenda.filter((t) => t.status === 'NEW').length;

  const currentCourier = staff.find((s) => s.id === currentUser.id || s.phone === currentUser.emailOrPhone);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* 1. TOP STATUS BAR (Conditioned strictly by Role) */}
      {/* A. VISITOR / CUSTOMER TOP BAR */}
      {currentRole === 'CUSTOMER' && (
        <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              توصيل سريع وآمن لكافة محافظات مصر | تسليم مشفر برمز كود الأمان (OTP)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onOpenComplaintsDesk}
              className="flex items-center gap-1 text-rose-300 hover:text-white transition-colors cursor-pointer font-bold"
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>الشكاوى والدعم الفني الذكي</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={onOpenAuthModal}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>دخول الموظفين والشركاء</span>
            </button>
          </div>
        </div>
      )}

      {/* B. MERCHANT TOP BAR */}
      {currentRole === 'MERCHANT' && (
        <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              بوابة التاجر المعتمدة: {currentUser.name}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-medium">
              نظام التوريد اليومي ومحفظة الكاش COD نشط
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenComplaintsDesk}
              className="flex items-center gap-1 text-rose-300 hover:text-white transition-colors font-bold cursor-pointer"
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>الشكاوى والدعم الفني الذكي</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={logoutUser}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      )}

      {/* C. COURIER TOP BAR */}
      {currentRole === 'COURIER' && (
        <div className="bg-purple-950 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-purple-900">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-purple-300 font-bold">
              <Truck className="w-3.5 h-3.5 text-purple-300" />
              دائرة الميدان: {currentUser.name}
            </span>
            {currentCourier && (
              <>
                <span className="text-purple-700">|</span>
                <span className="text-amber-300 font-mono font-bold">
                  العهدة الحالية: {currentCourier.currentCashHeld} ج.م / الحد الأقصى: {currentCourier.maxCashLimit} ج.م
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenComplaintsDesk}
              className="flex items-center gap-1 text-rose-300 hover:text-white transition-colors font-bold cursor-pointer"
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>الشكاوى والدعم الفني الذكي</span>
            </button>
            <span className="text-purple-700">|</span>
            <button
              onClick={logoutUser}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      )}

      {/* D. MANAGEMENT / ADMIN / SUPERVISOR TOP BAR */}
      {(currentRole === 'ADMIN' || currentRole === 'OPERATIONS' || currentRole === 'ACCOUNTANT') && (
        <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              درع النزاهة المؤسسي نشط: نموذج دوائر البصلة متحدة المركز (صاحب المنظومة)
            </span>
            {pendingAnomaliesCount > 0 && (
              <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                {pendingAnomaliesCount} تنبيه سلوك يحتاج تدقيق رقابي
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Active Logged-in User indicator with Ring Level */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white font-bold truncate max-w-[130px]">
                {currentUser.name.split('(')[0]}
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-1 rounded">
                الدائرة المركزية #{currentRingLevel}
              </span>
            </div>

            <button
              onClick={resetToDemoData}
              title="استعادة البيانات التوضيحية الافتراضية"
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN NAV BAR (Conditioned strictly by Current Role) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-slate-900 tracking-tight">مَشَاوِيرْ</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                  لوجستكس
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-normal">
                {currentRole === 'MERCHANT'
                  ? 'بوابة التاجر والمتجر الإلكتروني'
                  : currentRole === 'COURIER'
                  ? 'منظومة المندوب والعمليات الميدانية'
                  : currentRole === 'ADMIN'
                  ? 'لوحة إدارة المنظومة والرقابة العليا'
                  : 'منظومة التوصيل والرقابة الذكية'}
              </p>
            </div>
          </div>

          {/* Nav Links / Actions based on Active Role */}
          {/* ========================================= */}

          {/* A. VISITOR / CUSTOMER MENU */}
          {currentRole === 'CUSTOMER' && (
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={onOpenTracking}
                className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>تتبع شحنة</span>
              </button>

              <button
                onClick={onOpenComplaintsDesk}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                title="مكتب الشكاوى وحل النزاعات الذكي بإشراف أ. معتز الشناوي"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>الشكاوى والدعم</span>
              </button>

              <button
                onClick={onOpenAiChat}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-amber-500" />
                <span>مساعد مشاوير</span>
              </button>

              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>دخول / تسجيل حساب</span>
              </button>
            </div>
          )}

          {/* B. MERCHANT MENU */}
          {currentRole === 'MERCHANT' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenOrderParser}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">تحليل رسائل الواتساب</span>
                <span className="sm:hidden">محلل واتساب</span>
              </button>

              <button
                onClick={onOpenComplaintsDesk}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                title="الشكاوى وحل النزاعات الذكي للتجار"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>الشكاوى والدعم الفني</span>
              </button>

              <button
                onClick={onOpenAiChat}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-amber-500" />
                <span>المساعد الذكي</span>
              </button>

              <button
                onClick={logoutUser}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="تسجيل الخروج والعودة للواجهة العامة"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            </div>
          )}

          {/* C. COURIER MENU */}
          {currentRole === 'COURIER' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenComplaintsDesk}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>الشكاوى والدعم الميداني</span>
              </button>

              <button
                onClick={onOpenAiChat}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-amber-500" />
                <span>مساعد المندوب</span>
              </button>

              <button
                onClick={logoutUser}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>
          )}

          {/* D. ADMIN / MANAGEMENT MENU */}
          {(currentRole === 'ADMIN' || currentRole === 'OPERATIONS' || currentRole === 'ACCOUNTANT') && (
            <div className="flex items-center gap-2">
              {/* Onion Rings Architecture Toggle for Admin */}
              <button
                onClick={onToggleOnionView}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  showOnionView
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
                title="عرض وتصفح نموذج دوائر البصلة الأمنية متحدة المركز"
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">دوائر البصلة الأمنية</span>
                <span className="sm:hidden">الدوائر</span>
              </button>

              {/* Zero-Corruption Shield Shortcut for Admin */}
              <button
                onClick={() => onSelectAdminTab && onSelectAdminTab('FRAUD_SHIELD')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-900 text-amber-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-700"
                title="درع النزاهة ومكافحة الفساد الإداري"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">درع النزاهة ومكافحة الفساد</span>
                <span className="md:hidden">درع النزاهة</span>
                {pendingAnomaliesCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingAnomaliesCount}
                  </span>
                )}
              </button>

              {/* OWNER LAYER SIMULATION DROPDOWN (خاص بصاحب الموقع لاختبار تجربة أي طبقة) */}
              <div className="relative">
                <button
                  onClick={() => setIsOwnerMenuOpen(!isOwnerMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="محاكاة تجربة الطبقات (خاص بصاحب الموقع)"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden lg:inline">معاينة الطبقات</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isOwnerMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-100 text-slate-500 font-bold text-[10px]">
                      بصفتك صاحب الموقع: عاين تجربة كل طبقة
                    </div>

                    <button
                      onClick={() => {
                        setCurrentRole('MERCHANT');
                        setIsOwnerMenuOpen(false);
                      }}
                      className="w-full text-right px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-800 cursor-pointer"
                    >
                      <span>معاينة طبقة: التاجر</span>
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setCurrentRole('COURIER');
                        setIsOwnerMenuOpen(false);
                      }}
                      className="w-full text-right px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-800 cursor-pointer"
                    >
                      <span>معاينة طبقة: المندوب الميداني</span>
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setCurrentRole('CUSTOMER');
                        setIsOwnerMenuOpen(false);
                      }}
                      className="w-full text-right px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-800 cursor-pointer"
                    >
                      <span>معاينة طبقة: الزائر العام</span>
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Unified Auth Modal Button for Admin */}
              <button
                onClick={onOpenAuthModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>الحسابات</span>
              </button>

              <button
                onClick={onOpenAiChat}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-amber-500" />
                <span className="hidden md:inline">مساعد مشاوير</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
