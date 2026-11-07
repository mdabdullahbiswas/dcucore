/* library-submit.js — লাইব্রেরির ফাইল জমার ফর্ম (ধাপ ৪)
 *
 * চার ধাপ: (১) Drive লিংক → (২) কলেজ/বিভাগ/বর্ষ/কোর্স → (৩) ধরন, পরীক্ষা, শিরোনাম → (৪) যাচাই ও জমা।
 * জমা হয় Firestore-এর lib_resources/{ফাইল ID}-তে, status = "pending" দিয়ে।
 * ফিল্ডের নাম ও সীমা firestore.rules-এর lib_resources create নিয়মের সঙ্গে হুবহু মেলানো।
 *
 * স্প্যাম রোধ (ব্রাউজারে): honeypot, ন্যূনতম সময়, দুই জমার মাঝে বিরতি, দিনে সর্বোচ্চ জমা।
 * একই লিংক দুবার: ডকুমেন্ট ID = ফাইল ID, তাই দ্বিতীয় create Rules-এ ব্যর্থ হয়।
 */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const CFG = {
  apiKey: "AIzaSyBgaBKzAAwzHI7ahGKqzbrX9MknWWIm9j0",
  authDomain: "dcu-blood-bank.firebaseapp.com",
  projectId: "dcu-blood-bank",
  storageBucket: "dcu-blood-bank.firebasestorage.app",
  messagingSenderId: "835221249900",
  appId: "1:835221249900:web:facf545941825a4efa5d49"
};
const app = getApps().find(a => a.name === "dcu-library") || initializeApp(CFG, "dcu-library");
const db = getFirestore(app);

const D = window.LibData;
const $ = id => document.getElementById(id);
const form = $("ls-form");
if (!D || !form) throw new Error("library-submit: LibData বা ফর্ম পাওয়া যায়নি");

/* ---------- সীমা (Rules-এর সঙ্গে মেলানো) ---------- */
const MIN_FILL_MS = 12000;          // ফর্ম খোলার পর কমপক্ষে এত সময় না গেলে জমা নেয় না
const COOLDOWN_MS = 60 * 1000;      // এক ব্রাউজারে দুই জমার মাঝের বিরতি
const DAILY_MAX = 10;               // এক ব্রাউজারে দিনে সর্বোচ্চ জমা
const FILE_ID_RE = /^[A-Za-z0-9_-]{10,120}$/;

/* ---------- ভাষা সহায়ক ---------- */
const lang = () => document.documentElement.getAttribute("data-lang") === "en" ? "en" : "bn";
const L = s => { const i = s.indexOf("|"); return i < 0 ? s : (lang() === "en" ? s.slice(i + 1) : s.slice(0, i)); };
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
/* দুই ভাষার লেখা একসঙ্গে বসায়; CSS বর্তমান ভাষাটাই দেখায়, তাই ভাষা বদলালে নতুন করে আঁকতে হয় না */
function bi(s) {
  const i = s.indexOf("|");
  return '<span class="lib-bn">' + esc(s.slice(0, i)) + '</span><span class="lib-en">' + esc(s.slice(i + 1)) + "</span>";
}
const clean = s => String(s || "").replace(/\s+/g, " ").trim();
const reduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- অবস্থা ---------- */
let step = 1;
let openedAt = Date.now();
let link = null;            // { id, url } — যাচাই হওয়া লিংক
let linkDup = false;        // লাইব্রেরিতে (approved) আগেই আছে
let linkPromise = Promise.resolve();
let probeSeq = 0;
let titleTouched = false;
let courseFromList = false;
let sending = false;

const panes = Array.from(form.querySelectorAll(".ls-pane"));
const stepEls = Array.from(document.querySelectorAll("#ls-steps li"));
const btnPrev = $("ls-prev"), btnNext = $("ls-next"), btnSend = $("ls-send");

/* ---------- Drive লিংক থেকে ফাইল ID ---------- */
function parseDrive(raw) {
  raw = String(raw || "").trim();
  if (!raw) return { err: "empty" };
  let u;
  try { u = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw); } catch (e) { return { err: "format" }; }
  const host = u.hostname.toLowerCase(), p = u.pathname;
  if (host !== "drive.google.com" && host !== "docs.google.com") return { err: "host" };
  if (/\/folders\//.test(p) || /\/drive\/(u\/\d+\/)?(my-drive|shared-with-me)/.test(p)) return { err: "folder" };
  if (/^\/forms\//.test(p)) return { err: "form" };

  let m, id = "", url = "";
  if (host === "docs.google.com") {
    m = p.match(/^\/(document|spreadsheets|presentation)\/d\/([A-Za-z0-9_-]{10,120})/);
    if (!m) return { err: "format" };
    id = m[2];
    url = "https://docs.google.com/" + m[1] + "/d/" + id + "/preview";
  } else {
    m = p.match(/\/file\/d\/([A-Za-z0-9_-]{10,120})/);
    id = m ? m[1] : (u.searchParams.get("id") || "");
    if (!FILE_ID_RE.test(id)) return { err: "format" };
    url = "https://drive.google.com/file/d/" + id + "/view";
  }
  return { id, url };
}

const LINK_ERR = {
  host: "এটি Google Drive-এর লিংক নয়। drive.google.com বা docs.google.com-এর লিংক দিন।|This is not a Google Drive link. Use a link from drive.google.com or docs.google.com.",
  folder: "এটি ফোল্ডারের লিংক। একটি ফাইলের লিংক দিন; একাধিক ফাইল হলে প্রতিটি আলাদা করে জমা দিন।|This is a folder link. Use a link to one file; for several files, submit each one separately.",
  form: "Google Forms জমা নেওয়া হয় না। ফাইলের লিংক দিন।|Google Forms are not accepted. Use a link to a file.",
  format: "লিংক থেকে ফাইল ID পাওয়া যায়নি। Drive-এর “Copy link” দিয়ে নেওয়া পুরো লিংকটি পেস্ট করুন।|Could not find a file ID in this link. Paste the full link from Drive’s “Copy link”."
};

function setStatus(state, html) {
  const el = $("ls-url-status");
  el.setAttribute("data-state", state);
  el.innerHTML = html || "";
  $("ls-url").setAttribute("aria-invalid", state === "err" || state === "dup" ? "true" : "false");
}

function probeThumb(id) {
  return new Promise(resolve => {
    const url = "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w200";
    const im = new Image();
    im.referrerPolicy = "no-referrer";
    const t = setTimeout(() => { im.onload = im.onerror = null; resolve(null); }, 8000);
    im.onload = () => { clearTimeout(t); resolve(im.naturalWidth > 1 ? url : null); };
    im.onerror = () => { clearTimeout(t); resolve(null); };
    im.src = url;
  });
}

/* approved ফাইলের ক্ষেত্রেই পড়া যায়; pending বা অনুপস্থিত হলে Rules আটকায়, তাই সেটা "নেই" ধরা হয়।
 * pending-এর ডুপ্লিকেট জমার সময় Rules নিজেই ঠেকায়। */
async function existsApproved(id) {
  try { return (await getDoc(doc(db, "lib_resources", id))).exists(); } catch (e) { return false; }
}

function checkLink() {
  const raw = $("ls-url").value;
  const seq = ++probeSeq;
  link = null; linkDup = false;
  if (!raw.trim()) { setStatus("idle", ""); linkPromise = Promise.resolve(); return linkPromise; }

  const r = parseDrive(raw);
  if (r.err) { setStatus("err", bi(LINK_ERR[r.err])); linkPromise = Promise.resolve(); return linkPromise; }
  link = r;
  setStatus("check", '<span class="ls-spin" aria-hidden="true"></span><span>' + bi("লিংক যাচাই হচ্ছে…|Checking the link…") + "</span>");

  linkPromise = Promise.all([existsApproved(r.id), probeThumb(r.id)]).then(([dup, thumb]) => {
    if (seq !== probeSeq) return;
    const idLine = "<small>" + bi("ফাইল ID|File ID") + ": " + esc(r.id.length > 22 ? r.id.slice(0, 10) + "…" + r.id.slice(-6) : r.id) + "</small>";
    if (dup) {
      linkDup = true;
      setStatus("dup", "<span>" + bi("এই ফাইল আগেই লাইব্রেরিতে আছে। অন্য ফাইল জমা দিন।|This file is already in the library. Please submit a different file.") + idLine + "</span>");
    } else if (thumb) {
      setStatus("ok", '<img src="' + esc(thumb) + '" alt="" referrerpolicy="no-referrer"><span>' + bi("লিংক ঠিক আছে, ফাইল খোলা যাচ্ছে।|Link looks good and the file opens.") + idLine + "</span>");
    } else {
      setStatus("warn", "<span>" + bi("লিংক ঠিক আছে, কিন্তু ফাইল সবার জন্য খোলা কিনা যাচাই করা গেল না। শেয়ার সেটিং “Anyone with the link” আছে কিনা দেখে নিন।|The link is valid, but we could not confirm that anyone can open the file. Check that sharing is set to “Anyone with the link”.") + idLine + "</span>");
    }
  });
  return linkPromise;
}

let linkTimer = 0;
$("ls-url").addEventListener("input", () => { clearTimeout(linkTimer); linkTimer = setTimeout(checkLink, 400); });
$("ls-url").addEventListener("paste", () => setTimeout(() => { clearTimeout(linkTimer); checkLink(); }, 0));
$("ls-url").addEventListener("blur", () => { clearTimeout(linkTimer); if (probeSeq === 0 || !link) checkLink(); });

/* ---------- ফর্মের মান পড়া ---------- */
const radio = name => { const r = form.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ""; };

function renderChips(boxId, name, items, valueOf, labelOf) {
  const box = $(boxId), cur = radio(name);
  box.innerHTML = items.map((it, i) => {
    const v = valueOf(it);
    return '<label class="ls-chip"><input type="radio" name="' + name + '" value="' + esc(v) + '"' + (String(v) === cur ? " checked" : "") +
      (i === 0 ? ' data-first="1"' : "") + "><span>" + esc(labelOf(it)) + "</span></label>";
  }).join("");
}

function renderColleges() { renderChips("ls-college-chips", "college", D.colleges().concat([D.ALL_COLLEGE]), c => c.slug, c => D.name(c, lang())); }
function renderYears() { renderChips("ls-year-chips", "year", D.YEARS, y => y.n, y => D.name(y, lang())); }
function renderFileTypes() { renderChips("ls-ftype-chips", "ftype", D.FILE_TYPES, t => t.id, t => D.name(t, lang())); }
function renderExamTypes() { renderChips("ls-etype-chips", "etype", D.EXAM_TYPES, t => t.id, t => D.name(t, lang())); }

function renderDepts() {
  const sel = $("ls-dept"), college = radio("college"), cur = sel.value;
  if (!college) {
    sel.innerHTML = '<option value="">' + esc(L("আগে কলেজ বেছে নিন|Choose a college first")) + "</option>";
    sel.disabled = true;
    return;
  }
  const list = D.departments(college);
  sel.disabled = false;
  sel.innerHTML = '<option value="">' + esc(L("বিভাগ বেছে নিন|Choose a department")) + "</option>" +
    list.map(d => '<option value="' + esc(d.slug) + '">' + esc(D.name(d, lang())) + "</option>").join("");
  sel.value = list.some(d => d.slug === cur) ? cur : "";
}

function renderCourses() {
  const sel = $("ls-course"), hint = $("ls-course-hint"), pick = $("ls-course-pick");
  const dept = $("ls-dept").value, year = radio("year");
  const list = dept && year ? D.courses(dept, year) : [];
  const cur = sel.value;

  if (!dept || !year) {
    pick.hidden = true;
    return;
  }
  if (!list.length) {
    pick.hidden = true;
    hint.textContent = "";
    return;
  }
  pick.hidden = false;
  sel.innerHTML = '<option value="">' + esc(L("তালিকা থেকে বেছে নিন|Pick from the list")) + "</option>" +
    list.map(c => '<option value="' + esc(c.code) + '">' + esc(c.code + " — " + D.name(c, lang()) + (c.opt ? " (" + L("ঐচ্ছিক|optional") + ")" : "")) + "</option>").join("") +
    '<option value="__other">' + esc(L("অন্য কোর্স (নিজে লিখব)|Another course (I will type it)")) + "</option>";
  sel.value = Array.from(sel.options).some(o => o.value === cur) ? cur : "";
  hint.textContent = L("তালিকায় না থাকলে নিচের ঘরে কোড ও নাম নিজে লিখুন।|If it is not listed, type the code and name below.");
}

function renderExamYears() {
  const sel = $("ls-eyear"), cur = sel.value, now = new Date().getFullYear();
  let h = '<option value="0">' + esc(L("প্রযোজ্য নয় বা জানি না|Not applicable or unknown")) + "</option>";
  for (let y = now; y >= 2000; y--) h += '<option value="' + y + '">' + (lang() === "en" ? y : y.toLocaleString("bn-BD", { useGrouping: false })) + "</option>";
  sel.innerHTML = h;
  sel.value = cur && Array.from(sel.options).some(o => o.value === cur) ? cur : "0";
}

function applyPlaceholders() {
  form.querySelectorAll("[data-ph]").forEach(el => el.setAttribute("placeholder", L(el.getAttribute("data-ph"))));
}

function renderAll() {
  renderColleges(); renderYears(); renderFileTypes(); renderExamTypes();
  renderDepts(); renderCourses(); renderExamYears(); applyPlaceholders();
  if (step === 4) renderSummary();
}

/* ---------- ধাপ ২-এর নির্ভরতা ---------- */
$("ls-college-chips").addEventListener("change", () => { renderDepts(); renderCourses(); clearErr("college"); });
$("ls-year-chips").addEventListener("change", () => { resetListedCourse(); renderCourses(); clearErr("year"); });
$("ls-dept").addEventListener("change", () => { resetListedCourse(); renderCourses(); clearErr("dept"); });

/* সাজেশন থেকে ভরা কোড/নাম থাকলে বিভাগ বা বর্ষ বদলানোর সঙ্গে সেগুলো মুছে যায়; হাতে লেখাগুলো থাকে */
function resetListedCourse() {
  $("ls-course").value = "";
  if (courseFromList) { $("ls-code").value = ""; $("ls-cname").value = ""; courseFromList = false; }
}

$("ls-course").addEventListener("change", e => {
  const v = e.target.value;
  if (!v) return;
  if (v === "__other") {
    courseFromList = false;
    $("ls-code").value = ""; $("ls-cname").value = "";
    $("ls-code").focus();
    return;
  }
  const c = D.courses($("ls-dept").value, radio("year")).find(x => x.code === v);
  if (!c) return;
  $("ls-code").value = c.code;
  $("ls-cname").value = c.en || c.bn || "";
  courseFromList = true;
  clearErr("code"); clearErr("cname");
});
["ls-code", "ls-cname"].forEach(id => $(id).addEventListener("input", () => { courseFromList = false; clearErr(id === "ls-code" ? "code" : "cname"); }));

/* ---------- ধাপ ৩ ---------- */
$("ls-title").addEventListener("input", () => { titleTouched = true; clearErr("title"); });
$("ls-desc").addEventListener("input", e => {
  $("ls-desc-count").textContent = e.target.value.length + " / 500";
  clearErr("desc");
});
$("ls-submitter").addEventListener("input", () => clearErr("submitter"));
$("ls-ftype-chips").addEventListener("change", () => {
  clearErr("ftype");
  if (!titleTouched) $("ls-title").value = suggestedTitle();   // শিরোনাম নিজে না বদলালে ধরনসহ সাজেশন হালনাগাদ
});
$("ls-etype-chips").addEventListener("change", () => { clearErr("etype"); });
$("ls-agree").addEventListener("change", () => clearErr("agree"));

function suggestedTitle() {
  const ft = D.fileType(radio("ftype"));
  const base = clean($("ls-code").value + " " + $("ls-cname").value);
  const t = base + (ft ? " — " + D.name(ft, lang()) : "");
  return t.slice(0, 120);
}
function prefillTitle() {
  const t = $("ls-title");
  if (!titleTouched || !t.value.trim()) { t.value = suggestedTitle(); titleTouched = false; }
}

/* ---------- ত্রুটি দেখানো ---------- */
const ERR_TARGET = {
  url: "ls-url", college: "ls-college", dept: "ls-dept", year: "ls-year", code: "ls-code", cname: "ls-cname",
  ftype: "ls-ftype", etype: "ls-etype", title: "ls-title", desc: "ls-desc", submitter: "ls-submitter", agree: "ls-agree"
};
function showErr(key, msg) {
  const el = $("err-" + key);
  if (el) { el.innerHTML = bi(msg); el.hidden = false; }
  const t = $(ERR_TARGET[key]);
  if (t && t.matches("input,select,textarea")) t.setAttribute("aria-invalid", "true");
  return key;
}
function clearErr(key) {
  const el = $("err-" + key);
  if (el) el.hidden = true;
  const t = $(ERR_TARGET[key]);
  if (t && t.matches("input,select,textarea")) t.removeAttribute("aria-invalid");
}
function focusErr(key) {
  const t = $(ERR_TARGET[key]);
  if (!t) return;
  const f = t.matches("input,select,textarea") ? t : t.querySelector("input");
  if (f) f.focus();
}

/* ---------- ধাপ অনুযায়ী যাচাই ---------- */
async function validate(n) {
  const bad = [];
  if (n === 1) {
    await Promise.race([linkPromise, new Promise(r => setTimeout(r, 3500))]);
    const raw = $("ls-url").value.trim();
    if (!raw) bad.push(showErr("url", "Drive লিংক পেস্ট করুন।|Paste a Drive link."));
    else if (!link) { const r = parseDrive(raw); setStatus("err", bi(LINK_ERR[r.err] || LINK_ERR.format)); bad.push("url"); }
    else if (linkDup) bad.push("url");
    else clearErr("url");
  }
  if (n === 2) {
    if (!radio("college")) bad.push(showErr("college", "কলেজ বেছে নিন।|Choose a college."));
    if (!$("ls-dept").value) bad.push(showErr("dept", "বিভাগ বেছে নিন।|Choose a department."));
    if (!radio("year")) bad.push(showErr("year", "বর্ষ বেছে নিন।|Choose a year."));
    const code = clean($("ls-code").value), name = clean($("ls-cname").value);
    if (code.length < 2 || code.length > 20) bad.push(showErr("code", "কোর্স কোড ২ থেকে ২০ অক্ষরের মধ্যে লিখুন।|Enter a course code of 2 to 20 characters."));
    if (name.length < 2 || name.length > 100) bad.push(showErr("cname", "কোর্সের নাম ২ থেকে ১০০ অক্ষরের মধ্যে লিখুন।|Enter a course name of 2 to 100 characters."));
  }
  if (n === 3) {
    if (!radio("ftype")) bad.push(showErr("ftype", "ফাইলের ধরন বেছে নিন।|Choose a file type."));
    if (!radio("etype")) bad.push(showErr("etype", "পরীক্ষার ধরন বেছে নিন। প্রযোজ্য না হলে “প্রযোজ্য নয়” দিন।|Choose an exam type, or “Not applicable”."));
    const title = clean($("ls-title").value);
    if (title.length < 3 || title.length > 120) bad.push(showErr("title", "শিরোনাম ৩ থেকে ১২০ অক্ষরের মধ্যে লিখুন।|Enter a title of 3 to 120 characters."));
    if ($("ls-desc").value.length > 500) bad.push(showErr("desc", "বিবরণ ৫০০ অক্ষরের বেশি হবে না।|The description can be at most 500 characters."));
    if (clean($("ls-submitter").value).length > 60) bad.push(showErr("submitter", "নাম ৬০ অক্ষরের বেশি হবে না।|The name can be at most 60 characters."));
  }
  if (n === 4) {
    if (!$("ls-agree").checked) bad.push(showErr("agree", "জমা দিতে নিয়মাবলিতে সম্মত হতে হবে।|You need to agree to the rules to submit."));
  }
  return bad;
}

/* ---------- ধাপ বদল ---------- */
function goto(n, silent) {
  step = n;
  panes.forEach(p => { p.hidden = Number(p.getAttribute("data-step")) !== n; });
  stepEls.forEach((li, i) => {
    li.classList.toggle("done", i + 1 < n);
    li.classList.toggle("cur", i + 1 === n);
    if (i + 1 === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
  });
  btnPrev.hidden = n === 1;
  btnNext.hidden = n === 4;
  btnSend.hidden = n !== 4;
  if (n === 3) prefillTitle();
  if (n === 4) { renderSummary(); $("err-submit").hidden = true; }
  if (silent) return;
  const head = $("h-" + n);
  if (head) head.focus({ preventScroll: true });
  const top = form.getBoundingClientRect().top + window.scrollY - 90;
  window.scrollTo({ top: Math.max(0, Math.min(top, window.scrollY)), behavior: reduced() ? "auto" : "smooth" });
}

async function next() {
  if (sending) return;
  btnNext.disabled = true;
  try {
    const bad = await validate(step);
    if (bad.length) { focusErr(bad[0]); return; }
    goto(step + 1);
  } finally { btnNext.disabled = false; }
}
btnNext.addEventListener("click", next);
btnPrev.addEventListener("click", () => { if (step > 1 && !sending) goto(step - 1); });

/* ---------- সারাংশ ---------- */
function collectData() {
  const college = radio("college"), dept = $("ls-dept").value;
  return {
    fileId: link ? link.id : "",
    driveUrl: link ? link.url : "",
    college, dept,
    year: Number(radio("year")),
    courseCode: clean($("ls-code").value),
    courseName: clean($("ls-cname").value),
    fileType: radio("ftype"),
    examType: radio("etype"),
    examYear: Number($("ls-eyear").value) || 0,
    title: clean($("ls-title").value),
    desc: $("ls-desc").value.trim(),
    submitter: clean($("ls-submitter").value)
  };
}

function renderSummary() {
  const d = collectData(), l = lang();
  const rows = [
    ["শিরোনাম|Title", d.title],
    ["ফাইল|File", d.driveUrl],
    ["কলেজ|College", D.name(D.college(d.college), l)],
    ["বিভাগ|Department", D.name(D.department(d.dept), l)],
    ["বর্ষ|Year", D.name(D.year(d.year), l)],
    ["কোর্স|Course", d.courseCode + " — " + d.courseName],
    ["ধরন|Type", D.name(D.fileType(d.fileType), l)],
    ["পরীক্ষা|Exam", D.name(D.examType(d.examType), l) + (d.examYear ? ", " + (l === "en" ? d.examYear : d.examYear.toLocaleString("bn-BD", { useGrouping: false })) : "")]
  ];
  if (d.desc) rows.push(["বিবরণ|Description", d.desc]);
  rows.push(["জমাদাতা|Submitted by", d.submitter || L("নাম ছাড়া|Anonymous")]);
  $("ls-sum").innerHTML = rows.map(r => "<div><dt>" + esc(L(r[0])) + "</dt><dd>" + esc(r[1]) + "</dd></div>").join("");
}

/* ---------- জমা ---------- */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ব্রাউজার বন্ধ করে রাখলেও চলবে */ } }
};
const today = () => new Date().toISOString().slice(0, 10);

function gate() {
  if (Date.now() - openedAt < MIN_FILL_MS) {
    return "একটু ধীরে। কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।|Slow down a little. Try again in a few seconds.";
  }
  const last = Number(store.get("lib-sub-last") || 0);
  if (last && Date.now() - last < COOLDOWN_MS) {
    const s = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
    return "আরেকটি ফাইল জমা দিতে আরও " + s + " সেকেন্ড অপেক্ষা করুন।|Please wait " + s + " more seconds before submitting another file.";
  }
  let day = null;
  try { day = JSON.parse(store.get("lib-sub-day") || "null"); } catch (e) { day = null; }
  if (day && day.d === today() && day.n >= DAILY_MAX) {
    return "আজকের জন্য জমার সীমা শেষ। কাল আবার চেষ্টা করুন।|You have reached today’s submission limit. Please try again tomorrow.";
  }
  return "";
}
function recordSubmit() {
  store.set("lib-sub-last", String(Date.now()));
  let day = null;
  try { day = JSON.parse(store.get("lib-sub-day") || "null"); } catch (e) { day = null; }
  store.set("lib-sub-day", JSON.stringify({ d: today(), n: day && day.d === today() ? day.n + 1 : 1 }));
}

function submitError(e) {
  const code = e && e.code;
  if (code === "permission-denied") {
    return "জমা হয়নি। এই ফাইল হয়তো আগেই জমা হয়েছে (অনুমোদনের অপেক্ষায়) অথবা কোনো তথ্য নিয়ম মেনে নেই। লিংক বদলে বা তথ্য দেখে আবার চেষ্টা করুন।|Not submitted. This file may already have been submitted (and is waiting for approval), or some details do not meet the rules. Check the link and details and try again.";
  }
  if (code === "unavailable" || code === "deadline-exceeded" || (navigator.onLine === false)) {
    return "ইন্টারনেট সংযোগে সমস্যা। সংযোগ দেখে আবার চেষ্টা করুন।|Connection problem. Check your internet and try again.";
  }
  return "জমা হয়নি। একটু পরে আবার চেষ্টা করুন।|Could not submit. Please try again in a moment.";
}

async function submit() {
  if (sending) return;
  const err = $("err-submit");
  err.hidden = true;

  /* হানিপট ভরা থাকলে বটের জমা: চুপচাপ সফল দেখিয়ে কিছু লেখা হয় না */
  if ($("ls-hp").value) { showDone(); return; }

  /* সব ধাপ আবার যাচাই (কেউ ধাপ এড়িয়ে এলে ধরা পড়ে) */
  for (let n = 1; n <= 4; n++) {
    const bad = await validate(n);
    if (bad.length) { if (n !== step) goto(n); focusErr(bad[0]); return; }
  }
  const g = gate();
  if (g) { err.innerHTML = bi(g); err.hidden = false; return; }

  const d = collectData();
  if (!FILE_ID_RE.test(d.fileId) || !D.department(d.dept) || !D.college(d.college)) { goto(1); return; }

  sending = true;
  btnSend.disabled = true; btnPrev.disabled = true;
  btnSend.firstElementChild.textContent = L("জমা হচ্ছে…|Submitting…");
  try {
    await setDoc(doc(db, "lib_resources", d.fileId), {
      fileId: d.fileId,
      driveUrl: d.driveUrl,
      status: "pending",
      college: d.college,
      dept: d.dept,
      year: d.year,
      courseCode: d.courseCode,
      courseName: d.courseName,
      fileType: d.fileType,
      examType: d.examType,
      examYear: d.examYear,
      title: d.title,
      desc: d.desc,
      submitter: d.submitter,
      views: 0,
      downloads: 0,
      createdAt: serverTimestamp()
    });
    recordSubmit();
    showDone();
  } catch (e) {
    err.innerHTML = bi(submitError(e));
    err.hidden = false;
  } finally {
    sending = false;
    btnSend.disabled = false; btnPrev.disabled = false;
    btnSend.firstElementChild.textContent = L("ফাইল জমা দিন|Submit file");
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  if (step < 4) next(); else submit();
});

/* ---------- সফল অবস্থা ও নতুন করে শুরু ---------- */
function showDone() {
  form.hidden = true;
  $("ls-steps").hidden = true;
  $("ls-done").hidden = false;
  $("ls-done-h").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
}

$("ls-again").addEventListener("click", () => {
  form.reset();
  link = null; linkDup = false; probeSeq++; titleTouched = false; courseFromList = false;
  setStatus("idle", "");
  form.querySelectorAll("[aria-invalid]").forEach(el => el.removeAttribute("aria-invalid"));
  form.querySelectorAll(".ls-err").forEach(el => { el.hidden = true; });
  $("ls-desc-count").textContent = "0 / 500";
  openedAt = Date.now();
  renderAll();
  $("ls-done").hidden = true;
  form.hidden = false;
  $("ls-steps").hidden = false;
  goto(1);
  $("ls-url").focus();
});

/* ---------- ভাষা বদলালে নতুন করে আঁকা (ইনপুটের মান থাকে) ---------- */
const prevOnLang = window.onLang;
window.onLang = function () {
  if (typeof prevOnLang === "function") { try { prevOnLang(); } catch (e) { /* অন্য পেজের হুক */ } }
  renderAll();
  if (step === 3 && !titleTouched) $("ls-title").value = suggestedTitle();
};

renderAll();
goto(1, true);
