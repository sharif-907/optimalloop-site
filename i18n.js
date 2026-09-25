/*
 * OptimalLoop language detection (NL / EN)
 *
 * Rules, in order:
 *   0. A language the visitor picked with the NL/EN switch always wins.
 *   1. Visitor located in the Netherlands or Flanders (Dutch-speaking Belgium) -> Dutch,
 *      regardless of their device language.
 *   2. Anywhere else: device language is Dutch -> Dutch, otherwise English.
 *
 * Location comes from a free IP lookup (get.geojs.io). It is only needed when the device
 * language is not Dutch, because a Dutch device ends up in Dutch under both rules anyway.
 * If the lookup fails or is slow, rule 2 decides.
 *
 * The page HTML stays in English; Dutch is applied by swapping text nodes using NL below.
 */
(function () {
    var STORE_CHOICE = 'ol-lang';         // manual choice from the switch
    var STORE_GEO = 'ol-geo-nl';          // cached location result: {nl: bool, t: timestamp}
    var GEO_MAX_AGE = 7 * 24 * 3600 * 1000;
    var GEO_TIMEOUT = 1500;
    var GEO_URL = 'https://get.geojs.io/v1/ip/geo.json';

    // Belgian regions/provinces that are Dutch-speaking (Brussels is bilingual and not included)
    var FLEMISH = /flanders|vlaanderen|flandre|antwerp|anvers|limburg|flemish brabant|vlaams-brabant|brabant flamand/i;

    function store(key, value) {
        try {
            if (value === undefined) return localStorage.getItem(key);
            localStorage.setItem(key, value);
        } catch (e) { return null; }
    }

    function deviceIsDutch() {
        var l = (navigator.languages && navigator.languages[0]) || navigator.language || '';
        return /^nl\b/i.test(l);
    }

    function inDutchArea(geo) {
        var cc = (geo.country_code || '').toUpperCase();
        if (cc === 'NL') return true;
        return cc === 'BE' && FLEMISH.test(geo.region || '');
    }

    var NL = {
        // Header / nav
        'Expertise': 'Expertise',
        'Solutions': 'Oplossingen',
        'Process': 'Werkwijze',
        'About': 'Over mij',
        'Case Studies': 'Cases',
        'Contact': 'Contact',
        'Book a Call': 'Plan een gesprek',

        // Hero
        'Work': 'Werk',
        'that does itself.': 'dat zichzelf doet.',
        'Achieve 200–400% ROI through intelligent automation. We help small businesses, agencies, and enterprises optimize operations and reduce costs by up to 80%.':
            'Behaal 200–400% ROI met slimme automatisering. We helpen kleine bedrijven, bureaus en grote organisaties hun processen te optimaliseren en kosten tot 80% te verlagen.',
        '1,000+ hours saved across clients — see real results →': '1.000+ uur bespaard voor klanten — bekijk echte resultaten →',
        'Book a Strategy Session': 'Plan een strategiesessie',
        'ROI Calculator': 'ROI-calculator',

        // Expertise
        'Core Capabilities': 'Kernexpertise',
        'Full-Stack Automation': 'Full-stack automatisering',
        '& Digital Infrastructure.': '& digitale infrastructuur.',
        'If it can be built in Make or n8n, we can build it. From agentic reasoning to robust project management systems.':
            'Als het in Make of n8n gebouwd kan worden, kunnen wij het bouwen. Van agentic AI tot robuuste projectmanagementsystemen.',
        'Agentic Workflows': 'Agentic workflows',
        'Multi-step AI reasoning loops that think, adapt, and execute complex business decisions autonomously.':
            'AI-loops in meerdere stappen die zelfstandig nadenken, zich aanpassen en complexe zakelijke beslissingen uitvoeren.',
        'PM Systems': 'PM-systemen',
        'Advanced automation for Asana, Monday, and Trello. Synchronized data across your entire project stack.':
            'Geavanceerde automatisering voor Asana, Monday en Trello. Gesynchroniseerde data in je hele projectstack.',
        'Custom Loops': 'Maatwerk-loops',
        'Complex deterministic logic built in Make.com and n8n. Reliable, scalable, and built for edge cases.':
            'Complexe, voorspelbare logica gebouwd in Make.com en n8n. Betrouwbaar, schaalbaar en bestand tegen uitzonderingen.',
        'Digital Presence': 'Digitale aanwezigheid',
        'High-performance SaaS websites, custom dashboards, and client portals integrated with your backend.':
            'Snelle SaaS-websites, maatwerk dashboards en klantportalen gekoppeld aan je backend.',

        // Solutions
        'Tailored Automation for Every Stage': 'Automatisering op maat voor elke fase',
        "We don't believe in one-size-fits-all. Our solutions are built to match your specific scale and complexity.":
            'Wij geloven niet in one-size-fits-all. Onze oplossingen passen bij jouw schaal en complexiteit.',
        'Small Businesses': 'Kleine bedrijven',
        'Streamlining routine work and establishing intelligent process consistency to let you focus on growth.':
            'Routinewerk stroomlijnen en slimme, consistente processen opzetten, zodat jij je kunt richten op groei.',
        'Reclaimed 50 hrs/month →': '50 uur/maand teruggewonnen →',
        'Marketing Agencies': 'Marketingbureaus',
        'Boosting campaign execution speed and audience targeting accuracy with proprietary AI frameworks.':
            'Campagnes sneller uitvoeren en doelgroepen nauwkeuriger targeten met eigen AI-frameworks.',
        'Lead leakage fixed →': 'Weglekkende leads opgelost →',
        'Enterprises': 'Grote organisaties',
        'Deep process optimization at scale with predictive analytics and cross-departmental automation.':
            'Diepgaande procesoptimalisatie op schaal met voorspellende analyses en afdelingsoverstijgende automatisering.',
        'Bypassed enterprise-grade firewalls →': 'Zakelijke firewalls omzeild →',

        // Value pillars
        'REVENUE GROWTH': 'OMZETGROEI',
        'Hyper-Personalization': 'Hyperpersonalisatie',
        'at Scale': 'op schaal',
        'We leverage AI-powered personalization to transform your outbound marketing. Turn cold leads into warm conversations by tailoring every touchpoint to the individual.':
            'We zetten AI-personalisatie in om je outbound marketing te transformeren. Maak van koude leads warme gesprekken door elk contactmoment af te stemmen op de persoon.',
        '3x Increase in response rates': '3x meer reacties',
        '(see case study)': '(bekijk case)',
        'Automated lead scoring & qualification': 'Automatische leadscoring & kwalificatie',
        'COST EFFICIENCY': 'KOSTENEFFICIËNTIE',
        '80% Reduction in': '80% minder',
        'Manual Labor': 'handmatig werk',
        'Eliminate manual data entry and routine administration. We build custom loops that handle the repetitive tasks, freeing your team for high-value work.':
            'Geen handmatige data-invoer en routine-administratie meer. We bouwen maatwerk-loops die het repetitieve werk overnemen, zodat je team tijd heeft voor waardevol werk.',
        'Zero-error data processing': 'Foutloze dataverwerking',
        '24/7 autonomous operations': '24/7 autonome processen',
        'Stop leaving ROI on the table. Get a free automation audit — no commitment, just clarity.':
            'Laat geen ROI meer liggen. Vraag een gratis automatiseringsaudit aan — geen verplichtingen, gewoon duidelijkheid.',
        'Claim Your Free Audit Call': 'Plan je gratis auditgesprek',

        // Process
        'How We Work': 'Zo werken we',
        'The Optimization Loop': 'De optimalisatie-loop',
        'Strategic Discovery': 'Strategische verkenning',
        'We analyze your bottlenecks and map out a high-ROI automation blueprint tailored to your stack.':
            'We analyseren je knelpunten en maken een automatiseringsplan met hoge ROI, afgestemd op jouw tools.',
        'Rapid Integration': 'Snelle integratie',
        'Our engineers build and deploy your custom loops in Make, n8n, or custom code with minimal disruption.':
            'Onze engineers bouwen en implementeren je maatwerk-loops in Make, n8n of eigen code, met minimale verstoring.',
        'Infinite Scaling': 'Onbeperkt opschalen',
        'We monitor, optimize, and expand your systems to handle growth while your overhead stays flat.':
            'We monitoren, optimaliseren en breiden je systemen uit zodat ze groei aankunnen, terwijl je overhead gelijk blijft.',
        'Real Example': 'Praktijkvoorbeeld',
        '"We used this exact loop to slash hiring costs by 50% and reclaim 50 hours/month for a client\'s founding team."':
            '"Met precies deze loop hebben we de wervingskosten van een klant met 50% verlaagd en het founding team 50 uur per maand teruggegeven."',
        'See the full case study →': 'Bekijk de volledige case →',
        'This is exactly how we work — every time. Ready to put your business through the loop?':
            'Zo werken we — elke keer weer. Klaar om jouw bedrijf door de loop te halen?',
        'Book Your Discovery Session': 'Plan je verkenningsgesprek',

        // Case studies
        'Real Results. Real Clients.': 'Echte resultaten. Echte klanten.',
        'Case studies and reviews from live projects.': 'Cases en reviews van echte projecten.',
        'GOVERNMENT / DATA': 'OVERHEID / DATA',
        'Autonomous AI Scraper & Anti-Bot Bypass': 'Autonome AI-scraper & anti-botomzeiling',
        'Challenge:': 'Uitdaging:',
        'Solution:': 'Oplossing:',
        'Result:': 'Resultaat:',
        'Large-scale, continuous data extraction from heavily protected government portals.':
            'Grootschalige, doorlopende data-extractie uit zwaar beveiligde overheidsportalen.',
        'Multi-threaded pipeline (Python, Playwright, Supabase) with AI agents using OpenAI Vision to bypass Cloudflare/hCaptcha autonomously.':
            'Multi-threaded pipeline (Python, Playwright, Supabase) met AI-agents die met OpenAI Vision zelfstandig Cloudflare/hCaptcha omzeilen.',
        'Reliable, automated delivery of clean cloud-synced data — bypassing enterprise anti-bot protections entirely.':
            'Betrouwbare, geautomatiseerde levering van schone, cloud-gesynchroniseerde data — zakelijke anti-botbeveiliging volledig omzeild.',
        'REAL ESTATE / SALES': 'VASTGOED / SALES',
        'AI-Powered Real Estate Sales Concierge': 'AI-salesassistent voor vastgoed',
        'A static lead form was causing high lead leakage and delayed response times.':
            'Een statisch leadformulier zorgde voor veel weglekkende leads en trage reactietijden.',
        'Multi-workflow conversational AI (Typebot, n8n, OpenAI) that scores leads, pushes to CRM, and triggers customized HTML brochures.':
            'Conversational AI met meerdere workflows (Typebot, n8n, OpenAI) die leads scoort, naar het CRM stuurt en gepersonaliseerde HTML-brochures verstuurt.',
        'Transformed a static form into a 24/7 automated sales agent with instant customer support.':
            'Een statisch formulier omgebouwd tot een 24/7 geautomatiseerde salesagent met directe klantenservice.',
        'HR / OPERATIONS': 'HR / OPERATIONS',
        'End-to-End Recruitment Pipeline': 'End-to-end wervingspipeline',
        'Hiring processes were consuming 40+ hours a month in administrative bloat.':
            'Wervingsprocessen kostten 40+ uur per maand aan administratieve rompslomp.',
        'Automated system to collect data, auto-score applicants, and trigger custom interview sequences.':
            'Geautomatiseerd systeem dat gegevens verzamelt, sollicitanten automatisch scoort en persoonlijke interviewreeksen start.',
        '↓ 50% hiring costs ·': '↓ 50% wervingskosten ·',
        '+50 hrs/month reclaimed': '+50 uur/maand teruggewonnen',
        'AI INFRASTRUCTURE': 'AI-INFRASTRUCTUUR',
        'Custom Agentic Workflows': 'Agentic workflows op maat',
        'Client needed AI to handle complex, multi-step reasoning tasks beyond simple trigger-action logic.':
            'De klant had AI nodig voor complexe denktaken in meerdere stappen, voorbij simpele trigger-actie-logica.',
        'Highly autonomous workflows using Claude Code and Antigravity, adapting to live data environments and executing advanced operational tasks.':
            'Zeer autonome workflows met Claude Code en Antigravity, die zich aanpassen aan live data en geavanceerde operationele taken uitvoeren.',
        'A hands-off, self-correcting AI infrastructure that scales with the business.':
            'Een zelfcorrigerende AI-infrastructuur die zonder omkijken meegroeit met het bedrijf.',

        // Reviews
        'What Clients Say': 'Wat klanten zeggen',
        '"Sharif built the complete flow for my website SuperChatbots from start to finish — and the result is truly high quality. The automatic language and currency detection is perfectly integrated. The AI chatbot flow runs smoothly with no dead moments or errors. Exactly what you need for conversion. Top collaboration, reliable, and absolutely recommended."':
            '"Sharif heeft de complete flow voor mijn website SuperChatbots van begin tot eind gebouwd — en het resultaat is echt van hoge kwaliteit. De automatische taal- en valutadetectie is perfect geïntegreerd. De AI-chatbotflow loopt soepel, zonder dode momenten of fouten. Precies wat je nodig hebt voor conversie. Topsamenwerking, betrouwbaar en absoluut een aanrader."',
        '"Excellent work thank you for delivering what you promised. We will definitely be back for more. Sharif is a bright friendly person whose bubbly personality is a welcome change to most online collaborations. He communicates well and emphasizes delivery above everything."':
            '"Uitstekend werk, bedankt dat je hebt geleverd wat je beloofde. We komen zeker terug. Sharif is een slimme, vriendelijke persoon wiens bruisende persoonlijkheid een welkome afwisseling is in online samenwerkingen. Hij communiceert goed en zet levering boven alles."',
        '"Sharif did an excellent job using both N8N and Make.com in his workflow(s). A confidently delivered job, some technical challenges that he overcame quickly and it worked a treat."':
            '"Sharif heeft uitstekend werk geleverd met zowel N8N als Make.com in zijn workflow(s). Vol vertrouwen opgeleverd, een paar technische uitdagingen die hij snel oploste, en het werkt perfect."',
        '"Awesome job, very professional, 100% will reach out in the future. Consider OptimalLoop if you want a proper service completed."':
            '"Geweldig werk, zeer professioneel, ik neem in de toekomst 100% weer contact op. Kies OptimalLoop als je een klus goed uitgevoerd wilt hebben."',
        'These clients trusted us first. You could be next.': 'Deze klanten gingen je voor. Jij kunt de volgende zijn.',
        "Let's Build Your Success Story": 'Laten we jouw succesverhaal bouwen',

        // Founder
        'Meet the Architect': 'Maak kennis met de architect',
        'Personalized Innovation': 'Persoonlijke innovatie',
        'by Sharif.': 'door Sharif.',
        'With 20+ systems shipped across real estate, government data pipelines, HR, and SaaS — and 1,000+ hours saved for clients:':
            'Met 20+ opgeleverde systemen in vastgoed, overheidsdatapipelines, HR en SaaS — en 1.000+ uur bespaard voor klanten:',
        "I specialize in bridging the gap between complex business needs and deterministic automation. Whether it's building high-performance SaaS websites, complex Project Management systems (Asana, Monday), or cutting-edge Agentic Workflows—if it can be imagined in Make or n8n, I can build it.":
            'Ik ben gespecialiseerd in het overbruggen van de kloof tussen complexe bedrijfsbehoeften en betrouwbare automatisering. Of het nu gaat om snelle SaaS-websites, complexe projectmanagementsystemen (Asana, Monday) of vooruitstrevende agentic workflows — als het in Make of n8n te bedenken is, kan ik het bouwen.',
        "At OptimalLoop, we don't just sell tools; we architect solutions that scale with your ambition.":
            'Bij OptimalLoop verkopen we niet alleen tools; we ontwerpen oplossingen die meegroeien met je ambitie.',
        'Connect on LinkedIn': 'Connect op LinkedIn',

        // ROI calculator
        'Potential Savings Calculator': 'Besparingscalculator',
        'See how much time and money OptimalLoop can save you.': 'Bereken hoeveel tijd en geld OptimalLoop je kan besparen.',
        'Monthly Labor Hours (Manual Tasks)': 'Uren per maand (handmatige taken)',
        'Average Hourly Rate ($)': 'Gemiddeld uurtarief (€)',
        'Estimated Annual Savings': 'Geschatte jaarlijkse besparing',
        'Based on 80% automation efficiency.': 'Gebaseerd op 80% automatiseringsefficiëntie.',
        'Book a call to unlock this →': 'Plan een gesprek om dit te realiseren →',

        // Contact
        'Get In Touch': 'Neem contact op',
        'Not Ready to Book Yet?': 'Nog niet klaar om te plannen?',
        "No problem. Drop your details and we'll reach out. Or if you're ready to get started, book a call directly.":
            'Geen probleem. Laat je gegevens achter en we nemen contact met je op. Klaar om te beginnen? Plan dan direct een gesprek.',
        'Send a Message': 'Stuur een bericht',
        'Message Sent!': 'Bericht verzonden!',
        "We'll get back to you shortly.": 'We nemen snel contact met je op.',
        'Your Name': 'Je naam',
        'Email Address': 'E-mailadres',
        'What are you looking to automate?': 'Wat wil je automatiseren?',
        'Select a topic': 'Kies een onderwerp',
        'Lead Generation & CRM': 'Leadgeneratie & CRM',
        'Data Pipelines & Scraping': 'Datapipelines & scraping',
        'AI Agents & Workflows': 'AI-agents & workflows',
        'Recruitment & HR': 'Werving & HR',
        'Project Management': 'Projectmanagement',
        'Something else': 'Iets anders',
        'Your Message': 'Je bericht',
        'Send Message →': 'Verstuur bericht →',
        'Book a Strategy Call': 'Plan een strategiegesprek',
        "30 minutes. No fluff. Walk away with a clear picture of what's possible for your business — and a roadmap to get there.":
            '30 minuten. Geen praatjes. Je gaat weg met een helder beeld van wat er mogelijk is voor jouw bedrijf — en een plan om daar te komen.',
        'Book Your Free Strategy Call': 'Plan je gratis strategiegesprek',
        'Or reach us directly at': 'Of mail ons direct via',

        // Footer
        'Privacy Policy': 'Privacybeleid',
        'Terms of Service': 'Algemene voorwaarden',
        'Email Us': 'Mail ons',
        '© 2026 OptimalLoop. All rights reserved.': '© 2026 OptimalLoop. Alle rechten voorbehouden.',

        // Attributes (placeholder / alt)
        'Sharif — Founder of OptimalLoop': 'Sharif — oprichter van OptimalLoop',
        'John Smith': 'Jan Jansen',
        'john@company.com': 'jan@bedrijf.nl',
        'Tell us about your current bottleneck...': 'Vertel ons over je huidige knelpunt...',

        // Page meta
        'OptimalLoop | Work that does itself': 'OptimalLoop | Werk dat zichzelf doet',
        'AI Automation Agency optimizing operations, maximizing ROI, and reducing costs by up to 80%.':
            'AI-automatiseringsbureau dat processen optimaliseert, ROI maximaliseert en kosten tot 80% verlaagt.',
        'Something went wrong. Please email us directly at optimalloop@optimalloop.com':
            'Er ging iets mis. Mail ons direct via optimalloop@optimalloop.com'
    };

    var current = 'en';
    var textNodes = [];   // [{node, en, lead, trail}]
    var attrs = [];       // [{el, name, en}]
    var metaDesc = null, titleEn = null;

    function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

    function collect() {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        var n;
        while ((n = walker.nextNode())) {
            if (/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) continue;
            var key = norm(n.nodeValue);
            if (key && NL.hasOwnProperty(key)) {
                textNodes.push({
                    node: n, en: n.nodeValue,
                    lead: /^\s/.test(n.nodeValue) ? ' ' : '',
                    trail: /\s$/.test(n.nodeValue) ? ' ' : ''
                });
            }
        }
        document.querySelectorAll('[placeholder],[alt]').forEach(function (el) {
            ['placeholder', 'alt'].forEach(function (a) {
                var v = el.getAttribute(a);
                if (v && NL.hasOwnProperty(v)) attrs.push({ el: el, name: a, en: v });
            });
        });
        metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc._en = metaDesc.getAttribute('content');
        titleEn = document.title;
    }

    function apply(lang) {
        current = lang;
        var nl = lang === 'nl';
        document.documentElement.lang = lang;
        textNodes.forEach(function (t) {
            t.node.nodeValue = nl ? t.lead + NL[norm(t.en)] + t.trail : t.en;
        });
        attrs.forEach(function (a) { a.el.setAttribute(a.name, nl ? NL[a.en] : a.en); });
        if (metaDesc && NL[metaDesc._en]) metaDesc.setAttribute('content', nl ? NL[metaDesc._en] : metaDesc._en);
        if (NL[titleEn]) document.title = nl ? NL[titleEn] : titleEn;
        document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
            var on = b.getAttribute('data-lang-btn') === lang;
            b.classList.toggle('text-teal', on);
            b.classList.toggle('text-gray-500', !on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        document.dispatchEvent(new CustomEvent('ol:languagechange', { detail: { lang: lang } }));
    }

    function reveal() { document.documentElement.classList.remove('ol-pending'); }

    // Decide language. Calls done(lang) exactly once.
    function decide(done) {
        var choice = store(STORE_CHOICE);
        if (choice === 'nl' || choice === 'en') return done(choice);
        if (deviceIsDutch()) return done('nl');           // Dutch under both rules

        var fallback = 'en';                              // rule 2 for a non-Dutch device
        try {
            var cached = JSON.parse(store(STORE_GEO) || 'null');
            if (cached && Date.now() - cached.t < GEO_MAX_AGE) return done(cached.nl ? 'nl' : fallback);
        } catch (e) { /* ignore bad cache */ }

        if (!window.fetch) return done(fallback);
        var finished = false;
        var finish = function (lang) { if (!finished) { finished = true; done(lang); } };
        var ctrl = window.AbortController ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctrl) ctrl.abort(); finish(fallback); }, GEO_TIMEOUT);
        fetch(GEO_URL, ctrl ? { signal: ctrl.signal } : {})
            .then(function (r) { return r.json(); })
            .then(function (geo) {
                var nl = inDutchArea(geo);
                store(STORE_GEO, JSON.stringify({ nl: nl, t: Date.now() }));
                clearTimeout(timer);
                finish(nl ? 'nl' : fallback);
            })
            .catch(function () { clearTimeout(timer); finish(fallback); });
    }

    // Hide the page briefly only when we may need to wait for the location lookup.
    (function () {
        var choice = store(STORE_CHOICE);
        if (choice || deviceIsDutch()) return;
        var style = document.createElement('style');
        style.textContent = 'html.ol-pending body{visibility:hidden}';
        document.head.appendChild(style);
        document.documentElement.classList.add('ol-pending');
        setTimeout(reveal, GEO_TIMEOUT + 300); // safety net
    })();

    window.OptimalLoopI18n = {
        get lang() { return current; },
        t: function (en) { return current === 'nl' && NL[en] ? NL[en] : en; },
        set: function (lang) { store(STORE_CHOICE, lang); apply(lang); }
    };

    document.addEventListener('DOMContentLoaded', function () {
        collect();
        document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
            b.addEventListener('click', function () { window.OptimalLoopI18n.set(b.getAttribute('data-lang-btn')); });
        });
        decide(function (lang) { apply(lang); reveal(); });
    });
})();
