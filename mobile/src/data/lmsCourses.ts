// Authoritative SBL LMS Courses Catalog (From Google Sheet 1Dx0pLWeBbisLsI3luusmPd0_YJq4ROV7FzOzwGteaVI)
export interface SblLmsQuestion {
  text_en: string;
  text_hi?: string;
  options: string[];
  answer: string;
}

export interface SblLmsCourse {
  id: string;
  titleEn: string;
  titleHi: string;
  videoUrl: string;
  dept: string;
  desig: string;
  questions: SblLmsQuestion[];
  isCleared?: boolean;
  statusLabel?: 'COMPLETED' | 'PENDING';
}

export const SBL_LMS_CATALOG: SblLmsCourse[] = [
  {
    id: "SBL-EHS-001",
    titleEn: "Emergency Response Plan",
    titleHi: "आपातकालीन प्रतिक्रिया योजना",
    videoUrl: "https://drive.google.com/file/d/1I16NhQUJMNMVxZitTz7daUWLa5T9hIb8/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Do you go to the Assembly Point during an alarm?","text_hi":"क्या आप अलार्म बजने पर असेंबली पॉइंट पर जाते हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should you wait to finish your work after the siren?","text_hi":"क्या आपको सायरन बजने के बाद अपना काम पूरा करने का इंतज़ार करना चाहिए?","options":["Wait (इंतज़ार करें)","Evacuate (तुरंत बाहर निकलें)"],"answer":"Evacuate (तुरंत बाहर निकलें)"},{"text_en":"Is the ERP only for the EHS Manager to know?","text_hi":"क्या ERP की जानकारी सिर्फ EHS मैनेजर के लिए है?","options":["True (सही)","False (गलत)"],"answer":"False (गलत)"},{"text_en":"In a fire, do you use the nearest marked exit?","text_hi":"आग लगने पर, क्या आप निकटतम चिह्नित निकास का उपयोग करते हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should you call the emergency number immediately?","text_hi":"क्या आपको तुरंत आपातकालीन नंबर पर कॉल करना चाहिए?","options":["Yes (हाँ)","Later (बाद में)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-002",
    titleEn: "5S",
    titleHi: "5S",
    videoUrl: "https://drive.google.com/file/d/1FLwCQS6p-P3iTlnVFq5PuDx4B-heMRVE/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Does Seiri mean sorting and removing waste?","text_hi":"क्या Seiri का अर्थ छँटाई करना और कचरे को हटाना है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Is 5S just for cleaning the floor?","text_hi":"क्या 5S केवल फर्श की सफाई के लिए है?","options":["Cleaning only (सिर्फ सफाई)","Organization (व्यवस्थित करना)"],"answer":"Organization (व्यवस्थित करना)"},{"text_en":"Should every tool have a designated shadow place?","text_hi":"क्या प्रत्येक उपकरण के लिए एक निर्धारित स्थान होना चाहिए?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Is 5S a one-time activity?","text_hi":"क्या 5S एक बार की जाने वाली गतिविधि है?","options":["One-time (एक बार)","Daily habit (दैनिक आदत)"],"answer":"Daily habit (दैनिक आदत)"},{"text_en":"Does a clean workspace reduce accidents?","text_hi":"क्या साफ कार्यस्थल दुर्घटनाओं को कम करता है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-003",
    titleEn: "Forklift Safety",
    titleHi: "फोर्कलिफ्ट सुरक्षा",
    videoUrl: "https://drive.google.com/file/d/15KNyHvyEG0cuJyyjKPLQDMnPHhZHOY4j/view?usp=sharing",
    dept: "Manufacturing",
    desig: "GLOBAL",
    questions: [{"text_en":"Can you carry a passenger on a forklift?","text_hi":"क्या आप फोर्कलिफ्ट पर किसी सवारी को ले जा सकते हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"No (नहीं)"},{"text_en":"Should the forks be kept low while driving?","text_hi":"क्या वाहन चलाते समय फोर्क को नीचे रखा जाना चाहिए?","options":["Low (नीचे)","High (ऊपर)"],"answer":"Low (नीचे)"},{"text_en":"Is it okay to drive with a blocked view?","text_hi":"क्या दृश्य बाधित होने पर गाड़ी चलाना ठीक है?","options":["Yes (हाँ)","Reverse only (सिर्फ रिवर्स में)"],"answer":"Reverse only (सिर्फ रिवर्स में)"},{"text_en":"Should you blow the horn at blind turns?","text_hi":"क्या आपको अंधे मोड़ों पर हॉर्न बजाना चाहिए?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Can anyone with a car license drive a forklift?","text_hi":"क्या कार लाइसेंस वाला कोई भी व्यक्ति फोर्कलिफ्ट चला सकता है?","options":["Yes (हाँ)","Certified only (सिर्फ प्रमाणित)"],"answer":"Certified only (सिर्फ प्रमाणित)"}]
  },
  {
    id: "SBL-EHS-004",
    titleEn: "Unsafe Act, Condition & Nearmiss",
    titleHi: "असुरक्षित कार्य, असुरक्षित स्थिति एवं निकट-दुर्घटना",
    videoUrl: "https://drive.google.com/file/d/1GAiQ_C2RRYSGE575BGblfPz7aOcSWWBV/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Is a near-miss a lucky escape with no injury?","text_hi":"क्या नियर-मिस बिना चोट के बाल-बाल बचना है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should you report a broken ladder (Unsafe Condition)?","text_hi":"क्या आपको टूटी हुई सीढ़ी (असुरक्षित स्थिति) की रिपोर्ट करनी चाहिए?","options":["Report (रिपोर्ट करें)","Ignore (अनदेखा करें)"],"answer":"Report (रिपोर्ट करें)"},{"text_en":"Is standing under a suspended load an Unsafe Act?","text_hi":"क्या लटके हुए भार के नीचे खड़ा होना एक असुरक्षित कार्य है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Does reporting near-misses prevent future deaths?","text_hi":"क्या नियर-मिस की रिपोर्ट करने से भविष्य में होने वाली मौतें रुकती हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Is an oil spill on the floor an Unsafe Condition?","text_hi":"क्या फर्श पर तेल का गिरना एक असुरक्षित स्थिति है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-005",
    titleEn: "Behavior based safety",
    titleHi: "व्यवहार आधारित सुरक्षा",
    videoUrl: "https://drive.google.com/file/d/1MUKjhKmx5s-0tQ6vZsJuTSicrcEyn84X/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Should you stop a coworker doing something unsafe?","text_hi":"क्या आपको असुरक्षित कार्य करने वाले सहकर्मी को रोकना चाहिए?","options":["Stop them (रोकें)","Mind your work (अपना काम करें)"],"answer":"Stop them (रोकें)"},{"text_en":"Is safety a habit or a set of rules?","text_hi":"क्या सुरक्षा एक आदत है या नियमों का एक समूह?","options":["Rules (नियम)","Habit (आदत)"],"answer":"Habit (आदत)"},{"text_en":"Should we reward safe behaviors at work?","text_hi":"क्या हमें काम पर सुरक्षित व्यवहार को पुरस्कृत करना चाहिए?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Is shortcutting for speed a safe behavior?","text_hi":"क्या गति के लिए शॉर्टकट लेना एक सुरक्षित व्यवहार है?","options":["Safe (सुरक्षित)","Unsafe (असुरक्षित)"],"answer":"Unsafe (असुरक्षित)"},{"text_en":"Are most accidents caused by human behavior?","text_hi":"क्या अधिकांश दुर्घटनाएं मानवीय व्यवहार के कारण होती हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-006",
    titleEn: "Safety- everyone responsibility",
    titleHi: "सुरक्षा – सभी की जिम्मेदारी",
    videoUrl: "https://drive.google.com/file/d/1XKQ9jUtImA_nFz8WB21Kh7bGhA_XVKkt/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Is safety only the EHS Managers job?","text_hi":"क्या सुरक्षा केवल EHS मैनेजर का काम है?","options":["Yes (हाँ)","Everyone (सबकी)"],"answer":"Everyone (सबकी)"},{"text_en":"Can you bypass safety rules for high production?","text_hi":"क्या आप अधिक उत्पादन के लिए सुरक्षा नियमों को छोड़ सकते हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"No (नहीं)"},{"text_en":"Should you report a hazard even if it is not in your area?","text_hi":"क्या आपको खतरे की रिपोर्ट करनी चाहिए भले ही वह आपके क्षेत्र में न हो?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Is wearing PPE your own choice?","text_hi":"क्या PPE पहनना आपकी अपनी पसंद है?","options":["Choice (पसंद)","Mandatory (अनिवार्य)"],"answer":"Mandatory (अनिवार्य)"},{"text_en":"Should safety be discussed in every meeting?","text_hi":"क्या हर बैठक में सुरक्षा पर चर्चा होनी चाहिए?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-007",
    titleEn: "Electrical Safety",
    titleHi: "विद्युत सुरक्षा",
    videoUrl: "https://drive.google.com/file/d/1sZlbnZRAQTayBDNKtkku6xkBzwy8NUd6/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Can you use a damaged electrical cord?","text_hi":"क्या आप क्षतिग्रस्त बिजली के तार का उपयोग कर सकते हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"No (नहीं)"},{"text_en":"Should you use water to extinguish an electrical fire?","text_hi":"क्या आपको बिजली की आग बुझाने के लिए पानी का उपयोग करना चाहिए?","options":["Yes (हाँ)","No (नहीं)"],"answer":"No (नहीं)"},{"text_en":"Is LOTO mandatory before machine maintenance?","text_hi":"क्या मशीन के रखरखाव से पहले LOTO अनिवार्य है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Can any worker fix a high-voltage panel?","text_hi":"क्या कोई भी कर्मचारी हाई-वोल्टेज पैनल को ठीक कर सकता?","options":["Yes (हाँ)","Electrician only (सिर्फ इलेक्ट्रीशियन)"],"answer":"Electrician only (सिर्फ इलेक्ट्रीशियन)"},{"text_en":"Is a Spark a sign of an electrical hazard?","text_hi":"क्या चिंगारी बिजली के खतरे का संकेत है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-008",
    titleEn: "Machine Guarding",
    titleHi: "मशीन गार्डिंग",
    videoUrl: "https://drive.google.com/file/d/170qNWHPO4HM6CjGqNTKbdQ6wLsf4dlTc/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Can you remove a machine guard while it is running?","text_hi":"क्या आप मशीन चलने के दौरान उसका गार्ड हटा सकते हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"No (नहीं)"},{"text_en":"Are guards designed to protect your hands/fingers?","text_hi":"क्या गार्ड आपके हाथों/उंगलियों की सुरक्षा के लिए बनाए गए हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should you operate a machine if the guard is broken?","text_hi":"क्या गार्ड टूटा होने पर आपको मशीन चलानी चाहिए?","options":["Yes (हाँ)","No (नहीं)"],"answer":"No (नहीं)"},{"text_en":"Is an emergency stop button a type of guard?","text_hi":"क्या इमरजेंसी स्टॉप बटन एक प्रकार का गार्ड है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should fixed guards be bolted securely?","text_hi":"क्या फिक्स्ड गार्ड को सुरक्षित रूप से बोल्ट किया जाना चाहिए?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-009",
    titleEn: "Zero Harm Mindset",
    titleHi: "शून्य दुर्घटना की मानसिकता",
    videoUrl: "https://drive.google.com/file/d/1cJUnndWny-9xdvq3RT1w-0sjekCOQlUp/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Is Zero Harm a realistic goal?","text_hi":"क्या जीरो हार्म एक वास्तविक लक्ष्य है?","options":["Yes (हाँ)","Impossible (असंभव)"],"answer":"Yes (हाँ)"},{"text_en":"Does it mean even a small cut is unacceptable?","text_hi":"क्या इसका मतलब है कि एक छोटा सा कट भी अस्वीकार्य है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should production take priority over zero harm?","text_hi":"क्या उत्पादन को जीरो हार्म से ऊपर प्राथमिकता दी जानी चाहिए?","options":["Production (उत्पादन)","Zero Harm (जीरो हार्म)"],"answer":"Zero Harm (जीरो हार्म)"},{"text_en":"Is safety thinking required only during work hours?","text_hi":"क्या सुरक्षा की सोच केवल काम के घंटों के दौरान आवश्यक है?","options":["Always (हमेशा)","Work only (सिर्फ काम पर)"],"answer":"Always (हमेशा)"},{"text_en":"Can we achieve zero accidents by working together?","text_hi":"क्या हम मिलकर काम करके जीरो एक्सीडेंट पा सकते हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-010",
    titleEn: "HIRA (Hazard Identification & Risk Assessment)",
    titleHi: "जोखिम पहचान एवं जोखिम मूल्यांकन (HIRA)",
    videoUrl: "https://drive.google.com/file/d/1VbraJXJqQA2_5UokvIMdVA0aKHilFQbR/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Does HIRA help in identifying risks before a task?","text_hi":"क्या HIRA कार्य से पहले जोखिमों की पहचान करने में मदद करता है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Is a Hazard something with potential to cause harm?","text_hi":"क्या Hazard (खतरा) वह है जिसमें नुकसान पहुँचाने की क्षमता हो?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should HIRA be done only after an accident?","text_hi":"क्या HIRA केवल दुर्घटना के बाद ही किया जाना चाहिए?","options":["After (बाद में)","Before (पहले)"],"answer":"Before (पहले)"},{"text_en":"Is a high-risk task allowed without control measures?","text_hi":"क्या बिना नियंत्रण उपायों के उच्च-जोखिम वाले कार्य की अनुमति है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"No (नहीं)"},{"text_en":"Is HIRA a legal requirement in many industries?","text_hi":"क्या कई उद्योगों में HIRA एक कानूनी आवश्यकता है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-011",
    titleEn: "Fire Safety Training",
    titleHi: "अग्नि सुरक्षा प्रशिक्षण",
    videoUrl: "https://drive.google.com/file/d/1QVmI4-3ymnufbwwMm9bpnj_jHpm4Hz6i/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Does the S in PASS stand for Squeeze the handle?","text_hi":"क्या PASS में S का अर्थ हैंडल दबाना (Squeeze) है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should you aim the extinguisher at the top of the flames?","text_hi":"क्या आपको बुझाने वाले यंत्र को लपटों के शीर्ष पर केंद्रित करना चाहिए?","options":["Top (ऊपर)","Base (नीचे/आधार)"],"answer":"Base (नीचे/आधार)"},{"text_en":"Are CO2 extinguishers safe for electrical fires?","text_hi":"क्या CO2 बुझाने वाले यंत्र बिजली की आग के लिए सुरक्षित हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should fire exits be kept locked for security?","text_hi":"क्या सुरक्षा के लिए फायर एग्जिट को बंद रखना चाहिए?","options":["Locked (बंद)","Open/Clear (खुला/साफ)"],"answer":"Open/Clear (खुला/साफ)"},{"text_en":"Is a Fire Drill necessary for practice?","text_hi":"क्या अभ्यास के लिए फायर ड्रिल आवश्यक है?","options":["Yes (हाँ)","Waste of time (समय की बर्बादी)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-012",
    titleEn: "MSDS",
    titleHi: "सामग्री सुरक्षा डेटा पत्रक (MSDS)",
    videoUrl: "https://drive.google.com/file/d/1EEbXns4LpS9laj14pdluHhBKAyIjCrjW/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Does MSDS provide information on chemical hazards?","text_hi":"क्या MSDS रासायनिक खतरों के बारे में जानकारी प्रदान करता है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should you read the MSDS before using a new chemical?","text_hi":"क्या आपको नए रसायन का उपयोग करने से पहले MSDS पढ़ना चाहिए?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Does MSDS list required PPE for a chemical?","text_hi":"क्या MSDS रसायन के लिए आवश्यक PPE की सूची देता है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Is the first aid info for spills found in the MSDS?","text_hi":"क्या रिसाव के लिए प्राथमिक चिकित्सा की जानकारी MSDS में मिलती है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Can you find the chemical flashpoint in its MSDS?","text_hi":"क्या आप MSDS में रसायन का फ्लैशपॉइंट पा सकते हैं?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-013",
    titleEn: "Chemical Storage and Spill Management",
    titleHi: "रसायन भंडारण एवं रिसाव प्रबंधन",
    videoUrl: "https://drive.google.com/file/d/1_6LdQ7Mh9nwoAc0eLzvF7iSeNdPmtc1q/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"Should chemicals be stored alphabetically regardless of reaction?","text_hi":"क्या रसायनों को प्रतिक्रिया की परवाह किए बिना वर्णानुक्रम में संग्रहीत किया जाना चाहिए?","options":["Yes (हाँ)","No (Compatibility only)"],"answer":"No (Compatibility only)"},{"text_en":"Is a Spill Kit used to clean up chemical leaks?","text_hi":"क्या रासायनिक रिसाव को साफ करने के लिए स्पिल किट का उपयोग किया जाता है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Should secondary containment (bunds) be used for liquids?","text_hi":"क्या तरल पदार्थों के लिए सेकेंडरी कंटेनमेंट (बंड्स) का उपयोग किया जाना चाहिए?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"In a spill, should you protect the drains first?","text_hi":"रिसाव में, क्या आपको पहले नालियों की रक्षा करनी चाहिए?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Is smoking allowed in the chemical store?","text_hi":"क्या केमिकल स्टोर में धूम्रपान की अनुमति है?","options":["Yes (हाँ)","Strictly No (बिल्कुल नहीं)"],"answer":"Strictly No (बिल्कुल नहीं)"}]
  },
  {
    id: "SBL-EHS-014",
    titleEn: "Environment Conservation ",
    titleHi: "पर्यावरण संरक्षण",
    videoUrl: "https://drive.google.com/file/d/1NurnhbkHFq3OduU-TQcPbfODWgKSTjg2/view?usp=sharing",
    dept: "GLOBAL",
    desig: "GLOBAL",
    questions: [{"text_en":"What is the main cause of climate change discussed in the training?","text_hi":"ट्रेनिंग में जलवायु परिवर्तन का मुख्य कारण किसे बताया गया है?","options":["Circular nature (सर्कुलर प्रकृति)","Linear mindset - extract, use, throw (लीनियर मानसिकता - निकालो, इस्तेमाल करो, फेंको)"],"answer":"Linear mindset - extract, use, throw (लीनियर मानसिकता - निकालो, इस्तेमाल करो, फेंको)"},{"text_en":"Leaving a solvent drum open releases what into the air?","text_hi":"सॉल्वेंट का ड्रम खुला छोड़ने से हवा में क्या घुलता है?","options":["Harmless steam (नुकसान न करने वाली भाप)","Toxic VOCs and company money (ज़हरीले VOCs और कंपनी का पैसा)"],"answer":"Toxic VOCs and company money (ज़हरीले VOCs और कंपनी का पैसा)"},{"text_en":"What does a hissing compressed air leak actually represent?","text_hi":"कंप्रेस्ड एयर के पाइप से आने वाली हिस्स की आवाज़ असल में क्या दर्शाती है?","options":["Normal machine operation (मशीन का सामान्य काम)","Wasted electricity and money (बर्बाद हो रही बिजली और पैसा)"],"answer":"Wasted electricity and money (बर्बाद हो रही बिजली और पैसा)"},{"text_en":"How can the sales team reduce their direct contribution to climate change?","text_hi":"सेल्स टीम जलवायु परिवर्तन में अपने सीधे योगदान को कैसे कम कर सकती है?","options":["By optimizing travel routes and carpooling (ट्रैवल रूट को ऑप्टिमाइज़ करके और कारपूलिंग से)","By keeping the car engine running in traffic (ट्रैफिक में कार का इंजन चालू रखकर)"],"answer":"By optimizing travel routes and carpooling (ट्रैवल रूट को ऑप्टिमाइज़ करके और कारपूलिंग से)"},{"text_en":"How should recyclable solvent and water be treated in the plant?","text_hi":"प्लांट में रिसाइकल होने वाले सॉल्वेंट और पानी को क्या समझना चाहिए?","options":["As useless garbage (बेकार कचरा)","As valuable raw materials (कीमती कच्चा माल)"],"answer":"As valuable raw materials (कीमती कच्चा माल)"}]
  },
  {
    id: "SBL-EHS-015",
    titleEn: "Static charge",
    titleHi: "Static charge",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-016",
    titleEn: "Use of PPE",
    titleHi: "Use of PPE",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-017",
    titleEn: "Use of Safety Shower",
    titleHi: "Use of Safety Shower",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-018",
    titleEn: "Cylinder Safety",
    titleHi: "Cylinder Safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-019",
    titleEn: "Confined space safety",
    titleHi: "Confined space safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-020",
    titleEn: "Scaffold safety",
    titleHi: "Scaffold safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-021",
    titleEn: "Grinder Safety",
    titleHi: "Grinder Safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-022",
    titleEn: "Mixer Safety",
    titleHi: "Mixer Safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-023",
    titleEn: "Use of Fire Extinguihser",
    titleHi: "Use of Fire Extinguihser",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-024",
    titleEn: "Chemical Hazard",
    titleHi: "Chemical Hazard",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-025",
    titleEn: "Slip Trip and Fall",
    titleHi: "Slip Trip and Fall",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-026",
    titleEn: "Use of Hand Pellet Trolley",
    titleHi: "Use of Hand Pellet Trolley",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-027",
    titleEn: "Safe use of Hoist",
    titleHi: "Safe use of Hoist",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-028",
    titleEn: "Use of Static earthing dissipator",
    titleHi: "Use of Static earthing dissipator",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-029",
    titleEn: "Ladder Safety",
    titleHi: "Ladder Safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-030",
    titleEn: "Hazards of NC",
    titleHi: "Hazards of NC",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-031",
    titleEn: "Hazardous Waste safety and disposal",
    titleHi: "Hazardous Waste safety and disposal",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-032",
    titleEn: "Compressed air safety",
    titleHi: "Compressed air safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-033",
    titleEn: "Safe use of hand tools",
    titleHi: "Safe use of hand tools",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-034",
    titleEn: "Use of Hydrant System",
    titleHi: "Use of Hydrant System",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-035",
    titleEn: "Use of Fire monitors",
    titleHi: "Use of Fire monitors",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-036",
    titleEn: "Use of first aid hose reel",
    titleHi: "Use of first aid hose reel",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-037",
    titleEn: "use of first aid box",
    titleHi: "use of first aid box",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-038",
    titleEn: "Fire detection system - Smoke detector",
    titleHi: "Fire detection system - Smoke detector",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-039",
    titleEn: "Fire detection system - Heat detector",
    titleHi: "Fire detection system - Heat detector",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-040",
    titleEn: "Fire detection system - Flame detector",
    titleHi: "Fire detection system - Flame detector",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-041",
    titleEn: "Fire detection system - Gas detector",
    titleHi: "Fire detection system - Gas detector",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-042",
    titleEn: "Fire supression system - Sprinklers",
    titleHi: "Fire supression system - Sprinklers",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-043",
    titleEn: "Fire supression system - Foam Nozzle",
    titleHi: "Fire supression system - Foam Nozzle",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-044",
    titleEn: "Fire supression system - Deluge Valve",
    titleHi: "Fire supression system - Deluge Valve",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-045",
    titleEn: "Sewage treatment plant",
    titleHi: "Sewage treatment plant",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-046",
    titleEn: "Fire Pump House",
    titleHi: "Fire Pump House",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-047",
    titleEn: "Drum cutting safety ",
    titleHi: "Drum cutting safety ",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-048",
    titleEn: "Dangers of Horseplay",
    titleHi: "Dangers of Horseplay",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-049",
    titleEn: "Road Safety",
    titleHi: "Road Safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-050",
    titleEn: "Reptile Safety",
    titleHi: "Reptile Safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-051",
    titleEn: "Bee Safety",
    titleHi: "Bee Safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-052",
    titleEn: "Dog safety",
    titleHi: "Dog safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-053",
    titleEn: "Harsh Weather Safety",
    titleHi: "Harsh Weather Safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
  {
    id: "SBL-EHS-054",
    titleEn: "asbestos safety",
    titleHi: "asbestos safety",
    videoUrl: "",
    dept: "UNASSIGNED",
    desig: "DRAFT",
    questions: [{"text_en":"Have you understood the safety and compliance procedures shown in this training?","text_hi":"क्या आपने इस प्रशिक्षण में दिखाई गई सुरक्षा और अनुपालन प्रक्रियाओं को समझ लिया है?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"},{"text_en":"Will you strictly follow these safety standards on the plant shopfloor?","text_hi":"क्या आप प्लांट शॉपफ्लोर पर इन सुरक्षा मानकों का कड़ाई से पालन करेंगे?","options":["Yes (हाँ)","No (नहीं)"],"answer":"Yes (हाँ)"}]
  },
];
