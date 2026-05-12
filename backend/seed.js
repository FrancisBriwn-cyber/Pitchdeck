require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query('BEGIN');

    // --- Clear existing seed data ---
    await client.query('DELETE FROM feedback');
    await client.query('DELETE FROM pitches');
    await client.query(`DELETE FROM users WHERE email = ANY(ARRAY[
      'amara@seed.dev','kofi@seed.dev','nadia@seed.dev',
      'emeka@seed.dev','priya@seed.dev','lucas@seed.dev'
    ])`);

    // --- Insert 6 users in one query ---
    const hash = await bcrypt.hash('Seed@1234', 10);
    const userRows = await client.query(`
      INSERT INTO users (name, email, password_hash) VALUES
        ('Amara Osei',     'amara@seed.dev', $1),
        ('Kofi Mensah',    'kofi@seed.dev',  $1),
        ('Nadia Trabelsi', 'nadia@seed.dev', $1),
        ('Emeka Okafor',   'emeka@seed.dev', $1),
        ('Priya Sharma',   'priya@seed.dev', $1),
        ('Lucas Ferreira', 'lucas@seed.dev', $1)
      RETURNING id, email
    `, [hash]);

    const byEmail = {};
    userRows.rows.forEach(r => { byEmail[r.email] = r.id; });
    const u1 = byEmail['amara@seed.dev'];
    const u2 = byEmail['kofi@seed.dev'];
    const u3 = byEmail['nadia@seed.dev'];
    const u4 = byEmail['emeka@seed.dev'];
    const u5 = byEmail['priya@seed.dev'];
    const u6 = byEmail['lucas@seed.dev'];

    // --- Insert 20 pitches in one query ---
    const pitchRows = await client.query(`
      INSERT INTO pitches (user_id, name, one_liner, problem, solution, target_market, cover_image_url) VALUES
      ($1,'PaySplit','Instant bill-splitting for African mobile money users.',
        'Splitting bills among friends in Africa is painful — bank transfers are slow and every mobile money app works in silos with no group payment feature.',
        'A lightweight app integrating with M-Pesa, MTN MoMo, and Airtel Money to let groups split and settle bills in seconds, with automatic reminders for those who owe.',
        'Urban millennials in East and West Africa who regularly dine out, travel, or share household expenses.',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop&auto=format'),

      ($1,'MicroVault','A digital group savings club (susu) for gig workers with no bank account.',
        'Informal savings groups are still managed via WhatsApp and paper, leading to fraud, poor record-keeping, and zero interest on pooled funds.',
        'A mobile app that digitises rotating savings groups: members contribute automatically on payday and funds rotate with a verified payout schedule stored on-chain.',
        'Gig economy workers and market traders across Africa who lack formal banking but actively save informally.',
        'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&h=450&fit=crop&auto=format'),

      ($1,'CropSense','AI crop disease detection for smallholder farmers via WhatsApp.',
        'Smallholder farmers lose up to 40% of yields to undetected crop diseases because agronomists are expensive and scarce outside city limits.',
        'Farmers photograph affected leaves and send via WhatsApp. The ML model identifies the disease and returns treatment advice in their local language within 60 seconds.',
        'Smallholder maize and cassava farmers in sub-Saharan Africa with basic smartphones.',
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=450&fit=crop&auto=format'),

      ($1,'HarvestLink','Direct farm-to-restaurant marketplace cutting out produce middlemen.',
        'Restaurants in major African cities overpay for fresh produce because 3–4 middlemen take margins, and farmers still earn less than 20% of the final retail price.',
        'A B2B marketplace where verified farms list daily harvest availability; restaurants browse, compare prices, and place orders for next-morning delivery with cold-chain logistics included.',
        'Mid-size restaurants and hotel kitchens in Lagos, Nairobi, and Accra; smallholder farms within a 200 km radius.',
        'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=450&fit=crop&auto=format'),

      ($2,'StudyCircle','Peer tutoring marketplace for African university students.',
        'University students struggle to afford private tutors, while high-achieving peers have no structured way to monetise their knowledge during term time.',
        'A two-sided marketplace where students post subjects they need help with and verified peer tutors bid to teach — sessions happen via built-in video call or in-person.',
        'Undergraduate students at universities in Nigeria, Ghana, and Kenya.',
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=450&fit=crop&auto=format'),

      ($2,'EduBox','Offline-first learning device pre-loaded with the full national curriculum.',
        'Rural schools in Africa have no reliable internet, cutting students off from digital educational resources that their urban peers access freely.',
        'A ruggedised tablet with a solar charging case that ships pre-loaded with curriculum videos, exercises, and a progress tracker that syncs to a teacher dashboard when connectivity is available.',
        'Primary and secondary schools in off-grid communities across East Africa.',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=450&fit=crop&auto=format'),

      ($2,'VocabAI','Adaptive language tutor that teaches English through everyday WhatsApp chats.',
        'Millions of African adults need to improve their English for career growth but cannot afford classes, and language apps feel detached from real conversation.',
        'An AI chat persona on WhatsApp that teaches vocabulary and grammar through daily conversational exchanges, adapting difficulty to each learner''s level and sending bite-sized lessons during commute hours.',
        'Young adults aged 18–30 in Francophone and Lusophone Africa who want to improve their professional English.',
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop&auto=format'),

      ($3,'MediTrack','Smart prescription tracker that alerts patients before they run out of medication.',
        'Patients with chronic conditions frequently miss doses or run out of medication because they forget to refill on time — leading to preventable hospitalisations.',
        'A mobile app where patients log prescriptions; smart reminders fire 3 days before a refill is needed, with one-tap reorder from partnered pharmacies and caregiver alert sharing.',
        'Adults over 40 managing chronic conditions in urban sub-Saharan Africa.',
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=450&fit=crop&auto=format'),

      ($3,'ClinicQueue','Virtual queue and appointment booking for overcrowded public clinics.',
        'Patients at public health clinics spend 3–5 hours waiting in queues, missing work and sometimes returning home unseen when the clinic closes.',
        'Patients book a slot via USSD or web app and receive an SMS when 30 minutes away from being seen. No smartphone required for basic USSD access.',
        'Out-patients at public health facilities in Rwanda, Uganda, and Tanzania.',
        'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=450&fit=crop&auto=format'),

      ($3,'MentalSpace','Anonymous mental health support platform built for African cultural contexts.',
        'Mental health stigma prevents people from seeking help, available therapists are unaffordable, and Western therapy apps feel culturally alien to African users.',
        'An anonymous app offering AI-guided journaling, peer support circles with trained community moderators, and affordable therapist video sessions starting at $5.',
        'Professionals aged 22–38 in major African cities experiencing work stress, anxiety, or depression.',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop&auto=format'),

      ($4,'FreightLink','Real-time marketplace connecting cargo shippers to available truck drivers.',
        'SMEs moving goods waste hours calling brokers to find trucks, and truck owners lose revenue driving empty on return legs — a double inefficiency that inflates shipping costs.',
        'Shippers post loads and nearby verified truck drivers bid in real time. The lowest bid wins, payment is held in escrow, and both parties are rated after delivery.',
        'SMEs and wholesalers shipping between major cities in Nigeria and Ghana.',
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop&auto=format'),

      ($4,'LastMile','Motorbike delivery network for e-commerce businesses in tier-2 African cities.',
        'E-commerce brands ship easily to capital cities but last-mile delivery in smaller cities is slow and unreliable, causing high cart abandonment for out-of-capital buyers.',
        'A franchise network of vetted motorbike riders in tier-2 cities who fulfil e-commerce deliveries within 4 hours. Businesses integrate via a simple API or dashboard.',
        'E-commerce brands wanting to reach customers in secondary Nigerian and Ghanaian cities.',
        'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&h=450&fit=crop&auto=format'),

      ($4,'RentVerify','Background-check platform building rental reputations for African landlords and tenants.',
        'Landlords lose money to defaulting tenants and tenants lose deposits to fraudulent landlords because there is no trusted rental history database in Africa.',
        'Both landlords and tenants build a verified rental reputation after each tenancy. A one-time ID-linked report is generated for new rental applications, reducing risk for both parties.',
        'Private landlords and prospective tenants in Nairobi, Lagos, and Accra.',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop&auto=format'),

      ($5,'CoNest','Co-living matching platform for young professionals relocating to African cities.',
        'Young professionals relocating to a new city have no trusted way to find compatible flatmates, and rental agents charge steep fees for poor matches.',
        'Users complete a lifestyle compatibility quiz; the algorithm surfaces verified flatmate matches with compatible schedules, cleanliness habits, and budgets. Leases are co-signed through the app.',
        'Young professionals aged 22–32 relocating to Lagos, Nairobi, Cape Town, or Accra for work.',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=450&fit=crop&auto=format'),

      ($5,'NutriCoach','Personalised weekly meal plans built entirely around local African foods.',
        'Most nutrition apps recommend Western superfoods that are expensive or unavailable in African markets, making the advice irrelevant and unsustainable.',
        'Users input health goals, restrictions, and location; AI generates weekly meal plans using affordable local ingredients and delivers shopping lists to WhatsApp every Sunday.',
        'Health-conscious urban adults aged 25–45 in major African cities.',
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=450&fit=crop&auto=format'),

      ($5,'ChopBox','Weekly subscription box delivering pre-measured African recipe ingredients to your door.',
        'Busy working parents want to cook traditional meals at home but lack time to source ingredients from multiple markets, leading to reliance on unhealthy fast food.',
        'A weekly subscription box with exact pre-measured ingredients for three traditional recipes, plus a QR code linking to a video tutorial for each. Recipes rotate seasonally.',
        'Dual-income households with children in Lagos, Accra, and Nairobi who value home cooking but are time-constrained.',
        'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800&h=450&fit=crop&auto=format'),

      ($6,'TalentLaunch','Portfolio-first job board for African tech talent — no CVs required.',
        'African developers and designers are overlooked by global employers because CV-based hiring filters out candidates without Western credentials or university pedigrees.',
        'Candidates build a verified project portfolio on TalentLaunch; companies browse skills and real work first. No CV upload, no degree filter — just demonstrated ability.',
        'Self-taught and bootcamp-trained developers and designers across Africa seeking remote global roles.',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop&auto=format'),

      ($6,'GigPay','Instant cross-border payroll for African freelancers paid by international clients.',
        'African freelancers doing remote work face 7–14 day settlement delays, heavy bank fees, and PayPal restrictions — losing up to 15% of earnings to friction.',
        'Clients pay via card or bank transfer in their currency; GigPay converts and settles to the freelancer''s mobile money or local bank in under 2 hours at a flat 1.5% fee.',
        'African freelancers on Upwork, Toptal, and direct client contracts earning in USD or EUR.',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=450&fit=crop&auto=format'),

      ($6,'SolarFlex','Pay-as-you-go solar panels for households that cannot afford upfront installation.',
        'Over 600 million Africans lack grid electricity, but the upfront cost of solar systems is prohibitive. Most PAYG products are too small to power anything beyond a lamp.',
        'SolarFlex leases full home solar systems for a daily mobile-money payment of under $0.50, with ownership transferring after 36 months.',
        'Off-grid and unreliably-gridded households in rural Nigeria, Tanzania, and Mozambique.',
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=450&fit=crop&auto=format'),

      ($6,'RecycloHub','Gamified plastic waste collection that pays households in airtime and data.',
        'African cities generate millions of tonnes of plastic waste annually but informal recycling rates are below 10% because there is no convenient, rewarding way to participate.',
        'Households bag sorted plastic and schedule a pickup via the app. A verified collector scans and weighs the haul; the household is instantly credited with airtime or mobile data.',
        'Urban households in Accra, Lagos, and Dar es Salaam; corporate sustainability teams needing verified waste diversion data.',
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=450&fit=crop&auto=format')

      RETURNING id, name
    `, [u1, u2, u3, u4, u5, u6]);

    // Map pitch name -> id
    const byName = {};
    pitchRows.rows.forEach(r => { byName[r.name] = r.id; });

    // Owner map for each pitch (needed to pick non-owner reviewers)
    const pitchOwners = {
      PaySplit: u1, MicroVault: u1, CropSense: u1, HarvestLink: u1,
      StudyCircle: u2, EduBox: u2, VocabAI: u2,
      MediTrack: u3, ClinicQueue: u3, MentalSpace: u3,
      FreightLink: u4, LastMile: u4, RentVerify: u4,
      CoNest: u5, NutriCoach: u5, ChopBox: u5,
      TalentLaunch: u6, GigPay: u6, SolarFlex: u6, RecycloHub: u6,
    };

    const allUserIds = [u1, u2, u3, u4, u5, u6];
    const reviewersFor = (ownerId) => allUserIds.filter(id => id !== ownerId);

    // --- All 100 feedback entries in one batch ---
    // Build a single flat params array and VALUES clause
    const fbValues = [];
    const fbParams = [];
    let p = 1;

    const feedbackBanks = {
      PaySplit: [
        ['Tapping existing mobile money rails is the smartest GTM move — no need to build payments from scratch.', 'Add a recurring split option for monthly shared costs like rent or utility bills.', true],
        ['The multi-network support immediately triples the addressable market.', 'Consider offline mode — a queued transaction system would be powerful for patchy data areas.', true],
        ['Automatic reminders for people who owe is the killer feature — removes awkward conversations.', 'Add the ability to attach a photo of the receipt so everyone sees exactly what they are splitting.', true],
        ['Simple concept that solves a genuine daily pain point millions of people face every week.', 'Allow group savings within the same app so the product deepens beyond a one-time split tool.', false],
        ['Potential to partner with restaurants for auto-split at point of sale — a massive upgrade.', 'Currency conversion for cross-border groups (e.g. Kenyan and Nigerian friends splitting a trip) would set you apart.', true],
      ],
      MicroVault: [
        ['Digitising susu groups is long overdue — the informal savings market is enormous and largely untouched.', 'Add a borrowing feature where members can take advances against their upcoming payout at a low rate.', true],
        ['The immutable payout schedule builds the trust that WhatsApp groups currently lack entirely.', 'Make circle creation frictionless — a simple invite link that works even on feature phones.', true],
        ['Targeting gig workers with no bank account is a smart niche — they are underserved and financially disciplined.', 'Partner with microfinance institutions so consistent savers can unlock formal credit scores over time.', true],
        ['The on-chain record-keeping removes the human fraud element that destroys many informal savings groups.', 'Educate users on the blockchain aspect carefully — many target users distrust anything crypto-related.', false],
        ['Interest on pooled funds before payout is a genuinely new value-add over manual susu management.', 'Build a group chat feature inside the app to keep the community cohesion that WhatsApp groups currently provide.', true],
      ],
      CropSense: [
        ['WhatsApp delivery is genius — farmers already use it daily with zero learning curve required.', 'Partner with agro-dealers so treatment products can be ordered in the same conversational flow.', true],
        ['The 60-second turnaround time is a strong, concrete, and measurable hook for any pitch.', 'Show a confidence percentage with each diagnosis so farmers know when to seek a second opinion.', false],
        ['Local language support removes the biggest barrier to technology adoption in rural areas.', 'Expand the model to cover livestock diseases — many smallholders keep animals alongside crops.', true],
        ['The loss-prevention framing (40% yield loss) is a compelling ROI argument for any donor or investor.', 'Consider a seasonal subscription model — freemium detection with paid treatment plans for predictable revenue.', true],
        ['Aggregated disease reports create a valuable heatmap product for governments and researchers.', 'Collect GPS data with consent from each report to build regional disease spread maps over time.', true],
      ],
      HarvestLink: [
        ['Attacking the middlemen problem head-on is brave and the margin recovery for farmers is compelling.', 'Cold-chain logistics is hard to operate — consider partnering rather than building it yourself initially.', true],
        ['The daily harvest availability model reduces food waste and gives restaurants fresher produce.', 'Build a futures feature so restaurants can lock in prices for seasonal produce well in advance.', true],
        ['Restaurants have consistent, predictable demand — much easier to serve than consumer retail.', 'Start with one city and one produce category (e.g. Lagos + tomatoes) rather than launching broadly.', false],
        ['Verified farm profiles build the trust that makes B2B buyers comfortable switching from middlemen.', 'A quality grading system (Grade A/B/C) would help restaurants make purchase decisions more confidently.', true],
        ['The dual-sided impact (farmers earn more, restaurants pay less) is a strong press and investor story.', 'Offer farm management tools (planting schedules, yield tracking) to deepen stickiness on the supply side.', true],
      ],
      StudyCircle: [
        ['Peer knowledge is the most abundant underutilised resource on any campus — this unlocks it brilliantly.', 'Add a rigorous tutor verification step to protect academic integrity and maintain quality standards.', true],
        ['The bidding model keeps pricing competitive and fair, unlike fixed-rate private tutors.', 'Include a session recording feature (with consent) so students can review lessons later.', true],
        ['Built-in video call removes the awkwardness of meeting strangers for the first session.', 'Add a group session option where 4–6 students split the cost for one tutor — far more affordable.', true],
        ['University corridors are a powerful distribution channel — a campus ambassador programme would spread this virally.', 'Allow tutors to build profiles with reviews over time so students can choose beyond just price.', false],
        ['A clear revenue model: the platform takes a cut of each session — simple and scalable from day one.', 'Partner with universities for exam prep periods — that is when demand spikes and institutional endorsement drives sign-ups.', true],
      ],
      EduBox: [
        ['Offline-first is non-negotiable for the target market and you have got it right from day one.', 'Work with national Ministries of Education for curriculum approval — this unlocks government procurement contracts.', true],
        ['The solar charging case solves the power problem at the same time as the content problem — smart design.', 'Target unit cost below $50 to be viable for school procurement budgets in low-income districts.', true],
        ['Teacher dashboard that syncs on connectivity gives educators visibility without requiring constant internet.', 'Add a multilingual layer — curriculum in local language alongside English would massively boost comprehension.', true],
        ['Ruggedised build for classroom use shows you understand the environment these devices will live in.', 'Partner with NGOs and development banks (USAID, GPE) for subsidised distribution — pure commercial sales will be slow.', false],
        ['Progress tracking lets teachers identify struggling students proactively rather than waiting for exam results.', 'Build a community content library so teachers can add local context and examples alongside the standard curriculum.', true],
      ],
      VocabAI: [
        ['Teaching through WhatsApp is brilliant — the channel is already open, trusted, and used all day long.', 'Add voice note exercises so users practise speaking, not just reading and writing.', true],
        ['Adaptive difficulty means the product works for absolute beginners and intermediate users equally well.', 'Build a peer practice feature so two learners can be matched for conversation practice alongside AI chat.', true],
        ['Bite-sized lessons during commute hours is the right timing insight — microlearning beats long sessions for retention.', 'Offer Spanish and French versions from day one — Francophone Africa is an enormous untapped market.', false],
        ['No app download required removes the biggest barrier to adoption in markets with limited phone storage.', 'Gamify streaks and progress badges to increase daily retention — Duolingo streak mechanics drive enormous re-engagement.', true],
        ['Professional English is a genuine career accelerator — users are solving a high-value problem they will pay for.', 'Partner with employers who pay for employee English upskilling — B2B contracts provide more stable revenue than consumer subs.', true],
      ],
      MediTrack: [
        ['Timely refill reminders could genuinely prevent hospitalisations — high-impact healthcare at very low cost.', 'Let caregivers also receive alerts for elderly patients who may not check their phones reliably.', true],
        ['One-tap reorder from partnered pharmacies is a smart conversion funnel built into the reminder moment.', 'Add prescription photo scanning so patients do not have to type complex drug names manually.', true],
        ['Chronic disease focus (diabetes, hypertension) targets conditions where adherence is most critical and measurable.', 'Build a doctor-facing dashboard so physicians can monitor patient adherence remotely — powerful B2B2C angle.', true],
        ['USSD fallback for non-smartphone users would reach the 60% of chronic patients over 50 with basic phones.', 'Monetise through pharmacy commissions and health insurance partnerships rather than charging patients directly.', false],
        ['Medication adherence data aggregated anonymously is a valuable dataset for pharma companies and health insurers.', 'Integrate with health insurance plans to reward adherent patients with premium discounts — aligns all incentives perfectly.', true],
      ],
      ClinicQueue: [
        ['USSD fallback means zero smartphone dependency — works for any patient in any African country from day one.', 'Add a triage feature so urgent cases can be flagged and prioritised automatically without manual clinic intervention.', true],
        ['The 30-minute SMS heads-up is the right interval — early enough to prepare, late enough not to cause confusion.', 'Strong clinic buy-in is everything — consider a fully funded pilot with one clinic to generate the case study you need.', true],
        ['Eliminating 3–5 hour waits benefits both patients and clinic throughput — a genuinely compelling dual win.', "Integrate with the clinic's existing patient management system rather than asking staff to manage two systems.", true],
        ['The government health system is a lucrative B2G market if you can navigate procurement — an NGO partnership helps.', 'Add a symptom pre-assessment form before booking so clinicians have context before the patient walks in.', true],
        ['Reducing patient no-shows also benefits the clinic — pitch this as a double win for administrators, not just a patient app.', 'Consider a clinic SaaS model where you charge the facility, not the patient — public health users rarely pay for apps.', false],
      ],
      MentalSpace: [
        ['Anonymity is the single most important feature for mental health in Africa — without it nobody joins.', 'Train community moderators extensively — poorly handled peer support can cause harm if a user is in crisis.', true],
        ['The $5 therapist session price point makes professional support accessible to a vast market with no current option.', 'Offer employer wellness packages — companies are increasingly paying for employee mental health support as an HR benefit.', true],
        ['AI journaling as a low-commitment first step lowers the barrier before users commit to a human session.', 'Build robust crisis detection in the AI layer with clear escalation paths to professional help when risk is detected.', true],
        ['Cultural context in therapy framing is a massive differentiator over Western apps that feel foreign to African users.', 'Partner with professional psychology associations for therapist vetting — credibility is paramount in mental health.', false],
        ['Peer support circles facilitated by trained moderators scale the human touch beyond what AI or therapists can reach alone.', 'Be careful about data privacy regulation — mental health data is extremely sensitive and users need strong reassurances.', true],
      ],
      FreightLink: [
        ['The escrow model removes the trust barrier that prevents strangers from transacting — essential for this market.', 'Include cargo insurance for high-value shipments — without this, risk-averse businesses will not switch from brokers.', true],
        ['The empty-truck return problem is massive and genuinely underserved — capturing this demand doubles driver revenue.', 'Driver rating systems need to be live from day one — a single bad delivery experience kills early word-of-mouth.', true],
        ['Real-time bidding creates price discovery that the market currently lacks completely — brilliant for both sides.', 'Offer a premium subscription tier for SMEs with guaranteed truck availability SLAs — predictability commands a price premium.', true],
        ['Verified driver profiles with vehicle inspection records build trust that makes fleet managers comfortable switching.', 'Build live GPS tracking so shippers can follow their cargo in real time — this is now table stakes for B2B logistics.', false],
        ['Aggregating load data lets you offer analytics to shippers about shipping costs and delivery performance over time.', 'Add a document management layer (waybills, delivery notes) so the entire paper trail lives alongside the transaction.', true],
      ],
      LastMile: [
        ['Tier-2 cities are a massive gap in African e-commerce infrastructure — first-mover advantage here is enormous.', 'Motorbike coverage works for small packages but you will need cargo tricycles for larger orders — plan for this from day one.', true],
        ['The 4-hour SLA is ambitious but credible for intracity delivery — competitive with same-day delivery globally.', 'The franchise model requires strong onboarding and standards enforcement — invest heavily in franchisee training.', true],
        ['API integration for e-commerce brands is the right B2B play — plug into existing fulfilment workflows.', 'Start with one city and one e-commerce vertical (e.g. fashion) to prove unit economics before national rollout.', true],
        ['Brands gain reliable reach into markets they would otherwise abandon — that retention value justifies a premium per-delivery fee.', 'Real-time tracking for end customers is now an expectation — build the consumer-facing tracker from day one.', false],
        ['The local franchise model creates employment for motorbike riders who currently lack organised platforms.', 'Offer revenue share to franchise owners rather than a fixed fee — aligns incentives for quality and growth.', true],
      ],
      RentVerify: [
        ['A dual reputation system scoring both landlords and tenants is fair, novel, and far more useful than tenant-only checks.', 'The chicken-and-egg cold start is the hardest problem here — partner with estate agents to seed initial data.', true],
        ['Solves a genuine trust deficit that causes enormous economic harm to both sides of the rental market.', 'Consider a government registry partnership to cross-reference ID verification and reduce fraudulent profiles.', true],
        ['The one-time report model means tenants only pay once to access their reputation, keeping ongoing cost low.', 'Add a dispute resolution mechanism — verified tenants need a clear way to challenge unfair landlord reviews.', true],
        ['Landlord verification (not just tenants) is the differentiator that will drive tenant adoption — most platforms only screen tenants.', 'Launch in student accommodation first — high turnover creates the volume of completed tenancies needed for database density.', false],
        ['Financial institutions could use rental payment history as a credit signal — a partnership of enormous long-term value.', 'Make the report shareable as a QR code on a phone — landlords in informal markets will not visit a website to check.', true],
      ],
      CoNest: [
        ['The lifestyle compatibility quiz addresses root causes of flatmate mismatches, not just logistics of finding a room.', 'Add a trial period option (e.g. one week) before committing to a full lease — reduces commitment anxiety for first-time sharers.', true],
        ['Co-signing leases through the app creates a legal paper trail that protects both flatmates if disputes arise.', 'Verified identity checks are essential — users need confidence their flatmate is who they claim to be before handing over a key.', true],
        ['Targeting relocation specifically is smart — people moving to a new city have the highest urgency and lowest social network.', 'Build a community layer (local area guides, event suggestions) to help users settle into a new city beyond finding a flat.', false],
        ["Cutting estate agent fees is a powerful value proposition — agents often charge one month's rent for minutes of work.", 'Add a verified room listing feature so users can find the room and flatmate in one flow rather than arriving with their own property.', true],
        ['Network effects are strong: happy flatmate matches share the platform with their next round of flatmates automatically.', 'Consider a neighbourhood-based cohort feature so flatmates are likely to share commute routes or social circles.', true],
      ],
      NutriCoach: [
        ['Building plans around local foods makes this immediately practical rather than aspirationally healthy — right call.', 'Add a community recipe section where users can share and rate local healthy meal discoveries.', true],
        ['WhatsApp delivery eliminates the app install barrier — the shopping list arrives where users already coordinate with family.', 'Partner with local supermarkets and market vendors for discount coupons on recommended ingredients.', true],
        ['Seasonal menu rotation keeps the product fresh and models real African eating patterns which vary significantly by season.', 'Offer a version for specific conditions (diabetes-friendly, hypertension diet) in collaboration with clinicians — B2B2C through hospitals.', true],
        ['The shopping list format is a clever conversion funnel — from advice to purchase in one step for a potential grocery affiliate model.', 'Include calorie and macronutrient information for users with specific fitness goals — many urban adults now track these closely.', false],
        ['Localised nutrition advice fills a real gap that no global nutrition app has credibly addressed for African diets.', 'Build a feedback loop so users rate meals they cooked — this data improves recommendations and builds a rich local food dataset.', true],
      ],
      ChopBox: [
        ['The QR code to cooking video transfers traditional cooking knowledge digitally without requiring literacy.', 'Offer a monthly subscription option alongside weekly — some families want to plan further ahead or budget monthly.', true],
        ['Pre-measured ingredients remove the last barrier for busy parents — no weighing, no guessing, no market runs.', 'Ensure cold-chain packaging is robust — protein ingredients (meat, fish) need reliable refrigeration to avoid food safety issues.', true],
        ['Seasonal recipe rotation keeps the product surprising and reflects how African home cooking actually works.', 'Partner with community organisations (churches, schools) for group subscriptions — bulk pricing drives acquisition in social networks.', false],
        ['The dual benefit of convenience AND preserving cultural food heritage is a genuinely compelling emotional hook for parents.', 'Add a family size selector so ingredient quantities scale correctly — a box for 2 is very different from a box for 6.', true],
        ['The subscription model provides predictable revenue which makes inventory planning far more manageable than on-demand ordering.', 'Build a pantry tracker feature so the box only includes ingredients the family does not already have at home.', true],
      ],
      TalentLaunch: [
        ['Portfolio-first hiring removes credential bias at the structural level — both ethical and commercially smart.', 'Add a skills assessment layer so employers can benchmark candidates against objective standards, not just self-presented work.', true],
        ['Targeting self-taught and bootcamp graduates speaks to the largest and fastest-growing segment of African tech talent.', 'Include a salary transparency feature showing band ranges per role — this levels the negotiation playing field for candidates.', true],
        ['The no-CV rule is a bold product statement that will generate press coverage and candidate word-of-mouth organically.', 'Build employer analytics showing diversity of hire by geography — valuable to global companies with DEI commitments.', true],
        ['Verified project portfolios reduce the risk of inflated CVs that plague traditional recruitment pipelines.', 'Add a mentorship layer so senior engineers can coach junior candidates — deepens engagement and builds community.', false],
        ['Remote global roles pay 5–10x local salaries — transformative economic impact of one successful placement drives strong word-of-mouth.', 'Partner with bootcamps to pre-populate the platform with verified portfolios at graduation — removes the cold-start candidate supply problem.', true],
      ],
      GigPay: [
        ['The flat 1.5% fee is a dramatically better deal than the 8–15% that PayPal and Western Union effectively charge African freelancers.', 'Regulatory compliance across multiple African markets is complex — hire a regulatory affairs specialist as an early team member.', true],
        ['Under-2-hour settlement is a massive differentiator over existing options that take 7–14 days with multiple conversion steps.', 'Offer invoice generation within the app so clients receive a professional document and freelancers have tax records automatically.', true],
        ['Supporting mobile money alongside bank accounts captures the full spectrum of African freelancer banking preferences.', 'Build a freelancer credit product using payment history as the underwriting signal — consistent earners are lower risk than traditional credit models suggest.', true],
        ['Aggregating freelancer payment flows creates a powerful data asset for financial services partnerships and revenue diversification.', 'Add a client onboarding flow that handles W-8BEN or equivalent tax documentation — international clients need this to pay foreign contractors compliantly.', false],
        ['The pain point is concrete and universal: every African freelancer on Upwork has experienced the settlement friction you are solving.', 'Offer a virtual USD account number so freelancers can receive payments from any client without GigPay needing a direct integration.', true],
      ],
      SolarFlex: [
        ['PAYG solar at under $0.50/day is price-competitive with kerosene and mobile charging costs that off-grid households already pay.', 'Hardware logistics and maintenance in rural areas is notoriously difficult — partner with an existing distribution network rather than building your own.', true],
        ['Ownership transfer after 36 months is a powerful motivator — the household is buying an asset while solving an immediate need.', 'Build a remote diagnostics layer so malfunctions can be detected and resolved before the customer even notices a problem.', true],
        ['Mobile money payment integration means no bank account is required — perfectly aligned with the off-grid household demographic.', 'Offer a referral programme where existing customers earn credit for introducing neighbours — critical for rural expansion where trust is hyperlocal.', true],
        ['Powering fans, TV, and phone charging addresses the full spectrum of household energy needs beyond just lighting.', 'Consider a system swap programme at end of lease so customers can upgrade to a larger system without starting from zero.', false],
        ['Carbon credit generation from verified off-grid solar adoption is a real revenue stream that could subsidise lower customer prices.', 'Partner with governments and DFIs early for concessional financing — the capex per unit is high and patient capital makes or breaks PAYG solar businesses.', true],
      ],
      RecycloHub: [
        ['Paying in airtime and data is a universally valued reward in Africa — smarter than cash which is hard to distribute at scale.', 'Educate households on sorting standards — contaminated or unsorted plastic dramatically reduces recycler value and your unit economics.', true],
        ['The corporate sustainability data product is a potentially larger revenue stream than the consumer-facing collection service.', 'Partner with major plastic producers (Coca-Cola, Nestlé) who have global EPR targets — they will pay for verified diversion data.', true],
        ['App-scheduled pickup removes the friction of finding a drop-off point — bringing the service to the household is the right model.', 'Add a schools programme where students collect plastic and earn points for their school — creates a second distribution channel and CSR partnerships.', true],
        ['Gamification (leaderboards, streak rewards) could drive strong retention — make recycling feel like a game, not a chore.', "Verify collector data rigorously — fraudulent weight reports are an obvious attack vector that could destroy your corporate product's credibility.", false],
        ['Generating verified environmental impact data (kg plastic diverted) is a scarce and valuable asset for sustainability-focused investors.', 'Consider a white-label version for corporate campuses and universities — a controlled environment to prove the model before scaling to households.', true],
      ],
    };

    for (const [pitchName, bank] of Object.entries(feedbackBanks)) {
      const pitchId = byName[pitchName];
      const ownerId = pitchOwners[pitchName];
      const reviewers = reviewersFor(ownerId);
      for (let j = 0; j < 5; j++) {
        const [like, change, use] = bank[j];
        fbValues.push(`($${p++},$${p++},$${p++},$${p++},$${p++})`);
        fbParams.push(pitchId, reviewers[j], like, change, use);
      }
    }

    await client.query(
      `INSERT INTO feedback (pitch_id, user_id, what_i_like, would_change, would_use) VALUES ${fbValues.join(',')}`,
      fbParams
    );

    await client.query('COMMIT');
    console.log('✅ Seed complete: 6 users, 20 pitches, 100 feedback entries inserted.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Seed failed:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

seed();
