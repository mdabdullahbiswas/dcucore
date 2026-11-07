/* jobs.js — জব ও টিউশন পেজ (ধাপ ৩ কাঠামো + ধাপ ৭ পাবলিক তালিকা)
 *
 * ধাপ ৭: Firestore থেকে শুধু status == "approved" পোস্ট আনে (Rules-এর সঙ্গে মেলানো), ক্লায়েন্টে
 * মেয়াদ-উত্তীর্ণ ও filled পোস্ট বাদ দেয়, নতুন থেকে পুরনো ক্রমে ধরন অনুযায়ী রঙিন কার্ড আঁকে।
 * ফোন/WhatsApp এই ফাইল কখনো পড়ে না (সেগুলো jobs_posts/{id}/private/contact-এ, ধাপ ৮-এর কাজ)।
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

  function fetchPosts() {
    return Promise.all([import(FB_BASE + "firebase-app.js"), import(FB_BASE + "firebase-firestore.js")]).then(function (m) {
      var app;
      try { app = m[0].getApp(); } catch (e) { app = m[0].initializeApp(FB_CFG); }
      var fs = m[1], db = fs.getFirestore(app);
      /* Rules: পাবলিক শুধু approved পড়তে পারে, তাই কোয়েরিতে এই শর্ত থাকা বাধ্যতামূলক */
      return fs.getDocs(fs.query(fs.collection(db, "jobs_posts"), fs.where("status", "==", "approved"), fs.limit(FETCH_LIMIT)));
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
      posts = list; loaded = true; render();
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

    var open = !p.salaryMin && !p.salaryMax || p.salaryUnit === "negotiable";
    var pay = open
      ? bi(lab("salaryUnits", "negotiable", "bn"), lab("salaryUnits", "negotiable", "en"))
      : bi(D.salaryText(p.salaryMin, p.salaryMax, p.salaryUnit, "bn"), D.salaryText(p.salaryMin, p.salaryMax, p.salaryUnit, "en"));

    return '<article class="jobs-card" data-id="' + esc(p.id) + '" data-type="' + esc(p.type) + '" style="--h:' + t.hue + '">' +
      '<span class="jobs-card-ico">' + ico + "</span>" +
      '<div class="jobs-card-body">' +
        '<div class="jobs-card-top">' + top + "</div>" +
        '<h3 class="jobs-card-title">' + esc(p.title) + "</h3>" +
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
    if (c) { c.setAttribute("tabindex", "-1"); c.focus({ preventScroll: true }); }
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
    if (!els.types || !D) return;

    skeletonHTML = els.grid.innerHTML;   // HTML-এর স্কেলেটন কার্ডগুলো মনে রাখি; পরে আবার লোডে কাজে লাগে

    /* সার্চের লেখা ভাষা অনুযায়ী */
    function setPlaceholder() {
      var en = document.documentElement.getAttribute("data-lang") === "en";
      els.q.placeholder = en ? "Search subject, work or title…" : "বিষয়, কাজ বা শিরোনাম খুঁজুন…";
      els.q.setAttribute("aria-label", en ? "Search jobs and tuition" : "জব ও টিউশনে খুঁজুন");
    }
    setPlaceholder();
    new MutationObserver(setPlaceholder).observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });

    fillCounts();
    renderTypes();
    renderChips();
    bind();
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
