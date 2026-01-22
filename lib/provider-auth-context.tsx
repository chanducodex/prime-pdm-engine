"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { ProviderUser, ProviderCredentialingApplication } from "./provider-portal-types"
import { getPortalConfig, validatePassword } from "./provider-portal-config"

interface ProviderAuthState {
  user: ProviderUser | null
  isAuthenticated: boolean
  isLoading: boolean
  mustChangePassword: boolean
  sessionExpiresAt: Date | null
}

interface ProviderAuthContextType extends ProviderAuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  setPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  refreshSession: () => void
  getApplication: () => ProviderCredentialingApplication | null
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined)

// Mock provider users for development
const mockProviderUsers: ProviderUser[] = [
  {
    id: "PU-001",
    providerId: 1,
    email: "dr.smith@example.com",
    hasSetPassword: true,
    firstName: "Sarah",
    lastName: "Smith",
    role: "provider" as const,
    department: "Cardiology",
    lastLogin: new Date().toISOString(),
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "PU-002",
    providerId: 2,
    email: "dr.johnson@example.com",
    tempPassword: "TempPass123!",
    hasSetPassword: false,
    firstName: "Michael",
    lastName: "Johnson",
    role: "provider" as const,
    department: "Orthopedics",
    createdAt: "2024-02-01T14:30:00Z",
  },
]

// Mock application data
const mockApplications: ProviderCredentialingApplication[] = [
  {
    id: "CRED-2024-001",
    providerId: 1,
    providerName: "Dr. Sarah Smith",
    providerEmail: "dr.smith@example.com",
    status: "under_review" as const,
    applicationType: "initial",
    submittedDate: "2024-01-20T09:00:00Z",
    lastUpdated: new Date().toISOString(),
    documents: [
      {
        id: "DOC-001",
        documentType: "state_license",
        fileName: "medical_license.pdf",
        uploadedDate: "2024-01-18T10:00:00Z",
        status: "approved",
        fileSize: 245000,
        fileUrl: "/documents/medical_license.pdf",
      },
      {
        id: "DOC-002",
        documentType: "dea_registration",
        fileName: "dea_cert.pdf",
        uploadedDate: "2024-01-18T10:05:00Z",
        status: "pending",
        fileSize: 180000,
        fileUrl: "/documents/dea_cert.pdf",
      },
      {
        id: "DOC-003",
        documentType: "malpractice_insurance",
        fileName: "insurance_old.pdf",
        uploadedDate: "2024-01-18T10:10:00Z",
        status: "rejected",
        rejectionReason: "Document has expired. Please upload current insurance certificate.",
        fileSize: 320000,
        fileUrl: "/documents/insurance_old.pdf",
      },
    ],
    pendingActions: [
      {
        id: "ACT-001",
        type: "document_upload",
        description: "Upload current malpractice insurance certificate",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        completed: false,
        documentType: "malpractice_insurance",
      },
      {
        id: "ACT-002",
        type: "information_update",
        description: "Verify work history information",
        priority: "medium",
        completed: false,
      },
    ],
  },
  {
    id: "CRED-2024-002",
    providerId: 2,
    providerName: "Dr. Michael Johnson",
    providerEmail: "dr.johnson@example.com",
    status: "documents_requested" as const,
    applicationType: "initial",
    lastUpdated: new Date().toISOString(),
    documents: [],
    pendingActions: [
      {
        id: "ACT-003",
        type: "document_upload",
        description: "Upload state medical license",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        completed: false,
        documentType: "state_license",
      },
      {
        id: "ACT-004",
        type: "document_upload",
        description: "Upload DEA registration",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        completed: false,
        documentType: "dea_registration",
      },
      {
        id: "ACT-005",
        type: "document_upload",
        description: "Upload malpractice insurance",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        completed: false,
        documentType: "malpractice_insurance",
      },
      {
        id: "ACT-006",
        type: "document_upload",
        description: "Upload CV/Resume",
        priority: "medium",
        completed: false,
        documentType: "cv_resume",
      },
    ],
  },
]

export function ProviderAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProviderAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    mustChangePassword: false,
    sessionExpiresAt: null,
  })

  const config = getPortalConfig()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      // In production, check session cookie/token
      const storedUser = localStorage.getItem("providerUser")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as ProviderUser
          const expiresAt = localStorage.getItem("sessionExpiresAt")

          if (expiresAt && new Date(expiresAt) > new Date()) {
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              mustChangePassword: !user.hasSetPassword && config.requirePasswordChange,
              sessionExpiresAt: new Date(expiresAt),
            })
          } else {
            // Session expired
            localStorage.removeItem("providerUser")
            localStorage.removeItem("sessionExpiresAt")
            setState((prev) => ({ ...prev, isLoading: false }))
          }
        } catch {
          localStorage.removeItem("providerUser")
          setState((prev) => ({ ...prev, isLoading: false }))
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    checkSession()
  }, [config.requirePasswordChange])

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true }))

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      const user = mockProviderUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return { success: false, error: "Invalid email or password" }
      }

      // Check password (in production, this would be server-side)
      const isValidPassword = user.hasSetPassword
        ? password === "Password123!" // Mock permanent password
        : password === user.tempPassword

      if (!isValidPassword) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return { success: false, error: "Invalid email or password" }
      }

      // Check if temp password is allowed
      if (!user.hasSetPassword && !config.allowTempPassword) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return { success: false, error: "Temporary password login is disabled. Please set a new password first." }
      }

      const sessionExpiresAt = new Date(Date.now() + config.sessionTimeoutMinutes * 60 * 1000)

      // Store session
      localStorage.setItem("providerUser", JSON.stringify(user))
      localStorage.setItem("sessionExpiresAt", sessionExpiresAt.toISOString())

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        mustChangePassword: !user.hasSetPassword && config.requirePasswordChange,
        sessionExpiresAt,
      })

      return { success: true }
    },
    [config]
  )

  const logout = useCallback(() => {
    localStorage.removeItem("providerUser")
    localStorage.removeItem("sessionExpiresAt")
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      mustChangePassword: false,
      sessionExpiresAt: null,
    })
  }, [])

  const setPassword = useCallback(
    async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
      // Validate password
      const validation = validatePassword(newPassword)
      if (!validation.valid) {
        return { success: false, error: validation.errors[0] }
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // In production, validate token and update password in backend
      // For now, mock the success
      console.log("[Auth] Password set for token:", token)

      return { success: true }
    },
    []
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
      if (!state.user) {
        return { success: false, error: "Not authenticated" }
      }

      // Validate new password
      const validation = validatePassword(newPassword)
      if (!validation.valid) {
        return { success: false, error: validation.errors[0] }
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // In production, verify current password and update
      const isValidCurrentPassword = state.user.hasSetPassword
        ? currentPassword === "Password123!"
        : currentPassword === state.user.tempPassword

      if (!isValidCurrentPassword) {
        return { success: false, error: "Current password is incorrect" }
      }

      // Update user state
      const updatedUser = { ...state.user, hasSetPassword: true, tempPassword: undefined }
      localStorage.setItem("providerUser", JSON.stringify(updatedUser))

      setState((prev) => ({
        ...prev,
        user: updatedUser,
        mustChangePassword: false,
      }))

      return { success: true }
    },
    [state.user]
  )

  const refreshSession = useCallback(() => {
    if (state.isAuthenticated) {
      const sessionExpiresAt = new Date(Date.now() + config.sessionTimeoutMinutes * 60 * 1000)
      localStorage.setItem("sessionExpiresAt", sessionExpiresAt.toISOString())
      setState((prev) => ({ ...prev, sessionExpiresAt }))
    }
  }, [state.isAuthenticated, config.sessionTimeoutMinutes])

  const getApplication = useCallback((): ProviderCredentialingApplication | null => {
    if (!state.user) return null
    return mockApplications.find((app) => app.providerId === state.user?.providerId) || null
  }, [state.user])

  return (
    <ProviderAuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setPassword,
        changePassword,
        refreshSession,
        getApplication,
      }}
    >
      {children}
    </ProviderAuthContext.Provider>
  )
}

export function useProviderAuth() {
  const context = useContext(ProviderAuthContext)
  if (!context) {
    throw new Error("useProviderAuth must be used within a ProviderAuthProvider")
  }
  return context
}

/**
 * Hook to get the current provider's application
 */
export function useProviderApplication() {
  const { getApplication, isAuthenticated, isLoading } = useProviderAuth()

  if (isLoading || !isAuthenticated) {
    return { application: null, isLoading }
  }

  return { application: getApplication(), isLoading: false }
}
