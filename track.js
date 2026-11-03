/*!
 * DCUCore · হালকা ভিজিটর ট্র্যাকার
 * - কোনো লাইব্রেরি লাগে না (Firestore REST ব্যবহার করে)
 * - IP, নাম, ইমেইল বা ব্যক্তিগত তথ্য সংরক্ষণ করে না
 * - বট, এডমিন পেজ ও এডমিনের নিজের ভিজিট বাদ দেয়
 * ব্যবহার: প্রতিটি পাবলিক পেজে </body>-এর আগে  <script src="/track.js" defer></script>
 */
(function () {
  "use strict";
  if (window.__dcuTrack) return;
  window.__dcuTrack = 1;

  var PROJECT = "dcu-blood-bank";
  var API_KEY = "AIzaSyBgaBKzAAwzHI7ahGKqzbrX9MknWWIm9j0";
  var ENDPOINT = "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents/site_visits?key=" + API_KEY;

  try {
    var path = (location.pathname || "/").replace(/\/index\.html$/i, "/") || "/";

    /* বাদ দেওয়ার শর্ত */
    if (/admin/i.test(path)) return;
    if (/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname)) return;
    if (navigator.webdriver) return;
    var ua = navigator.userAgent || "";
    if (/bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram/i.test(ua)) return;
    try { if (localStorage.getItem("dcuNoTrack") === "1") return; } catch (e) {}

    /* একই পেজ রিলোড স্প্যাম ঠেকাতে ২০ সেকেন্ডের ঠান্ডা সময় */
    var now = Date.now();
    try {
      var last = JSON.parse(sessionStorage.getItem("dcuLast") || "null");
      if (last && last.p === path && now - last.t < 20000) return;
      sessionStorage.setItem("dcuLast", JSON.stringify({ p: path, t: now }));
    } catch (e) {}

    var uid = function () {
      try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
      return "v" + now.toString(36) + Math.random().toString(36).slice(2, 12);
    };

    /* ভিজিটর (ব্রাউজার) আইডি ও সেশন আইডি */
    var vid = "", isNew = false, sid = "";
    try {
      vid = localStorage.getItem("dcuVid") || "";
      if (!vid) { vid = uid(); isNew = true; localStorage.setItem("dcuVid", vid); }
    } catch (e) { vid = "anon-" + uid(); }
    try {
      sid = sessionStorage.getItem("dcuSid") || "";
      if (!sid) { sid = uid(); sessionStorage.setItem("dcuSid", sid); }
    } catch (e) { sid = vid; }

    /* ডিভাইস / ব্রাউজার / OS */
    var dev = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? "tablet"
      : /Mobi|iPhone|iPod|Android/i.test(ua) ? "mobile" : "desktop";
    var br = /FBAN|FBAV/i.test(ua) ? "Facebook App"
      : /Instagram/i.test(ua) ? "Instagram App"
      : /Messenger|FB_IAB/i.test(ua) ? "Messenger"
      : /EdgA?\/|Edg\//.test(ua) ? "Edge"
      : /OPR\/|Opera/.test(ua) ? "Opera"
      : /SamsungBrowser/i.test(ua) ? "Samsung Internet"
      : /Firefox|FxiOS/i.test(ua) ? "Firefox"
      : /Chrome|CriOS/i.test(ua) ? "Chrome"
      : /Safari/i.test(ua) ? "Safari" : "Other";
    var os = /Windows/i.test(ua) ? "Windows"
      : /Android/i.test(ua) ? "Android"
      : /iPhone|iPad|iPod/i.test(ua) ? "iOS"
      : /Mac OS X|Macintosh/i.test(ua) ? "macOS"
      : /CrOS/i.test(ua) ? "ChromeOS"
      : /Linux/i.test(ua) ? "Linux" : "Other";

    /* সূত্র (referrer / utm) */
    var ref = "";
    try {
      var q = new URLSearchParams(location.search), us = q.get("utm_source") || q.get("ref");
      if (us) ref = us.slice(0, 60);
      else if (document.referrer) {
        var h = new URL(document.referrer).hostname.replace(/^www\./, "");
        if (h && h !== location.hostname.replace(/^www\./, "")) ref = h.slice(0, 100);
      }
    } catch (e) {}

    var S = function (v, n) { return { stringValue: String(v == null ? "" : v).slice(0, n) }; };
    var I = function (v) { return { integerValue: String(Math.max(0, Math.round(+v || 0))) }; };
    var body = {
      fields: {
        vid: S(vid, 64), sid: S(sid, 64),
        path: S(path, 200), title: S(document.title, 150), ref: S(ref, 100),
        dev: S(dev, 10), br: S(br, 30), os: S(os, 20),
        sw: I(screen.width), sh: I(screen.height),
        lang: S((navigator.language || "").slice(0, 12), 12),
        tz: S((Intl.DateTimeFormat().resolvedOptions().timeZone || ""), 40),
        isNew: { booleanValue: isNew },
        ts: I(now)
      }
    };

    var send = function () {
      try {
        fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true, mode: "cors", credentials: "omit" }).catch(function () {});
      } catch (e) {}
    };
    /* পেজ লোডে বাধা না দিতে অবসর সময়ে পাঠানো */
    if ("requestIdleCallback" in window) requestIdleCallback(send, { timeout: 3000 }); else setTimeout(send, 800);
  } catch (e) { /* ট্র্যাকিং কখনো সাইট ভাঙবে না */ }
})();
