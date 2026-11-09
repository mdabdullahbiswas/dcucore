/* dcu-search.js
 * Site-wide search palette for DCUCore (Ctrl/Cmd + K, "/" or the 🔍 button in the header).
 * Loaded on demand by dcu-layout.js — pages never include this file directly.
 *
 * Searches: tools, cover-page types, site pages and every FAQ question.
 * Works in Bangla and English at the same time (the page language only
 * decides which label is shown, not what can be matched).
 *
 * Public API:  window.DCUSearch.open([query])  ·  .close()  ·  .toggle()
 */
(function () {
  "use strict";
  if (window.DCUSearch) return;

  var root = document.documentElement;
  var RECENT_KEY = "dcu-search-recent";
  var nav = window.DCU_NAV || {};
  var TOOLS = nav.TOOLS || [];
  var TOOL_META = nav.TOOL_META || {};
  var COVER_TYPES = nav.COVER_TYPES || [];
  var pageOfPath = nav.pageOfPath || function (p) { return p; };

  /* ---------- helpers ---------- */
  function lang() { return root.getAttribute("data-lang") === "en" ? "en" : "bn"; }
  function pick(pair) { return pair[lang() === "en" ? 1 : 0]; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var BN_DIGITS = "০১২৩৪৫৬৭৮৯";
  /* lower-case, Bangla digits -> 0-9, drop nukta / zero-width marks / punctuation so spelling variants still match */
  function norm(s) {
    s = String(s == null ? "" : s);
    try { s = s.normalize("NFC"); } catch (e) { /* old browser */ }
    return s
      .toLowerCase()
      .replace(/[০-৯]/g, function (d) { return BN_DIGITS.indexOf(d); })
      .replace(/[\u09BC\u200C\u200D]/g, "")
      .replace(/[.,;:!?()[\]{}"'`“”‘’|\\/_\-+]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* edit distance <= 1 (typo tolerance for words of 4+ characters) */
  function near(a, b) {
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 1) return false;
    var i = 0, j = 0, miss = 0;
    while (i < la && j < lb) {
      if (a.charAt(i) === b.charAt(j)) { i++; j++; continue; }
      if (++miss > 1) return false;
      if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
    }
    return miss + (la - i) + (lb - j) <= 1;
  }

  /* ---------- index ---------- */
  var ICON = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10M10 20v-6h4v6"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    cover: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    blood: '<path d="M12 3s6 6.2 6 10.5A6 6 0 016 13.5C6 9.2 12 3 12 3z"/><path d="M9.5 14a2.6 2.6 0 002.5 2.5"/>',
    event: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M12 13l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5L11 15z"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v15H6a2 2 0 00-2 2z"/><path d="M4 20a2 2 0 002 2h13v-4M8 7h7"/>',
    job: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    rules: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M8.8 12l2.4 2.4 4.2-4.6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/>',
    plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    faq: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.6a2.6 2.6 0 015.1.6c0 1.8-2.6 2.2-2.6 3.8M12 17.2h.01"/>',
    chat: '<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/><path d="M8.5 11h7M8.5 14.5h4"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0112 7.6a4.2 4.2 0 017.5 2.6c0 5.7-7.5 10.3-7.5 10.3z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8h.01"/>',
    tool: '<path d="M14.7 6.3a4 4 0 005 5L21 12.6 12.6 21a2.1 2.1 0 01-3-3L18 9.7"/><path d="M14.7 6.3L11 10"/>'
  };

  /* pages: [href, bn, en, keywords, [descBn, descEn], icon] */
  var PAGES = [
    ["/", "হোম", "Home", "home main homepage শুরু প্রথম পাতা", ["DCUCore-এর প্রথম পাতা", "The DCUCore home page"], "home"],
    ["/tools", "সব টুলস", "All Tools", "tools toolkit utilities টুল সরঞ্জাম", ["সব টুল এক জায়গায়", "Every tool in one place"], "grid"],
    ["/cover", "কভার পেজ", "Cover Pages", "cover page front page assignment lab report কভার পেজ প্রচ্ছদ", ["১০ ধরনের কভার পেজ বানান", "Make a cover page in 10 types"], "cover"],
    ["/blood", "ডোনার ডিরেক্টরি", "Donor Directory", "blood donor donation রক্ত রক্তদান রক্তদাতা ব্লাড ডোনার group", ["রক্তদাতা খুঁজুন বা নিজে নাম লিখুন", "Find blood donors or register as one"], "blood"],
    ["/events", "ক্যাম্পাস ইভেন্ট", "Campus Events", "event events program seminar workshop ইভেন্ট অনুষ্ঠান কর্মশালা সেমিনার", ["ক্যাম্পাসের আসন্ন ইভেন্ট", "Upcoming events on campus"], "event"],
    ["/library", "লাইব্রেরি", "Library", "library book books note notes pdf question bank লাইব্রেরি বই নোট প্রশ্নব্যাংক পড়ার", ["বই, নোট ও প্রশ্ন একসাথে", "Books, notes and past questions"], "book"],
    ["/library-submit", "লাইব্রেরিতে ফাইল জমা দিন", "Submit a file to the Library", "upload submit contribute share book note pdf জমা আপলোড দিন বই নোট", ["নিজের বই বা নোট শেয়ার করুন", "Share your own book or notes"], "upload"],
    ["/library-rules", "লাইব্রেরির নিয়মাবলি", "Library Rules", "rules policy removal copyright remove takedown নিয়ম অপসারণ কপিরাইট", ["নিয়ম ও অপসারণ অনুরোধ", "Rules and removal requests"], "rules"],
    ["/jobs", "জব ও টিউশন", "Jobs & Tuition", "job jobs tuition tutor part time career চাকরি টিউশন টিউশনি কাজ", ["জব ও টিউশনের বিজ্ঞপ্তি", "Job and tuition listings"], "job"],
    ["/jobs-post", "নতুন জব/টিউশন পোস্ট", "Post a Job or Tuition", "post new job tuition vacancy hire নতুন পোস্ট বিজ্ঞপ্তি দিন", ["জব বা টিউশনের বিজ্ঞপ্তি দিন", "Publish a job or tuition listing"], "plus"],
    ["/jobs-my", "আমার পোস্ট", "My Posts", "my posts listings manage edit আমার পোস্ট", ["আপনার দেওয়া পোস্টগুলো", "The posts you published"], "user"],
    ["/jobs-rules", "জব ও টিউশনের নিয়মাবলি", "Jobs & Tuition Rules", "rules policy disclaimer নিয়ম দায়মুক্তি", ["নিয়মাবলি ও দায়মুক্তি", "Rules and disclaimer"], "rules"],
    ["/faq", "প্রশ্নোত্তর", "FAQ", "faq help questions answers প্রশ্ন উত্তর সাহায্য জিজ্ঞাসা", ["সাধারণ প্রশ্নের উত্তর", "Answers to common questions"], "faq"],
    ["/feedback", "মতামত দিন", "Give Feedback", "feedback suggestion bug report contact মতামত পরামর্শ সমস্যা অভিযোগ", ["পরামর্শ বা সমস্যা জানান", "Send a suggestion or report a problem"], "chat"],
    ["/support", "সাহায্য করুন", "Support Us", "support donate donation help contribute bkash nagad সাহায্য দান অনুদান বিকাশ নগদ", ["সাইটটি চালু রাখতে পাশে দাঁড়ান", "Help keep the site running"], "heart"],
    ["/about", "আমাদের সম্পর্কে", "About", "about developer team contact who আমাদের সম্পর্কে ডেভেলপার যোগাযোগ", ["সাইট ও ডেভেলপারের পরিচিতি", "About the site and its developer"], "info"]
  ];

  /* extra spellings / synonyms for specific tools and cover types */
  var EXTRA = {
    "/tools#card": "share card id card sharing profile card কার্ড পরিচয়",
    "/tools#routine": "class routine timetable schedule রুটিন সময়সূচি ক্লাস",
    "/tools#cgpa": "cgpa gpa grade point result সিজিপিএ জিপিএ গ্রেড",
    "/tools#exam": "exam planner study timer pomodoro focus পরীক্ষা পড়া প্ল্যানার",
    "/dcu-calendar": "calendar date bangla english holiday ক্যালেন্ডার তারিখ বাংলা ছুটি",
    "/cv": "cv resume curriculum vitae biodata সিভি বায়োডাটা জীবনবৃত্তান্ত",
    "/tools#frame": "frame profile photo picture dp ফ্রেম ছবি প্রোফাইল",
    "/tools#pdf": "pdf image merge convert jpg png পিডিএফ ছবি",
    "/tools#calc": "scientific calculator math sin cos log ক্যালকুলেটর গণিত",
    "/tools#result": "result portal marks রেজাল্ট ফলাফল"
  };
  var COVER_EXTRA = {
    assignment: "এসাইনমেন্ট assignment homework",
    lab: "ল্যাব lab report practical experiment",
    presentation: "প্রেজেন্টেশন presentation slide ppt",
    project: "প্রজেক্ট project",
    thesis: "থিসিস thesis dissertation research গবেষণা",
    quiz: "কুইজ quiz class test",
    exam: "পরীক্ষা exam answer script",
    declaration: "ঘোষণাপত্র declaration",
    approval: "অনুমোদনপত্র approval supervisor certificate প্রত্যয়ন",
    acknowledgment: "কৃতজ্ঞতা acknowledgement acknowledgment ধন্যবাদ",
    contents: "সূচিপত্র contents index table of contents"
  };

  var DOCS = [];
  var TYPE_ORDER = ["tool", "cover", "page", "faq"];
  var TYPE_LABEL = {
    tool: ["টুলস", "Tools"],
    cover: ["কভার পেজ", "Cover pages"],
    page: ["পেজ", "Pages"],
    faq: ["প্রশ্নোত্তর", "FAQ"]
  };
  var TYPE_LIMIT = { tool: 8, cover: 6, page: 7, faq: 6 };
  var TYPE_BASE = { tool: 6, cover: 4, page: 5, faq: 0 };

  function mkDoc(o) {
    o.nt = [norm(o.t[0]), norm(o.t[1])];
    o.nk = norm(o.k || "");
    o.nd = norm((o.d || []).join(" "));
    o.nw = (o.nt.join(" ") + " " + o.nk).split(" ");
    return o;
  }

  function buildStatic() {
    DOCS = [];
    TOOLS.forEach(function (t) {
      var m = TOOL_META[t.href] || {};
      DOCS.push(mkDoc({
        id: "t:" + t.href, type: "tool", href: t.href, t: [t.bn, t.en],
        k: EXTRA[t.href] || "", d: m.d || ["", ""], ic: m.ic || ICON.tool
      }));
    });
    COVER_TYPES.forEach(function (c) {
      DOCS.push(mkDoc({
        id: "c:" + c.v, type: "cover", href: "/cover#" + c.v,
        t: [c.bn + " কভার পেজ", c.en + " Cover Page"],
        k: (COVER_EXTRA[c.v] || "") + " cover page কভার পেজ " + c.bn + " " + c.en,
        d: [c.bn + " বানান", "Make a " + c.en.toLowerCase() + " cover"], ic: c.ic
      }));
    });
    PAGES.forEach(function (p) {
      DOCS.push(mkDoc({
        id: "p:" + p[0], type: "page", href: p[0], t: [p[1], p[2]], k: p[3], d: p[4], ic: ICON[p[5]] || ICON.info
      }));
    });
  }

  function addFaq() {
    DOCS = DOCS.filter(function (d) { return d.type !== "faq"; });
    var F = window.DCU_FAQ;
    if (!F || !F.items) return;
    var cats = {};
    (F.cats || []).forEach(function (c) { cats[c.id] = [c.bn, c.en]; });
    F.items.forEach(function (it) {
      var cat = cats[it.cat] || ["", ""];
      DOCS.push(mkDoc({
        id: "f:" + it.id, type: "faq", href: "/faq#" + it.id,
        t: [it.q.bn, it.q.en], k: cat[0] + " " + cat[1],
        d: [it.a.bn, it.a.en], ic: ICON.faq, cat: cat
      }));
    });
  }

  var faqState = 0; /* 0 = not asked, 1 = loading, 2 = done */
  function ensureFaq() {
    if (window.DCU_FAQ) { if (faqState !== 2) { faqState = 2; addFaq(); if (isOpen) render(); } return; }
    if (faqState) return;
    faqState = 1;
    var s = document.createElement("script");
    s.src = "/faq-data.js";
    s.async = true;
    s.onload = function () { faqState = 2; addFaq(); if (isOpen) render(); };
    s.onerror = function () { faqState = 2; };
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------- ranking ---------- */
  function scoreToken(doc, q) {
    var best = 0, s, i, w;
    for (i = 0; i < 2; i++) {
      var title = doc.nt[i];
      if (!title) continue;
      if (title === q) s = 120;
      else if (title.indexOf(q) === 0) s = 105;
      else if ((" " + title).indexOf(" " + q) > -1) s = 95;
      else if (title.indexOf(q) > -1) s = 70;
      else s = 0;
      if (s > best) best = s;
    }
    if (best >= 95) return best;
    if (doc.nk) {
      if ((" " + doc.nk).indexOf(" " + q) > -1) best = Math.max(best, 62);
      else if (doc.nk.indexOf(q) > -1) best = Math.max(best, 46);
    }
    if (best) return best;
    if (doc.nd && doc.nd.indexOf(q) > -1) return doc.type === "faq" ? 22 : 18;
    if (q.length >= 4) {
      for (i = 0; i < doc.nw.length; i++) {
        w = doc.nw[i];
        if (w.length >= 4 && near(q, w)) return 34;
      }
    }
    return 0;
  }

  function search(query) {
    var nq = norm(query);
    if (!nq) return [];
    var toks = nq.split(" ");
    var out = [];
    DOCS.forEach(function (doc) {
      var total = 0, ok = true, i, sc;
      for (i = 0; i < toks.length; i++) {
        sc = scoreToken(doc, toks[i]);
        if (!sc) { ok = false; break; }
        total += sc;
      }
      if (!ok) return;
      total = total / toks.length + TYPE_BASE[doc.type];
      if (doc.nt[0].indexOf(nq) === 0 || doc.nt[1].indexOf(nq) === 0) total += 20;
      out.push({ doc: doc, score: total });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  }

  /* wrap matched pieces of a label in <mark> (works on the raw label, case-insensitive) */
  function highlight(label, query) {
    var safe = esc(label);
    var toks = norm(query).split(" ").filter(function (t) { return t.length > 0; });
    if (!toks.length) return safe;
    var low = label.toLowerCase();
    var ranges = [];
    toks.forEach(function (t) {
      var from = 0, at;
      while ((at = low.indexOf(t, from)) > -1) { ranges.push([at, at + t.length]); from = at + t.length; }
    });
    if (!ranges.length) return safe;
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [ranges[0]];
    for (var i = 1; i < ranges.length; i++) {
      var last = merged[merged.length - 1];
      if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
      else merged.push(ranges[i]);
    }
    var html = "", pos = 0;
    merged.forEach(function (r) {
      html += esc(label.slice(pos, r[0])) + "<mark>" + esc(label.slice(r[0], r[1])) + "</mark>";
      pos = r[1];
    });
    return html + esc(label.slice(pos));
  }

  /* a short snippet of the FAQ answer around the match */
  function snippet(doc, query) {
    var text = String(doc.d[lang() === "en" ? 1 : 0] || "").replace(/\s+/g, " ");
    if (!text) return "";
    var toks = norm(query).split(" ");
    var low = text.toLowerCase(), at = -1;
    for (var i = 0; i < toks.length && at < 0; i++) at = low.indexOf(toks[i]);
    if (at < 0) return text.length > 110 ? text.slice(0, 110) + "…" : text;
    var from = Math.max(0, at - 30);
    var s = text.slice(from, from + 120);
    return (from > 0 ? "…" : "") + s + (from + 120 < text.length ? "…" : "");
  }

  /* ---------- recent ---------- */
  function getRecent() {
    try {
      var r = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      return Array.isArray(r) ? r.filter(function (x) { return typeof x === "string"; }).slice(0, 4) : [];
    } catch (e) { return []; }
  }
  function pushRecent(id) {
    try {
      var r = getRecent().filter(function (x) { return x !== id; });
      r.unshift(id);
      localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 4)));
    } catch (e) { /* storage blocked */ }
  }
  function clearRecent() {
    try { localStorage.removeItem(RECENT_KEY); } catch (e) { /* ignore */ }
  }
  function docById(id) {
    for (var i = 0; i < DOCS.length; i++) if (DOCS[i].id === id) return DOCS[i];
    return null;
  }

  var POPULAR = ["t:/tools#routine", "t:/tools#cgpa", "t:/cv", "p:/cover", "p:/library", "p:/jobs"];

  /* ---------- UI ---------- */
  var CSS = [
    ".dls{position:fixed;inset:0;z-index:10050;display:flex;align-items:flex-start;justify-content:center;padding:min(11vh,96px) 16px 16px;visibility:hidden;opacity:0;pointer-events:none;transition:opacity .2s ease,visibility .2s}",
    ".dls.is-open{visibility:visible;opacity:1;pointer-events:auto}",
    ".dls-bd{position:absolute;inset:0;background:rgba(6,12,26,.55);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}",
    ".dls-box{position:relative;width:min(640px,100%);max-height:min(78vh,640px);display:flex;flex-direction:column;overflow:hidden;border-radius:18px;background:var(--dl-surface,#fff);color:var(--dl-ink,#0F172A);border:1px solid var(--dl-line,#E2E8F0);box-shadow:0 30px 80px -20px rgba(6,12,26,.55),0 0 0 1px rgba(212,175,55,.22);transform:translateY(-10px) scale(.98);transition:transform .28s cubic-bezier(.2,.9,.25,1.1)}",
    ".dls.is-open .dls-box{transform:none}",
    ".dls-top{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--dl-line,#E2E8F0)}",
    ".dls-top>svg{flex:none;color:var(--dl-gold-d,#B98A2C)}",
    ".dls-in{flex:1;min-width:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;font-size:1.05rem;padding:4px 0}",
    ".dls-in::placeholder{color:var(--dl-ink-2,#475569);opacity:.8}",
    ".dls-in::-webkit-search-cancel-button{display:none}",
    ".dls-esc{flex:none;font:inherit;font-size:.7rem;font-weight:700;letter-spacing:.04em;padding:4px 8px;border-radius:7px;border:1px solid var(--dl-line,#E2E8F0);background:var(--dl-surface-2,#F1F5F9);color:var(--dl-ink-2,#475569);cursor:pointer}",
    ".dls-esc:hover{border-color:var(--dl-gold,#D4AF37)}",
    ".dls-body{overflow-y:auto;overscroll-behavior:contain;padding:8px 8px 10px;scroll-padding:40px 0 10px}",
    ".dls-gh{display:flex;align-items:center;justify-content:space-between;margin:0;padding:10px 10px 5px;font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--dl-gold-d,#9a7414)}",
    ".dls-gh button{font:inherit;font-size:.68rem;letter-spacing:0;text-transform:none;font-weight:600;border:0;background:none;color:var(--dl-ink-2,#475569);cursor:pointer;padding:0 4px;text-decoration:underline}",
    ".dls-it{display:flex;align-items:center;gap:12px;padding:9px 10px;border-radius:12px;color:inherit;text-decoration:none;cursor:pointer;position:relative}",
    ".dls-it.is-sel{background:var(--dl-hover,rgba(212,175,55,.16));box-shadow:inset 0 0 0 1px rgba(184,138,62,.55)}",
    ".dls-ic{flex:none;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#1C4A85,#0A1A33);box-shadow:0 4px 10px rgba(10,26,51,.25)}",
    ".dls-ic svg{width:17px;height:17px}",
    ".dls-it.is-sel .dls-ic{background:linear-gradient(135deg,#F3E6C4,#D9B26A 50%,#B88A3E);color:#1d1400}",
    ".dls-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}",
    ".dls-t{font-weight:650;font-size:.95rem;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".dls-d{font-size:.76rem;line-height:1.35;color:var(--dl-ink-2,#475569);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".dls-t mark,.dls-d mark{background:rgba(212,175,55,.35);color:inherit;border-radius:3px;padding:0 1px}",
    ".dls-go{flex:none;color:var(--dl-ink-2,#475569);opacity:0;transform:translateX(-4px);transition:opacity .15s,transform .15s}",
    ".dls-it.is-sel .dls-go{opacity:1;transform:none}",
    ".dls-empty{padding:28px 18px 24px;text-align:center;color:var(--dl-ink-2,#475569)}",
    ".dls-empty b{display:block;color:var(--dl-ink,#0F172A);font-size:1rem;margin-bottom:4px}",
    ".dls-empty p{margin:0 0 14px;font-size:.85rem;line-height:1.5}",
    ".dls-empty a{display:inline-block;margin:3px 4px;padding:7px 14px;border-radius:99px;border:1px solid var(--dl-line,#E2E8F0);color:var(--dl-ink,#0F172A);text-decoration:none;font-size:.82rem;font-weight:600}",
    ".dls-empty a:hover{border-color:var(--dl-gold,#D4AF37);background:var(--dl-hover,rgba(212,175,55,.16))}",
    ".dls-foot{display:flex;align-items:center;gap:16px;padding:9px 16px;border-top:1px solid var(--dl-line,#E2E8F0);background:var(--dl-surface-2,#F1F5F9);font-size:.72rem;color:var(--dl-ink-2,#475569)}",
    ".dls-foot span{display:inline-flex;align-items:center;gap:6px}",
    ".dls-foot kbd,.dl-kbd{font:inherit;font-size:.68rem;font-weight:700;padding:1px 6px;border-radius:5px;border:1px solid var(--dl-line,#E2E8F0);background:var(--dl-surface,#fff);color:var(--dl-ink,#0F172A);box-shadow:0 1px 0 var(--dl-line,#E2E8F0)}",
    ".dls-cnt{margin-left:auto}",
    "html:not([data-lang=\"en\"]) .dls .en-only,html[data-lang=\"en\"] .dls .bn-only{display:none}",
    ".dl-search{position:relative}",
    "body.dls-lock{overflow:hidden}",
    "@media(max-width:720px){",
    ".dls{padding:0}",
    ".dls-box{width:100%;max-height:none;height:100%;border-radius:0;border:0;transform:translateY(14px)}",
    ".dls-in{font-size:16px}",
    ".dls-foot{display:none}",
    ".dls-body{flex:1;padding-bottom:max(14px,env(safe-area-inset-bottom))}",
    ".dls-top{padding-top:max(14px,env(safe-area-inset-top))}",
    "}",
    "@media(prefers-reduced-motion:reduce){.dls,.dls-box,.dls-go{transition:none!important}}"
  ].join("");

  var el = null, input, body, countEl, isOpen = false, items = [], sel = -1, lastFocus = null, curQuery = "";
  var SEARCH_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>';
  var ARROW_SVG = '<svg class="dls-go" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function tr(bn, en) { return lang() === "en" ? en : bn; }

  function build() {
    if (el) return;
    if (!document.getElementById("dlSearchCss")) {
      var st = document.createElement("style");
      st.id = "dlSearchCss";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    el = document.createElement("div");
    el.className = "dls";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "সার্চ");
    el.innerHTML =
      '<div class="dls-bd" data-dls-close></div>' +
      '<div class="dls-box">' +
      '<div class="dls-top">' + SEARCH_SVG.replace('width="20" height="20"', 'width="22" height="22"') +
      '<input class="dls-in" type="search" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" ' +
      'role="combobox" aria-expanded="true" aria-controls="dlsList" aria-autocomplete="list">' +
      '<button type="button" class="dls-esc" data-dls-close></button></div>' +
      '<div class="dls-body" id="dlsList" role="listbox"></div>' +
      '<div class="dls-foot"><span><kbd>↑</kbd><kbd>↓</kbd><i data-dls-h1></i></span><span><kbd>↵</kbd><i data-dls-h2></i></span><span><kbd>Esc</kbd><i data-dls-h3></i></span><span class="dls-cnt" aria-live="polite"></span></div>' +
      "</div>";
    document.body.appendChild(el);
    input = el.querySelector(".dls-in");
    body = el.querySelector(".dls-body");
    countEl = el.querySelector(".dls-cnt");

    input.addEventListener("input", function () { sel = -1; render(); });
    el.addEventListener("click", function (e) {
      if (e.target.closest("[data-dls-close]")) { close(); return; }
      var clr = e.target.closest("[data-dls-clear]");
      if (clr) { clearRecent(); render(); input.focus(); return; }
      var a = e.target.closest(".dls-it");
      if (a) { e.preventDefault(); choose(+a.getAttribute("data-i")); return; }
      var q = e.target.closest("a[data-dls-plain]");
      if (q) { close(); }
    });
    body.addEventListener("pointermove", function (e) {
      var a = e.target.closest(".dls-it");
      if (!a) return;
      var i = +a.getAttribute("data-i");
      if (i !== sel && e.pointerType !== "touch") setSel(i);
    });
    el.addEventListener("keydown", onKey);

    /* keep Bangla/English labels fresh while open */
    new MutationObserver(function () { if (isOpen) { labels(); render(); } })
      .observe(root, { attributes: true, attributeFilter: ["data-lang"] });
  }

  function labels() {
    input.placeholder = tr("টুল, পেজ বা প্রশ্ন খুঁজুন…", "Search tools, pages or questions…");
    input.setAttribute("aria-label", tr("সার্চ", "Search"));
    el.setAttribute("aria-label", tr("সার্চ", "Search"));
    el.querySelector(".dls-esc").textContent = tr("বন্ধ", "Esc");
    el.querySelector("[data-dls-h1]").textContent = tr("বেছে নিন", "Navigate");
    el.querySelector("[data-dls-h2]").textContent = tr("খুলুন", "Open");
    el.querySelector("[data-dls-h3]").textContent = tr("বন্ধ", "Close");
  }

  function row(doc, i, q) {
    var title = pick(doc.t);
    var sub = doc.type === "faq" && q ? snippet(doc, q) : (doc.type === "faq" ? (doc.cat ? pick(doc.cat) : "") : pick(doc.d));
    return (
      '<a class="dls-it" id="dls-o' + i + '" role="option" aria-selected="false" data-i="' + i + '" href="' + esc(doc.href) + '">' +
      '<span class="dls-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + doc.ic + "</svg></span>" +
      '<span class="dls-tx"><span class="dls-t">' + highlight(title, q) + "</span>" +
      (sub ? '<span class="dls-d">' + (q && doc.type === "faq" ? highlight(sub, q) : esc(sub)) + "</span>" : "") +
      "</span>" + ARROW_SVG + "</a>"
    );
  }

  function render() {
    if (!el) return;
    var q = input.value;
    curQuery = q;
    var html = "";
    items = [];

    if (!norm(q)) {
      var rec = getRecent().map(docById).filter(Boolean);
      var pop = POPULAR.map(docById).filter(Boolean).filter(function (d) { return rec.indexOf(d) < 0; });
      if (rec.length) {
        html += '<p class="dls-gh"><span>' + tr("সম্প্রতি খোলা", "Recent") + '</span><button type="button" data-dls-clear>' + tr("মুছুন", "Clear") + "</button></p>";
        rec.forEach(function (d) { html += row(d, items.length, ""); items.push(d); });
      }
      html += '<p class="dls-gh"><span>' + tr("জনপ্রিয়", "Popular") + "</span></p>";
      pop.forEach(function (d) { html += row(d, items.length, ""); items.push(d); });
      countEl.textContent = "";
    } else {
      var hits = search(q);
      var groups = {};
      hits.forEach(function (h) { (groups[h.doc.type] = groups[h.doc.type] || []).push(h); });
      /* tools and pages first, FAQ answers last */
      var order = TYPE_ORDER.filter(function (t) { return groups[t]; });
      order.forEach(function (t) {
        html += '<p class="dls-gh"><span>' + pick(TYPE_LABEL[t]) + "</span></p>";
        groups[t].slice(0, TYPE_LIMIT[t]).forEach(function (h) { html += row(h.doc, items.length, q); items.push(h.doc); });
      });
      if (!items.length) {
        html =
          '<div class="dls-empty"><b>' + "“" + esc(q.trim()) + tr("” পাওয়া যায়নি", "” not found") + "</b>" +
          "<p>" + tr("অন্য শব্দে চেষ্টা করুন, বাংলা বা English যেকোনোটাই চলবে।", "Try another word. Bangla or English both work.") + "</p>" +
          '<a data-dls-plain href="/faq">' + tr("প্রশ্নোত্তর দেখুন", "Browse the FAQ") + "</a>" +
          '<a data-dls-plain href="/feedback">' + tr("আমাদের জানান", "Tell us what you need") + "</a></div>";
        countEl.textContent = tr("০টি ফলাফল", "0 results");
      } else {
        var bnN = String(items.length).replace(/\d/g, function (d) { return BN_DIGITS.charAt(+d); });
        countEl.textContent = tr(bnN + "টি ফলাফল", items.length + (items.length === 1 ? " result" : " results"));
      }
    }
    body.innerHTML = html;
    if (sel < 0 || sel >= items.length) sel = items.length ? 0 : -1;
    setSel(sel);
    body.scrollTop = 0;
  }

  function setSel(i) {
    var prev = body.querySelector(".dls-it.is-sel");
    if (prev) { prev.classList.remove("is-sel"); prev.setAttribute("aria-selected", "false"); }
    sel = i;
    if (i < 0) { input.removeAttribute("aria-activedescendant"); return; }
    var cur = body.querySelector('.dls-it[data-i="' + i + '"]');
    if (!cur) return;
    cur.classList.add("is-sel");
    cur.setAttribute("aria-selected", "true");
    input.setAttribute("aria-activedescendant", cur.id);
    var top = cur.offsetTop, bot = top + cur.offsetHeight;
    if (top < body.scrollTop + 34) body.scrollTop = Math.max(0, top - 34);
    else if (bot > body.scrollTop + body.clientHeight) body.scrollTop = bot - body.clientHeight + 8;
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!items.length) return;
      var d = e.key === "ArrowDown" ? 1 : -1;
      setSel((sel + d + items.length) % items.length);
    } else if (e.key === "Home" && e.target !== input) {
      e.preventDefault(); if (items.length) setSel(0);
    } else if (e.key === "End" && e.target !== input) {
      e.preventDefault(); if (items.length) setSel(items.length - 1);
    } else if (e.key === "Enter") {
      if (e.target.closest && e.target.closest("[data-dls-close],[data-dls-clear],a[data-dls-plain]")) return;
      e.preventDefault();
      if (sel >= 0) choose(sel);
    } else if (e.key === "Tab") {
      /* keep focus inside the dialog */
      var f = el.querySelectorAll("input,button,a[href]");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* go to a result. Same page + #hash switches the tab/question in place; anything else is a normal visit. */
  function choose(i) {
    var doc = items[i];
    if (!doc) return;
    pushRecent(doc.id);
    var href = doc.href;
    var hashAt = href.indexOf("#");
    var hash = hashAt < 0 ? "" : href.slice(hashAt + 1);
    var samePage = pageOfPath(href) === pageOfPath(location.pathname);
    close(true);
    if (samePage) {
      if (hash) {
        if (location.hash === "#" + hash) {
          /* same hash already: nudge listeners that only react to changes */
          try { window.dispatchEvent(new HashChangeEvent("hashchange")); } catch (e) { /* ignore */ }
          try { window.dispatchEvent(new PopStateEvent("popstate")); } catch (e) { /* ignore */ }
        } else {
          location.hash = hash;
        }
        var t = document.getElementById(hash);
        if (t && t.scrollIntoView) setTimeout(function () { t.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    location.href = href;
  }

  function open(q) {
    build();
    ensureFaq();
    if (isOpen) { if (typeof q === "string") { input.value = q; render(); } input.focus(); return; }
    isOpen = true;
    lastFocus = document.activeElement;
    labels();
    input.value = typeof q === "string" ? q : "";
    sel = -1;
    render();
    el.classList.add("is-open");
    document.body.classList.add("dls-lock");
    var btn = document.querySelector("[data-dl-search]");
    if (btn) btn.setAttribute("aria-expanded", "true");
    setTimeout(function () { input.focus(); input.select(); }, 30);
  }

  function close(skipFocus) {
    if (!isOpen) return;
    isOpen = false;
    el.classList.remove("is-open");
    document.body.classList.remove("dls-lock");
    var btn = document.querySelector("[data-dl-search]");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (skipFocus !== true && lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
  }

  buildStatic();
  if (window.DCU_FAQ) { faqState = 2; addFaq(); }

  window.DCUSearch = {
    open: open,
    close: close,
    toggle: function () { if (isOpen) close(); else open(); },
    isOpen: function () { return isOpen; },
    /* exposed for quick checks / tests */
    _search: function (q) { return search(q).map(function (h) { return { id: h.doc.id, score: Math.round(h.score) }; }); },
    _count: function () { return DOCS.length; }
  };

  document.dispatchEvent(new CustomEvent("dcu:search-ready"));
})();
