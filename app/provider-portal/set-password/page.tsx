"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, CheckCircle, X, Lock, Shield, ArrowRight, Loader2 } from "lucide-react"
import { useProviderAuth } from "@/lib/provider-auth-context"
import {
  validatePassword,
  calculatePasswordStrength,
  getPasswordStrengthInfo,
  passwordRequirements,
} from "@/lib/provider-portal-config"

export default function SetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, mustChangePassword, changePassword, setPassword: setNewPassword } = useProviderAuth()

  const isRequired = searchParams.get("required") === "true"
  const token = searchParams.get("token")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPasswordValue] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Redirect if already logged in and doesn't need to change password
  useEffect(() => {
    if (isAuthenticated && !mustChangePassword && !token) {
      router.push("/provider-portal")
    }
  }, [isAuthenticated, mustChangePassword, router, token])

  const validation = validatePassword(newPassword)
  const strength = calculatePasswordStrength(newPassword)
  const strengthInfo = getPasswordStrengthInfo(strength)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const requirementChecks = [
    {
      label: `At least ${passwordRequirements.minLength} characters`,
      met: newPassword.length >= passwordRequirements.minLength,
    },
    {
      label: "One uppercase letter",
      met: /[A-Z]/.test(newPassword),
    },
    {
      label: "One lowercase letter",
      met: /[a-z]/.test(newPassword),
    },
    {
      label: "One number",
      met: /[0-9]/.test(newPassword),
    },
    {
      label: "One special character",
      met: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(newPassword),
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength
    if (!validation.valid) {
      setError(validation.errors[0])
      return
    }

    setIsSubmitting(true)

    try {
      let result: { success: boolean; error?: string }

      if (token) {
        // Setting password via token (first-time setup)
        result = await setNewPassword(token, newPassword)
      } else if (isAuthenticated) {
        // Changing password while logged in
        if (!currentPassword) {
          setError("Current password is required")
          setIsSubmitting(false)
          return
        }
        result = await changePassword(currentPassword, newPassword)
      } else {
        setError("Invalid session. Please log in again.")
        setIsSubmitting(false)
        return
      }

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/provider-portal")
        }, 2000)
      } else {
        setError(result.error || "Failed to update password")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated. Redirecting you to the portal...
          </p>
          <div className="flex items-center justify-center gap-2 text-violet-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {mustChangePassword ? "Set Your New Password" : "Change Password"}
          </h1>
          <p className="text-gray-600">
            {mustChangePassword
              ? "Please create a secure password to protect your account."
              : "Update your password to keep your account secure."}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current password (only if changing, not initial setup) */}
            {isAuthenticated && !token && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Password Strength</span>
                    <span className={`text-xs font-medium ${strengthInfo.color}`}>{strengthInfo.label}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthInfo.bgColor} transition-all duration-300`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Requirements Checklist */}
              <div className="mt-4 space-y-2">
                {requirementChecks.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {req.met ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={`text-xs ${req.met ? "text-green-700" : "text-gray-500"}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-green-300 bg-green-50"
                        : "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !validation.valid || !passwordsMatch}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  Set Password
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Your password is encrypted and securely stored. We never share your credentials with third parties.
        </p>
      </div>
    </div>
  )
}
