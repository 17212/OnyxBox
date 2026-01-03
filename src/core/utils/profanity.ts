// =====================================================
// 🦅 IDRISIUM - PROFANITY FILTER (EGYPTIAN ARABIC)
// Advanced filtering system for Egyptian & Arabic insults
// =====================================================

export const PROFANITY_LIST = [
  // --- Classic Egyptian Insults ---
  "شرموط", "شرموطة", "لبوة", "خول", "متناك", "منيوك", "كسمك", "كسم", "كس", "طيز", "طيزك",
  "زب", "زبي", "بضان", "بضاني", "عرص", "معرص", "قحبة", "قحاب", "شلق", "يا عرص",
  "يا خول", "يا متناك", "يا شرموطة", "يا لبوة", "يا كسمك", "يا منيوك", "يا معرص",
  "منيك", "تناكة", "شراميط", "خوال", "عرصات", "معرصين", "وسخة", "واطية",
  
  // --- Family & Honor ---
  "امك", "ابوك", "اختك", "مراتك", "شرفك", "عرضك", "دياثة", "ديوث",
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
  
  // --- Variations & Leetspeak (Arabic context) ---
  "ك.س", "ك_س", "ك س", "ك*س", "ش.ر.م.و.ط", "خ.و.ل", "م.ت.ن.ا.ك",
  "k0smk", "sharmouta", "labwa", "khawal", "metnak", "3ars", "6eez", "zobb",
  "k0sm", "sharmout", "metnaka", "3arsat", "zobbi", "bdan", "labwa",
  "k s m k", "m t n a k", "sh r m o t", "kh w l",
  
  // --- Extensive Franco-Arabic (Franco) ---
  "kosomak", "kosomk", "k0s0mk", "kosom", "k.s.m.k", "k s m k", "k-s-m-k",
  "sharmouta", "sharmota", "sharmoota", "sharmout", "sharmot", "shrmota", "shrmouta",
  "khawal", "5awal", "5wal", "khwal", "khawalat", "5awalat",
  "metnak", "mtnak", "mtenak", "metnaka", "mtnaka", "mtenaka",
  "3ars", "ars", "3arsat", "arsat", "ma3ars", "maars",
  "labwa", "lbwa", "labo7a", "labo7",
  "zobb", "zob", "zobbi", "zobak", "zobk", "zobbe",
  "teez", "6eez", "tiz", "teezak", "6eezak", "tizak", "teezk", "6eezk",
  "was5a", "was7a", "waskha", "awsakh", "aws5", "aws7",
  "ebn el kalb", "ebn el was5a", "ebn el sharmouta", "ebn el metnaka",
  "bnt el kalb", "bnt el was5a", "bnt el sharmouta", "bnt el metnaka",
  "ya mtnak", "ya 5awal", "ya sharmouta", "ya 3ars", "ya labwa",
  "ya kosomak", "ya mtnaka", "ya mtenak", "ya was5a",
  "nyak", "nayek", "nayka", "nayaka", "neek", "nek", "anyek", "anyekak",
  "hanyekak", "hanyekkom", "naktak", "naktik",
  "kosek", "kossak", "kossk", "kosek", "k0sek",
  "bazzaz", "bazzazak", "7alama", "7alamet", "fakhd", "fakhdak", "mo5ra", "mo25ra",
  "sex", "porn", "xnx", "xnxx", "brazzers", "pornhub",
  "ya m3ars", "ya ma3ars", "ya maars",
  "k.s.m.k", "sh.r.m.t", "m.t.n.k", "5.w.l", "3.r.s",
  "k o s o m a k", "s h a r m o u t a", "m e t n a k",
];

/**
 * Checks if a string contains any profanity from the list.
 * @param text The text to check
 * @returns boolean
 */
export const hasProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  
  // Split text into words and check each word
  const words = lowerText.split(/[\s\.\,!\?\(\)\[\]\{\}\\\/\-_]+/);
  
  return PROFANITY_LIST.some(badWord => {
    const lowerBadWord = badWord.toLowerCase();
    
    // If the bad word is short (less than 3 chars), only match exact word
    if (lowerBadWord.length <= 3) {
      return words.includes(lowerBadWord);
    }
    
    // For longer words, check if it's included as a whole word or a significant part
    // Using a safer regex that doesn't match inside innocent words easily
    return words.some(word => word === lowerBadWord || (word.length > 4 && word.includes(lowerBadWord)));
  });
};

/**
 * Cleans the text by replacing profanity with asterisks.
 */
export const cleanText = (text: string): string => {
  let cleaned = text;
  const words = text.split(/\s+/);
  
  words.forEach(word => {
    if (hasProfanity(word)) {
      const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
      cleaned = cleaned.replace(regex, "*".repeat(word.length));
    }
  });
  return cleaned;
};

/**
 * Advanced check that handles spaces and common bypass techniques.
 */
export const isToxic = (text: string): boolean => {
  if (!text) return false;
  
  // Standard check first
  if (hasProfanity(text)) return true;
  
  // Check for common bypasses like "ك س م ك"
  // Only do this for longer strings to avoid false positives on short names
  if (text.length > 5) {
    const normalized = text.replace(/[\s\._\-\*]/g, "");
    // Only trigger if the normalized version matches a long bad word
    return PROFANITY_LIST.some(badWord => badWord.length > 4 && normalized.includes(badWord.toLowerCase()));
  }
  
  return false;
};
