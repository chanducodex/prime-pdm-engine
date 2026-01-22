/**
 * Credentialing Email Notification Service
 * Handles all email communications for the credentialing workflow
 */

import type { CredentialingEmail } from "./provider-portal-types"

export const emailTemplates = {
  applicationInitiated: ({
    providerName,
    applicationId,
    tempCredentials,
  }: CredentialingEmail) => ({
    subject: `Credentialing Application Initiated - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .credentials { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; margin: 10px 10px 10px 0; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
          .step { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Credentialing Application</h1>
            <p>Welcome to ${process.env.HOSPITAL_NAME || "Our Hospital"} Credentialing Portal</p>
          </div>
          <div class="content">
            <h2>Dear ${providerName},</h2>
            <p>Your credentialing application has been initiated. Please complete the required steps to finalize your application.</p>

            <div class="credentials">
              <h3>🔐 Your Temporary Credentials</h3>
              <p><strong>Username:</strong> ${tempCredentials?.username}</p>
              <p><strong>Password:</strong> ${tempCredentials?.password}</p>
              <p style="color: #ef4444; font-size: 14px;">⚠️ For security, please change your password after first login.</p>
            </div>

            <h3>Next Steps:</h3>
            <div class="step">
              <strong>Step 1:</strong> Log in to the provider portal using your temporary credentials
            </div>
            <div class="step">
              <strong>Step 2:</strong> Change your password to secure your account
            </div>
            <div class="step">
              <strong>Step 3:</strong> Complete your profile information
            </div>
            <div class="step">
              <strong>Step 4:</strong> Upload required documents
            </div>
            <div class="step">
              <strong>Step 5:</strong> Submit your application for review
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${tempCredentials?.portalUrl}" class="button">Access Provider Portal</a>
              <a href="${tempCredentials?.setPasswordUrl}" class="button" style="background: #10b981;">Set New Password</a>
            </div>

            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              If you have any questions, please contact our credentialing department.
            </p>
          </div>
          <div class="footer">
            <p>Application ID: ${applicationId}</p>
            <p>${process.env.HOSPITAL_NAME || "Hospital"} Credentialing Services</p>
            <p>Contact: ${process.env.SUPPORT_EMAIL || "credentialing@hospital.com"}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  documentRequested: ({
    providerName,
    applicationId,
    documentsRequested,
    dueDate,
  }: CredentialingEmail) => ({
    subject: `Action Required: Documents Requested - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .doc-list { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .doc-item { padding: 10px; margin: 5px 0; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Action Required</h1>
            <p>Additional Documents Needed for Your Application</p>
          </div>
          <div class="content">
            <h2>Dear ${providerName},</h2>
            <p>Your credentialing application requires additional documents. Please upload the following items at your earliest convenience.</p>

            <div class="doc-list">
              <h3>📄 Documents Requested:</h3>
              ${documentsRequested?.map(doc => `<div class="doc-item">• ${doc}</div>`).join("") || ""}
            </div>

            ${dueDate ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ""}

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.PROVIDER_PORTAL_URL || "#"}" class="button">Upload Documents Now</a>
            </div>

            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              Please ensure all documents are clear, legible, and current. Expired documents cannot be accepted.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  committeeReview: ({
    providerName,
    applicationId,
    meetingDetails,
  }: CredentialingEmail) => ({
    subject: `Your Application is Scheduled for Committee Review - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .meeting-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .info-label { font-weight: bold; width: 120px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Committee Review Scheduled</h1>
            <p>Your Application is Being Reviewed</p>
          </div>
          <div class="content">
            <h2>Dear ${providerName},</h2>
            <p>Your credentialing application has been scheduled for review by the Credentialing Committee.</p>

            <div class="meeting-info">
              <h3>Meeting Details:</h3>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span>${meetingDetails?.date ? new Date(meetingDetails.date).toLocaleDateString() : "TBD"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Time:</span>
                <span>${meetingDetails?.time || "TBD"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Location:</span>
                <span>${meetingDetails?.location || "TBD"}</span>
              </div>
            </div>

            <p>You will be notified of the committee's decision within 2-3 business days after the meeting.</p>
            <p>No further action is required at this time.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  approval: ({
    providerName,
    applicationId,
  }: CredentialingEmail) => ({
    subject: `✅ Your Credentialing Application Has Been Approved - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>Your Credentialing Application Has Been Approved</p>
          </div>
          <div class="content">
            <h2>Dear ${providerName},</h2>
            <div class="success-box">
              <p style="font-size: 18px; font-weight: bold; color: #065f46;">
                Your credentialing application has been approved!
              </p>
            </div>

            <h3>What Happens Next:</h3>
            <ul>
              <li>You will receive your official credentialing certificate via mail</li>
              <li>Your profile has been activated in our system</li>
              <li>You may now begin practicing at our facility</li>
              <li>Please complete any remaining onboarding requirements</li>
            </ul>

            <p>If you have any questions, please contact the credentialing department.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  denial: ({
    providerName,
    applicationId,
    customMessage,
  }: CredentialingEmail) => ({
    subject: `Regarding Your Credentialing Application - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #6b7280; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Credentialing Application Update</h1>
          </div>
          <div class="content">
            <h2>Dear ${providerName},</h2>
            <p>After careful review, the Credentialing Committee has made a decision regarding your application.</p>

            <div class="info-box">
              <p><strong>Decision:</strong> Your application was not approved at this time.</p>
              ${customMessage ? `<p>${customMessage}</p>` : ""}
            </div>

            <h3>Your Options:</h3>
            <ul>
              <li>You may address the concerns and submit a new application</li>
              <li>You may request a reconsideration by providing additional information</li>
              <li>Contact the credentialing office to discuss the decision</li>
            </ul>

            <p>If you have any questions or wish to discuss this decision, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  conditionalApproval: ({
    providerName,
    applicationId,
    customMessage,
  }: CredentialingEmail) => ({
    subject: `Conditional Approval - Your Credentialing Application - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .condition-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .condition-item { padding: 10px; margin: 5px 0; background: white; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Conditional Approval</h1>
            <p>Your Application Has Been Approved With Conditions</p>
          </div>
          <div class="content">
            <h2>Dear ${providerName},</h2>
            <p>The Credentialing Committee has granted conditional approval for your application.</p>

            <div class="condition-box">
              <h3>Conditions for Approval:</h3>
              ${customMessage?.split("\n").map(condition =>
                condition.trim() ? `<div class="condition-item">• ${condition.trim()}</div>` : ""
              ).join("") || ""}
            </div>

            <p>Please ensure these conditions are met within the specified timeframe.</p>
            <p>Once all conditions are satisfied, your full approval will be processed.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  expirationReminder: ({
    providerName,
    applicationId,
    dueDate,
  }: CredentialingEmail) => ({
    subject: `⏰ Credentialing Expiration Reminder - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .urgent { background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Renewal Reminder</h1>
            <p>Your Credentialing is Expiring Soon</p>
          </div>
          <div class="content">
            <h2>Dear ${providerName},</h2>
            <div class="urgent">
              <p style="font-size: 18px; font-weight: bold; color: #92400e;">
                Your credentials will expire on ${dueDate ? new Date(dueDate).toLocaleDateString() : "soon"}
              </p>
            </div>

            <p>To maintain your active status, please submit your re-credentialing application before the expiration date.</p>

            <h3>Required for Renewal:</h3>
            <ul>
              <li>Updated CV</li>
              <li>Current medical license</li>
              <li>Proof of CME credits</li>
              <li>Current malpractice coverage</li>
              <li>Any additional required documentation</li>
            </ul>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.PROVIDER_PORTAL_URL || "#"}" class="button">Start Renewal Process</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  documentRejected: ({
    providerName,
    applicationId,
    documentName,
    documentType,
    rejectionReason,
    reuploadDeadline,
  }: CredentialingEmail) => ({
    subject: `Action Required: Document Rejected - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .rejection-box { background: #fef2f2; border: 2px solid #fecaca; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .reason-box { background: white; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; text-decoration: none; border-radius: 6px; }
          .deadline { background: #fef3c7; padding: 10px 15px; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Document Requires Attention</h1>
            <p>A document in your application needs to be re-uploaded</p>
          </div>
          <div class="content">
            <h2>Dear ${providerName},</h2>
            <p>We've reviewed your submitted documents and found an issue with one of them that requires your attention.</p>

            <div class="rejection-box">
              <h3 style="margin-top: 0; color: #991b1b;">Document Rejected</h3>
              <p><strong>Document Type:</strong> ${documentType || "Document"}</p>
              <p><strong>File Name:</strong> ${documentName || "N/A"}</p>

              <div class="reason-box">
                <p style="margin: 0; color: #991b1b;"><strong>Reason for Rejection:</strong></p>
                <p style="margin: 10px 0 0 0;">${rejectionReason || "Please contact our office for more details."}</p>
              </div>

              ${reuploadDeadline ? `
              <div class="deadline">
                <strong>⏰ Please re-upload by:</strong> ${new Date(reuploadDeadline).toLocaleDateString()}
              </div>
              ` : ""}
            </div>

            <h3>What You Need to Do:</h3>
            <ol>
              <li>Log in to the Provider Portal</li>
              <li>Navigate to the Documents section</li>
              <li>Find the rejected document (marked in red)</li>
              <li>Upload a new version that addresses the issue</li>
            </ol>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.PROVIDER_PORTAL_URL || "#"}/provider-portal" class="button">Upload New Document</a>
            </div>

            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              If you have questions about why your document was rejected or need assistance, please contact our credentialing department.
            </p>
          </div>
          <div class="footer">
            <p>Application ID: ${applicationId}</p>
            <p>${process.env.HOSPITAL_NAME || "Hospital"} Credentialing Services</p>
            <p>Contact: ${process.env.SUPPORT_EMAIL || "credentialing@hospital.com"}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
}

/**
 * Convert snake_case email type to camelCase template key
 */
function getTemplateKey(type: string): keyof typeof emailTemplates {
  const typeMap: Record<string, keyof typeof emailTemplates> = {
    application_initiated: "applicationInitiated",
    document_requested: "documentRequested",
    document_rejected: "documentRejected",
    committee_review: "committeeReview",
    approval: "approval",
    denial: "denial",
    conditional_approval: "conditionalApproval",
    expiration_reminder: "expirationReminder",
  }
  return typeMap[type] || (type as keyof typeof emailTemplates)
}

/**
 * Send credentialing email based on type
 */
export async function sendCredentialingEmail(data: CredentialingEmail): Promise<boolean> {
  try {
    // In production, this would integrate with your email service (SendGrid, AWS SES, etc.)
    const templateKey = getTemplateKey(data.type)
    const templateFn = emailTemplates[templateKey]

    if (!templateFn) {
      console.error(`[Email Service] Unknown email template type: ${data.type}`)
      return false
    }

    const template = templateFn(data)

    console.log(`[Email Service] Sending ${data.type} email to:`, data.to)
    console.log(`[Email Service] Subject:`, template.subject)

    // Mock email sending - replace with actual email service integration
    // Example with SendGrid:
    // await sgMail.send({
    //   to: data.to,
    //   from: process.env.FROM_EMAIL || 'credentialing@hospital.com',
    //   subject: template.subject,
    //   html: template.html,
    // })

    return true
  } catch (error) {
    console.error("[Email Service] Failed to send email:", error)
    return false
  }
}

/**
 * Generate temporary credentials for new provider users
 */
export function generateTempCredentials(providerEmail: string) {
  const username = providerEmail.toLowerCase()
  const tempPassword = generateSecurePassword()

  return {
    username,
    password: tempPassword,
    portalUrl: `${process.env.PORTAL_URL || "https://portal.hospital.com"}/login`,
    setPasswordUrl: `${process.env.PORTAL_URL || "https://portal.hospital.com"}/set-password`,
  }
}

/**
 * Generate a secure temporary password
 */
function generateSecurePassword(length = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const special = "!@#$%^&*"

  let password = ""
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  const allChars = uppercase + lowercase + numbers + special
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  return password.split("").sort(() => Math.random() - 0.5).join("")
}
