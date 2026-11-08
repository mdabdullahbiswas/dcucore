/* faq.js - renders the FAQ page from faq-data.js (DCU_FAQ).
 * Language comes from <html lang>; dcu-lang.js calls window.onLang on every switch. */
(function () {
  "use strict";

  var data = window.DCU_FAQ;
  var host = document.getElementById("fqBody");
  if (!data || !host) return;

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
    support: '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>'
  };
  var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function lang() {
    return document.documentElement.getAttribute("lang") === "en" ? "en" : "bn";
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function para(text) {
    return String(text).split("\n").map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  }
  /* Bengali digits for the counter when the page is in Bangla */
  function num(n, l) {
    if (l !== "bn") return String(n);
    return String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯".charAt(d); });
  }

  function itemHTML(it, l) {
    var link = it.link
      ? '<a class="fq-go" href="' + esc(it.link.href) + '">' + esc(it.link[l]) + ARROW + "</a>"
      : "";
    return (
      '<article class="fq-item" id="' + esc(it.id) + '">' +
        '<h3><button type="button" class="fq-q" aria-expanded="false" aria-controls="a-' + esc(it.id) + '">' +
          "<span>" + esc(it.q[l]) + "</span>" +
          '<span class="fq-chev">' + CHEV + "</span>" +
        "</button></h3>" +
        '<div class="fq-a" id="a-' + esc(it.id) + '" role="region">' +
          '<div class="fq-a-in"><div class="fq-a-txt">' + para(it.a[l]) + link + "</div></div>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    var l = lang();
    /* remember which question is open so a language switch keeps it open */
    var openEl = host.querySelector(".fq-item.open");
    var openId = openEl ? openEl.id : null;

    host.innerHTML = data.cats.map(function (c) {
      var list = data.items.filter(function (i) { return i.cat === c.id; });
      if (!list.length) return "";
      return (
        '<section class="fq-cat" id="cat-' + esc(c.id) + '" aria-labelledby="h-' + esc(c.id) + '">' +
          '<div class="fq-cat-head">' +
            '<span class="fq-ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[c.id] || "") + "</svg></span>" +
            '<h2 id="h-' + esc(c.id) + '">' + esc(c[l]) + "</h2>" +
            '<span class="fq-count">' + num(list.length, l) + "</span>" +
          "</div>" +
          '<div class="fq-list">' + list.map(function (i) { return itemHTML(i, l); }).join("") + "</div>" +
        "</section>"
      );
    }).join("");

    if (openId) setOpen(document.getElementById(openId), true);
  }

  function setOpen(item, open) {
    if (!item) return;
    item.classList.toggle("open", open);
    var b = item.querySelector(".fq-q");
    if (b) b.setAttribute("aria-expanded", String(open));
  }

  /* one question open at a time */
  host.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".fq-q");
    if (!btn) return;
    var item = btn.closest(".fq-item");
    var willOpen = !item.classList.contains("open");
    host.querySelectorAll(".fq-item.open").forEach(function (o) { setOpen(o, false); });
    setOpen(item, willOpen);
  });

  window.onLang = render;
  render();
})();
