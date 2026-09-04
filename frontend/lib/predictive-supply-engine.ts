'use client'

/**
 * TriageNet AI Predictive Shortage & Pre-Fetch Engine
 * 
 * Implements the bottom-up clinical shortage telemetry architecture:
 * 1. Lower-tier clinical officers (Triage Nurses, Ward In-Charges, MOs) log real-time equipment/bed deficits.
 * 2. AI software ingests structured incident telemetry, intake rates, and 108 ambulance trajectories.
 * 3. AI generates predictive pre-fetch recommendations indicating WHICH inventory to fetch BEFORE surge strikes.
 * 4. Triage officers and leadership receive proactive insights directly in their workflow.
 */

export type ShortageResourceType =
  | 'ICU_BEDS'
  | 'VENTILATORS'
  | 'HIGH_FLOW_O2'
  | 'TRAUMA_MONITORS'
  | 'BLOOD_UNITS'
  | 'CRRT_DIALYSIS'
  | 'PEDIATRIC_WARMERS'

export interface ShortageIncidentReport {
  id: string
  timestamp: string
  facilityId: string
  facilityName: string
  district: string
  department: string
  resourceType: ShortageResourceType
  quantityDeficit: number
  reportingOfficerName: string
  reportingOfficerRole: string
  urgencyScore: number // 1-100
  patientImpactCount: number
  clinicalNotes: string
  status: 'LOGGED' | 'ANALYZED_BY_AI' | 'PRE_FETCH_AUTHORIZED' | 'RESOLVED'
}

export interface PredictiveInventoryRecommendation {
  id: string
  generatedAt: string
  targetFacilityId: string
  targetFacilityName: string
  district: string
  department: string
  resourceType: ShortageResourceType
  recommendedItem: string
  recommendedQuantity: number
  sourceFacilityOrStore: string
  preFetchWindowHours: number // Time window to fetch before bottleneck
  confidenceScore: number // Percentage 0-100
  clinicalDriver: string // Reason deduced by AI
  status: 'PENDING_PRE_FETCH' | 'DISPATCHED' | 'RESOLVED'
}

// Initial seed incident logs recorded by lower-tier officers in Jharkhand facilities
export const INITIAL_SHORTAGE_INCIDENTS: ShortageIncidentReport[] = [
  {
    id: 'SHORT-2026-0811',
    timestamp: '16:15:22',
    facilityId: 'jh-rims-ranchi',
    facilityName: 'Rajendra Institute of Medical Sciences (RIMS)',
    district: 'Ranchi',
    department: 'Emergency Trauma Bay',
    resourceType: 'VENTILATORS',
    quantityDeficit: 3,
    reportingOfficerName: 'Sister Anjali Toppo',
    reportingOfficerRole: 'Lead Triage Nurse (Shift A)',
    urgencyScore: 92,
    patientImpactCount: 5,
    clinicalNotes: 'Multiple acute respiratory distress arrivals via NH-33 crash. Only 1 portable ventilator left in reserve.',
    status: 'ANALYZED_BY_AI',
  },
  {
    id: 'SHORT-2026-0812',
    timestamp: '15:40:10',
    facilityId: 'jh-sadar-hospital-ranchi',
    facilityName: 'Sadar Hospital Ranchi',
    district: 'Ranchi',
    department: 'Intensive Care Unit (ICU)',
    resourceType: 'ICU_BEDS',
    quantityDeficit: 4,
    reportingOfficerName: 'Dr. Alok Verma',
    reportingOfficerRole: 'Emergency Medical Officer',
    urgencyScore: 88,
    patientImpactCount: 4,
    clinicalNotes: 'ICU at 100% capacity; post-op coronary cases held in recovery room awaiting monitored critical bed.',
    status: 'ANALYZED_BY_AI',
  },
  {
    id: 'SHORT-2026-0813',
    timestamp: '14:20:05',
    facilityId: 'jh-community-health-centre-chc-kanke',
    facilityName: 'Community Health Centre (CHC) Kanke',
    district: 'Ranchi',
    department: 'Primary Emergency Unit',
    resourceType: 'HIGH_FLOW_O2',
    quantityDeficit: 6,
    reportingOfficerName: 'Ramesh Mahto',
    reportingOfficerRole: 'Ward In-Charge',
    urgencyScore: 74,
    patientImpactCount: 3,
    clinicalNotes: 'High-flow nasal cannula supply depleted; 3 COPD patients currently on standard low-flow flowmeters.',
    status: 'LOGGED',
  },
]

// Initial AI predictive recommendations generated from the telemetry
export const INITIAL_PREDICTIVE_RECOMMENDATIONS: PredictiveInventoryRecommendation[] = [
  {
    id: 'PRED-REC-901',
    generatedAt: '16:20:00',
    targetFacilityId: 'jh-rims-ranchi',
    targetFacilityName: 'Rajendra Institute of Medical Sciences (RIMS)',
    district: 'Ranchi',
    department: 'Emergency Trauma Bay',
    resourceType: 'VENTILATORS',
    recommendedItem: 'Mindray SV300 Portable ICU Ventilators',
    recommendedQuantity: 3,
    sourceFacilityOrStore: 'Ranchi District Central Reserve Store (Sadar Depot)',
    preFetchWindowHours: 1.5,
    confidenceScore: 94,
    clinicalDriver: 'Correlated 3 nurse shortage incident logs with 4 incoming 108 high-acuity hypoxia dispatches ETA < 35 mins.',
    status: 'PENDING_PRE_FETCH',
  },
  {
    id: 'PRED-REC-902',
    generatedAt: '15:55:00',
    targetFacilityId: 'jh-sadar-hospital-ranchi',
    targetFacilityName: 'Sadar Hospital Ranchi',
    district: 'Ranchi',
    department: 'Intensive Care Unit (ICU)',
    resourceType: 'ICU_BEDS',
    recommendedItem: '5-Function Hydraulic Critical Beds',
    recommendedQuantity: 4,
    sourceFacilityOrStore: 'CHC Bundu (Surplus Buffer 42% Occupancy)',
    preFetchWindowHours: 2.0,
    confidenceScore: 91,
    clinicalDriver: 'ICU admission velocity is 2.4x historical weekday baseline; pre-fetching prevents corridor holding overflow.',
    status: 'PENDING_PRE_FETCH',
  },
  {
    id: 'PRED-REC-903',
    generatedAt: '14:45:00',
    targetFacilityId: 'jh-community-health-centre-chc-kanke',
    targetFacilityName: 'Community Health Centre (CHC) Kanke',
    district: 'Ranchi',
    department: 'Primary Emergency Unit',
    resourceType: 'HIGH_FLOW_O2',
    recommendedItem: 'High-Flow O₂ Humidifier Units & Flowmeters',
    recommendedQuantity: 8,
    sourceFacilityOrStore: 'State Central Medical Depot (Namkum Warehouse)',
    preFetchWindowHours: 4.0,
    confidenceScore: 86,
    clinicalDriver: 'Recurrent oxygen shortage reports logged across 3 shifts; pre-supply avoids urgent inter-facility transfers.',
    status: 'PENDING_PRE_FETCH',
  },
]
