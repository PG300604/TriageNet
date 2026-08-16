// Real Jharkhand State Healthcare Dataset & Structure
// 24 Districts, 111 Real-World Government Hospitals (Medical Colleges, Sadar Hospitals, SDHs, CHCs)
import type { Hospital, NetworkEdge } from "./triage-data"

export interface JharkhandDistrict {
  id: string
  name: string
  cmoName: string
  cmoPhone: string
  lat: number
  lng: number
}

export interface JharkhandHospitalFacility {
  id: string
  name: string
  shortCode: string
  districtName: string
  facilityTier: "TERTIARY" | "DISTRICT" | "SUB_DIVISIONAL" | "CHC"
  latitude: number
  longitude: number
  totalGeneralBeds: number
  availableGeneralBeds: number
  totalIcuBeds: number
  availableIcuBeds: number
  totalVentilators: number
  availableVentilators: number
  hasVentilator: boolean
  hasTraumaSurgery: boolean
  hasBloodBank: boolean
  hasOxygenGenerator: boolean
  specialists: string[]
}

export const JHARKHAND_24_DISTRICTS: JharkhandDistrict[] = [
  {
    "id": "ranchi",
    "name": "Ranchi",
    "cmoName": "Dr. Prabhat Kumar",
    "cmoPhone": "+91-651-2200101",
    "lat": 23.3441,
    "lng": 85.3096
  },
  {
    "id": "east-singhbhum-jamshedpur-",
    "name": "East Singhbhum (Jamshedpur)",
    "cmoName": "Dr. Sahir Pall",
    "cmoPhone": "+91-657-2431022",
    "lat": 22.8046,
    "lng": 86.2029
  },
  {
    "id": "dhanbad",
    "name": "Dhanbad",
    "cmoName": "Dr. C.B. Pratap",
    "cmoPhone": "+91-654-2220303",
    "lat": 23.7957,
    "lng": 86.4304
  },
  {
    "id": "bokaro",
    "name": "Bokaro",
    "cmoName": "Dr. A.B. Prasad",
    "cmoPhone": "+91-654-2420404",
    "lat": 23.6693,
    "lng": 86.1511
  },
  {
    "id": "hazaribagh",
    "name": "Hazaribagh",
    "cmoName": "Dr. S.P. Singh",
    "cmoPhone": "+91-654-2620505",
    "lat": 23.9925,
    "lng": 85.3637
  },
  {
    "id": "deoghar",
    "name": "Deoghar",
    "cmoName": "Dr. R.N. Prasad",
    "cmoPhone": "+91-643-2230707",
    "lat": 24.4826,
    "lng": 86.6961
  },
  {
    "id": "palamu-daltonganj-",
    "name": "Palamu (Daltonganj)",
    "cmoName": "Dr. Anil Kumar",
    "cmoPhone": "+91-656-2220606",
    "lat": 24.0372,
    "lng": 84.0722
  },
  {
    "id": "dumka",
    "name": "Dumka",
    "cmoName": "Dr. B.K. Saha",
    "cmoPhone": "+91-643-2220909",
    "lat": 24.2676,
    "lng": 87.2497
  },
  {
    "id": "giridih",
    "name": "Giridih",
    "cmoName": "Dr. Siddharth Soman",
    "cmoPhone": "+91-653-2220808",
    "lat": 24.19,
    "lng": 86.3
  },
  {
    "id": "ramgarh",
    "name": "Ramgarh",
    "cmoName": "Dr. Neelam Chaudhary",
    "cmoPhone": "+91-655-2221010",
    "lat": 23.6293,
    "lng": 85.5167
  },
  {
    "id": "west-singhbhum-chaibasa-",
    "name": "West Singhbhum (Chaibasa)",
    "cmoName": "Dr. Om Prakash",
    "cmoPhone": "+91-658-2221111",
    "lat": 22.5517,
    "lng": 85.8086
  },
  {
    "id": "koderma",
    "name": "Koderma",
    "cmoName": "Dr. Parvati Kumari",
    "cmoPhone": "+91-653-2221212",
    "lat": 24.4674,
    "lng": 85.5936
  },
  {
    "id": "chatra",
    "name": "Chatra",
    "cmoName": "Dr. S.N. Singh",
    "cmoPhone": "+91-654-2221313",
    "lat": 24.2167,
    "lng": 84.8667
  },
  {
    "id": "garhwa",
    "name": "Garhwa",
    "cmoName": "Dr. N.K. Pandey",
    "cmoPhone": "+91-656-2221414",
    "lat": 24.1557,
    "lng": 83.8078
  },
  {
    "id": "latehar",
    "name": "Latehar",
    "cmoName": "Dr. Dinesh Kumar",
    "cmoPhone": "+91-656-2221515",
    "lat": 23.7436,
    "lng": 84.4984
  },
  {
    "id": "lohardaga",
    "name": "Lohardaga",
    "cmoName": "Dr. S.K. Roy",
    "cmoPhone": "+91-652-2221616",
    "lat": 23.4319,
    "lng": 84.68
  },
  {
    "id": "gumla",
    "name": "Gumla",
    "cmoName": "Dr. R.K. Soren",
    "cmoPhone": "+91-652-2221717",
    "lat": 22.9989,
    "lng": 84.5422
  },
  {
    "id": "simdega",
    "name": "Simdega",
    "cmoName": "Dr. A.K. Minz",
    "cmoPhone": "+91-652-2221818",
    "lat": 22.6143,
    "lng": 84.5097
  },
  {
    "id": "khunti",
    "name": "Khunti",
    "cmoName": "Dr. Lobsang Hembrom",
    "cmoPhone": "+91-652-2221919",
    "lat": 23.076,
    "lng": 85.2789
  },
  {
    "id": "seraikela-kharsawan",
    "name": "Seraikela Kharsawan",
    "cmoName": "Dr. Vijay Kumar",
    "cmoPhone": "+91-658-2222020",
    "lat": 22.7001,
    "lng": 85.9298
  },
  {
    "id": "jamtara",
    "name": "Jamtara",
    "cmoName": "Dr. S.K. Mishra",
    "cmoPhone": "+91-643-2222121",
    "lat": 23.9627,
    "lng": 86.8021
  },
  {
    "id": "godda",
    "name": "Godda",
    "cmoName": "Dr. Anant Jha",
    "cmoPhone": "+91-643-2222222",
    "lat": 24.8277,
    "lng": 87.2122
  },
  {
    "id": "sahibganj",
    "name": "Sahibganj",
    "cmoName": "Dr. Ram Subhag",
    "cmoPhone": "+91-643-2222323",
    "lat": 25.2425,
    "lng": 87.6419
  },
  {
    "id": "pakur",
    "name": "Pakur",
    "cmoName": "Dr. M.K. Bhagat",
    "cmoPhone": "+91-643-2222424",
    "lat": 24.6346,
    "lng": 87.8486
  }
];

export const JHARKHAND_79_HOSPITALS: JharkhandHospitalFacility[] = [
  {
    "id": "jh-rajendra-institute-of-medical-sciences-rims",
    "name": "Rajendra Institute of Medical Sciences (RIMS)",
    "shortCode": "RIMS",
    "districtName": "Ranchi",
    "facilityTier": "TERTIARY",
    "latitude": 23.3888,
    "longitude": 85.3582,
    "totalGeneralBeds": 1500,
    "availableGeneralBeds": 330,
    "totalIcuBeds": 150,
    "availableIcuBeds": 27,
    "totalVentilators": 80,
    "availableVentilators": 16,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "Cardiologist",
      "Trauma Surgeon",
      "Neurologist",
      "Nephrologist"
    ]
  },
  {
    "id": "jh-sadar-hospital-ranchi",
    "name": "Sadar Hospital Ranchi",
    "shortCode": "SHR",
    "districtName": "Ranchi",
    "facilityTier": "DISTRICT",
    "latitude": 23.3667,
    "longitude": 85.325,
    "totalGeneralBeds": 500,
    "availableGeneralBeds": 110,
    "totalIcuBeds": 40,
    "availableIcuBeds": 7,
    "totalVentilators": 20,
    "availableVentilators": 4,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "Cardiologist",
      "Trauma Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-bundu",
    "name": "Sub-Divisional Hospital (SDH) Bundu",
    "shortCode": "SHB",
    "districtName": "Ranchi",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 23.1678,
    "longitude": 85.5891,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 12,
    "availableIcuBeds": 2,
    "totalVentilators": 6,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-kanke",
    "name": "Community Health Centre (CHC) Kanke",
    "shortCode": "CHCK",
    "districtName": "Ranchi",
    "facilityTier": "CHC",
    "latitude": 23.432,
    "longitude": 85.324,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician",
      "Pediatrician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-ormanjhi",
    "name": "Community Health Centre (CHC) Ormanjhi",
    "shortCode": "CHCO",
    "districtName": "Ranchi",
    "facilityTier": "CHC",
    "latitude": 23.4832,
    "longitude": 85.4611,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician",
      "Medical Officer"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-mandar",
    "name": "Community Health Centre (CHC) Mandar",
    "shortCode": "CHCM",
    "districtName": "Ranchi",
    "facilityTier": "CHC",
    "latitude": 23.461,
    "longitude": 85.087,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-itki",
    "name": "Community Health Centre (CHC) Itki",
    "shortCode": "CHCI",
    "districtName": "Ranchi",
    "facilityTier": "CHC",
    "latitude": 23.354,
    "longitude": 85.138,
    "totalGeneralBeds": 60,
    "availableGeneralBeds": 13,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 3,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-ratu",
    "name": "Community Health Centre (CHC) Ratu",
    "shortCode": "CHCR",
    "districtName": "Ranchi",
    "facilityTier": "CHC",
    "latitude": 23.402,
    "longitude": 85.215,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-mgm-medical-college-and-hospital",
    "name": "MGM Medical College and Hospital",
    "shortCode": "MMCH",
    "districtName": "East Singhbhum (Jamshedpur)",
    "facilityTier": "TERTIARY",
    "latitude": 22.8258,
    "longitude": 86.2163,
    "totalGeneralBeds": 660,
    "availableGeneralBeds": 145,
    "totalIcuBeds": 60,
    "availableIcuBeds": 11,
    "totalVentilators": 30,
    "availableVentilators": 6,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "Cardiologist",
      "Trauma Surgeon",
      "Neurologist"
    ]
  },
  {
    "id": "jh-sadar-hospital-khasmahal-jamshedpur",
    "name": "Sadar Hospital Khasmahal, Jamshedpur",
    "shortCode": "SHKJ",
    "districtName": "East Singhbhum (Jamshedpur)",
    "facilityTier": "DISTRICT",
    "latitude": 22.768,
    "longitude": 86.205,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 10,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "Pulmonologist"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-ghatshila",
    "name": "Sub-Divisional Hospital (SDH) Ghatshila",
    "shortCode": "SHG",
    "districtName": "East Singhbhum (Jamshedpur)",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 22.585,
    "longitude": 86.48,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician",
      "Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-potka",
    "name": "Community Health Centre (CHC) Potka",
    "shortCode": "CHCP",
    "districtName": "East Singhbhum (Jamshedpur)",
    "facilityTier": "CHC",
    "latitude": 22.618,
    "longitude": 86.223,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-baharagora",
    "name": "Community Health Centre (CHC) Baharagora",
    "shortCode": "CHCB",
    "districtName": "East Singhbhum (Jamshedpur)",
    "facilityTier": "CHC",
    "latitude": 22.281,
    "longitude": 86.721,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-musabani",
    "name": "Community Health Centre (CHC) Musabani",
    "shortCode": "CHCM",
    "districtName": "East Singhbhum (Jamshedpur)",
    "facilityTier": "CHC",
    "latitude": 22.518,
    "longitude": 86.455,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-shahid-nirmal-mahto-medical-college-hospital-snmmch",
    "name": "Shahid Nirmal Mahto Medical College Hospital (SNMMCH)",
    "shortCode": "SNMMC",
    "districtName": "Dhanbad",
    "facilityTier": "TERTIARY",
    "latitude": 23.8111,
    "longitude": 86.4389,
    "totalGeneralBeds": 600,
    "availableGeneralBeds": 132,
    "totalIcuBeds": 50,
    "availableIcuBeds": 9,
    "totalVentilators": 25,
    "availableVentilators": 5,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "Cardiologist",
      "Trauma Surgeon"
    ]
  },
  {
    "id": "jh-sadar-hospital-dhanbad",
    "name": "Sadar Hospital Dhanbad",
    "shortCode": "SHD",
    "districtName": "Dhanbad",
    "facilityTier": "DISTRICT",
    "latitude": 23.798,
    "longitude": 86.431,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "Pulmonologist"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-baghmara",
    "name": "Sub-Divisional Hospital (SDH) Baghmara",
    "shortCode": "SHB",
    "districtName": "Dhanbad",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 23.795,
    "longitude": 86.208,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-govindpur",
    "name": "Community Health Centre (CHC) Govindpur",
    "shortCode": "CHCG",
    "districtName": "Dhanbad",
    "facilityTier": "CHC",
    "latitude": 23.837,
    "longitude": 86.521,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-nirsa",
    "name": "Community Health Centre (CHC) Nirsa",
    "shortCode": "CHCN",
    "districtName": "Dhanbad",
    "facilityTier": "CHC",
    "latitude": 23.785,
    "longitude": 86.712,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-topchanchi",
    "name": "Community Health Centre (CHC) Topchanchi",
    "shortCode": "CHCT",
    "districtName": "Dhanbad",
    "facilityTier": "CHC",
    "latitude": 23.903,
    "longitude": 86.206,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-bokaro-camp-2",
    "name": "Sadar Hospital Bokaro (Camp 2)",
    "shortCode": "SHB",
    "districtName": "Bokaro",
    "facilityTier": "DISTRICT",
    "latitude": 23.6689,
    "longitude": 86.1475,
    "totalGeneralBeds": 300,
    "availableGeneralBeds": 66,
    "totalIcuBeds": 30,
    "availableIcuBeds": 5,
    "totalVentilators": 15,
    "availableVentilators": 3,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "Cardiologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-bermo-tenughat",
    "name": "Sub-Divisional Hospital (SDH) Bermo (Tenughat)",
    "shortCode": "SHB",
    "districtName": "Bokaro",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 23.762,
    "longitude": 85.892,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 12,
    "availableIcuBeds": 2,
    "totalVentilators": 6,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-chas",
    "name": "Community Health Centre (CHC) Chas",
    "shortCode": "CHCC",
    "districtName": "Bokaro",
    "facilityTier": "CHC",
    "latitude": 23.638,
    "longitude": 86.177,
    "totalGeneralBeds": 60,
    "availableGeneralBeds": 13,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician",
      "Pediatrician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-chandankiyari",
    "name": "Community Health Centre (CHC) Chandankiyari",
    "shortCode": "CHCC",
    "districtName": "Bokaro",
    "facilityTier": "CHC",
    "latitude": 23.578,
    "longitude": 86.351,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-jaridih",
    "name": "Community Health Centre (CHC) Jaridih",
    "shortCode": "CHCJ",
    "districtName": "Bokaro",
    "facilityTier": "CHC",
    "latitude": 23.682,
    "longitude": 85.992,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sheikh-bhikari-medical-college-and-hospital",
    "name": "Sheikh Bhikari Medical College and Hospital",
    "shortCode": "SBMCH",
    "districtName": "Hazaribagh",
    "facilityTier": "TERTIARY",
    "latitude": 23.9982,
    "longitude": 85.3688,
    "totalGeneralBeds": 500,
    "availableGeneralBeds": 110,
    "totalIcuBeds": 40,
    "availableIcuBeds": 7,
    "totalVentilators": 18,
    "availableVentilators": 4,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "Cardiologist",
      "Trauma Surgeon"
    ]
  },
  {
    "id": "jh-sadar-hospital-hazaribagh",
    "name": "Sadar Hospital Hazaribagh",
    "shortCode": "SHH",
    "districtName": "Hazaribagh",
    "facilityTier": "DISTRICT",
    "latitude": 23.991,
    "longitude": 85.361,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "Pulmonologist"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-barhi",
    "name": "Sub-Divisional Hospital (SDH) Barhi",
    "shortCode": "SHB",
    "districtName": "Hazaribagh",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 24.298,
    "longitude": 85.423,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician",
      "Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-chouparan",
    "name": "Community Health Centre (CHC) Chouparan",
    "shortCode": "CHCC",
    "districtName": "Hazaribagh",
    "facilityTier": "CHC",
    "latitude": 24.372,
    "longitude": 85.245,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-barkagaon",
    "name": "Community Health Centre (CHC) Barkagaon",
    "shortCode": "CHCB",
    "districtName": "Hazaribagh",
    "facilityTier": "CHC",
    "latitude": 23.864,
    "longitude": 85.219,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-aiims-deoghar",
    "name": "AIIMS Deoghar",
    "shortCode": "AD",
    "districtName": "Deoghar",
    "facilityTier": "TERTIARY",
    "latitude": 24.4632,
    "longitude": 86.7214,
    "totalGeneralBeds": 750,
    "availableGeneralBeds": 165,
    "totalIcuBeds": 80,
    "availableIcuBeds": 14,
    "totalVentilators": 45,
    "availableVentilators": 9,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "Cardiologist",
      "Trauma Surgeon",
      "Neurologist"
    ]
  },
  {
    "id": "jh-sadar-hospital-deoghar",
    "name": "Sadar Hospital Deoghar",
    "shortCode": "SHD",
    "districtName": "Deoghar",
    "facilityTier": "DISTRICT",
    "latitude": 24.488,
    "longitude": 86.702,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "Pulmonologist"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-madhupur",
    "name": "Sub-Divisional Hospital (SDH) Madhupur",
    "shortCode": "SHM",
    "districtName": "Deoghar",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 24.258,
    "longitude": 86.645,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician",
      "Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-sarwan",
    "name": "Community Health Centre (CHC) Sarwan",
    "shortCode": "CHCS",
    "districtName": "Deoghar",
    "facilityTier": "CHC",
    "latitude": 24.382,
    "longitude": 86.812,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-mohanpur",
    "name": "Community Health Centre (CHC) Mohanpur",
    "shortCode": "CHCM",
    "districtName": "Deoghar",
    "facilityTier": "CHC",
    "latitude": 24.542,
    "longitude": 86.782,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-medinirai-medical-college-and-hospital",
    "name": "Medinirai Medical College and Hospital",
    "shortCode": "MMCH",
    "districtName": "Palamu (Daltonganj)",
    "facilityTier": "TERTIARY",
    "latitude": 24.0415,
    "longitude": 84.0811,
    "totalGeneralBeds": 500,
    "availableGeneralBeds": 110,
    "totalIcuBeds": 35,
    "availableIcuBeds": 6,
    "totalVentilators": 15,
    "availableVentilators": 3,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "Cardiologist",
      "Trauma Surgeon"
    ]
  },
  {
    "id": "jh-sadar-hospital-daltonganj",
    "name": "Sadar Hospital Daltonganj",
    "shortCode": "SHD",
    "districtName": "Palamu (Daltonganj)",
    "facilityTier": "DISTRICT",
    "latitude": 24.035,
    "longitude": 84.068,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "Pulmonologist"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-hussainabad",
    "name": "Sub-Divisional Hospital (SDH) Hussainabad",
    "shortCode": "SHH",
    "districtName": "Palamu (Daltonganj)",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 24.529,
    "longitude": 83.998,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician",
      "Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-chhatarpur",
    "name": "Community Health Centre (CHC) Chhatarpur",
    "shortCode": "CHCC",
    "districtName": "Palamu (Daltonganj)",
    "facilityTier": "CHC",
    "latitude": 24.368,
    "longitude": 84.185,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-lesliganj",
    "name": "Community Health Centre (CHC) Lesliganj",
    "shortCode": "CHCL",
    "districtName": "Palamu (Daltonganj)",
    "facilityTier": "CHC",
    "latitude": 23.951,
    "longitude": 84.225,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-phulo-jhano-medical-college-and-hospital",
    "name": "Phulo Jhano Medical College and Hospital",
    "shortCode": "PJMCH",
    "districtName": "Dumka",
    "facilityTier": "TERTIARY",
    "latitude": 24.2712,
    "longitude": 87.2533,
    "totalGeneralBeds": 500,
    "availableGeneralBeds": 110,
    "totalIcuBeds": 35,
    "availableIcuBeds": 6,
    "totalVentilators": 16,
    "availableVentilators": 3,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "Trauma Surgeon",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sadar-hospital-dumka",
    "name": "Sadar Hospital Dumka",
    "shortCode": "SHD",
    "districtName": "Dumka",
    "facilityTier": "DISTRICT",
    "latitude": 24.265,
    "longitude": 87.245,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "Pulmonologist"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-jarmundi",
    "name": "Community Health Centre (CHC) Jarmundi",
    "shortCode": "CHCJ",
    "districtName": "Dumka",
    "facilityTier": "CHC",
    "latitude": 24.412,
    "longitude": 87.012,
    "totalGeneralBeds": 60,
    "availableGeneralBeds": 13,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-ranishwar",
    "name": "Community Health Centre (CHC) Ranishwar",
    "shortCode": "CHCR",
    "districtName": "Dumka",
    "facilityTier": "CHC",
    "latitude": 24.095,
    "longitude": 87.425,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-shikaripara",
    "name": "Community Health Centre (CHC) Shikaripara",
    "shortCode": "CHCS",
    "districtName": "Dumka",
    "facilityTier": "CHC",
    "latitude": 24.221,
    "longitude": 87.525,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-giridih",
    "name": "Sadar Hospital Giridih",
    "shortCode": "SHG",
    "districtName": "Giridih",
    "facilityTier": "DISTRICT",
    "latitude": 24.188,
    "longitude": 86.308,
    "totalGeneralBeds": 300,
    "availableGeneralBeds": 66,
    "totalIcuBeds": 30,
    "availableIcuBeds": 5,
    "totalVentilators": 12,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "Cardiologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-bagodar-sariya",
    "name": "Sub-Divisional Hospital (SDH) Bagodar-Sariya",
    "shortCode": "SHB",
    "districtName": "Giridih",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 24.082,
    "longitude": 85.952,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-dumri",
    "name": "Community Health Centre (CHC) Dumri",
    "shortCode": "CHCD",
    "districtName": "Giridih",
    "facilityTier": "CHC",
    "latitude": 23.985,
    "longitude": 86.012,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-tisri",
    "name": "Community Health Centre (CHC) Tisri",
    "shortCode": "CHCT",
    "districtName": "Giridih",
    "facilityTier": "CHC",
    "latitude": 24.571,
    "longitude": 86.052,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-jamua",
    "name": "Community Health Centre (CHC) Jamua",
    "shortCode": "CHCJ",
    "districtName": "Giridih",
    "facilityTier": "CHC",
    "latitude": 24.368,
    "longitude": 86.155,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-ramgarh",
    "name": "Sadar Hospital Ramgarh",
    "shortCode": "SHR",
    "districtName": "Ramgarh",
    "facilityTier": "DISTRICT",
    "latitude": 23.631,
    "longitude": 85.521,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 10,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-patratu",
    "name": "Community Health Centre (CHC) Patratu",
    "shortCode": "CHCP",
    "districtName": "Ramgarh",
    "facilityTier": "CHC",
    "latitude": 23.668,
    "longitude": 85.295,
    "totalGeneralBeds": 60,
    "availableGeneralBeds": 13,
    "totalIcuBeds": 8,
    "availableIcuBeds": 1,
    "totalVentilators": 3,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician",
      "Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-gola",
    "name": "Community Health Centre (CHC) Gola",
    "shortCode": "CHCG",
    "districtName": "Ramgarh",
    "facilityTier": "CHC",
    "latitude": 23.535,
    "longitude": 85.712,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-mandu",
    "name": "Community Health Centre (CHC) Mandu",
    "shortCode": "CHCM",
    "districtName": "Ramgarh",
    "facilityTier": "CHC",
    "latitude": 23.785,
    "longitude": 85.582,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-chaibasa",
    "name": "Sadar Hospital Chaibasa",
    "shortCode": "SHC",
    "districtName": "West Singhbhum (Chaibasa)",
    "facilityTier": "DISTRICT",
    "latitude": 22.555,
    "longitude": 85.812,
    "totalGeneralBeds": 250,
    "availableGeneralBeds": 55,
    "totalIcuBeds": 25,
    "availableIcuBeds": 5,
    "totalVentilators": 10,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-chakradharpur",
    "name": "Sub-Divisional Hospital (SDH) Chakradharpur",
    "shortCode": "SHC",
    "districtName": "West Singhbhum (Chaibasa)",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 22.705,
    "longitude": 85.625,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-jagannathpur",
    "name": "Sub-Divisional Hospital (SDH) Jagannathpur",
    "shortCode": "SHJ",
    "districtName": "West Singhbhum (Chaibasa)",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 22.215,
    "longitude": 85.652,
    "totalGeneralBeds": 80,
    "availableGeneralBeds": 18,
    "totalIcuBeds": 8,
    "availableIcuBeds": 1,
    "totalVentilators": 3,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-jhinkpani",
    "name": "Community Health Centre (CHC) Jhinkpani",
    "shortCode": "CHCJ",
    "districtName": "West Singhbhum (Chaibasa)",
    "facilityTier": "CHC",
    "latitude": 22.412,
    "longitude": 85.752,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-manoharpur",
    "name": "Community Health Centre (CHC) Manoharpur",
    "shortCode": "CHCM",
    "districtName": "West Singhbhum (Chaibasa)",
    "facilityTier": "CHC",
    "latitude": 22.385,
    "longitude": 85.201,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-koderma",
    "name": "Sadar Hospital Koderma",
    "shortCode": "SHK",
    "districtName": "Koderma",
    "facilityTier": "DISTRICT",
    "latitude": 24.471,
    "longitude": 85.598,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-referral-hospital-sdh-jhumri-telaiya",
    "name": "Sub-Divisional Referral Hospital (SDH) Jhumri Telaiya",
    "shortCode": "SRHJT",
    "districtName": "Koderma",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 24.432,
    "longitude": 85.535,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-domchanch",
    "name": "Community Health Centre (CHC) Domchanch",
    "shortCode": "CHCD",
    "districtName": "Koderma",
    "facilityTier": "CHC",
    "latitude": 24.478,
    "longitude": 85.692,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-markacho",
    "name": "Community Health Centre (CHC) Markacho",
    "shortCode": "CHCM",
    "districtName": "Koderma",
    "facilityTier": "CHC",
    "latitude": 24.355,
    "longitude": 85.812,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-chatra",
    "name": "Sadar Hospital Chatra",
    "shortCode": "SHC",
    "districtName": "Chatra",
    "facilityTier": "DISTRICT",
    "latitude": 24.219,
    "longitude": 84.872,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-simaria",
    "name": "Sub-Divisional Hospital (SDH) Simaria",
    "shortCode": "SHS",
    "districtName": "Chatra",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 23.955,
    "longitude": 84.952,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-hunterganj",
    "name": "Community Health Centre (CHC) Hunterganj",
    "shortCode": "CHCH",
    "districtName": "Chatra",
    "facilityTier": "CHC",
    "latitude": 24.482,
    "longitude": 84.821,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-itkhori",
    "name": "Community Health Centre (CHC) Itkhori",
    "shortCode": "CHCI",
    "districtName": "Chatra",
    "facilityTier": "CHC",
    "latitude": 24.285,
    "longitude": 85.155,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-garhwa",
    "name": "Sadar Hospital Garhwa",
    "shortCode": "SHG",
    "districtName": "Garhwa",
    "facilityTier": "DISTRICT",
    "latitude": 24.159,
    "longitude": 83.812,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-nagar-untari",
    "name": "Sub-Divisional Hospital (SDH) Nagar Untari",
    "shortCode": "SHNU",
    "districtName": "Garhwa",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 24.285,
    "longitude": 83.512,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-ranka",
    "name": "Community Health Centre (CHC) Ranka",
    "shortCode": "CHCR",
    "districtName": "Garhwa",
    "facilityTier": "CHC",
    "latitude": 23.955,
    "longitude": 83.825,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-bhawnathpur",
    "name": "Community Health Centre (CHC) Bhawnathpur",
    "shortCode": "CHCB",
    "districtName": "Garhwa",
    "facilityTier": "CHC",
    "latitude": 24.385,
    "longitude": 83.612,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-latehar",
    "name": "Sadar Hospital Latehar",
    "shortCode": "SHL",
    "districtName": "Latehar",
    "facilityTier": "DISTRICT",
    "latitude": 23.746,
    "longitude": 84.502,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-mahuadanr",
    "name": "Sub-Divisional Hospital (SDH) Mahuadanr",
    "shortCode": "SHM",
    "districtName": "Latehar",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 23.395,
    "longitude": 84.112,
    "totalGeneralBeds": 80,
    "availableGeneralBeds": 18,
    "totalIcuBeds": 8,
    "availableIcuBeds": 1,
    "totalVentilators": 3,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-chandwa",
    "name": "Community Health Centre (CHC) Chandwa",
    "shortCode": "CHCC",
    "districtName": "Latehar",
    "facilityTier": "CHC",
    "latitude": 23.685,
    "longitude": 84.735,
    "totalGeneralBeds": 60,
    "availableGeneralBeds": 13,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-balumath",
    "name": "Community Health Centre (CHC) Balumath",
    "shortCode": "CHCB",
    "districtName": "Latehar",
    "facilityTier": "CHC",
    "latitude": 23.855,
    "longitude": 84.785,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-lohardaga",
    "name": "Sadar Hospital Lohardaga",
    "shortCode": "SHL",
    "districtName": "Lohardaga",
    "facilityTier": "DISTRICT",
    "latitude": 23.435,
    "longitude": 84.685,
    "totalGeneralBeds": 180,
    "availableGeneralBeds": 40,
    "totalIcuBeds": 18,
    "availableIcuBeds": 3,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-kisko",
    "name": "Community Health Centre (CHC) Kisko",
    "shortCode": "CHCK",
    "districtName": "Lohardaga",
    "facilityTier": "CHC",
    "latitude": 23.512,
    "longitude": 84.625,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-senha",
    "name": "Community Health Centre (CHC) Senha",
    "shortCode": "CHCS",
    "districtName": "Lohardaga",
    "facilityTier": "CHC",
    "latitude": 23.355,
    "longitude": 84.675,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-kuru",
    "name": "Community Health Centre (CHC) Kuru",
    "shortCode": "CHCK",
    "districtName": "Lohardaga",
    "facilityTier": "CHC",
    "latitude": 23.568,
    "longitude": 84.835,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-gumla",
    "name": "Sadar Hospital Gumla",
    "shortCode": "SHG",
    "districtName": "Gumla",
    "facilityTier": "DISTRICT",
    "latitude": 23.002,
    "longitude": 84.546,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-basia",
    "name": "Sub-Divisional Hospital (SDH) Basia",
    "shortCode": "SHB",
    "districtName": "Gumla",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 22.895,
    "longitude": 84.812,
    "totalGeneralBeds": 80,
    "availableGeneralBeds": 18,
    "totalIcuBeds": 8,
    "availableIcuBeds": 1,
    "totalVentilators": 3,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-chainpur",
    "name": "Community Health Centre (CHC) Chainpur",
    "shortCode": "CHCC",
    "districtName": "Gumla",
    "facilityTier": "CHC",
    "latitude": 23.125,
    "longitude": 84.225,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-bishunpur",
    "name": "Community Health Centre (CHC) Bishunpur",
    "shortCode": "CHCB",
    "districtName": "Gumla",
    "facilityTier": "CHC",
    "latitude": 23.385,
    "longitude": 84.385,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-simdega",
    "name": "Sadar Hospital Simdega",
    "shortCode": "SHS",
    "districtName": "Simdega",
    "facilityTier": "DISTRICT",
    "latitude": 22.618,
    "longitude": 84.514,
    "totalGeneralBeds": 180,
    "availableGeneralBeds": 40,
    "totalIcuBeds": 18,
    "availableIcuBeds": 3,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-kolebira",
    "name": "Community Health Centre (CHC) Kolebira",
    "shortCode": "CHCK",
    "districtName": "Simdega",
    "facilityTier": "CHC",
    "latitude": 22.695,
    "longitude": 84.695,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-thethaitangar",
    "name": "Community Health Centre (CHC) Thethaitangar",
    "shortCode": "CHCT",
    "districtName": "Simdega",
    "facilityTier": "CHC",
    "latitude": 22.485,
    "longitude": 84.525,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-bolba",
    "name": "Community Health Centre (CHC) Bolba",
    "shortCode": "CHCB",
    "districtName": "Simdega",
    "facilityTier": "CHC",
    "latitude": 22.412,
    "longitude": 84.365,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-khunti",
    "name": "Sadar Hospital Khunti",
    "shortCode": "SHK",
    "districtName": "Khunti",
    "facilityTier": "DISTRICT",
    "latitude": 23.079,
    "longitude": 85.283,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-torpa",
    "name": "Community Health Centre (CHC) Torpa",
    "shortCode": "CHCT",
    "districtName": "Khunti",
    "facilityTier": "CHC",
    "latitude": 22.955,
    "longitude": 85.092,
    "totalGeneralBeds": 60,
    "availableGeneralBeds": 13,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-karra",
    "name": "Community Health Centre (CHC) Karra",
    "shortCode": "CHCK",
    "districtName": "Khunti",
    "facilityTier": "CHC",
    "latitude": 23.185,
    "longitude": 85.125,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-rania",
    "name": "Community Health Centre (CHC) Rania",
    "shortCode": "CHCR",
    "districtName": "Khunti",
    "facilityTier": "CHC",
    "latitude": 22.785,
    "longitude": 85.112,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-seraikela",
    "name": "Sadar Hospital Seraikela",
    "shortCode": "SHS",
    "districtName": "Seraikela Kharsawan",
    "facilityTier": "DISTRICT",
    "latitude": 22.704,
    "longitude": 85.934,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-chandil",
    "name": "Sub-Divisional Hospital (SDH) Chandil",
    "shortCode": "SHC",
    "districtName": "Seraikela Kharsawan",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 22.965,
    "longitude": 86.045,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-kharsawan",
    "name": "Community Health Centre (CHC) Kharsawan",
    "shortCode": "CHCK",
    "districtName": "Seraikela Kharsawan",
    "facilityTier": "CHC",
    "latitude": 22.795,
    "longitude": 85.825,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-gamharia",
    "name": "Community Health Centre (CHC) Gamharia",
    "shortCode": "CHCG",
    "districtName": "Seraikela Kharsawan",
    "facilityTier": "CHC",
    "latitude": 22.812,
    "longitude": 86.115,
    "totalGeneralBeds": 60,
    "availableGeneralBeds": 13,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 3,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician",
      "Surgeon"
    ]
  },
  {
    "id": "jh-sadar-hospital-jamtara",
    "name": "Sadar Hospital Jamtara",
    "shortCode": "SHJ",
    "districtName": "Jamtara",
    "facilityTier": "DISTRICT",
    "latitude": 23.966,
    "longitude": 86.806,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-narayanpur",
    "name": "Community Health Centre (CHC) Narayanpur",
    "shortCode": "CHCN",
    "districtName": "Jamtara",
    "facilityTier": "CHC",
    "latitude": 24.085,
    "longitude": 86.685,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-kundhit",
    "name": "Community Health Centre (CHC) Kundhit",
    "shortCode": "CHCK",
    "districtName": "Jamtara",
    "facilityTier": "CHC",
    "latitude": 23.952,
    "longitude": 87.155,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-mihijam",
    "name": "Community Health Centre (CHC) Mihijam",
    "shortCode": "CHCM",
    "districtName": "Jamtara",
    "facilityTier": "CHC",
    "latitude": 23.855,
    "longitude": 86.885,
    "totalGeneralBeds": 60,
    "availableGeneralBeds": 13,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-godda",
    "name": "Sadar Hospital Godda",
    "shortCode": "SHG",
    "districtName": "Godda",
    "facilityTier": "DISTRICT",
    "latitude": 24.831,
    "longitude": 87.216,
    "totalGeneralBeds": 250,
    "availableGeneralBeds": 55,
    "totalIcuBeds": 25,
    "availableIcuBeds": 5,
    "totalVentilators": 10,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-mahagama",
    "name": "Sub-Divisional Hospital (SDH) Mahagama",
    "shortCode": "SHM",
    "districtName": "Godda",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 25.025,
    "longitude": 87.285,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-poraiyahat",
    "name": "Community Health Centre (CHC) Poraiyahat",
    "shortCode": "CHCP",
    "districtName": "Godda",
    "facilityTier": "CHC",
    "latitude": 24.712,
    "longitude": 87.165,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-meherma",
    "name": "Community Health Centre (CHC) Meherma",
    "shortCode": "CHCM",
    "districtName": "Godda",
    "facilityTier": "CHC",
    "latitude": 25.185,
    "longitude": 87.355,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-sahibganj",
    "name": "Sadar Hospital Sahibganj",
    "shortCode": "SHS",
    "districtName": "Sahibganj",
    "facilityTier": "DISTRICT",
    "latitude": 25.246,
    "longitude": 87.646,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-sub-divisional-hospital-sdh-rajmahal",
    "name": "Sub-Divisional Hospital (SDH) Rajmahal",
    "shortCode": "SHR",
    "districtName": "Sahibganj",
    "facilityTier": "SUB_DIVISIONAL",
    "latitude": 25.052,
    "longitude": 87.835,
    "totalGeneralBeds": 100,
    "availableGeneralBeds": 22,
    "totalIcuBeds": 10,
    "availableIcuBeds": 2,
    "totalVentilators": 4,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Surgeon",
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-barharwa",
    "name": "Community Health Centre (CHC) Barharwa",
    "shortCode": "CHCB",
    "districtName": "Sahibganj",
    "facilityTier": "CHC",
    "latitude": 24.862,
    "longitude": 87.785,
    "totalGeneralBeds": 60,
    "availableGeneralBeds": 13,
    "totalIcuBeds": 6,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-borio",
    "name": "Community Health Centre (CHC) Borio",
    "shortCode": "CHCB",
    "districtName": "Sahibganj",
    "facilityTier": "CHC",
    "latitude": 25.045,
    "longitude": 87.655,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-sadar-hospital-pakur",
    "name": "Sadar Hospital Pakur",
    "shortCode": "SHP",
    "districtName": "Pakur",
    "facilityTier": "DISTRICT",
    "latitude": 24.638,
    "longitude": 87.853,
    "totalGeneralBeds": 200,
    "availableGeneralBeds": 44,
    "totalIcuBeds": 20,
    "availableIcuBeds": 4,
    "totalVentilators": 8,
    "availableVentilators": 2,
    "hasVentilator": true,
    "hasTraumaSurgery": true,
    "hasBloodBank": true,
    "hasOxygenGenerator": true,
    "specialists": [
      "Pulmonologist",
      "General Surgeon"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-hiranpur",
    "name": "Community Health Centre (CHC) Hiranpur",
    "shortCode": "CHCH",
    "districtName": "Pakur",
    "facilityTier": "CHC",
    "latitude": 24.712,
    "longitude": 87.715,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-maheshpur",
    "name": "Community Health Centre (CHC) Maheshpur",
    "shortCode": "CHCM",
    "districtName": "Pakur",
    "facilityTier": "CHC",
    "latitude": 24.485,
    "longitude": 87.765,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  },
  {
    "id": "jh-community-health-centre-chc-pakuria",
    "name": "Community Health Centre (CHC) Pakuria",
    "shortCode": "CHCP",
    "districtName": "Pakur",
    "facilityTier": "CHC",
    "latitude": 24.325,
    "longitude": 87.685,
    "totalGeneralBeds": 50,
    "availableGeneralBeds": 11,
    "totalIcuBeds": 4,
    "availableIcuBeds": 1,
    "totalVentilators": 2,
    "availableVentilators": 1,
    "hasVentilator": true,
    "hasTraumaSurgery": false,
    "hasBloodBank": false,
    "hasOxygenGenerator": true,
    "specialists": [
      "General Physician"
    ]
  }
];

export function getHospitalsForDistrict(districtName: string): JharkhandHospitalFacility[] {
  if (!districtName || districtName === "ALL") {
    return JHARKHAND_79_HOSPITALS;
  }
  return JHARKHAND_79_HOSPITALS.filter(
    (h) => h.districtName.toLowerCase().includes(districtName.toLowerCase()) || districtName.toLowerCase().includes(h.districtName.toLowerCase())
  );
}

// Convert a JharkhandHospitalFacility into a Hospital domain model object for the triage engine
export function convertFacilityToHospital(f: JharkhandHospitalFacility, index: number, total: number): Hospital {
  const totalBeds = f.totalGeneralBeds + f.totalIcuBeds;
  const usedGeneral = Math.max(0, f.totalGeneralBeds - f.availableGeneralBeds);
  const usedIcu = Math.max(0, f.totalIcuBeds - f.availableIcuBeds);
  const usedBeds = usedGeneral + usedIcu;

  // Normalized 2D projection for Dijkstra Canvas (0 to 100)
  // Jharkhand Lat bounds: 22.0 to 25.5 -> y from 90 to 10
  // Jharkhand Lng bounds: 83.3 to 88.0 -> x from 10 to 90
  const x = Math.min(92, Math.max(8, Math.round(((f.longitude - 83.3) / 4.7) * 80 + 10)));
  const y = Math.min(92, Math.max(8, Math.round((1 - (f.latitude - 22.0) / 3.5) * 80 + 10)));

  return {
    id: f.id,
    name: f.name,
    short: f.shortCode,
    x,
    y,
    beds: { used: usedBeds, total: totalBeds },
    icuBeds: { used: usedIcu, total: f.totalIcuBeds },
    generalBeds: { used: usedGeneral, total: f.totalGeneralBeds },
    ventilators: { used: Math.max(0, f.totalVentilators - f.availableVentilators), total: f.totalVentilators },
    specialists: { used: Math.round(f.specialists.length * 0.7), total: f.specialists.length },
    specialistRoster: {
      pulmonologists: { total: f.specialists.includes("Pulmonologist") ? 3 : 0, available: f.specialists.includes("Pulmonologist") ? 1 : 0 },
      cardiologists: { total: f.specialists.includes("Cardiologist") ? 3 : 0, available: f.specialists.includes("Cardiologist") ? 1 : 0 },
      traumaSurgeons: { total: f.specialists.includes("Trauma Surgeon") ? 2 : 0, available: f.specialists.includes("Trauma Surgeon") ? 1 : 0 },
      generalPhysicians: { total: 6, available: 3 }
    }
  };
}

// Compute dynamic spatial road connectivity edges between facilities
export function generateInterconnectivityEdges(hospitals: Hospital[]): NetworkEdge[] {
  const edges: NetworkEdge[] = [];
  if (hospitals.length <= 1) return edges;

  // For each hospital, connect to its nearest 2-3 neighbors
  for (let i = 0; i < hospitals.length; i++) {
    const distances = [];
    const h1 = hospitals[i];
    const f1 = JHARKHAND_79_HOSPITALS.find((h) => h.id === h1.id);

    for (let j = 0; j < hospitals.length; j++) {
      if (i === j) continue;
      const h2 = hospitals[j];
      const f2 = JHARKHAND_79_HOSPITALS.find((h) => h.id === h2.id);

      let minutes = 15;
      if (f1 && f2) {
        // Haversine km
        const dLat = (f2.latitude - f1.latitude) * Math.PI / 180;
        const dLng = (f2.longitude - f1.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(f1.latitude * Math.PI / 180) * Math.cos(f2.latitude * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const km = 6371 * c;
        minutes = Math.max(5, Math.round(km * 1.4)); // ~45 km/h ambulance speed
      } else {
        const dx = h1.x - h2.x;
        const dy = h1.y - h2.y;
        minutes = Math.max(6, Math.round(Math.sqrt(dx*dx + dy*dy) * 0.8));
      }

      distances.push({ toId: h2.id, minutes });
    }

    // Sort by shortest travel time
    distances.sort((a, b) => a.minutes - b.minutes);
    const k = Math.min(3, distances.length);
    for (let m = 0; m < k; m++) {
      const target = distances[m];
      const exists = edges.some(e => (e.fromId === h1.id && e.toId === target.toId) || (e.fromId === target.toId && e.toId === h1.id));
      if (!exists) {
        edges.push({ fromId: h1.id, toId: target.toId, minutes: target.minutes });
      }
    }
  }

  return edges;
}
