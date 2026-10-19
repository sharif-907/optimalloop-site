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
            'Er ging iets mis. Mail ons direct via optimalloop@optimalloop.com',

        // New site (horeca redesign)
        'OptimalLoop — Automation for restaurants & cafés in Limburg': 'OptimalLoop — Automatisering voor restaurants & cafés in Limburg',
        'Eight years on the restaurant floor, two years building automations. OptimalLoop automates hiring, no-shows, rosters, invoices and reviews for horeca in Limburg.': 'Acht jaar op de vloer in de horeca, twee jaar automatiseringen bouwen. OptimalLoop automatiseert werving, no-shows, roosters, facturen en reviews voor horeca in Limburg.',
        'Home': 'Home',
        'Services': 'Diensten',
        'Book a free call': 'Plan een gratis gesprek',
        '© OptimalLoop · Geleen, Limburg': '© OptimalLoop · Geleen, Limburg',
        'Email': 'E-mail',
        'Automation for restaurants & cafés · Limburg': 'Automatisering voor restaurants & cafés · Limburg',
        'The admin': 'De admin',
        'runs itself.': 'regelt zichzelf.',
        'You run the floor.': 'Jij runt de vloer.',
        'Eight years on the restaurant floor, up to floor manager. The last two building automations for HR, real estate and SaaS teams. OptimalLoop now brings both together — for horeca.': 'Acht jaar op de vloer in de horeca, tot floor manager. De laatste twee jaar automatiseringen gebouwd voor HR-, vastgoed- en SaaS-teams. OptimalLoop brengt die twee nu samen — voor de horeca.',
        'Book a free 30-min call': 'Plan een gratis gesprek van 30 min',
        'See a system run →': 'Bekijk een systeem in actie →',
        'Free · 30 minutes · Dutch or English · You leave with 3 automations mapped for your business': 'Gratis · 30 minuten · Nederlands of Engels · Je gaat weg met 3 automatiseringen uitgewerkt voor jouw zaak',
        'Hiring costs, with 50+ hours a month back.': 'Wervingskosten, en 50+ uur per maand terug.',
        'A hiring system I built — for the problem every kitchen knows: finding staff.': 'Een wervingssysteem dat ik bouwde — voor het probleem dat elke keuken kent: personeel vinden.',
        'Fewer no-shows': 'Minder no-shows',
        'Rosters': 'Roosters',
        'Hiring': 'Werving',
        'Reviews': 'Reviews',
        'I come by in person': 'Ik kom gewoon langs',
        'anywhere in Limburg': 'overal in Limburg',
        'Fewer no-shows ✦': 'Minder no-shows ✦',
        'Rosters in minutes ✦': 'Roosters in minuten ✦',
        'Staff hired faster ✦': 'Sneller personeel ✦',
        'Invoices booked ✦': 'Facturen verwerkt ✦',
        'Every review answered ✦': 'Elke review beantwoord ✦',
        'What I automate': 'Wat ik automatiseer',
        'for horeca.': 'voor de horeca.',
        'The work that eats your week between services — handled before you open.': 'Het werk dat je week opslokt tussen de diensten door — geregeld voordat je opengaat.',
        'PROVEN · −50% COSTS': 'BEWEZEN · −50% KOSTEN',
        'FOR HORECA': 'VOOR HORECA',
        'Applications land on one board. Move a candidate, the interview invite sends itself.': 'Sollicitaties komen op één bord binnen. Verplaats een kandidaat en de uitnodiging voor het gesprek gaat vanzelf de deur uit.',
        'No-shows': 'No-shows',
        'WhatsApp reminders and a waitlist that refills cancelled tables on its own.': 'WhatsApp-herinneringen en een wachtlijst die geannuleerde tafels vanzelf weer vult.',
        'A schedule drafted from your expected covers, not from gut feeling.': 'Een rooster op basis van je verwachte aantal couverts, niet op gevoel.',
        'Invoices': 'Facturen',
        'Supplier invoices read, checked and ready for your bookkeeper.': 'Leveranciersfacturen uitgelezen, gecontroleerd en klaar voor je boekhouder.',
        'Every review answered in your tone. You approve with one tap.': 'Elke review beantwoord in jouw toon. Jij keurt goed met één tik.',
        '8 yrs': '8 jaar',
        'on the restaurant floor': 'op de vloer in de horeca',
        'systems shipped': 'systemen opgeleverd',
        '1,000+': '1.000+',
        'hours handed back to clients': 'uur teruggegeven aan klanten',
        'client reviews': 'klantreviews',
        'Watch it': 'Zie het',
        'light up.': 'oplichten.',
        'The hiring system, live. Your only job: drag the card.': 'Het wervingssysteem, live. Jouw enige taak: de kaart verslepen.',
        'Form': 'Formulier',
        'ClickUp card': 'ClickUp-kaart',
        'You drag it': 'Jij versleept hem',
        'Invite written': 'Uitnodiging geschreven',
        'Sent + logged': 'Verstuurd + vastgelegd',
        'See every step of the real scenario →': 'Bekijk elke stap van het echte scenario →',
        'Systems I’ve': 'Systemen die ik heb',
        'shipped.': 'opgeleverd.',
        'Built for HR, real estate and service businesses — the same building blocks I now use for horeca.': 'Gebouwd voor HR, vastgoed en dienstverleners — dezelfde bouwstenen die ik nu voor de horeca inzet.',
        'Next card →': 'Volgende kaart →',
        'All work →': 'Al het werk →',
        'HR · Operations': 'HR · Operations',
        'Hiring system': 'Wervingssysteem',
        'Applications land in ClickUp the second someone applies. Move a card to Interview 1 and the invite sends itself.': 'Sollicitaties staan in ClickUp zodra iemand solliciteert. Verplaats een kaart naar Interview 1 en de uitnodiging gaat vanzelf de deur uit.',
        '↓ 50% hiring costs · +50 hrs/month reclaimed': '↓ 50% wervingskosten · +50 uur/maand terug',
        'Real estate · Sales': 'Vastgoed · Sales',
        'AI sales concierge': 'AI-verkoopassistent',
        'A static lead form leaked leads. Now a conversation scores every lead, pushes it to the CRM and sends a tailored brochure.': 'Een statisch formulier liet leads weglekken. Nu beoordeelt een gesprek elke lead, zet hem in het CRM en stuurt een brochure op maat.',
        'A 24/7 sales agent with instant replies': 'Een verkoper die 24/7 direct antwoordt',
        'AI chatbot': 'AI-chatbot',
        'SuperChatbots flow': 'SuperChatbots-flow',
        'The complete chatbot flow for a client’s website, from start to finish — with automatic language and currency detection.': 'De complete chatbotflow voor de website van een klant, van begin tot eind — met automatische taal- en valutaherkenning.',
        'Runs smoothly, no dead moments or errors': 'Loopt soepel, zonder dode momenten of fouten',
        'Government · Data': 'Overheid · Data',
        'Autonomous data pipeline': 'Autonome datapijplijn',
        'Continuous extraction from heavily protected government portals, running unattended.': 'Doorlopend data ophalen uit zwaar beveiligde overheidsportalen, volledig zonder toezicht.',
        'Reliable, clean data — delivered automatically': 'Betrouwbare, schone data — automatisch geleverd',
        'AI infrastructure': 'AI-infrastructuur',
        'Custom agentic workflows': 'Agentische workflows op maat',
        'AI that handles multi-step reasoning on live data — far beyond simple trigger-and-action.': 'AI die meerstappige redeneringen uitvoert op live data — veel verder dan simpel trigger-en-actie.',
        'Self-correcting, and it scales with the business': 'Corrigeert zichzelf en groeit mee met het bedrijf',
        'Built not to': 'Gebouwd om niet te',
        'break.': 'breken.',
        'If a step fails, it recovers': 'Gaat een stap mis, dan herstelt hij',
        'Failed steps are retried or routed to an error path. If something still breaks, I get the alert — not your guests.': 'Mislukte stappen worden opnieuw geprobeerd of netjes afgehandeld. Gaat er toch iets mis, dan krijg ik de melding — niet je gasten.',
        'Every run is logged': 'Elke run wordt vastgelegd',
        'Each run leaves a full history, so you can see exactly what happened and when.': 'Elke run laat een volledige geschiedenis achter, zodat je precies ziet wat er gebeurde en wanneer.',
        'Built with the AVG in mind': 'Gebouwd met de AVG in gedachten',
        'Only the data that’s needed, kept only as long as it’s needed. A processing agreement on request.': 'Alleen de data die nodig is, en niet langer bewaard dan nodig. Een verwerkersovereenkomst op aanvraag.',
        'You own it': 'Het is van jou',
        'Every system documented, with a recorded walkthrough. Maintenance is optional, never a lock-in.': 'Elk systeem gedocumenteerd, met een opgenomen uitleg. Onderhoud is optioneel, nooit een verplichting.',
        'LESS ADMIN.': 'MINDER ADMIN.',
        'MORE FLOOR.': 'MEER VLOER.',
        'Book a free 30-minute call': 'Plan een gratis gesprek van 30 minuten',
        'Free · Dutch or English · You leave with 3 automations mapped for your business': 'Gratis · Nederlands of Engels · Je gaat weg met 3 automatiseringen uitgewerkt voor jouw zaak',
        'Hiring system — OptimalLoop': 'Wervingssysteem — OptimalLoop',
        'AI email categorizer — OptimalLoop': 'AI-e-mailsorteerder — OptimalLoop',
        '/ Hiring system': '/ Wervingssysteem',
        '/ AI email categorizer': '/ AI-e-mailsorteerder',
        'End-to-end hiring system': 'Wervingssysteem van begin tot eind',
        'AI email categorizer': 'AI-e-mailsorteerder',
        'Applicants land in ClickUp the second they apply. When the recruiter moves a candidate to Interview 1, a personal invitation goes out and is logged on the card — no copy-pasting, no forgotten emails.': 'Sollicitanten staan in ClickUp zodra ze solliciteren. Verplaatst de recruiter een kandidaat naar Interview 1, dan gaat er een persoonlijke uitnodiging de deur uit en wordt dat op de kaart vastgelegd — geen gekopieer, geen vergeten mails.',
        'Every incoming email is enriched with company info, categorised by AI and followed up the right way — filed away, flagged in Slack, or turned into ClickUp work with a reply.': 'Elke binnenkomende mail wordt aangevuld met bedrijfsinfo, door AI ingedeeld en op de juiste manier opgevolgd — gearchiveerd, gemeld in Slack of omgezet in ClickUp-werk met een antwoord.',
        'Challenge': 'Uitdaging',
        'Built with': 'Gebouwd met',
        'Result': 'Resultaat',
        'Hiring admin was eating 40+ hours a month.': 'Wervingsadministratie kostte 40+ uur per maand.',
        'A busy inbox where important emails got buried between everything else.': 'Een drukke inbox waarin belangrijke mails ondersneeuwden.',
        'Tally, Make.com, ClickUp, email': 'Tally, Make.com, ClickUp, e-mail',
        'Make.com, OpenAI, Slack, ClickUp, email': 'Make.com, OpenAI, Slack, ClickUp, e-mail',
        'Every email sorted and followed up — automatically': 'Elke mail gesorteerd en opgevolgd — automatisch',
        'Inside the': 'Een kijkje in het',
        'real system.': 'echte systeem.',
        'The actual scenarios in Make.com, and the ClickUp board the team works from.': 'De echte scenario’s in Make.com, en het ClickUp-bord waar het team mee werkt.',
        'The actual scenario in Make.com.': 'Het echte scenario in Make.com.',
        'Scenario 1 — a new Tally application becomes a ClickUp card.': 'Scenario 1 — een nieuwe Tally-sollicitatie wordt een ClickUp-kaart.',
        'Scenario 2 — moving a card to Interview 1 sends the invite and logs it.': 'Scenario 2 — een kaart naar Interview 1 verplaatsen verstuurt de uitnodiging en legt die vast.',
        'The ClickUp board: Intake → Reviewed → Interview 1 → Interview 2 → Hired / No Fit.': 'Het ClickUp-bord: Intake → Reviewed → Interview 1 → Interview 2 → Hired / No Fit.',
        'Watch email → categorise → follow up the right way.': 'Mail binnen → indelen → op de juiste manier opvolgen.',
        'HIRING EATING': 'SLOKT WERVING',
        'INBOX EATING': 'SLOKT JE INBOX',
        'YOUR WEEK?': 'JE WEEK OP?',
        'SCENARIO 1 · New application → ClickUp': 'SCENARIO 1 · Nieuwe sollicitatie → ClickUp',
        'SCENARIO 2 · Interview 1 → invite email': 'SCENARIO 2 · Interview 1 → uitnodiging per mail',
        'Run again': 'Opnieuw',
        'Pause': 'Pauze',
        'Play': 'Afspelen',
        'Running': 'Bezig',
        'Run complete': 'Run voltooid',
        'Waiting for trigger…': 'Wacht op trigger…',
        'Watch a real run, one module at a time.': 'Bekijk een echte run, module voor module.',
        'ClickUp stage': 'ClickUp-fase',
        'Recruiter moves card → Interview 1': 'Recruiter zet kaart op Interview 1',
        'Run complete — from application to interview invite without anyone typing an email.': 'Run voltooid — van sollicitatie tot uitnodiging zonder dat iemand een mail typt.',
        'Run complete — every email followed up the right way.': 'Run voltooid — elke mail op de juiste manier opgevolgd.',
        'Watch new responses': 'Nieuwe inzendingen',
        'Sleep': 'Wachten',
        'List field definitions': 'Velden ophalen',
        'Create a task': 'Taak aanmaken',
        'Custom webhook': 'Webhook',
        'Get a task': 'Taak ophalen',
        'Set variables': 'Variabelen instellen',
        'Send an email': 'Mail versturen',
        'Post a task comment': 'Reactie plaatsen',
        'Watch emails': 'Mails volgen',
        'Get company info': 'Bedrijfsinfo ophalen',
        'Parse JSON': 'JSON verwerken',
        'Categorize emails': 'Mails indelen',
        '4 routes': '4 routes',
        '2 routes': '2 routes',
        'Move an email': 'Mail verplaatsen',
        'Draft follow-up': 'Opvolging opstellen',
        'Error handler': 'Foutafhandeling',
        'Create a message': 'Bericht maken',
        'Prepare details': 'Details voorbereiden',
        'Task': 'Taak',
        'Follow-up': 'Opvolging',
        'A candidate submits the Tally application — the scenario wakes up.': 'Een kandidaat verstuurt de Tally-sollicitatie — het scenario wordt wakker.',
        'A short pause, so Tally has finished saving every answer.': 'Een korte pauze, zodat Tally elk antwoord heeft opgeslagen.',
        'The form’s fields are read, so every answer maps to the right ClickUp column.': 'De velden van het formulier worden gelezen, zodat elk antwoord in de juiste ClickUp-kolom komt.',
        'A candidate card appears in ClickUp under Intake — name, email and answers filled in.': 'Er verschijnt een kandidaatkaart in ClickUp onder Intake — naam, mail en antwoorden ingevuld.',
        'The recruiter reviews the card and drags it to Interview 1. That’s the only manual step.': 'De recruiter bekijkt de kaart en sleept hem naar Interview 1. Dat is de enige handmatige stap.',
        'ClickUp fires a webhook the moment the stage changes.': 'ClickUp stuurt een webhook zodra de fase verandert.',
        'The full candidate card is fetched from ClickUp.': 'De volledige kandidaatkaart wordt uit ClickUp opgehaald.',
        'A personal, branded invitation email is assembled.': 'Er wordt een persoonlijke uitnodiging in huisstijl samengesteld.',
        'The invite lands in the candidate’s inbox.': 'De uitnodiging staat in de inbox van de kandidaat.',
        'A comment is posted on the card, so the team sees the invite went out.': 'Er komt een reactie op de kaart, zodat het team ziet dat de uitnodiging is verstuurd.',
        'A new email arrives — the scenario picks it up.': 'Er komt een nieuwe mail binnen — het scenario pakt hem op.',
        'Sender and message details are stored for the next steps.': 'Afzender en berichtgegevens worden bewaard voor de volgende stappen.',
        'AI looks up who the sender’s company is.': 'AI zoekt uit bij welk bedrijf de afzender hoort.',
        'The answer is parsed into clean data.': 'Het antwoord wordt omgezet in nette data.',
        'AI decides which category the email belongs to.': 'AI bepaalt in welke categorie de mail hoort.',
        'The router sends the email down the route for its category.': 'De router stuurt de mail de route op die bij de categorie hoort.',
        'Route 1: the email is moved to its folder — nobody has to touch it.': 'Route 1: de mail gaat naar de juiste map — niemand hoeft hem aan te raken.',
        'Route 2: AI prepares the follow-up…': 'Route 2: AI bereidt de opvolging voor…',
        '…the result is parsed into structured data…': '…het resultaat wordt omgezet in gestructureerde data…',
        '…variables are set…': '…variabelen worden ingesteld…',
        '…and a second router decides where it goes.': '…en een tweede router bepaalt waar hij heen gaat.',
        'The team is notified in Slack.': 'Het team krijgt een melding in Slack.',
        'The email is filed into the right folder.': 'De mail wordt in de juiste map gezet.',
        'Route 3: a Slack message flags it to the team.': 'Route 3: een Slack-bericht maakt het team erop attent.',
        'Route 4: the team is alerted in Slack…': 'Route 4: het team krijgt een seintje in Slack…',
        '…AI prepares what the follow-up needs…': '…AI bereidt voor wat de opvolging nodig heeft…',
        '…the work lands in ClickUp…': '…het werk komt in ClickUp…',
        '…with everything the team needs…': '…met alles wat het team nodig heeft…',
        '…and the email gets its follow-up.': '…en de mail krijgt zijn opvolging.',

        // New pages (horeca redesign)
        'Sharif, founder of OptimalLoop': 'Sharif, oprichter van OptimalLoop',
        'Services — OptimalLoop': 'Diensten — OptimalLoop',
        'Hiring, no-shows, rosters, invoices and reviews — automated for restaurants and cafés in Limburg. The admin runs itself, you run the floor.': 'Werving, no-shows, roosters, facturen en reviews — geautomatiseerd voor restaurants en cafés in Limburg. De admin regelt zichzelf, jij runt de vloer.',
        'Automation that gives you': 'Automatisering die je',
        'your evenings back.': 'je avonden teruggeeft.',
        'Every application, from any job site or your own form, becomes a card with the answers filled in. Each stage you move a card to triggers the right message: the invite, the reminder, the polite no.': 'Elke sollicitatie, via welke vacaturesite of welk formulier dan ook, wordt een kaart met de antwoorden al ingevuld. Elke fase waar je een kaart naartoe sleept, stuurt het juiste bericht: de uitnodiging, de herinnering, de nette afwijzing.',
        'You decide:': 'Jij beslist:',
        'who gets an interview. The system does everything around that decision.': 'wie op gesprek komt. Het systeem doet alles rondom die beslissing.',
        'Guests get a friendly reminder the day before, with a one-tap confirm or cancel. A cancelled table goes straight to the waitlist, and the first guest to say yes gets it.': 'Gasten krijgen de dag ervoor een vriendelijke herinnering, met één tik om te bevestigen of te annuleren. Een geannuleerde tafel gaat direct naar de wachtlijst, en de eerste gast die ja zegt krijgt hem.',
        'the wording, the timing, and which tables are worth a deposit.': 'de tekst, het moment, en voor welke tafels je een aanbetaling vraagt.',
        'Reservations and last year’s numbers become a draft roster that respects availability, contracts and rest times. The draft lands with you before the week starts.': 'Reserveringen en de cijfers van vorig jaar worden een conceptrooster dat rekening houdt met beschikbaarheid, contracten en rusttijden. Het concept ligt bij jou voordat de week begint.',
        'the final roster. You move names, the system checks the rules.': 'het definitieve rooster. Jij schuift met namen, het systeem checkt de regels.',
        'Invoices from your mailbox or a photo are read, matched to the supplier and checked against the agreed prices. Anything odd is flagged; the rest goes to the bookkeeper in one tidy batch.': 'Facturen uit je mailbox of van een foto worden uitgelezen, aan de leverancier gekoppeld en gecheckt tegen de afgesproken prijzen. Wat afwijkt wordt gemarkeerd; de rest gaat in één nette batch naar de boekhouder.',
        'what gets paid. The chasing, sorting and typing is gone.': 'wat betaald wordt. Het najagen, sorteren en overtypen is weg.',
        'New reviews get a draft reply in your voice. You get it on your phone: approve, tweak or rewrite. Negative reviews are flagged so you see them first.': 'Nieuwe reviews krijgen een conceptantwoord in jouw toon. Je krijgt het op je telefoon: goedkeuren, aanpassen of herschrijven. Negatieve reviews worden gemarkeerd, zodat je die als eerste ziet.',
        'every word that goes out. Nothing is posted without your tap.': 'elk woord dat naar buiten gaat. Er wordt niets geplaatst zonder jouw tik.',
        'How we': 'Zo werken',
        'work.': 'we.',
        'Three steps. No jargon, no long project plans.': 'Drie stappen. Geen jargon, geen lange projectplannen.',
        'We map where the hours go': 'We brengen in kaart waar de uren heen gaan',
        'I come by, we walk through a normal week, and we map where the hours go. You leave with 3 automations that make sense for your business, and what each one would save.': 'Ik kom langs, we lopen een normale week door en brengen in kaart waar de uren heen gaan. Je houdt 3 automatiseringen over die passen bij jouw zaak, en wat elk ervan zou besparen.',
        'I build it into your tools': 'Ik bouw het in jouw tools',
        'I build the system in the tools you already use, test it with your real data, and switch it on without disrupting a single service. You get a walkthrough, not a manual.': 'Ik bouw het systeem in de tools die je al gebruikt, test het met je echte data en zet het aan zonder één dienst te verstoren. Je krijgt een rondleiding, geen handleiding.',
        'It keeps running, and grows with you': 'Het blijft draaien, en groeit met je mee',
        'Every run is logged. When the business changes, the system changes with it. Maintenance is optional, and I’m one message away when something needs adjusting.': 'Elke run wordt vastgelegd. Verandert de zaak, dan verandert het systeem mee. Onderhoud is optioneel, en ik ben één berichtje verwijderd als er iets bijgesteld moet worden.',
        'Also for other businesses.': 'Ook voor andere bedrijven.',
        'The same systems are built for HR teams, agencies and service businesses: hiring, inboxes, lead follow-up and data pipelines. Horeca is the focus, not the limit.': 'Dezelfde systemen bouw ik voor HR-teams, bureaus en dienstverleners: werving, inboxen, opvolging van leads en datapijplijnen. Horeca is de focus, niet de grens.',
        'See the systems I’ve shipped →': 'Bekijk de systemen die ik heb opgeleverd →',
        'What is the admin': 'Wat kost de admin',
        'costing you?': 'je eigenlijk?',
        'Move the slider to the hours your team spends on manual admin each month.': 'Zet de schuif op het aantal uren dat je team per maand aan handmatige admin besteedt.',
        'Hours a month spent on manual admin': 'Uren per maand aan handmatige admin',
        'Average hourly cost (€)': 'Gemiddelde kosten per uur (€)',
        'Estimated annual savings': 'Geschatte besparing per jaar',
        'Based on 80% of that work being automated. An estimate, not a quote.': 'Uitgaand van 80% van dat werk geautomatiseerd. Een schatting, geen offerte.',
        'Book a call to map this out →': 'Plan een gesprek om dit uit te werken →',
        'Work — OptimalLoop': 'Werk — OptimalLoop',
        'Systems OptimalLoop has shipped for HR, real estate, government data and service businesses — the same building blocks now used for horeca in Limburg.': 'Systemen die OptimalLoop heeft opgeleverd voor HR, vastgoed, overheidsdata en dienstverleners — dezelfde bouwstenen die nu voor de horeca in Limburg worden ingezet.',
        'Watch the system run →': 'Bekijk het systeem in actie →',
        'A static form became a 24/7 automated sales agent with instant customer support': 'Een statisch formulier werd een geautomatiseerde verkoper die 24/7 direct reageert',
        'Reliable, automated delivery of clean, cloud-synced data': 'Betrouwbare, automatische levering van schone, cloud-gesynchroniseerde data',
        'A hands-off, self-correcting AI infrastructure that scales with the business': 'Een zelfcorrigerende AI-infrastructuur die zonder omkijken meegroeit met het bedrijf',
        'What clients': 'Wat klanten',
        'say.': 'zeggen.',
        'YOUR ADMIN': 'JOUW ADMIN',
        'COULD BE NEXT.': 'KAN DE VOLGENDE ZIJN.',
        'About — OptimalLoop': 'Over mij — OptimalLoop',
        'Sharif, founder of OptimalLoop: eight years in hospitality up to floor manager, two years building automations. Now automation for restaurants and cafés in Limburg, in person.': 'Sharif, oprichter van OptimalLoop: acht jaar horeca tot floor manager, twee jaar automatiseringen bouwen. Nu automatisering voor restaurants en cafés in Limburg, gewoon langs de deur.',
        'Meet the architect': 'Maak kennis met de architect',
        'Hi, I’m': 'Hoi, ik ben',
        'Sharif.': 'Sharif.',
        'Before automation, I spent eight years in hospitality, up to floor manager. I know what a broken process feels like at 19:30 on a Saturday. Then I ran my own Shopify store for a year, and for the last two years I’ve built automations for HR teams, real estate, SaaS and service businesses. Now I’m bringing it home: OptimalLoop focuses on restaurants and cafés in Limburg — and I come by in person.': 'Voor automatisering zat ik acht jaar in de horeca, tot floor manager. Ik weet hoe een kapot proces voelt om 19:30 op een zaterdag. Daarna runde ik een jaar mijn eigen Shopify-winkel, en de laatste twee jaar bouw ik automatiseringen voor HR-teams, vastgoed, SaaS en dienstverleners. Nu breng ik het thuis: OptimalLoop richt zich op restaurants en cafés in Limburg — en ik kom gewoon langs.',
        'See my work →': 'Bekijk mijn werk →',
        'hours saved for clients': 'uur bespaard voor klanten',
        '2+ yrs': '2+ jaar',
        'building automation': 'automatiseringen bouwen',
        'How I': 'Hoe ik',
        'got here.': 'hier kwam.',
        'Four steps, in order.': 'Vier stappen, op volgorde.',
        'Step 1': 'Stap 1',
        '8 years in hospitality': '8 jaar horeca',
        'From the floor to floor manager. Saturdays at 19:30 included.': 'Van de vloer tot floor manager. Zaterdagavond 19:30 inbegrepen.',
        'Step 2': 'Stap 2',
        '1 year running my own store': '1 jaar mijn eigen webshop',
        'An e-commerce store on Shopify, run on my own.': 'Een webshop op Shopify, in mijn eentje gerund.',
        'Step 3': 'Stap 3',
        'Automation for HR teams, real estate, SaaS and service businesses.': 'Automatisering voor HR-teams, vastgoed, SaaS en dienstverleners.',
        'Now': 'Nu',
        'Horeca specialist': 'Horecaspecialist',
        'Restaurants and cafés in Limburg. I come by in person.': 'Restaurants en cafés in Limburg. Ik kom gewoon langs.',
        'LET’S TALK': 'LATEN WE PRATEN',
        'AT YOUR PLACE.': 'BIJ JOU IN DE ZAAK.',
        'Contact — OptimalLoop': 'Contact — OptimalLoop',
        'Book a free 30-minute call or send a message. OptimalLoop automates hiring, no-shows, rosters, invoices and reviews for horeca in Limburg — Sharif comes by in person.': 'Plan een gratis gesprek van 30 minuten of stuur een bericht. OptimalLoop automatiseert werving, no-shows, roosters, facturen en reviews voor horeca in Limburg — Sharif komt gewoon langs.',
        'Where do the hours go in your week?': 'Waar gaan de uren in jouw week heen?',
        'Let’s map': 'Laten we',
        'your week.': 'jouw week in kaart brengen.',
        'Send a message': 'Stuur een bericht',
        'Message sent!': 'Bericht verzonden!',
        'Thanks — I’ll get back to you soon.': 'Bedankt — ik kom snel bij je terug.',
        'Your name': 'Je naam',
        'Email address': 'E-mailadres',
        'What would you like to automate?': 'Wat wil je automatiseren?',
        'No-shows & reservations': 'No-shows & reserveringen',
        'Invoices & bookkeeping': 'Facturen & boekhouding',
        'Your message': 'Je bericht',
        'Send message →': 'Verstuur bericht →',
        'Not ready to book yet?': 'Nog niet klaar om te plannen?',
        'No problem. Leave your details and I’ll get back to you. Or, if you’re ready to get started, book the call directly and we skip the back-and-forth.': 'Geen probleem. Laat je gegevens achter en ik neem contact met je op. Of, als je klaar bent om te beginnen, plan het gesprek direct en slaan we het heen-en-weer mailen over.',
        'Geleen, Limburg — I come by in person': 'Geleen, Limburg — ik kom gewoon langs',
        'Anywhere in Limburg, at a time that suits your service.': 'Overal in Limburg, op een moment dat past bij jouw dienst.',
        'Privacy Policy — OptimalLoop': 'Privacybeleid — OptimalLoop',
        'How OptimalLoop handles the information you share when you book a call, contact us or use our automation services.': 'Hoe OptimalLoop omgaat met de informatie die je deelt wanneer je een gesprek plant, contact opneemt of onze automatiseringsdiensten gebruikt.',
        'Last Updated: September 25, 2026': 'Laatst bijgewerkt: 25 september 2026',
        '1. Information We Collect': '1. Welke informatie we verzamelen',
        'We collect information you provide directly to us when you book a meeting, contact us, or engage our services. This may include your name, email address, company details, and information about your business processes.': 'We verzamelen informatie die je zelf aan ons geeft wanneer je een afspraak plant, contact opneemt of onze diensten afneemt. Dat kan je naam zijn, je e-mailadres, bedrijfsgegevens en informatie over je bedrijfsprocessen.',
        '2. How We Use Your Information': '2. Hoe we je informatie gebruiken',
        'We use the collected data to provide our automation services, communicate with you, and improve our internal AI models and workflows. We do not sell your personal data to third parties.': 'We gebruiken de verzamelde gegevens om onze automatiseringsdiensten te leveren, met je te communiceren en onze interne AI-modellen en workflows te verbeteren. We verkopen je persoonsgegevens niet aan derden.',
        '3. Data Processing & AI Integration': '3. Gegevensverwerking & AI-integratie',
        'As part of our automation services, your data may be processed through third-party AI providers (e.g., OpenAI API). We ensure that these integrations are configured using enterprise-grade privacy settings where available, and we do not use your proprietary business data to train public AI models without explicit consent.': 'Als onderdeel van onze automatiseringsdiensten kunnen je gegevens worden verwerkt via externe AI-aanbieders (bijvoorbeeld de OpenAI API). We zorgen dat deze koppelingen waar mogelijk met zakelijke privacy-instellingen zijn ingericht, en we gebruiken je bedrijfsgegevens niet om publieke AI-modellen te trainen zonder uitdrukkelijke toestemming.',
        '4. Security': '4. Beveiliging',
        'We implement technical and organizational measures to protect your information. However, no method of transmission over the internet or electronic storage is 100% secure.': 'We nemen technische en organisatorische maatregelen om je informatie te beschermen. Geen enkele manier van verzending via internet of elektronische opslag is echter 100% veilig.',
        '5. Your Rights': '5. Je rechten',
        'You have the right to access, update, or request the deletion of your personal data. To exercise these rights, please contact us at the email provided below.': 'Je hebt het recht om je persoonsgegevens in te zien, aan te passen of te laten verwijderen. Neem daarvoor contact met ons op via het e-mailadres hieronder.',
        '6. Language Detection': '6. Taaldetectie',
        'To show our website in Dutch or English, your browser may send your IP address to a third-party geolocation service (geojs.io), which returns only your approximate country and region. We do not store your IP address. Only the outcome (whether you are in a Dutch-speaking area) and any language you choose with the NL/EN switch are saved in your own browser\'s local storage.': 'Om onze website in het Nederlands of Engels te tonen, kan je browser je IP-adres sturen naar een externe geolocatiedienst (geojs.io), die alleen je land en regio bij benadering teruggeeft. We bewaren je IP-adres niet. Alleen de uitkomst (of je in een Nederlandstalig gebied bent) en de taal die je met de NL/EN-knop kiest, worden in de lokale opslag van je eigen browser bewaard.',
        '7. Contact Us': '7. Contact',
        'If you have any questions about this Privacy Policy, please reach out to us at': 'Heb je vragen over dit privacybeleid? Mail ons dan via',
        'Terms of Service — OptimalLoop': 'Algemene voorwaarden — OptimalLoop',
        'The terms under which OptimalLoop provides automation consulting, workflow development and implementation services.': 'De voorwaarden waaronder OptimalLoop advies over automatisering, workflow-ontwikkeling en implementatie levert.',
        'Last Updated: January 31, 2026': 'Laatst bijgewerkt: 31 januari 2026',
        '1. Acceptance of Terms': '1. Aanvaarding van de voorwaarden',
        'By accessing or using the services provided by OptimalLoop ("Agency", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.': 'Door gebruik te maken van de diensten van OptimalLoop ("bureau", "we", "ons" of "onze") ga je akkoord met deze algemene voorwaarden. Ga je niet akkoord, maak dan geen gebruik van onze diensten.',
        '2. Services Provided': '2. Geleverde diensten',
        'OptimalLoop provides AI automation consulting, workflow development, and implementation services. The specific scope of work for any project will be defined in a separate Statement of Work (SOW) or Service Agreement.': 'OptimalLoop levert advies over AI-automatisering, workflow-ontwikkeling en implementatie. De exacte omvang van een project wordt vastgelegd in een aparte opdrachtomschrijving (Statement of Work) of dienstverleningsovereenkomst.',
        '3. AI Performance Disclaimer': '3. Voorbehoud over AI-prestaties',
        'OptimalLoop utilizes third-party artificial intelligence technologies (such as OpenAI, Anthropic, n8n, and Make.com). While we strive for 100% accuracy and efficiency, AI models and automated workflows may occasionally produce unexpected results, errors, or "hallucinations." OptimalLoop is not liable for any losses, damages, or business interruptions resulting from AI-generated output or automated process failures.': 'OptimalLoop gebruikt AI-technologie van derden (zoals OpenAI, Anthropic, n8n en Make.com). We streven naar 100% nauwkeurigheid en efficiëntie, maar AI-modellen en geautomatiseerde workflows kunnen af en toe onverwachte resultaten, fouten of "hallucinaties" opleveren. OptimalLoop is niet aansprakelijk voor verliezen, schade of bedrijfsonderbrekingen als gevolg van AI-output of het uitvallen van geautomatiseerde processen.',
        '4. Intellectual Property': '4. Intellectueel eigendom',
        'Unless otherwise agreed in writing, OptimalLoop retains ownership of any proprietary frameworks, code snippets, or templates developed prior to or during the engagement. Clients are granted a non-exclusive, non-transferable license to use the delivered automation systems for their internal business operations.': 'Tenzij schriftelijk anders afgesproken, blijft OptimalLoop eigenaar van eigen frameworks, codefragmenten of sjablonen die voor of tijdens de opdracht zijn ontwikkeld. Klanten krijgen een niet-exclusieve, niet-overdraagbare licentie om de opgeleverde automatiseringssystemen te gebruiken voor hun interne bedrijfsvoering.',
        '5. Limitation of Liability': '5. Beperking van aansprakelijkheid',
        'To the maximum extent permitted by law, OptimalLoop shall not be liable for any indirect, incidental, special, or consequential damages, including loss of profits, data, or business opportunities, arising out of the use of our automated systems.': 'Voor zover de wet dat toestaat, is OptimalLoop niet aansprakelijk voor indirecte, incidentele, bijzondere of gevolgschade, waaronder verlies van winst, data of zakelijke kansen, die voortkomt uit het gebruik van onze geautomatiseerde systemen.',
        '6. Contact Information': '6. Contactgegevens',
        'For any questions regarding these terms, please contact us at': 'Vragen over deze voorwaarden? Mail ons via',
        'A hiring system that cut hiring costs by 50% and gave back 50+ hours a month: Tally, Make.com and ClickUp, with automatic interview invites.': 'Een wervingssysteem dat de wervingskosten met 50% verlaagde en 50+ uur per maand teruggaf: Tally, Make.com en ClickUp, met automatische uitnodigingen voor gesprekken.',
        'Make.com scenario 1: Tally, Sleep, Tally fields, ClickUp task': 'Make.com-scenario 1: Tally, Sleep, Tally-velden, ClickUp-taak',
        'Make.com scenario 2: webhook, ClickUp, email HTML, email, ClickUp comment': 'Make.com-scenario 2: webhook, ClickUp, e-mail-HTML, e-mail, ClickUp-reactie',
        'ClickUp hiring board grouped by stage': 'ClickUp-wervingsbord gegroepeerd per fase',
        'An AI email categorizer in Make.com: every email enriched, categorised and followed up the right way — filed, flagged in Slack or turned into ClickUp work.': 'Een AI-e-mailsorteerder in Make.com: elke mail aangevuld, ingedeeld en op de juiste manier opgevolgd — gearchiveerd, gemeld in Slack of omgezet in ClickUp-werk.',
        'Make.com scenario: watch email, AI company info, AI categorise, router with four routes': 'Make.com-scenario: mails volgen, AI-bedrijfsinfo, AI-indeling, router met vier routes'
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
