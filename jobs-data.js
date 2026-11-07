/* jobs-data.js — DCU Core "জব ও টিউশন" এর মূল তালিকা
 *
 * এখানে আছে: ৪ ধরনের পোস্ট, ঢাকার এলাকা (অঞ্চলসহ), শ্রেণি, টিউশনের বিষয়, পার্ট-টাইম কাজের ধরন,
 * ফ্রিল্যান্স দক্ষতা, বেতনের একক ও ফিল্টার-পরিসীমা, গোপনীয়তা/রিপোর্টের কারণ, নিরাপত্তা-সতর্কতা।
 * সব নাম বাংলা (bn) ও ইংরেজি (en) দুইভাবে আছে।
 *
 * slug-এর নিয়ম (Firestore Rules-এর সঙ্গে মেলানো, ধাপ ১):
 *   - ছোট ইংরেজি অক্ষর, সংখ্যা ও হাইফেন।
 *   - areas  : সর্বোচ্চ ৫টি, জোড়া লেখা (কমাসহ) ২০০ অক্ষরের মধ্যে
 *   - cats   : সর্বোচ্চ ৬টি, জোড়া লেখা ২০০ অক্ষরের মধ্যে  → প্রতিটি slug ≤ ৩০ অক্ষর
 *   - levels : সর্বোচ্চ ৬টি, জোড়া লেখা ১২০ অক্ষরের মধ্যে → প্রতিটি slug ≤ ১৯ অক্ষর
 *   (types-এর slug আলাদা: Rules-এ ঠিক এই চারটি নামই ধরা আছে, তাই বদলাবেন না।)
 *   নতুন আইটেম যোগ করলে JobsData.selfCheck() চালিয়ে নিন (ব্রাউজার কনসোলে); কোনো সমস্যা থাকলে বলে দেবে।
 *
 * কলেজ/বিভাগের তালিকা এখানে নকল করা হয়নি; টিউটর প্রোফাইলে ওগুলো LibData (lib-data.js) থেকেই আসবে।
 *
 * ব্যবহার: <script src="jobs-data.js"></script> দিলে window.JobsData পাওয়া যাবে।
 */
(function (root) {
  "use strict";

  /* ---------- সীমা (Rules-এর সঙ্গে হুবহু মেলানো; এক জায়গায় রাখা হলো) ---------- */
  var LIMITS = {
    postsPerDay: 2,          // jobs_limits
    expiryDays: 30,          // expiresAt = createdAt + ৩০ দিন
    title: [5, 100],
    desc: [0, 800],
    timeNote: [0, 60],
    orgName: [0, 80],
    authorName: [1, 80],
    reportNote: [0, 300],
    maxAreas: 5,
    maxCats: 6,
    maxLevels: 6,
    maxSalary: 1000000,
    photoMaxChars: 60000     // টিউটর প্রোফাইলের ঐচ্ছিক ছবি (সংকুচিত base64)
  };

  /* ---------- পোস্টের ধরন ----------
   * hue: রঙ (library-colors.css-এর মতো জুয়েল-টোন; ধাপ ৩-এ CSS ব্যবহার করবে)
   * icon: আইকনের নাম (ধাপ ৩-এ SVG-র সঙ্গে মেলানো হবে)
   * wantsLevels: শ্রেণি বাধ্যতামূলক কিনা (Rules: শুধু টিউশনের দুই ধরনে) */
  var TYPES = [
    { slug: "tuition_wanted", bn: "টিউশন চাই",        en: "Tuition Wanted",  short_bn: "টিউটর খুঁজছি",    short_en: "Looking for a tutor",
      hue: 214, icon: "book",   wantsLevels: true,  catsFrom: "subjects",
      help_bn: "অভিভাবক বা শিক্ষার্থী টিউটর খুঁজলে এখানে পোস্ট করুন।",
      help_en: "Post here if you are looking for a tutor." },
    { slug: "tutor_profile",  bn: "টিউটর প্রোফাইল",   en: "Tutor Profile",   short_bn: "পড়াতে চাই",       short_en: "I can teach",
      hue: 158, icon: "user",   wantsLevels: true,  catsFrom: "subjects",
      help_bn: "আপনি পড়াতে চাইলে নিজের প্রোফাইল দিন।",
      help_en: "Create a profile if you want to tutor." },
    { slug: "parttime",       bn: "পার্ট-টাইম জব",     en: "Part-time Job",   short_bn: "পার্ট-টাইম কাজ",   short_en: "Part-time work",
      hue: 28,  icon: "store",  wantsLevels: false, catsFrom: "jobKinds",
      help_bn: "দোকান/ব্যবসা/অফিসে পার্ট-টাইম কর্মী লাগলে পোস্ট করুন।",
      help_en: "Post here if your shop or business needs part-time staff." },
    { slug: "freelance",      bn: "ফ্রিল্যান্স/অনলাইন", en: "Freelance / Online", short_bn: "অনলাইন কাজ",   short_en: "Online work",
      hue: 266, icon: "laptop", wantsLevels: false, catsFrom: "skills",
      help_bn: "ডিজাইন, লেখা, ভিডিও ইত্যাদি অনলাইন কাজ।",
      help_en: "Design, writing, video and other online work." }
  ];

  /* ---------- পদ্ধতি ---------- */
  var MODES = [
    { slug: "offline", bn: "সরাসরি (অফলাইন)", en: "In person" },
    { slug: "online",  bn: "অনলাইন",           en: "Online" },
    { slug: "both",    bn: "দুটোই",             en: "Both" }
  ];

  /* ---------- ঢাকার অঞ্চল (ফিল্টারের বড় চিপ) ---------- */
  var ZONES = [
    { slug: "north",   bn: "উত্তর ঢাকা",        en: "North Dhaka" },
    { slug: "west",    bn: "পশ্চিম ঢাকা",       en: "West Dhaka" },
    { slug: "central", bn: "মধ্য ঢাকা",          en: "Central Dhaka" },
    { slug: "east",    bn: "পূর্ব ঢাকা",         en: "East Dhaka" },
    { slug: "old",     bn: "পুরান ঢাকা ও দক্ষিণ", en: "Old & South Dhaka" }
  ];

  /* ---------- ঢাকার এলাকা (শুধু ঢাকা মহানগর; পূর্ণ ঠিকানা কখনো নেওয়া হয় না) ---------- */
  var AREAS = [
    /* উত্তর */
    { slug: "uttara",          bn: "উত্তরা",              en: "Uttara",          zone: "north" },
    { slug: "airport",         bn: "বিমানবন্দর/খিলক্ষেত",   en: "Airport / Khilkhet", zone: "north" },
    { slug: "gulshan",         bn: "গুলশান",              en: "Gulshan",         zone: "north" },
    { slug: "banani",          bn: "বনানী",               en: "Banani",          zone: "north" },
    { slug: "baridhara",       bn: "বারিধারা",            en: "Baridhara",       zone: "north" },
    { slug: "bashundhara",     bn: "বসুন্ধরা",            en: "Bashundhara",     zone: "north" },
    { slug: "badda",           bn: "বাড্ডা",              en: "Badda",           zone: "north" },
    { slug: "mohakhali",       bn: "মহাখালী",             en: "Mohakhali",       zone: "north" },
    { slug: "tejgaon",         bn: "তেজগাঁও",             en: "Tejgaon",         zone: "north" },
    { slug: "nikunja",         bn: "নিকুঞ্জ",              en: "Nikunja",         zone: "north" },
    /* পশ্চিম (মিরপুর-মোহাম্মদপুর) */
    { slug: "mirpur",          bn: "মিরপুর",              en: "Mirpur",          zone: "west" },
    { slug: "pallabi",         bn: "পল্লবী",              en: "Pallabi",         zone: "west" },
    { slug: "kafrul",          bn: "কাফরুল",              en: "Kafrul",          zone: "west" },
    { slug: "shewrapara",      bn: "শেওড়াপাড়া",          en: "Shewrapara",      zone: "west" },
    { slug: "kazipara",        bn: "কাজীপাড়া",            en: "Kazipara",        zone: "west" },
    { slug: "agargaon",        bn: "আগারগাঁও",            en: "Agargaon",        zone: "west" },
    { slug: "shyamoli",        bn: "শ্যামলী",              en: "Shyamoli",        zone: "west" },
    { slug: "mohammadpur",     bn: "মোহাম্মদপুর",          en: "Mohammadpur",     zone: "west" },
    { slug: "adabor",          bn: "আদাবর",               en: "Adabor",          zone: "west" },
    { slug: "kalyanpur",       bn: "কল্যাণপুর",            en: "Kalyanpur",       zone: "west" },
    { slug: "gabtoli",         bn: "গাবতলী",              en: "Gabtoli",         zone: "west" },
    { slug: "hazaribagh",      bn: "হাজারীবাগ",            en: "Hazaribagh",      zone: "west" },
    /* মধ্য */
    { slug: "dhanmondi",       bn: "ধানমন্ডি",             en: "Dhanmondi",       zone: "central" },
    { slug: "new-market",      bn: "নিউ মার্কেট",           en: "New Market",      zone: "central" },
    { slug: "kalabagan",       bn: "কলাবাগান",             en: "Kalabagan",       zone: "central" },
    { slug: "lalmatia",        bn: "লালমাটিয়া",            en: "Lalmatia",        zone: "central" },
    { slug: "elephant-road",   bn: "এলিফ্যান্ট রোড",       en: "Elephant Road",   zone: "central" },
    { slug: "farmgate",        bn: "ফার্মগেট",             en: "Farmgate",        zone: "central" },
    { slug: "kawran-bazar",    bn: "কারওয়ান বাজার",       en: "Kawran Bazar",    zone: "central" },
    { slug: "panthapath",      bn: "পান্থপথ",              en: "Panthapath",      zone: "central" },
    { slug: "moghbazar",       bn: "মগবাজার",              en: "Moghbazar",       zone: "central" },
    { slug: "malibagh",        bn: "মালিবাগ",              en: "Malibagh",        zone: "central" },
    { slug: "shantinagar",     bn: "শান্তিনগর",            en: "Shantinagar",     zone: "central" },
    { slug: "paltan",          bn: "পল্টন",                en: "Paltan",          zone: "central" },
    { slug: "motijheel",       bn: "মতিঝিল",               en: "Motijheel",       zone: "central" },
    { slug: "shahbag",         bn: "শাহবাগ",               en: "Shahbag",         zone: "central" },
    /* পূর্ব */
    { slug: "rampura",         bn: "রামপুরা",              en: "Rampura",         zone: "east" },
    { slug: "banasree",        bn: "বনশ্রী",               en: "Banasree",        zone: "east" },
    { slug: "khilgaon",        bn: "খিলগাঁও",              en: "Khilgaon",        zone: "east" },
    { slug: "basabo",          bn: "বাসাবো",               en: "Basabo",          zone: "east" },
    { slug: "mugda",           bn: "মুগদা",                en: "Mugda",           zone: "east" },
    { slug: "maniknagar",      bn: "মানিকনগর",             en: "Maniknagar",      zone: "east" },
    { slug: "jatrabari",       bn: "যাত্রাবাড়ী",           en: "Jatrabari",       zone: "east" },
    { slug: "demra",           bn: "ডেমরা",                en: "Demra",           zone: "east" },
    { slug: "shahjahanpur",    bn: "শাহজাহানপুর",          en: "Shahjahanpur",    zone: "east" },
    /* পুরান ঢাকা ও দক্ষিণ */
    { slug: "azimpur",         bn: "আজিমপুর",              en: "Azimpur",         zone: "old" },
    { slug: "lalbagh",         bn: "লালবাগ",               en: "Lalbagh",         zone: "old" },
    { slug: "chawkbazar",      bn: "চকবাজার",              en: "Chawkbazar",      zone: "old" },
    { slug: "sutrapur",        bn: "সূত্রাপুর",             en: "Sutrapur",        zone: "old" },
    { slug: "gendaria",        bn: "গেন্ডারিয়া",           en: "Gendaria",        zone: "old" },
    { slug: "wari",            bn: "ওয়ারী",                en: "Wari",            zone: "old" },
    { slug: "sadarghat",       bn: "সদরঘাট",               en: "Sadarghat",       zone: "old" },
    { slug: "kamrangirchar",   bn: "কামরাঙ্গীরচর",          en: "Kamrangirchar",   zone: "old" },
    { slug: "keraniganj",      bn: "কেরানীগঞ্জ",            en: "Keraniganj",      zone: "old" }
  ];

  /* ---------- শ্রেণি (সংক্ষিপ্ত slug: ≤ ১৯ অক্ষর) ---------- */
  var LEVELS = [
    { slug: "kg-5",            bn: "প্লে–৫ম শ্রেণি",             en: "Play–Class 5" },
    { slug: "class-6-8",       bn: "৬ষ্ঠ–৮ম শ্রেণি",              en: "Class 6–8" },
    { slug: "class-9-10",      bn: "৯ম–১০ম (SSC)",              en: "Class 9–10 (SSC)" },
    { slug: "hsc",             bn: "একাদশ–দ্বাদশ (HSC)",         en: "Class 11–12 (HSC)" },
    { slug: "admission",       bn: "ভর্তি প্রস্তুতি",              en: "Admission Prep" },
    { slug: "english-medium",  bn: "ইংলিশ মিডিয়াম (O/A Level)",   en: "English Medium (O/A Level)" },
    { slug: "university",      bn: "স্নাতক/বিশ্ববিদ্যালয়",         en: "Undergraduate" }
  ];

  /* ---------- টিউশনের বিষয় (slug ≤ ৩০ অক্ষর) ---------- */
  var SUBJECTS = [
    { slug: "all-subjects",    bn: "সব বিষয়",                  en: "All subjects" },
    { slug: "bangla",          bn: "বাংলা",                     en: "Bangla" },
    { slug: "english",         bn: "ইংরেজি",                    en: "English" },
    { slug: "math",            bn: "গণিত",                      en: "Mathematics" },
    { slug: "higher-math",     bn: "উচ্চতর গণিত",               en: "Higher Math" },
    { slug: "science",         bn: "বিজ্ঞান (সাধারণ)",           en: "General Science" },
    { slug: "physics",         bn: "পদার্থবিজ্ঞান",              en: "Physics" },
    { slug: "chemistry",       bn: "রসায়ন",                    en: "Chemistry" },
    { slug: "biology",         bn: "জীববিজ্ঞান",                en: "Biology" },
    { slug: "ict",             bn: "ICT / কম্পিউটার",           en: "ICT / Computer" },
    { slug: "accounting",      bn: "হিসাববিজ্ঞান",              en: "Accounting" },
    { slug: "finance-banking", bn: "ফিন্যান্স ও ব্যাংকিং",        en: "Finance & Banking" },
    { slug: "business-studies",bn: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা", en: "Business Studies" },
    { slug: "economics",       bn: "অর্থনীতি",                  en: "Economics" },
    { slug: "geography",       bn: "ভূগোল",                     en: "Geography" },
    { slug: "history",         bn: "ইতিহাস",                    en: "History" },
    { slug: "civics",          bn: "পৌরনীতি/সমাজ",              en: "Civics / Social Science" },
    { slug: "bgs",             bn: "বাংলাদেশ ও বিশ্বপরিচয়",      en: "Bangladesh & Global Studies" },
    { slug: "islam",           bn: "ইসলাম ও নৈতিক শিক্ষা",       en: "Islam & Moral Education" },
    { slug: "quran-arabic",    bn: "কোরআন/আরবি",                en: "Quran / Arabic" },
    { slug: "admission-test",  bn: "ভর্তি পরীক্ষার প্রস্তুতি",     en: "Admission Test Prep" },
    { slug: "spoken-english",  bn: "স্পোকেন ইংলিশ",              en: "Spoken English" }
  ];

  /* ---------- পার্ট-টাইম কাজের ধরন ---------- */
  var JOB_KINDS = [
    { slug: "shop-sales",      bn: "দোকান/বিক্রয় সহকারী",        en: "Shop / Sales Assistant" },
    { slug: "cashier",         bn: "ক্যাশিয়ার",                  en: "Cashier" },
    { slug: "restaurant-cafe", bn: "রেস্তোরাঁ/ক্যাফে",            en: "Restaurant / Café" },
    { slug: "delivery",        bn: "ডেলিভারি",                   en: "Delivery" },
    { slug: "customer-support",bn: "কাস্টমার সাপোর্ট",            en: "Customer Support" },
    { slug: "data-entry",      bn: "ডেটা এন্ট্রি/অফিস সহকারী",     en: "Data Entry / Office Assistant" },
    { slug: "coaching-assist", bn: "কোচিং সহকারী",               en: "Coaching Assistant" },
    { slug: "social-media",    bn: "সোশ্যাল মিডিয়া/পেজ ম্যানেজ",   en: "Social Media / Page Management" },
    { slug: "field-marketing", bn: "ফিল্ড মার্কেটিং",              en: "Field Marketing" },
    { slug: "event-staff",     bn: "ইভেন্ট/প্রোগ্রাম সহকারী",      en: "Event Staff" },
    { slug: "store-inventory", bn: "স্টোর/ইনভেন্টরি",             en: "Store / Inventory" },
    { slug: "other-job",       bn: "অন্যান্য",                    en: "Other" }
  ];

  /* ---------- ফ্রিল্যান্স দক্ষতা ---------- */
  var SKILLS = [
    { slug: "graphic-design",  bn: "গ্রাফিক ডিজাইন",              en: "Graphic Design" },
    { slug: "video-editing",   bn: "ভিডিও এডিটিং",               en: "Video Editing" },
    { slug: "web-dev",         bn: "ওয়েব ডেভেলপমেন্ট",            en: "Web Development" },
    { slug: "app-dev",         bn: "অ্যাপ ডেভেলপমেন্ট",           en: "App Development" },
    { slug: "content-writing", bn: "কনটেন্ট রাইটিং",              en: "Content Writing" },
    { slug: "translation",     bn: "অনুবাদ",                     en: "Translation" },
    { slug: "typing-bangla",   bn: "বাংলা/ইংরেজি টাইপিং",         en: "Bangla / English Typing" },
    { slug: "digital-marketing", bn: "ডিজিটাল মার্কেটিং",         en: "Digital Marketing" },
    { slug: "social-media-mgmt", bn: "সোশ্যাল মিডিয়া ম্যানেজমেন্ট", en: "Social Media Management" },
    { slug: "virtual-assistant", bn: "ভার্চুয়াল অ্যাসিস্ট্যান্ট",  en: "Virtual Assistant" },
    { slug: "photography",     bn: "ফটোগ্রাফি",                  en: "Photography" },
    { slug: "voiceover",       bn: "ভয়েস ওভার",                 en: "Voice-over" },
    { slug: "online-teaching", bn: "অনলাইন শিক্ষাদান",            en: "Online Teaching" },
    { slug: "other-skill",     bn: "অন্যান্য",                    en: "Other" }
  ];

  /* ---------- বেতনের একক ---------- */
  var SALARY_UNITS = [
    { slug: "month",      bn: "মাসিক",          en: "per month" },
    { slug: "week",       bn: "সাপ্তাহিক",       en: "per week" },
    { slug: "day",        bn: "দৈনিক",          en: "per day" },
    { slug: "hour",       bn: "ঘণ্টায়",         en: "per hour" },
    { slug: "project",    bn: "প্রজেক্ট প্রতি",   en: "per project" },
    { slug: "negotiable", bn: "আলোচনা সাপেক্ষ",  en: "Negotiable" }
  ];

  /* ---------- ফিল্টারের বেতন-পরিসীমা (শুধু মাসিক ধরে; ধাপ ৯-এ ব্যবহার; ইচ্ছামতো বদলান) ---------- */
  var SALARY_BANDS = [
    { slug: "any",     min: 0,     max: 0,      bn: "যেকোনো",          en: "Any" },
    { slug: "to-3k",   min: 0,     max: 3000,   bn: "৩,০০০ পর্যন্ত",     en: "Up to 3,000" },
    { slug: "3k-6k",   min: 3000,  max: 6000,   bn: "৩,০০০–৬,০০০",      en: "3,000–6,000" },
    { slug: "6k-10k",  min: 6000,  max: 10000,  bn: "৬,০০০–১০,০০০",     en: "6,000–10,000" },
    { slug: "10k-plus",min: 10000, max: 0,      bn: "১০,০০০+",          en: "10,000+" }
  ];

  /* ---------- অভিভাবকের শিক্ষক-পছন্দ / টিউটরের নিজের লিঙ্গ (Rules: '' | male | female) ---------- */
  var GENDERS = [
    { slug: "",       bn: "যে কেউ",   en: "Any" },
    { slug: "male",   bn: "ছেলে",     en: "Male" },
    { slug: "female", bn: "মেয়ে",    en: "Female" }
  ];

  /* ---------- সপ্তাহে কয়দিন (টিউশন) ---------- */
  var DAYS = [0, 1, 2, 3, 4, 5, 6, 7]; // 0 = উল্লেখ নেই

  /* ---------- রিপোর্টের কারণ (Rules: jobs_reports.reason) ---------- */
  var REPORT_REASONS = [
    { slug: "scam",          bn: "প্রতারণার সন্দেহ",              en: "Suspected scam" },
    { slug: "advance",       bn: "অগ্রিম টাকা চাইছে",              en: "Asking for advance payment" },
    { slug: "fake",          bn: "ভুয়া/ভুল তথ্য",                 en: "Fake / wrong information" },
    { slug: "inappropriate", bn: "অনুপযুক্ত বা আপত্তিকর",           en: "Inappropriate content" },
    { slug: "filled",        bn: "পদ পূরণ হয়ে গেছে, তবু আছে",      en: "Already filled" },
    { slug: "other",         bn: "অন্যান্য",                       en: "Other" }
  ];

  /* ---------- পোস্টের অবস্থা ---------- */
  var STATUSES = [
    { slug: "pending",  bn: "অনুমোদনের অপেক্ষায়", en: "Pending" },
    { slug: "approved", bn: "প্রকাশিত",           en: "Live" },
    { slug: "closed",   bn: "বন্ধ",               en: "Closed" },
    { slug: "rejected", bn: "বাতিল",              en: "Rejected" }
  ];

  /* ---------- নিরাপত্তা-সতর্কতা (যোগাযোগের আগে দেখানো হবে, ধাপ ৮) ---------- */
  var SAFETY = {
    all: {
      bn: [
        "কোনো অবস্থাতেই অগ্রিম টাকা (রেজিস্ট্রেশন, ফি, ডিপোজিট) দেবেন না।",
        "প্রথম দেখা কোনো পাবলিক জায়গায় করুন এবং কাউকে জানিয়ে যান।",
        "ব্যাংক/বিকাশ পিন, OTP বা পাসওয়ার্ড কাউকে বলবেন না।",
        "সন্দেহ হলে পোস্টটি রিপোর্ট করুন।"
      ],
      en: [
        "Never pay any advance money (registration, fee, deposit).",
        "Meet in a public place first and tell someone where you are going.",
        "Never share bank/bKash PINs, OTPs or passwords.",
        "If something feels wrong, report the post."
      ]
    },
    tuition: {
      bn: [
        "বাসায় প্রথম দিন যাওয়ার আগে অভিভাবকের সঙ্গে ফোনে কথা বলুন।",
        "অভিভাবক: শিক্ষকের কলেজ-পরিচয় ও আগের অভিজ্ঞতা নিজে যাচাই করে নিন।"
      ],
      en: [
        "Speak to the guardian by phone before the first home visit.",
        "Guardians: verify the tutor's college identity and experience yourself."
      ]
    },
    job: {
      bn: [
        "কাজের জায়গা ও নিয়োগকর্তার পরিচয় নিজে দেখে নিন।",
        "কাজ শুরুর আগে বেতন ও সময় লিখিত/মেসেজে নিশ্চিত করুন।"
      ],
      en: [
        "Check the workplace and the employer's identity yourself.",
        "Confirm pay and hours in writing/message before you start."
      ]
    }
  };

  /* ---------- সহায়ক ---------- */
  var SLUG_RE = /^[a-z0-9-]{2,40}$/;
  var LISTS = {
    types: TYPES, modes: MODES, zones: ZONES, areas: AREAS, levels: LEVELS,
    subjects: SUBJECTS, jobKinds: JOB_KINDS, skills: SKILLS,
    salaryUnits: SALARY_UNITS, genders: GENDERS, reportReasons: REPORT_REASONS, statuses: STATUSES
  };

  function copy(a) { return a.map(function (o) { var c = {}; for (var k in o) c[k] = o[k]; return c; }); }
  function find(list, slug) {
    for (var i = 0; i < list.length; i++) if (list[i].slug === slug) return list[i];
    return null;
  }

  var JobsData = {
    LIMITS: LIMITS,
    SAFETY: SAFETY,
    DAYS: DAYS,
    SALARY_BANDS: SALARY_BANDS,

    /* তালিকা (কপি দেয়, যাতে বাইরে থেকে বদলে না যায়) */
    types:         function () { return copy(TYPES); },
    modes:         function () { return copy(MODES); },
    zones:         function () { return copy(ZONES); },
    areas:         function (zone) { return copy(zone ? AREAS.filter(function (a) { return a.zone === zone; }) : AREAS); },
    levels:        function () { return copy(LEVELS); },
    salaryUnits:   function () { return copy(SALARY_UNITS); },
    genders:       function () { return copy(GENDERS); },
    reportReasons: function () { return copy(REPORT_REASONS); },
    statuses:      function () { return copy(STATUSES); },

    /* কোনো ধরনের পোস্টে "cats" হিসেবে কোন তালিকা (বিষয়/কাজ/দক্ষতা) দেখাবে */
    cats: function (type) {
      var t = find(TYPES, type);
      if (!t) return [];
      return copy(t.catsFrom === "subjects" ? SUBJECTS : t.catsFrom === "jobKinds" ? JOB_KINDS : SKILLS);
    },
    catsLabelKey: function (type) {
      var t = find(TYPES, type);
      if (!t) return "";
      return t.catsFrom === "subjects" ? "বিষয়" : t.catsFrom === "jobKinds" ? "কাজের ধরন" : "দক্ষতা";
    },

    /* নির্দিষ্ট আইটেম: JobsData.get("areas", "dhanmondi") */
    get: function (listName, slug) {
      var list = LISTS[listName];
      return list ? find(list, slug) : null;
    },

    /* লেবেল: JobsData.label("areas", "dhanmondi", "bn") → "ধানমন্ডি"
     * "cats" ও "all" ব্যবহার করা যায় (সব তালিকায় খুঁজে) */
    label: function (listName, slug, lang) {
      lang = lang === "en" ? "en" : "bn";
      var item = null;
      if (listName === "cats") {
        item = find(SUBJECTS, slug) || find(JOB_KINDS, slug) || find(SKILLS, slug);
      } else if (LISTS[listName]) {
        item = find(LISTS[listName], slug);
      }
      return item ? (item[lang] || item.bn || slug) : slug;
    },
    labels: function (listName, slugs, lang) {
      var self = this;
      return (slugs || []).map(function (s) { return self.label(listName, s, lang); });
    },

    /* slug-গুলো আদৌ তালিকায় আছে কিনা (ফর্ম যাচাইয়ে ব্যবহার হবে) */
    isKnown: function (listName, slug) {
      if (listName === "cats") return !!(find(SUBJECTS, slug) || find(JOB_KINDS, slug) || find(SKILLS, slug));
      return !!(LISTS[listName] && find(LISTS[listName], slug));
    },

    /* বেতনের লেখা: salaryText(3000, 5000, "month") → "৳৩,০০০–৫,০০০ / মাসিক" */
    salaryText: function (min, max, unit, lang) {
      lang = lang === "en" ? "en" : "bn";
      var u = find(SALARY_UNITS, unit);
      if (!u || unit === "negotiable") return u ? u[lang] : "";
      function num(n) {
        var s = Number(n).toLocaleString("en-US");
        return lang === "bn" ? s.replace(/[0-9]/g, function (d) { return "০১২৩৪৫৬৭৮৯".charAt(+d); }) : s;
      }
      var amt;
      if (!min && !max) return u[lang];
      amt = (min === max || !max) ? num(min || max) : num(min) + "–" + num(max);
      return "৳" + amt + (lang === "bn" ? " / " : " ") + u[lang];
    },

    /* জমা-সীমার দিনের চাবি: Rules-এ UTC দিন (YYYYMMDD) ধরা হয় */
    dayKey: function (date) {
      var d = date || new Date();
      return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
    },
    limitId: function (uid, date) { return uid + "_" + this.dayKey(date); },

    /* নিজস্ব পরীক্ষা: কনসোলে JobsData.selfCheck() — সমস্যা থাকলে তালিকা দেয়, ঠিক থাকলে [] */
    selfCheck: function () {
      var problems = [];
      var names = Object.keys(LISTS);
      names.forEach(function (n) {
        var seen = {};
        LISTS[n].forEach(function (it) {
          if (n !== "genders" && n !== "types" && !SLUG_RE.test(it.slug)) problems.push(n + ": অবৈধ slug → " + it.slug);
          if (seen[it.slug]) problems.push(n + ": ডুপ্লিকেট slug → " + it.slug);
          seen[it.slug] = 1;
          if (!it.bn || !it.en) problems.push(n + ": নাম অসম্পূর্ণ → " + it.slug);
        });
      });
      // cats তিন তালিকা মিলিয়ে একই slug দুবার থাকা চলবে না
      var cs = {};
      SUBJECTS.concat(JOB_KINDS, SKILLS).forEach(function (it) {
        if (cs[it.slug]) problems.push("cats: একাধিক তালিকায় একই slug → " + it.slug);
        cs[it.slug] = 1;
        if (it.slug.length > 30) problems.push("cats: slug ৩০ অক্ষরের বেশি → " + it.slug);
      });
      LEVELS.forEach(function (it) { if (it.slug.length > 19) problems.push("levels: slug ১৯ অক্ষরের বেশি → " + it.slug); });
      // সবচেয়ে খারাপ ক্ষেত্রে (৬টি লম্বা slug) Rules-এর সীমার ভেতরে থাকে কিনা
      var maxCat = Math.max.apply(null, SUBJECTS.concat(JOB_KINDS, SKILLS).map(function (i) { return i.slug.length; }));
      if (maxCat * LIMITS.maxCats + (LIMITS.maxCats - 1) > 200) problems.push("cats: ৬টি বাছলে ২০০ অক্ষর ছাড়াতে পারে");
      var maxLvl = Math.max.apply(null, LEVELS.map(function (i) { return i.slug.length; }));
      if (maxLvl * LIMITS.maxLevels + (LIMITS.maxLevels - 1) > 120) problems.push("levels: ৬টি বাছলে ১২০ অক্ষর ছাড়াতে পারে");
      var maxArea = Math.max.apply(null, AREAS.map(function (i) { return i.slug.length; }));
      if (maxArea * LIMITS.maxAreas + (LIMITS.maxAreas - 1) > 200) problems.push("areas: ৫টি বাছলে ২০০ অক্ষর ছাড়াতে পারে");
      // অঞ্চল ঠিক আছে কিনা
      AREAS.forEach(function (a) { if (!find(ZONES, a.zone)) problems.push("areas: অজানা zone → " + a.slug); });
      // ধরন → তালিকা সংযোগ
      TYPES.forEach(function (t) { if (!{ subjects: 1, jobKinds: 1, skills: 1 }[t.catsFrom]) problems.push("types: catsFrom ভুল → " + t.slug); });
      return problems;
    }
  };

  root.JobsData = JobsData;
})(typeof window !== "undefined" ? window : globalThis);
