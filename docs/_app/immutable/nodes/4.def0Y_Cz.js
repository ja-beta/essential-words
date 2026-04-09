import"../chunks/DsnmJJEf.js";import{al as b,a3 as g,a5 as S,a4 as u,t as j,Q as c,an as U,a1 as Z,K as V,a2 as K,a9 as ie,S as F,aE as Te,am as H,be as ke,R as Ce}from"../chunks/C68DG4vK.js";import{b as h,f as _,c as E,t as Se}from"../chunks/G3J5wC_n.js";import{a as D,f as Ie,e as de}from"../chunks/nF24XPFE.js";import{e as N,i as L,a as Ae,s as ve,c as De,d as Ee}from"../chunks/BiqggXaO.js";import{e as oe}from"../chunks/PsVP2NEP.js";import{c as re,b as je}from"../chunks/Cxk9A-JB.js";import{s as se,p as O}from"../chunks/rxFYdkyF.js";import{s as pe}from"../chunks/BZXItWKw.js";import{c as Be}from"../chunks/S3Et6ZTr.js";import{i as ee}from"../chunks/CYekX7kK.js";import{h as G}from"../chunks/C31BlNyG.js";import{b as Me}from"../chunks/zqmG35qV.js";import"../chunks/DlOzM7pa.js";var he={},te={},ne=34,Y=10,ae=13;function me(a){return new Function("d","return {"+a.map(function(e,t){return JSON.stringify(e)+": d["+t+'] || ""'}).join(",")+"}")}function qe(a,e){var t=me(a);return function(o,r){return e(t(o),r,a)}}function ue(a){var e=Object.create(null),t=[];return a.forEach(function(o){for(var r in o)r in e||t.push(e[r]=r)}),t}function A(a,e){var t=a+"",o=t.length;return o<e?new Array(e-o+1).join(0)+t:t}function Re(a){return a<0?"-"+A(-a,6):a>9999?"+"+A(a,6):A(a,4)}function Oe(a){var e=a.getUTCHours(),t=a.getUTCMinutes(),o=a.getUTCSeconds(),r=a.getUTCMilliseconds();return isNaN(a)?"Invalid Date":Re(a.getUTCFullYear())+"-"+A(a.getUTCMonth()+1,2)+"-"+A(a.getUTCDate(),2)+(r?"T"+A(e,2)+":"+A(t,2)+":"+A(o,2)+"."+A(r,3)+"Z":o?"T"+A(e,2)+":"+A(t,2)+":"+A(o,2)+"Z":t||e?"T"+A(e,2)+":"+A(t,2)+"Z":"")}function Ue(a){var e=new RegExp('["'+a+`
\r]`),t=a.charCodeAt(0);function o(n,d){var x,w,p=r(n,function(C,f){if(x)return x(C,f-1);w=C,x=d?qe(C,d):me(C)});return p.columns=w||[],p}function r(n,d){var x=[],w=n.length,p=0,C=0,f,T=w<=0,k=!1;n.charCodeAt(w-1)===Y&&--w,n.charCodeAt(w-1)===ae&&--w;function R(){if(T)return te;if(k)return k=!1,he;var P,z=p,I;if(n.charCodeAt(z)===ne){for(;p++<w&&n.charCodeAt(p)!==ne||n.charCodeAt(++p)===ne;);return(P=p)>=w?T=!0:(I=n.charCodeAt(p++))===Y?k=!0:I===ae&&(k=!0,n.charCodeAt(p)===Y&&++p),n.slice(z+1,P-1).replace(/""/g,'"')}for(;p<w;){if((I=n.charCodeAt(P=p++))===Y)k=!0;else if(I===ae)k=!0,n.charCodeAt(p)===Y&&++p;else if(I!==t)continue;return n.slice(z,P)}return T=!0,n.slice(z,w)}for(;(f=R())!==te;){for(var q=[];f!==he&&f!==te;)q.push(f),f=R();d&&(q=d(q,C++))==null||x.push(q)}return x}function s(n,d){return n.map(function(x){return d.map(function(w){return i(x[w])}).join(a)})}function v(n,d){return d==null&&(d=ue(n)),[d.map(i).join(a)].concat(s(n,d)).join(`
`)}function m(n,d){return d==null&&(d=ue(n)),s(n,d).join(`
`)}function y(n){return n.map(l).join(`
`)}function l(n){return n.map(i).join(a)}function i(n){return n==null?"":n instanceof Date?Oe(n):e.test(n+="")?'"'+n.replace(/"/g,'""')+'"':n}return{parse:o,parseRows:r,format:v,formatBody:m,formatRows:y,formatRow:l,formatValue:i}}var Fe=Ue(","),Ne=Fe.parse,Le=_('<section id="demo-link"><h2>Link</h2> <p><a href="elements">Default element styles demo</a></p> <p><a href="fonts">Pudding-hosted font previews</a></p> <p><a href="ui">BitsUI styled components</a></p></section>');function We(a){var e=Le();h(a,e)}var He=_('<section id="demo-image"><h2>Image</h2> <p>img tag</p> <img src="../assets/demo/test.jpg" alt="cat" class="svelte-b56t42"/> <p>background image</p> <div class="svelte-b56t42"></div></section>');function Pe(a){var e=He();h(a,e)}var ze=_('<section id="demo-element"><h2>Dynamic Svelte Element</h2> <!></section>');function Ge(a){const e=[{tag:"h3",text:"I am a h3 tag."},{tag:"p",text:"I am p tag."}];var t=ze(),o=b(g(t),2);N(o,17,()=>e,L,(r,s)=>{let v=()=>c(s).tag,m=()=>c(s).text;var y=E(),l=S(y);oe(l,v,!1,(i,n)=>{var d=Se();j(()=>D(d,m())),h(n,d)}),h(r,y)}),u(t),h(a,t)}var Je=_("<p> </p>");function Ye(a,e){var t=Je(),o=g(t);u(t),j(()=>D(o,`I am component A and my favorite number is ${e.number??""}.`)),h(a,t)}var Ve=_("<p> </p>");function Ze(a,e){var t=Ve(),o=g(t);u(t),j(()=>D(o,`I am component B and my name is ${e.name??""}.`)),h(a,t)}var Ke=_('<section id="demo-component"><h2>Dynamic Svelte Component</h2> <!></section>');function Qe(a){const e={A:Ye,B:Ze},t=[{component:"A",number:42},{component:"B",name:"Russell"}];var o=Ke(),r=b(g(o),2);N(r,17,()=>t,L,(s,v)=>{const m=U(()=>e[c(v).component]);var y=E(),l=S(y);re(l,()=>c(m),(i,n)=>{n(i,se(()=>c(v)))}),h(s,y)}),u(o),h(a,o)}var Xe=_("<div><!></div>");function $e(a,e){Z(e,!0);let t=O(e,"root",3,null),o=O(e,"top",3,0),r=O(e,"bottom",3,0),s=O(e,"increments",3,100),v=O(e,"value",15,void 0),m=[],y=[],l=[],i=[],n;function d(){let f=0,T=0;for(let k=0;k<m.length;k++)m[k]>f&&(f=m[k],T=k);f>0?v(T):v(void 0)}function x(f,T){const k=W=>{W[0].isIntersecting;const Q=W[0].intersectionRatio;m[T]=Q,d()},R=o()?o()*-1:0,q=r()?r()*-1:0,P=`${R}px 0px ${q}px 0px`,z={root:t(),rootMargin:P,threshold:y};i[T]&&i[T].disconnect();const I=new IntersectionObserver(k,z);I.observe(f),i[T]=I}function w(){l.length&&l.forEach(x)}V(()=>{for(let f=0;f<s()+1;f++)y.push(f/s());l=n.querySelectorAll(":scope > *:not(iframe)"),w()}),V(()=>{o(),r(),w()});var p=Xe(),C=g(p);pe(C,()=>e.children??ie),u(p),je(p,f=>n=f,()=>n),h(a,p),K()}var et=_('<div><p class="svelte-1sxgmm9"> </p></div>'),tt=_('<section id="scrolly"><h2 class="svelte-1sxgmm9">Scrolly <span> </span></h2> <div class="spacer svelte-1sxgmm9"></div> <!> <div class="spacer svelte-1sxgmm9"></div></section>');function nt(a){let e=H(void 0);var t=tt(),o=g(t),r=b(g(o)),s=g(r,!0);u(r),u(o);var v=b(o,4);$e(v,{get value(){return c(e)},set value(m){F(e,m,!0)},children:(m,y)=>{var l=E(),i=S(l);N(i,16,()=>[0,1,2,3,4],L,(n,d,x)=>{const w=U(()=>c(e)===x);var p=et();let C;var f=g(p),T=g(f,!0);u(f),u(p),j(()=>{C=Ae(p,1,"step svelte-1sxgmm9",null,C,{active:c(w)}),D(T,d)}),h(n,p)}),h(m,l)},$$slots:{default:!0}}),Te(2),u(t),j(()=>D(s,c(e)||"-")),h(a,t)}const at=`{
  "meta": {
    "title": "From Goat to Despite",
    "description": "Essential vocabulary lists and what they can tell us about society"
  },
  "body": [
    {
      "section": "intro",
      "content": [
        {
          "type": "IntroScreen",
          "value": {
            "p1": "Every word you see on this page is one of the most commonly used words in English.",
            "p2": "They come from a 2023 list(*) of about 2,800 words that has been found to cover over 90% of everyday general English use."
          }
        },
        {
          "type": "IntroScreen",
          "value": {
            "p1": "That 2023 list is based on an older one(*), made back in 1953, with about 2,300 words identified as the core vocabulary most essential to everyday life at the time."
          }
        },
        {
          "type": "IntroScreen",
          "value": {
            "p1": "Between the two lists, seventy years apart, about 600 words were <span class=gsl>dropped</span> and over 1,100 were <span class=ngsl>added.</span> The rest remained as is."
          }
        },
        {
          "type": "IntroScreen",
          "value": {
            "p1": "Some of the changes make immediate sense: <span class=gsl>Telegraph</span> dropped out; <span class=ngsl>computer</span> was added. <span class=gsl>tobacco</span> was replaced by <span class=ngsl>cigarette.</span> <span class=gsl>Motherhood</span> became <span class=ngsl>mom,</span> and <span class=ngsl>dad</span> was added too, though <i>fatherhood</i> was never on the list to begin with. The world changed, and the vocabulary followed.",
            "p2": "But also: <span class=ngsl>Dog</span> stayed, but <span class=gsl>goat</span> didn’t make the cut. <span class=ngsl>Knife</span> stayed, but <span class=gsl>axe, hammer, needle,</span> and <span class=gsl>spade</span> didn’t. <span class=ngsl>Bread</span> stayed, but <span class=gsl>flour</span> and <span class=gsl>wheat</span> – the stuff you’d use to make the bread – dropped. The basic terms survived, but the more specific, hands-on words thinned out.",
            "p3": "And many of the words that were added, words like <span class=ngsl>mortgage, corporation, appropriate, despite, analysis, fairly</span> – don’t look anything like the ones that were removed. In fact, they are so hard to picture they mostly don’t look like anything at all."
          }
        }
      ]
    },
    {
      "section": "hero",
      "content": [
        {
          "type": "h1",
          "value": "From Goat to Despite"
        },
        {
          "type": "h2",
          "value": "Essential vocabulary lists and what they can tell us about society"
        },
        {
          "type": "text",
          "value": "These “essential vocabulary” lists were designed as teaching tools for people learning English as a second language. The words that made it on aren’t there just because the researchers who made them thought they were important – they were pulled from real-world usage data, and extensively tested over the years. They were found to be the most common,  high-frequency words, across the widest range of everyday situations. A word made the list because the world, at that time, made it unavoidable to the average person in an English-speaking society."
        },
        {
          "type": "text",
          "value": "That's what makes them interesting beyond language education. If the essential vocabulary shifted, it means that ordinary life shifted, too. So in a way, comparing the two lists is like comparing two snapshots of ordinary life, seventy years apart."
        },
        {
          "type": "text",
          "value": "I went through the lists word by word. Here’s what I found."
        }
      ]
    },
    {
      "section": "semantics",
      "content": [
        {
          "type": "h2",
          "value": "Moving Outward"
        },
        {
          "type": "text",
          "value": "To get at what exactly is ordinary life according to the lists, I ran the words through a semantic tagging framework(*) common in linguistics research. It assigns each word to a subject category based on how it’s typically used in real language: Food and Farming, the Body and the Self, Government and Public, Language and Communication, and so on. Twenty-one categories overall."
        },
        {
          "type": "text",
          "value": "In order to have a better sense of what the shifts mean, I grouped the domains by scope – how close each word is to your immediate, physical experience. The innermost ring is the self (body,  emotions); then the local and immediate (objects, food, living things around you); then institutions; then social life. And at the outermost ring, general and abstract terms."
        },
        {
          "type": "text",
          "value": "Some of the words that were removed from the inner rings: <span class=gsl>donkey, elephant, goat, pigeon, rabbit, snake. Bake, butter, harvest, roast, soup. Ache, beard, comb, razor, shave, soap, towel.</span>"
        },
        {
          "type": "text",
          "value": "That's a world you can smell.<br>…And some of the words that were added to the outer rings: <span class=ngsl>budget, consumer, corporation, credit, economy, finance, investment, mortgage, unemployment. Candidate, democracy, legislation, license, security, voter.</span>"
        },
        {
          "type": "text",
          "value": "That's... not a world you can smell. That's a world you have to file paperwork in."
        },
        {
          "type": "text",
          "value": "This isn’t surprising in hindsight. By 1957 – four years after the original list was published – white-collar workers outnumbered blue-collar for the first time in US history(*). And by 2000, fewer than one in four workers did manual labor(*). The stuff people encountered in their daily lives, what they needed to talk about, the systems they had to navigate – all changed. The vocabulary lists, built from the language of their respective eras, tracked those changes."
        },
        {
          "type": "text",
          "value": "The Social & Communication group held its proportional ground – at least on paper it’s about a quarter of both lists. But nearly a quarter of its 1953 words are gone, and 39% of its 2013 words are new. What changed hands is telling: <span class=gsl>humble, loyalty, fellowship, apologize, confess, companionship</span> gave way to <span class=ngsl>community, identity, organization, management, ethnic, gender, narrative.</span> The social world moved from something to be navigated through personal relationships to something to belong to through institutions and group identities."
        },
        {
          "type": "text",
          "value": "The single biggest category in both lists, and the one that also grew the most, is what the framework calls General and Abstract Terms. Words like: <span class=ngsl>possibility, responsibility, concept, justify, involvement, perspective.</span> Nearly a third of all newly added words (327 out of 1148) land here. They aren’t used to name things around us, but to reason about them. And they are, almost by definition, quite hard to picture."
        }
      ]
    },
    {
      "section": "concreteness",
      "content": [
        {
          "type": "h2",
          "value": "Harder to Picture"
        },
        {
          "type": "text",
          "value": "That impression has a name in cognitive science. When you read <span class=gsl>axe</span>, your brain doesn’t just decode letters, it reaches for something. An image, a weight, a gesture. The word activates both a verbal label, and a sensory trace. Psychologists call this Dual Coding: concrete words travel through two channels, verbal and sensory; abstract words travel through one. Two channels mean two retrieval pathways, which is why concrete words are “stickier” – they are easier to visualize and hold. Abstract words, on the other hand, are purely verbal, and have to be understood through language alone."
        },
        {
          "type": "text",
          "value": "To put it another way: concrete words are easier for us to process because they come with rich supporting context – a web of associations, experiences, memories that anchor the meaning. Abstract words don’t have that web, or have a much thinner one."
        },
        {
          "type": "text",
          "value": "What this boils down to, is that concrete and abstract words aren’t processed the same way, they are asking something quite different from the mind."
        },
        {
          "type": "text",
          "value": "I ran all the words through the Brysbaert Concreteness Dataset, where thousands of people have rated close to 40,000 words on a scale of 1 to 5 based on how tangible they are. A 5 means you can experience the thing directly with your senses. A 1 means you can't. Most words fall somewhere in between."
        },
        {
          "type": "text",
          "value": "The words that left were, on average, more concrete than the ones that arrived. The highly concrete ones – things you can see or touch –  made up about 21% of the 1953 list, and fell to about 14% by 2013. The highly abstract end barely moved. What grew was the middle-to-abstract range: <span class=ngsl>status, impact, awareness, approach</span> – not quite pictureable, but not entirely intangible either. The vocabulary’s most physically anchored layer got hollowed out, and something murkier filled in its place."
        },
        {
          "type": "text",
          "value": "But there’s a wrinkle in the data that the concrete-to-abstract scale doesn’t fully capture. Among the words that left, the highly concrete ones weren't alone. A cluster of very abstract words also dropped, and they turn out to be a specific kind of abstraction: <span class=gsl>courage, wisdom, mercy, loyalty, greed, fate, revenge, honesty…</span> These words are indeed abstract, but they are not purely verbal. They carry a kind of emotional grounding. You can’t point to mercy but you’ve felt it. You know it because you’ve experienced it."
        },
        {
          "type": "text",
          "value": "The abstract words that arrived are nothing like that: <span class=ngsl>interpretation, involvement, framework, theoretical, somewhat, therefore, despite.</span> They describe how things are structured, how processes work, what role someone occupies within a system. They are language-based, through and through."
        },
        {
          "type": "text",
          "value": "The vocabulary didn’t just get harder to picture, it also shifted from describing how people are to describing how systems work."
        },
        {
          "type": "text",
          "value": "If we look at both dimensions at the same time the shift becomes even clearer. The removed words cluster toward the physical and the immediate, while the added words cluster toward the abstract and the institutional."
        }
      ]
    },
    {
      "section": "pos",
      "content": [
        {
          "type": "h2",
          "value": "How Much, How Often, How Certain"
        },
        {
          "type": "text",
          "value": "Everything so far has been about what the words refer to, their meaning, their subject. But there’s a small, yet notable shift in the kind of work that they do, too."
        },
        {
          "type": "text",
          "value": "Nouns still dominate both lists, as nouns do. Same with verbs and adjectives. But interestingly, adverbs nearly doubled: from 3.6% of the vocabulary in the 1953 list, to 6.8% in the 2013 list. Of 1,148 words added, 107 are adverbs. Only 8 were dropped."
        },
        {
          "type": "text",
          "value": "Most of them are used to calibrate, to specify degree, frequency, certainty, extent. Some hedge <span class=ngsl>(somewhat, partly, relatively, possibly, approximately),</span> others assert  <span class=ngsl>(absolutely, definitely, entirely, exactly, precisely).</span> But they're all doing the same kind of work: they take a statement and tell you how much of it is true, how often, and how certain."
        },
        {
          "type": "text",
          "value": "It’s as if the world now requires you to be more precise about everything."
        }
      ]
    },
    {
      "section": "closing",
      "content": [
        {
          "type": "h2",
          "value": "Further"
        },
        {
          "type": "text",
          "value": "Bread survived both lists. flour, wheat, and harvest didn’t. The word for what sustains us remained essential, while the words for how we’d make it weren’t."
        },
        {
          "type": "text",
          "value": "That might be the most honest summary of what happened. The two lists, examined together, describe a life that got further from its own making. Words for what we do with our hands, for what’s right around us – animals, food, objects of daily life – all thinned out. What grew are words for systems, institutions, rights, responsibilities – what we’d need for navigating the complex, often invisible forces that connect things we can’t see or touch."
        },
        {
          "type": "text",
          "value": "There’s a real loss in that, but also a real gain. The world that made the 2013 list is more regulated, more connected, and in many ways more capable than the one that made the 1953 list. It’s a world where we’re able to reach further than our kitchen, or home – across economies, institutions, democracies. The vocabulary that kept showing up reflects a life that is less self-contained and more systemic; It’s less about what’s within arm’s reach, and more about the larger world we move through – and depend on."
        },
        {
          "type": "text",
          "value": "These lists were never designed to say anything about society. They were designed to answer a very practical question: <i>which words do people need most?</i> But in answering it, they ended up creating a record of something else. language, it turns out, can’t help itself. It keeps track."
        }
      ]
    }
  ]
}`;var ot=_("<p></p>"),rt=_('<details><summary></summary> <div class="content"><!></div></details>');function st(a,e){let t=U(()=>typeof e.content=="string"),o=U(()=>e.open==="true");var r=rt(),s=g(r);G(s,()=>e.summary,!0),u(s);var v=b(s,2),m=g(v);{var y=i=>{var n=E(),d=S(n);G(d,()=>e.content),h(i,n)},l=i=>{var n=E(),d=S(n);N(d,17,()=>e.content,L,(x,w)=>{let p=()=>c(w).value;var C=ot();G(C,p,!0),u(C),h(x,C)}),h(i,n)};ee(m,i=>{c(t)?i(y):i(l,-1)})}u(v),u(r),j(()=>{r.open=c(o),ve(r,"name",e.name)}),h(a,r)}var it=_("<li></li>"),lt=_("<ul></ul>");function ct(a,e){var t=lt();N(t,21,()=>e.li,L,(o,r)=>{var s=it();G(s,()=>c(r),!0),u(s),h(o,s)}),u(t),h(a,t)}var dt=_("<li></li>"),ht=_("<ol></ol>");function ut(a,e){var t=ht();N(t,21,()=>e.li,L,(o,r)=>{var s=dt();G(s,()=>c(r),!0),u(s),h(o,s)}),u(t),h(a,t)}var vt=_("<p></p>"),pt=_("<section><!></section>");function mt(a,e){Z(e,!0);const t={details:st,ul:ct,ol:ut};let o=O(e,"components",19,()=>({})),r=O(e,"body",19,()=>[]);var s=E(),v=S(s);N(v,17,r,L,(m,y)=>{let l=()=>c(y).section,i=()=>c(y).content;const n=U(()=>l().toLowerCase().replace(/[^a-z0-9]/g,"")),d=U(()=>o()[l()]);var x=pt(),w=g(x);{var p=f=>{var T=E(),k=S(T);re(k,()=>c(d),(R,q)=>{q(R,se(i))}),h(f,T)},C=f=>{var T=E(),k=S(T);N(k,17,i,L,(R,q,P,z)=>{let I=()=>c(q).type,W=()=>c(q).value;const Q=U(()=>o()[I()]||t[I()]),fe=U(()=>typeof W()=="string");var le=E(),ge=S(le);{var ye=B=>{var M=E(),J=S(M);re(J,()=>c(Q),(X,$)=>{$(X,se(W))}),h(B,M)},we=B=>{var M=vt();G(M,W,!0),u(M),h(B,M)},be=B=>{var M=E(),J=S(M);oe(J,I,!1,(X,$)=>{var ce=E(),xe=S(ce);G(xe,W),h($,ce)}),h(B,M)},_e=B=>{var M=E(),J=S(M);oe(J,I,!1,(X,$)=>{De(X,()=>({...W()}))}),h(B,M)};ee(ge,B=>{c(Q)?B(ye):I()==="text"?B(we,1):c(fe)?B(be,2):B(_e,-1)})}h(R,le)}),h(f,T)};ee(w,f=>{c(d)?f(p):f(C,-1)})}u(x),j(()=>ve(x,"id",c(n))),h(m,x)}),h(a,s),K()}var ft=_('<p> </p> <progress max="100"></progress>',1);function gt(a,e){let t=O(e,"label",3,"A"),o=O(e,"value",3,0);var r=ft(),s=S(r),v=g(s,!0);u(s);var m=b(s,2);j(()=>{D(v,t()),Ee(m,o())}),h(a,r)}var yt=_('<section id="cms"><h2>MicroCMS</h2> <code><pre> </pre></code> <!></section>');function wt(a,e){Z(e,!0);const{body:t}=Be,o={Test:gt};var r=yt(),s=b(g(r),2),v=g(s),m=g(v,!0);u(v),u(s);var y=b(s,2);mt(y,{get components(){return o},get body(){return t}}),u(r),j(l=>D(m,l),[()=>at.replace(/\t/g," ")]),h(a,r),K()}const bt=(a,e=ie)=>{var t=_t(),o=g(t),r=g(o,!0);u(o);var s=b(o,2),v=g(s,!0);u(s),u(t),j(()=>{D(r,e().name),D(v,e().age)}),h(a,t)};var _t=_('<div class="person svelte-q3gttf"><p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p></div>'),xt=_('<h2>Svelte5</h2> <h3>Reactive variables 3 ways:</h3> <button class="svelte-q3gttf">count++</button> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <h3>Children (previously slots):</h3> <div class="children"><!></div> <h3>Dispatch Event</h3> <button class="svelte-q3gttf">Random</button>  <h3>Snippets</h3> <div class="people svelte-q3gttf"></div>',1);function Tt(a,e){Z(e,!0),O(e,"age",3,30);const t=[{name:"John",age:30},{name:"Jill",age:45}];let o=H(0),r=U(()=>c(o)*2),s=U(()=>c(o)*2),v=H(0);V(()=>{F(v,c(o)*2)});var m=xt(),y=b(S(m),4),l=b(y,2),i=g(l);u(l);var n=b(l,2),d=g(n);u(n);var x=b(n,2),w=g(x);u(x);var p=b(x,4),C=g(p);pe(C,()=>e.children??ie),u(p);var f=b(p,4),T=b(f,4);N(T,21,()=>t,L,(k,R)=>{bt(k,()=>c(R))}),u(T),j(()=>{D(i,`${c(o)??""} doubled is ${c(r)??""} (derived)`),D(d,`${c(o)??""} doubled is ${c(s)??""} (derived by)`),D(w,`${c(o)??""} doubled is ${c(v)??""} ($effect)`)}),de("click",y,()=>ke(o)),de("click",f,()=>e.random(Math.floor(Math.random()*10))),h(a,m),K()}Ie(["click"]);const kt=(a,e)=>{let t=H(Ce(a)),o=H(null),r=H(!0),s=H(void 0);const v=(l=!0)=>{F(r,l,!0),l===!0&&(F(s,null),F(o,null))},m=async()=>{try{const l=await fetch(c(t),e);if(!l.ok)throw new Error(`Unexpected error occurred (status ${l.status})`);let i;if(c(t).includes(".csv")){const n=await l.text();i=Ne(n)}else i=await l.json();return[null,i]}catch(l){const{errorMessage:i="Unexpected error eccurred"}=l;return[i,null]}},y=async l=>{v(!0);const[i,n]=await m();if(l===c(t)){if(i){v(!1),F(s,i,!0);return}v(!1),F(o,n,!0)}};return V(()=>{y(c(t))}),{get data(){return c(o)},get loading(){return c(r)},get error(){return c(s)},get url(){return c(t)},set url(l){c(t)!==l&&F(t,l,!0)}}};var Ct=_("<p>loading data...</p>"),St=_("<p> </p>"),It=_("<p>data loaded</p> <pre> </pre>",1),At=_('<div class="c"><h2>Load Data</h2> <div class="response"><!></div></div>');function Dt(a,e){Z(e,!0);const t=`${Me}/assets/demo/test.csv`,o=kt(t);V(()=>{});var r=At(),s=b(g(r),2),v=g(s);{var m=i=>{var n=Ct();h(i,n)},y=i=>{var n=St(),d=g(n);u(n),j(()=>D(d,`error: ${o.error??""}`)),h(i,n)},l=i=>{var n=It(),d=b(S(n),2),x=g(d,!0);u(d),j(w=>D(x,w),[()=>JSON.stringify(o.data,null,2)]),h(i,n)};ee(v,i=>{o.loading?i(m):o.error?i(y,1):i(l,-1)})}u(s),u(r),h(a,r),K()}var Et=_('<div id="demo" class="svelte-15aotx7"><h1>Demo</h1> <!> <!> <!> <!> <!> <!> <!> <!></div>');function jt(a){let e=H(0);function t(d){console.log(d)}var o=Et(),r=b(g(o),2);We(r);var s=b(r,2);Pe(s);var v=b(s,2);Ge(v);var m=b(v,2);Qe(m);var y=b(m,2);wt(y,{});var l=b(y,2);Dt(l,{});var i=b(l,2);nt(i);var n=b(i,2);Tt(n,{random:t,get value(){return c(e)},set value(d){F(e,d,!0)}}),u(o),h(a,o)}function Jt(a){jt(a)}export{Jt as component};
