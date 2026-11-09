/* home-time.js
 * Prayer-time card for the home page.  Needs dcu-time.js (loaded before it).
 * Fills <section id="hpTime">; if that placeholder is missing it creates one after the marquee band.
 *
 * Times are Dhaka times whatever the visitor's own time zone is.
 */
(function () {
  "use strict";
  var DT = window.DCUTime;
  var host = document.getElementById("hpTime");
  if (!DT) { if (host) host.hidden = true; return; }

  if (!host) {
    host = document.createElement("section");
    host.id = "hpTime";
    host.className = "ht";
    var band = document.querySelector(".hp-band");
    var main = document.querySelector("main");
    if (band && band.parentNode) band.parentNode.insertBefore(host, band.nextSibling);
    else if (main && main.parentNode) main.parentNode.insertBefore(host, main);
    else return;
  }

  var root = document.documentElement;
  function lang() { return root.getAttribute("data-lang") === "en" ? "en" : "bn"; }
  function T(bn, en) { return lang() === "en" ? en : bn; }
  function dg(n) { return DT.digits(n, lang()); }

  /* ---------- "now" in Dhaka ---------- */
  var dhakaFmt = null;
  try {
    dhakaFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka", hourCycle: "h23",
      year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"
    });
  } catch (e) { dhakaFmt = null; }

  function dhakaNow() {
    var n = new Date(), p = {};
    if (dhakaFmt) {
      dhakaFmt.formatToParts(n).forEach(function (o) { if (o.type !== "literal") p[o.type] = +o.value; });
      return { y: p.year, m: p.month, d: p.day, h: (p.hour % 24) + p.minute / 60 + p.second / 3600 };
    }
    return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate(), h: n.getHours() + n.getMinutes() / 60 + n.getSeconds() / 3600 };
  }
  function dateOf(now, plusDays) { return new Date(now.y, now.m - 1, now.d + (plusDays || 0)); }

  /* ---------- data ---------- */
  var KEYS = ["fj", "dh", "as", "mg", "is"];
  var ICONS = {
    fj: '<path d="M3 19h18M7 19a5 5 0 0110 0M12 10V5M9.5 7L12 4.5 14.5 7"/>',
    dh: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"/>',
    as: '<circle cx="9" cy="9" r="3"/><path d="M9 2.5V4M2.5 9H4M4.4 4.4l1 1M13.6 4.4l-1 1M8 20a4 4 0 010-8 5 5 0 019.5 1.5A3.2 3.2 0 0117 20z"/>',
    mg: '<path d="M3 19h18M7 19a5 5 0 0110 0M12 5v5M9.5 8l2.5 2.5L14.5 8"/>',
    is: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/><path d="M17 3.5v3M15.5 5h3"/>'
  };
  var MOSQUE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5c1.2 1 1.6 2 1.6 3.2a1.6 1.6 0 01-3.2 0c0-1.2.4-2.2 1.6-3.2zM6 21V12a6 6 0 0112 0v9M3 21h18M9 21v-4a3 3 0 016 0v4"/></svg>';
  var ARROW =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* "বিকাল ৪:১২" -> {t:"৪:১২", p:"বিকাল"}   |   "4:12 PM" -> {t:"4:12", p:"PM"} */
  function clock(h) {
    var s = DT.fmtTime(h, lang()), a = s.split(" ");
    return lang() === "en" ? { t: a[0], p: a[1] || "" } : { t: a[1] || a[0], p: a[1] ? a[0] : "" };
  }

  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function hms(sec) {
    sec = Math.max(0, Math.floor(sec));
    return dg(pad2(Math.floor(sec / 3600))) + ":" + dg(pad2(Math.floor(sec / 60) % 60)) + ":" + dg(pad2(sec % 60));
  }

  /* ---------- state ---------- */
  var st = { dayKey: "", today: null, tomorrow: null, yesterday: null, rz: false, next: "", prevH: 0, nextH: 0, jumu: false };

  function compute(now) {
    var key = now.y + "-" + now.m + "-" + now.d;
    if (st.dayKey !== key) {
      st.dayKey = key;
      st.today = DT.prayer(dateOf(now, 0));
      st.tomorrow = DT.prayer(dateOf(now, 1));
      st.yesterday = DT.prayer(dateOf(now, -1));
      st.rz = !!DT.holiday(dateOf(now, 0)).rz;
      st.jumu = dateOf(now, 0).getDay() === 5;
    }
    var next = "", prevH = st.yesterday.is - 24, nextH = 0;
    for (var i = 0; i < KEYS.length; i++) {
      var k = KEYS[i];
      if (st.today[k] > now.h) { next = k; nextH = st.today[k]; break; }
      prevH = st.today[k];
    }
    if (!next) { next = "fj"; nextH = st.tomorrow.fj + 24; }
    return { next: next, prevH: prevH, nextH: nextH };
  }

  function pname(k) {
    if (k === "dh" && st.jumu) return T("জুমা", "Jumu‘ah");
    return DT.PN[k][lang() === "en" ? 1 : 0];
  }

  /* ---------- render ---------- */
  var els = {};

  function render(now) {
    var c = compute(now);
    st.next = c.next; st.prevH = c.prevH; st.nextH = c.nextH;
    var k = c.next, nt = clock(c.nextH % 24);
    var cdLabel = st.rz && k === "mg" ? T("ইফতারে বাকি", "Until iftar")
      : st.rz && k === "fj" ? T("সেহরি শেষ হতে বাকি", "Until sehri ends")
      : T(pname(k) + " শুরু হতে বাকি", "Until " + pname(k));

    var lis = KEYS.map(function (q) {
      var cl = clock(st.today[q]);
      var cls = q === k && c.nextH < 24 ? " is-next" : (st.today[q] <= now.h ? " is-past" : "");
      return '<li class="ht-p' + cls + '" data-k="' + q + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[q] + "</svg>" +
        '<span class="ht-pn">' + pname(q) + '</span><span class="ht-pt">' + cl.t + '</span><span class="ht-pp">' + cl.p + "</span></li>";
    }).join("");

    var rz = st.rz
      ? '<span class="ht-rz"><span>' + T("সেহরি শেষ", "Sehri ends") + " <b>" + clock(st.today.fj).t + "</b></span><span>" + T("ইফতার", "Iftar") + " <b>" + clock(st.today.mg).t + "</b></span></span>"
      : "";
    var sr = clock(st.today.sr);

    host.innerHTML =
      '<div class="ht-card">' +
      '<div class="ht-head">' +
      '<div><span class="ht-kick">' + MOSQUE + T("পরবর্তী নামাজ", "Next prayer") + "</span>" +
      '<div class="ht-nm"><b>' + pname(k) + '</b><span class="ht-nt"><i>' + nt.t + "</i><small>" + nt.p + "</small></span></div></div>" +
      '<div class="ht-cd" role="timer"><small>' + cdLabel + '</small><b class="ht-t">' + hms((c.nextH - now.h) * 3600) + "</b></div>" +
      "</div>" +
      '<div class="ht-bar" aria-hidden="true"><i></i></div>' +
      '<ul class="ht-list">' + lis + "</ul>" +
      '<div class="ht-foot"><span>' + T("সূর্যোদয়", "Sunrise") + " <b>" + sr.p + " " + sr.t + "</b></span>" + rz +
      '<span class="ht-sp"></span><span>' + T("ঢাকার সময় • আনুমানিক", "Dhaka time • approximate") + "</span>" +
      '<a class="ht-link" href="/dcu-calendar">' + T("ক্যালেন্ডার দেখুন", "Open calendar") + ARROW + "</a></div>" +
      "</div>";
    host.setAttribute("aria-label", T("নামাজের সময়সূচি", "Prayer times"));
    host.hidden = false;
    els.t = host.querySelector(".ht-t");
    els.bar = host.querySelector(".ht-bar i");
    tick(now);
  }

  function tick(now) {
    if (!els.t) return;
    els.t.textContent = hms((st.nextH - now.h) * 3600);
    var span = st.nextH - st.prevH, pct = span > 0 ? (now.h - st.prevH) / span : 0;
    els.bar.style.width = Math.min(100, Math.max(0, pct * 100)).toFixed(2) + "%";
  }

  function loop() {
    var now = dhakaNow();
    var dayKey = now.y + "-" + now.m + "-" + now.d;
    /* rebuild when the day changed or the awaited prayer time has arrived; otherwise only tick the clock */
    if (!els.t || dayKey !== st.dayKey || (st.nextH < 24 && now.h >= st.nextH)) render(now);
    else tick(now);
  }

  render(dhakaNow());
  setInterval(loop, 1000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) loop(); });
  new MutationObserver(function () { render(dhakaNow()); }).observe(root, { attributes: true, attributeFilter: ["data-lang"] });
})();
