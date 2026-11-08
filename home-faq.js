/* home-faq.js - the short FAQ list on the home page. Reads DCU_FAQ.top() from faq-data.js.
 * Each answer ends with a link into /faq#id so the full version is one tap away. */
(function () {
  "use strict";
  var data = window.DCU_FAQ;
  var host = document.getElementById("hfList");
  if (!data || !host) return;

  var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var LANG_KEY = { bn: "bn", en: "en" };

  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "bn"; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function num(n, l) {
    return l === "bn" ? String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯".charAt(d); }) : String(n);
  }

  function render() {
    var l = LANG_KEY[lang()];
    var open = host.querySelector(".hf-item.open");
    var openId = open ? open.getAttribute("data-id") : null;

    host.innerHTML = data.top().map(function (it) {
      var paras = it.a[l].split("\n").map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
      return (
        '<article class="hf-item" data-id="' + esc(it.id) + '">' +
          '<h3><button type="button" class="hf-q" aria-expanded="false" aria-controls="hf-' + esc(it.id) + '">' +
            "<span>" + esc(it.q[l]) + "</span><span class=\"hf-chev\">" + CHEV + "</span></button></h3>" +
          '<div class="hf-a" id="hf-' + esc(it.id) + '" role="region"><div class="hf-a-in"><div class="hf-a-txt">' + paras + "</div></div></div>" +
        "</article>"
      );
    }).join("");

    var total = document.getElementById("hfTotal");
    if (total) total.textContent = num(data.items.length, l);
    if (openId) {
      var again = host.querySelector('.hf-item[data-id="' + openId + '"]');
      if (again) setOpen(again, true);
    }
  }

  function setOpen(item, open) {
    item.classList.toggle("open", open);
    item.querySelector(".hf-q").setAttribute("aria-expanded", String(open));
  }

  host.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".hf-q");
    if (!btn) return;
    var item = btn.closest(".hf-item");
    var willOpen = !item.classList.contains("open");
    host.querySelectorAll(".hf-item.open").forEach(function (o) { setOpen(o, false); });
    setOpen(item, willOpen);
  });

  /* follow language switches without touching the page's own handlers */
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  render();
})();
