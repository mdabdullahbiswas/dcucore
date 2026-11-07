/* library-viewer.js — ফাইল ভিউয়ার, ডাউনলোড, প্রিন্ট ও শেয়ার (ধাপ ৭)
 *
 * library-browse.js কার্ডে ক্লিকে "lib:open" ইভেন্ট দেয়; এখানে সেটি ধরে preventDefault করা হয়
 * (তাই Drive-এ নতুন ট্যাবে খোলার ফলব্যাক আর চলে না) এবং পেজ না ছেড়ে মডালে প্রিভিউ দেখানো হয়।
 *
 * বাটন:
 *   ডাউনলোড — Drive-এর সরাসরি ডাউনলোড লিংক (Docs/Sheets/Slides হলে PDF এক্সপোর্ট)
 *   প্রিন্ট  — অন্য ডোমেইনের এমবেড ব্রাউজার সরাসরি প্রিন্ট করতে দেয় না, তাই ফাইল Drive ভিউয়ারে খোলে; সেখান থেকে প্রিন্ট
 *   শেয়ার  — সরাসরি লিংক (/library?file=ID); ফোনে শেয়ার-শিট, না থাকলে কপি
 *   Drive-এ খুলুন — প্রিভিউ না এলে ফলব্যাক
 *
 * সরাসরি লিংক: /library?file=ID খুললে লোড শেষে ওই ফাইল নিজে থেকে খোলে।
 * প্রিভিউ লোড হয়েছে কিনা ক্রস-ডোমেইন iframe থেকে জানা যায় না; ১২ সেকেন্ডে load না এলে ফলব্যাক বার্তা দেখায়।
 *
 * ধাপ ৯: মডাল খুললে/ডাউনলোডে "lib:viewed" ও "lib:download" ইভেন্ট যায় (detail: { file }); library-extras.js কাউন্টার বাড়ায়।
 *   বাটন: ★ সংরক্ষণ (window.LibMarks), রিপোর্ট (window.LibReport) — কারণ বেছে ও ঐচ্ছিক নোটসহ।
 */
(function () {
  "use strict";

  var D = window.LibData, B = window.LibBrowse;
  if (!D || !B) return;

  var FALLBACK_MS = 12000;
  var DRIVE_RE = /^https:\/\/(drive|docs)\.google\.com\//;

  function lang() { return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn"; }
  function tx(bn, en) { return lang() === "en" ? en : bn; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function reduced() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function ico(inner) {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + "</svg>";
  }
  var I = {
    close: ico('<path d="M6 6l12 12M18 6L6 18"/>'),
    down: ico('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'),
    print: ico('<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/>'),
    share: ico('<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/>'),
    ext: ico('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    star: ico('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"/>'),
    flag: ico('<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>')
  };
  var REASONS = [
    ["broken", "লিংক নষ্ট বা ফাইল খোলা যাচ্ছে না", "Broken link or the file won’t open"],
    ["private", "ফাইল ব্যক্তিগত (অনুমতি চাচ্ছে)", "File is private (asks for permission)"],
    ["wrong", "ভুল তথ্য (কোর্স, বর্ষ বা শিরোনাম)", "Wrong details (course, year or title)"],
    ["inappropriate", "অনুপযুক্ত বা অপ্রাসঙ্গিক", "Inappropriate or off-topic"],
    ["copyright", "কপিরাইট বা অপসারণের অনুরোধ", "Copyright or removal request"],
    ["other", "অন্য কারণ", "Something else"]
  ];

  /* ---------- Drive লিংক থেকে প্রিভিউ / ডাউনলোড / প্রিন্টের ঠিকানা ---------- */
  function links(f) {
    var u = f.url, m;
    if (!DRIVE_RE.test(u)) return null;
    if ((m = u.match(/^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([A-Za-z0-9_-]{10,120})/))) {
      var kind = m[1], id = m[2], base = "https://docs.google.com/" + kind + "/d/" + id;
      return {
        preview: base + "/preview",
        download: kind === "presentation" ? base + "/export/pdf" : base + "/export?format=pdf",
        print: base + "/edit",
        open: base + "/edit",
        pdfNote: true
      };
    }
    m = u.match(/\/file\/d\/([A-Za-z0-9_-]{10,120})/);
    if (!m) return null;
    var fid = m[1];
    return {
      preview: "https://drive.google.com/file/d/" + fid + "/preview",
      download: "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(fid),
      print: "https://drive.google.com/file/d/" + fid + "/view",
      open: "https://drive.google.com/file/d/" + fid + "/view",
      pdfNote: false
    };
  }

  /* ---------- মডালের কাঠামো (প্রথমবার খোলার সময় তৈরি হয়) ---------- */
  var root, dlg, elTitle, elMeta, elFrameBox, elFallback, elToast, btnClose, elRp;
  var cur = null, curLinks = null, lastFocus = null, timer = 0, toastTimer = 0, pushed = false, frameSeq = 0;

  function build() {
    if (root) return;
    root = document.createElement("div");
    root.className = "lib-vw";
    root.hidden = true;
    root.innerHTML =
      '<div class="lib-vw-bd" data-vw-close></div>' +
      '<div class="lib-vw-dlg" role="dialog" aria-modal="true" aria-labelledby="lib-vw-title" tabindex="-1">' +
        '<header class="lib-vw-head">' +
          '<div class="lib-vw-ht"><h3 id="lib-vw-title" class="lib-vw-title"></h3><p class="lib-vw-meta"></p></div>' +
          '<button type="button" class="lib-vw-x" data-vw-close></button>' +
        "</header>" +
        '<div class="lib-vw-stage">' +
          '<div class="lib-vw-load" aria-hidden="true"><span class="lib-vw-spin"></span></div>' +
          '<div class="lib-vw-frame"></div>' +
          '<div class="lib-vw-fb" hidden role="alert"></div>' +
          '<div class="lib-vw-rp" hidden></div>' +
        "</div>" +
        '<footer class="lib-vw-bar">' +
          '<button type="button" class="lib-vw-btn pri" data-vw="download"></button>' +
          '<button type="button" class="lib-vw-btn" data-vw="print"></button>' +
          '<button type="button" class="lib-vw-btn" data-vw="share"></button>' +
          '<button type="button" class="lib-vw-btn" data-vw="save" aria-pressed="false"></button>' +
          '<button type="button" class="lib-vw-btn" data-vw="report"></button>' +
          '<button type="button" class="lib-vw-btn ghost" data-vw="open"></button>' +
        "</footer>" +
        '<div class="lib-vw-toast" role="status" aria-live="polite"></div>' +
      "</div>";
    document.body.appendChild(root);

    dlg = root.querySelector(".lib-vw-dlg");
    elTitle = root.querySelector(".lib-vw-title");
    elMeta = root.querySelector(".lib-vw-meta");
    elFrameBox = root.querySelector(".lib-vw-frame");
    elFallback = root.querySelector(".lib-vw-fb");
    elRp = root.querySelector(".lib-vw-rp");
    elToast = root.querySelector(".lib-vw-toast");
    btnClose = root.querySelector(".lib-vw-x");

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-vw-close]")) { closeViewer(); return; }
      var r = e.target.closest("[data-rp]");
      if (r) { reportAct(r.getAttribute("data-rp")); return; }
      var b = e.target.closest("[data-vw]");
      if (b) act(b.getAttribute("data-vw"));
    });
    document.addEventListener("keydown", onKey);
  }

  function labels() {
    btnClose.innerHTML = I.close;
    btnClose.setAttribute("aria-label", tx("বন্ধ করুন", "Close"));
    var set = function (k, icon, bn, en) { root.querySelector('[data-vw="' + k + '"]').innerHTML = icon + "<span>" + esc(tx(bn, en)) + "</span>"; };
    set("download", I.down, "ডাউনলোড", "Download");
    set("print", I.print, "প্রিন্ট", "Print");
    set("share", I.share, "শেয়ার", "Share");
    set("open", I.ext, "Drive-এ খুলুন", "Open in Drive");
    set("report", I.flag, "রিপোর্ট", "Report");
    saveLabel();
  }

  function saveLabel() {
    var b = root.querySelector('[data-vw="save"]');
    var on = !!(cur && window.LibMarks && window.LibMarks.has(cur.id));
    b.setAttribute("aria-pressed", String(on));
    b.classList.toggle("on", on);
    b.innerHTML = I.star + "<span>" + esc(on ? tx("সংরক্ষিত", "Saved") : tx("সংরক্ষণ", "Save")) + "</span>";
  }

  function metaLine(f) {
    var l = lang(), out = [];
    var ft = D.fileType(f.ftype); if (ft) out.push(D.name(ft, l));
    if (f.code) out.push(f.code + (f.cname ? " " + f.cname : ""));
    var et = f.etype && f.etype !== "none" ? D.examType(f.etype) : null;
    var ex = [et ? D.name(et, l) : "", f.eyear ? String(f.eyear) : ""].filter(Boolean).join(" ");
    if (ex) out.push(ex);
    var c = D.college(f.college); if (c) out.push(D.name(c, l));
    return out.join(" · ");
  }

  /* জমাদাতা নিজে রাজি হলে নাম ও (দিলে) কলেজ, বিভাগ, সেশন */
  function byLine(f) {
    if (!f.by) return "";
    var l = lang(), out = [f.by];
    var c = f.byCollege && D.college(f.byCollege); if (c) out.push(D.name(c, l));
    var d = f.byDept && D.department(f.byDept); if (d) out.push(D.name(d, l));
    if (f.bySession) out.push(tx("সেশন ", "Session ") + f.bySession);
    return tx("জমা দিয়েছেন: ", "Submitted by: ") + out.join(" · ");
  }
  function setMeta(f) {
    elMeta.textContent = metaLine(f);
    var b = byLine(f);
    if (b) {
      var s = document.createElement("span");
      s.className = "lib-vw-by"; s.textContent = b;
      elMeta.appendChild(document.createElement("br")); elMeta.appendChild(s);
    }
  }

  /* ---------- খোলা ও বন্ধ ---------- */
  function setFallback(on) {
    elFallback.hidden = !on;
    if (!on) { elFallback.innerHTML = ""; return; }
    elFallback.innerHTML =
      "<b>" + esc(tx("প্রিভিউ দেখানো যাচ্ছে না", "Can’t show the preview")) + "</b>" +
      "<p>" + esc(tx("ফাইলটি হয়তো ব্যক্তিগত, সরানো হয়েছে, বা নেটওয়ার্ক ধীর। Drive-এ খুলে দেখুন।",
                      "The file may be private or removed, or the connection is slow. Try opening it in Drive.")) + "</p>" +
      '<div class="lib-vw-fbb"><button type="button" class="lib-vw-btn pri" data-vw="open">' + I.ext + "<span>" + esc(tx("Drive-এ খুলুন", "Open in Drive")) + "</span></button>" +
      '<button type="button" class="lib-vw-btn" data-vw="report-broken">' + I.flag + "<span>" + esc(tx("লিংক নষ্ট রিপোর্ট করুন", "Report broken link")) + "</span></button></div>";
  }

  /* ---------- রিপোর্ট প্যানেল ---------- */
  function reportOpen(pre) {
    if (!cur) return;
    if (!window.LibReport) { toast(tx("রিপোর্ট এখন পাঠানো যাচ্ছে না। পরে চেষ্টা করুন।", "Reporting isn’t available right now. Try again later.")); return; }
    if (window.LibReport.done(cur.id)) { toast(tx("আপনি এই ফাইল আগেই রিপোর্ট করেছেন। ধন্যবাদ।", "You already reported this file. Thank you.")); return; }
    var h = '<form class="lib-vw-rpf" novalidate><fieldset><legend>' + esc(tx("কী সমস্যা?", "What’s wrong?")) + "</legend>";
    REASONS.forEach(function (r) {
      h += '<label class="lib-vw-rr"><input type="radio" name="lib-rp" value="' + r[0] + '"' + (pre === r[0] ? " checked" : "") + "><span>" + esc(tx(r[1], r[2])) + "</span></label>";
    });
    h += "</fieldset>" +
      '<label class="lib-vw-rn"><span>' + esc(tx("আরও কিছু বলতে চাইলে (ঐচ্ছিক)", "Anything to add? (optional)")) + '</span><textarea maxlength="300" rows="3"></textarea></label>' +
      '<div class="lib-vw-rb"><button type="button" class="lib-vw-btn pri" data-rp="send">' + esc(tx("রিপোর্ট পাঠান", "Send report")) + "</button>" +
      '<button type="button" class="lib-vw-btn" data-rp="cancel">' + esc(tx("বাতিল", "Cancel")) + "</button></div></form>";
    elRp.innerHTML = h;
    elRp.hidden = false;
    var first = elRp.querySelector("input:checked") || elRp.querySelector("input");
    if (first) first.focus();
  }
  function reportClose(refocus) {
    if (!elRp || elRp.hidden) return;
    elRp.hidden = true; elRp.innerHTML = "";
    if (refocus) { var b = root.querySelector('[data-vw="report"]'); if (b) b.focus(); }
  }
  function reportAct(k) {
    if (k === "cancel") { reportClose(true); return; }
    if (k !== "send" || !cur) return;
    var pick = elRp.querySelector("input:checked");
    if (!pick) { toast(tx("একটি কারণ বেছে নিন।", "Please choose a reason.")); return; }
    var note = elRp.querySelector("textarea").value;
    var btn = elRp.querySelector('[data-rp="send"]');
    btn.disabled = true;
    var f = cur;
    window.LibReport.send(f, pick.value, note).then(function (res) {
      if (res === "error") { btn.disabled = false; toast(tx("পাঠানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।", "Couldn’t send. Check your connection and try again.")); return; }
      reportClose(true);
      toast(res === "dup" ? tx("আপনি এই ফাইল আগেই রিপোর্ট করেছেন। ধন্যবাদ।", "You already reported this file. Thank you.")
                          : tx("রিপোর্ট পাঠানো হয়েছে। ধন্যবাদ!", "Report sent. Thank you!"));
    });
  }

  function loadFrame() {
    var seq = ++frameSeq;
    clearTimeout(timer);
    elFrameBox.innerHTML = "";
    setFallback(false);
    root.classList.add("is-loading");

    var fr = document.createElement("iframe");
    fr.title = cur.title;
    fr.setAttribute("allow", "fullscreen");
    fr.setAttribute("referrerpolicy", "no-referrer");
    fr.addEventListener("load", function () {
      if (seq !== frameSeq) return;
      clearTimeout(timer);
      root.classList.remove("is-loading");
    });
    fr.src = curLinks.preview;
    elFrameBox.appendChild(fr);

    timer = setTimeout(function () {
      if (seq !== frameSeq) return;
      root.classList.remove("is-loading");
      setFallback(true);
    }, FALLBACK_MS);
  }

  function openViewer(f, opts) {
    var lk = links(f);
    if (!lk) { toastGlobalOpen(f); return; }
    build();
    labels();
    cur = f; curLinks = lk;
    saveLabel();
    elTitle.textContent = f.title;
    setMeta(f);
    root.querySelector('[data-vw="download"] span').textContent = lk.pdfNote ? tx("PDF ডাউনলোড", "Download PDF") : tx("ডাউনলোড", "Download");

    if (root.hidden) {
      lastFocus = document.activeElement;
      root.hidden = false;
      document.documentElement.classList.add("lib-vw-lock");
      requestAnimationFrame(function () { root.classList.add("on"); });
    }
    loadFrame();
    btnClose.focus({ preventScroll: true });

    if (!(opts && opts.noPush)) {
      try {
        var u = new URL(location.href);
        u.searchParams.set("file", f.id);
        history.pushState({ libv: 1 }, "", u.pathname + u.search + u.hash);
        pushed = true;
      } catch (e) { pushed = false; }
    }
    document.dispatchEvent(new CustomEvent("lib:viewed", { detail: { file: f } }));
  }

  function hide() {
    if (!root || root.hidden) return;
    clearTimeout(timer); frameSeq++;
    if (elRp) { elRp.hidden = true; elRp.innerHTML = ""; }
    root.classList.remove("on", "is-loading");
    root.hidden = true;
    elFrameBox.innerHTML = "";
    document.documentElement.classList.remove("lib-vw-lock");
    cur = null; curLinks = null;
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* নেই */ } }
    lastFocus = null;
  }

  function closeViewer() {
    if (!root || root.hidden) return;
    if (pushed && history.state && history.state.libv) { pushed = false; history.back(); }   // popstate-এ hide() হবে
    else {
      hide();
      try {
        var u = new URL(location.href);
        if (u.searchParams.has("file")) { u.searchParams.delete("file"); history.replaceState(null, "", u.pathname + u.search + u.hash); }
      } catch (e) { /* ঠিক আছে */ }
    }
  }

  window.addEventListener("popstate", function () {
    if (root && !root.hidden && !(history.state && history.state.libv)) { pushed = false; hide(); }
  });

  /* ---------- কী: Esc বন্ধ, Tab মডালের ভেতরেই ঘোরে ---------- */
  function onKey(e) {
    if (!root || root.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (elRp && !elRp.hidden) reportClose(true); else closeViewer();
      return;
    }
    if (e.key !== "Tab") return;
    var els = Array.prototype.slice.call(dlg.querySelectorAll("button:not([hidden]):not([disabled]), a[href], iframe, input, textarea"))
      .filter(function (x) { return !x.closest("[hidden]"); });
    if (!els.length) return;
    var first = els[0], last = els[els.length - 1];
    if (!dlg.contains(document.activeElement)) { first.focus(); e.preventDefault(); return; }
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  /* ---------- বাটনের কাজ ---------- */
  function openTab(url) { window.open(url, "_blank", "noopener,noreferrer"); }

  function toast(msg) {
    if (!elToast) return;
    elToast.textContent = msg;
    elToast.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { elToast.classList.remove("on"); }, 3200);
  }

  function shareUrl(f) {
    var u = new URL(location.href);
    u.hash = ""; u.search = "";
    u.searchParams.set("file", f.id);
    return u.toString();
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      try {
        var t = document.createElement("textarea");
        t.value = text; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;opacity:0;top:0";
        document.body.appendChild(t); t.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(t);
        ok ? res() : rej(new Error("copy"));
      } catch (e) { rej(e); }
    });
  }

  function act(k) {
    if (!cur || !curLinks) return;
    if (k === "download") {
      openTab(curLinks.download);
      toast(tx("ডাউনলোড শুরু হচ্ছে… না হলে Drive-এ খুলে ডাউনলোড করুন।", "Starting download… if nothing happens, open it in Drive and download from there."));
      document.dispatchEvent(new CustomEvent("lib:download", { detail: { file: cur } }));
    } else if (k === "print") {
      openTab(curLinks.print);
      toast(tx("Drive-এ খুলেছে। সেখানে প্রিন্ট আইকন বা Ctrl+P চাপুন।", "Opened in Drive. Use its print icon or press Ctrl+P there."));
    } else if (k === "open") {
      openTab(curLinks.open);
    } else if (k === "save") {
      if (!window.LibMarks) return;
      var on = window.LibMarks.toggle(cur.id);
      saveLabel();
      toast(on ? tx("সংরক্ষণ করা হয়েছে (এই ব্রাউজারে)", "Saved (in this browser)") : tx("সংরক্ষণ সরানো হয়েছে", "Removed from saved"));
    } else if (k === "report") {
      reportOpen("");
    } else if (k === "report-broken") {
      reportOpen("broken");
    } else if (k === "share") {
      var url = shareUrl(cur), f = cur;
      if (navigator.share && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)) {
        navigator.share({ title: f.title, text: f.title + " – DCUCore", url: url }).catch(function (e) {
          if (e && e.name === "AbortError") return;
          copy(url).then(function () { toast(tx("লিংক কপি হয়েছে", "Link copied")); }, function () { toast(url); });
        });
      } else {
        copy(url).then(function () { toast(tx("লিংক কপি হয়েছে", "Link copied")); }, function () { toast(url); });
      }
    }
  }

  /* Drive লিংক চেনা না গেলে (পুরোনো/অস্বাভাবিক ডেটা): আগের আচরণ, নতুন ট্যাবে খোলা */
  function toastGlobalOpen(f) {
    if (DRIVE_RE.test(f.url)) openTab(f.url);
  }

  /* ---------- ইভেন্ট ---------- */
  document.addEventListener("lib:open", function (e) {
    var f = e.detail && e.detail.file;
    if (!f) return;
    e.preventDefault();       // ব্রাউজ মডিউলের নতুন-ট্যাব ফলব্যাক বন্ধ
    openViewer(f);
  });

  /* ভাষা বদলালে মডালের লেখা হালনাগাদ */
  var prevLang = window.onLang;
  window.onLang = function () {
    if (typeof prevLang === "function") { try { prevLang(); } catch (e) { /* অন্য হুক */ } }
    if (root && !root.hidden && cur) {
      labels();
      setMeta(cur);
      root.querySelector('[data-vw="download"] span').textContent = curLinks.pdfNote ? tx("PDF ডাউনলোড", "Download PDF") : tx("ডাউনলোড", "Download");
      if (!elFallback.hidden) setFallback(true);
    }
  };

  /* সরাসরি লিংক: /library?file=ID */
  function openFromQuery() {
    var id;
    try { id = new URL(location.href).searchParams.get("file"); } catch (e) { return; }
    if (!id) return;
    var f = B.find(id);
    if (f) openViewer(f, { noPush: true });
  }
  if (B.ready()) openFromQuery();
  else document.addEventListener("lib:ready", function once() { document.removeEventListener("lib:ready", once); openFromQuery(); });
})();
