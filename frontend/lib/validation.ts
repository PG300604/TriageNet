/**
 * TriageNet Clinical Form Validation Engine
 * Enforces strict input validation across patient intake, facility onboarding, and clinical vitals.
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

export interface VitalsValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate 14-digit Indian ABHA Health ID (e.g., 12-3456-7890-1234 or 14 digits)
 */
export function validateABHANumber(abha: string): ValidationResult {
  if (!abha || abha.trim() === '') {
    return { valid: false, error: 'ABHA Number is required' }
  }
  const cleaned = abha.replace(/[\s-]/g, '')
  if (!/^\d{14}$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Invalid ABHA Number format. Must be 14 digits (e.g. 12-3456-7890-1234)',
    }
  }
  return { valid: true }
}

/**
 * Validate 10-digit Indian Mobile Phone Number (+91 format supported)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Phone number is required' }
  }
  const cleaned = phone.replace(/[\s-+()]/g, '')
  // Accepts 10 digits or 12 digits (with 91 prefix)
  if (/^91\d{10}$/.test(cleaned) || /^\d{10}$/.test(cleaned)) {
    return { valid: true }
  }
  return { valid: false, error: 'Enter a valid 10-digit contact number' }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email address is required' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Invalid email address format' }
  }
  return { valid: true }
}

/**
 * Validate trauma vitals against physiological thresholds
 */
export function validateVitals(vitals: {
  spo2: number
  heartRate: number
  systolicBp: number
  gcs: number
}): VitalsValidationResult {
  const errors: string[] = []

  if (vitals.spo2 < 40 || vitals.spo2 > 100) {
    errors.push('SpO2 saturation must be between 40% and 100%')
  }
  if (vitals.heartRate < 20 || vitals.heartRate > 260) {
    errors.push('Heart rate must be between 20 and 260 bpm')
  }
  if (vitals.systolicBp < 30 || vitals.systolicBp > 280) {
    errors.push('Systolic BP must be between 30 and 280 mmHg')
  }
  if (vitals.gcs < 3 || vitals.gcs > 15) {
    errors.push('Glasgow Coma Scale (GCS) must be an integer between 3 and 15')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate facility bed capacity numbers
 */
export function validateCapacity(beds: {
  general: number
  icu: number
  ventilators: number
}): VitalsValidationResult {
  const errors: string[] = []

  if (beds.general < 0 || !Number.isInteger(beds.general)) {
    errors.push('General ward beds must be a non-negative integer')
  }
  if (beds.icu < 0 || !Number.isInteger(beds.icu)) {
    errors.push('ICU beds must be a non-negative integer')
  }
  if (beds.ventilators < 0 || !Number.isInteger(beds.ventilators)) {
    errors.push('Staffed ventilators must be a non-negative integer')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Format ABHA input with standard hyphenation (XX-XXXX-XXXX-XXXX)
 */
export function formatABHANumber(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}-${digits.slice(10, 14)}`
}
