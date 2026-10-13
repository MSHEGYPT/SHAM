import React, { useState } from 'react';
import { LogisticsProvider, useLogistics } from './context/LogisticsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { StaffManagement } from './components/StaffManagement';
import { ShipmentsManager } from './components/ShipmentsManager';
import { PickupScheduler } from './components/PickupScheduler';
import { ZeroCorruptionShield } from './components/ZeroCorruptionShield';
import { OperationsAgenda } from './components/OperationsAgenda';
import { FinancialSettlements } from './components/FinancialSettlements';
import { CourierAppView } from './components/CourierAppView';
import { MerchantPortalView } from './components/MerchantPortalView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AiOrderParserModal } from './components/AiOrderParserModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { UnifiedAuthModal } from './components/UnifiedAuthModal';
import { OnionRingNavigator } from './components/OnionRingNavigator';
import { StaffOnboardingAndSupervisionRing } from './components/StaffOnboardingAndSupervisionRing';
import { WorkerTasksAndProfileRing } from './components/WorkerTasksAndProfileRing';
import { SmartComplaintsAiDesk } from './components/SmartComplaintsAiDesk';
import {
  Package,
  Users,
  Calendar,
  ShieldAlert,
  CalendarCheck,
  Coins,
  Bot,
  Truck,
  Building2,
  Sparkles,
  Layers,
  UserCheck,
  ClipboardList,
  Crown,
  Home,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentRole, agenda, fraudAnomalies, onboardingApplications } = useLogistics();

  // Admin / Operations internal tabs
  const [adminActiveTab, setAdminActiveTab] = useState<
    | 'SHIPMENTS'
    | 'ONBOARDING_SUPERVISION'
    | 'WORKER_OPERATIONS'
    | 'AGENDA'
    | 'FRAUD_SHIELD'
    | 'STAFF'
    | 'PICKUPS'
    | 'FINANCE'
  >('SHIPMENTS');

  // Modals state
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isOrderParserOpen, setIsOrderParserOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isComplaintsDeskOpen, setIsComplaintsDeskOpen] = useState(false);
  const [showOnionView, setShowOnionView] = useState(false);

  const { setCurrentRole, currentUser } = useLogistics();

  const pendingAnomaliesCount = fraudAnomalies.filter((a) => a.status === 'PENDING_INVESTIGATION').length;
  const newAgendaCount = agenda.filter((t) => t.status === 'NEW').length;
  const pendingOnboardingCount = onboardingApplications.filter((a) => a.status === 'PENDING_AUDIT').length;

  const isOwnerPreviewing = currentUser.assignedRingLevel === 1 && currentRole !== 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Global Header */}
      <Header
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenOrderParser={() => setIsOrderParserOpen(true)}
        onOpenTracking={() => setIsTrackingModalOpen(true)}
        onOpenNewPickup={() => setAdminActiveTab('PICKUPS')}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenComplaintsDesk={() => setIsComplaintsDeskOpen(true)}
        onToggleOnionView={() => setShowOnionView(!showOnionView)}
        showOnionView={showOnionView}
        onSelectAdminTab={(tab) => setAdminActiveTab(tab as any)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Owner Layer Simulation Alert Bar */}
        {isOwnerPreviewing && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-sm font-bold text-xs border border-amber-600">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-slate-950 text-amber-400">
                <Crown className="w-4 h-4" />
              </span>
              <span>
                أنت في "نمط معاينة تجربة الطبقة: (
                {currentRole === 'MERCHANT' ? 'التاجر' : currentRole === 'COURIER' ? 'المندوب الميداني' : 'الزائر العام'}
                )" بصفتك صاحب المنظومة والمدير العام. لن يرى أصحاب هذه الطبقة أية أدوات إدارية.
              </span>
            </div>

            <button
              onClick={() => setCurrentRole('ADMIN')}
              className="px-3 py-1 bg-slate-950 text-white hover:bg-slate-900 rounded-xl text-xs transition-colors cursor-pointer"
            >
              العودة للوحة الإدارة العامة الكاملة
            </button>
          </div>
        )}

        {/* Onion Ring Security Architecture Visualizer (can be toggled from header) */}
        {showOnionView && (
          <div className="animate-in fade-in slide-in-from-top-3">
            <OnionRingNavigator
              onSelectRing={(level) => {
                if (level === 2) setAdminActiveTab('ONBOARDING_SUPERVISION');
                else if (level === 4) setAdminActiveTab('WORKER_OPERATIONS');
                else if (level === 3) setAdminActiveTab('FINANCE');
              }}
            />
          </div>
        )}

        {/* VIEW 1: Public Landing Page & Tracking */}
        {currentRole === 'CUSTOMER' && (
          <LandingPage
            onOpenAiChat={() => setIsAiChatOpen(true)}
            onOpenOrderParser={() => setIsOrderParserOpen(true)}
            onOpenComplaintsDesk={() => setIsComplaintsDeskOpen(true)}
          />
        )}

        {/* VIEW 2: Courier Field View & Tasks */}
        {currentRole === 'COURIER' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-sm text-slate-900">
                  دائرة العمليات الميدانية للمندوب والعامل
                </span>
              </div>
              <span className="text-xs bg-purple-50 text-purple-800 font-bold px-3 py-1 rounded-full border border-purple-200">
                الدائرة الأمنية #4
              </span>
            </div>
            <WorkerTasksAndProfileRing />
            <div className="pt-6 border-t border-slate-200">
              <CourierAppView />
            </div>
          </div>
        )}

        {/* VIEW 3: Merchant Portal View */}
        {currentRole === 'MERCHANT' && (
          <MerchantPortalView
            onOpenOrderParser={() => setIsOrderParserOpen(true)}
            onOpenNewPickup={() => setIsAiChatOpen(true)}
          />
        )}

        {/* VIEW 4: Operations & HQ (Admin / Supervisor / Accountant) */}
        {(currentRole === 'ADMIN' ||
          currentRole === 'OPERATIONS' ||
          currentRole === 'ACCOUNTANT') && (
          <div className="space-y-6">
            {/* Admin Internal Sub-nav Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => {
                  setCurrentRole('CUSTOMER');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-xs"
                title="الانتقال إلى الصفحة الرئيسية العامة (واجهة مشاوير للزوار والتجار)"
              >
                <Home className="w-4 h-4 text-amber-700" />
                <span>الصفحة الرئيسية</span>
              </button>

              <button
                onClick={() => setAdminActiveTab('SHIPMENTS')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminActiveTab === 'SHIPMENTS'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>الشحنات والاستلامات والمرتجعات</span>
              </button>

              <button
                onClick={() => setAdminActiveTab('ONBOARDING_SUPERVISION')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminActiveTab === 'ONBOARDING_SUPERVISION'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>الدائرة الإدارية: تسجيل العاملين والرقابة</span>
                {pendingOnboardingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingOnboardingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminActiveTab('WORKER_OPERATIONS')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminActiveTab === 'WORKER_OPERATIONS'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-purple-400" />
                <span>دائرة العاملين: مهام الأعمال والبيانات</span>
              </button>

              <button
                onClick={() => setAdminActiveTab('AGENDA')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminActiveTab === 'AGENDA'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                <span>جدول الأعمال والأرشفة الذكية</span>
                {newAgendaCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {newAgendaCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminActiveTab('FRAUD_SHIELD')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminActiveTab === 'FRAUD_SHIELD'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>درع النزاهة ومكافحة الفساد</span>
                {pendingAnomaliesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                    {pendingAnomaliesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminActiveTab('STAFF')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminActiveTab === 'STAFF'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>الهيكل التنظيمي وكادر الشركة</span>
              </button>

              <button
                onClick={() => setAdminActiveTab('PICKUPS')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminActiveTab === 'PICKUPS'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>جدولة الاستلام من المتاجر</span>
              </button>

              <button
                onClick={() => setAdminActiveTab('FINANCE')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminActiveTab === 'FINANCE'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>الخزينة والتسويات المالية</span>
              </button>
            </div>

            {/* Sub-view Content */}
            {adminActiveTab === 'SHIPMENTS' && <ShipmentsManager />}
            {adminActiveTab === 'ONBOARDING_SUPERVISION' && <StaffOnboardingAndSupervisionRing />}
            {adminActiveTab === 'WORKER_OPERATIONS' && <WorkerTasksAndProfileRing />}
            {adminActiveTab === 'AGENDA' && <OperationsAgenda />}
            {adminActiveTab === 'FRAUD_SHIELD' && <ZeroCorruptionShield />}
            {adminActiveTab === 'STAFF' && <StaffManagement />}
            {adminActiveTab === 'PICKUPS' && <PickupScheduler />}
            {adminActiveTab === 'FINANCE' && <FinancialSettlements />}
          </div>
        )}
      </main>

      {/* Floating AI Assistant Trigger Button (Bottom Right) */}
      <button
        onClick={() => setIsAiChatOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-slate-900 hover:bg-slate-800 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 transition-all hover:scale-105 cursor-pointer group"
        title="المساعد الذكي للرد على العملاء والتجار وأرشفة الطلبات"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-amber-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping"></span>
        </div>
        <span className="hidden sm:inline text-xs font-bold">مساعد مشاوير الذكي</span>
      </button>

      {/* Modals */}
      <UnifiedAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AiAssistantModal isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} />
      <AiOrderParserModal isOpen={isOrderParserOpen} onClose={() => setIsOrderParserOpen(false)} />
      <OrderTrackingModal isOpen={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} />
      {isComplaintsDeskOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <SmartComplaintsAiDesk
            isModal={true}
            onClose={() => setIsComplaintsDeskOpen(false)}
          />
        </div>
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <LogisticsProvider>
      <MainContent />
    </LogisticsProvider>
  );
}
