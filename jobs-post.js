/* jobs-post.js — জব ও টিউশনের পোস্ট ফর্ম (ধাপ ৪ + ৫)
 *
 * ধাপ ৪: Google লগইন → ধরন বাছাই → ধরন অনুযায়ী ফিল্ড → ঘর যাচাই।
 * ধাপ ৫: যাচাই-পর্দা → স্প্যাম রোধ (honeypot, ন্যূনতম সময়, বিরতি, দিনে ২টির সীমা) → নিয়মে সম্মতি → Firestore-এ জমা।
 *
 * জমা হয় একটি atomic ব্যাচে (Rules-এর শর্ত অনুযায়ী):
 *   jobs_posts/{id}  +  jobs_posts/{id}/private/contact  +  jobs_limits/{uid_YYYYMMDD} (তৈরি বা count+১)
 * status = "pending"; শুধু user_trust.autoApprove == true হলে "approved" (Rules-এর নিয়ম)।
 */
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, collection, getDoc, writeBatch, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const CFG_FB = {
  apiKey: "AIzaSyBgaBKzAAwzHI7ahGKqzbrX9MknWWIm9j0",
  authDomain: "dcu-blood-bank.firebaseapp.com",
  projectId: "dcu-blood-bank",
  storageBucket: "dcu-blood-bank.firebasestorage.app",
  messagingSenderId: "835221249900",
  appId: "1:835221249900:web:facf545941825a4efa5d49"
};
/* ইভেন্ট পেজের মতো ডিফল্ট অ্যাপ, যাতে এক জায়গায় লগইন করলে এখানেও লগইন থাকে */
let app; try { app = getApp(); } catch (e) { app = initializeApp(CFG_FB); }
const auth = getAuth(app);
const db = getFirestore(app);

const D = window.JobsData, LD = window.LibData;
const $ = id => document.getElementById(id);
if (!D || !$("jp-form")) throw new Error("jobs-post: JobsData বা ফর্ম পাওয়া যায়নি");
const LIM = D.LIMITS;
const MIN_FILL_MS = 15000;          // ফর্ম খোলার পর কমপক্ষে এত সময় না গেলে জমা নেয় না
const COOLDOWN_MS = 60 * 1000;      // এক ব্রাউজারে দুই জমার মাঝের বিরতি
const LAST_KEY = "jobs:lastPost";

/* ---------- সহায়ক ---------- */
const lang = () => document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn";
const L = s => { const i = s.indexOf("|"); return i < 0 ? s : (lang() === "en" ? s.slice(i + 1) : s.slice(0, i)); };
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const bi2 = (bn, en) => '<span class="jobs-bn">' + esc(bn) + '</span><span class="jobs-en">' + esc(en) + "</span>";
const bi = s => { const i = s.indexOf("|"); return bi2(s.slice(0, i), s.slice(i + 1)); };
const bnNum = n => Number(n).toLocaleString("bn-BD");
const numL = n => lang() === "bn" ? bnNum(n) : String(n);
const clean = s => String(s || "").replace(/\s+/g, " ").trim();
const reduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const digits = s => String(s || "").replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
const num = v => { v = digits(v).replace(/[,\s৳]/g, ""); return v === "" ? null : (/^\d+$/.test(v) ? parseInt(v, 10) : NaN); };
const PHONE_RE = /^01[3-9][0-9]{8}$/;
function normPhone(v) {
  let d = digits(v).replace(/\D/g, "");
  if (d.length === 13 && d.indexOf("88") === 0) d = d.slice(2);   // +8801… → 01…
  return d;
}

/* ---------- ধরন অনুযায়ী ফিল্ডের নিয়ম ---------- */
const ICONS = {
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  store: '<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 20h20"/>'
};
const svg = (p, n) => '<svg viewBox="0 0 24 24" width="' + n + '" height="' + n + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";

const TYPE = {
  tuition_wanted: {
    areaMax: 1, levels: true, days: true, genderPref: true, mode: "offline", unit: "month", units: ["month", "week", "hour", "negotiable"],
    catsLbl: "কোন বিষয়ে টিউটর চাই|Subjects needed", areasLbl: "এলাকা (একটি)|Area (one)", timeLbl: "পড়ানোর সময়|Preferred time", salaryLbl: "মাসিক বাজেট|Budget",
    titleEx: "যেমন: নবম শ্রেণির জন্য গণিত ও ইংরেজি টিউটর চাই|e.g. Maths and English tutor for a Class 9 student",
    timeEx: "যেমন: বিকেল ৪টা থেকে ৬টা|e.g. 4 pm to 6 pm",
    descEx: "শিক্ষার্থীর অবস্থা, মাধ্যম ও বিশেষ চাহিদা লিখুন। পূর্ণ ঠিকানা বা ফোন নম্বর এখানে লিখবেন না।|Describe the student, medium and any special needs. Do not write a full address or phone number here."
  },
  tutor_profile: {
    areaMax: 5, levels: true, days: true, tutor: true, mode: "offline", unit: "month", units: ["month", "week", "hour", "negotiable"],
    catsLbl: "কোন বিষয় পড়াতে পারেন|Subjects you can teach", areasLbl: "যেসব এলাকায় যেতে পারবেন|Areas you can travel to", timeLbl: "কখন পড়াতে পারবেন|Available time", salaryLbl: "প্রত্যাশিত ফি|Expected fee",
    titleEx: "যেমন: DCU-র শিক্ষার্থী, গণিত ও পদার্থবিজ্ঞান পড়াই|e.g. DCU student, I teach Maths and Physics",
    timeEx: "যেমন: সন্ধ্যা ৬টার পর|e.g. after 6 pm",
    descEx: "অভিজ্ঞতা, পড়ানোর ধরন ও ফলাফল লিখুন। ফোন নম্বর এখানে লিখবেন না।|Write your experience, teaching style and results. Do not write your phone number here."
  },
  parttime: {
    areaMax: 5, days: true, org: true, mode: "offline", unit: "month", units: ["month", "week", "day", "hour", "negotiable"],
    catsLbl: "কাজের ধরন|Kind of work", areasLbl: "কাজের এলাকা|Work area", timeLbl: "কাজের সময়|Working hours", salaryLbl: "বেতন|Pay", orgLbl: "দোকান বা প্রতিষ্ঠানের নাম|Shop or business name",
    titleEx: "যেমন: ক্যাফেতে বিকেলের শিফটে সহকারী লাগবে|e.g. Evening-shift helper needed at a café",
    timeEx: "যেমন: বিকেল ৪টা থেকে রাত ৯টা|e.g. 4 pm to 9 pm",
    descEx: "কাজের বিবরণ, যোগ্যতা ও সুবিধা লিখুন। অগ্রিম টাকা চাইবেন না।|Describe the work, requirements and benefits. Never ask for advance money."
  },
  freelance: {
    areaMax: 5, org: true, mode: "online", unit: "project", units: ["project", "hour", "day", "week", "month", "negotiable"],
    catsLbl: "দক্ষতা|Skills", areasLbl: "এলাকা (দরকার হলে)|Area (if needed)", timeLbl: "সময়সীমা|Deadline or timing", salaryLbl: "পারিশ্রমিক|Pay", orgLbl: "প্রতিষ্ঠান বা ক্লায়েন্টের নাম|Business or client name",
    titleEx: "যেমন: ফেসবুক পেজের জন্য গ্রাফিক ডিজাইনার লাগবে|e.g. Graphic designer needed for a Facebook page",
    timeEx: "যেমন: ৭ দিনের মধ্যে|e.g. within 7 days",
    descEx: "কাজের বিবরণ, কী কী লাগবে ও কীভাবে যোগাযোগ হবে লিখুন। অগ্রিম টাকা চাইবেন না।|Describe the work, deliverables and how to coordinate. Never ask for advance money."
  }
};

/* ---------- অবস্থা ---------- */
const S = {
  user: null, type: "", cats: [], levels: [], areas: [], mode: "", days: 0, unit: "",
  genderPref: "", tutorGender: "", college: "", dept: "", photo: "", tried: false, modeTouched: false, unitTouched: false, shown: false, stage: "edit", formAt: 0, sending: false
};
const cfg = () => TYPE[S.type] || null;

/* ---------- চিপ-গ্রুপ ---------- */
function renderGroup(id, items, sel, max) {
  const el = $(id); if (!el) return;
  const multi = Array.isArray(sel), full = multi && max && sel.length >= max;
  const ae = document.activeElement, keep = ae && el.contains(ae) ? ae.getAttribute("data-v") : null;
  el.innerHTML = items.map(i => {
    const on = multi ? sel.indexOf(i.v) > -1 : sel === i.v;
    return '<button type="button" class="jobs-chip' + (on ? " on" : "") + '" data-v="' + esc(i.v) + '" aria-pressed="' + on + '"' + (full && !on ? ' aria-disabled="true"' : "") + ">" + bi2(i.bn, i.en) + "</button>";
  }).join("");
  if (keep !== null) { const b = el.querySelector('[data-v="' + (window.CSS && CSS.escape ? CSS.escape(keep) : keep) + '"]'); if (b) b.focus(); }
}
function onChip(id, fn) {
  $(id).addEventListener("click", e => {
    const b = e.target.closest(".jobs-chip");
    if (!b || b.getAttribute("aria-disabled") === "true") return;
    fn(b.getAttribute("data-v")); afterChange();
  });
}
function toggle(arr, v, max) { const i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else if (arr.length < max) arr.push(v); }
const items = list => list.map(o => ({ v: o.slug, bn: o.bn, en: o.en }));

/* ---------- আঁকা ---------- */
function renderTypes() {
  $("jp-types").innerHTML = D.types().map(t =>
    '<button type="button" class="jobs-type' + (S.type === t.slug ? " on" : "") + '" data-type="' + t.slug + '" aria-pressed="' + (S.type === t.slug) + '" style="--h:' + t.hue + '">' +
    '<span class="jobs-type-ico">' + svg(ICONS[t.icon] || "", 26) + "</span>" +
    '<span class="jobs-type-txt"><span class="jobs-type-name">' + bi2(t.bn, t.en) + '</span><span class="jobs-type-sub">' + bi2(t.short_bn, t.short_en) + "</span></span>" +
    '<span class="jobs-type-tick" aria-hidden="true">' + svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 16) + "</span></button>").join("");
  const t = D.types().filter(x => x.slug === S.type)[0];
  $("jp-typehelp").textContent = t ? (lang() === "en" ? t.help_en : t.help_bn) : "";
}

function renderAreas() {
  const c = cfg(); if (!c) return;
  const online = S.mode === "online", max = c.areaMax, full = S.areas.length >= max && max > 1;
  const box = $("jp-areabox"), top = box.scrollTop, l = lang();
  box.setAttribute("aria-disabled", online ? "true" : "false");
  box.innerHTML = D.zones().map(z =>
    '<div class="jp-zone"><p class="jp-zone-h">' + esc(z[l]) + '</p><div class="jobs-chips">' +
    D.areas(z.slug).map(a => {
      const on = S.areas.indexOf(a.slug) > -1;
      return '<button type="button" class="jobs-chip' + (on ? " on" : "") + '" data-v="' + a.slug + '" aria-pressed="' + on + '"' + (full && !on ? ' aria-disabled="true"' : "") + (online ? ' tabindex="-1"' : "") + ">" + esc(a[l]) + "</button>";
    }).join("") + "</div></div>").join("");
  box.scrollTop = top;
  $("jp-picked").innerHTML = S.areas.map(s =>
    '<button type="button" class="jobs-chip on" data-v="' + s + '" aria-label="' + esc(L("সরান|Remove") + ": " + D.label("areas", s, l)) + '">' + esc(D.label("areas", s, l)) + " ✕</button>").join("");
  $("jp-areas-n").textContent = online
    ? L("অনলাইনে এলাকা লাগবে না।|No area is needed for online.")
    : (max === 1 ? L("একটি এলাকা বাছুন।|Pick one area.") : L("সর্বোচ্চ ৫টি এলাকা বাছুন।|Pick up to 5 areas.")) + " (" + numL(S.areas.length) + "/" + numL(max) + ")";
}

function renderSelects() {
  const l = lang();
  const row = document.querySelector('.jp-row[data-show="tutor"]');
  if (!LD) { if (row) row.dataset.show = "never"; return; }
  const dl = LD.departments(S.college);
  if (S.dept && !dl.some(d => d.slug === S.dept)) S.dept = "";
  const none = '<option value="">' + esc(L("উল্লেখ করব না|Not specified")) + "</option>";
  $("jp-college").innerHTML = none + LD.colleges().map(c => '<option value="' + esc(c.slug) + '">' + esc(LD.name(c, l)) + "</option>").join("");
  $("jp-dept").innerHTML = none + dl.map(d => '<option value="' + esc(d.slug) + '">' + esc(LD.name(d, l)) + "</option>").join("");
  $("jp-college").value = S.college; $("jp-dept").value = S.dept;
}

function renderGroups() {
  const c = cfg(); if (!c) return;
  renderGroup("jp-cats", items(D.cats(S.type)), S.cats, LIM.maxCats);
  if (c.levels) renderGroup("jp-levels", items(D.levels()), S.levels, LIM.maxLevels);
  renderGroup("jp-modes", items(D.modes()), S.mode);
  renderGroup("jp-days", D.DAYS.map(n => ({ v: String(n), bn: n ? bnNum(n) + " দিন" : "উল্লেখ নেই", en: n ? n + (n === 1 ? " day" : " days") : "Not set" })), String(S.days));
  renderGroup("jp-units", items(D.salaryUnits().filter(u => c.units.indexOf(u.slug) > -1)), S.unit);
  if (c.genderPref) renderGroup("jp-genderpref", items(D.genders()), S.genderPref);
  if (c.tutor) renderGroup("jp-tutorgender", items(D.genders()).map(g => g.v === "" ? { v: "", bn: "উল্লেখ করব না", en: "Prefer not to say" } : g), S.tutorGender);
  renderAreas();
  const neg = S.unit === "negotiable";
  $("jp-amounts").hidden = neg;
}

function renderLabels() {
  const c = cfg(); if (!c) return;
  document.querySelectorAll("[data-show]").forEach(el => { el.hidden = !c[el.getAttribute("data-show")]; });
  document.querySelectorAll(".jp-dyn").forEach(el => { el.innerHTML = bi(c[el.getAttribute("data-k")] || ""); });
  $("jp-cats-lbl").innerHTML = bi(c.catsLbl); $("jp-areas-lbl").innerHTML = bi(c.areasLbl);
  $("jp-title").placeholder = L(c.titleEx); $("jp-time").placeholder = L(c.timeEx); $("jp-desc").placeholder = L(c.descEx);
  counters();
}
function counters() {
  $("jp-title-n").textContent = numL($("jp-title").value.length) + "/" + numL(LIM.title[1]);
  $("jp-desc-n").textContent = numL($("jp-desc").value.length) + "/" + numL(LIM.desc[1]);
}

function sync() {
  const cur = S.stage === "done" ? 4 : S.stage === "review" ? 3 : !S.user ? 0 : !S.type ? 1 : 2;
  document.querySelectorAll("#jp-steps li").forEach((li, i) => {
    li.classList.toggle("done", i < cur); li.classList.toggle("cur", i === cur);
    if (i === cur) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
  });
}
function renderAll() { renderTypes(); renderSelects(); renderLabels(); renderGroups(); sync(); }
function afterChange() { renderGroups(); if (S.tried) validate(false); }

/* ---------- ধরন বদল ---------- */
function setType(t) {
  if (!TYPE[t] || t === S.type) return;
  S.type = t; const c = TYPE[t];
  S.cats = [];                                   // তালিকা আলাদা (বিষয়/কাজ/দক্ষতা), তাই মুছে যায়
  if (!c.levels) S.levels = [];                  // শ্রেণি দুই টিউশন-ধরনে ভাগ হয়
  if (!S.modeTouched) S.mode = c.mode;
  if (!S.unitTouched || c.units.indexOf(S.unit) < 0) S.unit = c.unit;
  if (S.mode === "online") S.areas = [];
  if (S.areas.length > c.areaMax) S.areas = S.areas.slice(0, c.areaMax);
  if (!c.days) S.days = 0;
  if (!c.genderPref) S.genderPref = "";
  if (!c.tutor) { S.tutorGender = ""; S.college = ""; S.dept = ""; setPhoto(""); }
  $("jp-details").hidden = false;
  renderAll();
  if (!S.shown) {
    S.shown = true;
    S.formAt = Date.now();
    $("jp-details").scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
    $("jp-h-det").focus({ preventScroll: true });
  }
  if (S.tried) validate(false);
}

/* ---------- ছবি (শুধু টিউটর প্রোফাইল) ---------- */
function setPhoto(url) {
  S.photo = url || "";
  const img = $("jp-photo-img");
  img.hidden = !S.photo; if (S.photo) img.src = S.photo; else img.removeAttribute("src");
  $("jp-photo-x").hidden = !S.photo;
}
async function compress(file) {
  const bmp = await createImageBitmap(file);
  const c = document.createElement("canvas"), g = c.getContext("2d");
  const side = Math.min(bmp.width, bmp.height), sx = (bmp.width - side) / 2, sy = (bmp.height - side) / 2;
  for (const [px, q] of [[240, 0.8], [200, 0.7], [160, 0.6], [128, 0.5]]) {
    c.width = c.height = px; g.drawImage(bmp, sx, sy, side, side, 0, 0, px, px);
    const url = c.toDataURL("image/jpeg", q);
    if (url.length <= LIM.photoMaxChars) return url;
  }
  return "";
}

/* ---------- যাচাই (Rules-এর সঙ্গে মেলানো) ---------- */
const ERR = {
  title: ["শিরোনাম কমপক্ষে ৫ অক্ষরের হতে হবে।|The title needs at least 5 characters."],
  cats: ["কমপক্ষে একটি বাছুন।|Pick at least one."],
  levels: ["কমপক্ষে একটি শ্রেণি বাছুন।|Pick at least one class level."],
  areas: ["কমপক্ষে একটি এলাকা বাছুন, নয়তো “অনলাইন” বাছুন।|Pick at least one area, or choose “Online”."],
  salary: ["টাকার অঙ্ক সঠিক নয় (০ থেকে ১০,০০,০০০)।|The amount is not valid (0 to 1,000,000).", "“থেকে” অঙ্ক “পর্যন্ত”-এর বেশি হতে পারে না।|“From” cannot be more than “To”."],
  name: ["নাম লিখুন।|Enter your name."],
  phone: ["সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন 017XXXXXXXX)।|Enter a valid Bangladeshi mobile number (e.g. 017XXXXXXXX)."],
  wa: ["WhatsApp নম্বরটি সঠিক নয়।|The WhatsApp number is not valid."]
};
const FIELDS = {
  title: { err: "jp-title-e", focus: () => $("jp-title"), mark: ["jp-title"] },
  cats: { err: "jp-cats-e", focus: () => $("jp-cats").querySelector("button") },
  levels: { err: "jp-levels-e", focus: () => $("jp-levels").querySelector("button") },
  areas: { err: "jp-areas-e", focus: () => $("jp-areabox").querySelector("button") },
  salary: { err: "jp-salary-e", focus: () => $("jp-smin"), mark: ["jp-smin", "jp-smax"] },
  name: { err: "jp-name-e", focus: () => $("jp-name"), mark: ["jp-name"] },
  phone: { err: "jp-phone-e", focus: () => $("jp-phone"), mark: ["jp-phone"] },
  wa: { err: "jp-wa-e", focus: () => $("jp-wa"), mark: ["jp-wa"] }
};
function setErr(key, idx) {
  const f = FIELDS[key], p = $(f.err), bad = idx != null;
  p.hidden = !bad; p.textContent = bad ? L(ERR[key][idx]) : "";
  (f.mark || []).forEach(id => { if (bad) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid"); });
}
function validate(focus) {
  const c = cfg(), bad = {};
  if (!c) return [];
  const online = S.mode === "online";
  if (clean($("jp-title").value).length < LIM.title[0]) bad.title = 0;
  if (S.cats.length < 1) bad.cats = 0;
  if (c.levels && S.levels.length < 1) bad.levels = 0;
  if (!online && S.areas.length < 1) bad.areas = 0;
  const lo = num($("jp-smin").value), hi = num($("jp-smax").value);
  if (S.unit !== "negotiable") {
    if ((lo !== null && (isNaN(lo) || lo > LIM.maxSalary)) || (hi !== null && (isNaN(hi) || hi > LIM.maxSalary))) bad.salary = 0;
    else if (lo !== null && hi !== null && lo > hi) bad.salary = 1;
  }
  if (!clean($("jp-name").value)) bad.name = 0;
  if (!PHONE_RE.test(normPhone($("jp-phone").value))) bad.phone = 0;
  const wa = $("jp-wa-same").checked ? "" : normPhone($("jp-wa").value);
  if (wa && !PHONE_RE.test(wa)) bad.wa = 0;
  Object.keys(FIELDS).forEach(k => setErr(k, bad[k]));
  const keys = Object.keys(FIELDS).filter(k => bad[k] != null);
  if (focus && keys.length) { const el = FIELDS[keys[0]].focus(); if (el) el.focus(); }
  return keys;
}

/* ---------- Firestore-এর জন্য ডেটা ---------- */
function collect() {
  const c = cfg(); if (!c) return null;
  let min = num($("jp-smin").value), max = num($("jp-smax").value), unit = S.unit;
  if (unit === "negotiable" || (min === null && max === null)) { unit = "negotiable"; min = 0; max = 0; }
  else { if (min === null) min = max; if (max === null) max = min; }
  const phone = normPhone($("jp-phone").value);
  return {
    data: {
      type: S.type,
      title: clean($("jp-title").value),
      desc: $("jp-desc").value.trim(),
      mode: S.mode,
      areas: S.mode === "online" ? [] : S.areas.slice(),
      cats: S.cats.slice(),
      levels: c.levels ? S.levels.slice() : [],
      days: c.days ? S.days : 0,
      timeNote: clean($("jp-time").value),
      salaryMin: min, salaryMax: max, salaryUnit: unit,
      orgName: c.org ? clean($("jp-org").value) : "",
      genderPref: c.genderPref ? S.genderPref : "",
      tutorGender: c.tutor ? S.tutorGender : "",
      college: c.tutor ? S.college : "",
      dept: c.tutor ? S.dept : "",
      photo: c.tutor ? S.photo : "",
      authorName: clean($("jp-name").value)
    },
    contact: { phone: phone, whatsapp: $("jp-wa-same").checked ? phone : normPhone($("jp-wa").value) }
  };
}

/* ---------- লগইন ---------- */
function authErr(msg) { const p = $("jp-auth-err"); p.hidden = !msg; p.textContent = msg || ""; }
function renderAuth() {
  const u = S.user, ok = u && u.emailVerified;
  $("jp-out").hidden = !!u; $("jp-in").hidden = !u;
  if (u) {
    $("jp-uname").textContent = u.displayName || u.email || "";
    $("jp-umail").textContent = u.email || "";
    const av = $("jp-avatar"); av.textContent = "";
    if (u.photoURL) { const im = document.createElement("img"); im.src = u.photoURL; im.alt = ""; im.referrerPolicy = "no-referrer"; av.appendChild(im); }
    else av.textContent = (u.displayName || u.email || "?").charAt(0).toUpperCase();
    authErr(ok ? "" : L("এই অ্যাকাউন্টের ইমেইল যাচাই করা নয়, তাই পোস্ট করা যাবে না। যাচাইকৃত Google অ্যাকাউন্টে লগইন করুন।|This account's email is not verified, so it cannot post. Sign in with a verified Google account."));
    if (ok && !$("jp-name").value) $("jp-name").value = clean(u.displayName).slice(0, LIM.authorName[1]);
  }
  $("jp-form").hidden = !ok || S.stage === "done";
  sync();
}
async function signIn() {
  const b = $("jp-signin"); b.disabled = true; authErr("");
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (e) {
    const code = e && e.code || "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") authErr(L("লগইন সম্পূর্ণ হয়নি। আবার চেষ্টা করুন।|Sign-in was not completed. Please try again."));
    else if (code === "auth/popup-blocked") authErr(L("ব্রাউজার পপআপ আটকেছে। পপআপ অনুমতি দিয়ে আবার চাপুন।|Your browser blocked the pop-up. Allow pop-ups and try again."));
    else if (code === "auth/network-request-failed") authErr(L("ইন্টারনেট সংযোগ দেখুন, তারপর আবার চেষ্টা করুন।|Check your internet connection and try again."));
    else authErr(L("লগইন করা গেল না। Chrome বা Safari-তে পেজটি খুলে আবার চেষ্টা করুন (Facebook/Messenger-এর ভেতরের ব্রাউজারে Google লগইন চলে না)।|Could not sign in. Open this page in Chrome or Safari and try again (Google sign-in does not work inside the Facebook/Messenger browser)."));
  } finally { b.disabled = false; }
}

/* ---------- ইভেন্ট ---------- */
function bind() {
  $("jp-signin").addEventListener("click", signIn);
  $("jp-signout").addEventListener("click", () => signOut(auth));

  $("jp-types").addEventListener("click", e => { const b = e.target.closest(".jobs-type"); if (b) setType(b.getAttribute("data-type")); });

  onChip("jp-cats", v => toggle(S.cats, v, LIM.maxCats));
  onChip("jp-levels", v => toggle(S.levels, v, LIM.maxLevels));
  onChip("jp-modes", v => { S.mode = v; S.modeTouched = true; if (v === "online") S.areas = []; });
  onChip("jp-days", v => { S.days = parseInt(v, 10) || 0; });
  onChip("jp-units", v => { S.unit = v; S.unitTouched = true; });
  onChip("jp-genderpref", v => { S.genderPref = v; });
  onChip("jp-tutorgender", v => { S.tutorGender = v; });
  $("jp-areabox").addEventListener("click", e => {
    const b = e.target.closest(".jobs-chip");
    if (!b || b.getAttribute("aria-disabled") === "true" || S.mode === "online") return;
    const v = b.getAttribute("data-v"), max = cfg().areaMax;
    if (max === 1) S.areas = S.areas[0] === v ? [] : [v]; else toggle(S.areas, v, max);
    afterChange();
  });
  $("jp-picked").addEventListener("click", e => {
    const b = e.target.closest(".jobs-chip"); if (!b) return;
    toggle(S.areas, b.getAttribute("data-v"), 99); afterChange();
  });

  $("jp-college").addEventListener("change", () => { S.college = $("jp-college").value; renderSelects(); });
  $("jp-dept").addEventListener("change", () => { S.dept = $("jp-dept").value; });

  $("jp-form").addEventListener("input", () => { counters(); if (S.tried) validate(false); });
  $("jp-wa-same").addEventListener("change", () => {
    const on = $("jp-wa-same").checked; $("jp-wa").disabled = on; if (on) $("jp-wa").value = "";
    if (S.tried) validate(false);
  });

  $("jp-photo-in").addEventListener("change", async e => {
    const f = e.target.files && e.target.files[0], p = $("jp-photo-e"); p.hidden = true; e.target.value = "";
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 8 * 1024 * 1024) { p.textContent = L("JPG, PNG বা WebP ছবি দিন (৮ MB-র মধ্যে)।|Use a JPG, PNG or WebP image (under 8 MB)."); p.hidden = false; return; }
    try { const url = await compress(f); if (!url) throw 0; setPhoto(url); }
    catch (x) { p.textContent = L("ছবিটি প্রক্রিয়া করা গেল না। অন্য ছবি দিয়ে দেখুন।|Could not process this image. Try another one."); p.hidden = false; }
  });
  $("jp-photo-x").addEventListener("click", () => setPhoto(""));

  $("jp-next").addEventListener("click", () => {
    S.tried = true;
    const bad = validate(true), sum = $("jp-sum");
    if (bad.length) {
      sum.hidden = false;
      sum.textContent = lang() === "en" ? "Please fix " + bad.length + " field" + (bad.length > 1 ? "s" : "") + " marked above." : bnNum(bad.length) + "টি ঘর ঠিক করুন।";
      return;
    }
    sum.hidden = true;
    showStage("review");
  });
  $("jp-edit").addEventListener("click", () => showStage("edit"));
  $("jp-submit").addEventListener("click", submit);
  $("jp-consent").addEventListener("change", () => { if ($("jp-consent").checked) subErr(""); });
  $("jp-again").addEventListener("click", () => location.reload());
}

/* ---------- ধাপ ৫: যাচাই-পর্দা ---------- */
function showStage(st) {
  S.stage = st;
  $("jp-details").hidden = st !== "edit" || !S.type;
  $("jp-type-card").hidden = st !== "edit";
  $("jp-review").hidden = st !== "review";
  if (st === "review") { renderReview(); $("jp-h-rev").focus({ preventScroll: true }); }
  else if (st === "edit") $("jp-h-det").focus({ preventScroll: true });
  sync();
  const t = st === "review" ? $("jp-review") : $("jp-details");
  t.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
}
function renderReview() {
  const x = collect(); if (!x) return;
  const d = x.data, l = lang(), t = D.get("types", d.type), c = cfg();
  const rows = [
    ["ধরন|Type", t ? t[l] : d.type],
    ["শিরোনাম|Title", d.title],
    [c.catsLbl, D.labels("cats", d.cats, l).join(", ")]
  ];
  if (d.levels.length) rows.push(["শ্রেণি|Class level", D.labels("levels", d.levels, l).join(", ")]);
  if (d.college || d.dept) rows.push(["কলেজ/বিভাগ|College / Dept", [d.college && LD ? LD.name(LD.college(d.college), l) : "", d.dept && LD ? LD.name(LD.department(d.dept), l) : ""].filter(Boolean).join(" · ")]);
  rows.push(["পদ্ধতি|Mode", D.label("modes", d.mode, l)]);
  if (d.areas.length) rows.push([c.areasLbl, D.labels("areas", d.areas, l).join(", ")]);
  if (d.days) rows.push(["সপ্তাহে|Days per week", numL(d.days)]);
  if (d.timeNote) rows.push([c.timeLbl, d.timeNote]);
  if (d.genderPref) rows.push(["শিক্ষকের পছন্দ|Preferred tutor", D.label("genders", d.genderPref, l)]);
  if (d.tutorGender) rows.push(["লিঙ্গ|Gender", D.label("genders", d.tutorGender, l)]);
  rows.push([c.salaryLbl, D.salaryText(d.salaryMin, d.salaryMax, d.salaryUnit, l)]);
  if (d.orgName) rows.push([c.orgLbl || "প্রতিষ্ঠান|Organisation", d.orgName]);
  if (d.desc) rows.push(["বিস্তারিত|Description", d.desc]);
  if (d.photo) rows.push(["ছবি|Photo", L("আছে|Added")]);
  rows.push(["নাম|Name", d.authorName]);
  rows.push(["মোবাইল|Mobile", x.contact.phone + (x.contact.whatsapp ? " · WhatsApp: " + x.contact.whatsapp : "")]);
  $("jp-dl").innerHTML = rows.map(r => "<div><dt>" + esc(L(r[0])) + "</dt><dd>" + esc(r[1]) + "</dd></div>").join("");
}

/* ---------- ধাপ ৫: জমা ---------- */
function subErr(msg) { const p = $("jp-sub-err"); p.hidden = !msg; p.textContent = msg || ""; if (msg) p.focus(); }
const lastPostAt = () => { try { return parseInt(localStorage.getItem(LAST_KEY) || "0", 10) || 0; } catch (e) { return 0; } };

async function readTrust(uid) {
  try { const s = await getDoc(doc(db, "user_trust", uid)); return s.exists() ? s.data() : {}; } catch (e) { return {}; }
}
/* আজকের (UTC) জমার সংখ্যা। নেই এমন ডকুমেন্ট পড়তে গেলে Rules permission-denied দেয়; সেটাকে ০ ধরা হয় */
async function readCount(uid) {
  try { const s = await getDoc(doc(db, "jobs_limits", D.limitId(uid))); return s.exists() ? (s.data().count | 0) : 0; } catch (e) { return 0; }
}

function showDone(status) {
  S.stage = "done";
  $("jp-form").hidden = true; $("jp-details").hidden = true; $("jp-review").hidden = true;
  const live = status === "approved";
  $("jp-h-done").textContent = live ? L("পোস্ট প্রকাশিত হয়েছে|Your post is live") : L("পোস্ট জমা হয়েছে, অনুমোদনের অপেক্ষায়|Post submitted, awaiting approval");
  $("jp-done-p").textContent = live
    ? L("আপনার পোস্টটি এখন সবাই দেখতে পাচ্ছে। মেয়াদ ৩০ দিন।|Everyone can see your post now. It stays up for 30 days.")
    : L("অ্যাডমিন দেখে অনুমোদন দিলে পোস্টটি সবার সামনে আসবে। এতে কিছু সময় লাগতে পারে। অনুমোদনের আগে এটি শুধু আপনি দেখতে পারবেন। অনুমোদনের পর মেয়াদ ৩০ দিন।|Once an admin reviews and approves it, your post appears for everyone. This can take a while. Until then only you can see it. After approval it stays up for 30 days.");
  $("jp-done").hidden = false; sync();
  $("jp-h-done").focus();
}

async function submit() {
  if (S.sending) return;
  subErr("");
  if (!$("jp-consent").checked) { subErr(L("জমা দিতে নিয়মাবলিতে সম্মতি দিন।|Please accept the rules to submit.")); $("jp-consent").focus(); return; }
  if ($("jp-hp").value) { showDone("pending"); return; }                 // বট: কিছু না লিখে "সফল" দেখানো হয়
  if (Date.now() - S.formAt < MIN_FILL_MS) { subErr(L("একটু সময় নিয়ে তথ্য দেখে আবার চাপুন।|Take a moment to review your details, then press again.")); return; }
  const wait = COOLDOWN_MS - (Date.now() - lastPostAt());
  if (wait > 0) { subErr(L("আগের পোস্টের পর একটু অপেক্ষা করুন, তারপর আবার চেষ্টা করুন।|Please wait a little after your last post and try again.")); return; }
  if (validate(false).length) { showStage("edit"); S.tried = true; validate(true); return; }

  const u = auth.currentUser;
  if (!u || !u.emailVerified) { subErr(L("লগইন নেই বা ইমেইল যাচাই করা নয়। আবার লগইন করুন।|You are signed out or your email is not verified. Please sign in again.")); return; }

  S.sending = true; const btn = $("jp-submit"); btn.disabled = true;
  try {
    const [trust, count] = await Promise.all([readTrust(u.uid), readCount(u.uid)]);
    if (count >= LIM.postsPerDay) throw { code: "jobs/limit" };
    const x = collect();
    const postRef = doc(collection(db, "jobs_posts"));
    const status = trust.autoApprove === true ? "approved" : "pending";
    const batch = writeBatch(db);
    batch.set(postRef, Object.assign({}, x.data, {
      status: status, filled: false, authorUid: u.uid, authorVerified: trust.verified === true,
      createdAt: serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + LIM.expiryDays * 86400000)
    }));
    batch.set(doc(db, "jobs_posts", postRef.id, "private", "contact"), {
      authorUid: u.uid, authorEmail: u.email, phone: x.contact.phone, whatsapp: x.contact.whatsapp
    });
    const limRef = doc(db, "jobs_limits", D.limitId(u.uid));
    if (count === 0) batch.set(limRef, { uid: u.uid, day: D.dayKey(), count: 1 });
    else batch.update(limRef, { count: count + 1 });
    await batch.commit();
    try { localStorage.setItem(LAST_KEY, String(Date.now())); } catch (e) { /* storage blocked */ }
    showDone(status);
  } catch (e) {
    const code = e && e.code || "";
    if (code === "jobs/limit") subErr(L("আজ ইতিমধ্যে ২টি পোস্ট করেছেন। দিন বদলালে আবার পোস্ট করতে পারবেন (বাংলাদেশ সময় সকাল ৬টার পর নতুন দিন ধরা হয়)।|You have already made 2 posts today. You can post again after the day resets (the new day starts at 6 am Bangladesh time)."));
    else if (code === "unavailable" || code === "deadline-exceeded" || code === "auth/network-request-failed") subErr(L("ইন্টারনেট সংযোগ দেখুন, তারপর আবার চেষ্টা করুন। আপনার তথ্য এখানেই আছে।|Check your internet connection and try again. Your details are still here."));
    else if (code === "permission-denied") subErr(L("জমা নেওয়া গেল না। পেজ রিলোড করে লগইন ঠিক আছে কিনা দেখুন, তারপর আবার চেষ্টা করুন। সমস্যা থাকলে আমাদের জানান।|Could not submit. Reload the page, check you are signed in, and try again. Let us know if it keeps happening."));
    else subErr(L("জমা দেওয়া গেল না। একটু পরে আবার চেষ্টা করুন।|Could not submit. Please try again in a moment."));
  } finally { S.sending = false; btn.disabled = false; }
}

/* ---------- শুরু ---------- */
$("jp-out").hidden = true;                           // auth-এর অবস্থা জানার আগে বাটন ঝিলিক দেয় না
bind();
new MutationObserver(() => { if (S.type) renderAll(); else renderTypes(); if (S.user) renderAuth(); if (S.stage === "review") renderReview(); })
  .observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });
renderTypes();
onAuthStateChanged(auth, u => { S.user = u || null; renderAuth(); });

window.JobsPost = { collect: collect, validate: function () { return validate(false); }, state: S };
