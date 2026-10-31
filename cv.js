/* cv.js — CV Studio
 * State → A4 sheet, টেমপ্লেট কার্ড + গ্যালারি, ফিল্ড ভ্যালিডেশন,
 * গোপনীয়তা সুইচ, ছবির আকার, সরাসরি PDF ডাউনলোড, localStorage সেভ।
 * বাইলিঙ্গুয়াল UI: dcu-lang.js ("বাংলা|English" এর .t উপাদান)।
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'cv-studio-v1';
  var W = 794;                         // A4 width (CSS px @96dpi)
  var SAF = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);

  /* ---------- ডেটা ---------- */
  var THEMES = {
    navy:     { n: 'Navy & Gold',      bn: 'নেভি ও সোনালি',       p: '#0b1f3a', a: '#c9a227' },
    teal:     { n: 'Teal',             bn: 'টিল',                 p: '#0f4c5c', a: '#2a9d8f' },
    maroon:   { n: 'Maroon',           bn: 'ম্যারুন',             p: '#6b1d2a', a: '#d4a373' },
    forest:   { n: 'Forest & Brass',   bn: 'ফরেস্ট ও ব্রাস',       p: '#1f3d2b', a: '#b08d57' },
    slate:    { n: 'Slate',            bn: 'স্লেট',               p: '#334155', a: '#38bdf8' },
    indigo:   { n: 'Indigo',           bn: 'ইন্ডিগো',             p: '#312e81', a: '#f472b6' },
    emerald:  { n: 'Emerald & Gold',   bn: 'এমারেল্ড ও সোনালি',    p: '#0a3d33', a: '#c9a24b' },
    burgundy: { n: 'Burgundy & Rose',  bn: 'বারগান্ডি ও রোজ',     p: '#5a1230', a: '#d8a47f' },
    ocean:    { n: 'Ocean & Aqua',     bn: 'ওশান ও অ্যাকোয়া',     p: '#063b6e', a: '#3cc4c0' },
    graphite: { n: 'Graphite & Gold',  bn: 'গ্রাফাইট ও সোনালি',    p: '#15181d', a: '#c9a227' },
    plum:     { n: 'Plum & Champagne', bn: 'প্লাম ও শ্যাম্পেন',    p: '#4a1942', a: '#e0b97a' }
  };

  var TPLS = [
    { v: 'classic',  en: 'Classic',        bn: 'ক্লাসিক',        d: 'একক কলাম, ক্লাসিক বিন্যাস|Single column, classic layout' },
    { v: 'sidebar',  en: 'Modern sidebar', bn: 'মডার্ন সাইডবার', d: 'বাম পাশে রঙিন প্যানেল|Coloured panel on the left' },
    { v: 'elegant',  en: 'Elegant',        bn: 'এলিগ্যান্ট',     d: 'কেন্দ্রীভূত শিরোনাম, সূক্ষ্ম রেখা|Centred header, fine rules' },
    { v: 'minimal',  en: 'Minimal',        bn: 'মিনিমাল',        d: 'হালকা টাইপ, অনেক ফাঁকা জায়গা|Light type, generous spacing' },
    { v: 'banner',   en: 'Bold banner',    bn: 'বোল্ড ব্যানার',  d: 'উপরে রঙিন ব্যানার|Colour banner across the top' },
    { v: 'timeline', en: 'Timeline',       bn: 'টাইমলাইন',       d: 'তারিখ বাম পাশে, সময়রেখা|Dates on the left, timeline view' }
  ];

  /* CV-এর ভেতরের শিরোনাম — CV-র ভাষা অনুযায়ী */
  var LB = {
    en: { ct: 'Contact', sum: 'Professional Summary', exp: 'Work Experience', edu: 'Education',
          proj: 'Projects', skills: 'Skills', langs: 'Languages', ach: 'Achievements & Certifications',
          refs: 'References', nameFb: 'Your Name' },
    bn: { ct: 'যোগাযোগ', sum: 'পেশাগত সারসংক্ষেপ', exp: 'কর্ম অভিজ্ঞতা', edu: 'শিক্ষাগত যোগ্যতা',
          proj: 'প্রজেক্ট', skills: 'দক্ষতা', langs: 'ভাষাজ্ঞান', ach: 'অর্জন ও সনদ',
          refs: 'রেফারেন্স', nameFb: 'আপনার নাম' }
  };

  /* রিপিটার: [key, label, isTextarea, example] */
  var REP = {
    exp: { f: [
      ['t', 'পদবি|Role / position', 0, 'যেমন: Research Assistant~e.g. Research Assistant'],
      ['s', 'প্রতিষ্ঠান|Organisation', 0, 'যেমন: ABC Research Institute~e.g. ABC Research Institute'],
      ['p', 'সময়কাল|Period', 0, 'যেমন: জুন ২০২৫ – আগস্ট ২০২৫~e.g. Jun 2025 – Aug 2025'],
      ['d', 'কাজের বিবরণ (প্রতি লাইনে একটি)|Details (one point per line)', 1, 'যেমন: জরিপের তথ্য বিশ্লেষণ করেছি~e.g. Analysed survey data']] },
    edu: { f: [
      ['t', 'ডিগ্রি / পরীক্ষা|Degree / exam', 0, 'যেমন: BSS (Honours) in Economics~e.g. BSS (Honours) in Economics'],
      ['s', 'প্রতিষ্ঠান|Institution', 0, 'যেমন: Dhaka University~e.g. Dhaka University'],
      ['p', 'সময়কাল|Period', 0, 'যেমন: ২০২২ – ২০২৬~e.g. 2022 – 2026'],
      ['d', 'ফলাফল / বিবরণ|Result / details', 1, 'যেমন: CGPA 3.50~e.g. CGPA 3.50']] },
    proj: { f: [
      ['t', 'প্রজেক্টের নাম|Project name', 0, 'যেমন: Household Income Survey~e.g. Household Income Survey'],
      ['s', 'প্রযুক্তি / লিংক|Tech / link', 0, 'যেমন: Excel, SPSS~e.g. Excel, SPSS'],
      ['p', 'সময়কাল|Period', 0, 'যেমন: ২০২৫~e.g. 2025'],
      ['d', 'বিবরণ (প্রতি লাইনে একটি)|Details (one point per line)', 1, 'যেমন: ২০০ পরিবারের তথ্য বিশ্লেষণ~e.g. Analysed data of 200 households']] }
  };

  var SUMS = [
    ['Motivated and detail-oriented graduate with a strong academic foundation, analytical thinking and excellent communication skills. Eager to apply my knowledge in an entry-level role and grow with a dynamic organisation.',
     'উদ্যমী ও মনোযোগী একজন গ্র্যাজুয়েট, যার রয়েছে শক্তিশালী একাডেমিক ভিত্তি, বিশ্লেষণ ক্ষমতা ও যোগাযোগ দক্ষতা। একটি গতিশীল প্রতিষ্ঠানে প্রাথমিক পদে কাজ করে নিজের জ্ঞান প্রয়োগ ও দক্ষতা বাড়াতে আগ্রহী।'],
    ['Results-driven professional with several years of experience delivering quality work, leading teams and meeting deadlines. Skilled in problem solving, planning and stakeholder communication.',
     'ফলাফলমুখী পেশাজীবী, যার গুণগত কাজ সম্পন্ন করা, দল পরিচালনা ও সময়সীমা মেনে চলার বছরের অভিজ্ঞতা রয়েছে। সমস্যা সমাধান, পরিকল্পনা ও যোগাযোগে দক্ষ।'],
    ['Research-oriented student with experience in data collection, analysis and academic writing. Committed to evidence-based work and continuous learning.',
     'গবেষণামুখী শিক্ষার্থী, যার তথ্য সংগ্রহ, বিশ্লেষণ ও একাডেমিক লেখালেখির অভিজ্ঞতা রয়েছে। প্রমাণভিত্তিক কাজ ও নিরন্তর শেখার প্রতি অঙ্গীকারবদ্ধ।']
  ];

  /* ফাঁকা অবস্থা (তথ্য মুছুন) */
  var BLANK = {
    tpl: 'classic', th: 'navy', pc: '', ac: '', font: 'serif', lang: 'en', shape: 'circle',
    name: '', title: '', email: '', phone: '', address: '', links: '', photo: '',
    summary: '', skills: '', langs: '', ach: '', refs: '',
    exp: [], edu: [], proj: []
  };

  /* নমুনা প্রোফাইল ছবি (প্লেসহোল্ডার; নিজের ছবি আপলোড করলে সেটাই থাকবে) */
  var SAMPLE_PHOTO = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17386A"/><stop offset="1" stop-color="#0B1F3A"/></linearGradient></defs><rect width="360" height="360" fill="url(#g)"/><circle cx="180" cy="142" r="64" fill="#E8C46C"/><path d="M58 360c12-82 62-124 122-124s110 42 122 124z" fill="#E8C46C"/></svg>');

  var SAMPLE = {
    name: 'Md. Rahim Uddin',
    photo: SAMPLE_PHOTO,
    title: 'Economics Graduate | Data Analysis & Research',
    email: 'rahim@example.com', phone: '+880 1712-345678', address: 'Dhaka, Bangladesh',
    links: 'linkedin.com/in/your-name',
    summary: SUMS[0][0],
    edu: [
      { t: 'BSS (Honours) in Economics', s: 'Dhaka Central University', p: '2022 – 2026', d: 'CGPA 3.50' },
      { t: 'Higher Secondary Certificate', s: 'Dhaka College', p: '2020 – 2022', d: 'GPA 5.00' }
    ],
    exp: [
      { t: 'Research Assistant (Intern)', s: 'ABC Research Institute', p: 'Jun 2025 – Aug 2025',
        d: 'Collected and analysed survey data\nPrepared summary reports for the team' },
      { t: 'Student Volunteer', s: 'University Career Club', p: '2024 – 2025',
        d: 'Organised workshops\nCoordinated 30+ volunteers' }
    ],
    proj: [
      { t: 'Household Income Survey Analysis', s: 'Excel, SPSS', p: '2025',
        d: 'Analysed survey data of 200 households and prepared charts for the final report.' }
    ],
    skills: 'Microsoft Excel, SPSS, Research Writing, Public Speaking, Teamwork',
    langs: 'Bangla (Native), English (Professional)',
    ach: "Dean's List 2024\nCertificate in Data Analysis (Online Course)",
    refs: ''
  };

  var DEF = Object.assign(clone(BLANK), clone(SAMPLE));

  /* ---------- হেল্পার ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function trim(x) { return String(x == null ? '' : x).trim(); }
  function lines(s) { return String(s || '').split('\n').map(trim).filter(Boolean); }
  function isEn() { return document.documentElement.getAttribute('data-lang') === 'en'; }
  function bnDigits(n) { return String(n).replace(/[0-9]/g, function (d) { return '০১২৩৪৫৬৭৮৯'.charAt(+d); }); }
  function tplIndex(v) {
    for (var i = 0; i < TPLS.length; i++) if (TPLS[i].v === v) return i;
    return 0;
  }

  var S = clone(DEF);

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && typeof v === 'object') {
        Object.keys(DEF).forEach(function (k) {
          if (v[k] !== undefined && v[k] !== null) S[k] = v[k];
        });
      }
    } catch (e) { /* storage বন্ধ — কাজ চলবে, শুধু সেভ হবে না */ }
    ['exp', 'edu', 'proj'].forEach(function (k) { if (!Array.isArray(S[k])) S[k] = []; });
    if (S.shape !== 'rect') S.shape = 'circle';
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }

  function colors() {
    var t = THEMES[S.th] || THEMES.navy;
    return { p: S.pc || t.p, a: S.ac || t.a };
  }

  /* ---------- ভ্যালিডেশন ---------- */
  function maxMsg(n) { return 'সর্বোচ্চ ' + bnDigits(n) + ' অক্ষর|Max ' + n + ' characters'; }

  var RULES = {
    name:    { req: 'নাম লিখুন|Please enter your name', min: 2, max: 60,
               test: /^[\p{L}\s.'\-]+$/u, msg: 'শুধু অক্ষর, স্পেস, . ও - ব্যবহার করুন|Use letters, spaces, . or - only' },
    title:   { max: 90 },
    email:   { test: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, msg: 'সঠিক ইমেইল লিখুন, যেমন name@mail.com|Enter a valid email, e.g. name@mail.com' },
    phone:   { test: /^\+?[\p{Nd}\s()\-]{7,20}$/u, msg: 'সঠিক ফোন নম্বর লিখুন (৭–২০ সংখ্যা)|Enter a valid phone number (7–20 digits)' },
    address: { max: 120 },
    links:   { lines: true, test: /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/,
               msg: 'প্রতি লাইনে সঠিক লিংক দিন, যেমন linkedin.com/in/name|Each line must be a valid link, e.g. linkedin.com/in/name' },
    summary: { min: 30, max: 600, msg: 'কমপক্ষে ৩০ অক্ষর লিখুন|At least 30 characters' },
    skills:  { max: 300 },
    langs:   { max: 200 },
    ach:     { lines: true, max: 400 },
    refs:    { lines: true, min: 3, max: 300, msg: 'প্রতি লাইনে কমপক্ষে ৩ অক্ষর|At least 3 characters per line' }
  };
  var LRULES = {
    t: { max: 80, needIf: 'শিরোনাম লিখুন (পদবি/ডিগ্রি/নাম)|Enter a title (role / degree / name)' },
    s: { max: 120 },
    p: { max: 40 },
    d: { max: 500 }
  };

  function checkText(rule, v) {
    if (rule.max && v.length > rule.max) return maxMsg(rule.max);
    if (rule.min && v.length < rule.min) return rule.msg || ('কমপক্ষে ' + bnDigits(rule.min) + ' অক্ষর|At least ' + rule.min + ' characters');
    if (rule.test && !rule.test.test(v)) return rule.msg || '';
    return '';
  }
  function checkValue(rule, raw) {
    if (!trim(raw)) return rule.req || '';
    if (rule.lines) {
      var ls = lines(raw);
      for (var i = 0; i < ls.length; i++) {
        var m = checkText(rule, ls[i]);
        if (m) return m;
      }
      return '';
    }
    return checkText(rule, trim(raw));
  }
  function hasContent(item) { return !!(trim(item.t) || trim(item.s) || trim(item.p) || trim(item.d)); }

  function fieldError(el) {
    var k = el.getAttribute('data-k'), L = el.getAttribute('data-list'), f = el.getAttribute('data-f');
    if (k && RULES[k]) return checkValue(RULES[k], el.value);
    if (L && f) {
      var item = S[L] && S[L][+el.getAttribute('data-i')];
      if (!item) return '';
      if (f === 't' && !trim(el.value) && hasContent(item)) return LRULES.t.needIf;
      if (!trim(el.value)) return '';
      return checkText(LRULES[f] || {}, trim(el.value));
    }
    return '';
  }

  function setErr(el, msg) {
    var box = el.closest('.fld'), e = box && box.querySelector('.fe');
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      if (e) e.innerHTML = '<span class="t">' + msg + '</span>';
    } else {
      el.removeAttribute('aria-invalid');
      if (e) e.innerHTML = '';
    }
  }

  /* সব ঘর যাচাই; কতগুলো ভুল আর প্রথম ভুল ঘরটি ফেরত দেয় */
  function validateAll(showAll) {
    var bad = 0, first = null;
    document.querySelectorAll('input[data-k],textarea[data-k],input[data-f],textarea[data-f]').forEach(function (el) {
      var m = fieldError(el);
      setErr(el, (showAll || el.getAttribute('data-touched')) ? m : '');
      if (m) { bad++; if (!first) first = el; }
    });
    return { bad: bad, first: first };
  }

  function updateWarn(bad) {
    var w = $('warn');
    if (!w) return;
    w.innerHTML = bad ? '<span class="t">' + bnDigits(bad) + ' টি ঘরে ভুল আছে, ঠিক করুন|' + bad + ' field(s) need attention</span>' : '';
    w.hidden = !bad;
  }
  function flash(msg) {
    var w = $('warn');
    w.innerHTML = '<span class="t">' + msg + '</span>';
    w.hidden = false;
  }

  /* ---------- শিট HTML ---------- */
  function bullets(list) {
    return '<ul>' + list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  }
  function chips(s) {
    var a = String(s || '').split(/[,\n]/).map(trim).filter(Boolean);
    return a.length ? '<div class="chs">' + a.map(function (x) { return '<span class="ch">' + esc(x) + '</span>'; }).join('') + '</div>' : '';
  }
  function sec(h, body) {
    return body ? '<section class="sec"><h3>' + esc(h) + '</h3>' + body + '</section>' : '';
  }
  function entries(list, tl) {
    return (list || []).filter(function (x) { return x && (trim(x.t) || trim(x.s) || trim(x.d)); })
      .map(function (x) {
        var d = lines(x.d);
        var desc = d.length > 1 ? bullets(d) : (d.length ? '<p>' + esc(d[0]) + '</p>' : '');
        var when = trim(x.p) ? '<span class="meta">' + esc(trim(x.p)) + '</span>' : '';
        var body = '<div class="bd"><div class="r1"><b>' + esc(trim(x.t)) + '</b>' + (tl ? '' : when) + '</div>' +
                   (trim(x.s) ? '<div class="sub">' + esc(trim(x.s)) + '</div>' : '') + desc + '</div>';
        return tl
          ? '<div class="it tl"><div class="when">' + esc(trim(x.p)) + '</div>' + body + '</div>'
          : '<div class="it">' + body + '</div>';
      }).join('');
  }

  function sheetHTML(tpl) {
    var d = S, L = LB[d.lang] || LB.en, tl = tpl === 'timeline', side = tpl === 'sidebar';
    var nm = esc(trim(d.name) || L.nameFb);
    var jt = esc(trim(d.title));

    var contact = [];
    contact.push(d.email);
    contact.push(d.phone);
    contact.push(d.address);
    contact = contact.concat(lines(d.links));
    contact = contact.map(trim).filter(Boolean);

    var ph = d.photo ? '<img class="ph' + (d.shape === 'rect' ? ' rect' : '') + '" src="' + d.photo + '" alt="">' : '';

    var main = sec(L.sum, trim(d.summary) ? '<p>' + esc(trim(d.summary)) + '</p>' : '')
      + sec(L.exp, entries(d.exp, tl))
      + sec(L.edu, entries(d.edu, tl))
      + sec(L.proj, entries(d.proj, tl))
      + sec(L.ach, lines(d.ach).length ? bullets(lines(d.ach)) : '')
      + sec(L.refs, lines(d.refs).map(function (x) { return '<div>' + esc(x) + '</div>'; }).join(''));
    var skills = sec(L.skills, chips(d.skills));
    var langs = sec(L.langs, chips(d.langs));

    if (side) {
      return '<div class="grid"><aside>' + ph +
        sec(L.ct, contact.map(function (x) { return '<div class="ci">' + esc(x) + '</div>'; }).join('')) +
        skills + langs + '</aside><main><h1>' + nm + '</h1>' +
        (jt ? '<div class="jt">' + jt + '</div>' : '') + main + '</main></div>';
    }

    var head = '<header class="hd"><div class="hl"><h1>' + nm + '</h1>' +
               (jt ? '<div class="jt">' + jt + '</div>' : '') + '</div>' + ph + '</header>';
    var ct = contact.length ? '<div class="ct">' + contact.map(esc).join('<span class="dot">•</span>') + '</div>' : '';

    if (tpl === 'banner') {
      return '<div class="band">' + head + '</div><div class="pad">' + ct + main + skills + langs + '</div>';
    }
    return '<div class="pad">' + head + ct + main + skills + langs + '</div>';
  }

  function fontStack() {
    var bn = S.lang === 'bn';
    if (S.font === 'sans') return bn ? "'Noto Sans Bengali','Inter',sans-serif" : "'Inter','Noto Sans Bengali',sans-serif";
    return bn ? "'Noto Serif Bengali','Georgia',serif" : "'Georgia','Noto Serif Bengali','Times New Roman',serif";
  }

  function paint(el, tpl) {
    var c = colors();
    el.className = 'cvs t-' + tpl;
    el.style.setProperty('--p', c.p);
    el.style.setProperty('--a', c.a);
    el.style.setProperty('--ff', fontStack());
    el.innerHTML = sheetHTML(tpl);
  }

  /* [data-fit] বাক্সকে তার প্রস্থে স্কেল করে */
  function fitAll() {
    document.querySelectorAll('[data-fit]').forEach(function (box) {
      var s = box.firstElementChild, bw = box.clientWidth;
      if (!s || !bw) return;
      var k = bw / W;
      s.style.transform = 'scale(' + k + ')';
      box.style.height = Math.ceil(s.offsetHeight * k) + 'px';
    });
  }

  /* ---------- UI ---------- */
  function renderThemes() {
    $('themes').innerHTML = Object.keys(THEMES).map(function (k) {
      var t = THEMES[k];
      return '<button type="button" class="sw" data-th="' + k + '" data-title="' + esc(t.bn + '~' + t.n) +
             '" aria-pressed="false" style="background:linear-gradient(135deg,' + t.p + ' 50%,' + t.a + ' 50%)"></button>';
    }).join('');
    setPlaceholders();
  }

  function syncThemeUI() {
    var custom = !!(S.pc || S.ac);
    document.querySelectorAll('[data-th]').forEach(function (b) {
      var on = !custom && b.getAttribute('data-th') === S.th;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var c = colors();
    $('cPri').value = c.p;
    $('cAcc').value = c.a;
  }

  /* টেমপ্লেট কার্ড (বর্তমান টেমপ্লেট + থিম) */
  function renderCard() {
    var cur = TPLS[tplIndex(S.tpl)], th = THEMES[S.th] || THEMES.navy, c = colors();
    var label = (S.pc || S.ac)
      ? '<span class="t">কাস্টম রং|Custom colours</span>'
      : '<span class="t">' + th.bn + '|' + th.n + '</span>';
    $('tcName').innerHTML = '<span class="t">' + cur.bn + '|' + cur.en + '</span>';
    $('tcTheme').innerHTML = label;
    $('thName').innerHTML = label;
    $('tcSw').style.background = 'linear-gradient(135deg,' + c.p + ' 50%,' + c.a + ' 50%)';
    $('tcThumb').innerHTML = '<span class="pv-box" data-fit><span class="cvs"></span></span>';
    paint($('tcThumb').querySelector('.cvs'), cur.v);
  }

  function renderLists() {
    Object.keys(REP).forEach(function (k) {
      var box = $('list-' + k), items = S[k], def = REP[k];
      if (!items.length) {
        box.innerHTML = '<p class="empty t">এখনো কিছু যোগ করা হয়নি|Nothing added yet</p>';
        return;
      }
      box.innerHTML = items.map(function (it, i) {
        var fields = def.f.map(function (f) {
          var key = f[0], ta = f[2], ex = f[3] || '';
          var attrs = ' data-list="' + k + '" data-i="' + i + '" data-f="' + key + '"' + (ex ? ' data-ph="' + esc(ex) + '"' : '');
          var val = esc(it[key] || '');
          var ctl = ta ? '<textarea rows="2"' + attrs + '>' + val + '</textarea>'
                       : '<input type="text"' + attrs + ' value="' + val + '">';
          return '<div class="fld' + (ta ? ' full' : '') + '"><label><span class="t">' + f[1] + '</span></label>' + ctl +
                 '<div class="fld-foot"><small class="fe" aria-live="polite"></small></div></div>';
        }).join('');
        return '<div class="rep"><div class="rep-g">' + fields + '</div>' +
          '<div class="rep-side">' +
            '<button type="button" class="rep-x" data-del="' + k + '" data-i="' + i + '" aria-label="মুছুন · Remove">×</button>' +
          '</div></div>';
      }).join('');
    });
    setPlaceholders();
  }

  function syncForm() {
    document.querySelectorAll('[data-k]').forEach(function (el) {
      el.value = S[el.getAttribute('data-k')] || '';
    });
    document.querySelectorAll('[data-shape]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-shape') === S.shape ? 'true' : 'false');
    });
    renderThemes();
    syncThemeUI();
    renderLists();
    $('photo').value = '';
    $('photoErr').innerHTML = '';
  }

  function renderAll() {
    paint($('sheet'), S.tpl);
    renderCard();
    syncThemeUI();
    paintStage();
    var r = validateAll();
    updateWarn(r.bad);
    fitAll();
    save();
  }

  /* ---------- গ্যালারি ---------- */
  var GAL = { open: false, i: 0 };

  function buildStage() {
    $('galStage').innerHTML = TPLS.map(function (t, i) {
      return '<div class="gs" data-gi="' + i + '">' +
        '<span class="gs-badge" hidden><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg><span class="t">বর্তমানে ব্যবহৃত|In use</span></span>' +
        '<span class="pv-box" data-fit><span class="cvs"></span></span></div>';
    }).join('');
    paintStage();
  }
  function paintStage() {
    if (!GAL.open) return;
    $('galStage').querySelectorAll('.gs').forEach(function (el, i) {
      paint(el.querySelector('.cvs'), TPLS[i].v);
    });
    layoutStage();
  }
  function layoutStage() {
    var st = $('galStage'), w = st.clientWidth, cur = tplIndex(S.tpl);
    var cw = Math.min(300, Math.max(170, w * 0.62)), gap = cw * 0.8;
    st.querySelectorAll('.gs').forEach(function (el, i) {
      var d = i - GAL.i, a = Math.abs(d);
      el.style.width = cw + 'px';
      el.style.transform = 'translate(-50%,-50%) translateX(' + (d * gap) + 'px) scale(' + (d === 0 ? 1 : 0.84) + ')';
      el.style.opacity = a > 1 ? '0' : (d === 0 ? '1' : '0.5');
      el.style.zIndex = String(10 - a);
      el.style.pointerEvents = a > 1 ? 'none' : 'auto';
      el.classList.toggle('act', d === 0);
      var b = el.querySelector('.gs-badge');
      if (b) b.hidden = (i !== cur);
    });
    $('galPrev').disabled = GAL.i === 0;
    $('galNext').disabled = GAL.i === TPLS.length - 1;
    fitAll();
  }
  function renderGalInfo() {
    var t = TPLS[GAL.i];
    $('galCount').textContent = bnDigits(GAL.i + 1) + ' / ' + bnDigits(TPLS.length);
    $('galInfo').innerHTML = '<b class="t">' + t.bn + '|' + t.en + '</b><span class="t">' + t.d + '</span>';
    $('galDots').innerHTML = TPLS.map(function (x, i) {
      return '<button type="button" class="gal-dot' + (i === GAL.i ? ' on' : '') + '" data-gi="' + i + '" aria-label="' + (i + 1) + '"></button>';
    }).join('');
  }
  /* শেষ/প্রথম টেমপ্লেটে আটকে থাকে, ঘুরে আসে না */
  function goGal(i) {
    GAL.i = Math.max(0, Math.min(TPLS.length - 1, i));
    renderGalInfo();
    layoutStage();
  }
  function openGal() {
    GAL.open = true;
    GAL.i = tplIndex(S.tpl);
    $('gal').hidden = false;
    document.body.classList.add('gal-open');
    buildStage();
    renderGalInfo();
    layoutStage();
    $('galX').focus();
  }
  function closeGal() {
    GAL.open = false;
    $('gal').hidden = true;
    document.body.classList.remove('gal-open');
    renderCard();
    fitAll();
    $('openGal').focus();
  }
  function pickGal() {
    S.tpl = TPLS[GAL.i].v;
    closeGal();
    renderAll();
  }

  /* ---------- ছবি ---------- */
  function cropPhoto(file) {
    return createImageBitmap(file).then(function (b) {
      var c = document.createElement('canvas'), m = Math.min(b.width, b.height);
      c.width = c.height = 360;
      c.getContext('2d').drawImage(b, (b.width - m) / 2, (b.height - m) / 2, m, m, 0, 0, 360, 360);
      return c.toDataURL('image/jpeg', 0.9);
    });
  }
  function handlePhoto(input) {
    var f = input.files && input.files[0], err = $('photoErr');
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      err.innerHTML = '<span class="t">শুধু ছবি ফাইল দিন (JPG, PNG)|Please choose an image file (JPG, PNG)</span>';
      input.value = '';
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      err.innerHTML = '<span class="t">ছবি ৩ এমবি-র ছোট হতে হবে|Image must be under 3 MB</span>';
      input.value = '';
      return;
    }
    err.innerHTML = '';
    cropPhoto(f).then(function (d) {
      S.photo = d;
      renderAll();
    }).catch(function () {
      err.innerHTML = '<span class="t">ছবিটি পড়া যায়নি|Could not read this image</span>';
    });
  }

  /* ---------- অ্যাকশন ---------- */
  function untouchAll() {
    document.querySelectorAll('[data-touched]').forEach(function (el) { el.removeAttribute('data-touched'); });
  }
  function applySample() {
    var keep = { tpl: S.tpl, th: S.th, pc: S.pc, ac: S.ac, font: S.font, shape: S.shape };
    S = clone(DEF);
    Object.keys(keep).forEach(function (k) { S[k] = keep[k]; });
    S.lang = 'en';
    untouchAll();
    syncForm();
    renderAll();
  }
  function clearAll() {
    if (!window.confirm('সব তথ্য মুছবেন?  ·  Clear all details?')) return;
    var keep = { tpl: S.tpl, th: S.th, pc: S.pc, ac: S.ac, font: S.font, lang: S.lang, shape: S.shape };
    S = clone(BLANK);
    Object.keys(keep).forEach(function (k) { S[k] = keep[k]; });
    untouchAll();
    syncForm();
    renderAll();
  }
  function resetAll() {
    if (!window.confirm('সব সেটিংস ও তথ্য রিসেট হবে?  ·  Reset everything?')) return;
    S = clone(DEF);
    untouchAll();
    syncForm();
    renderAll();
  }

  /* ---------- PDF ডাউনলোড (সরাসরি, পেজ স্টুডিওর মতো) ---------- */
  var BUSY = false;

  function setBtn(btn, text) { btn.innerHTML = '<span class="t">' + text + '</span>'; }

  function pdfName() {
    var nm = trim(S.name).replace(/[\\\/:*?"<>|]+/g, '').replace(/\s+/g, '_');
    return (nm || 'CV') + '_CV.pdf';
  }

  function saveBlob(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 60000);
  }

  /* A4 উচ্চতায় ভাগ করে পেজ বানায় (লম্বা সিভির জন্য) */
  function slicePages(cv) {
    var pageH = Math.round(cv.width * 297 / 210), items = [], y = 0;
    do {
      var h = Math.min(pageH, cv.height - y);
      var c = document.createElement('canvas');
      c.width = cv.width; c.height = pageH;
      var g = c.getContext('2d');
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height);
      g.drawImage(cv, 0, y, cv.width, h, 0, 0, cv.width, h);
      items.push({ d: c.toDataURL('image/jpeg', 0.92), w: c.width, h: c.height });
      y += pageH;
    } while (y < cv.height);
    return items;
  }

  function jpegPdfN(items){
var parts=[],off=0,xr=[],n=items.length,i;
function put(x){if(typeof x==='string'){var u=new Uint8Array(x.length);for(var k=0;k<x.length;k++)u[k]=x.charCodeAt(k)&255;x=u}parts.push(x);off+=x.length}
function obj(k,body){xr[k]=off;put(k+' 0 obj\n'+body+'\nendobj\n')}
var PW='595.28',PH='841.89';
put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
obj(2,'<< /Type /Pages /Kids ['+items.map(function(_,j){return (3+3*j)+' 0 R'}).join(' ')+'] /Count '+n+' >>');
items.forEach(function(it,j){
var pg=3+3*j,im=pg+1,ct=pg+2,bin=atob(it.d.split(',')[1]),img=new Uint8Array(bin.length),q;
for(q=0;q<bin.length;q++)img[q]=bin.charCodeAt(q);
obj(pg,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PW+' '+PH+'] /Resources << /XObject << /Im'+j+' '+im+' 0 R >> >> /Contents '+ct+' 0 R >>');
xr[im]=off;put(im+' 0 obj\n<< /Type /XObject /Subtype /Image /Width '+it.w+' /Height '+it.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+img.length+' >>\nstream\n');put(img);put('\nendstream\nendobj\n');
var cs='q '+PW+' 0 0 '+PH+' 0 0 cm /Im'+j+' Do Q';
obj(ct,'<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream');
});
var tot=3+3*n,xo=off,pd=function(k){return ('0000000000'+k).slice(-10)};
var s='xref\n0 '+tot+'\n0000000000 65535 f \n';for(i=1;i<tot;i++)s+=pd(xr[i])+' 00000 n \n';
put(s+'trailer\n<< /Size '+tot+' /Root 1 0 R >>\nstartxref\n'+xo+'\n%%EOF');
return new Blob(parts,{type:'application/pdf'});
}

  function downloadPdf() {
    if (BUSY) return;
    var r = validateAll(true);
    updateWarn(r.bad);
    if (r.bad) {
      flash('প্রথমে লাল ঘরগুলো ঠিক করুন|Please fix the highlighted fields first');
      if (r.first) { r.first.focus(); r.first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      return;
    }
    if (!window.htmlToImage) {
      flash('ডাউনলোড লাইব্রেরি লোড হয়নি, পেজ রিফ্রেশ করুন|Download library did not load, please refresh');
      return;
    }

    BUSY = true;
    var btn = $('pdf');
    btn.disabled = true;
    setBtn(btn, 'PDF তৈরি হচ্ছে…|Preparing PDF…');

    var host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#fff;';
    var node = $('sheet').cloneNode(true);
    node.removeAttribute('id');
    node.style.transform = 'none';
    node.style.width = '794px';
    host.appendChild(node);
    document.body.appendChild(host);

    var opt = { pixelRatio: 2, backgroundColor: '#ffffff', width: 794, height: Math.max(1123, node.offsetHeight) };
    var p = window.htmlToImage.toCanvas(node, opt);
    if (SAF) p = p.then(function () { return window.htmlToImage.toCanvas(node, opt); }); // Safari-র প্রথম ফাঁকা ছবি

    p.then(function (cv) {
      saveBlob(jpegPdfN(slicePages(cv)), pdfName());
    }).catch(function () {
      flash('PDF বানানো যায়নি, আবার চেষ্টা করুন|Could not create the PDF, please try again');
    }).then(function () {
      host.remove();
      BUSY = false;
      btn.disabled = false;
      setBtn(btn, 'PDF ডাউনলোড|Download PDF');
    });
  }

  /* ---------- মোবাইল প্রিভিউ ---------- */
  function setPreview(open) {
    var pv = $('pv'), fab = $('pvFab');
    pv.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { fitAll(); pv.scrollTop = 0; }
  }

  /* ---------- ইভেন্ট ---------- */
  function onField(e) {
    var t = e.target;
    if (!t || !t.hasAttribute) return;
    if (t.hasAttribute('data-k') || t.hasAttribute('data-f')) t.setAttribute('data-touched', '1');

    if (t.hasAttribute('data-list')) {
      var list = t.getAttribute('data-list'), idx = +t.getAttribute('data-i');
      if (S[list] && S[list][idx]) S[list][idx][t.getAttribute('data-f')] = t.value;
      renderAll();
      return;
    }
    if (t.hasAttribute('data-k')) {
      S[t.getAttribute('data-k')] = t.value;
      renderAll();
      return;
    }
    if (t.hasAttribute('data-col')) {
      S[t.getAttribute('data-col') === 'p' ? 'pc' : 'ac'] = t.value;
      renderAll();
      return;
    }
    if (t.id === 'sumPick') {
      var v = t.value;
      t.value = '';
      if (v === '') return;
      S.summary = SUMS[+v][S.lang === 'bn' ? 1 : 0];
      syncForm();
      renderAll();
      return;
    }
    if (t.id === 'photo') handlePhoto(t);
  }
  document.addEventListener('input', onField);
  document.addEventListener('change', onField);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;

    if (t.closest('#openGal')) { openGal(); return; }
    if (t.closest('#galX')) { closeGal(); return; }
    if (t.closest('#galPrev')) { goGal(GAL.i - 1); return; }
    if (t.closest('#galNext')) { goGal(GAL.i + 1); return; }
    if (t.closest('#galPick')) { pickGal(); return; }
    var gi = t.closest('[data-gi]');
    if (gi) { goGal(+gi.getAttribute('data-gi')); return; }

    var tpl = t.closest('[data-tpl]');
    if (tpl) { S.tpl = tpl.getAttribute('data-tpl'); renderAll(); return; }

    var th = t.closest('[data-th]');
    if (th) { S.th = th.getAttribute('data-th'); S.pc = ''; S.ac = ''; renderAll(); return; }

    var sh = t.closest('[data-shape]');
    if (sh) { S.shape = sh.getAttribute('data-shape'); syncForm(); renderAll(); return; }

    var add = t.closest('[data-add]');
    if (add) { S[add.getAttribute('data-add')].push({ t: '', s: '', p: '', d: '' }); renderLists(); renderAll(); return; }

    var del = t.closest('[data-del]');
    if (del) {
      S[del.getAttribute('data-del')].splice(+del.getAttribute('data-i'), 1);
      renderLists(); renderAll(); return;
    }

    if (t.closest('#photoRm')) { S.photo = ''; $('photo').value = ''; $('photoErr').innerHTML = ''; renderAll(); return; }
    if (t.closest('#sample')) { applySample(); return; }
    if (t.closest('#clear')) { clearAll(); return; }
    if (t.closest('#reset')) { resetAll(); return; }
    if (t.closest('#pdf')) { downloadPdf(); return; }
    if (t.closest('#pvFab')) { setPreview(true); return; }
    if (t.closest('#pvClose')) { setPreview(false); return; }
  });

  /* গ্যালারি: কীবোর্ড ও সোয়াইপ */
  document.addEventListener('keydown', function (e) {
    if (!GAL.open) return;
    if (e.key === 'Escape') closeGal();
    else if (e.key === 'ArrowLeft') goGal(GAL.i - 1);
    else if (e.key === 'ArrowRight') goGal(GAL.i + 1);
  });
  var sx = null, stage = $('galStage');
  stage.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  stage.addEventListener('pointerup', function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx;
    sx = null;
    if (Math.abs(dx) > 40) goGal(GAL.i + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', function () { sx = null; });

  /* ---------- ভাষা ও placeholder ---------- */
  function setPlaceholders() {
    document.querySelectorAll('[data-title]').forEach(function (el) {
      var q = el.getAttribute('data-title').split('~');
      el.title = isEn() ? q[1] : q[0];
    });
    document.querySelectorAll('[data-ph]').forEach(function (el) {
      var q = el.getAttribute('data-ph').split('~');
      el.placeholder = isEn() ? q[1] : q[0];
    });
  }
  window.onLang = function () { setPlaceholders(); };

  /* ---------- init ---------- */
  load();
  document.documentElement.classList.add('js');
  renderThemes();
  syncForm();
  renderAll();
  setPlaceholders();

  window.addEventListener('resize', function () { if (GAL.open) layoutStage(); fitAll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);

  /* স্ক্রল-রিভিল: কার্ড নিচ থেকে উঠে আসে */
  var cards = document.querySelectorAll('.ctl > .card');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    cards.forEach(function (c) { c.classList.add('rv'); io.observe(c); });
  } else {
    cards.forEach(function (c) { c.classList.add('in'); });
  }
})();
