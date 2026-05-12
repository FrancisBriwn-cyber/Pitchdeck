require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing seed data
    await client.query('DELETE FROM feedback');
    await client.query('DELETE FROM pitches');
    await client.query('DELETE FROM users WHERE email = ANY($1)', [[
      'amara@seed.dev', 'kofi@seed.dev', 'nadia@seed.dev',
    ]]);

    // --- Users (3 fictional accounts) ---
    const hash = await bcrypt.hash('Seed@1234', 10);
    const u1 = (await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id',
      ['Amara Osei', 'amara@seed.dev', hash]
    )).rows[0];
    const u2 = (await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id',
      ['Kofi Mensah', 'kofi@seed.dev', hash]
    )).rows[0];
    const u3 = (await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id',
      ['Nadia Trabelsi', 'nadia@seed.dev', hash]
    )).rows[0];

    // --- Pitches (10 across 3 users, varied industries) ---
    const pitches = [
      // Amara
      {
        user_id: u1.id,
        name: 'PaySplit',
        one_liner: 'Instant bill-splitting for African mobile money users.',
        problem: 'Splitting bills among friends in Africa is painful because bank transfers are slow and mobile money apps lack group payment features.',
        solution: 'A lightweight app that integrates with M-Pesa, MTN MoMo, and Airtel Money to let groups split and settle bills in seconds.',
        target_market: 'Urban millennials in East and West Africa who regularly dine out or travel together.',
      },
      {
        user_id: u1.id,
        name: 'CropSense',
        one_liner: 'AI crop disease detection for smallholder farmers via SMS.',
        problem: 'Smallholder farmers lose up to 40% of yields to undetected crop diseases because agronomists are too expensive and scarce.',
        solution: 'Farmers photograph leaves and send via WhatsApp or SMS; our ML model identifies the disease and returns treatment advice in their local language within 60 seconds.',
        target_market: 'Smallholder maize and cassava farmers in sub-Saharan Africa with basic smartphones.',
      },
      {
        user_id: u1.id,
        name: 'StudyCircle',
        one_liner: 'Peer tutoring marketplace for African university students.',
        problem: 'University students in Africa struggle to afford private tutors, while high-achieving peers have no structured way to monetise their knowledge.',
        solution: 'A two-sided marketplace where students post subjects they need help with and verified peer tutors bid to teach — sessions happen via video call or in-person.',
        target_market: 'Undergraduate students at universities in Nigeria, Ghana, and Kenya.',
      },
      // Kofi
      {
        user_id: u2.id,
        name: 'MediTrack',
        one_liner: 'Digital prescription tracker that alerts patients before they run out of medication.',
        problem: 'Patients with chronic conditions like diabetes and hypertension frequently miss doses or run out of medication because they forget to refill on time.',
        solution: 'A mobile app where patients log their prescriptions; smart reminders are sent 3 days before a refill is needed, with one-tap reorder from partnered pharmacies.',
        target_market: 'Adults over 40 managing chronic conditions in urban sub-Saharan Africa.',
      },
      {
        user_id: u2.id,
        name: 'FreightLink',
        one_liner: 'Uber for cargo trucks connecting shippers to available truck drivers.',
        problem: 'SMEs moving goods across cities waste hours calling brokers to find available trucks, and truck owners lose revenue driving empty on return trips.',
        solution: 'A real-time marketplace where shippers post loads and nearby truck drivers bid; the lowest verified bid wins. Payment is held in escrow until delivery is confirmed.',
        target_market: 'SMEs and wholesalers shipping between major cities in Nigeria and Ghana.',
      },
      {
        user_id: u2.id,
        name: 'TalentLaunch',
        one_liner: 'Portfolio-first job board for African tech talent.',
        problem: 'African developers and designers are overlooked by global employers because CV-based hiring filters out candidates without "Western" credentials.',
        solution: 'Candidates build a verified project portfolio; companies browse portfolios and skills first — no CVs, no degree requirements on the platform.',
        target_market: 'Self-taught and bootcamp-trained developers and designers across Africa seeking remote global roles.',
      },
      {
        user_id: u2.id,
        name: 'EduBox',
        one_liner: 'Offline-first learning device pre-loaded with the full national curriculum.',
        problem: 'Rural schools in Africa have no reliable internet, cutting students off from digital educational resources.',
        solution: 'A ruggedised tablet with a built-in solar charging case that ships pre-loaded with curriculum videos, exercises, and a progress tracker that syncs when connectivity is available.',
        target_market: 'Primary and secondary schools in off-grid communities across East Africa.',
      },
      // Nadia
      {
        user_id: u3.id,
        name: 'NutriCoach',
        one_liner: 'Personalised nutrition plans built around local African foods.',
        problem: 'Most nutrition apps recommend Western foods that are expensive or unavailable in African markets, making healthy eating advice irrelevant.',
        solution: 'Users input their health goals and location; AI generates weekly meal plans using affordable, locally available ingredients and sends shopping lists to WhatsApp.',
        target_market: 'Health-conscious urban adults aged 25–45 in major African cities.',
      },
      {
        user_id: u3.id,
        name: 'RentVerify',
        one_liner: 'Background-check platform for landlords and tenants in Africa.',
        problem: 'Landlords lose money to defaulting tenants and tenants lose deposits to fraudulent landlords because there is no trusted rental history database in Africa.',
        solution: 'Both landlords and tenants build a verified rental reputation through completed tenancies; a one-time ID-linked report is generated for each new rental application.',
        target_market: 'Private landlords and tenants in Nairobi, Lagos, and Accra.',
      },
      {
        user_id: u3.id,
        name: 'ClinicQueue',
        one_liner: 'Virtual queue and appointment booking for public clinics.',
        problem: 'Patients at public health clinics spend 3–5 hours waiting in queues, often missing work or returning home unseen.',
        solution: 'Patients book a slot via USSD or a web app and receive an SMS when they are 30 minutes away from being seen — no smartphone required for basic access.',
        target_market: 'Out-patients at public health facilities in Rwanda, Uganda, and Tanzania.',
      },
    ];

    const pitchIds = [];
    for (const p of pitches) {
      const r = await client.query(
        `INSERT INTO pitches (user_id, name, one_liner, problem, solution, target_market)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [p.user_id, p.name, p.one_liner, p.problem, p.solution, p.target_market]
      );
      pitchIds.push(r.rows[0].id);
    }

    // --- Feedback (at least 2 per pitch, from users who are NOT the owner) ---
    const feedbackEntries = [
      // PaySplit (u1) — feedback from u2, u3
      { pitch_id: pitchIds[0], user_id: u2.id, what_i_like: 'Great integration idea with existing mobile money rails.', would_change: 'Add a recurring split option for monthly shared expenses like rent.', would_use: true },
      { pitch_id: pitchIds[0], user_id: u3.id, what_i_like: 'Solves a genuine daily pain point I face every week.', would_change: 'Consider offline mode for areas with patchy data.', would_use: true },
      // CropSense (u1) — feedback from u2, u3
      { pitch_id: pitchIds[1], user_id: u2.id, what_i_like: 'SMS fallback is a genius touch for low-connectivity areas.', would_change: 'Partner with agro-dealers so treatment products can be ordered in the same flow.', would_use: true },
      { pitch_id: pitchIds[1], user_id: u3.id, what_i_like: 'The 60-second turnaround is a strong hook.', would_change: 'Show confidence percentage of diagnosis to manage farmer expectations.', would_use: false },
      // StudyCircle (u1) — feedback from u2, u3
      { pitch_id: pitchIds[2], user_id: u2.id, what_i_like: 'Solves the affordability gap with peer knowledge.', would_change: 'Add a rating system after each session to build trust.', would_use: true },
      { pitch_id: pitchIds[2], user_id: u3.id, what_i_like: 'Bidding model keeps prices competitive.', would_change: 'Ensure tutor verification is rigorous to maintain quality.', would_use: true },
      // MediTrack (u2) — feedback from u1, u3
      { pitch_id: pitchIds[3], user_id: u1.id, what_i_like: 'Timely reminders could genuinely save lives for chronic patients.', would_change: 'Let caregivers also receive alerts for elderly patients.', would_use: true },
      { pitch_id: pitchIds[3], user_id: u3.id, what_i_like: 'One-tap reorder is a great conversion funnel.', would_change: 'Add prescription photo scanning so patients do not have to type drug names.', would_use: true },
      // FreightLink (u2) — feedback from u1, u3
      { pitch_id: pitchIds[4], user_id: u1.id, what_i_like: 'Escrow model removes trust barrier between parties.', would_change: 'Include insurance options for high-value cargo.', would_use: true },
      { pitch_id: pitchIds[4], user_id: u3.id, what_i_like: 'Empty-truck return problem is massive and underserved.', would_change: 'Driver rating system is essential from day one.', would_use: false },
      // TalentLaunch (u2) — feedback from u1, u3
      { pitch_id: pitchIds[5], user_id: u1.id, what_i_like: 'Portfolio-first approach removes credential bias effectively.', would_change: 'Add a skills assessment layer so employers can benchmark candidates.', would_use: true },
      { pitch_id: pitchIds[5], user_id: u3.id, what_i_like: 'Addresses a very real problem for African tech talent.', would_change: 'Include a salary transparency feature to set fair expectations.', would_use: true },
      // EduBox (u2) — feedback from u1, u3
      { pitch_id: pitchIds[6], user_id: u1.id, what_i_like: 'Solar charging case is thoughtful hardware design.', would_change: 'Work with MoE to get official curriculum approval — that unlocks government procurement.', would_use: true },
      { pitch_id: pitchIds[6], user_id: u3.id, what_i_like: 'Offline-first is the right call for the target market.', would_change: 'Keep unit cost under $50 to be viable for school budgets.', would_use: true },
      // NutriCoach (u3) — feedback from u1, u2
      { pitch_id: pitchIds[7], user_id: u1.id, what_i_like: 'Using local foods makes this actually usable, not just aspirational.', would_change: 'Add a community recipe section where users share local healthy meals.', would_use: true },
      { pitch_id: pitchIds[7], user_id: u2.id, what_i_like: 'WhatsApp delivery channel is smart — no new app to install.', would_change: 'Partner with local supermarkets for discount coupons on recommended foods.', would_use: true },
      // RentVerify (u3) — feedback from u1, u2
      { pitch_id: pitchIds[8], user_id: u1.id, what_i_like: 'Dual reputation system (both landlord and tenant) is fair and novel.', would_change: 'Figure out adoption chicken-and-egg: nobody wants to be first to build a history.', would_use: true },
      { pitch_id: pitchIds[8], user_id: u2.id, what_i_like: 'Solves a massive trust deficit in the rental market.', would_change: 'Partner with estate agents for initial data seeding.', would_use: false },
      // ClinicQueue (u3) — feedback from u1, u2
      { pitch_id: pitchIds[9], user_id: u1.id, what_i_like: 'USSD fallback means zero smartphone dependency — huge differentiator.', would_change: 'Add a triage feature so urgent cases can be prioritised automatically.', would_use: true },
      { pitch_id: pitchIds[9], user_id: u2.id, what_i_like: 'Freeing patients from waiting 5 hours is a genuine quality-of-life win.', would_change: 'Need strong clinic buy-in — consider a free pilot program strategy.', would_use: true },
    ];

    for (const f of feedbackEntries) {
      await client.query(
        `INSERT INTO feedback (pitch_id, user_id, what_i_like, would_change, would_use)
         VALUES ($1,$2,$3,$4,$5)`,
        [f.pitch_id, f.user_id, f.what_i_like, f.would_change, f.would_use]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed complete: 3 users, 10 pitches, 20 feedback entries inserted.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
  } finally {
    client.release();
    process.exit();
  }
}

seed();
