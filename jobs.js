/* jobs.js — জব ও টিউশন পেজ (ধাপ ৩: কাঠামো ও ফিল্টারের চেহারা)
 *
 * এই ধাপে ডেটা নেই: ধরন-বাছাই, পদ্ধতি/এলাকা চিপ ও সার্চ কাজ করে এবং অবস্থা (state) ধরে রাখে,
 * কিন্তু দেখানোর মতো পোস্ট এখনো নেই, তাই খালি অবস্থার বার্তা দেখায়।
 * ধাপ ৭-এ Firestore-এর পোস্ট এলে window.JobsUI.setPosts(list) দিয়ে তালিকা আঁকা হবে;
 * ধাপ ৯-এ ফিল্টারের মান ("jobs:filters" ইভেন্ট) দিয়ে ছাঁকা হবে।
 */
(function () {
  "use strict";

  var D = window.JobsData;
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function bi(bn, en) { return '<span class="jobs-bn">' + esc(bn) + '</span><span class="jobs-en">' + esc(en) + "</span>"; }
  function bnNum(n) { return Number(n).toLocaleString("bn-BD"); }

  var ICONS = {
    book: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    store: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/></svg>',
    laptop: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 20h20"/></svg>'
  };

  /* ---------- অবস্থা ---------- */
  var state = { type: "", mode: "", zone: "", q: "" };
  var posts = [];            // ধাপ ৭-এ ভরবে
  var loaded = false;

  var els = {};

  function filtersActive() { return !!(state.type || state.mode || state.zone || state.q); }

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
        '<span class="jobs-type-ico">' + (ICONS[t.icon] || "") + "</span>" +
        '<span class="jobs-type-txt">' +
          '<span class="jobs-type-name">' + bi(t.bn, t.en) + "</span>" +
          '<span class="jobs-type-sub">' + bi(t.short_bn, t.short_en) + "</span>" +
        "</span>" +
        '<span class="jobs-type-tick" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
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
    els.emptyReset.hidden = !act;
  }

  /* ---------- স্কেলেটন / খালি অবস্থা / তালিকা ---------- */
  function showSkeleton() {
    els.grid.hidden = false;
    els.grid.setAttribute("aria-busy", "true");
    els.empty.hidden = true;
    els.status.innerHTML = bi("লোড হচ্ছে…", "Loading…");
  }

  function showEmpty() {
    var act = filtersActive();
    els.grid.hidden = true;
    els.grid.setAttribute("aria-busy", "false");
    els.empty.hidden = false;
    els.emptyH.innerHTML = act
      ? bi("এই ফিল্টারে কিছু পাওয়া যায়নি", "Nothing matches these filters")
      : bi("এখনো কোনো পোস্ট নেই", "No posts yet");
    els.emptyP.innerHTML = act
      ? bi("ফিল্টার বদলে বা মুছে আবার দেখুন।", "Change or clear the filters and try again.")
      : bi("পোস্ট করুন। অ্যাডমিন অনুমোদন দিলেই এখানে সবাই দেখতে পাবে।", "Post one. It shows up here for everyone once an admin approves it.");
    els.status.innerHTML = '<span class="jobs-bn">' + bnNum(0) + "টি পোস্ট</span>" + '<span class="jobs-en">0 posts</span>';
  }

  function render() {
    syncPressed();
    if (!loaded) return;
    /* ধাপ ৭-এ এখানে `posts` ছেঁকে কার্ড আঁকা হবে; এখন শুধু খালি অবস্থা */
    showEmpty();
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
  }

  /* ---------- শুরু ---------- */
  function init() {
    els.counts = $("jobs-counts"); els.types = $("jobs-types");
    els.modes = $("jobs-modes"); els.zones = $("jobs-zones");
    els.q = $("jobs-q"); els.qx = $("jobs-q-x");
    els.status = $("jobs-status"); els.reset = $("jobs-reset");
    els.grid = $("jobs-grid"); els.empty = $("jobs-empty");
    els.emptyH = $("jobs-empty-h"); els.emptyP = $("jobs-empty-p"); els.emptyReset = $("jobs-empty-reset");
    if (!els.types || !D) return;

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

    /* ধাপ ৭-এর আগে: স্কেলেটন একটু দেখিয়ে খালি অবস্থায় যায় (ডেটা-লেয়ার আসলে এই অংশ বদলাবে) */
    showSkeleton();
    setTimeout(function () { loaded = true; render(); }, 700);
  }

  window.JobsUI = {
    state: state,
    showSkeleton: showSkeleton,
    showEmpty: showEmpty,
    setPosts: function (list) { posts = list || []; loaded = true; render(); },
    get posts() { return posts; }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
