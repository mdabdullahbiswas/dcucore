// support-admin.js — DCUCore সহায়তা (support) অ্যাডমিন অংশ
// admin.html থেকে createSupportAdmin(ctx) দিয়ে চালু হয়।
// ডেটা পড়া-লেখা এই ফাইলেই হয়; টোস্ট, কনফার্ম, তারিখ ও টেবিল হেল্পার admin.html থেকে নেওয়া।
import {
  collection, getDocs, getDoc, doc, updateDoc, deleteDoc, setDoc,
  writeBatch, serverTimestamp, deleteField
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const STATUS = { pending: ["অপেক্ষায়", "warn"], approved: ["অনুমোদিত", "ok"], cancelled: ["বাতিল", "mu"] };
const METHOD = { bkash: "bKash", nagad: "Nagad", rocket: "Rocket" };
const DEFAULTS = { enabled: true, number: "", minAmount: 10, lbCount: 10 };
const FILTERS = [["pending", "অপেক্ষায়"], ["approved", "অনুমোদিত"], ["cancelled", "বাতিল"], ["all", "সব"]];

const BN = n => Number(n || 0).toLocaleString("bn-BD");

// দাতার স্থির আইডি। একই নামের সব অনুদান একটি সারিতে যোগ হবে; বেনামী হলে প্রতিটি অনুদান আলাদা সারি।
function boardKey(name, anonymous, code) {
  if (anonymous || !name) return "anon_" + code;
  return "n_" + name.trim().toLowerCase().replace(/[\/\s]+/g, "_");
}

function injectStyle() {
  if (document.getElementById("sa-style")) return;
  const s = document.createElement("style");
  s.id = "sa-style";
  s.textContent = `
.sa-sec{margin:22px 0 10px}
.sa-h{display:flex;align-items:center;gap:8px;font-size:15px;margin:0 0 10px}
.sa-h .ic{width:18px;height:18px;color:var(--gold)}
.sa-filters{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}
.sa-f{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--ln);background:var(--surface);color:var(--ink);font:600 13px/1 var(--f)}
.sa-f em{font-style:normal;font-size:11.5px;opacity:.7}
.sa-f.on{background:linear-gradient(135deg,var(--navy2),var(--navy));color:#fff;border-color:transparent}
.sa-f:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.sa-trx{font:600 12.5px/1.3 ui-monospace,Menlo,monospace;letter-spacing:.4px;word-break:break-all}
.sa-note{font-size:12.5px;opacity:.75;margin:0 0 10px}
.sa-set{padding:18px;margin:0}
.sa-chk{display:flex;align-items:center;gap:10px;margin:4px 0 14px;font-weight:600;font-size:14px;cursor:pointer}
.sa-chk input{width:18px;height:18px;accent-color:var(--gold)}
.sa-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}
.sa-grid label{display:grid;gap:6px;font-size:12.5px;font-weight:600}
.sa-grid input{box-sizing:border-box;width:100%;height:42px;padding:0 12px;border-radius:12px;border:1px solid var(--ln);background:var(--surface);color:var(--ink);font:500 14px var(--f)}
.sa-grid input:focus{outline:2px solid var(--gold);outline-offset:1px}
.sa-row{margin-top:14px}
`;
  document.head.appendChild(s);
}

export function createSupportAdmin(ctx) {
  const { db, $, esc, ic, fd, ms, toast, ask, err, pill, tbl, empty, onChange } = ctx;
  let REQ = [], PRIV = {}, BOARD = [], SET = { ...DEFAULTS }, filter = "pending", busy = false;
  const list = $("list");

  injectStyle();
  list.addEventListener("click", onClick);

  /* ---------- ডেটা ---------- */
  async function load() {
    const [rq, pv, bd, st] = await Promise.all([
      getDocs(collection(db, "support_requests")),                     // ব্যর্থ হলে বাইরে ছুঁড়বে
      getDocs(collection(db, "support_private")).catch(() => null),
      getDocs(collection(db, "support_leaderboard")).catch(() => null),
      getDoc(doc(db, "site_settings", "support")).catch(() => null),
    ]);
    REQ = rq.docs.map(x => ({ code: x.id, ...x.data() })).sort((a, b) => ms(b.createdAt) - ms(a.createdAt));
    PRIV = {};
    if (pv) pv.docs.forEach(x => { PRIV[x.id] = x.data(); });
    BOARD = bd ? bd.docs.map(x => ({ key: x.id, ...x.data() })).sort((a, b) => (b.total || 0) - (a.total || 0)) : [];
    SET = { ...DEFAULTS, ...(st && st.exists() ? st.data() : {}) };
  }

  const patch = (code, fields) => {
    const r = REQ.find(x => x.code === code);
    if (!r) return null;
    Object.assign(r, fields);
    return r;
  };

  // অনুমোদিত অনুদান থেকে লিডারবোর্ড নতুন করে বানায়। আগের "লুকানো" অবস্থা ধরে রাখে।
  async function recomputeBoard() {
    const totals = new Map();
    for (const r of REQ) {
      if (r.status !== "approved") continue;
      const p = PRIV[r.code] || {};
      const anonymous = p.anonymous === true;
      const name = anonymous ? null : (String(p.name || "").trim() || null);
      const key = boardKey(name, anonymous, r.code);
      const cur = totals.get(key) || { name, anonymous, total: 0 };
      cur.total += Number(r.amount) || 0;
      totals.set(key, cur);
    }
    const old = new Map(BOARD.map(b => [b.key, b]));
    const batch = writeBatch(db);
    totals.forEach((v, key) => batch.set(doc(db, "support_leaderboard", key), {
      name: v.name, anonymous: v.anonymous, total: v.total,
      hidden: old.get(key)?.hidden === true, updatedAt: serverTimestamp()
    }));
    BOARD.forEach(b => { if (!totals.has(b.key)) batch.delete(doc(db, "support_leaderboard", b.key)); });
    await batch.commit();
    BOARD = [...totals].map(([key, v]) => ({ key, ...v, hidden: old.get(key)?.hidden === true }))
      .sort((a, b) => b.total - a.total);
  }

  /* ---------- কাজ ---------- */
  async function approve(code) {
    await updateDoc(doc(db, "support_requests", code), { status: "approved", reason: deleteField(), decidedAt: serverTimestamp() });
    const r = patch(code, { status: "approved" }); if (r) delete r.reason;
    await recomputeBoard();
  }

  async function cancel(code, reason) {
    const was = REQ.find(x => x.code === code)?.status;
    await updateDoc(doc(db, "support_requests", code), { status: "cancelled", reason, decidedAt: serverTimestamp() });
    patch(code, { status: "cancelled", reason });
    if (was === "approved") await recomputeBoard();
  }

  async function reopen(code) {
    const was = REQ.find(x => x.code === code)?.status;
    await updateDoc(doc(db, "support_requests", code), { status: "pending", reason: deleteField() });
    const r = patch(code, { status: "pending" }); if (r) delete r.reason;
    if (was === "approved") await recomputeBoard();
  }

  async function remove(code) {
    const was = REQ.find(x => x.code === code)?.status;
    const p = PRIV[code] || {};
    await deleteDoc(doc(db, "support_requests", code));
    try { await deleteDoc(doc(db, "support_private", code)); } catch (_) {}
    if (p.trxHash) { try { await deleteDoc(doc(db, "trx_index", p.trxHash)); } catch (_) {} }
    REQ = REQ.filter(x => x.code !== code);
    delete PRIV[code];
    if (was === "approved") await recomputeBoard();
  }

  async function toggleHide(key) {
    const b = BOARD.find(x => x.key === key); if (!b) return;
    const hidden = !b.hidden;
    await updateDoc(doc(db, "support_leaderboard", key), { hidden });
    b.hidden = hidden;
  }

  async function saveSettings(root) {
    const v = n => root.querySelector(`[name="${n}"]`);
    const number = v("number").value.trim();
    const minAmount = Math.round(Number(v("minAmount").value));
    const lbCount = Math.round(Number(v("lbCount").value));
    if (number.length < 5) { toast("বিকাশ/নগদ নম্বর লিখুন", "err"); return; }
    if (!(minAmount >= 1)) { toast("সর্বনিম্ন পরিমাণ ১ বা তার বেশি হতে হবে", "err"); return; }
    const next = { enabled: v("enabled").checked, number, minAmount, lbCount: Math.min(50, Math.max(1, lbCount || 10)) };
    await setDoc(doc(db, "site_settings", "support"), next, { merge: true });
    SET = { ...SET, ...next };
    toast("সেটিংস সংরক্ষণ হয়েছে");
  }

  /* ---------- ইভেন্ট ---------- */
  async function onClick(e) {
    const b = e.target.closest("[data-sa]");
    if (!b || b.disabled) return;
    const a = b.dataset.sa, id = b.dataset.id;
    if (a === "filter") { filter = b.dataset.v; paint(); return; }
    if (busy) return;
    busy = true; b.disabled = true;
    try {
      if (a === "approve") { await approve(id); toast("অনুমোদন করা হয়েছে"); }
      else if (a === "cancel") {
        const why = window.prompt("বাতিলের কারণ লিখুন (দাতা এটি দেখতে পাবেন):", "");
        if (why === null) return;
        if (!why.trim()) { toast("কারণ লিখুন", "err"); return; }
        await cancel(id, why.trim()); toast("বাতিল করা হয়েছে");
      }
      else if (a === "reopen") { await reopen(id); toast("আবার অপেক্ষায় রাখা হয়েছে"); }
      else if (a === "remove") {
        if (!(await ask("অনুরোধটি স্থায়ীভাবে মুছবেন? TrxID-ও মুক্ত হবে।"))) return;
        await remove(id); toast("মুছে ফেলা হয়েছে");
      }
      else if (a === "hide") { await toggleHide(id); toast("লিডারবোর্ড আপডেট হয়েছে"); }
      else if (a === "save") { await saveSettings(b.closest(".sa-set")); }
      onChange();
    } catch (er) {
      err(er);
    } finally {
      busy = false; b.disabled = false;
    }
  }

  /* ---------- রেন্ডার ---------- */
  function filterBar() {
    return `<div class="sa-filters">${FILTERS.map(([k, l]) => {
      const n = k === "all" ? REQ.length : REQ.filter(r => r.status === k).length;
      return `<button type="button" class="sa-f${filter === k ? " on" : ""}" data-sa="filter" data-v="${k}">${l}<em>${n}</em></button>`;
    }).join("")}</div>`;
  }

  function reqRows() {
    const R = REQ.filter(r => filter === "all" || r.status === filter);
    if (!R.length) return empty("inbox", "এই তালিকায় কোনো অনুরোধ নেই।");
    const rows = R.map(r => {
      const p = PRIV[r.code] || {};
      const [label, cls] = STATUS[r.status] || STATUS.pending;
      const id = `data-id="${esc(r.code)}"`;
      const btns = [];
      if (r.status !== "approved") btns.push(`<button type="button" class="btn sm ok" data-sa="approve" ${id}>${ic("check")}অনুমোদন</button>`);
      if (r.status !== "cancelled") btns.push(`<button type="button" class="btn sm" data-sa="cancel" ${id}>${ic("alert")}বাতিল</button>`);
      if (r.status !== "pending") btns.push(`<button type="button" class="btn sm" data-sa="reopen" ${id}>${ic("undo")}অপেক্ষায়</button>`);
      btns.push(`<button type="button" class="btn sm dng" data-sa="remove" ${id}>${ic("trash")}মুছুন</button>`);
      return `<tr>
        <td class="nm">${fd(r.createdAt)}</td>
        <td><b>${esc(p.anonymous ? "বেনামী" : (p.name || "—"))}</b><span class="m">${esc(r.code)}</span></td>
        <td><b>৳ ${BN(r.amount)}</b><span class="m">${esc(METHOD[r.method] || r.method || "")}</span></td>
        <td><span class="sa-trx">${esc(p.trxId || "—")}</span></td>
        <td>${pill(label, cls)}${r.reason ? `<span class="m">${esc(r.reason)}</span>` : ""}</td>
        <td><div class="acts">${btns.join("")}</div></td>
      </tr>`;
    }).join("");
    return tbl(["সময়", "দাতা", "পরিমাণ / মাধ্যম", "TrxID", "অবস্থা", ""], rows);
  }

  function boardHtml() {
    if (!BOARD.length) return empty("users", "এখনো কোনো অনুমোদিত অনুদান নেই।");
    const rows = BOARD.map((b, i) => `<tr>
        <td class="nm">${i + 1}</td>
        <td><b>${b.anonymous ? "বেনামী" : esc(b.name || "—")}</b>${b.hidden ? ` ${pill("লুকানো", "mu")}` : ""}</td>
        <td><b>৳ ${BN(b.total)}</b></td>
        <td><div class="acts"><button type="button" class="btn sm" data-sa="hide" data-id="${esc(b.key)}">${ic("eye")}${b.hidden ? "দেখান" : "লুকান"}</button></div></td>
      </tr>`).join("");
    return tbl(["#", "দাতা", "মোট", "লিডারবোর্ড"], rows);
  }

  function settingsHtml() {
    return `<div class="card sa-set">
      <label class="sa-chk"><input type="checkbox" name="enabled"${SET.enabled ? " checked" : ""}><span>সহায়তা গ্রহণ চালু থাকবে</span></label>
      <div class="sa-grid">
        <label><span>বিকাশ / নগদ নম্বর</span><input name="number" inputmode="tel" value="${esc(SET.number)}"></label>
        <label><span>সর্বনিম্ন পরিমাণ (৳)</span><input name="minAmount" type="number" min="1" value="${esc(SET.minAmount)}"></label>
        <label><span>লিডারবোর্ডে কতজন (১–৫০)</span><input name="lbCount" type="number" min="1" max="50" value="${esc(SET.lbCount)}"></label>
      </div>
      <div class="sa-row"><button type="button" class="btn pri sm" data-sa="save">${ic("check")}সংরক্ষণ</button></div>
    </div>`;
  }

  function paint() {
    const hasPending = REQ.some(r => r.status === "pending");
    list.innerHTML =
      `<div class="sa-sec"><div class="sa-h">${ic("inbox")}<b>সহায়তা অনুরোধ</b></div>` +
        filterBar() +
        (filter === "pending" && hasPending ? `<p class="sa-note">bKash, নগদ বা রকেট অ্যাপে TrxID ও পরিমাণ মিলিয়ে তবেই অনুমোদন করুন।</p>` : "") +
        reqRows() + `</div>` +
      `<div class="sa-sec"><div class="sa-h">${ic("users")}<b>লিডারবোর্ড</b></div>${boardHtml()}</div>` +
      `<div class="sa-sec"><div class="sa-h">${ic("shield")}<b>সেটিংস</b></div>${settingsHtml()}</div>`;
  }

  return {
    load,
    render: paint,
    pendingCount: () => REQ.filter(r => r.status === "pending").length,
  };
}
