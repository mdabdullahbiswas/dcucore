/* dcu-lang.js
 * Premium Bangla / English switch.
 * - Adds a toggle button into the header (.dl-actions).
 * - Header & footer labels are translated through DICT.
 * - Page text written as "বাংলা|English" inside .t elements is switched too.
 * Load AFTER dcu-layout.js:
 *   <script src="dcu-lang.js" defer></script>
 */
(function () {
  "use strict";

  var KEY = "dcu-lang";
  var root = document.documentElement;
  var current = "bn";
  var tracked = [];              // [{node, bn, en}]
  var seen = new WeakSet();      // text nodes already parsed

  /* header + footer strings (Bengali -> English) */
  var DICT = {
    "Core · শিক্ষার্থী টুলকিট": "Core · Student Toolkit",
    "হোম": "Home",
    "কভার পেজ": "Cover Page",
    "টুলস": "Tools",
    "ডোনার": "Donors",
    "মতামত": "Feedback",
    "আমাদের সম্পর্কে": "About",
    "শেয়ার কার্ড": "Share Card",
    "ক্লাস রুটিন": "Class Routine",
    "CGPA ক্যালকুলেটর": "CGPA Calculator",
    "পরীক্ষা প্ল্যানার": "Exam Planner",
    "সিভি স্টুডিও": "CV Studio",
    "সিভি বিল্ডার": "CV Studio",
    "প্রোফাইল ফ্রেম": "Profile Frame",
    "PDF টুলকিট": "PDF Toolkit",
    "সায়েন্টিফিক ক্যালকুলেটর": "Scientific Calculator",
    "রেজাল্ট": "Results",
    "সাইট": "Site",
    "ডোনার ডিরেক্টরি": "Donor Directory",
    "মতামত দিন": "Share Feedback",
    "শিক্ষার্থীদের জন্য প্রিমিয়াম ডিজিটাল টুলকিট — কভার পেজ, সিভি, ক্লাস রুটিন, CGPA ও আরও অনেক কিছু, বিনামূল্যে।":
      "Premium digital toolkit for students: cover pages, CV, class routine, CGPA and much more, completely free.",
    "✓ ব্রাউজারে চলে": "✓ Runs in your browser",
    "✓ সার্ভারে আপলোড নেই": "✓ No server uploads",
    "✓ বিনামূল্যে": "✓ Free",
    "এটি একটি শিক্ষার্থী-উদ্যোগ, কোনো সরকারি বা প্রাতিষ্ঠানিক ওয়েবসাইট নয়।":
      "A student-run project, not an official government or institutional website."
  };

  function getSaved() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === "en" || v === "bn") { uiSync = true; return v; }
    } catch (e) { /* storage blocked */ }
    /* a page that already declares its language (Cover Studio) keeps it */
    var declared = root.getAttribute("data-ui-lang");
    if (declared === "en" || declared === "bn") return declared;
    return "bn";
  }

  function track(node, bn, en) {
    seen.add(node);
    tracked.push({ node: node, bn: bn, en: en });
  }

  /* "বাংলা|English" inside any .t element */
  function scanPageText() {
    document.querySelectorAll(".t").forEach(function (el) {
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var n;
      while ((n = w.nextNode())) {
        if (seen.has(n)) continue;
        var d = n.data;
        var i = d.indexOf("|");
        if (i < 0) continue;
        track(n, d.slice(0, i), d.slice(i + 1));
      }
    });
  }

  /* header & footer labels through DICT */
  function scanChrome() {
    ["hdr", "ftr"].forEach(function (id) {
      var host = document.getElementById(id);
      if (!host) return;
      var w = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      var n;
      while ((n = w.nextNode())) {
        if (seen.has(n)) continue;
        var m = n.data.match(/^(\s*)([\s\S]*?)(\s*)$/);
        var key = m[2];
        if (!key || !Object.prototype.hasOwnProperty.call(DICT, key)) continue;
        track(n, n.data, m[1] + DICT[key] + m[3]);
      }
    });
  }

  var uiSync = false;   // true once the visitor has chosen a language

  function applyLang(lang) {
    var attr = lang === "en" ? "en" : "bn";
    if (root.getAttribute("lang") !== attr) root.setAttribute("lang", attr);
    if (root.getAttribute("data-lang") !== attr) root.setAttribute("data-lang", attr);
    /* Cover Studio reads this attribute for its own labels */
    if (uiSync && root.getAttribute("data-ui-lang") !== attr) root.setAttribute("data-ui-lang", attr);

    tracked = tracked.filter(function (t) {
      if (!t.node.isConnected) return false;
      var want = attr === "en" ? t.en : t.bn;
      if (t.node.data !== want) t.node.data = want;
      return true;
    });

    document.querySelectorAll(".dl-lang-opt").forEach(function (o) {
      o.classList.toggle("on", o.getAttribute("data-l") === attr);
    });
  }

  function setLang(lang) {
    var changed = lang !== current;
    current = lang;
    applyLang(lang);
    try { localStorage.setItem(KEY, lang); } catch (e) { /* storage blocked */ }
    /* let pages that render their own text (About, Feedback, Tools) redraw */
    if (changed && typeof window.onLang === "function") {
      try { window.onLang(); } catch (e) { /* page renderer failed; keep switch working */ }
    }
  }

  function mountButton() {
    var actions = document.querySelector("#hdr .dl-actions");
    if (!actions || actions.querySelector(".dl-lang")) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dl-lang";
    btn.setAttribute("aria-label", "ভাষা পরিবর্তন / Change language");
    btn.innerHTML =
      '<span class="dl-lang-thumb" aria-hidden="true"></span>' +
      '<span class="dl-lang-opt" data-l="bn">বাংলা</span>' +
      '<span class="dl-lang-opt" data-l="en">English</span>';

    btn.addEventListener("click", function () {
      uiSync = true;
      setLang(current === "en" ? "bn" : "en");
    });

    actions.insertBefore(btn, actions.firstChild);
  }

  function init() {
    scanPageText();
    scanChrome();
    mountButton();
    setLang(getSaved());

    /* pick up page text that scripts add later */
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        scanPageText();
        applyLang(current);
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
