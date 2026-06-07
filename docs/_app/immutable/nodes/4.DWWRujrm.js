import"../chunks/DsnmJJEf.js";import{al as b,$ as f,a1 as A,a0 as p,t as O,K as c,an as q,Z as Y,ag as Z,_ as K,ad as ie,M as N,aE as ke,am as G,ba as Se,L as Ce}from"../chunks/Bs3EBm-E.js";import{b as h,f as _,c as D,t as Ae}from"../chunks/D2Oxhlm5.js";import{a as E,f as Ie,e as de}from"../chunks/4YDsmxP6.js";import{e as R,i as U,b as xe,s as ue,c as Ee,d as De}from"../chunks/De1QSCgL.js";import{e as se}from"../chunks/Bx3wK1xy.js";import{c as oe}from"../chunks/BkLDZTjO.js";import{s as re,p as F}from"../chunks/CSD_HoJp.js";import{s as me}from"../chunks/NZYRv9zf.js";import{b as Oe,i as ee}from"../chunks/DJmFeHHs.js";import{c as Me}from"../chunks/B5ZCOvXe.js";import{h as z}from"../chunks/l0FKtB1Q.js";import{b as Le}from"../chunks/DCOj1SAi.js";import"../chunks/tGppMfpQ.js";var he={},ae={},te=34,V=10,ne=13;function ge(n){return new Function("d","return {"+n.map(function(e,a){return JSON.stringify(e)+": d["+a+'] || ""'}).join(",")+"}")}function Be(n,e){var a=ge(n);return function(s,o){return e(a(s),o,n)}}function pe(n){var e=Object.create(null),a=[];return n.forEach(function(s){for(var o in s)o in e||a.push(e[o]=o)}),a}function x(n,e){var a=n+"",s=a.length;return s<e?new Array(e-s+1).join(0)+a:a}function je(n){return n<0?"-"+x(-n,6):n>9999?"+"+x(n,6):x(n,4)}function Fe(n){var e=n.getUTCHours(),a=n.getUTCMinutes(),s=n.getUTCSeconds(),o=n.getUTCMilliseconds();return isNaN(n)?"Invalid Date":je(n.getUTCFullYear())+"-"+x(n.getUTCMonth()+1,2)+"-"+x(n.getUTCDate(),2)+(o?"T"+x(e,2)+":"+x(a,2)+":"+x(s,2)+"."+x(o,3)+"Z":s?"T"+x(e,2)+":"+x(a,2)+":"+x(s,2)+"Z":a||e?"T"+x(e,2)+":"+x(a,2)+"Z":"")}function qe(n){var e=new RegExp('["'+n+`
\r]`),a=n.charCodeAt(0);function s(t,d){var T,w,m=o(t,function(C,v){if(T)return T(C,v-1);w=C,T=d?Be(C,d):ge(C)});return m.columns=w||[],m}function o(t,d){var T=[],w=t.length,m=0,C=0,v,k=w<=0,S=!1;t.charCodeAt(w-1)===V&&--w,t.charCodeAt(w-1)===ne&&--w;function j(){if(k)return ae;if(S)return S=!1,he;var H,W=m,I;if(t.charCodeAt(W)===te){for(;m++<w&&t.charCodeAt(m)!==te||t.charCodeAt(++m)===te;);return(H=m)>=w?k=!0:(I=t.charCodeAt(m++))===V?S=!0:I===ne&&(S=!0,t.charCodeAt(m)===V&&++m),t.slice(W+1,H-1).replace(/""/g,'"')}for(;m<w;){if((I=t.charCodeAt(H=m++))===V)S=!0;else if(I===ne)S=!0,t.charCodeAt(m)===V&&++m;else if(I!==a)continue;return t.slice(W,H)}return k=!0,t.slice(W,w)}for(;(v=j())!==ae;){for(var B=[];v!==he&&v!==ae;)B.push(v),v=j();d&&(B=d(B,C++))==null||T.push(B)}return T}function r(t,d){return t.map(function(T){return d.map(function(w){return i(T[w])}).join(n)})}function u(t,d){return d==null&&(d=pe(t)),[d.map(i).join(n)].concat(r(t,d)).join(`
`)}function g(t,d){return d==null&&(d=pe(t)),r(t,d).join(`
`)}function y(t){return t.map(l).join(`
`)}function l(t){return t.map(i).join(n)}function i(t){return t==null?"":t instanceof Date?Fe(t):e.test(t+="")?'"'+t.replace(/"/g,'""')+'"':t}return{parse:s,parseRows:o,format:u,formatBody:g,formatRows:y,formatRow:l,formatValue:i}}var Ne=qe(","),Re=Ne.parse,Ue=_('<section id="demo-link"><h2>Link</h2> <p><a href="elements">Default element styles demo</a></p> <p><a href="fonts">Pudding-hosted font previews</a></p> <p><a href="ui">BitsUI styled components</a></p></section>');function Pe(n){var e=Ue();h(n,e)}var Ge=_('<section id="demo-image"><h2>Image</h2> <p>img tag</p> <img src="../assets/demo/test.jpg" alt="cat" class="svelte-b56t42"/> <p>background image</p> <div class="svelte-b56t42"></div></section>');function He(n){var e=Ge();h(n,e)}var We=_('<section id="demo-element"><h2>Dynamic Svelte Element</h2> <!></section>');function ze(n){const e=[{tag:"h3",text:"I am a h3 tag."},{tag:"p",text:"I am p tag."}];var a=We(),s=b(f(a),2);R(s,17,()=>e,U,(o,r)=>{let u=()=>c(r).tag,g=()=>c(r).text;var y=D(),l=A(y);se(l,u,!1,(i,t)=>{var d=Ae();O(()=>E(d,g())),h(t,d)}),h(o,y)}),p(a),h(n,a)}var Je=_("<p> </p>");function Ve(n,e){var a=Je(),s=f(a);p(a),O(()=>E(s,`I am component A and my favorite number is ${e.number??""}.`)),h(n,a)}var Ze=_("<p> </p>");function Ye(n,e){var a=Ze(),s=f(a);p(a),O(()=>E(s,`I am component B and my name is ${e.name??""}.`)),h(n,a)}var Ke=_('<section id="demo-component"><h2>Dynamic Svelte Component</h2> <!></section>');function Qe(n){const e={A:Ve,B:Ye},a=[{component:"A",number:42},{component:"B",name:"Russell"}];var s=Ke(),o=b(f(s),2);R(o,17,()=>a,U,(r,u)=>{const g=q(()=>e[c(u).component]);var y=D(),l=A(y);oe(l,()=>c(g),(i,t)=>{t(i,re(()=>c(u)))}),h(r,y)}),p(s),h(n,s)}var Xe=_("<div><!></div>");function $e(n,e){Y(e,!0);let a=F(e,"root",3,null),s=F(e,"top",3,0),o=F(e,"bottom",3,0),r=F(e,"increments",3,100),u=F(e,"value",15,void 0),g=[],y=[],l=[],i=[],t;function d(){let v=0,k=0;for(let S=0;S<g.length;S++)g[S]>v&&(v=g[S],k=S);v>0?u(k):u(void 0)}function T(v,k){const S=P=>{P[0].isIntersecting;const Q=P[0].intersectionRatio;g[k]=Q,d()},j=s()?s()*-1:0,B=o()?o()*-1:0,H=`${j}px 0px ${B}px 0px`,W={root:a(),rootMargin:H,threshold:y};i[k]&&i[k].disconnect();const I=new IntersectionObserver(S,W);I.observe(v),i[k]=I}function w(){l.length&&l.forEach(T)}Z(()=>{for(let v=0;v<r()+1;v++)y.push(v/r());l=t.querySelectorAll(":scope > *:not(iframe)"),w()}),Z(()=>{s(),o(),w()});var m=Xe(),C=f(m);me(C,()=>e.children??ie),p(m),Oe(m,v=>t=v,()=>t),h(n,m),K()}var ea=_('<div><p class="svelte-1sxgmm9"> </p></div>'),aa=_('<section id="scrolly"><h2 class="svelte-1sxgmm9">Scrolly <span> </span></h2> <div class="spacer svelte-1sxgmm9"></div> <!> <div class="spacer svelte-1sxgmm9"></div></section>');function ta(n){let e=G(void 0);var a=aa(),s=f(a),o=b(f(s)),r=f(o,!0);p(o),p(s);var u=b(s,4);$e(u,{get value(){return c(e)},set value(g){N(e,g,!0)},children:(g,y)=>{var l=D(),i=A(l);R(i,16,()=>[0,1,2,3,4],U,(t,d,T)=>{const w=q(()=>c(e)===T);var m=ea();let C;var v=f(m),k=f(v,!0);p(v),p(m),O(()=>{C=xe(m,1,"step svelte-1sxgmm9",null,C,{active:c(w)}),E(k,d)}),h(t,m)}),h(g,l)},$$slots:{default:!0}}),ke(2),p(a),O(()=>E(r,c(e)||"-")),h(n,a)}const na=`{
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
      "p3": "And many of the words that were added, words such as <span class=ngsl>mortgage, corporation, appropriate, analysis, fairly,</span> and <span class=ngsl>despite,</span> don’t look anything like the ones that were discarded. In fact, they are mostly things that don’t look like anything at all."
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
          "html": "The biggest category in the 1953 list was already General & Abstract Terms, with words such as <span class=remained>maybe, discover, regular, important,</span> and <span class=remained>success.</span> The world, by 2023, needed even more of it: the abstract category grew by 29.2%, adding words such as <span class=ngsl>possibility, responsibility, concept, justify,</span> and <span class=ngsl>perspective.</span>"
        },
        {
          "label": "Overlay 2 – focus on drops",
          "focusCategories": "Substances, Materials, Objects and Equipment | Emotion | The Body and the Individual | Food and Farming",
          "html": "The sharpest drops were in the most tangible categories: Substances & Objects, the Body & the Individual, Food & Farming, Life & Living Things. Words such as <span class=gsl>clay, corn, hammer, beard, towel,</span> and <span class=gsl>weave</span>—words for what you grow, make, and hold in your hand—all thinned out."
        },
        {
          "label": "Overlay 3 – focus on Psych Processes vs. Emotion",
          "focusCategories": "Emotion | Psychological Actions, States and Processes",
          "html": "While words for emotions shrank by 1.8 percentage points, words for psychological processes grew by 1.7. <br>Plain sentiments such as <span class=remained>happy, sad, afraid,</span> and <span class=remained>angry</span> stayed. But the vocabulary of inner life dropped words for feelings such as<span class=gsl>patience, pity, despair,</span> and <span class=gsl>sorrow,</span> and picked up more words for thinking: <span class=ngsl>focus, judgment, investigate, and logic.</span>"
        }
      ]
    },
    {
      "type": "prose",
      "html": "<p>The categories that shrank are mostly those that have to do with the immediate, physical world, while the gains are those furthest from it.</p>\\r\\n<p>To better see this, the categories can be oriented spatially. Some categories describe you: your body and emotions. Some describe what’s immediately around you: food, objects, and the natural world. Others name systems you participate in: government, institutions, society, and culture. And some have no location at all: abstract concepts, reasoning, and processes.  Grouped by <i>physical scope,</i> the pattern of change seems to point in a specific direction.</p>"
    },
    {
      "type": "chart",
      "chartId": "semanticsScope",
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
      "html": "<p>In hindsight, the shift makes sense. By 1957, four years after the original list was published, <a href=https://time.com/archive/6613167/new-problem-for-unions-the-rise-of-the-white-collar-worker/ target=_blank>white-collar workers outnumbered blue-collar for the first time in US history.</a> And by 2000, <a href=https://www.bls.gov/opub/mlr/2006/03/art3full.pdf target=_blank>fewer than one in four workers did manual labor.</a> The stuff people encountered in their daily lives, what they needed to talk about, and the systems they had to navigate all changed.</p>\\r\\n\\r\\n\\r\\n<p>The vocabulary lists, built from the language of their respective eras, tracked those changes. The shifts reflect a life that got further from its own making: less tied to tools, animals, food, and the body; more tied to national or global institutions, categories, systems, and ideas.</p>\\r\\n\\r\\n\\r\\n<p>The new vocabulary—<span class=ngsl>mortgage, legislation, perspective, involvement, improvement, assumption, evaluation</span>—are words you can’t weigh, point to, or hold in your hand. These words shape your life, but they do it without ever occupying any physical space.</p>\\r\\n\\r\\n\\r\\n<h2 class=section-header>Harder to Picture</h2>\\r\\n\\r\\n\\r\\n<p>To better understand whether there was a shift in vocabulary describing the physical world, I compared each word to a database that rates the tangibility of words, on a scale of 1 to 5 (called a “concreteness rating”). A rating of 5 means you can experience the word directly with your senses, while a rating of 1 means you can't.</p>"
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
      "html": "<p>The impression that abstract words are harder to hold onto has a name in cognitive science. When you read <span class=gsl>axe,</span> your brain doesn’t just decode letters, it reaches for something: an image, a weight, or a gesture. The word activates both a verbal label and a sensory trace. Psychologists call this dual coding: Concrete words travel through two channels, verbal and sensory; abstract words travel through one. Two channels mean two retrieval pathways, which is why concrete words are “stickier,” easier to hold in a line of thought and faster to recall. Abstract words, on the other hand, are purely verbal, and have to be understood through language alone.</p>\\r\\n\\r\\n\\r\\n<p>To put it another way: Concrete words are easier for us to process because they are bundled with a web of associations, tactile experiences, and memories that anchor their meaning. Here’s a more detailed view of the shift away from concrete language: </p>"
    },
    {
      "type": "chart",
      "chartId": "concretenessBands",
      "title": "The Concrete End Got Hollowed Out. Something Murkier Filled In.",
      "subhead": "Each row is a concreteness range. Bar length shows what proportional share of the removed words (left) and the added words (right) falls there. A longer bar means a larger share of the words scored in that range. Hover to see more words.",
      "note": "Data source: Brysbaert Concreteness ratings for 40 thousand generally known English word lemmas. The dataset provided 99.7% coverage of the words in both lists.",
      "overlays": [
        {
          "label": "Overlay 1 – focus on band 4.5–5 (most concrete)",
          "html": "Nearly a third of all the words that were removed scored as the most concrete. Only 7.3% of words added scored that high. <span class=gsl>Rust, brick, silk, screw,</span> and <span class=gsl>cage</span> all were discarded. Instead, <span class=ngsl>magazine, jail, apartment, bomb,</span> and <span class=ngsl>guitar</span> were added."
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
      "title": "Nouns Still Dominate Both Lists, Verbs Remained Steady, and Adjectives Grew Modestly. Adverbs, However, Doubled.",
      "subhead": "Each square is one word, grouped by part-of-speech in each list. Hover the cells to see the words.",
      "note": "The 2023 list contains more words overall (2,801 vs. 2,274). All changes mentioned in the text reflect each category's share of its list, not raw counts. Data source: NLTK (Natural Language Toolkit), with manual correction of mislabeled words."
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
      "html": "<p>Most of the adverbs specify degree, frequency, certainty, and extent. Some hedge <span class=ngsl>(somewhat, partly, relatively, possibly, approximately).</span> Others assert <span class=ngsl>(absolutely, definitely, entirely, exactly, precisely).</span> They're all doing the same kind of work: Take a statement and tell you how much of it is true, how often, and how certain. It’s as if the world now requires you to be more precise about everything.</p>\\r\\n\\r\\n\\r\\n<h2 class=section-header>Further</h2>\\r\\n<p><span class=remained>Bread</span> survived both lists. <span class=gsl>Flour, wheat, harvest</span> and <span class=gsl>bake</span> didn’t. The word for what sustains us remained essential, while the words for how we’d make it weren’t. That might be the most honest summary of what happened.</p>\\r\\n\\r\\n\\r\\n<p>The world that made the 2023 list is more regulated, more connected, and in many ways more capable than the one behind the 1953 list. It’s a world further than our kitchen or home, reaching across economies, institutions, and democracies. Today's vocabulary reflects a life that is less self-contained and more systemic. It’s less about what’s within arm’s reach, and more about the larger world we navigate through. That sort of long-distance connection requires a particular kind of language: expansive, abstract, and precise. And language, it turns out, can’t help itself. It keeps track.</p>"
    }
  ],
  "notes": [
    {
      "type": "prose",
      "html": ""
    }
  ]
}`;var sa=_("<p></p>"),oa=_('<details><summary></summary> <div class="content"><!></div></details>');function ra(n,e){let a=q(()=>typeof e.content=="string"),s=q(()=>e.open==="true");var o=oa(),r=f(o);z(r,()=>e.summary,!0),p(r);var u=b(r,2),g=f(u);{var y=i=>{var t=D(),d=A(t);z(d,()=>e.content),h(i,t)},l=i=>{var t=D(),d=A(t);R(d,17,()=>e.content,U,(T,w)=>{let m=()=>c(w).value;var C=sa();z(C,m,!0),p(C),h(T,C)}),h(i,t)};ee(g,i=>{c(a)?i(y):i(l,-1)})}p(u),p(o),O(()=>{o.open=c(s),ue(o,"name",e.name)}),h(n,o)}var ia=_("<li></li>"),la=_("<ul></ul>");function ca(n,e){var a=la();R(a,21,()=>e.li,U,(s,o)=>{var r=ia();z(r,()=>c(o),!0),p(r),h(s,r)}),p(a),h(n,a)}var da=_("<li></li>"),ha=_("<ol></ol>");function pa(n,e){var a=ha();R(a,21,()=>e.li,U,(s,o)=>{var r=da();z(r,()=>c(o),!0),p(r),h(s,r)}),p(a),h(n,a)}var ua=_("<p></p>"),ma=_("<section><!></section>");function ga(n,e){Y(e,!0);const a={details:ra,ul:ca,ol:pa};let s=F(e,"components",19,()=>({})),o=F(e,"body",19,()=>[]);var r=D(),u=A(r);R(u,17,o,U,(g,y)=>{let l=()=>c(y).section,i=()=>c(y).content;const t=q(()=>l().toLowerCase().replace(/[^a-z0-9]/g,"")),d=q(()=>s()[l()]);var T=ma(),w=f(T);{var m=v=>{var k=D(),S=A(k);oe(S,()=>c(d),(j,B)=>{B(j,re(i))}),h(v,k)},C=v=>{var k=D(),S=A(k);R(S,17,i,U,(j,B,H,W)=>{let I=()=>c(B).type,P=()=>c(B).value;const Q=q(()=>s()[I()]||a[I()]),ve=q(()=>typeof P()=="string");var le=D(),fe=A(le);{var ye=M=>{var L=D(),J=A(L);oe(J,()=>c(Q),(X,$)=>{$(X,re(P))}),h(M,L)},we=M=>{var L=ua();z(L,P,!0),p(L),h(M,L)},be=M=>{var L=D(),J=A(L);se(J,I,!1,(X,$)=>{var ce=D(),Te=A(ce);z(Te,P),h($,ce)}),h(M,L)},_e=M=>{var L=D(),J=A(L);se(J,I,!1,(X,$)=>{Ee(X,()=>({...P()}))}),h(M,L)};ee(fe,M=>{c(Q)?M(ye):I()==="text"?M(we,1):c(ve)?M(be,2):M(_e,-1)})}h(j,le)}),h(v,k)};ee(w,v=>{c(d)?v(m):v(C,-1)})}p(T),O(()=>ue(T,"id",c(t))),h(g,T)}),h(n,r),K()}var va=_('<p> </p> <progress max="100"></progress>',1);function fa(n,e){let a=F(e,"label",3,"A"),s=F(e,"value",3,0);var o=va(),r=A(o),u=f(r,!0);p(r);var g=b(r,2);O(()=>{E(u,a()),De(g,s())}),h(n,o)}var ya=_('<section id="cms"><h2>MicroCMS</h2> <code><pre> </pre></code> <!></section>');function wa(n,e){Y(e,!0);const{body:a}=Me,s={Test:fa};var o=ya(),r=b(f(o),2),u=f(r),g=f(u,!0);p(u),p(r);var y=b(r,2);ga(y,{get components(){return s},get body(){return a}}),p(o),O(l=>E(g,l),[()=>na.replace(/\t/g," ")]),h(n,o),K()}const ba=(n,e=ie)=>{var a=_a(),s=f(a),o=f(s,!0);p(s);var r=b(s,2),u=f(r,!0);p(r),p(a),O(()=>{E(o,e().name),E(u,e().age)}),h(n,a)};var _a=_('<div class="person svelte-q3gttf"><p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p></div>'),Ta=_('<h2>Svelte5</h2> <h3>Reactive variables 3 ways:</h3> <button class="svelte-q3gttf">count++</button> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <h3>Children (previously slots):</h3> <div class="children"><!></div> <h3>Dispatch Event</h3> <button class="svelte-q3gttf">Random</button>  <h3>Snippets</h3> <div class="people svelte-q3gttf"></div>',1);function ka(n,e){Y(e,!0),F(e,"age",3,30);const a=[{name:"John",age:30},{name:"Jill",age:45}];let s=G(0),o=q(()=>c(s)*2),r=q(()=>c(s)*2),u=G(0);Z(()=>{N(u,c(s)*2)});var g=Ta(),y=b(A(g),4),l=b(y,2),i=f(l);p(l);var t=b(l,2),d=f(t);p(t);var T=b(t,2),w=f(T);p(T);var m=b(T,4),C=f(m);me(C,()=>e.children??ie),p(m);var v=b(m,4),k=b(v,4);R(k,21,()=>a,U,(S,j)=>{ba(S,()=>c(j))}),p(k),O(()=>{E(i,`${c(s)??""} doubled is ${c(o)??""} (derived)`),E(d,`${c(s)??""} doubled is ${c(r)??""} (derived by)`),E(w,`${c(s)??""} doubled is ${c(u)??""} ($effect)`)}),de("click",y,()=>Se(s)),de("click",v,()=>e.random(Math.floor(Math.random()*10))),h(n,g),K()}Ie(["click"]);const Sa=(n,e)=>{let a=G(Ce(n)),s=G(null),o=G(!0),r=G(void 0);const u=(l=!0)=>{N(o,l,!0),l===!0&&(N(r,null),N(s,null))},g=async()=>{try{const l=await fetch(c(a),e);if(!l.ok)throw new Error(`Unexpected error occurred (status ${l.status})`);let i;if(c(a).includes(".csv")){const t=await l.text();i=Re(t)}else i=await l.json();return[null,i]}catch(l){const{errorMessage:i="Unexpected error eccurred"}=l;return[i,null]}},y=async l=>{u(!0);const[i,t]=await g();if(l===c(a)){if(i){u(!1),N(r,i,!0);return}u(!1),N(s,t,!0)}};return Z(()=>{y(c(a))}),{get data(){return c(s)},get loading(){return c(o)},get error(){return c(r)},get url(){return c(a)},set url(l){c(a)!==l&&N(a,l,!0)}}};var Ca=_("<p>loading data...</p>"),Aa=_("<p> </p>"),Ia=_("<p>data loaded</p> <pre> </pre>",1),xa=_('<div class="c"><h2>Load Data</h2> <div class="response"><!></div></div>');function Ea(n,e){Y(e,!0);const a=`${Le}/assets/demo/test.csv`,s=Sa(a);Z(()=>{});var o=xa(),r=b(f(o),2),u=f(r);{var g=i=>{var t=Ca();h(i,t)},y=i=>{var t=Aa(),d=f(t);p(t),O(()=>E(d,`error: ${s.error??""}`)),h(i,t)},l=i=>{var t=Ia(),d=b(A(t),2),T=f(d,!0);p(d),O(w=>E(T,w),[()=>JSON.stringify(s.data,null,2)]),h(i,t)};ee(u,i=>{s.loading?i(g):s.error?i(y,1):i(l,-1)})}p(r),p(o),h(n,o),K()}var Da=_('<div id="demo" class="svelte-15aotx7"><h1>Demo</h1> <!> <!> <!> <!> <!> <!> <!> <!></div>');function Oa(n){let e=G(0);function a(d){console.log(d)}var s=Da(),o=b(f(s),2);Pe(o);var r=b(o,2);He(r);var u=b(r,2);ze(u);var g=b(u,2);Qe(g);var y=b(g,2);wa(y,{});var l=b(y,2);Ea(l,{});var i=b(l,2);ta(i);var t=b(i,2);ka(t,{random:a,get value(){return c(e)},set value(d){N(e,d,!0)}}),p(s),h(n,s)}function Ja(n){Oa(n)}export{Ja as component};
