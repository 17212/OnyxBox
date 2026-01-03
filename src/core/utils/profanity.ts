// =====================================================
// 🦅 IDRISIUM - PROFANITY FILTER (EGYPTIAN ARABIC)
// Advanced filtering system for Egyptian & Arabic insults
// =====================================================

export const PROFANITY_LIST = [
  // --- Classic Egyptian Insults ---
  "شرموط", "شرموطة", "لبوة", "خول", "متناك", "منيوك", "كسمك", "كسم", "كس", "طيز", "طيزك",
  "زب", "زبي", "بضان", "بضاني", "عرص", "معرص", "قحبة", "قحاب", "شلق", "وسخ", "اوسخ",
  "نجس", "انجس", "حقير", "سافل", "واطي", "يا واطي", "يا سافل", "يا نجس", "يا عرص",
  "يا خول", "يا متناك", "يا شرموطة", "يا لبوة", "يا كسمك", "يا منيوك", "يا معرص",
  "منيك", "تناكة", "شراميط", "خوال", "عرصات", "معرصين", "وسخة", "واطية",
  
  // --- Family & Honor ---
  "امك", "ابوك", "اختك", "مراتك", "عيلتك", "اهلك", "شرفك", "عرضك", "دياثة", "ديوث",
  "ابن الكلب", "ابن الوسخة", "ابن المتناكة", "ابن الشرموطة", "ابن القحبة", "ابن اللبوة",
  "بنت الكلب", "بنت الوسخة", "بنت المتناكة", "بنت الشرموطة", "بنت القحبة", "بنت اللبوة",
  "كسمين امك", "كسمين ابوك", "كسمين اهلك", "كسمين عيلتك", "كسمك يا", "كسمك انت",
  "امك زانية", "اختك شرموطة", "ابوك خول", "عيلتكم وسخة",
  
  // --- Sexual & Body Parts ---
  "تناك", "نيك", "بتاع", "بزاز", "بزازك", "حلمة", "حلمات", "فخد", "فخدك", "موخرة",
  "مؤخرة", "مؤخرتك", "سكس", "بورن", "نيكني", "انيكك", "هنيكك", "هنيكم", "نكتك",
  "كسك", "زبر", "زبرك", "خصية", "خصيتك", "فرج", "فرجي", "مبضون", "مبضونة",
  
  // --- Religious & Blasphemy (Filtered for safety) ---
  "كافر", "ملحد", "زنديق", "مرتد", "دين الكلب", "دين الوسخة", "سب الدين",
  
  // --- General Arabic Insults ---
  "حمار", "كلب", "خنزير", "قرد", "تيس", "ثور", "غبي", "متخلف", "هبيلة", "عبيط",
  "يا حمار", "يا كلب", "يا خنزير", "يا غبي", "يا متخلف", "يا عبيط", "يا قرد",
  "يا تيس", "يا ثور", "يا هبيلة", "يا عبيط", "يا اهبل", "يا تافه",
  
  // --- Variations & Leetspeak (Arabic context) ---
  "ك.س", "ك_س", "ك س", "ك*س", "ش.ر.م.و.ط", "خ.و.ل", "م.ت.ن.ا.ك",
  "k0smk", "sharmouta", "labwa", "khawal", "metnak", "3ars", "6eez", "zobb",
  "k0sm", "sharmout", "metnaka", "3arsat", "zobbi", "bdan", "labwa",
  "k s m k", "m t n a k", "sh r m o t", "kh w l",
];

/**
 * Checks if a string contains any profanity from the list.
 * @param text The text to check
 * @returns boolean
 */
export const hasProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return PROFANITY_LIST.some(word => {
    // Check for exact word or if it's part of a larger word (with boundaries)
    const regex = new RegExp(`\\b${word}\\b|${word}`, "i");
    return regex.test(lowerText);
  });
};

/**
 * Cleans the text by replacing profanity with asterisks.
 * @param text The text to clean
 * @returns string
 */
export const cleanText = (text: string): string => {
  let cleaned = text;
  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(word, "gi");
    cleaned = cleaned.replace(regex, "*".repeat(word.length));
  });
  return cleaned;
};

/**
 * Advanced check that handles spaces and common bypass techniques.
 */
export const isToxic = (text: string): boolean => {
  // Remove spaces and special characters to catch "ك س م ك"
  const normalized = text.replace(/[\s\._\-\*]/g, "");
  if (hasProfanity(normalized)) return true;
  
  // Standard check
  return hasProfanity(text);
};
