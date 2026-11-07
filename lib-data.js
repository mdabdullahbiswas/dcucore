/* lib-data.js — DCU Core লাইব্রেরির মূল তালিকা
 *
 * এখানে আছে: ৭ কলেজ, ২৪ বিভাগ, ৪ বর্ষ, কোর্স সাজেশন (কভার পেজ থেকে নেওয়া), ফাইলের ধরন ও পরীক্ষার ধরন।
 * সব নাম বাংলা (bn) ও ইংরেজি (en) দুইভাবে আছে।
 *
 * এই তালিকা হলো "শুরুর মান"। অ্যাডমিন পরে Firestore-এর lib_meta-তে যা যোগ/সম্পাদনা করবেন,
 * LibData.merge(docs) দিয়ে তা এর সঙ্গে মিশে যাবে।
 *
 * lib_meta ডকুমেন্টের গঠন (ধাপ ১০-এ অ্যাডমিন প্যানেল এগুলো লিখবে):
 *   কলেজ   : { type:'college',    slug, bn, en, order?, active? }
 *   বিভাগ  : { type:'department', slug, bn, en, colleges?:[কলেজ-slug…], active? }
 *   কোর্স  : { type:'course',     dept, year, code, en, bn?, opt?, active? }
 *   active:false দিলে ওই আইটেম লুকিয়ে যায় (ডিফল্ট আইটেমও)।
 *
 * slug-এর নিয়ম (Rules-এর সঙ্গে মেলানো): ছোট ইংরেজি অক্ষর, সংখ্যা ও হাইফেন, ২–৪০ অক্ষর।
 *
 * ব্যবহার: <script src="lib-data.js"></script> দিলে window.LibData পাওয়া যাবে।
 */
(function (root) {
  "use strict";

  /* ---------- কলেজ ---------- */
  var COLLEGES = [
    { slug: "dhaka-college",        bn: "ঢাকা কলেজ",                          en: "Dhaka College" },
    { slug: "eden-mohila-college",  bn: "ইডেন মহিলা কলেজ",                    en: "Eden Mohila College" },
    { slug: "titumir-college",      bn: "সরকারি তিতুমীর কলেজ",                en: "Govt. Titumir College" },
    { slug: "bangla-college",       bn: "সরকারি বাঙলা কলেজ",                  en: "Govt. Bangla College" },
    { slug: "badrunnesa-college",   bn: "বেগম বদরুন্নেসা সরকারি মহিলা কলেজ",  en: "Begum Badrunnesa Govt. Mohila College" },
    { slug: "suhrawardy-college",   bn: "সরকারি শহীদ সোহরাওয়ার্দী কলেজ",      en: "Govt. Shaheed Suhrawardy College" },
    { slug: "kabi-nazrul-college",  bn: "কবি নজরুল সরকারি কলেজ",              en: "Kabi Nazrul Govt. College" }
  ];

  /* ---------- বিভাগ ----------
   * colleges ফিল্ড না থাকলে বিভাগটি সব কলেজেই দেখাবে।
   * কোন কলেজে কোন বিভাগ আছে তার অফিশিয়াল তালিকা পেলে এখানে colleges: ["…"] যোগ করুন (বা অ্যাডমিন প্যানেল থেকে)। */
  var DEPARTMENTS = [
    { slug: "bangla",                  bn: "বাংলা",                       en: "Bangla" },
    { slug: "english",                 bn: "ইংরেজি",                      en: "English" },
    { slug: "arabic",                  bn: "আরবি",                        en: "Arabic" },
    { slug: "history",                 bn: "ইতিহাস",                      en: "History" },
    { slug: "philosophy",              bn: "দর্শন",                       en: "Philosophy" },
    { slug: "islamic-history-culture", bn: "ইসলামের ইতিহাস ও সংস্কৃতি",   en: "Islamic History & Culture" },
    { slug: "islamic-studies",         bn: "ইসলামিক স্টাডিজ",             en: "Islamic Studies" },
    { slug: "economics",               bn: "অর্থনীতি",                    en: "Economics" },
    { slug: "political-science",       bn: "রাষ্ট্রবিজ্ঞান",              en: "Political Science" },
    { slug: "sociology",               bn: "সমাজবিজ্ঞান",                 en: "Sociology" },
    { slug: "social-work",             bn: "সমাজকর্ম",                    en: "Social Work" },
    { slug: "mathematics",             bn: "গণিত",                        en: "Mathematics" },
    { slug: "statistics",              bn: "পরিসংখ্যান",                  en: "Statistics" },
    { slug: "physics",                 bn: "পদার্থবিজ্ঞান",                en: "Physics" },
    { slug: "chemistry",               bn: "রসায়ন",                      en: "Chemistry" },
    { slug: "botany",                  bn: "উদ্ভিদবিজ্ঞান",               en: "Botany" },
    { slug: "zoology",                 bn: "প্রাণিবিদ্যা",                 en: "Zoology" },
    { slug: "geography-environment",   bn: "ভূগোল ও পরিবেশ",              en: "Geography & Environment" },
    { slug: "psychology",              bn: "মনোবিজ্ঞান",                  en: "Psychology" },
    { slug: "home-economics",          bn: "গার্হস্থ্য অর্থনীতি",          en: "Home Economics" },
    { slug: "management",              bn: "ব্যবস্থাপনা",                 en: "Management" },
    { slug: "accounting",              bn: "হিসাববিজ্ঞান",                en: "Accounting" },
    { slug: "marketing",               bn: "মার্কেটিং",                   en: "Marketing" },
    { slug: "finance-banking",         bn: "ফিন্যান্স অ্যান্ড ব্যাংকিং",   en: "Finance & Banking" }
  ];

  /* ---------- বর্ষ ---------- */
  var YEARS = [
    { n: 1, bn: "১ম বর্ষ", en: "1st Year" },
    { n: 2, bn: "২য় বর্ষ", en: "2nd Year" },
    { n: 3, bn: "৩য় বর্ষ", en: "3rd Year" },
    { n: 4, bn: "৪র্থ বর্ষ", en: "4th Year" }
  ];

  /* ---------- ফাইলের ধরন (Rules-এর তালিকার সঙ্গে হুবহু মেলে) ---------- */
  var FILE_TYPES = [
    { id: "note",     bn: "নোট",      en: "Notes" },
    { id: "question", bn: "প্রশ্ন",    en: "Question Paper" },
    { id: "solution", bn: "সমাধান",   en: "Solution" },
    { id: "slide",    bn: "স্লাইড",    en: "Slides" },
    { id: "book",     bn: "বই",       en: "Book" },
    { id: "syllabus", bn: "সিলেবাস",  en: "Syllabus" },
    { id: "lab",      bn: "ল্যাব",     en: "Lab / Practical" },
    { id: "other",    bn: "অন্যান্য",  en: "Other" }
  ];

  /* ---------- পরীক্ষার ধরন (Rules-এর তালিকার সঙ্গে হুবহু মেলে) ---------- */
  var EXAM_TYPES = [
    { id: "none",       bn: "প্রযোজ্য নয়",   en: "Not applicable" },
    { id: "quiz",       bn: "কুইজ",          en: "Quiz" },
    { id: "midterm",    bn: "মিডটার্ম",       en: "Midterm" },
    { id: "final",      bn: "ফাইনাল",        en: "Final" },
    { id: "assignment", bn: "অ্যাসাইনমেন্ট",  en: "Assignment" },
    { id: "other",      bn: "অন্যান্য",       en: "Other" }
  ];

  /* ---------- কোর্স সাজেশন ----------
   * সূত্র: কভার পেজের (cover.js) বিভাগভিত্তিক কোর্স তালিকা — এনইউ-ভিত্তিক অনার্স পেপার কোড।
   * ফরম্যাট: [কোড, নাম, বর্ষ, ঐচ্ছিক?]।
   * কভার পেজে অর্থনীতি ছাড়া বাকিগুলোর শুধু ২য় বর্ষের কোড আছে, তাই সেগুলোর বর্ষ ২।
   * যে বিভাগের কোর্স এখানে নেই, জমাদাতা নিজে কোড ও নাম লিখবেন; অ্যাডমিন পরে যোগ করতে পারবেন। */
  var ENG = ["221109", "English (Compulsory)", 2];
  var POL = ["221909", "Political Organization and Political System of UK and USA", 2];
  var SOC = ["222009", "Sociology of Bangladesh", 2];
  var BSC = ["222115", "Bangladesh Society and Culture", 2];

  var COURSE_ROWS = {
    "bangla": [
      ["221001", "History of Bengali Literature-1 (Ancient and Medieval)", 2],
      ["221003", "Poetry of Medieval Age", 2],
      ["221005", "Bengali Poetry-2", 2],
      ["221007", "Bengali Drama-1", 2],
      SOC, BSC, POL, ENG
    ],
    "english": [
      ["221101", "Introduction to Drama", 2],
      ["221103", "Romantic Poetry", 2],
      ["221105", "Advanced Reading and Writing", 2],
      ["221107", "History of English Literature", 2],
      SOC, BSC, POL
    ],
    "arabic": [
      ["221201", "Classical Poetry", 2],
      ["221203", "Communicative Arabic-2", 2],
      ["221205", "Arabic Grammar (Nahu)", 2],
      ["221207", "History of Arabic Literature (750-1258 A.D)", 2],
      ["221209", "Islamic Ideology-2", 2],
      POL, ENG
    ],
    "economics": [
      /* ১ম বর্ষ */
      ["212201", "Basic Microeconomics", 1],
      ["212203", "Basic Macroeconomics", 1],
      ["212205", "Basic Mathematics", 1],
      ["212207", "Basic Statistics", 1],
      ["211501", "History of the Emergence of Independent Bangladesh", 1],
      ["212009", "Introducing Sociology", 1],
      ["212111", "Introduction to Social Work", 1],
      /* ২য় বর্ষ */
      ["222201", "Intermediate Microeconomics", 2],
      ["222203", "Mathematical Economics", 2],
      ["222205", "Introduction to Business (In English/Bengali)", 2],
      ["222207", "Computer and Information Technology", 2],
      POL, SOC, BSC, ENG,
      /* ৩য় বর্ষ */
      ["232201", "Intermediate Macroeconomics", 3],
      ["232203", "Statistics for Economics", 3],
      ["232205", "Studies on Bangladesh Economy", 3],
      ["232207", "Development Economics", 3],
      ["232209", "International Economics I", 3],
      ["232211", "Public Finance", 3],
      ["232213", "Urban Economics", 3],
      ["232215", "Agricultural and Rural Economics", 3],
      /* ৪র্থ বর্ষ */
      ["242201", "Money, Banking and Finance", 4],
      ["242203", "International Economics-II", 4],
      ["242205", "Research Methodology", 4],
      ["242207", "Industrial Economics", 4],
      ["242209", "Environmental and Resource Economics", 4],
      ["242211", "Population and Health Economics", 4],
      ["242213", "Economic Thought", 4],
      /* ৪র্থ বর্ষ · ঐচ্ছিক (যেকোনো দুটি) */
      ["242215", "Econometrics", 4, true],
      ["242217", "Economic Systems and Development Patterns", 4, true],
      ["242219", "Economics of Planning", 4, true],
      ["242221", "Islamic Economics", 4, true],
      ["242222", "Viva-voce", 4]
    ],
    "chemistry": [
      ["222801", "Physical Chemistry-II", 2],
      ["222803", "Organic Chemistry", 2],
      ["222805", "Chemistry of the Representative Elements", 2],
      ["222806", "Quantitative Inorganic Analysis (Practical)", 2],
      ["222707", "Physics-III (Electricity and Modern Physics)", 2],
      ["222708", "Physics-IV (Physics Practical)", 2],
      ["223707", "Calculus-II", 2],
      ["223708", "Math Lab (Practical)", 2],
      ENG
    ],
    "botany": [
      ["223001", "Higher Cryptogams", 2],
      ["223003", "Taxonomy of Angiosperms", 2],
      ["223005", "Plant Anatomy and Embryology", 2],
      ["223006", "Practical-II", 2],
      ["222807", "General Chemistry-II", 2],
      ["222809", "Environmental Chemistry", 2],
      ["223107", "Zoology-II", 2],
      ["223108", "Zoology Practical-II", 2],
      ENG
    ],
    "geography-environment": [
      ["223201", "Geomorphology", 2],
      ["223203", "Climatology", 2],
      ["223205", "Economic Geography", 2],
      ["223206", "Practical-II", 2],
      ["222807", "General Chemistry-II", 2],
      ["222809", "Environmental Chemistry", 2],
      ["223707", "Calculus-II", 2],
      ENG
    ],
    "accounting": [
      ["222501", "Computer and Information Technology (Accounting)", 2],
      ["222503", "Taxation in Bangladesh", 2],
      ["222505", "Intermediate Accounting", 2],
      ["222507", "Business Mathematics", 2],
      ["222509", "Business Statistics", 2],
      ["222511", "Macro Economics", 2],
      ["222513", "Business Communication and Report Writing", 2]
    ],
    "finance-banking": [
      ["222401", "Business Statistics", 2],
      ["222403", "Macro Economics", 2],
      ["222405", "Business Mathematics", 2],
      ["222407", "Law and Practices of Banking and Insurance", 2],
      ["222409", "Computer and Information Technology", 2],
      ["222411", "Legal Aspects of Business", 2],
      ["222413", "Business Communication and Report Writing", 2]
    ]
  };

  /* ---------- ভেতরের সহায়ক ফাংশন ---------- */
  function copy(a) { return a.map(function (x) { var o = {}; for (var k in x) o[k] = x[k]; return o; }); }

  function buildCourses(rows) {
    var out = [];
    Object.keys(rows).forEach(function (dept) {
      rows[dept].forEach(function (r) {
        var c = { dept: dept, code: r[0], en: r[1], year: r[2] };
        if (r[3]) c.opt = true;
        out.push(c);
      });
    });
    return out;
  }

  function lang() {
    try {
      var l = root.localStorage && root.localStorage.getItem("dcu-lang");
      if (l === "en" || l === "bn") return l;
    } catch (e) {}
    return "bn";
  }

  /* বিশেষ “সব কলেজ”: যে ফাইল সব কলেজের জন্য প্রযোজ্য। colleges() তালিকায় নেই (তাই ফিল্টার ও অ্যাডমিনের কলেজ-তালিকায় আসে না);
   * শুধু জমার ফর্মে বাছা যায়, আর college(slug) নাম দেখাতে এটিকে চেনে। */
  var ALL_COLLEGE = { slug: "all-colleges", bn: "সব কলেজ", en: "All colleges" };

  /* বর্তমান তালিকা (ডিফল্ট + অ্যাডমিনের যোগ করা) — merge() এটি বদলায় */
  var state = {
    colleges: copy(COLLEGES),
    departments: copy(DEPARTMENTS),
    courses: buildCourses(COURSE_ROWS)
  };

  function byId(list, key, id) {
    for (var i = 0; i < list.length; i++) if (list[i][key] === id) return list[i];
    return null;
  }

  var LibData = {
    YEARS: YEARS,
    ALL_COLLEGE: ALL_COLLEGE,
    FILE_TYPES: FILE_TYPES,
    EXAM_TYPES: EXAM_TYPES,

    /* বর্তমান ভাষায় নাম (bn/en); না থাকলে অন্য ভাষার নাম */
    name: function (item, l) {
      if (!item) return "";
      l = l || lang();
      return (l === "en" ? item.en || item.bn : item.bn || item.en) || "";
    },

    colleges: function () { return state.colleges.slice(); },
    college: function (slug) { return slug === ALL_COLLEGE.slug ? ALL_COLLEGE : byId(state.colleges, "slug", slug); },

    /* কলেজ দিলে শুধু সেই কলেজের বিভাগ; না দিলে সব বিভাগ */
    departments: function (collegeSlug) {
      return state.departments.filter(function (d) {
        return !collegeSlug || collegeSlug === ALL_COLLEGE.slug || !d.colleges || !d.colleges.length || d.colleges.indexOf(collegeSlug) > -1;
      });
    },
    department: function (slug) { return byId(state.departments, "slug", slug); },

    /* বিভাগ (ও ঐচ্ছিক বর্ষ) অনুযায়ী কোর্স সাজেশন, কোড অনুযায়ী সাজানো */
    courses: function (deptSlug, year) {
      return state.courses.filter(function (c) {
        return c.dept === deptSlug && (!year || c.year === Number(year));
      }).sort(function (a, b) { return a.year - b.year || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0); });
    },
    year: function (n) { return byId(YEARS, "n", Number(n)); },
    fileType: function (id) { return byId(FILE_TYPES, "id", id); },
    examType: function (id) { return byId(EXAM_TYPES, "id", id); },

    /* কোন বিভাগে কোর্স সাজেশন আছে */
    hasCourses: function (deptSlug) { return LibData.courses(deptSlug).length > 0; },

    /* Firestore-এর lib_meta ডকুমেন্টের তালিকা এনে মেশায়: একই slug/কোড হলে নতুনটি বসে, active:false হলে লুকায় */
    merge: function (docs) {
      (docs || []).forEach(function (d) {
        if (!d || !d.type) return;
        var list, key, id;
        if (d.type === "college")        { list = state.colleges;    key = "slug"; id = d.slug; }
        else if (d.type === "department") { list = state.departments; key = "slug"; id = d.slug; }
        else if (d.type === "course") {
          var i, found = -1;
          for (i = 0; i < state.courses.length; i++) {
            var c = state.courses[i];
            if (c.dept === d.dept && c.code === d.code && Number(c.year) === Number(d.year)) { found = i; break; }
          }
          if (d.active === false) { if (found > -1) state.courses.splice(found, 1); return; }
          var item = { dept: d.dept, code: d.code, en: d.en || "", year: Number(d.year) };
          if (d.bn) item.bn = d.bn;
          if (d.opt) item.opt = true;
          if (found > -1) state.courses[found] = item; else state.courses.push(item);
          return;
        } else return;

        if (!id) return;
        var idx = -1;
        for (var j = 0; j < list.length; j++) if (list[j][key] === id) { idx = j; break; }
        if (d.active === false) { if (idx > -1) list.splice(idx, 1); return; }
        var o = {};
        for (var k in d) if (k !== "type" && k !== "active") o[k] = d[k];
        if (idx > -1) list[idx] = o; else list.push(o);
      });
      if (typeof LibData.onChange === "function") LibData.onChange();
    },

    /* ডিফল্ট অবস্থায় ফেরা (পরীক্ষার জন্য) */
    reset: function () {
      state.colleges = copy(COLLEGES);
      state.departments = copy(DEPARTMENTS);
      state.courses = buildCourses(COURSE_ROWS);
    },

    onChange: null
  };

  root.LibData = LibData;
})(window);
