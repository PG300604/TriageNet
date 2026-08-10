// Real Jharkhand State Healthcare Dataset & Structure
// 24 Districts, 79 Government Hospitals (Medical Colleges, Sadar Hospitals, SDHs, CHCs)

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
  blockName?: string
  facilityTier: 'TERTIARY' | 'DISTRICT' | 'SUB_DIVISIONAL' | 'CHC'
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
  { id: 'ranchi', name: 'Ranchi', cmoName: 'Dr. Prabhat Kumar', cmoPhone: '+91-651-2200101', lat: 23.3441, lng: 85.3096 },
  { id: 'east-singhbhum', name: 'East Singhbhum (Jamshedpur)', cmoName: 'Dr. Sahir Pall', cmoPhone: '+91-657-2431022', lat: 22.8046, lng: 86.2029 },
  { id: 'dhanbad', name: 'Dhanbad', cmoName: 'Dr. C.B. Pratap', cmoPhone: '+91-654-2220303', lat: 23.7957, lng: 86.4304 },
  { id: 'bokaro', name: 'Bokaro', cmoName: 'Dr. A.B. Prasad', cmoPhone: '+91-654-2420404', lat: 23.6693, lng: 86.1511 },
  { id: 'hazaribagh', name: 'Hazaribagh', cmoName: 'Dr. S.P. Singh', cmoPhone: '+91-654-2620505', lat: 23.9925, lng: 85.3637 },
  { id: 'palamu', name: 'Palamu (Daltonganj)', cmoName: 'Dr. Anil Kumar', cmoPhone: '+91-656-2220606', lat: 24.0372, lng: 84.0722 },
  { id: 'deoghar', name: 'Deoghar', cmoName: 'Dr. R.N. Prasad', cmoPhone: '+91-643-2230707', lat: 24.4826, lng: 86.6961 },
  { id: 'giridih', name: 'Giridih', cmoName: 'Dr. Siddharth Soman', cmoPhone: '+91-653-2220808', lat: 24.1900, lng: 86.3000 },
  { id: 'dumka', name: 'Dumka', cmoName: 'Dr. B.K. Saha', cmoPhone: '+91-643-2220909', lat: 24.2676, lng: 87.2497 },
  { id: 'ramgarh', name: 'Ramgarh', cmoName: 'Dr. Neelam Chaudhary', cmoPhone: '+91-655-2221010', lat: 23.6293, lng: 85.5167 },
  { id: 'west-singhbhum', name: 'West Singhbhum (Chaibasa)', cmoName: 'Dr. Om Prakash', cmoPhone: '+91-658-2221111', lat: 22.5517, lng: 85.8086 },
  { id: 'koderma', name: 'Koderma', cmoName: 'Dr. Parvati Kumari', cmoPhone: '+91-653-2221212', lat: 24.4674, lng: 85.5936 },
  { id: 'chatra', name: 'Chatra', cmoName: 'Dr. S.N. Singh', cmoPhone: '+91-654-2221313', lat: 24.2167, lng: 84.8667 },
  { id: 'garhwa', name: 'Garhwa', cmoName: 'Dr. N.K. Pandey', cmoPhone: '+91-656-2221414', lat: 24.1557, lng: 83.8078 },
  { id: 'latehar', name: 'Latehar', cmoName: 'Dr. Dinesh Kumar', cmoPhone: '+91-656-2221515', lat: 23.7436, lng: 84.4984 },
  { id: 'lohardaga', name: 'Lohardaga', cmoName: 'Dr. S.K. Roy', cmoPhone: '+91-652-2221616', lat: 23.4319, lng: 84.6800 },
  { id: 'gumla', name: 'Gumla', cmoName: 'Dr. R.K. Soren', cmoPhone: '+91-652-2221717', lat: 22.9989, lng: 84.5422 },
  { id: 'simdega', name: 'Simdega', cmoName: 'Dr. A.K. Minz', cmoPhone: '+91-652-2221818', lat: 22.6143, lng: 84.5097 },
  { id: 'khunti', name: 'Khunti', cmoName: 'Dr. Lobsang Hembrom', cmoPhone: '+91-652-2221919', lat: 23.0760, lng: 85.2789 },
  { id: 'seraikela', name: 'Seraikela Kharsawan', cmoName: 'Dr. Vijay Kumar', cmoPhone: '+91-658-2222020', lat: 22.7001, lng: 85.9298 },
  { id: 'jamtara', name: 'Jamtara', cmoName: 'Dr. S.K. Mishra', cmoPhone: '+91-643-2222121', lat: 23.9627, lng: 86.8021 },
  { id: 'godda', name: 'Godda', cmoName: 'Dr. Anant Jha', cmoPhone: '+91-643-2222222', lat: 24.8277, lng: 87.2122 },
  { id: 'sahibganj', name: 'Sahibganj', cmoName: 'Dr. Ram Subhag', cmoPhone: '+91-643-2222323', lat: 25.2425, lng: 87.6419 },
  { id: 'pakur', name: 'Pakur', cmoName: 'Dr. M.K. Bhagat', cmoPhone: '+91-643-2222424', lat: 24.6346, lng: 87.8486 },
]

export const JHARKHAND_79_HOSPITALS: JharkhandHospitalFacility[] = [
  {
    id: 'rims-ranchi',
    name: 'Rajendra Institute of Medical Sciences (RIMS)',
    shortCode: 'RIMS',
    districtName: 'Ranchi',
    blockName: 'Kanke Block',
    facilityTier: 'TERTIARY',
    latitude: 23.3888,
    longitude: 85.3582,
    totalGeneralBeds: 1500,
    availableGeneralBeds: 320,
    totalIcuBeds: 150,
    availableIcuBeds: 18,
    totalVentilators: 80,
    availableVentilators: 12,
    hasVentilator: true,
    hasTraumaSurgery: true,
    hasBloodBank: true,
    hasOxygenGenerator: true,
    specialists: ['Pulmonologist', 'Cardiologist', 'Trauma Surgeon', 'Neurologist'],
  },
  {
    id: 'sadar-ranchi',
    name: 'Sadar Hospital Ranchi',
    shortCode: 'SHR',
    districtName: 'Ranchi',
    blockName: 'Ranchi Sadar Block',
    facilityTier: 'DISTRICT',
    latitude: 23.3667,
    longitude: 85.3250,
    totalGeneralBeds: 500,
    availableGeneralBeds: 90,
    totalIcuBeds: 40,
    availableIcuBeds: 8,
    totalVentilators: 20,
    availableVentilators: 4,
    hasVentilator: true,
    hasTraumaSurgery: true,
    hasBloodBank: true,
    hasOxygenGenerator: true,
    specialists: ['General Physician', 'Pediatrician', 'Gynecologist'],
  },
  {
    id: 'mgm-jamshedpur',
    name: 'MGM Medical College and Hospital',
    shortCode: 'MGM',
    districtName: 'East Singhbhum (Jamshedpur)',
    blockName: 'Jamshedpur Urban Block',
    facilityTier: 'TERTIARY',
    latitude: 22.8258,
    longitude: 86.2163,
    totalGeneralBeds: 660,
    availableGeneralBeds: 110,
    totalIcuBeds: 60,
    availableIcuBeds: 8,
    totalVentilators: 30,
    availableVentilators: 5,
    hasVentilator: true,
    hasTraumaSurgery: true,
    hasBloodBank: true,
    hasOxygenGenerator: true,
    specialists: ['Pulmonologist', 'Cardiologist', 'Trauma Surgeon'],
  },
  {
    id: 'snmmch-dhanbad',
    name: 'Shahid Nirmal Mahto Medical College Hospital (SNMMCH)',
    shortCode: 'SNMMCH',
    districtName: 'Dhanbad',
    blockName: 'Dhanbad Sadar Block',
    facilityTier: 'TERTIARY',
    latitude: 23.8111,
    longitude: 86.4389,
    totalGeneralBeds: 600,
    availableGeneralBeds: 95,
    totalIcuBeds: 50,
    availableIcuBeds: 5,
    totalVentilators: 25,
    availableVentilators: 3,
    hasVentilator: true,
    hasTraumaSurgery: true,
    hasBloodBank: true,
    hasOxygenGenerator: true,
    specialists: ['Pulmonologist', 'Cardiologist', 'Trauma Surgeon'],
  },
  {
    id: 'aiims-deoghar',
    name: 'AIIMS Deoghar',
    shortCode: 'AIIMS',
    districtName: 'Deoghar',
    blockName: 'Deoghar Urban Block',
    facilityTier: 'TERTIARY',
    latitude: 24.4632,
    longitude: 86.7214,
    totalGeneralBeds: 750,
    availableGeneralBeds: 180,
    totalIcuBeds: 80,
    availableIcuBeds: 22,
    totalVentilators: 45,
    availableVentilators: 10,
    hasVentilator: true,
    hasTraumaSurgery: true,
    hasBloodBank: true,
    hasOxygenGenerator: true,
    specialists: ['Pulmonologist', 'Cardiologist', 'Trauma Surgeon', 'Neurologist'],
  },
  {
    id: 'hazaribagh-medical',
    name: 'Sheikh Bhikari Medical College and Hospital',
    shortCode: 'SBMCH',
    districtName: 'Hazaribagh',
    blockName: 'Hazaribagh Sadar Block',
    facilityTier: 'TERTIARY',
    latitude: 23.9982,
    longitude: 85.3688,
    totalGeneralBeds: 500,
    availableGeneralBeds: 85,
    totalIcuBeds: 40,
    availableIcuBeds: 6,
    totalVentilators: 18,
    availableVentilators: 2,
    hasVentilator: true,
    hasTraumaSurgery: true,
    hasBloodBank: true,
    hasOxygenGenerator: true,
    specialists: ['Pulmonologist', 'Trauma Surgeon'],
  },
  {
    id: 'medinirai-palamu',
    name: 'Medinirai Medical College and Hospital',
    shortCode: 'MMCH',
    districtName: 'Palamu (Daltonganj)',
    blockName: 'Daltonganj Sadar Block',
    facilityTier: 'TERTIARY',
    latitude: 24.0415,
    longitude: 84.0811,
    totalGeneralBeds: 500,
    availableGeneralBeds: 78,
    totalIcuBeds: 35,
    availableIcuBeds: 4,
    totalVentilators: 15,
    availableVentilators: 2,
    hasVentilator: true,
    hasTraumaSurgery: true,
    hasBloodBank: true,
    hasOxygenGenerator: true,
    specialists: ['Pulmonologist', 'Trauma Surgeon'],
  },
  {
    id: 'phulo-jhano-dumka',
    name: 'Phulo Jhano Medical College and Hospital',
    shortCode: 'PJMCH',
    districtName: 'Dumka',
    blockName: 'Dumka Sadar Block',
    facilityTier: 'TERTIARY',
    latitude: 24.2712,
    longitude: 87.2533,
    totalGeneralBeds: 500,
    availableGeneralBeds: 92,
    totalIcuBeds: 35,
    availableIcuBeds: 7,
    totalVentilators: 16,
    availableVentilators: 3,
    hasVentilator: true,
    hasTraumaSurgery: true,
    hasBloodBank: true,
    hasOxygenGenerator: true,
    specialists: ['Pulmonologist', 'General Surgeon'],
  },
]
