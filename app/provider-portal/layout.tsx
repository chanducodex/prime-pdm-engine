"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  FileText,
  HelpCircle,
  LogOut,
  Bell,
  User,
  Menu,
  X,
  Shield,
  UserCircle,
} from "lucide-react"
import { useState } from "react"
import { ProviderAuthProvider, useProviderAuth } from "@/lib/provider-auth-context"
import { getPortalConfig } from "@/lib/provider-portal-config"

function ProviderPortalLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, mustChangePassword, logout } = useProviderAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const config = getPortalConfig()

  // Public routes that don't require authentication
  const publicRoutes = ["/provider-portal/login", "/provider-portal/set-password"]
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push("/provider-portal/login")
    }

    // Force password change if required
    if (!isLoading && isAuthenticated && mustChangePassword && pathname !== "/provider-portal/set-password") {
      router.push("/provider-portal/set-password?required=true")
    }
  }, [isLoading, isAuthenticated, isPublicRoute, mustChangePassword, pathname, router])

  const handleLogout = () => {
    logout()
    router.push("/provider-portal/login")
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Public routes show minimal layout
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
        {children}
      </div>
    )
  }

  // Protected routes show full layout
  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  const navigation = [
    { name: "Dashboard", href: "/provider-portal", icon: Home },
    { name: "My Application", href: "/provider-portal/application", icon: FileText },
    { name: "My Profile", href: "/provider-portal/profile", icon: UserCircle },
    { name: "Help & Support", href: "/provider-portal/help", icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            {/* <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Provider Portal</h1>
                <p className="text-xs text-gray-500">Credentialing Services</p>
              </div>
            </div> */}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/provider-portal" && pathname?.startsWith(item.href))

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "text-violet-700 bg-violet-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              {/* <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button> */}

              {/* User menu */}
              {/* below will comes from main header no need again page level same application all users will use but side menu for providers show only menu */}
              {/* <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.department}</p>
                </div>
                <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-violet-700">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div> */}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "text-violet-700 bg-violet-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}

              {/* Mobile user info */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-violet-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1  mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">{children}</main>

      {/* Footer */}
      {/* <footer className="bg-white border-t border-gray-200">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Need help? Contact us at{" "}
              <a href={`mailto:${config.supportEmail}`} className="text-violet-600 hover:text-violet-700">
                {config.supportEmail}
              </a>{" "}
              or call{" "}
              <a href={`tel:${config.supportPhone}`} className="text-violet-600 hover:text-violet-700">
                {config.supportPhone}
              </a>
            </div>
            <div className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Hospital Credentialing Services. All rights reserved.
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  )
}

export default function ProviderPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProviderAuthProvider>
      <ProviderPortalLayoutContent>{children}</ProviderPortalLayoutContent>
    </ProviderAuthProvider>
  )
}
