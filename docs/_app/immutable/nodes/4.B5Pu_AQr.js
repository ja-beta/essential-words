import"../chunks/DsnmJJEf.js";import{al as b,$ as v,a1 as C,a0 as p,t as B,K as c,an as j,Z as Y,ag as V,_ as Z,ad as ie,M as q,aE as ke,am as P,ba as Te,L as Ae}from"../chunks/Bs3EBm-E.js";import{b as h,f as _,c as E,t as Ce}from"../chunks/D2Oxhlm5.js";import{a as x,f as Le,e as de}from"../chunks/4YDsmxP6.js";import{e as F,i as U,b as Ie,s as ue,c as xe,d as Ee}from"../chunks/De1QSCgL.js";import{e as se}from"../chunks/Bx3wK1xy.js";import{c as oe}from"../chunks/BkLDZTjO.js";import{s as re,p as O}from"../chunks/CSD_HoJp.js";import{s as me}from"../chunks/NZYRv9zf.js";import{b as Be,i as ee}from"../chunks/DJmFeHHs.js";import{c as Me}from"../chunks/Dsi64RsS.js";import{h as z}from"../chunks/l0FKtB1Q.js";import{b as Ge}from"../chunks/BFb_nG5W.js";import"../chunks/DyXMOwH3.js";var he={},ae={},te=34,K=10,ne=13;function ge(n){return new Function("d","return {"+n.map(function(e,a){return JSON.stringify(e)+": d["+a+'] || ""'}).join(",")+"}")}function Ne(n,e){var a=ge(n);return function(s,o){return e(a(s),o,n)}}function pe(n){var e=Object.create(null),a=[];return n.forEach(function(s){for(var o in s)o in e||a.push(e[o]=o)}),a}function I(n,e){var a=n+"",s=a.length;return s<e?new Array(e-s+1).join(0)+a:a}function De(n){return n<0?"-"+I(-n,6):n>9999?"+"+I(n,6):I(n,4)}function Oe(n){var e=n.getUTCHours(),a=n.getUTCMinutes(),s=n.getUTCSeconds(),o=n.getUTCMilliseconds();return isNaN(n)?"Invalid Date":De(n.getUTCFullYear())+"-"+I(n.getUTCMonth()+1,2)+"-"+I(n.getUTCDate(),2)+(o?"T"+I(e,2)+":"+I(a,2)+":"+I(s,2)+"."+I(o,3)+"Z":s?"T"+I(e,2)+":"+I(a,2)+":"+I(s,2)+"Z":a||e?"T"+I(e,2)+":"+I(a,2)+"Z":"")}function je(n){var e=new RegExp('["'+n+`
\r]`),a=n.charCodeAt(0);function s(t,d){var S,y,m=o(t,function(A,f){if(S)return S(A,f-1);y=A,S=d?Ne(A,d):ge(A)});return m.columns=y||[],m}function o(t,d){var S=[],y=t.length,m=0,A=0,f,k=y<=0,T=!1;t.charCodeAt(y-1)===K&&--y,t.charCodeAt(y-1)===ne&&--y;function D(){if(k)return ae;if(T)return T=!1,he;var W,H=m,L;if(t.charCodeAt(H)===te){for(;m++<y&&t.charCodeAt(m)!==te||t.charCodeAt(++m)===te;);return(W=m)>=y?k=!0:(L=t.charCodeAt(m++))===K?T=!0:L===ne&&(T=!0,t.charCodeAt(m)===K&&++m),t.slice(H+1,W-1).replace(/""/g,'"')}for(;m<y;){if((L=t.charCodeAt(W=m++))===K)T=!0;else if(L===ne)T=!0,t.charCodeAt(m)===K&&++m;else if(L!==a)continue;return t.slice(H,W)}return k=!0,t.slice(H,y)}for(;(f=D())!==ae;){for(var N=[];f!==he&&f!==ae;)N.push(f),f=D();d&&(N=d(N,A++))==null||S.push(N)}return S}function r(t,d){return t.map(function(S){return d.map(function(y){return i(S[y])}).join(n)})}function u(t,d){return d==null&&(d=pe(t)),[d.map(i).join(n)].concat(r(t,d)).join(`
`)}function g(t,d){return d==null&&(d=pe(t)),r(t,d).join(`
`)}function w(t){return t.map(l).join(`
`)}function l(t){return t.map(i).join(n)}function i(t){return t==null?"":t instanceof Date?Oe(t):e.test(t+="")?'"'+t.replace(/"/g,'""')+'"':t}return{parse:s,parseRows:o,format:u,formatBody:g,formatRows:w,formatRow:l,formatValue:i}}var qe=je(","),Fe=qe.parse,Ue=_('<section id="demo-link"><h2>Link</h2> <p><a href="elements">Default element styles demo</a></p> <p><a href="fonts">Pudding-hosted font previews</a></p> <p><a href="ui">BitsUI styled components</a></p></section>');function Re(n){var e=Ue();h(n,e)}var Pe=_('<section id="demo-image"><h2>Image</h2> <p>img tag</p> <img src="../assets/demo/test.jpg" alt="cat" class="svelte-b56t42"/> <p>background image</p> <div class="svelte-b56t42"></div></section>');function We(n){var e=Pe();h(n,e)}var He=_('<section id="demo-element"><h2>Dynamic Svelte Element</h2> <!></section>');function ze(n){const e=[{tag:"h3",text:"I am a h3 tag."},{tag:"p",text:"I am p tag."}];var a=He(),s=b(v(a),2);F(s,17,()=>e,U,(o,r)=>{let u=()=>c(r).tag,g=()=>c(r).text;var w=E(),l=C(w);se(l,u,!1,(i,t)=>{var d=Ce();B(()=>x(d,g())),h(t,d)}),h(o,w)}),p(a),h(n,a)}var Je=_("<p> </p>");function Ke(n,e){var a=Je(),s=v(a);p(a),B(()=>x(s,`I am component A and my favorite number is ${e.number??""}.`)),h(n,a)}var Ve=_("<p> </p>");function Ye(n,e){var a=Ve(),s=v(a);p(a),B(()=>x(s,`I am component B and my name is ${e.name??""}.`)),h(n,a)}var Ze=_('<section id="demo-component"><h2>Dynamic Svelte Component</h2> <!></section>');function Qe(n){const e={A:Ke,B:Ye},a=[{component:"A",number:42},{component:"B",name:"Russell"}];var s=Ze(),o=b(v(s),2);F(o,17,()=>a,U,(r,u)=>{const g=j(()=>e[c(u).component]);var w=E(),l=C(w);oe(l,()=>c(g),(i,t)=>{t(i,re(()=>c(u)))}),h(r,w)}),p(s),h(n,s)}var Xe=_("<div><!></div>");function $e(n,e){Y(e,!0);let a=O(e,"root",3,null),s=O(e,"top",3,0),o=O(e,"bottom",3,0),r=O(e,"increments",3,100),u=O(e,"value",15,void 0),g=[],w=[],l=[],i=[],t;function d(){let f=0,k=0;for(let T=0;T<g.length;T++)g[T]>f&&(f=g[T],k=T);f>0?u(k):u(void 0)}function S(f,k){const T=R=>{R[0].isIntersecting;const Q=R[0].intersectionRatio;g[k]=Q,d()},D=s()?s()*-1:0,N=o()?o()*-1:0,W=`${D}px 0px ${N}px 0px`,H={root:a(),rootMargin:W,threshold:w};i[k]&&i[k].disconnect();const L=new IntersectionObserver(T,H);L.observe(f),i[k]=L}function y(){l.length&&l.forEach(S)}V(()=>{for(let f=0;f<r()+1;f++)w.push(f/r());l=t.querySelectorAll(":scope > *:not(iframe)"),y()}),V(()=>{s(),o(),y()});var m=Xe(),A=v(m);me(A,()=>e.children??ie),p(m),Be(m,f=>t=f,()=>t),h(n,m),Z()}var ea=_('<div><p class="svelte-1sxgmm9"> </p></div>'),aa=_('<section id="scrolly"><h2 class="svelte-1sxgmm9">Scrolly <span> </span></h2> <div class="spacer svelte-1sxgmm9"></div> <!> <div class="spacer svelte-1sxgmm9"></div></section>');function ta(n){let e=P(void 0);var a=aa(),s=v(a),o=b(v(s)),r=v(o,!0);p(o),p(s);var u=b(s,4);$e(u,{get value(){return c(e)},set value(g){q(e,g,!0)},children:(g,w)=>{var l=E(),i=C(l);F(i,16,()=>[0,1,2,3,4],U,(t,d,S)=>{const y=j(()=>c(e)===S);var m=ea();let A;var f=v(m),k=v(f,!0);p(f),p(m),B(()=>{A=Ie(m,1,"step svelte-1sxgmm9",null,A,{active:c(y)}),x(k,d)}),h(t,m)}),h(g,l)},$$slots:{default:!0}}),ke(2),p(a),B(()=>x(r,c(e)||"-")),h(n,a)}const na=`{
  "meta": {
    "title": "From Goat to Despite",
    "description": "How the words we teach English language learners changed, and what that says about us"
  },
  "story": [
    {
      "type": "intro",
      "p1": "Look through the words scattered around this page. Every one of them is among the most commonly used words in the English language.",
      "p2": "They come from a 2023 list of about 2,800 words, shown to cover over 90% of general English use, intended for people learning the language."
    },
    {
      "type": "intro",
      "p1": "This 2023 list is an update of an earlier one, made in 1953, which identified about 2,300 words as the essential vocabulary to everyday life at the time."
    },
    {
      "type": "intro",
      "p1": "Between the two lists, 70 years apart, about 600 words were <span class=gsl>dropped,</span> and over 1,100 were <span class=ngsl>added.</span> The rest <span class=remained>remained</span> as is."
    },
    {
      "type": "intro",
      "p1": "Some of the changes make immediate sense: <span class=gsl>Telegraph</span> dropped out; <span class=ngsl>computer</span> was added, along with <span class=ngsl>website</span> and <span class=ngsl>blog.</span> <span class=gsl>Tobacco</span> was replaced by <span class=ngsl>cigarette.</span> <span class=gsl>Motherhood</span> became <span class=ngsl>mom,</span> and <span class=ngsl>dad</span> was added too, though <i>fatherhood</i> was never on the list to begin with. The world changed and vocabulary surely followed.",
      "p2": "But also: <span class=gsl>apple</span> didn’t make the new list. Neither did <span class=gsl>fork, soap, umbrella</span> or <span class=gsl>leaf,</span> for example. It’s not that these things vanished from everyday life, but many hands-on words became less central to the core vocabulary. <span class=remained>Dog</span> stayed; <span class=gsl>goat</span> and <span class=gsl>donkey</span> didn’t. <span class=remained>Bread</span> stayed; breadmaking ingredients—<span class=gsl>flour</span> and <span class=gsl>wheat</span>—dropped. <span class=remained>Cook</span> is on the new list. <span class=gsl>Boil, bake,</span> and <span class=gsl>fry</span> are not.",
      "p3": "And many of the words that were added, words such as <span class=ngsl>mortgage, corporation, appropriate, analysis, fairly,</span> and <span class=ngsl>despite,</span> don’t look anything like the ones that were discarded. In fact, they are mostly abstract concepts that don’t look like anything at all."
    },
    {
      "type": "title",
      "h1": "From Goat to Despite",
      "dek": "How the words we teach English language learners changed, and what that says about us",
      "byline": "By Jasmine Nackash"
    },
    {
      "type": "prose",
      "html": "<p>These “essential vocabulary” lists are called the <a href=https://en.wikipedia.org/wiki/General_Service_List target=_blank>General Service List</a> (1953) and the <a href=https://en.wikipedia.org/wiki/New_General_Service_List target=_blank>New General Service List</a> (2013, revised in 2023).</p>\\r\\n\\r\\n\\r\\n<p>They were designed as teaching tools for people learning English as a second language, built from real-world usage data and extensively tested. The aim was a vocabulary list with as few words and as much coverage of everyday English usage as possible. That coverage is high. Over 90% for the 2023 list<sup>[1]</sup> and about 84% for the 1953 list.<sup>[2]</sup> To account for that much of the language, they had to track a significant portion of whatever people were actually reading and saying. A word earned its place by appearing often enough, across enough contexts, to be hard to avoid for the average person in an English-speaking society.</p>\\r\\n\\r\\n\\r\\n<p>While these were practical tools, built to capture which words people need most, the answer also doubles as a snapshot of ordinary life, seventy years apart: what people were expected to engage with, and had to deal with, in their daily lives.</p>\\r\\n\\r\\n\\r\\n<p>Treating the lists as this indirect record of the day-to-day, I went through the differences between them from a few angles: what the words were about, how tangible they were, and what parts of speech they belonged to.</p>\\r\\n\\r\\n\\r\\n<h2 class=section-header>The Expanding World</h2>\\r\\n<p>First, I started by running all the words through a tool that sorts words by meaning,<sup>[3]</sup> common in linguistics research. It assigns each word to one of 21 subject categories, based on typical usage: Food and Farming, the Body and the Self, Government and Public, Language and Communication, and so on. Together, they suggest what kind of world each list was built for.</p>"
    },
    {
      "type": "chart",
      "chartId": "semanticsSlopegraph",
      "title": "The New List Devotes More Space to Abstract Concepts, and Less to the Physical World.",
      "titleOld": "Less About Objects and Feelings. More About Abstract Ideas and Mental Processes.",
      "subhead": "Each band is one of 21 semantic categories, sized and sorted by its share of each list.",
      "note": "Data source: all words run through the UCREL Semantic Analysis System (USAS).",
      "overlays": [
        {
          "label": "Overlay 1 – focus on abstract band",
          "focusCategories": "General and Abstract Terms",
          "html": "The biggest category in the 1953 list was already General & Abstract Terms, with words such as <span class=remained>maybe, discover, regular, important,</span> and <span class=remained>success.</span> The world, by 2023, needed even more of it: the abstract category grew by about 28%, adding words such as <span class=ngsl>possibility, responsibility, concept, justify,</span> and <span class=ngsl>perspective.</span>"
        },
        {
          "label": "Overlay 2 – focus on drops",
          "focusCategories": "Substances, Materials, Objects and Equipment | Emotion | The Body and the Individual | Food and Farming",
          "html": "The sharpest drops were in the most tangible categories: Substances & Objects, the Body & the Individual, Food & Farming, Life & Living Things. Words such as <span class=gsl>clay, corn, hammer, beard, towel,</span> and <span class=gsl>weave</span>—words for what you grow, make, and hold in your hand—all thinned out."
        },
        {
          "label": "Overlay 3 – focus on Psych Processes vs. Emotion",
          "focusCategories": "Emotion | Psychological Actions, States and Processes",
          "html": "While words for emotions shrank by 1.8 percentage points, words for psychological processes grew just as much. Plain sentiments such as <span class=remained>happy, sad, afraid,</span> and <span class=remained>angry</span> stayed. But the vocabulary of inner life dropped words for feelings such as <span class=gsl>patience, pity, despair,</span> and <span class=gsl>sorrow,</span> and picked up more words for thinking: <span class=ngsl>focus, judgment, investigate, and logic.</span>"
        }
      ]
    },
    {
      "type": "prose",
      "html": "<p>The categories that shrank are mostly those that have to do with the immediate, physical world, while the gains are those furthest from it.</p>\\r\\n<p>To better see this, the categories can be oriented spatially. Some categories describe you: your body and emotions. Some describe what’s immediately around you: food, objects, and the natural world. Others name systems you participate in: government, institutions, society, and culture. And some have no location at all: abstract concepts, reasoning, and processes.  Grouped by <i>physical scope,</i> the pattern of change seems to point in a specific direction.</p>"
    },
    {
      "type": "chart",
      "chartId": "semanticsScopeArcs",
      "title": "The Vocabulary Moved Outward",
      "subhead": "21 semantic categories, grouped by their scale of reach: the self, the immediate world, institutions, social life and communication, and abstract terms.",
      "note": "Data source: all words run through the UCREL Semantic Analysis System (USAS), then grouped into five umbrella-term domains: <ol class=note-list> <li class=note-list-item><b>The Self:</b> Emotion | The Body and the Individual</li> <li class=note-list-item><b>Local/Immediate:</b> Substances, Materials, Objects and Equipment | Food and Farming | Life and Living Things | Architecture, Housing and the Home | World and Environment</li> <li class=note-list-item><b>Institutional:</b> Money and Commerce in Industry | Government and Public | Education | Science and Technology</li> <li class=note-list-item><b>Social/Communicative:</b> Social Actions, States, and Processes | Movement, Location, Travel and Transport | Language and Communication | Entertainment, Sports and Games | Arts and Crafts</li> <li class=note-list-item><b>Universal/Abstract:</b> General and Abstract Terms | Psychological Actions, States and Processes | Numbers and Measurement | Names and Grammar | Time</li> </ol>",
      "overlays": [
        {
          "label": "Overlay 1 – focus on the self",
          "html": "The 2023 list has fewer words relating to the self. Among what was removed: <span class=gsl>ache, wrist, comb, razor, shave, soap. Courage, greed, loyalty, mercy, shame.</span> What was added reads differently: <span class=ngsl>cancer, clinical, disorder, gene, surgery, therapy, treatment.</span> The words shifted from describing something you inhabit to describing something you manage."
        },
        {
          "label": "Overlay 2 – focus on local/immediate",
          "html": "The “local” level shrank too. Some of what was removed: <span class=gsl>donkey, elephant, goat,</span> and <span class=gsl>pigeon. Bake, butter, harvest,</span> and <span class=gsl>roast. Bay, cliff, moonlight,</span> and <span class=gsl>tide.</span> That’s the immediate world, the one within reach. And what was added: <span class=ngsl>climate, environment, organic, solar,<span> and <span class=ngsl>pollution</span>—words for the world as a system."
        },
        {
          "label": "Overlay 3 – focus on institutional",
          "html": "Within the “institutional” level, words that were removed include: <span class=gsl>merchant, salesman, bargain, treasury, calculator,</span> and <span class=gsl>inventor.</span> Among what was added: <span class=ngsl>corporation, budget, mortgage, unemployment, pension, legislation, regulation, democracy,</span> and <span class=ngsl>voter.</span> It still names jobs, money, and the state, but the vocabulary sounds less like storefronts and ledgers, and more like filings, markets, and processes."
        },
        {
          "label": "Overlay 4 – focus on social/communication",
          "html": "The “Social & Communication” level barely changed in size. But nearly a quarter of the words in the 1953 list are gone, and 39% of the 2023 words are new. <span class=gsl>Humble, loyalty, fellowship, generous, polite,</span> and <span class=gsl>companionship</span> gave way to <span class=ngsl>community, identity, organization, ethnic, gender,</span> and <span class=ngsl>narrative.</span> The social world shifted from something you navigate through personal relationships to something with which you identify through categories. It offers fewer words for the people directly around you, but more for belonging at a distance."
        },
        {
          "label": "Overlay 5 – focus on universal/abstract (zoomed out)",
          "html": "The outermost level, which contains words that don’t belong in any specific domain, grew the most. The words that were added point to a different kind of abstraction, one that’s about ideas just as much as the tools for evaluating and organizing them: <span class=ngsl>Analysis, assumption, criteria, hypothesis, method, perspective, procedure, strategy.</span>"
        }
      ]
    },
    {
      "type": "prose",
      "html": "<p>In hindsight, the shift makes sense. By 1957, four years after the original list was published, <a href=https://time.com/archive/6613167/new-problem-for-unions-the-rise-of-the-white-collar-worker/ target=_blank>white-collar workers outnumbered blue-collar for the first time in US history.</a> And by 2000, <a href=https://www.bls.gov/opub/mlr/2006/03/art3full.pdf target=_blank>fewer than one in four workers did manual labor.</a> The stuff people encountered in their daily lives, what they needed to talk about, and the systems they had to navigate all changed.</p>\\r\\n\\r\\n\\r\\n<p>The vocabulary lists, built from the language of their respective eras, tracked those changes. The shifts reflect a life that got further from its own making: less tied to tools, animals, food, and the body; more tied to national or global institutions, categories, systems, and ideas.</p>\\r\\n\\r\\n\\r\\n<p>The new vocabulary—<span class=ngsl>mortgage, legislation, perspective, involvement, improvement, assumption, evaluation</span>—are words you can’t weigh, point to, or hold in your hand. These words shape your life, but they do it without ever occupying any physical space.</p>\\r\\n\\r\\n\\r\\n<h2 class=section-header>Harder to Picture</h2>\\r\\n\\r\\n\\r\\n<p>To better understand whether there was a shift in vocabulary describing the physical world, I compared each word to a database that rates the tangibility of words<sup>[4]</sup>, on a scale of 1 to 5 (called a “concreteness rating”). A rating of 5 means you can experience the word directly with your senses, while a rating of 1 means you can't.</p>"
    },
    {
      "type": "chart",
      "chartId": "concretenessDistribution",
      "title": "More Abstract Words, Fewer Concrete Ones",
      "subhead": "Concreteness ratings of both lists, from abstract (1) to concrete (5).",
      "annotation": "The <span class=annotation>highly concrete end</span> dropped the most: from 21% of the total in 1953 down to 14% in 2023."
    },
    {
      "type": "prose",
      "html": "<p>This shift matters because abstract and concrete words are processed by our brains in different ways. When you read <span class=gsl>axe,</span> your brain doesn’t just decode letters, it reaches for something: an image, a weight, or a gesture. The word activates both a verbal label and a sensory trace. Psychologists call this dual coding<sup>[5]</sup>: Concrete words travel through two channels, verbal and sensory; abstract words travel through one. Two channels mean two retrieval pathways, which is why concrete words are “stickier,” easier to hold in a line of thought and faster to recall. Abstract words, on the other hand, are purely verbal, and have to be understood through language alone.</p>\\r\\n\\r\\n\\r\\n<p>To put it another way: Concrete words are easier for us to process because they are bundled with a web of associations, tactile experiences, and memories that anchor their meaning. Here’s a more detailed view of the shift away from concrete language: </p>"
    },
    {
      "type": "chart",
      "chartId": "concretenessBands",
      "title": "The Concrete End Got Hollowed Out. Something Murkier Filled In.",
      "note": "Data source: Brysbaert Concreteness ratings for 40 thousand generally known English word lemmas. The dataset provided 99.8% coverage of the words in both lists. 6 words not in the dataset are not included in this chart: <i>as, dialog, english, gaiety, madden, old-fashioned.</i>",
      "overlays": [
        {
          "label": "Overlay 1 – focus on band 4.5–5 (most concrete)",
          "html": "More than a quarter of all the words that were removed scored as the most concrete. Only 7.4% of words added scored that high. <span class=gsl>Rust, brick, silk, screw,</span> and <span class=gsl>cage</span> all were discarded. Instead, <span class=ngsl>magazine, jail, apartment, bomb,</span> and <span class=ngsl>guitar</span> were added."
        },
        {
          "label": "Overlay 2 – focus on bands 2–2.5 (mid-abstract)",
          "html": "Nearly a quarter of all added words land in the middle, not quite picturable, but not entirely vague either—words such as <span class=ngsl>regulation, reform, cooperation, obligation, initiative, negotiate,</span> and <span class=ngsl>perception.</span> For comparison, the discarded words that have a similar score include: <span class=gsl>shame, convenience, spite, fellowship, companionship.</span>"
        },
        {
          "label": "Overlay 3 – focus on bands 1–2",
          "html": "Among the removed abstract words: <span class=gsl>courage, wisdom, mercy, loyalty, greed, fate, revenge,</span> and <span class=gsl>honesty…</span> Abstract, yes, yet carrying emotions grounded in experience. You can’t point to <span class=gsl>mercy</span> but you’ve felt it. The abstract words that were added are nothing like that: <span class=ngsl>interpretation, involvement, theoretical, somewhat, evaluate, justify.</span> They describe how things are structured and how processes unfold. They are language-based, through and through."
        }
      ]
    },
    {
      "type": "prose",
      "html": "<p> Because concrete words carry their meaning in themselves, with sensory grounding, abstract words rely on other parts of speech to specify, soften, or sharpen what they mean. That help tends to come from one particular corner of the language: adverbs.</p>\\r\\n <h2 class=section-header>How Much, How Often, How Certain</h2>"
    },
    {
      "type": "chart",
      "chartId": "posDiagram",
      "title": "Nouns Still Dominate Both Lists, Verbs Remained Steady, and Adjectives Grew Modestly. Adverbs, However, Nearly Doubled.",
      "subhead": "Each square is one word, grouped by part-of-speech in each list. Hover the cells to see the words.",
      "note": "The 2023 list contains more words overall (2,809 vs. 2,284). All changes mentioned in the text reflect each category's share of its list, not raw counts. Data source: NLTK (Natural Language Toolkit), with manual correction of mislabeled words."
    },
    {
      "type": "prose",
      "html": "<p><span class=gsl>Axe</span> doesn’t need an adverb to modify it; you know what it is. But <span class=ngsl>acceptable, relevant,</span> and <span class=ngsl>adequate</span> come with conditions, qualifications, and degrees that need to be spelled out. Adverbs do precisely that: language to calibrate language. \\r\\n<br>Look through all the adverbs that were added:</p>"
    },
    {
      "type": "chart",
      "chartId": "adverbsAdded"
    },
    {
      "type": "prose",
      "html": "<p>Most of the adverbs specify degree, frequency, certainty, and extent. Some hedge <span class=ngsl>(somewhat, partly, relatively, possibly, approximately).</span> Others assert <span class=ngsl>(absolutely, definitely, entirely, exactly, precisely).</span> They're all doing the same kind of work: Take a statement and tell you how much of it is true, how often, and how certain. It’s as if the world now requires you to be more precise about everything.</p>\\r\\n\\r\\n\\r\\n<h2 class=section-header>Further</h2>\\r\\n<p><span class=remained>Bread</span> survived both lists. <span class=gsl>Flour, wheat, harvest</span> and <span class=gsl>bake</span> didn’t. The word for what sustains us remained essential, while the words for how we’d make it weren’t. That might be the most honest summary of what happened.</p>\\r\\n\\r\\n\\r\\n<p>The world that made the 2023 list is more regulated, more connected, and in many ways more capable than the one behind the 1953 list. It’s a world further than our kitchen or home, reaching across economies, institutions, and democracies. <br>Today's vocabulary reflects a life that is less self-contained and more systemic. It’s less about what’s within arm’s reach, and more about the larger world we navigate through. That sort of long-distance connection requires a particular kind of language: expansive, abstract, and precise. And language, it turns out, can’t help itself. It keeps track.</p>"
    }
  ],
  "notes": [
    {
      "type": "notes",
      "title": "Methodology & notes",
      "intro": [
        {
          "html": "<p>I compared two prominent vocabulary lists for English learners: the General Service List (GSL, 1953; 2,284 words) and the New General Service List (NGSL 1.2, 2023; 2,809 words). I labeled words appearing on both lists as “remained” (1,656), words only on the 1953 list as “removed” (628), and words only on the 2023 list as “added” (1,153).</p>\\r\\n\\r\\n\\r\\n<p>The GSL words came from the <a href=https://simple.wiktionary.org/wiki/Wiktionary:General_Service_List target=_blank>Simple English Wiktionary GSL</a>. The NGSL words came from the <a href=https://www.newgeneralservicelist.com/new-general-service-list#:~:text=NGSL%201.2%20alphabetized%20and%20lemmatized%20for%20research target=_blank>official NGSL 1.2 file</a> (“alphabetized and lemmatized for research”).\\r\\nThe NGSL uses lemmas (one entry per word family); the GSL sometimes lists inflected forms as separate headwords. These lists track word forms deemed worth teaching based on frequency and usefulness, not abstract concepts. For example, the word <i>being</i> is on the GSL as its own headword and was not included in the NGSL. This doesn’t mean the concept of existence left the language. In the NGSL it falls under <i>be</i>, which stayed on both lists.</p>"
        }
      ],
      "drawer": [
        {
          "question": "Why treat the lists as a portrait of everyday English?",
          "html": "<p>Both lists were built for teaching, but external research suggests each covers a large share of everyday language use. About 84% of general English for the GSL and about 90% for the NGSL, depending on the text and how words are counted. I did not re-run those corpus analyses myself. I take the published materials as given and rely on coverage figures from the list authors and from follow-up studies (including an independent check on American English by Stoeckel, 2019 – see footnotes). That’s why the differences between the lists felt worth examining as more than a curriculum update, with the caveat that neither list is a neutral census of culture.</p>"
        },
        {
          "question": "Where can I find the data?",
          "html": "<p>All tagged words: remained, removed, and added, with semantic tags, concreteness ratings, and part-of-speech labels are in <a href=https://docs.google.com/spreadsheets/d/1Ems0-q7hRNolEl9E4NF_IsLY5_UvfoooyD80NnHuQPY/edit?usp=sharing target=_blank>this public spreadsheet</a>. You can also browse the word lists in the word-list panel on the right side of this page.</p>"
        },
        {
          "question": "How did I sort words by meaning?",
          "html": "<p>Each word was tagged with the UCREL Semantic Analysis System (USAS), using the 21 top-level categories. USAS also assigns much finer <a href=https://ucrel.lancs.ac.uk/usas/semtags_subcategories.txt target=_blank>sub-categories</a> (there are hundreds), but I stayed at the top level so the charts could show broad shifts without splitting the story into overly granular bins.</p>\\r\\n\\r\\n\\r\\n<p>I chose not to correct mislabels. For example, <i>hammer, nail,</i> and <i>wax</i> are all tagged “General and Abstract Terms”, but in USAS’s finer tags, they read as actions (“to hammer,” “to nail,” “to wax”), not objects. Out of context, many of these words go multiple ways, and it didn’t feel right to override that case by case; USAS is an established linguistic framework, and swapping in my own judgment would mix two different standards.</p>\\r\\n\\r\\n\\r\\n<p>For the second chart, I grouped USAS’s 21 categories into five “scope” domains (self, local, institutional, social, abstract). That grouping is my editorial choice, not part of USAS. It came from noticing a spatial quality to the trends seen across the 21 categories.</p>"
        },
        {
          "question": "How did I measure concreteness?",
          "html": "<p>Concreteness ratings come from Brysbaert et al. (2014). I used these as-is. Six words weren’t in the database and were left out of the concreteness charts: <i>as, dialog, english, gaiety, madden,</i> and <i>old-fashioned.</i></p>"
        },
        {
          "question": "How did I tag parts of speech?",
          "html": "<p>Parts of speech were tagged with NLTK, simplified to five categories. Here I did intervene, but only when a word was clearly mislabeled (132 words, 3.8% of the list; mostly adjectives mislabeled as nouns). When a word can act as more than one part of speech depending on context, I left the tag as-is and deferred to NLTK as the established framework, using the primary, most common label. Here I also used an LLM strictly to help flag potential errors in NLTK’s output.</p>"
        },
        {
          "question": "What are the limitations?",
          "html": "<p>Both lists rank words by frequency, then apply learner-focused curation. Michael West’s 1953 list especially reflects period pedagogy. He favored general-purpose vocabulary over emotional or highly specific words, not just whatever appeared most often (Therova, 2020, summarizing West, 1953, pp. ix–x). Some of what looks like “1950s life” may also be how mid-century ESL teaching filtered the language. I still treat the lists as a portrait of everyday English because both cover a large share of running text and speech that goes well beyond the classroom.</p>"
        },
        {
          "question": "Footnotes",
          "html": "<ol>\\r\\n<li>On NGSL’s ~90% coverage: <a href=https://www.newgeneralservicelist.com/new-general-service-list target=_blank>Browne, Culligan & Phillips, NGSL project.</a> See also: <a href=https://vli-journal.org/issues/03.2/vli.v03.2.browne.pdf target=_blank>A New General Service List: The Better Mousetrap We’ve Been Looking for?</a>, Browne (2014); and <a href=https://files.eric.ed.gov/fulltext/EJ1472477.pdf target=_blank>An Examination of the New General Service List</a>, Stoeckel (2019).</li>\\r\\n<li>On GSL’s ~84% coverage: <i>A general service list of English words with semantic frequencies,</i> West (1953); <a href=https://www.cambridge.org/elt/blog/2018/05/29/general-service-list/ target=_blank>The New General Service List: A core vocabulary for EFL students and teachers</a>, Cambridge ELT (2018).</li>\\r\\n<li><a href=https://ucrel.lancs.ac.uk/usas/ target=_blank>UCREL: Semantic Analysis System (USAS)</a>.</li>\\r\\n<li><a href=https://link.springer.com/article/10.3758/s13428-013-0403-5 target=_blank>Concreteness ratings for 40 thousand generally known English word lemmas</a>, Brysbaert, M., Warriner, A. B., & Kuperman, V. (2014). Behavior Research Methods, 46, 904–911.</li>\\r\\n<li><a href=https://link.springer.com/article/10.3758/BF03331011 target=_blank>Why are pictures easier to recall than words?</a> Paivio, A., Rogers, T.B. & Smythe, P.C. Psychon Sci 11, 137–138 (1968).</li>\\r\\n</ol>"
        }
      ]
    }
  ]
}`;var sa=_("<p></p>"),oa=_('<details><summary></summary> <div class="content"><!></div></details>');function ra(n,e){let a=j(()=>typeof e.content=="string"),s=j(()=>e.open==="true");var o=oa(),r=v(o);z(r,()=>e.summary,!0),p(r);var u=b(r,2),g=v(u);{var w=i=>{var t=E(),d=C(t);z(d,()=>e.content),h(i,t)},l=i=>{var t=E(),d=C(t);F(d,17,()=>e.content,U,(S,y)=>{let m=()=>c(y).value;var A=sa();z(A,m,!0),p(A),h(S,A)}),h(i,t)};ee(g,i=>{c(a)?i(w):i(l,-1)})}p(u),p(o),B(()=>{o.open=c(s),ue(o,"name",e.name)}),h(n,o)}var ia=_("<li></li>"),la=_("<ul></ul>");function ca(n,e){var a=la();F(a,21,()=>e.li,U,(s,o)=>{var r=ia();z(r,()=>c(o),!0),p(r),h(s,r)}),p(a),h(n,a)}var da=_("<li></li>"),ha=_("<ol></ol>");function pa(n,e){var a=ha();F(a,21,()=>e.li,U,(s,o)=>{var r=da();z(r,()=>c(o),!0),p(r),h(s,r)}),p(a),h(n,a)}var ua=_("<p></p>"),ma=_("<section><!></section>");function ga(n,e){Y(e,!0);const a={details:ra,ul:ca,ol:pa};let s=O(e,"components",19,()=>({})),o=O(e,"body",19,()=>[]);var r=E(),u=C(r);F(u,17,o,U,(g,w)=>{let l=()=>c(w).section,i=()=>c(w).content;const t=j(()=>l().toLowerCase().replace(/[^a-z0-9]/g,"")),d=j(()=>s()[l()]);var S=ma(),y=v(S);{var m=f=>{var k=E(),T=C(k);oe(T,()=>c(d),(D,N)=>{N(D,re(i))}),h(f,k)},A=f=>{var k=E(),T=C(k);F(T,17,i,U,(D,N,W,H)=>{let L=()=>c(N).type,R=()=>c(N).value;const Q=j(()=>s()[L()]||a[L()]),fe=j(()=>typeof R()=="string");var le=E(),ve=C(le);{var we=M=>{var G=E(),J=C(G);oe(J,()=>c(Q),(X,$)=>{$(X,re(R))}),h(M,G)},ye=M=>{var G=ua();z(G,R,!0),p(G),h(M,G)},be=M=>{var G=E(),J=C(G);se(J,L,!1,(X,$)=>{var ce=E(),Se=C(ce);z(Se,R),h($,ce)}),h(M,G)},_e=M=>{var G=E(),J=C(G);se(J,L,!1,(X,$)=>{xe(X,()=>({...R()}))}),h(M,G)};ee(ve,M=>{c(Q)?M(we):L()==="text"?M(ye,1):c(fe)?M(be,2):M(_e,-1)})}h(D,le)}),h(f,k)};ee(y,f=>{c(d)?f(m):f(A,-1)})}p(S),B(()=>ue(S,"id",c(t))),h(g,S)}),h(n,r),Z()}var fa=_('<p> </p> <progress max="100"></progress>',1);function va(n,e){let a=O(e,"label",3,"A"),s=O(e,"value",3,0);var o=fa(),r=C(o),u=v(r,!0);p(r);var g=b(r,2);B(()=>{x(u,a()),Ee(g,s())}),h(n,o)}var wa=_('<section id="cms"><h2>MicroCMS</h2> <code><pre> </pre></code> <!></section>');function ya(n,e){Y(e,!0);const{body:a}=Me,s={Test:va};var o=wa(),r=b(v(o),2),u=v(r),g=v(u,!0);p(u),p(r);var w=b(r,2);ga(w,{get components(){return s},get body(){return a}}),p(o),B(l=>x(g,l),[()=>na.replace(/\t/g," ")]),h(n,o),Z()}const ba=(n,e=ie)=>{var a=_a(),s=v(a),o=v(s,!0);p(s);var r=b(s,2),u=v(r,!0);p(r),p(a),B(()=>{x(o,e().name),x(u,e().age)}),h(n,a)};var _a=_('<div class="person svelte-q3gttf"><p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p></div>'),Sa=_('<h2>Svelte5</h2> <h3>Reactive variables 3 ways:</h3> <button class="svelte-q3gttf">count++</button> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <h3>Children (previously slots):</h3> <div class="children"><!></div> <h3>Dispatch Event</h3> <button class="svelte-q3gttf">Random</button>  <h3>Snippets</h3> <div class="people svelte-q3gttf"></div>',1);function ka(n,e){Y(e,!0),O(e,"age",3,30);const a=[{name:"John",age:30},{name:"Jill",age:45}];let s=P(0),o=j(()=>c(s)*2),r=j(()=>c(s)*2),u=P(0);V(()=>{q(u,c(s)*2)});var g=Sa(),w=b(C(g),4),l=b(w,2),i=v(l);p(l);var t=b(l,2),d=v(t);p(t);var S=b(t,2),y=v(S);p(S);var m=b(S,4),A=v(m);me(A,()=>e.children??ie),p(m);var f=b(m,4),k=b(f,4);F(k,21,()=>a,U,(T,D)=>{ba(T,()=>c(D))}),p(k),B(()=>{x(i,`${c(s)??""} doubled is ${c(o)??""} (derived)`),x(d,`${c(s)??""} doubled is ${c(r)??""} (derived by)`),x(y,`${c(s)??""} doubled is ${c(u)??""} ($effect)`)}),de("click",w,()=>Te(s)),de("click",f,()=>e.random(Math.floor(Math.random()*10))),h(n,g),Z()}Le(["click"]);const Ta=(n,e)=>{let a=P(Ae(n)),s=P(null),o=P(!0),r=P(void 0);const u=(l=!0)=>{q(o,l,!0),l===!0&&(q(r,null),q(s,null))},g=async()=>{try{const l=await fetch(c(a),e);if(!l.ok)throw new Error(`Unexpected error occurred (status ${l.status})`);let i;if(c(a).includes(".csv")){const t=await l.text();i=Fe(t)}else i=await l.json();return[null,i]}catch(l){const{errorMessage:i="Unexpected error eccurred"}=l;return[i,null]}},w=async l=>{u(!0);const[i,t]=await g();if(l===c(a)){if(i){u(!1),q(r,i,!0);return}u(!1),q(s,t,!0)}};return V(()=>{w(c(a))}),{get data(){return c(s)},get loading(){return c(o)},get error(){return c(r)},get url(){return c(a)},set url(l){c(a)!==l&&q(a,l,!0)}}};var Aa=_("<p>loading data...</p>"),Ca=_("<p> </p>"),La=_("<p>data loaded</p> <pre> </pre>",1),Ia=_('<div class="c"><h2>Load Data</h2> <div class="response"><!></div></div>');function xa(n,e){Y(e,!0);const a=`${Ge}/assets/demo/test.csv`,s=Ta(a);V(()=>{});var o=Ia(),r=b(v(o),2),u=v(r);{var g=i=>{var t=Aa();h(i,t)},w=i=>{var t=Ca(),d=v(t);p(t),B(()=>x(d,`error: ${s.error??""}`)),h(i,t)},l=i=>{var t=La(),d=b(C(t),2),S=v(d,!0);p(d),B(y=>x(S,y),[()=>JSON.stringify(s.data,null,2)]),h(i,t)};ee(u,i=>{s.loading?i(g):s.error?i(w,1):i(l,-1)})}p(r),p(o),h(n,o),Z()}var Ea=_('<div id="demo" class="svelte-15aotx7"><h1>Demo</h1> <!> <!> <!> <!> <!> <!> <!> <!></div>');function Ba(n){let e=P(0);function a(d){console.log(d)}var s=Ea(),o=b(v(s),2);Re(o);var r=b(o,2);We(r);var u=b(r,2);ze(u);var g=b(u,2);Qe(g);var w=b(g,2);ya(w,{});var l=b(w,2);xa(l,{});var i=b(l,2);ta(i);var t=b(i,2);ka(t,{random:a,get value(){return c(e)},set value(d){q(e,d,!0)}}),p(s),h(n,s)}function Ja(n){Ba(n)}export{Ja as component};
