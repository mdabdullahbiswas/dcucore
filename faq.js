/* faq.js - FAQ page: renders DCU_FAQ with search, category chips and deep links.
 * Language comes from <html lang>; dcu-lang.js calls window.onLang on every switch.
 * URL features:  /faq#free  opens that question,  /faq?cat=blood  shows one group. */
(function () {
  "use strict";

  var data = window.DCU_FAQ;
  var host = document.getElementById("fqBody");
  var input = document.getElementById("fqSearch");
  var clearBtn = document.getElementById("fqClear");
  var chipsEl = document.getElementById("fqChips");
  var statusEl = document.getElementById("fqStatus");
  var askEl = document.getElementById("fqAsk");
  if (!data || !host || !input || !chipsEl) return;

  var ICONS = {
    start:   '<path d="M5 12l5 5L20 7"/>',
    privacy: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    cover:   '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    cv:      '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>',
    tools:   '<path d="M14.5 6.5a4 4 0 00-5 5L4 17l3 3 5.5-5.5a4 4 0 005-5l-2.5 2.5-2-2z"/>',
    blood:   '<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>',
    library: '<path d="M4 5a2 2 0 012-2h5v17H6a2 2 0 00-2 2zM20 5a2 2 0 00-2-2h-5v17h5a2 2 0 012 2z"/>',
    jobs:    '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/>',
    events:  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    support: '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
    search:  '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'
  };
  var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var T = {
    placeholder: { bn: "প্রশ্ন খুঁজুন, যেমন: ডোনার, কভার পেজ, অনুদান…", en: "Search a question, e.g. donor, cover page, donation…" },
    all:         { bn: "সব", en: "All" },
    clear:       { bn: "মুছুন", en: "Clear search" },
    chipsLabel:  { bn: "বিষয় অনুযায়ী ফিল্টার", en: "Filter by topic" },
    emptyTitle:  { bn: "কোনো উত্তর মেলেনি", en: "No answers found" },
    emptyText:   { bn: "অন্য শব্দ দিয়ে খুঁজে দেখুন, অথবা আপনার প্রশ্নটি আমাদের জানান।", en: "Try different words, or send us your question." },
    emptyAsk:    { bn: "ফিডব্যাকে প্রশ্ন জানান", en: "Ask us via Feedback" },
    emptyReset:  { bn: "সব প্রশ্ন দেখুন", en: "Show all questions" }
  };

  var state = { q: "", cat: "all" };

  /* ---------- helpers ---------- */
  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "bn"; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function num(n, l) {
    return l === "bn" ? String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯".charAt(d); }) : String(n);
  }
  /* lower-case and drop zero-width joiners so Bangla conjuncts match whichever way they were typed */
  function norm(s) { return String(s).toLowerCase().replace(/[‌‍]/g, ""); }
  function tokens() { return norm(state.q).split(/\s+/).filter(Boolean); }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  /* escape text and wrap search words in <mark> */
  function hl(text, toks) {
    var raw = String(text);
    if (!toks.length) return esc(raw);
    var re = new RegExp("(" + toks.map(reEsc).join("|") + ")", "gi");
    var out = "", last = 0, m;
    while ((m = re.exec(raw))) {
      if (m[0] === "") { re.lastIndex++; continue; }
      out += esc(raw.slice(last, m.index)) + '<mark class="fq-hit">' + esc(m[0]) + "</mark>";
      last = m.index + m[0].length;
    }
    return out + esc(raw.slice(last));
  }
  function para(text, toks) {
    return String(text).split("\n").map(function (p) { return "<p>" + hl(p, toks) + "</p>"; }).join("");
  }

  /* every word must appear in the question or answer (either language, plus the topic name, so an English word finds Bangla pages too) */
  var catName = {};
  data.cats.forEach(function (c) { catName[c.id] = c.bn + " " + c.en; });
  function matches(it, toks) {
    if (!toks.length) return true;
    var hay = norm(it.q.bn + " " + it.q.en + " " + it.a.bn + " " + it.a.en + " " + catName[it.cat]);
    return toks.every(function (t) { return hay.indexOf(t) > -1; });
  }
  function byQuery() {
    var toks = tokens();
    return data.items.filter(function (i) { return matches(i, toks); });
  }

  /* ---------- pieces ---------- */
  function itemHTML(it, l, toks) {
    var link = it.link
      ? '<a class="fq-go" href="' + esc(it.link.href) + '">' + esc(it.link[l]) + ARROW + "</a>"
      : "";
    return (
      '<article class="fq-item" id="' + esc(it.id) + '">' +
        '<h3><button type="button" class="fq-q" aria-expanded="false" aria-controls="a-' + esc(it.id) + '">' +
          "<span>" + hl(it.q[l], toks) + "</span>" +
          '<span class="fq-chev">' + CHEV + "</span>" +
        "</button></h3>" +
        '<div class="fq-a" id="a-' + esc(it.id) + '" role="region">' +
          '<div class="fq-a-in"><div class="fq-a-txt">' + para(it.a[l], toks) + link + "</div></div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderChips(l, inQuery) {
    var counts = {};
    inQuery.forEach(function (i) { counts[i.cat] = (counts[i.cat] || 0) + 1; });
    var html = chip("all", T.all[l], inQuery.length, l);
    data.cats.forEach(function (c) { html += chip(c.id, c[l], counts[c.id] || 0, l); });
    chipsEl.innerHTML = html;
    chipsEl.setAttribute("aria-label", T.chipsLabel[l]);
  }
  function chip(id, label, n, l) {
    return '<button type="button" class="fq-chip" data-cat="' + esc(id) + '" aria-pressed="' + (state.cat === id) + '">' +
      esc(label) + "<small>" + num(n, l) + "</small></button>";
  }

  function emptyHTML(l) {
    return (
      '<div class="fq-empty">' +
        '<span class="fq-ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS.search + "</svg></span>" +
        "<h2>" + esc(T.emptyTitle[l]) + "</h2>" +
        "<p>" + esc(T.emptyText[l]) + "</p>" +
        '<a class="fq-go" href="/feedback">' + esc(T.emptyAsk[l]) + ARROW + "</a>" +
        '<button type="button" class="fq-go ghost" data-reset="1">' + esc(T.emptyReset[l]) + "</button>" +
      "</div>"
    );
  }

  /* ---------- main render ---------- */
  function render() {
    var l = lang();
    var toks = tokens();
    var openEl = host.querySelector(".fq-item.open");
    var openId = openEl ? openEl.id : null;

    var inQuery = byQuery();
    var shown = state.cat === "all" ? inQuery : inQuery.filter(function (i) { return i.cat === state.cat; });

    input.placeholder = T.placeholder[l];
    input.setAttribute("aria-label", T.placeholder[l]);
    clearBtn.setAttribute("aria-label", T.clear[l]);
    clearBtn.hidden = !state.q;
    renderChips(l, inQuery);

    /* the empty state already has its own "ask us" button */
    if (askEl) askEl.hidden = !shown.length;

    if (!shown.length) {
      host.innerHTML = emptyHTML(l);
    } else {
      host.innerHTML = data.cats.map(function (c) {
        var list = shown.filter(function (i) { return i.cat === c.id; });
        if (!list.length) return "";
        return (
          '<section class="fq-cat" id="cat-' + esc(c.id) + '" aria-labelledby="h-' + esc(c.id) + '">' +
            '<div class="fq-cat-head">' +
              '<span class="fq-ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[c.id] || "") + "</svg></span>" +
              '<h2 id="h-' + esc(c.id) + '">' + esc(c[l]) + "</h2>" +
              '<span class="fq-count">' + num(list.length, l) + "</span>" +
            "</div>" +
            '<div class="fq-list">' + list.map(function (i) { return itemHTML(i, l, toks); }).join("") + "</div>" +
          "</section>"
        );
      }).join("");
    }

    /* status line */
    var filtering = state.q || state.cat !== "all";
    statusEl.textContent = !shown.length ? "" :
      l === "bn" ? num(shown.length, l) + (filtering ? "টি ফলাফল" : "টি প্রশ্ন")
                 : shown.length + (filtering ? " results" : " questions");

    /* keep the open question open; a single search hit opens itself */
    var keep = openId && document.getElementById(openId);
    if (keep) setOpen(keep, true);
    else if (state.q && shown.length === 1) setOpen(document.getElementById(shown[0].id), true);
  }

  function setOpen(item, open) {
    if (!item) return;
    item.classList.toggle("open", open);
    var b = item.querySelector(".fq-q");
    if (b) b.setAttribute("aria-expanded", String(open));
  }

  /* put the open question in the address bar so it can be shared */
  function setHash(id) {
    if (!window.history || !history.replaceState) return;
    try { history.replaceState(null, "", id ? "#" + id : location.pathname + location.search); } catch (e) { /* ignore */ }
  }

  /* ---------- events ---------- */
  host.addEventListener("click", function (e) {
    var reset = e.target.closest && e.target.closest("[data-reset]");
    if (reset) { state.q = ""; state.cat = "all"; input.value = ""; render(); return; }

    var btn = e.target.closest && e.target.closest(".fq-q");
    if (!btn) return;
    var item = btn.closest(".fq-item");
    var willOpen = !item.classList.contains("open");
    host.querySelectorAll(".fq-item.open").forEach(function (o) { setOpen(o, false); });
    setOpen(item, willOpen);
    setHash(willOpen ? item.id : "");
  });

  chipsEl.addEventListener("click", function (e) {
    var c = e.target.closest && e.target.closest(".fq-chip");
    if (!c) return;
    state.cat = c.getAttribute("data-cat");
    render();
  });

  input.addEventListener("input", function () { state.q = input.value; render(); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && input.value) { state.q = ""; input.value = ""; render(); }
  });
  clearBtn.addEventListener("click", function () { state.q = ""; input.value = ""; render(); input.focus(); });

  /* /faq#some-id : show everything, open that question, scroll to it */
  function openFromHash() {
    var id = decodeURIComponent((location.hash || "").slice(1));
    if (!id) return false;
    var known = data.items.some(function (i) { return i.id === id; });
    if (!known) return false;
    state.q = ""; state.cat = "all"; input.value = "";
    host.querySelectorAll(".fq-item.open").forEach(function (o) { o.classList.remove("open"); });
    render();
    var el = document.getElementById(id);
    if (!el) return false;
    setOpen(el, true);
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(function () {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      el.classList.add("flash");
      setTimeout(function () { el.classList.remove("flash"); }, 1700);
    }, 60);
    return true;
  }
  window.addEventListener("hashchange", openFromHash);

  window.onLang = render;

  /* ---------- start ---------- */
  try {
    var qs = new URLSearchParams(location.search);
    var c = qs.get("cat");
    if (c && data.cats.some(function (x) { return x.id === c; })) state.cat = c;
    var q = qs.get("q");
    if (q) { state.q = q.slice(0, 80); input.value = state.q; }
  } catch (e) { /* old browser: ignore */ }

  render();
  openFromHash();
})();
