"use client"

import { useState, useCallback } from "react"
import type { CredentialingApplication } from "@/lib/credentialing-types"
import type { ProviderUser } from "@/lib/provider-portal-types"
import { sendCredentialingEmail, generateTempCredentials } from "@/lib/credentialing-email-service"
import { ProviderRole } from "@/lib/provider-portal-types"

interface InitiationResult {
  success: boolean
  providerUser?: ProviderUser
  tempCredentials?: {
    username: string
    password: string
    portalUrl: string
    setPasswordUrl: string
  }
  emailSent: boolean
  error?: string
}

interface UseApplicationInitiationReturn {
  initiateApplication: (application: CredentialingApplication, providerEmail: string) => Promise<InitiationResult>
  isInitiating: boolean
  lastResult: InitiationResult | null
}

/**
 * Hook for initiating credentialing applications
 * Handles:
 * 1. Generating temporary credentials
 * 2. Creating provider portal user
 * 3. Sending welcome email with temp password
 * 4. Tracking email sent status
 */
export function useApplicationInitiation(): UseApplicationInitiationReturn {
  const [isInitiating, setIsInitiating] = useState(false)
  const [lastResult, setLastResult] = useState<InitiationResult | null>(null)

  const initiateApplication = useCallback(
    async (application: CredentialingApplication, providerEmail: string): Promise<InitiationResult> => {
      setIsInitiating(true)

      try {
        // Step 1: Generate temporary credentials
        const tempCredentials = generateTempCredentials(providerEmail)

        console.log("[Application Initiation] Generated temp credentials for:", providerEmail)

        // Step 2: Create provider portal user
        const providerUser: ProviderUser = {
          id: `PU-${Date.now()}`,
          providerId: parseInt(application.providerId) || Date.now(),
          email: providerEmail,
          tempPassword: tempCredentials.password,
          hasSetPassword: false,
          firstName: application.providerSnapshot.firstName,
          lastName: application.providerSnapshot.lastName,
          role: ProviderRole.PROVIDER,
          department: application.providerSnapshot.department,
          createdAt: new Date().toISOString(),
        }

        console.log("[Application Initiation] Created provider user:", providerUser.id)

        // In production, this would save to database:
        // await saveProviderUser(providerUser)

        // Step 3: Send welcome email with credentials
        const emailSent = await sendCredentialingEmail({
          to: providerEmail,
          providerName: `${application.providerSnapshot.firstName} ${application.providerSnapshot.lastName}`,
          applicationId: application.id,
          type: "application_initiated",
          tempCredentials: {
            username: tempCredentials.username,
            password: tempCredentials.password,
            portalUrl: tempCredentials.portalUrl,
            setPasswordUrl: tempCredentials.setPasswordUrl,
          },
        })

        console.log("[Application Initiation] Email sent:", emailSent)

        const result: InitiationResult = {
          success: true,
          providerUser,
          tempCredentials,
          emailSent,
        }

        setLastResult(result)
        return result
      } catch (error) {
        console.error("[Application Initiation] Failed:", error)

        const result: InitiationResult = {
          success: false,
          emailSent: false,
          error: error instanceof Error ? error.message : "Failed to initiate application",
        }

        setLastResult(result)
        return result
      } finally {
        setIsInitiating(false)
      }
    },
    []
  )

  return {
    initiateApplication,
    isInitiating,
    lastResult,
  }
}

/**
 * Utility function to check if an application needs initiation
 */
export function needsInitiation(application: CredentialingApplication): boolean {
  return (
    application.status === "not_started" ||
    application.status === "documents_pending"
  )
}

/**
 * Utility function to check if credentials email was already sent
 * In production, this would check a database flag
 */
export function wasCredentialsEmailSent(applicationId: string): boolean {
  // Check localStorage for dev purposes
  // In production, this would be stored in the database
  if (typeof window === "undefined") return false
  const sentEmails = JSON.parse(localStorage.getItem("sentCredentialEmails") || "[]")
  return sentEmails.includes(applicationId)
}

/**
 * Mark credentials email as sent
 */
export function markCredentialsEmailSent(applicationId: string): void {
  if (typeof window === "undefined") return
  const sentEmails = JSON.parse(localStorage.getItem("sentCredentialEmails") || "[]")
  if (!sentEmails.includes(applicationId)) {
    sentEmails.push(applicationId)
    localStorage.setItem("sentCredentialEmails", JSON.stringify(sentEmails))
  }
}

/**
 * Bulk initiate applications
 * Useful for batch processing
 */
export async function bulkInitiateApplications(
  applications: Array<{ application: CredentialingApplication; email: string }>
): Promise<Map<string, InitiationResult>> {
  const results = new Map<string, InitiationResult>()

  for (const { application, email } of applications) {
    try {
      const tempCredentials = generateTempCredentials(email)

      const emailSent = await sendCredentialingEmail({
        to: email,
        providerName: `${application.providerSnapshot.firstName} ${application.providerSnapshot.lastName}`,
        applicationId: application.id,
        type: "application_initiated",
        tempCredentials,
      })

      results.set(application.id, {
        success: true,
        tempCredentials,
        emailSent,
      })

      markCredentialsEmailSent(application.id)
    } catch (error) {
      results.set(application.id, {
        success: false,
        emailSent: false,
        error: error instanceof Error ? error.message : "Failed to initiate",
      })
    }
  }

  return results
}
