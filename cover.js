/*! html-to-image 1.11.13 · MIT License · https://github.com/bubkoo/html-to-image */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).htmlToImage={})}(this,(function(t){"use strict";function e(t,e,n,r){return new(n||(n=Promise))((function(i,o){function u(t){try{a(r.next(t))}catch(t){o(t)}}function c(t){try{a(r.throw(t))}catch(t){o(t)}}function a(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(u,c)}a((r=r.apply(t,e||[])).next())}))}function n(t,e){var n,r,i,o,u={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function c(c){return function(a){return function(c){if(n)throw new TypeError("Generator is already executing.");for(;o&&(o=0,c[0]&&(u=0)),u;)try{if(n=1,r&&(i=2&c[0]?r.return:c[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,c[1])).done)return i;switch(r=0,i&&(c=[2&c[0],i.value]),c[0]){case 0:case 1:i=c;break;case 4:return u.label++,{value:c[1],done:!1};case 5:u.label++,r=c[1],c=[0];continue;case 7:c=u.ops.pop(),u.trys.pop();continue;default:if(!(i=u.trys,(i=i.length>0&&i[i.length-1])||6!==c[0]&&2!==c[0])){u=0;continue}if(3===c[0]&&(!i||c[1]>i[0]&&c[1]<i[3])){u.label=c[1];break}if(6===c[0]&&u.label<i[1]){u.label=i[1],i=c;break}if(i&&u.label<i[2]){u.label=i[2],u.ops.push(c);break}i[2]&&u.ops.pop(),u.trys.pop();continue}c=e.call(t,u)}catch(t){c=[6,t],r=0}finally{n=i=0}if(5&c[0])throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}([c,a])}}}var r,i=(r=0,function(){return r+=1,"u".concat("0000".concat((Math.random()*Math.pow(36,4)<<0).toString(36)).slice(-4)).concat(r)});function o(t){for(var e=[],n=0,r=t.length;n<r;n++)e.push(t[n]);return e}var u=null;function c(t){return void 0===t&&(t={}),u||(u=t.includeStyleProperties?t.includeStyleProperties:o(window.getComputedStyle(document.documentElement)))}function a(t,e){var n=(t.ownerDocument.defaultView||window).getComputedStyle(t).getPropertyValue(e);return n?parseFloat(n.replace("px","")):0}function s(t,e){void 0===e&&(e={});var n,r,i,o=e.width||(r=a(n=t,"border-left-width"),i=a(n,"border-right-width"),n.clientWidth+r+i),u=e.height||function(t){var e=a(t,"border-top-width"),n=a(t,"border-bottom-width");return t.clientHeight+e+n}(t);return{width:o,height:u}}var l=16384;function f(t,e){return void 0===e&&(e={}),t.toBlob?new Promise((function(n){t.toBlob(n,e.type?e.type:"image/png",e.quality?e.quality:1)})):new Promise((function(n){for(var r=window.atob(t.toDataURL(e.type?e.type:void 0,e.quality?e.quality:void 0).split(",")[1]),i=r.length,o=new Uint8Array(i),u=0;u<i;u+=1)o[u]=r.charCodeAt(u);n(new Blob([o],{type:e.type?e.type:"image/png"}))}))}function h(t){return new Promise((function(e,n){var r=new Image;r.onload=function(){r.decode().then((function(){requestAnimationFrame((function(){return e(r)}))}))},r.onerror=n,r.crossOrigin="anonymous",r.decoding="async",r.src=t}))}function d(t){return e(this,void 0,void 0,(function(){return n(this,(function(e){return[2,Promise.resolve().then((function(){return(new XMLSerializer).serializeToString(t)})).then(encodeURIComponent).then((function(t){return"data:image/svg+xml;charset=utf-8,".concat(t)}))]}))}))}function v(t,r,i){return e(this,void 0,void 0,(function(){var e,o,u;return n(this,(function(n){return e="http://www.w3.org/2000/svg",o=document.createElementNS(e,"svg"),u=document.createElementNS(e,"foreignObject"),o.setAttribute("width","".concat(r)),o.setAttribute("height","".concat(i)),o.setAttribute("viewBox","0 0 ".concat(r," ").concat(i)),u.setAttribute("width","100%"),u.setAttribute("height","100%"),u.setAttribute("x","0"),u.setAttribute("y","0"),u.setAttribute("externalResourcesRequired","true"),o.appendChild(u),u.appendChild(t),[2,d(o)]}))}))}var p=function(t,e){if(t instanceof e)return!0;var n=Object.getPrototypeOf(t);return null!==n&&(n.constructor.name===e.name||p(n,e))};function g(t,e,n,r){var i=".".concat(t,":").concat(e),o=n.cssText?function(t){var e=t.getPropertyValue("content");return"".concat(t.cssText," content: '").concat(e.replace(/'|"/g,""),"';")}(n):function(t,e){return c(e).map((function(e){var n=t.getPropertyValue(e),r=t.getPropertyPriority(e);return"".concat(e,": ").concat(n).concat(r?" !important":"",";")})).join(" ")}(n,r);return document.createTextNode("".concat(i,"{").concat(o,"}"))}function m(t,e,n,r){var o=window.getComputedStyle(t,n),u=o.getPropertyValue("content");if(""!==u&&"none"!==u){var c=i();try{e.className="".concat(e.className," ").concat(c)}catch(t){return}var a=document.createElement("style");a.appendChild(g(c,n,o,r)),e.appendChild(a)}}var w="application/font-woff",y="image/jpeg",b={woff:w,woff2:w,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:y,jpeg:y,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function S(t){var e=function(t){var e=/\.([^./]*?)$/g.exec(t);return e?e[1]:""}(t).toLowerCase();return b[e]||""}function E(t){return-1!==t.search(/^(data:)/)}function x(t,e){return"data:".concat(e,";base64,").concat(t)}function C(t,r,i){return e(this,void 0,void 0,(function(){var e,o;return n(this,(function(n){switch(n.label){case 0:return[4,fetch(t,r)];case 1:if(404===(e=n.sent()).status)throw new Error('Resource "'.concat(e.url,'" not found'));return[4,e.blob()];case 2:return o=n.sent(),[2,new Promise((function(t,n){var r=new FileReader;r.onerror=n,r.onloadend=function(){try{t(i({res:e,result:r.result}))}catch(t){n(t)}},r.readAsDataURL(o)}))]}}))}))}var P={};function R(t,r,i){return e(this,void 0,void 0,(function(){var e,o,u,c,a;return n(this,(function(n){switch(n.label){case 0:if(e=function(t,e,n){var r=t.replace(/\?.*/,"");return n&&(r=t),/ttf|otf|eot|woff2?/i.test(r)&&(r=r.replace(/.*\//,"")),e?"[".concat(e,"]").concat(r):r}(t,r,i.includeQueryParams),null!=P[e])return[2,P[e]];i.cacheBust&&(t+=(/\?/.test(t)?"&":"?")+(new Date).getTime()),n.label=1;case 1:return n.trys.push([1,3,,4]),[4,C(t,i.fetchRequestInit,(function(t){var e=t.res,n=t.result;return r||(r=e.headers.get("Content-Type")||""),function(t){return t.split(/,/)[1]}(n)}))];case 2:return u=n.sent(),o=x(u,r),[3,4];case 3:return c=n.sent(),o=i.imagePlaceholder||"",a="Failed to fetch resource: ".concat(t),c&&(a="string"==typeof c?c:c.message),a&&console.warn(a),[3,4];case 4:return P[e]=o,[2,o]}}))}))}function T(t){return e(this,void 0,void 0,(function(){var e;return n(this,(function(n){return"data:,"===(e=t.toDataURL())?[2,t.cloneNode(!1)]:[2,h(e)]}))}))}function A(t,r){return e(this,void 0,void 0,(function(){var e,i,o,u;return n(this,(function(n){switch(n.label){case 0:return t.currentSrc?(e=document.createElement("canvas"),i=e.getContext("2d"),e.width=t.clientWidth,e.height=t.clientHeight,null==i||i.drawImage(t,0,0,e.width,e.height),[2,h(e.toDataURL())]):(o=t.poster,u=S(o),[4,R(o,u,r)]);case 1:return[2,h(n.sent())]}}))}))}function k(t,r){var i;return e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:return e.trys.push([0,3,,4]),(null===(i=null==t?void 0:t.contentDocument)||void 0===i?void 0:i.body)?[4,I(t.contentDocument.body,r,!0)]:[3,2];case 1:return[2,e.sent()];case 2:return[3,4];case 3:return e.sent(),[3,4];case 4:return[2,t.cloneNode(!1)]}}))}))}var L=function(t){return null!=t.tagName&&"SVG"===t.tagName.toUpperCase()};function N(t,e,n){return p(e,Element)&&(function(t,e,n){var r=e.style;if(r){var i=window.getComputedStyle(t);i.cssText?(r.cssText=i.cssText,r.transformOrigin=i.transformOrigin):c(n).forEach((function(n){var o=i.getPropertyValue(n);if("font-size"===n&&o.endsWith("px")){var u=Math.floor(parseFloat(o.substring(0,o.length-2)))-.1;o="".concat(u,"px")}p(t,HTMLIFrameElement)&&"display"===n&&"inline"===o&&(o="block"),"d"===n&&e.getAttribute("d")&&(o="path(".concat(e.getAttribute("d"),")")),r.setProperty(n,o,i.getPropertyPriority(n))}))}}(t,e,n),function(t,e,n){m(t,e,":before",n),m(t,e,":after",n)}(t,e,n),function(t,e){p(t,HTMLTextAreaElement)&&(e.innerHTML=t.value),p(t,HTMLInputElement)&&e.setAttribute("value",t.value)}(t,e),function(t,e){if(p(t,HTMLSelectElement)){var n=e,r=Array.from(n.children).find((function(e){return t.value===e.getAttribute("value")}));r&&r.setAttribute("selected","")}}(t,e)),e}function I(t,r,i){return e(this,void 0,void 0,(function(){return n(this,(function(u){return i||!r.filter||r.filter(t)?[2,Promise.resolve(t).then((function(t){return function(t,r){return e(this,void 0,void 0,(function(){return n(this,(function(e){return p(t,HTMLCanvasElement)?[2,T(t)]:p(t,HTMLVideoElement)?[2,A(t,r)]:p(t,HTMLIFrameElement)?[2,k(t,r)]:[2,t.cloneNode(L(t))]}))}))}(t,r)})).then((function(i){return function(t,r,i){var u,c;return e(this,void 0,void 0,(function(){var e;return n(this,(function(n){switch(n.label){case 0:return L(r)?[2,r]:(e=[],0===(e=null!=(a=t).tagName&&"SLOT"===a.tagName.toUpperCase()&&t.assignedNodes?o(t.assignedNodes()):p(t,HTMLIFrameElement)&&(null===(u=t.contentDocument)||void 0===u?void 0:u.body)?o(t.contentDocument.body.childNodes):o((null!==(c=t.shadowRoot)&&void 0!==c?c:t).childNodes)).length||p(t,HTMLVideoElement)?[2,r]:[4,e.reduce((function(t,e){return t.then((function(){return I(e,i)})).then((function(t){t&&r.appendChild(t)}))}),Promise.resolve())]);case 1:return n.sent(),[2,r]}var a}))}))}(t,i,r)})).then((function(e){return N(t,e,r)})).then((function(t){return function(t,r){return e(this,void 0,void 0,(function(){var e,i,o,u,c,a,s,l,f,h,d,v,p;return n(this,(function(n){switch(n.label){case 0:if(0===(e=t.querySelectorAll?t.querySelectorAll("use"):[]).length)return[2,t];i={},p=0,n.label=1;case 1:return p<e.length?(o=e[p],(u=o.getAttribute("xlink:href"))?(c=t.querySelector(u),a=document.querySelector(u),c||!a||i[u]?[3,3]:(s=i,l=u,[4,I(a,r,!0)])):[3,3]):[3,4];case 2:s[l]=n.sent(),n.label=3;case 3:return p++,[3,1];case 4:if((f=Object.values(i)).length){for(h="http://www.w3.org/1999/xhtml",(d=document.createElementNS(h,"svg")).setAttribute("xmlns",h),d.style.position="absolute",d.style.width="0",d.style.height="0",d.style.overflow="hidden",d.style.display="none",v=document.createElementNS(h,"defs"),d.appendChild(v),p=0;p<f.length;p++)v.appendChild(f[p]);t.appendChild(d)}return[2,t]}}))}))}(t,r)}))]:[2,null]}))}))}var D=/url\((['"]?)([^'"]+?)\1\)/g,H=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,M=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function F(t,r,i,o,u){return e(this,void 0,void 0,(function(){var e,c,a,s;return n(this,(function(n){switch(n.label){case 0:return n.trys.push([0,5,,6]),e=i?function(t,e){if(t.match(/^[a-z]+:\/\//i))return t;if(t.match(/^\/\//))return window.location.protocol+t;if(t.match(/^[a-z]+:/i))return t;var n=document.implementation.createHTMLDocument(),r=n.createElement("base"),i=n.createElement("a");return n.head.appendChild(r),n.body.appendChild(i),e&&(r.href=e),i.href=t,i.href}(r,i):r,c=S(r),a=void 0,u?[4,u(e)]:[3,2];case 1:return s=n.sent(),a=x(s,c),[3,4];case 2:return[4,R(e,c,o)];case 3:a=n.sent(),n.label=4;case 4:return[2,t.replace((l=r,f=l.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1"),new RegExp("(url\\(['\"]?)(".concat(f,")(['\"]?\\))"),"g")),"$1".concat(a,"$3"))];case 5:return n.sent(),[3,6];case 6:return[2,t]}var l,f}))}))}function V(t){return-1!==t.search(D)}function q(t,r,i){return e(this,void 0,void 0,(function(){var e,o;return n(this,(function(n){return V(t)?(e=function(t,e){var n=e.preferredFontFormat;return n?t.replace(M,(function(t){for(;;){var e=H.exec(t)||[],r=e[0],i=e[2];if(!i)return"";if(i===n)return"src: ".concat(r,";")}})):t}(t,i),o=function(t){var e=[];return t.replace(D,(function(t,n,r){return e.push(r),t})),e.filter((function(t){return!E(t)}))}(e),[2,o.reduce((function(t,e){return t.then((function(t){return F(t,e,r,i)}))}),Promise.resolve(e))]):[2,t]}))}))}function U(t,r,i){var o;return e(this,void 0,void 0,(function(){var e,u;return n(this,(function(n){switch(n.label){case 0:return(e=null===(o=r.style)||void 0===o?void 0:o.getPropertyValue(t))?[4,q(e,null,i)]:[3,2];case 1:return u=n.sent(),r.style.setProperty(t,u,r.style.getPropertyPriority(t)),[2,!0];case 2:return[2,!1]}}))}))}function j(t,r){return e(this,void 0,void 0,(function(){var e,i;return n(this,(function(n){switch(n.label){case 0:return[4,U("background",t,r)];case 1:return n.sent()?[3,3]:[4,U("background-image",t,r)];case 2:n.sent(),n.label=3;case 3:return[4,U("mask",t,r)];case 4:return(i=n.sent())?[3,6]:[4,U("-webkit-mask",t,r)];case 5:i=n.sent(),n.label=6;case 6:return(e=i)?[3,8]:[4,U("mask-image",t,r)];case 7:e=n.sent(),n.label=8;case 8:return e?[3,10]:[4,U("-webkit-mask-image",t,r)];case 9:n.sent(),n.label=10;case 10:return[2]}}))}))}function O(t,r){return e(this,void 0,void 0,(function(){var e,i,o;return n(this,(function(n){switch(n.label){case 0:return(e=p(t,HTMLImageElement))&&!E(t.src)||p(t,SVGImageElement)&&!E(t.href.baseVal)?[4,R(i=e?t.src:t.href.baseVal,S(i),r)]:[2];case 1:return o=n.sent(),[4,new Promise((function(n,i){t.onload=n,t.onerror=r.onImageErrorHandler?function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];try{n(r.onImageErrorHandler.apply(r,t))}catch(t){i(t)}}:i;var u=t;u.decode&&(u.decode=n),"lazy"===u.loading&&(u.loading="eager"),e?(t.srcset="",t.src=o):t.href.baseVal=o}))];case 2:return n.sent(),[2]}}))}))}function B(t,r){return e(this,void 0,void 0,(function(){var e,i;return n(this,(function(n){switch(n.label){case 0:return e=o(t.childNodes),i=e.map((function(t){return z(t,r)})),[4,Promise.all(i).then((function(){return t}))];case 1:return n.sent(),[2]}}))}))}function z(t,r){return e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:return p(t,Element)?[4,j(t,r)]:[3,4];case 1:return e.sent(),[4,O(t,r)];case 2:return e.sent(),[4,B(t,r)];case 3:e.sent(),e.label=4;case 4:return[2]}}))}))}var W={};function $(t){return e(this,void 0,void 0,(function(){var e,r;return n(this,(function(n){switch(n.label){case 0:return null!=(e=W[t])?[2,e]:[4,fetch(t)];case 1:return[4,n.sent().text()];case 2:return r=n.sent(),e={url:t,cssText:r},W[t]=e,[2,e]}}))}))}function G(t,r){return e(this,void 0,void 0,(function(){var i,o,u,c,a=this;return n(this,(function(s){return i=t.cssText,o=/url\(["']?([^"')]+)["']?\)/g,u=i.match(/url\([^)]+\)/g)||[],c=u.map((function(u){return e(a,void 0,void 0,(function(){var e;return n(this,(function(n){return(e=u.replace(o,"$1")).startsWith("https://")||(e=new URL(e,t.url).href),[2,C(e,r.fetchRequestInit,(function(t){var e=t.result;return i=i.replace(u,"url(".concat(e,")")),[u,e]}))]}))}))})),[2,Promise.all(c).then((function(){return i}))]}))}))}function _(t){if(null==t)return[];for(var e=[],n=t.replace(/(\/\*[\s\S]*?\*\/)/gi,""),r=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");;){if(null===(u=r.exec(n)))break;e.push(u[0])}n=n.replace(r,"");for(var i=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,o=new RegExp("((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})","gi");;){var u;if(null===(u=i.exec(n))){if(null===(u=o.exec(n)))break;i.lastIndex=o.lastIndex}else o.lastIndex=i.lastIndex;e.push(u[0])}return e}function J(t,r){return e(this,void 0,void 0,(function(){var e,i;return n(this,(function(n){return e=[],i=[],t.forEach((function(e){if("cssRules"in e)try{o(e.cssRules||[]).forEach((function(t,n){if(t.type===CSSRule.IMPORT_RULE){var o=n+1,u=$(t.href).then((function(t){return G(t,r)})).then((function(t){return _(t).forEach((function(t){try{e.insertRule(t,t.startsWith("@import")?o+=1:e.cssRules.length)}catch(e){console.error("Error inserting rule from remote css",{rule:t,error:e})}}))})).catch((function(t){console.error("Error loading remote css",t.toString())}));i.push(u)}}))}catch(o){var n=t.find((function(t){return null==t.href}))||document.styleSheets[0];null!=e.href&&i.push($(e.href).then((function(t){return G(t,r)})).then((function(t){return _(t).forEach((function(t){n.insertRule(t,n.cssRules.length)}))})).catch((function(t){console.error("Error loading remote stylesheet",t)}))),console.error("Error inlining remote css file",o)}})),[2,Promise.all(i).then((function(){return t.forEach((function(t){if("cssRules"in t)try{o(t.cssRules||[]).forEach((function(t){e.push(t)}))}catch(e){console.error("Error while reading CSS rules from ".concat(t.href),e)}})),e}))]}))}))}function Q(t){return t.filter((function(t){return t.type===CSSRule.FONT_FACE_RULE})).filter((function(t){return V(t.style.getPropertyValue("src"))}))}function X(t,r){return e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:if(null==t.ownerDocument)throw new Error("Provided element is not within a Document");return[4,J(o(t.ownerDocument.styleSheets),r)];case 1:return[2,Q(e.sent())]}}))}))}function K(t){return t.trim().replace(/["']/g,"")}function Y(t,r){return e(this,void 0,void 0,(function(){var e,i;return n(this,(function(n){switch(n.label){case 0:return[4,X(t,r)];case 1:return e=n.sent(),i=function(t){var e=new Set;return function t(n){(n.style.fontFamily||getComputedStyle(n).fontFamily).split(",").forEach((function(t){e.add(K(t))})),Array.from(n.children).forEach((function(e){e instanceof HTMLElement&&t(e)}))}(t),e}(t),[4,Promise.all(e.filter((function(t){return i.has(K(t.style.fontFamily))})).map((function(t){var e=t.parentStyleSheet?t.parentStyleSheet.href:null;return q(t.cssText,e,r)})))];case 2:return[2,n.sent().join("\n")]}}))}))}function Z(t,r){return e(this,void 0,void 0,(function(){var e,i,o,u,c;return n(this,(function(n){switch(n.label){case 0:return null==r.fontEmbedCSS?[3,1]:(i=r.fontEmbedCSS,[3,5]);case 1:return r.skipFonts?(o=null,[3,4]):[3,2];case 2:return[4,Y(t,r)];case 3:o=n.sent(),n.label=4;case 4:i=o,n.label=5;case 5:return(e=i)&&(u=document.createElement("style"),c=document.createTextNode(e),u.appendChild(c),t.firstChild?t.insertBefore(u,t.firstChild):t.appendChild(u)),[2]}}))}))}function tt(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){var e,i,o,u;return n(this,(function(n){switch(n.label){case 0:return e=s(t,r),i=e.width,o=e.height,[4,I(t,r,!0)];case 1:return[4,Z(u=n.sent(),r)];case 2:return n.sent(),[4,z(u,r)];case 3:return n.sent(),function(t,e){var n=t.style;e.backgroundColor&&(n.backgroundColor=e.backgroundColor),e.width&&(n.width="".concat(e.width,"px")),e.height&&(n.height="".concat(e.height,"px"));var r=e.style;null!=r&&Object.keys(r).forEach((function(t){n[t]=r[t]}))}(u,r),[4,v(u,i,o)];case 4:return[2,n.sent()]}}))}))}function et(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){var e,i,o,u,c,a,f,d,v;return n(this,(function(n){switch(n.label){case 0:return e=s(t,r),i=e.width,o=e.height,[4,tt(t,r)];case 1:return[4,h(n.sent())];case 2:return u=n.sent(),c=document.createElement("canvas"),a=c.getContext("2d"),f=r.pixelRatio||function(){var t,e;try{e=process}catch(t){}var n=e&&e.env?e.env.devicePixelRatio:null;return n&&(t=parseInt(n,10),Number.isNaN(t)&&(t=1)),t||window.devicePixelRatio||1}(),d=r.canvasWidth||i,v=r.canvasHeight||o,c.width=d*f,c.height=v*f,r.skipAutoScale||function(t){(t.width>l||t.height>l)&&(t.width>l&&t.height>l?t.width>t.height?(t.height*=l/t.width,t.width=l):(t.width*=l/t.height,t.height=l):t.width>l?(t.height*=l/t.width,t.width=l):(t.width*=l/t.height,t.height=l))}(c),c.style.width="".concat(d),c.style.height="".concat(v),r.backgroundColor&&(a.fillStyle=r.backgroundColor,a.fillRect(0,0,c.width,c.height)),a.drawImage(u,0,0,c.width,c.height),[2,c]}}))}))}t.getFontEmbedCSS=function(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){return n(this,(function(e){return[2,Y(t,r)]}))}))},t.toBlob=function(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:return[4,et(t,r)];case 1:return[4,f(e.sent())];case 2:return[2,e.sent()]}}))}))},t.toCanvas=et,t.toJpeg=function(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:return[4,et(t,r)];case 1:return[2,e.sent().toDataURL("image/jpeg",r.quality||1)]}}))}))},t.toPixelData=function(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){var e,i,o,u;return n(this,(function(n){switch(n.label){case 0:return e=s(t,r),i=e.width,o=e.height,[4,et(t,r)];case 1:return u=n.sent(),[2,u.getContext("2d").getImageData(0,0,i,o).data]}}))}))},t.toPng=function(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:return[4,et(t,r)];case 1:return[2,e.sent().toDataURL()]}}))}))},t.toSvg=tt}));

(function(){
'use strict';var $=function(i){return document.getElementById(i)};
var KEY='cover-studio-v3',LKEY='cover-studio-logo-v2',W=794,H=1122;
var FIELDS=['tpl','cPri','cAcc','docType','font','lang','digits','sign','uni','campus','dept','courseCode','courseName','topic','mode','sName','sRoll','members','sClass','session','mobile','date','dateFmt','bindOn','bindSide','bindMm','bindType','teachers','dclOn','dclStyle','dclText','dclPlace','dclSup','aprStyle','aprText','aprPlace','aprExam','aprStamp','ackStyle','ackText','ackPlace','ackThanks','ackClose','tocStyle','tocEntries'];
var DEF={tpl:'classic',cPri:'#0b1f3a',cAcc:'#d4af37',docType:'assignment',font:'Cinzel',lang:'en',digits:'en',sign:false,
uni:'',campus:'',dept:'',courseCode:'',courseName:'',topic:'',mode:'single',sName:'',sRoll:'',members:'',sClass:'',session:'',mobile:'',date:'',dateFmt:'long',bindOn:false,bindSide:'left',bindMm:'15',bindType:'',teachers:'',dclOn:false,dclStyle:'original',dclText:'',dclPlace:'',dclSup:false,aprStyle:'supervisor',aprText:'',aprPlace:'',aprExam:false,aprStamp:true,ackStyle:'supervisor',ackText:'',ackPlace:'',ackThanks:'',ackClose:true,tocStyle:'classic',tocEntries:''};
/* ফাঁকা থাকলে প্রিভিউতে হালকা নমুনা লেখা দেখায় (PDF-এ আসে না) */
var SAMPLE={uni:'DHAKA CENTRAL UNIVERSITY',campus:'MAIN CAMPUS',dept:'DEPARTMENT OF COMPUTER SCIENCE',cs:'CSE-101 — Programming Fundamentals',topic:'Introduction to Artificial Intelligence',sName:'ABDUL KARIM',sRoll:'101',members:'ABDUL KARIM, 101\nRAHIM UDDIN, 102',sClass:'BSc Honours 1st Year',session:'2025-26',mobile:'01700000000',teachers:'Prof. Dr. Example Name\nAssociate Professor\nCourse Instructor'};
var T={
en:{by:'SUBMITTED BY',to:'SUBMITTED TO',roll:'Class Roll',cls:'Class / Degree',ses:'Session',mob:'Mobile No',dt:'Submission Date',topic:'TOPIC',s1:"Student's Signature",s2:"Teacher's Signature",
docs:{assignment:'ASSIGNMENT',lab:'LAB REPORT',presentation:'PRESENTATION',project:'PROJECT',thesis:'THESIS',quiz:'QUIZ',exam:'EXAM'},
mo:['January','February','March','April','May','June','July','August','September','October','November','December']},
bn:{by:'জমাদানকারী',to:'জমাগ্রহণকারী',roll:'ক্লাস রোল',cls:'ক্লাস / ডিগ্রি',ses:'সেশন',mob:'মোবাইল নম্বর',dt:'জমাদানের তারিখ',topic:'বিষয়',s1:'শিক্ষার্থীর স্বাক্ষর',s2:'শিক্ষকের স্বাক্ষর',
docs:{assignment:'অ্যাসাইনমেন্ট',lab:'ল্যাব রিপোর্ট',presentation:'প্রেজেন্টেশন',project:'প্রজেক্ট',thesis:'থিসিস',quiz:'কুইজ',exam:'পরীক্ষা'},
mo:['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']}
};
var FALLBACK='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 6 90 20v30c0 25-17 38-40 46C27 88 10 75 10 50V20z" fill="#0b1f3a"/><path d="M50 18 80 28v22c0 18-12 28-30 35-18-7-30-17-30-35V28z" fill="none" stroke="#d4af37" stroke-width="3"/><circle cx="50" cy="48" r="12" fill="#d4af37"/></svg>');
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function clear(n){while(n.firstChild)n.removeChild(n.firstChild)}
function get(){var o={};FIELDS.forEach(function(k){var e=$(k);o[k]=e.type==='checkbox'?e.checked:e.value});return o}
function set(o){FIELDS.forEach(function(k){var e=$(k);if(!e||o[k]===undefined||o[k]===null)return;if(e.type==='checkbox')e.checked=!!o[k];else e.value=o[k]})}
function pad(n){return n<10?'0'+n:''+n}
function todayISO(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
var lastTpl=null;
/* ===== তারিখ পিকার: টাইল + দ্রুত বাছাই + লাইভ ফরম্যাট ===== */
function isoOff(n){var d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function bnum(x){return String(x).replace(/[0-9]/g,function(c){return '০১২৩৪৫৬৭৮৯'.charAt(+c)})}
function relTxt(n){
var a=Math.abs(n),u,c,B=UL==='bn'?bnum:String;
if(n===0)return ['Today','আজ'];if(n===1)return ['Tomorrow','আগামীকাল'];if(n===-1)return ['Yesterday','গতকাল'];
if(a<14){c=a;u=['day','দিন']}else if(a<60){c=Math.round(a/7);u=['week','সপ্তাহ']}else if(a<365){c=Math.round(a/30);u=['month','মাস']}else{c=Math.round(a/365);u=['year','বছর']}
return n>0?['In '+c+' '+u[0]+(c>1?'s':''),B(c)+' '+u[1]+' পরে']:[c+' '+u[0]+(c>1?'s':'')+' ago',B(c)+' '+u[1]+' আগে'];
}
var dp={y:0,m:0,view:'day',open:false};
function dateUI(v,fd){
var tile=$('dtTile');if(!tile)return;
var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v.date||''),bn=UL==='bn',loc=bn?'bn-BD':'en-GB',B=bn?bnum:String;
var cal=tile.querySelector('.dtx-cal'),rel=$('dtRel'),wasOn=cal.dataset.k;
if(m){
var y=+m[1],mo=+m[2],d=+m[3],dt=new Date(y,mo-1,d),t0=new Date();t0.setHours(0,0,0,0);
var diff=Math.round((dt-t0)/864e5),r=relTxt(diff);
tile.classList.remove('empty');cal.classList.remove('empty');
$('dtMon').textContent=new Intl.DateTimeFormat(bn?'bn-BD':'en-US',{month:'short'}).format(dt);
$('dtDay').textContent=B(d);
$('dtFull').textContent=new Intl.DateTimeFormat(loc,{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(dt);
rel.textContent=bn?r[1]:r[0];rel.classList.toggle('past',diff<0);
if(wasOn!==v.date){cal.dataset.k=v.date;if(wasOn!==undefined&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)){cal.classList.remove('pop');void cal.offsetWidth;cal.classList.add('pop')}}
}else{
tile.classList.add('empty');cal.classList.add('empty');cal.dataset.k='';
$('dtMon').textContent='---';$('dtDay').textContent='--';
$('dtFull').textContent=U('Select submission date','জমাদানের তারিখ বেছে নিন');rel.textContent='';
}
var base=m?v.date:todayISO();
$('dtF1').textContent=fd(base,'dmy');$('dtF2').textContent=fd(base,'long');
var f=v.dateFmt==='long'?'long':'dmy';$('dtSeg').dataset.v=f;
Array.prototype.forEach.call($('dtSeg').querySelectorAll('.dtx-opt'),function(b){b.setAttribute('aria-pressed',b.dataset.f===f?'true':'false')});
Array.prototype.forEach.call($('dtChips').querySelectorAll('.dtx-chip[data-off]'),function(b){b.classList.toggle('on',v.date===isoOff(+b.dataset.off))});
if(dp.open)dpBuild();
}
/* ===== কাস্টম ক্যালেন্ডার পিকার ===== */
function dpLoc(){return UL==='bn'?'bn-BD':'en-US'}
function dpIso(y,m,d){var x=new Date(y,m,d);return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate())}
function dpBuild(){
var bn=UL==='bn',B=bn?bnum:String,g=$('dpGrid'),cur=$('date').value,td=todayISO(),i,btn;
clear(g);clear($('dpWd'));
g.className='dp-grid'+(dp.view==='month'?' mv':'');
$('dpWd').hidden=dp.view==='month';
if(dp.view==='month'){
$('dpTitle').textContent=B(dp.y);
for(i=0;i<12;i++){
btn=el('button','dp-m'+(cur&&+cur.slice(0,4)===dp.y&&+cur.slice(5,7)-1===i?' on':''),new Intl.DateTimeFormat(dpLoc(),{month:'long'}).format(new Date(dp.y,i,1)));
btn.type='button';btn.dataset.m=i;g.appendChild(btn);
}return;
}
$('dpTitle').textContent=new Intl.DateTimeFormat(dpLoc(),{month:'long'}).format(new Date(dp.y,dp.m,1))+' '+B(dp.y);
for(i=0;i<7;i++){var w=new Intl.DateTimeFormat(dpLoc(),{weekday:'short'}).format(new Date(2023,0,1+i));$('dpWd').appendChild(el('span','',bn?w:w.slice(0,2)))}
var first=new Date(dp.y,dp.m,1).getDay();
for(i=0;i<42;i++){
var dt=new Date(dp.y,dp.m,1-first+i),iso=dpIso(dp.y,dp.m,1-first+i),wd=dt.getDay();
btn=el('button','dp-d'+(dt.getMonth()!==dp.m?' out':'')+(wd===5||wd===6?' wk':'')+(iso===td?' td':'')+(iso===cur?' on':''),B(dt.getDate()));
btn.type='button';btn.dataset.iso=iso;btn.tabIndex=iso===cur||(!cur&&iso===td)?0:-1;
btn.setAttribute('aria-label',new Intl.DateTimeFormat(dpLoc(),{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(dt));
if(iso===cur)btn.setAttribute('aria-current','date');
g.appendChild(btn);
}
}
function dpOpen(o){
dp.open=o;$('dpPop').hidden=!o;$('dtBtn').setAttribute('aria-expanded',o?'true':'false');
if(o){var c=/^(\d{4})-(\d{2})/.exec($('date').value||todayISO());dp.y=+c[1];dp.m=+c[2]-1;dp.view='day';dpBuild();
var f=$('dpGrid').querySelector('.dp-d[tabindex="0"]')||$('dpGrid').querySelector('.dp-d');if(f)f.focus()}
}
function dpPick(iso){$('date').value=iso;touched.date=true;dpOpen(false);render();$('dtBtn').focus()}
$('dtBtn').addEventListener('click',function(){dpOpen(!dp.open)});
document.addEventListener('mousedown',function(e){if(dp.open&&!$('dtTile').contains(e.target))dpOpen(false)});
$('dpPop').addEventListener('keydown',function(e){
if(e.key==='Escape'){dpOpen(false);$('dtBtn').focus();return}
var t=e.target;if(!t.classList.contains('dp-d'))return;
var step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];if(!step)return;
e.preventDefault();var all=Array.prototype.slice.call($('dpGrid').querySelectorAll('.dp-d')),n=all.indexOf(t)+step;
if(n<0||n>41){var d=new Date(t.dataset.iso+'T00:00:00');d.setDate(d.getDate()+step);dp.y=d.getFullYear();dp.m=d.getMonth();dpBuild();var q=$('dpGrid').querySelector('[data-iso="'+dpIso(d.getFullYear(),d.getMonth(),d.getDate())+'"]');if(q)q.focus();return}
all[n].focus();
});
$('dpGrid').addEventListener('click',function(e){
var b=e.target.closest('button');if(!b)return;
if(b.dataset.iso)return dpPick(b.dataset.iso);
if(b.dataset.m!==undefined){dp.m=+b.dataset.m;dp.view='day';dpBuild()}
});
function dpNav(n){if(dp.view==='month'){dp.y+=n}else{var d=new Date(dp.y,dp.m+n,1);dp.y=d.getFullYear();dp.m=d.getMonth()}dpBuild()}
$('dpPrev').addEventListener('click',function(){dpNav(-1)});
$('dpNext').addEventListener('click',function(){dpNav(1)});
$('dpTitle').addEventListener('click',function(){dp.view=dp.view==='day'?'month':'day';dpBuild()});
$('dpClear').addEventListener('click',function(){$('date').value='';touched.date=true;dpOpen(false);render()});
function themeName(p,a){var l=document.querySelectorAll('#sws .sw');for(var k=0;k<l.length;k++)if(l[k].dataset.p.toLowerCase()===String(p).toLowerCase()&&l[k].dataset.a.toLowerCase()===String(a).toLowerCase())return l[k].dataset.uiTitle||l[k].title;return 'Custom colors · নিজের পছন্দের রং'}
function render(){try{typeSync($('docType').value)}catch(e){}
var v=get(),bi=v.lang==='bi',L=T[bi?'en':(T[v.lang]?v.lang:'en')],B=T.bn,warns=[];
var D=function(s){s=String(s);return v.digits==='bn'?s.replace(/[0-9]/g,function(c){return '০১২৩৪৫৬৭৮৯'.charAt(+c)}):s};
/* label: English (or Bangla only) + Bangla line when bilingual */
var bil=function(n,key,sep){clear(n);n.appendChild(document.createTextNode(L[key]));if(bi)n.appendChild(el('small','bn',B[key]))};
var sh=$('sheet');
sh.className='sheet tpl-'+v.tpl+(v.tpl!==lastTpl?' swap':'');lastTpl=v.tpl;
sh.style.setProperty('--p',v.cPri);sh.style.setProperty('--a',v.cAcc);
sh.style.setProperty('--hf',"'"+v.font+"','Noto Serif Bengali',serif");
var G=function(n,k,txt){var f=String(txt==null?'':txt).trim(),ph=!f,was=n.dataset.ph==='1';n.textContent=ph?D(SAMPLE[k]||''):f;n.style.display='';n.classList.toggle('ph',ph);n.dataset.ph=ph?'1':'0';if(was&&!ph){n.classList.remove('ink');void n.offsetWidth;n.classList.add('ink')}};
G($('oUni'),'uni',v.uni);G($('oCampus'),'campus',v.campus);G($('oDept'),'dept',v.dept);
$('oDoc').textContent=L.docs[v.docType]||'';
$('oDocBn').textContent=bi?(B.docs[v.docType]||''):'';$('oDocBn').style.display=bi?'':'none';
bil($('oTl'),'topic');$('oTl').style.display='';
G($('oTopic'),'topic',v.topic);
G($('oCourse'),'cs',D([v.courseCode.trim(),v.courseName.trim()].filter(Boolean).join(' — ')));
bil($('oBy'),'by');bil($('oTo'),'to');
/* date */
var fd=function(iso,f){var p=(iso||'').split('-');if(p.length!==3)return '';var y=+p[0],m=+p[1],d=+p[2];return (f||v.dateFmt)==='long'?D(d)+' '+L.mo[m-1]+' '+D(y):D(pad(d)+'/'+pad(m)+'/'+y)};
var ds=fd(v.date);dateUI(v,fd);bindApply(v);
/* student column */
var s=$('oStu');clear(s);
var row=function(par,key,val,ghost){var ph=!val,r=el('div','rw'),k=el('span','k');bil(k,key);r.appendChild(k);r.appendChild(el('span','v'+(ph?' ph':''),ph?ghost:val));par.appendChild(r)};
if(v.mode==='group'){
var lines=v.members.split('\n').map(function(x){return x.trim()}).filter(Boolean),gph=!lines.length;
if(gph)lines=SAMPLE.members.split('\n');
var rl0=L.roll.split(' ').pop()+(bi?' / '+B.roll.split(' ').pop():'');
lines.slice(0,8).forEach(function(ln){
var i=ln.lastIndexOf(','),nm=ln,rl='';
if(i>-1){nm=ln.slice(0,i).trim();rl=ln.slice(i+1).trim()}
var b=el('div','mb');b.appendChild(el('b',gph?'ph':'',nm));b.appendChild(el('span',gph?'ph':'',rl?rl0+': '+D(rl):''));s.appendChild(b);
});
}else{
var sn=v.sName.trim();
s.appendChild(el('div','nm'+(sn?'':' ph'),sn||SAMPLE.sName));
row(s,'roll',D(v.sRoll.trim()),D(SAMPLE.sRoll));
}
row(s,'cls',D(v.sClass.trim()),SAMPLE.sClass);
row(s,'ses',D(v.session.trim()),D(SAMPLE.session));
row(s,'mob',D(v.mobile.trim()),D(SAMPLE.mobile));
row(s,'dt',ds,fd(todayISO()));
var mb=v.mobile.trim().replace(/[\s-]/g,'');
/* teacher column */
var t=$('oTea');clear(t);
var tl=v.teachers.split('\n').map(function(x){return x.trim()}).filter(Boolean),tph=!tl.length;
if(tph)tl=SAMPLE.teachers.split('\n');
tl.forEach(function(x,i){t.appendChild(el('div',(i===0?'tn':'tr')+(tph?' ph':''),x))});
var du=v.dept.trim(),uu=v.uni.trim(),tmph=!du&&!uu;
var tm=[du||(tmph?SAMPLE.dept:''),uu||(tmph?SAMPLE.uni:'')].filter(Boolean).join('\n');
$('oTm').textContent=tm;$('oTm').style.whiteSpace='pre-line';$('oTm').style.display=tm?'':'none';$('oTm').classList.toggle('ph',tmph);
$('oSign').style.display=v.sign?'':'none';
bil($('oS1'),'s1');bil($('oS2'),'s2');
$('warn').textContent=warns.join(' ');
var req=['uni','dept','courseCode','courseName','topic','sClass','session','mobile','teachers',v.mode==='group'?'members':'sName'].concat(v.mode==='group'?[]:['sRoll']);
var done=req.filter(function(k){return String(v[k]).trim()}).length;
document.querySelector('.top').style.setProperty('--pg',Math.round(done/req.length*100)+'%');
Array.prototype.forEach.call(document.querySelectorAll('#form input[type=text],#form input[type=tel],#form textarea'),function(e){e.classList.toggle('ok',!!e.value.trim())});
/* UI state */
$('boxSingle').hidden=v.mode==='group';$('boxGroup').hidden=v.mode!=='group';
updTpl(v.tpl);
var swT=themeName(v.cPri,v.cAcc);$('tselThName').textContent=ui(swT);var td=$('tselDot');td.style.setProperty('--p0',v.cPri);td.style.setProperty('--a0',v.cAcc);
try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}
validate(v);
try{dclRender(v)}catch(e){}
autoFit();fit();schedThumbs();
}
function fit(){
var st=$('stage'),w=st.clientWidth;if(!w)return;
var k=w/W;
if(window.innerWidth>960)k=Math.min(k,(window.innerHeight-215-(($('pgsw')&&!$('pgsw').hidden)?58:0))/H);
k=Math.max(.2,Math.min(1.6,k));
$('scaler').style.transform='scale('+k+')';
$('scaler').style.marginLeft=Math.max(0,Math.round((w-W*k)/2))+'px';
st.style.height=Math.round(H*k)+'px';
}
/* লেখা বেশি হলে নিজে নিজে ছোট হয়, যাতে ওভারল্যাপ বা কাটা না পড়ে */
function autoFit(){fitEl($('sheet'));var p2=$('page2');if(p2&&!p2.hidden)fitEl($('sheet2'))}
var HSEL='.uni,.campus,.dept,.dt,.dtb,.tt,.cs,.nm,.tn,.tr,.tm,.rw .v,.mb b,.mb span,.dc-m .v,.sg .sn';
/* কোনো শব্দ তার বাক্সের চেয়ে চওড়া হলে true (অর্থাৎ শব্দ ভাঙতে হতো) */
function hOver(sh){var l=sh.querySelectorAll(HSEL);for(var i=0;i<l.length;i++){var e=l[i];if(e.scrollWidth>e.clientWidth+1)return true}return false}
function fitEl(sh){
var s=sh.style;sh.removeAttribute('data-wrap');
function ap(k){var m=Math.round((1-k*.04)*100)/100;s.setProperty('--un',Math.round(31*m)+'px');s.setProperty('--dtf',Math.round(52*m)+'px');s.setProperty('--tt',Math.round(27*m)+'px');s.setProperty('--ich',Math.round(240*m*m)+'px');s.setProperty('--z',m.toFixed(2));return sh.scrollHeight<=sh.clientHeight+1&&!hOver(sh)}
if(ap(0))return;
var lo=1,hi=15,mid;
while(lo<hi){mid=(lo+hi)>>1;if(ap(mid))hi=mid;else lo=mid+1}
ap(lo);
/* সবচেয়ে ছোট মাপেও না ধরলে (অতি লম্বা একটাই শব্দ) তখনই কেবল শব্দ ভেঙে দেওয়া হবে */
if(hOver(sh)){sh.setAttribute('data-wrap','1');ap(lo)}
}
function setLogo(src){var im=$('logo');im.onerror=function(){im.onerror=null;im.src=FALLBACK};im.src=src}
/* ===== Validation ===== */
var touched={},submitted=false,ISSUES=[],msgBox={},lastMsg={};
var HAS=/[A-Za-z\u0980-\u09FF]/,DIGR=/[0-9\u09E6-\u09EF]/;
function nd(x){return String(x).replace(/[\u09E6-\u09EF]/g,function(c){return '০১২৩৪৫৬৭৮৯'.indexOf(c)})}
/* ===== UI ভাষা (bi = দুটোই, en = শুধু ইংরেজি, bn = শুধু বাংলা) ===== */
var UL='en',BNRE=/[\u0980-\u09FF]/;
function normUl(l){l=String(l||'').toLowerCase();return l==='bn'||l==='bi'?l:'en'}
function pair(s){s=String(s==null?'':s);var re=/ · /g,m;while((m=re.exec(s))){var l=s.slice(0,m.index),r=s.slice(m.index+3),lb=BNRE.test(l),rb=BNRE.test(r);if(lb!==rb)return lb?{bn:l,en:r,bnFirst:1}:{en:l,bn:r,bnFirst:0}}return null}
/* "English · বাংলা" লেখাকে বর্তমান ভাষা অনুযায়ী একটি স্ট্রিং বানায় */
function ui(s){var p=pair(s);if(!p)return String(s==null?'':s);return UL==='en'?p.en:UL==='bn'?p.bn:(p.bnFirst?p.bn+' · '+p.en:p.en+' · '+p.bn)}
function U(en,bn){return UL==='en'?en:UL==='bn'?bn:en+' · '+bn}
/* একই লেখা span দিয়ে বসায় — CSS ভাষা বদলালে নিজেই লুকিয়ে/দেখিয়ে দেয় */
function biNode(n,s){clear(n);var p=pair(s);if(!p){n.appendChild(document.createTextNode(String(s==null?'':s)));return n}
var a=el('span',p.bnFirst?'t-bn':'t-en',p.bnFirst?p.bn:p.en),b=el('span',p.bnFirst?'t-en':'t-bn',p.bnFirst?p.en:p.bn);
n.appendChild(a);n.appendChild(el('span','t-sep',' · '));n.appendChild(b);return n}
function applyUi(){
var l=normUl(document.documentElement.getAttribute('data-ui-lang'));
if(document.documentElement.getAttribute('data-ui-lang')!==l)document.documentElement.setAttribute('data-ui-lang',l);
var ch=l!==UL;UL=l;
document.documentElement.lang=l==='bn'?'bn':'en';
document.title=ui(DOC_TITLE);
Array.prototype.forEach.call(document.querySelectorAll('option[data-en]'),function(o){o.textContent=U(o.dataset.en,o.dataset.bn)});
Array.prototype.forEach.call(document.querySelectorAll('[data-ui-aria]'),function(e){e.setAttribute('aria-label',ui(e.dataset.uiAria))});
Array.prototype.forEach.call(document.querySelectorAll('[data-ui-title]'),function(e){e.setAttribute('title',ui(e.dataset.uiTitle))});
if(ch&&window.__uiReady){render();if(gOpen)gSyncTheme(false)}
}
function initUi(){
Array.prototype.forEach.call(document.querySelectorAll('[aria-label],[title]'),function(e){
if(e.closest&&e.closest('.sheet'))return;
var a=e.getAttribute('aria-label'),t=e.getAttribute('title');
if(a&&pair(a))e.dataset.uiAria=a;
if(t&&pair(t))e.dataset.uiTitle=t;
});
new MutationObserver(applyUi).observe(document.documentElement,{attributes:true,attributeFilter:['data-ui-lang']});
window.CoverStudio={setUiLang:function(l){document.documentElement.setAttribute('data-ui-lang',normUl(l))},getUiLang:function(){return UL}};
applyUi();
}
var DOC_TITLE=document.title;
function M(t,en,bn,soft){return {t:t,en:en,bn:bn,soft:!!soft}}
function lines(x){return x.split('\n').map(function(a){return a.trim()}).filter(Boolean)}
var RULES={
uni:function(x){if(x.length<3)return M('err','Name is too short','নামটি খুব ছোট',1);if(!HAS.test(x))return M('err','Use letters, not only numbers or symbols','শুধু সংখ্যা বা চিহ্ন নয়, অক্ষর ব্যবহার করুন');if(DIGR.test(x))return M('tip','University names rarely contain numbers','বিশ্ববিদ্যালয়ের নামে সাধারণত সংখ্যা থাকে না');if(x.length>70)return M('tip','Very long name — the text will shrink on the cover','নাম খুব লম্বা — কভারে লেখা ছোট হবে')},
campus:function(x){if(x.length<2)return M('err','Too short','খুব ছোট',1);if(x.length>40)return M('tip','Long campus name may wrap','ক্যাম্পাসের নাম লম্বা, লাইন ভাঙতে পারে')},
dept:function(x){if(x.length<3)return M('err','Name is too short','নামটি খুব ছোট',1);if(!HAS.test(x))return M('err','Use letters, not only numbers or symbols','শুধু সংখ্যা বা চিহ্ন নয়, অক্ষর ব্যবহার করুন');if(!/^(department|dept|school|faculty|institute|centre|center|বিভাগ|ডিপার্টমেন্ট)/i.test(x))return M('tip','Usually written as "DEPARTMENT OF …"','সাধারণত "DEPARTMENT OF …" আকারে লেখা হয়',1)},
courseCode:function(x){if(!/^(\d{3,8}(\/\d{3,8})?|[A-Za-z]{2,6}[\s-]?\d{2,6}[A-Za-z]?(\/\d{2,6})?)$/.test(nd(x).trim()))return M('tip','Course codes look like CSE-101, ENG 201 or 457845','কোর্স কোড হয় CSE-101, ENG 201 বা 457845 এর মতো',1)},
courseName:function(x){if(x.length<2)return M('err','Name is too short','নামটি খুব ছোট',1);if(!HAS.test(x))return M('err','Course name needs letters','কোর্সের নামে অক্ষর থাকতে হবে')},
topic:function(x){if(x.length<3)return M('err','Topic is too short','বিষয়টি খুব ছোট',1);if(!HAS.test(x))return M('err','Topic needs letters','বিষয়ে অক্ষর থাকতে হবে');if(x.length>120)return M('tip','Very long topic — the text will shrink','বিষয় খুব লম্বা — লেখা ছোট হবে')},
sName:function(x){if(DIGR.test(x))return M('err','A name should not contain numbers','নামে সংখ্যা থাকবে না');if(/[^A-Za-z\u0980-\u09FF\s.\-']/.test(x))return M('err','Remove special characters','বিশেষ চিহ্ন বাদ দিন');if(x.length<3)return M('err','Name is too short','নামটি খুব ছোট',1);if(x.split(/\s+/).length<2)return M('tip','Add your full name (first and last)','পূর্ণ নাম লিখুন (প্রথম ও শেষ অংশ)',1)},
sRoll:function(x){if(/\s/.test(x))return M('err','No spaces in a roll number','রোল নম্বরে ফাঁকা জায়গা দেবেন না');if(!DIGR.test(x))return M('err','Roll should contain a number, e.g. 101','রোলে সংখ্যা থাকতে হবে, যেমন 101');if(x.length>12)return M('tip','Roll looks too long — double-check','রোল অনেক লম্বা — আবার দেখুন')},
members:function(x){var L=lines(x),seen={},names={};
for(var i=0;i<L.length;i++){var c=L[i].lastIndexOf(','),n=c>-1?L[i].slice(0,c).trim():L[i],r=c>-1?nd(L[i].slice(c+1).trim()):'',k=i+1;
if(c<0)return M('err','Line '+k+': write "Name, Roll"','লাইন '+k+': "নাম, রোল" আকারে লিখুন');
if(!n)return M('err','Line '+k+': name is missing','লাইন '+k+': নাম নেই');
if(DIGR.test(n))return M('err','Line '+k+': name has numbers','লাইন '+k+': নামে সংখ্যা আছে');
if(!r)return M('err','Line '+k+': roll is missing','লাইন '+k+': রোল নেই',1);
if(seen[r])return M('err','Line '+k+': roll '+r+' is repeated','লাইন '+k+': রোল '+r+' দুইবার আছে');
if(names[n.toLowerCase()])return M('tip','Line '+k+': same name appears twice','লাইন '+k+': একই নাম দুইবার');
seen[r]=1;names[n.toLowerCase()]=1}
if(L.length>8)return M('tip','Only the first 8 members are shown','কভারে প্রথম ৮ জন সদস্য দেখানো হবে')},
sClass:function(x){if(x.length<2)return M('err','Too short','খুব ছোট',1);if(!HAS.test(x))return M('err','Use letters, e.g. BSc Honours 1st Year','অক্ষর ব্যবহার করুন, যেমন BSc Honours 1st Year')},
session:function(x){var t=nd(x).trim(),m=t.match(/^(\d{4})(?:\s*[-–\/]\s*(\d{2}|\d{4}))?$/),yr=new Date().getFullYear();
if(!m)return M('tip','Sessions are usually written like 2025-26','সেশন সাধারণত 2025-26 আকারে লেখা হয়',1);
var a=+m[1];if(m[2]){var b=m[2].length===2?Math.floor(a/100)*100+(+m[2]):+m[2];if(b!==a+1)return M('err','Second year should follow the first (e.g. 2025-26)','দ্বিতীয় বছর প্রথম বছরের পরের হবে (যেমন 2025-26)')}
if(a<1990||a>yr+2)return M('tip','This year looks unusual','বছরটি অস্বাভাবিক লাগছে')},
mobile:function(x){var n=nd(x).replace(/[\s-]/g,'');if(/[^\d+]/.test(n))return M('err','Use digits only (e.g. 01712345678)','শুধু সংখ্যা দিন (যেমন 01712345678)');
if(/^(\+?88)?01[3-9]\d{8}$/.test(n))return;var d=n.replace(/^\+?88/,'');
if(d.length<11)return M('err','A Bangladeshi number has 11 digits — you typed '+d.length,'বাংলাদেশি নম্বরে ১১ সংখ্যা থাকে — আপনি দিয়েছেন '+d.length+'টি',1);
return M('err','Must start with 013–019, e.g. 01712345678','নম্বর 013–019 দিয়ে শুরু হতে হবে, যেমন 01712345678')},
date:function(x){var d=new Date(x+'T00:00:00'),n=new Date();n.setHours(0,0,0,0);var diff=Math.round((d-n)/864e5);
if(isNaN(diff))return M('err','Date is not valid','তারিখটি সঠিক নয়');if(diff>90)return M('tip','This date is far in the future','তারিখটি অনেক দূরের ভবিষ্যতে');if(diff<-365)return M('tip','This date is over a year ago','তারিখটি এক বছরেরও আগের')},
teachers:function(x){var L=lines(x);if(L.length===1)return M('tip','Add the designation on the next line','পরের লাইনে পদবি যোগ করুন',1);if(L.length>6)return M('tip','Too many lines — the box may get crowded','অনেক লাইন — বক্স ঠাসা হতে পারে')}
};
var IDS=['uni','campus','dept','courseCode','courseName','topic','sName','sRoll','members','sClass','session','mobile','date','teachers'];
function lab(id){var l=document.querySelector('label[for='+id+']');if(!l)return id;var e=l.querySelector('em');return (l.firstChild.textContent||'').trim()+(e?' · '+e.textContent:'')}
function paint(id,m){var b=msgBox[id],inp=$(id);if(!b||!inp)return;var key=m?m.t+m.en:'';
b.hidden=!m;inp.classList.toggle('bad',!!m&&m.t==='err');inp.classList.toggle('tipf',!!m&&m.t==='tip');inp.setAttribute('aria-invalid',m&&m.t==='err'?'true':'false');
if(m){b.className='msg '+m.t;clear(b);b.appendChild(el('span','t-en',m.en));b.appendChild(el('span','t-bn bn',m.bn));
if(m.t==='err'&&lastMsg[id]!==key){inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake')}}
if(m&&m.t==='err')inp.classList.remove('ok');lastMsg[id]=key}
function validate(v){
var grp=v.mode==='group',miss=[],dec=v.docType==='declaration';
var need=function(id,ok){if(!ok)miss.push(id)};
need('uni',v.uni.trim());need('dept',v.dept.trim());need('courseName',v.courseCode.trim()||v.courseName.trim());need('topic',v.topic.trim());
if(grp)need('members',v.members.trim());else{need('sName',v.sName.trim());need('sRoll',v.sRoll.trim())}
need('sClass',v.sClass.trim());need('session',v.session.trim());var ack=v.docType==='acknowledgment';if(!dec&&v.docType!=='approval'&&!ack)need('date',v.date);if(ack||!dec||v.dclStyle==='thesis'||v.dclSup)need('teachers',v.teachers.trim());
if(v.docType==='contents'){miss=[];need('uni',v.uni.trim());need('dept',v.dept.trim());need('topic',v.topic.trim())}
ISSUES=[];var tips=0,filled=0;
IDS.forEach(function(id){
if(v.docType==='contents'&&['uni','campus','dept','topic'].indexOf(id)<0){paint(id,null);return}
if((id==='sName'||id==='sRoll')&&grp||id==='members'&&!grp){paint(id,null);return}
var x=id==='date'?v.date:(id==='members'||id==='teachers'?v[id]:String(v[id]).trim());
if(String(x).trim())filled++;
var m=String(x).trim()?RULES[id](id==='members'||id==='teachers'?x:String(x).trim(),v):null;
if(!m&&miss.indexOf(id)>-1&&submitted)m=M('err','Required — please fill this in','আবশ্যক — এটি পূরণ করুন');
if(m&&m.soft&&!touched[id]&&!submitted)m=null;
paint(id,m);
if(m&&m.t==='err')ISSUES.push({id:id,msg:m});else if(m)tips++;
});
if(submitted)miss.forEach(function(id){if(!ISSUES.some(function(i){return i.id===id}))ISSUES.push({id:id,msg:M('err','Required','আবশ্যক')})});
var st=$('status'),n=ISSUES.length,bn=function(k){return String(k).replace(/[0-9]/g,function(c){return '০১২৩৪৫৬৭৮৯'.charAt(+c)})},cls,txt;
if(!filled){cls='idle';txt=['Start filling in the form','ফর্ম পূরণ শুরু করুন']}
else if(n){cls='bad';txt=[n+(n>1?' issues to fix':' issue to fix'),bn(n)+'টি ঠিক করুন']}
else if(miss.length){cls='warn';txt=[miss.length+' required left',bn(miss.length)+'টি আবশ্যক বাকি']}
else if(tips){cls='tip';txt=['Ready · '+tips+(tips>1?' tips':' tip'),'প্রস্তুত · '+bn(tips)+'টি পরামর্শ']}
else{cls='good';txt=['Ready to download','ডাউনলোডের জন্য প্রস্তুত']}
st.className='status '+cls;clear(st);st.appendChild(el('i'));st.appendChild(el('span','t-en',txt[0]));st.appendChild(el('small','t-bn',txt[1]));
}
IDS.concat(['logoFile']).forEach(function(id){var i=$(id);if(!i)return;var b=el('div','msg');b.id='m-'+id;b.hidden=true;b.setAttribute('role','alert');i.parentNode.insertBefore(b,i.nextSibling);i.setAttribute('aria-describedby','m-'+id);msgBox[id]=b});
if(msgBox.date&&$('dtTile'))$('dtTile').insertAdjacentElement('afterend',msgBox.date);
$('form').addEventListener('focusout',function(e){var id=e.target&&e.target.id;if(id&&RULES[id]){touched[id]=true;validate(get())}});
/* ===== Cover type tabs — নতুন ধরন যোগ করতে শুধু TYPES-এ একটি অবজেক্ট যোগ করুন (আর কিছু বদলাতে হবে না) ===== */
var TYPES=[
{v:'assignment',en:'Assignment',bn:'অ্যাসাইনমেন্ট',cover:'ASSIGNMENT',file:'Assignment',he:'Course assignment submission',hb:'কোর্সের অ্যাসাইনমেন্ট জমার কভার',
ic:'<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'},
{v:'lab',en:'Lab Report',bn:'ল্যাব রিপোর্ট',cover:'LAB REPORT',file:'Lab-Report',he:'Experiment & lab report',hb:'এক্সপেরিমেন্ট ও ল্যাব রিপোর্টের কভার',
ic:'<path d="M9 3h6M10 3v6L5 19a2 2 0 001.8 3h10.4A2 2 0 0019 19l-5-10V3"/><path d="M7.5 15h9"/>'},
{v:'presentation',en:'Presentation',bn:'প্রেজেন্টেশন',cover:'PRESENTATION',file:'Presentation',he:'Slides & presentation',hb:'স্লাইড ও প্রেজেন্টেশনের কভার',
ic:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8M7 12l3-3 3 2 4-4"/>'},
{v:'project',en:'Project',bn:'প্রজেক্ট',cover:'PROJECT',file:'Project',he:'Project report or submission',hb:'প্রজেক্ট রিপোর্ট বা জমার কভার',
ic:'<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M3 11h18"/>'},
{v:'thesis',en:'Thesis',bn:'থিসিস',cover:'THESIS',file:'Thesis',he:'Thesis or dissertation',hb:'থিসিস বা গবেষণাপত্র',
ic:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6"/>'},
{v:'quiz',en:'Quiz',bn:'কুইজ',cover:'QUIZ',file:'Quiz',he:'Class test or quiz',hb:'ক্লাস টেস্ট বা কুইজের কভার',
ic:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.6a2.6 2.6 0 015.1.6c0 1.8-2.6 2.2-2.6 3.8M12 17.2h.01"/>'},
{v:'exam',en:'Exam',bn:'পরীক্ষা',cover:'EXAM',file:'Exam',he:'Exam or test paper',hb:'পরীক্ষা বা টেস্ট পেপারের কভার',
ic:'<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 13l1.8 1.8L15 11"/>'},
{v:'declaration',en:'Declaration',bn:'ঘোষণাপত্র',cover:'DECLARATION',file:'Declaration',he:'Declaration of originality · own-work statement',hb:'মৌলিকতার ঘোষণাপত্র · নিজস্ব কাজের অঙ্গীকার',
ic:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M8.8 12l2.4 2.4 4.2-4.6"/>'},
{v:'approval',en:'Approval',bn:'অনুমোদনপত্র',cover:'APPROVAL',file:'Approval',he:'Certificate of approval · supervisor / department sign-off',hb:'অনুমোদনের প্রত্যয়নপত্র · তত্ত্বাবধায়ক / বিভাগের স্বাক্ষর',
ic:'<circle cx="12" cy="9" r="5.5"/><path d="M8.7 13.6L7.5 21l4.5-2.6 4.5 2.6-1.2-7.4"/><path d="M9.6 9l1.7 1.7L14.5 7.4"/>'},
{v:'acknowledgment',en:'Acknowledgment',bn:'কৃতজ্ঞতা স্বীকার',cover:'ACKNOWLEDGMENT',file:'Acknowledgment',he:'Acknowledgment · thanks to supervisor, family & well-wishers',hb:'কৃতজ্ঞতা স্বীকার · শিক্ষক, পরিবার ও শুভানুধ্যায়ীদের ধন্যবাদ',
ic:'<path d="M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0112 7.6a4.2 4.2 0 017.5 2.6c0 5.7-7.5 10.3-7.5 10.3z"/>'},
{v:'contents',en:'Contents',bn:'সূচিপত্র',cover:'TABLE OF CONTENTS',file:'Contents',he:'Table of contents · chapters & page numbers',hb:'সূচিপত্র · অধ্যায় ও পৃষ্ঠা নম্বর',
ic:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>'}
];
TYPES.forEach(function(x){T.en.docs[x.v]=T.en.docs[x.v]||x.cover||x.en.toUpperCase();T.bn.docs[x.v]=T.bn.docs[x.v]||x.bn});
var ctThumb=$('ctThumb'),ctPrev=$('ctPrev'),ctNext=$('ctNext'),ctAnim=0,ctTgt=0,ctDrag=null,ctMoved=0,ctWrap=$('ctWrap'),ctSc=$('ctScroll'),ctList=$('ctList'),ctInd=$('ctInd'),ctHint=$('ctHint'),ctOn=false,ctCur='';
function ctTabs(){return ctList.querySelectorAll('.ct-tab')}
function ctBuild(){
var h='';
TYPES.forEach(function(x,i){
h+='<button type="button" class="ct-tab" role="radio" data-v="'+x.v+'" aria-checked="false" tabindex="-1" style="--i:'+i+'">'
+'<span class="ct-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+x.ic+'</svg></span>'
+'<span class="ct-tx"><b><span class="t-en">'+x.en+'</span><span class="t-bn">'+x.bn+'</span></b></span></button>';
});
ctList.insertAdjacentHTML('beforeend',h);
}
function ctType(v){return TYPES.filter(function(x){return x.v===v})[0]}
function ctPlace(a){ctInd.style.setProperty('--x',a.offsetLeft+'px');ctInd.style.setProperty('--w',a.offsetWidth+'px')}
function ctEdges(){var m=ctSc.scrollWidth-ctSc.clientWidth;ctWrap.classList.toggle('sl',ctSc.scrollLeft>2);ctWrap.classList.toggle('sr',m>2&&ctSc.scrollLeft<m-2);ctWrap.classList.toggle('ov',m>2);if(m>2){var cw=ctSc.clientWidth,sw=ctSc.scrollWidth;ctThumb.style.width=(cw/sw*100).toFixed(2)+'%';ctThumb.style.transform='translateX('+(ctSc.scrollLeft/cw*100).toFixed(2)+'%)'}}
function ctCenter(a,smooth){
if(ctSc.scrollWidth<=ctSc.clientWidth+1)return;
var l=Math.max(0,a.offsetLeft-(ctSc.clientWidth-a.offsetWidth)/2);
try{ctSc.scrollTo({left:l,behavior:smooth?'smooth':'auto'})}catch(e){ctSc.scrollLeft=l}
}
function ctRefresh(){var a=ctList.querySelector('.ct-tab[aria-checked=true]');if(a)ctPlace(a);ctEdges()}
/* render() ও সেভ/রিসেট — সব জায়গা থেকে ট্যাব ঠিক রাখে */
function typeSync(v){
var act=null;
Array.prototype.forEach.call(ctTabs(),function(b){var on=b.dataset.v===v;b.setAttribute('aria-checked',on?'true':'false');b.tabIndex=on?0:-1;if(on)act=b});
if(!act)return;
{var f=$('form'),tx=ctType(v);if(f&&tx){f.style.setProperty('--ty-en',JSON.stringify(tx.en));f.style.setProperty('--ty-bn',JSON.stringify(tx.bn));if(v==='declaration'||v==='approval'||v==='acknowledgment'||v==='contents')f.removeAttribute('data-cov');else f.setAttribute('data-cov','1')}}
ctPlace(act);
if(!ctOn){ctOn=true;requestAnimationFrame(function(){ctList.classList.add('ready')})}
if(ctCur!==v){
var x=ctType(v);
ctCenter(act,!!ctCur);
if(x){ctHint.innerHTML='<span class="t-en">'+x.he+'</span><span class="t-sep"> · </span><span class="t-bn">'+x.hb+'</span>';ctHint.classList.remove('in');void ctHint.offsetWidth;ctHint.classList.add('in')}
ctCur=v;
}
ctEdges();
}
function typePick(v){
var inp=$('docType');if(!v||inp.value===v)return;
inp.value=v;render();
['oDoc','oDocBn'].forEach(function(id){var n=$(id);if(n){n.classList.remove('ink');void n.offsetWidth;n.classList.add('ink')}});
var x=ctType(v);if(x&&window.innerWidth<=960)toast('Cover type: '+x.en+' · কভারের ধরন: '+x.bn);
}
ctBuild();
ctList.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.ct-tab');if(b)typePick(b.dataset.v)});
ctList.addEventListener('pointerdown',function(e){
var b=e.target.closest&&e.target.closest('.ct-tab');if(!b)return;
var r=b.getBoundingClientRect(),s=document.createElement('span');
s.className='ct-rip';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';
b.appendChild(s);setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s)},750);
});
ctList.addEventListener('keydown',function(e){
var k=e.key,tabs=Array.prototype.slice.call(ctTabs()),i=tabs.indexOf(document.activeElement),n;
if(i<0)return;
if(k==='ArrowRight'||k==='ArrowDown')n=(i+1)%tabs.length;
else if(k==='ArrowLeft'||k==='ArrowUp')n=(i-1+tabs.length)%tabs.length;
else if(k==='Home')n=0;else if(k==='End')n=tabs.length-1;else return;
e.preventDefault();tabs[n].focus();typePick(tabs[n].dataset.v);
});
ctSc.addEventListener('scroll',ctEdges,{passive:true});

/* ---- পিসি: মসৃণ গ্লাইড, তীর, মাউস-হুইল, ড্র্যাগ ---- */
function ctMax(){return Math.max(0,ctSc.scrollWidth-ctSc.clientWidth)}
function ctStep(){var d=ctTgt-ctSc.scrollLeft;if(Math.abs(d)<1){ctSc.scrollLeft=ctTgt;ctAnim=0;return}var st=d*.18;if(Math.abs(st)<1)st=d>0?1:-1;ctSc.scrollLeft+=st;ctAnim=requestAnimationFrame(ctStep)}
function ctGlide(t){ctTgt=Math.max(0,Math.min(ctMax(),t));if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches){ctSc.scrollLeft=ctTgt;return}if(!ctAnim)ctAnim=requestAnimationFrame(ctStep)}
function ctStop(){if(ctAnim){cancelAnimationFrame(ctAnim);ctAnim=0}ctTgt=ctSc.scrollLeft}
ctPrev.addEventListener('click',function(){ctGlide((ctAnim?ctTgt:ctSc.scrollLeft)-ctSc.clientWidth*.7)});
ctNext.addEventListener('click',function(){ctGlide((ctAnim?ctTgt:ctSc.scrollLeft)+ctSc.clientWidth*.7)});
ctSc.addEventListener('wheel',function(e){
if(e.ctrlKey||ctMax()<=1)return;
if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
var dy=e.deltaY;if(!dy)return;
if(e.deltaMode!==1&&!(Math.abs(dy)>=40&&dy%1===0))return; /* ট্র্যাকপ্যাডে পেজ স্ক্রল আটকাবে না */
var cur=ctAnim?ctTgt:ctSc.scrollLeft,m=ctMax();
if((dy<0&&cur<=0)||(dy>0&&cur>=m))return;
e.preventDefault();
ctGlide(cur+dy*(e.deltaMode===1?36:1));
},{passive:false});
ctSc.addEventListener('pointerdown',function(e){
if(e.pointerType!=='mouse'||e.button!==0||ctMax()<=1)return;
ctStop();ctDrag={x:e.clientX,l:ctSc.scrollLeft,id:e.pointerId};ctMoved=0;
});
ctSc.addEventListener('pointermove',function(e){
var d=ctDrag;if(!d||e.pointerId!==d.id)return;
var dx=e.clientX-d.x;
if(!ctMoved&&Math.abs(dx)>5){ctMoved=1;ctWrap.classList.add('drag');try{ctSc.setPointerCapture(d.id)}catch(x){}}
if(ctMoved){ctSc.scrollLeft=d.l-dx;ctTgt=ctSc.scrollLeft}
});
function ctUp(e){var d=ctDrag;if(!d||e.pointerId!==d.id)return;ctDrag=null;ctWrap.classList.remove('drag');try{ctSc.releasePointerCapture(d.id)}catch(x){}if(ctMoved)setTimeout(function(){ctMoved=0},0)}
ctSc.addEventListener('pointerup',ctUp);ctSc.addEventListener('pointercancel',ctUp);
ctSc.addEventListener('click',function(e){if(ctMoved){e.stopPropagation();e.preventDefault()}},true);
if(window.ResizeObserver){var ctRo=new ResizeObserver(ctRefresh);ctRo.observe(ctSc);Array.prototype.forEach.call(ctTabs(),function(b){ctRo.observe(b)})}
else window.addEventListener('resize',ctRefresh);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(ctRefresh);
/* ===== Declaration page (ঘোষণাপত্র) — প্রিভিউ + PDF-এর দ্বিতীয় পৃষ্ঠা ===== */
var DC={en:{title:'DECLARATION',stu:'Student',mem:'Group members',course:'Course',topic:'Topic',cs:'Class / Session',roll:'Class Roll',place:'Place',date:'Date'},
bn:{title:'ঘোষণাপত্র',stu:'শিক্ষার্থী',mem:'দলের সদস্য',course:'কোর্স',topic:'বিষয়',cs:'ক্লাস / সেশন',roll:'ক্লাস রোল',place:'স্থান',date:'তারিখ'}};
var DPR={en:{I:['I','We'],my:['my','our'],me:['me','us']},bn:{I:['আমি','আমরা'],my:['আমার','আমাদের']}};
var DWHO={en:{s:'{name}, Class Roll {roll}, {class}',g:'the undersigned members of this group'},bn:{s:'{name}, ক্লাস রোল {roll}, {class}',g:'নিচে স্বাক্ষরকারী দলের সদস্যরা'}};
/* নতুন ঘোষণার ধরন যোগ করতে এখানে একটি এন্ট্রি দিন (আর কিছু বদলাতে হবে না) */
var DS={
original:{
en:{i:'{I}, {who}, hereby solemnly declare, in respect of the {doc} titled “{topic}” prepared for the course {course}, that:',
p:['The work presented here is original and was prepared by {me} solely for the stated course.',
'Wherever the ideas, data, words or figures of others have been used, they are clearly acknowledged and properly cited.',
'It has not been copied from any other student, publication or online source, and has not been submitted earlier for any other course, degree or publication.',
'{I} understand that any breach of academic integrity may lead to disciplinary action under the rules of the university.']},
bn:{i:'{I}, {who}, “{topic}” শিরোনামের এবং {course} কোর্সের জন্য প্রস্তুত এই {doc} সম্পর্কে সম্পূর্ণ সততার সাথে ঘোষণা করছি যে:',
p:['এখানে উপস্থাপিত কাজটি মৌলিক এবং শুধু উল্লিখিত কোর্সের জন্য {my} দ্বারা প্রস্তুত করা হয়েছে।',
'অন্যের ধারণা, তথ্য, লেখা বা চিত্র ব্যবহার করা হলে তা স্পষ্টভাবে স্বীকার করা হয়েছে এবং যথাযথভাবে উদ্ধৃত করা হয়েছে।',
'কাজটি অন্য কোনো শিক্ষার্থী, প্রকাশনা বা অনলাইন উৎস থেকে নকল করা হয়নি এবং এর আগে অন্য কোনো কোর্স, ডিগ্রি বা প্রকাশনার জন্য জমা দেওয়া হয়নি।',
'{I} অবগত যে একাডেমিক সততা লঙ্ঘন করলে বিশ্ববিদ্যালয়ের বিধি অনুযায়ী শৃঙ্খলামূলক ব্যবস্থা নেওয়া হতে পারে।']}},
integrity:{
en:{i:'{I}, {who}, affirm {my} commitment to academic honesty and declare, regarding the {doc} titled “{topic}” for the course {course}, that:',
p:['This work is {my} own, completed independently and in good faith.',
'Every source consulted — books, articles, websites, datasets and tools — has been credited and referenced.',
'{I} have neither given nor received unauthorised help, and any use of AI tools has been disclosed where required.',
'{I} accept that violations may result in penalties as set out by the university and the department.']},
bn:{i:'{I}, {who}, একাডেমিক সততার প্রতি {my} অঙ্গীকার জানিয়ে {course} কোর্সের “{topic}” বিষয়ক এই {doc} সম্পর্কে ঘোষণা করছি যে:',
p:['কাজটি সম্পূর্ণ {my} নিজস্ব; স্বাধীনভাবে ও সততার সাথে সম্পন্ন করা হয়েছে।',
'পরামর্শ নেওয়া প্রতিটি উৎস — বই, প্রবন্ধ, ওয়েবসাইট, ডেটাসেট ও টুল — যথাযথভাবে উল্লেখ ও রেফারেন্স করা হয়েছে।',
'{I} কারও কাছ থেকে অনুমোদনহীন সহায়তা নিইনি বা দিইনি; প্রয়োজনে এআই টুল ব্যবহারের কথা প্রকাশ করা হয়েছে।',
'নিয়ম ভঙ্গ করলে বিশ্ববিদ্যালয় ও বিভাগের বিধি অনুযায়ী শাস্তি হতে পারে — {I} তা মেনে নিচ্ছি।']}},
thesis:{
en:{i:'{I}, {who}, declare that the {doc} titled “{topic}” for the course {course} was carried out under the guidance of {teacher}, and that:',
p:['The findings and the write-up are the result of {my} own research and effort.',
'Contributions from others, including supervisory advice, are acknowledged where relevant.',
'No part of this work has been submitted for any other degree or qualification.',
'{I} grant the department permission to keep a copy for academic and archival purposes.']},
bn:{i:'{I}, {who}, ঘোষণা করছি যে {course} কোর্সের জন্য “{topic}” শিরোনামের এই {doc} {teacher}-এর তত্ত্বাবধানে সম্পন্ন করা হয়েছে এবং:',
p:['গবেষণার ফলাফল ও লেখা সম্পূর্ণ {my} নিজস্ব গবেষণা ও পরিশ্রমের ফল।',
'তত্ত্বাবধায়কের পরামর্শসহ অন্যদের অবদান যথাস্থানে স্বীকার করা হয়েছে।',
'এই কাজের কোনো অংশ অন্য কোনো ডিগ্রি বা যোগ্যতার জন্য জমা দেওয়া হয়নি।',
'একাডেমিক ও সংরক্ষণের উদ্দেশ্যে বিভাগকে এর একটি কপি রাখার অনুমতি {I} দিচ্ছি।']}}
};
/* থাম্বনেইল ও টেমপ্লেট গ্যালারি: ঘোষণাপত্র ট্যাবে কভারের বদলে ঘোষণাপত্রের পাতা দেখায় */
function isExtra(){var d=$('docType').value;return d==='declaration'||d==='approval'||d==='acknowledgment'||d==='contents'}
function docSrc(){return isExtra()?$('sheet2'):$('sheet')}
function tplCls(tpl){return isExtra()?'sheet dcs'+({acknowledgment:' ack',contents:' toc'}[$('docType').value]||'')+' tpl-'+tpl+($('sheet2').classList.contains('bi')?' bi':''):'sheet tpl-'+tpl}
var dmCur=null;
/* ঘোষণাপত্র/অনুমোদনপত্র ট্যাবে ফর্মের লেবেল ও ঘর সেই ডকুমেন্টের উপযোগী করে */
function docMode(mode){
if(dmCur===mode)return;
var first=dmCur===null,f=$('form');dmCur=mode;
f.setAttribute('data-doc',mode);
Array.prototype.forEach.call(document.querySelectorAll('[data-d]:not(.sw),[data-a]:not(.sw)'),function(n){
if(n.dataset.o===undefined)n.dataset.o=n.textContent;
var x=mode==='declaration'?n.dataset.d:(mode==='approval'?n.dataset.a:(mode==='acknowledgment'?n.dataset.ak:(mode==='contents'?n.dataset.tc:undefined)));
n.textContent=x!==undefined?x:n.dataset.o;
});
if(!first){f.classList.add('dm-r');void f.offsetWidth;f.classList.remove('dm-r')}
}
function panelShow(dc,show){
if(!dc)return;
var was=dc.dataset.shown==='1';
dc.style.display=show?'':'none';dc.classList.add('on');dc.dataset.shown=show?'1':'0';
if(show&&!was){dc.classList.remove('dc-in');void dc.offsetWidth;dc.classList.add('dc-in')}
}
var SEAL_D='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M8.8 12l2.4 2.4 4.2-4.6"/></svg>',SEAL_A='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="5.5"/><path d="M8.7 13.6L7.5 21l4.5-2.6 4.5 2.6-1.2-7.4"/><path d="M9.6 9l1.7 1.7L14.5 7.4"/></svg>';
var SEAL_K='<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0112 7.6a4.2 4.2 0 017.5 2.6c0 5.7-7.5 10.3-7.5 10.3z\"/><path d=\"M8.6 10.4c.4-1 1.3-1.6 2.4-1.5\"/></svg>';
var SEAL_T='<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9 6h11M9 12h11M9 18h11\"/><path d=\"M4.5 6h.01M4.5 12h.01M4.5 18h.01\"/></svg>';
var dclView='cover';
function dclShow(view){
dclView=view;
$('scaler').setAttribute('data-view',view);
$('pgswIn').setAttribute('data-v',view);
Array.prototype.forEach.call($('pgswIn').querySelectorAll('.pgsw-b'),function(b){b.setAttribute('aria-pressed',b.dataset.view===view?'true':'false')});
}
function dclFill(tpl,ctx,plural,lang){
var df=document.createDocumentFragment();
tpl.split(/(\{\w+\})/).forEach(function(s){
var m=/^\{(\w+)\}$/.exec(s);
if(!m){if(s)df.appendChild(document.createTextNode(s));return}
var k=m[1],pr=DPR[lang][k];
if(pr){df.appendChild(document.createTextNode(plural?pr[1]:pr[0]));return}
var c=ctx[k];
if(!c){df.appendChild(document.createTextNode(s));return}
df.appendChild(el('span','dv'+(c.ph?' ph':''),c.t));
});
return df;
}
function dclRender(v){
var mode=v.docType==='declaration'?'declaration':(v.docType==='approval'?'approval':(v.docType==='acknowledgment'?'acknowledgment':(v.docType==='contents'?'contents':'cover'))),on=mode!=='cover',p2=$('page2');
docMode(mode);
$('dclOn').checked=(mode==='declaration');$('pgsw').hidden=true;
panelShow($('dcl'),mode==='declaration');panelShow($('apr'),mode==='approval');panelShow($('ack'),mode==='acknowledgment');panelShow($('tcp'),mode==='contents');
if(!on){
dclShow('cover');
setTimeout(function(){if(!isExtra())p2.hidden=true},800);
return;
}
if(p2.hidden){p2.hidden=false;void p2.offsetWidth}
dclShow('decl');
$('dSeal').innerHTML=mode==='approval'?SEAL_A:(mode==='acknowledgment'?SEAL_K:(mode==='contents'?SEAL_T:SEAL_D));
$('dMeta').style.display='';
if(mode==='approval'){aprRender(v);return}
if(mode==='contents'){tocRender(v);return}
if(mode==='acknowledgment'){ackRender(v);return}
var bi=v.lang==='bi',lang=v.lang==='bn'?'bn':'en',Lp=T[lang],B=T.bn,plural=v.mode==='group';
var D=function(s){s=String(s);return v.digits==='bn'?s.replace(/[0-9]/g,function(c){return '০১২৩৪৫৬৭৮৯'.charAt(+c)}):s};
var sh=$('sheet2');
sh.className='sheet dcs tpl-'+v.tpl+(bi?' bi':'');
sh.style.setProperty('--p',v.cPri);sh.style.setProperty('--a',v.cAcc);
sh.style.setProperty('--hf',"'"+v.font+"','Noto Serif Bengali',serif");
/* header: কভারের লেখা থেকেই কপি */
[['oUni','dUni'],['oCampus','dCampus'],['oDept','dDept']].forEach(function(a){
var s=$(a[0]),d=$(a[1]);d.textContent=s.textContent;d.className=s.className.replace(/\bink\b/,'').trim();d.style.display=s.style.display;
});
$('logo2').src=$('logo').src;
$('dTitle').textContent=DC[lang].title;
$('dTitleBn').textContent=bi?DC.bn.title:'';$('dTitleBn').style.display=bi?'':'none';
/* তথ্য */
var tx=function(k,s){var f=String(s==null?'':s).trim();return {t:f?D(f):D(SAMPLE[k]||''),ph:!f}};
var tl=v.teachers.split('\n').map(function(x){return x.trim()}).filter(Boolean);
var courseT=[v.courseCode.trim(),v.courseName.trim()].filter(Boolean).join(' — ');
var mem=v.members.split('\n').map(function(x){return x.trim()}).filter(Boolean),memPh=!mem.length;
if(memPh)mem=SAMPLE.members.split('\n');
var csT=[v.sClass.trim(),v.session.trim()].filter(Boolean).join(' · ');
var ty=ctType(v.docType),docEn='work',docBn='কাজ';
var ctx={
name:tx('sName',v.sName),roll:tx('sRoll',v.sRoll),class:tx('sClass',v.sClass),topic:tx('topic',v.topic),
course:courseT?{t:D(courseT),ph:false}:{t:D(SAMPLE.cs),ph:true},
teacher:tl.length?{t:tl[0],ph:false}:{t:SAMPLE.teachers.split('\n')[0],ph:true}
};
/* তথ্য-সারণি */
var meta=$('dMeta');clear(meta);
var cell=function(key,val,ph,wide){
var c=el('div','dc-m'+(wide?' w':'')),k=el('span','k',DC[lang][key]);
if(bi)k.appendChild(el('span','bn',DC.bn[key]));
c.appendChild(k);c.appendChild(el('span','v'+(ph?' ph':''),val));meta.appendChild(c);
};
cell('topic',ctx.topic.t,ctx.topic.ph,true);
cell('course',ctx.course.t,ctx.course.ph);
cell('cs',csT?D(csT):D(SAMPLE.sClass+' · '+SAMPLE.session),!csT);
if(plural){
cell('mem',mem.slice(0,8).map(function(l){var i=l.lastIndexOf(',');return i>-1?l.slice(0,i).trim()+' ('+D(l.slice(i+1).trim())+')':l}).join('  ·  '),memPh,true);
}else{
cell('stu',ctx.name.t,ctx.name.ph);
cell('roll',ctx.roll.t,ctx.roll.ph);
}
/* ঘোষণার লেখা */
var st=$('dText');clear(st);
var custom=v.dclText.trim();
if(custom){
lines(custom).forEach(function(l){st.appendChild(el('p','',l))});
}else{
var ds=DS[v.dclStyle]||DS.original;
var blk=function(lg,cls){
var wrap=el('div',cls||''),who=DWHO[lg][plural?'g':'s'];
var pi=el('p','');pi.appendChild(dclFill(ds[lg].i.replace('{who}',who),Object.assign({doc:{t:lg==='bn'?docBn:docEn,ph:false}},ctx),plural,lg));
var cx=Object.assign({doc:{t:lg==='bn'?docBn:docEn,ph:false}},ctx);
wrap.appendChild(pi);
var ol=el('ol','dc-pts'+(v.digits==='bn'?' bd':''));
ds[lg].p.forEach(function(s){var li=el('li','');li.appendChild(dclFill(s,cx,plural,lg));ol.appendChild(li)});
wrap.appendChild(ol);return wrap;
};
st.appendChild(blk(lang));
if(bi)st.appendChild(blk('bn','dc-bn'));
}
/* স্থান ও তারিখ */
var pd=$('dPD');clear(pd);
var dp=(v.date||'').split('-'),dtT='';
var dfm=function(iso){var q=(iso||'').split('-');if(q.length!==3)return '';var y=+q[0],m=+q[1],d=+q[2];return v.dateFmt==='long'?D(d)+' '+Lp.mo[m-1]+' '+D(y):D(pad(d)+'/'+pad(m)+'/'+y)};
dtT=dfm(v.date);
var pdi=function(key,val,ph){
var s=el('span',''),b=el('b','',DC[lang][key]);if(bi)b.appendChild(el('span','bn',DC.bn[key]));
s.appendChild(b);s.appendChild(el('u',ph?'ph':'',val));pd.appendChild(s);
};
pdi('place',v.dclPlace.trim(),false);
pdi('date',dtT||dfm(todayISO()),!dtT);
/* স্বাক্ষর */
var sg=$('dSign');clear(sg);
var lbl=function(n,key){n.appendChild(document.createTextNode(Lp[key]));if(bi)n.appendChild(el('span','bn',B[key]))};
var tBlock=function(){
var b=el('div',''),nm=tl.length?tl[0]:SAMPLE.teachers.split('\n')[0];
b.appendChild(el('span','sn'+(tl.length?'':' ph'),nm));var l=el('span','sl');lbl(l,'s2');b.appendChild(l);return b;
};
if(plural){
var g=el('div','dc-sgg');
mem.slice(0,8).forEach(function(ln){
var i=ln.lastIndexOf(','),nm=ln,rl='';if(i>-1){nm=ln.slice(0,i).trim();rl=ln.slice(i+1).trim()}
var b=el('div','');b.appendChild(el('span','sn'+(memPh?' ph':''),nm));if(rl)b.appendChild(el('span','sl'+(memPh?' ph':''),Lp.roll+': '+D(rl)));g.appendChild(b);
});
sg.appendChild(g);
if(v.dclSup){var r=el('div','sg solo r');r.appendChild(tBlock());sg.appendChild(r)}
}else{
var row=el('div','sg'+(v.dclSup?'':' solo')),a=el('div',''),sn=v.sName.trim();
a.appendChild(el('span','sn'+(sn?'':' ph'),sn||SAMPLE.sName));var l1=el('span','sl');lbl(l1,'s1');a.appendChild(l1);
row.appendChild(a);if(v.dclSup)row.appendChild(tBlock());sg.appendChild(row);
}
/* স্টাইল বাটন */
Array.prototype.forEach.call($('dsGrid').querySelectorAll('.bt'),function(b){b.classList.toggle('on',b.dataset.k===v.dclStyle)});
}
/* ===== অনুমোদনপত্র (Approval) ===== */
DPR.en.students=['student','students'];DPR.bn.stg=['শিক্ষার্থীর','শিক্ষার্থীদের'];
var APL={en:{title:'APPROVAL',sup:'Supervisor',ct:'Course Teacher',hod:'Head of Department',dean:'Dean of Faculty',ext:'External Examiner',stamp:'Approved',aby:'Approved by'},
bn:{title:'অনুমোদনপত্র',sup:'তত্ত্বাবধায়ক',ct:'কোর্স শিক্ষক',hod:'বিভাগীয় প্রধান',dean:'অনুষদের ডিন',ext:'বহিঃপরীক্ষক',stamp:'অনুমোদিত',aby:'অনুমোদনকারী'}};
var AWHO={en:{s:'{name} (Class Roll {roll}, {class})',g:'the group members listed above'},bn:{s:'{name} (ক্লাস রোল {roll}, {class})',g:'উপরে উল্লিখিত দলের সদস্যগণ'}};
/* নতুন অনুমোদনের ধরন যোগ করতে এখানে একটি এন্ট্রি দিন */
var AS={
supervisor:{sig:['sup','hod'],
en:{i:'This is to certify that the {doc} titled “{topic}”, submitted by {who} to {dept}, {uni}, for the course {course}, has been carried out under the supervision of {teacher}.',
p:['The work was prepared under the guidance of the undersigned and reflects the sincere effort of the {students}.',
'It meets the academic and formatting requirements set by the department.',
'It is hereby approved and recommended for evaluation.']},
bn:{i:'এই মর্মে প্রত্যয়ন করা যাচ্ছে যে {who} কর্তৃক {uni}-এর {dept}-এ {course} কোর্সের জন্য জমা দেওয়া “{topic}” শিরোনামের {doc} {teacher}-এর তত্ত্বাবধানে সম্পন্ন হয়েছে।',
p:['কাজটি নিম্নস্বাক্ষরকারীর নির্দেশনায় প্রস্তুত হয়েছে এবং {stg} আন্তরিক পরিশ্রমের প্রতিফলন।',
'এটি বিভাগ নির্ধারিত একাডেমিক ও বিন্যাসগত শর্ত পূরণ করেছে।',
'এতদ্বারা এটি অনুমোদন করা হলো এবং মূল্যায়নের জন্য সুপারিশ করা হলো।']}},
teacher:{sig:['ct','hod'],
en:{i:'This is to certify that the {doc} titled “{topic}”, submitted by {who} for the course {course} at {dept}, {uni}, has been received and reviewed by {teacher}.',
p:['The submission is complete and follows the instructions given for the course.',
'The content has been assessed as satisfactory for the level of the course.',
'It is hereby accepted for assessment and record.']},
bn:{i:'এই মর্মে প্রত্যয়ন করা যাচ্ছে যে {who} কর্তৃক {uni}-এর {dept}-এ {course} কোর্সের জন্য জমা দেওয়া “{topic}” শিরোনামের {doc} {teacher} গ্রহণ ও পর্যালোচনা করেছেন।',
p:['জমাদানটি সম্পূর্ণ এবং কোর্সের জন্য দেওয়া নির্দেশনা অনুসরণ করা হয়েছে।',
'বিষয়বস্তু কোর্সের স্তর অনুযায়ী সন্তোষজনক বলে মূল্যায়িত হয়েছে।',
'এতদ্বারা এটি মূল্যায়ন ও সংরক্ষণের জন্য গৃহীত হলো।']}},
department:{sig:['hod','dean'],
en:{i:'This is to certify that the {doc} titled “{topic}”, submitted by {who} for the course {course}, has been examined and approved by {dept}, {uni}.',
p:['The work conforms to the academic standards and regulations of the university.',
'It has been completed within the requirements of the course and the department.',
'The department approves it for the record, and no objection is raised to its submission.']},
bn:{i:'এই মর্মে প্রত্যয়ন করা যাচ্ছে যে {who} কর্তৃক {course} কোর্সের জন্য জমা দেওয়া “{topic}” শিরোনামের {doc} {uni}-এর {dept} পরীক্ষা করে অনুমোদন করেছে।',
p:['কাজটি বিশ্ববিদ্যালয়ের একাডেমিক মান ও বিধি মেনে প্রস্তুত করা হয়েছে।',
'এটি কোর্স ও বিভাগের প্রয়োজনীয়তার মধ্যে সম্পন্ন হয়েছে।',
'বিভাগ এটি নথিভুক্তির জন্য অনুমোদন করছে এবং জমাদানে কোনো আপত্তি নেই।']}}
};
function aprRender(v){
var bi=v.lang==='bi',lang=v.lang==='bn'?'bn':'en',Lp=T[lang],B=T.bn,plural=v.mode==='group',AP=APL[lang];
var D=function(s){s=String(s);return v.digits==='bn'?s.replace(/[0-9]/g,function(c){return '০১২৩৪৫৬৭৮৯'.charAt(+c)}):s};
var sh=$('sheet2');
sh.className='sheet dcs tpl-'+v.tpl+(bi?' bi':'');
sh.style.setProperty('--p',v.cPri);sh.style.setProperty('--a',v.cAcc);
sh.style.setProperty('--hf',"'"+v.font+"','Noto Serif Bengali',serif");
[['oUni','dUni'],['oCampus','dCampus'],['oDept','dDept']].forEach(function(a){
var s=$(a[0]),d=$(a[1]);d.textContent=s.textContent;d.className=s.className.replace(/\bink\b/,'').trim();d.style.display=s.style.display;
});
$('logo2').src=$('logo').src;
$('dTitle').textContent=AP.title;
$('dTitleBn').textContent=bi?APL.bn.title:'';$('dTitleBn').style.display=bi?'':'none';
var tx=function(k,s){var f=String(s==null?'':s).trim();return {t:f?D(f):D(SAMPLE[k]||''),ph:!f}};
var tl=v.teachers.split('\n').map(function(x){return x.trim()}).filter(Boolean);
var courseT=[v.courseCode.trim(),v.courseName.trim()].filter(Boolean).join(' — ');
var mem=v.members.split('\n').map(function(x){return x.trim()}).filter(Boolean),memPh=!mem.length;
if(memPh)mem=SAMPLE.members.split('\n');
var csT=[v.sClass.trim(),v.session.trim()].filter(Boolean).join(' · ');
var style=AS[v.aprStyle]?v.aprStyle:'supervisor',ds=AS[style];
var ctx={
name:tx('sName',v.sName),roll:tx('sRoll',v.sRoll),class:tx('sClass',v.sClass),topic:tx('topic',v.topic),
dept:tx('dept',v.dept),uni:tx('uni',v.uni),
course:courseT?{t:D(courseT),ph:false}:{t:D(SAMPLE.cs),ph:true},
teacher:tl.length?{t:tl[0],ph:false}:{t:SAMPLE.teachers.split('\n')[0],ph:true}
};
/* তথ্য-সারণি */
var meta=$('dMeta');clear(meta);
var cell=function(key,val,ph,wide,label){
var c=el('div','dc-m'+(wide?' w':'')),k=el('span','k',label||DC[lang][key]);
if(bi&&!label)k.appendChild(el('span','bn',DC.bn[key]));
c.appendChild(k);c.appendChild(el('span','v'+(ph?' ph':''),val));meta.appendChild(c);
};
cell('topic',ctx.topic.t,ctx.topic.ph,true);
cell('course',ctx.course.t,ctx.course.ph);
cell('cs',csT?D(csT):D(SAMPLE.sClass+' · '+SAMPLE.session),!csT);
if(plural){
cell('mem',mem.slice(0,8).map(function(l){var i=l.lastIndexOf(',');return i>-1?l.slice(0,i).trim()+' ('+D(l.slice(i+1).trim())+')':l}).join('  ·  '),memPh,true);
}else{
cell('stu',ctx.name.t,ctx.name.ph);
cell('roll',ctx.roll.t,ctx.roll.ph);
}
var role=ds.sig[0],rl=el('span','k',AP[role]);
var apv=el('div','dc-m w');if(bi)rl.appendChild(el('span','bn',APL.bn[role]));
apv.appendChild(rl);apv.appendChild(el('span','v'+(tl.length?'':' ph'),tl.length?tl[0]:SAMPLE.teachers.split('\n')[0]));meta.appendChild(apv);
/* অনুমোদনের লেখা */
var st=$('dText');clear(st);
var custom=v.aprText.trim();
if(custom){lines(custom).forEach(function(l){st.appendChild(el('p','',l))})}
else{
var blk=function(lg,cls){
var wrap=el('div',cls||''),who=AWHO[lg][plural?'g':'s'],cx=Object.assign({doc:{t:lg==='bn'?'কাজ':'work',ph:false}},ctx);
var pi=el('p','');pi.appendChild(dclFill(ds[lg].i.replace('{who}',who),cx,plural,lg));wrap.appendChild(pi);
var ol=el('ol','dc-pts'+(v.digits==='bn'?' bd':''));
ds[lg].p.forEach(function(s){var li=el('li','');li.appendChild(dclFill(s,cx,plural,lg));ol.appendChild(li)});
wrap.appendChild(ol);return wrap;
};
st.appendChild(blk(lang));
if(bi)st.appendChild(blk('bn','dc-bn'));
}
/* স্থান, তারিখ ও সিল */
var pd=$('dPD');clear(pd);
var dfm=function(iso){var q=(iso||'').split('-');if(q.length!==3)return '';var y=+q[0],m=+q[1],d=+q[2];return v.dateFmt==='long'?D(d)+' '+Lp.mo[m-1]+' '+D(y):D(pad(d)+'/'+pad(m)+'/'+y)};
var dtT=dfm(v.date);
var pdi=function(key,val,ph){
var s=el('span',''),b=el('b','',DC[lang][key]);if(bi)b.appendChild(el('span','bn',DC.bn[key]));
s.appendChild(b);s.appendChild(el('u',ph?'ph':'',val));pd.appendChild(s);
};
pdi('place',v.aprPlace.trim(),false);
pdi('date',dtT||dfm(todayISO()),!dtT);
if(v.aprStamp){
var sp=el('span','dc-stamp',AP.stamp);
if(bi)sp.appendChild(el('small','',APL.bn.stamp));
pd.appendChild(sp);
}
/* স্বাক্ষর */
var sg=$('dSign');clear(sg);
var roles=ds.sig.slice();if(v.aprExam)roles.push('ext');
var row=el('div','sg');
roles.forEach(function(r,i){
var b=el('div',''),nm=el('span','sn'+(i===0&&!tl.length?' ph':''));
nm.textContent=i===0?(tl.length?tl[0]:SAMPLE.teachers.split('\n')[0]):'\u00a0';
b.appendChild(nm);
var l=el('span','sl');l.appendChild(document.createTextNode(AP[r]));if(bi)l.appendChild(el('span','bn',APL.bn[r]));
b.appendChild(l);row.appendChild(b);
});
sg.appendChild(row);
Array.prototype.forEach.call($('asGrid').querySelectorAll('.bt'),function(b){b.classList.toggle('on',b.dataset.k===style)});
}
/* ===== কৃতজ্ঞতা স্বীকার (Acknowledgment) ===== */
var ACL={en:{title:'ACKNOWLEDGMENT',close:'With sincere gratitude,',sp:'Special thanks'},
bn:{title:'কৃতজ্ঞতা স্বীকার',close:'আন্তরিক কৃতজ্ঞতাসহ,',sp:'বিশেষ কৃতজ্ঞতা'}};
var AKI={en:'First and foremost, all praise and thanks belong to the Almighty for the strength, health and patience to complete this {doc} on “{topic}” for the course {course}.',
bn:'প্রথমেই সর্বশক্তিমান সৃষ্টিকর্তার প্রতি অশেষ কৃতজ্ঞতা, যাঁর অনুগ্রহে {course} কোর্সের “{topic}” শিরোনামের এই {doc} সম্পন্ন করার শক্তি, সুস্বাস্থ্য ও ধৈর্য পেয়েছি।'};
/* নতুন ধরন যোগ করতে এখানে একটি এন্ট্রি দিন */
var AKS={
supervisor:{
en:{i:AKI.en,p:['Special gratitude is due to {teacher}, whose guidance, encouragement and valuable feedback shaped {my} work at every stage.',
'Sincere thanks also go to the faculty members and staff of {dept}, {uni}, for the knowledge and support that made this work possible.',
'Finally, {my} family and friends deserve heartfelt thanks for their constant support, patience and inspiration.']},
bn:{i:AKI.bn,p:['{teacher}-এর প্রতি {my} আন্তরিক কৃতজ্ঞতা, যাঁর নির্দেশনা, উৎসাহ ও মূল্যবান মতামত প্রতিটি ধাপে {my} কাজকে সমৃদ্ধ করেছে।',
'{uni}-এর {dept}-এর সম্মানিত শিক্ষক ও কর্মকর্তাদের প্রতিও কৃতজ্ঞতা, যাঁদের জ্ঞান ও সহযোগিতায় এই কাজ সম্ভব হয়েছে।',
'সবশেষে {my} পরিবার ও বন্ধুদের প্রতি অশেষ ধন্যবাদ, তাঁদের নিরন্তর সহযোগিতা, ধৈর্য ও অনুপ্রেরণার জন্য।']}},
family:{
en:{i:'First and foremost, all praise and thanks belong to the Almighty, whose grace made it possible to complete this {doc} on “{topic}” for the course {course}.',
p:['Heartfelt gratitude goes to {my} parents, whose sacrifices, prayers and unconditional love made every step of this journey possible.',
'Warm thanks to {my} siblings, relatives and well-wishers for their encouragement and for believing in {my} efforts.',
'Thanks are also due to {teacher} and the teachers of {dept}, {uni}, whose lessons laid the foundation of this work.',
'Finally, {my} friends deserve thanks for their company, ideas and cheerful support along the way.']},
bn:{i:'প্রথমেই সর্বশক্তিমান সৃষ্টিকর্তার প্রতি অশেষ কৃতজ্ঞতা, যাঁর করুণায় {course} কোর্সের “{topic}” শিরোনামের এই {doc} সম্পন্ন করা সম্ভব হয়েছে।',
p:['{my} বাবা-মায়ের প্রতি আন্তরিক কৃতজ্ঞতা, যাঁদের ত্যাগ, দোয়া ও নিঃশর্ত ভালোবাসায় এই পথচলার প্রতিটি ধাপ সহজ হয়েছে।',
'ভাইবোন, আত্মীয়স্বজন ও শুভানুধ্যায়ীদের প্রতি ধন্যবাদ, উৎসাহ দেওয়া এবং {my} চেষ্টার ওপর আস্থা রাখার জন্য।',
'{teacher} এবং {uni}-এর {dept}-এর শিক্ষকদের প্রতিও কৃতজ্ঞতা, যাঁদের পাঠদান এই কাজের ভিত্তি গড়ে দিয়েছে।',
'সবশেষে {my} বন্ধুদের ধন্যবাদ তাঁদের সঙ্গ, ভাবনা ও প্রাণবন্ত সহযোগিতার জন্য।']}},
team:{
en:{i:'First and foremost, all praise and thanks belong to the Almighty for the strength and unity to complete this {doc} on “{topic}” for the course {course}.',
p:['Every member of the team deserves thanks for the dedication, time and cooperation that brought this work together.',
'Sincere thanks to {teacher} for clear guidance and timely feedback throughout the course {course}.',
'Classmates and friends who shared ideas, resources and encouragement have {my} appreciation as well.',
'Last but not least, thanks to everyone at home for their patience and support.']},
bn:{i:'প্রথমেই সর্বশক্তিমান সৃষ্টিকর্তার প্রতি অশেষ কৃতজ্ঞতা, যাঁর দয়ায় {course} কোর্সের “{topic}” শিরোনামের এই {doc} সম্পন্ন করার শক্তি ও ঐক্য পেয়েছি।',
p:['দলের প্রত্যেক সদস্যকে ধন্যবাদ, তাঁদের নিষ্ঠা, সময় ও সহযোগিতায় এই কাজ পূর্ণতা পেয়েছে।',
'{course} কোর্সজুড়ে স্পষ্ট নির্দেশনা ও সময়মতো মতামত দেওয়ার জন্য {teacher}-এর প্রতি আন্তরিক ধন্যবাদ।',
'যে সহপাঠী ও বন্ধুরা ভাবনা, তথ্য ও উৎসাহ দিয়ে পাশে ছিলেন, তাঁদের প্রতিও {my} কৃতজ্ঞতা।',
'সবশেষে পরিবারের সবাইকে ধন্যবাদ তাঁদের ধৈর্য ও সহযোগিতার জন্য।']}},
institution:{
en:{i:AKI.en,p:['Sincere thanks to the Head and faculty members of {dept}, {uni}, for fostering an environment that encourages learning and inquiry.',
'Appreciation is also due to the library, laboratory and administrative staff, whose cooperation kept information and resources within easy reach.',
'Finally, gratitude to {teacher}, whose guidance for the course {course} gave direction to this work.']},
bn:{i:AKI.bn,p:['{uni}-এর {dept}-এর বিভাগীয় প্রধান ও শিক্ষকমণ্ডলীকে আন্তরিক ধন্যবাদ, শেখা ও অনুসন্ধানের অনুকূল পরিবেশ গড়ে তোলার জন্য।',
'গ্রন্থাগার, গবেষণাগার ও প্রশাসনিক কর্মীদের প্রতিও কৃতজ্ঞতা, যাঁদের সহযোগিতায় প্রয়োজনীয় তথ্য ও উপকরণ সহজে পাওয়া গেছে।',
'সবশেষে {teacher}-এর প্রতি কৃতজ্ঞতা, {course} কোর্সে যাঁর নির্দেশনা এই কাজকে দিক দেখিয়েছে।']}}
};
function ackRender(v){
var bi=v.lang==='bi',lang=v.lang==='bn'?'bn':'en',Lp=T[lang],B=T.bn,plural=v.mode==='group',AC=ACL[lang];
var D=function(s){s=String(s);return v.digits==='bn'?s.replace(/[0-9]/g,function(c){return '০১২৩৪৫৬৭৮৯'.charAt(+c)}):s};
var sh=$('sheet2');
sh.className='sheet dcs ack tpl-'+v.tpl+(bi?' bi':'');
sh.style.setProperty('--p',v.cPri);sh.style.setProperty('--a',v.cAcc);
sh.style.setProperty('--hf',"'"+v.font+"','Noto Serif Bengali',serif");
[['oUni','dUni'],['oCampus','dCampus'],['oDept','dDept']].forEach(function(a){
var s=$(a[0]),d=$(a[1]);d.textContent=s.textContent;d.className=s.className.replace(/\bink\b/,'').trim();d.style.display=s.style.display;
});
$('logo2').src=$('logo').src;
$('dTitle').textContent=AC.title;
$('dTitleBn').textContent=bi?ACL.bn.title:'';$('dTitleBn').style.display=bi?'':'none';
var tx=function(k,s){var f=String(s==null?'':s).trim();return {t:f?D(f):D(SAMPLE[k]||''),ph:!f}};
var tl=v.teachers.split('\n').map(function(x){return x.trim()}).filter(Boolean);
var courseT=[v.courseCode.trim(),v.courseName.trim()].filter(Boolean).join(' — ');
var mem=v.members.split('\n').map(function(x){return x.trim()}).filter(Boolean),memPh=!mem.length;
if(memPh)mem=SAMPLE.members.split('\n');
var csT=[v.sClass.trim(),v.session.trim()].filter(Boolean).join(' · ');
var style=AKS[v.ackStyle]?v.ackStyle:'supervisor',ds=AKS[style];
var ctx={
name:tx('sName',v.sName),roll:tx('sRoll',v.sRoll),class:tx('sClass',v.sClass),topic:tx('topic',v.topic),
dept:tx('dept',v.dept),uni:tx('uni',v.uni),
course:courseT?{t:D(courseT),ph:false}:{t:D(SAMPLE.cs),ph:true},
teacher:tl.length?{t:tl[0],ph:false}:{t:SAMPLE.teachers.split('\n')[0],ph:true}
};
/* তথ্য-সারণি */
var meta=$('dMeta');clear(meta);
var cell=function(key,val,ph,wide){
var c=el('div','dc-m'+(wide?' w':'')),k=el('span','k',DC[lang][key]);
if(bi)k.appendChild(el('span','bn',DC.bn[key]));
c.appendChild(k);c.appendChild(el('span','v'+(ph?' ph':''),val));meta.appendChild(c);
};
cell('topic',ctx.topic.t,ctx.topic.ph,true);
cell('course',ctx.course.t,ctx.course.ph);
cell('cs',csT?D(csT):D(SAMPLE.sClass+' · '+SAMPLE.session),!csT);
if(plural){
cell('mem',mem.slice(0,8).map(function(l){var i=l.lastIndexOf(',');return i>-1?l.slice(0,i).trim()+' ('+D(l.slice(i+1).trim())+')':l}).join('  ·  '),memPh,true);
}else{
cell('stu',ctx.name.t,ctx.name.ph);
cell('roll',ctx.roll.t,ctx.roll.ph);
}
/* কৃতজ্ঞতার লেখা */
var st=$('dText');clear(st);
var custom=v.ackText.trim();
if(custom){
lines(custom).forEach(function(l,i){st.appendChild(el('p',i?'ak-p':'ak-lead',l))});
}else{
var blk=function(lg,cls){
var wrap=el('div',cls||''),cx=Object.assign({doc:{t:lg==='bn'?'কাজ':'work',ph:false}},ctx);
var pi=el('p','ak-lead');pi.appendChild(dclFill(ds[lg].i,cx,plural,lg));wrap.appendChild(pi);
ds[lg].p.forEach(function(s){var p=el('p','ak-p');p.appendChild(dclFill(s,cx,plural,lg));wrap.appendChild(p)});
return wrap;
};
st.appendChild(blk(lang));
if(bi)st.appendChild(blk('bn','dc-bn'));
}
var thanks=v.ackThanks.split('\n').map(function(x){return x.trim()}).filter(Boolean).slice(0,6);
if(thanks.length){
var th=el('p','ak-th');th.appendChild(el('b','',AC.sp+': '));
if(bi)th.appendChild(el('b','',ACL.bn.sp+' · '));
th.appendChild(document.createTextNode(thanks.join(', ')));st.appendChild(th);
}
if(v.ackClose){
var cl=el('p','ak-close',AC.close);
if(bi)cl.appendChild(el('small','',ACL.bn.close));
st.appendChild(cl);
}
/* স্থান ও তারিখ */
var pd=$('dPD');clear(pd);
var dfm=function(iso){var q=(iso||'').split('-');if(q.length!==3)return '';var y=+q[0],m=+q[1],d=+q[2];return v.dateFmt==='long'?D(d)+' '+Lp.mo[m-1]+' '+D(y):D(pad(d)+'/'+pad(m)+'/'+y)};
var dtT=dfm(v.date);
var pdi=function(key,val,ph){
var s=el('span',''),b=el('b','',DC[lang][key]);if(bi)b.appendChild(el('span','bn',DC.bn[key]));
s.appendChild(b);s.appendChild(el('u',ph?'ph':'',val));pd.appendChild(s);
};
pdi('place',v.ackPlace.trim(),false);
pdi('date',dtT||dfm(todayISO()),!dtT);
/* স্বাক্ষর */
var sg=$('dSign');clear(sg);
var lbl=function(n,key){n.appendChild(document.createTextNode(Lp[key]));if(bi)n.appendChild(el('span','bn',B[key]))};
if(plural){
var g=el('div','dc-sgg');
mem.slice(0,8).forEach(function(ln){
var i=ln.lastIndexOf(','),nm=ln,rl='';if(i>-1){nm=ln.slice(0,i).trim();rl=ln.slice(i+1).trim()}
var b=el('div','');b.appendChild(el('span','sn'+(memPh?' ph':''),nm));if(rl)b.appendChild(el('span','sl'+(memPh?' ph':''),Lp.roll+': '+D(rl)));g.appendChild(b);
});
sg.appendChild(g);
}else{
var row=el('div','sg solo r'),a=el('div',''),sn=v.sName.trim();
a.appendChild(el('span','sn'+(sn?'':' ph'),sn||SAMPLE.sName));var l1=el('span','sl');lbl(l1,'s1');a.appendChild(l1);
row.appendChild(a);sg.appendChild(row);
}
Array.prototype.forEach.call($('akGrid').querySelectorAll('.bt'),function(b){b.classList.toggle('on',b.dataset.k===style)});
}
/* ===== সূচিপত্র (Table of contents) ===== */
var TCL={en:{title:'TABLE OF CONTENTS',pg:'Page'},bn:{title:'সূচিপত্র',pg:'পৃষ্ঠা'}};
var TCS={en:'Acknowledgment, i\nAbstract, ii\n# Part I\nChapter 1: Introduction, 1\n  Background of the Study, 2\n  Objectives, 4\nChapter 2: Literature Review, 6\nChapter 3: Methodology, 12\nChapter 4: Results and Discussion, 18\nChapter 5: Conclusion, 25\nReferences, 27',
bn:'কৃতজ্ঞতা স্বীকার, i\nসারসংক্ষেপ, ii\n# প্রথম খণ্ড\nঅধ্যায় ১: ভূমিকা, ১\n  গবেষণার প্রেক্ষাপট, ২\n  উদ্দেশ্য, ৪\nঅধ্যায় ২: সাহিত্য পর্যালোচনা, ৬\nঅধ্যায় ৩: পদ্ধতি, ১২\nঅধ্যায় ৪: ফলাফল ও আলোচনা, ১৮\nঅধ্যায় ৫: উপসংহার, ২৫\nগ্রন্থপঞ্জি, ২৭'};
function tocParse(txt){
return String(txt||'').split('\n').map(function(r){return r.replace(/\s+$/,'')}).filter(function(r){return r.trim()}).slice(0,26).map(function(r){
var h=/^\s*#\s*(.*)$/.exec(r);if(h)return {k:'h',t:h[1].trim()};
var sub=/^(\s{2,}|\t|[-–•]\s)/.test(r),b=r.replace(/^(\s+|[-–•]\s*)+/,'');
var m=/^(.*?)(?:\s*\|\s*|\s*,\s*|\s{2,}|\t)((?:\d+|[ivxlcdm]+|[০-৯]+)(?:\s*[-–]\s*(?:\d+|[০-৯]+))?)\s*$/i.exec(b);
return m&&m[1].trim()?{k:sub?'s':'e',t:m[1].trim(),p:m[2].trim()}:{k:sub?'s':'e',t:b.trim(),p:''};
});
}
function tocRender(v){
var bi=v.lang==='bi',lang=v.lang==='bn'?'bn':'en',Lp=T[lang],TL=TCL[lang];
var D=function(s){s=String(s);return v.digits==='bn'?s.replace(/[0-9]/g,function(c){return '০১২৩৪৫৬৭৮৯'.charAt(+c)}):s};
var sh=$('sheet2');
sh.className='sheet dcs toc tpl-'+v.tpl+(bi?' bi':'');
sh.style.setProperty('--p',v.cPri);sh.style.setProperty('--a',v.cAcc);
sh.style.setProperty('--hf',"'"+v.font+"','Noto Serif Bengali',serif");
[['oUni','dUni'],['oCampus','dCampus'],['oDept','dDept']].forEach(function(a){
var s=$(a[0]),d=$(a[1]);d.textContent=s.textContent;d.className=s.className.replace(/\bink\b/,'').trim();d.style.display=s.style.display;
});
$('logo2').src=$('logo').src;
$('dTitle').textContent=TL.title;
$('dTitleBn').textContent=bi?TCL.bn.title:'';$('dTitleBn').style.display=bi?'':'none';
var tx=function(k,s){var f=String(s==null?'':s).trim();return {t:f?D(f):D(SAMPLE[k]||''),ph:!f}};
var style=({classic:'c',numbered:'n',modern:'m'})[v.tocStyle]||'c';
var topic=tx('topic',v.topic);
var meta=$('dMeta');clear(meta);meta.style.display='none';
/* সূচির তালিকা */
var st=$('dText');clear(st);
var sp=el('p','tc-sub');sp.appendChild(el('span','dv'+(topic.ph?' ph':''),topic.t));st.appendChild(sp);
var raw=String(v.tocEntries||'').trim(),ph=!raw,ents=tocParse(ph?TCS[lang]:raw);
var hd=el('div','tc-hd',TL.pg);if(bi)hd.appendChild(el('span','bn',TCL.bn.pg));st.appendChild(hd);
var list=el('div','tc-list tc-'+style),n1=0,n2=0,nn=ents.length;
list.style.setProperty('--rp',nn<=8?'14px':nn<=11?'11px':nn<=14?'9px':nn<=18?'7px':'5px');
ents.forEach(function(e){
var r=el('div','tc-r'+(e.k==='s'?' s':'')+(e.k==='h'?' h':'')+(ph?' ph':''));
if(e.k==='h'){r.appendChild(el('span','tt',e.t));list.appendChild(r);n2=0;return}
if(e.k==='e'){n1++;n2=0}else{if(!n1)n1=1;n2++}
if(style==='n')r.appendChild(el('span','nm',D(e.k==='e'?n1:n1+'.'+n2)));
r.appendChild(el('span','tt',e.t));
if(e.p){r.appendChild(el('span','dd'));r.appendChild(el('span','pg',D(e.p)))}
list.appendChild(r);
});
st.appendChild(list);st.appendChild(el('div','tc-end'));
clear($('dPD'));clear($('dSign'));
Array.prototype.forEach.call($('tcGrid').querySelectorAll('.bt'),function(b){b.classList.toggle('on',b.dataset.k===v.tocStyle)});
}
function snapAll(r){
var src=isExtra()?$('page2'):$('page');
return snap(r,src).then(function(a){return [a]});
}
/* এক বা একাধিক JPEG থেকে A4 PDF */
function jpegPdfN(items){
var parts=[],off=0,xr=[],n=items.length,i;
function put(x){if(typeof x==='string'){var u=new Uint8Array(x.length);for(var k=0;k<x.length;k++)u[k]=x.charCodeAt(k)&255;x=u}parts.push(x);off+=x.length}
function obj(k,body){xr[k]=off;put(k+' 0 obj\n'+body+'\nendobj\n')}
var PW='595.28',PH='841.89';
put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
obj(2,'<< /Type /Pages /Kids ['+items.map(function(_,j){return (3+3*j)+' 0 R'}).join(' ')+'] /Count '+n+' >>');
items.forEach(function(it,j){
var pg=3+3*j,im=pg+1,ct=pg+2,bin=atob(it.d.split(',')[1]),img=new Uint8Array(bin.length),q;
for(q=0;q<bin.length;q++)img[q]=bin.charCodeAt(q);
obj(pg,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PW+' '+PH+'] /Resources << /XObject << /Im'+j+' '+im+' 0 R >> >> /Contents '+ct+' 0 R >>');
xr[im]=off;put(im+' 0 obj\n<< /Type /XObject /Subtype /Image /Width '+it.w+' /Height '+it.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+img.length+' >>\nstream\n');put(img);put('\nendstream\nendobj\n');
var cs='q '+PW+' 0 0 '+PH+' 0 0 cm /Im'+j+' Do Q';
obj(ct,'<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream');
});
var tot=3+3*n,xo=off,pd=function(k){return ('0000000000'+k).slice(-10)};
var s='xref\n0 '+tot+'\n0000000000 65535 f \n';for(i=1;i<tot;i++)s+=pd(xr[i])+' 00000 n \n';
put(s+'trailer\n<< /Size '+tot+' /Root 1 0 R >>\nstartxref\n'+xo+'\n%%EOF');
return new Blob(parts,{type:'application/pdf'});
}
$('tcGrid').addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.bt');if(!b)return;$('tocStyle').value=b.dataset.k;render()});
$('akGrid').addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.bt');if(!b)return;$('ackStyle').value=b.dataset.k;render()});
$('asGrid').addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.bt');if(!b)return;$('aprStyle').value=b.dataset.k;render()});
$('dsGrid').addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.bt');if(!b)return;$('dclStyle').value=b.dataset.k;render()});
$('pgswIn').addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.pgsw-b');if(b)dclShow(b.dataset.view)});
/* init */
var saved=null;
try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
var init=Object.assign({},DEF,saved||{});
set(init);
try{var lg=localStorage.getItem(LKEY);if(lg)setLogo(lg);else setLogo('./logo.png')}catch(e){setLogo('./logo.png')}
var rT=0,rLite=document.documentElement.classList.contains('lite')||(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
function renderSoon(){clearTimeout(rT);rT=setTimeout(function(){rT=0;requestAnimationFrame(render)},rLite?110:45)}
function renderNow(){if(rT){clearTimeout(rT);rT=0}render()}
$('form').addEventListener('input',renderSoon);
$('form').addEventListener('change',renderNow);
$('sws').addEventListener('click',function(e){var b=e.target.closest('.sw');if(!b||!gOpen)return;gSetColors(b.dataset.p,b.dataset.a,true)});
function gCust(){if(gOpen)gSetColors($('gcPri').value,$('gcAcc').value,false)}
$('gcPri').addEventListener('input',gCust);$('gcAcc').addEventListener('input',gCust);
/* ===== বাইন্ডিং মার্জিন: কভার ছোট করে বাইন্ডিংয়ের পাশে জায়গা রাখে ===== */
var bindT=0;
function bindHot(){var p=$('page');p.classList.add('hot');clearTimeout(bindT);bindT=setTimeout(function(){p.classList.remove('hot')},1800)}
function bindApply(v){
var on=!!v.bindOn,mm=Math.max(5,Math.min(40,+v.bindMm||15)),sd=/^(left|top|right)$/.test(v.bindSide)?v.bindSide:'left';
var g=mm*W/210,k,x=0,y=0,B=UL==='bn'?bnum:String,val=B((mm/10).toFixed(1))+' '+(UL==='bn'?'সেমি':'cm');
if(sd==='top'){k=(H-g)/H;x=(W-W*k)/2;y=g}else{k=(W-g)/W;x=sd==='left'?g:0;y=(H-H*k)/2}
var pg=$('page');pg.classList.toggle('bind',on);
var p2=$('page2');if(p2){p2.classList.toggle('bind',on);p2.style.setProperty('--bk',k.toFixed(4));p2.style.setProperty('--bx',x.toFixed(1)+'px');p2.style.setProperty('--by',y.toFixed(1)+'px')}
pg.style.setProperty('--bk',k.toFixed(4));pg.style.setProperty('--bx',x.toFixed(1)+'px');pg.style.setProperty('--by',y.toFixed(1)+'px');
var gd=$('bGuide');gd.hidden=!on;gd.dataset.side=sd;gd.style.setProperty('--gw',g.toFixed(1)+'px');
$('bTag').textContent=U('Binding','বাইন্ডিং')+' · '+val;
$('bnd').classList.toggle('on',on);$('bndOut').textContent=val;
$('bindMm').style.setProperty('--pc',((mm-5)/35*100).toFixed(1)+'%');
Array.prototype.forEach.call($('bndSides').querySelectorAll('.bnd-s'),function(b){b.setAttribute('aria-pressed',b.dataset.s===sd?'true':'false')});
Array.prototype.forEach.call($('bndChips').querySelectorAll('.bnd-c2'),function(b){var m=+b.dataset.mm;b.classList.toggle('on',m===mm);b.firstChild.textContent=B((m/10).toFixed(1))+(UL==='bn'?' সেমি':' cm')});
var tk=BTYPE[v.bindType]&&BTYPE[v.bindType].mm===mm?v.bindType:'';
Array.prototype.forEach.call($('btGrid').querySelectorAll('.bt'),function(b){b.classList.toggle('on',b.dataset.k===tk)});bindWhy(tk);
var q=$('bndPg'),pc=(mm/(sd==='top'?297:210)*100).toFixed(1);q.dataset.s=sd;q.style.setProperty('--gw',pc+'%');
q.style.setProperty('--t',(sd==='top'?+pc+6:6)+'%');q.style.setProperty('--b','6%');
q.style.setProperty('--l',(sd==='left'?+pc+6:6)+'%');q.style.setProperty('--r',(sd==='right'?+pc+6:6)+'%');
}
var BTYPE={"staple": {"mm": 10, "w": ["Staples sit close to the edge, so a slim margin is enough.", "স্ট্যাপল কিনারার কাছেই পড়ে, তাই অল্প মার্জিনই যথেষ্ট।"]}, "spiral": {"mm": 15, "w": ["Coil holes are punched near the edge; 1.5 cm keeps text clear of them.", "কয়েলের ছিদ্র কিনারা ঘেঁষে হয়; ১.৫ সেমি রাখলে লেখা ছিদ্র থেকে দূরে থাকে।"]}, "tape": {"mm": 10, "w": ["A taped or thermal spine covers a few millimetres, so 1.0 cm is usually enough.", "টেপ বা থার্মাল স্পাইন কয়েক মিলিমিটার ঢেকে দেয়, তাই ১.০ সেমিই সাধারণত যথেষ্ট।"]}, "file": {"mm": 25, "w": ["Ring-binder holes sit about 1 cm in; 2.5 cm leaves room around them.", "রিং ফাইলের ছিদ্র কিনারা থেকে প্রায় ১ সেমি ভেতরে; ২.৫ সেমি রাখলে চারপাশে জায়গা থাকে।"]}, "perfect": {"mm": 20, "w": ["Glue binding trims and glues the spine; 2.0 cm stops text vanishing into the fold.", "গ্লু বাইন্ডিংয়ে স্পাইন কেটে আঠা লাগানো হয়; ২.০ সেমি রাখলে লেখা ভাঁজে হারায় না।"]}, "thesis": {"mm": 30, "w": ["Hardbound pages curve into the spine, so 3.0 cm keeps text readable. Many universities ask for 3–4 cm.", "হার্ডবাউন্ডে পাতা স্পাইনে বেঁকে যায়, তাই ৩.০ সেমি রাখলে লেখা পড়া যায়। অনেক বিশ্ববিদ্যালয় ৩–৪ সেমি চায়।"]}};
function bindWhy(k,mm){
var w=$('btWhy'),key=k||'x';if(w.dataset.k===key)return;w.dataset.k=key;clear(w);
var d=BTYPE[k],B=UL==='bn'?bnum:String;
function two(p,en,bn){p.appendChild(el('span','t-en',en));p.appendChild(el('span','t-sep',' · '));p.appendChild(el('span','t-bn',bn))}
if(d){var h=el('b');two(h,'Recommended '+(d.mm/10).toFixed(1)+' cm','সুপারিশ '+bnum((d.mm/10).toFixed(1))+' সেমি');w.appendChild(h);w.appendChild(document.createTextNode(' — '));two(w,d.w[0],d.w[1])}
else two(w,'Pick your binding type for a recommended margin, or set your own.','সুপারিশকৃত মার্জিনের জন্য বাইন্ডিংয়ের ধরন বাছুন, অথবা নিজে ঠিক করুন।');
var n=el('small');two(n,"Typical guidance — always follow your department's rules.",'সাধারণ নির্দেশনা — বিভাগের নিয়ম আগে মানুন।');w.appendChild(n);
}
$('btGrid').addEventListener('click',function(e){var b=e.target.closest('.bt');if(!b)return;var d=BTYPE[b.dataset.k];$('bindType').value=b.dataset.k;$('bindMm').value=d.mm;$('bindSide').value='left';if(!$('bindOn').checked)$('bindOn').checked=true;bindHot();render()});
$('bndSides').addEventListener('click',function(e){var b=e.target.closest('.bnd-s');if(!b)return;$('bindSide').value=b.dataset.s;bindHot();render()});
$('bndChips').addEventListener('click',function(e){var b=e.target.closest('.bnd-c2');if(!b)return;$('bindMm').value=b.dataset.mm;$('bindType').value='';bindHot();render()});
$('bindMm').addEventListener('input',function(){$('bindType').value='';bindHot()});$('bindOn').addEventListener('change',bindHot);
$('dtChips').addEventListener('click',function(e){var b=e.target.closest('.dtx-chip[data-off]');if(!b)return;dpPick(isoOff(+b.dataset.off))});
$('dtSeg').addEventListener('click',function(e){var b=e.target.closest('.dtx-opt');if(!b)return;$('dateFmt').value=b.dataset.f;render()});
$('logoFile').addEventListener('change',function(e){
var f=e.target.files&&e.target.files[0];if(!f)return;
if(!/^image\//.test(f.type)){paint('logoFile',M('err','Please choose an image file (PNG, JPG, SVG)','ছবির ফাইল বেছে নিন (PNG, JPG, SVG)'));$('logoFile').value='';return}
paint('logoFile',f.size>1048576?M('tip','Large logo ('+(f.size/1048576).toFixed(1)+' MB) may not be saved — use under 1 MB','লোগো বড় ('+(f.size/1048576).toFixed(1)+' MB) — সেভ নাও হতে পারে, ১ MB-এর কম দিন'):null);
var r=new FileReader();
r.onload=function(){setLogo(r.result);try{localStorage.setItem(LKEY,r.result)}catch(x){paint('logoFile',M('tip','Logo is applied now but could not be saved for next time','লোগো এখন কাজ করছে, কিন্তু পরের বার সেভ থাকবে না'))}};
r.readAsDataURL(f);
});
$('logoReset').addEventListener('click',function(){paint('logoFile',null);try{localStorage.removeItem(LKEY)}catch(e){}$('logoFile').value='';setLogo('./logo.png')});
var modal=$('modal'),lastFocus=null,cb={};
var ICO={trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3"/></svg>',
warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18.2v.1"/></svg>'};
function bl(b,p){clear(b);b.appendChild(el('span','t-en',p[0]));b.appendChild(el('small','t-bn',p[1]))}
function ask(o){
lastFocus=document.activeElement;cb={yes:o.onYes,no:o.onNo};
$('mbox').className='mbox'+(o.icon==='warn'?' w':'');$('mic').innerHTML=ICO[o.icon];$('mic').className='mic '+o.icon;
var h=$('mt');clear(h);h.appendChild(el('span','t-en',o.t));h.appendChild(el('em','t-bn',o.bn));
biNode($('mp'),o.p);
var ul=$('ml');clear(ul);(o.list||[]).forEach(function(x){var li=el('li');li.appendChild(biNode(el('b'),x[0]));li.appendChild(biNode(el('span'),x[1]));ul.appendChild(li)});
bl($('mYes'),o.yes);bl($('mNo'),o.no);$('mYes').className='btn'+(o.danger?' danger':'');
modal.hidden=false;setTimeout(function(){$('mYes').focus()},30);
}
function closeM(){modal.hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus()}
function doReset(){
try{localStorage.removeItem(KEY);localStorage.removeItem(LKEY)}catch(e){}
var blank={};FIELDS.forEach(function(k){blank[k]=DEF[k]});
touched={};submitted=false;paint('logoFile',null);
$('logoFile').value='';set(blank);setLogo('./logo.png');render();
toast('All information cleared · সব তথ্য মুছে ফেলা হয়েছে');
}
var tt=null;
function toast(m){var t=$('toast');biNode(t,m);t.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('show')},4600)}
$('reset').addEventListener('click',function(){ask({icon:'trash',danger:1,t:'Clear all information?',bn:'সব তথ্য মুছে ফেলবেন?',p:'Everything you entered will be removed and the design reset. · আপনার দেওয়া সব তথ্য মুছে যাবে এবং ডিজাইন প্রথম অবস্থায় ফিরবে।',yes:['Yes, clear all','হ্যাঁ, মুছুন'],no:['Cancel','বাতিল'],onYes:doReset})});
$('mYes').addEventListener('click',function(){var f=cb.yes;closeM();if(f)f()});
$('mNo').addEventListener('click',function(){var f=cb.no;closeM();if(f)f()});
modal.addEventListener('click',function(e){if(e.target===modal)closeM()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)closeM()});
function goto(id){var e=$(id);if(!e)return;if(pvOpen)setPv(false);e.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){try{e.focus({preventScroll:true})}catch(x){e.focus()}},350)}
$('status').addEventListener('click',function(){if(ISSUES.length)goto(ISSUES[0].id)});
/* ===== সরাসরি PDF ডাউনলোড (A4, কোনো প্রিন্ট ডায়ালগ ছাড়া) ===== */
var pdfBusy=false,fontCSS='';
var SAF=/^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
function setBusy(on){
['pdfBtn','pdfBtn2'].forEach(function(id){
var b=$(id),lb=b.querySelector('.lb'),sm=b.querySelector('small');
b.disabled=on;b.classList.toggle('busy',on);
lb.textContent=on?'Creating PDF…':'Download PDF';
if(sm)sm.textContent=on?'তৈরি হচ্ছে':'পিডিএফ ডাউনলোড';
});
}
function pdfName(){
var v=get(),x=ctType(v.docType),t=(x&&x.file)||'Cover';
var n=String(v.sName||'').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,'').trim().replace(/\s+/g,'-').slice(0,40);
return (v.docType==='declaration'?'Declaration':v.docType==='approval'?'Approval':v.docType==='acknowledgment'?'Acknowledgment':v.docType==='contents'?'Contents':'Cover-Page_'+t)+(n?'_'+n:'')+'.pdf';
}
/* স্ক্রিনের প্রিভিউ না ছুঁয়ে, আলাদা কপি থেকে ছবি তোলা হয় (নমুনা লেখা বাদ, অ্যানিমেশন বন্ধ) */
function snap(ratio,src){src=src||$('page');
var host=document.createElement('div');host.className='pdf-host';
var c=src.cloneNode(true);c.removeAttribute('id');Array.prototype.forEach.call(c.querySelectorAll('.bind-guide'),function(n){n.remove()});var cs=c.querySelector('.sheet');cs.removeAttribute('id');cs.classList.remove('swap');c.classList.remove('hot');if(c.classList.contains('bind')){var ps=src.style;cs.style.scale='none';cs.style.translate='none';cs.style.transformOrigin='0 0';cs.style.transform='translate('+ps.getPropertyValue('--bx')+','+ps.getPropertyValue('--by')+') scale('+ps.getPropertyValue('--bk')+')'}
host.appendChild(c);document.body.appendChild(host);
var opt={pixelRatio:ratio,backgroundColor:'#ffffff',width:W,height:H,style:{transform:'none',margin:'0'}};
var fonts=fontCSS?Promise.resolve(fontCSS):window.htmlToImage.getFontEmbedCSS(c,opt).catch(function(){return ''});
return fonts.then(function(css){
if(css){fontCSS=css;opt.fontEmbedCSS=css}
return window.htmlToImage.toCanvas(c,opt);
}).then(function(cv){
return SAF?window.htmlToImage.toCanvas(c,opt):cv; /* Safari-র প্রথমবারের ফাঁকা ছবির সমস্যা */
}).then(function(cv){host.remove();return cv},function(e){host.remove();throw e});
}
/* একটি JPEG থেকে এক-পৃষ্ঠার A4 PDF (কোনো বাইরের লাইব্রেরি ছাড়া) */
function jpegPdf(dataUrl,pw,ph){
var bin=atob(dataUrl.split(',')[1]),img=new Uint8Array(bin.length),i;
for(i=0;i<bin.length;i++)img[i]=bin.charCodeAt(i);
var parts=[],off=0,xr=[];
function put(x){if(typeof x==='string'){var u=new Uint8Array(x.length);for(var k=0;k<x.length;k++)u[k]=x.charCodeAt(k)&255;x=u}parts.push(x);off+=x.length}
function obj(n,body){xr[n]=off;put(n+' 0 obj\n'+body+'\nendobj\n')}
var PW='595.28',PH='841.89';
put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
obj(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PW+' '+PH+'] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
xr[4]=off;put('4 0 obj\n<< /Type /XObject /Subtype /Image /Width '+pw+' /Height '+ph+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+img.length+' >>\nstream\n');put(img);put('\nendstream\nendobj\n');
var ct='q '+PW+' 0 0 '+PH+' 0 0 cm /Im0 Do Q';
obj(5,'<< /Length '+ct.length+' >>\nstream\n'+ct+'\nendstream');
var xo=off,pad=function(n){return ('0000000000'+n).slice(-10)};
var t='xref\n0 6\n0000000000 65535 f \n';for(i=1;i<=5;i++)t+=pad(xr[i])+' 00000 n \n';
put(t+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xo+'\n%%EOF');
return new Blob(parts,{type:'application/pdf'});
}
function saveBlob(blob,name){
var url=URL.createObjectURL(blob),a=document.createElement('a');
a.href=url;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();
setTimeout(function(){a.remove();URL.revokeObjectURL(url)},60000);
}
function makePdf(){
if(pdfBusy)return;
if(!window.htmlToImage){toast('PDF tool did not load. Please reload the page. · পিডিএফ টুল লোড হয়নি, পেজ রিলোড করুন');return}
pdfBusy=true;setBusy(true);
var ready=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
ready.then(function(){return snapAll(3)})
.catch(function(){return snapAll(2)}) /* কম মেমরির ফোনে ছোট রেজোলিউশনে আবার চেষ্টা */
.then(function(cv){
saveBlob(jpegPdfN(cv.map(function(c){return {d:c.toDataURL('image/jpeg',.95),w:c.width,h:c.height}})),pdfName());
toast('PDF downloaded · পিডিএফ ডাউনলোড হয়েছে');
})
.catch(function(){toast('Could not create the PDF. Please try again. · পিডিএফ তৈরি করা যায়নি, আবার চেষ্টা করুন')})
.then(function(){pdfBusy=false;setBusy(false)});
}
var pr=function(){
submitted=true;render();
if(!ISSUES.length){makePdf();return}
ask({icon:'warn',t:ISSUES.length+(ISSUES.length>1?' things need attention':' thing needs attention'),bn:'ডাউনলোডের আগে একটু দেখে নিন',p:'Fix these for a clean cover, or download as it is. · কভারটি নিখুঁত করতে এগুলো ঠিক করুন, অথবা এভাবেই ডাউনলোড করুন।',
list:ISSUES.slice(0,6).map(function(i){return [lab(i.id),i.msg.en+' · '+i.msg.bn]}),
yes:['Fix now','ঠিক করি'],no:['Download anyway','তবুও ডাউনলোড'],onYes:function(){goto(ISSUES[0].id)},onNo:makePdf});
};
$('pdfBtn').addEventListener('click',pr);$('pdfBtn2').addEventListener('click',pr);
window.CPS={render:render,setType:function(v){$('docType').value=v;render()},isExtra:isExtra,snapAll:snapAll,jpegPdfN:jpegPdfN,saveBlob:saveBlob,ask:ask,toast:toast,TYPES:TYPES,ctType:ctType,get:get,autoFit:autoFit,W:W,H:H};
/* ===== মোবাইল/ট্যাবলেটে প্রিভিউ: ভাসমান বাটনে চাপলেই ফুল-স্ক্রিন, ফর্মে ফিরতে Close / ব্যাক ===== */
var pvSec=$('pvSec'),pvOpen=false;
function setPv(on,fromPop){
if(on===pvOpen)return;
pvOpen=on;
document.body.classList.toggle('pv-open',on);
$('pvFab').setAttribute('aria-expanded',on?'true':'false');
if(on){
try{history.pushState({pv:1},'')}catch(x){}
fit();pvSec.scrollTop=0;
setTimeout(function(){try{$('pvClose').focus({preventScroll:true})}catch(x){}},380);
}else{
if(!fromPop){try{if(history.state&&history.state.pv)history.back()}catch(x){}}
try{$('pvFab').focus({preventScroll:true})}catch(x){}
}
}
$('pvFab').addEventListener('click',function(){setPv(true)});
$('pvClose').addEventListener('click',function(){setPv(false)});
window.addEventListener('popstate',function(){if(pvOpen)setPv(false,true)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&pvOpen&&modal.hidden)setPv(false)});
window.addEventListener('resize',function(){if(pvOpen&&window.innerWidth>960){pvOpen=false;document.body.classList.remove('pv-open');$('pvFab').setAttribute('aria-expanded','false')}});
/* ===== লাইভ থাম্বনেইল: টেমপ্লেট বাছাইয়ে ও ফোনের Preview বাটনে আসল কভার দেখা যায় ===== */
var thT=0;
var thD=(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches)?420:140;
function schedThumbs(){clearTimeout(thT);thT=setTimeout(thumbs,thD)}
function thumbs(){
var src=docSrc();
function mk(tpl,box){
var w=box.clientWidth;if(!w)return;
var c=src.cloneNode(true);
c.removeAttribute('id');
Array.prototype.forEach.call(c.querySelectorAll('[id]'),function(e){e.removeAttribute('id')}); /* ডুপ্লিকেট id চলবে না */
Array.prototype.forEach.call(c.querySelectorAll('.ink'),function(e){e.classList.remove('ink')});
c.className=tplCls(tpl);
var th=document.createElement('div');th.className='th';th.style.transform='scale('+(w/W)+')';th.appendChild(c);
while(box.firstChild)box.removeChild(box.firstChild);
box.appendChild(th);
fitEl(c);
}
var tb=$('tplTh');if(tb)mk($('tpl').value||'classic',tb);
var f=$('fabTh');if(f)mk($('tpl').value||'classic',f);
}
/* ===== টেমপ্লেট গ্যালারি: সোয়াইপ পপ-আপ (3D কভারফ্লো + স্প্রিং ফিজিক্স) ===== */
var TPLS=[
{v:'classic',en:'Classic',bn:'ক্লাসিক',de:'A double accent frame between two solid bars. Timeless for any course.',db:'দুটি বারের মাঝে ডাবল ফ্রেম। যেকোনো কোর্সে মানানসই।'},
{v:'minimal',en:'Minimal',bn:'মিনিমাল',de:'A thick border with a fine inner line. Clean and quiet.',db:'মোটা বর্ডারের ভেতরে সূক্ষ্ম রেখা। পরিচ্ছন্ন ও শান্ত।'},
{v:'executive',en:'Executive',bn:'এক্সিকিউটিভ',de:'A solid side band with an accent edge. Reads like an official report.',db:'পাশে গাঢ় ব্যান্ড ও অ্যাকসেন্ট কিনারা। অফিসিয়াল রিপোর্টের মতো।'},
{v:'royal',en:'Royal',bn:'রয়্যাল',de:'Double border with diamond corner blocks. Formal and ceremonial.',db:'ডায়মন্ড কোণসহ ডাবল বর্ডার। আনুষ্ঠানিক ও মর্যাদাপূর্ণ।'},
{v:'modern',en:'Modern',bn:'মডার্ন',de:'Angled corner shapes and a left-aligned header. Bold and current.',db:'কোণে তির্যক আকৃতি ও বাঁ-ঘেঁষা হেডার। সাহসী ও আধুনিক।'},
{v:'elegant',en:'Elegant',bn:'এলিগ্যান্ট',de:'A curved colour header carries the university name. Soft and refined.',db:'বাঁকানো রঙিন হেডারে বিশ্ববিদ্যালয়ের নাম। কোমল ও পরিশীলিত।'},
{v:'corporate',en:'Corporate',bn:'কর্পোরেট',de:'A tinted header panel with a gradient spine. Structured and businesslike.',db:'হালকা রঙের হেডার প্যানেল ও গ্রেডিয়েন্ট স্পাইন। গোছানো ও পেশাদার।'},
{v:'prestige',en:'Prestige',bn:'প্রেস্টিজ',de:'A full-colour cover with a fine accent frame. The strongest first impression.',db:'পুরো রঙিন কভারে সূক্ষ্ম ফ্রেম। প্রথম দেখাতেই ছাপ ফেলে।'}
];
var GPAL=[['#0b1f3a','#d4af37'],['#0a3d33','#c9a24b'],['#5a1230','#d8a47f'],['#24205a','#e3b55b'],['#0b4a5a','#f08a5d'],['#4a1942','#e0b97a'],['#002147','#b9c4d0'],['#0a0a0c','#cfa94a']];
var GFALL=[['#1f3d2b','#b08d57'],['#7a0c1e','#e8c46c'],['#063b6e','#3cc4c0'],['#3b2417','#d6a869']];
var gColors=[];
var gal=$('gal'),gStage=$('galStage'),gMain=$('galMain'),gInfo=$('galInfo'),gDots=$('galDots'),gPickB=$('galPick'),gPrev=$('galPrev'),gNext=$('galNext'),gCount=$('galCount');
var gWheelT=0,gSl=[],gOpen=false,gBusy=false,gPos=0,gVel=0,gTgt=0,gSp=0,gSpV=0,gSpT=1,gRaf=0,gLast=0,gDrag=null,gShown=-1,gCW=300,gCH=424,gWheel=0,gWheelLock=0,gHide=0;
function clampN(x,a,b){return Math.max(a,Math.min(b,x))}
var gCoarse=!!(window.matchMedia&&window.matchMedia('(hover:none),(pointer:coarse)').matches),gTok=0;
var _rm=window.matchMedia?window.matchMedia('(prefers-reduced-motion:reduce)'):null;function reduced(){return !!(_rm&&_rm.matches)}
function lum(h){var m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m)return 0;var n=parseInt(m[1],16),c=[(n>>16)&255,(n>>8)&255,n&255].map(function(x){x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function tIndex(v){for(var i=0;i<TPLS.length;i++)if(TPLS[i].v===v)return i;return 0}
/* ফর্মের ট্রিগার কার্ড: নাম বদলায়, স্ট্যাক "বাম্প" করে */
function updTpl(v){
var t=TPLS[tIndex(v)],n=$('tplName');
if(n.dataset.v===t.v)return;
var first=!n.dataset.v;n.dataset.v=t.v;
n.textContent=t.en;$('tplNameBn').textContent=t.bn;
if(!first){var st=$('tplSt');st.classList.remove('bump');void st.offsetWidth;st.classList.add('bump')}
}
var gSrc=null;
/* ভারী A4 শিট শুধু তখনই বানানো হয়, যখন কার্ডটি দেখানোর কাছাকাছি আসে */
function mountSheet(g){
if(g.sh||!gSrc)return;
var c=gSrc.cloneNode(true);
c.removeAttribute('id');
Array.prototype.forEach.call(c.querySelectorAll('[id]'),function(e){e.removeAttribute('id')});
Array.prototype.forEach.call(c.querySelectorAll('.ink'),function(e){e.classList.remove('ink')});
c.className=tplCls(TPLS[g.i].v);
c.style.setProperty('--p',gColors[g.i].p);c.style.setProperty('--a',gColors[g.i].a);
g.th.appendChild(c);g.sh=c;
}
function fitCard(g){mountSheet(g);if(!g.fit){g.fit=1;fitEl(g.sh)}g.el.style.visibility=''}
var gQ=[],gQT=0;
/* বাকি কার্ডগুলো ব্রাউজার অলস থাকলে একটি একটি করে তৈরি ও মাপা হয় — সোয়াইপ/অ্যানিমেশনের সময় কিছুই হয় না */
function gPump(){
if(gQT)return;
if(!gOpen||!gQ.length)return;
if(gRaf||gDrag){gQT=setTimeout(function(){gQT=0;gPump()},150);return}
var run=function(){
gQT=0;
if(!gOpen||gRaf||gDrag){if(gOpen&&gQ.length)gPump();return}
while(gQ.length){var g=gSl[gQ.shift()];if(g&&!g.fit){fitCard(g);break}}
if(gQ.length)gPump();
};
if(window.requestIdleCallback)gQT=requestIdleCallback(run,{timeout:400});
else gQT=setTimeout(run,16);
}
function gBuild(){
var src=docSrc(),cur=$('tpl').value||'classic';gSrc=src;
clear(gStage);clear(gDots);clear(gInfo);gSl=[];
var fv=get(),curI=tIndex(cur),same=function(x,y){return x[0].toLowerCase()===y[0].toLowerCase()&&x[1].toLowerCase()===y[1].toLowerCase()},used=[[fv.cPri,fv.cAcc]],fb=0;
gColors=TPLS.map(function(t,i){
if(i===curI)return {p:fv.cPri,a:fv.cAcc};
var c=GPAL[i%GPAL.length];
while(used.some(function(u){return same(u,c)})&&fb<GFALL.length)c=GFALL[fb++];
used.push(c);return {p:c[0],a:c[1]};
});
TPLS.forEach(function(t,i){
var s=el('div','gs'),card=el('div','gs-card'),th=el('div','th');
card.appendChild(th);
var gl=el('div','gs-glare'),vl=el('div','gs-veil'),tn=el('div','gs-tint');card.appendChild(gl);card.appendChild(tn);
s.appendChild(card);s.appendChild(vl);
if(t.v===cur){
var b=el('div','gs-badge');
b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
b.appendChild(biNode(el('span'),'In use · ব্যবহারে'));s.appendChild(b);
}
s.setAttribute('role','group');s.setAttribute('aria-roledescription','slide');
s.setAttribute('aria-label',t.en+' · '+t.bn+' ('+(i+1)+'/'+TPLS.length+')');
gStage.appendChild(s);
var d=el('button','gd');d.type='button';d.tabIndex=-1;d.setAttribute('aria-label',t.en+' · '+t.bn);
d.addEventListener('click',function(){gGo(i)});gDots.appendChild(d);
gSl.push({i:i,el:s,gl:gl,vl:vl,th:th,sh:null,dot:d,tn:tn});
});
gLayout();
gPump();
 /* প্রতিটি টেমপ্লেটের নিজস্ব মাপে লেখা বসানো — কাছের স্লাইডগুলো এখনই, বাকিগুলো খোলার পর ফাঁকা সময়ে */
gSl.forEach(function(g,k){if(gCoarse?k===curI:Math.abs(k-curI)<=2)fitCard(g)});
gQ=gSl.map(function(g,k){return k}).sort(function(a,b){return Math.abs(a-curI)-Math.abs(b-curI)});
}
function gScrollSw(smooth){
var w=$('sws'),b=w.querySelector('.sw.on');if(!b)return;
var x=b.offsetLeft-(w.clientWidth-b.offsetWidth)/2;
try{w.scrollTo({left:x,behavior:smooth&&!reduced()&&!gCoarse?'smooth':'auto'})}catch(e){w.scrollLeft=x}
}
function gDiff(i){var v=get(),c=gColors[i],t=TPLS[i].v!==v.tpl,k=c.p.toLowerCase()!==v.cPri.toLowerCase()||c.a.toLowerCase()!==v.cAcc.toLowerCase();return {t:t,k:k}}
function gSyncTheme(scroll){
var i=gShown;if(i<0||!gColors[i])return;
var c=gColors[i];
gal.style.setProperty('--ga',c.a);gal.style.setProperty('--gp',c.p);
gal.style.setProperty('--gt',lum(c.a)>.4?'#101418':'#ffffff');
var on=null;
Array.prototype.forEach.call(document.querySelectorAll('#sws .sw'),function(b){var m=b.dataset.p.toLowerCase()===c.p.toLowerCase()&&b.dataset.a.toLowerCase()===c.a.toLowerCase();b.classList.toggle('on',m);if(m)on=b});
$('swName').textContent=ui(on?(on.dataset.uiTitle||on.title):'Custom colors · নিজের পছন্দের রং');
$('gcPri').value=c.p;$('gcAcc').value=c.a;
gSl.forEach(function(g,k){if(gColors[k])g.dot.style.setProperty('--dc',gColors[k].a)});
var d=gDiff(i),lb=gPickB.querySelector('.lb'),sm=gPickB.querySelector('small');
gPickB.classList.toggle('same',!d.t&&!d.k);
if(!d.t&&!d.k){lb.textContent='Keep this design';sm.textContent='এটি রাখুন'}
else if(!d.t){lb.textContent='Apply this theme';sm.textContent='এই থিম প্রয়োগ করুন'}
else{lb.textContent='Use this design';sm.textContent='এই টেমপ্লেট ও থিম নিন'}
if(scroll)gScrollSw(!!gSl.length&&gOpen&&gSp>=.99);
}
function gSetColors(p,a,flash){
var i=gShown;if(i<0)return;
gColors[i]={p:p,a:a};
var g=gSl[i];mountSheet(g);g.sh.style.setProperty('--p',p);g.sh.style.setProperty('--a',a);
gSyncTheme(true);
if(flash&&!reduced()&&!gCoarse){g.tn.classList.remove('go');void g.tn.offsetWidth;g.tn.classList.add('go')}
}
function gLayout(){
var r=gStage.getBoundingClientRect(),aw=r.width,ah=r.height;
gCW=Math.max(150,Math.min(ah*.97*W/H,aw*(aw<600?.82:.72),680));gCH=gCW*H/W;
gStage.style.setProperty('--cw',gCW+'px');gStage.style.setProperty('--ch',gCH+'px');
gSl.forEach(function(g){g.th.style.transform='scale('+(gCW/W)+')'});
}
/* প্রতিটি ফ্রেমে: কার্ডের জায়গা, ঘূর্ণন, গভীরতা, ছায়া, আলোর ঝলক */
function gApply(){
var mv=!!(gDrag||gPos!==gTgt||gSp!==gSpT);gal.classList.toggle('mv',mv);
for(var i=0;i<gSl.length;i++){
var g=gSl[i],d=i-gPos,ad=Math.abs(d),s=d<0?-1:1,a1=Math.min(ad,1),a3=Math.min(ad,3),far=Math.max(a3-1,0),
x=s*(a1*gCW*.8+far*gCW*.3)*gSp,
r=-s*(a1*40+far*4)*gSp,
z=-(a1*130+far*70)*gSp,
y=-(1-a1)*8+(1-Math.min(gSp,1))*36,
sc=(1-a1*.04)*(.9+.1*Math.min(gSp,1)),
op=ad<=2?1:clampN(1-(ad-2)*.85,0,1),st=g.el.style;
var hid=op<.01;g.el.classList.toggle('far',mv&&ad>1.5);if(hid&&g.hid)continue;if(g.hid!==hid){g.hid=hid;st.display=hid?'none':''}if(!hid&&!g.fit){if(gCoarse)st.visibility='hidden';else fitCard(g)}
var tf='translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,'+z.toFixed(1)+'px) rotateY('+r.toFixed(2)+'deg) scale('+sc.toFixed(4)+')',o=op.toFixed(3),zi=String(100-Math.round(ad*10)),vo=(Math.min(ad,2)*.3*Math.min(gSp,1)).toFixed(3);
if(g._tf!==tf){g._tf=tf;st.transform=tf}
if(g._o!==o){g._o=o;st.opacity=o}
if(g._z!==zi){g._z=zi;st.zIndex=zi}
if(g._vo!==vo){g._vo=vo;g.vl.style.opacity=vo}
if(!gCoarse){var go=clampN(1-ad*1.3,0,1).toFixed(3),gt='translate3d('+(-d*12).toFixed(2)+'%,0,0)';if(g._go!==go){g._go=go;g.gl.style.opacity=go}if(g._gt!==gt){g._gt=gt;g.gl.style.transform=gt}}
}
}
function gSync(){
if(!gSl.length)return;
var i=clampN(Math.round(gPos),0,gSl.length-1);
if(i!==gShown)gSet(i);
}
var gSyT=0,gSyn=0;function gSyncSoon(){clearTimeout(gSyT);gSyT=setTimeout(function(){gSyncTheme(true)},60)}
function gSet(i){
var dir=gShown<0?0:(i>gShown?1:-1);gShown=i;
gSl.forEach(function(g,k){var on=k===i;g.el.classList.toggle('act',on);g.el.setAttribute('aria-hidden',on?'false':'true');g.dot.classList.toggle('on',on)});
gInfoSet(i,dir);
gCount.textContent=(i+1)+' / '+TPLS.length;
gPrev.disabled=i===0;gNext.disabled=i===TPLS.length-1;
if(gSyn)gSyncSoon();else{gSyn=1;gSyncTheme(true)}
if(dir&&navigator.vibrate){try{navigator.vibrate(6)}catch(x){}}
}
function gInfoSet(i,dir){
var t=TPLS[i],old=gInfo.querySelector('.gi:not(.out-l):not(.out-r)'),n=el('div','gi '+(dir>0?'in-r':dir<0?'in-l':'in-0'));
var h=el('div','gi-n');h.appendChild(el('b','t-en',t.en));h.appendChild(el('em','t-bn',t.bn));
var p=el('p','gi-d');p.appendChild(el('span','t-en',t.de));p.appendChild(el('span','t-bn',t.db));
n.appendChild(h);n.appendChild(p);
if(old){old.className='gi '+(dir>0?'out-l':'out-r');if(gCoarse){if(old.parentNode)old.parentNode.removeChild(old)}else setTimeout(function(){if(old.parentNode)old.parentNode.removeChild(old)},460)}
gInfo.appendChild(n);
}
/* স্প্রিং: স্লাইডের পজিশন আর খোলার "ছড়িয়ে পড়া" — দুটোই নরম ওভারশুটসহ থিতু হয় */
function gTick(t){
gRaf=0;
var dt=gLast?Math.min(.034,(t-gLast)/1000):.016;gLast=t;
if(reduced()){gPos=gTgt;gVel=0;gSp=gSpT;gSpV=0}
else{
var steps=Math.max(1,Math.ceil(dt/.008)),h=dt/steps,k;
for(k=0;k<steps;k++){
if(!gDrag){gVel+=((gTgt-gPos)*175-gVel*21)*h;gPos+=gVel*h}
gSpV+=((gSpT-gSp)*95-gSpV*14)*h;gSp+=gSpV*h;
}
if(!gDrag&&Math.abs(gTgt-gPos)<.0008&&Math.abs(gVel)<.008){gPos=gTgt;gVel=0}
if(Math.abs(gSpT-gSp)<.0008&&Math.abs(gSpV)<.008){gSp=gSpT;gSpV=0}
}
gApply();gSync();
if(gOpen||gSp!==gSpT){if(gDrag||gPos!==gTgt||gSp!==gSpT)gRaf=requestAnimationFrame(gTick);else gLast=0}
}
function gStart(){if(gCoarse){gPos=gTgt;gSp=gSpT;gVel=0;gSpV=0;gApply();gSync();return}if(!gRaf){gLast=0;gRaf=requestAnimationFrame(gTick)}}
function gGo(i){if(!gOpen||gBusy)return;gTgt=clampN(Math.round(i),0,TPLS.length-1);gStart()}
function gBand(p){var m=TPLS.length-1;return p<0?p*.32:p>m?m+(p-m)*.32:p}
function gPreFit(){gPump()}
function gShow(){
if(gOpen)return;
clearTimeout(gHide);
gOpen=true;gBusy=false;gal.hidden=false;
document.body.classList.add('gal-open');
var v=get(),cur=tIndex(v.tpl);
gMain.style.transform='';gal.style.opacity='';gal.classList.remove('dy');
gShown=-1;gSyn=0;gSl=[];
gPos=gTgt=cur;gVel=0;gSp=(reduced()||gCoarse)?1:0;gSpV=0;gSpT=1;
if(!gCoarse)void gal.offsetWidth;gal.classList.add('open');
try{history.pushState({gal:1},'')}catch(x){}
var tok=++gTok;
requestAnimationFrame(function(){setTimeout(function(){
if(!gOpen||tok!==gTok)return;
gBuild();gSet(cur);gApply();gScrollSw(false);gStart();setTimeout(function(){gPreFit(0)},650);
},0)});
if(!gCoarse&&document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(gOpen){gLayout();gApply()}});
setTimeout(function(){try{gStage.focus({preventScroll:true})}catch(x){}},80);
}
function gClose(fromPop){
if(!gOpen)return;
gOpen=false;
gal.classList.remove('dy');gal.style.opacity='';
gal.classList.remove('open');document.body.classList.remove('gal-open');
if(!fromPop){try{if(history.state&&history.state.gal)history.back()}catch(x){}}
clearTimeout(gHide);
gHide=setTimeout(function(){
if(gOpen)return;
gal.hidden=true;clear(gStage);clear(gDots);clear(gInfo);gSl=[];gMain.style.transform='';
cancelAnimationFrame(gRaf);gRaf=0;
},480);
try{$('tplOpen').focus({preventScroll:true})}catch(x){}
}
function gPick(){
if(gBusy||!gOpen||!gSl.length)return;
gBusy=true;
var i=gShown,t=TPLS[i],g=gSl[i],dd=gDiff(i),changed=dd.t||dd.k,c=gColors[i];
g.el.classList.add('chosen');
if(!reduced())g.el.firstChild.appendChild(el('div','gs-flash'));
gSpT=0;gStart();
setTimeout(function(){
gClose();
if(changed){$('tpl').value=t.v;$('cPri').value=c.p;$('cAcc').value=c.a;render();toast('Template: '+t.en+' · টেমপ্লেট: '+t.bn)}
},(reduced()||gCoarse)?0:380);
}
/* ===== জেসচার: ড্র্যাগ + ফ্লিং, নিচে টেনে বন্ধ, হুইল, কিবোর্ড ===== */
gStage.addEventListener('pointerdown',function(e){
if(!gOpen||gBusy||gDrag||(e.pointerType==='mouse'&&e.button!==0))return;
gDrag={id:e.pointerId,x:e.clientX,y:e.clientY,p:gPos,axis:'',s:[[e.clientX,e.timeStamp]],dy:0};
try{gStage.setPointerCapture(e.pointerId)}catch(x){}
gStage.classList.add('drag');gVel=0;gStart();
});
gStage.addEventListener('pointermove',function(e){
var d=gDrag;if(!d||e.pointerId!==d.id)return;
var dx=e.clientX-d.x,dy=e.clientY-d.y;
if(!d.axis){if(Math.abs(dx)<6&&Math.abs(dy)<6)return;d.axis=Math.abs(dx)>=Math.abs(dy)?'x':'y';if(d.axis==='y')gal.classList.add('dy')}
if(d.axis==='x'){
gPos=gBand(d.p-dx/(gCW*.7));
d.s.push([e.clientX,e.timeStamp]);if(d.s.length>6)d.s.shift();
}else{
d.dy=Math.max(0,dy);
gMain.style.transform='translate3d(0,'+(d.dy*.85).toFixed(1)+'px,0)';
gal.style.opacity=String(1-clampN(d.dy/420,0,.65));
}
});
function gUp(e){
var d=gDrag;if(!d||e.pointerId!==d.id)return;
gDrag=null;gStage.classList.remove('drag');
try{gStage.releasePointerCapture(d.id)}catch(x){}
var n=TPLS.length;
if(!d.axis){
if(e.type==='pointerup'){
var t=document.elementFromPoint(e.clientX,e.clientY),s=t&&t.closest?t.closest('.gs'):null,k=-1;
for(var j=0;j<gSl.length;j++)if(gSl[j].el===s)k=j;
if(k>-1&&k!==gShown){gGo(k);return}
}
gTgt=clampN(Math.round(gPos),0,n-1);gStart();return;
}
if(d.axis==='x'){
var a=d.s[0],b=d.s[d.s.length-1],v=-(b[0]-a[0])/Math.max(1,b[1]-a[1])*1000/(gCW*.7);
if(e.timeStamp-b[1]>90||e.type==='pointercancel')v=0;
gVel=clampN(v,-9,9);
var base=Math.round(gPos);
gTgt=clampN(Math.round(gPos+gVel*.17),Math.max(0,base-3),Math.min(n-1,base+3));
gStart();
}else{
gal.classList.remove('dy');
if(d.dy>110&&e.type==='pointerup'){gClose()}
else{gMain.style.transform='';gal.style.opacity='';gTgt=clampN(Math.round(gPos),0,n-1);gStart()}
}
}
gStage.addEventListener('pointerup',gUp);gStage.addEventListener('pointercancel',gUp);
gStage.addEventListener('wheel',function(e){
if(!gOpen||gBusy)return;
e.preventDefault();
var now=Date.now();
if(now<gWheelLock)return;
if(now-gWheelT>220)gWheel=0;
gWheelT=now;
gWheel+=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
if(Math.abs(gWheel)>36){gGo(Math.round(gTgt)+(gWheel>0?1:-1));gWheel=0;gWheelLock=now+280}
},{passive:false});
document.addEventListener('keydown',function(e){
if(!gOpen)return;
var k=e.key;
if(k==='Escape'){e.preventDefault();gClose();return}
if(k==='ArrowLeft'){e.preventDefault();gGo(Math.round(gTgt)-1)}
else if(k==='ArrowRight'){e.preventDefault();gGo(Math.round(gTgt)+1)}
else if(k==='Home'){e.preventDefault();gGo(0)}
else if(k==='End'){e.preventDefault();gGo(TPLS.length-1)}
else if((k==='Enter'||k===' ')&&e.target===gStage){e.preventDefault();gPick()}
else if(k==='Tab'){
var f=Array.prototype.filter.call(gal.querySelectorAll('button,input[type=color],[tabindex="0"]'),function(b){return !b.disabled&&b.tabIndex>=0});
if(!f.length)return;
var first=f[0],last=f[f.length-1];
if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
}
});
$('tplOpen').addEventListener('click',gShow);
$('galX').addEventListener('click',function(){gClose()});
$('galPick').addEventListener('click',gPick);
gPrev.addEventListener('click',function(){gGo(Math.round(gTgt)-1)});
gNext.addEventListener('click',function(){gGo(Math.round(gTgt)+1)});
window.addEventListener('popstate',function(){if(gOpen)gClose(true)});
var _rw=window.innerWidth,_rq=0;
window.addEventListener('resize',function(){
var w=window.innerWidth,hOnly=(w===_rw);_rw=w;
if(_rq)return;
_rq=requestAnimationFrame(function(){_rq=0;
if(gOpen&&gSl.length){gLayout();gApply()}
if(hOnly&&gCoarse&&w<=960)return;
schedThumbs();fit();
})
});
window.addEventListener('load',schedThumbs);
window.addEventListener('load',function(){fit();setTimeout(fit,300)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){autoFit();fit()});
initUi();window.__uiReady=1;
render();
/* পুরোনো সার্ভিস ওয়ার্কার সরিয়ে ফেলা */
if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})}).catch(function(){})}
})();

(function(){var b=document.getElementById('thm');if(!b)return;var r=document.documentElement,mq=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
document.addEventListener('visibilitychange',function(){r.classList.toggle('hid',document.hidden)});var xt;function xf(){r.classList.add('xf');clearTimeout(xt);xt=setTimeout(function(){r.classList.remove('xf')},320)}
function set(t,save){if(save)xf();r.setAttribute('data-theme',t);var d=t==='dark',l=d?'Light mode · লাইট মোড':'Dark mode · ডার্ক মোড';b.setAttribute('aria-pressed',d?'true':'false');b.setAttribute('aria-label',l);b.title=l;if(save){try{localStorage.setItem('cps-theme',t)}catch(e){}}}
set(r.getAttribute('data-theme')==='dark'?'dark':'light',false);
try{new MutationObserver(xf).observe(r,{attributes:true,attributeFilter:['data-ui-lang']})}catch(e){}
b.addEventListener('click',function(){set(r.getAttribute('data-theme')==='dark'?'light':'dark',true)});
if(mq&&mq.addEventListener)mq.addEventListener('change',function(e){var s=null;try{s=localStorage.getItem('cps-theme')}catch(x){}if(s!=='dark'&&s!=='light')set(e.matches?'dark':'light',false)});
})();
(function(){var d=document,r=d.documentElement;r.classList.add('js');var cs=[].slice.call(d.querySelectorAll('.card'));
function show(c){c.classList.add('in');setTimeout(function(){c.classList.remove('rv','in')},1300)}
cs.forEach(function(c,i){c.style.setProperty('--i',i%6);c.classList.add('rv')});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target)}})},{threshold:.06});cs.forEach(function(c){io.observe(c)})}else cs.forEach(show);
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.btn:not(.fab)');if(!b)return;var s=d.createElement('span'),k=b.getBoundingClientRect(),z=Math.max(k.width,k.height)*2;s.className='rip';s.style.cssText='width:'+z+'px;height:'+z+'px;left:'+(e.clientX-k.left-z/2)+'px;top:'+(e.clientY-k.top-z/2)+'px';b.appendChild(s);setTimeout(function(){s.remove()},650)})})();

(function(){
var d=document,$=function(i){return d.getElementById(i)},qa=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
function L(a,b){return b==null?a:'<span class="t-en">'+a+'</span><span class="t-bn">'+b+'</span>'}
function X(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function f(v){return +v.toFixed(3)}
function T(a,b){var l=d.documentElement.getAttribute('data-ui-lang');return l==='bn'?b:l==='en'?a:a+' · '+b}
/* ===== QR encoder (ISO 18004, byte/alnum/numeric) ===== */
var EC=[[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],[-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]],
NB=[[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],[-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],[-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]],
FB=[1,0,3,2],AL='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
function raw(v){var r=(16*v+128)*v+64;if(v>=2){var a=(v/7|0)+2;r-=(25*a-10)*a-55;if(v>=7)r-=36}return r}
function gm(x,y){var z=0;for(var i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z}
function rsD(n){var r=[],i,j,t=1;for(i=0;i<n-1;i++)r.push(0);r.push(1);for(i=0;i<n;i++){for(j=0;j<r.length;j++){r[j]=gm(r[j],t);if(j+1<r.length)r[j]^=r[j+1]}t=gm(t,2)}return r}
function rsR(data,dv){var r=dv.map(function(){return 0});data.forEach(function(b){var k=b^r.shift();r.push(0);dv.forEach(function(c,i){r[i]^=gm(c,k)})});return r}
function enc(s,e){
 var by=new TextEncoder().encode(s),bits=[],i,k,v,cb,len,mode=/^[0-9]+$/.test(s)?1:/^[0-9A-Z $%*+\-.\/:]+$/.test(s)?2:4;
 function pb(x,l){for(var j=l-1;j>=0;j--)bits.push((x>>>j)&1)}
 len=mode===4?by.length:s.length;
 for(v=1;v<=40;v++){cb=mode===1?(v<10?10:v<27?12:14):mode===2?(v<10?9:v<27?11:13):(v<10?8:16);
  var db=mode===1?Math.floor(len/3)*10+[0,4,7][len%3]:mode===2?Math.floor(len/2)*11+(len%2)*6:len*8;
  if(len<(1<<cb)&&4+cb+db<=((raw(v)>>3)-EC[e][v]*NB[e][v])*8)break}
 if(v>40)return null;
 pb(mode,4);pb(len,cb);
 if(mode===1){for(i=0;i<len;i+=3){var g=s.substr(i,3);pb(+g,g.length*3+1)}}
 else if(mode===2){for(i=0;i<len;i+=2){if(i+1<len)pb(AL.indexOf(s[i])*45+AL.indexOf(s[i+1]),11);else pb(AL.indexOf(s[i]),6)}}
 else by.forEach(function(b){pb(b,8)});
 var dc=(raw(v)>>3)-EC[e][v]*NB[e][v];pb(0,Math.min(4,dc*8-bits.length));while(bits.length%8)bits.push(0);
 var data=[];for(i=0;i<bits.length;i+=8){var b=0;for(k=0;k<8;k++)b=b<<1|bits[i+k];data.push(b)}
 for(var pd=0xEC;data.length<dc;pd^=0xEC^0x11)data.push(pd);
 var nb=NB[e][v],el=EC[e][v],rc=raw(v)>>3,ns=nb-rc%nb,sl=Math.floor(rc/nb),bl=[],dv=rsD(el),p=0;
 for(i=0;i<nb;i++){var dt=data.slice(p,p+sl-el+(i<ns?0:1));p+=dt.length;var ec=rsR(dt,dv);if(i<ns)dt.push(0);bl.push(dt.concat(ec))}
 var all=[];for(i=0;i<bl[0].length;i++)bl.forEach(function(b,j){if(i!==sl-el||j>=ns)all.push(b[i])});
 var n=v*4+17,M=[],F=[],y,x;for(y=0;y<n;y++){M.push([]);F.push([]);for(x=0;x<n;x++){M[y].push(0);F[y].push(false)}}
 function set(x,y,c){M[y][x]=c?1:0;F[y][x]=true}function bt(a,j){return (a>>>j)&1}
 for(i=0;i<n;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
 function fin(cx,cy){for(var dy=-4;dy<=4;dy++)for(var dx=-4;dx<=4;dx++){var ds=Math.max(Math.abs(dx),Math.abs(dy)),xx=cx+dx,yy=cy+dy;if(xx>=0&&xx<n&&yy>=0&&yy<n)set(xx,yy,ds!==2&&ds!==4)}}
 fin(3,3);fin(n-4,3);fin(3,n-4);
 var ap=[];if(v>1){var na=(v/7|0)+2,st=v===32?26:Math.ceil((v*4+4)/(na*2-2))*2;ap=[6];for(var ps=n-7;ap.length<na;ps-=st)ap.splice(1,0,ps)}
 var A=ap.length;ap.forEach(function(cx,ia){ap.forEach(function(cy,ja){if((ia===0&&ja===0)||(ia===0&&ja===A-1)||(ia===A-1&&ja===0))return;for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++)set(cx+dx,cy+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)})});
 function fmt(m){var da=(FB[e]<<3)|m,r=da,j;for(j=0;j<10;j++)r=(r<<1)^((r>>>9)*0x537);var b=((da<<10)|r)^0x5412;
  for(j=0;j<=5;j++)set(8,j,bt(b,j));set(8,7,bt(b,6));set(8,8,bt(b,7));set(7,8,bt(b,8));for(j=9;j<15;j++)set(14-j,8,bt(b,j));
  for(j=0;j<8;j++)set(n-1-j,8,bt(b,j));for(j=8;j<15;j++)set(8,n-15+j,bt(b,j));set(8,n-8,true)}
 fmt(0);
 if(v>=7){var r=v,j;for(j=0;j<12;j++)r=(r<<1)^((r>>>11)*0x1F25);var vb=(v<<12)|r;for(j=0;j<18;j++){var c=bt(vb,j),a=n-11+j%3,b2=(j/3)|0;set(a,b2,c);set(b2,a,c)}}
 i=0;for(var rt=n-1;rt>=1;rt-=2){if(rt===6)rt=5;for(var vt=0;vt<n;vt++)for(var j2=0;j2<2;j2++){var xx=rt-j2,up=((rt+1)&2)===0,yy=up?n-1-vt:vt;if(!F[yy][xx]&&i<all.length*8){M[yy][xx]=(all[i>>>3]>>>(7-(i&7)))&1;i++}}}
 function mk(m){for(var y=0;y<n;y++)for(var x=0;x<n;x++){if(F[y][x])continue;var iv;switch(m){case 0:iv=(x+y)%2===0;break;case 1:iv=y%2===0;break;case 2:iv=x%3===0;break;case 3:iv=(x+y)%3===0;break;case 4:iv=((x/3|0)+(y/2|0))%2===0;break;case 5:iv=x*y%2+x*y%3===0;break;case 6:iv=(x*y%2+x*y%3)%2===0;break;default:iv=((x+y)%2+x*y%3)%2===0}if(iv)M[y][x]^=1}}
 var P1=[1,0,1,1,1,0,1,0,0,0,0],P2=P1.slice().reverse();
 function pen(){var r=0,i,j,k,dk=0;
  for(i=0;i<n;i++)for(var dr=0;dr<2;dr++){var run=1,pv=dr?M[0][i]:M[i][0];for(j=1;j<n;j++){var c=dr?M[j][i]:M[i][j];if(c===pv)run++;else{if(run>=5)r+=run-2;run=1;pv=c}}if(run>=5)r+=run-2;
   for(j=0;j+11<=n;j++){var m1=true,m2=true;for(k=0;k<11;k++){var q=dr?M[j+k][i]:M[i][j+k];if(q!==P1[k])m1=false;if(q!==P2[k])m2=false}if(m1||m2)r+=40}}
  for(i=0;i<n-1;i++)for(j=0;j<n-1;j++){var c2=M[i][j];if(c2===M[i][j+1]&&c2===M[i+1][j]&&c2===M[i+1][j+1])r+=3}
  for(i=0;i<n;i++)for(j=0;j<n;j++)dk+=M[i][j];k=Math.ceil(Math.abs(dk*20-n*n*10)/(n*n))-1;return r+k*10}
 var best=0,bp=1e9;for(var m=0;m<8;m++){mk(m);fmt(m);var ps2=pen();if(ps2<bp){bp=ps2;best=m}mk(m)}
 mk(best);fmt(best);return{n:n,M:M,v:v}}

function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);x=f(x);y=f(y);if(r<=0)return 'M'+x+' '+y+'h'+w+'v'+h+'h'+(-w)+'z';w=f(w);h=f(h);r=f(r);var a=f(w-2*r),b=f(h-2*r),A='a'+r+' '+r+' 0 0 1 ';return 'M'+f(x+r)+' '+y+'h'+a+A+r+' '+r+'v'+b+A+(-r)+' '+r+'h'+(-a)+A+(-r)+' '+(-r)+'v'+(-b)+A+r+' '+(-r)+'z'}
function lum(h){var c=[1,3,5].map(function(i){var v=parseInt(h.substr(i,2),16)/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
/* ===== state ===== */
var KEY='cps-qr-cover-v1',DEF={on:false,type:'url',f:{},pos:'br',size:'m',mod:'rounded',eye:'rounded',match:true,col:'#0B1F3A',plate:true,cap:true,capT:'',logo:false,dy:60},S=JSON.parse(JSON.stringify(DEF));
try{var sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv&&typeof sv==='object'){for(var k in sv)if(k in DEF)S[k]=sv[k];if(!S.f||typeof S.f!=='object')S.f={}}}catch(e){}
if(S.pos==='tl')S.pos='tr';
var TY={url:['Link','লিংক',[['u','Link (website, GitHub, Drive…)','লিংক (ওয়েবসাইট, গিটহাব, ড্রাইভ…)','text','https://example.com']]],
text:['Text','লেখা',[['t','Text','লেখা','text','e.g. Roll 101 · CSE-101']]],
contact:['Contact','কন্টাক্ট',[['n','Name','নাম','text',''],['p','Phone','ফোন','tel','+8801XXXXXXXXX'],['e','Email','ইমেইল','email',''],['o','Organization','প্রতিষ্ঠান','text','']]],
email:['Email','ইমেইল',[['e','Email address','ইমেইল ঠিকানা','email','name@example.com']]],
phone:['Phone','ফোন',[['p','Phone number','ফোন নম্বর','tel','+8801XXXXXXXXX']]]};
function content(){var t=S.type,g=function(k){return (S.f[t+'.'+k]||'').trim()};
 if(t==='url'){var u=g('u');return !u?'':/^[a-z][a-z0-9+.-]*:/i.test(u)?u:'https://'+u}
 if(t==='text')return g('t');
 if(t==='contact'){if(!g('n')&&!g('p')&&!g('e'))return '';var o=['BEGIN:VCARD','VERSION:3.0','N:;'+g('n')+';;;','FN:'+g('n')];if(g('o'))o.push('ORG:'+g('o'));if(g('p'))o.push('TEL;TYPE=CELL:'+g('p'));if(g('e'))o.push('EMAIL:'+g('e'));o.push('END:VCARD');return o.join('\r\n')}
 if(t==='email')return g('e')?'mailto:'+g('e'):'';
 var p=g('p').replace(/[^\d+]/g,'');return p?'tel:'+p:''}
/* ===== svg ===== */
function qsvg(code,lg){var n=code.n,M=code.M,q=S.plate?2:3,N=n+2*q,lw=lg?Math.max(3,Math.round(n*.22)):0,lx=(n-lw)/2,l0=Math.floor(lx)-1,l1=Math.ceil(lx+lw)+1,x,y,dd='';
 function skip(x,y){return (x<8&&y<8)||(x>=n-8&&y<8)||(x<8&&y>=n-8)||(lw&&x>=l0&&x<l1&&y>=l0&&y<l1)}
 for(y=0;y<n;y++){var run=0;for(x=0;x<=n;x++){var on=x<n&&M[y][x]&&!skip(x,y);
  if(S.mod==='square'){if(on)run++;else if(run){dd+='M'+(x-run+q)+' '+(y+q)+'h'+run+'v1h-'+run+'z';run=0}}
  else if(on){var X0=x+q,Y0=y+q;if(S.mod==='rounded')dd+=rr(X0+.04,Y0+.04,.92,.92,.3);else dd+='M'+f(X0+.04)+' '+(Y0+.5)+'a.46 .46 0 1 0 .92 0a.46 .46 0 1 0-.92 0z'}}}
 var E={square:[0,0,0],rounded:[2.2,1.2,.9],circle:[3.5,2.5,1.5]}[S.eye]||[0,0,0],ed='';
 [[0,0],[n-7,0],[0,n-7]].forEach(function(p){var a=p[0]+q,b=p[1]+q;ed+=rr(a,b,7,7,E[0])+rr(a+1,b+1,5,5,E[1])+rr(a+2,b+2,3,3,E[2])});
 return{svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+N+' '+N+'" aria-hidden="true"><path d="'+dd+'" fill="currentColor"/><path d="'+ed+'" fill="currentColor" fill-rule="evenodd"/></svg>',N:N,lw:lw}}
/* ===== place on the pages ===== */
function capText(){if(S.capT.trim())return S.capT.trim();var l=$('lang')?$('lang').value:'en';return l==='bn'?'স্ক্যান করুন':l==='en'?'Scan me':'Scan me · স্ক্যান করুন'}
function place(){
 var c=S.on?content():'',code=c?enc(c,S.logo?3:2):null,info=$('qxInfo'),res=null;
 if(code){res=qsvg(code,S.logo)}
 if(info){info.className='qrx-info';
  if(!S.on)info.textContent='';
  else if(!c)info.textContent=T('Enter the content above to show the QR code on the page.','উপরে কনটেন্ট দিন — তাহলেই পেজে কিউআর কোড দেখা যাবে।');
  else if(!code){info.className='qrx-info warn';info.textContent=T('Too much data for one QR code — shorten it.','একটি QR কোডের জন্য ডেটা বেশি — ছোট করুন।')}
  else{var bad=!S.match&&lum(S.col)>.35;info.className='qrx-info'+(bad?' warn':'');info.textContent='v'+code.v+' · '+code.n+'×'+code.n+' · ECC '+(S.logo?'H':'Q')+(bad?' — '+T('color is too light, it may not scan','রংটা বেশি হালকা, স্ক্যান নাও হতে পারে'):'')}}
[['sheet','logo'],['sheet2','logo2']].forEach(function(p){var sh=$(p[0]);if(!sh)return;var el=sh.querySelector('.qrx');
  if(!res){if(el)el.remove();return}
  if(!el)el=d.createElement('div');
  var hd=S.pos==='tr'?sh.querySelector(':scope>.hd'):null,host=hd||sh;
  if(el.parentNode!==host||(host===sh&&sh.lastElementChild!==el))host.appendChild(el);
  var lg=$(p[1]),ex=Math.max(0,(+S.dy||60)-60),pc=(res.lw+.6)/res.N*100;
  el.className='qrx'+(S.plate?'':' np');el.dataset.pos=S.pos;el.dataset.size=S.size;el.style.marginBottom=hd?'':ex+'px';
  el.innerHTML='<div class="qrx-p"><div class="qrx-c"'+(S.match?'':' style="color:'+X(S.col)+'"')+'>'+res.svg+(S.logo&&lg&&lg.src?'<img class="qrx-l" alt="" src="'+X(lg.src)+'" style="width:'+f(pc)+'%;height:'+f(pc)+'%">':'')+'</div>'+(S.cap?'<div class="qrx-t"'+(S.match?'':' style="color:'+X(S.col)+'"')+'>'+X(capText())+'</div>':'')+'</div>'});
 if(window.CPS&&CPS.autoFit){try{CPS.autoFit()}catch(e){}}}
var pt=0;function sched(){clearTimeout(pt);pt=setTimeout(place,50)}
/* ===== controls ===== */
function chips(k,a){return '<div class="qch">'+a.map(function(o){return '<button type="button" class="dtx-chip" data-set="'+k+'" data-v="'+o[0]+'">'+L(o[1],o[2])+'</button>'}).join('')+'</div>'}
function ck(k,a,b){return '<label class="chk"><input type="checkbox" data-s="'+k+'"><span>'+L(a,b)+'</span></label>'}
function fields(){var ty=TY[S.type];$('qxF').innerHTML=ty[2].map(function(fd){var id='qxf-'+fd[0],v=S.f[S.type+'.'+fd[0]]||'';return '<div style="grid-column:1/-1"><label for="'+id+'">'+L(fd[1],fd[2])+'</label><input id="'+id+'" type="'+fd[3]+'" data-k="'+fd[0]+'" value="'+X(v)+'" placeholder="'+X(fd[4])+'" autocomplete="off"></div>'}).join('')}
function build(){$('qxIn').innerHTML=
 '<div><div class="qlb">'+L('What should it open?','স্ক্যান করলে কী খুলবে?')+'</div><div class="qch">'+Object.keys(TY).map(function(k){return '<button type="button" class="dtx-chip" data-type="'+k+'">'+L(TY[k][0],TY[k][1])+'</button>'}).join('')+'</div></div>'+
 '<div class="qf" id="qxF"></div>'+
 '<div><div class="qlb">'+L('Position on page','পেজে অবস্থান')+'</div>'+chips('pos',[['br','Bottom right','নিচে ডানে'],['bl','Bottom left','নিচে বামে'],['bc','Bottom center','নিচে মাঝে'],['tr','Top right','উপরে ডানে']])+'</div>'+
 '<div><div class="qlb">'+L('Size','সাইজ')+'</div>'+chips('size',[['s','Small','ছোট'],['m','Medium','মাঝারি'],['l','Large','বড়']])+'</div>'+
 '<div data-show="edge"><div class="qlb">'+L('Distance from edge','কিনারা থেকে দূরত্ব')+'</div><input type="range" min="60" max="200" step="2" data-s="dy" aria-label="Distance from edge · কিনারা থেকে দূরত্ব"></div>'+
 '<div><div class="qlb">'+L('Pattern style','প্যাটার্নের ধরন')+'</div>'+chips('mod',[['square','Square','চৌকো'],['rounded','Rounded','গোলাকার'],['dots','Dots','ডট']])+'</div>'+
 '<div><div class="qlb">'+L('Corner eyes','কোণার আই')+'</div>'+chips('eye',[['square','Square','চৌকো'],['rounded','Rounded','গোলাকার'],['circle','Circle','বৃত্ত']])+'</div>'+
 ck('match','Match cover theme color','কভারের থিমের রং ব্যবহার করুন')+
 '<div data-show="custom"><label for="qxCol">'+L('QR color','QR-এর রং')+'</label><input type="color" id="qxCol" data-s="col"></div>'+
 ck('plate','White card behind the QR (best for scanning)','QR-এর পেছনে সাদা কার্ড (স্ক্যানের জন্য সেরা)')+
 ck('logo','Put the cover logo in the center','মাঝখানে কভারের লোগো বসান')+
 ck('cap','Show caption under the QR','QR-এর নিচে ক্যাপশন দেখান')+
 '<div data-show="cap"><label for="qxCap">'+L('Caption (leave empty for auto)','ক্যাপশন (ফাঁকা রাখলে অটো)')+'</label><input type="text" id="qxCap" data-s="capT" maxlength="30" placeholder="Scan me" autocomplete="off"></div>'+
 '<p class="qrx-info" id="qxInfo" aria-live="polite"></p>';fields()}
function sync(){var r=$('qx');r.classList.toggle('on',S.on);$('qxOn').checked=S.on;$('qxIn').inert=!S.on;
 qa('[data-set]',r).forEach(function(b){b.classList.toggle('on',String(S[b.dataset.set])===b.dataset.v)});
 qa('[data-type]',r).forEach(function(b){b.classList.toggle('on',b.dataset.type===S.type)});
 qa('[data-s]',r).forEach(function(e){var k=e.dataset.s;if(e.type==='checkbox')e.checked=!!S[k];else if(e!==d.activeElement)e.value=S[k]});
 qa('[data-show]',r).forEach(function(e){e.hidden=e.dataset.show==='custom'?S.match:e.dataset.show==='edge'?S.pos[0]==='t':!S.cap})}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
build();sync();
$('qxOn').addEventListener('change',function(){S.on=this.checked;sync();place();save()});
var rt=$('qxIn');
rt.addEventListener('input',function(e){var t=e.target,k;
 if(t.dataset.k)S.f[S.type+'.'+t.dataset.k]=t.value;
 else if(t.dataset.s){k=t.dataset.s;S[k]=t.type==='checkbox'?t.checked:(k==='dy'?+t.value:t.value)}
 else return;sync();place();save()});
rt.addEventListener('click',function(e){var b=e.target.closest('[data-set],[data-type]');if(!b)return;
 if(b.dataset.type){S.type=b.dataset.type;fields()}else S[b.dataset.set]=b.dataset.v;sync();place();save()});
var fm=$('form');['input','change'].forEach(function(n){fm.addEventListener(n,sched)});
['logo','logo2'].forEach(function(i){var e=$(i);if(e)e.addEventListener('load',sched)});
place();setTimeout(place,600);window.addEventListener('load',function(){setTimeout(place,300)});
})();

(function(){
var d=document,$=function(i){return d.getElementById(i)},qa=function(q,r){return [].slice.call((r||d).querySelectorAll(q))};
function L(a,b){return '<span class="t-en">'+a+'</span><span class="t-bn">'+b+'</span>'}
function X(v){return String(v).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var KEY='cps-wm-v1',NUM={op:1,ang:1,size:1},DEF={on:false,type:'text',text:'CONFIDENTIAL',lay:'center',style:'plain',col:'p',op:8,ang:-30,size:100,both:true},S=JSON.parse(JSON.stringify(DEF));
try{var sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv&&typeof sv==='object')for(var k in sv)if(k in DEF)S[k]=sv[k]}catch(e){}
function chips(k,a){return '<div class="qch">'+a.map(function(o){return '<button type="button" class="dtx-chip" data-set="'+k+'" data-v="'+o[0]+'">'+L(o[1],o[2])+'</button>'}).join('')+'</div>'}
function rng(k,mn,mx,st,en,bn){return '<div><div class="qlb">'+L(en,bn)+'<b class="wk-v" data-o="'+k+'"></b></div><input type="range" min="'+mn+'" max="'+mx+'" step="'+st+'" data-s="'+k+'" aria-label="'+en+' · '+bn+'"></div>'}
function build(){$('wkIn').innerHTML=
 '<div><div class="qlb">'+L('Watermark type','ওয়াটারমার্কের ধরন')+'</div>'+chips('type',[['text','Text','লেখা'],['uni','University name','বিশ্ববিদ্যালয়ের নাম'],['logo','Logo','লোগো']])+'</div>'+
 '<div data-show="text"><label for="wkTxt">'+L('Text','লেখা')+'</label><input type="text" id="wkTxt" data-s="text" maxlength="28" placeholder="CONFIDENTIAL" autocomplete="off"><div class="wk-t">'+['DRAFT','CONFIDENTIAL','ORIGINAL','গোপনীয়'].map(function(t){return '<button type="button" class="dtx-chip" data-t="'+t+'">'+t+'</button>'}).join('')+'</div></div>'+
 '<div><div class="qlb">'+L('Layout','বিন্যাস')+'</div>'+chips('lay',[['center','Single · center','মাঝখানে একটি'],['tile','Repeating pattern','বারবার প্যাটার্ন']])+'</div>'+
 '<div data-show="stamp"><div class="qlb">'+L('Text style','লেখার স্টাইল')+'</div>'+chips('style',[['plain','Plain','সাধারণ'],['stamp','Stamp (framed)','স্ট্যাম্প (ফ্রেমসহ)']])+'</div>'+
 '<div><div class="qlb">'+L('Color','রং')+'</div>'+chips('col',[['p','Theme','থিম'],['a','Accent','অ্যাকসেন্ট'],['g','Gray','ধূসর']])+'</div>'+
 rng('op',3,30,1,'Opacity','স্বচ্ছতা')+rng('ang',-60,60,5,'Angle','কোণ')+rng('size',50,140,5,'Size','সাইজ')+
 '<label class="chk"><input type="checkbox" data-s="both"><span>'+L('Also on the declaration page','ঘোষণাপত্রের পেজেও দিন')+'</span></label>'}
function sync(){var r=$('wk');r.classList.toggle('on',S.on);$('wkOn').checked=S.on;$('wkIn').inert=!S.on;
 qa('[data-set]',r).forEach(function(b){b.classList.toggle('on',String(S[b.dataset.set])===b.dataset.v)});
 qa('[data-t]',r).forEach(function(b){b.classList.toggle('on',S.text===b.dataset.t)});
 qa('[data-s]',r).forEach(function(e){var k=e.dataset.s;if(e.type==='checkbox')e.checked=!!S[k];else if(e!==d.activeElement)e.value=S[k]});
 qa('[data-o]',r).forEach(function(e){var k=e.dataset.o;e.textContent=k==='ang'?S[k]+'\u00b0':S[k]+'%'});
 qa('[data-show]',r).forEach(function(e){var v=e.dataset.show;e.hidden=v==='text'?S.type!=='text':!(S.type!=='logo'&&S.lay==='center')})}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function grid(item,iw,ih,ang){var cols=Math.ceil(1700/iw)+1,rows=Math.min(Math.ceil(1700/ih)+1,40),h='',r,c,row;
 for(r=0;r<rows;r++){row='';for(c=0;c<cols;c++)row+='<span class="wmk-i" style="width:'+iw+'px">'+item+'</span>';
  h+='<div class="wmk-r" style="height:'+Math.round(ih)+'px;'+(r%2?'transform:translateX('+Math.round(iw/2)+'px)':'')+'">'+row+'</div>'}
 return '<div class="wmk-g" style="transform:translate(-50%,-50%) rotate('+ang+'deg)">'+h+'</div>'}
function html(sh,lg){
 var dark=sh.classList.contains('tpl-prestige'),col=S.col==='a'?'var(--a)':S.col==='g'?(dark?'#cbd5e1':'#64748b'):(dark?'#fff':'var(--p)'),sc=S.size/100,ang=+S.ang,tile=S.lay==='tile',item;
 if(S.type==='logo'){if(!lg||!lg.src)return '';var w=Math.round((tile?90:380)*sc);item='<img alt="" src="'+X(lg.src)+'" style="width:'+w+'px;'+(S.col==='g'?'filter:grayscale(1);':'')+'">';
  if(!tile)return '<div class="wmk-c" style="transform:translate(-50%,-50%) rotate('+ang+'deg)">'+item+'</div>';
  var ar=lg.naturalWidth?lg.naturalHeight/lg.naturalWidth:1;return grid(item,w+70,w*ar+70,ang)}
 var t=S.type==='uni'?((($('uni')||{}).value||'').trim()||(($(sh.id==='sheet'?'oUni':'dUni')||{}).textContent||'').trim()):String(S.text).trim();if(!t)return '';
 var len=Math.max(t.length,4);
 if(!tile){var fs=Math.max(18,Math.min(150,620/(len*.95+(S.style==='stamp'?1.4:.3))))*sc;
  return '<div class="wmk-c" style="transform:translate(-50%,-50%) rotate('+ang+'deg)"><span class="wmk-t'+(S.style==='stamp'?' st':'')+'" style="font-size:'+fs.toFixed(1)+'px;color:'+col+'">'+X(t)+'</span></div>'}
 var f=Math.round(20*sc);item='<span class="wmk-t" style="font-size:'+f+'px;color:'+col+'">'+X(t)+'</span>';
 return grid(item,Math.round(len*f*1.0+80),f+78,ang)}
function place(){[['sheet','logo'],['sheet2','logo2']].forEach(function(p,ix){var sh=$(p[0]);if(!sh)return;var el=sh.querySelector(':scope>.wmk'),h=S.on&&(ix===0||S.both)?html(sh,$(p[1])):'';
 if(!h){if(el)el.remove();return}
 if(!el){el=d.createElement('div');el.className='wmk';el.setAttribute('aria-hidden','true');sh.insertBefore(el,sh.firstChild)}
 el.style.opacity=S.op/100;if(el.__h!==h){el.innerHTML=h;el.__h=h}})}
var pt=0;function sched(){clearTimeout(pt);pt=setTimeout(place,50)}
build();sync();
$('wkOn').addEventListener('change',function(){S.on=this.checked;sync();place();save()});
var rt=$('wkIn');
rt.addEventListener('input',function(e){var t=e.target,k=t.dataset.s;if(!k)return;S[k]=t.type==='checkbox'?t.checked:NUM[k]?+t.value:t.value;sync();place();save()});
rt.addEventListener('click',function(e){var b=e.target.closest('[data-set],[data-t]');if(!b)return;if(b.dataset.t)S.text=b.dataset.t;else S[b.dataset.set]=b.dataset.v;sync();place();save()});
var fm=$('form');if(fm)['input','change'].forEach(function(n){fm.addEventListener(n,sched)});
['logo','logo2'].forEach(function(i){var e=$(i);if(e)e.addEventListener('load',sched)});
if(window.MutationObserver)['sheet','sheet2'].forEach(function(i){var e=$(i);if(e)new MutationObserver(sched).observe(e,{attributes:true,attributeFilter:['class']})});
place();setTimeout(place,600);window.addEventListener('load',function(){setTimeout(place,300)});
})();

(function(){
var d=document,$=function(i){return d.getElementById(i)},KEY='cps-rc-v3',ALL=CPS.TYPES.map(function(x){return x.v}),EX={declaration:1,approval:1,acknowledgment:1,contents:1};
function defInc(){var o={};ALL.forEach(function(k){o[k]=false});return o}
function L(a,b){return '<span class="t-en">'+a+'</span><span class="t-bn">'+b+'</span>'}
var S={order:ALL.slice(),inc:defInc(),ed:{},num:'none',cov:'assignment',on:false},busy=false,cancel=false,drag=null,lock=false;
try{var sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv){if(Array.isArray(sv.order)&&sv.order.length===ALL.length&&ALL.every(function(k){return sv.order.indexOf(k)>-1}))S.order=sv.order;if(sv.inc)for(var k in S.inc)if(k in sv.inc)S.inc[k]=!!sv.inc[k];if(/^(roman|num|none)$/.test(sv.num))S.num=sv.num;if(sv.cov)S.cov=sv.cov;if(typeof sv.on==='boolean')S.on=sv.on;if(sv.ed&&typeof sv.ed==='object')ALL.forEach(function(k){if(sv.ed[k])S.ed[k]=true})}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function ty(v){return CPS.ctType(v)||{en:v,bn:v,ic:''}}
function cur(){var v=$('docType').value;if(!CPS.isExtra()&&ALL.indexOf(v)<0)S.cov=v;else if(!CPS.isExtra())S.cov=v;return v}
function info(k){var t=ty(k),cv=!EX[k];return{en:t.en+(cv?' cover':''),bn:t.bn+(cv?' কভার':''),se:t.he||'',sb:t.hb||'',ic:t.ic,t:k,cv:cv}}
function active(){return S.order.filter(function(k){return S.inc[k]})}
function bnD(s){s=String(s);return CPS.get().digits==='bn'?s.replace(/[0-9]/g,function(c){return '০১২৩৪৫৬৭৮৯'.charAt(+c)}):s}

/* ---------- আইকন ---------- */
var IC={
 grip:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="5.5" r="1.7"/><circle cx="15" cy="5.5" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18.5" r="1.7"/><circle cx="15" cy="18.5" r="1.7"/></svg>',
 pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
 dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></svg>',
 info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.2"/></svg>',
 ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 tk:'<svg class="tk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 ds:'<svg class="ds" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6.5 12h11"/></svg>'
};

/* ---------- মিনি A4 থাম্বনেইল (পেজের ধরন অনুযায়ী) ---------- */
function R(c,x,y,w,h,rx){return '<rect class="'+c+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"'+(rx?' rx="'+rx+'"':'')+'/>'}
function P(c,dd,w){return '<path class="'+c+'" d="'+dd+'" stroke-width="'+(w||.8)+'"/>'}
function FR(x,y,w,h,sw,op){return '<rect class="as" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" stroke-width="'+sw+'"'+(op?' opacity="'+op+'"':'')+'/>'}
function C(c,x,y,r,sw){return '<circle class="'+c+'" cx="'+x+'" cy="'+y+'" r="'+r+'"'+(sw?' stroke-width="'+sw+'"':'')+'/>'}
var TH={};
(function(){
 var bg=R('pg',0,0,60,84.85),i,y,s;
 s=bg+FR(3.2,3.2,53.6,78.45,.9)+FR(5.4,5.4,49.2,74.05,.35,.6)+C('ps',30,14,5,1)+C('a',30,14,1.8)+R('p',15,22.5,30,2.8,.7)+R('g',21,26.8,18,1.4,.5)+R('p',9,31.5,42,4.6,.8)+R('p',12.5,43,35,4.2,.8)+P('as','M24 51h12',.9)+R('g',13,54.6,34,1.8,.5)+R('g',18,58.6,24,1.8,.5);
 [8.5,31.5].forEach(function(x){s+=R('bx',x,65,20,11.5,.5)+R('p',x,65,20,1)+R('g',x+2.5,69,13,1.3,.4)+R('g',x+2.5,72,9,1.3,.4)});
 TH.cover=s;
 TH.approval=bg+C('ps',30,14,6,1)+C('as',30,14,3.8,.7)+R('p',14,25,32,3,.7)+P('as','M22 31.5h16',.9)+R('g',9,37,42,1.7,.4)+R('g',9,42,42,1.7,.4)+R('g',9,47,42,1.7,.4)+R('g',9,52,26,1.7,.4)+
  '<g transform="rotate(-11 38 65)"><rect class="as" x="25" y="59" width="26" height="11" rx="1.6" stroke-width="1.1"/>'+R('a',28,63,20,2.6,.6)+R('a',31,66.8,14,1.1,.5)+'</g>'+P('ps','M9 77h18',.6)+R('g',11,79,12,1.2,.4)+P('ps','M33 77h18',.6)+R('g',37,79,10,1.2,.4);
 s=bg+C('ps',30,14,5.6,1)+P('as','M27.2 14.2l2 2 3.6-4',1.2)+R('p',13,23.5,34,3,.7)+P('as','M23 30h14',.9)+R('bx',8,34,44,10,.5)+R('p',8,34,44,.9)+R('g',11,37.6,18,1.3,.4)+R('g',33,37.6,16,1.3,.4)+R('g',11,40.6,14,1.3,.4)+R('g',33,40.6,12,1.3,.4);
 for(i=0;i<3;i++){y=50+i*7.6;s+=C('a',11.4,y+.9,2.1)+R('g',16,y,35,1.6,.4)+R('g',16,y+3.2,27,1.6,.4)}
 TH.declaration=s+P('ps','M33 77.5h19',.6)+R('g',37,79.5,11,1.2,.4);
 s=bg+R('p',14,10,32,3,.7)+P('as','M22 16.5h16',.9)+R('a',9,22,1.4,14)+R('p',13,22.6,37,1.7,.4)+R('g',13,26.4,34,1.6,.4)+R('g',13,30,36,1.6,.4)+R('g',13,33.6,22,1.6,.4);
 [42,56].forEach(function(yy){s+='<path class="a" d="M11 '+(yy+1.6)+'l1.5 1.5-1.5 1.5-1.5-1.5z"/>'+R('g',16,yy,36,1.6,.4)+R('g',16,yy+3.6,34,1.6,.4)+R('g',16,yy+7.2,36,1.6,.4)+R('g',16,yy+10.8,20,1.6,.4)});
 TH.acknowledgment=s+R('soft',9,70.5,42,7,1.2)+FR(9,70.5,42,7,.45,.7)+R('p',13,73.2,26,1.5,.4)+R('g',34,80,17,1.5,.4);
 s=bg+R('p',16,8,28,3.2,.7)+R('g',21,13.2,18,1.4,.5)+R('p',8,18,44,.9);
 var W=[0,19,23,0,16,25,20,22];
 for(i=0;i<8;i++){y=24+i*7.4;
  if(!W[i]){s+=R('bx',8,y-2.2,44,5.6,.5)+R('a',8,y-2.2,1.4,5.6)+R('p',11,y-.2,16,1.7,.4)}
  else{s+=R('p',9.5,y,W[i],1.8,.4)+'<path d="M'+(12+W[i])+' '+(y+.9)+'H44.5" stroke="#aeb9cb" stroke-width=".7" stroke-dasharray=".1 1.5" stroke-linecap="round" fill="none"/>'+R('p',46,y,4.6,1.8,.4)}}
 TH.contents=s;
})();
function thumb(k){return '<svg class="rc-svg" viewBox="0 0 60 84.85" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'+(TH[k]||TH.cover||'')+'</svg>'}

/* ---------- নম্বরিং ---------- */
function rom(n){var o='';[[10,'x'],[9,'ix'],[5,'v'],[4,'iv'],[1,'i']].forEach(function(a){while(n>=a[0]){o+=a[1];n-=a[0]}});return o}
/* কোন পেজে কী নম্বর বসবে — প্রিভিউ আর PDF একই হিসাব ব্যবহার করে */
function labels(pages){var out={},front=0;
 pages.forEach(function(k,i){if(!EX[k]){out[k]='';return}
  front++;var lab=S.num==='roman'?rom(front):S.num==='num'?String(i+1):'';
  if(lab&&CPS.get().digits==='bn')lab=lab.replace(/[0-9]/g,function(c){return '০১২৩৪৫৬৭৮৯'.charAt(+c)});
  out[k]=lab});
 return out}

/* ---------- UI তৈরি (একবারই; পরে শুধু আপডেট হয়) ---------- */
var rc=$('rcIn'),listEl,segEl,goEl,built=false;
var NOPT=[['none','—',L('None','কোনোটি নয়')],['roman','i · ii · iii',L('Roman','রোমান')],['num','2 · 3 · 4',L('Numbers','সংখ্যা')]];
function row(k){return '<li class="rc-r" data-k="'+k+'">'+
 '<button type="button" class="rc-h" data-act="grip">'+IC.grip+'</button>'+
 '<span class="rc-th" data-act="ed">'+thumb(k)+'<i class="rc-no">–</i></span>'+
 '<div class="rc-m" data-act="ed" role="button" tabindex="-1"><b><span class="rc-t"></span><i class="rc-ed">'+L('Editing','এডিটে')+'</i><i class="rc-pl"></i></b><small class="rc-sub"></small></div>'+
 '<button type="button" class="rc-e" data-act="ed">'+IC.pen+'</button>'+
 '<label class="rc-ck"><input type="checkbox" data-act="inc"><i></i></label></li>'}
function build(){
 var rows='',opts='',N=ALL.length;
 S.order.forEach(function(k){rows+=row(k)});
 NOPT.forEach(function(o){opts+='<button type="button" class="rc-so" data-num="'+o[0]+'" aria-pressed="false"><em data-s="'+o[0]+'">'+o[1]+'</em><span>'+o[2]+'</span></button>'});
 rc.innerHTML=
  '<div class="rc-sa"><button type="button" class="rc-all" id="rcAll" data-act="all" role="checkbox" aria-checked="false" aria-label="Select all pages · সব পেজ বাছুন"><span class="rc-cb">'+IC.tk+IC.ds+'</span><span class="rc-at"><b>'+L('Select all pages','সব পেজ বাছুন')+'</b><small id="rcSub"></small></span><span class="rc-ct" aria-hidden="true"><b id="rcN">0</b><span id="rcTot">/ '+N+'</span></span></button>'+
   '<button type="button" class="rc-rec" data-pre="def">'+L('Edited only','এডিট করা পেজ')+'</button></div>'+
  '<div class="rc-sl"><div><b>'+L('Pages','পেজ সমূহ')+'</b><small>'+L('Drag to reorder · tap a page to edit it','টেনে ক্রম বদলান · এডিট করতে পেজে ট্যাপ করুন')+'</small></div></div>'+
  '<ol class="rc-l" id="rcL">'+rows+'</ol>'+
  '<div class="rc-sl"><div><b>'+L('Page numbers','পেজ নম্বর')+'</b></div></div>'+
  '<div class="rc-seg" id="rcSeg" role="group" aria-label="Page numbers · পেজ নম্বর">'+opts+'</div>'+
  '<button type="button" class="btn rc-go" id="rcGo"><span class="rc-gi">'+IC.dl+'</span><span class="rc-gt" id="rcGoT"></span><span class="rc-gc" id="rcGoC"></span></button>'+
  '<p class="rc-note">'+IC.info+'<span>'+L('A4 · cover pages are never numbered','A4 সাইজ · কভার পেজে কখনো নম্বর বসে না')+'</span></p>'+
  '<div class="rc-sr" id="rcLive" aria-live="polite"></div>';
 listEl=$('rcL');segEl=$('rcSeg');goEl=$('rcGo');built=true}
function setH(el,h){if(el._h!==h){el.innerHTML=h;el._h=h}}
function live(t){var e=$('rcLive');if(e)e.textContent=t}

/* ক্রম অনুযায়ী DOM সাজায় (FLIP অ্যানিমেশনসহ) */
function sync(noAnim){
 var els={};[].forEach.call(listEl.children,function(e){els[e.dataset.k]=e});
 if(S.order.every(function(k,i){return listEl.children[i]===els[k]}))return;
 var first={};S.order.forEach(function(k){first[k]=els[k].getBoundingClientRect().top});
 S.order.forEach(function(k){listEl.appendChild(els[k])});
 if(noAnim)return;
 S.order.forEach(function(k){var e=els[k],dy=first[k]-e.getBoundingClientRect().top;if(!dy)return;
  e.style.transition='none';e.style.transform='translateY('+dy+'px)';e.getBoundingClientRect();
  e.style.transition='';e.style.transform=''})}

/* ---------- আপডেট ---------- */
function update(){
 if(!built)return;
 var v=cur(),a=active(),n=a.length,NA=ALL.length,all=n===NA,mixed=n>0&&!all,labs=labels(a);
 try{var s=CPS.isExtra()?$('sheet2'):$('sheet'),p=s.style.getPropertyValue('--p').trim()||'#0b1f3a',ac=s.style.getPropertyValue('--a').trim()||'#d4af37';rc.style.setProperty('--tp',p);rc.style.setProperty('--ta',ac)}catch(e){}
 sync();
 [].forEach.call(listEl.children,function(li){
  var k=li.dataset.k,o=info(k),on=!!S.inc[k],pos=on?a.indexOf(k)+1:0,lab=on?labs[k]:'';
  li.classList.toggle('off',!on);li.classList.toggle('cur',o.t===v);li.classList.toggle('hl',!!lab);
  var cb=li.querySelector('input');if(cb.checked!==on)cb.checked=on;
  cb.setAttribute('aria-label',o.en+' · '+o.bn);
  setH(li.querySelector('.rc-t'),L(o.en,o.bn));setH(li.querySelector('.rc-sub'),L(o.se,o.sb));
  li.querySelector('.rc-no').textContent=on?bnD(pos):'–';
  var pl=li.querySelector('.rc-pl');if(pl.textContent!==lab){pl.textContent=lab;if(lab){pl.classList.remove('pop');void pl.offsetWidth;pl.classList.add('pop')}}
  li.querySelector('.rc-h').setAttribute('aria-label','Reorder · ক্রম বদলান: '+o.en+' ('+(S.order.indexOf(k)+1)+'/'+ALL.length+')');
  li.querySelector('.rc-e').setAttribute('aria-label','Edit · সম্পাদনা: '+o.en);li.querySelector('.rc-m').setAttribute('aria-label','Edit · সম্পাদনা: '+o.en)});
 /* সংখ্যা + সব-সিলেক্ট */
 var NN=$('rcN'),nt=bnD(n);if(NN.textContent!==nt){NN.textContent=nt;NN.classList.remove('pop');void NN.offsetWidth;NN.classList.add('pop')}
 $('rcTot').textContent='/ '+bnD(NA);
 $('rcAll').setAttribute('aria-checked',all?'true':mixed?'mixed':'false');
 setH($('rcSub'),all?L('Every page is included · tap to clear','সব পেজ যুক্ত আছে · মুছতে ট্যাপ করুন'):n?L('Tap to include the remaining pages','বাকি পেজগুলোও যোগ করতে ট্যাপ করুন'):L('Tap to include every page at once','একসাথে সব পেজ যোগ করতে ট্যাপ করুন'));
 /* হেডার সুইচ */
 var sw=$('rcOn'),bx=$('rc');
 bx.setAttribute('data-on',S.on?'1':'0');sw.setAttribute('aria-checked',S.on?'true':'false');
 setH($('rcOnT'),S.on?L('On','চালু'):L('Off','বন্ধ'));
 setH($('rcHs'),S.on?(n?L(n+' of '+NA+' pages selected',bnD(n)+' / '+bnD(NA)+'টি পেজ বাছাই করা'):L('No pages selected','কোনো পেজ বাছাই করা হয়নি')):L('Combine your pages into one multi-page PDF','পেজগুলো মিলিয়ে একটি মাল্টি-পেজ পিডিএফ বানান'));
 /* নম্বরিং কন্ট্রোল */
 var idx=['none','roman','num'].indexOf(S.num);segEl.style.setProperty('--i',idx);
 [].forEach.call(segEl.children,function(b){b.setAttribute('aria-pressed',b.dataset.num===S.num?'true':'false')});
 var em=segEl.querySelector('em[data-s="num"]');if(em){var t=bnD('2 · 3 · 4');if(em.textContent!==t)em.textContent=t}
 /* ডাউনলোড বাটন */
 setH($('rcGoT'),n?L('Download full report','পূর্ণাঙ্গ রিপোর্ট ডাউনলোড'):L('Select a page to begin','শুরু করতে একটি পেজ বাছুন'));
 setH($('rcGoC'),n?L(n+(n>1?' pages':' page'),n+' পেজ'):'');
 goEl.disabled=busy||!n;goEl.classList.toggle('busy',busy)}

/* ---------- ইভেন্ট ---------- */
function preset(w){
 if(w==='def'){S.inc=defInc();ALL.forEach(function(k){if(S.ed[k])S.inc[k]=true})}
 else ALL.forEach(function(k){S.inc[k]=true});
 save();update();CPS.toast(w==='def'?(Object.keys(S.ed).length?'Edited pages selected · এডিট করা পেজ বাছাই হয়েছে':'No edited pages yet · এখনো কোনো পেজ এডিট করা হয়নি'):'All pages included · সব পেজ যোগ হয়েছে')}
function toggleAll(){
 if(busy||lock)return;var all=active().length===ALL.length;
 ALL.forEach(function(k){S.inc[k]=!all});save();update();
 CPS.toast(all?'Selection cleared · বাছাই মুছে ফেলা হয়েছে':'All '+ALL.length+' pages selected · সব '+bnD(ALL.length)+'টি পেজ বাছাই হয়েছে')}
function setOn(v){
 if(busy||drag)return;S.on=!!v;save();update();
 if(S.on)setTimeout(function(){try{$('rc').scrollIntoView({behavior:'smooth',block:'nearest'})}catch(e){}},460)}
/* পেজের নামে/ছবিতে ট্যাপ করলে ঠিক সেই পেজের এডিট-জায়গায় নিয়ে যায়:
   কভার ধরনগুলো → ফর্মের শুরু (কভারের ধরন বার), বাকিগুলো → নিজ নিজ সেটিংস কার্ড */
var EDIT_AT={declaration:'dcl',approval:'apr',acknowledgment:'ack',contents:'tcp'};
function toEdit(t){
 var tries=0;
 (function go(){
  var el=$(EDIT_AT[t]||'ctabs');
  /* সেটিংস কার্ড দেখানো হতে এক-দুই ফ্রেম লাগতে পারে */
  if(el&&el.offsetParent===null&&tries++<8){setTimeout(go,40);return}
  if(!el)return;
  var y=el.getBoundingClientRect().top+(window.pageYOffset||document.documentElement.scrollTop)-12;
  var rm=false;try{rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  try{window.scrollTo({top:Math.max(0,y),behavior:rm?'auto':'smooth'})}catch(e){window.scrollTo(0,Math.max(0,y))}
 })()}
function bind(){
 $('rcHd').addEventListener('click',function(){setOn(!S.on)});
 rc.addEventListener('change',function(e){var t=e.target;if(!t.matches||!t.matches('input[data-act="inc"]'))return;
  var li=t.closest('.rc-r');S.inc[li.dataset.k]=t.checked;save();update()});
 rc.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-act],[data-num],[data-pre],#rcGo');if(!b||!rc.contains(b))return;
  if(b.id==='rcGo'){compile();return}
  if(b.dataset.num){S.num=b.dataset.num;save();update();return}
  if(b.dataset.pre){preset(b.dataset.pre);return}
  if(b.dataset.act==='all'){toggleAll();return}
  if(b.dataset.act==='ed'){var li=b.closest('.rc-r');if(!li)return;var o=info(li.dataset.k);CPS.setType(o.t);update();toEdit(o.t);CPS.toast('Editing: '+o.en+' · সম্পাদনা: '+o.bn)}});
 rc.addEventListener('keydown',function(e){var m=e.target.closest&&e.target.closest('.rc-m');if(m&&(e.key==='Enter'||e.key===' ')){e.preventDefault();m.click()}});
 /* কীবোর্ড দিয়ে ক্রম বদল: হ্যান্ডেলে ↑ ↓ Home End */
 rc.addEventListener('keydown',function(e){var h=e.target.closest&&e.target.closest('.rc-h');if(!h)return;
  var li=h.closest('.rc-r'),k=li.dataset.k,i=S.order.indexOf(k),j=i;
  if(e.key==='ArrowUp')j=i-1;else if(e.key==='ArrowDown')j=i+1;else if(e.key==='Home')j=0;else if(e.key==='End')j=ALL.length-1;else return;
  e.preventDefault();if(j<0||j>ALL.length-1||j===i)return;
  S.order.splice(i,1);S.order.splice(j,0,k);save();update();h.focus({preventScroll:true});
  live(info(k).en+' · '+(j+1)+' / '+ALL.length)});
 /* ড্র্যাগ-অ্যান্ড-ড্রপ (মাউস ও টাচ) */
 rc.addEventListener('pointerdown',function(e){
  var h=e.target.closest&&e.target.closest('.rc-h');if(!h||busy||lock||drag)return;if(e.pointerType==='mouse'&&e.button!==0)return;
  var li=h.closest('.rc-r'),rows=[].slice.call(listEl.children),gap=parseFloat(getComputedStyle(listEl).rowGap)||8;
  drag={li:li,h:h,id:e.pointerId,y0:e.clientY,from:rows.indexOf(li),to:rows.indexOf(li),gap:gap,rows:rows,max:listEl.offsetHeight,
   m:rows.map(function(r){return{t:r.offsetTop,h:r.offsetHeight}})};
  try{h.setPointerCapture(e.pointerId)}catch(x){}
  li.classList.add('drag');listEl.classList.add('dragging');e.preventDefault()});
 rc.addEventListener('pointermove',function(e){var D=drag;if(!D||e.pointerId!==D.id)return;
  var m=D.m[D.from],lo=-m.t,hi=D.max-m.t-m.h,dy=Math.max(lo,Math.min(hi,e.clientY-D.y0)),c=m.t+dy+m.h/2,to=0;
  /* একদম ওপরে/নিচে পৌঁছালে সরাসরি প্রথম/শেষ স্লট (কেন্দ্র সমান হলে তুলনা ভুল হয়) */
  if(dy>=hi-.5)to=D.m.length-1;else if(dy<=lo+.5)to=0;
  else D.m.forEach(function(r,j){if(j!==D.from&&r.t+r.h/2<c)to++});
  D.to=to;D.li.style.transform='translateY('+dy+'px)';
  var sh=m.h+D.gap;
  D.rows.forEach(function(r,j){if(j===D.from)return;var y=0;
   if(D.from<D.to&&j>D.from&&j<=D.to)y=-sh;else if(D.from>D.to&&j>=D.to&&j<D.from)y=sh;
   r.style.transform=y?'translateY('+y+'px)':''})});
 function endDrag(e){var D=drag;if(!D||(e&&e.pointerId!==D.id))return;drag=null;lock=true;
  try{D.h.releasePointerCapture(D.id)}catch(x){}
  var disp=0,j;
  if(D.to>D.from){for(j=D.from+1;j<=D.to;j++)disp+=D.m[j].h+D.gap}else if(D.to<D.from){for(j=D.to;j<D.from;j++)disp-=D.m[j].h+D.gap}
  D.li.classList.add('settle');D.li.style.transform='translateY('+disp+'px)';
  setTimeout(function(){
   D.rows.forEach(function(r){r.style.transition='none';r.style.transform=''});
   D.li.classList.remove('drag','settle');listEl.classList.remove('dragging');
   var k=D.li.dataset.k,moved=D.to!==D.from;
   if(moved){S.order.splice(D.from,1);S.order.splice(D.to,0,k);save()}
   sync(true);update();void listEl.offsetWidth;
   D.rows.forEach(function(r){r.style.transition=''});
   if(moved)live(info(k).en+' · '+(D.to+1)+' / '+ALL.length);
   lock=false},200)}
 rc.addEventListener('pointerup',endDrag);rc.addEventListener('pointercancel',endDrag);
 /* ফর্মের অন্য কোথাও কিছু বদলালে (কভারের ধরন, ভাষা, রং, অঙ্ক…) তালিকা নিজেই আপডেট হয় */
 ['click','change'].forEach(function(n){d.addEventListener(n,function(e){if(e.target.closest&&e.target.closest('#rc'))return;setTimeout(function(){if(!busy&&!drag&&!lock)update()},60)})});
 var ut=0;function sched(){clearTimeout(ut);ut=setTimeout(function(){if(!busy&&!drag&&!lock)update()},90)}
 if(window.MutationObserver)['sheet','sheet2'].forEach(function(i){var e=$(i);if(e)new MutationObserver(sched).observe(e,{attributes:true,attributeFilter:['style']})})}

/* ---------- প্রোগ্রেস মডাল ---------- */
var ov=d.createElement('div');ov.className='rc-ov';ov.hidden=true;
ov.innerHTML='<div class="rc-box" role="dialog" aria-modal="true" aria-live="polite" aria-labelledby="rcT"><div class="rc-ring"><svg class="rg" viewBox="0 0 44 44" aria-hidden="true"><defs><linearGradient id="rcG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E3A1"/><stop offset="1" stop-color="#B98A2C"/></linearGradient></defs><circle class="bg" cx="22" cy="22" r="19"/><circle class="fg" id="rcRing" cx="22" cy="22" r="19"/></svg><b id="rcPct">0%</b><span class="tick">'+IC.ok+'</span></div><h4 id="rcT"></h4><p id="rcS"></p><ul class="rc-st" id="rcSt"></ul><button type="button" class="btn ghost" id="rcCx"><span class="t-en">Cancel</span><small class="t-bn">বাতিল</small></button></div>';
d.body.appendChild(ov);
var box=ov.firstChild;
$('rcCx').addEventListener('click',function(){cancel=true});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden&&busy)cancel=true});
function prog(f){var r=Math.max(0,Math.min(1,f));$('rcRing').style.strokeDashoffset=(119.4*(1-r)).toFixed(1);$('rcPct').textContent=Math.round(r*100)+'%'}
function tt(en,bn){$('rcT').innerHTML=L(en,bn)}
function ss(en,bn){$('rcS').innerHTML=L(en,bn)}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}

/* ---------- পেজ নম্বর ছাপা ---------- */
function stamp(cv,label,sh){var W=CPS.W,H=CPS.H,r=cv.width/W,g=cv.getContext('2d'),c=sh.className,st=sh.style,p=(st.getPropertyValue('--p')||'#0b1f3a').trim(),a=(st.getPropertyValue('--a')||'#d4af37').trim(),
 dk=/tpl-prestige/.test(c),bar=/tpl-corporate/.test(c),ex=/tpl-executive/.test(c),cx=(ex?(W+71)/2:W/2)*r,y=(bar?H-23:H-57)*r,lt=dk||bar;
 g.save();g.textAlign='center';g.textBaseline='middle';g.fillStyle=lt?'#fff':p;g.font='600 '+(14*r)+'px Inter,"Noto Sans Bengali",sans-serif';
 var tw=g.measureText(label).width,gp=14*r,ln=30*r;g.fillText(label,cx,y);g.strokeStyle=lt?'rgba(255,255,255,.55)':a;g.lineWidth=1.2*r;g.beginPath();
 g.moveTo(cx-tw/2-gp-ln,y);g.lineTo(cx-tw/2-gp,y);g.moveTo(cx+tw/2+gp,y);g.lineTo(cx+tw/2+gp+ln,y);g.stroke();g.restore()}

/* ---------- কম্পাইল ---------- */
function show(k){var o=info(k);CPS.setType(o.t);return sleep(230)}
function holes(sh){var n=0;[].forEach.call(sh.querySelectorAll('.ph'),function(e){if(e.getClientRects().length)n++});return n}
function ask(list){return new Promise(function(res){CPS.ask({icon:'warn',t:list.length+(list.length>1?' pages have empty fields':' page has empty fields'),bn:'কিছু ঘর ফাঁকা আছে',p:'Empty fields stay blank in the PDF. Fill them in first, or download as it is. · ফাঁকা ঘরগুলো PDF-এও ফাঁকা থাকবে। আগে পূরণ করুন, অথবা এভাবেই ডাউনলোড করুন।',list:list,yes:['Fix now','ঠিক করি'],no:['Download anyway','তবুও ডাউনলোড'],onYes:function(){res(false)},onNo:function(){res(true)}})})}
async function grab(ratio,pages){var items=[],n=pages.length,labs=labels(pages);
 for(var i=0;i<n;i++){if(cancel)throw 'cancel';var k=pages[i],o=info(k),li=$('rcSt').children[i];li.className='w';
  ss('Page '+(i+1)+' of '+n+' · '+o.en,'পেজ '+(i+1)+'/'+n+' · '+o.bn);await show(k);
  var cv=(await CPS.snapAll(ratio))[0],sh=CPS.isExtra()?$('sheet2'):$('sheet');
  if(labs[k])stamp(cv,labs[k],sh);
  items.push({d:cv.toDataURL('image/jpeg',.95),w:cv.width,h:cv.height});cv.width=cv.height=1;li.className='d';prog((i+1)/n*.95)}
 return items}
async function compile(){
 if(busy)return;var pages=active(),orig=$('docType').value;if(!pages.length)return;busy=true;cancel=false;update();
 try{
  var bad=[];for(var i=0;i<pages.length;i++){await show(pages[i]);var c=holes(CPS.isExtra()?$('sheet2'):$('sheet'));if(c){var o=info(pages[i]);bad.push([o.en+' · '+o.bn,c+(c>1?' empty fields · ':' empty field · ')+c+'টি ঘর ফাঁকা'])}}
  CPS.setType(orig);
  if(bad.length&&!(await ask(bad))){busy=false;update();return}
  $('rcSt').innerHTML=pages.map(function(k){var o=info(k);return '<li><span class="rk"></span><span>'+L(o.en,o.bn)+'</span></li>'}).join('');
  box.classList.remove('done');
  prog(0);tt('Compiling your report','আপনার রিপোর্ট তৈরি হচ্ছে');ss('Preparing…','প্রস্তুত হচ্ছে…');$('rcCx').hidden=false;ov.hidden=false;$('rcCx').focus({preventScroll:true});
  try{if(d.fonts&&d.fonts.ready)await d.fonts.ready}catch(e){}
  var items;try{items=await grab(3,pages)}catch(e){if(e==='cancel')throw e;$('rcSt').querySelectorAll('li').forEach(function(l){l.className=''});items=await grab(2,pages)}
  ss('Building PDF…','পিডিএফ তৈরি হচ্ছে…');await sleep(120);
  var nm=String(CPS.get().sName||'').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,'').trim().replace(/\s+/g,'-').slice(0,40);
  CPS.saveBlob(CPS.jpegPdfN(items),'Full-Report'+(nm?'_'+nm:'')+'.pdf');
  prog(1);box.classList.add('done');tt('Report ready','রিপোর্ট প্রস্তুত');ss(pages.length+' pages downloaded','পেজ ডাউনলোড হয়েছে: '+pages.length);$('rcCx').hidden=true;await sleep(1500);
  CPS.toast('Full report downloaded · পূর্ণাঙ্গ রিপোর্ট ডাউনলোড হয়েছে')
 }catch(e){if(e!=='cancel')CPS.toast('Could not create the report. Please try again. · রিপোর্ট তৈরি করা যায়নি, আবার চেষ্টা করুন')}
 ov.hidden=true;box.classList.remove('done');CPS.setType(orig);busy=false;update();try{goEl.focus({preventScroll:true})}catch(e){}}

build();bind();
/* ---------- এডিট ধরা: যে পেজে ইউজার কিছু লিখবে/বদলাবে সেটাই আপনাআপনি সিলেক্ট হবে ---------- */
var ready=false;setTimeout(function(){ready=true},1500);
function markEdit(e){
 if(!ready||busy||lock)return;var t=e.target;if(!t||!t.closest||t.id==='docType'||t.closest('#rc')||!t.closest('#form'))return;
 var v=$('docType').value;if(!(v in S.inc)||S.ed[v])return;
 S.ed[v]=true;S.inc[v]=true;save();update()}
d.addEventListener('input',markEdit,true);d.addEventListener('change',markEdit,true);
function clearEdits(){S.ed={};S.inc=defInc();save();update()}
if($('mYes'))$('mYes').addEventListener('click',function(){var m=$('modal');if(m&&/Clear all information/.test(m.textContent))setTimeout(clearEdits,150)});
update();
})();

/* ===== ঢাকা সেন্ট্রাল ইউনিভার্সিটি — দ্রুত পূরণের তালিকা (বিভাগ · কলেজ · নাম) ===== */
(function(){
 var $=function(i){return document.getElementById(i)};
 /* [English, বাংলা] — প্রথম আলো ভর্তি বিজ্ঞপ্তি ও সাবজেক্ট লিস্ট অনুযায়ী */
 var DCU=[
  ['BANGLA','বাংলা'],['ENGLISH','ইংরেজি'],['ARABIC','আরবি'],['HISTORY','ইতিহাস'],['PHILOSOPHY','দর্শন'],
  ['ISLAMIC HISTORY & CULTURE','ইসলামের ইতিহাস ও সংস্কৃতি'],['ISLAMIC STUDIES','ইসলামিক স্টাডিজ'],
  ['ECONOMICS','অর্থনীতি'],['POLITICAL SCIENCE','রাষ্ট্রবিজ্ঞান'],['SOCIOLOGY','সমাজবিজ্ঞান'],['SOCIAL WORK','সমাজকর্ম'],
  ['MATHEMATICS','গণিত'],['STATISTICS','পরিসংখ্যান'],['PHYSICS','পদার্থবিজ্ঞান'],['CHEMISTRY','রসায়ন'],
  ['BOTANY','উদ্ভিদবিজ্ঞান'],['ZOOLOGY','প্রাণিবিদ্যা'],['GEOGRAPHY & ENVIRONMENT','ভূগোল ও পরিবেশ'],
  ['PSYCHOLOGY','মনোবিজ্ঞান'],['HOME ECONOMICS','গার্হস্থ্য অর্থনীতি'],
  ['MANAGEMENT','ব্যবস্থাপনা'],['ACCOUNTING','হিসাববিজ্ঞান'],['MARKETING','মার্কেটিং'],['FINANCE & BANKING','ফিন্যান্স অ্যান্ড ব্যাংকিং']
 ];
 var OTHER=["DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING", "DEPARTMENT OF COMPUTER SCIENCE", "DEPARTMENT OF ELECTRICAL &amp; ELECTRONIC ENGINEERING", "DEPARTMENT OF BUSINESS ADMINISTRATION", "DEPARTMENT OF ACCOUNTING", "DEPARTMENT OF FINANCE &amp; BANKING", "DEPARTMENT OF MARKETING", "DEPARTMENT OF MANAGEMENT", "DEPARTMENT OF ENGLISH", "DEPARTMENT OF BANGLA", "DEPARTMENT OF ECONOMICS", "DEPARTMENT OF LAW", "DEPARTMENT OF MATHEMATICS", "DEPARTMENT OF PHYSICS", "DEPARTMENT OF CHEMISTRY", "DEPARTMENT OF SOCIOLOGY", "DEPARTMENT OF POLITICAL SCIENCE", "DEPARTMENT OF HISTORY", "DEPARTMENT OF ISLAMIC STUDIES", "DEPARTMENT OF PUBLIC HEALTH"];
 var COLLEGES=[
  ['DHAKA COLLEGE','ঢাকা কলেজ'],['EDEN MOHILA COLLEGE','ইডেন মহিলা কলেজ'],['GOVT. TITUMIR COLLEGE','সরকারি তিতুমীর কলেজ'],
  ['GOVT. BANGLA COLLEGE','সরকারি বাঙলা কলেজ'],['BEGUM BADRUNNESA GOVT. MOHILA COLLEGE','বেগম বদরুন্নেসা সরকারি মহিলা কলেজ'],
  ['GOVT. SHAHEED SUHRAWARDY COLLEGE','সরকারি শহীদ সোহরাওয়ার্দী কলেজ'],['KABI NAZRUL GOVT. COLLEGE','কবি নজরুল সরকারি কলেজ']
 ];
 function esc(t){return String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
 function opt(v,l){return '<option value="'+esc(v)+'" label="'+esc(l)+'"></option>'}
 function fill(){
  var bn=($('lang')||{}).value==='bn',h='',seen={};
  DCU.forEach(function(d){var v=bn?d[1]+' বিভাগ':'DEPARTMENT OF '+d[0],l=bn?'DEPARTMENT OF '+d[0]:d[1]+' বিভাগ';seen[v]=1;h+=opt(v,l)});
  if(!bn)OTHER.forEach(function(v){if(!seen[v]){seen[v]=1;h+=opt(v,'')}});
  var dl=$('deptList');if(dl)dl.innerHTML=h;
  var ul=$('uniList');if(ul)ul.innerHTML=bn?opt('ঢাকা সেন্ট্রাল ইউনিভার্সিটি','DHAKA CENTRAL UNIVERSITY'):opt('DHAKA CENTRAL UNIVERSITY','ঢাকা সেন্ট্রাল ইউনিভার্সিটি');
  var cl=$('campusList');if(cl)cl.innerHTML=COLLEGES.map(function(c){return bn?opt(c[1],c[0]):opt(c[0],c[1])}).join('');
 }
 fill();
 var lg=$('lang');if(lg)lg.addEventListener('change',fill);
})();

/* ===== বিভাগভিত্তিক কোর্স তালিকা (কোড + নাম) — ডিপার্টমেন্ট বাছলে কোর্স সাজেশন আসে ===== */
/* সূত্র: ঢাবি অধিভুক্ত ৭ কলেজের এনইউ-ভিত্তিক অনার্স ২য় বর্ষের পেপার কোড। ডিসিইউর অফিশিয়াল তালিকা পেলে শুধু এই COURSES অবজেক্টে যোগ/সংশোধন করুন। */
(function(){
 var $=function(i){return document.getElementById(i)};
 var ENG=['221109','English (Compulsory)'],POL=['221909','Political Organization and Political System of UK and USA'],SOC=['222009','Sociology of Bangladesh'],BSC=['222115','Bangladesh Society and Culture'];
 var COURSES={
  'BANGLA':[['221001','History of Bengali Literature-1 (Ancient and Medieval)'],['221003','Poetry of Medieval Age'],['221005','Bengali Poetry-2'],['221007','Bengali Drama-1'],SOC,BSC,POL,ENG],
  'ENGLISH':[['221101','Introduction to Drama'],['221103','Romantic Poetry'],['221105','Advanced Reading and Writing'],['221107','History of English Literature'],SOC,BSC,POL],
  'ARABIC':[['221201','Classical Poetry'],['221203','Communicative Arabic-2'],['221205','Arabic Grammar (Nahu)'],['221207','History of Arabic Literature (750-1258 A.D)'],['221209','Islamic Ideology-2'],POL,ENG],
  'ECONOMICS':[['222201','Intermediate Microeconomics'],['222203','Mathematical Economics'],['222205','Introduction to Business'],['222207','Computer and Information Technology'],POL,SOC,BSC,ENG],
  'CHEMISTRY':[['222801','Physical Chemistry-II'],['222803','Organic Chemistry'],['222805','Chemistry of the Representative Elements'],['222806','Quantitative Inorganic Analysis (Practical)'],['222707','Physics-III (Electricity and Modern Physics)'],['222708','Physics-IV (Physics Practical)'],['223707','Calculus-II'],['223708','Math Lab (Practical)'],ENG],
  'BOTANY':[['223001','Higher Cryptogams'],['223003','Taxonomy of Angiosperms'],['223005','Plant Anatomy and Embryology'],['223006','Practical-II'],['222807','General Chemistry-II'],['222809','Environmental Chemistry'],['223107','Zoology-II'],['223108','Zoology Practical-II'],ENG],
  'GEOGRAPHY & ENVIRONMENT':[['223201','Geomorphology'],['223203','Climatology'],['223205','Economic Geography'],['223206','Practical-II'],['222807','General Chemistry-II'],['222809','Environmental Chemistry'],['223707','Calculus-II'],ENG],
  'ACCOUNTING':[['222501','Computer and Information Technology (Accounting)'],['222503','Taxation in Bangladesh'],['222505','Intermediate Accounting'],['222507','Business Mathematics'],['222509','Business Statistics'],['222511','Macro Economics'],['222513','Business Communication and Report Writing']],
  'FINANCE & BANKING':[['222401','Business Statistics'],['222403','Macro Economics'],['222405','Business Mathematics'],['222407','Law and Practices of Banking and Insurance'],['222409','Computer and Information Technology'],['222411','Legal Aspects of Business'],['222413','Business Communication and Report Writing']]
 };
 /* ডিপার্টমেন্ট ইনপুট (ইংরেজি/বাংলা) → COURSES-এর কী */
 var BN={'বাংলা':'BANGLA','ইংরেজি':'ENGLISH','আরবি':'ARABIC','অর্থনীতি':'ECONOMICS','রসায়ন':'CHEMISTRY','উদ্ভিদবিজ্ঞান':'BOTANY','ভূগোল ও পরিবেশ':'GEOGRAPHY & ENVIRONMENT','হিসাববিজ্ঞান':'ACCOUNTING','ফিন্যান্স অ্যান্ড ব্যাংকিং':'FINANCE & BANKING'};
 function key(v){v=String(v||'').replace(/&amp;/g,'&').trim();if(!v)return '';var u=v.toUpperCase().replace(/^DEPARTMENT OF\s+/,'');if(COURSES[u])return u;u=v.replace(/\s*বিভাগ$/,'').trim();return BN[u]||''}
 function esc(t){return String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
 function fire(el){el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
 function list(){return COURSES[key(($('dept')||{}).value)]||[]}
 function fill(){
  var L=list(),cl=$('courseCodeList'),nl=$('courseNameList');
  if(cl)cl.innerHTML=L.map(function(c){return '<option value="'+esc(c[0])+'" label="'+esc(c[1])+'"></option>'}).join('');
  if(nl)nl.innerHTML=L.map(function(c){return '<option value="'+esc(c[1])+'" label="'+esc(c[0])+'"></option>'}).join('');
 }
 var d=$('dept'),cc=$('courseCode'),cn=$('courseName');
 if(d){d.addEventListener('input',fill);d.addEventListener('change',fill)}
 if(cc)cc.addEventListener('change',function(){var m=list().filter(function(c){return c[0]===cc.value.trim()})[0];if(m&&cn&&!cn.value.trim()){cn.value=m[1];fire(cn)}});
 if(cn)cn.addEventListener('change',function(){var m=list().filter(function(c){return c[1]===cn.value.trim()})[0];if(m&&cc&&!cc.value.trim()){cc.value=m[0];fire(cc)}});
 fill();
})();

/* Header menu links look like cover.html#lab: open that cover type (on load and on hash change) */
;(function(){
"use strict";
function fromHash(){
  var v=(location.hash||'').slice(1);if(!v)return;
  var t=document.querySelector('#ctList .ct-tab[data-v="'+v+'"]');
  if(t&&t.getAttribute('aria-checked')!=='true')t.click();
}
window.addEventListener('hashchange',fromHash);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fromHash);else fromHash();
})();
