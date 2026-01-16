"use client"

import type React from "react"

import { useState, useCallback } from "react"
import {
  Upload,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react"
import { useGlobalSearch, HighlightText } from "@/components/layout/app-shell"

// Mock upload history data
const mockUploadHistory = [
  {
    file_ref_id: 648,
    file_uploaded_date: "01/14/2026",
    file_uploaded_time: "04:33:43 AM",
    file_name: "Atlas_PAR planwise.csv",
    file_uploaded_status: "Success",
    month: 1,
    year: 2026,
    total_records: 2813,
    additions: 0,
    changes: 2813,
    uploaded_by: "Columbia Admin",
    errors: 0,
  },
  {
    file_ref_id: 647,
    file_uploaded_date: "01/14/2026",
    file_uploaded_time: "04:21:40 AM",
    file_name: "Z - Atlas - Provider Demo_part2.csv",
    file_uploaded_status: "Success",
    month: 1,
    year: 2026,
    total_records: 1510,
    additions: 0,
    changes: 1510,
    uploaded_by: "Columbia Admin",
    errors: 0,
  },
  {
    file_ref_id: 646,
    file_uploaded_date: "01/14/2026",
    file_uploaded_time: "04:20:17 AM",
    file_name: "Z - Atlas - Provider Demo_part1.csv",
    file_uploaded_status: "Success",
    month: 1,
    year: 2026,
    total_records: 1484,
    additions: 0,
    changes: 1484,
    uploaded_by: "Columbia Admin",
    errors: 0,
  },
  {
    file_ref_id: 645,
    file_uploaded_date: "01/14/2026",
    file_uploaded_time: "04:09:17 AM",
    file_name: "Z - Atlas - Provider Demo.csv",
    file_uploaded_status: "Validation InProgress",
    month: 1,
    year: 2026,
    total_records: 0,
    additions: 0,
    changes: 0,
    uploaded_by: "Columbia Admin",
    errors: 0,
  },
  {
    file_ref_id: 644,
    file_uploaded_date: "01/14/2026",
    file_uploaded_time: "04:06:58 AM",
    file_name: "Atlas - Credentials.csv",
    file_uploaded_status: "Success",
    month: 1,
    year: 2026,
    total_records: 2994,
    additions: 2994,
    changes: 0,
    uploaded_by: "Columbia Admin",
    errors: 0,
  },
  {
    file_ref_id: 643,
    file_uploaded_date: "01/13/2026",
    file_uploaded_time: "03:11:49 PM",
    file_name: "Atlas_PAR planwise.csv",
    file_uploaded_status: "Success",
    month: 1,
    year: 2026,
    total_records: 2813,
    additions: 2521,
    changes: 292,
    uploaded_by: "Columbia Admin",
    errors: 0,
  },
  {
    file_ref_id: 640,
    file_uploaded_date: "12/26/2025",
    file_uploaded_time: "02:11:28 PM",
    file_name: "Demograhic_smallset.csv",
    file_uploaded_status: "Success",
    month: 12,
    year: 2025,
    total_records: 1,
    additions: 0,
    changes: 0,
    uploaded_by: "Columbia Admin",
    errors: 0,
  },
  {
    file_ref_id: 639,
    file_uploaded_date: "12/24/2025",
    file_uploaded_time: "12:59:24 PM",
    file_name: "Latest_Demo 1(in).csv",
    file_uploaded_status: "Success",
    month: 12,
    year: 2025,
    total_records: 1647,
    additions: 0,
    changes: 1647,
    uploaded_by: "Columbia Admin",
    errors: 0,
  },
  {
    file_ref_id: 638,
    file_uploaded_date: "12/24/2025",
    file_uploaded_time: "12:47:28 PM",
    file_name: "Latest_Demo.csv",
    file_uploaded_status: "Failed",
    month: 12,
    year: 2025,
    total_records: 0,
    additions: 0,
    changes: 0,
    uploaded_by: "Columbia Admin",
    errors: 1,
  },
]

// Generate year/month structure
const years = [
  {
    year: 2026,
    months: ["Jan"],
  },
  {
    year: 2025,
    months: ["Dec", "Nov", "Oct", "Sept", "Aug", "Jul", "Jun", "May", "Apr", "Mar", "Feb", "Jan"],
  },
  {
    year: 2024,
    months: ["Dec", "Nov", "Oct", "Sept", "Aug", "Jul", "Jun", "May", "Apr", "Mar", "Feb", "Jan"],
  },
]

export default function FileUploadPage() {
  const { globalSearch } = useGlobalSearch()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [showCurrentMonth, setShowCurrentMonth] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [localSearch, setLocalSearch] = useState("")
  const pageSize = 10

  // Combine global and local search
  const searchTerm = globalSearch || localSearch

  // Filter data based on selections and search
  const filteredData = mockUploadHistory.filter((item) => {
    // Month/Year filter
    if (!showCurrentMonth && selectedYear && selectedMonth) {
      const monthIndex =
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"].indexOf(selectedMonth) + 1
      if (item.year !== selectedYear || item.month !== monthIndex) return false
    } else if (showCurrentMonth) {
      if (item.year !== 2026 || item.month !== 1) return false
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        item.file_name.toLowerCase().includes(search) ||
        item.uploaded_by.toLowerCase().includes(search) ||
        item.file_uploaded_status.toLowerCase().includes(search)
      )
    }

    return true
  })

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    setUploadingFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadingFiles(files)
    }
  }, [])

  const handleMonthSelect = (year: number, month: string) => {
    setSelectedYear(year)
    setSelectedMonth(month)
    setShowCurrentMonth(false)
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <CheckCircle2 className="w-3 h-3" />
            Success
          </span>
        )
      case "Validation InProgress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3 animate-spin" />
            Validation In Progress
          </span>
        )
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        )
      default:
        return status
    }
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Year/Month Navigation */}
      <aside className="w-44 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filter by Period</h3>
          {years.map((yearData) => (
            <div key={yearData.year} className="mb-4">
              <div className="text-sm font-semibold text-gray-900 mb-2">{yearData.year}</div>
              <ul className="space-y-1">
                {yearData.months.map((month) => {
                  const isSelected = !showCurrentMonth && selectedYear === yearData.year && selectedMonth === month
                  return (
                    <li key={month}>
                      <button
                        onClick={() => handleMonthSelect(yearData.year, month)}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                          isSelected ? "bg-violet-50 text-violet-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {month}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-violet-600 font-medium">PDM</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-violet-600 font-medium">File Upload</span>
              {!showCurrentMonth && selectedMonth && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {selectedMonth} {selectedYear}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                setShowCurrentMonth(!showCurrentMonth)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                showCurrentMonth
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {showCurrentMonth ? "Current Month" : "Previous Months"}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="flex gap-6">
            {/* Upload Section */}
            <div className="w-72 flex-shrink-0 space-y-4">
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  isDragging ? "border-violet-400 bg-violet-50" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Drag & Drop Files Here</p>
                  <p className="text-xs text-gray-400 mb-4">or</p>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 text-sm font-medium text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors">
                      Upload Files
                    </span>
                    <input type="file" multiple accept=".csv" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Uploading Files */}
              {uploadingFiles.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Uploading Files</h4>
                  <ul className="space-y-2">
                    {uploadingFiles.map((file, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                        <button
                          onClick={() => setUploadingFiles((f) => f.filter((_, i) => i !== idx))}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Download Template */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Download Template</h4>
                <a href="#" className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700">
                  <Download className="w-4 h-4" />
                  Upload_Input_Template.csv
                </a>
              </div>

              {/* FTP Location */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">FTP Location</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type URL"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button className="px-3 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg cursor-not-allowed">
                    Add
                  </button>
                </div>
              </div>

              {/* Endpoint */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Endpoint</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type URL"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button className="px-3 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg cursor-not-allowed">
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Upload History Table */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {showCurrentMonth
                      ? "Current month file upload transactions"
                      : `${selectedMonth} ${selectedYear} uploads`}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={localSearch}
                        onChange={(e) => {
                          setLocalSearch(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>
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
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No uploads found for this period</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((row) => (
                        <tr key={row.file_ref_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4 text-sm text-gray-900">
                            <HighlightText text={row.file_uploaded_date} search={searchTerm} />
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">{row.file_uploaded_time}</td>
                          <td className="px-5 py-4 text-sm text-gray-900 font-medium">
                            <HighlightText text={row.file_name} search={searchTerm} />
                          </td>
                          <td className="px-5 py-4">{getStatusBadge(row.file_uploaded_status)}</td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {row.total_records > 0
                              ? `${row.total_records} Total Records | ${row.additions} Additions | ${row.changes} Changes`
                              : "-"}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            <HighlightText text={row.uploaded_by} search={searchTerm} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredData.length > pageSize && (
                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} uploads
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === page ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
