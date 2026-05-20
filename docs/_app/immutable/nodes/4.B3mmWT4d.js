import"../chunks/DsnmJJEf.js";import{al as b,$ as f,a1 as A,a0 as p,t as O,K as c,an as F,Z,ag as J,_ as K,ad as ie,M as R,aE as ke,am as W,ba as Ce,L as xe}from"../chunks/BouHPhyx.js";import{b as h,f as _,c as E,t as Ae}from"../chunks/CjYGnkC0.js";import{a as D,f as Se,e as de}from"../chunks/BA0teXdn.js";import{e as U,i as N,b as Ie,s as ue,c as De,d as Ee}from"../chunks/BJ9YyB53.js";import{e as oe}from"../chunks/CPwCmilQ.js";import{c as se}from"../chunks/BYrJ3R8_.js";import{s as re,p as q}from"../chunks/BedyKmqI.js";import{s as me}from"../chunks/Bnz2TgY4.js";import{b as Oe,i as ee}from"../chunks/Rb_QLIf0.js";import{c as Be}from"../chunks/8zjz2jm3.js";import{h as z}from"../chunks/BIxuo7In.js";import{b as Me}from"../chunks/BndzwWR5.js";import"../chunks/tGppMfpQ.js";var he={},te={},ae=34,Y=10,ne=13;function ge(n){return new Function("d","return {"+n.map(function(e,t){return JSON.stringify(e)+": d["+t+'] || ""'}).join(",")+"}")}function je(n,e){var t=ge(n);return function(o,s){return e(t(o),s,n)}}function pe(n){var e=Object.create(null),t=[];return n.forEach(function(o){for(var s in o)s in e||t.push(e[s]=s)}),t}function I(n,e){var t=n+"",o=t.length;return o<e?new Array(e-o+1).join(0)+t:t}function Le(n){return n<0?"-"+I(-n,6):n>9999?"+"+I(n,6):I(n,4)}function qe(n){var e=n.getUTCHours(),t=n.getUTCMinutes(),o=n.getUTCSeconds(),s=n.getUTCMilliseconds();return isNaN(n)?"Invalid Date":Le(n.getUTCFullYear())+"-"+I(n.getUTCMonth()+1,2)+"-"+I(n.getUTCDate(),2)+(s?"T"+I(e,2)+":"+I(t,2)+":"+I(o,2)+"."+I(s,3)+"Z":o?"T"+I(e,2)+":"+I(t,2)+":"+I(o,2)+"Z":t||e?"T"+I(e,2)+":"+I(t,2)+"Z":"")}function Fe(n){var e=new RegExp('["'+n+`
\r]`),t=n.charCodeAt(0);function o(a,d){var T,w,m=s(a,function(x,v){if(T)return T(x,v-1);w=x,T=d?je(x,d):ge(x)});return m.columns=w||[],m}function s(a,d){var T=[],w=a.length,m=0,x=0,v,k=w<=0,C=!1;a.charCodeAt(w-1)===Y&&--w,a.charCodeAt(w-1)===ne&&--w;function L(){if(k)return te;if(C)return C=!1,he;var P,G=m,S;if(a.charCodeAt(G)===ae){for(;m++<w&&a.charCodeAt(m)!==ae||a.charCodeAt(++m)===ae;);return(P=m)>=w?k=!0:(S=a.charCodeAt(m++))===Y?C=!0:S===ne&&(C=!0,a.charCodeAt(m)===Y&&++m),a.slice(G+1,P-1).replace(/""/g,'"')}for(;m<w;){if((S=a.charCodeAt(P=m++))===Y)C=!0;else if(S===ne)C=!0,a.charCodeAt(m)===Y&&++m;else if(S!==t)continue;return a.slice(G,P)}return k=!0,a.slice(G,w)}for(;(v=L())!==te;){for(var j=[];v!==he&&v!==te;)j.push(v),v=L();d&&(j=d(j,x++))==null||T.push(j)}return T}function r(a,d){return a.map(function(T){return d.map(function(w){return i(T[w])}).join(n)})}function u(a,d){return d==null&&(d=pe(a)),[d.map(i).join(n)].concat(r(a,d)).join(`
`)}function g(a,d){return d==null&&(d=pe(a)),r(a,d).join(`
`)}function y(a){return a.map(l).join(`
`)}function l(a){return a.map(i).join(n)}function i(a){return a==null?"":a instanceof Date?qe(a):e.test(a+="")?'"'+a.replace(/"/g,'""')+'"':a}return{parse:o,parseRows:s,format:u,formatBody:g,formatRows:y,formatRow:l,formatValue:i}}var Re=Fe(","),Ue=Re.parse,Ne=_('<section id="demo-link"><h2>Link</h2> <p><a href="elements">Default element styles demo</a></p> <p><a href="fonts">Pudding-hosted font previews</a></p> <p><a href="ui">BitsUI styled components</a></p></section>');function He(n){var e=Ne();h(n,e)}var We=_('<section id="demo-image"><h2>Image</h2> <p>img tag</p> <img src="../assets/demo/test.jpg" alt="cat" class="svelte-b56t42"/> <p>background image</p> <div class="svelte-b56t42"></div></section>');function Pe(n){var e=We();h(n,e)}var Ge=_('<section id="demo-element"><h2>Dynamic Svelte Element</h2> <!></section>');function ze(n){const e=[{tag:"h3",text:"I am a h3 tag."},{tag:"p",text:"I am p tag."}];var t=Ge(),o=b(f(t),2);U(o,17,()=>e,N,(s,r)=>{let u=()=>c(r).tag,g=()=>c(r).text;var y=E(),l=A(y);oe(l,u,!1,(i,a)=>{var d=Ae();O(()=>D(d,g())),h(a,d)}),h(s,y)}),p(t),h(n,t)}var Ve=_("<p> </p>");function Ye(n,e){var t=Ve(),o=f(t);p(t),O(()=>D(o,`I am component A and my favorite number is ${e.number??""}.`)),h(n,t)}var Je=_("<p> </p>");function Ze(n,e){var t=Je(),o=f(t);p(t),O(()=>D(o,`I am component B and my name is ${e.name??""}.`)),h(n,t)}var Ke=_('<section id="demo-component"><h2>Dynamic Svelte Component</h2> <!></section>');function Qe(n){const e={A:Ye,B:Ze},t=[{component:"A",number:42},{component:"B",name:"Russell"}];var o=Ke(),s=b(f(o),2);U(s,17,()=>t,N,(r,u)=>{const g=F(()=>e[c(u).component]);var y=E(),l=A(y);se(l,()=>c(g),(i,a)=>{a(i,re(()=>c(u)))}),h(r,y)}),p(o),h(n,o)}var Xe=_("<div><!></div>");function $e(n,e){Z(e,!0);let t=q(e,"root",3,null),o=q(e,"top",3,0),s=q(e,"bottom",3,0),r=q(e,"increments",3,100),u=q(e,"value",15,void 0),g=[],y=[],l=[],i=[],a;function d(){let v=0,k=0;for(let C=0;C<g.length;C++)g[C]>v&&(v=g[C],k=C);v>0?u(k):u(void 0)}function T(v,k){const C=H=>{H[0].isIntersecting;const Q=H[0].intersectionRatio;g[k]=Q,d()},L=o()?o()*-1:0,j=s()?s()*-1:0,P=`${L}px 0px ${j}px 0px`,G={root:t(),rootMargin:P,threshold:y};i[k]&&i[k].disconnect();const S=new IntersectionObserver(C,G);S.observe(v),i[k]=S}function w(){l.length&&l.forEach(T)}J(()=>{for(let v=0;v<r()+1;v++)y.push(v/r());l=a.querySelectorAll(":scope > *:not(iframe)"),w()}),J(()=>{o(),s(),w()});var m=Xe(),x=f(m);me(x,()=>e.children??ie),p(m),Oe(m,v=>a=v,()=>a),h(n,m),K()}var et=_('<div><p class="svelte-1sxgmm9"> </p></div>'),tt=_('<section id="scrolly"><h2 class="svelte-1sxgmm9">Scrolly <span> </span></h2> <div class="spacer svelte-1sxgmm9"></div> <!> <div class="spacer svelte-1sxgmm9"></div></section>');function at(n){let e=W(void 0);var t=tt(),o=f(t),s=b(f(o)),r=f(s,!0);p(s),p(o);var u=b(o,4);$e(u,{get value(){return c(e)},set value(g){R(e,g,!0)},children:(g,y)=>{var l=E(),i=A(l);U(i,16,()=>[0,1,2,3,4],N,(a,d,T)=>{const w=F(()=>c(e)===T);var m=et();let x;var v=f(m),k=f(v,!0);p(v),p(m),O(()=>{x=Ie(m,1,"step svelte-1sxgmm9",null,x,{active:c(w)}),D(k,d)}),h(a,m)}),h(g,l)},$$slots:{default:!0}}),ke(2),p(t),O(()=>D(r,c(e)||"-")),h(n,t)}const nt=`{
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
      "p3": "And many of the words that were added, words like <span class=ngsl>mortgage, corporation, appropriate, analysis, fairly, despite</span> – don’t look anything like the ones that were discarded. In fact, they mostly don’t look like anything at all."
    },
    {
      "type": "hero",
      "h1": "From Goat to Despite",
      "dek": "How the words we teach learners changed, and what that says about us"
    },
    {
      "type": "prose",
      "html": "<p>These “essential vocabulary” lists are called the <a href=\\"\\">General Service List</a> (1953) and the <a href=\\"\\">New General Service List</a> (2013, revised in 2023).</p>\\r\\n<p>They were designed as teaching tools for people learning English as a second language, built from real-world usage data, and extensively tested. The words on them were found to be the most useful and common words, across the widest range of everyday situations. A word made the list because it appeared often enough, across enough contexts, to be hard to avoid for the average person in an English-speaking society.</p>\\r\\n\\r\\n\\r\\n<p>That's what makes them interesting beyond language education. Both lists cover most of the language people encounter in everyday use – over 90% for the 2023 list[1], and about 84% for the 1953 one[2]. That makes them, in effect, two portraits of ordinary life, seventy years apart. Each one is a record of what the world, at that time, asked people to have words for.</p>\\r\\n\\r\\n\\r\\n<p>To get at what exactly ordinary life consists of, according to the lists, I started by running all the words through a semantic tagging framework common in linguistics research. It assigns each word to a subject category based on typical usage: Food and Farming, the Body and the Self, Government and Public, Language and Communication, and so on. Twenty-one categories overall. Together, they suggest what kind of world each list was built for.</p>"
    },
    {
      "type": "chart",
      "chartId": "semanticsSlopegraph",
      "title": "Less About Objects and Feelings. More About Abstract Ideas and Mental Processes.",
      "subhead": "Each band is one of 21 semantic categories, sized by its share of each list. Hover to focus on each category.",
      "note": "Data source: all words run through the UCREL Semantic Analysis System (USAS).",
      "overlays": [
        {
          "label": "Overlay 1 – focus on abstract band",
          "focusCategories": "General and Abstract Terms",
          "html": "The biggest category in the 1953 list was already General & Abstract Terms, with words like <span class=remained>maybe, discover, regular, important, success.</span> It grew even more in 2023, adding words like <span class=ngsl>possibility, responsibility, concept, justify,</span> and <span class=ngsl>perspective.</span> Words for reasoning about the world were already central. They became more so."
        },
        {
          "label": "Overlay 2 – focus on drops",
          "focusCategories": "Substances, Materials, Objects and Equipment | Emotion | The Body and the Individual | Food and Farming",
          "html": "The sharpest drops were in the most tangible categories: Substances & Objects, the Body & the Individual, Food & Farming, Life & Living Things. Words like <span class=gsl>clay, corn, hammer, beard, towel,</span> and <span class=gsl>weave</span> were dropped from the core vocabulary. The words for what you grow, make, and hold in your hand all thinned out."
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
      "html": "<p>These 21 categories have somewhat of a spatial logic to them. Some describe <i>you:</i> the body, emotions. Some describe what’s <i>immediately around you:</i> food, objects, the natural world. Others name <i>systems you participate in:</i> government, institutions, society, culture. And some <i>have no fixed location at all:</i> abstract concepts, reasoning, and processes. Grouped by <i>scope</i>, the pattern of change points in a specific direction.</p>"
    },
    {
      "type": "chart",
      "chartId": "semanticsScope",
      "title": "The Vocabulary Moved Outward",
      "subhead": "From the self at the center, to abstract/universal at the edge. Hover the tiles to explore the words in each domain.",
      "note": "Data source: all words run through the UCREL Semantic Analysis System (USAS), then grouped into five top categories:",
      "overlays": [
        {
          "label": "Overlay 1 – focus on the self",
          "html": "The 2023 list has fewer words relating to the self. Among what left: <span class=gsl>ache, wrist, comb, razor, shave, soap. Courage, greed, loyalty, mercy, shame.</span> What arrived reads differently: <span class=ngsl>cancer, clinical, disorder, gene, surgery, therapy, treatment.</span> The self that the 2023 list describes reads more as something that you manage than something you inhabit."
        },
        {
          "label": "Overlay 2 – focus on local/immediate",
          "html": "The Local ring shrank too. Some of what left: <span class=gsl>donkey, elephant, goat, pigeon. Bake, butter, harvest, roast. Bay, cliff, moonlight, tide.</span> That’s the immediate world, the one within reach. And what arrived: <span class=ngsl>climate, environment, organic, solar, pollution</span> – words for the world as a system."
        },
        {
          "label": "Overlay 3 – focus on institutional",
          "html": "Within the Institutional ring, words that left include: <span class=gsl>merchant, salesman, bargain, treasury, calculator, inventor.</span> Among what arrived: <span class=ngsl>corporation, budget, mortgage, unemployment, pension, legislation, regulation, democracy, voter.</span> It still names jobs, money, and the state, but the vocabulary sounds less like storefronts and ledgers, and more like filings, markets, and processes."
        },
        {
          "label": "Overlay 4 – focus on social/communication",
          "html": "The Social & Communication ring barely changed in relative size. But nearly a quarter of its 1953 words are gone, and 39% of its 2023 words are new. <span class=gsl>Humble, loyalty, fellowship, generous, polite, companionship</span> gave way to <span class=ngsl>community, identity, organization, ethnic, gender,</span> and <span class=ngsl>narrative.</span> The social world shifted from something you navigate through personal relationships to something you identify with through categories. Fewer words for the people directly around you, but more for belonging at a distance."
        },
        {
          "label": "Overlay 5 – focus on universal/abstract (zoomed out)",
          "html": "The outermost ring, the one containing words that don’t belong in any one specific domain, is the only one that meaningfully expanded. What grew wasn’t merely more abstraction, but machinery for reasoning: <span class=ngsl>analyze, assess, assume, concept, conclude.</span>"
        }
      ]
    },
    {
      "type": "prose",
      "html": "<p>In hindsight, the shift makes sense. By 1957, four years after the original list was published, <a href=https://time.com/archive/6613167/new-problem-for-unions-the-rise-of-the-white-collar-worker/ target=_blank>white-collar workers outnumbered blue-collar for the first time in US history.</a> And by 2000, <a href=https://www.bls.gov/opub/mlr/2006/03/art3full.pdf target=_blank>fewer than one in four workers did manual labor.</a> The stuff people encountered in their daily lives, what they needed to talk about, the systems they had to navigate – all changed.</p>"
    },
    {
      "type": "prose",
      "html": "<p>The vocabulary lists, built from the language of their respective eras, tracked those changes. The shifts reflect a life that got further from its own making: less tied to tools, animals, food, and the body; more tied to national or global institutions, categories, systems, and ideas.</p>"
    },
    {
      "type": "prose",
      "html": "<p>Look at what so much of the new vocabulary actually is. <span class=ngsl>Mortgage, legislation, perspective, involvement, improvement, assumption, evaluation.</span> You can’t weigh them, point to them, or hold them in your hand, yet the world they describe is real and consequential. These words shape your life, but they do it without ever occupying any physical space in it.</p>"
    },
    {
      "type": "prose",
      "html": "<p>In order to examine that aspect of the words, I ran them through a database where thousands of people rated over 40,000 words on a scale of 1 to 5 based on how tangible they are. A 5 means you can experience the thing directly with your senses. A 1 means you can't. Here’s how the lists turned out.</p>"
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
      "html": "<p>The impression that abstract words are harder to hold onto has a name in cognitive science. When you read <span class=gsl>axe,</span> your brain doesn’t just decode letters, it reaches for something. An image, a weight, a gesture. The word activates both a verbal label, and a sensory trace. Psychologists call this Dual Coding: concrete words travel through two channels, verbal and sensory; abstract words travel through one. Two channels mean two retrieval pathways, which is why concrete words are “stickier” – they are easier to hold in a line of thought, and faster to recall. Abstract words, on the other hand, are purely verbal, and have to be understood through language alone.</p>"
    },
    {
      "type": "prose",
      "html": "<p>To put it another way: concrete words are easier for us to process because they come bundled with a web of associations, tactile experiences, and memories that anchor their meaning. Abstract words don’t have that web, or have a much thinner one.</p>"
    },
    {
      "type": "prose",
      "html": "<p>What this boils down to is that concrete and abstract words aren’t processed the same way. They are asking something quite different from the mind. This is why the shift matters. The words that left the list were mostly ones you could point at. The ones that arrived, mostly you can’t. Here’s what that exchange looks like.</p>"
    },
    {
      "type": "chart",
      "chartId": "concretenessBands",
      "title": "The Concrete End Got Hollowed Out. Something Murkier Filled In.",
      "subhead": "Removed words (left) and added words (right), grouped by concreteness rating. Each bar’s width is proportional to its share of each set. Hover to read more words.",
      "note": "Data source: Brysbaert Concreteness ratings for 40 thousand generally known English word lemmas. The dataset provided 99.7% coverage of the words in both lists.",
      "overlays": [
        {
          "label": "Overlay 1 – focus on band 4.5–5 (most concrete)",
          "html": "Nearly a third of all the words that were removed scored in the most concrete range. Less than one in fifteen words added scored that high. <span class=gsl>Rust, umbrella, silk, screw, soap</span> all left. Instead, came words like <span class=ngsl>magazine, jail, apartment, bomb, guitar.</span>"
        },
        {
          "label": "Overlay 2 – focus on bands 2–2.5 (mid-abstract)",
          "html": "Nearly a quarter of all added words land here, in the mid-abstract range. Only 13% of the words removed did. Words like <span class=ngsl>regulation, reform, cooperation, obligation, initiative, negotiate, perception.</span> Not quite picturable, but not entirely vague either. For comparison, the removed words that have a similar score include: <span class=gsl>shame, despair, spite, fellowship, companionship.</span> Same number on the scale, different world entirely."
        },
        {
          "label": "Overlay 3 – focus on bands 1–2",
          "html": "A cluster of very abstract words also dropped, and they turn out to be a particular kind of abstraction: <span class=gsl>courage, wisdom, mercy, loyalty, greed, fate, revenge, honesty…</span> Abstract, yes. But they carry a kind of emotional grounding. You can’t point to <span class=gsl>mercy</span> but you’ve felt it. You know it because you’ve experienced it. The abstract words that arrived are nothing like that: <span class=ngsl>interpretation, involvement, theoretical, somewhat, evaluate, despite.</span> They describe how things are structured, how processes unfold. They are language-based, through and through."
        }
      ]
    },
    {
      "type": "prose",
      "html": "<p>But the vocabulary didn’t just get harder to picture. As a result, it also became more language-dependent. Concrete words tend to carry their meaning in themselves. Without sensory grounding, abstract ones need some help – other words to specify, soften, or sharpen what they mean. That help tends to come from one particular corner of the language.</p>"
    },
    {
      "type": "prose",
      "html": "<p>Nouns still dominate both lists, as nouns do. Verbs remained steady, and adjectives grew only modestly. But adverbs nearly doubled.</p>"
    },
    {
      "type": "chart",
      "chartId": "posDiagram",
      "title": "More Words for How",
      "subhead": "Each square is one word, grouped by part-of-speech in each list. Hover the cells to see the words.",
      "note": "The 2023 list contains more words overall (2,801 vs. 2,274). All changes mentioned in the text reflect each category's share of its list, not raw counts. Data source: NLTK (Natural Language Toolkit), with manual correction of wrongly tagged words."
    },
    {
      "type": "prose",
      "html": "<p>Of 1,148 words added, 107 are adverbs. Only 8 were dropped. This makes a certain sense. <span class=gsl>Axe</span> doesn’t need a modifier, you know what it is. But <span class=ngsl>implication, involvement,</span> and <span class=ngsl>policy</span> come with conditions, qualifications, degrees that need to be spelled out. Abstract language tends to float free of sensory experience, and so it needs other words to pin it down. Adverbs are precisely that: language calibrating language. \\r\\n<br>Look through all the ones that were added:</p>"
    },
    {
      "type": "chart",
      "chartId": "adverbsAdded"
    },
    {
      "type": "prose",
      "html": "<p>Most of them are used to specify degree, frequency, certainty, extent. Some hedge <span class=ngsl>(somewhat, partly, relatively, possibly, approximately),</span> others assert <span class=ngsl>(absolutely, definitely, entirely, exactly, precisely).</span> But they're all doing the same kind of work: they take a statement and tell you how much of it is true, how often, how certain.</p>"
    },
    {
      "type": "prose",
      "html": "<p>It’s as if the world now requires you to be more precise about everything. And for good reason. Today's world is more regulated, more connected, and in many ways more capable than the one that made the 1953 list. It’s a world where we’re able to reach further than our kitchen, or home – across economies, institutions, democracies. The vocabulary that keeps showing up reflects a life that is less self-contained and more systemic; It’s less about what’s within arm’s reach, and more about the larger world we move through – and increasingly depend on. That sort of connection, this long-distance communication, if you will, requires pertinent language.</p>"
    },
    {
      "type": "prose",
      "html": "<p><span class=remained>Bread</span> survived both lists. <span class=gsl>Flour, wheat,</span> and <span class=gsl>harvest</span> didn’t. The word for what sustains us remained essential, while the words for how we’d make it weren’t. That might be the most honest summary of what happened.</p>"
    },
    {
      "type": "prose",
      "html": "<p>These lists were never designed to say anything about society. They were designed to answer a very practical question: <br><i>which words do people need most?</i> <br>The thing is, in answering it, they ended up creating a record of something else; of what we are expected to engage with, and need to deal with, in our daily lives. Language, it turns out, can’t help itself. It keeps track.</p>"
    }
  ]
}`;var ot=_("<p></p>"),st=_('<details><summary></summary> <div class="content"><!></div></details>');function rt(n,e){let t=F(()=>typeof e.content=="string"),o=F(()=>e.open==="true");var s=st(),r=f(s);z(r,()=>e.summary,!0),p(r);var u=b(r,2),g=f(u);{var y=i=>{var a=E(),d=A(a);z(d,()=>e.content),h(i,a)},l=i=>{var a=E(),d=A(a);U(d,17,()=>e.content,N,(T,w)=>{let m=()=>c(w).value;var x=ot();z(x,m,!0),p(x),h(T,x)}),h(i,a)};ee(g,i=>{c(t)?i(y):i(l,-1)})}p(u),p(s),O(()=>{s.open=c(o),ue(s,"name",e.name)}),h(n,s)}var it=_("<li></li>"),lt=_("<ul></ul>");function ct(n,e){var t=lt();U(t,21,()=>e.li,N,(o,s)=>{var r=it();z(r,()=>c(s),!0),p(r),h(o,r)}),p(t),h(n,t)}var dt=_("<li></li>"),ht=_("<ol></ol>");function pt(n,e){var t=ht();U(t,21,()=>e.li,N,(o,s)=>{var r=dt();z(r,()=>c(s),!0),p(r),h(o,r)}),p(t),h(n,t)}var ut=_("<p></p>"),mt=_("<section><!></section>");function gt(n,e){Z(e,!0);const t={details:rt,ul:ct,ol:pt};let o=q(e,"components",19,()=>({})),s=q(e,"body",19,()=>[]);var r=E(),u=A(r);U(u,17,s,N,(g,y)=>{let l=()=>c(y).section,i=()=>c(y).content;const a=F(()=>l().toLowerCase().replace(/[^a-z0-9]/g,"")),d=F(()=>o()[l()]);var T=mt(),w=f(T);{var m=v=>{var k=E(),C=A(k);se(C,()=>c(d),(L,j)=>{j(L,re(i))}),h(v,k)},x=v=>{var k=E(),C=A(k);U(C,17,i,N,(L,j,P,G)=>{let S=()=>c(j).type,H=()=>c(j).value;const Q=F(()=>o()[S()]||t[S()]),ve=F(()=>typeof H()=="string");var le=E(),fe=A(le);{var ye=B=>{var M=E(),V=A(M);se(V,()=>c(Q),(X,$)=>{$(X,re(H))}),h(B,M)},we=B=>{var M=ut();z(M,H,!0),p(M),h(B,M)},be=B=>{var M=E(),V=A(M);oe(V,S,!1,(X,$)=>{var ce=E(),Te=A(ce);z(Te,H),h($,ce)}),h(B,M)},_e=B=>{var M=E(),V=A(M);oe(V,S,!1,(X,$)=>{De(X,()=>({...H()}))}),h(B,M)};ee(fe,B=>{c(Q)?B(ye):S()==="text"?B(we,1):c(ve)?B(be,2):B(_e,-1)})}h(L,le)}),h(v,k)};ee(w,v=>{c(d)?v(m):v(x,-1)})}p(T),O(()=>ue(T,"id",c(a))),h(g,T)}),h(n,r),K()}var vt=_('<p> </p> <progress max="100"></progress>',1);function ft(n,e){let t=q(e,"label",3,"A"),o=q(e,"value",3,0);var s=vt(),r=A(s),u=f(r,!0);p(r);var g=b(r,2);O(()=>{D(u,t()),Ee(g,o())}),h(n,s)}var yt=_('<section id="cms"><h2>MicroCMS</h2> <code><pre> </pre></code> <!></section>');function wt(n,e){Z(e,!0);const{body:t}=Be,o={Test:ft};var s=yt(),r=b(f(s),2),u=f(r),g=f(u,!0);p(u),p(r);var y=b(r,2);gt(y,{get components(){return o},get body(){return t}}),p(s),O(l=>D(g,l),[()=>nt.replace(/\t/g," ")]),h(n,s),K()}const bt=(n,e=ie)=>{var t=_t(),o=f(t),s=f(o,!0);p(o);var r=b(o,2),u=f(r,!0);p(r),p(t),O(()=>{D(s,e().name),D(u,e().age)}),h(n,t)};var _t=_('<div class="person svelte-q3gttf"><p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p></div>'),Tt=_('<h2>Svelte5</h2> <h3>Reactive variables 3 ways:</h3> <button class="svelte-q3gttf">count++</button> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <h3>Children (previously slots):</h3> <div class="children"><!></div> <h3>Dispatch Event</h3> <button class="svelte-q3gttf">Random</button>  <h3>Snippets</h3> <div class="people svelte-q3gttf"></div>',1);function kt(n,e){Z(e,!0),q(e,"age",3,30);const t=[{name:"John",age:30},{name:"Jill",age:45}];let o=W(0),s=F(()=>c(o)*2),r=F(()=>c(o)*2),u=W(0);J(()=>{R(u,c(o)*2)});var g=Tt(),y=b(A(g),4),l=b(y,2),i=f(l);p(l);var a=b(l,2),d=f(a);p(a);var T=b(a,2),w=f(T);p(T);var m=b(T,4),x=f(m);me(x,()=>e.children??ie),p(m);var v=b(m,4),k=b(v,4);U(k,21,()=>t,N,(C,L)=>{bt(C,()=>c(L))}),p(k),O(()=>{D(i,`${c(o)??""} doubled is ${c(s)??""} (derived)`),D(d,`${c(o)??""} doubled is ${c(r)??""} (derived by)`),D(w,`${c(o)??""} doubled is ${c(u)??""} ($effect)`)}),de("click",y,()=>Ce(o)),de("click",v,()=>e.random(Math.floor(Math.random()*10))),h(n,g),K()}Se(["click"]);const Ct=(n,e)=>{let t=W(xe(n)),o=W(null),s=W(!0),r=W(void 0);const u=(l=!0)=>{R(s,l,!0),l===!0&&(R(r,null),R(o,null))},g=async()=>{try{const l=await fetch(c(t),e);if(!l.ok)throw new Error(`Unexpected error occurred (status ${l.status})`);let i;if(c(t).includes(".csv")){const a=await l.text();i=Ue(a)}else i=await l.json();return[null,i]}catch(l){const{errorMessage:i="Unexpected error eccurred"}=l;return[i,null]}},y=async l=>{u(!0);const[i,a]=await g();if(l===c(t)){if(i){u(!1),R(r,i,!0);return}u(!1),R(o,a,!0)}};return J(()=>{y(c(t))}),{get data(){return c(o)},get loading(){return c(s)},get error(){return c(r)},get url(){return c(t)},set url(l){c(t)!==l&&R(t,l,!0)}}};var xt=_("<p>loading data...</p>"),At=_("<p> </p>"),St=_("<p>data loaded</p> <pre> </pre>",1),It=_('<div class="c"><h2>Load Data</h2> <div class="response"><!></div></div>');function Dt(n,e){Z(e,!0);const t=`${Me}/assets/demo/test.csv`,o=Ct(t);J(()=>{});var s=It(),r=b(f(s),2),u=f(r);{var g=i=>{var a=xt();h(i,a)},y=i=>{var a=At(),d=f(a);p(a),O(()=>D(d,`error: ${o.error??""}`)),h(i,a)},l=i=>{var a=St(),d=b(A(a),2),T=f(d,!0);p(d),O(w=>D(T,w),[()=>JSON.stringify(o.data,null,2)]),h(i,a)};ee(u,i=>{o.loading?i(g):o.error?i(y,1):i(l,-1)})}p(r),p(s),h(n,s),K()}var Et=_('<div id="demo" class="svelte-15aotx7"><h1>Demo</h1> <!> <!> <!> <!> <!> <!> <!> <!></div>');function Ot(n){let e=W(0);function t(d){console.log(d)}var o=Et(),s=b(f(o),2);He(s);var r=b(s,2);Pe(r);var u=b(r,2);ze(u);var g=b(u,2);Qe(g);var y=b(g,2);wt(y,{});var l=b(y,2);Dt(l,{});var i=b(l,2);at(i);var a=b(i,2);kt(a,{random:t,get value(){return c(e)},set value(d){R(e,d,!0)}}),p(o),h(n,o)}function Vt(n){Ot(n)}export{Vt as component};
