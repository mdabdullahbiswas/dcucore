/* library.js — লাইব্রেরি পেজের ব্রাউজ অংশ (ধাপ ৩.২ ও ৩.৩)
 *
 * কী করে:
 *   ১) কলেজ ফিল্টার সারি আঁকে ("সব কলেজ" + ৭ কলেজ), একটি বেছে নিলে বিভাগের তালিকা সেই কলেজ অনুযায়ী বদলায়।
 *   ২) বিভাগের কার্ডের গ্রিড আঁকে (আইকন + বাংলা ও ইংরেজি নাম)।
 *   ৩) ভাষা বদলালে (বাংলা/English) নিজে থেকে নতুন করে আঁকে।
 *   ৪) (৩.৩) স্কেলেটন লোডিং ও খালি অবস্থার বার্তা: বিভাগের গ্রিডে এবং "নতুন যোগ হওয়া ফাইল" অংশে।
 *
 * ডেটা আসে lib-data.js (window.LibData) থেকে। অ্যাডমিন পরে Firestore থেকে যা যোগ করবেন,
 * LibData.merge() ডাকলেই এখানে নিজে থেকে হালনাগাদ হবে (LibData.onChange)।
 *
 * পরের ধাপের জন্য ইভেন্ট (document-এ):
 *   "lib:college" → detail: { slug }   (slug খালি মানে "সব কলেজ")
 *   "lib:dept"    → detail: { slug, college }   (কার্ডে ক্লিক/ট্যাপ করলে)
 * বাইরে থেকে ব্যবহার: window.LibUI.college(), window.LibUI.setCollege(slug)
 *   LibUI.loading(true|false)   → বিভাগের গ্রিডে স্কেলেটন দেখায়/সরায় (ডেটা আনার সময় ডাকবেন)
 *   LibUI.filesState("loading"|"empty") → "নতুন যোগ হওয়া ফাইল" অংশের অবস্থা (ধাপ ৬-এ আসল ফাইল আসবে)
 */
(function () {
  "use strict";

  /* ---------- বিভাগের আইকন (২৪×২৪, stroke=currentColor) ----------
   * কয়েকটি আইকন অক্ষর-চিহ্ন (অ, Aa, ع, π, Ψ), বাকিগুলো সরল রেখার ছবি। */
  function glyph(ch, size) {
    return '<text x="12" y="' + (size > 14 ? 17.5 : 17) + '" text-anchor="middle" font-size="' + size +
      '" font-weight="700" fill="currentColor" stroke="none" font-family="inherit">' + ch + "</text>";
  }

  var ICONS = {
    "bangla": glyph("অ", 17),
    "english": glyph("Aa", 14),
    "arabic": glyph("ع", 17),
    "mathematics": glyph("π", 18),
    "psychology": glyph("Ψ", 17),

    "history": '<path d="M6 3h12M6 21h12M7 3c0 5 4 6 5 9-1 3-5 4-5 9M17 3c0 5-4 6-5 9 1 3 5 4 5 9"/>',
    "philosophy": '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
    "islamic-history-culture": '<path d="M3 21h18M6 21v-8a6 6 0 0 1 12 0v8M12 7V3M9.5 21v-4a2.5 2.5 0 0 1 5 0v4"/>',
    "islamic-studies": '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 4v3M15.5 5.5h3"/>',
    "economics": '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    "political-science": '<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',
    "sociology": '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 14c2.8.2 5 2.4 5 5.5"/>',
    "social-work": '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    "statistics": '<path d="M5 20V11M12 20V4M19 20v-6M3 20h18"/>',
    "physics": '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4"/>',
    "chemistry": '<path d="M9 3h6M10 3v6l-5.5 10a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3M7.5 15h9"/>',
    "botany": '<path d="M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 15c0-3 2.5-5 6-5 0 3.5-2.5 5-6 5z"/>',
    "zoology": '<circle cx="8" cy="9" r="1.6"/><circle cx="16" cy="9" r="1.6"/><circle cx="5" cy="14" r="1.5"/><circle cx="19" cy="14" r="1.5"/><path d="M12 13c-3 0-5 2.5-5 4.5 0 1.8 1.5 2.5 3 2.5.8 0 1.4-.3 2-.3s1.2.3 2 .3c1.5 0 3-.7 3-2.5 0-2-2-4.5-5-4.5z"/>',
    "geography-environment": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    "home-economics": '<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5"/>',
    "management": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    "accounting": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
    "marketing": '<path d="M3 11v3a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1zM18 9a4 4 0 0 1 0 6"/>',
    "finance-banking": '<path d="M3 9l9-5 9 5H3zM5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 21h18"/>'
  };

  /* অ্যাডমিনের যোগ করা নতুন বিভাগের জন্য: খোলা বই */
  var FALLBACK_ICON = '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5v-13zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5v-13z"/>';

  function iconSvg(slug) {
    return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">' +
      (ICONS[slug] || FALLBACK_ICON) + "</svg>";
  }

  /* ---------- ছোট সহায়ক ---------- */
  var D = window.LibData;
  var elFilter = document.getElementById("lib-filter");
  var elGrid = document.getElementById("lib-grid");
  var elStatus = document.getElementById("lib-status");
  var elFiles = document.getElementById("lib-files");
  if (!D || !elFilter || !elGrid) return;

  var selected = "";            // "" = সব কলেজ
  var swapTimer = 0;
  var gridLoading = false;      // true হলে বিভাগের জায়গায় স্কেলেটন
  var filesState = "empty";     // "loading" | "empty"

  function lang() {
    return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn";
  }
  function other(l) { return l === "en" ? "bn" : "en"; }
  function tx(bn, en) { return lang() === "en" ? en : bn; }
  function num(n) { return lang() === "en" ? String(n) : n.toLocaleString("bn-BD"); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function reduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- কলেজ ফিল্টার সারি ---------- */
  function chip(slug, label) {
    var on = slug === selected;
    return '<button type="button" class="lib-chip' + (on ? " on" : "") + '" data-college="' + esc(slug) +
      '" aria-pressed="' + on + '">' + esc(label) + "</button>";
  }

  function renderFilter() {
    var l = lang();
    var html = chip("", tx("সব কলেজ", "All colleges"));
    D.colleges().forEach(function (c) { html += chip(c.slug, D.name(c, l)); });
    elFilter.innerHTML = html;
    elFilter.setAttribute("aria-label", tx("কলেজ বেছে নিন", "Choose a college"));
  }

  function syncChips() {
    var on = null;
    elFilter.querySelectorAll(".lib-chip").forEach(function (b) {
      var is = b.getAttribute("data-college") === selected;
      b.classList.toggle("on", is);
      b.setAttribute("aria-pressed", String(is));
      if (is) on = b;
    });
    return on;
  }

  /* ---------- স্কেলেটন ও খালি অবস্থা (৩.৩) ---------- */
  /* সব স্কেলেটনই aria-hidden; স্ক্রিন-রিডার শুধু aria-busy ও status-এর লেখা পায় */
  function skCard() {
    return '<div class="lib-sk-card" aria-hidden="true"><span class="lib-sk lib-sk-ico"></span>' +
      '<span class="lib-sk-lines"><span class="lib-sk lib-sk-l1"></span><span class="lib-sk lib-sk-l2"></span></span></div>';
  }
  function skFile() {
    return '<div class="lib-sk-file" aria-hidden="true"><span class="lib-sk lib-sk-ico"></span>' +
      '<span class="lib-sk-lines"><span class="lib-sk lib-sk-l1"></span><span class="lib-sk lib-sk-l2"></span></span>' +
      '<span class="lib-sk lib-sk-tag"></span></div>';
  }
  function repeat(fn, n) { var h = ""; for (var i = 0; i < n; i++) h += fn(); return h; }

  var EMPTY_ICONS = {
    files: '<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 13h6"/>',
    dept: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5v-13zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5v-13z"/>'
  };
  function emptyHTML(kind, title, text) {
    return '<div class="lib-empty lib-none" role="note">' +
      '<span class="lib-empty-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false">' + EMPTY_ICONS[kind] + "</svg></span>" +
      '<b class="lib-empty-title">' + esc(title) + "</b>" +
      '<p class="lib-empty-text">' + esc(text) + "</p></div>";
  }

  function renderFiles() {
    if (!elFiles) return;
    var busy = filesState === "loading";
    elFiles.setAttribute("aria-busy", String(busy));
    elFiles.innerHTML = busy ? repeat(skFile, 3) :
      emptyHTML("files",
        tx("এখনো কোনো ফাইল নেই", "No files yet"),
        tx("ফাইল জমা হয়ে অ্যাডমিনের অনুমোদন পেলেই এখানে দেখা যাবে।",
           "Files will show up here once they are submitted and approved by an admin."));
  }

  /* ---------- বিভাগের কার্ড ---------- */
  function renderGrid(animate) {
    var l = lang(), o = other(l);

    if (gridLoading) {
      elGrid.setAttribute("aria-busy", "true");
      elStatus.textContent = tx("লোড হচ্ছে…", "Loading…");
      elGrid.classList.remove("is-swap");
      elGrid.innerHTML = repeat(skCard, 8);
      return;
    }
    elGrid.setAttribute("aria-busy", "false");

    var list = D.departments(selected);
    var col = selected ? D.college(selected) : null;

    elStatus.textContent = (col ? D.name(col, l) : tx("সব কলেজ", "All colleges")) + " — " +
      tx(num(list.length) + "টি বিভাগ", num(list.length) + (list.length === 1 ? " department" : " departments"));

    if (!list.length) {
      elGrid.innerHTML = emptyHTML("dept",
        tx("কোনো বিভাগ পাওয়া যায়নি", "No departments found"),
        tx("এই কলেজের জন্য এখনো কোনো বিভাগ যোগ করা হয়নি।", "No departments have been added for this college yet."));
      return;
    }

    var html = "";
    list.forEach(function (d, i) {
      var primary = D.name(d, l);
      var alt = d[o] && d[o] !== d[l] ? d[o] : "";
      html += '<button type="button" class="lib-dept" data-dept="' + esc(d.slug) + '" style="--i:' + Math.min(i, 14) + '">' +
        '<span class="lib-dept-ico" aria-hidden="true">' + iconSvg(d.slug) + "</span>" +
        '<span class="lib-dept-txt"><b class="lib-dept-name" lang="' + l + '">' + esc(primary) + "</b>" +
        (alt ? '<small class="lib-dept-alt" lang="' + o + '">' + esc(alt) + "</small>" : "") +
        "</span></button>";
    });

    clearTimeout(swapTimer);
    elGrid.classList.toggle("is-swap", !!animate && !reduced());
    elGrid.innerHTML = html;
    if (animate) swapTimer = setTimeout(function () { elGrid.classList.remove("is-swap"); }, 800);
  }

  function renderAll() {
    renderFilter();
    renderGrid(false);
    renderFiles();
  }

  /* ---------- ক্রিয়া ---------- */
  function setCollege(slug, scrollChip) {
    slug = slug || "";
    if (slug && !D.college(slug)) slug = "";
    if (slug === selected) return;
    selected = slug;
    var chipEl = syncChips();
    renderGrid(true);
    if (scrollChip && chipEl && chipEl.scrollIntoView) {
      chipEl.scrollIntoView({ inline: "center", block: "nearest", behavior: reduced() ? "auto" : "smooth" });
    }
    document.dispatchEvent(new CustomEvent("lib:college", { detail: { slug: selected } }));
  }

  elFilter.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".lib-chip");
    if (b) setCollege(b.getAttribute("data-college"), true);
  });

  /* ← → কী দিয়ে এক চিপ থেকে আরেক চিপে যাওয়া */
  elFilter.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    var chips = Array.prototype.slice.call(elFilter.querySelectorAll(".lib-chip"));
    var i = chips.indexOf(document.activeElement);
    if (i < 0) return;
    var n = e.key === "Home" ? 0 : e.key === "End" ? chips.length - 1 :
      (i + (e.key === "ArrowRight" ? 1 : -1) + chips.length) % chips.length;
    chips[n].focus();
    e.preventDefault();
  });

  elGrid.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".lib-dept");
    if (!b) return;
    document.dispatchEvent(new CustomEvent("lib:dept", {
      detail: { slug: b.getAttribute("data-dept"), college: selected }
    }));
  });

  /* ---------- ভাষা বদল ও ডেটা বদলে নতুন করে আঁকা ---------- */
  var prevOnLang = window.onLang;
  window.onLang = function () {
    if (typeof prevOnLang === "function") { try { prevOnLang(); } catch (e) { /* অন্য পেজের হুক */ } }
    renderAll();
  };

  var prevChange = D.onChange;
  D.onChange = function () {
    if (typeof prevChange === "function") prevChange();
    if (selected && !D.college(selected)) selected = "";
    renderAll();
  };

  window.LibUI = {
    college: function () { return selected; },
    setCollege: function (slug) { setCollege(slug, true); },
    loading: function (on) {
      on = !!on;
      if (on === gridLoading) return;
      gridLoading = on;
      renderGrid(!on);
    },
    filesState: function (state) {
      filesState = state === "loading" ? "loading" : "empty";
      renderFiles();
    }
  };

  renderAll();
})();
