/* faq-widget.js - the small FAQ box at the bottom of a feature page.
 *
 * Usage on a page (before the shared footer <div id="ftr">):
 *   <section id="faqBox" data-faq-page="cover"></section>
 *   <link rel="stylesheet" href="faq-widget.css">
 *   <script src="faq-data.js"></script>
 *   <script src="faq-widget.js"></script>
 *
 * It reads DCU_FAQ.forPage(page) from faq-data.js, so no question text lives in the page itself.
 * Shows 4 questions (this page's own topic first) and a "show more" button for the rest.
 * Follows the Bangla / English switch, and a link like page#question-id opens that question. */
(function () {
  "use strict";
  var data = window.DCU_FAQ;
  var host = document.getElementById("faqBox");
  if (!data || !host) return;

  var page = host.getAttribute("data-faq-page") || (document.body && document.body.getAttribute("data-page")) || "";
  var LIMIT = 4;
  var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* this page's own topic first, the shared ones (privacy, login...) after it; file order inside each group */
  var own = [], shared = [];
  data.forPage(page).forEach(function (it) { (it.cat === page ? own : shared).push(it); });
  var items = own.concat(shared);
  if (!items.length) { host.hidden = true; return; }

  var cat = null;
  data.cats.forEach(function (c) { if (c.id === page) cat = c; });

  var T = {
    eyebrow: { bn: "প্রশ্নোত্তর", en: "FAQ" },
    title:   { bn: "এই পেজ নিয়ে সাধারণ প্রশ্ন", en: "Common questions about this page" },
    more:    { bn: "আরও {n}টি প্রশ্ন দেখুন", en: "Show {n} more questions" },
    less:    { bn: "কম দেখান", en: "Show fewer" },
    all:     { bn: "সব প্রশ্ন দেখুন", en: "See all questions" },
    ask:     { bn: "উত্তর পাননি?", en: "Didn't find an answer?" },
    fb:      { bn: "ফিডব্যাক দিন", en: "Give feedback" }
  };

  var openId = null;
  var expanded = false;

  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "bn"; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function num(n, l) {
    return l === "bn" ? String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯".charAt(d); }) : String(n);
  }

  /* a button that points to the page we are already on is just noise, so it is left out */
  function isHere(href) {
    var clean = function (p) { return String(p).split("#")[0].split("?")[0].replace(/\.html$/, "").replace(/\/+$/, ""); };
    if (String(href).indexOf("#") > -1) return false;   /* page#tab can still switch something here */
    return clean(href) === clean(location.pathname);
  }

  function itemHTML(it, idx, l) {
    var paras = it.a[l].split("\n").map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    var link = it.link && !isHere(it.link.href)
      ? '<a class="fw-go" href="' + esc(it.link.href) + '"><span>' + esc(it.link[l]) + "</span>" + ARROW + "</a>"
      : "";
    var hide = idx >= LIMIT && !expanded ? " hidden" : "";
    var isOpen = it.id === openId;
    return (
      '<article class="fw-item' + (isOpen ? " open" : "") + '" data-id="' + esc(it.id) + '"' + hide + ">" +
        '<h3><button type="button" class="fw-q" id="fwq-' + esc(it.id) + '" aria-expanded="' + isOpen +
          '" aria-controls="fwa-' + esc(it.id) + '"><span>' + esc(it.q[l]) + '</span><span class="fw-chev">' + CHEV + "</span></button></h3>" +
        '<div class="fw-a" id="fwa-' + esc(it.id) + '" role="region" aria-labelledby="fwq-' + esc(it.id) + '">' +
          '<div class="fw-a-in"><div class="fw-a-txt">' + paras + link + "</div></div></div>" +
      "</article>"
    );
  }

  function render() {
    var l = lang();
    var hiddenCount = Math.max(0, items.length - LIMIT);
    var eyebrow = cat ? cat[l] : T.eyebrow[l];

    host.className = "fw";
    host.setAttribute("aria-labelledby", "fwTitle");
    host.innerHTML =
      '<div class="fw-head"><span class="fw-eyebrow">' + esc(eyebrow) + " · " + esc(T.eyebrow[l]) + "</span>" +
        '<h2 id="fwTitle">' + esc(T.title[l]) + "</h2></div>" +
      '<div class="fw-list">' + items.map(function (it, i) { return itemHTML(it, i, l); }).join("") + "</div>" +
      (hiddenCount
        ? '<button type="button" class="fw-more" aria-expanded="' + expanded + '" aria-controls="fwList">' +
            esc(expanded ? T.less[l] : T.more[l].replace("{n}", num(hiddenCount, l))) + "</button>"
        : "") +
      '<div class="fw-foot"><a class="fw-all" href="/faq"><span>' + esc(T.all[l]) + "</span>" + ARROW + "</a>" +
        '<span class="fw-ask">' + esc(T.ask[l]) + ' <a href="/feedback">' + esc(T.fb[l]) + "</a></span></div>";

    var list = host.querySelector(".fw-list");
    if (list) list.id = "fwList";
  }

  function setOpen(item, open) {
    item.classList.toggle("open", open);
    item.querySelector(".fw-q").setAttribute("aria-expanded", String(open));
    openId = open ? item.getAttribute("data-id") : (openId === item.getAttribute("data-id") ? null : openId);
  }

  host.addEventListener("click", function (e) {
    var t = e.target;
    if (!t.closest) return;

    var q = t.closest(".fw-q");
    if (q) {
      var item = q.closest(".fw-item");
      var willOpen = !item.classList.contains("open");
      host.querySelectorAll(".fw-item.open").forEach(function (o) { setOpen(o, false); });
      setOpen(item, willOpen);
      return;
    }
    if (t.closest(".fw-more")) {
      expanded = !expanded;
      render();
      var btn = host.querySelector(".fw-more");
      if (btn) btn.focus();
    }
  });

  /* page#question-id opens that question (shared links) */
  function openFromHash() {
    var id = "";
    try { id = decodeURIComponent((location.hash || "").slice(1)); } catch (e) { return; }
    if (!id) return;
    var idx = -1;
    items.forEach(function (it, i) { if (it.id === id) idx = i; });
    if (idx < 0) return;
    if (idx >= LIMIT) expanded = true;
    openId = id;
    render();
    var el = host.querySelector('.fw-item[data-id="' + id.replace(/"/g, "") + '"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "center" });
  }

  /* follow language switches without touching the page's own handlers */
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  window.addEventListener("hashchange", openFromHash);

  render();
  openFromHash();
})();
