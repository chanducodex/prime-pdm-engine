"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { History, Users } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Provider Change History",
      href: "/change-history",
      icon: History,
      description: "Track and audit provider modifications",
    },
    {
      name: "Provider Data Management",
      href: "/providers",
      icon: Users,
      description: "Manage provider information",
    },
  ]

  return (
    <nav className="w-64 bg-white border-r border-gray-200 flex flex-col" aria-label="Main navigation">
      {/* App Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-bold text-violet-600">Provider Engine</h2>
        <p className="text-xs text-gray-500 mt-1">Healthcare Management System</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4">
        <ul className="space-y-1 px-3" role="list">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-violet-50 text-violet-700 border border-violet-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? "text-violet-600" : "text-gray-400"}`}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isActive ? "text-violet-700" : "text-gray-900"}`}>
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">Version 1.0.0</p>
      </div>
    </nav>
  )
}
