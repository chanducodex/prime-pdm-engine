"use client"

import type React from "react"

import { useState, createContext, useContext, useCallback, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  History,
  Users,
  Upload,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Settings,
  X,
  Menu,
} from "lucide-react"

// Context for global search
interface SearchContextType {
  globalSearch: string
  setGlobalSearch: (search: string) => void
  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
}

const SearchContext = createContext<SearchContextType>({
  globalSearch: "",
  setGlobalSearch: () => {},
  isSearchOpen: false,
  setIsSearchOpen: () => {},
})

export const useGlobalSearch = () => useContext(SearchContext)

// Highlight text component for search results
export function HighlightText({ text, search }: { text: string; search: string }) {
  if (!search || !text) return <>{text}</>

  const parts = text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview and quick insights",
  },
  {
    name: "Provider Management",
    href: "/providers",
    icon: Users,
    description: "Manage provider information",
  },
  {
    name: "Change History",
    href: "/change-history",
    icon: History,
    description: "Audit provider modifications",
  },
  {
    name: "File Upload",
    href: "/file-upload",
    icon: Upload,
    description: "Import and export data",
  },
]

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [globalSearch, setGlobalSearch] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false)
      setGlobalSearch("")
    }
  }, [])

  return (
    <SearchContext.Provider value={{ globalSearch, setGlobalSearch, isSearchOpen, setIsSearchOpen }}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden ${
            isCollapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Logo */}
          <div
            className={`flex items-center h-16 px-4 border-b border-gray-200 ${isCollapsed ? "justify-center" : "justify-between"}`}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <img
                  src="https://www.atlassystems.com/hubfs/IT%20Services%20-%20Atlas%20Systems/Atlas%20Systems%20Logo%201-1.jpg"
                  alt="Atlas Systems Logo"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <img
                  src="https://www.atlassystems.com/hubfs/Atlas-2025/prime-logo.svg"
                  alt="PPC Logo"
                  className="h-12 w-auto "
                />
              </div>
            )}
            {isCollapsed && (
              <img
                src="https://www.atlassystems.com/hubfs/IT%20Services%20-%20Atlas%20Systems/Atlas%20Systems%20Logo%201-1.jpg"
                alt="Atlas Systems Logo"
                className="w-8 h-8 rounded-lg object-cover"
              />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative h-12 ${
                        isActive
                          ? "bg-violet-50 text-violet-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      } ${isCollapsed ? "justify-center px-1 py-3 gap-0" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-violet-600" : "text-gray-400 group-hover:text-gray-600"}`}
                        aria-hidden="true"
                      />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.name}</div>
                          <div className="text-xs text-gray-500 truncate">{item.description}</div>
                        </div>
                      )}
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="fixed left-20 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Collapse Toggle */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${
                isCollapsed ? "px-2" : "px-3"
              }`}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm">Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform md:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img
                src="https://www.atlassystems.com/hubfs/IT%20Services%20-%20Atlas%20Systems/Atlas%20Systems%20Logo%201-1.jpg"
                alt="Atlas Systems Logo"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <img
                src="https://www.atlassystems.com/hubfs/Atlas-2025/prime-logo.svg"
                alt="PPC Logo"
                className="h-12 w-auto "
              />
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive ? "bg-violet-50 text-violet-700" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-violet-600" : "text-gray-400"}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Top Header Bar */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Universal Search */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Universal search across all screens... (Press '/' to focus)"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                />
                {globalSearch && (
                  <button
                    onClick={() => {
                      setGlobalSearch("")
                      setIsSearchOpen(false)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-medium text-sm ml-2">
                CR
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SearchContext.Provider>
  )
}
