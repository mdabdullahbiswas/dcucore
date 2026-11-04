/* ===== ডকুমেন্ট স্ক্যানার (সবকিছু ডিভাইসেই; কোনো সার্ভারে ছবি যায় না) =====
 * ছবি → কাগজের চার কোণ খোঁজা/টেনে ঠিক করা → সোজা করা → ফিল্টার → একাধিক পেজের PDF
 * tools.html-এর $, $$, L, esc, dl, lp (pdf-lib লোডার) ব্যবহার করে। */
(function(){
 const root=document.getElementById('scan');if(!root)return;
 const MAXSRC=2200,MAXOUT=1700;
 const P=[];let cur=-1;
 const el=id=>document.getElementById(id);
 const msg=t=>{el('scm').textContent=t||''};
 const cv=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c};
 const clamp=(v,a,b)=>v<a?a:v>b?b:v;

 /* ---------- ছবি লোড ---------- */
 async function loadImg(file){
  let bmp;
  try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'})}
  catch(e){bmp=await new Promise((ok,no)=>{const i=new Image(),u=URL.createObjectURL(file);i.onload=()=>{ok(i);setTimeout(()=>URL.revokeObjectURL(u),3e3)};i.onerror=no;i.src=u})}
  const w=bmp.width||bmp.naturalWidth,h=bmp.height||bmp.naturalHeight,s=Math.min(1,MAXSRC/Math.max(w,h));
  const c=cv(w*s,h*s),x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(bmp,0,0,c.width,c.height);
  if(bmp.close)bmp.close();return c;
 }

 /* ---------- কাগজের কোণ খোঁজা (OpenCV ছাড়াই) ---------- */
 function otsu(g){const h=new Uint32Array(256);for(let i=0;i<g.length;i++)h[g[i]]++;
  let sum=0;for(let i=0;i<256;i++)sum+=i*h[i];let sB=0,wB=0,best=0,t=128;const n=g.length;
  for(let i=0;i<256;i++){wB+=h[i];if(!wB)continue;const wF=n-wB;if(!wF)break;sB+=i*h[i];const d=sB/wB-(sum-sB)/wF,v=wB*wF*d*d;if(v>best){best=v;t=i}}return t}
 function detect(src){
  const W=src.width,H=src.height,s=Math.min(1,260/Math.max(W,H)),w=Math.max(8,Math.round(W*s)),h=Math.max(8,Math.round(H*s));
  const sm=cv(w,h),sx=sm.getContext('2d');sx.imageSmoothingQuality='high';sx.drawImage(src,0,0,w,h);
  const d=sx.getImageData(0,0,w,h).data,g=new Uint8Array(w*h);
  for(let i=0;i<w*h;i++)g[i]=(d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114)|0;
  const t=otsu(g);let best=null;
  for(const pol of[1,0]){
   const m=new Uint8Array(w*h);for(let i=0;i<w*h;i++)m[i]=(pol?g[i]>t:g[i]<=t)?1:0;
   const seen=new Uint8Array(w*h),stack=new Int32Array(w*h);
   for(let i=0;i<w*h;i++){
    if(!m[i]||seen[i])continue;
    let sp=0,area=0,tl=1e9,br=-1e9,tr=-1e9,bl=1e9,pTL,pBR,pTR,pBL,tb=[0,0,0,0];
    stack[sp++]=i;seen[i]=1;
    while(sp){const p=stack[--sp],x=p%w,y=(p/w)|0;area++;
     const a=x+y,b=x-y;
     if(a<tl){tl=a;pTL=[x,y]}if(a>br){br=a;pBR=[x,y]}if(b>tr){tr=b;pTR=[x,y]}if(b<bl){bl=b;pBL=[x,y]}
     if(x==0)tb[0]=1;if(y==0)tb[1]=1;if(x==w-1)tb[2]=1;if(y==h-1)tb[3]=1;
     if(x>0&&m[p-1]&&!seen[p-1]){seen[p-1]=1;stack[sp++]=p-1}
     if(x<w-1&&m[p+1]&&!seen[p+1]){seen[p+1]=1;stack[sp++]=p+1}
     if(y>0&&m[p-w]&&!seen[p-w]){seen[p-w]=1;stack[sp++]=p-w}
     if(y<h-1&&m[p+w]&&!seen[p+w]){seen[p+w]=1;stack[sp++]=p+w}}
    if(area<w*h*.12)continue;
    if(tb[0]+tb[1]+tb[2]+tb[3]>=3)continue; /* এটা ব্যাকগ্রাউন্ড */
    const q=[pTL,pTR,pBR,pBL],qa=Math.abs(q.reduce((a,p,k)=>{const n=q[(k+1)%4];return a+p[0]*n[1]-n[0]*p[1]},0))/2;
    if(qa<w*h*.12||qa>w*h*.97||area/qa<.6)continue;
    if(!best||qa>best.qa)best={qa,q};
   }
  }
  const pad=.03;
  if(!best)return[[W*pad,H*pad],[W*(1-pad),H*pad],[W*(1-pad),H*(1-pad)],[W*pad,H*(1-pad)]];
  const k=1/s,cx=best.q.reduce((a,p)=>a+p[0],0)/4,cy=best.q.reduce((a,p)=>a+p[1],0)/4;
  /* কোণগুলো সামান্য বাইরে ঠেলে দিই, যাতে কাগজের ধার কাটা না পড়ে */
  return best.q.map(p=>[clamp((p[0]+Math.sign(p[0]-cx)*1.5)*k,0,W),clamp((p[1]+Math.sign(p[1]-cy)*1.5)*k,0,H)]);
 }

 /* ---------- সোজা করা (perspective warp) ---------- */
 function homog(dst,src){ /* dst(x,y)→src(X,Y) */
  const A=[],B=[];
  for(let i=0;i<4;i++){const[x,y]=dst[i],[X,Y]=src[i];
   A.push([x,y,1,0,0,0,-x*X,-y*X]);B.push(X);A.push([0,0,0,x,y,1,-x*Y,-y*Y]);B.push(Y)}
  for(let i=0;i<8;i++){let m=i;for(let r=i+1;r<8;r++)if(Math.abs(A[r][i])>Math.abs(A[m][i]))m=r;
   [A[i],A[m]]=[A[m],A[i]];[B[i],B[m]]=[B[m],B[i]];
   for(let r=i+1;r<8;r++){const f=A[r][i]/A[i][i];for(let c=i;c<8;c++)A[r][c]-=f*A[i][c];B[r]-=f*B[i]}}
  const h=new Array(8);
  for(let i=7;i>=0;i--){let s=B[i];for(let c=i+1;c<8;c++)s-=A[i][c]*h[c];h[i]=s/A[i][i]}
  return h;
 }
 function warp(src,q){
  const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  let w=Math.max(dist(q[0],q[1]),dist(q[3],q[2])),h=Math.max(dist(q[0],q[3]),dist(q[1],q[2]));
  const s=Math.min(1,MAXOUT/Math.max(w,h));w=Math.max(16,Math.round(w*s));h=Math.max(16,Math.round(h*s));
  const out=cv(w,h),ox=out.getContext('2d'),od=ox.createImageData(w,h),o=od.data;
  const sd=src.getContext('2d').getImageData(0,0,src.width,src.height).data,SW=src.width,SH=src.height;
  const H=homog([[0,0],[w,0],[w,h],[0,h]],q);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const den=H[6]*x+H[7]*y+1,X=(H[0]*x+H[1]*y+H[2])/den,Y=(H[3]*x+H[4]*y+H[5])/den,
    x0=Math.floor(X),y0=Math.floor(Y),fx=X-x0,fy=Y-y0,i=(y*w+x)*4;
   if(x0<0||y0<0||x0>=SW-1||y0>=SH-1){const cx=clamp(x0,0,SW-1),cy=clamp(y0,0,SH-1),j=(cy*SW+cx)*4;o[i]=sd[j];o[i+1]=sd[j+1];o[i+2]=sd[j+2];o[i+3]=255;continue}
   const a=(y0*SW+x0)*4,b=a+4,c=a+SW*4,e=c+4,w1=(1-fx)*(1-fy),w2=fx*(1-fy),w3=(1-fx)*fy,w4=fx*fy;
   o[i]=sd[a]*w1+sd[b]*w2+sd[c]*w3+sd[e]*w4;o[i+1]=sd[a+1]*w1+sd[b+1]*w2+sd[c+1]*w3+sd[e+1]*w4;o[i+2]=sd[a+2]*w1+sd[b+2]*w2+sd[c+2]*w3+sd[e+2]*w4;o[i+3]=255;
  }
  ox.putImageData(od,0,0);return out;
 }

 /* ---------- ফিল্টার ---------- */
 function boxBlur(a,w,h,r){ /* a: Float32Array (১ চ্যানেল), দুই-পাস */
  const t=new Float32Array(a.length),n=2*r+1;
  for(let y=0;y<h;y++){let s=0;for(let x=-r;x<=r;x++)s+=a[y*w+clamp(x,0,w-1)];
   for(let x=0;x<w;x++){t[y*w+x]=s/n;s+=a[y*w+clamp(x+r+1,0,w-1)]-a[y*w+clamp(x-r,0,w-1)]}}
  for(let x=0;x<w;x++){let s=0;for(let y=-r;y<=r;y++)s+=t[clamp(y,0,h-1)*w+x];
   for(let y=0;y<h;y++){a[y*w+x]=s/n;s+=t[clamp(y+r+1,0,h-1)*w+x]-t[clamp(y-r,0,h-1)*w+x]}}
 }
 function maxFilter(a,w,h,r){
  const t=new Float32Array(a.length);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let m=0;for(let k=-r;k<=r;k++){const v=a[y*w+clamp(x+k,0,w-1)];if(v>m)m=v}t[y*w+x]=m}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let m=0;for(let k=-r;k<=r;k++){const v=t[clamp(y+k,0,h-1)*w+x];if(v>m)m=v}a[y*w+x]=m}
 }
 /* কাগজের "আলো/রং"-এর মানচিত্র: লেখা বাদ দিয়ে ব্যাকগ্রাউন্ড অনুমান */
 function bgMap(c){
  const w=c.width,h=c.height,sw=Math.max(8,Math.ceil(w/6)),sh=Math.max(8,Math.ceil(h/6));
  const sm=cv(sw,sh),sx=sm.getContext('2d');sx.imageSmoothingQuality='high';sx.drawImage(c,0,0,sw,sh);
  const id=sx.getImageData(0,0,sw,sh),d=id.data,ch=[0,1,2].map(()=>new Float32Array(sw*sh));
  for(let i=0;i<sw*sh;i++){ch[0][i]=d[i*4];ch[1][i]=d[i*4+1];ch[2][i]=d[i*4+2]}
  ch.forEach(a=>{maxFilter(a,sw,sh,3);boxBlur(a,sw,sh,4);boxBlur(a,sw,sh,4)});
  for(let i=0;i<sw*sh;i++){d[i*4]=ch[0][i];d[i*4+1]=ch[1][i];d[i*4+2]=ch[2][i];d[i*4+3]=255}
  sx.putImageData(id,0,0);
  const big=cv(w,h),bx=big.getContext('2d');bx.imageSmoothingQuality='high';bx.drawImage(sm,0,0,w,h);
  return bx.getImageData(0,0,w,h).data;
 }
 function filter(c,f){
  if(f=='orig')return c;
  const w=c.width,h=c.height,x=c.getContext('2d'),id=x.getImageData(0,0,w,h),d=id.data;
  if(f=='gray'){for(let i=0;i<d.length;i+=4){const v=d[i]*.299+d[i+1]*.587+d[i+2]*.114;d[i]=d[i+1]=d[i+2]=v}x.putImageData(id,0,0);return c}
  const bg=bgMap(c);
  for(let i=0;i<d.length;i+=4){
   if(f=='magic'){
    for(let k=0;k<3;k++){const r=clamp(d[i+k]/Math.max(bg[i+k],24),0,1.1);d[i+k]=clamp(255*Math.pow(Math.min(r,1),1.7)*1.04,0,255)}
   }else{ /* bw */
    const l=d[i]*.299+d[i+1]*.587+d[i+2]*.114,b=bg[i]*.299+bg[i+1]*.587+bg[i+2]*.114,r=l/Math.max(b,24),v=clamp((r-.72)/.16,0,1)*255;
    d[i]=d[i+1]=d[i+2]=v;
   }
  }
  x.putImageData(id,0,0);return c;
 }
 function rotate(c,n){
  n=((n%4)+4)%4;if(!n)return c;
  const o=n%2?cv(c.height,c.width):cv(c.width,c.height),x=o.getContext('2d');
  x.translate(o.width/2,o.height/2);x.rotate(n*Math.PI/2);x.drawImage(c,-c.width/2,-c.height/2);return o;
 }

 /* ---------- অটো সোজা: কাত লেখা (deskew) ও বাঁকা/ঢেউ খেলানো লাইন (dewarp) ---------- */
 function inkMap(c){ /* ছোট করে "কালি"-র মানচিত্র: স্থানীয় গড়ের চেয়ে গাঢ় পিক্সেল */
  const s=Math.min(1,720/Math.max(c.width,c.height)),w=Math.max(16,Math.round(c.width*s)),h=Math.max(16,Math.round(c.height*s));
  const sm=cv(w,h),x=sm.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(c,0,0,w,h);
  const d=x.getImageData(0,0,w,h).data,g=new Float32Array(w*h);
  for(let i=0;i<w*h;i++)g[i]=d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114;
  const m=Float32Array.from(g);boxBlur(m,w,h,Math.max(6,Math.round(w/50)));
  const ink=new Float32Array(w*h);let tot=0;
  for(let i=0;i<w*h;i++){const v=m[i]-g[i];if(v>12){ink[i]=v;tot+=v}}
  return{ink,w,h,s,tot};
 }
 function skewAngle(c){
  const{ink,w,h,tot}=inkMap(c);if(tot<w*h*0.4)return 0;
  const pts=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=ink[y*w+x];if(v>0)pts.push(x-w/2,y-h/2,v)}
  const rows=Math.ceil(Math.hypot(w,h))+2,sc=a=>{const sn=Math.sin(a),cs=Math.cos(a),b=new Float64Array(rows),o=rows/2;
   for(let i=0;i<pts.length;i+=3){const r=Math.round(pts[i+1]*cs-pts[i]*sn+o);if(r>=0&&r<rows)b[r]+=pts[i+2]}
   let mean=0;for(let i=0;i<rows;i++)mean+=b[i];mean/=rows;let v=0;for(let i=0;i<rows;i++)v+=(b[i]-mean)*(b[i]-mean);return v};
  const R=Math.PI/180;let best=0,bs=-1,base=sc(0);
  for(let a=-10;a<=10.01;a+=.5){const v=sc(a*R);if(v>bs){bs=v;best=a}}
  for(let a=best-.5;a<=best+.51;a+=.1){const v=sc(a*R);if(v>bs){bs=v;best=a}}
  if(bs<base*1.03||Math.abs(best)<.15)return 0; /* স্পষ্ট উন্নতি না হলে ছুঁই না */
  return best*R;
 }
 function deskew(c){
  const a=skewAngle(c);if(!a)return c;
  const o=cv(c.width,c.height),x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);
  x.imageSmoothingQuality='high';x.translate(o.width/2,o.height/2);x.rotate(-a);x.drawImage(c,-c.width/2,-c.height/2);return o;
 }
 function dewarp(c){
  const{ink,w,h,s,tot}=inkMap(c);if(tot<w*h*0.4)return c;
  const N=36,sw=w/N,M=Math.max(2,Math.round(h/150)),prof=[],has=[];
  for(let i=0;i<N;i++){const p=new Float32Array(h),x0=Math.floor(i*sw),x1=Math.floor((i+1)*sw);let t=0;
   for(let y=0;y<h;y++){let a=0;for(let x=x0;x<x1;x++)a+=ink[y*w+x];p[y]=a;t+=a}
   boxBlur(p,h,1,1);prof.push(p);has.push(t>h*(x1-x0)*0.6)}
  if(has.filter(Boolean).length<N*.6)return c;
  const d=new Float32Array(N);let last=-1;
  for(let i=0;i<N;i++){
   if(!has[i]){d[i]=last<0?0:d[last];continue}
   let sh=0;if(last>=0){let bs=-1;for(let k=-M;k<=M;k++){let v=0;for(let y=Math.max(0,k);y<Math.min(h,h+k);y++)v+=prof[i][y]*prof[last][y-k];if(v>bs){bs=v;sh=k}}}
   d[i]=(last>=0?d[last]:0)+sh;last=i}
  /* কাত ও বাঁকা — দুটোই এখানে সমান করা হয় (deskew-র ভুল অনুমানও শুধরে যায়) */
  for(let r=0;r<2;r++){const t=Float32Array.from(d);for(let i=1;i<N-1;i++)d[i]=(t[i-1]+2*t[i]+t[i+1])/4}
  let mx=0;for(let i=0;i<N;i++)mx=Math.max(mx,Math.abs(d[i]));
  if(mx<1.2)return c; /* প্রায় সোজা — কিছু করার নেই */
  const k=1/s,W=c.width,H=c.height,cap=H*.08,src=c.getContext('2d').getImageData(0,0,W,H).data,o=cv(W,H),ox=o.getContext('2d'),od=ox.createImageData(W,H),q=od.data;
  for(let x=0;x<W;x++){
   const f=clamp(x/W*N-.5,0,N-1),i0=Math.floor(f),i1=Math.min(N-1,i0+1),t=f-i0,D=clamp((d[i0]*(1-t)+d[i1]*t)*k,-cap,cap);
   for(let y=0;y<H;y++){const Y=y+D,y0=Math.floor(Y),fy=Y-y0,o4=(y*W+x)*4;
    if(y0<0||y0>=H-1){q[o4]=q[o4+1]=q[o4+2]=255;q[o4+3]=255;continue}
    const a=(y0*W+x)*4,b=a+W*4;for(let ch=0;ch<3;ch++)q[o4+ch]=src[a+ch]*(1-fy)+src[b+ch]*fy;q[o4+3]=255}}
  ox.putImageData(od,0,0);return o;
 }
 function render(p){
  let w=warp(p.src,p.q);if(p.ds)w=deskew(w);if(p.dw)w=dewarp(w);p.out=rotate(filter(w,p.f),p.rot);
 }

 /* ---------- UI ---------- */
 const E=el('scE'),O=el('scO');
 let drag=-1,busy=false,timer=0;
 function drawEditor(){
  const p=P[cur];if(!p)return;
  const s=p.src;E.width=s.width;E.height=s.height;
  const x=E.getContext('2d');x.drawImage(s,0,0);
  const q=p.q,u=Math.max(s.width,s.height)/700;
  x.fillStyle='rgba(8,20,40,.35)';x.beginPath();x.rect(0,0,s.width,s.height);
  x.moveTo(q[0][0],q[0][1]);for(let i=3;i>=0;i--)x.lineTo(q[i][0],q[i][1]);x.closePath();x.fill('evenodd');
  x.lineWidth=2.5*u;x.strokeStyle='#FBBF24';x.beginPath();q.forEach((a,i)=>i?x.lineTo(a[0],a[1]):x.moveTo(a[0],a[1]));x.closePath();x.stroke();
  q.forEach((a,i)=>{x.beginPath();x.arc(a[0],a[1],11*u,0,7);x.fillStyle=i==drag?'#fff':'#FBBF24';x.fill();x.lineWidth=2*u;x.strokeStyle='#0b1f3a';x.stroke()});
 }
 function showOut(){
  const p=P[cur];if(!p||!p.out)return;
  O.width=p.out.width;O.height=p.out.height;O.getContext('2d').drawImage(p.out,0,0);
 }
 function thumbs(){
  el('scs').innerHTML='';
  P.forEach((p,i)=>{
   const b=document.createElement('button');b.type='button';b.className='sc-th'+(i==cur?' on':'');b.setAttribute('aria-label',L('পেজ|Page')+' '+(i+1));
   const t=cv(80,104),x=t.getContext('2d'),s=p.out||p.src,k=Math.min(80/s.width,104/s.height);
   x.fillStyle='#fff';x.fillRect(0,0,80,104);x.drawImage(s,(80-s.width*k)/2,(104-s.height*k)/2,s.width*k,s.height*k);
   b.appendChild(t);const n=document.createElement('b');n.textContent=i+1;b.appendChild(n);b.onclick=()=>select(i);el('scs').appendChild(b)});
 }
 function refreshUI(){
  const has=P.length>0;
  el('sce').hidden=!has;el('scem').style.display=has?'none':'';
  ['scpdf','scjpg','scshr'].forEach(i=>el(i).disabled=!has);
  $$('#scan [data-f]').forEach(b=>b.classList.toggle('on',has&&P[cur]&&b.dataset.f==P[cur].f));
  if(has&&P[cur]){el('scds').classList.toggle('on',P[cur].ds);el('scdw').classList.toggle('on',P[cur].dw)}
 }
 function select(i){
  cur=clamp(i,0,P.length-1);if(!P.length){cur=-1;refreshUI();thumbs();return}
  refreshUI();drawEditor();
  if(!P[cur].out)recalc();else{showOut();thumbs()}
 }
 function recalc(){
  const p=P[cur];if(!p)return;
  msg(L('প্রসেস হচ্ছে...|Processing...'));
  clearTimeout(timer);
  timer=setTimeout(()=>{try{render(p);showOut();thumbs();msg('')}catch(e){msg(L('প্রসেস করা যায়নি।|Could not process.'))}},20);
 }
 async function addFiles(files){
  files=[...files].filter(f=>/^image\//.test(f.type)||/\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
  if(!files.length)return msg(L('ছবি ফাইল বেছে নিন।|Please choose image files.'));
  for(let i=0;i<files.length;i++){
   msg(L('ছবি লোড হচ্ছে|Loading image')+' '+(i+1)+'/'+files.length+'...');
   try{const src=await loadImg(files[i]);await new Promise(r=>setTimeout(r,0));
    const p={src,q:detect(src),f:'magic',rot:0,ds:true,dw:true,out:null};P.push(p);cur=P.length-1;refreshUI();drawEditor();render(p);showOut();thumbs()}
   catch(e){msg(L('এই ছবি খোলা যায়নি (HEIC হলে JPG/PNG করে নিন)।|Could not open this image (convert HEIC to JPG/PNG).'));return}
  }
  msg('');select(cur);
 }
 el('scf').onchange=e=>{addFiles(e.target.files);e.target.value=''};
 el('scc').onchange=e=>{addFiles(e.target.files);e.target.value=''};
 el('scfb').onclick=()=>el('scf').click();
 el('sccb').onclick=()=>el('scc').click();

 /* কোণ টানা (মাউস + টাচ; টাচে কোণে না ধরলে পেজ স্ক্রল চলে) */
 function pt(ev){const r=E.getBoundingClientRect(),t=ev.touches&&ev.touches[0]||ev;return{x:(t.clientX-r.left)*E.width/r.width,y:(t.clientY-r.top)*E.height/r.height,k:E.width/r.width}}
 function hit(ev){const p=P[cur];if(!p)return-1;const a=pt(ev);let b=-1,bd=(ev.touches?34:22)*a.k;
  p.q.forEach((c,i)=>{const d=Math.hypot(c[0]-a.x,c[1]-a.y);if(d<bd){bd=d;b=i}});return b}
 const start=ev=>{const i=hit(ev);if(i<0)return;drag=i;if(ev.cancelable)ev.preventDefault();drawEditor()};
 const move=ev=>{if(drag<0)return;if(ev.cancelable)ev.preventDefault();const a=pt(ev),p=P[cur];p.q[drag]=[clamp(a.x,0,E.width),clamp(a.y,0,E.height)];drawEditor()};
 const end=()=>{if(drag<0)return;drag=-1;drawEditor();P[cur].out=null;recalc()};
 E.addEventListener('mousedown',start);addEventListener('mousemove',move);addEventListener('mouseup',end);
 E.addEventListener('touchstart',start,{passive:false});E.addEventListener('touchmove',move,{passive:false});E.addEventListener('touchend',end);E.addEventListener('touchcancel',end);

 el('scauto').onclick=()=>{const p=P[cur];if(!p)return;p.q=detect(p.src);p.out=null;drawEditor();recalc()};
 el('scfull').onclick=()=>{const p=P[cur];if(!p)return;const W=p.src.width,H=p.src.height;p.q=[[0,0],[W,0],[W,H],[0,H]];p.out=null;drawEditor();recalc()};
 el('scrl').onclick=()=>{const p=P[cur];if(!p)return;p.rot--;p.out=null;recalc()};
 el('scrr').onclick=()=>{const p=P[cur];if(!p)return;p.rot++;p.out=null;recalc()};
 el('scds').onclick=()=>{const p=P[cur];if(!p)return;p.ds=!p.ds;p.out=null;refreshUI();recalc()};
 el('scdw').onclick=()=>{const p=P[cur];if(!p)return;p.dw=!p.dw;p.out=null;refreshUI();recalc()};
 $$('#scan [data-f]').forEach(b=>b.onclick=()=>{const p=P[cur];if(!p)return;p.f=b.dataset.f;p.out=null;refreshUI();recalc()});
 el('scl').onclick=()=>{if(cur>0){[P[cur-1],P[cur]]=[P[cur],P[cur-1]];select(cur-1)}};
 el('scr').onclick=()=>{if(cur<P.length-1){[P[cur+1],P[cur]]=[P[cur],P[cur+1]];select(cur+1)}};
 el('scdel').onclick=()=>{if(cur<0)return;P.splice(cur,1);select(Math.min(cur,P.length-1));thumbs()};
 el('scclr').onclick=()=>{P.length=0;cur=-1;select(-1);msg('')};

 /* ---------- সেভ ---------- */
 const jpg=(c,q)=>new Promise(r=>c.toBlob(r,'image/jpeg',q));
 async function ensure(){for(const p of P)if(!p.out)render(p)}
 async function makePdf(){
  await ensure();
  const{PDFDocument}=await lp(),d=await PDFDocument.create(),a4=el('scsz').value=='a4',q=.9;
  for(const p of P){
   const img=await d.embedJpg(await (await jpg(p.out,q)).arrayBuffer()),iw=p.out.width,ih=p.out.height;
   if(a4){const land=iw>ih,W=land?842:595,H=land?595:842,m=18,k=Math.min((W-2*m)/iw,(H-2*m)/ih),w=iw*k,h=ih*k,pg=d.addPage([W,H]);
    pg.drawImage(img,{x:(W-w)/2,y:(H-h)/2,width:w,height:h})}
   else{const k=595/iw,pg=d.addPage([595,ih*k]);pg.drawImage(img,{x:0,y:0,width:595,height:ih*k})}
  }
  return d.save();
 }
 const stamp=()=>{const t=new Date(),z=n=>String(n).padStart(2,'0');return 'scan-'+t.getFullYear()+z(t.getMonth()+1)+z(t.getDate())+'-'+z(t.getHours())+z(t.getMinutes())};
 el('scpdf').onclick=async()=>{
  if(!P.length)return;
  try{msg(L('PDF তৈরি হচ্ছে...|Creating PDF...'));const b=await makePdf();pdl(b,stamp()+'.pdf');msg(L('PDF ডাউনলোড শুরু হয়েছে।|PDF download started.'))}
  catch(e){msg(L('PDF তৈরি হয়নি। ইন্টারনেট চেক করে আবার চেষ্টা করুন।|Could not create the PDF. Check your connection and retry.'))}
 };
 el('scjpg').onclick=async()=>{
  const p=P[cur];if(!p)return;if(!p.out)render(p);
  const b=await jpg(p.out,.92),u=URL.createObjectURL(b);dl(u,stamp()+'-p'+(cur+1)+'.jpg');setTimeout(()=>URL.revokeObjectURL(u),9e3);
 };
 el('scshr').onclick=async()=>{
  if(!P.length)return;
  try{msg(L('PDF তৈরি হচ্ছে...|Creating PDF...'));const b=await makePdf(),f=new File([b],stamp()+'.pdf',{type:'application/pdf'});
   if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Scan'});msg('')}
   else{pdl(b,f.name);msg(L('এই ডিভাইসে সরাসরি শেয়ার নেই; PDF ডাউনলোড হয়েছে।|Sharing is not supported here; the PDF was downloaded.'))}}
  catch(e){if(e&&e.name=='AbortError')msg('');else msg(L('শেয়ার করা যায়নি।|Could not share.'))}
 };

 refreshUI();thumbs();
})();
