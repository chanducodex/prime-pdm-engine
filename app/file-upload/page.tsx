"use client";

import type React from "react";

import { useState, useCallback, useMemo } from "react";
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
} from "lucide-react";
import { useGlobalSearch, HighlightText } from "@/components/layout/app-shell";

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
];

export default function FileUploadPage() {
  const [showCurrentMonth, setShowCurrentMonth] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [localSearch, setLocalSearch] = useState("");

  const years = useMemo(() => {
    const yearMap = new Map<number, { year: number; months: string[] }>();
    mockUploadHistory.forEach((item) => {
      if (!yearMap.has(item.year)) {
        yearMap.set(item.year, { year: item.year, months: [] });
      }
      const monthName = new Date(item.year, item.month - 1).toLocaleString(
        "default",
        { month: "long" },
      );
      if (!yearMap.get(item.year)!.months.includes(monthName)) {
        yearMap.get(item.year)!.months.push(monthName);
      }
    });
    return Array.from(yearMap.values()).sort((a, b) => b.year - a.year);
  }, []);

  const filteredData = useMemo(() => {
    let data = mockUploadHistory;
    if (showCurrentMonth) {
      const currentDate = new Date();
      data = data.filter(
        (item) =>
          item.month === currentDate.getMonth() + 1 &&
          item.year === currentDate.getFullYear(),
      );
    } else if (selectedYear && selectedMonth) {
      const monthIndex =
        new Date(`${selectedMonth} 1, ${selectedYear}`).getMonth() + 1;
      data = data.filter(
        (item) => item.month === monthIndex && item.year === selectedYear,
      );
    }
    if (localSearch) {
      data = data.filter(
        (item) =>
          item.file_name.toLowerCase().includes(localSearch.toLowerCase()) ||
          item.uploaded_by.toLowerCase().includes(localSearch.toLowerCase()) ||
          item.file_uploaded_status
            .toLowerCase()
            .includes(localSearch.toLowerCase()),
      );
    }
    return data.sort((a, b) => b.file_ref_id - a.file_ref_id);
  }, [showCurrentMonth, selectedYear, selectedMonth, localSearch]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const searchTerm = localSearch;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadingFiles(files);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        setUploadingFiles(files);
      }
    },
    [],
  );

  const handleMonthSelect = (year: number, month: string) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowCurrentMonth(false);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <CheckCircle2 className="w-3 h-3" />
            Success
          </span>
        );
      case "Validation InProgress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3 animate-spin" />
            Validation In Progress
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with single screen title and filters */}
      <header className="bg-white border-b border-gray-200 px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">File Upload</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and review uploaded files
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
              {/* Left Column - Upload Section */}
              <div className="space-y-4">
                {/* Drag & Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    isDragging
                      ? "border-violet-400 bg-violet-50"
                      : "border-gray-300 bg-white hover:border-violet-300"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-violet-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Drag & Drop Files Here
                    </p>
                    <p className="text-xs text-gray-500 mb-4">CSV files only</p>
                    <label className="cursor-pointer">
                      <span className="inline-block px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
                        Browse Files
                      </span>
                      <input
                        type="file"
                        multiple
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Uploading Files */}
                {uploadingFiles.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Uploading Files ({uploadingFiles.length})
                    </h4>
                    <ul className="space-y-2">
                      {uploadingFiles.map((file, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                        >
                          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-700 truncate flex-1">
                            {file.name}
                          </span>
                          <button
                            onClick={() =>
                              setUploadingFiles((f) =>
                                f.filter((_, i) => i !== idx),
                              )
                            }
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Download Template */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Download Template
                  </h4>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Upload_Input_Template.csv
                  </a>
                </div>

                {/* FTP Location */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    FTP Location
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ftp://example.com/path"
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <button className="px-3 py-2 text-xs font-semibold text-white bg-gray-400 rounded-lg cursor-not-allowed">
                      Add
                    </button>
                  </div>
                </div>

                {/* API Endpoint */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    API Endpoint
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://api.example.com/upload"
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <button className="px-3 py-2 text-xs font-semibold text-white bg-gray-400 rounded-lg cursor-not-allowed">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Upload History Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {showCurrentMonth
                          ? "Jan 2026 Uploads"
                          : `${selectedMonth} ${selectedYear} Uploads`}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {filteredData.length} total records
                      </p>
                    </div>
                    <div className="flex items-end gap-3">
                      {/* Filter Controls */}
                      <div className="flex items-end gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setShowCurrentMonth(true);
                              setCurrentPage(1);
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                              showCurrentMonth
                                ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                                : "bg-white text-gray-700 border-gray-300 hover:border-violet-300 hover:text-violet-600"
                            }`}
                          >
                            Current Month
                          </button>
                          <span className="text-sm text-gray-400">or</span>
                        </div>

                        {/* Year Dropdown */}
                        <div className="relative">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Year
                          </label>
                          <select
                            value={selectedYear || ""}
                            onChange={(e) => {
                              const year = parseInt(e.target.value);
                              setSelectedYear(year);
                              setShowCurrentMonth(false);
                              setCurrentPage(1);
                            }}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent min-w-[120px]"
                          >
                            <option value="">Select Year</option>
                            {years.map((yearData) => (
                              <option key={yearData.year} value={yearData.year}>
                                {yearData.year}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Month Dropdown */}
                        <div className="relative">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Month
                          </label>
                          <select
                            value={selectedMonth || ""}
                            onChange={(e) => {
                              setSelectedMonth(e.target.value);
                              setShowCurrentMonth(false);
                              setCurrentPage(1);
                            }}
                            disabled={!selectedYear}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent min-w-[140px] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                          >
                            <option value="">Select Month</option>
                            {selectedYear &&
                              years
                                .find((y) => y.year === selectedYear)
                                ?.months.map((month) => (
                                  <option key={month} value={month}>
                                    {month}
                                  </option>
                                ))}
                          </select>
                        </div>

                        {!showCurrentMonth && selectedYear && selectedMonth && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 text-violet-700 rounded-lg border border-violet-200">
                            <span className="text-sm font-medium">
                              {selectedMonth} {selectedYear}
                            </span>
                            <button
                              onClick={() => {
                                setShowCurrentMonth(true);
                                setSelectedYear(null);
                                setSelectedMonth(null);
                                setCurrentPage(1);
                              }}
                              className="p-0.5 hover:bg-violet-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search files, status, or user..."
                          value={localSearch}
                          onChange={(e) => {
                            setLocalSearch(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Time (UTC)</th>
                        <th className="px-4 py-3">File Name</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Details</th>
                        <th className="px-4 py-3">Uploaded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <FileText className="w-6 h-6 text-gray-400" />
                              </div>
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                No uploads found
                              </p>
                              <p className="text-xs text-gray-500">
                                {searchTerm
                                  ? "Try adjusting your search or filters"
                                  : "Upload a file to get started"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((row) => (
                          <tr
                            key={row.file_ref_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-xs text-gray-900">
                              <HighlightText
                                text={row.file_uploaded_date}
                                search={searchTerm}
                              />
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              {row.file_uploaded_time}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900 font-medium">
                              <HighlightText
                                text={row.file_name}
                                search={searchTerm}
                              />
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(row.file_uploaded_status)}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              {row.total_records > 0
                                ? `${row.total_records} Total | ${row.additions} Add | ${row.changes} Change`
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              <HighlightText
                                text={row.uploaded_by}
                                search={searchTerm}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredData.length > pageSize && (
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <div className="text-xs text-gray-600">
                      Showing{" "}
                      <span className="font-medium text-gray-900">
                        {(currentPage - 1) * pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium text-gray-900">
                        {Math.min(currentPage * pageSize, filteredData.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-gray-900">
                        {filteredData.length}
                      </span>{" "}
                      uploads
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[32px] h-8 px-2 text-xs font-medium rounded transition-all ${
                              currentPage === page
                                ? "bg-violet-600 text-white"
                                : "text-gray-700 hover:bg-white"
                            }`}
                          >
                            {page}
                          </button>
                        ),
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
