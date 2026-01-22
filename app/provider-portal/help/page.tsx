"use client"

import { useState } from "react"
import {
  Phone,
  Mail,
  Clock,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: "general" | "documents" | "account" | "timeline"
}

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "How do I upload my documents?",
    answer: "Navigate to the 'Documents' tab in your application. Click the 'Upload Document' button, select the document type, and choose your file. We accept PDF, JPG, and PNG files. For best results, ensure documents are clear, readable, and all pages are included.",
    category: "documents",
  },
  {
    id: "2",
    question: "Why was my document rejected?",
    answer: "Documents may be rejected for several reasons: expired dates, blurry images, missing pages, incorrect document type, or illegible text. You'll receive a message explaining the specific reason. Please address the issue and re-upload the corrected document.",
    category: "documents",
  },
  {
    id: "3",
    question: "What is the credentialing timeline?",
    answer: "The typical credentialing process takes 90-120 days. This includes document collection (1-2 weeks), primary source verification (4-6 weeks), committee review (1-2 weeks), and final approval. You can track your progress in the Application Status tab.",
    category: "timeline",
  },
  {
    id: "4",
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link. Alternatively, you can contact the credentialing office for assistance.",
    category: "account",
  },
  {
    id: "5",
    question: "Can I use my temporary password permanently?",
    answer: "This depends on hospital policy. Temporary passwords are typically for initial access only. You may be required to set a permanent password upon first login. Check your email for specific instructions.",
    category: "account",
  },
  {
    id: "6",
    question: "What happens during committee review?",
    answer: "The credentials committee reviews your application, verifies all information, and makes a determination. You may be asked to provide additional information. The committee will approve, deny, or grant conditional approval based on their findings.",
    category: "general",
  },
  {
    id: "7",
    question: "How will I know about status updates?",
    answer: "You'll receive email notifications at each stage of the process. You can also check your status anytime in the provider portal. Important updates will appear in your Messages.",
    category: "general",
  },
  {
    id: "8",
    question: "What documents are required?",
    answer: "Required documents typically include: Medical license, DEA certificate, board certification, malpractice insurance, CV, education verification, and work history. Specific requirements may vary based on your specialty.",
    category: "documents",
  },
]

const documentTips = [
  {
    icon: Upload,
    title: "File Format",
    description: "Upload documents as PDF files when possible. Ensure text is clear and readable.",
  },
  {
    icon: FileText,
    title: "Complete Pages",
    description: "Include all pages of multi-page documents. Missing pages will cause rejection.",
  },
  {
    icon: CheckCircle,
    title: "Current Dates",
    description: "Ensure all licenses and certificates are current and not expired.",
  },
  {
    icon: AlertCircle,
    title: "File Size",
    description: "Keep files under 10MB. If larger, split into multiple documents.",
  },
]

const commonIssues = [
  {
    issue: "Document upload fails",
    solution: "Check file size (max 10MB), ensure file format is supported (PDF, JPG, PNG), and verify your internet connection.",
  },
  {
    issue: "Can't log in",
    solution: "Verify your credentials, check for typos, or use the 'Forgot Password' option. Contact support if issues persist.",
  },
  {
    issue: "Status not updating",
    solution: "Status updates may take 1-2 business days. If it's been longer, contact the credentialing office.",
  },
  {
    issue: "Email not received",
    solution: "Check spam/junk folders. Add credentialing@hospital.com to your contacts to ensure delivery.",
  },
]

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredFaqs =
    selectedCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory)

  const categories = [
    { value: "all", label: "All" },
    { value: "general", label: "General" },
    { value: "documents", label: "Documents" },
    { value: "account", label: "Account" },
    { value: "timeline", label: "Timeline" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-500 mt-1">Find answers and get assistance with your credentialing application</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="mailto:credentialing@hospital.com"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-sm transition-all"
        >
          <div className="p-3 bg-violet-100 rounded-lg">
            <Mail className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Email Us</p>
            <p className="text-sm text-gray-500">credentialing@hospital.com</p>
          </div>
        </a>

        <a
          href="tel:+1-555-123-4567"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-sm transition-all"
        >
          <div className="p-3 bg-green-100 rounded-lg">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Call Us</p>
            <p className="text-sm text-gray-500">Mon-Fri, 8AM-5PM EST</p>
          </div>
        </a>

        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Response Time</p>
            <p className="text-sm text-gray-500">Within 24 business hours</p>
          </div>
        </div>
      </div>

      {/* Document Upload Tips */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-violet-600" />
          Document Upload Tips
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {documentTips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-md shadow-sm">
                  <Icon className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{tip.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{tip.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-violet-600" />
          Frequently Asked Questions
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedCategory === cat.value
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === faq.id && (
                <div className="px-4 pb-4 pt-0 text-gray-600 border-t border-gray-100">
                  <p className="mt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Common Issues */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-violet-600" />
          Common Issues & Solutions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonIssues.map((item, index) => (
            <div key={index} className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="font-medium text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {item.issue}
              </p>
              <p className="text-sm text-amber-700 mt-2">{item.solution}</p>
            </div>
          ))}
        </div>
      </section>

      {/* External Resources */}
      <section className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources & Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="#"
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-violet-300 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900">Provider Handbook</p>
              <p className="text-sm text-gray-500">Complete credentialing guide</p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400" />
          </a>
          <a
            href="#"
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-violet-300 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900">Document Checklist</p>
              <p className="text-sm text-gray-500">Download required items list</p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400" />
          </a>
        </div>
      </section>
    </div>
  )
}
