/* jobs.js — জব ও টিউশন পেজ (ধাপ ৩ কাঠামো + ধাপ ৭ পাবলিক তালিকা)
 *
 * ধাপ ৭: Firestore থেকে শুধু status == "approved" পোস্ট আনে (Rules-এর সঙ্গে মেলানো), ক্লায়েন্টে
 * মেয়াদ-উত্তীর্ণ ও filled পোস্ট বাদ দেয়, নতুন থেকে পুরনো ক্রমে ধরন অনুযায়ী রঙিন কার্ড আঁকে।
 * ধাপ ৮: কার্ড খুললে বিস্তারিত (ডায়ালগ) → নিরাপত্তা-সতর্কতা → "কল করুন"/"WhatsApp" বাটন।
 * ফোন/WhatsApp থাকে jobs_posts/{id}/private/contact-এ; শুধু Google-লগইন করা ব্যবহারকারীর জন্য পড়া হয়
 * (Rules-ও তাই চায়) এবং লগইন ছাড়া কখনো আনা হয় না।
 * ডায়ালগ খুললে ঠিকানায় #p-<পোস্ট-আইডি> বসে, তাই মোবাইলের ব্যাক বাটন দিয়ে বন্ধ হয় এবং লিংক খুলে সরাসরি পোস্ট দেখা যায়।
 *
 * ধাপ ৯: ফিল্টার = ধরন, পদ্ধতি, অঞ্চল, নির্দিষ্ট এলাকা, বিষয়/কাজ, শ্রেণি, বেতন (মাসিক ধরে) ও সার্চ।
 * সাজানো = নতুন আগে / মেয়াদ শেষ হতে যাচ্ছে আগে। বর্তমান ফিল্টার ঠিকানার ?type=…&zone=… অংশে থাকে, তাই লিংক শেয়ার করা যায়।
 * কোনো Firestore ইনডেক্স লাগে না: কোয়েরিতে শুধু একটি where আছে, ক্রম সাজানো ক্লায়েন্টে হয়।
 *
 * ধাপ ১০: (ক) বুকমার্ক: ব্রাউজারের localStorage-এ (এই ডিভাইসে), লগইন ছাড়াই; কার্ড ও বিস্তারিতে বাটন, তালিকায় \"বুকমার্ক\" ছাঁকা।
 *         (খ) রিপোর্ট: বিস্তারিতে \"রিপোর্ট করুন\" → jobs_reports/{পোস্ট}_{uid} (লগইন লাগে; একজন একটি পোস্ট একবার)।
 *         (গ) আমার পোস্ট (নবায়ন, বন্ধ, পূরণ হয়েছে, মোছা) আলাদা পেজে: jobs-my.html + jobs-my.js।
 */
(function () {
  "use strict";

  var D = window.JobsData;
  var FB_BASE = "https://www.gstatic.com/firebasejs/10.8.0/";
  var FB_CFG = {
    apiKey: "AIzaSyBgaBKzAAwzHI7ahGKqzbrX9MknWWIm9j0",
    authDomain: "dcu-blood-bank.firebaseapp.com",
    projectId: "dcu-blood-bank",
    storageBucket: "dcu-blood-bank.firebasestorage.app",
    messagingSenderId: "835221249900",
    appId: "1:835221249900:web:facf545941825a4efa5d49"
  };
  var FETCH_LIMIT = 300;            // একবারে সর্বোচ্চ এতগুলো approved পোস্ট আনা হয়
  var PAGE = 24;                    // একসঙ্গে এতগুলো কার্ড দেখায়, বাকিটা "আরও দেখান"-এ
  var NEW_MS = 3 * 24 * 3600 * 1000; // "নতুন" ব্যাজ: ৩ দিন
  var EXPIRING_MS = 3 * 24 * 3600 * 1000; // "মেয়াদ শেষ হচ্ছে" ব্যাজ: শেষ ৩ দিন
  var TIMEOUT_MS = 10000;
  var PHOTO_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function bi(bn, en) { return '<span class="jobs-bn">' + esc(bn) + '</span><span class="jobs-en">' + esc(en) + "</span>"; }
  function bnNum(n) { return Number(n).toLocaleString("bn-BD"); }
  function svg(path, n) {
    return '<svg viewBox="0 0 24 24" width="' + n + '" height="' + n + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>";
  }

  var ICON_PATHS = {
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    store: '<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>',
    laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 20h20"/>'
  };
  var PIN = '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>';
  var MODE_ICON = '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>';
  var CAL = '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>';
  var CHECK = '<path d="M5 12.5l4.5 4.5L19 7.5"/>';

  /* ---------- অবস্থা ---------- */
  var state = { type: "", mode: "", zone: "", area: "", cat: "", level: "", pay: "", sort: "new", q: "", saved: false };
  var posts = [];            // Firestore থেকে আসা, স্বাভাবিক করা পোস্ট (নতুন আগে)
  var view = [];             // বর্তমান ফিল্টারে মেলা পোস্ট
  var shownN = PAGE;         // কতগুলো কার্ড আঁকা হয়েছে
  var loaded = false, failed = false, loadId = 0;
  var skeletonHTML = "";
  var els = {};

  /* ---------- বুকমার্ক (ধাপ ১০): শুধু এই ব্রাউজারে, localStorage-এ; নতুনটি আগে ---------- */
  var BM_KEY = "jobs:bookmarks", BM_MAX = 100, ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
  var BOOKMARK = '<path d="M6 3h12v18l-6-4.5L6 21z"/>';
  var bm = readBm();
  function readBm() {
    try {
      var a = JSON.parse(localStorage.getItem(BM_KEY) || "[]");
      return Array.isArray(a) ? a.filter(function (x) { return typeof x === "string" && ID_RE.test(x); }).slice(0, BM_MAX) : [];
    } catch (e) { return []; }
  }
  function saveBm() { try { localStorage.setItem(BM_KEY, JSON.stringify(bm)); return true; } catch (e) { return false; } }   // সংরক্ষণ না হলে এই সেশনে চলে
  function isBm(id) { return bm.indexOf(id) >= 0; }
  /* ফেরত: "on" | "off" | "full" */
  function toggleBm(id) {
    var i = bm.indexOf(id);
    if (i >= 0) { bm.splice(i, 1); saveBm(); return "off"; }
    if (bm.length >= BM_MAX) return "full";
    bm.unshift(id); saveBm(); return "on";
  }
  function bmBtnHTML(id, cls) {
    return '<button type="button" class="' + cls + '" data-bm="' + esc(id) + '" aria-pressed="' + (isBm(id) ? "true" : "false") + '">' +
      svg(BOOKMARK, 20) + '<span class="jobs-sr">' + bi("বুকমার্ক", "Bookmark") + "</span></button>";
  }

  function filtersActive() { return !!(state.saved || state.type || state.mode || state.zone || state.area || state.cat || state.level || state.pay || state.q); }
  function otherFilters() { return !!(state.type || state.mode || state.zone || state.area || state.cat || state.level || state.pay || state.q); }

  /* ---------- Firestore ---------- */
  function withTimeout(p, ms) {
    return new Promise(function (res, rej) {
      var t = setTimeout(function () { rej(new Error("timeout")); }, ms);
      p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
    });
  }
  function tsMs(t) { return t && typeof t.toMillis === "function" ? t.toMillis() : 0; }
  function str(v) { return typeof v === "string" ? v : ""; }
  function intv(v) { return typeof v === "number" && isFinite(v) ? v : 0; }
  function strArr(a) { return Array.isArray(a) ? a.filter(function (x) { return typeof x === "string"; }) : []; }

  function lab(list, slug, lang) { return D.label(list, slug, lang); }

  /* ডকুমেন্ট → ছোট, নিরাপদ অবজেক্ট (সব মান যাচাই করে; অচেনা ধরন বাদ) */
  function normalize(id, d) {
    if (!d || !D.get("types", d.type)) return null;
    var p = {
      id: id, type: d.type,
      title: str(d.title), desc: str(d.desc),
      mode: D.isKnown("modes", d.mode) ? d.mode : "offline",
      areas: strArr(d.areas), cats: strArr(d.cats), levels: strArr(d.levels),
      days: intv(d.days), timeNote: str(d.timeNote),
      salaryMin: intv(d.salaryMin), salaryMax: intv(d.salaryMax),
      salaryUnit: D.isKnown("salaryUnits", d.salaryUnit) ? d.salaryUnit : "negotiable",
      orgName: str(d.orgName), authorName: str(d.authorName), authorUid: str(d.authorUid),
      genderPref: str(d.genderPref), tutorGender: str(d.tutorGender),
      college: str(d.college), dept: str(d.dept),
      photo: d.type === "tutor_profile" && PHOTO_RE.test(str(d.photo)) ? d.photo : "",
      filled: d.filled === true, verified: d.authorVerified === true,
      createdMs: tsMs(d.createdAt), expiresMs: tsMs(d.expiresAt)
    };
    /* সার্চের জন্য একটি ছোট হাতের লেখার স্ট্রিং (বাংলা ও ইংরেজি নামসহ) */
    var parts = [p.title, p.desc, p.orgName, lab("types", p.type, "bn"), lab("types", p.type, "en")];
    p.areas.forEach(function (s) { parts.push(lab("areas", s, "bn"), lab("areas", s, "en")); });
    p.cats.forEach(function (s) { parts.push(lab("cats", s, "bn"), lab("cats", s, "en")); });
    p.levels.forEach(function (s) { parts.push(lab("levels", s, "bn"), lab("levels", s, "en")); });
    p.hay = parts.join(" ").toLowerCase();
    return p;
  }

  /* Firebase মডিউল একবারই লোড হয়; ইভেন্ট/অন্য পেজের মতো ডিফল্ট অ্যাপ ব্যবহার, যাতে লগইন এক থাকে */
  var fbP = null;
  function fb() {
    if (!fbP) {
      fbP = Promise.all([import(FB_BASE + "firebase-app.js"), import(FB_BASE + "firebase-firestore.js")]).then(function (m) {
        var app;
        try { app = m[0].getApp(); } catch (e) { app = m[0].initializeApp(FB_CFG); }
        return { app: app, fs: m[1], db: m[1].getFirestore(app) };
      });
      fbP.catch(function () { fbP = null; });   // ব্যর্থ হলে পরে আবার চেষ্টা করা যাবে
    }
    return fbP;
  }

  function fetchPosts() {
    return fb().then(function (f) {
      var fs = f.fs;
      /* Rules: পাবলিক শুধু approved পড়তে পারে, তাই কোয়েরিতে এই শর্ত থাকা বাধ্যতামূলক */
      return fs.getDocs(fs.query(fs.collection(f.db, "jobs_posts"), fs.where("status", "==", "approved"), fs.limit(FETCH_LIMIT)));
    }).then(function (snap) {
      var out = [];
      snap.forEach(function (doc) { var p = normalize(doc.id, doc.data()); if (p) out.push(p); });
      out.sort(function (a, b) { return b.createdMs - a.createdMs; });
      return out;
    });
  }

  function load() {
    var my = ++loadId;
    loaded = false; failed = false;
    showSkeleton();
    return withTimeout(fetchPosts(), TIMEOUT_MS).then(function (list) {
      if (my !== loadId) return;
      posts = list; loaded = true; render(); openFromHash();
      setTimeout(authInit, 1200);   // লগইনের অবস্থা আগেভাগে জেনে রাখি, যাতে ডায়ালগ দ্রুত খোলে
    }).catch(function (e) {
      if (my !== loadId) return;
      if (window.console) console.warn("jobs: তালিকা আনা যায়নি", e);
      posts = []; loaded = true; failed = true; render();
    });
  }

  /* ---------- ছাঁকা ---------- */
  function isLive(p, now) { return !p.filled && p.expiresMs > now; }   // মেয়াদ-উত্তীর্ণ ও পূরণ-হওয়া লুকানো

  /* বেতন-ফিল্টার: পোস্টের বেতন মাসিকে নিয়ে পরিসীমা মেলানো (সাপ্তাহিক ×৪, দৈনিক ×২৬; অন্য একক বা আলোচনা সাপেক্ষ বাদ) */
  var PAY_FACTOR = { month: 1, week: 4, day: 26 };
  function payOk(p) {
    var band = null;
    D.SALARY_BANDS.forEach(function (b) { if (b.slug === state.pay) band = b; });
    if (!band || band.slug === "any") return true;
    var f = PAY_FACTOR[p.salaryUnit];
    if (!f || (!p.salaryMin && !p.salaryMax)) return false;
    var lo = (p.salaryMin || p.salaryMax) * f, hi = (p.salaryMax || p.salaryMin) * f;
    return hi >= band.min && (!band.max || lo <= band.max);
  }

  function matches(p) {
    if (state.saved && !isBm(p.id)) return false;
    if (state.type && p.type !== state.type) return false;
    if (state.mode) {
      /* "সরাসরি" বা "অনলাইন" বাছলে "দুটোই" পোস্টও আসে; "দুটোই" বাছলে শুধু সেগুলো */
      if (state.mode === "both" ? p.mode !== "both" : (p.mode !== state.mode && p.mode !== "both")) return false;
    }
    /* নির্দিষ্ট এলাকা বাছলে সেটাই; নইলে অঞ্চল। শুধু-অনলাইন পোস্ট সব জায়গা থেকেই করা যায়, তাই বাদ দেওয়া হয় না */
    if (state.area) {
      if (p.areas.indexOf(state.area) < 0 && p.mode !== "online") return false;
    } else if (state.zone) {
      var inZone = p.areas.some(function (s) { var a = D.get("areas", s); return a && a.zone === state.zone; });
      if (!inZone && p.mode !== "online") return false;
    }
    if (state.cat && p.cats.indexOf(state.cat) < 0) return false;
    if (state.level && p.levels.indexOf(state.level) < 0) return false;
    if (state.pay && !payOk(p)) return false;
    if (state.q) {
      var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < words.length; i++) if (p.hay.indexOf(words[i]) < 0) return false;
    }
    return true;
  }

  /* ---------- সময় ---------- */
  function ago(ms, now) {
    var m = Math.floor((now - ms) / 60000);
    if (!ms || m < 60) return bi("এইমাত্র", "Just now");
    var h = Math.floor(m / 60);
    if (h < 24) return bi(bnNum(h) + " ঘণ্টা আগে", h + "h ago");
    var d = Math.floor(h / 24);
    if (d < 2) return bi("গতকাল", "Yesterday");
    if (d < 30) return bi(bnNum(d) + " দিন আগে", d + " days ago");
    var mo = Math.floor(d / 30);
    return bi(bnNum(mo) + " মাস আগে", mo + " mo ago");
  }

  /* ---------- কার্ড ---------- */
  function listText(list, slugs, lang, sep) { return slugs.map(function (s) { return lab(list, s, lang); }).join(sep); }

  function payHTML(p) {
    var open = !p.salaryMin && !p.salaryMax || p.salaryUnit === "negotiable";
    return open
      ? bi(lab("salaryUnits", "negotiable", "bn"), lab("salaryUnits", "negotiable", "en"))
      : bi(D.salaryText(p.salaryMin, p.salaryMax, p.salaryUnit, "bn"), D.salaryText(p.salaryMin, p.salaryMax, p.salaryUnit, "en"));
  }

  function cardHTML(p, now) {
    var t = D.get("types", p.type);
    var ico = p.photo
      ? '<img src="' + esc(p.photo) + '" alt="" loading="lazy" decoding="async">'
      : svg(ICON_PATHS[t.icon] || "", 26);

    var top = '<span class="jobs-card-type">' + bi(t.bn, t.en) + "</span>";
    if (p.createdMs && now - p.createdMs < NEW_MS) top += '<span class="jobs-badge jobs-badge-new">' + bi("নতুন", "New") + "</span>";
    if (p.expiresMs && p.expiresMs - now < EXPIRING_MS) top += '<span class="jobs-badge jobs-badge-warn">' + bi("মেয়াদ শেষ হচ্ছে", "Ending soon") + "</span>";
    if (p.verified) top += '<span class="jobs-badge jobs-badge-ok">' + svg(CHECK, 12) + bi("যাচাইকৃত", "Verified") + "</span>";

    var meta = '<li>' + svg(MODE_ICON, 15) + bi(lab("modes", p.mode, "bn"), lab("modes", p.mode, "en")) + "</li>";
    if (p.areas.length) {
      var shownA = p.areas.slice(0, 2), extraA = p.areas.length - shownA.length;
      var abn = listText("areas", shownA, "bn", "، "), aen = listText("areas", shownA, "en", ", ");
      if (extraA > 0) { abn += " +" + bnNum(extraA); aen += " +" + extraA; }
      meta += "<li>" + svg(PIN, 15) + bi(abn, aen) + "</li>";
    }
    if (p.days > 0) meta += "<li>" + svg(CAL, 15) + bi("সপ্তাহে " + bnNum(p.days) + " দিন", p.days + (p.days === 1 ? " day" : " days") + " / week") + "</li>";

    var tagSlugs = p.cats.map(function (s) { return ["cats", s]; }).concat(p.levels.map(function (s) { return ["levels", s]; }));
    var tags = tagSlugs.slice(0, 4).map(function (x) {
      return "<li>" + bi(lab(x[0], x[1], "bn"), lab(x[0], x[1], "en")) + "</li>";
    }).join("");
    if (tagSlugs.length > 4) tags += '<li class="jobs-tag-more">' + bi("+" + bnNum(tagSlugs.length - 4), "+" + (tagSlugs.length - 4)) + "</li>";

    var pay = payHTML(p);

    return '<article class="jobs-card" data-id="' + esc(p.id) + '" data-type="' + esc(p.type) + '" style="--h:' + t.hue + '">' +
      '<span class="jobs-card-ico">' + ico + "</span>" +
      '<div class="jobs-card-body">' +
        '<div class="jobs-card-top">' + top + "</div>" +
        '<h3 class="jobs-card-title"><button type="button" class="jobs-card-open" aria-haspopup="dialog">' + esc(p.title) + "</button></h3>" +
        (p.orgName ? '<p class="jobs-card-org">' + esc(p.orgName) + "</p>" : "") +
        '<ul class="jobs-meta">' + meta + "</ul>" +
        (tags ? '<ul class="jobs-tags">' + tags + "</ul>" : "") +
        '<div class="jobs-card-foot"><span class="jobs-pay">' + pay + '</span><span class="jobs-ago">' + ago(p.createdMs, now) + "</span></div>" +
      "</div>" + bmBtnHTML(p.id, "jobs-bm") + "</article>";
  }

  /* ---------- হিরোর সংখ্যা ---------- */
  function fillCounts() {
    var box = els.counts;
    if (!box || !D) return;
    var n = { types: D.types().length, areas: D.areas().length, subjects: D.cats("tuition_wanted").length };
    box.querySelectorAll("b[data-k]").forEach(function (b) {
      var v = n[b.getAttribute("data-k")];
      b.innerHTML = '<span class="jobs-bn">' + bnNum(v) + '</span><span class="jobs-en">' + v + "</span>";
    });
    box.hidden = false;
  }

  /* ---------- ধরনের কার্ড ---------- */
  function renderTypes() {
    els.types.innerHTML = D.types().map(function (t) {
      return '<button type="button" class="jobs-type" data-type="' + t.slug + '" aria-pressed="false" style="--h:' + t.hue + '">' +
        '<span class="jobs-type-ico">' + svg(ICON_PATHS[t.icon] || "", 26) + "</span>" +
        '<span class="jobs-type-txt">' +
          '<span class="jobs-type-name">' + bi(t.bn, t.en) + "</span>" +
          '<span class="jobs-type-sub">' + bi(t.short_bn, t.short_en) + "</span>" +
        "</span>" +
        '<span class="jobs-type-tick" aria-hidden="true">' + svg(CHECK, 16).replace('stroke-width="1.9"', 'stroke-width="3"') + "</span>" +
        "</button>";
    }).join("");
  }

  /* ---------- চিপ ---------- */
  function chipHTML(value, bn, en, key) {
    return '<button type="button" class="jobs-chip" data-key="' + key + '" data-val="' + esc(value) + '" aria-pressed="false">' + bi(bn, en) + "</button>";
  }
  function renderChips() {
    els.modes.innerHTML = chipHTML("", "সব", "Any", "mode") +
      D.modes().map(function (m) { return chipHTML(m.slug, m.bn, m.en, "mode"); }).join("");
    els.zones.innerHTML = chipHTML("", "সব এলাকা", "All areas", "zone") +
      D.zones().map(function (z) { return chipHTML(z.slug, z.bn, z.en, "zone"); }).join("");
  }

  /* বুকমার্ক-করা পোস্টের মধ্যে এখন যেগুলো সত্যিই দেখানো যায় (লোডের আগে সব বুকমার্ক গোনা হয়) */
  function savedCount() {
    if (!loaded || failed) return bm.length;
    var now = Date.now(), n = 0;
    posts.forEach(function (p) { if (isBm(p.id) && isLive(p, now)) n++; });
    return n;
  }

  /* ---------- UI-তে অবস্থা প্রতিফলন ---------- */
  function syncPressed() {
    els.types.querySelectorAll(".jobs-type").forEach(function (b) {
      var on = b.getAttribute("data-type") === state.type;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.classList.toggle("on", on);
    });
    [els.modes, els.zones].forEach(function (box) {
      box.querySelectorAll(".jobs-chip").forEach(function (c) {
        var key = c.getAttribute("data-key");
        var on = c.getAttribute("data-val") === state[key];
        c.setAttribute("aria-pressed", on ? "true" : "false");
        c.classList.toggle("on", on);
      });
    });
    els.qx.hidden = !state.q;
    if (els.saved) {
      els.saved.setAttribute("aria-pressed", state.saved ? "true" : "false");
      els.saved.classList.toggle("on", state.saved);
      var sn = savedCount();
      els.saved.innerHTML = svg(BOOKMARK, 16) + bi("বুকমার্ক", "Saved") + '<span class="jobs-saved-n">' + (sn ? bi(" (" + bnNum(sn) + ")", " (" + sn + ")") : "") + "</span>";
    }
    var act = filtersActive();
    els.reset.hidden = !act;
    els.share.hidden = !(otherFilters() || state.sort !== "new");
    els.emptyReset.hidden = !act || failed;
  }

  /* ---------- স্কেলেটন / খালি অবস্থা / ত্রুটি / তালিকা ---------- */
  function showSkeleton() {
    els.grid.hidden = false;
    els.grid.innerHTML = skeletonHTML;
    els.grid.setAttribute("aria-busy", "true");
    els.empty.hidden = true;
    els.moreWrap.hidden = true;
    els.status.innerHTML = bi("লোড হচ্ছে…", "Loading…");
  }

  function showEmptyBox(h, p, withCta, withRetry) {
    els.grid.hidden = true;
    els.grid.setAttribute("aria-busy", "false");
    els.moreWrap.hidden = true;
    els.empty.hidden = false;
    els.emptyH.innerHTML = h;
    els.emptyP.innerHTML = p;
    els.emptyCta.hidden = !withCta;
    els.emptyRetry.hidden = !withRetry;
  }

  function showEmpty() {
    var act = filtersActive();
    if (state.saved && !otherFilters()) {
      showEmptyBox(
        bm.length ? bi("বুকমার্ক করা কোনো চালু পোস্ট নেই", "None of your saved posts are live") : bi("এখনো কিছু বুকমার্ক করেননি", "Nothing saved yet"),
        bm.length ? bi("বুকমার্ক করা পোস্টগুলোর মেয়াদ শেষ হয়েছে বা সেগুলো সরানো হয়েছে।", "The posts you saved have expired or been removed.")
                  : bi("কার্ডের কোণার বুকমার্ক আইকনে চাপ দিলে পোস্টটি এখানে জমা থাকবে। এই ডিভাইসেই সংরক্ষিত হয়।", "Tap the bookmark icon on a card to keep it here. Bookmarks are stored on this device."),
        false, false);
      els.status.innerHTML = '<span class="jobs-bn">' + bnNum(0) + "টি পোস্ট</span>" + '<span class="jobs-en">0 posts</span>';
      return;
    }
    showEmptyBox(
      act ? bi("এই ফিল্টারে কিছু পাওয়া যায়নি", "Nothing matches these filters") : bi("এখনো কোনো পোস্ট নেই", "No posts yet"),
      act ? bi("ফিল্টার বদলে বা মুছে আবার দেখুন।", "Change or clear the filters and try again.")
          : bi("পোস্ট করুন। অ্যাডমিন অনুমোদন দিলেই এখানে সবাই দেখতে পাবে।", "Post one. It shows up here for everyone once an admin approves it."),
      true, false);
    els.status.innerHTML = '<span class="jobs-bn">' + bnNum(0) + "টি পোস্ট</span>" + '<span class="jobs-en">0 posts</span>';
  }

  function showError() {
    showEmptyBox(
      bi("তালিকা লোড করা যায়নি", "Couldn't load the posts"),
      bi("ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।", "Check your internet connection and try again."),
      false, true);
    els.status.innerHTML = bi("লোড হয়নি", "Not loaded");
  }

  function drawMore(from) {
    var now = Date.now();
    var html = view.slice(from, shownN).map(function (p) { return cardHTML(p, now); }).join("");
    if (from === 0) els.grid.innerHTML = html; else els.grid.insertAdjacentHTML("beforeend", html);
    var left = view.length - shownN;
    els.moreWrap.hidden = left <= 0;
    if (left > 0) els.more.innerHTML = bi("আরও দেখান (" + bnNum(left) + "টি বাকি)", "Show more (" + left + " left)");
  }

  function render() {
    syncPressed();
    if (!loaded) return;
    if (failed) { showError(); return; }
    var now = Date.now();
    view = posts.filter(function (p) { return isLive(p, now) && matches(p); });
    if (state.sort === "expiring") view.sort(function (a, b) { return a.expiresMs - b.expiresMs || b.createdMs - a.createdMs; });
    else view.sort(function (a, b) { return b.createdMs - a.createdMs; });
    if (!view.length) { showEmpty(); return; }
    els.empty.hidden = true;
    els.grid.hidden = false;
    els.grid.setAttribute("aria-busy", "false");
    shownN = Math.min(PAGE, view.length);
    drawMore(0);
    els.status.innerHTML = '<span class="jobs-bn">' + bnNum(view.length) + "টি পোস্ট</span>" + '<span class="jobs-en">' + view.length + (view.length === 1 ? " post" : " posts") + "</span>";
  }

  function showMore() {
    var from = shownN;
    shownN = Math.min(shownN + PAGE, view.length);
    drawMore(from);
    var c = els.grid.children[from];     // কীবোর্ড/স্ক্রিন-রিডারের ফোকাস নতুন কার্ডে
    var b = c && c.querySelector(".jobs-card-open");
    if (b) b.focus({ preventScroll: true });
  }

  /* =====================================================================
   * ধাপ ৮: বিস্তারিত ডায়ালগ, নিরাপত্তা-সতর্কতা ও যোগাযোগ
   * ===================================================================== */
  var PHONE_RE = /^01[3-9][0-9]{8}$/;
  var LD = function () { return window.LibData || null; };
  var cur = null;                     // এখন খোলা পোস্ট
  var pushed = false, closingByUs = false, hashHandled = false;
  var user = null, authKnown = false, authApi = null, authP = null;
  var contact = { id: "", state: "idle", phone: "", whatsapp: "" };   // state: idle | loading | ok | missing | denied | error
  var contactErr = null;              // [bn, en] — লগইন ব্যর্থতার বার্তা

  var LBL = {
    tuition_wanted: { cats: "বিষয়|Subjects", areas: "এলাকা|Area", time: "পড়ানোর সময়|Preferred time", pay: "মাসিক বাজেট|Budget" },
    tutor_profile:  { cats: "যে বিষয় পড়ান|Subjects taught", areas: "যেসব এলাকায় যান|Areas", time: "কখন পড়াতে পারবেন|Available time", pay: "প্রত্যাশিত ফি|Expected fee" },
    parttime:       { cats: "কাজের ধরন|Kind of work", areas: "কাজের এলাকা|Work area", time: "কাজের সময়|Working hours", pay: "বেতন|Pay" },
    freelance:      { cats: "দক্ষতা|Skills", areas: "এলাকা|Area", time: "সময়সীমা|Timing", pay: "পারিশ্রমিক|Pay" }
  };

  function curLang() { return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn"; }
  function pair(s) { var i = s.indexOf("|"); return bi(s.slice(0, i), s.slice(i + 1)); }
  function row(lbl, valHTML) { return "<div><dt>" + pair(lbl) + "</dt><dd>" + valHTML + "</dd></div>"; }
  function listBi(list, slugs) { return bi(listText(list, slugs, "bn", "، "), listText(list, slugs, "en", ", ")); }
  function fmtDate(ms) {
    var o = { day: "numeric", month: "long", year: "numeric" };
    var d = new Date(ms);
    return bi(d.toLocaleDateString("bn-BD", o), d.toLocaleDateString("en-GB", o));
  }
  function libPair(slug, kind) {
    var L = LD(); if (!slug || !L) return null;
    var it = kind === "c" ? L.college(slug) : L.department(slug);
    return it ? [L.name(it, "bn"), L.name(it, "en")] : null;
  }

  function byId(id) {
    var now = Date.now();
    for (var i = 0; i < posts.length; i++) if (posts[i].id === id) return isLive(posts[i], now) ? posts[i] : null;
    return null;
  }

  function safetyHTML(p) {
    var S = D.SAFETY, k = (p.type === "tuition_wanted" || p.type === "tutor_profile") ? S.tuition : S.job;
    var bn = S.all.bn.concat(k.bn), en = S.all.en.concat(k.en);
    return '<section class="jobs-d-sec jobs-d-safe" aria-labelledby="jobs-d-safe-h"><h3 class="jobs-d-h" id="jobs-d-safe-h">' + bi("নিরাপত্তা-সতর্কতা", "Stay safe") + "</h3><ul>" +
      bn.map(function (t, i) { return "<li>" + bi(t, en[i] || t) + "</li>"; }).join("") + "</ul></section>";
  }

  function detailHTML(p) {
    var t = D.get("types", p.type), L = LBL[p.type] || LBL.parttime, now = Date.now();
    var ico = p.photo ? '<img src="' + esc(p.photo) + '" alt="" decoding="async">' : svg(ICON_PATHS[t.icon] || "", 28);
    var top = '<span class="jobs-card-type">' + bi(t.bn, t.en) + "</span>";
    if (p.createdMs && now - p.createdMs < NEW_MS) top += '<span class="jobs-badge jobs-badge-new">' + bi("নতুন", "New") + "</span>";
    if (p.verified) top += '<span class="jobs-badge jobs-badge-ok">' + svg(CHECK, 12) + bi("যাচাইকৃত", "Verified") + "</span>";

    var rows = row("পদ্ধতি|Mode", bi(lab("modes", p.mode, "bn"), lab("modes", p.mode, "en")));
    if (p.cats.length) rows += row(L.cats, listBi("cats", p.cats));
    if (p.levels.length) rows += row("শ্রেণি|Class level", listBi("levels", p.levels));
    if (p.areas.length) rows += row(L.areas, listBi("areas", p.areas));
    if (p.days > 0) rows += row("সপ্তাহে|Days per week", bi(bnNum(p.days) + " দিন", p.days + (p.days === 1 ? " day" : " days")));
    if (p.timeNote) rows += row(L.time, esc(p.timeNote));
    rows += row(L.pay, payHTML(p));
    if (p.type === "tuition_wanted" && p.genderPref) rows += row("শিক্ষকের পছন্দ|Preferred tutor", bi(lab("genders", p.genderPref, "bn"), lab("genders", p.genderPref, "en")));
    if (p.type === "tutor_profile") {
      if (p.tutorGender) rows += row("লিঙ্গ|Gender", bi(lab("genders", p.tutorGender, "bn"), lab("genders", p.tutorGender, "en")));
      var c = libPair(p.college, "c"), dp = libPair(p.dept, "d");
      if (c || dp) {
        var bnA = [c && c[0], dp && dp[0]].filter(Boolean).join(" · "), enA = [c && c[1], dp && dp[1]].filter(Boolean).join(" · ");
        rows += row("কলেজ/বিভাগ|College / Dept", bi(bnA, enA));
      }
    }
    if (p.authorName) rows += row("পোস্টদাতা|Posted by", esc(p.authorName));

    var foot = '<div class="jobs-d-foot-row"><p class="jobs-d-foot">' + ago(p.createdMs, now) + (p.expiresMs ? " · " + bi("মেয়াদ: ", "Valid until ") + fmtDate(p.expiresMs) : "") + "</p>" +
      '<div class="jobs-d-foot-btns">' + bmBtnHTML(p.id, "jobs-btn jobs-btn-plain jobs-btn-sm jobs-d-bm") +
      '<button type="button" class="jobs-btn jobs-btn-plain jobs-btn-sm" id="jobs-d-share">' + svg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/>', 18) + bi("লিংক শেয়ার", "Share link") + "</button></div></div>" +
      '<div class="jobs-d-report" id="jobs-d-report"></div>';

    return '<header class="jobs-d-head"><span class="jobs-card-ico">' + ico + "</span><div>" +
        '<div class="jobs-card-top">' + top + "</div>" +
        '<h2 class="jobs-d-title" id="jobs-d-title">' + esc(p.title) + "</h2>" +
        (p.orgName ? '<p class="jobs-d-org">' + esc(p.orgName) + "</p>" : "") +
      "</div></header>" +
      (p.desc ? '<p class="jobs-d-desc">' + esc(p.desc) + "</p>" : "") +
      '<dl class="jobs-d-dl">' + rows + "</dl>" +
      safetyHTML(p) +
      '<section class="jobs-d-sec jobs-d-contact" id="jobs-d-contact" aria-live="polite"></section>' +
      foot;
  }

  /* ---------- WhatsApp-এ আগে থেকে লেখা বার্তা ---------- */
  function waText(p, lang) {
    var title = p.title.length > 70 ? p.title.slice(0, 70) + "…" : p.title;
    if (lang === "en") {
      if (p.type === "tuition_wanted") return "Assalamu alaikum. I saw your tuition post \"" + title + "\" on DCUCore and would like to talk about it.";
      if (p.type === "tutor_profile") return "Assalamu alaikum. I saw your tutor profile \"" + title + "\" on DCUCore and would like to talk about tuition.";
      return "Assalamu alaikum. I saw your post \"" + title + "\" on DCUCore. I am interested and would like to know more.";
    }
    if (p.type === "tuition_wanted") return "আসসালামু আলাইকুম। DCUCore-এ আপনার \"" + title + "\" টিউশনের পোস্টটি দেখেছি। এ বিষয়ে কথা বলতে চাই।";
    if (p.type === "tutor_profile") return "আসসালামু আলাইকুম। DCUCore-এ আপনার টিউটর প্রোফাইল \"" + title + "\" দেখেছি। টিউশন নিয়ে কথা বলতে চাই।";
    return "আসসালামু আলাইকুম। DCUCore-এ আপনার \"" + title + "\" পোস্টটি দেখেছি। আমি আগ্রহী, আরও জানতে চাই।";
  }

  /* ---------- যোগাযোগ অংশ ---------- */
  var ICO_PHONE = '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>';
  var ICO_CHAT = '<path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z"/>';

  function renderContact() {
    var box = $("jobs-d-contact");
    if (!box || !cur) return;
    var h = '<h3 class="jobs-d-h">' + bi("যোগাযোগ", "Contact") + "</h3>";
    if (!authKnown) {
      h += '<p class="jobs-d-note">' + bi("যাচাই হচ্ছে…", "Checking…") + "</p>";
    } else if (!user) {
      h += '<p class="jobs-d-note">' + bi("ফোন নম্বর শুধু লগইন করা ব্যবহারকারীরা দেখতে পান। এতে ভুয়া পোস্টদাতা ও স্প্যাম কমে।", "Phone numbers are visible to signed-in users only. This helps keep out fake posts and spam.") + "</p>" +
        '<button type="button" class="jobs-btn jobs-btn-call" id="jobs-d-login">' + bi("Google দিয়ে লগইন করুন", "Sign in with Google") + "</button>";
      if (contactErr) h += '<p class="jobs-d-err" role="alert">' + bi(contactErr[0], contactErr[1]) + "</p>";
    } else if (contact.id !== cur.id || contact.state === "loading" || contact.state === "idle") {
      h += '<p class="jobs-d-note">' + bi("নম্বর আনা হচ্ছে…", "Loading the number…") + "</p>";
    } else if (contact.state === "ok") {
      var lang = curLang();
      h += '<div class="jobs-d-btns"><a class="jobs-btn jobs-btn-call" href="tel:' + contact.phone + '">' + svg(ICO_PHONE, 20) + bi("কল করুন", "Call") + "</a>";
      if (contact.whatsapp) {
        h += '<a class="jobs-btn jobs-btn-wa" target="_blank" rel="noopener noreferrer" href="https://wa.me/88' + contact.whatsapp + "?text=" + encodeURIComponent(waText(cur, lang)) + '">' + svg(ICO_CHAT, 20) + "WhatsApp</a>";
      }
      h += '</div><p class="jobs-d-num">' + bi("নম্বর: ", "Number: ") + "<bdi>" + contact.phone + "</bdi></p>";
    } else {
      var msg = contact.state === "denied" ? ["এই পোস্টের নম্বর এখন দেখানো যাচ্ছে না।", "This post's number can't be shown right now."]
        : contact.state === "missing" ? ["পোস্টদাতা কোনো নম্বর রাখেননি।", "The poster hasn't left a number."]
        : ["নম্বর আনা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।", "Couldn't load the number. Check your connection and try again."];
      h += '<p class="jobs-d-err" role="alert">' + bi(msg[0], msg[1]) + "</p>";
      if (contact.state === "error") h += '<button type="button" class="jobs-btn jobs-btn-plain" id="jobs-d-retry">' + bi("আবার চেষ্টা করুন", "Try again") + "</button>";
    }
    box.innerHTML = h;
  }

  function loadContact(p) {
    contact = { id: p.id, state: "loading", phone: "", whatsapp: "" };
    renderContact();
    fb().then(function (f) {
      return f.fs.getDoc(f.fs.doc(f.db, "jobs_posts", p.id, "private", "contact"));
    }).then(function (snap) {
      if (!cur || cur.id !== p.id || !user) return;
      var d = snap.exists() ? snap.data() : null;
      var ph = d && typeof d.phone === "string" ? d.phone : "", wa = d && typeof d.whatsapp === "string" ? d.whatsapp : "";
      contact = PHONE_RE.test(ph)
        ? { id: p.id, state: "ok", phone: ph, whatsapp: PHONE_RE.test(wa) ? wa : "" }
        : { id: p.id, state: "missing", phone: "", whatsapp: "" };
      renderContact();
    }).catch(function (e) {
      if (!cur || cur.id !== p.id) return;
      contact = { id: p.id, state: e && e.code === "permission-denied" ? "denied" : "error", phone: "", whatsapp: "" };
      renderContact();
    });
  }

  function syncContact() {
    if (!cur) return;
    if (!user) { renderContact(); return; }
    if (contact.id !== cur.id || contact.state === "idle") loadContact(cur); else renderContact();
  }

  /* ---------- লগইন ---------- */
  function authInit() {
    if (!authP) {
      authP = Promise.all([fb(), import(FB_BASE + "firebase-auth.js")]).then(function (r) {
        var au = r[1], a = au.getAuth(r[0].app);
        authApi = { au: au, auth: a };
        /* সব পেজের মতো একই জায়গায় (localStorage) লগইন রাখা, নইলে এই পেজ অন্য পেজের লগইন সরিয়ে দেয় */
        var persistReady = au.setPersistence(a, au.browserLocalPersistence).catch(function () {});
        return persistReady.then(function () { return new Promise(function (res) {
          au.onAuthStateChanged(a, function (u) {
            var changed = (u ? u.uid : "") !== (user ? user.uid : "");
            user = u || null; authKnown = true;
            if (changed) contact = { id: "", state: "idle", phone: "", whatsapp: "" };
            if (changed) contactErr = null;
            syncContact(); renderReport(); res();
          });
        }); });
      });
      authP.catch(function () { authP = null; });
    }
    return authP;
  }

  function signIn() {
    if (!authApi) return;
    var au = authApi.au;
    au.signInWithPopup(authApi.auth, new au.GoogleAuthProvider()).then(function () { contactErr = null; }).catch(function (e) {
      var c = e && e.code;
      contactErr = (c === "auth/popup-closed-by-user" || c === "auth/cancelled-popup-request") ? ["লগইন সম্পূর্ণ হয়নি। আবার চেষ্টা করুন।", "Sign-in was not completed. Please try again."]
        : c === "auth/popup-blocked" ? ["ব্রাউজার পপআপ আটকেছে। পপআপ অনুমতি দিয়ে আবার চাপুন।", "Your browser blocked the pop-up. Allow pop-ups and try again."]
        : c === "auth/network-request-failed" ? ["ইন্টারনেট সংযোগ দেখুন, তারপর আবার চেষ্টা করুন।", "Check your internet connection and try again."]
        : ["লগইন করা যায়নি। আবার চেষ্টা করুন।", "Couldn't sign in. Please try again."];
      renderContact(); renderReport();
    });
  }

  /* ---------- খোলা ও বন্ধ ---------- */
  function openPost(id, fromHash) {
    var p = byId(id);
    if (!p || !els.dlg) return false;
    cur = p;
    els.dlg.style.setProperty("--h", String(D.get("types", p.type).hue));
    els.dBody.innerHTML = detailHTML(p);
    els.dScroll.scrollTop = 0;
    if (!els.dlg.open) els.dlg.showModal();
    document.documentElement.classList.add("jobs-lock");
    if (!fromHash) { history.pushState({ jobsPost: id }, "", "#p-" + id); pushed = true; }
    renderContact();
    renderReport();
    authInit().then(syncContact, function () { authKnown = true; renderContact(); renderReport(); });
    return true;
  }

  function onDialogClosed() {
    document.documentElement.classList.remove("jobs-lock");
    cur = null;
    if (pushed) { pushed = false; closingByUs = true; history.back(); }
    else if (/^#p-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
  }

  function hashId() { var m = /^#p-([A-Za-z0-9_-]{1,128})$/.exec(location.hash); return m ? m[1] : ""; }
  function openFromHash() {
    if (hashHandled) return;
    hashHandled = true;
    var id = hashId();
    if (id && !openPost(id, true)) history.replaceState(null, "", location.pathname + location.search);   // মেয়াদ-শেষ/অচেনা লিংক
  }

  function bindDialog() {
    var dlg = els.dlg;
    if (!dlg || typeof dlg.showModal !== "function") return;
    els.grid.addEventListener("click", function (e) {
      var b = e.target.closest(".jobs-bm");
      if (b) { onBookmark(b.getAttribute("data-bm")); return; }
      var card = e.target.closest(".jobs-card");
      if (card) openPost(card.getAttribute("data-id"), false);
    });
    $("jobs-d-x").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });   // ফাঁকা অংশে (ব্যাকড্রপে) ক্লিক
    dlg.addEventListener("close", onDialogClosed);
    els.dBody.addEventListener("click", function (e) {
      var bmb = e.target.closest(".jobs-d-bm");
      if (bmb) { onBookmark(bmb.getAttribute("data-bm")); return; }
      if (e.target.closest("#jobs-d-login") || e.target.closest("#jobs-r-login")) signIn();
      else if (e.target.closest("#jobs-r-open")) { rep.open = true; rep.focusNext = true; renderReport(); }
      else if (e.target.closest("#jobs-r-cancel")) { rep.open = false; rep.err = null; renderReport(); var ob = $("jobs-r-open"); if (ob) ob.focus(); }
      else if (e.target.closest("#jobs-r-send")) submitReport();
      else if (e.target.closest("#jobs-d-retry") && cur) loadContact(cur);
      else if (e.target.closest("#jobs-d-share") && cur) shareLink(location.origin + location.pathname + "#p-" + cur.id, cur.title, e.target.closest("#jobs-d-share"));
    });
    window.addEventListener("popstate", function () {
      if (closingByUs) { closingByUs = false; return; }
      var id = hashId();
      if (id) { if (loaded && !failed) openPost(id, true); }
      else if (dlg.open) { pushed = false; dlg.close(); }
    });
  }

  /* =====================================================================
   * ধাপ ১০: বুকমার্ক বাটন, রিপোর্ট
   * ===================================================================== */
  var flashT = 0;
  function flash(bn, en) {
    if (!els.flash) return;
    els.flash.innerHTML = bi(bn, en);
    els.flash.hidden = false;
    clearTimeout(flashT);
    flashT = setTimeout(function () { els.flash.hidden = true; }, 4000);
  }

  function onBookmark(id) {
    if (!ID_RE.test(id)) return;
    var r = toggleBm(id);
    if (r === "full") { flash("সর্বোচ্চ " + bnNum(BM_MAX) + "টি বুকমার্ক রাখা যায়। আগে কিছু সরিয়ে নিন।", "You can keep up to " + BM_MAX + " bookmarks. Remove some first."); return; }
    var on = r === "on";
    /* তালিকার কার্ড ও খোলা ডায়ালগ, দুই জায়গার বাটনই মেলানো (কার্ড সরাই না, যাতে ভুলে চাপলে আবার চাপা যায়) */
    document.querySelectorAll('[data-bm="' + id + '"]').forEach(function (b) { b.setAttribute("aria-pressed", on ? "true" : "false"); });
    syncPressed();
    flash(on ? "বুকমার্ক করা হয়েছে।" : "বুকমার্ক সরানো হয়েছে।", on ? "Bookmarked." : "Bookmark removed.");
  }

  /* ---------- রিপোর্ট (ডায়ালগের ভেতরে) ---------- */
  var rep = { id: "", open: false, state: "idle", err: null };   // state: idle | sending | done
  var ICO_FLAG = '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>';

  function renderReport() {
    var box = $("jobs-d-report");
    if (!box || !cur) return;
    if (rep.id !== cur.id) rep = { id: cur.id, open: false, state: "idle", err: null };
    /* নিজের পোস্ট নিজে রিপোর্ট করার দরকার নেই */
    if (user && cur.authorUid && cur.authorUid === user.uid) { box.innerHTML = ""; return; }

    if (rep.state === "done") {
      box.innerHTML = '<p class="jobs-d-note jobs-rep-done" role="status">' + bi("ধন্যবাদ। রিপোর্টটি অ্যাডমিনের কাছে পৌঁছেছে, তিনি দেখবেন।", "Thank you. Your report has reached the admin, who will look into it.") + "</p>";
      return;
    }
    if (!rep.open) {
      box.innerHTML = '<button type="button" class="jobs-rep-open" id="jobs-r-open" aria-expanded="false" aria-controls="jobs-r-form">' + svg(ICO_FLAG, 16) + bi("এই পোস্টটি রিপোর্ট করুন", "Report this post") + "</button>";
      return;
    }
    var h = '<div class="jobs-rep-box" id="jobs-r-form"><h3 class="jobs-d-h">' + bi("পোস্টটি রিপোর্ট করুন", "Report this post") + "</h3>";
    if (!authKnown) {
      h += '<p class="jobs-d-note">' + bi("যাচাই হচ্ছে…", "Checking…") + "</p>";
    } else if (!user) {
      h += '<p class="jobs-d-note">' + bi("রিপোর্ট করতে Google দিয়ে লগইন করতে হয়। এতে ভুয়া রিপোর্ট কমে।", "You need to sign in with Google to report. It keeps fake reports down.") + "</p>" +
        '<button type="button" class="jobs-btn jobs-btn-plain jobs-btn-sm" id="jobs-r-login">' + bi("Google দিয়ে লগইন করুন", "Sign in with Google") + "</button>";
      if (contactErr) h += '<p class="jobs-d-err" role="alert">' + bi(contactErr[0], contactErr[1]) + "</p>";
    } else {
      var busy = rep.state === "sending";
      h += '<fieldset class="jobs-rep-reasons"' + (busy ? " disabled" : "") + '><legend class="jobs-d-note">' + bi("কী সমস্যা?", "What is wrong?") + "</legend>" +
        D.reportReasons().map(function (r) {
          return '<label class="jobs-rep-opt"><input type="radio" name="jobs-r-reason" value="' + esc(r.slug) + '"> <span>' + bi(r.bn, r.en) + "</span></label>";
        }).join("") + "</fieldset>" +
        '<label class="jobs-field jobs-rep-note"><span class="jobs-flabel">' + bi("আরও কিছু জানাতে চাইলে (ঐচ্ছিক)", "Anything else? (optional)") + "</span>" +
        '<textarea id="jobs-r-note" rows="3" maxlength="300"' + (busy ? " disabled" : "") + "></textarea></label>" +
        '<div class="jobs-rep-actions"><button type="button" class="jobs-btn jobs-btn-call jobs-btn-sm" id="jobs-r-send"' + (busy ? " disabled" : "") + ">" + (busy ? bi("পাঠানো হচ্ছে…", "Sending…") : bi("রিপোর্ট পাঠান", "Send report")) + "</button>" +
        '<button type="button" class="jobs-btn jobs-btn-plain jobs-btn-sm" id="jobs-r-cancel"' + (busy ? " disabled" : "") + ">" + bi("বাতিল", "Cancel") + "</button></div>";
      if (rep.err) h += '<p class="jobs-d-err" role="alert">' + bi(rep.err[0], rep.err[1]) + "</p>";
    }
    box.innerHTML = h + "</div>";
    if (rep.focusNext) {
      rep.focusNext = false;
      var first = box.querySelector("input[type=radio], #jobs-r-login");
      if (first) first.focus();
    }
  }

  function submitReport() {
    if (!cur || !user || rep.state === "sending") return;
    var picked = document.querySelector('input[name="jobs-r-reason"]:checked');
    var noteEl = $("jobs-r-note");
    if (!picked) { rep.err = ["একটি কারণ বেছে নিন।", "Please pick a reason."]; keepAndRender(null, noteEl); return; }
    var reason = picked.value, note = (noteEl ? noteEl.value : "").replace(/\s+/g, " ").trim().slice(0, 300);
    var id = cur.id, uid = user.uid;
    rep.state = "sending"; rep.err = null;
    keepAndRender(reason, noteEl);
    fb().then(function (f) {
      var fs = f.fs;
      /* ডকুমেন্ট আইডি = পোস্ট + "_" + UID (Rules): একজন একটি পোস্ট একবারই রিপোর্ট করতে পারে */
      return fs.setDoc(fs.doc(f.db, "jobs_reports", id + "_" + uid), { postId: id, reporterUid: uid, reason: reason, note: note, createdAt: fs.serverTimestamp() });
    }).then(function () {
      if (rep.id === id) { rep.state = "done"; rep.err = null; renderReport(); }
    }).catch(function (e) {
      if (!cur || rep.id !== id) return;
      rep.state = "idle";
      rep.err = e && e.code === "permission-denied"
        ? ["রিপোর্ট নেওয়া যায়নি। আপনি এই পোস্ট আগেই রিপোর্ট করে থাকলে আবার করার দরকার নেই।", "The report could not be saved. If you already reported this post, there is no need to do it again."]
        : ["রিপোর্ট পাঠানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।", "Couldn't send the report. Check your connection and try again."];
      keepAndRender(reason, noteEl);
    });
  }
  /* আবার আঁকার সময় বাছাই করা কারণ ও লেখা ধরে রাখি */
  function keepAndRender(reason, noteEl) {
    var note = noteEl ? noteEl.value : "";
    renderReport();
    var n = $("jobs-r-note"); if (n) n.value = note;
    if (reason) { var r = document.querySelector('input[name="jobs-r-reason"][value="' + reason + '"]'); if (r) r.checked = true; }
  }

  /* =====================================================================
   * ধাপ ৯: আরও ফিল্টার, ঠিকানায় ফিল্টার ধরে রাখা, লিংক শেয়ার
   * ===================================================================== */
  var CAT_GROUPS = [
    ["tuition_wanted", "বিষয় (টিউশন)", "Subjects (tuition)"],
    ["parttime", "কাজের ধরন (পার্ট-টাইম)", "Work (part-time)"],
    ["freelance", "দক্ষতা (ফ্রিল্যান্স)", "Skills (freelance)"]
  ];
  function opt(v, label, cur) { return '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + ">" + esc(label) + "</option>"; }

  /* ফিল্টারগুলো একে অপরের সঙ্গে মিললে ঠিক আছে; না মিললে অপ্রাসঙ্গিকটা সরিয়ে দিই */
  function normalizeState() {
    if (state.area) {
      var a = D.get("areas", state.area);
      if (!a || (state.zone && a.zone !== state.zone)) state.area = "";
    }
    if (state.cat && state.type) {
      var ok = D.cats(state.type).some(function (c) { return c.slug === state.cat; });
      if (!ok) state.cat = "";
    }
    if (state.type === "parttime" || state.type === "freelance") state.level = "";
  }

  function advCount() { return (state.area ? 1 : 0) + (state.cat ? 1 : 0) + (state.level ? 1 : 0) + (state.pay ? 1 : 0); }

  function renderAdv() {
    if (!els.fArea) return;
    var l = curLang(), en = l === "en";

    var zs = D.zones().filter(function (z) { return !state.zone || z.slug === state.zone; });
    els.fArea.innerHTML = opt("", en ? "All areas" : "সব এলাকা", state.area) + zs.map(function (z) {
      return '<optgroup label="' + esc(z[l]) + '">' + D.areas(z.slug).map(function (a) { return opt(a.slug, a[l], state.area); }).join("") + "</optgroup>";
    }).join("");

    var catHTML = opt("", en ? "Any" : "যেকোনো", state.cat);
    if (state.type) {
      catHTML += D.cats(state.type).map(function (c) { return opt(c.slug, c[l], state.cat); }).join("");
    } else {
      catHTML += CAT_GROUPS.map(function (g) {
        return '<optgroup label="' + esc(en ? g[2] : g[1]) + '">' + D.cats(g[0]).map(function (c) { return opt(c.slug, c[l], state.cat); }).join("") + "</optgroup>";
      }).join("");
    }
    els.fCat.innerHTML = catHTML;

    els.fLevel.innerHTML = opt("", en ? "Any" : "যেকোনো", state.level) + D.levels().map(function (v) { return opt(v.slug, v[l], state.level); }).join("");
    els.fLevel.disabled = state.type === "parttime" || state.type === "freelance";

    els.fPay.innerHTML = D.SALARY_BANDS.map(function (b) { return opt(b.slug === "any" ? "" : b.slug, b[l], state.pay); }).join("");

    els.fSort.innerHTML = opt("new", en ? "Newest first" : "নতুন আগে", state.sort) + opt("expiring", en ? "Ending soon first" : "মেয়াদ শেষ হতে যাচ্ছে আগে", state.sort);

    var n = advCount();
    els.advN.hidden = !n;
    els.advN.textContent = n ? (en ? String(n) : bnNum(n)) : "";
  }

  /* ---------- ঠিকানা (?type=…) ---------- */
  var URL_KEYS = ["type", "mode", "zone", "area", "cat", "level", "pay", "q"];
  function stateQuery() {
    var sp = new URLSearchParams();
    URL_KEYS.forEach(function (k) { if (state[k]) sp.set(k, state[k]); });
    if (state.sort === "expiring") sp.set("sort", "expiring");
    return sp.toString();
  }
  function writeUrl() {
    try {
      var qs = stateQuery();
      history.replaceState(history.state, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    } catch (e) { /* কিছু ব্রাউজারে সীমাবদ্ধ থাকলে চুপচাপ বাদ */ }
  }
  /* অচেনা বা ভুল মান বাদ দিয়ে ঠিকানা থেকে অবস্থা পড়া */
  function readUrl() {
    var sp;
    try { sp = new URLSearchParams(location.search); } catch (e) { return; }
    var v = sp.get("type"); if (v && D.get("types", v)) state.type = v;
    v = sp.get("mode"); if (v && D.get("modes", v)) state.mode = v;
    v = sp.get("zone"); if (v && D.get("zones", v)) state.zone = v;
    v = sp.get("area"); if (v) { var a = D.get("areas", v); if (a) { state.area = v; state.zone = a.zone; } }
    v = sp.get("cat"); if (v && D.isKnown("cats", v)) state.cat = v;
    v = sp.get("level"); if (v && D.get("levels", v)) state.level = v;
    v = sp.get("pay"); if (v && v !== "any" && D.SALARY_BANDS.some(function (b) { return b.slug === v; })) state.pay = v;
    if (sp.get("sort") === "expiring") state.sort = "expiring";
    if (sp.get("saved") === "1") state.saved = true;   // শুধু পড়া হয়; ঠিকানায় লেখা হয় না, কারণ বুকমার্ক শেয়ার করার জিনিস নয়
    v = sp.get("q"); if (v) state.q = v.replace(/\s+/g, " ").trim().slice(0, 80);
    normalizeState();
  }

  /* ---------- লিংক শেয়ার / কপি ---------- */
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function (res, rej) {
      var ta = document.createElement("textarea");
      ta.value = t; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      (els.dlg && els.dlg.open ? els.dlg : document.body).appendChild(ta);   // খোলা ডায়ালগের বাইরের কিছু নির্বাচন করা যায় না
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.parentNode.removeChild(ta);
      if (ok) res(); else rej(new Error("copy"));
    });
  }
  function flashCopied(btn) {
    if (!btn) return;
    var orig = btn.innerHTML;
    btn.innerHTML = bi("লিংক কপি হয়েছে ✓", "Link copied ✓");
    setTimeout(function () { if (btn.isConnected) btn.innerHTML = orig; }, 2000);
  }
  function shareLink(url, title, btn) {
    var touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (navigator.share && touch) { navigator.share({ title: title, url: url }).catch(function () {}); return; }   // মোবাইলে সিস্টেম শেয়ার
    copyText(url).then(function () { flashCopied(btn); }, function () { window.prompt(curLang() === "en" ? "Copy this link:" : "লিংকটি কপি করুন:", url); });
  }


  function changed() {
    normalizeState();
    renderAdv();
    render();
    writeUrl();
    document.dispatchEvent(new CustomEvent("jobs:filters", { detail: { type: state.type, mode: state.mode, zone: state.zone, area: state.area, cat: state.cat, level: state.level, pay: state.pay, sort: state.sort, q: state.q } }));
  }

  /* ---------- ইভেন্ট ---------- */
  function bind() {
    els.types.addEventListener("click", function (e) {
      var b = e.target.closest(".jobs-type");
      if (!b) return;
      var t = b.getAttribute("data-type");
      state.type = state.type === t ? "" : t;   // আবার চাপলে "সব ধরন"
      changed();
    });

    function chipClick(e) {
      var c = e.target.closest(".jobs-chip");
      if (!c) return;
      state[c.getAttribute("data-key")] = c.getAttribute("data-val");
      changed();
    }
    els.modes.addEventListener("click", chipClick);
    els.zones.addEventListener("click", chipClick);

    var timer = 0;
    els.q.addEventListener("input", function () {
      els.qx.hidden = !els.q.value;
      clearTimeout(timer);
      timer = setTimeout(function () { state.q = els.q.value.trim(); changed(); }, 220);
    });
    els.qx.addEventListener("click", function () {
      els.q.value = ""; state.q = ""; changed(); els.q.focus();
    });

    function reset() {
      state.type = ""; state.mode = ""; state.zone = ""; state.area = ""; state.cat = ""; state.level = ""; state.pay = ""; state.q = ""; state.saved = false; els.q.value = "";
      changed();
    }
    [["fArea", "area"], ["fCat", "cat"], ["fLevel", "level"], ["fPay", "pay"], ["fSort", "sort"]].forEach(function (x) {
      els[x[0]].addEventListener("change", function () { state[x[1]] = els[x[0]].value || (x[1] === "sort" ? "new" : ""); changed(); });
    });
    els.share.addEventListener("click", function () {
      var qs = stateQuery();
      shareLink(location.origin + location.pathname + (qs ? "?" + qs : ""), document.title, els.share);
    });
    els.saved.addEventListener("click", function () { state.saved = !state.saved; changed(); });
    els.reset.addEventListener("click", reset);
    els.emptyReset.addEventListener("click", reset);
    els.emptyRetry.addEventListener("click", load);
    els.more.addEventListener("click", showMore);
  }

  /* ---------- শুরু ---------- */
  function init() {
    els.counts = $("jobs-counts"); els.types = $("jobs-types");
    els.modes = $("jobs-modes"); els.zones = $("jobs-zones");
    els.q = $("jobs-q"); els.qx = $("jobs-q-x");
    els.status = $("jobs-status"); els.reset = $("jobs-reset");
    els.grid = $("jobs-grid"); els.empty = $("jobs-empty");
    els.emptyH = $("jobs-empty-h"); els.emptyP = $("jobs-empty-p");
    els.emptyReset = $("jobs-empty-reset"); els.emptyCta = $("jobs-empty-cta"); els.emptyRetry = $("jobs-empty-retry");
    els.moreWrap = $("jobs-more-wrap"); els.more = $("jobs-more");
    els.saved = $("jobs-saved"); els.flash = $("jobs-flash");
    els.adv = $("jobs-adv"); els.advN = $("jobs-adv-n"); els.share = $("jobs-share");
    els.fArea = $("jobs-f-area"); els.fCat = $("jobs-f-cat"); els.fLevel = $("jobs-f-level"); els.fPay = $("jobs-f-pay"); els.fSort = $("jobs-f-sort");
    els.dlg = $("jobs-dlg"); els.dBody = $("jobs-d-body"); els.dScroll = $("jobs-d-scroll");
    if (!els.types || !D) return;

    skeletonHTML = els.grid.innerHTML;   // HTML-এর স্কেলেটন কার্ডগুলো মনে রাখি; পরে আবার লোডে কাজে লাগে

    /* সার্চের লেখা ভাষা অনুযায়ী */
    function setPlaceholder() {
      var en = document.documentElement.getAttribute("data-lang") === "en";
      els.q.placeholder = en ? "Search subject, work or title…" : "বিষয়, কাজ বা শিরোনাম খুঁজুন…";
      els.q.setAttribute("aria-label", en ? "Search jobs and tuition" : "জব ও টিউশনে খুঁজুন");
      renderAdv();                // অপশনের লেখা ভাষা অনুযায়ী
      if (cur) renderContact();   // WhatsApp-এর আগে-লেখা বার্তা ভাষা অনুযায়ী (রিপোর্ট ফর্মে সব লেখা দ্বিভাষিক স্প্যানে, তাই আবার আঁকা লাগে না)
    }
    setPlaceholder();
    new MutationObserver(setPlaceholder).observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });

    readUrl();                       // শেয়ার করা লিংক থেকে আসা ফিল্টার
    els.q.value = state.q;
    if (advCount()) els.adv.open = true;
    fillCounts();
    renderTypes();
    renderChips();
    renderAdv();
    bind();
    bindDialog();
    syncPressed();
    window.addEventListener("storage", function (e) {      // অন্য ট্যাবে বুকমার্ক বদলালে এখানেও মেলাই
      if (e.key !== BM_KEY) return;
      bm = readBm();
      document.querySelectorAll("[data-bm]").forEach(function (b) { b.setAttribute("aria-pressed", isBm(b.getAttribute("data-bm")) ? "true" : "false"); });
      if (state.saved) render(); else syncPressed();
    });
    load();
  }

  window.JobsUI = {
    state: state,
    reload: load,
    get posts() { return posts; },
    get view() { return view; }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
