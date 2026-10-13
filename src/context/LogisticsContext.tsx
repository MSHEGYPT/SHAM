import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StaffMember,
  Shipment,
  PickupSchedule,
  AgendaTask,
  FraudAnomaly,
  WhistleblowerReport,
  Merchant,
  ShipmentStatus,
  UserRole,
  OnionRingLevel,
  AuthUser,
  WorkerTask,
  OnboardingApplication,
  FulfillmentItem,
  PayoutTransaction,
  GovernorateCoverage,
} from '../types';
import {
  INITIAL_STAFF,
  INITIAL_MERCHANTS,
  INITIAL_SHIPMENTS,
  INITIAL_PICKUPS,
  INITIAL_AGENDA,
  INITIAL_FRAUD_ANOMALIES,
  INITIAL_WHISTLEBLOWER_REPORTS,
  INITIAL_WORKER_TASKS,
  INITIAL_ONBOARDING_APPLICATIONS,
  ONION_RINGS_CONFIG,
  EGYPT_GOVERNORATES_COVERAGE,
  INITIAL_FULFILLMENT_ITEMS,
  INITIAL_PAYOUT_TRANSACTIONS,
} from '../data/initialData';

interface LogisticsContextType {
  // Authentication & Onion Rings
  currentUser: AuthUser;
  currentRingLevel: OnionRingLevel;
  setCurrentRingLevel: (level: OnionRingLevel) => void;
  loginUser: (identifier: string, role: UserRole | string) => Promise<{ success: boolean; aiAudit?: any }>;
  registerUser: (formData: any) => Promise<{ success: boolean; aiAudit?: any; message: string }>;
  logoutUser: () => void;
  quickSwitchUser: (presetId: 'OWNER' | 'SUPERVISOR' | 'ACCOUNTANT' | 'COURIER' | 'MERCHANT' | 'CUSTOMER') => void;

  // Active Role and Persona
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeCourierId: string;
  setActiveCourierId: (id: string) => void;
  activeMerchantId: string;
  setActiveMerchantId: (id: string) => void;

  // Data
  staff: StaffMember[];
  merchants: Merchant[];
  shipments: Shipment[];
  pickups: PickupSchedule[];
  agenda: AgendaTask[];
  fraudAnomalies: FraudAnomaly[];
  whistleblowerReports: WhistleblowerReport[];
  workerTasks: WorkerTask[];
  onboardingApplications: OnboardingApplication[];

  // Bosta-Inspired Capabilities: Fulfillment, Next-Day Payouts, Governorates Coverage
  fulfillmentItems: FulfillmentItem[];
  payoutTransactions: PayoutTransaction[];
  governoratesCoverage: GovernorateCoverage[];
  requestMerchantPayout: (
    merchantId: string,
    amount: number,
    method: 'INSTAPAY' | 'BANK_TRANSFER' | 'FAWRY' | 'WALLET',
    accountDetails: string
  ) => { success: boolean; message: string; transaction?: PayoutTransaction };

  // Onion Rings Operations
  addWorkerTask: (task: Omit<WorkerTask, 'id'>) => WorkerTask;
  updateWorkerTaskStatus: (id: string, status: WorkerTask['status']) => void;
  submitOnboardingApplication: (app: Omit<OnboardingApplication, 'id' | 'submittedAt' | 'status' | 'aiClearanceScore' | 'aiClearanceReport'>) => Promise<OnboardingApplication>;
  approveOnboardingApplication: (id: string, reviewerNotes?: string) => void;
  rejectOnboardingApplication: (id: string, reviewerNotes?: string) => void;

  // Actions
  addStaffMember: (data: Omit<StaffMember, 'id' | 'totalDelivered' | 'successRate' | 'rating' | 'fraudAlertsCount' | 'ringLevel'> & { ringLevel?: OnionRingLevel }) => void;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void;
  toggleStaffStatus: (id: string) => void;

  addShipment: (data: {
    merchantId: string;
    merchantName: string;
    merchantPhone: string;
    recipientName: string;
    recipientPhone: string;
    recipientPhoneAlt?: string;
    city: string;
    district: string;
    address: string;
    itemsDescription: string;
    itemQuantity: number;
    codAmount: number;
    shippingFee: number;
    assignedCourierId?: string;
    scheduledPickupDate?: string;
    orderType?: 'STANDARD' | 'EXCHANGE' | 'RETURN';
    allowInspection?: boolean;
    exchangeDetails?: string;
  }) => Shipment;

  verifyAndDeliverShipment: (
    trackingNumber: string,
    otpCode: string,
    collectedAmount: number,
    courierName: string,
    courierId: string
  ) => { success: boolean; message: string };

  recordReturnOrPartial: (
    trackingNumber: string,
    type: 'PARTIAL_DELIVERY' | 'RETURN_PENDING' | 'RETURNED_TO_MERCHANT',
    reason: string,
    notes: string,
    actorName: string,
    partialAmount?: number
  ) => void;

  assignShipmentCourier: (trackingNumber: string, courierId: string) => void;

  addPickupSchedule: (data: Omit<PickupSchedule, 'id'>) => void;
  updatePickupStatus: (id: string, status: PickupSchedule['status'], actualCount?: number) => void;

  addAgendaTask: (task: Omit<AgendaTask, 'id' | 'createdAt'>) => AgendaTask;
  updateAgendaStatus: (id: string, status: AgendaTask['status']) => void;

  addWhistleblowerReport: (report: Omit<WhistleblowerReport, 'id' | 'timestamp' | 'status'>) => void;

  recordCashDeposit: (courierId: string, amount: number) => { success: boolean; message: string };

  runAiFraudAudit: () => Promise<any>;

  getShipmentByTracking: (trackingNumber: string) => Shipment | undefined;
  resetToDemoData: () => void;
}

const DEFAULT_OWNER_USER: AuthUser = {
  id: 'USR-ROOT-01',
  name: 'م. طارق العسقلاني (صاحب المنظومة والمدير العام)',
  role: 'ADMIN',
  emailOrPhone: '01011122334',
  nationalId: '28905141203491',
  department: 'الإدارة العليا المركزية',
  assignedRingLevel: 1, // النواة
  ringName: 'الدائرة الأولى (نواة المنظومة - المدير العام وصاحب الموقع)',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  joinedDate: '2023-01-15',
};

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent storage helper
  const loadStorage = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`sanad_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  // Auth & Onion Ring Level
  const [currentUser, setCurrentUser] = useState<AuthUser>(() =>
    loadStorage('current_user', DEFAULT_OWNER_USER)
  );
  const [currentRingLevel, setCurrentRingLevel] = useState<OnionRingLevel>(
    currentUser.assignedRingLevel || 1
  );

  // Active Role and Personas
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [activeCourierId, setActiveCourierId] = useState<string>('STF-04');
  const [activeMerchantId, setActiveMerchantId] = useState<string>('MCH-101');

  // Core Data
  const [staff, setStaff] = useState<StaffMember[]>(() => loadStorage('staff', INITIAL_STAFF));
  const [merchants, setMerchants] = useState<Merchant[]>(() => loadStorage('merchants', INITIAL_MERCHANTS));
  const [shipments, setShipments] = useState<Shipment[]>(() => loadStorage('shipments', INITIAL_SHIPMENTS));
  const [pickups, setPickups] = useState<PickupSchedule[]>(() => loadStorage('pickups', INITIAL_PICKUPS));
  const [agenda, setAgenda] = useState<AgendaTask[]>(() => loadStorage('agenda', INITIAL_AGENDA));
  const [fraudAnomalies, setFraudAnomalies] = useState<FraudAnomaly[]>(() =>
    loadStorage('fraud', INITIAL_FRAUD_ANOMALIES)
  );
  const [whistleblowerReports, setWhistleblowerReports] = useState<WhistleblowerReport[]>(() =>
    loadStorage('whistleblower', INITIAL_WHISTLEBLOWER_REPORTS)
  );
  const [workerTasks, setWorkerTasks] = useState<WorkerTask[]>(() =>
    loadStorage('worker_tasks', INITIAL_WORKER_TASKS)
  );
  const [onboardingApplications, setOnboardingApplications] = useState<OnboardingApplication[]>(() =>
    loadStorage('onboarding_apps', INITIAL_ONBOARDING_APPLICATIONS)
  );

  // Bosta-Inspired Capabilities State
  const [fulfillmentItems, setFulfillmentItems] = useState<FulfillmentItem[]>(() =>
    loadStorage('fulfillment_items', INITIAL_FULFILLMENT_ITEMS)
  );
  const [payoutTransactions, setPayoutTransactions] = useState<PayoutTransaction[]>(() =>
    loadStorage('payout_transactions', INITIAL_PAYOUT_TRANSACTIONS)
  );
  const [governoratesCoverage] = useState<GovernorateCoverage[]>(EGYPT_GOVERNORATES_COVERAGE);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('sanad_current_user', JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('sanad_staff', JSON.stringify(staff));
  }, [staff]);
  useEffect(() => {
    localStorage.setItem('sanad_merchants', JSON.stringify(merchants));
  }, [merchants]);
  useEffect(() => {
    localStorage.setItem('sanad_shipments', JSON.stringify(shipments));
  }, [shipments]);
  useEffect(() => {
    localStorage.setItem('sanad_pickups', JSON.stringify(pickups));
  }, [pickups]);
  useEffect(() => {
    localStorage.setItem('sanad_agenda', JSON.stringify(agenda));
  }, [agenda]);
  useEffect(() => {
    localStorage.setItem('sanad_fraud', JSON.stringify(fraudAnomalies));
  }, [fraudAnomalies]);
  useEffect(() => {
    localStorage.setItem('sanad_whistleblower', JSON.stringify(whistleblowerReports));
  }, [whistleblowerReports]);
  useEffect(() => {
    localStorage.setItem('sanad_worker_tasks', JSON.stringify(workerTasks));
  }, [workerTasks]);
  useEffect(() => {
    localStorage.setItem('sanad_onboarding_apps', JSON.stringify(onboardingApplications));
  }, [onboardingApplications]);
  useEffect(() => {
    localStorage.setItem('sanad_fulfillment_items', JSON.stringify(fulfillmentItems));
  }, [fulfillmentItems]);
  useEffect(() => {
    localStorage.setItem('sanad_payout_transactions', JSON.stringify(payoutTransactions));
  }, [payoutTransactions]);

  const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

  // Unified Login with AI Security verification
  const loginUser = async (identifier: string, roleRequested: UserRole | string) => {
    let targetUser: AuthUser = { ...DEFAULT_OWNER_USER };
    let ring: OnionRingLevel = 1;

    if (roleRequested === 'ADMIN' || roleRequested === 'GENERAL_MANAGER') {
      targetUser = { ...DEFAULT_OWNER_USER };
      ring = 1;
      setCurrentRole('ADMIN');
    } else if (roleRequested === 'OPERATIONS_SUPERVISOR' || roleRequested === 'OPERATIONS') {
      const s = staff.find((x) => x.role === 'OPERATIONS_SUPERVISOR') || staff[1];
      targetUser = {
        id: s.id,
        name: s.name,
        role: 'OPERATIONS',
        emailOrPhone: s.phone,
        nationalId: s.nationalId,
        department: s.department,
        assignedRingLevel: 2,
        ringName: 'الدائرة الإدارية والرقابية (المشرفون)',
        avatar: s.avatar,
        joinedDate: s.joinedDate,
      };
      ring = 2;
      setCurrentRole('OPERATIONS');
    } else if (roleRequested === 'ACCOUNTANT') {
      const s = staff.find((x) => x.role === 'ACCOUNTANT') || staff[2];
      targetUser = {
        id: s.id,
        name: s.name,
        role: 'ACCOUNTANT',
        emailOrPhone: s.phone,
        nationalId: s.nationalId,
        department: s.department,
        assignedRingLevel: 3,
        ringName: 'الدائرة المالية وتدقيق الخزينة',
        avatar: s.avatar,
        joinedDate: s.joinedDate,
      };
      ring = 3;
      setCurrentRole('ACCOUNTANT');
    } else if (roleRequested === 'COURIER') {
      const s = staff.find((x) => x.role === 'COURIER') || staff[3];
      targetUser = {
        id: s.id,
        name: s.name,
        role: 'COURIER',
        emailOrPhone: s.phone,
        nationalId: s.nationalId,
        department: s.department,
        assignedRingLevel: 4,
        ringName: 'دائرة العمليات الميدانية والمناديب',
        avatar: s.avatar,
        joinedDate: s.joinedDate,
        vehiclePlate: s.vehiclePlate,
      };
      ring = 4;
      setCurrentRole('COURIER');
      setActiveCourierId(s.id);
    } else if (roleRequested === 'MERCHANT') {
      const m = merchants[0];
      targetUser = {
        id: m.id,
        name: m.brandName || m.name,
        role: 'MERCHANT',
        emailOrPhone: m.phone,
        department: 'شبكة المتاجر المتعاقدة',
        assignedRingLevel: 5,
        ringName: 'الدائرة الخارجية (الشركاء والعملاء)',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        joinedDate: '2023-10-01',
      };
      ring = 5;
      setCurrentRole('MERCHANT');
      setActiveMerchantId(m.id);
    } else {
      targetUser = {
        id: 'USR-CUST-99',
        name: 'عميل المنصة (زائر وتتبع)',
        role: 'CUSTOMER',
        emailOrPhone: identifier || '01000000000',
        department: 'بوابة التتبع العامة',
        assignedRingLevel: 5,
        ringName: 'الدائرة الخارجية (الشركاء والعملاء)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      ring = 5;
      setCurrentRole('CUSTOMER');
    }

    setCurrentUser(targetUser);
    setCurrentRingLevel(ring);

    // Call AI access manager to log clearance
    let aiAudit = null;
    try {
      const res = await fetch('/api/ai/access-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LOGIN',
          userData: { name: targetUser.name, phone: targetUser.emailOrPhone, id: targetUser.id },
          requestedRole: roleRequested,
        }),
      });
      aiAudit = await res.json();
    } catch (e) {
      console.warn('AI Access audit fallback active', e);
    }

    return { success: true, aiAudit };
  };

  // Unified Registration with AI screening
  const registerUser = async (formData: any) => {
    const role = formData.role || 'COURIER';
    let assignedRing: OnionRingLevel = 4;
    if (role === 'GENERAL_MANAGER' || role === 'ADMIN') assignedRing = 1;
    else if (role === 'OPERATIONS_SUPERVISOR') assignedRing = 2;
    else if (role === 'ACCOUNTANT') assignedRing = 3;
    else if (role === 'MERCHANT' || role === 'CUSTOMER') assignedRing = 5;

    let aiAudit = null;
    try {
      const res = await fetch('/api/ai/access-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_ONBOARDING',
          userData: formData,
          requestedRole: role,
        }),
      });
      aiAudit = await res.json();
    } catch (e) {
      console.warn('AI Access audit fallback active', e);
    }

    // If it's a courier or field worker, create an Onboarding Application for supervisor approval
    if (role === 'COURIER' || role === 'DISPATCHER') {
      const newApp: OnboardingApplication = {
        id: `ONB-${Date.now().toString().slice(-4)}`,
        fullName: formData.fullName || formData.name,
        phone: formData.phone,
        nationalId: formData.nationalId || '29000000000000',
        desiredRole: role,
        assignedZone: formData.zone || 'القاهرة الكبرى',
        vehicleType: formData.vehicleType || 'MOTORCYCLE',
        vehiclePlate: formData.vehiclePlate || 'س ق ص 111',
        drivingLicenseNumber: formData.drivingLicense || 'DL-PENDING',
        criminalRecordStatus: 'CLEAN',
        emergencyContact: formData.emergencyPhone || '01000000000',
        aiClearanceScore: aiAudit?.accessGranted ? 95 : 85,
        aiClearanceReport: aiAudit?.aiSecurityAudit || 'تم الفحص المبدئي بنجاح بواسطة الذكاء الاصطناعي وجاري المراجعة الإدارية.',
        status: 'PENDING_AUDIT',
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      setOnboardingApplications((prev) => [newApp, ...prev]);

      // Add to agenda for supervisors!
      addAgendaTask({
        title: `طلب انضمام عامل جديد: ${newApp.fullName}`,
        source: 'WEB_FORM',
        clientName: newApp.fullName,
        clientPhone: newApp.phone,
        type: 'general',
        priority: 'high',
        status: 'NEW',
        summary: `متقدم لدور: ${newApp.desiredRole} في منطقة: ${newApp.assignedZone} - تقييم الذكاء الاصطناعي: ${newApp.aiClearanceScore}%`,
        suggestedAction: 'مراجعة الأوراق والرقم القومي في الدائرة الإدارية والاعتماد.',
      });

      return {
        success: true,
        aiAudit,
        message: 'تم تسجيل بياناتك بنجاح وإرسال ملفك إلى الدائرة الإدارية لتدقيق الأوراق واعتماد حسابك.',
      };
    }

    // If merchant, add merchant
    if (role === 'MERCHANT') {
      const newMerchant: Merchant = {
        id: `MCH-${Date.now().toString().slice(-3)}`,
        name: formData.fullName || formData.name,
        brandName: formData.brandName || formData.fullName,
        phone: formData.phone,
        city: formData.city || 'القاهرة',
        address: formData.address || 'العنوان الرئيسي',
        businessType: formData.businessType || 'متجر إلكتروني',
        activeShipmentsCount: 0,
        deliveredCount: 0,
        returnRate: 0,
        pendingBalance: 0,
        rating: 5.0,
      };
      setMerchants((prev) => [newMerchant, ...prev]);
    }

    return {
      success: true,
      aiAudit,
      message: 'تم إنشاء الحساب بنجاح وتعيين الدائرة الأمنية وفق الصلاحيات المحددة.',
    };
  };

  const logoutUser = () => {
    quickSwitchUser('CUSTOMER');
  };

  // Quick 1-click switcher between personas for demo/testing
  const quickSwitchUser = (presetId: 'OWNER' | 'SUPERVISOR' | 'ACCOUNTANT' | 'COURIER' | 'MERCHANT' | 'CUSTOMER') => {
    switch (presetId) {
      case 'OWNER':
        setCurrentUser(DEFAULT_OWNER_USER);
        setCurrentRingLevel(1);
        setCurrentRole('ADMIN');
        break;
      case 'SUPERVISOR':
        loginUser('01122334455', 'OPERATIONS_SUPERVISOR');
        break;
      case 'ACCOUNTANT':
        loginUser('01233445566', 'ACCOUNTANT');
        break;
      case 'COURIER':
        loginUser('01099887766', 'COURIER');
        break;
      case 'MERCHANT':
        loginUser('01022331199', 'MERCHANT');
        break;
      case 'CUSTOMER':
        loginUser('01000000000', 'CUSTOMER');
        break;
    }
  };

  // Worker Tasks Management
  const addWorkerTask = (taskData: Omit<WorkerTask, 'id'>) => {
    const newTask: WorkerTask = {
      ...taskData,
      id: `TSK-WRK-${Date.now().toString().slice(-4)}`,
    };
    setWorkerTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateWorkerTaskStatus = (id: string, status: WorkerTask['status']) => {
    setWorkerTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt: status === 'COMPLETED' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
            }
          : t
      )
    );
  };

  // Onboarding Applications
  const submitOnboardingApplication = async (
    appData: Omit<OnboardingApplication, 'id' | 'submittedAt' | 'status' | 'aiClearanceScore' | 'aiClearanceReport'>
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let clearanceScore = 94;
    let clearanceReport = 'اجتاز الفحص الأولي للذكاء الاصطناعي بنجاح: الرقم القومي غير مكرر بالسجلات، السجل خالي من المخالفات.';

    try {
      const res = await fetch('/api/ai/access-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ONBOARDING_APPLICATION_AUDIT',
          userData: appData,
          requestedRole: appData.desiredRole,
        }),
      });
      const data = await res.json();
      if (data.aiSecurityAudit) clearanceReport = data.aiSecurityAudit;
    } catch (e) {
      console.warn(e);
    }

    const newApp: OnboardingApplication = {
      ...appData,
      id: `ONB-${Date.now().toString().slice(-4)}`,
      submittedAt: now,
      status: 'PENDING_AUDIT',
      aiClearanceScore: clearanceScore,
      aiClearanceReport: clearanceReport,
    };

    setOnboardingApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  const approveOnboardingApplication = (id: string, reviewerNotes?: string) => {
    const app = onboardingApplications.find((a) => a.id === id);
    if (!app) return;

    setOnboardingApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'APPROVED',
              reviewedBy: currentUser.name,
              reviewNotes: reviewerNotes || 'تم الاعتماد وإصدار بطاقة الهوية الرقمية بالدائرة الميدانية.',
            }
          : a
      )
    );

    // Automatically add to staff list!
    addStaffMember({
      name: app.fullName,
      role: app.desiredRole,
      phone: app.phone,
      nationalId: app.nationalId,
      department: app.desiredRole === 'COURIER' ? 'أسطول التوصيل الميداني' : 'إدارة العمليات',
      assignedZone: app.assignedZone,
      status: 'ACTIVE',
      vehicleType: app.vehicleType,
      vehiclePlate: app.vehiclePlate,
      currentCashHeld: 0,
      maxCashLimit: 3000,
      joinedDate: new Date().toISOString().slice(0, 10),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      ringLevel: 4,
    });
  };

  const rejectOnboardingApplication = (id: string, reviewerNotes?: string) => {
    setOnboardingApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'REJECTED',
              reviewedBy: currentUser.name,
              reviewNotes: reviewerNotes || 'تم الرفض لعدم استيفاء الشروط أو نقص المستندات.',
            }
          : a
      )
    );
  };

  // Staff Management
  const addStaffMember = (data: Omit<StaffMember, 'id' | 'totalDelivered' | 'successRate' | 'rating' | 'fraudAlertsCount' | 'ringLevel'> & { ringLevel?: OnionRingLevel }) => {
    let assignedRing: OnionRingLevel = data.ringLevel || 4;
    if (data.role === 'GENERAL_MANAGER') assignedRing = 1;
    else if (data.role === 'OPERATIONS_SUPERVISOR' || data.role === 'CUSTOMER_CARE') assignedRing = 2;
    else if (data.role === 'ACCOUNTANT') assignedRing = 3;

    const newStaff: StaffMember = {
      ...data,
      id: `STF-0${staff.length + 1}`,
      totalDelivered: 0,
      successRate: 100,
      rating: 5.0,
      fraudAlertsCount: 0,
      ringLevel: assignedRing,
    };
    setStaff((prev) => [newStaff, ...prev]);
  };

  const updateStaffMember = (id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const toggleStaffStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  // Shipment Actions
  const addShipment = (data: {
    merchantId: string;
    merchantName: string;
    merchantPhone: string;
    recipientName: string;
    recipientPhone: string;
    recipientPhoneAlt?: string;
    city: string;
    district: string;
    address: string;
    itemsDescription: string;
    itemQuantity: number;
    codAmount: number;
    shippingFee: number;
    assignedCourierId?: string;
    scheduledPickupDate?: string;
    orderType?: 'STANDARD' | 'EXCHANGE' | 'RETURN';
    allowInspection?: boolean;
    exchangeDetails?: string;
  }) => {
    const trackingSeq = Math.floor(8000 + Math.random() * 1900);
    const trackingNumber = `SND-${trackingSeq}`;
    const otpSecret = generateOtp();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    let assignedCourierName = '';
    if (data.assignedCourierId) {
      const c = staff.find((s) => s.id === data.assignedCourierId);
      if (c) assignedCourierName = c.name;
    }

    const newShipment: Shipment = {
      id: `SHP-${Date.now().toString().slice(-4)}`,
      trackingNumber,
      merchantId: data.merchantId,
      merchantName: data.merchantName,
      merchantPhone: data.merchantPhone,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      recipientPhoneAlt: data.recipientPhoneAlt,
      city: data.city,
      district: data.district,
      address: data.address,
      itemsDescription: data.itemsDescription,
      itemQuantity: data.itemQuantity,
      codAmount: data.codAmount,
      shippingFee: data.shippingFee,
      merchantShare: data.codAmount - data.shippingFee,
      status: data.assignedCourierId ? 'OUT_FOR_DELIVERY' : 'PENDING_PICKUP',
      otpSecret,
      assignedCourierId: data.assignedCourierId,
      assignedCourierName,
      scheduledPickupDate: data.scheduledPickupDate || now.slice(0, 10),
      orderType: data.orderType || 'STANDARD',
      allowInspection: data.allowInspection ?? true,
      exchangeDetails: data.exchangeDetails,
      createdAt: now,
      timeline: [
        {
          id: `EVT-${Date.now()}`,
          timestamp: now,
          status: 'PENDING_PICKUP',
          actorName: data.merchantName,
          actorRole: 'التاجر',
          notes: `تم إنشاء الشحنة بنجاح برقم تتبع ${trackingNumber}. ${data.orderType === 'EXCHANGE' ? 'طلب استبدال فوري.' : ''} ${data.allowInspection ? 'مسموح بالمعاينة.' : 'غير مسموح بالمعاينة.'}`,
        },
      ],
    };

    setShipments((prev) => [newShipment, ...prev]);

    // Update merchant active count
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === data.merchantId ? { ...m, activeShipmentsCount: m.activeShipmentsCount + 1 } : m
      )
    );

    // Also automatically create a task for the assigned courier in their ring!
    if (data.assignedCourierId) {
      addWorkerTask({
        title: `توصيل طرد ${trackingNumber} إلى ${data.recipientName} ${data.orderType === 'EXCHANGE' ? '(استبدال فوري)' : ''}`,
        taskType: 'DELIVERY_DISPATCH',
        assignedCourierId: data.assignedCourierId,
        assignedCourierName,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: data.scheduledPickupDate || now.slice(0, 10),
        timeWindow: 'خلال اليوم',
        location: `${data.city} - ${data.district}`,
        relatedShipmentTracking: trackingNumber,
        expectedCod: data.codAmount,
        notes: `محتويات: ${data.itemsDescription} ${data.allowInspection ? '| المعاينة مسموحة' : ''}`,
      });
    }

    return newShipment;
  };

  // Bosta-Inspired Next-Day COD Payout Request
  const requestMerchantPayout = (
    merchantId: string,
    amount: number,
    method: 'INSTAPAY' | 'BANK_TRANSFER' | 'FAWRY' | 'WALLET',
    accountDetails: string
  ) => {
    const merchant = merchants.find((m) => m.id === merchantId) || merchants[0];
    const prefix = method === 'INSTAPAY' ? 'IPN' : method === 'FAWRY' ? 'FWR' : 'BNK';
    const referenceNumber = `${prefix}-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newTx: PayoutTransaction = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      merchantId,
      merchantName: merchant.brandName || merchant.name,
      amount,
      method,
      referenceNumber,
      status: 'COMPLETED',
      accountDetails,
      createdAt: now,
    };

    setPayoutTransactions((prev) => [newTx, ...prev]);

    // Add to agenda for operations & finance records
    addAgendaTask({
      title: `تحويل مستحقات تاجر فوري: ${merchant.brandName} (${amount} ج.م)`,
      source: 'MERCHANT_APP',
      clientName: merchant.brandName,
      clientPhone: merchant.phone,
      type: 'general',
      priority: 'high',
      status: 'RESOLVED',
      summary: `تم التحويل عبر ${method} للحساب: ${accountDetails} برقم مرجعي: ${referenceNumber}`,
      suggestedAction: 'تقييد العملية في ميزان المراجعة اليومي.',
    });

    return {
      success: true,
      message: `تم تحويل مبلغ ${amount.toLocaleString('ar-EG')} ج.م بنجاح إلى حساب ${accountDetails} عبر ${method} (رقم مرجعي: ${referenceNumber}).`,
      transaction: newTx,
    };
  };

  const verifyAndDeliverShipment = (
    trackingNumber: string,
    otpCode: string,
    collectedAmount: number,
    courierName: string,
    courierId: string
  ): { success: boolean; message: string } => {
    const shipment = shipments.find((s) => s.trackingNumber === trackingNumber);
    if (!shipment) {
      return { success: false, message: 'الشحنة غير موجودة' };
    }

    // Anti-fraud check: Validate OTP
    if (shipment.otpSecret.trim() !== otpCode.trim()) {
      const anomaly: FraudAnomaly = {
        id: `ANOM-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        type: 'OTP_BYPASS_ATTEMPT',
        severity: 'CRITICAL',
        employeeName: courierName,
        employeeId: courierId,
        shipmentTracking: trackingNumber,
        description: `محاولة تأكيد تسليم خاطئة برمز أمان غير متطابق (أُدخل: ${otpCode}، الصحيح: ${shipment.otpSecret}). حظر النظام العملية لمنع الادعاء الوهمي بالتسليم.`,
        evidence: `فشل مطابقة الرمز السري لشحنة بقيمة ${shipment.codAmount} ج.م للعميل ${shipment.recipientName}`,
        status: 'PENDING_INVESTIGATION',
      };
      setFraudAnomalies((prev) => [anomaly, ...prev]);

      setStaff((prev) =>
        prev.map((s) => (s.id === courierId ? { ...s, fraudAlertsCount: s.fraudAlertsCount + 1 } : s))
      );

      return {
        success: false,
        message: 'عفواً! رمز الأمان (OTP) غير صحيح! لا يمكن تأكيد التسليم إلا بالرمز السري المستلم لدى العميل لمنع التلاعب.',
      };
    }

    // Anti-fraud check: Check price discrepancy
    if (collectedAmount !== shipment.codAmount) {
      const diffAnomaly: FraudAnomaly = {
        id: `ANOM-${Date.now()}-DIFF`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        type: 'PRICE_TAMPERING',
        severity: 'HIGH',
        employeeName: courierName,
        employeeId: courierId,
        shipmentTracking: trackingNumber,
        description: `فارق في المبلغ المحصل: الفاتورة مسجلة بقيمة ${shipment.codAmount} ج.م بينما تم تحصيل ${collectedAmount} ج.م من العميل.`,
        evidence: `فرق مالي قدره ${collectedAmount - shipment.codAmount} ج.م`,
        status: 'PENDING_INVESTIGATION',
      };
      setFraudAnomalies((prev) => [diffAnomaly, ...prev]);
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Update shipment
    setShipments((prev) =>
      prev.map((s) => {
        if (s.trackingNumber === trackingNumber) {
          return {
            ...s,
            status: 'DELIVERED',
            collectedAmount,
            deliveredAt: now,
            timeline: [
              ...s.timeline,
              {
                id: `EVT-${Date.now()}`,
                timestamp: now,
                status: 'DELIVERED',
                actorName: courierName,
                actorRole: 'المندوب',
                notes: `تم التحقق بنجاح من رمز الأمان OTP (${otpCode}) وتسليم الطرد للعميل وتحصيل مبلغ ${collectedAmount} ج.م نقداً.`,
                otpVerified: true,
                collectedAmount,
              },
            ],
          };
        }
        return s;
      })
    );

    // Update courier cash-on-hand
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === courierId) {
          const newCash = s.currentCashHeld + collectedAmount;
          return {
            ...s,
            currentCashHeld: newCash,
            totalDelivered: s.totalDelivered + 1,
          };
        }
        return s;
      })
    );

    // Update worker task
    setWorkerTasks((prev) =>
      prev.map((t) =>
        t.relatedShipmentTracking === trackingNumber
          ? { ...t, status: 'COMPLETED', completedAt: now }
          : t
      )
    );

    // Update merchant pending balance & delivered stats
    setMerchants((prev) =>
      prev.map((m) => {
        if (m.id === shipment.merchantId) {
          const merchantNet = collectedAmount - shipment.shippingFee;
          return {
            ...m,
            deliveredCount: m.deliveredCount + 1,
            activeShipmentsCount: Math.max(0, m.activeShipmentsCount - 1),
            pendingBalance: m.pendingBalance + merchantNet,
          };
        }
        return m;
      })
    );

    return { success: true, message: 'تم تأكيد التسليم بنجاح وتحديث العهدة النقدية ومستحقات التاجر.' };
  };

  const recordReturnOrPartial = (
    trackingNumber: string,
    type: 'PARTIAL_DELIVERY' | 'RETURN_PENDING' | 'RETURNED_TO_MERCHANT',
    reason: string,
    notes: string,
    actorName: string,
    partialAmount: number = 0
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setShipments((prev) =>
      prev.map((s) => {
        if (s.trackingNumber === trackingNumber) {
          return {
            ...s,
            status: type,
            returnReason: reason,
            returnNotes: notes,
            collectedAmount: partialAmount,
            timeline: [
              ...s.timeline,
              {
                id: `EVT-${Date.now()}`,
                timestamp: now,
                status: type,
                actorName,
                actorRole: 'العمليات / المندوب',
                notes: `تسجيل حالة ${type === 'PARTIAL_DELIVERY' ? 'تسليم جزئي' : 'مرتجع'}: ${reason}. ${notes}`,
                collectedAmount: partialAmount,
              },
            ],
          };
        }
        return s;
      })
    );
  };

  const assignShipmentCourier = (trackingNumber: string, courierId: string) => {
    const courier = staff.find((s) => s.id === courierId);
    if (!courier) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setShipments((prev) =>
      prev.map((s) => {
        if (s.trackingNumber === trackingNumber) {
          return {
            ...s,
            assignedCourierId: courierId,
            assignedCourierName: courier.name,
            status: 'OUT_FOR_DELIVERY',
            timeline: [
              ...s.timeline,
              {
                id: `EVT-${Date.now()}`,
                timestamp: now,
                status: 'OUT_FOR_DELIVERY',
                actorName: 'مشرف التوزيع',
                actorRole: 'العمليات',
                notes: `تم إسناد الشحنة للكابتن ${courier.name} وتغيير الحالة إلى "مع المندوب للتوزيع".`,
              },
            ],
          };
        }
        return s;
      })
    );
  };

  const addPickupSchedule = (data: Omit<PickupSchedule, 'id'>) => {
    const newPickup: PickupSchedule = {
      ...data,
      id: `PCK-${Date.now().toString().slice(-4)}`,
    };
    setPickups((prev) => [newPickup, ...prev]);
  };

  const updatePickupStatus = (id: string, status: PickupSchedule['status'], actualCount?: number) => {
    setPickups((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status,
            actualCollectedCount: actualCount !== undefined ? actualCount : p.actualCollectedCount,
          };
        }
        return p;
      })
    );
  };

  const addAgendaTask = (task: Omit<AgendaTask, 'id' | 'createdAt'>): AgendaTask => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newTask: AgendaTask = {
      ...task,
      id: `TSK-${Date.now().toString().slice(-4)}`,
      createdAt: now,
    };
    setAgenda((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateAgendaStatus = (id: string, status: AgendaTask['status']) => {
    setAgenda((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const addWhistleblowerReport = (report: Omit<WhistleblowerReport, 'id' | 'timestamp' | 'status'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newReport: WhistleblowerReport = {
      ...report,
      id: `REP-${Date.now().toString().slice(-4)}`,
      timestamp: now,
      status: 'UNDER_REVIEW',
    };
    setWhistleblowerReports((prev) => [newReport, ...prev]);
  };

  const recordCashDeposit = (courierId: string, amount: number) => {
    const courier = staff.find((s) => s.id === courierId);
    if (!courier) return { success: false, message: 'الموظف غير موجود' };

    if (amount <= 0) return { success: false, message: 'المبلغ غير صالح' };

    const remainingCash = Math.max(0, courier.currentCashHeld - amount);

    setStaff((prev) =>
      prev.map((s) => (s.id === courierId ? { ...s, currentCashHeld: remainingCash } : s))
    );

    return {
      success: true,
      message: `تم توريد مبلغ ${amount} ج.م لخزينة الشركة بنجاح. المتبقي في عهدة ${courier.name}: ${remainingCash} ج.م`,
    };
  };

  const runAiFraudAudit = async () => {
    try {
      const response = await fetch('/api/ai/fraud-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditData: {
            activeCouriers: staff.filter((s) => s.role === 'COURIER').map((c) => ({
              name: c.name,
              id: c.id,
              currentCashHeld: c.currentCashHeld,
              maxLimit: c.maxCashLimit,
              fraudAlerts: c.fraudAlertsCount,
            })),
            recentShipments: shipments.slice(0, 10).map((s) => ({
              tracking: s.trackingNumber,
              status: s.status,
              cod: s.codAmount,
              collected: s.collectedAmount,
              courier: s.assignedCourierName,
              returnReason: s.returnReason,
            })),
            currentAnomaliesCount: fraudAnomalies.length,
          },
        }),
      });

      if (!response.ok) throw new Error('فشل الفحص الرقابي');
      const result = await response.json();
      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const getShipmentByTracking = (trackingNumber: string) => {
    return shipments.find((s) => s.trackingNumber.toUpperCase() === trackingNumber.trim().toUpperCase());
  };

  const resetToDemoData = () => {
    setStaff(INITIAL_STAFF);
    setMerchants(INITIAL_MERCHANTS);
    setShipments(INITIAL_SHIPMENTS);
    setPickups(INITIAL_PICKUPS);
    setAgenda(INITIAL_AGENDA);
    setFraudAnomalies(INITIAL_FRAUD_ANOMALIES);
    setWhistleblowerReports(INITIAL_WHISTLEBLOWER_REPORTS);
    setWorkerTasks(INITIAL_WORKER_TASKS);
    setOnboardingApplications(INITIAL_ONBOARDING_APPLICATIONS);
    setFulfillmentItems(INITIAL_FULFILLMENT_ITEMS);
    setPayoutTransactions(INITIAL_PAYOUT_TRANSACTIONS);
    setCurrentUser(DEFAULT_OWNER_USER);
    setCurrentRingLevel(1);
    setCurrentRole('ADMIN');
    localStorage.clear();
  };

  return (
    <LogisticsContext.Provider
      value={{
        currentUser,
        currentRingLevel,
        setCurrentRingLevel,
        loginUser,
        registerUser,
        logoutUser,
        quickSwitchUser,
        currentRole,
        setCurrentRole,
        activeCourierId,
        setActiveCourierId,
        activeMerchantId,
        setActiveMerchantId,
        staff,
        merchants,
        shipments,
        pickups,
        agenda,
        fraudAnomalies,
        whistleblowerReports,
        workerTasks,
        onboardingApplications,
        fulfillmentItems,
        payoutTransactions,
        governoratesCoverage,
        requestMerchantPayout,
        addWorkerTask,
        updateWorkerTaskStatus,
        submitOnboardingApplication,
        approveOnboardingApplication,
        rejectOnboardingApplication,
        addStaffMember,
        updateStaffMember,
        toggleStaffStatus,
        addShipment,
        verifyAndDeliverShipment,
        recordReturnOrPartial,
        assignShipmentCourier,
        addPickupSchedule,
        updatePickupStatus,
        addAgendaTask,
        updateAgendaStatus,
        addWhistleblowerReport,
        recordCashDeposit,
        runAiFraudAudit,
        getShipmentByTracking,
        resetToDemoData,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
};
