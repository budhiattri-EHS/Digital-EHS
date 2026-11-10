// SBL Absolute Master Engine v37.0 - 76-Node Directive Checklist Definitions
// Forensic Fire Protection System Inspection Standard

export interface FPSDirective {
  uid: string;
  category: 'Metadata' | 'Extinguisher' | 'Hose Reel' | 'Hydrant' | 'Pump' | 'Valve' | 'Detector' | 'Final';
  field: string;
  question: string;
  expected: string;
}

export const FPS_DIRECTIVES: FPSDirective[] = [
  {
    "uid": "Q-01",
    "category": "Metadata",
    "field": "Log_ID",
    "question": "Unique system reference for this specific inspection.",
    "expected": "Auto"
  },
  {
    "uid": "Q-02",
    "category": "Metadata",
    "field": "Unit",
    "question": "Select the specific manufacturing unit you are inspecting.",
    "expected": "Enum"
  },
  {
    "uid": "Q-03",
    "category": "Metadata",
    "field": "Asset_ID",
    "question": "Scan QR or select the equipment tag from the registry.",
    "expected": "Ref"
  },
  {
    "uid": "Q-04",
    "category": "Metadata",
    "field": "Inspector_Email",
    "question": "Inspector identity recorded for audit accountability.",
    "expected": "Auto"
  },
  {
    "uid": "Q-05",
    "category": "Metadata",
    "field": "Timestamp",
    "question": "Exact forensic date and time of record entry.",
    "expected": "Auto"
  },
  {
    "uid": "Q-06",
    "category": "Metadata",
    "field": "Status_Found",
    "question": "Is the hardware currently Operational or Defective?",
    "expected": "Enum"
  },
  {
    "uid": "Q-07",
    "category": "Metadata",
    "field": "Score",
    "question": "Compliance percentage calculated from test data.",
    "expected": "100%"
  },
  {
    "uid": "Q-08",
    "category": "Metadata",
    "field": "Inspection_Photo",
    "question": "Take a photo ONLY if damage is visible.",
    "expected": "Image"
  },
  {
    "uid": "Q-09",
    "category": "Metadata",
    "field": "Inspector_Signature",
    "question": "Digital signature to certify results.",
    "expected": "Required"
  },
  {
    "uid": "Q-10",
    "category": "Metadata",
    "field": "Manager_Signature",
    "question": "Managerial sign-off (Visible only in review).",
    "expected": "Hidden"
  },
  {
    "uid": "Q-11",
    "category": "Metadata",
    "field": "Field_GPS",
    "question": "Capture coordinates to verify location.",
    "expected": "HERE()"
  },
  {
    "uid": "Q-12",
    "category": "Metadata",
    "field": "Ambient_Temp_C",
    "question": "Record current ambient temperature (°C).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-13",
    "category": "Metadata",
    "field": "Verified_Serial_No",
    "question": "Type the Serial Number seen on the tag.",
    "expected": "Text"
  },
  {
    "uid": "Q-14",
    "category": "Extinguisher",
    "field": "FE_Discharge_Hose",
    "question": "Physically check hose: Any cracks or blockage?",
    "expected": "OK"
  },
  {
    "uid": "Q-15",
    "category": "Extinguisher",
    "field": "FE_Discharge_Nozzle",
    "question": "Is the discharge nozzle clear and undamaged?",
    "expected": "OK"
  },
  {
    "uid": "Q-16",
    "category": "Extinguisher",
    "field": "FE_Safety_Pin_Seal",
    "question": "Is the safety pin inserted and seal unbroken?",
    "expected": "OK"
  },
  {
    "uid": "Q-17",
    "category": "Extinguisher",
    "field": "FE_Mounting",
    "question": "Is the unit securely hung and accessible?",
    "expected": "OK"
  },
  {
    "uid": "Q-18",
    "category": "Extinguisher",
    "field": "FE_Cleanliness",
    "question": "Is the cylinder clean and labels readable?",
    "expected": "OK"
  },
  {
    "uid": "Q-19",
    "category": "Hose Reel",
    "field": "HRH_Drum_Rotation",
    "question": "Does the drum rotate freely without jamming?",
    "expected": "OK"
  },
  {
    "uid": "Q-20",
    "category": "Hose Reel",
    "field": "HRH_Pipe_Condition",
    "question": "Are supply pipes free of leakage or corrosion?",
    "expected": "OK"
  },
  {
    "uid": "Q-21",
    "category": "Hose Reel",
    "field": "HRH_Nozzle_Condition",
    "question": "Is the nozzle operational with adjustable spray?",
    "expected": "OK"
  },
  {
    "uid": "Q-22",
    "category": "Hose Reel",
    "field": "HRH_Operational_Status",
    "question": "Is the entire assembly ready for use?",
    "expected": "OK"
  },
  {
    "uid": "Q-23",
    "category": "Hydrant",
    "field": "HYD_Butterfly_Valve",
    "question": "Operate valve: Does it cycle smoothly?",
    "expected": "OK"
  },
  {
    "uid": "Q-24",
    "category": "Hydrant",
    "field": "HYD_Operating_Wheel",
    "question": "Is handwheel undamaged and securely attached?",
    "expected": "OK"
  },
  {
    "uid": "Q-25",
    "category": "Hydrant",
    "field": "HYD_Female_Coupling_Washer",
    "question": "Is the rubber coupling washer present?",
    "expected": "OK"
  },
  {
    "uid": "Q-26",
    "category": "Hydrant",
    "field": "HYD_Lugs_Condition",
    "question": "Are coupling lugs straight and undamaged?",
    "expected": "OK"
  },
  {
    "uid": "Q-27",
    "category": "Hydrant",
    "field": "HYD_Blank_Cap",
    "question": "Is the blank cap present and tightened?",
    "expected": "OK"
  },
  {
    "uid": "Q-28",
    "category": "Hydrant",
    "field": "HYD_Lubrication",
    "question": "Are valve stems and threads adequately greased?",
    "expected": "OK"
  },
  {
    "uid": "Q-29",
    "category": "Hydrant",
    "field": "HYD_Flushing_Date",
    "question": "Date this hydrant was last flushed?",
    "expected": "Date"
  },
  {
    "uid": "Q-30",
    "category": "Hydrant",
    "field": "HYD_Pressure_Reading",
    "question": "Static pressure from outlet gauge (Bar).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-31",
    "category": "Hydrant",
    "field": "HYD_Box_Glass",
    "question": "Is hose box glass intact and frame clean?",
    "expected": "OK"
  },
  {
    "uid": "Q-32",
    "category": "Hydrant",
    "field": "HYD_Glass_Breaker",
    "question": "Is hammer available for breaking glass?",
    "expected": "OK"
  },
  {
    "uid": "Q-33",
    "category": "Hydrant",
    "field": "HYD_Box_Key",
    "question": "Is box key visible inside glass holder?",
    "expected": "Available"
  },
  {
    "uid": "Q-34",
    "category": "Hydrant",
    "field": "HYD_Branch_Nozzle",
    "question": "Are branch pipes present inside the box?",
    "expected": "OK"
  },
  {
    "uid": "Q-35",
    "category": "Hydrant",
    "field": "HYD_Hose_Quantity",
    "question": "Are exactly 2 lengths of hose present?",
    "expected": "2"
  },
  {
    "uid": "Q-36",
    "category": "Pump",
    "field": "PMP_Start_Time",
    "question": "Record engine ignition start time.",
    "expected": "Time"
  },
  {
    "uid": "Q-37",
    "category": "Pump",
    "field": "PMP_End_Time",
    "question": "Record engine shutdown stop time.",
    "expected": "Time"
  },
  {
    "uid": "Q-38",
    "category": "Pump",
    "field": "PMP_Suction_0",
    "question": "Suction Pressure at Start (Bar).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-39",
    "category": "Pump",
    "field": "PMP_Suction_15",
    "question": "Suction Pressure after 15 mins (Bar).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-40",
    "category": "Pump",
    "field": "PMP_Suction_30",
    "question": "Suction Pressure after 30 mins (Bar).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-41",
    "category": "Pump",
    "field": "PMP_Suction_45",
    "question": "Suction Pressure after 45 mins (Bar).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-42",
    "category": "Pump",
    "field": "PMP_Discharge_0",
    "question": "Discharge Pressure at Start (Bar).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-43",
    "category": "Pump",
    "field": "PMP_Discharge_15",
    "question": "Discharge Pressure after 15 mins (Bar).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-44",
    "category": "Pump",
    "field": "PMP_Discharge_30",
    "question": "Discharge Pressure after 30 mins (Bar).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-45",
    "category": "Pump",
    "field": "PMP_Discharge_45",
    "question": "Discharge Pressure after 45 mins (Bar).",
    "expected": "7-12"
  },
  {
    "uid": "Q-46",
    "category": "Pump",
    "field": "PMP_RPM_0",
    "question": "Engine RPM reading at Start.",
    "expected": "Numeric"
  },
  {
    "uid": "Q-47",
    "category": "Pump",
    "field": "PMP_RPM_15",
    "question": "Engine RPM after 15 mins.",
    "expected": "Numeric"
  },
  {
    "uid": "Q-48",
    "category": "Pump",
    "field": "PMP_RPM_30",
    "question": "Engine RPM after 30 mins.",
    "expected": "Numeric"
  },
  {
    "uid": "Q-49",
    "category": "Pump",
    "field": "PMP_RPM_45",
    "question": "Engine RPM after 45 mins (Target: 1750-1850).",
    "expected": "1800"
  },
  {
    "uid": "Q-50",
    "category": "Pump",
    "field": "PMP_Heat_Exch_Pr",
    "question": "Heat Exchanger Cooling Pressure (Bar).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-51",
    "category": "Pump",
    "field": "PMP_Flow_GPM",
    "question": "Measured water flow rate (GPM).",
    "expected": "2250"
  },
  {
    "uid": "Q-52",
    "category": "Pump",
    "field": "PMP_Temp",
    "question": "Final engine temperature (75-90°C).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-53",
    "category": "Pump",
    "field": "PMP_Oil_Pr",
    "question": "Engine oil pressure reading (2.5-5 Bar).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-54",
    "category": "Pump",
    "field": "PMP_Bat_1",
    "question": "Voltage for Battery Bank 1.",
    "expected": "12.5V+"
  },
  {
    "uid": "Q-55",
    "category": "Pump",
    "field": "PMP_Bat_2",
    "question": "Voltage for Battery Bank 2.",
    "expected": "12.5V+"
  },
  {
    "uid": "Q-56",
    "category": "Pump",
    "field": "PMP_Load",
    "question": "Percentage load on engine controller.",
    "expected": "80-100%"
  },
  {
    "uid": "Q-57",
    "category": "Valve",
    "field": "DV_Detection_Air_Pr",
    "question": "Detection air pressure (4.0-5.0 Kg).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-58",
    "category": "Valve",
    "field": "DV_Pilot_Head_Air_Pr",
    "question": "Air pressure at pilot head.",
    "expected": "Numeric"
  },
  {
    "uid": "Q-59",
    "category": "Valve",
    "field": "DV_Water_DV_Head_Pr",
    "question": "Water pressure at DV inlet.",
    "expected": "Numeric"
  },
  {
    "uid": "Q-60",
    "category": "Valve",
    "field": "DV_AFR_Condition",
    "question": "Is Air Filter Regulator functional?",
    "expected": "OK"
  },
  {
    "uid": "Q-61",
    "category": "Valve",
    "field": "DV_SOV_Condition",
    "question": "Is Solenoid Valve acting correctly?",
    "expected": "OK"
  },
  {
    "uid": "Q-62",
    "category": "Valve",
    "field": "DV_Pr_Switch_Delivery",
    "question": "Does pressure switch signal correctly?",
    "expected": "OK"
  },
  {
    "uid": "Q-63",
    "category": "Valve",
    "field": "DV_BV_Bypass",
    "question": "Is manual bypass valve closed?",
    "expected": "OK"
  },
  {
    "uid": "Q-64",
    "category": "Valve",
    "field": "DV_BV_Delivery",
    "question": "Is delivery valve sealed and open?",
    "expected": "OK"
  },
  {
    "uid": "Q-65",
    "category": "Valve",
    "field": "DV_BV_Test",
    "question": "Does test valve cycle smoothly?",
    "expected": "OK"
  },
  {
    "uid": "Q-66",
    "category": "Valve",
    "field": "DV_BV_Inlet",
    "question": "Is main inlet valve fully open?",
    "expected": "OK"
  },
  {
    "uid": "Q-67",
    "category": "Valve",
    "field": "DV_Y_Strainer",
    "question": "Has Y-Strainer been flushed?",
    "expected": "OK"
  },
  {
    "uid": "Q-68",
    "category": "Valve",
    "field": "DV_HOV_Condition",
    "question": "Is Hand Operated Valve operational?",
    "expected": "OK"
  },
  {
    "uid": "Q-69",
    "category": "Valve",
    "field": "DV_Foam_Level_Ltr",
    "question": "Foam concentrate level (Ltrs).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-70",
    "category": "Valve",
    "field": "DV_PLC_Interlock",
    "question": "Does PLC prevent dry-firing?",
    "expected": "OK"
  },
  {
    "uid": "Q-71",
    "category": "Valve",
    "field": "DV_PLC_Signalling",
    "question": "Signal received at Main Panel?",
    "expected": "OK"
  },
  {
    "uid": "Q-72",
    "category": "Valve",
    "field": "DV_Actuation_Sec",
    "question": "Time to full water flow (<60 Sec).",
    "expected": "Numeric"
  },
  {
    "uid": "Q-73",
    "category": "Valve",
    "field": "DV_Closing_Sec",
    "question": "Time for valve closure after reset.",
    "expected": "Numeric"
  },
  {
    "uid": "Q-74",
    "category": "Detector",
    "field": "DET_LED_Flashing",
    "question": "Is detector LED flashing in standby?",
    "expected": "OK"
  },
  {
    "uid": "Q-75",
    "category": "Detector",
    "field": "DET_Alarm_Test_Working",
    "question": "Does trigger alarm during test?",
    "expected": "OK"
  },
  {
    "uid": "Q-76",
    "category": "Final",
    "field": "Remarks",
    "question": "Enter technical notes or defect details.",
    "expected": "Text"
  }
];

export interface InspectionRecord {
  logId: string;
  unit: string;
  assetId: string;
  inspectorEmail: string;
  timestamp: string;
  statusFound: 'Operational' | 'Defective';
  score: number;
  inspectionPhoto?: string;
  inspectorSignature?: string;
  fieldGps?: string;
  ambientTempC?: number;
  verifiedSerialNo?: string;
  remarks?: string;
  checklistData: Record<string, any>;
}

export interface CAPAItem {
  issueId: string;
  unit: string;
  assetId: string;
  dateRaised: string;
  severity: 'CRITICAL' | 'MAJOR' | 'NORMAL';
  faultDescription: string;
  assignedTo: string;
  status: 'OPEN' | 'RESOLVED';
  resolutionDate?: string;
}

// Initial baseline CAPA records
export const INITIAL_CAPA_ITEMS: CAPAItem[] = [
  {
    issueId: 'ISS-20261101-01',
    unit: 'Unit 3-Lalru',
    assetId: '124',
    dateRaised: '11/01/2026',
    severity: 'CRITICAL',
    faultDescription: 'Hydrant Box Key missing at Production Gate 2.',
    assignedTo: 'Unit Safety Lead',
    status: 'OPEN'
  },
  {
    issueId: 'ISS-20261028-02',
    unit: 'Unit 2-Derabassi',
    assetId: '42',
    dateRaised: '10/28/2026',
    severity: 'MAJOR',
    faultDescription: 'FE Discharge Hose crack detected during safety round.',
    assignedTo: 'Unit Safety Lead',
    status: 'OPEN'
  },
  {
    issueId: 'ISS-20261015-03',
    unit: 'Unit 3-Lalru',
    assetId: 'GDLEL 02',
    dateRaised: '10/15/2026',
    severity: 'NORMAL',
    faultDescription: 'Gas detector zero calibration recalibration due.',
    assignedTo: 'Instrumentation Tech',
    status: 'OPEN'
  }
];
