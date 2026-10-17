/**
 * TriageNet Real-World User Configuration & API Key Store
 * Manages user-customized clinical facility profiles, custom API keys, and real-world endpoints.
 * Persists to localStorage and notifies reactive listeners.
 */

export interface UserConfig {
  // Facility Customization
  facilityName: string
  hospitalId: string
  districtName: string
  facilityTier: 'TERTIARY' | 'DISTRICT' | 'SUB_DIVISIONAL' | 'CHC'
  lat: number
  lng: number
  totalGeneralBeds: number
  totalIcuBeds: number
  totalVentilators: number
  superintendentName: string
  superintendentContact: string

  // Real-World API Keys & External Tool Endpoints
  openRouteServiceApiKey: string
  weatherApiKey: string
  abdmClientId: string
  abdmClientSecret: string
  itmsGatewayEndpoint: string
  customMapTileServer: string

  // Preferences & Mode
  soundEnabled: boolean
  offlineSyncEnabled: boolean
  lowBandwidthMode: boolean
  onboardingCompleted: boolean
  lastUpdated: string
}

export const DEFAULT_USER_CONFIG: UserConfig = {
  facilityName: 'RIMS Apex Hospital & Trauma Center',
  hospitalId: 'JH-RN-001',
  districtName: 'Ranchi',
  facilityTier: 'TERTIARY',
  lat: 23.3892,
  lng: 85.3621,
  totalGeneralBeds: 180,
  totalIcuBeds: 32,
  totalVentilators: 18,
  superintendentName: 'Dr. Vinay Kumar, MS',
  superintendentContact: '+91-651-2541533',

  openRouteServiceApiKey: '',
  weatherApiKey: '',
  abdmClientId: '',
  abdmClientSecret: '',
  itmsGatewayEndpoint: 'https://itms.ranchismartcity.in/api/v2/evp',
  customMapTileServer: '',

  soundEnabled: true,
  offlineSyncEnabled: true,
  lowBandwidthMode: false,
  onboardingCompleted: false,
  lastUpdated: new Date().toISOString(),
}

const STORAGE_KEY = 'triagenet_user_custom_config'

class UserConfigManager {
  private config: UserConfig

  constructor() {
    this.config = this.loadConfig()
  }

  private loadConfig(): UserConfig {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_USER_CONFIG }
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        return { ...DEFAULT_USER_CONFIG, ...JSON.parse(raw) }
      }
    } catch (e) {
      console.warn('Failed to parse user config from localStorage', e)
    }
    return { ...DEFAULT_USER_CONFIG }
  }

  public getConfig(): UserConfig {
    if (typeof window !== 'undefined') {
      this.config = this.loadConfig()
    }
    return this.config
  }

  public updateConfig(updates: Partial<UserConfig>): UserConfig {
    this.config = {
      ...this.config,
      ...updates,
      lastUpdated: new Date().toISOString(),
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
        window.dispatchEvent(new CustomEvent('triagenet_config_updated', { detail: this.config }))
      } catch (e) {
        console.error('Error saving user config:', e)
      }
    }
    return this.config
  }

  public resetToDefaults(): UserConfig {
    this.config = { ...DEFAULT_USER_CONFIG, lastUpdated: new Date().toISOString() }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
      window.dispatchEvent(new CustomEvent('triagenet_config_updated', { detail: this.config }))
    }
    return this.config
  }

  public wipeAllUserData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('triagenet_jwt')
      localStorage.removeItem('triagenet_error_logs')
      localStorage.removeItem('triagenet_sound_enabled')
      localStorage.removeItem('triagenet_shift_pin')
      window.dispatchEvent(new CustomEvent('triagenet_user_data_wiped'))
    }
    this.config = { ...DEFAULT_USER_CONFIG }
  }
}

export const userConfigManager = new UserConfigManager()
