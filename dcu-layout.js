/* dcu-layout.js
 * Shared premium header + footer for every DCUCore page.
 * Fills the existing <div id="hdr"> and <div id="ftr"> placeholders.
 * Load with:  <script src="dcu-layout.js" defer></script>
 */
(function () {
  "use strict";

  var THEME_KEY = "site-theme";
  var root = document.documentElement;

  /* ---------- current page ---------- */
  /* maps a clean path (/cover#lab, /tools#cgpa, /blood) or an href to its page file */
  function pageOfPath(p) {
    p = String(p || "").split("#")[0].split("?")[0].replace(/\/+$/, "");
    if (/^\/?cover(\/|\.html$|$)/.test(p)) return "cover.html";
    if (/^\/?tools(\/|\.html$|$)/.test(p)) return "tools.html";
    var last = (p.split("/").pop() || "").toLowerCase();
    if (!last || last === "index.html") return "index.html";
    return /\.html?$/.test(last) ? last : last + ".html";
  }
  var file = pageOfPath(location.pathname);

  function isCurrent(href) {
    return pageOfPath(href) === file;
  }

  /* hash part of an href: "/tools#cgpa" -> "cgpa" */
  function hashOf(href) {
    var i = String(href).indexOf("#");
    return i < 0 ? "" : String(href).slice(i + 1);
  }

  /* ---------- data ---------- */
  var NAV = [
    { href: "/", label: "হোম", en: "Home" },
    { href: "/cover", label: "কভার পেজ", en: "Cover Page" }
  ];

  /* grouped menus: keeps the top bar short (Home · Cover · Tools · Campus · More) */
  var GROUPS = [
    { id: "campus", bn: "ক্যাম্পাস", en: "Campus", items: [
      { href: "/blood", bn: "ডোনার ডিরেক্টরি", en: "Donor Directory" },
      { href: "/events", bn: "ক্যাম্পাস ইভেন্ট", en: "Campus Events" },
      { href: "/library", bn: "লাইব্রেরি", en: "Library" },
      { href: "/jobs", bn: "জব ও টিউশন", en: "Jobs & Tuition" }
    ] },
    { id: "more", bn: "আরও", en: "More", right: true, items: [
      { href: "/faq", bn: "প্রশ্নোত্তর", en: "FAQ" },
      { href: "/feedback", bn: "মতামত দিন", en: "Give Feedback" },
      { href: "/support", bn: "সাহায্য করুন", en: "Support Us" },
      { href: "/about", bn: "আমাদের সম্পর্কে", en: "About" }
    ] }
  ];

  var TOOLS = [
    { href: "/tools#card", bn: "শেয়ার কার্ড", en: "Share Card" },
    { href: "/tools#routine", bn: "ক্লাস রুটিন", en: "Class Routine" },
    { href: "/tools#cgpa", bn: "CGPA ক্যালকুলেটর", en: "CGPA Calculator" },
    { href: "/tools#exam", bn: "পরীক্ষা প্ল্যানার", en: "Exam Planner" },
    { href: "/dcu-calendar", bn: "স্টুডেন্ট ক্যালেন্ডার", en: "Student Calendar" },
    { href: "/cv", bn: "সিভি স্টুডিও", en: "CV Studio" },
    { href: "/tools#frame", bn: "প্রোফাইল ফ্রেম", en: "Profile Frame" },
    { href: "/tools#pdf", bn: "PDF টুলকিট", en: "PDF Toolkit" },
    { href: "/tools#calc", bn: "সায়েন্টিফিক ক্যালকুলেটর", en: "Scientific Calculator" },
    { href: "/tools#result", bn: "রেজাল্ট", en: "Results Portal" }
  ];

  /* tools mega menu: groups + per-tool icon / one-line description.  nw:true shows a small NEW badge */
  var TOOL_GROUPS = [
    { id: "study", bn: "পড়াশোনা", en: "Study" },
    { id: "career", bn: "ক্যারিয়ার", en: "Career" },
    { id: "util", bn: "ইউটিলিটি", en: "Utilities" }
  ];
  var TOOL_META = {
    "/tools#routine": { g: "study", nw: false, d: ["ক্লাস রুটিন বানিয়ে ডাউনলোড করুন", "Design & download your routine"],
      ic: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2.5v3M16 2.5v3M8 13h2M12 13h4M8 17h5"/>' },
    "/tools#cgpa": { g: "study", nw: false, d: ["সেমিস্টার ধরে মোট CGPA হিসাব", "Work out your cumulative CGPA"],
      ic: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' },
    "/tools#exam": { g: "study", nw: false, d: ["পরীক্ষা, টপিক ও ফোকাস টাইমার", "Exams, topics & focus timer"],
      ic: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/>' },
    "/dcu-calendar": { g: "study", nw: false, d: ["বাংলা ও ইংরেজি তারিখসহ ক্যালেন্ডার", "Calendar with Bangla & English dates"],
      ic: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>' },
    "/cv": { g: "career", nw: false, d: ["৬টি টেমপ্লেটে সিভি বানান", "Build a CV with 6 templates"],
      ic: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><circle cx="10.5" cy="12.5" r="1.6"/><path d="M8 17c.4-1.4 1.3-2 2.5-2s2.1.6 2.5 2"/>' },
    "/tools#pdf": { g: "career", nw: false, d: ["ছবি থেকে PDF বানান", "Turn images into a PDF"],
      ic: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M8.5 17l2-3 1.5 2 1.2-1.4 1.3 2.4"/>' },
    "/tools#card": { g: "util", nw: false, d: ["পরিচয়ের কার্ড বানিয়ে শেয়ার করুন", "Make a card and share it"],
      ic: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.8-2.4 3-2.4s2.4.8 3 2.4M14.5 10h4M14.5 13.5h3"/>' },
    "/tools#frame": { g: "util", nw: false, d: ["প্রোফাইল ছবির জন্য গোল ফ্রেম", "Round frame for your profile photo"],
      ic: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18c1-2.6 3-3.6 5.5-3.6s4.5 1 5.5 3.6"/>' },
    "/tools#calc": { g: "util", nw: false, d: ["ফ্র্যাকশন ও ডিগ্রি মোডসহ", "With fraction & degree modes"],
      ic: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>' },
    "/tools#result": { g: "util", nw: false, d: ["ঢাবি অধিভুক্ত ৭ কলেজের ফল", "Results of 7 DU-affiliated colleges"],
      ic: '<path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6.5h9M11 12.5h9M11 18.5h9"/>' }
  };

  var ICON_CHEVRON =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var ICON_BURGER =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var ICON_MOON =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>';
  var ICON_SUN =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* bilingual text: CSS shows .cvx-bn or .cvx-en depending on <html data-lang> */
  function bi(bn, en) {
    return '<span class="cvx-bn">' + esc(bn) + '</span><span class="cvx-en">' + esc(en) + "</span>";
  }

  /* ---------- cover types (menu under "কভার পেজ" on every page) ---------- */
var COVER_TYPES = [{"v": "assignment", "en": "Assignment", "bn": "অ্যাসাইনমেন্ট", "ic": "<path d=\"M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z\"/><path d=\"M14 3v5h5M9 13h6M9 17h4\"/>"}, {"v": "lab", "en": "Lab Report", "bn": "ল্যাব রিপোর্ট", "ic": "<path d=\"M9 3h6M10 3v6L5 19a2 2 0 001.8 3h10.4A2 2 0 0019 19l-5-10V3\"/><path d=\"M7.5 15h9\"/>"}, {"v": "presentation", "en": "Presentation", "bn": "প্রেজেন্টেশন", "ic": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M12 16v4M8 20h8M7 12l3-3 3 2 4-4\"/>"}, {"v": "project", "en": "Project", "bn": "প্রজেক্ট", "ic": "<path d=\"M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z\"/><path d=\"M3 11h18\"/>"}, {"v": "thesis", "en": "Thesis", "bn": "থিসিস", "ic": "<path d=\"M2 9l10-5 10 5-10 5z\"/><path d=\"M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6\"/>"}, {"v": "quiz", "en": "Quiz", "bn": "কুইজ", "ic": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9.5 9.6a2.6 2.6 0 015.1.6c0 1.8-2.6 2.2-2.6 3.8M12 17.2h.01\"/>"}, {"v": "exam", "en": "Exam", "bn": "পরীক্ষা", "ic": "<path d=\"M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z\"/><path d=\"M14 3v5h5\"/><path d=\"M9 13l1.8 1.8L15 11\"/>"}, {"v": "declaration", "en": "Declaration", "bn": "ঘোষণাপত্র", "ic": "<path d=\"M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z\"/><path d=\"M8.8 12l2.4 2.4 4.2-4.6\"/>"}, {"v": "approval", "en": "Approval", "bn": "অনুমোদনপত্র", "ic": "<circle cx=\"12\" cy=\"9\" r=\"5.5\"/><path d=\"M8.7 13.6L7.5 21l4.5-2.6 4.5 2.6-1.2-7.4\"/><path d=\"M9.6 9l1.7 1.7L14.5 7.4\"/>"}, {"v": "acknowledgment", "en": "Acknowledgment", "bn": "কৃতজ্ঞতা স্বীকার", "ic": "<path d=\"M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0112 7.6a4.2 4.2 0 017.5 2.6c0 5.7-7.5 10.3-7.5 10.3z\"/>"}, {"v": "contents", "en": "Contents", "bn": "সূচিপত্র", "ic": "<path d=\"M9 6h11M9 12h11M9 18h11\"/><path d=\"M4.5 6h.01M4.5 12h.01M4.5 18h.01\"/>"}];

  /* ---------- cover dropdown (same behaviour as Tools) ---------- */
  function coverDD() {
    var active = file === "cover.html";
    var items = COVER_TYPES.map(function (t, i) {
      return (
        '<a href="/cover#' + t.v + '" role="menuitemradio" data-cvx-v="' + t.v + '" style="--i:' + i + '">' +
        '<span class="cvx-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        t.ic + "</svg></span>" +
        "<b><span class=\"cvx-bn\">" + esc(t.bn) + "</span><span class=\"cvx-en\">" + esc(t.en) + "</span></b></a>"
      );
    }).join("");
    return (
      '<div class="dl-dd dl-cvx" data-dl-cvd>' +
      '<button type="button" class="dl-dd-btn"' + (active ? ' aria-current="page"' : "") +
      ' aria-haspopup="true" aria-expanded="false"><span class="cvx-bn">কভার পেজ</span><span class="cvx-en">Cover Page</span> ' +
      ICON_CHEVRON + "</button>" +
      '<div class="dl-menu dl-menu-cvx" role="menu">' + items + "</div></div>"
    );
  }

  /* ---------- group dropdown (Campus / More) ---------- */
  function groupDD(g) {
    var active = g.items.some(function (t) { return isCurrent(t.href); });
    var items = g.items.map(function (t, i) {
      var on = isCurrent(t.href);
      return (
        '<a href="' + t.href + '" role="menuitem" style="--i:' + i + '"' + (on ? ' class="on" aria-current="page"' : "") + "><b>" +
        '<span class="cvx-bn">' + esc(t.bn) + '</span><span class="cvx-en">' + esc(t.en) + "</span></b></a>"
      );
    }).join("");
    return (
      '<div class="dl-dd dl-grp" data-dl-grp="' + g.id + '">' +
      '<button type="button" class="dl-dd-btn"' + (active ? ' aria-current="page"' : "") +
      ' aria-haspopup="true" aria-expanded="false">' + bi(g.bn, g.en) + " " + ICON_CHEVRON + "</button>" +
      '<div class="dl-menu dl-menu-grp' + (g.right ? " dl-menu-r" : "") + '" role="menu">' + items + "</div></div>"
    );
  }

  /* ---------- header markup ---------- */
  function headerHTML() {
    var links = NAV.map(function (n) {
      if (n.href === "/cover") return coverDD();
      var cur = isCurrent(n.href) ? ' aria-current="page"' : "";
      return '<a href="' + n.href + '"' + cur + ">" + bi(n.label, n.en) + "</a>";
    });

    // insert the tools dropdown after the "কভার পেজ" link (index 1)
    var toolsActive = file === "tools.html";
    var seq = 0;
    var cols = TOOL_GROUPS.map(function (g) {
      var list = TOOLS.filter(function (t) { return TOOL_META[t.href] && TOOL_META[t.href].g === g.id; }).map(function (t) {
        var m = TOOL_META[t.href];
        return (
          '<a href="' + t.href + '" role="menuitem" style="--i:' + (seq++) + '" data-dl-href="' + t.href + '">' +
          '<span class="cvx-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + m.ic + "</svg></span>" +
          '<b><span class="mg-t">' + bi(t.bn, t.en) + (m.nw ? '<i class="mg-new">NEW</i>' : "") + "</span>" +
          '<span class="mg-d">' + bi(m.d[0], m.d[1]) + "</span></b></a>"
        );
      }).join("");
      return '<div class="dl-mg" role="group"><p class="dl-mgh">' + bi(g.bn, g.en) + "</p>" + list + "</div>";
    }).join("");
    var dd =
      '<div class="dl-dd" data-dl-dd>' +
      '<button type="button" class="dl-dd-btn"' + (toolsActive ? ' aria-current="page"' : "") +
      ' aria-haspopup="true" aria-expanded="false">' + bi("টুলস", "Tools") + " " + ICON_CHEVRON + "</button>" +
      '<div class="dl-menu dl-menu-mega" role="menu">' + cols + "</div></div>";

    links.splice(2, 0, dd);
    GROUPS.forEach(function (g) { links.push(groupDD(g)); });

    return (
      '<div class="dl-bar">' +
      '<a class="dl-brand" href="/" aria-label="DCUCore — হোম">' +
      '<img src="logo.webp" alt="" width="38" height="38" onerror="this.style.display=\'none\'">' +
      '<span class="dl-brand-txt"><b>DCU</b><small>Core · শিক্ষার্থী টুলকিট</small></span></a>' +
      '<nav class="dl-nav" id="dlNav" aria-label="প্রধান নেভিগেশন">' + links.join("") + "</nav>" +
      '<div class="dl-actions">' +
      '<button type="button" class="dl-icon-btn dl-theme" data-dl-theme aria-label="থিম পরিবর্তন করুন" aria-pressed="false" title="থিম পরিবর্তন">' +
      ICON_MOON + "</button>" +
      '<button type="button" class="dl-icon-btn dl-burger" data-dl-burger aria-label="মেনু খুলুন" aria-expanded="false" aria-controls="dlNav">' +
      ICON_BURGER + "</button>" +
      "</div></div>"
    );
  }

  /* ---------- footer markup ---------- */
  function footerHTML() {
    var toolLinks = [
      ["/cover", "কভার পেজ", "Cover Page"],
      ["/cv", "সিভি স্টুডিও", "CV Studio"],
      ["/tools#routine", "ক্লাস রুটিন", "Class Routine"],
      ["/dcu-calendar", "স্টুডেন্ট ক্যালেন্ডার", "Student Calendar"],
      ["/tools#cgpa", "CGPA ক্যালকুলেটর", "CGPA Calculator"],
      ["/tools#pdf", "PDF টুলকিট", "PDF Toolkit"]
    ];
    var siteLinks = [
      ["/", "হোম", "Home"],
      ["/blood", "ডোনার ডিরেক্টরি", "Donor Directory"],
      ["/events", "ক্যাম্পাস ইভেন্ট", "Campus Events"],
      ["/library", "লাইব্রেরি", "Library"],
      ["/jobs", "জব ও টিউশন", "Jobs & Tuition"],
      ["/faq", "প্রশ্নোত্তর", "FAQ"],
      ["/feedback", "মতামত দিন", "Give Feedback"],
      ["/support", "সাহায্য করুন", "Support Us"],
      ["/about", "আমাদের সম্পর্কে", "About"]
    ];
    function col(bn, en, list) {
      return (
        "<div><h4>" + bi(bn, en) + "</h4>" +
        list.map(function (l) { return '<a href="' + l[0] + '">' + bi(l[1], l[2]) + "</a>"; }).join("") +
        "</div>"
      );
    }
    return (
      '<footer class="dl-foot">' +
      '<div class="dl-foot-in">' +
      '<div class="dl-foot-brand"><img src="logo.webp" alt="" width="52" height="52" onerror="this.style.display=\'none\'">' +
      "<div><b>DCUCore</b>" +
      "<p>" + bi(
        "শিক্ষার্থীদের জন্য প্রিমিয়াম ডিজিটাল টুলকিট — কভার পেজ, সিভি, ক্লাস রুটিন, CGPA ও আরও অনেক কিছু, বিনামূল্যে।",
        "A premium digital toolkit for students — cover pages, CVs, class routines, CGPA and more, completely free."
      ) + "</p>" +
      '<div class="dl-badges"><span class="dl-bdg">' + bi("ব্রাউজারে চলে", "Runs in your browser") + '</span><span class="dl-bdg">' +
      bi("সার্ভারে আপলোড নেই", "No server uploads") + '</span><span class="dl-bdg">' + bi("বিনামূল্যে", "Free") + "</span></div>" +
      "</div></div>" +
      col("টুলস", "Tools", toolLinks) +
      col("সাইট", "Site", siteLinks) +
      "</div>" +
      '<div class="dl-foot-bar"><span class="dl-copy">© <span data-dl-year></span> DCU Core · Developer by <a class="dl-dev-link" href="/about">Md Abdullah Biswas</a></span>' +
      '<span class="dl-disc">' + bi(
        "এটি একটি শিক্ষার্থী-উদ্যোগ, কোনো সরকারি বা প্রাতিষ্ঠানিক ওয়েবসাইট নয়।",
        "A student initiative — not an official or institutional website."
      ) + "</span></div>" +
      "</footer>"
    );
  }

  /* ---------- theme ---------- */
  function isDark() {
    return root.getAttribute("data-theme") === "dark";
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (document.body) document.body.classList.toggle("dark", theme === "dark");
    var btn = document.querySelector("[data-dl-theme]");
    if (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.innerHTML = theme === "dark" ? ICON_SUN : ICON_MOON;
    }
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage blocked */ }
    }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    if (saved === "dark" || saved === "light") applyTheme(saved, false);
    else applyTheme(isDark() ? "dark" : "light", false);

    var btn = document.querySelector("[data-dl-theme]");
    if (btn) {
      btn.addEventListener("click", function () {
        applyTheme(isDark() ? "light" : "dark", true);
      });
    }
  }

  /* ---------- nav behaviour ---------- */
  function initNav() {
    var host = document.getElementById("hdr");
    if (!host) return;

    var nav = host.querySelector("#dlNav");
    var burger = host.querySelector("[data-dl-burger]");
    var dd = host.querySelector("[data-dl-dd]");
    var ddBtn = dd && dd.querySelector(".dl-dd-btn");
    var cvd = host.querySelector("[data-dl-cvd]");
    var cvdBtn = cvd && cvd.querySelector(".dl-dd-btn");
    var grps = Array.prototype.slice.call(host.querySelectorAll("[data-dl-grp]"));

    function setGrp(w, open) {
      if (open) {
        if (dd) setDd(false);
        setCvd(false);
        grps.forEach(function (o) { if (o !== w) setGrp(o, false); });
        w.classList.remove("dl-closed");
      } else if (w.classList.contains("open")) { w.classList.add("dl-closed"); }
      w.classList.toggle("open", open);
      if (!open) { w.removeAttribute("data-hov"); w.removeAttribute("data-pin"); }
      w.querySelector(".dl-dd-btn").setAttribute("aria-expanded", String(open));
    }
    function closeGrps() { grps.forEach(function (w) { setGrp(w, false); }); }

    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "মেনু বন্ধ করুন" : "মেনু খুলুন");
      if (!open) { if (dd) setDd(false); setCvd(false); closeGrps(); }
    }

    function setDd(open) {
      if (!dd) return;
      if (open) { setCvd(false); closeGrps(); dd.classList.remove("dl-closed"); }
      else if (dd.classList.contains("open")) { dd.classList.add("dl-closed"); }
      dd.classList.toggle("open", open);
      if (!open) { dd.removeAttribute("data-hov"); dd.removeAttribute("data-pin"); }
      ddBtn.setAttribute("aria-expanded", String(open));
    }

    function markActive() { refreshCurrent(); }

    function setCvd(open) {
      if (!cvd) return;
      if (open) { if (dd) setDd(false); closeGrps(); cvd.classList.remove("dl-closed"); markActive(); }
      else if (cvd.classList.contains("open")) { cvd.classList.add("dl-closed"); }
      cvd.classList.toggle("open", open);
      if (!open) { cvd.removeAttribute("data-hov"); cvd.removeAttribute("data-pin"); }
      cvdBtn.setAttribute("aria-expanded", String(open));
    }

    if (cvdBtn) {
      cvdBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        setCvd(!cvd.classList.contains("open"));
      });
      cvd.querySelector(".dl-menu-cvx").addEventListener("click", function (e) {
        var a = e.target.closest("a[data-cvx-v]");
        if (!a) return;
        if (file === "cover.html") {
          /* already on the cover page: pick the type here without a reload */
          e.preventDefault();
          var v = a.getAttribute("data-cvx-v");
          var t = document.querySelector('#ctList .ct-tab[data-v="' + v + '"]');
          if (t) t.click();
          try { history.replaceState(null, "", "/cover#" + v); } catch (x) {}
          setCvd(false);
          cvd._closedAt = Date.now();
        }
      });
    }

    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      setMenu(!nav.classList.contains("is-open"));
    });

    if (ddBtn) {
      ddBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        setDd(!dd.classList.contains("open"));
      });
    }

    grps.forEach(function (w) {
      w.querySelector(".dl-dd-btn").addEventListener("click", function (e) {
        e.stopPropagation();
        setGrp(w, !w.classList.contains("open"));
      });
    });

    document.addEventListener("click", function (e) {
      if (!host.contains(e.target)) {
        setMenu(false);
        setDd(false);
        setCvd(false);
        closeGrps();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setMenu(false);
        setDd(false);
        setCvd(false);
        closeGrps();
      }
    });

    /* close the mobile menu after a real link is chosen */
    nav.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a && !(dd && ddBtn === a) && !(cvdBtn === a)) setMenu(false);
      var menuWrap = e.target.closest && e.target.closest("[data-dl-dd], [data-dl-cvd], [data-dl-grp]");
      if (a && menuWrap && menuWrap.contains(a)) {
        menuWrap.classList.add("dl-closed");
        menuWrap._closedAt = Date.now();
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      }
    });
    /* desktop: hover opens (short close delay), click pins, item-click / outside-click / Esc / scroll closes */
    var hoverMQ = window.matchMedia("(hover: hover) and (min-width: 961px)");
    [dd, cvd].concat(grps).forEach(function (w) {
      if (!w) return;
      var timer = null;
      var isCv = w === cvd;
      function setW(o) { if (isCv) setCvd(o); else if (w === dd) setDd(o); else setGrp(w, o); }
      w.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "touch" || !hoverMQ.matches) return;
        clearTimeout(timer);
        if (Date.now() - (w._closedAt || 0) < 450) return;
        w.classList.remove("dl-closed");
        if (w.classList.contains("open")) return;
        setW(true);
        w.setAttribute("data-hov", "");
      });
      w.addEventListener("pointerleave", function (e) {
        w.classList.remove("dl-closed");
        if (e.pointerType === "touch" || !hoverMQ.matches) return;
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (w.hasAttribute("data-hov")) { w.removeAttribute("data-hov"); setW(false); }
        }, 220);
      });
      w.addEventListener("click", function (e) {
        if (e.target.closest(".dl-dd-btn") && w.hasAttribute("data-hov")) { w.removeAttribute("data-hov"); w.setAttribute("data-pin", ""); }
      }, true);
    });
    function closeAllDd() {
      [dd, cvd].concat(grps).forEach(function (w) { if (w) { w.removeAttribute("data-hov"); w.removeAttribute("data-pin"); } });
      setDd(false); setCvd(false); closeGrps();
    }
    window.addEventListener("scroll", function () {
      if ((dd && dd.classList.contains("open")) || (cvd && cvd.classList.contains("open")) || grps.some(function (w) { return w.classList.contains("open"); })) closeAllDd();
    }, { passive: true });
  }

  /* ---------- current location: highlight the matching menu item ---------- */
  /* tools: the page shows the tab named by #hash (unknown/empty -> card), same as tools.html */
  var TOOL_IDS = ["card", "frame", "routine", "cgpa", "exam", "pdf", "calc", "result"];

  function activeTab() {
    var h = (location.hash || "").slice(1);
    return TOOL_IDS.indexOf(h) >= 0 ? h : "card";
  }

  function activeTool() {
    var hit = null;
    TOOLS.forEach(function (t) {
      var h = hashOf(t.href);
      var ok = h ? (file === "tools.html" && h === activeTab()) : pageOfPath(t.href) === file;
      if (ok && !hit) hit = t;
    });
    return hit;
  }

  function activeCover() {
    if (file !== "cover.html") return null;
    var el = document.querySelector('#ctList .ct-tab[aria-checked="true"]');
    var v = el ? el.getAttribute("data-v") : (location.hash || "").slice(1);
    for (var i = 0; i < COVER_TYPES.length; i++) if (COVER_TYPES[i].v === v) return COVER_TYPES[i];
    return null;
  }

  function refreshCurrent() {
    var host = document.getElementById("hdr");
    if (!host) return;
    var tool = activeTool();
    var cover = activeCover();

    host.querySelectorAll("[data-dl-href]").forEach(function (a) {
      var on = tool !== null && a.getAttribute("data-dl-href") === tool.href;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });

    host.querySelectorAll("[data-cvx-v]").forEach(function (a) {
      var on = !!cover && a.getAttribute("data-cvx-v") === cover.v;
      a.classList.toggle("on", on);
      a.setAttribute("aria-checked", String(on));
    });
  }

  function initCurrent() {
    window.addEventListener("hashchange", refreshCurrent);
    window.addEventListener("popstate", refreshCurrent);
    /* tabs may change the page without a hash event: re-check after any click */
    document.addEventListener("click", function () {
      setTimeout(refreshCurrent, 0);
      setTimeout(refreshCurrent, 300);
    }, true);
    refreshCurrent();
  }

  /* ---------- tools tab strip (shown on the calendar and CV pages too) ---------- */
  var TOOL_TABS = [
    { id: "card", href: "/tools#card", bn: "শেয়ার কার্ড", en: "Share Card" },
    { id: "frame", href: "/tools#frame", bn: "প্রোফাইল ফ্রেম", en: "Profile Frame" },
    { id: "cv", href: "/cv", bn: "সিভি স্টুডিও", en: "CV Studio" },
    { id: "routine", href: "/tools#routine", bn: "ক্লাস রুটিন", en: "Class Routine" },
    { id: "cgpa", href: "/tools#cgpa", bn: "CGPA ক্যালকুলেটর", en: "CGPA Calculator" },
    { id: "exam", href: "/tools#exam", bn: "পরীক্ষা প্ল্যানার", en: "Exam Planner" },
    { id: "calendar", href: "/dcu-calendar", bn: "স্টুডেন্ট ক্যালেন্ডার", en: "Student Calendar" },
    { id: "pdf", href: "/tools#pdf", bn: "PDF টুলকিট", en: "PDF Toolkit" },
    { id: "calc", href: "/tools#calc", bn: "সায়েন্টিফিক ক্যালকুলেটর", en: "Scientific Calculator" },
    { id: "result", href: "/tools#result", bn: "রেজাল্ট", en: "Results" }
  ];

  function mountToolTabs(hdr) {
    var here = file === "cv.html" ? "cv" : file === "dcu-calendar.html" ? "calendar" : null;
    if (!here || document.querySelector(".dl-tabs")) return;
    /* same privacy line as the tools page, above the tabs */
    var note = document.createElement("div");
    note.className = "dl-pv";
    note.innerHTML = "🔒 <b>" + bi("আপনার তথ্য শুধু আপনার ডিভাইসে থাকে।", "Your data stays only on your device.") + "</b> " +
      bi("এখানে দেওয়া সব তথ্য, ছবি ও ফাইল আপনার ব্রাউজারেই প্রসেস ও সংরক্ষিত হয়; কোনো সার্ভারে পাঠানো হয় না, তাই কেউ চাইলেও তা দেখতে পারে না।",
         "Everything you enter, including photos and files, is processed and saved in your browser only. Nothing is sent to a server, so nobody else can see it.");
    hdr.parentNode.insertBefore(note, hdr.nextSibling);
    var nav = document.createElement("nav");
    nav.className = "dl-tabs";
    nav.setAttribute("aria-label", "টুলস");
    nav.innerHTML = TOOL_TABS.map(function (t) {
      return '<a href="' + t.href + '"' + (t.id === here ? ' aria-current="page" class="on"' : "") + ">" +
        bi(t.bn, t.en) + "</a>";
    }).join("");
    hdr.parentNode.insertBefore(nav, note.nextSibling);
    keepActiveVisible(nav);
  }

  /* on a narrow screen the strip scrolls sideways: bring the current tab into view */
  function keepActiveVisible(strip) {
    var go = function () {
      var a = strip.querySelector(".on");
      if (!a) return;
      var sr = strip.getBoundingClientRect(), ar = a.getBoundingClientRect();
      strip.scrollLeft += (ar.left - sr.left) - (sr.width - ar.width) / 2;
    };
    requestAnimationFrame(go);
    setTimeout(go, 150);
    window.addEventListener("load", go);
    if (document.fonts) document.fonts.ready.then(go);
  }

  /* ---------- boot ---------- */
  var CVX_CSS = [
    'html:not([data-lang="en"]) .cvx-en{display:none}',
    'html[data-lang="en"] .cvx-bn{display:none}',
    ".dl-menu-cvx{width:min(92vw,470px)}",
    ".dl-menu-cvx a{position:relative;flex-direction:row;align-items:center;justify-content:flex-start;text-align:left;gap:10px;padding:10px 12px}",
    ".dl-menu-cvx a b{display:flex;flex-direction:column;gap:2px;min-width:0}",
    ".dl-menu-cvx a b span{display:block}",
    ".cvx-ic{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#1C4A85,#0A1A33);box-shadow:0 4px 10px rgba(10,26,51,.28);transition:transform .35s cubic-bezier(.2,.8,.2,1),background .3s}",
    ".cvx-ic svg{width:16px;height:16px}",
    ".dl-menu-cvx a:hover .cvx-ic{transform:scale(1.08) rotate(-4deg)}",
    ".dl-menu-cvx a.on{background:linear-gradient(135deg,rgba(217,178,106,.22),rgba(217,178,106,.04));box-shadow:inset 0 0 0 1px rgba(184,138,62,.6)}",
    ".dl-menu-cvx a.on .cvx-ic{background:linear-gradient(135deg,#F3E6C4,#D9B26A 50%,#B88A3E);color:#1d1400}",
    ".dl-menu-grp{width:min(92vw,250px);grid-template-columns:1fr}",
    ".dl-menu-grp a{flex-direction:row;align-items:center;justify-content:flex-start;padding:11px 14px}",
    ".dl-menu-grp a b{display:block;min-width:0}",
    ".dl-menu-grp a b span{display:inline}",
    "html:not([data-lang=\"en\"]) .dl-menu-grp .cvx-en,html[data-lang=\"en\"] .dl-menu-grp .cvx-bn{display:none}",
    "@media(min-width:961px){.dl-menu-r{left:auto!important;right:0;transform-origin:100% 0!important}.dl-dd:not(.open) .dl-menu.dl-menu-r{transform:translate(0,-10px) scale(.96)!important}.dl-dd.open .dl-menu.dl-menu-r{transform:translate(0,0) scale(1)!important}.dl-menu-r::before{left:auto;right:26px;transform:rotate(45deg)}}",
    "@media(max-width:960px){.dl-menu-grp{width:auto}}",
    "@media(min-width:961px){.dl-menu-mega{width:min(94vw,700px);grid-template-columns:repeat(3,1fr);gap:4px 10px;padding:14px}}",
    "@media(max-width:960px){.dl-menu-mega{width:auto}}",
    ".dl-mg{display:flex;flex-direction:column;gap:2px;min-width:0}",
    ".dl-mgh{margin:0 0 4px;padding:2px 10px 7px;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--dl-gold-d,#9a7414);border-bottom:1px solid var(--dl-line)}",
    ".dl-menu-mega a{position:relative;flex-direction:row;align-items:flex-start;justify-content:flex-start;text-align:left;gap:10px;padding:9px 10px}",
    ".dl-menu-mega a b{display:flex;flex-direction:column;gap:1px;min-width:0}",
    ".dl-menu-mega a .mg-d{display:block;line-height:1.35;font-size:.72rem;font-weight:400;color:var(--dl-ink-2)}",
    ".dl-menu-mega a .cvx-ic{width:34px;height:34px;border-radius:10px;margin-top:1px}",
    ".dl-menu-mega a:hover .cvx-ic{transform:scale(1.08) rotate(-4deg)}",
    ".dl-menu-mega a.on b::after{content:none}",
    ".dl-menu-mega a.on .cvx-ic{background:linear-gradient(135deg,#F3E6C4,#D9B26A 50%,#B88A3E);color:#1d1400}",
    ".mg-new{font-style:normal;margin-left:6px;padding:1px 6px;border-radius:99px;font-size:.62rem;font-weight:800;letter-spacing:.04em;color:#1d1400;background:linear-gradient(135deg,#F3E6C4,#D9B26A 55%,#B88A3E);vertical-align:middle}",
    ".dl-dd.open .dl-menu a{animation:cvxIn .42s calc(var(--i,0)*30ms + 30ms) cubic-bezier(.2,.8,.2,1) both}",
    "@media(min-width:961px){.dl-menu{transform-origin:50% 0;filter:blur(6px);transition:opacity .24s ease,transform .32s cubic-bezier(.2,.9,.25,1.15),visibility .24s,filter .24s ease!important}}",
    ".dl-dd.open .dl-menu{filter:blur(0)}",
    "@media(min-width:961px){.dl-dd:not(.open) .dl-menu{transform:translate(-50%,-10px) scale(.96)!important}.dl-dd.open .dl-menu{transform:translate(-50%,0) scale(1)!important}}",
    "@keyframes cvxIn{from{opacity:0;transform:translateY(8px) scale(.96)}}",
    "@media(prefers-reduced-motion:reduce){.dl-menu,.dl-menu a,.cvx-ic{animation:none!important;transition:none!important;filter:none!important}}"
  ].join("");

  function mount() {
    if (!document.querySelector('link[data-dcu-font]')) {
      var pc = document.createElement("link"); pc.rel = "preconnect"; pc.href = "https://fonts.gstatic.com"; pc.crossOrigin = "";
      var fl = document.createElement("link"); fl.rel = "stylesheet"; fl.setAttribute("data-dcu-font", "");
      fl.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Noto+Serif+Bengali:wght@300..800&display=swap";
      (document.head || document.documentElement).appendChild(pc);
      (document.head || document.documentElement).appendChild(fl);
    }
    if (!document.getElementById("dlCvxCss")) {
      var cst = document.createElement("style");
      cst.id = "dlCvxCss";
      cst.textContent = CVX_CSS;
      document.head.appendChild(cst);
    }
    var hdr = document.getElementById("hdr");
    if (!hdr) {
      hdr = document.createElement("div");
      hdr.id = "hdr";
      document.body.insertBefore(hdr, document.body.firstChild);
    }
    hdr.innerHTML = headerHTML();
    mountToolTabs(hdr);

    var ftr = document.getElementById("ftr");
    if (!ftr) {
      ftr = document.createElement("div");
      ftr.id = "ftr";
      document.body.appendChild(ftr);
    }
    ftr.innerHTML = footerHTML();

    var year = String(new Date().getFullYear());
    ftr.querySelectorAll("[data-dl-year]").forEach(function (el) { el.textContent = year; });

    initTheme();
    initNav();
    initCurrent();
    try { document.dispatchEvent(new CustomEvent("dcu:layout-ready")); } catch (e) { /* old browser */ }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();

/* ---------- visitor tracker ----------
 * dcu-layout.js প্রতিটি পাবলিক পেজে লোড হয়, তাই ভিজিট ট্র্যাকার এখান থেকেই চালু হয়।
 * (এডমিন পেজ, বট ও এডমিনের নিজের ভিজিট track.js নিজেই বাদ দেয়।) */
(function () {
  "use strict";
  if (window.__dcuTrack || document.getElementById("dcuTrackJs")) return;
  var s = document.createElement("script");
  s.id = "dcuTrackJs";
  s.src = "/track.js";
  s.async = true;
  (document.head || document.documentElement).appendChild(s);
})();
