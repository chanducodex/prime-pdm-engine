"use client"

import Link from "next/link"
import {
  Users,
  History,
  Upload,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
  Activity,
} from "lucide-react"

// Dashboard stats
const stats = [
  {
    label: "Total Providers",
    value: "12,847",
    change: "+124",
    changeType: "increase" as const,
    icon: Users,
    color: "violet",
  },
  {
    label: "Changes This Month",
    value: "3,256",
    change: "+18%",
    changeType: "increase" as const,
    icon: History,
    color: "blue",
  },
  {
    label: "Pending Validations",
    value: "47",
    change: "-12",
    changeType: "decrease" as const,
    icon: Clock,
    color: "amber",
  },
  {
    label: "File Uploads Today",
    value: "8",
    change: "+3",
    changeType: "increase" as const,
    icon: Upload,
    color: "green",
  },
]

const recentActivity = [
  {
    id: 1,
    type: "upload",
    title: "Atlas_PAR planwise.csv uploaded",
    description: "2813 records processed, 2813 changes",
    status: "success",
    time: "2 hours ago",
    user: "Columbia Admin",
  },
  {
    id: 2,
    type: "change",
    title: "Dr. Sarah Chen - Address Updated",
    description: "Provider address changed from Portland to Seattle",
    status: "success",
    time: "3 hours ago",
    user: "Admin.user",
  },
  {
    id: 3,
    type: "upload",
    title: "Z - Atlas - Provider Demo.csv",
    description: "Validation in progress...",
    status: "pending",
    time: "4 hours ago",
    user: "Columbia Admin",
  },
  {
    id: 4,
    type: "change",
    title: "Dr. Michael Torres - Specialty Changed",
    description: "Primary specialty updated to Cardiology",
    status: "success",
    time: "Yesterday",
    user: "Joan.claffey",
  },
  {
    id: 5,
    type: "error",
    title: "Latest_Demo.csv failed processing",
    description: "Please try again later",
    status: "error",
    time: "Yesterday",
    user: "Columbia Admin",
  },
]

const quickActions = [
  {
    title: "Manage Providers",
    description: "View, edit, and update provider information",
    href: "/providers",
    icon: Users,
    color: "violet",
  },
  {
    title: "View Change History",
    description: "Audit and track all provider modifications",
    href: "/change-history",
    icon: History,
    color: "blue",
  },
  {
    title: "Upload Files",
    description: "Import provider data via CSV files",
    href: "/file-upload",
    icon: Upload,
    color: "green",
  },
]

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here is an overview of your provider data.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colorClasses = {
            violet: "bg-violet-50 text-violet-600",
            blue: "bg-blue-50 text-blue-600",
            amber: "bg-amber-50 text-amber-600",
            green: "bg-green-50 text-green-600",
          }

          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.changeType === "increase" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/change-history" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      activity.status === "success"
                        ? "bg-green-50 text-green-600"
                        : activity.status === "pending"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                    }`}
                  >
                    {activity.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : activity.status === "pending" ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">by {activity.user}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              const colorClasses = {
                violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
                blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
                green: "bg-green-50 text-green-600 group-hover:bg-green-100",
              }

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
                >
                  <div
                    className={`p-2 rounded-lg transition-colors ${colorClasses[action.color as keyof typeof colorClasses]}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{action.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </Link>
              )
            })}
          </div>

          {/* Data Quality Summary */}
          <div className="px-5 py-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Data Quality</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Complete Records</span>
                  <span className="font-medium text-gray-900">94%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "94%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Validated NPIs</span>
                  <span className="font-medium text-gray-900">98%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: "98%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Active Locations</span>
                  <span className="font-medium text-gray-900">87%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "87%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Uploads Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Recent File Uploads</h2>
          </div>
          <Link href="/file-upload" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            View all uploads
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time (UTC)</th>
                <th className="px-5 py-3">File Name</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Details</th>
                <th className="px-5 py-3">Uploaded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  date: "01/14/2026",
                  time: "04:33:43 AM",
                  fileName: "Atlas_PAR planwise.csv",
                  status: "Success",
                  details: "2813 Total Records | 0 Additions | 2813 Changes",
                  uploadedBy: "Columbia Admin",
                },
                {
                  date: "01/14/2026",
                  time: "04:21:40 AM",
                  fileName: "Z - Atlas - Provider Demo_part2.csv",
                  status: "Success",
                  details: "1510 Total Records | 0 Additions | 1510 Changes",
                  uploadedBy: "Columbia Admin",
                },
                {
                  date: "01/14/2026",
                  time: "04:09:17 AM",
                  fileName: "Z - Atlas - Provider Demo.csv",
                  status: "Validation In Progress",
                  details: "-",
                  uploadedBy: "Columbia Admin",
                },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-900">{row.date}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{row.time}</td>
                  <td className="px-5 py-4 text-sm text-gray-900 font-medium">{row.fileName}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.status === "Success" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {row.status === "Success" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3 animate-spin" />
                      )}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{row.details}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{row.uploadedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
