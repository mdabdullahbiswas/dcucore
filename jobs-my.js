/* jobs-my.js — "আমার পোস্ট" (ধাপ ১০)
 *
 * লগইন করা ব্যবহারকারীর নিজের সব পোস্ট (pending / approved / closed / rejected) দেখায় এবং Rules যা অনুমতি দেয় ঠিক তাই করতে দেয়:
 *   • নবায়ন: শুধু approved পোস্টের expiresAt = এখন + ৩০ দিন
 *   • পূরণ হয়েছে: filled টগল
 *   • বন্ধ করা: approved/pending → closed (এরপর আর খোলা যায় না)
 *   • মোছা: প্রথমে private/contact, তারপর পোস্ট (একই ব্যাচে)
 * কনটেন্ট বদলানো যায় না (পুনরায় অনুমোদনের জন্য মুছে নতুন পোস্ট করতে হয়) — এটাই Rules-এর নিয়ম।
 *
 * কোয়েরি: where("authorUid" == uid) — একটিমাত্র শর্ত, তাই কোনো কম্পোজিট ইনডেক্স লাগে না; সাজানো ক্লায়েন্টে।
 */
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, collection, getDocs, updateDoc, deleteDoc, writeBatch, query, where, limit, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const CFG_FB = {
  apiKey: "AIzaSyBgaBKzAAwzHI7ahGKqzbrX9MknWWIm9j0",
  authDomain: "dcu-blood-bank.firebaseapp.com",
  projectId: "dcu-blood-bank",
  storageBucket: "dcu-blood-bank.firebasestorage.app",
  messagingSenderId: "835221249900",
  appId: "1:835221249900:web:facf545941825a4efa5d49"
};
let app; try { app = getApp(); } catch (e) { app = initializeApp(CFG_FB); }
const auth = getAuth(app);
/* সব অ্যাডমিন/পাবলিক পেজের মতো একই জায়গায় (localStorage) লগইন রাখা: নইলে এই পেজ খুললেই অন্য পেজের লগইন সরে যায় */
setPersistence(auth, browserLocalPersistence).catch(() => {});
const db = getFirestore(app);

const D = window.JobsData;
const $ = id => document.getElementById(id);
if (!D || !$("jm-list")) throw new Error("jobs-my: JobsData বা পেজের অংশ পাওয়া যায়নি");
const LIM = D.LIMITS;
const FETCH_LIMIT = 100;
const DAY = 86400000;

/* ---------- সহায়ক ---------- */
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const bi = (bn, en) => '<span class="jobs-bn">' + esc(bn) + '</span><span class="jobs-en">' + esc(en) + "</span>";
const bnNum = n => Number(n).toLocaleString("bn-BD");
const svg = (path, n) => '<svg viewBox="0 0 24 24" width="' + n + '" height="' + n + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>";
const lab = (list, slug, lang) => D.label(list, slug, lang);
const str = v => typeof v === "string" ? v : "";
const intv = v => typeof v === "number" && isFinite(v) ? v : 0;
const strArr = a => Array.isArray(a) ? a.filter(x => typeof x === "string") : [];
const tsMs = t => t && typeof t.toMillis === "function" ? t.toMillis() : 0;
const listBi = (list, slugs, n) => {
  const s = slugs.slice(0, n), extra = slugs.length - s.length;
  let bn = s.map(x => lab(list, x, "bn")).join("، "), en = s.map(x => lab(list, x, "en")).join(", ");
  if (extra > 0) { bn += " +" + bnNum(extra); en += " +" + extra; }
  return bi(bn, en);
};
const fmtDate = ms => {
  const o = { day: "numeric", month: "long", year: "numeric" }, d = new Date(ms);
  return bi(d.toLocaleDateString("bn-BD", o), d.toLocaleDateString("en-GB", o));
};

const ICON = {
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  store: '<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 20h20"/>'
};
const PIN = '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>';
const MODE_ICON = '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>';

/* ---------- অবস্থা ---------- */
const S = { user: null, authKnown: false, posts: [], loaded: false, failed: false, busy: "", ask: null, loadId: 0, focus: "" };
let okTimer = 0;

function normalize(id, d) {
  if (!d || !D.get("types", d.type)) return null;
  const status = ["pending", "approved", "closed", "rejected"].includes(d.status) ? d.status : "pending";
  return {
    id, type: d.type, title: str(d.title), status,
    mode: D.isKnown("modes", d.mode) ? d.mode : "offline",
    areas: strArr(d.areas), cats: strArr(d.cats),
    salaryMin: intv(d.salaryMin), salaryMax: intv(d.salaryMax),
    salaryUnit: D.isKnown("salaryUnits", d.salaryUnit) ? d.salaryUnit : "negotiable",
    filled: d.filled === true, rejectReason: str(d.rejectReason).slice(0, 200),
    createdMs: tsMs(d.createdAt), expiresMs: tsMs(d.expiresAt)
  };
}

const RANK = { pending: 0, approved: 1, rejected: 2, closed: 3 };
function sortPosts() { S.posts.sort((a, b) => (RANK[a.status] - RANK[b.status]) || (b.createdMs - a.createdMs)); }

/* ---------- বার্তা ---------- */
function say(bn, en, bad) {
  const ok = $("jm-ok"), er = $("jm-bad");
  ok.hidden = true; er.hidden = true;
  clearTimeout(okTimer);
  const el = bad ? er : ok;
  el.innerHTML = bi(bn, en);
  el.hidden = false;
  if (!bad) okTimer = setTimeout(() => { ok.hidden = true; }, 6000);
}
function clearSay() { $("jm-ok").hidden = true; $("jm-bad").hidden = true; }

/* ---------- কার্ড ---------- */
function payHTML(p) {
  const open = (!p.salaryMin && !p.salaryMax) || p.salaryUnit === "negotiable";
  return open ? bi(lab("salaryUnits", "negotiable", "bn"), lab("salaryUnits", "negotiable", "en"))
    : bi(D.salaryText(p.salaryMin, p.salaryMax, p.salaryUnit, "bn"), D.salaryText(p.salaryMin, p.salaryMax, p.salaryUnit, "en"));
}

const ST = {
  pending: ["অনুমোদনের অপেক্ষায়", "Pending review"],
  approved: ["প্রকাশিত", "Published"],
  closed: ["বন্ধ", "Closed"],
  rejected: ["বাতিল", "Rejected"]
};

function noteHTML(p, now) {
  const expired = p.status === "approved" && p.expiresMs && p.expiresMs <= now;
  if (p.status === "pending") return bi("অ্যাডমিন দেখে অনুমোদন দিলে পোস্টটি সবাই দেখতে পাবে।", "Once an admin approves it, everyone can see this post.");
  if (p.status === "rejected") return bi("এই পোস্টটি অনুমোদন পায়নি। প্রয়োজনে তথ্য ঠিক করে নতুন পোস্ট করুন।", "This post was not approved. If needed, fix the details and post again.");
  if (p.status === "closed") return bi("পোস্টটি বন্ধ করা আছে, তালিকায় দেখানো হচ্ছে না।", "This post is closed and is not shown in the list.");
  /* approved */
  if (expired) return bi("মেয়াদ শেষ, তাই তালিকায় দেখানো হচ্ছে না। নবায়ন করলে আজ থেকে আবার ৩০ দিন দেখা যাবে।", "It has expired and is not shown in the list. Renewing shows it again for 30 days from today.");
  const left = Math.max(1, Math.ceil((p.expiresMs - now) / DAY));
  const until = p.expiresMs ? bi("মেয়াদ: ", "Valid until ") + fmtDate(p.expiresMs) + " · " + bi(bnNum(left) + " দিন বাকি", left + (left === 1 ? " day left" : " days left")) : "";
  if (p.filled) return bi("পূরণ হয়েছে চিহ্নিত, তাই তালিকায় দেখানো হচ্ছে না। ", "Marked as filled, so it is not shown in the list. ") + until;
  return bi("সবাই দেখতে পাচ্ছে। ", "Visible to everyone. ") + until + " " + bi("নবায়ন করলে আজ থেকে আবার ৩০ দিন।", "Renewing resets it to 30 days from today.");
}

function actionsHTML(p, now) {
  const a = S.ask && S.ask.id === p.id ? S.ask.kind : "";
  const dis = S.busy ? " disabled" : "";
  if (a) {
    const isDel = a === "delete";
    return '<div class="jm-confirm" role="group" aria-label="' + esc(isDel ? "মোছার নিশ্চিতকরণ" : "বন্ধ করার নিশ্চিতকরণ") + '"><p>' +
      (isDel ? bi("পোস্টটি ও এর যোগাযোগের নম্বর স্থায়ীভাবে মুছে যাবে। ঠিক আছে?", "This post and its contact number will be permanently deleted. Continue?")
             : bi("বন্ধ করলে পোস্টটি আর খোলা যাবে না। ঠিক আছে?", "A closed post cannot be reopened. Continue?")) +
      '</p><div class="jm-actions"><button type="button" class="jobs-btn jm-btn-danger-solid" data-act="' + (isDel ? "delete-yes" : "close-yes") + '" data-id="' + esc(p.id) + '"' + dis + ">" +
      (isDel ? bi("হ্যাঁ, মুছুন", "Yes, delete") : bi("হ্যাঁ, বন্ধ করুন", "Yes, close it")) + '</button>' +
      '<button type="button" class="jobs-btn jobs-btn-plain" data-act="cancel" data-id="' + esc(p.id) + '"' + dis + ">" + bi("না, থাক", "No, keep it") + "</button></div></div>";
  }
  const b = (act, cls, bn, en) => '<button type="button" class="jobs-btn ' + cls + '" data-act="' + act + '" data-id="' + esc(p.id) + '"' + dis + ">" + bi(bn, en) + "</button>";
  let h = "";
  if (p.status === "approved") {
    const live = !p.filled && p.expiresMs > now;
    h += b("renew", "jobs-btn-call", "নবায়ন (৩০ দিন)", "Renew (30 days)");
    h += b("filled", "jobs-btn-plain", p.filled ? "আবার চালু করুন" : "পূরণ হয়েছে", p.filled ? "Show it again" : "Mark as filled");
    if (live) h += '<a class="jobs-btn jobs-btn-plain" href="/jobs#p-' + encodeURIComponent(p.id) + '">' + bi("দেখুন", "View") + "</a>";
  }
  if (p.status === "approved" || p.status === "pending") h += b("close", "jm-btn-danger", "বন্ধ করুন", "Close");
  h += b("delete", "jm-btn-danger", "মুছুন", "Delete");
  return '<div class="jm-actions">' + h + "</div>";
}

function cardHTML(p, now) {
  const t = D.get("types", p.type);
  const expired = p.status === "approved" && p.expiresMs && p.expiresMs <= now;
  let top = '<span class="jobs-card-type">' + bi(t.bn, t.en) + "</span>" +
    '<span class="jm-st jm-st-' + p.status + '">' + bi(ST[p.status][0], ST[p.status][1]) + "</span>";
  if (p.status === "approved" && p.filled) top += '<span class="jm-st jm-st-warn">' + bi("পূরণ হয়েছে", "Filled") + "</span>";
  if (expired) top += '<span class="jm-st jm-st-warn">' + bi("মেয়াদ শেষ", "Expired") + "</span>";

  let meta = "<li>" + svg(MODE_ICON, 15) + bi(lab("modes", p.mode, "bn"), lab("modes", p.mode, "en")) + "</li>";
  if (p.areas.length) meta += "<li>" + svg(PIN, 15) + listBi("areas", p.areas, 2) + "</li>";

  const off = p.status === "closed" || p.status === "rejected";
  return '<article class="jobs-card jm-card' + (off ? " jm-off" : "") + (S.busy === p.id ? " jm-busy" : "") + '" id="jm-c-' + esc(p.id) + '" tabindex="-1" data-id="' + esc(p.id) + '" style="--h:' + t.hue + '">' +
    '<span class="jobs-card-ico">' + svg(ICON[t.icon] || "", 26) + "</span>" +
    '<div class="jobs-card-body">' +
      '<div class="jobs-card-top">' + top + "</div>" +
      '<h3 class="jm-title">' + esc(p.title) + "</h3>" +
      '<ul class="jobs-meta">' + meta + "</ul>" +
      '<p class="jm-note">' + noteHTML(p, now) + "</p>" +
      (p.status === "rejected" && p.rejectReason ? '<p class="jm-reason"><b>' + bi("বাতিলের কারণ: ", "Reason: ") + "</b>" + esc(p.rejectReason) + "</p>" : "") +
      '<div class="jobs-card-foot"><span class="jobs-pay">' + payHTML(p) + '</span><span class="jobs-ago">' + (p.createdMs ? bi("জমা: ", "Posted ") + fmtDate(p.createdMs) : "") + "</span></div>" +
      actionsHTML(p, now) +
    "</div></article>";
}

/* ---------- আঁকা ---------- */
function summary(now) {
  let pend = 0, live = 0;
  S.posts.forEach(p => {
    if (p.status === "pending") pend++;
    else if (p.status === "approved" && !p.filled && p.expiresMs > now) live++;
  });
  const n = S.posts.length;
  return bi("মোট " + bnNum(n) + "টি · চালু " + bnNum(live) + "টি · অপেক্ষায় " + bnNum(pend) + "টি", n + " total · " + live + " live · " + pend + " pending");
}

function render() {
  const list = $("jm-list"), empty = $("jm-empty"), sum = $("jm-summary");
  if (!S.user) return;
  list.setAttribute("aria-busy", S.loaded ? "false" : "true");
  if (!S.loaded) { list.innerHTML = '<p class="jp-hint">' + bi("আপনার পোস্ট আনা হচ্ছে…", "Loading your posts…") + "</p>"; empty.hidden = true; sum.innerHTML = ""; return; }
  if (S.failed) {
    list.innerHTML = "";
    sum.innerHTML = "";
    empty.hidden = false;
    $("jm-empty-h").innerHTML = bi("পোস্ট আনা যায়নি", "Couldn't load your posts");
    $("jm-empty-p").innerHTML = bi("ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।", "Check your internet connection and try again.");
    $("jm-empty-act").innerHTML = '<button type="button" class="jp-btn jp-btn-main" data-act="reload">' + bi("আবার চেষ্টা করুন", "Try again") + "</button>";
    return;
  }
  const now = Date.now();
  if (!S.posts.length) {
    list.innerHTML = "";
    sum.innerHTML = "";
    empty.hidden = false;
    $("jm-empty-h").innerHTML = bi("এখনো কোনো পোস্ট নেই", "No posts yet");
    $("jm-empty-p").innerHTML = bi("এই অ্যাকাউন্ট থেকে কোনো পোস্ট জমা দেওয়া হয়নি। অন্য Google অ্যাকাউন্টে পোস্ট করে থাকলে সেটি দিয়ে লগইন করুন।", "No posts have been submitted from this account. If you posted with another Google account, sign in with that one.");
    $("jm-empty-act").innerHTML = '<a class="jp-btn jp-btn-main" href="/jobs-post">' + bi("প্রথম পোস্ট করুন", "Make your first post") + "</a>";
    return;
  }
  empty.hidden = true;
  sum.innerHTML = summary(now);
  list.innerHTML = S.posts.map(p => cardHTML(p, now)).join("");
  if (S.focus) {
    const c = $("jm-c-" + S.focus);
    S.focus = "";
    if (c) c.focus({ preventScroll: false });
  }
}

/* ---------- লোড ---------- */
async function load() {
  const my = ++S.loadId, u = S.user;
  if (!u) return;
  S.loaded = false; S.failed = false; render();
  try {
    const snap = await getDocs(query(collection(db, "jobs_posts"), where("authorUid", "==", u.uid), limit(FETCH_LIMIT)));
    if (my !== S.loadId) return;
    const out = [];
    snap.forEach(d => { const p = normalize(d.id, d.data()); if (p) out.push(p); });
    S.posts = out; sortPosts();
    S.loaded = true;
  } catch (e) {
    if (my !== S.loadId) return;
    if (window.console) console.warn("jobs-my: পোস্ট আনা যায়নি", e);
    S.posts = []; S.loaded = true; S.failed = true;
  }
  render();
}

/* ---------- কাজ ---------- */
function failMsg(kind, e) {
  const code = e && e.code || "";
  if (code === "unavailable" || code === "deadline-exceeded" || (e && e.message === "Failed to fetch"))
    return ["ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।", "Check your internet connection and try again."];
  if (code === "permission-denied") {
    return kind === "renew"
      ? ["নবায়ন করা যায়নি। আপনার ফোন বা কম্পিউটারের তারিখ ও সময় ঠিক আছে কিনা দেখুন; অথবা পোস্টের অবস্থা বদলে গেছে, পাতাটি রিফ্রেশ করে দেখুন।",
         "Couldn't renew. Check that your device's date and time are correct, or the post's status may have changed; refresh the page."]
      : ["কাজটি করা যায়নি। পোস্টের অবস্থা হয়তো বদলে গেছে; পাতাটি রিফ্রেশ করে দেখুন।", "That didn't work. The post's status may have changed; refresh the page and check."];
  }
  return ["কাজটি করা যায়নি। একটু পরে আবার চেষ্টা করুন।", "That didn't work. Please try again in a moment."];
}

async function act(kind, id) {
  const p = S.posts.find(x => x.id === id);
  if (!p || S.busy) return;
  S.busy = id; S.ask = null; clearSay(); render();
  const ref = doc(db, "jobs_posts", id);
  try {
    if (kind === "renew") {
      const ms = Date.now() + LIM.expiryDays * DAY;
      await updateDoc(ref, { expiresAt: Timestamp.fromMillis(ms) });
      p.expiresMs = ms;
      say("নবায়ন হয়েছে। আজ থেকে আবার " + bnNum(LIM.expiryDays) + " দিন দেখা যাবে।", "Renewed. It will show for another " + LIM.expiryDays + " days from today.");
    } else if (kind === "filled") {
      const v = !p.filled;
      await updateDoc(ref, { filled: v });
      p.filled = v;
      v ? say("পূরণ হয়েছে চিহ্নিত করা হলো; পোস্টটি আর তালিকায় দেখাবে না।", "Marked as filled; the post no longer shows in the list.")
        : say("পোস্টটি আবার চালু করা হলো।", "The post is showing again.");
    } else if (kind === "close") {
      await updateDoc(ref, { status: "closed" });
      p.status = "closed";
      sortPosts();
      say("পোস্টটি বন্ধ করা হয়েছে।", "The post has been closed.");
    } else if (kind === "delete") {
      try {
        const b = writeBatch(db);
        b.delete(doc(db, "jobs_posts", id, "private", "contact"));   // আগে যোগাযোগের নম্বর (Rules-এর নির্দেশ)
        b.delete(ref);
        await b.commit();
      } catch (e1) {
        /* যোগাযোগ-ডকুমেন্ট না থাকলে ব্যাচ ব্যর্থ হতে পারে; তখন শুধু পোস্টটি মোছার চেষ্টা */
        if (!(e1 && e1.code === "permission-denied")) throw e1;
        await deleteDoc(ref);
      }
      S.posts = S.posts.filter(x => x.id !== id);
      say("পোস্টটি মুছে ফেলা হয়েছে।", "The post has been deleted.");
    }
  } catch (e) {
    if (window.console) console.warn("jobs-my:", kind, e);
    const m = failMsg(kind, e);
    say(m[0], m[1], true);
  }
  S.busy = "";
  S.focus = kind === "delete" ? "" : id;
  render();
  if (kind === "delete") $("jm-h1").focus({ preventScroll: true });   // মোছা কার্ডের ফোকাস হারায়, তাই পেজের শিরোনামে
}

/* ---------- লগইন ---------- */
function authErr(bn, en) {
  const el = $("jm-auth-err");
  if (!bn) { el.hidden = true; el.innerHTML = ""; return; }
  el.innerHTML = bi(bn, en); el.hidden = false;
}

async function signIn() {
  const b = $("jm-signin"); b.disabled = true; authErr("");
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (e) {
    const c = e && e.code || "";
    if (c === "auth/popup-closed-by-user" || c === "auth/cancelled-popup-request") authErr("লগইন সম্পূর্ণ হয়নি। আবার চেষ্টা করুন।", "Sign-in was not completed. Please try again.");
    else if (c === "auth/popup-blocked") authErr("ব্রাউজার পপআপ আটকেছে। পপআপ অনুমতি দিয়ে আবার চাপুন।", "Your browser blocked the pop-up. Allow pop-ups and try again.");
    else if (c === "auth/network-request-failed") authErr("ইন্টারনেট সংযোগ দেখুন, তারপর আবার চেষ্টা করুন।", "Check your internet connection and try again.");
    else authErr("লগইন করা গেল না। Chrome বা Safari-তে পেজটি খুলে আবার চেষ্টা করুন (Facebook/Messenger-এর ভেতরের ব্রাউজারে Google লগইন চলে না)।", "Could not sign in. Open this page in Chrome or Safari and try again (Google sign-in does not work inside the Facebook/Messenger browser).");
  } finally { b.disabled = false; }
}

function renderAuth() {
  const u = S.user;
  $("jm-login").hidden = !!u;
  $("jm-in").hidden = !u;
  if (!u) { S.posts = []; S.loaded = false; S.failed = false; S.ask = null; clearSay(); return; }
  $("jm-uname").textContent = u.displayName || u.email || "";
  $("jm-umail").textContent = u.email || "";
  const av = $("jm-avatar"); av.textContent = "";
  if (u.photoURL) { const im = document.createElement("img"); im.src = u.photoURL; im.alt = ""; im.referrerPolicy = "no-referrer"; av.appendChild(im); }
  else av.textContent = (u.displayName || u.email || "?").charAt(0).toUpperCase();
}

/* ---------- ইভেন্ট ---------- */
function bind() {
  $("jm-signin").addEventListener("click", signIn);
  $("jm-signout").addEventListener("click", () => signOut(auth));

  function onClick(e) {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const kind = b.getAttribute("data-act"), id = b.getAttribute("data-id");
    if (kind === "reload") { load(); return; }
    if (S.busy) return;
    if (kind === "close" || kind === "delete") {
      S.ask = { id, kind }; render();
      const y = document.querySelector("#jm-c-" + CSS.escape(id) + ' [data-act$="-yes"]');   // নিশ্চিতকরণ খুললে ফোকাস সেখানে
      if (y) y.focus();
      return;
    }
    if (kind === "cancel") { S.ask = null; S.focus = id; render(); return; }
    if (kind === "close-yes") { act("close", id); return; }
    if (kind === "delete-yes") { act("delete", id); return; }
    if (kind === "renew" || kind === "filled") act(kind, id);
  }
  $("jm-list").addEventListener("click", onClick);
  $("jm-empty").addEventListener("click", onClick);
}

bind();
onAuthStateChanged(auth, u => {
  const changed = (u ? u.uid : "") !== (S.user ? S.user.uid : "");
  S.user = u || null; S.authKnown = true;
  renderAuth();
  if (S.user && changed) load();
});
