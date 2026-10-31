/* cv.js — CV Studio
 * State → A4 sheet rendering, gallery thumbnails, repeaters, photo crop,
 * localStorage autosave and print-to-PDF. Bilingual UI uses dcu-lang.js
 * ("বাংলা|English" inside .t elements).
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'cv-studio-v1';
  var W = 794;                       // A4 width in CSS px at 96dpi

  /* ---------- static data ---------- */
  var THEMES = {
    navy:   { n: 'Navy & Gold', bn: 'নেভি ও সোনালি', p: '#0b1f3a', a: '#c9a227' },
    teal:   { n: 'Teal',        bn: 'টিল',           p: '#0f4c5c', a: '#2a9d8f' },
    maroon: { n: 'Maroon',      bn: 'ম্যারুন',       p: '#6b1d2a', a: '#d4a373' },
    forest: { n: 'Forest',      bn: 'সবুজ',          p: '#1f4d3a', a: '#8ab17d' },
    slate:  { n: 'Slate',       bn: 'স্লেট',         p: '#334155', a: '#38bdf8' },
    indigo: { n: 'Indigo',      bn: 'ইন্ডিগো',       p: '#312e81', a: '#f472b6' }
  };

  var TPLS = [
    { v: 'classic',  en: 'Classic',        bn: 'ক্লাসিক' },
    { v: 'sidebar',  en: 'Modern sidebar', bn: 'মডার্ন সাইডবার' },
    { v: 'elegant',  en: 'Elegant',        bn: 'এলিগ্যান্ট' },
    { v: 'minimal',  en: 'Minimal',        bn: 'মিনিমাল' },
    { v: 'banner',   en: 'Bold banner',    bn: 'বোল্ড ব্যানার' },
    { v: 'timeline', en: 'Timeline',       bn: 'টাইমলাইন' }
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

  /* repeater সংজ্ঞা: [field, label, isTextarea] */
  var REP = {
    exp:  { add: 'অভিজ্ঞতা যোগ|Add experience', f: [
      ['t', 'পদবি|Role / position', 0, 'যেমন: Research Assistant~e.g. Research Assistant'],
      ['s', 'প্রতিষ্ঠান|Organisation', 0, 'যেমন: ABC Research Institute~e.g. ABC Research Institute'],
      ['p', 'সময়কাল|Period', 0, 'যেমন: জুন ২০২৫ – আগস্ট ২০২৫~e.g. Jun 2025 – Aug 2025'],
      ['d', 'কাজের বিবরণ (প্রতি লাইনে একটি)|Details (one point per line)', 1, 'যেমন: জরিপের তথ্য বিশ্লেষণ করেছি~e.g. Analysed survey data']] },
    edu:  { add: 'শিক্ষা যোগ|Add education', f: [
      ['t', 'ডিগ্রি / পরীক্ষা|Degree / exam', 0, 'যেমন: BSS (Honours) in Economics~e.g. BSS (Honours) in Economics'],
      ['s', 'প্রতিষ্ঠান|Institution', 0, 'যেমন: Dhaka University~e.g. Dhaka University'],
      ['p', 'সময়কাল|Period', 0, 'যেমন: ২০২২ – ২০২৬~e.g. 2022 – 2026'],
      ['d', 'ফলাফল / বিবরণ|Result / details', 1, 'যেমন: CGPA 3.50~e.g. CGPA 3.50']] },
    proj: { add: 'প্রজেক্ট যোগ|Add project', f: [
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

  var BLANK = {
    tpl: 'classic', th: 'navy', pc: '', ac: '', font: 'serif', lang: 'en',
    name: '', title: '', email: '', phone: '', address: '', links: '', photo: '',
    summary: '', skills: '', langs: '', ach: '', refs: '',
    exp: [], edu: [], proj: []
  };

  var SAMPLE = {
    name: 'Md. Rahim Uddin',
    title: 'Economics Graduate | Data Analysis & Research',
    email: 'rahim@example.com', phone: '+880 1XXX-XXXXXX', address: 'Dhaka, Bangladesh',
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
  /* প্রথমবার ও রিসেটে নমুনা তথ্য থাকে; ব্যবহারকারীর পরিবর্তন সেভ হয় */
  var DEF = Object.assign(clone(BLANK), clone(SAMPLE));

  /* ---------- helpers ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function trim(x) { return String(x == null ? '' : x).trim(); }
  function lines(s) { return String(s || '').split('\n').map(trim).filter(Boolean); }
  function isEn() { return document.documentElement.getAttribute('data-lang') === 'en'; }

  var S = clone(DEF);

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && typeof v === 'object') {
        Object.keys(DEF).forEach(function (k) {
          if (v[k] !== undefined && v[k] !== null) S[k] = v[k];
        });
      }
    } catch (e) { /* storage blocked — কাজ চলবে, শুধু সংরক্ষণ হবে না */ }
    ['exp', 'edu', 'proj'].forEach(function (k) { if (!Array.isArray(S[k])) S[k] = []; });
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }

  function colors() {
    var t = THEMES[S.th] || THEMES.navy;
    return { p: S.pc || t.p, a: S.ac || t.a };
  }

  /* ---------- sheet HTML ---------- */
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
    var nm = esc(trim(d.name) || L.nameFb), jt = esc(trim(d.title));
    var contact = [d.email, d.phone, d.address].concat(lines(d.links)).map(trim).filter(Boolean);
    var ph = d.photo ? '<img class="ph" src="' + d.photo + '" alt="">' : '';

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

  /* scale every [data-fit] box to its width (main preview + gallery thumbs) */
  function fitAll() {
    document.querySelectorAll('[data-fit]').forEach(function (box) {
      var s = box.firstElementChild, bw = box.clientWidth;
      if (!s || !bw) return;
      var k = bw / W;
      s.style.transform = 'scale(' + k + ')';
      box.style.height = Math.ceil(s.offsetHeight * k) + 'px';
    });
  }

  /* ---------- UI builders ---------- */
  function renderGallery() {
    var g = $('tplGrid');
    g.innerHTML = TPLS.map(function (t) {
      var on = S.tpl === t.v;
      return '<button type="button" class="tt' + (on ? ' on' : '') + '" data-tpl="' + t.v + '" role="radio" aria-checked="' + on + '">' +
             '<span class="pv-box" data-fit><span class="cvs"></span></span>' +
             '<span class="t">' + t.bn + '|' + t.en + '</span></button>';
    }).join('');
    g.querySelectorAll('.tt').forEach(function (btn, i) {
      paint(btn.querySelector('.cvs'), TPLS[i].v);
    });
  }

  function renderThemes() {
    $('themes').innerHTML = Object.keys(THEMES).map(function (k) {
      var t = THEMES[k];
      return '<button type="button" class="sw" data-th="' + k + '" aria-pressed="false">' +
             '<i class="sw-c" style="background:linear-gradient(135deg,' + t.p + ' 50%,' + t.a + ' 50%)"></i>' +
             '<span class="t">' + t.bn + '|' + t.n + '</span></button>';
    }).join('');
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

  function renderLists() {
    Object.keys(REP).forEach(function (k) {
      var box = $('list-' + k), items = S[k], def = REP[k];
      if (!items.length) {
        box.innerHTML = '<p class="empty t">এখনো কিছু যোগ করা হয়নি|Nothing added yet</p>';
        return;
      }
      box.innerHTML = items.map(function (it, i) {
        var fields = def.f.map(function (f) {
          var key = f[0], ta = f[2];
          var attrs = ' data-list="' + k + '" data-i="' + i + '" data-f="' + key + '"';
          var val = esc(it[key] || '');
          var ph = ' data-ph="' + esc(f[3] || '') + '"';
          return '<label class="' + (ta ? 'wide' : '') + '"><span class="t">' + f[1] + '</span>' +
                 (ta ? '<textarea rows="2"' + attrs + ph + '>' + val + '</textarea>'
                     : '<input type="text"' + attrs + ph + ' value="' + val + '">') + '</label>';
        }).join('');
        return '<div class="rep"><div class="rep-g">' + fields + '</div>' +
               '<button type="button" class="rep-x" data-del="' + k + '" data-i="' + i + '" aria-label="Remove · মুছুন">×</button></div>';
      }).join('');
    });
    setPlaceholders();
  }

  function syncForm() {
    document.querySelectorAll('[data-k]').forEach(function (el) {
      el.value = S[el.getAttribute('data-k')] || '';
    });
    renderThemes();
    syncThemeUI();
    renderLists();
    $('photo').value = '';
  }

  function warn() {
    var m = [];
    if (!trim(S.name)) m.push('নাম লিখুন|Enter your name');
    if (trim(S.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trim(S.email))) m.push('ইমেইল ঠিক নেই|Email looks invalid');
    var w = $('warn');
    w.innerHTML = m.length ? '<span class="t">' + m.join(' · ') + '</span>' : '';
    w.hidden = !m.length;
  }

  function renderAll() {
    paint($('sheet'), S.tpl);
    renderGallery();
    syncThemeUI();
    warn();
    fitAll();
    save();
  }

  /* ---------- actions ---------- */
  function clearPhotoFile() { try { $('photo').value = ''; } catch (e) { /* ignore */ } }

  function cropPhoto(file) {
    return createImageBitmap(file).then(function (b) {
      var c = document.createElement('canvas'), m = Math.min(b.width, b.height);
      c.width = c.height = 360;
      c.getContext('2d').drawImage(b, (b.width - m) / 2, (b.height - m) / 2, m, m, 0, 0, 360, 360);
      return c.toDataURL('image/jpeg', 0.9);
    });
  }

  function applySample() {
    var keep = { tpl: S.tpl, th: S.th, pc: S.pc, ac: S.ac, font: S.font, photo: S.photo };
    S = clone(DEF);
    Object.keys(keep).forEach(function (k) { S[k] = keep[k]; });
    S.lang = 'en';
    syncForm();
    renderAll();
  }

  function clearAll() {
    if (!window.confirm('সিভির সব তথ্য মুছবেন?  ·  Clear all CV details?')) return;
    var keep = { tpl: S.tpl, th: S.th, pc: S.pc, ac: S.ac, font: S.font, lang: S.lang };
    S = clone(BLANK);
    Object.keys(keep).forEach(function (k) { S[k] = keep[k]; });
    syncForm();
    renderAll();
  }

  function resetAll() {
    if (!window.confirm('সব সেটিংস ও তথ্য রিসেট হবে?  ·  Reset everything?')) return;
    S = clone(DEF);
    syncForm();
    renderAll();
  }

  /* ---------- events ---------- */
  document.addEventListener('input', onField);
  document.addEventListener('change', onField);

  function onField(e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-list')) {
      var list = t.getAttribute('data-list'), i = +t.getAttribute('data-i');
      if (S[list] && S[list][i]) S[list][i][t.getAttribute('data-f')] = t.value;
      renderAll();
      return;
    }
    if (t.hasAttribute && t.hasAttribute('data-k')) {
      S[t.getAttribute('data-k')] = t.value;
      if (t.getAttribute('data-k') === 'lang') { renderLists(); }
      renderAll();
      return;
    }
    if (t.hasAttribute && t.hasAttribute('data-col')) {
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
    if (t.id === 'photo') {
      var f = t.files && t.files[0];
      if (!f) return;
      cropPhoto(f).then(function (d) {
        S.photo = d;
        renderAll();
      }).catch(function () {
        clearPhotoFile();
        var w = $('warn');
        w.innerHTML = '<span class="t">ছবিটি পড়া যায়নি|Could not read this image</span>';
        w.hidden = false;
      });
    }
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var tpl = t.closest && t.closest('[data-tpl]');
    if (tpl) { S.tpl = tpl.getAttribute('data-tpl'); renderAll(); return; }

    var th = t.closest && t.closest('[data-th]');
    if (th) {
      S.th = th.getAttribute('data-th');
      S.pc = ''; S.ac = '';
      renderAll();
      return;
    }

    var add = t.closest && t.closest('[data-add]');
    if (add) {
      var ak = add.getAttribute('data-add');
      S[ak].push({ t: '', s: '', p: '', d: '' });
      renderLists();
      renderAll();
      return;
    }

    var del = t.closest && t.closest('[data-del]');
    if (del) {
      var dk = del.getAttribute('data-del'), di = +del.getAttribute('data-i');
      S[dk].splice(di, 1);
      renderLists();
      renderAll();
      return;
    }

    if (t.closest && t.closest('#photoRm')) {
      S.photo = '';
      clearPhotoFile();
      renderAll();
      return;
    }
    if (t.closest && t.closest('#sample')) { applySample(); return; }
    if (t.closest && t.closest('#clear')) { clearAll(); return; }
    if (t.closest && t.closest('#reset')) { resetAll(); return; }
    if (t.closest && t.closest('#pdf')) { printPdf(); return; }
    if (t.closest && t.closest('#pvFab')) { setPreview(true); return; }
    if (t.closest && t.closest('#pvClose')) { setPreview(false); return; }
  });

  /* মোবাইলে লাইভ প্রিভিউ (পূর্ণ স্ক্রিন) */
  function setPreview(open) {
    var pv = $('pv'), fab = $('pvFab');
    pv.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { fitAll(); pv.scrollTop = 0; }
  }

  /* print → Save as PDF; গুরুত্বপূর্ণ: শুধু A4 শিট ছাপা হয় (CSS @media print) */
  var titleBefore = null;
  function printPdf() {
    titleBefore = document.title;
    var nm = trim(S.name);
    document.title = nm ? nm.replace(/\s+/g, '_') + '_CV' : 'CV';
    window.addEventListener('afterprint', function restore() {
      document.title = titleBefore;
      window.removeEventListener('afterprint', restore);
    });
    window.print();
  }

  /* ---------- language + placeholders ---------- */
  function setPlaceholders() {
    document.querySelectorAll('[data-ph]').forEach(function (el) {
      var parts = el.getAttribute('data-ph').split('~');
      el.placeholder = isEn() ? parts[1] : parts[0];
    });
  }
  window.onLang = function () { setPlaceholders(); };

  /* ---------- init ---------- */
  load();
  syncForm();
  renderAll();
  setPlaceholders();

  window.addEventListener('resize', fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  /* ---------- scroll reveal (অ্যানিমেশন) ---------- */
  document.documentElement.classList.add('js');
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
