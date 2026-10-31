/* dcu-layout.js
 * Shared premium header + footer for every DCU Unofficial page.
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

  /* ---------- data ---------- */
  var NAV = [
    { href: "/", label: "হোম" },
    { href: "/cover", label: "কভার পেজ" },
    { href: "/blood", label: "ডোনার" },
    { href: "/feedback", label: "মতামত" },
    { href: "/about", label: "আমাদের সম্পর্কে" }
  ];

  var TOOLS = [
    { href: "/tools#card", bn: "শেয়ার কার্ড", en: "Share Card" },
    { href: "/tools#routine", bn: "ক্লাস রুটিন", en: "Class Routine" },
    { href: "/tools#cgpa", bn: "CGPA ক্যালকুলেটর", en: "CGPA Calculator" },
    { href: "/tools#exam", bn: "পরীক্ষা প্ল্যানার", en: "Exam Planner" },
    { href: "/cv", bn: "সিভি বিল্ডার", en: "CV Builder" },
    { href: "/tools#frame", bn: "প্রোফাইল ফ্রেম", en: "Profile Frame" },
    { href: "/tools#pdf", bn: "PDF টুলকিট", en: "PDF Toolkit" },
    { href: "/tools#calc", bn: "সায়েন্টিফিক ক্যালকুলেটর", en: "Scientific Calculator" },
    { href: "/tools#result", bn: "রেজাল্ট", en: "Results Portal" }
  ];

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

  /* ---------- header markup ---------- */
  function headerHTML() {
    var links = NAV.map(function (n) {
      if (n.href === "/cover") return coverDD();
      var cur = isCurrent(n.href) ? ' aria-current="page"' : "";
      return '<a href="' + n.href + '"' + cur + ">" + esc(n.label) + "</a>";
    });

    // insert the tools dropdown after the "কভার পেজ" link (index 1)
    var toolsActive = file === "tools.html";
    var items = TOOLS.map(function (t) {
      return (
        '<a href="' + t.href + '" role="menuitem"><b><span class="cvx-bn">' + esc(t.bn) +
        '</span><span class="cvx-en">' + esc(t.en) + "</span></b></a>"
      );
    }).join("");
    var dd =
      '<div class="dl-dd" data-dl-dd>' +
      '<button type="button" class="dl-dd-btn"' + (toolsActive ? ' aria-current="page"' : "") +
      ' aria-haspopup="true" aria-expanded="false">টুলস ' + ICON_CHEVRON + "</button>" +
      '<div class="dl-menu" role="menu">' + items + "</div></div>";

    links.splice(2, 0, dd);

    return (
      '<div class="dl-bar">' +
      '<a class="dl-brand" href="/" aria-label="DCU Unofficial — হোম">' +
      '<img src="logo.png" alt="" width="38" height="38">' +
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
      ["/cover", "কভার পেজ"],
      ["/cv", "সিভি বিল্ডার"],
      ["/tools#routine", "ক্লাস রুটিন"],
      ["/tools#cgpa", "CGPA ক্যালকুলেটর"],
      ["/tools#pdf", "PDF টুলকিট"]
    ];
    var siteLinks = [
      ["/", "হোম"],
      ["/blood", "ডোনার ডিরেক্টরি"],
      ["/feedback", "মতামত দিন"],
      ["/about", "আমাদের সম্পর্কে"]
    ];
    function col(title, list) {
      return (
        "<div><h4>" + esc(title) + "</h4>" +
        list.map(function (l) { return '<a href="' + l[0] + '">' + esc(l[1]) + "</a>"; }).join("") +
        "</div>"
      );
    }
    return (
      '<footer class="dl-foot">' +
      '<div class="dl-foot-in">' +
      '<div class="dl-foot-brand"><img src="logo.png" alt="" width="52" height="52">' +
      "<div><b>DCU Unofficial</b>" +
      "<p>শিক্ষার্থীদের জন্য প্রিমিয়াম ডিজিটাল টুলকিট — কভার পেজ, সিভি, ক্লাস রুটিন, CGPA ও আরও অনেক কিছু, বিনামূল্যে।</p>" +
      '<div class="dl-badges"><span>✓ ব্রাউজারে চলে</span><span>✓ সার্ভারে আপলোড নেই</span><span>✓ বিনামূল্যে</span></div>' +
      '<div class="dl-foot-cta"><a class="dl-cta-main" href="/cover">কভার পেজ বানান <i aria-hidden="true">→</i></a>' +
      '<a class="dl-cta-ghost" href="/tools#card">সব টুলস</a></div>' +
      "</div></div>" +
      col("টুলস", toolLinks) +
      col("সাইট", siteLinks) +
      "</div>" +
      '<div class="dl-foot-bar"><span class="dl-copy">© <span data-dl-year></span> DCU Core <em>· শিক্ষার্থীদের জন্য, ❤</em></span>' +
      '<span class="dl-disc">এটি একটি শিক্ষার্থী-উদ্যোগ, কোনো সরকারি বা প্রাতিষ্ঠানিক ওয়েবসাইট নয়।</span></div>' +
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

    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "মেনু বন্ধ করুন" : "মেনু খুলুন");
      if (!open) { if (dd) setDd(false); setCvd(false); }
    }

    function setDd(open) {
      if (!dd) return;
      if (open) { setCvd(false); dd.classList.remove("dl-closed"); }
      else { dd.classList.add("dl-closed"); }
      dd.classList.toggle("open", open);
      ddBtn.setAttribute("aria-expanded", String(open));
    }

    function markActive() {
      var act = document.querySelector('#ctList .ct-tab[aria-checked="true"]');
      var v = act ? act.getAttribute("data-v") : "";
      host.querySelectorAll("[data-cvx-v]").forEach(function (a) {
        var on = a.getAttribute("data-cvx-v") === v;
        a.classList.toggle("on", on);
        a.setAttribute("aria-checked", String(on));
      });
    }

    function setCvd(open) {
      if (!cvd) return;
      if (open) { if (dd) setDd(false); cvd.classList.remove("dl-closed"); markActive(); }
      else { cvd.classList.add("dl-closed"); }
      cvd.classList.toggle("open", open);
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

    document.addEventListener("click", function (e) {
      if (!host.contains(e.target)) {
        setMenu(false);
        setDd(false);
        setCvd(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setMenu(false);
        setDd(false);
        setCvd(false);
      }
    });

    /* close the mobile menu after a real link is chosen */
    nav.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a && !(dd && ddBtn === a) && !(cvdBtn === a)) setMenu(false);
      var menuWrap = e.target.closest && e.target.closest("[data-dl-dd], [data-dl-cvd]");
      if (a && menuWrap && menuWrap.contains(a)) {
        menuWrap.classList.add("dl-closed");
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      }
    });
    [dd, cvd].forEach(function (w) {
      if (!w) return;
      w.addEventListener("pointerleave", function () { w.classList.remove("dl-closed"); });
    });
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
    ".dl-cvx.open .dl-menu-cvx a,.dl-cvx:hover .dl-menu-cvx a{animation:cvxIn .42s calc(var(--i,0)*30ms + 30ms) cubic-bezier(.2,.8,.2,1) both}",
    "@keyframes cvxIn{from{opacity:0;transform:translateY(8px) scale(.96)}}",
    "@media(prefers-reduced-motion:reduce){.dl-cvx .dl-menu-cvx a,.cvx-ic{animation:none!important;transition:none!important}}"
  ].join("");

  function mount() {
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
