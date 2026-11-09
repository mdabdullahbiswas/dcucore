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
    digits: digits, bangla: bangla, hijri: hijri, holiday: holiday, prayer: xpt, fmtTime: fmtTime,
    PL: PL, PN: XPN, FX: FX, RL: RL, GM: GM, BM: BM, HM: HM, DN: DN, WD: WD
  };
})(window);
