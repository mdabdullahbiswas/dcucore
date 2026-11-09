/* dcu-time.js
 * Shared date + prayer-time logic for DCUCore (calendar page and home page use the same code,
 * so the two can never disagree).  Pure functions, no DOM, works offline.
 *
 *   DCUTime.bangla(date)        -> {d, m, y}   Bangla calendar (m: 0 = Boishakh)
 *   DCUTime.hijri(date, off)    -> {d, m, y}   Hijri (Umm al-Qura), off = moon-sighting shift in days (default -1)
 *   DCUTime.holiday(date, off)  -> {h, b, r, t, rz}  r = [bn, en] reason or null, t = "h" holiday / "w" weekend,
 *                                  rz = Ramadan.  Does not know about user events (the calendar adds those).
 *   DCUTime.prayer(date)        -> {fj, sr, dh, as, mg, is}  decimal hours, Dhaka time
 *   DCUTime.fmtTime(hours, lang) -> "বিকাল ৪:৩২" / "4:32 PM"
 *   DCUTime.digits(n, lang)     -> Bangla digits when lang is not "en"
 *   DCUTime.DIST                -> [[bn, en, lat, lon], ...] districts; getDistrict() -> index; setDistrict(i) remembers it,
 *                                  moves PL and fires "dcu:district" on window; districtName(lang)
 *   DCUTime.PN / BM / HM / GM / DN   names as [bn, en] pairs
 */
(function (w) {
  "use strict";

  function digits(n, L) {
    return L === "en" ? String(n) : String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; });
  }

  var GM = [['জানুয়ারি','January'],['ফেব্রুয়ারি','February'],['মার্চ','March'],['এপ্রিল','April'],['মে','May'],['জুন','June'],['জুলাই','July'],['আগস্ট','August'],['সেপ্টেম্বর','September'],['অক্টোবর','October'],['নভেম্বর','November'],['ডিসেম্বর','December']];
  var BM = [['বৈশাখ','Boishakh'],['জ্যৈষ্ঠ','Joishtho'],['আষাঢ়','Asharh'],['শ্রাবণ','Srabon'],['ভাদ্র','Bhadro'],['আশ্বিন','Ashwin'],['কার্তিক','Kartik'],['অগ্রহায়ণ','Agrahayan'],['পৌষ','Poush'],['মাঘ','Magh'],['ফাল্গুন','Falgun'],['চৈত্র','Choitro']];
  var HM = [['মুহাররম','Muharram'],['সফর','Safar'],['রবিউল আউয়াল','Rabi I'],['রবিউস সানি','Rabi II'],['জমাদিউল আউয়াল','Jumada I'],['জমাদিউস সানি','Jumada II'],['রজব','Rajab'],['শা’বান','Sha’ban'],['রমজান','Ramadan'],['শাওয়াল','Shawwal'],['জিলকদ','Dhul Qa’dah'],['জিলহজ','Dhul Hijjah']];
  var DN = [['রবি','Sun'],['সোম','Mon'],['মঙ্গল','Tue'],['বুধ','Wed'],['বৃহঃ','Thu'],['শুক্র','Fri'],['শনি','Sat']];
  var WD = [['রবিবার','Sunday'],['সোমবার','Monday'],['মঙ্গলবার','Tuesday'],['বুধবার','Wednesday'],['বৃহস্পতিবার','Thursday'],['শুক্রবার','Friday'],['শনিবার','Saturday']];

  /* ---------- Bangla + Hijri ---------- */
  var BS=[[0,14,9],[1,13,10],[2,15,11],[3,14,0],[4,15,1],[5,15,2],[6,16,3],[7,16,4],[8,16,5],[9,16,6],[10,15,7],[11,15,8]];
  function bangla(d){var y=d.getFullYear(),mo=d.getMonth(),t=Date.UTC(y,mo,d.getDate());let best=null,bt=-1e18;for(var yy of[y-1,y])for(var q of BS){var st=Date.UTC(yy,q[0],q[1]);if(st<=t&&st>bt){bt=st;best=q}}
 return{d:Math.round((t-bt)/864e5)+1,m:best[2],y:y-(mo>3||(mo==3&&d.getDate()>=14)?593:594)}}
  var hf=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'});
  function hijri(d,off){off=off==null?-1:off;var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+off,12);var p={};hf.formatToParts(x).forEach(o=>p[o.type]=+o.value.replace(/\D/g,''));return{d:p.day,m:p.month-1,y:p.relatedYear||p.year}}
  var FX={'2-21':['শহিদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস','Language Martyrs’ Day'],'3-26':['স্বাধীনতা দিবস','Independence Day'],'4-14':['পহেলা বৈশাখ','Pohela Boishakh'],'5-1':['মে দিবস','May Day'],'8-5':['জুলাই গণঅভ্যুত্থান দিবস','July Uprising Day'],'11-7':['জাতীয় বিপ্লব ও সংহতি দিবস','National Revolution & Solidarity Day'],'12-16':['বিজয় দিবস','Victory Day'],'12-25':['বড়দিন','Christmas']};
  var RL={2026:{'5-1':['বুদ্ধ পূর্ণিমা','Buddha Purnima'],'9-4':['জন্মাষ্টমী','Janmashtami'],'10-20':['বিজয়া দশমী (দুর্গাপূজা)','Bijoya Dashami'],'11-8':['শ্রী শ্রী শ্যামা পূজা','Shree Shree Shyama Puja']},2027:{'5-20':['বুদ্ধ পূর্ণিমা','Buddha Purnima'],'8-25':['জন্মাষ্টমী','Janmashtami']}};

  function holiday(d, off) {
    var h = hijri(d, off), wk = d.getDay(), key = (d.getMonth() + 1) + '-' + d.getDate(), r = null, t = '';
    if (wk == 5 || wk == 6) { r = ['সাপ্তাহিক ছুটি (শুক্র-শনি)', 'Weekend (Fri–Sat)']; t = 'w'; }
    function o(a, tp) { r = a; t = tp; }
    var f = FX[key] || (RL[d.getFullYear()] || {})[key]; if (f) o(f, 'h');
    if (h.m == 9 && h.d <= 3) o(['ঈদুল ফিতর', 'Eid ul-Fitr'], 'h');
    if (h.m == 11 && h.d >= 9 && h.d <= 12) o(['ঈদুল আযহা', 'Eid ul-Adha'], 'h');
    if (h.m == 0 && h.d == 10) o(['পবিত্র আশুরা', 'Ashura'], 'h');
    if (h.m == 2 && h.d == 12) o(['ঈদে মিলাদুন্নবী (সা.)', 'Eid-e-Miladunnabi'], 'h');
    if (h.m == 7 && h.d == 15) o(['শবে বরাত', 'Shab-e-Barat'], 'h');
    if (h.m == 8 && h.d == 27) o(['শবে কদর', 'Shab-e-Qadr'], 'h');
    return { h: h, b: bangla(d), r: r, t: t, rz: h.m == 8 };
  }

  /* ---------- prayer times (Dhaka, offline calculation) ---------- */
  var PL={lat:23.8103,lon:90.4125,tz:6};
  function xpt(d){var R=Math.PI/180,sn=a=>Math.sin(a*R),cs=a=>Math.cos(a*R),fa=a=>(a%360+360)%360,fh=a=>(a%24+24)%24;let Y1=d.getFullYear(),M1=d.getMonth()+1;var D1=d.getDate();if(M1<=2){Y1--;M1+=12}
 var A=Math.floor(Y1/100),B=2-A+Math.floor(A/4),jd=Math.floor(365.25*(Y1+4716))+Math.floor(30.6001*(M1+1))+D1+B-1524.5-PL.lon/360;
 var sun=t=>{var k=jd+t-2451545,g=fa(357.529+.98560028*k),q=fa(280.459+.98564736*k),l=fa(q+1.915*sn(g)+.02*sn(2*g)),e=23.439-4e-7*k,ra=fh(Math.atan2(cs(e)*sn(l),cs(l))/R/15);return{dc:Math.asin(sn(e)*sn(l))/R,eq:fh(q/15-ra+12)-12}},
 mid=t=>fh(12-sun(t).eq),
 ang=(a,t,cw)=>{var dc=sun(t).dc,x=Math.acos((-sn(a)-sn(dc)*sn(PL.lat))/(cs(dc)*cs(PL.lat)))/R/15;return mid(t)+(cw?x:-x)},
 asr=(f,t)=>{var dc=sun(t).dc;return ang(-Math.atan(1/(f+Math.tan(Math.abs(PL.lat-dc)*R)))/R,t,1)};
 let r={fj:5,sr:6,dh:12,as:13,mg:18,is:18};
 for(let i=0;i<2;i++)r={fj:ang(18,r.fj/24),sr:ang(.833,r.sr/24),dh:mid(r.dh/24),as:asr(2,r.as/24),mg:ang(.833,r.mg/24,1),is:ang(18,r.is/24,1)};
 var s=PL.tz-PL.lon/15;for(var k in r)r[k]+=s;r.dh+=1/60;return r}
  function fmtTime(h,L){var nb=function(n){return digits(n,L)};h=((h%24)+24)%24;var m=Math.round(h*60),H=Math.floor(m/60)%24,mi=m%60,ts=nb(H%12||12)+':'+nb(String(mi).padStart(2,'0'));
 if(L!='en')return(H<4?'রাত':H<6?'ভোর':H<12?'সকাল':H<15?'দুপুর':H<17?'বিকাল':H<19?'সন্ধ্যা':'রাত')+' '+ts;return ts+' '+(H<12?'AM':'PM')}
  var XPN={fj:['ফজর','Fajr'],sr:['সূর্যোদয়','Sunrise'],dh:['জোহর','Dhuhr'],as:['আসর','Asr'],mg:['মাগরিব','Maghrib'],is:['ইশা','Isha']};

  /* ---------- districts (approximate centre points; prayer times shift a few minutes with longitude) ---------- */
  var DIST = [
    ["ঢাকা","Dhaka",23.8103,90.4125],["গাজীপুর","Gazipur",24.00,90.42],["নারায়ণগঞ্জ","Narayanganj",23.63,90.50],["নরসিংদী","Narsingdi",23.92,90.72],["মানিকগঞ্জ","Manikganj",23.86,90.00],["মুন্সিগঞ্জ","Munshiganj",23.55,90.53],["টাঙ্গাইল","Tangail",24.25,89.92],["কিশোরগঞ্জ","Kishoreganj",24.43,90.78],["ফরিদপুর","Faridpur",23.60,89.84],["রাজবাড়ী","Rajbari",23.76,89.64],["গোপালগঞ্জ","Gopalganj",23.01,89.83],["মাদারীপুর","Madaripur",23.17,90.20],["শরীয়তপুর","Shariatpur",23.22,90.35],
    ["চট্টগ্রাম","Chattogram",22.36,91.78],["কক্সবাজার","Cox’s Bazar",21.45,91.98],["কুমিল্লা","Cumilla",23.46,91.18],["ব্রাহ্মণবাড়িয়া","Brahmanbaria",23.96,91.11],["চাঁদপুর","Chandpur",23.23,90.65],["লক্ষ্মীপুর","Lakshmipur",22.94,90.84],["নোয়াখালী","Noakhali",22.82,91.10],["ফেনী","Feni",23.02,91.40],["খাগড়াছড়ি","Khagrachhari",23.12,91.98],["রাঙামাটি","Rangamati",22.65,92.17],["বান্দরবান","Bandarban",22.19,92.22],
    ["সিলেট","Sylhet",24.90,91.87],["মৌলভীবাজার","Moulvibazar",24.48,91.77],["হবিগঞ্জ","Habiganj",24.38,91.42],["সুনামগঞ্জ","Sunamganj",25.07,91.40],
    ["রাজশাহী","Rajshahi",24.37,88.60],["নাটোর","Natore",24.42,89.00],["নওগাঁ","Naogaon",24.80,88.94],["চাঁপাইনবাবগঞ্জ","Chapainawabganj",24.60,88.28],["পাবনা","Pabna",24.00,89.25],["সিরাজগঞ্জ","Sirajganj",24.45,89.70],["বগুড়া","Bogura",24.85,89.37],["জয়পুরহাট","Joypurhat",25.10,89.02],
    ["খুলনা","Khulna",22.82,89.55],["বাগেরহাট","Bagerhat",22.65,89.79],["সাতক্ষীরা","Satkhira",22.71,89.07],["যশোর","Jashore",23.17,89.21],["ঝিনাইদহ","Jhenaidah",23.54,89.17],["মাগুরা","Magura",23.49,89.42],["নড়াইল","Narail",23.17,89.50],["কুষ্টিয়া","Kushtia",23.90,89.12],["চুয়াডাঙ্গা","Chuadanga",23.64,88.85],["মেহেরপুর","Meherpur",23.76,88.63],
    ["বরিশাল","Barishal",22.70,90.37],["ভোলা","Bhola",22.69,90.65],["পটুয়াখালী","Patuakhali",22.36,90.33],["পিরোজপুর","Pirojpur",22.58,89.97],["ঝালকাঠি","Jhalokati",22.64,90.20],["বরগুনা","Barguna",22.15,90.13],
    ["রংপুর","Rangpur",25.75,89.25],["দিনাজপুর","Dinajpur",25.63,88.64],["ঠাকুরগাঁও","Thakurgaon",26.03,88.47],["পঞ্চগড়","Panchagarh",26.34,88.55],["নীলফামারী","Nilphamari",25.93,88.86],["লালমনিরহাট","Lalmonirhat",25.99,89.45],["কুড়িগ্রাম","Kurigram",25.80,89.64],["গাইবান্ধা","Gaibandha",25.33,89.53],
    ["ময়মনসিংহ","Mymensingh",24.75,90.41],["জামালপুর","Jamalpur",24.92,89.94],["শেরপুর","Sherpur",25.02,90.02],["নেত্রকোণা","Netrokona",24.87,90.73]
  ];

  /* The chosen district is remembered (localStorage "dcu-district") and moves PL, so prayer()/extras() follow it on
   * every page.  Changing it fires "dcu:district" on window (also when another tab changes it). */
  var distIdx = 0;
  function readDist() { var v = NaN; try { v = parseInt(localStorage.getItem("dcu-district"), 10); } catch (e) {} return v >= 0 && v < DIST.length ? v : 0; }
  function applyDist() { PL.lat = DIST[distIdx][2]; PL.lon = DIST[distIdx][3]; }
  function fireDist() { try { w.dispatchEvent(new CustomEvent("dcu:district", { detail: { index: distIdx } })); } catch (e) {} }
  function getDistrict() { return distIdx; }
  function setDistrict(n) {
    n = +n; if (!(n >= 0 && n < DIST.length)) n = 0;
    var ch = n !== distIdx; distIdx = n;
    try { localStorage.setItem("dcu-district", String(n)); } catch (e) {}
    applyDist(); if (ch) fireDist();
  }
  function districtName(L) { return DIST[distIdx][L === "en" ? 1 : 0]; }
  distIdx = readDist(); applyDist();
  if (w.addEventListener) w.addEventListener("storage", function (e) { if (e.key === "dcu-district") { var n = readDist(); if (n !== distIdx) { distIdx = n; applyDist(); fireDist(); } } });

  /* ---------- extra times (built on prayer(); every value is a decimal hour, Dhaka time) ----------
   * Night-time values can be > 24 (e.g. 25.0 = 1:00 AM next day); fmtTime() handles that.
   *
   *   sehri   {e}      sehri ends = Fajr starts
   *   iftar   {s}      iftar = Maghrib starts (sunset)
   *   ishraq  {s, e}   starts EX.ishraq min after sunrise, runs to the start of the best Chasht time
   *   chasht  {s, e, best}  from EX.ishraq min after sunrise to just before Zawal; best = a quarter of the day after sunrise
   *   zawal   {s, e}   the minutes just before Dhuhr (sun at its peak)
   *   forbid  [{k:"sr"|"zw"|"ss", s, e}]  three times when prayer is makruh/forbidden
   *   night   {s, e, mid, third}  Maghrib -> next Fajr; mid = middle of the night; third = start of the last third
   *   tahajjud {s, e}  last third of the night until Fajr
   * Windows are conventions, not fixed by the sun: change the numbers in EX if your scholars use others.
   */
  var EX = { ishraq: 15, forbidSunrise: 15, zawal: 6, forbidSunset: 15 };   /* minutes */
  function extras(d) {
    var p = xpt(d), nx = xpt(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)), m = 1 / 60;
    var dayLen = p.mg - p.sr, best = p.sr + dayLen / 4;
    var nightEnd = nx.fj + 24, nightLen = nightEnd - p.mg, third = p.mg + nightLen * 2 / 3;
    var zs = p.dh - EX.zawal * m;
    return {
      sehri: { e: p.fj },
      iftar: { s: p.mg },
      ishraq: { s: p.sr + EX.ishraq * m, e: best },
      chasht: { s: p.sr + EX.ishraq * m, e: zs, best: best },
      zawal: { s: zs, e: p.dh },
      forbid: [
        { k: "sr", s: p.sr, e: p.sr + EX.forbidSunrise * m },
        { k: "zw", s: zs, e: p.dh },
        { k: "ss", s: p.mg - EX.forbidSunset * m, e: p.mg }
      ],
      night: { s: p.mg, e: nightEnd, mid: p.mg + nightLen / 2, third: third },
      tahajjud: { s: third, e: nightEnd }
    };
  }

  w.DCUTime = {
    extras: extras, EX: EX,
    DIST: DIST, getDistrict: getDistrict, setDistrict: setDistrict, districtName: districtName,
    digits: digits, bangla: bangla, hijri: hijri, holiday: holiday, prayer: xpt, fmtTime: fmtTime,
    PL: PL, PN: XPN, FX: FX, RL: RL, GM: GM, BM: BM, HM: HM, DN: DN, WD: WD
  };
})(window);
