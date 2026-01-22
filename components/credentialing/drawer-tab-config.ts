/**
 * Role-Based Drawer Tab Configuration
 * Defines which tabs are visible and their capabilities for each user role
 */

import { CredentialingRole } from "@/lib/credentialing-rbac"
import {
  Activity,
  FileText,
  CheckCircle,
  ShieldCheck,
  Users,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react"

export type DrawerViewMode = "provider" | "committee" | "admin"

export type TabId = "status" | "documents" | "psv" | "sanctions" | "committee" | "recredentialing"

export interface TabConfig {
  id: TabId
  label: string
  icon: LucideIcon
  description: string
  /** Whether the tab is visible for this view mode */
  visible: boolean
  /** Whether the user can edit/interact with the tab content */
  editable: boolean
  /** Whether to show this tab prominently (expanded, default selected, etc) */
  prominent?: boolean
  /** Badge to show on the tab (dynamic, will be calculated) */
  getBadge?: (application: any) => string | number | null
}

export interface DrawerViewConfig {
  viewMode: DrawerViewMode
  tabs: TabConfig[]
  /** Default tab to show when drawer opens */
  defaultTab: TabId
  /** Show workflow action bar */
  showWorkflowActions: boolean
  /** Show assignment controls */
  showAssignment: boolean
  /** Show export button */
  showExport: boolean
  /** Show delete button */
  showDelete: boolean
  /** Header style */
  headerStyle: "full" | "compact"
}

/**
 * Get the drawer view mode based on the user's role
 */
export function getDrawerViewMode(role: CredentialingRole): DrawerViewMode {
  switch (role) {
    case CredentialingRole.PROVIDER:
      return "provider"
    case CredentialingRole.COMMITTEE_MEMBER:
    case CredentialingRole.COMMITTEE_CHAIR:
      return "committee"
    case CredentialingRole.COORDINATOR:
    case CredentialingRole.SPECIALIST:
    case CredentialingRole.ANALYST:
    case CredentialingRole.COMPLIANCE:
    case CredentialingRole.MEDICAL_DIRECTOR:
    case CredentialingRole.ADMIN:
    default:
      return "admin"
  }
}

/**
 * Tab configurations for provider view (simplified)
 * Only shows Status and Documents tabs
 */
const providerTabs: TabConfig[] = [
  {
    id: "status",
    label: "Application Status",
    icon: Activity,
    description: "View your application progress",
    visible: true,
    editable: false, // Read-only for providers
    getBadge: (app) => `${app.progressPercentage}%`,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    description: "Upload and manage documents",
    visible: true,
    editable: true, // Providers can upload/reupload documents
    prominent: true, // Highlight if there are rejected docs
  },
  {
    id: "psv",
    label: "PSV Results",
    icon: CheckCircle,
    description: "Primary source verification",
    visible: false, // Hidden from providers
    editable: false,
  },
  {
    id: "sanctions",
    label: "Sanctions & Exclusions",
    icon: ShieldCheck,
    description: "OIG, SAM, NPDB screening",
    visible: false, // Hidden from providers
    editable: false,
  },
  {
    id: "committee",
    label: "Committee Decision",
    icon: Users,
    description: "View committee decision",
    visible: true, // Show decision only, not internal notes
    editable: false,
  },
  {
    id: "recredentialing",
    label: "Re-credentialing",
    icon: RefreshCcw,
    description: "Renewal information",
    visible: false, // Hidden from providers
    editable: false,
  },
]

/**
 * Tab configurations for committee view (focused on review)
 * All tabs visible with focus on Committee Review tab
 */
const committeeTabs: TabConfig[] = [
  {
    id: "status",
    label: "Credentialing Status",
    icon: Activity,
    description: "Workflow timeline & current status",
    visible: true,
    editable: false,
    getBadge: (app) => `${app.progressPercentage}%`,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    description: "View uploaded documents",
    visible: true,
    editable: false, // Committee members can view but not modify
  },
  {
    id: "psv",
    label: "PSV Results",
    icon: CheckCircle,
    description: "Primary source verification",
    visible: true,
    editable: false,
  },
  {
    id: "sanctions",
    label: "Sanctions & Exclusions",
    icon: ShieldCheck,
    description: "OIG, SAM, NPDB screening",
    visible: true,
    editable: false,
  },
  {
    id: "committee",
    label: "Committee Review",
    icon: Users,
    description: "Risk scoring & voting",
    visible: true,
    editable: true, // Committee members can vote
    prominent: true, // Make this the focus
  },
  {
    id: "recredentialing",
    label: "Re-credentialing",
    icon: RefreshCcw,
    description: "3-year cycle management",
    visible: true,
    editable: false,
    getBadge: (app) => app.cycleType === "recredentialing" ? "Active" : null,
  },
]

/**
 * Tab configurations for admin view (full access)
 * All tabs visible with full editing capabilities
 */
const adminTabs: TabConfig[] = [
  {
    id: "status",
    label: "Credentialing Status",
    icon: Activity,
    description: "Workflow timeline & current status",
    visible: true,
    editable: true,
    getBadge: (app) => `${app.progressPercentage}%`,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    description: "Upload & AI extraction",
    visible: true,
    editable: true, // Full document management
  },
  {
    id: "psv",
    label: "PSV Results",
    icon: CheckCircle,
    description: "Primary source verification",
    visible: true,
    editable: true,
  },
  {
    id: "sanctions",
    label: "Sanctions & Exclusions",
    icon: ShieldCheck,
    description: "OIG, SAM, NPDB screening",
    visible: true,
    editable: true,
  },
  {
    id: "committee",
    label: "Committee Review",
    icon: Users,
    description: "Risk scoring & decision",
    visible: true,
    editable: true,
  },
  {
    id: "recredentialing",
    label: "Re-credentialing",
    icon: RefreshCcw,
    description: "3-year cycle management",
    visible: true,
    editable: true,
    getBadge: (app) => app.cycleType === "recredentialing" ? "Active" : null,
  },
]

/**
 * Get drawer configuration based on view mode
 */
export function getDrawerConfig(viewMode: DrawerViewMode): DrawerViewConfig {
  switch (viewMode) {
    case "provider":
      return {
        viewMode: "provider",
        tabs: providerTabs,
        defaultTab: "status",
        showWorkflowActions: false,
        showAssignment: false,
        showExport: false,
        showDelete: false,
        headerStyle: "compact",
      }

    case "committee":
      return {
        viewMode: "committee",
        tabs: committeeTabs,
        defaultTab: "committee", // Open to committee review by default
        showWorkflowActions: true,
        showAssignment: false,
        showExport: true,
        showDelete: false,
        headerStyle: "full",
      }

    case "admin":
    default:
      return {
        viewMode: "admin",
        tabs: adminTabs,
        defaultTab: "status",
        showWorkflowActions: true,
        showAssignment: true,
        showExport: true,
        showDelete: true,
        headerStyle: "full",
      }
  }
}

/**
 * Get visible tabs for a view mode
 */
export function getVisibleTabs(viewMode: DrawerViewMode): TabConfig[] {
  const config = getDrawerConfig(viewMode)
  return config.tabs.filter((tab) => tab.visible)
}

/**
 * Check if a specific tab is editable for a view mode
 */
export function isTabEditable(viewMode: DrawerViewMode, tabId: TabId): boolean {
  const config = getDrawerConfig(viewMode)
  const tab = config.tabs.find((t) => t.id === tabId)
  return tab?.editable ?? false
}

/**
 * Get provider-friendly tab label
 * Some tabs have different labels for provider view
 */
export function getTabLabel(viewMode: DrawerViewMode, tabId: TabId): string {
  if (viewMode === "provider") {
    switch (tabId) {
      case "status":
        return "Application Status"
      case "documents":
        return "My Documents"
      case "committee":
        return "Committee Decision"
      default:
        break
    }
  }

  const config = getDrawerConfig(viewMode)
  const tab = config.tabs.find((t) => t.id === tabId)
  return tab?.label ?? tabId
}
