// =====================================================
// 🦅 ONYXBOX - CONSTANTS & TRANSLATIONS
// Master file for all app constants and Egyptian Arabic strings
// =====================================================

// =================== ADMIN CONFIG ===================
export const ALLOWED_ADMINS = [
  "murphysec72@gmail.com",
  "idris.ghamid@gmail.com"
];

// =================== RATE LIMITING ===================
export const MESSAGE_COOLDOWN_MS = 60000; // 1 minute
export const MAX_MESSAGE_LENGTH = 500;

// =================== MOODS ===================
export const MOODS = ["👻", "❤️", "😂", "😡", "😢", "🔥", "🥺", "💀", "🤡", "😈", "🫠", "💔"];

// =================== ADMIN REACTIONS ===================
export const ADMIN_REACTIONS = ["❤️", "😂", "🔥", "👀", "🥺", "💀", "🤡", "👏", "😈", "💯"];

// =================== TRANSLATIONS (Egyptian Arabic - Casual) ===================
export const AR = {
  // === BRANDING ===
  appName: "OnyxBox",
  tagline: "ابعت رسالتك مش هعرف انت مين متقلقش الا لو انت كتبت اسمك",
  poweredBy: "Powered by",

  // === AUTH SCREEN ===
  auth: {
    welcome: "يلا ادخل وابعت رسالتك",
    continueGoogle: "سجل بجوجل",
    continueAnonymous: "سجل بشكل متخفي 👻",
    continueEmail: "سجل بالايميل",
    orDivider: "أو",
    loginButton: "دخّلني",
    signupButton: "سجّلني",
    emailPlaceholder: "ايميلك يا فنان",
    passwordPlaceholder: "الباسورد",
    switchToSignup: "معندكش أكونت؟ يلا اعمل واحد",
    switchToLogin: "عندك أكونت؟ دخّل بقى",
    loginSuccess: "دخلت يا باشا! 🎉",
    loginFailed: "مظبطش.. جرب تاني",
    signupSuccess: "اتسجّلت!",
    anonymousSuccess: "دخلت متخفي 🥷",
  },

  // === MESSAGE FORM ===
  form: {
    placeholder: "اكتب كل اللي في بالك..",
    namePlaceholder: "اسمك (اختياري.. أو خليك مجهول عادي)",
    sendButton: "ابعت",
    sending: "بيتبعت...",
    cooldownWarning: "استنى شوية قبل ما تبعت تاني",
    emptyWarning: "اكتب حاجة الأول يا زعيم!",
    successMessage: "وصلتني رسالتك!",
    errorMessage: "في مشكلة.. جرب تاني",
    characterCount: "حرف",
    moodLabel: "حاسس بإيه مثلا؟",
  },

  // === SUCCESS SCREEN ===
  success: {
    title: "وصلت!",
    subtitle: "رسالتك دي بيني وبينك.. 🔒",
    sendAnother: "عايز تبعت تاني؟",
    notification: "هيوصلك إشعار لما أقرأها 👀",
    waitingForReaction: "استنى إدريس يشوفها... 👀",
  },

  // === REAL-TIME NOTIFICATIONS ===
  notifications: {
    messageRead: "👁️ إدريس قرأ رسالتك!",
    adminReacted: "إدريس رد عليك بـ",
    newReply: "🔥 إدريس بعتلك رد!",
  },

  // === ADMIN DASHBOARD ===
  dashboard: {
    title: "لوحة التحكم",
    subtitle: "كل الرسايل السرية هنا 🔐",
    searchPlaceholder: "دوّر في الرسايل...",
    noMessages: "مفيش رسايل لسه 📭",
    noMessagesSubtitle: "الناس لسه بتستحى تبعتلك 😂",
    totalMessages: "كل الرسايل",
    unreadMessages: "جديد",
    systemStatus: "الحالة",
    online: "شغال",
    exportButton: "نزّل الداتا",
    logoutButton: "اخرج",
    stealthMode: "الوضع الخفي",
    deleteConfirm: "متأكد تمسحها؟ مش هترجع 💀",
    deleteSuccess: "اتمسحت! 🗑️",
    markRead: "اتقريت",
    markUnread: "جديدة",
    superAdmin: "سوبر أدمن 🦅",
  },

  // === MESSAGE CARD ===
  messageCard: {
    anonymous: "مجهول",
    justNow: "دلوقتي",
    shareStory: "اعمل ستوري",
    react: "رد عليه",
    reply: "ابعتله رد",
    delete: "امسح",
    read: "اتقريت ✓",
    replyPlaceholder: "اكتب ردك هنا...",
    sendReply: "ابعت الرد",
    replySent: "الرد اتبعت! 🚀",
  },

  // === STORY CUSTOMIZER ===
  story: {
    title: "🎨 مصنع الستوري",
    preview: "الشكل النهائي",
    download: "نزّل الصورة 📸",
    cancel: "لا خلاص",
    background: "الخلفية",
    accentColor: "اللون",
    fontSize: "حجم الخط",
    showBadge: "علامة الموقع",
    showTimestamp: "التاريخ",
    showSender: "اسم اللي بعت",
    cardStyle: "شكل الكارت",
    success: "الستوري جاهز! 📸",
    alignment: "المحاذاة",
    glowEffect: "توهج",
  },

  // === ABOUT MODAL ===
  about: {
    title: "مين اللي عمل الموقع ده؟",
    developer: "المطوّر",
    description: "Lead Developer & Architect at IDRISIUM Corp. Obsessed with creating pixel-perfect, high-performance digital experiences.",
    contact: "التواصل",
    security: "مؤمّن بتقنية IDRISIUM",
    footer: "Powered by IDRISIUM Corp",
  },

  // === FOOTER ===
  footer: {
    madeWith: "Powered by",
    byIdrisium: "IDRISIUM Corp",
  },

  // === ERRORS ===
  errors: {
    generic: "في حاجة غلط.. جرب تاني",
    network: "النت واقع ولا إيه؟ 📡",
    auth: "السيرفر مش قابل أدخّلك.. جرب تاني",
    permission: "مش مسموحلك تعمل كده 🚫",
    rateLimit: "بتبعت كتير أوي! استنى شوية",
  },

  // === LOADING STATES ===
  loading: {
    default: "ثانية واحدة...",
    sending: "بيتبعت...",
    fetching: "بجيب الداتا...",
  },

  // === EMPTY STATES ===
  empty: {
    noMessages: "مفيش حاجة هنا 📭",
    noResults: "ملقتش حاجة بالاسم ده",
  },

  // === TOOLTIPS ===
  tooltips: {
    stealth: "شغّل ده عشان تبلّر الرسايل",
    share: "اعمل ستوري للرسالة دي",
    delete: "امسح الرسالة دي للأبد",
    react: "رد على اللي بعت بـ emoji",
    reply: "ابعتله رد يوصله",
  },

  // === CONFIRMATION DIALOGS ===
  confirm: {
    delete: "أنت متأكد؟ دي مش هترجع يا صاحبي 💀",
    logout: "هتخرج بجد؟",
    yes: "أيوه",
    no: "لا استنى",
  },

  // === TIME AGO ===
  timeAgo: {
    now: "دلوقتي",
    seconds: "ثواني",
    minute: "دقيقة",
    minutes: "دقايق",
    hour: "ساعة",
    hours: "ساعات",
    day: "يوم",
    days: "أيام",
    week: "أسبوع",
    weeks: "أسابيع",
    month: "شهر",
    months: "شهور",
  },
};

// =================== HELPER FUNCTIONS ===================
export const timeAgo = (timestamp: any): string => {
  if (!timestamp?.seconds) return AR.timeAgo.now;
  
  const now = Date.now();
  const then = timestamp.seconds * 1000;
  const diff = now - then;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (months > 0) return `من ${months} ${AR.timeAgo.months}`;
  if (weeks > 0) return `من ${weeks} ${AR.timeAgo.weeks}`;
  if (days > 0) return `من ${days} ${AR.timeAgo.days}`;
  if (hours > 0) return `من ${hours} ${AR.timeAgo.hours}`;
  if (minutes > 0) return `من ${minutes} ${AR.timeAgo.minutes}`;
  return AR.timeAgo.now;
};

export const isAdmin = (email: string | null | undefined): boolean => {
  return email ? ALLOWED_ADMINS.includes(email) : false;
};
