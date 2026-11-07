/* library-extras.js — লাইব্রেরির কাউন্টার ও রিপোর্ট (ধাপ ৯)
 *
 * কাউন্টার: "lib:viewed" (মডাল খুললে) ও "lib:download" (ডাউনলোড বাটনে) ইভেন্টে lib_resources-এর
 *   views / downloads ঠিক +১ বাড়ায় (Rules শুধু approved ফাইলে ও সর্বোচ্চ +১ মানে)।
 *   এক ব্রাউজারে একই ফাইলের ভিউ সেশনে একবার, ডাউনলোড ২৪ ঘণ্টায় একবার গোনা হয়।
 *   মনে রাখবেন: এটি ব্রাউজার-ভিত্তিক সুরক্ষা; কেউ চাইলে সরাসরি API ডেকে সংখ্যা বাড়াতে পারে, তাই
 *   "জনপ্রিয়" সাজানোকে নিখুঁত পরিসংখ্যান ধরবেন না।
 *
 * রিপোর্ট: window.LibReport.send(file, reason, note) → "ok" | "dup" | "error"
 *   lib_reports/{ফাইল ID}_{ব্রাউজারের র‍্যান্ডম কী}-তে লেখে, তাই এক ব্রাউজার একই ফাইল একবারই রিপোর্ট করতে পারে
 *   (দ্বিতীয়বার Rules-এ আটকায়, আমরা সেটাকে "dup" ধরি)।
 */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, updateDoc, setDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const ID_RE = /^[A-Za-z0-9_-]{10,120}$/;
const REASONS = ["broken", "private", "wrong", "inappropriate", "copyright", "other"];
const DAY = 864e5;

/* ---------- কাউন্টার ---------- */
function seen(store, key, ttl) {
  try {
    const v = store.getItem(key);
    if (!v) return false;
    return ttl ? Date.now() - Number(v) < ttl : true;
  } catch (e) { return false; }
}
function mark(store, key) { try { store.setItem(key, String(Date.now())); } catch (e) { /* ব্লক করা */ } }

async function bump(f, field) {
  if (!f || !ID_RE.test(f.id)) return;
  const store = field === "views" ? sessionStorage : localStorage;
  const key = "dcu-lib-" + field + "-" + f.id;
  if (seen(store, key, field === "views" ? 0 : DAY)) return;
  mark(store, key);
  try {
    await updateDoc(doc(db, "lib_resources", f.id), { [field]: increment(1) });
    f[field] = (Number(f[field]) || 0) + 1;
  } catch (e) { console.warn("কাউন্টার বাড়ানো যায়নি", e && e.code); }
}
document.addEventListener("lib:viewed", e => bump(e.detail && e.detail.file, "views"));
document.addEventListener("lib:download", e => bump(e.detail && e.detail.file, "downloads"));

/* ---------- রিপোর্ট ---------- */
const RK = "dcu-lib-rk", RD = "dcu-lib-rep";
let memKey = "";
function reporterKey() {
  try {
    const k = localStorage.getItem(RK);
    if (k && /^[A-Za-z0-9_-]{8,40}$/.test(k)) return k;
  } catch (e) { /* নিচে বানাই */ }
  if (memKey) return memKey;
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const r = new Uint8Array(20);
  (window.crypto || window.msCrypto).getRandomValues(r);
  let k = ""; r.forEach(n => { k += abc[n % abc.length]; });
  memKey = k;
  try { localStorage.setItem(RK, k); } catch (e) { /* ঠিক আছে */ }
  return k;
}
function doneSet() {
  try { const a = JSON.parse(localStorage.getItem(RD)); return new Set(Array.isArray(a) ? a : []); } catch (e) { return new Set(); }
}
function markDone(id) {
  const s = doneSet(); s.add(id);
  try { localStorage.setItem(RD, JSON.stringify(Array.from(s).slice(-300))); } catch (e) { /* ঠিক আছে */ }
}

window.LibReport = {
  reasons: REASONS.slice(),
  done: id => doneSet().has(id),
  async send(f, reason, note) {
    if (!f || !ID_RE.test(f.id) || REASONS.indexOf(reason) < 0) return "error";
    if (doneSet().has(f.id)) return "dup";
    const key = reporterKey();
    try {
      await setDoc(doc(db, "lib_reports", f.id + "_" + key), {
        resourceId: f.id,
        reporterKey: key,
        reason,
        note: String(note || "").replace(/\s+/g, " ").trim().slice(0, 300),
        createdAt: serverTimestamp()
      });
      markDone(f.id);
      return "ok";
    } catch (e) {
      console.warn("রিপোর্ট পাঠানো যায়নি", e && e.code);
      if (e && e.code === "permission-denied") { markDone(f.id); return "dup"; }   // সম্ভবত আগেই রিপোর্ট করা
      return "error";
    }
  }
};
