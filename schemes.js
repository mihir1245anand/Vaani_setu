/**
 * Vaani-Setu — Schemes Database & Checklists
 */
const SCHEMES_DATA = [
      {
        id: 'pm-kisan',
        name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        cat: 'Agriculture',
        dept: 'Ministry of Agriculture & Farmers Welfare',
        state: 'Central',
        targetOcc: ['Farmer'],
        match: 96,
        benefit: '₹6,000 per year in 3 equal installments of ₹2,000 deposited directly into Aadhaar-linked bank accounts.',
        elig: 'Small & marginal landholding farmer families with cultivable land in their name.',
        docs: ['Aadhaar Card', 'Bank Account Details (Aadhaar/NPCI linked)', 'Land Ownership / Khatiyan / RoR', 'Passport Photo'],
        portalUrl: 'https://pmkisan.gov.in'
      },
      {
        id: 'ayushman-bharat',
        name: 'Ayushman Bharat PM-JAY (Golden Card)',
        cat: 'Healthcare',
        dept: 'National Health Authority / MoHFW',
        state: 'Central',
        targetOcc: ['Farmer', 'Worker', 'Self-employed', 'Homemaker', 'Senior Citizen'],
        match: 94,
        benefit: 'Free cashless secondary and tertiary hospital treatment up to ₹5,00,000 per family per year.',
        elig: 'Families listed in SECC 2011 / NFSA Ration Card database / Priority Low-Income.',
        docs: ['Aadhaar Card of all family members', 'Ration Card (PHH / Antyodaya)', 'Active Mobile Number'],
        portalUrl: 'https://nha.gov.in/PM-JAY'
      },
      {
        id: 'pmay',
        name: 'Pradhan Mantri Awas Yojana (PMAY - Gramin & Urban)',
        cat: 'Housing',
        dept: 'Ministry of Housing & Urban Affairs / MoRD',
        state: 'Central',
        targetOcc: ['Farmer', 'Worker', 'Self-employed', 'Homemaker'],
        match: 90,
        benefit: 'Direct financial assistance of ₹1,20,000 (Plain) to ₹1,30,000 (Hilly) + ₹12,000 toilet grant + 90 days MGNREGA wages.',
        elig: 'Families living in Kutcha/temporary shelter or without a permanent pucca house anywhere in India.',
        docs: ['Aadhaar Card of Head of Family', 'Bank Passbook copy', 'Land / Site NOC / Proof of Kutcha House', 'Income / BPL Certificate', 'MGNREGA Job Card'],
        portalUrl: 'https://pmayg.nic.in'
      },
      {
        id: 'pm-ujjwala',
        name: 'PM Ujjwala Yojana 2.0 (Free LPG Connection)',
        cat: 'Women & Child',
        dept: 'Ministry of Petroleum and Natural Gas',
        state: 'Central',
        targetOcc: ['Homemaker', 'Worker', 'Farmer'],
        match: 92,
        benefit: 'Free LPG gas connection with first cylinder refill and gas stove (Hotplate) at zero cost + ₹300/cylinder subsidy.',
        elig: 'Adult woman from poor/rural household without an active LPG connection in the family.',
        docs: ['Aadhaar Card of Applicant (Woman)', 'Ration Card with family members', 'Bank Account linked with Aadhaar', '14-Point Declaration'],
        portalUrl: 'https://pmuy.gov.in'
      },
      {
        id: 'pm-surya-ghar',
        name: 'PM Surya Ghar: Muft Bijli Yojana (Rooftop Solar)',
        cat: 'Energy',
        dept: 'Ministry of New and Renewable Energy',
        state: 'Central',
        targetOcc: ['Farmer', 'Self-employed', 'Worker', 'Homemaker'],
        match: 88,
        benefit: 'Up to ₹78,000 direct subsidy for installing rooftop solar power systems + up to 300 units of free electricity every month.',
        elig: 'Residential households with roof ownership and valid grid electricity connection.',
        docs: ['Electricity Bill (Last 6 Months)', 'Aadhaar Card', 'Roof Ownership Proof / House Tax Receipt', 'Bank Passbook'],
        portalUrl: 'https://pmsuryaghar.gov.in'
      },
      {
        id: 'pm-mudra',
        name: 'Pradhan Mantri MUDRA Yojana (PMMY Business Loan)',
        cat: 'Social Security',
        dept: 'Ministry of Finance / SIDBI',
        state: 'Central',
        targetOcc: ['Self-employed', 'Worker', 'Farmer'],
        match: 85,
        benefit: 'Collateral-free business loans up to ₹10 Lakhs in 3 categories: Shishu (up to ₹50K), Kishore (₹50K-₹5L), Tarun (₹5L-₹10L).',
        elig: 'Small business owners, shopkeepers, fruit/vegetable vendors, artisans, and self-employed micro-entrepreneurs.',
        docs: ['Aadhaar & PAN Card', 'Business Address Proof', 'Quotations of Machinery/Goods', 'Last 6 Months Bank Statement'],
        portalUrl: 'https://mudra.org.in'
      },
      {
        id: 'pm-vishwakarma',
        name: 'PM Vishwakarma Yojana (Support for Artisans & Craftsmen)',
        cat: 'Social Security',
        dept: 'Ministry of Micro, Small and Medium Enterprises',
        state: 'Central',
        targetOcc: ['Self-employed', 'Worker'],
        match: 89,
        benefit: 'PM Vishwakarma Certificate & ID Card, 5-7 days skill training with ₹500/day stipend, ₹15,000 modern toolkit grant, and up to ₹3 Lakh collateral-free loan at 5% interest.',
        elig: 'Traditional artisans & craftsmen across 18 trades (Carpenter, Blacksmith, Potter, Tailor, Cobbler, Mason, Barber, Washerman, etc.).',
        docs: ['Aadhaar Card', 'Mobile Number linked with Aadhaar', 'Bank Account Details', 'Ration Card'],
        portalUrl: 'https://pmvishwakarma.gov.in'
      },
      {
        id: 'nsp-scholarship',
        name: 'National Means-cum-Merit Scholarship (NMMSS)',
        cat: 'Education',
        dept: 'Department of School Education & Literacy',
        state: 'Central',
        targetOcc: ['Student'],
        match: 87,
        benefit: '₹12,000 per year (₹1,000/month) direct scholarship deposited into student accounts from Class 9th to 12th.',
        elig: 'Meritorious students of government/aided schools with parental annual income below ₹3.5 Lakh.',
        docs: ['Student Aadhaar Card', 'Previous Class Marksheet (55%+ marks)', 'Parental Income Certificate', 'Bank Passbook in Student Name', 'School Bonafide Certificate'],
        portalUrl: 'https://scholarships.gov.in'
      },
      {
        id: 'atal-pension',
        name: 'Atal Pension Yojana (Guaranteed Monthly Pension)',
        cat: 'Social Security',
        dept: 'PFRDA / Ministry of Finance',
        state: 'Central',
        targetOcc: ['Worker', 'Self-employed', 'Farmer', 'Homemaker'],
        match: 84,
        benefit: 'Guaranteed lifetime monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 after reaching age 60.',
        elig: 'Any Indian citizen aged between 18 to 40 years having a savings bank account.',
        docs: ['Aadhaar Card', 'Active Savings Bank Account', 'Mobile Number'],
        portalUrl: 'https://npscra.nsdl.co.in'
      },
      {
        id: 'sukanya-samriddhi',
        name: 'Sukanya Samriddhi Yojana (Girl Child Prosperity)',
        cat: 'Women & Child',
        dept: 'Ministry of Finance / India Post',
        state: 'Central',
        targetOcc: ['Homemaker', 'Farmer', 'Worker', 'Self-employed'],
        match: 86,
        benefit: 'Highest government guaranteed interest rate (8.2% p.a.), 100% tax-free maturity amount for girl child education & marriage.',
        elig: 'Parents or legal guardians of a girl child aged below 10 years.',
        docs: ['Birth Certificate of Girl Child', 'Aadhaar Card of Parents/Guardian', 'Address Proof', 'Passport Photos'],
        portalUrl: 'https://www.indiapost.gov.in'
      }
    ];

    /* ==========================================================================
       3. SCHEME-SPECIFIC CHECKLIST DATA & DYNAMIC RECALCULATION
       ========================================================================== */
    const SCHEME_CHECKLISTS = {
      'pm-kisan': {
        name: 'PM-KISAN — prototype checklist',
        items: [
          { id: 'aadhaar', title: 'Aadhaar Card', checked: true, essential: true },
          { id: 'bank', title: 'Bank Account Details', checked: true, essential: true },
          { id: 'residence', title: 'Residence Certificate', checked: false, essential: false },
          { id: 'photo', title: 'Passport-size photograph', checked: false, essential: false },
          { id: 'land', title: 'Land / supporting documents', checked: false, essential: true },
          { id: 'income', title: 'Income Certificate', checked: false, essential: false },
          { id: 'other', title: 'Other supporting document', checked: false, essential: false }
        ]
      },
      'ayushman': {
        name: 'Ayushman Bharat PM-JAY — prototype checklist',
        items: [
          { id: 'aadhaar', title: 'Aadhaar Card of all family members', checked: true, essential: true },
          { id: 'ration', title: 'Ration Card (PHH / Antyodaya)', checked: true, essential: true },
          { id: 'mobile', title: 'Mobile Number linked to Aadhaar', checked: false, essential: true },
          { id: 'income', title: 'Income Certificate / SECC Letter', checked: false, essential: false },
          { id: 'photo', title: 'Passport-size photographs', checked: false, essential: false }
        ]
      },
      'pmay': {
        name: 'PM Awas Yojana (PMAY) — prototype checklist',
        items: [
          { id: 'aadhaar', title: 'Aadhaar Card of Head of Family', checked: true, essential: true },
          { id: 'bank', title: 'Bank Passbook copy', checked: true, essential: true },
          { id: 'land_site', title: 'Land / House Site Ownership Document', checked: false, essential: true },
          { id: 'income', title: 'Income Certificate / BPL Certificate', checked: false, essential: true },
          { id: 'mgnrega', title: 'MGNREGA Job Card (Rural applicants)', checked: false, essential: false },
          { id: 'noc', title: 'Gram Panchayat / Ward NOC', checked: false, essential: false }
        ]
      },
      'ujjwala': {
        name: 'PM Ujjwala Yojana 2.0 — prototype checklist',
        items: [
          { id: 'aadhaar_w', title: 'Aadhaar Card of Adult Woman Applicant', checked: true, essential: true },
          { id: 'ration', title: 'Ration Card with family member details', checked: true, essential: true },
          { id: 'bank', title: 'Bank Account linked to Aadhaar (for subsidy)', checked: false, essential: true },
          { id: 'photo', title: 'Passport size photo of applicant', checked: false, essential: false },
          { id: 'decl', title: '14-Point Declaration / Self-Declaration', checked: false, essential: true }
        ]
      }
    };

if (typeof window !== 'undefined') {
  window.SCHEMES_DATA = SCHEMES_DATA;
  window.SCHEME_CHECKLISTS = SCHEME_CHECKLISTS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SCHEMES_DATA, SCHEME_CHECKLISTS };
}
