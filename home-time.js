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

  /* ---------- districts (approximate centre points; prayer times shift a few minutes with longitude) ---------- */
  var DIST = [
    ["ঢাকা","Dhaka",23.81,90.41],["গাজীপুর","Gazipur",24.00,90.42],["নারায়ণগঞ্জ","Narayanganj",23.63,90.50],["নরসিংদী","Narsingdi",23.92,90.72],["মানিকগঞ্জ","Manikganj",23.86,90.00],["মুন্সিগঞ্জ","Munshiganj",23.55,90.53],["টাঙ্গাইল","Tangail",24.25,89.92],["কিশোরগঞ্জ","Kishoreganj",24.43,90.78],["ফরিদপুর","Faridpur",23.60,89.84],["রাজবাড়ী","Rajbari",23.76,89.64],["গোপালগঞ্জ","Gopalganj",23.01,89.83],["মাদারীপুর","Madaripur",23.17,90.20],["শরীয়তপুর","Shariatpur",23.22,90.35],
    ["চট্টগ্রাম","Chattogram",22.36,91.78],["কক্সবাজার","Cox’s Bazar",21.45,91.98],["কুমিল্লা","Cumilla",23.46,91.18],["ব্রাহ্মণবাড়িয়া","Brahmanbaria",23.96,91.11],["চাঁদপুর","Chandpur",23.23,90.65],["লক্ষ্মীপুর","Lakshmipur",22.94,90.84],["নোয়াখালী","Noakhali",22.82,91.10],["ফেনী","Feni",23.02,91.40],["খাগড়াছড়ি","Khagrachhari",23.12,91.98],["রাঙামাটি","Rangamati",22.65,92.17],["বান্দরবান","Bandarban",22.19,92.22],
    ["সিলেট","Sylhet",24.90,91.87],["মৌলভীবাজার","Moulvibazar",24.48,91.77],["হবিগঞ্জ","Habiganj",24.38,91.42],["সুনামগঞ্জ","Sunamganj",25.07,91.40],
    ["রাজশাহী","Rajshahi",24.37,88.60],["নাটোর","Natore",24.42,89.00],["নওগাঁ","Naogaon",24.80,88.94],["চাঁপাইনবাবগঞ্জ","Chapainawabganj",24.60,88.28],["পাবনা","Pabna",24.00,89.25],["সিরাজগঞ্জ","Sirajganj",24.45,89.70],["বগুড়া","Bogura",24.85,89.37],["জয়পুরহাট","Joypurhat",25.10,89.02],
    ["খুলনা","Khulna",22.82,89.55],["বাগেরহাট","Bagerhat",22.65,89.79],["সাতক্ষীরা","Satkhira",22.71,89.07],["যশোর","Jashore",23.17,89.21],["ঝিনাইদহ","Jhenaidah",23.54,89.17],["মাগুরা","Magura",23.49,89.42],["নড়াইল","Narail",23.17,89.50],["কুষ্টিয়া","Kushtia",23.90,89.12],["চুয়াডাঙ্গা","Chuadanga",23.64,88.85],["মেহেরপুর","Meherpur",23.76,88.63],
    ["বরিশাল","Barishal",22.70,90.37],["ভোলা","Bhola",22.69,90.65],["পটুয়াখালী","Patuakhali",22.36,90.33],["পিরোজপুর","Pirojpur",22.58,89.97],["ঝালকাঠি","Jhalokati",22.64,90.20],["বরগুনা","Barguna",22.15,90.13],
    ["রংপুর","Rangpur",25.75,89.25],["দিনাজপুর","Dinajpur",25.63,88.64],["ঠাকুরগাঁও","Thakurgaon",26.03,88.47],["পঞ্চগড়","Panchagarh",26.34,88.55],["নীলফামারী","Nilphamari",25.93,88.86],["লালমনিরহাট","Lalmonirhat",25.99,89.45],["কুড়িগ্রাম","Kurigram",25.80,89.64],["গাইবান্ধা","Gaibandha",25.33,89.53],
    ["ময়মনসিংহ","Mymensingh",24.75,90.41],["জামালপুর","Jamalpur",24.92,89.94],["শেরপুর","Sherpur",25.02,90.02],["নেত্রকোণা","Netrokona",24.87,90.73]
  ];
  function store(k, v) { try { if (v == null) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  var distIdx = parseInt(store("dcu-district"), 10);
  if (!(distIdx >= 0 && distIdx < DIST.length)) distIdx = 0;
  function applyDistrict() { DT.PL.lat = DIST[distIdx][2]; DT.PL.lon = DIST[distIdx][3]; }
  applyDistrict();

  /* ---------- azan notification (works while the page is open) ---------- */
  var azanOn = store("dcu-azan") === "1" && "Notification" in window && Notification.permission === "granted";
  function notify(k) {
    if (!azanOn) return;
    var i = lang() === "en" ? 1 : 0, nm = (k === "dh" && st.jumu) ? T("জুমা", "Jumu‘ah") : DT.PN[k][i];
    var title = T(nm + (/া$/.test(nm) ? "র" : "ের") + " সময় হয়েছে", "It is time for " + nm);
    var body = DIST[distIdx][i] + " • " + clock(st.today[k]).t + " " + clock(st.today[k]).p;
    var o = { body: body, icon: "icon-192.png", tag: "dcu-azan" };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
        navigator.serviceWorker.getRegistration().then(function (r) { if (r && r.showNotification) r.showNotification(title, o); else new Notification(title, o); }, function () { new Notification(title, o); });
      } else new Notification(title, o);
    } catch (e) { /* not allowed here */ }
  }
  function toggleAzan() {
    if (azanOn) { azanOn = false; store("dcu-azan", "0"); rerender(); return; }
    if (!("Notification" in window)) { alert(T("এই ব্রাউজারে নোটিফিকেশন চালু করা যায় না।", "This browser does not support notifications.")); return; }
    Notification.requestPermission().then(function (p) {
      azanOn = p === "granted"; store("dcu-azan", azanOn ? "1" : "0");
      if (p === "denied") alert(T("ব্রাউজারের সেটিংসে নোটিফিকেশনের অনুমতি দিন।", "Allow notifications in your browser settings."));
      rerender();
    });
  }
  function rerender() { render(dhakaNow()); }

  /* ---------- state ---------- */
  var st = { dayKey: "", today: null, tomorrow: null, yesterday: null, rz: false, next: "", prevH: 0, nextH: 0, ex: null, exY: null, cur: "", curEnd: 0, cdH: 0, barA: 0, barB: 1, jumu: false };

  function compute(now) {
    var key = now.y + "-" + now.m + "-" + now.d;
    if (st.dayKey !== key) {
      st.dayKey = key;
      st.today = DT.prayer(dateOf(now, 0));
      st.tomorrow = DT.prayer(dateOf(now, 1));
      st.yesterday = DT.prayer(dateOf(now, -1));
      st.ex = DT.extras(dateOf(now, 0));
      st.exY = DT.extras(dateOf(now, -1));
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

    /* the prayer that is running now and when it ends:
       Fajr -> sunrise, Dhuhr -> Asr, Asr -> Maghrib, Maghrib -> Isha, Isha -> next Fajr.
       Between sunrise and Dhuhr no obligatory prayer is running (cur = ""). */
    var t = st.today, cur = "", curStart = 0, curEnd = 0;
    if (now.h < t.fj)      { cur = "is"; curStart = st.yesterday.is - 24; curEnd = t.fj; }
    else if (now.h < t.sr) { cur = "fj"; curStart = t.fj; curEnd = t.sr; }
    else if (now.h < t.dh) { cur = ""; }
    else if (now.h < t.as) { cur = "dh"; curStart = t.dh; curEnd = t.as; }
    else if (now.h < t.mg) { cur = "as"; curStart = t.as; curEnd = t.mg; }
    else if (now.h < t.is) { cur = "mg"; curStart = t.mg; curEnd = t.is; }
    else                   { cur = "is"; curStart = t.is; curEnd = st.tomorrow.fj + 24; }
    return { next: next, prevH: prevH, nextH: nextH, cur: cur, curStart: curStart, curEnd: curEnd };
  }

  function pname(k) {
    if (k === "dh" && st.jumu) return T("জুমা", "Jumu‘ah");
    return DT.PN[k][lang() === "en" ? 1 : 0];
  }

  /* ---------- date panel: English / Bangla / Hijri date + holiday badge ---------- */
  function dateHTML(now) {
    var d = dateOf(now, 0), i = lang() === "en" ? 1 : 0;
    var info = DT.holiday(d);
    var badge = "";
    if (info.r && info.t === "h") badge = '<span class="ht-badge is-hol">' + info.r[i] + "</span>";
    else if (info.r && info.t === "w") badge = '<span class="ht-badge is-wk">' + T("সাপ্তাহিক ছুটি", "Weekend") + "</span>";
    else if (info.rz) badge = '<span class="ht-badge is-rz">' + T("রমজান মাস", "Ramadan") + "</span>";
    return (
      '<aside class="ht-date" aria-label="' + T("আজকের তারিখ", "Today’s date") + '">' +
      '<div class="ht-dn"><b>' + dg(d.getDate()) + "</b></div>" +
      '<div class="ht-dm"><span class="ht-wd">' + DT.WD[d.getDay()][i] + "</span>" +
      '<span class="ht-my">' + DT.GM[d.getMonth()][i] + " " + dg(d.getFullYear()) + "</span></div>" +
      '<div class="ht-alt"><span><i>' + T("বাংলা", "Bangla") + "</i>" + dg(info.b.d) + " " + DT.BM[info.b.m][i] + " " + dg(info.b.y) + " " + T("বঙ্গাব্দ", "BS") + "</span>" +
      "<span><i>" + T("হিজরি", "Hijri") + "</i>" + dg(info.h.d) + " " + DT.HM[info.h.m][i] + " " + dg(info.h.y) + " " + T("হিজরি", "AH") + "</span></div>" +
      badge + "</aside>"
    );
  }

  host.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || t.tagName !== "SELECT" || !t.closest(".ht-ds")) return;
    distIdx = +t.value; store("dcu-district", String(distIdx));
    applyDistrict(); st.dayKey = ""; st.nh = null; rerender();
    var again = host.querySelector(".ht-ds select"); if (again) again.focus();
  });
  host.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-azan]")) { toggleAzan(); return; }
  });

  function distSel() {
    var i = lang() === "en" ? 1 : 0;
    return '<label class="ht-ds"><span class="ht-sr">' + T("জেলা", "District") + '</span><select aria-label="' + T("জেলা বাছাই", "Choose district") + '">' +
      DIST.map(function (d, n) { return '<option value="' + n + '"' + (n === distIdx ? " selected" : "") + ">" + d[i] + "</option>"; }).join("") + "</select></label>";
  }
  function azanBtn() {
    return '<button type="button" class="ht-az' + (azanOn ? " is-on" : "") + '" data-azan aria-pressed="' + azanOn + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>' +
      T(azanOn ? "আজান চালু" : "আজান নোটিফিকেশন", azanOn ? "Azan on" : "Azan alert") + "</button>";
  }

  /* ---------- "more times": sehri, iftar, ishraq, chasht, zawal, tahajjud ---------- */
  function moreChips(now) {
    var E = st.ex, T0 = st.today;
    /* before Fajr the night we are in started yesterday evening */
    var tj = now.h < T0.fj ? { s: st.exY.tahajjud.s - 24, e: st.exY.tahajjud.e - 24 } : { s: E.tahajjud.s, e: E.tahajjud.e };
    var items = [
      { k: "sehri", n: T("সেহরি শেষ", "Sehri ends"), a: E.sehri.e, rz: 1 },
      { k: "iftar", n: T("ইফতার", "Iftar"), a: E.iftar.s, rz: 1 },
      { k: "ishraq", n: T("ইশরাক", "Ishraq"), a: E.ishraq.s, b: E.ishraq.e },
      { k: "chasht", n: T("চাশত", "Chasht"), a: E.chasht.s, b: E.chasht.e },
      { k: "zawal", n: T("যাওয়াল", "Zawal"), a: E.zawal.s, b: E.zawal.e },
      { k: "tahajjud", n: T("তাহাজ্জুদ", "Tahajjud"), a: tj.s, b: tj.e }
    ];
    return '<div class="ht-more" role="list" aria-label="' + T("আরও সময়", "More times") + '">' + items.map(function (x) {
      var v;
      if (x.b == null) { var c = clock(x.a); v = c.t + " <small>" + c.p + "</small>"; }
      else { var c1 = clock(x.a), c2 = clock(x.b); v = c1.t + "–" + c2.t + " <small>" + c2.p + "</small>"; }
      var on = x.b != null && now.h >= x.a && now.h < x.b;
      var cls = "ht-m" + (on ? " is-on" : "") + (x.rz && st.rz ? " is-rz" : "");
      return '<div class="' + cls + '" role="listitem" data-s="' + (x.b != null ? x.a : "") + '" data-e="' + (x.b != null ? x.b : "") + '"><span>' + x.n + "</span><b>" + v + "</b></div>";
    }).join("") + "</div>";
  }

  /* ---------- render ---------- */
  var els = {};

  function render(now) {
    var c = compute(now);
    st.next = c.next; st.prevH = c.prevH; st.nextH = c.nextH; st.cur = c.cur;
    var k = c.next, cur = c.cur;
    /* headline = the prayer running now; in the gap after sunrise it falls back to the next prayer */
    var hk = cur || k, hs = cur ? c.curStart : c.nextH, hend = cur ? c.curEnd : c.nextH;
    st.cdH = hend; st.barA = cur ? c.curStart : c.prevH; st.barB = hend;
    var nt = clock(hs), nx = clock(c.nextH % 24);
    var cdLabel = cur
      ? (st.rz && cur === "is" ? T("ইশা ও সেহরি শেষ হতে বাকি", "Until Isha & sehri end") : T(pname(cur) + " শেষ হতে বাকি", "Until " + pname(cur) + " ends"))
      : (st.rz && k === "mg" ? T("ইফতারে বাকি", "Until iftar") : T(pname(k) + " শুরু হতে বাকি", "Until " + pname(k)));
    var kick = cur ? T("চলমান নামাজ", "Current prayer") : T("পরবর্তী নামাজ", "Next prayer");
    var nxLine = cur
      ? '<div class="ht-nx">' + T("পরবর্তী", "Next") + ": <b>" + pname(k) + (c.nextH >= 24 ? " " + T("(কাল)", "(tmrw)") : "") + "</b> " + nx.t + " " + nx.p + "</div>"
      : '<div class="ht-nx">' + T("এখন ফরজ নামাজের ওয়াক্ত নেই", "No obligatory prayer time right now") + "</div>";

    var lis = KEYS.map(function (q) {
      var yest = q === "is" && cur === "is" && now.h < st.today.fj;   /* after midnight, before Fajr: Isha is still last night's */
      var cl = clock(yest ? st.yesterday.is : st.today[q]);
      var cls = q === hk ? " is-next" : (st.today[q] <= now.h && !yest ? " is-past" : "");
      return '<li class="ht-p' + cls + '" data-k="' + q + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[q] + "</svg>" +
        '<span class="ht-pn">' + pname(q) + (yest ? " <small>" + T("(গতকাল)", "(yest.)") + "</small>" : "") + '</span><span class="ht-pt">' + cl.t + '</span><span class="ht-pp">' + cl.p + "</span></li>";
    }).join("");

    var rz = st.rz
      ? '<span class="ht-rz"><span>' + T("সেহরি শেষ", "Sehri ends") + " <b>" + clock(st.today.fj).t + "</b></span><span>" + T("ইফতার", "Iftar") + " <b>" + clock(st.today.mg).t + "</b></span></span>"
      : "";
    var sr = clock(st.today.sr), ss = clock(st.today.mg);

    host.innerHTML =
      '<div class="ht-card">' + dateHTML(now) +
      '<div class="ht-main">' +
      '<div class="ht-head">' +
      '<div><span class="ht-kick">' + MOSQUE + kick + "</span>" +
      '<div class="ht-nm"><b>' + pname(hk) + '</b><span class="ht-nt"><i>' + nt.t + "</i><small>" + nt.p + "</small></span></div>" + nxLine + "</div>" +
      '<div class="ht-cd" role="timer"><small>' + cdLabel + '</small><b class="ht-t">' + hms((hend - now.h) * 3600) + "</b></div>" +
      "</div>" +
      '<div class="ht-bar" aria-hidden="true"><i></i></div>' +
      '<ul class="ht-list">' + lis + "</ul>" + moreChips(now) +
      '<div class="ht-foot"><span>' + T("সূর্যোদয়", "Sunrise") + " <b>" + (lang() === "en" ? sr.t + " " + sr.p : sr.p + " " + sr.t) + "</b></span>" +
      "<span>" + T("সূর্যাস্ত", "Sunset") + " <b>" + (lang() === "en" ? ss.t + " " + ss.p : ss.p + " " + ss.t) + "</b></span>" +
      '<span class="ht-sp"></span>' + distSel() + azanBtn() +
      "<span>" + T("আনুমানিক", "Approx.") + "</span>" +
      '<a class="ht-link" href="/dcu-calendar">' + T("ক্যালেন্ডার দেখুন", "Open calendar") + ARROW + "</a></div>" +
      "</div></div>";
    host.setAttribute("aria-label", T("নামাজের সময়সূচি", "Prayer times"));
    host.hidden = false;
    els.t = host.querySelector(".ht-t");
    els.bar = host.querySelector(".ht-bar i");
    tick(now);
  }

  function tick(now) {
    if (!els.t) return;
    els.t.textContent = hms((st.cdH - now.h) * 3600);
    var span = st.barB - st.barA, pct = span > 0 ? (now.h - st.barA) / span : 0;
    var ms = host.querySelectorAll(".ht-m[data-s]");
    for (var i = 0; i < ms.length; i++) {
      var a = ms[i].getAttribute("data-s"), b = ms[i].getAttribute("data-e");
      if (a !== "") ms[i].classList.toggle("is-on", now.h >= +a && now.h < +b);
    }
    els.bar.style.width = Math.min(100, Math.max(0, pct * 100)).toFixed(2) + "%";
  }

  function loop() {
    var now = dhakaNow();
    var dayKey = now.y + "-" + now.m + "-" + now.d;
    /* rebuild when the day changed or the awaited prayer time has arrived; otherwise only tick the clock */
    var arrived = st.nextH < 24 && now.h >= st.nextH, fired = st.next;
    if (arrived && now.h - st.nextH < 0.03) notify(fired);   /* only within ~100 s of the time, not after a long sleep */
    var ended = st.cdH < 24 && now.h >= st.cdH;
    if (!els.t || dayKey !== st.dayKey || arrived || ended) render(now);
    else tick(now);
  }

  render(dhakaNow());
  setInterval(loop, 1000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) loop(); });
  new MutationObserver(function () { render(dhakaNow()); }).observe(root, { attributes: true, attributeFilter: ["data-lang"] });
})();
