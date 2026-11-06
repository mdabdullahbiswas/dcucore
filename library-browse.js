/* library-browse.js — লাইব্রেরির পাবলিক ব্রাউজিং (ধাপ ৬)
 *
 * পথ: বিভাগ → বর্ষ → কোর্স → ফাইলের কার্ড। কলেজ ফিল্টার (library.js) সব স্তরে কাজ করে।
 * হোমে "নতুন যোগ হয়েছে" সারি। শুধু approved ফাইল দেখায়।
 *
 * ডেটা:
 *   lib_meta      → LibData.merge() দিয়ে ডিফল্ট তালিকার সঙ্গে মেশে (অ্যাডমিনের যোগ করা বিভাগ/কোর্স)
 *   lib_resources → where("status","==","approved") — Rules এই কোয়েরিই মেনে নেয়; কোনো ইনডেক্স লাগে না
 *   একবারে সর্বোচ্চ ১০০০ ফাইল আনে ও ব্রাউজারে সাজায়। ফাইল এর চেয়ে বাড়লে পাতা-ভাগ (pagination) যোগ করতে হবে।
 *   sessionStorage-এ ৩ মিনিট জমা রাখে, তাই বিভাগ বদলালে বারবার Firestore পড়া হয় না।
 *
 * URL: /library#economics  ·  /library#economics-2nd  ·  /library#economics-2nd-222201?type=question&sort=pop&c=dhaka-college
 *   সার্চ: /library#?q=micro। ব্রাউজারের Back বোতাম কাজ করে।
 * ধাপ ৮: সার্চ (শিরোনাম, কোড, কোর্সের নাম, বিভাগ), ফিল্টার চিপ (ধরন/পরীক্ষা/সাল), সাজানো (নতুন/জনপ্রিয়)।
 *
 * ধাপ ৭ (library-viewer.js) এই ইভেন্ট ধরে মডাল খোলে। লোড শেষে "lib:ready" ইভেন্ট যায়।
 * ধাপ ৭-এর জন্য:
 *   কার্ডে ক্লিক করলে document-এ cancelable ইভেন্ট "lib:open" → detail: { file }।
 *   ধাপ ৭-এর ভিউয়ার e.preventDefault() করলে এখানের ফলব্যাক (Drive-এ নতুন ট্যাবে খোলা) বন্ধ হয়।
 *   window.LibBrowse.find(id) / .files() দিয়ে ফাইলের তথ্য পাওয়া যায়।
 */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const CFG = {
  apiKey: "AIzaSyBgaBKzAAwzHI7ahGKqzbrX9MknWWIm9j0",
  authDomain: "dcu-blood-bank.firebaseapp.com",
  projectId: "dcu-blood-bank",
  storageBucket: "dcu-blood-bank.firebasestorage.app",
  messagingSenderId: "835221249900",
  appId: "1:835221249900:web:facf545941825a4efa5d49"
};

const D = window.LibData, UI = window.LibUI;
const $ = id => document.getElementById(id);
const elBrowse = $("lib-browse"), elH = $("lib-browse-h"), elGrid = $("lib-grid"),
      elStatus = $("lib-status"), elDrill = $("lib-drill"), elRecent = $("lib-recent"),
      elQ = $("lib-q"), elQx = $("lib-q-x"), elSr = $("lib-search-sr");
if (!D || !UI || !elDrill) throw new Error("library-browse: LibData, LibUI বা #lib-drill পাওয়া যায়নি");

const app = getApps().find(a => a.name === "dcu-library") || initializeApp(CFG, "dcu-library");
const db = getFirestore(app);

/* ---------- ধ্রুবক ---------- */
const MAX_FILES = 1000;
const CACHE_KEY = "dcu-lib-cache-v1";
const CACHE_TTL = 3 * 60 * 1000;
const RECENT_COUNT = 6;
const PAGE = 60;           // সার্চ/ফাইলের তালিকায় একবারে এতটি; বাকিটা "আরও দেখান"
const NEW_DAYS = 7;
const ORD = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };
const BASE_TITLE = document.title;

/* ---------- ভাষা ও লেখা সহায়ক ---------- */
const lang = () => document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn";
const tx = (bn, en) => lang() === "en" ? en : bn;
const num = n => lang() === "en" ? String(n) : Number(n).toLocaleString("bn-BD");
const yr = n => lang() === "en" ? String(n) : Number(n).toLocaleString("bn-BD", { useGrouping: false });
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const str = v => typeof v === "string" ? v.trim() : "";
const filesWord = n => tx(num(n) + "টি ফাইল", num(n) + (n === 1 ? " file" : " files"));
const courseKey = c => String(c || "").trim().toLowerCase().replace(/\s+/g, " ");

/* ---------- ফাইলের ধরনের আইকন ---------- */
const FT_ICONS = {
  note: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
  solution: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  slide: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  book: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5v-13zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5v-13z"/>',
  syllabus: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  lab: '<path d="M9 3h6M10 3v6l-5.5 10a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3M7.5 15h9"/>',
  other: '<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>'
};
const svg = (inner, size, sw) => '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) +
  '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + "</svg>";
const CHEVRON = svg('<path d="M9 6l6 6-6 6"/>', 18, 2);

/* ---------- ডেটা ---------- */
let files = [];
let phase = "loading";     // "loading" | "ready" | "error"
let view = { dept: "", year: 0, course: "" };

function norm(id, d) {
  const t = d.createdAt;
  const ms = t && typeof t.toMillis === "function" ? t.toMillis() : (typeof t === "number" ? t : 0);
  return {
    id,
    url: str(d.driveUrl),
    college: str(d.college), dept: str(d.dept),
    year: Number(d.year) || 0,
    code: str(d.courseCode), cname: str(d.courseName),
    ftype: str(d.fileType) || "other", etype: str(d.examType) || "none", eyear: Number(d.examYear) || 0,
    title: str(d.title), desc: str(d.desc), by: str(d.submitter),
    views: Number(d.views) || 0, downloads: Number(d.downloads) || 0,
    ms
  };
}

function readCache() {
  try {
    const o = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (o && Array.isArray(o.rows) && Array.isArray(o.meta) && Date.now() - o.t < CACHE_TTL) return o;
  } catch (e) { /* ক্যাশ নেই বা নষ্ট */ }
  return null;
}
function writeCache(meta, rows) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), meta, rows })); } catch (e) { /* জায়গা নেই */ }
}

async function load(fresh) {
  phase = "loading";
  renderAll();
  try {
    let c = fresh ? null : readCache();
    if (!c) {
      let metaOk = true;
      const [m, f] = await Promise.all([
        getDocs(collection(db, "lib_meta")).catch(err => { metaOk = false; console.warn("lib_meta পড়া যায়নি", err); return null; }),
        getDocs(query(collection(db, "lib_resources"), where("status", "==", "approved"), limit(MAX_FILES)))
      ]);
      c = { t: Date.now(), meta: m ? m.docs.map(d => d.data()) : [], rows: f.docs.map(d => norm(d.id, d.data())) };
      if (metaOk) writeCache(c.meta, c.rows);
    }
    if (c.meta.length) D.merge(c.meta);
    files = c.rows.filter(f => f.dept && f.url);
    phase = "ready";
    syncFromUrl();      // অ্যাডমিনের যোগ করা নতুন বিভাগের লিংক দিয়ে ঢুকলে এখন চেনা যাবে
  } catch (err) {
    console.error("লাইব্রেরির ফাইল আনা যায়নি", err);
    phase = "error";
  }
  renderAll();
  if (phase === "ready") document.dispatchEvent(new CustomEvent("lib:ready"));
}

/* ---------- সাজানো ও ফিল্টার ---------- */
const byNew = (a, b) => b.ms - a.ms || (a.title < b.title ? -1 : 1);
const college = () => UI.college();
const visible = () => { const c = college(); return c ? files.filter(f => f.college === c) : files; };
const countFor = (dept, c) => files.reduce((n, f) => n + (f.dept === dept && (!c || f.college === c) ? 1 : 0), 0);
const isNew = f => f.ms && Date.now() - f.ms < NEW_DAYS * 864e5;

/* ---------- URL (hash) ----------
 * পথ:      #economics  ·  #economics-2nd  ·  #economics-2nd-222201
 * ফিল্টার: পথের পরে ?…  যেমন  #economics-2nd-222201?type=question&exam=final&year=2023&sort=pop&c=dhaka-college
 *          সার্চ: #?q=micro   (q সার্চ, type ধরন, exam পরীক্ষার ধরন, year পরীক্ষার সাল, sort=pop জনপ্রিয়, c কলেজ) */
const FLT0 = { q: "", type: "", etype: "", eyear: 0, sort: "new" };
let flt = Object.assign({}, FLT0);
let shown = PAGE;
let applying = false;      // URL থেকে অবস্থা বসানোর সময় true, তাই তখন URL আবার লেখা হয় না

function hashOf(v) {
  if (!v.dept) return "";
  let h = v.dept;
  if (v.year) { h += "-" + ORD[v.year]; if (v.course) h += "-" + encodeURIComponent(v.course); }
  return "#" + h;
}
function parseRoute(h) {
  const home = { dept: "", year: 0, course: "" };
  if (!h) return home;
  const m = h.match(/^([a-z0-9-]+?)-([1-4])(?:st|nd|rd|th)(?:-(.+))?$/);
  if (m && D.department(m[1])) {
    let course = "";
    if (m[3]) { try { course = decodeURIComponent(m[3]); } catch (e) { course = m[3]; } }
    return { dept: m[1], year: Number(m[2]), course };
  }
  if (D.department(h)) return { dept: h, year: 0, course: "" };
  return home;
}
function readUrl() {
  const raw = location.hash.replace(/^#/, ""), i = raw.indexOf("?");
  const p = new URLSearchParams(i < 0 ? "" : raw.slice(i + 1));
  const f = Object.assign({}, FLT0);
  f.q = (p.get("q") || "").slice(0, 80);
  f.type = D.fileType(p.get("type")) ? p.get("type") : "";
  f.etype = D.examType(p.get("exam")) ? p.get("exam") : "";
  f.eyear = Number(p.get("year")) || 0;
  f.sort = p.get("sort") === "pop" ? "pop" : "new";
  const c = p.get("c") || "";
  return { view: parseRoute(i < 0 ? raw : raw.slice(0, i)), flt: f, college: D.college(c) ? c : "" };
}
function urlFor() {
  const p = new URLSearchParams();
  const q = flt.q.trim();
  if (q) p.set("q", q);
  if (flt.type) p.set("type", flt.type);
  if (flt.etype) p.set("exam", flt.etype);
  if (flt.eyear) p.set("year", String(flt.eyear));
  if (flt.sort === "pop") p.set("sort", "pop");
  if (college()) p.set("c", college());
  const qs = p.toString(), h = hashOf(view), base = location.pathname + location.search;
  if (!qs) return h ? base + h : base;
  return base + (h || "#") + "?" + qs;
}
function updateUrl(push) {
  if (applying) return;
  const u = urlFor();
  if (u === location.pathname + location.search + location.hash) return;
  try {
    if (push) history.pushState(null, "", u); else history.replaceState(history.state, "", u);
  } catch (e) { /* পুরোনো ব্রাউজার */ }
}
const sameView = (a, b) => a.dept === b.dept && a.year === b.year && courseKey(a.course) === courseKey(b.course);
const href = v => hashOf(v) || location.pathname;

/* ব্যবহারকারীর ক্রিয়ায় (ক্লিক) বিভাগ/বর্ষ/কোর্স বদল: ফিল্টার ও সার্চ নতুন করে শুরু */
function navigate(v) {
  if (v.dept && !D.department(v.dept)) v = { dept: "", year: 0, course: "" };
  const changed = !sameView(v, view) || !!flt.q.trim();
  view = { dept: v.dept || "", year: v.year || 0, course: v.course || "" };
  flt.q = ""; flt.type = ""; flt.etype = ""; flt.eyear = 0; shown = PAGE;
  syncSearchBox();
  if (changed) updateUrl(true);
  renderAll();
  elBrowse.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  const h = elDrill.querySelector("[data-focus]");
  if (h) h.focus({ preventScroll: true });
}

/* URL থেকে পুরো অবস্থা বসানো (Back/Forward, হাতে হ্যাশ বদল, লোডের পর) */
function syncFromUrl() {
  const u = readUrl();
  if (sameView(u.view, view) && JSON.stringify(u.flt) === JSON.stringify(flt) && u.college === college()) return;
  applying = true;
  view = u.view; flt = u.flt; shown = PAGE;
  if (u.college !== college()) UI.setCollege(u.college);
  applying = false;
  syncSearchBox();
  renderAll();
}
window.addEventListener("popstate", syncFromUrl);
window.addEventListener("hashchange", syncFromUrl);

function setFlt(patch) {
  Object.assign(flt, patch);
  shown = PAGE;
  updateUrl(false);
  renderView();
}

/* ---------- ফাইলের কার্ড ---------- */
function fileCard(f, showDept) {
  const l = lang();
  const ft = D.fileType(f.ftype) || D.fileType("other");
  const et = f.etype && f.etype !== "none" ? D.examType(f.etype) : null;
  const col = D.college(f.college);
  const dept = showDept ? D.department(f.dept) : null;

  const exam = [et ? D.name(et, l) : "", f.eyear ? yr(f.eyear) : ""].filter(Boolean).join(" · ");
  const meta = [];
  if (f.code) meta.push('<span class="lib-file-code">' + esc(f.code) + "</span>");
  if (exam) meta.push("<span>" + esc(exam) + "</span>");
  if (col) meta.push("<span>" + esc(D.name(col, l)) + "</span>");
  if (dept) meta.push("<span>" + esc(D.name(dept, l)) + "</span>");

  return '<button type="button" class="lib-file" data-id="' + esc(f.id) + '">' +
    '<span class="lib-file-ico" aria-hidden="true">' + svg(FT_ICONS[f.ftype] || FT_ICONS.other, 24, 1.8) + "</span>" +
    '<span class="lib-file-body"><b class="lib-file-title">' + esc(f.title) + "</b>" +
    '<span class="lib-file-meta">' + meta.join("") + "</span></span>" +
    '<span class="lib-file-side">' +
    (isNew(f) ? '<span class="lib-new">' + tx("নতুন", "New") + "</span>" : "") +
    '<span class="lib-tag">' + esc(D.name(ft, l)) + "</span></span></button>";
}

function openFile(f) {
  const ev = new CustomEvent("lib:open", { detail: { file: f }, cancelable: true });
  const go = document.dispatchEvent(ev);
  /* ধাপ ৭-এর ভিউয়ার না থাকলে (বা সে preventDefault না করলে): Drive-এ নতুন ট্যাবে খোলা */
  if (go && /^https:\/\/(drive|docs)\.google\.com\//.test(f.url)) window.open(f.url, "_blank", "noopener,noreferrer");
}

function onFileClick(e) {
  const b = e.target.closest && e.target.closest(".lib-file");
  if (!b) return;
  const f = files.find(x => x.id === b.getAttribute("data-id"));
  if (f) openFile(f);
}

/* ---------- স্কেলেটন, খালি অবস্থা, ত্রুটি ---------- */
const skFile = () => '<div class="lib-sk-file" aria-hidden="true"><span class="lib-sk lib-sk-ico"></span><span class="lib-sk-lines"><span class="lib-sk lib-sk-l1"></span><span class="lib-sk lib-sk-l2"></span></span><span class="lib-sk lib-sk-tag"></span></div>';
const skFiles = n => { let h = ""; for (let i = 0; i < n; i++) h += skFile(); return h; };

function emptyBox(icon, title, text, extra) {
  return '<div class="lib-empty lib-none" role="note"><span class="lib-empty-ico" aria-hidden="true">' + svg(FT_ICONS[icon] || FT_ICONS.other, 30, 1.7) + "</span>" +
    '<b class="lib-empty-title">' + esc(title) + "</b><p class=\"lib-empty-text\">" + esc(text) + "</p>" + (extra || "") + "</div>";
}
const submitBtn = () => '<a class="lib-cta lib-cta-sm" href="/library-submit">' + svg('<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>', 18, 2.2) + "<span>" + tx("ফাইল জমা দিন", "Submit a file") + "</span></a>";
const retryBox = () => emptyBox("other", tx("ফাইল আনা যায়নি", "Could not load files"),
  tx("ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।", "Check your connection and try again."),
  '<button type="button" class="lib-retry" data-lib-retry>' + tx("আবার চেষ্টা করুন", "Try again") + "</button>");

/* ---------- "নতুন যোগ হয়েছে" সারি (হোম) ---------- */
function renderRecent(el) {
  if (phase === "loading") { el.setAttribute("aria-busy", "true"); el.innerHTML = skFiles(3); return; }
  el.setAttribute("aria-busy", "false");
  if (phase === "error") { el.innerHTML = retryBox(); return; }
  const list = visible().slice().sort(byNew).slice(0, RECENT_COUNT);
  if (!list.length) {
    const c = D.college(college());
    el.innerHTML = c
      ? emptyBox("note", tx("এই কলেজের কোনো ফাইল এখনো নেই", "No files for this college yet"),
          tx("অন্য কলেজ বেছে দেখুন, অথবা আপনিই প্রথম ফাইল জমা দিন।", "Try another college, or be the first to submit a file."), submitBtn())
      : emptyBox("other", tx("এখনো কোনো ফাইল নেই", "No files yet"),
          tx("ফাইল জমা হয়ে অ্যাডমিনের অনুমোদন পেলেই এখানে দেখা যাবে।", "Files will show up here once they are submitted and approved by an admin."), submitBtn());
    return;
  }
  el.innerHTML = list.map(f => fileCard(f, true)).join("");
}

/* ---------- ব্রেডক্রাম্ব ---------- */
function crumbs(items) {
  return '<nav class="lib-crumbs" aria-label="' + esc(tx("পথ", "Breadcrumb")) + '"><ol>' + items.map((it, i) => {
    const last = i === items.length - 1;
    const label = esc(it.label);
    if (last) return '<li aria-current="page"><span>' + label + "</span></li>";
    return '<li><a href="' + esc(href(it.v)) + '" data-dept="' + esc(it.v.dept) + '" data-year="' + (it.v.year || 0) + '" data-course="' + esc(it.v.course || "") + '">' + label + "</a></li>";
  }).join("") + "</ol></nav>";
}

function headCollege() {
  const c = D.college(college());
  return c ? '<span class="lib-dhead-col">' + esc(D.name(c, lang())) + "</span>" : "";
}

/* ---------- বর্ষের তালিকা ---------- */
function yearView(dept) {
  const l = lang();
  const list = visible().filter(f => f.dept === dept.slug);
  const home = { dept: "", year: 0, course: "" };

  let h = crumbs([{ label: tx("লাইব্রেরি", "Library"), v: home }, { label: D.name(dept, l) }]);
  h += '<div class="lib-dhead"><h2 tabindex="-1" data-focus>' + esc(D.name(dept, l)) + "</h2>" + headCollege() + "</div>";
  h += '<p class="lib-dsub">' + esc(tx("বর্ষ বেছে নিন", "Choose a year")) + "</p>";
  h += '<div class="lib-years">';
  D.YEARS.forEach((y, i) => {
    const fs = list.filter(f => f.year === y.n);
    const hasList = D.hasCourses(dept.slug) && D.courses(dept.slug, y.n).length > 0;
    const sub = phase !== "ready" ? "" : fs.length ? filesWord(fs.length) : (hasList ? tx("কোর্স আছে, ফাইল নেই", "Courses listed, no files yet") : tx("ফাইল নেই", "No files yet"));
    h += '<a class="lib-year' + (phase === "ready" && !fs.length ? " is-empty" : "") + '" href="' + esc(href({ dept: dept.slug, year: y.n, course: "" })) + '" data-dept="' + esc(dept.slug) + '" data-year="' + y.n + '" data-course="" style="--i:' + i + '">' +
      '<span class="lib-year-n" aria-hidden="true">' + num(y.n) + "</span>" +
      '<span class="lib-year-txt"><b>' + esc(D.name(y, l)) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span>" + CHEVRON + "</a>";
  });
  h += "</div>";
  if (phase === "error") h += retryBox();
  return h;
}

/* ---------- কোর্সের তালিকা ---------- */
function buildCourses(dept, year, fs) {
  const l = lang(), map = new Map();
  D.courses(dept, year).forEach(c => map.set(courseKey(c.code), { code: c.code, name: D.name(c, l), opt: !!c.opt, files: [] }));
  fs.forEach(f => {
    const k = courseKey(f.code);
    if (!map.has(k)) map.set(k, { code: f.code, name: f.cname, opt: false, files: [] });
    map.get(k).files.push(f);
  });
  return Array.from(map.values()).sort((a, b) => a.code < b.code ? -1 : a.code > b.code ? 1 : 0);
}

function courseListView(dept, yearObj) {
  const l = lang();
  const home = { dept: "", year: 0, course: "" };
  const fs = visible().filter(f => f.dept === dept.slug && f.year === yearObj.n);
  const courses = buildCourses(dept.slug, yearObj.n, fs);

  let h = crumbs([
    { label: tx("লাইব্রেরি", "Library"), v: home },
    { label: D.name(dept, l), v: { dept: dept.slug, year: 0, course: "" } },
    { label: D.name(yearObj, l) }
  ]);
  h += '<div class="lib-dhead"><h2 tabindex="-1" data-focus>' + esc(D.name(dept, l)) + " · " + esc(D.name(yearObj, l)) + "</h2>" + headCollege() + "</div>";

  if (!courses.length) {
    h += phase === "error" ? retryBox() :
      emptyBox("book", tx("এই বর্ষে এখনো কোনো ফাইল নেই", "No files for this year yet"),
        tx("আপনার কাছে এই বর্ষের নোট বা প্রশ্ন থাকলে জমা দিন।", "If you have notes or questions for this year, please submit them."), submitBtn());
    return h;
  }

  h += '<p class="lib-dsub">' + esc(tx("কোর্স বেছে নিন", "Choose a course")) + "</p>";
  h += '<div class="lib-courses">';
  courses.forEach((c, i) => {
    const n = c.files.length;
    h += '<a class="lib-course' + (phase === "ready" && !n ? " is-empty" : "") + '" href="' + esc(href({ dept: dept.slug, year: yearObj.n, course: c.code })) + '" data-dept="' + esc(dept.slug) + '" data-year="' + yearObj.n + '" data-course="' + esc(c.code) + '" style="--i:' + Math.min(i, 14) + '">' +
      '<span class="lib-course-code">' + esc(c.code) + "</span>" +
      '<span class="lib-course-name">' + esc(c.name || c.code) + (c.opt ? ' <em class="lib-opt">' + esc(tx("ঐচ্ছিক", "Optional")) + "</em>" : "") + "</span>" +
      '<span class="lib-course-n">' + (phase === "ready" ? esc(n ? filesWord(n) : tx("ফাইল নেই", "No files")) : "") + "</span>" + CHEVRON + "</a>";
  });
  h += "</div>";
  if (phase === "error") h += retryBox();
  return h;
}

/* ---------- সাজানো, ফিল্টার বার ও তালিকা ---------- */
const byPop = (a, b) => (b.downloads * 2 + b.views) - (a.downloads * 2 + a.views) || byNew(a, b);

function applyFlt(list) {
  return list.filter(f => (!flt.type || f.ftype === flt.type) && (!flt.etype || f.etype === flt.etype) && (!flt.eyear || f.eyear === flt.eyear))
    .sort(flt.sort === "pop" ? byPop : byNew);
}
const anyFlt = () => !!(flt.type || flt.etype || flt.eyear);

function fchip(k, v, label, on) {
  return '<button type="button" class="lib-fchip' + (on ? " on" : "") + '" data-f="' + k + '" data-v="' + esc(v) + '" data-fk="' + k + ":" + esc(v) + '" aria-pressed="' + on + '">' + esc(label) + "</button>";
}
function fgroup(k, label, opts, cur, allLabel) {
  if (opts.length < 2 && !cur) return "";
  let h = '<div class="lib-fg" role="group" aria-label="' + esc(label) + '"><span class="lib-fg-l">' + esc(label) + '</span><div class="lib-fg-c">';
  if (allLabel) h += fchip(k, "", allLabel, !cur);
  opts.forEach(o => { h += fchip(k, String(o.v), o.label, String(o.v) === String(cur)); });
  return h + "</div></div>";
}

function filterBar(base) {
  const l = lang();
  const present = (key) => { const set = {}; base.forEach(f => { set[f[key]] = 1; }); return set; };
  const tp = present("ftype"), ep = present("etype"), yp = present("eyear");
  const types = D.FILE_TYPES.filter(t => tp[t.id] || t.id === flt.type).map(t => ({ v: t.id, label: D.name(t, l) }));
  const exams = D.EXAM_TYPES.filter(t => t.id !== "none" && (ep[t.id] || t.id === flt.etype)).map(t => ({ v: t.id, label: D.name(t, l) }));
  const yset = {}; Object.keys(yp).forEach(y => { if (Number(y) > 0) yset[y] = 1; }); if (flt.eyear) yset[flt.eyear] = 1;
  const years = Object.keys(yset).map(Number).sort((a, b) => b - a).map(y => ({ v: y, label: yr(y) }));
  const all = tx("সব", "All");

  let h = '<div class="lib-fbar">';
  h += fgroup("type", tx("ধরন", "Type"), types, flt.type, all);
  h += fgroup("etype", tx("পরীক্ষা", "Exam"), exams, flt.etype, all);
  h += fgroup("eyear", tx("সাল", "Year"), years, flt.eyear || "", all);
  h += '<div class="lib-fg" role="group" aria-label="' + esc(tx("সাজান", "Sort")) + '"><span class="lib-fg-l">' + esc(tx("সাজান", "Sort")) + '</span><div class="lib-fg-c">' +
    fchip("sort", "new", tx("নতুন", "Newest"), flt.sort !== "pop") + fchip("sort", "pop", tx("জনপ্রিয়", "Popular"), flt.sort === "pop") + "</div></div>";
  if (anyFlt()) h += '<button type="button" class="lib-freset" data-f="reset">' + esc(tx("ফিল্টার মুছুন", "Clear filters")) + "</button>";
  return h + "</div>";
}

/* base (কলেজ-ফিল্টার করা, সাজানো ছাড়া) থেকে ফিল্টার বার + গণনা + কার্ডের তালিকা। base খালি হলে ডাকবেন না */
function fileSection(base, showDept) {
  const list = applyFlt(base);
  let h = filterBar(base);
  h += '<p class="lib-dsub" role="status">' + esc(filesWord(list.length)) + (list.length !== base.length ? " " + esc(tx("(মোট " + num(base.length) + "টির মধ্যে)", "(of " + num(base.length) + ")")) : "") + "</p>";
  if (!list.length) {
    return h + emptyBox("note", tx("এই ফিল্টারে কোনো ফাইল নেই", "No files match these filters"),
      tx("অন্য ধরন বা সাল বেছে দেখুন।", "Try a different type or year."),
      '<button type="button" class="lib-retry" data-f="reset">' + esc(tx("ফিল্টার মুছুন", "Clear filters")) + "</button>");
  }
  h += '<div class="lib-files">' + list.slice(0, shown).map(f => fileCard(f, showDept)).join("") + "</div>";
  if (list.length > shown) h += '<button type="button" class="lib-retry lib-more" data-f="more">' + esc(tx("আরও দেখান", "Show more")) + " (" + esc(num(list.length - shown)) + ")</button>";
  return h;
}

/* ---------- সার্চ ---------- */
function hay(f) {
  if (f._h) return f._h;
  const d = D.department(f.dept), c = D.college(f.college);
  return (f._h = [f.title, f.code, f.cname, f.desc, d && d.bn, d && d.en, c && c.bn, c && c.en].filter(Boolean).join(" ").toLowerCase());
}
let lastCount = 0;
function searchView() {
  const q = flt.q.trim();
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  let h = '<div class="lib-dhead"><h2 tabindex="-1" data-focus>' + esc(tx("“" + q + "” এর ফলাফল", "Results for “" + q + "”")) + "</h2>" + headCollege() + "</div>";
  if (phase === "loading") { lastCount = -1; return h + '<div class="lib-files" aria-busy="true">' + skFiles(4) + "</div>"; }
  if (phase === "error") { lastCount = -1; return h + retryBox(); }
  const base = visible().filter(f => { const t = hay(f); return tokens.every(k => t.indexOf(k) > -1); });
  lastCount = base.length;
  if (!base.length) {
    return h + emptyBox("question", tx("কিছু পাওয়া যায়নি", "Nothing found"),
      tx("শিরোনাম, কোর্স কোড বা কোর্সের নাম দিয়ে আবার খুঁজুন। কলেজ ফিল্টার থাকলে “সব কলেজ” করে দেখুন।", "Try a title, course code or course name. If a college is selected, try “All colleges”."), submitBtn());
  }
  return h + fileSection(base, true);
}

/* ---------- কোর্সের ফাইল ---------- */
function filesView(dept, yearObj, code) {
  const l = lang();
  const home = { dept: "", year: 0, course: "" };
  const key = courseKey(code);
  const fs = visible().filter(f => f.dept === dept.slug && f.year === yearObj.n && courseKey(f.code) === key);

  const known = D.courses(dept.slug, yearObj.n).find(c => courseKey(c.code) === key);
  const display = known ? D.name(known, l) : (fs[0] ? fs[0].cname : "");
  const shownCode = known ? known.code : (fs[0] ? fs[0].code : code);

  let h = crumbs([
    { label: tx("লাইব্রেরি", "Library"), v: home },
    { label: D.name(dept, l), v: { dept: dept.slug, year: 0, course: "" } },
    { label: D.name(yearObj, l), v: { dept: dept.slug, year: yearObj.n, course: "" } },
    { label: shownCode }
  ]);
  h += '<div class="lib-dhead"><h2 tabindex="-1" data-focus><span class="lib-file-code lib-big">' + esc(shownCode) + "</span> " + esc(display) + "</h2>" + headCollege() + "</div>";

  if (phase === "loading") return h + '<div class="lib-files" aria-busy="true">' + skFiles(4) + "</div>";
  if (phase === "error") return h + retryBox();
  if (!fs.length) {
    return h + emptyBox("note", tx("এই কোর্সে এখনো কোনো ফাইল নেই", "No files for this course yet"),
      college() ? tx("অন্য কলেজ বেছে দেখুন, অথবা আপনিই প্রথম ফাইল জমা দিন।", "Try another college, or be the first to submit a file.")
                : tx("আপনিই প্রথম ফাইল জমা দিন।", "Be the first to submit a file."), submitBtn());
  }
  return h + fileSection(fs, false);
}

/* ---------- মূল আঁকা ----------
 * renderView(): হোম/ড্রিল-ডাউনের কোনটি দেখাবে তা ঠিক করে ও ড্রিল-ডাউন আঁকে।
 * renderAll(): তার ওপর হোমের কার্ড ও "নতুন যোগ হয়েছে" সারিও আঁকে।
 * ভাষা বা তালিকা বদলালে library.js নিজেই হোম আঁকে, তাই তখন শুধু renderView() ডাকা হয়। */
function renderView() {
  const searching = !!flt.q.trim();
  const home = !view.dept && !searching;
  const dept = view.dept && !searching ? D.department(view.dept) : null;
  if (view.dept && !D.department(view.dept)) { view = { dept: "", year: 0, course: "" }; return renderView(); }

  elGrid.hidden = elStatus.hidden = elH.hidden = elRecent.hidden = !home;
  elDrill.hidden = home;
  if (elQx) elQx.hidden = !flt.q;

  if (home) { document.title = BASE_TITLE; if (elSr) elSr.textContent = ""; return; }

  if (searching) {
    elDrill.innerHTML = withFocus(searchView());
    document.title = flt.q.trim() + " – " + tx("লাইব্রেরি", "Library") + " – DCUCore";
    if (elSr) elSr.textContent = lastCount < 0 ? "" : (lastCount ? filesWord(lastCount) : tx("কিছু পাওয়া যায়নি", "Nothing found"));
    return;
  }
  if (elSr) elSr.textContent = "";

  const yearObj = view.year ? D.year(view.year) : null;
  let html;
  if (!yearObj) html = yearView(dept);
  else if (!view.course) html = courseListView(dept, yearObj);
  else html = filesView(dept, yearObj, view.course);

  elDrill.innerHTML = withFocus(html);
  const parts = [D.name(dept, lang())];
  if (yearObj) parts.push(D.name(yearObj, lang()));
  if (view.course) parts.push(view.course);
  document.title = parts.join(" · ") + " – " + tx("লাইব্রেরি", "Library") + " – DCUCore";
}

/* আঁকার পর কীবোর্ড-ফোকাস একই চিপে ফিরিয়ে দেয় (চিপ বদলালে তালিকা নতুন করে আঁকা হয়) */
function withFocus(html) {
  const a = document.activeElement;
  const fk = a && a.getAttribute && elDrill.contains(a) ? a.getAttribute("data-fk") : null;
  if (fk) setTimeout(() => {
    const n = elDrill.querySelector('[data-fk="' + fk.replace(/"/g, "") + '"]');
    if (n) n.focus({ preventScroll: true });
  }, 0);
  return html;
}

function renderAll() {
  renderView();
  if (!view.dept && !flt.q.trim()) UI.refresh();
}

/* ---------- সার্চ বক্স ---------- */
function syncSearchBox() {
  if (!elQ) return;
  if (elQ.value.trim() !== flt.q.trim()) elQ.value = flt.q;
  if (elQx) elQx.hidden = !flt.q;
}
function labelSearch() {
  if (!elQ) return;
  elQ.placeholder = tx("শিরোনাম, কোর্স কোড বা কোর্সের নাম খুঁজুন…", "Search title, course code or course name…");
  elQ.setAttribute("aria-label", tx("লাইব্রেরিতে খুঁজুন", "Search the library"));
  if (elQx) elQx.setAttribute("aria-label", tx("সার্চ মুছুন", "Clear search"));
}
let qTimer = 0;
function applyQuery(v) {
  flt.q = v.replace(/\s+/g, " ").replace(/^ /, "").slice(0, 80);
  shown = PAGE;
  updateUrl(false);
  renderAll();
}
if (elQ) {
  elQ.addEventListener("input", () => { clearTimeout(qTimer); const v = elQ.value; if (elQx) elQx.hidden = !v; qTimer = setTimeout(() => applyQuery(v), 220); });
  elQ.addEventListener("keydown", e => {
    if (e.key === "Escape" && elQ.value) { e.preventDefault(); clearTimeout(qTimer); elQ.value = ""; applyQuery(""); }
    else if (e.key === "Enter") { clearTimeout(qTimer); applyQuery(elQ.value); }
  });
}
if (elQx) elQx.addEventListener("click", () => { clearTimeout(qTimer); elQ.value = ""; applyQuery(""); elQ.focus(); });

/* ---------- ক্লিক ---------- */
function onFilterClick(b) {
  const k = b.getAttribute("data-f"), v = b.getAttribute("data-v") || "";
  if (k === "more") { shown += PAGE; renderView(); return; }
  if (k === "reset") { setFlt({ type: "", etype: "", eyear: 0 }); return; }
  if (k === "sort") { setFlt({ sort: v === "pop" ? "pop" : "new" }); return; }
  if (k === "type") setFlt({ type: flt.type === v ? "" : v });
  else if (k === "etype") setFlt({ etype: flt.etype === v ? "" : v });
  else if (k === "eyear") setFlt({ eyear: flt.eyear === Number(v) ? 0 : (Number(v) || 0) });
}

elDrill.addEventListener("click", e => {
  const fb = e.target.closest && e.target.closest("[data-f]");
  if (fb) { onFilterClick(fb); return; }
  const a = e.target.closest && e.target.closest("a[data-dept]");
  if (a) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // নতুন ট্যাবে খোলা যায়
    e.preventDefault();
    navigate({ dept: a.getAttribute("data-dept"), year: Number(a.getAttribute("data-year")) || 0, course: a.getAttribute("data-course") || "" });
    return;
  }
  onFileClick(e);
});
elRecent.addEventListener("click", onFileClick);

/* পুনরায় চেষ্টা */
document.addEventListener("click", e => {
  if (e.target.closest && e.target.closest("[data-lib-retry]")) load(true);
});

/* বিভাগের কার্ডে ক্লিক (library.js এই ইভেন্ট দেয়) */
document.addEventListener("lib:dept", e => navigate({ dept: e.detail.slug, year: 0, course: "" }));

/* কলেজ ফিল্টার বদলালে: সব স্তরে (বিভাগ/বর্ষ/কোর্স/সার্চ) প্রযোজ্য, আর লিংকেও ওঠে */
document.addEventListener("lib:college", () => {
  updateUrl(false);
  /* হোমে library.js নিজেই কার্ড আঁকে (অ্যানিমেশনসহ); এখানে শুধু ফাইলের সারি */
  if (view.dept || flt.q.trim()) renderView(); else renderRecent($("lib-files"));
});

/* ভাষা ও তালিকা বদলালে নতুন করে আঁকা (library.js-এর হুকের পরে চলে) */
const prevLang = window.onLang;
window.onLang = function () {
  if (typeof prevLang === "function") { try { prevLang(); } catch (e) { /* অন্য হুক */ } }
  labelSearch();
  renderView();
};
const prevChange = D.onChange;
D.onChange = function () {
  if (typeof prevChange === "function") prevChange();
  renderView();
};

/* ---------- চালু ---------- */
UI.setFilesRenderer(renderRecent);
UI.setCountFn((dept, c) => phase === "ready" ? countFor(dept, c) : 0);

window.LibBrowse = {
  files: () => files.slice(),
  find: id => files.find(f => f.id === id) || null,
  view: () => ({ dept: view.dept, year: view.year, course: view.course }),
  go: v => navigate(v || {}),
  ready: () => phase === "ready",
  reload: () => load(true)
};

labelSearch();
{
  const u = readUrl();
  applying = true;
  view = u.view; flt = u.flt;
  if (u.college) UI.setCollege(u.college);
  applying = false;
}
syncSearchBox();
const startedOnRoute = !!view.dept || !!flt.q.trim();
renderAll();
if (startedOnRoute) setTimeout(() => elBrowse.scrollIntoView({ behavior: "auto", block: "start" }), 60);
load(false);
