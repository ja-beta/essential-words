import"../chunks/DsnmJJEf.js";import{al as b,$ as f,a1 as A,a0 as u,t as E,K as d,an as F,Z,ag as J,_ as K,ad as ie,M as R,aE as ke,am as P,ba as Ce,L as xe}from"../chunks/Bs3EBm-E.js";import{b as h,f as _,c as O,t as Ae}from"../chunks/D2Oxhlm5.js";import{a as D,f as Ie,e as ce}from"../chunks/CwuHiFT9.js";import{e as N,i as H,b as Se,s as me,c as De,d as Oe}from"../chunks/BxWREVcW.js";import{e as oe}from"../chunks/DsZQBd0t.js";import{c as re}from"../chunks/BkLDZTjO.js";import{s as se,p as L}from"../chunks/C3KnqD_b.js";import{s as pe}from"../chunks/NZYRv9zf.js";import{b as Ee,i as ee}from"../chunks/DJmFeHHs.js";import{c as Me}from"../chunks/C-b2WOeF.js";import{h as z}from"../chunks/l0FKtB1Q.js";import{b as Be}from"../chunks/caEG-wor.js";import"../chunks/CA3uWDR9.js";var he={},te={},ae=34,Y=10,ne=13;function ve(n){return new Function("d","return {"+n.map(function(e,t){return JSON.stringify(e)+": d["+t+'] || ""'}).join(",")+"}")}function je(n,e){var t=ve(n);return function(o,r){return e(t(o),r,n)}}function ue(n){var e=Object.create(null),t=[];return n.forEach(function(o){for(var r in o)r in e||t.push(e[r]=r)}),t}function S(n,e){var t=n+"",o=t.length;return o<e?new Array(e-o+1).join(0)+t:t}function qe(n){return n<0?"-"+S(-n,6):n>9999?"+"+S(n,6):S(n,4)}function Le(n){var e=n.getUTCHours(),t=n.getUTCMinutes(),o=n.getUTCSeconds(),r=n.getUTCMilliseconds();return isNaN(n)?"Invalid Date":qe(n.getUTCFullYear())+"-"+S(n.getUTCMonth()+1,2)+"-"+S(n.getUTCDate(),2)+(r?"T"+S(e,2)+":"+S(t,2)+":"+S(o,2)+"."+S(r,3)+"Z":o?"T"+S(e,2)+":"+S(t,2)+":"+S(o,2)+"Z":t||e?"T"+S(e,2)+":"+S(t,2)+"Z":"")}function Fe(n){var e=new RegExp('["'+n+`
\r]`),t=n.charCodeAt(0);function o(a,c){var T,w,p=r(a,function(x,g){if(T)return T(x,g-1);w=x,T=c?je(x,c):ve(x)});return p.columns=w||[],p}function r(a,c){var T=[],w=a.length,p=0,x=0,g,k=w<=0,C=!1;a.charCodeAt(w-1)===Y&&--w,a.charCodeAt(w-1)===ne&&--w;function q(){if(k)return te;if(C)return C=!1,he;var W,G=p,I;if(a.charCodeAt(G)===ae){for(;p++<w&&a.charCodeAt(p)!==ae||a.charCodeAt(++p)===ae;);return(W=p)>=w?k=!0:(I=a.charCodeAt(p++))===Y?C=!0:I===ne&&(C=!0,a.charCodeAt(p)===Y&&++p),a.slice(G+1,W-1).replace(/""/g,'"')}for(;p<w;){if((I=a.charCodeAt(W=p++))===Y)C=!0;else if(I===ne)C=!0,a.charCodeAt(p)===Y&&++p;else if(I!==t)continue;return a.slice(G,W)}return k=!0,a.slice(G,w)}for(;(g=q())!==te;){for(var j=[];g!==he&&g!==te;)j.push(g),g=q();c&&(j=c(j,x++))==null||T.push(j)}return T}function s(a,c){return a.map(function(T){return c.map(function(w){return i(T[w])}).join(n)})}function m(a,c){return c==null&&(c=ue(a)),[c.map(i).join(n)].concat(s(a,c)).join(`
`)}function v(a,c){return c==null&&(c=ue(a)),s(a,c).join(`
`)}function y(a){return a.map(l).join(`
`)}function l(a){return a.map(i).join(n)}function i(a){return a==null?"":a instanceof Date?Le(a):e.test(a+="")?'"'+a.replace(/"/g,'""')+'"':a}return{parse:o,parseRows:r,format:m,formatBody:v,formatRows:y,formatRow:l,formatValue:i}}var Re=Fe(","),Ne=Re.parse,He=_('<section id="demo-link"><h2>Link</h2> <p><a href="elements">Default element styles demo</a></p> <p><a href="fonts">Pudding-hosted font previews</a></p> <p><a href="ui">BitsUI styled components</a></p></section>');function Ue(n){var e=He();h(n,e)}var Pe=_('<section id="demo-image"><h2>Image</h2> <p>img tag</p> <img src="../assets/demo/test.jpg" alt="cat" class="svelte-b56t42"/> <p>background image</p> <div class="svelte-b56t42"></div></section>');function We(n){var e=Pe();h(n,e)}var Ge=_('<section id="demo-element"><h2>Dynamic Svelte Element</h2> <!></section>');function ze(n){const e=[{tag:"h3",text:"I am a h3 tag."},{tag:"p",text:"I am p tag."}];var t=Ge(),o=b(f(t),2);N(o,17,()=>e,H,(r,s)=>{let m=()=>d(s).tag,v=()=>d(s).text;var y=O(),l=A(y);oe(l,m,!1,(i,a)=>{var c=Ae();E(()=>D(c,v())),h(a,c)}),h(r,y)}),u(t),h(n,t)}var Ve=_("<p> </p>");function Ye(n,e){var t=Ve(),o=f(t);u(t),E(()=>D(o,`I am component A and my favorite number is ${e.number??""}.`)),h(n,t)}var Je=_("<p> </p>");function Ze(n,e){var t=Je(),o=f(t);u(t),E(()=>D(o,`I am component B and my name is ${e.name??""}.`)),h(n,t)}var Ke=_('<section id="demo-component"><h2>Dynamic Svelte Component</h2> <!></section>');function Qe(n){const e={A:Ye,B:Ze},t=[{component:"A",number:42},{component:"B",name:"Russell"}];var o=Ke(),r=b(f(o),2);N(r,17,()=>t,H,(s,m)=>{const v=F(()=>e[d(m).component]);var y=O(),l=A(y);re(l,()=>d(v),(i,a)=>{a(i,se(()=>d(m)))}),h(s,y)}),u(o),h(n,o)}var Xe=_("<div><!></div>");function $e(n,e){Z(e,!0);let t=L(e,"root",3,null),o=L(e,"top",3,0),r=L(e,"bottom",3,0),s=L(e,"increments",3,100),m=L(e,"value",15,void 0),v=[],y=[],l=[],i=[],a;function c(){let g=0,k=0;for(let C=0;C<v.length;C++)v[C]>g&&(g=v[C],k=C);g>0?m(k):m(void 0)}function T(g,k){const C=U=>{U[0].isIntersecting;const Q=U[0].intersectionRatio;v[k]=Q,c()},q=o()?o()*-1:0,j=r()?r()*-1:0,W=`${q}px 0px ${j}px 0px`,G={root:t(),rootMargin:W,threshold:y};i[k]&&i[k].disconnect();const I=new IntersectionObserver(C,G);I.observe(g),i[k]=I}function w(){l.length&&l.forEach(T)}J(()=>{for(let g=0;g<s()+1;g++)y.push(g/s());l=a.querySelectorAll(":scope > *:not(iframe)"),w()}),J(()=>{o(),r(),w()});var p=Xe(),x=f(p);pe(x,()=>e.children??ie),u(p),Ee(p,g=>a=g,()=>a),h(n,p),K()}var et=_('<div><p class="svelte-1sxgmm9"> </p></div>'),tt=_('<section id="scrolly"><h2 class="svelte-1sxgmm9">Scrolly <span> </span></h2> <div class="spacer svelte-1sxgmm9"></div> <!> <div class="spacer svelte-1sxgmm9"></div></section>');function at(n){let e=P(void 0);var t=tt(),o=f(t),r=b(f(o)),s=f(r,!0);u(r),u(o);var m=b(o,4);$e(m,{get value(){return d(e)},set value(v){R(e,v,!0)},children:(v,y)=>{var l=O(),i=A(l);N(i,16,()=>[0,1,2,3,4],H,(a,c,T)=>{const w=F(()=>d(e)===T);var p=et();let x;var g=f(p),k=f(g,!0);u(g),u(p),E(()=>{x=Se(p,1,"step svelte-1sxgmm9",null,x,{active:d(w)}),D(k,c)}),h(a,p)}),h(v,l)},$$slots:{default:!0}}),ke(2),u(t),E(()=>D(s,d(e)||"-")),h(n,t)}const nt=`{
  "meta": {
    "title": "From Goat to Despite",
    "description": "How the words we teach learners changed, and what that says about us"
  },
  "story": [
    {
      "type": "intro",
      "p1": "Every word you see on this page is one of the most commonly used words in the English language.",
      "p2": "They come from a 2023 list of about 2,800 words, shown to cover over 90% of general English use, intended for people learning the language."
    },
    {
      "type": "intro",
      "p1": "That 2023 list is an update of an earlier one, made back in 1953, which identified about 2,300 words as the core vocabulary most essential to everyday life at the time."
    },
    {
      "type": "intro",
      "p1": "Between the two lists, seventy years apart, about 600 words were <span class=gsl>dropped,</span> and over 1,100 were <span class=ngsl>added.</span> The rest <span class=remained>remained</span> as is."
    },
    {
      "type": "intro",
      "p1": "Some of the changes make immediate sense: <span class=gsl>Telegraph</span> dropped out; <span class=ngsl>computer</span> was added, along with <span class=ngsl>website</span> and <span class=ngsl>blog</span>. <span class=gsl>Tobacco</span> was replaced by <span class=ngsl>cigarette.</span> <span class=gsl>Motherhood</span> became <span class=ngsl>mom,</span> and <span class=ngsl>dad</span> was added too, though <i>fatherhood</i> was never on the list to begin with. The world changed, and surely, the vocabulary followed.",
      "p2": "But also: <span class=gsl>apple</span> didn’t make the new list. Neither did <span class=gsl>fork,</span> or <span class=gsl>soap,</span> for example. It’s not that these things became irrelevant, something else happened. The basic terms survived, but the more specific, hands-on words thinned out. <span class=remained>Dog</span> stayed; <span class=gsl>goat</span> didn’t. <span class=remained>Bread</span> stayed; <span class=gsl>flour</span> and <span class=gsl>wheat</span> – the stuff you’d use to make the bread – dropped. <span class=remained>Cook</span> is on the new list. <span class=gsl>Boil, bake,</span> and <span class=gsl>fry</span> are not.",
      "p3": "And many of the words that were added, words like <span class=ngsl>mortgage, corporation, appropriate, analysis, fairly, despite</span> – don’t look anything like the ones that were removed. In fact, they mostly don’t look like anything at all."
    },
    {
      "type": "hero",
      "h1": "From Goat to Despite",
      "dek": "How the words we teach learners changed, and what that says about us"
    },
    {
      "type": "prose",
      "html": "<p>These “essential vocabulary” lists are called the <a href=\\"\\">General Service List</a> (1953) and the <a href=\\"\\">New General Service List</a> (2013, revised in 2023).</p>\\r\\n<p>They were designed as teaching tools for people learning English as a second language, built from real-world usage data, and extensively tested. The words on them were found to be the most useful and common words, across the widest range of everyday situations. A word made the list because it appeared often enough, across enough contexts, to be hard to avoid for the average person in an English-speaking society.</p>\\r\\n\\r\\n\\r\\n<p>That's what makes them interesting beyond language education. Both lists cover most of the language people encounter in everyday use – over 90% for the 2023 list[1], and about 84% for the 1953 one[2]. That makes them, in effect, two portraits of ordinary life, seventy years apart. Each one is a record of what the world, at that time, asked people to have words for.</p>\\r\\n\\r\\n\\r\\n<p>To get at what exactly ordinary life consists of, according to the lists, I ran all the words through a semantic tagging framework common in linguistics research. It assigns each word to a subject category based on typical usage: Food and Farming, the Body and the Self, Government and Public, Language and Communication, and so on. Twenty-one categories overall. Together, they suggest what kind of world each list was built for.</p>"
    },
    {
      "type": "chart",
      "chartId": "semanticsSlopegraph",
      "title": "Less About Objects and Feelings. More About Abstract Ideas and Mental Processes.",
      "subhead": "Each band is one of 21 semantic categories, sized by its share of each list. Hover to focus on each category.",
      "overlays": [
        {
          "label": "Overlay 1 – focus on abstract band",
          "focusCategories": "General and Abstract Terms",
          "html": "The biggest category in the 1953 list was already General & Abstract Terms, with words like <span class=remained>maybe, discover, regular, important, success.</span> It grew even more in 2023, adding words like <span class=ngsl>possibility, responsibility, concept, justify,</span> and <span class=ngsl>perspective.</span> Words for reasoning about the world were already central. They became more so."
        },
        {
          "label": "Overlay 2 – focus on drops",
          "focusCategories": "Substances, Materials, Objects and Equipment | Emotion | The Body and the Individual | Food and Farming",
          "html": "The sharpest drops were in the most tangible categories: Substances & Objects, the Body & the Individual, Food & Farming, Life & Living Things. Words like <span class=gsl>clay, corn, hammer, beard, towel,</span> and <span class=gsl>goat</span> were dropped from the core vocabulary. The words for what you grow, make, and hold in your hand all thinned out."
        },
        {
          "label": "Overlay 3 – focus on Psych Processes vs. Emotion",
          "focusCategories": "Emotion | Psychological Actions, States and Processes",
          "html": "And while words about emotions shrank by 1.8 percentage points, words about psychological processes and reasoning grew by 1.7. That’s a nearly equal shift in the opposite direction. The vocabulary of inner life moved from something you experience to something you work through. Less feeling, more thinking."
        }
      ]
    },
    {
      "type": "prose",
      "html": "<p>These 21 categories have somewhat of a spatial logic to them. Some describe you: the body, emotions. Some describe what’s immediately around you: food, objects, the natural world. Others name systems you participate in: government, institutions, society, culture. And some have no fixed location at all: abstract concepts, reasoning, and processes. Grouped by scope, the pattern of change points in a specific direction.</p>"
    },
    {
      "type": "chart",
      "chartId": "semanticsScope",
      "title": "The Vocabulary Moved Outward",
      "subhead": "From the self at the center, to abstract/universal at the edge. Hover the tiles to explore the words in each domain.",
      "overlays": [
        {
          "label": "Overlay 1 – focus on the self",
          "html": "The 2023 list has fewer words relating to the self. Among what left: ache, wrist, comb, razor, shave, soap. Courage, greed, loyalty, mercy, shame. What arrived reads differently: cancer, clinical, disorder, gene, surgery, therapy, treatment. The self that the 2023 list describes reads more as something that you manage than something you inhabit—less that of a felt presence, and more that of a clinical one."
        },
        {
          "label": "Overlay 2 – focus on local/immediate",
          "html": "The Local ring shrank too. Some of what left: donkey, elephant, goat, pigeon. Bake, butter, harvest, roast. Bay, cliff, moonlight, tide. That’s the immediate world, the one within reach. And what arrived: climate, environment, organic, solar, pollution – words for the world as a system."
        },
        {
          "label": "Overlay 3 – focus on institutional",
          "html": "Within the Institutional ring, words that left include: merchant, salesman, bargain, treasury, calculator, inventor. Among what arrived: corporation, budget, mortgage, unemployment, pension, legislation, regulation, democracy, voter. It still names jobs, money, and the state, but the vocabulary sounds less like storefronts and ledgers, and more like filings, markets, and processes."
        },
        {
          "label": "Overlay 4 – focus on social/communication",
          "html": "The Social & Communication ring barely changed in relative size. But nearly a quarter of its 1953 words are gone, and 39% of its 2023 words are new. Humble, loyalty, fellowship, generous, polite, and companionship gave way to community, identity, organization, ethnic, gender, and narrative. The social world shifted from something you navigate through personal relationships to something you identify with through categories. Fewer words for the people directly around you, but more for belonging at a distance."
        },
        {
          "label": "Overlay 5 – focus on universal/abstract (zoomed out)",
          "html": "The outermost ring, the one containing words that don’t belong in any one specific domain, is the only one that meaningfully expanded. What grew wasn’t merely more abstraction, but machinery for reasoning: analyze, assess, assume, concept, conclude."
        }
      ]
    },
    {
      "type": "prose",
      "html": "In hindsight, the shift makes sense. By 1957, four years after the original list was published, white-collar workers outnumbered blue-collar for the first time in US history. And by 2000, fewer than one in four workers did manual labor. The stuff people encountered in their daily lives, what they needed to talk about, the systems they had to navigate – all changed."
    },
    {
      "type": "prose",
      "html": "The vocabulary lists, built from the language of their respective eras, tracked those changes. The shifts reflect a life that got further from its own making: less tied to tools, animals, food, and the body; more tied to national or global institutions, categories, systems, and ideas."
    },
    {
      "type": "prose",
      "html": "Look at what so much of the new vocabulary actually is. Mortgage, legislation, perspective, involvement, improvement, assumption, evaluation. You can’t weigh them, point to them, or hold them in your hand, yet the world they describe is real and consequential. These words shape your life, but they do it without ever occupying any physical space in it."
    },
    {
      "type": "prose",
      "html": "In order to examine that aspect of the words, I ran them through a database where thousands of people rated over 40,000 words on a scale of 1 to 5 based on how tangible they are. A 5 means you can experience the thing directly with your senses. A 1 means you can't. Here’s how the lists turned out."
    },
    {
      "type": "chart",
      "chartId": "concretenessDistribution",
      "title": "Getting Harder to Picture: More Abstract Words, Fewer Concrete Ones",
      "subhead": "Concreteness ratings of both lists, from abstract (1) to concrete (5).",
      "annotation": "The <span class=annotation>highly concrete end</span> dropped the most: from 21% of the total in 1953 down to 14% in 2023."
    },
    {
      "type": "prose",
      "html": "The impression that abstract words are harder to hold onto has a name in cognitive science. When you read axe, your brain doesn’t just decode letters, it reaches for something. An image, a weight, a gesture. The word activates both a verbal label, and a sensory trace. Psychologists call this Dual Coding: concrete words travel through two channels, verbal and sensory; abstract words travel through one. Two channels mean two retrieval pathways, which is why concrete words are “stickier” – they are easier to hold in a line of thought, and faster to recall. Abstract words, on the other hand, are purely verbal, and have to be understood through language alone."
    },
    {
      "type": "prose",
      "html": "To put it another way: concrete words are easier for us to process because they come bundled with a web of associations, tactile experiences, and memories that anchor their meaning. Abstract words don’t have that web, or have a much thinner one."
    },
    {
      "type": "prose",
      "html": "What this boils down to is that concrete and abstract words aren’t processed the same way. They are asking something quite different from the mind. This is why the shift matters. The words that left the list were mostly ones you could point at. The ones that arrived, mostly you can’t. Here’s what that exchange looks like."
    },
    {
      "type": "chart",
      "chartId": "concretenessBands",
      "title": "The Concrete End Got Hollowed Out. Something Murkier Filled In.",
      "subhead": "Removed words (left) and added words (right), grouped by concreteness rating. Each bar’s width is proportional to its share of each set. Hover to read more words.",
      "overlays": [
        {
          "label": "Overlay 1 – focus on band 4.5–5 (most concrete)",
          "html": "Nearly a third of all the words that were removed scored in the most concrete range. Less than one in fifteen words added scored that high. Rust, umbrella, silk, screw, and soap all left. Instead, came words like magazine, jail, apartment, bomb, and guitar."
        },
        {
          "label": "Overlay 2 – focus on bands 2–2.5 (mid-abstract)",
          "html": "This is where most of the incoming vocabulary lives. Nearly a quarter of all added words land here, in the mid-abstract range. Only 13% of the words removed did. Words like regulation, reform, cooperation, obligation, initiative, negotiate, perception. Not quite picturable, but not entirely vague either. For comparison, the removed words that have a similar score include: shame, despair, spite, fellowship, companionship. Same number on the scale, different world entirely."
        },
        {
          "label": "Overlay 3 – focus on bands 1–2",
          "html": "A cluster of very abstract words also dropped, and they turn out to be a particular kind of abstraction: courage, wisdom, mercy, loyalty, greed, fate, revenge, honesty… Abstract, yes. But they carry a kind of emotional grounding. You can’t point to mercy but you’ve felt it. You know it because you’ve experienced it. The abstract words that arrived are nothing like that: interpretation, involvement, theoretical, somewhat, evaluate, despite. They describe how things are structured, how processes unfold. They are language-based, through and through."
        }
      ]
    },
    {
      "type": "prose",
      "html": "But the vocabulary didn’t just get harder to picture. As a result, it also became more language-dependent. Concrete words tend to carry their meaning in themselves. Without sensory grounding, abstract ones need some help – other words to specify, soften, or sharpen what they mean. That help tends to come from one particular corner of the language."
    },
    {
      "type": "prose",
      "html": "Nouns still dominate both lists, as nouns do. Verbs and adjectives remained relatively stable. Adverbs nearly doubled. Of 1,148 words added, 107 are adverbs. Only 8 were dropped."
    },
    {
      "type": "chart",
      "chartId": "posDiagram",
      "title": "How Much? How Often? How Certain? Adverbs Nearly Doubled in the New List",
      "subhead": "Part-of-speech breakdown for each list."
    },
    {
      "type": "prose",
      "html": "This makes a certain sense. Axe doesn’t need a modifier, you know what it is. But implication, involvement, and policy come with conditions, qualifications, degrees that need to be spelled out. Abstract language tends to float free of sensory experience, and so it needs other words to pin it down. Adverbs are precisely that: language calibrating language. Look through all the ones that were added:"
    },
    {
      "type": "chart",
      "chartId": "adverbsAdded",
      "title": "All added adverbs",
      "subhead": "TK — full list renders in the graphic."
    },
    {
      "type": "prose",
      "html": "Most of them are used to specify degree, frequency, certainty, extent. Some hedge (somewhat, partly, relatively, possibly, approximately), others assert (absolutely, definitely, entirely, exactly, precisely). But they're all doing the same kind of work: they take a statement and tell you how much of it is true, how often, how certain."
    },
    {
      "type": "prose",
      "html": "It’s as if the world now requires you to be more precise about everything. And for good reason. Today's world is more regulated, more connected, and in many ways more capable than the one that made the 1953 list. It’s a world where we’re able to reach further than our kitchen, or home – across economies, institutions, democracies. The vocabulary that keeps showing up reflects a life that is less self-contained and more systemic; It’s less about what’s within arm’s reach, and more about the larger world we move through – and increasingly depend on. That sort of connection, this long-distance communication, if you will, requires pertinent language."
    },
    {
      "type": "prose",
      "html": "Bread survived both lists. Flour, wheat, and harvest didn’t. The word for what sustains us remained essential, while the words for how we’d make it weren’t. That might be the most honest summary of what happened."
    },
    {
      "type": "prose",
      "html": "These lists were never designed to say anything about society. They were designed to answer a very practical question: which words do people need most? But in answering it, they ended up creating a record of something else; of what we are expected to engage with, and need to deal with, in our daily lives. Language, it turns out, can’t help itself. It keeps track."
    }
  ]
}`;var ot=_("<p></p>"),rt=_('<details><summary></summary> <div class="content"><!></div></details>');function st(n,e){let t=F(()=>typeof e.content=="string"),o=F(()=>e.open==="true");var r=rt(),s=f(r);z(s,()=>e.summary,!0),u(s);var m=b(s,2),v=f(m);{var y=i=>{var a=O(),c=A(a);z(c,()=>e.content),h(i,a)},l=i=>{var a=O(),c=A(a);N(c,17,()=>e.content,H,(T,w)=>{let p=()=>d(w).value;var x=ot();z(x,p,!0),u(x),h(T,x)}),h(i,a)};ee(v,i=>{d(t)?i(y):i(l,-1)})}u(m),u(r),E(()=>{r.open=d(o),me(r,"name",e.name)}),h(n,r)}var it=_("<li></li>"),lt=_("<ul></ul>");function dt(n,e){var t=lt();N(t,21,()=>e.li,H,(o,r)=>{var s=it();z(s,()=>d(r),!0),u(s),h(o,s)}),u(t),h(n,t)}var ct=_("<li></li>"),ht=_("<ol></ol>");function ut(n,e){var t=ht();N(t,21,()=>e.li,H,(o,r)=>{var s=ct();z(s,()=>d(r),!0),u(s),h(o,s)}),u(t),h(n,t)}var mt=_("<p></p>"),pt=_("<section><!></section>");function vt(n,e){Z(e,!0);const t={details:st,ul:dt,ol:ut};let o=L(e,"components",19,()=>({})),r=L(e,"body",19,()=>[]);var s=O(),m=A(s);N(m,17,r,H,(v,y)=>{let l=()=>d(y).section,i=()=>d(y).content;const a=F(()=>l().toLowerCase().replace(/[^a-z0-9]/g,"")),c=F(()=>o()[l()]);var T=pt(),w=f(T);{var p=g=>{var k=O(),C=A(k);re(C,()=>d(c),(q,j)=>{j(q,se(i))}),h(g,k)},x=g=>{var k=O(),C=A(k);N(C,17,i,H,(q,j,W,G)=>{let I=()=>d(j).type,U=()=>d(j).value;const Q=F(()=>o()[I()]||t[I()]),ge=F(()=>typeof U()=="string");var le=O(),fe=A(le);{var ye=M=>{var B=O(),V=A(B);re(V,()=>d(Q),(X,$)=>{$(X,se(U))}),h(M,B)},we=M=>{var B=mt();z(B,U,!0),u(B),h(M,B)},be=M=>{var B=O(),V=A(B);oe(V,I,!1,(X,$)=>{var de=O(),Te=A(de);z(Te,U),h($,de)}),h(M,B)},_e=M=>{var B=O(),V=A(B);oe(V,I,!1,(X,$)=>{De(X,()=>({...U()}))}),h(M,B)};ee(fe,M=>{d(Q)?M(ye):I()==="text"?M(we,1):d(ge)?M(be,2):M(_e,-1)})}h(q,le)}),h(g,k)};ee(w,g=>{d(c)?g(p):g(x,-1)})}u(T),E(()=>me(T,"id",d(a))),h(v,T)}),h(n,s),K()}var gt=_('<p> </p> <progress max="100"></progress>',1);function ft(n,e){let t=L(e,"label",3,"A"),o=L(e,"value",3,0);var r=gt(),s=A(r),m=f(s,!0);u(s);var v=b(s,2);E(()=>{D(m,t()),Oe(v,o())}),h(n,r)}var yt=_('<section id="cms"><h2>MicroCMS</h2> <code><pre> </pre></code> <!></section>');function wt(n,e){Z(e,!0);const{body:t}=Me,o={Test:ft};var r=yt(),s=b(f(r),2),m=f(s),v=f(m,!0);u(m),u(s);var y=b(s,2);vt(y,{get components(){return o},get body(){return t}}),u(r),E(l=>D(v,l),[()=>nt.replace(/\t/g," ")]),h(n,r),K()}const bt=(n,e=ie)=>{var t=_t(),o=f(t),r=f(o,!0);u(o);var s=b(o,2),m=f(s,!0);u(s),u(t),E(()=>{D(r,e().name),D(m,e().age)}),h(n,t)};var _t=_('<div class="person svelte-q3gttf"><p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p></div>'),Tt=_('<h2>Svelte5</h2> <h3>Reactive variables 3 ways:</h3> <button class="svelte-q3gttf">count++</button> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <h3>Children (previously slots):</h3> <div class="children"><!></div> <h3>Dispatch Event</h3> <button class="svelte-q3gttf">Random</button>  <h3>Snippets</h3> <div class="people svelte-q3gttf"></div>',1);function kt(n,e){Z(e,!0),L(e,"age",3,30);const t=[{name:"John",age:30},{name:"Jill",age:45}];let o=P(0),r=F(()=>d(o)*2),s=F(()=>d(o)*2),m=P(0);J(()=>{R(m,d(o)*2)});var v=Tt(),y=b(A(v),4),l=b(y,2),i=f(l);u(l);var a=b(l,2),c=f(a);u(a);var T=b(a,2),w=f(T);u(T);var p=b(T,4),x=f(p);pe(x,()=>e.children??ie),u(p);var g=b(p,4),k=b(g,4);N(k,21,()=>t,H,(C,q)=>{bt(C,()=>d(q))}),u(k),E(()=>{D(i,`${d(o)??""} doubled is ${d(r)??""} (derived)`),D(c,`${d(o)??""} doubled is ${d(s)??""} (derived by)`),D(w,`${d(o)??""} doubled is ${d(m)??""} ($effect)`)}),ce("click",y,()=>Ce(o)),ce("click",g,()=>e.random(Math.floor(Math.random()*10))),h(n,v),K()}Ie(["click"]);const Ct=(n,e)=>{let t=P(xe(n)),o=P(null),r=P(!0),s=P(void 0);const m=(l=!0)=>{R(r,l,!0),l===!0&&(R(s,null),R(o,null))},v=async()=>{try{const l=await fetch(d(t),e);if(!l.ok)throw new Error(`Unexpected error occurred (status ${l.status})`);let i;if(d(t).includes(".csv")){const a=await l.text();i=Ne(a)}else i=await l.json();return[null,i]}catch(l){const{errorMessage:i="Unexpected error eccurred"}=l;return[i,null]}},y=async l=>{m(!0);const[i,a]=await v();if(l===d(t)){if(i){m(!1),R(s,i,!0);return}m(!1),R(o,a,!0)}};return J(()=>{y(d(t))}),{get data(){return d(o)},get loading(){return d(r)},get error(){return d(s)},get url(){return d(t)},set url(l){d(t)!==l&&R(t,l,!0)}}};var xt=_("<p>loading data...</p>"),At=_("<p> </p>"),It=_("<p>data loaded</p> <pre> </pre>",1),St=_('<div class="c"><h2>Load Data</h2> <div class="response"><!></div></div>');function Dt(n,e){Z(e,!0);const t=`${Be}/assets/demo/test.csv`,o=Ct(t);J(()=>{});var r=St(),s=b(f(r),2),m=f(s);{var v=i=>{var a=xt();h(i,a)},y=i=>{var a=At(),c=f(a);u(a),E(()=>D(c,`error: ${o.error??""}`)),h(i,a)},l=i=>{var a=It(),c=b(A(a),2),T=f(c,!0);u(c),E(w=>D(T,w),[()=>JSON.stringify(o.data,null,2)]),h(i,a)};ee(m,i=>{o.loading?i(v):o.error?i(y,1):i(l,-1)})}u(s),u(r),h(n,r),K()}var Ot=_('<div id="demo" class="svelte-15aotx7"><h1>Demo</h1> <!> <!> <!> <!> <!> <!> <!> <!></div>');function Et(n){let e=P(0);function t(c){console.log(c)}var o=Ot(),r=b(f(o),2);Ue(r);var s=b(r,2);We(s);var m=b(s,2);ze(m);var v=b(m,2);Qe(v);var y=b(v,2);wt(y,{});var l=b(y,2);Dt(l,{});var i=b(l,2);at(i);var a=b(i,2);kt(a,{random:t,get value(){return d(e)},set value(c){R(e,c,!0)}}),u(o),h(n,o)}function Vt(n){Et(n)}export{Vt as component};
