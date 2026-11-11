// SBL Kaizen System Master Data
// Synchronized with Google Sheet 1apD4hJx2e0MwYWt-yfkWsGf6-q5YwORSLWotmxaFZbI (gid 0)
// and Google Form 1oqIQs8wV99AMw2xGwn-Hsnt9TJi7s21-Aocc8dVpNrY

export interface KaizenRecord {
  id: string;
  status: 'Submitted' | 'Pending HOD Approval' | 'Approved - Implementation in Progress' | 'Pending Assessor Verification' | 'Completed & Verified' | 'Rejected';
  timestamp: string;
  name: string;
  email: string;
  department: string;
  category: string;
  title: string;
  problem: string;
  proposedImprovement: string;
  expectedBenefits: string;
  hodName?: string;
  hodApprovalDate?: string;
  hodComments?: string;
  assessorEmail?: string;
  verifiedAchievedBenefit?: string;
  dateVerified?: string;
  assessorLog?: string;
  assessorComments?: string;
  kaizenScore: number;
  resourceStatus?: string;
  token?: string;
  teamMembers?: string;
  implementationSteps?: string;
}

export const KAIZEN_CATEGORIES = [
  'Cost Saving',
  'EHS improvement',
  'Productivity Improvement',
  'Quality Improvement',
  'Space Saving',
  'Psychosocial Improvement'
] as const;

export const KAIZEN_DEPARTMENTS = [
  'Production',
  'Maintenance',
  'Quality',
  'R&D',
  'M Zink',
  'HR',
  'Engineering',
  'Logistics',
  'Purchase',
  'Store',
  'Finance',
  'IT',
  'Admin',
  'Other'
];

export const HOD_DIRECTORY: Record<string, { name: string; email: string }> = {
  'Production': { name: 'Budhi Parkash', email: 'B.Parkash@sblcoatings.com' },
  'Manufacturing': { name: 'Budhi Parkash', email: 'B.Parkash@sblcoatings.com' },
  'Maintenance': { name: 'Er. Maintenance Lead', email: 'maintenance@sblcoatings.com' },
  'Quality': { name: 'D. Shukla', email: 'D.Shukla@sblcoatings.com' },
  'R&D': { name: 'Dr. R&D Head', email: 'rnd@sblcoatings.com' },
  'M Zink': { name: 'Plant Head M-Zink', email: 'MZINKLAB@SBLCOATINGS.COM' },
  'HR': { name: 'HR Head', email: 'hr@sblcoatings.com' },
  'Engineering': { name: 'Site Engineering Lead', email: 'engineering@sblcoatings.com' },
  'Logistics': { name: 'Logistics Lead', email: 'logistics@sblcoatings.com' },
  'Purchase': { name: 'Purchase Manager', email: 'purchase@sblcoatings.com' },
  'Store': { name: 'Store In-Charge', email: 'store@sblcoatings.com' },
  'Finance': { name: 'Finance Head', email: 'finance@sblcoatings.com' },
  'IT': { name: 'IT Lead', email: 'it@sblcoatings.com' },
  'Admin': { name: 'Admin Lead', email: 'admin@sblcoatings.com' },
  'Other': { name: 'Operations Lead', email: 'operations@sblcoatings.com' }
};

export const ASSESSOR_DIRECTORY: Record<string, string> = {
  'Quality Improvement': 'D.Shukla@sblcoatings.com',
  'Productivity Improvement': 'mk.aich@sblcoatings.com',
  'Cost Saving': 's.chowfla@sblcoatings.com',
  'Space Saving': 'mk.aich@sblcoatings.com',
  'EHS improvement': 'B.Parkash@sblcoatings.com',
  'Psychosocial Improvement': 'n.sharma@sblcoatings.com'
};

/**
 * Standard 23-Row Scoring Algorithm from Kaizen Master Engine SOP (Appendix B)
 */
export function calculateKaizenScore(claimed: {
  categories: string[];
  costSavingRsThousand?: number;
  productivityPct?: number;
  qualityFailureRatePct?: number;
  spaceSavingM2?: number;
  ehsBenefit?: boolean;
  psychosocialBenefit?: boolean;
  noResourcesRequired?: boolean;
}): number {
  let score = 0;

  // 1. Cost Saving (Rs. in thousands)
  if (claimed.costSavingRsThousand !== undefined && claimed.costSavingRsThousand > 0) {
    const val = claimed.costSavingRsThousand;
    if (val <= 9) score += 1;
    else if (val <= 50) score += 2;
    else if (val <= 100) score += 3;
    else if (val <= 500) score += 4;
    else score += 5;
  }

  // 2. Productivity Improvement (%)
  if (claimed.productivityPct !== undefined && claimed.productivityPct > 0) {
    const val = claimed.productivityPct;
    if (val <= 2.99) score += 1;
    else if (val <= 7) score += 2;
    else if (val <= 15) score += 3;
    else if (val <= 25) score += 4;
    else score += 5;
  }

  // 3. Quality Improvement (Failure rate % reduction)
  if (claimed.qualityFailureRatePct !== undefined && claimed.qualityFailureRatePct > 0) {
    const val = claimed.qualityFailureRatePct;
    if (val <= 1.99) score += 1;
    else if (val <= 5) score += 2;
    else if (val <= 10) score += 3;
    else if (val <= 20) score += 4;
    else score += 5;
  }

  // 4. Space Saving (Sq. Meters)
  if (claimed.spaceSavingM2 !== undefined && claimed.spaceSavingM2 > 0) {
    const val = claimed.spaceSavingM2;
    if (val <= 4) score += 1;
    else if (val <= 10) score += 2;
    else if (val <= 15) score += 3;
    else if (val <= 20) score += 4;
    else score += 5;
  }

  // 5. EHS improvement (Fixed 3 points)
  if (claimed.ehsBenefit || claimed.categories.some(c => c.toLowerCase().includes('ehs') || c.toLowerCase().includes('safety'))) {
    score += 3;
  }

  // 6. Psychosocial Improvement (Fixed 1 point)
  if (claimed.psychosocialBenefit || claimed.categories.some(c => c.toLowerCase().includes('psychosocial'))) {
    score += 1;
  }

  // 7. Special Condition: Zero Resources Required (Self-Implemented) -> 3 Bonus Points
  if (claimed.noResourcesRequired) {
    score += 3;
  }

  return Math.max(1, score);
}

export const BASELINE_KAIZENS: KaizenRecord[] = [
  {
    "id": "KZN-2025-0001",
    "status": "Completed & Verified",
    "timestamp": "11/27/2025 11:15:27",
    "name": "SANTOSH KUMAR",
    "email": "MZINKLAB@SBLCOATINGS.COM",
    "department": "M Zink",
    "category": "Cost Saving, Psychosocial Improvement",
    "title": "Sharing of josh magazine on digital platforms",
    "problem": "Magazine is available in hardcopy",
    "proposedImprovement": "Make magazine in digital form and make printed copy limited to be available for visitors and readers in waiting area",
    "expectedBenefits": "1. **Increased Visibility**: This initiative will allow us to make a notable presence among professionals across various platforms, enhancing our brand recognition.\n\n2. **Positive Image Creation**: By effectively showcasing our values and achievements, we can significantly elevate the perception of our organization in the industry.\n\n3. **Cost-Effective Digital Distribution**: We will share our content in a digital format, ensuring it reaches all SBL employees easily and economically.\n\n4. **Growing Our Digital Following**: This strategy is expected to increase our followers on digital platforms, facilitating quicker recruitment processes and providing a wider array of choices for candidates.",
    "hodName": "",
    "hodApprovalDate": "",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"1\",\"Space Saving\":\"\",\"EHS improvement\":\"\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "NO",
    "token": "fc67cdda-9a4e-4cad-af9e-4f832f9560c8"
  },
  {
    "id": "KZN-2025-0002",
    "status": "Completed & Verified",
    "timestamp": "12/2/2025 14:41:44",
    "name": "RAVINDER THAKUR",
    "email": "thakur.ravikumar22@gmail.com",
    "department": "Production",
    "category": "Cost Saving",
    "title": "Resale of damaged and rusted container.",
    "problem": "The damaged and rusted container thrown as scrap.",
    "proposedImprovement": "Resale of damaged and rusted container to the manufacturer.",
    "expectedBenefits": "Cost saving.",
    "hodName": "",
    "hodApprovalDate": "Approved on 18/12/2025",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"5\",\"Space Saving\":\"\",\"EHS improvement\":\"\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "No",
    "token": "a4f192d5-86e7-4cb1-bdf9-8ad33bc33c87"
  },
  {
    "id": "KZN-2025-0003",
    "status": "Completed & Verified",
    "timestamp": "12/2/2025 16:38:10",
    "name": "R&D Team",
    "email": "rndteam@sblcoatings.com",
    "department": "R&D",
    "category": "Productivity Improvement, Space Saving, EHS improvement",
    "title": "Safe and efficient drum unloading",
    "problem": "Earlier two person required to take out material from drum which was time consuming, man Power consuming way.",
    "proposedImprovement": "Now drums are placed horizontally at an angle so that material can be take out easily without any etra power. There is a open close value attached with the drum that helps in taking out the sample without any spillage.",
    "expectedBenefits": "Productivity, Efficiency, EHS Improvement.",
    "hodName": "",
    "hodApprovalDate": "Approved on 12/3/2025",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"3\",\"Productivity Improvement\":\"5\",\"Cost Saving\":\"\",\"Space Saving\":\"5\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "12/12/2025",
    "assessorLog": "B.Parkash@sblcoatings.com on 12/12/2025",
    "assessorComments": "",
    "kaizenScore": 7,
    "resourceStatus": "Nozzle expense.",
    "token": "4471d59c-00bf-4063-a277-51a3205971f2"
  },
  {
    "id": "KZN-2025-0004",
    "status": "Completed & Verified",
    "timestamp": "12/2/2025 16:43:13",
    "name": "R&D Team",
    "email": "rndteam@sblcoatings.com",
    "department": "R&D",
    "category": "Productivity Improvement, Psychosocial Improvement",
    "title": "Segregation of all packing bottles/can and lida",
    "problem": "Earlier we are facing issue in finding the correct size can /bottles. Finding caps/lids of these bottles was a time consuming process due to fwo manufacturer CNC and ACP.",
    "proposedImprovement": "Seperate Cage was made for segregation so that everything can be find and selected easily.",
    "expectedBenefits": "Time efficient, Ease of work, Productivity improve",
    "hodName": "",
    "hodApprovalDate": "Approved on 12/3/2025",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"5\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "12/12/2025",
    "assessorLog": "mk.aich@sblcoatings.com on 12/12/2025",
    "assessorComments": "",
    "kaizenScore": 2,
    "resourceStatus": "No, General fabrication.",
    "token": "8635e593-f19a-4d7c-874e-594108821669"
  },
  {
    "id": "KZN-2025-0005",
    "status": "Completed & Verified",
    "timestamp": "12/2/2025 16:49:38",
    "name": "R&D Team",
    "email": "rndteam@sblcoatings.com",
    "department": "R&D",
    "category": "Quality Improvement, Productivity Improvement, EHS improvement",
    "title": "Cover for waste Sink",
    "problem": "In our lab earlier there were open sinks in which we wash out lab apparatus with solvents. The open sink system was not efficient in minimizing the solvent evaporation. The evaporated solvent was contributing in bad lab smell and VOC",
    "proposedImprovement": "We designed a lid on the top of the sink that can be taken off when used and can be put on when not in used",
    "expectedBenefits": "Minimizing VOC. Good and clean work space",
    "hodName": "",
    "hodApprovalDate": "Approved on 12/3/2025",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "12/12/2025",
    "assessorLog": "B.Parkash@sblcoatings.com on 12/12/2025",
    "assessorComments": "",
    "kaizenScore": 3,
    "resourceStatus": "Fabrication of SS lids as per size",
    "token": "90214adb-ba7d-4f72-a269-245e4af099df"
  },
  {
    "id": "KZN-2025-0006",
    "status": "Completed & Verified",
    "timestamp": "12/4/2025 13:20:15",
    "name": "SANTOSH KUMAR",
    "email": "MZINKLAB@SBLCOATINGS.COM",
    "department": "M Zink",
    "category": "Quality Improvement, Productivity Improvement, Cost Saving, Space Saving, EHS improvement, Psychosocial Improvement",
    "title": "POLICY FORMATION FOR LEARNING THROUGH ONLINE PORTALS LIKE SWAYAM",
    "problem": "DO NOT HAVE ANY POLICY FOR ONLINE LEARNING PLATFORMS",
    "proposedImprovement": "TO ENCOURAGE OUR EMPLOYEES FOR SKILL DEVELOPMENT THROUGH ONLINE PORTALS LIKE SWAYAM .ON SUCCESFUL COMPLETION OF COURSE SBL CAN REIMBURSE THE COST WHICH VERY LESS (APPROX-500 RUPEES )",
    "expectedBenefits": "SKILL DEVELOPEMNT THAT WILL LEAD TO \n1-PRODUCTIVITY IMPROVEMENT\n2-QUALITY IMPROVEMENT\n3-SAFETY IMPROVEMENT\n4-COST REDUCTION\n5-PSYCHOSOICIAL",
    "hodName": "",
    "hodApprovalDate": "",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"Yes\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "500/CERTIFICATION",
    "token": "6a4e3139-1ca8-44b1-8720-670f50fc031d"
  },
  {
    "id": "KZN-2025-0007",
    "status": "Completed & Verified",
    "timestamp": "12/5/2025 10:15:49",
    "name": "SHUBHAM",
    "email": "s.pandey@sblcoatings.com",
    "department": "R&D",
    "category": "Quality Improvement, Productivity Improvement",
    "title": "Testing management system",
    "problem": "As of now we don't have any system to track and manage long term testing. Most of the time user miss test due date , observation date due to multiple number of testing. Additionally we don't have any system that can record and save the testing details of any panel or any chemistry. This will help us in observing the data in future.",
    "proposedImprovement": "A online system that records the data of panel , testing, provide transperancy to the tester and save records for future use.",
    "expectedBenefits": "Better transperancy, Fast testing, Reduced retestings in future, Data driven, No manual work",
    "hodName": "",
    "hodApprovalDate": "Approved on 12/5/2025",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"5\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "System to be develop by IT",
    "token": "55cd7569-5826-4ddb-866c-3bfc3db730ce"
  },
  {
    "id": "KZN-2025-0008",
    "status": "Completed & Verified",
    "timestamp": "12/6/2025 16:22:29",
    "name": "BHISHMA VERMA",
    "email": "b.verma@sblcoatings.com",
    "department": "Production",
    "category": "Productivity Improvement, EHS improvement, Psychosocial Improvement",
    "title": "implementation of charging hopper along with stool to get ease of operation and less spillage at floor",
    "problem": "there is direct facility for powder bag charging into HSD which result in power spillage, chances of bag goes into HSD",
    "proposedImprovement": "Charging hopper with stool provided and currently charging operation got smooth",
    "expectedBenefits": "1.\tLess time for charging (2hr) before it was 3-3.5hr\n2.\tLess spillage \n3.\tLess manual intervention(2MP)/charging before it was (3MP)/charging\n4.\tSystem hygiene",
    "hodName": "",
    "hodApprovalDate": "Approved on 18/12/2025",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"3\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"Yes\"}",
    "dateVerified": "12/22/2025",
    "assessorLog": "B.Parkash@sblcoatings.com on 12/22/2025",
    "assessorComments": "",
    "kaizenScore": 6,
    "resourceStatus": "Charging hopper, stool",
    "token": "9d9e5dab-acaf-4fed-936c-89f64b3d2904"
  },
  {
    "id": "KZN-2025-0009",
    "status": "Completed & Verified",
    "timestamp": "12/6/2025 16:24:59",
    "name": "BHISHMA VERMA",
    "email": "b.verma@sblcoatings.com",
    "department": "Production",
    "category": "Quality Improvement, EHS improvement, Psychosocial Improvement",
    "title": "Cleaning system for mixers(Opaque/Primer, Metallic and Clear)by implementing AODD pump facility with piping system",
    "problem": "Before installation of new cleaning facility , we were doing the big size mixers manually with long brush, now cleaning system has been implemented with some mixers and rest mixers same implementation is going on",
    "proposedImprovement": "Cleaning system for mixers(Opaque/Primer, Metallic and Clear)by implementing AODD pump facility with piping system",
    "expectedBenefits": "1.\tLess time for cleaning(15min) before it was 1-1.5hr\n2.\tLess solvent consumption (25-30kg)/cleaning before it was (30-40kg)/cleaning\n3.\tLess manual intervention(1MP)/cleaning before it was (2MP)/cleaning\n4.\tChances of contamination reduce to zero\n5.\tSystem hygiene",
    "hodName": "",
    "hodApprovalDate": "Approved on 18/12/2025",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"2%\",\"Productivity Improvement\":\"3%\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"Yes\"}",
    "dateVerified": "12/20/2025",
    "assessorLog": "B.Parkash@sblcoatings.com on 12/20/2025",
    "assessorComments": "",
    "kaizenScore": 6,
    "resourceStatus": "AODD pump, Hose pipes, Trolley",
    "token": "fb975423-ca2f-45a2-926d-cac6b7d7901e"
  },
  {
    "id": "KZN-2025-0010",
    "status": "Completed & Verified",
    "timestamp": "12/20/2025 10:56:50",
    "name": "Arun Kumar",
    "email": "maintenance@sblcoatings.com",
    "department": "Maintenance",
    "category": "Productivity Improvement, Cost Saving, EHS improvement",
    "title": "Improving efficiency of STP Pump",
    "problem": "Currently STP pump gets pebbles and stones in line which damage the water meter, to prevent damage to water meter, the line was equipped with SS Jali, which gets choked easily due to dirt so flow of pump gets reduced.",
    "proposedImprovement": "Pump should be lifted 6 inches from floor level so that debris and dirt does not get into the pump and flow of water is increased.",
    "expectedBenefits": "More flow in less time and reduced breakdown due to non clogging of jali",
    "hodName": "",
    "hodApprovalDate": "Approved on 20/12/2025",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"10%\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "3/22/2026",
    "assessorLog": "mk.aich@sblcoatings.com on 3/22/2026",
    "assessorComments": "",
    "kaizenScore": 6,
    "resourceStatus": "1.5 Inch line, 6 inch length and welding work.",
    "token": "fff816f0-383b-4182-b061-6b98a17a784f"
  },
  {
    "id": "KZN-2025-0011",
    "status": "Completed & Verified",
    "timestamp": "12/23/2025 11:41:33",
    "name": "Manish Kumar",
    "email": "manish.vkbhatt@gmail.com",
    "department": "Production",
    "category": "EHS improvement",
    "title": "Clamp for pipe Jerk handle",
    "problem": "डिस्पेंसिंग प्वाइंट प्वाइंट पर मटेरियल ट्राली में डालते समय , प्रेशर से पाइप का बाहर आ जाना, जिससे मटेरियल स्पिलेज का खतरा रहता है, और आदमी के चोट लगने की संभावना होना।",
    "proposedImprovement": "क्लैम्प की सहायता से इसको पकड़ के रख सकते है जिससे पाइप पे, प्रेशर के कारण झटका लगने पर रोका जा सकता है या कम किया जा सकता है।",
    "expectedBenefits": "मटेरियल बिना किसी संभावित दुर्घटना के साथ लिया जा सकता है, आसानी से और ऑटो मोड में लेने पर बैलेंस पे एरर को भी खत्म किया जा सकता है।",
    "hodName": "",
    "hodApprovalDate": "Approved on 23/12/2025",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "Clamp एंड बेल्ट",
    "token": "b5c70e19-bb86-4b1f-a97c-cdc72d6159e9"
  },
  {
    "id": "KZN-2026-0012",
    "status": "Completed & Verified",
    "timestamp": "1/6/2026 16:01:38",
    "name": "Akash kumar",
    "email": "r.gupta@sblcoatings.com",
    "department": "Production",
    "category": "Productivity Improvement, Cost Saving, EHS improvement",
    "title": "container reuse after rmqc testing",
    "problem": "new containers after testing in rmqc throw out for scraping",
    "proposedImprovement": "to use these containers for batch making as same required in R&D and  foc samples",
    "expectedBenefits": "reusability of discarded material",
    "hodName": "",
    "hodApprovalDate": "",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"1\",\"Space Saving\":\"\",\"EHS improvement\":\"\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "no",
    "token": "98c3f3f1-148d-4b54-9dd0-047eb395ab9a"
  },
  {
    "id": "KZN-2026-0013",
    "status": "Approved - Implementation in Progress",
    "timestamp": "1/7/2026 12:15:39",
    "name": "Mohit Sandhu",
    "email": "sblrmqc@sblcoatings.com",
    "department": "RMQC",
    "category": "Cost Saving",
    "title": "Elimination of 20LTR Barrel cutting by using Borescope Camera for Internal Checking.",
    "problem": "For checking inside cleanliness and Glue of 20 ltr barrels, barrels is cut using cutter/blade.\nafter cutting barrel becomes damage and scrapped.\nThis process causes material loss, Increases inspection cost, safety risk( sharp edges, blade injury).",
    "proposedImprovement": "Replace barrel cutting method with inspection camera for internal checking of 20 ltr barrels.\ninsert camera from barrel mouth and inspect dust, moisture, glue oil contamination, view inspection on screen in real time rotate barrel for 100% internal visual inspection.",
    "expectedBenefits": "1. Cost Benefits:- zero barrel scarp due to elimination of cutting.\n2. safety benefits:- no cutting operations no blade injury risk etc.\n3. productivity benefits:- faster inspection compared to cutting, reduce manpower efforts.",
    "hodName": "",
    "hodApprovalDate": "Approved on 1/7/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "1.Standard Operating Procedure(SOP).\n2. Inspection Camera:- Bore scope Camera with light\n3. Monitor for live view.\n4. Investment Cost;- One time cost for camera (approx 3000-5000).",
    "token": "d9545ee6-a08e-4d91-a0f8-2168bcdf1508"
  },
  {
    "id": "KZN-2026-0014",
    "status": "Completed & Verified",
    "timestamp": "3/21/2026 14:21:36",
    "name": "KHUSHI",
    "email": "ADMIN@SBLCOATINGS.COM",
    "department": "HR",
    "category": "Productivity Improvement, Cost Saving",
    "title": "MAKE A DIGITAL LETTER REGISTER",
    "problem": "CURRENTLY WE ARE NOTING DOWN THE DATA IN THE REGISTERS",
    "proposedImprovement": "WE PROPOSE TO CREATE A DIGITAL LETTER REGISTRY SYSTEM",
    "expectedBenefits": "PRODUCTIVITY IMPROVEMENT AND COST SAVING",
    "hodName": "",
    "hodApprovalDate": "Approved on 21/03/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"Yes\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "NO",
    "token": "9694c082-b9bb-4c20-ace3-fd153d9321d6"
  },
  {
    "id": "KZN-2026-0015",
    "status": "Rejected",
    "timestamp": "3/21/2026 14:27:39",
    "name": "KHUSHI",
    "email": "ADMIN@SBLCOATINGS.COM",
    "department": "HR",
    "category": "Cost Saving",
    "title": "DRUM PAINTING",
    "problem": "WE HAVE DAMAGE DRUMS ON SITE WHICH CAN BE UTILIZED CREATIVELY",
    "proposedImprovement": "COST SAVING",
    "expectedBenefits": "USE AS FOR AESTHETICS",
    "hodName": "",
    "hodApprovalDate": "Rejected on 21/03/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "NO",
    "token": "2c6bd6b8-8e6e-46bd-84a1-474bbdca1873"
  },
  {
    "id": "KZN-2026-0016",
    "status": "Completed & Verified",
    "timestamp": "3/21/2026 14:33:15",
    "name": "KHUSHI",
    "email": "ADMIN@SBLCOATINGS.COM",
    "department": "HR",
    "category": "Psychosocial Improvement",
    "title": "CREATE A GOOGLE FORM IN WHICH WE PROVIDE LABOUR BENEFIT TO ALL THE EMPLOYEES",
    "problem": "BEFORE THAT WE USE PAPER FORM BUT NOW WE USE GOOGLE FORM",
    "proposedImprovement": "PSYCHOSOCIAL IMPROVEMENT",
    "expectedBenefits": "TO PROVIDE MORE PEOPLE BENEFIT OF THAT",
    "hodName": "",
    "hodApprovalDate": "Approved on 21/03/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"40%\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"\",\"Psychosocial Improvement\":\"Yes\"}",
    "dateVerified": "3/26/2026",
    "assessorLog": "n.sharma@sblcoatings.com on 3/26/2026",
    "assessorComments": "",
    "kaizenScore": 1,
    "resourceStatus": "NO",
    "token": "c4fa463d-a093-4539-8814-28cf6129a8a9"
  },
  {
    "id": "KZN-2026-0017",
    "status": "Completed & Verified",
    "timestamp": "3/21/2026 14:59:52",
    "name": "KHUSHI",
    "email": "ADMIN@SBLCOATINGS.COM",
    "department": "HR",
    "category": "Productivity Improvement",
    "title": "PORTABLE SPRINKLING SYSTEM",
    "problem": "CURRENTLY WE ARE USING WATER HOS PIPE FOR WATERING IN THE GARDEN",
    "proposedImprovement": "PORTABLE SPRINKLER SYSTEM TO BE USED FOR AUTOMATING THE WATER PROCESS",
    "expectedBenefits": "PRODUCTIVITY IMPROVEMENT AND TIME SAVING",
    "hodName": "",
    "hodApprovalDate": "Approved on 21/03/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "SPRINKLER SYSTEM",
    "token": "853c4eee-231a-411a-8bac-45affdca933a"
  },
  {
    "id": "KZN-2026-0018",
    "status": "Rejected",
    "timestamp": "",
    "name": "Tarun Bansal",
    "email": "u2maintenance@sblcoatings.com",
    "department": "Engineering",
    "category": "Productivity Improvement",
    "title": "Automation of water filling of water tanks",
    "problem": "Currently manpower is engaged in filling of water tank manually",
    "proposedImprovement": "Automation is proposed so that water is filled in automated mode when the tank is empty",
    "expectedBenefits": "Manpower and time saving",
    "hodName": "",
    "hodApprovalDate": "Rejected on 3/26/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "Control Valve, Level Switch, PU tube, cable",
    "token": "20f9f7f1-4224-4825-b771-1717b11fd991"
  },
  {
    "id": "KZN-2026-0019",
    "status": "Completed & Verified",
    "timestamp": "3/21/2026 15:59:52",
    "name": "KHUSHI",
    "email": "ADMIN@SBLCOATINGS.COM",
    "department": "HR",
    "category": "Psychosocial Improvement",
    "title": "DRUM PAINTING",
    "problem": "WE HAVE DAMAGE DRUMS ON SITE WHICH CAN BE UTILIZED CREATIVELY",
    "proposedImprovement": "USE AS FOR AESTHETICS",
    "expectedBenefits": "TO IMPROVE THE BEAUTY OF THE PLANT",
    "hodName": "",
    "hodApprovalDate": "Approved on 23/03/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"\",\"Psychosocial Improvement\":\"Yes\"}",
    "dateVerified": "3/26/2026",
    "assessorLog": "n.sharma@sblcoatings.com on 3/26/2026",
    "assessorComments": "",
    "kaizenScore": 1,
    "resourceStatus": "NO",
    "token": "810b0dec-0da3-4b8c-8387-f39bda231a4e"
  },
  {
    "id": "KZN-2026-0020",
    "status": "Completed & Verified",
    "timestamp": "3/22/2026 14:19:02",
    "name": "Chandra Mohan",
    "email": "maintenance@sblcoatings.com",
    "department": "Engineering",
    "category": "EHS improvement",
    "title": "Underground tank manhole cover",
    "problem": "The rainwater underground storage tank has elevated manhole cover.",
    "proposedImprovement": "Elevated manhole cover to be removed as vehicles may get collision",
    "expectedBenefits": "Prevent accident at site",
    "hodName": "",
    "hodApprovalDate": "Approved on 23/03/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "NO",
    "token": ""
  },
  {
    "id": "KZN-2026-0021",
    "status": "Completed & Verified",
    "timestamp": "3/22/2026 16:29:02",
    "name": "Surjit kumar",
    "email": "ADMIN@SBLCOATINGS.COM",
    "department": "HR",
    "category": "EHS improvement",
    "title": "Kitchen Waste Storage Bin",
    "problem": "Currently kitchen waste is stored in 200 liters metallic drums, in which food starts to rot due to moisture and closed condition.",
    "proposedImprovement": "A trolley with perforated jali to be fabricated for storing of kitechen waste",
    "expectedBenefits": "No roting of kitchen waste and no bad odour and compliance",
    "hodName": "",
    "hodApprovalDate": "",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "NO",
    "token": ""
  },
  {
    "id": "KZN-2026-0022",
    "status": "Completed & Verified",
    "timestamp": "1/7/2026 10:25:39",
    "name": "SHUBHAM",
    "email": "s.pandey@sblcoatings.com",
    "department": "R&D",
    "category": "Psychosocial Improvement",
    "title": "Use of magnet to hold termperature meter",
    "problem": "Currently temperature meter is kept on working area which hinders work",
    "proposedImprovement": "Temperature meter shall be hanged on hollow metal surface using magnet",
    "expectedBenefits": "Free workspace area and easy to move meter around, aesthetics improvement",
    "hodName": "",
    "hodApprovalDate": "",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"\",\"Psychosocial Improvement\":\"Yes\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "NO",
    "token": ""
  },
  {
    "id": "KZN-2026-0023",
    "status": "Completed & Verified",
    "timestamp": "1/12/2026 13:15:39",
    "name": "Anonymous",
    "email": "",
    "department": "General",
    "category": "EHS improvement",
    "title": "Use of wrist band to dissipate static electricity",
    "problem": "Currently there is no continous provision to dissipate body static earthing",
    "proposedImprovement": "Use of netallic wrist band to dissipate static earthing",
    "expectedBenefits": "Removal of static hazards",
    "hodName": "",
    "hodApprovalDate": "",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "NO",
    "token": ""
  },
  {
    "id": "KZN-2026-0024",
    "status": "Completed & Verified",
    "timestamp": "3/21/2026 10:05:12",
    "name": "Anonymous",
    "email": "",
    "department": "General",
    "category": "EHS improvement",
    "title": "Bigger Earthing clamp",
    "problem": "Currently wrist band have small clamp which dont fit on trolley",
    "proposedImprovement": "bigger clamp to be fit so that earthing can be done properly",
    "expectedBenefits": "Removal of static hazards",
    "hodName": "",
    "hodApprovalDate": "",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "{\"Quality Improvement\":\"\",\"Productivity Improvement\":\"\",\"Cost Saving\":\"\",\"Space Saving\":\"\",\"EHS improvement\":\"Yes\",\"Psychosocial Improvement\":\"\"}",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "NO",
    "token": ""
  },
  {
    "id": "KZN-2026-0025",
    "status": "Completed & Verified",
    "timestamp": "3/2/2026 11:15:02",
    "name": "Tarun Bansal",
    "email": "u2maintenance@sblcoatings.com",
    "department": "Engineering",
    "category": "Cost Saving",
    "title": "FLP Weighing Balance",
    "problem": "The weighing balance in Unit 1 were not FLP and to procure all new 36 FLP weighing balance a cost of Rs 40 lacs was qouted.",
    "proposedImprovement": "It was proposed to change to indictor of the weighing balance only which was qouted Rs 6 lacs only. and make weighing balance",
    "expectedBenefits": "Cost saving of Rs 34 lacs",
    "hodName": "",
    "hodApprovalDate": "",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "NO",
    "token": ""
  },
  {
    "id": "KZN-2026-0026",
    "status": "Approved - Implementation in Progress",
    "timestamp": "",
    "name": "BHISHMA VERMA",
    "email": "B.VERMA@SBLCOATINGS.COM",
    "department": "General",
    "category": "Quality Improvement, EHS improvement",
    "title": "Kaizen Proposal",
    "problem": "CURRENTLY COVERS ARE IN TWO PARTS AND OUT LET PIPE FROM DYNO MILL ATTACHED TO TROLLEY RESULTING IN LID TO OPEN , RESULTING IN SOLVENT EVAPORATE",
    "proposedImprovement": "TROLLEY LID TO BE PROPER COVER WITH TOP HAVING HOLE FOR OUT LET PIPE ATTACHMENT",
    "expectedBenefits": "DUST ISSUE AND SOLVENT EVAPORATION MAY REDUCE",
    "hodName": "",
    "hodApprovalDate": "Approved on 22/07/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "NO",
    "token": "0ce8fdc5-2f27-451d-8e20-19f8e8d563c8"
  },
  {
    "id": "KZN-2026-0027",
    "status": "Approved - Implementation in Progress",
    "timestamp": "",
    "name": "Heena",
    "email": "heenabasssi308@gmail.com",
    "department": "General",
    "category": "EHS improvement",
    "title": "Kaizen Proposal",
    "problem": "Currently, every laboratory does not have a dedicated first aid box. Minor injuries such as cuts from blades, glassware, or chemical splashes may not receive immediate treatment. There is also no defined person responsible for checking first aid supplies regularly, which may lead to expired or missing items. This can delay treatment, increase safety risks, and affect employee confidence.",
    "proposedImprovement": "Install one standard first aid box in every laboratory and on each production floor\nAssign one supervisor or responsible person for each area to inspect the first aid box weekly or monthly using a checklist\nMaintain a First Aid Inspection Register to record\nDate of inspection\nCondition of the box\nExpiry date of medicines\nItems used and replenished\nName and signature of the responsible person\nReplace expired or used items immediately to ensure the kit is always ready for emergency use and also for audit readiness",
    "expectedBenefits": "Immediate treatment for minor injuries..reducing response time\nReduced risk of infection and injury severity\nImproved employee safety awareness and confidence\nBetter compliance with EHS and safety requirements\nImproved audit readiness with documented inspection records\nReduced work interruption and improved productivity",
    "hodName": "",
    "hodApprovalDate": "Approved on 01/08/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "Standard first aid box for each laboratory and production floor on both opposite side \nBasic first aid materials (bandages, antiseptic solution, gauze, adhesive tape, cotton, burn cream, sterile dressing, scissors, gloves, eye wash, etc.).\nInspection checklist and first aid record register",
    "token": "4f595f7f-d3ba-4207-8262-b82198526be2"
  },
  {
    "id": "KZN-2026-0028",
    "status": "Approved - Implementation in Progress",
    "timestamp": "",
    "name": "Pankaj kumar",
    "email": "p.kumar@sblcoatings.com",
    "department": "General",
    "category": "EHS improvement",
    "title": "Kaizen Proposal",
    "problem": "All acids bottles are kept in tray with sand below bottles.",
    "proposedImprovement": "We kept all acids bottles in tray with sand.",
    "expectedBenefits": "Acid should always kept like this.",
    "hodName": "",
    "hodApprovalDate": "Approved on 01/08/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "Tray needed",
    "token": "16296737-c674-4e78-8033-eda17163f0f8"
  },
  {
    "id": "KZN-2026-0029",
    "status": "Pending Assessor Verification",
    "timestamp": "",
    "name": "Jyoti SHarma",
    "email": "j.sharma@sblcoatings.com",
    "department": "General",
    "category": "EHS improvement",
    "title": "Kaizen Proposal",
    "problem": "Tipco Electrical Cabinet was mounted at a height not safe for operation.",
    "proposedImprovement": "Asked to remount the Electrical Cabinet at a height where user's height can be reached easily.",
    "expectedBenefits": "Benefit in terms of safety as long rods were used to switch on or off the instrument.",
    "hodName": "",
    "hodApprovalDate": "Approved on 01/09/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "Maintenance support and consumables",
    "token": "d9a81985-36bd-4cf9-8e8e-a9f0560f3f73"
  },
  {
    "id": "KZN-2026-0030",
    "status": "Approved - Implementation in Progress",
    "timestamp": "",
    "name": "Heena",
    "email": "heenabasssi308@gmail.com",
    "department": "General",
    "category": "Productivity Improvement, Space Saving",
    "title": "Kaizen Proposal",
    "problem": "Currently, various notifications, circulars, instructions and important information are pasted directly on the walls of the R&D department. This creates an unorganized appearance, increases wall clutter and makes it difficult to identify important and updated information",
    "proposedImprovement": "Provide a dedicated notice board at a suitable and easily visible location in the R&D department. All official notifications, important instructions, safety information, announcements and other relevant communication should be displayed systematically on the notice board. Old or expired notices should be removed periodically to maintain the board in an updated and organized condition",
    "expectedBenefits": "Supports better communication among R&D employees",
    "hodName": "",
    "hodApprovalDate": "Approved on 01/09/2026",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "Notice board, mounting hardware, display pins/magnets, labels/section dividers and basic stationery",
    "token": "936b14dc-224a-4f46-9259-61f7448359e8"
  },
  {
    "id": "KZN-2026-0031",
    "status": "Pending HOD Approval",
    "timestamp": "",
    "name": "Utsav Arora",
    "email": "b.maurya@sblcoatings.com",
    "department": "General",
    "category": "Productivity Improvement",
    "title": "Kaizen Proposal",
    "problem": "Time taken to pump 5KL batch raw material is too long",
    "proposedImprovement": "Change Diaphragm Pump with other reactor pump which is more fast and less noisy.",
    "expectedBenefits": "Charging time will reduce and hence reduce batch cycle time to 1 hour.",
    "hodName": "",
    "hodApprovalDate": "",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "No",
    "token": "f0660942-0a15-4484-a212-da200ec8e693"
  },
  {
    "id": "KZN-2026-0032",
    "status": "Pending HOD Approval",
    "timestamp": "",
    "name": "B R Maurya",
    "email": "b.maurya@sblcoatings.com",
    "department": "General",
    "category": "EHS improvement",
    "title": "Kaizen Proposal",
    "problem": "There are lot of fumes during charging and unloading batches of Resin.",
    "proposedImprovement": "Install exhaust fan on the wall behind reactors at ground floor. Also change the place of exhaust fan at boiler area to improve suction of boiler fumes.",
    "expectedBenefits": "Less exposure to fumes improve employees health.",
    "hodName": "",
    "hodApprovalDate": "",
    "hodComments": "",
    "assessorEmail": "",
    "verifiedAchievedBenefit": "",
    "dateVerified": "",
    "assessorLog": "",
    "assessorComments": "",
    "kaizenScore": 0,
    "resourceStatus": "Yes",
    "token": "7890f5c3-8657-4298-9368-08c9c005d27a"
  }
];
