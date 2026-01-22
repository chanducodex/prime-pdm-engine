/**
 * Provider Portal Configuration
 * Manages authentication, password policies, and portal settings
 */

export interface PortalConfig {
  // Authentication settings
  allowTempPassword: boolean
  requirePasswordChange: boolean
  passwordExpiryDays: number
  tempPasswordExpiryHours: number

  // Session settings
  sessionTimeoutMinutes: number
  maxLoginAttempts: number
  lockoutDurationMinutes: number

  // Document settings
  maxDocumentSize: number // in MB
  allowedDocumentTypes: string[]

  // Support info
  supportEmail: string
  supportPhone: string

  // Portal URLs
  portalBaseUrl: string
  setPasswordPath: string
  loginPath: string
}

export const defaultPortalConfig: PortalConfig = {
  // Authentication - flexible based on hospital policy
  allowTempPassword: true,
  requirePasswordChange: true,
  passwordExpiryDays: 90,
  tempPasswordExpiryHours: 72,

  // Session
  sessionTimeoutMinutes: 30,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,

  // Documents
  maxDocumentSize: 10, // 10MB
  allowedDocumentTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],

  // Support
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'credentialing@hospital.com',
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '1-800-555-0123',

  // URLs
  portalBaseUrl: process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal.hospital.com',
  setPasswordPath: '/provider-portal/set-password',
  loginPath: '/provider-portal/login',
}

/**
 * Password validation rules
 */
export interface PasswordRequirements {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  specialChars: string
}

export const passwordRequirements: PasswordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

/**
 * Validate password against requirements
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters`)
  }

  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (passwordRequirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (passwordRequirements.requireSpecialChars) {
    const specialRegex = new RegExp(`[${passwordRequirements.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`)
    if (!specialRegex.test(password)) {
      errors.push('Password must contain at least one special character')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0

  // Length bonus (up to 30 points)
  strength += Math.min(30, password.length * 2)

  // Character variety (up to 40 points)
  if (/[a-z]/.test(password)) strength += 10
  if (/[A-Z]/.test(password)) strength += 10
  if (/[0-9]/.test(password)) strength += 10
  if (/[^a-zA-Z0-9]/.test(password)) strength += 10

  // Bonus for length > 12 (up to 15 points)
  if (password.length > 12) {
    strength += Math.min(15, (password.length - 12) * 3)
  }

  // Bonus for mixed case + numbers + special (15 points)
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
    strength += 15
  }

  return Math.min(100, strength)
}

/**
 * Get strength label and color
 */
export function getPasswordStrengthInfo(strength: number): { label: string; color: string; bgColor: string } {
  if (strength < 25) {
    return { label: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' }
  } else if (strength < 50) {
    return { label: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-500' }
  } else if (strength < 75) {
    return { label: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-500' }
  } else {
    return { label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' }
  }
}

/**
 * Provider portal feature flags
 */
export interface PortalFeatureFlags {
  enableDocumentUpload: boolean
  enableProfileEdit: boolean
  enableMessageCenter: boolean
  enableApplicationTracking: boolean
  showCommitteeDecisionDetails: boolean
}

export const defaultFeatureFlags: PortalFeatureFlags = {
  enableDocumentUpload: true,
  enableProfileEdit: false, // Providers can only view, not edit core profile data
  enableMessageCenter: true,
  enableApplicationTracking: true,
  showCommitteeDecisionDetails: true,
}

/**
 * Get the current portal configuration (can be extended to fetch from backend)
 */
export function getPortalConfig(): PortalConfig {
  return { ...defaultPortalConfig }
}

/**
 * Get the current feature flags (can be extended to fetch from backend)
 */
export function getFeatureFlags(): PortalFeatureFlags {
  return { ...defaultFeatureFlags }
}
