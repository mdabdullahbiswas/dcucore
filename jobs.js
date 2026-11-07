/* jobs.js — জব ও টিউশন পেজ (ধাপ ৩ কাঠামো + ধাপ ৭ পাবলিক তালিকা)
 *
 * ধাপ ৭: Firestore থেকে শুধু status == "approved" পোস্ট আনে (Rules-এর সঙ্গে মেলানো), ক্লায়েন্টে
 * মেয়াদ-উত্তীর্ণ ও filled পোস্ট বাদ দেয়, নতুন থেকে পুরনো ক্রমে ধরন অনুযায়ী রঙিন কার্ড আঁকে।
 * ধাপ ৮: কার্ড খুললে বিস্তারিত (ডায়ালগ) → নিরাপত্তা-সতর্কতা → "কল করুন"/"WhatsApp" বাটন।
 * ফোন/WhatsApp থাকে jobs_posts/{id}/private/contact-এ; শুধু Google-লগইন করা ব্যবহারকারীর জন্য পড়া হয়
 * (Rules-ও তাই চায়) এবং লগইন ছাড়া কখনো আনা হয় না।
 * ডায়ালগ খুললে ঠিকানায় #p-<পোস্ট-আইডি> বসে, তাই মোবাইলের ব্যাক বাটন দিয়ে বন্ধ হয় এবং লিংক খুলে সরাসরি পোস্ট দেখা যায়।
 *
 * ফিল্টার: ধরন, পদ্ধতি, অঞ্চল ও সার্চ এখনই কাজ করে। বিষয়/শ্রেণি/বেতন, সাজানো ও শেয়ারযোগ্য লিংক ধাপ ৯-এ।
 * কোনো Firestore ইনডেক্স লাগে না: কোয়েরিতে শুধু একটি where আছে, ক্রম সাজানো ক্লায়েন্টে হয়।
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
  var state = { type: "", mode: "", zone: "", q: "" };
  var posts = [];            // Firestore থেকে আসা, স্বাভাবিক করা পোস্ট (নতুন আগে)
  var view = [];             // বর্তমান ফিল্টারে মেলা পোস্ট
  var shownN = PAGE;         // কতগুলো কার্ড আঁকা হয়েছে
  var loaded = false, failed = false, loadId = 0;
  var skeletonHTML = "";
  var els = {};

  function filtersActive() { return !!(state.type || state.mode || state.zone || state.q); }

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
      orgName: str(d.orgName), authorName: str(d.authorName),
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

  function matches(p) {
    if (state.type && p.type !== state.type) return false;
    if (state.mode) {
      /* "সরাসরি" বা "অনলাইন" বাছলে "দুটোই" পোস্টও আসে; "দুটোই" বাছলে শুধু সেগুলো */
      if (state.mode === "both" ? p.mode !== "both" : (p.mode !== state.mode && p.mode !== "both")) return false;
    }
    if (state.zone) {
      var inZone = p.areas.some(function (s) { var a = D.get("areas", s); return a && a.zone === state.zone; });
      /* শুধু-অনলাইন পোস্টের এলাকা নেই; সেগুলো সব অঞ্চল থেকেই করা যায়, তাই বাদ দেওয়া হয় না */
      if (!inZone && p.mode !== "online") return false;
    }
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
      "</div></article>";
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
    var act = filtersActive();
    els.reset.hidden = !act;
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

    var foot = '<p class="jobs-d-foot">' + ago(p.createdMs, now) + (p.expiresMs ? " · " + bi("মেয়াদ: ", "Valid until ") + fmtDate(p.expiresMs) : "") + "</p>";

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
        return new Promise(function (res) {
          au.onAuthStateChanged(a, function (u) {
            var changed = (u ? u.uid : "") !== (user ? user.uid : "");
            user = u || null; authKnown = true;
            if (changed) contact = { id: "", state: "idle", phone: "", whatsapp: "" };
            if (changed) contactErr = null;
            syncContact(); res();
          });
        });
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
      renderContact();
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
    authInit().then(syncContact, function () { authKnown = true; renderContact(); });
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
      var card = e.target.closest(".jobs-card");
      if (card) openPost(card.getAttribute("data-id"), false);
    });
    $("jobs-d-x").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });   // ফাঁকা অংশে (ব্যাকড্রপে) ক্লিক
    dlg.addEventListener("close", onDialogClosed);
    els.dBody.addEventListener("click", function (e) {
      if (e.target.closest("#jobs-d-login")) signIn();
      else if (e.target.closest("#jobs-d-retry") && cur) loadContact(cur);
    });
    window.addEventListener("popstate", function () {
      if (closingByUs) { closingByUs = false; return; }
      var id = hashId();
      if (id) { if (loaded && !failed) openPost(id, true); }
      else if (dlg.open) { pushed = false; dlg.close(); }
    });
  }

  function changed() {
    render();
    document.dispatchEvent(new CustomEvent("jobs:filters", { detail: { type: state.type, mode: state.mode, zone: state.zone, q: state.q } }));
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
      state.type = ""; state.mode = ""; state.zone = ""; state.q = ""; els.q.value = "";
      changed();
    }
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
    els.dlg = $("jobs-dlg"); els.dBody = $("jobs-d-body"); els.dScroll = $("jobs-d-scroll");
    if (!els.types || !D) return;

    skeletonHTML = els.grid.innerHTML;   // HTML-এর স্কেলেটন কার্ডগুলো মনে রাখি; পরে আবার লোডে কাজে লাগে

    /* সার্চের লেখা ভাষা অনুযায়ী */
    function setPlaceholder() {
      var en = document.documentElement.getAttribute("data-lang") === "en";
      els.q.placeholder = en ? "Search subject, work or title…" : "বিষয়, কাজ বা শিরোনাম খুঁজুন…";
      els.q.setAttribute("aria-label", en ? "Search jobs and tuition" : "জব ও টিউশনে খুঁজুন");
      if (cur) renderContact();   // WhatsApp-এর আগে-লেখা বার্তা ভাষা অনুযায়ী
    }
    setPlaceholder();
    new MutationObserver(setPlaceholder).observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });

    fillCounts();
    renderTypes();
    renderChips();
    bind();
    bindDialog();
    syncPressed();
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
