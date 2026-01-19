// ============================================================================
// Call Monitoring & QA - Outreach Review Dashboard
// Monitor calls, review recordings, transcriptions, and quality assurance
// ============================================================================

"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  OutreachTask,
  OutreachRole,
  OutreachFilters,
  QAReview,
} from "@/lib/outreach-types";
import { OutreachWorklistTable } from "@/components/outreach/outreach-worklist-table";
import { OutreachBulkActions } from "@/components/outreach/outreach-bulk-actions";
import { OutreachDetailsDrawer } from "@/components/outreach/outreach-details-drawer";
import { OutreachFilterPopup } from "@/components/outreach/outreach-filter-popup";
import { OutreachConfigDrawer } from "@/components/outreach/outreach-config-drawer";
import { OutreachSummaryCards } from "@/components/outreach/outreach-summary-cards";
import { AddNoteModal } from "@/components/outreach/add-note-modal";
import {
  UpdateContactModal,
  ContactUpdateData,
} from "@/components/outreach/update-contact-modal";
import { SendSelfServiceModal } from "@/components/outreach/send-self-service-modal";
import { QAReviewFormData } from "@/components/outreach/qa-review/qa-review-types";
import { useGlobalSearch } from "@/components/layout/app-shell";
import {
  getMockTasks,
  getMockSummary,
  getMockTaskDetails,
  getMockExplainability,
  getMockCallRecordings,
  getMockCallTranscripts,
  getMockCallAnalysis,
  getMockQAReviews,
} from "@/lib/outreach-mock-data";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Search,
  X,
  SlidersHorizontal,
  Target,
} from "lucide-react";

// TODO: In production, this would come from auth context
const CURRENT_USER_ROLE: OutreachRole = "MANAGER";

export default function CallMonitoringPage() {
  const { globalSearch } = useGlobalSearch();

  // UI State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OutreachTask | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [tasksVersion, setTasksVersion] = useState(0);

  // Modal states
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isUpdateContactModalOpen, setIsUpdateContactModalOpen] =
    useState(false);
  const [isSendSelfServiceModalOpen, setIsSendSelfServiceModalOpen] =
    useState(false);
  const [modalTask, setModalTask] = useState<OutreachTask | null>(null);

  // QA Reviews state - store reviews keyed by callId
  const [qaReviewsMap, setQaReviewsMap] = useState<Record<string, QAReview[]>>({});

  // Filters
  const [filters, setFilters] = useState<OutreachFilters>({});

  // Update filters helper
  const updateFilter = useCallback(
    <K extends keyof OutreachFilters>(key: K, value: OutreachFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(filters).forEach((value) => {
      if (value !== undefined && value !== "") count++;
    });
    return count;
  }, [filters]);

  // Mock data
  const allTasks = useMemo(() => getMockTasks(), [tasksVersion]);
  const summary = useMemo(() => getMockSummary(), [tasksVersion]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task: OutreachTask) => {
      if (localSearch || globalSearch) {
        const search = (localSearch || globalSearch).toLowerCase();
        const matchesSearch =
          task.providerIdentifier.toLowerCase().includes(search) ||
          task.accountName.toLowerCase().includes(search) ||
          task.cycleName.toLowerCase().includes(search) ||
          task.taskId.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      if (filters.accountId && task.accountId !== filters.accountId)
        return false;
      if (filters.cycleId && task.cycleId !== filters.cycleId) return false;
      if (filters.queueId && task.assignedQueue !== filters.queueId)
        return false;
      if (filters.method && task.currentMethod !== filters.method) return false;
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priorityTier && task.priorityTier !== filters.priorityTier)
        return false;
      if (filters.providerState && task.providerState !== filters.providerState)
        return false;
      if (filters.blockReason && task.blockReason !== filters.blockReason)
        return false;
      if (filters.slaDue) {
        const now = new Date();
        const slaDue = new Date(task.slaDueAt);
        const hoursUntilDue =
          (slaDue.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (
          filters.slaDue === "next_4h" &&
          (hoursUntilDue <= 0 || hoursUntilDue > 4)
        )
          return false;
        if (
          filters.slaDue === "next_24h" &&
          (hoursUntilDue <= 0 || hoursUntilDue > 24)
        )
          return false;
        if (filters.slaDue === "overdue" && hoursUntilDue >= 0) return false;
      }

      return true;
    });
  }, [allTasks, localSearch, globalSearch, filters]);

  // Pagination
  const total = filteredTasks.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // Table state
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof OutreachTask | undefined>(
    undefined,
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Sorting
  const sortedTasks = useMemo(() => {
    if (!sortColumn) return paginatedTasks;
    return [...paginatedTasks].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [paginatedTasks, sortColumn, sortDirection]);

  // Handlers
  const handleSort = useCallback(
    (column: keyof OutreachTask) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
      setCurrentPage(1);
    },
    [sortColumn, sortDirection],
  );

  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  }, []);

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      setSelectedTaskIds(selected ? sortedTasks.map((t) => t.taskId) : []);
    },
    [sortedTasks],
  );

  const handleRowClick = useCallback((task: OutreachTask) => {
    setSelectedTaskId(task.taskId);
    setIsDetailsDrawerOpen(true);
  }, []);

  const handleCloseDetailsDrawer = useCallback(() => {
    setIsDetailsDrawerOpen(false);
    setSelectedTaskId(null);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  const handleOpenConfigDrawer = useCallback((task?: OutreachTask) => {
    setEditingTask(task || null);
    setIsConfigDrawerOpen(true);
  }, []);

  const handleCloseConfigDrawer = useCallback(() => {
    setIsConfigDrawerOpen(false);
    setEditingTask(null);
  }, []);

  // Show toast notification
  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const handleSaveConfig = useCallback(
    (data: any) => {
      console.log("Saving validation config:", data);
      showToast("Validation configuration saved successfully", "success");
      // Force refresh of tasks
      setTasksVersion((v) => v + 1);
    },
    [showToast],
  );

  // Handle modal actions
  const handleAddNote = useCallback(
    (taskId: string, note: string) => {
      console.log("Adding note to task:", taskId, note);
      const task = allTasks.find((t) => t.taskId === taskId);
      showToast(
        `Note added for ${task?.providerIdentifier || "provider"}`,
        "success",
      );
      setTasksVersion((v) => v + 1);
    },
    [allTasks, showToast],
  );

  const handleUpdateContact = useCallback(
    (taskId: string, contactInfo: ContactUpdateData) => {
      console.log("Updating contact info for task:", taskId, contactInfo);
      const task = allTasks.find((t) => t.taskId === taskId);
      showToast(
        `Contact info updated for ${task?.providerIdentifier || "provider"}`,
        "success",
      );
      setTasksVersion((v) => v + 1);
    },
    [allTasks, showToast],
  );

  const handleSendSelfService = useCallback(
    (taskId: string, method: "email" | "sms") => {
      console.log("Sending self-service link:", taskId, method);
      const task = allTasks.find((t) => t.taskId === taskId);
      showToast(
        `Self-service portal link sent via ${method} to ${task?.providerIdentifier || "provider"}`,
        "success",
      );
      setTasksVersion((v) => v + 1);
    },
    [allTasks, showToast],
  );

  // Handle saving QA reviews
  const handleSaveQAReview = useCallback(
    (data: QAReviewFormData & { callId: string; recordingId: string }) => {
      const { callId, recordingId, reviewId, criteriaScores } = data;

      // Calculate overall score from criteria scores (scores are already 0-10)
      const totalWeight = criteriaScores.reduce((sum, s) => sum + s.weight, 0);
      const weightedSum = criteriaScores.reduce((sum, s) => sum + (s.score * s.weight), 0);
      const overallScore = Math.round((weightedSum / totalWeight) * 10) / 10;

      // Check if this is an update or create
      if (reviewId) {
        // Update existing review
        setQaReviewsMap((prev) => {
          const newMap: Record<string, QAReview[]> = {};
          for (const [key, reviews] of Object.entries(prev)) {
            if (key === callId) {
              newMap[key] = reviews.map((r) =>
                r.reviewId === reviewId
                  ? {
                      ...r,
                      overallScore,
                      status: data.status,
                      criteriaScores: criteriaScores.map((s) => ({
                        criterion: s.criterion,
                        score: s.score,
                        weight: s.weight,
                        notes: s.comment,
                      })),
                      strengths: data.strengths,
                      improvementAreas: data.improvementAreas,
                      actionItems: data.actionItems,
                      finalDisposition: data.finalDisposition,
                      reviewedAt: new Date().toISOString(), // Update reviewed time
                    }
                  : r
              );
            } else {
              newMap[key] = reviews;
            }
          }
          return newMap;
        });
        showToast("QA review updated successfully", "success");
      } else {
        // Create a new QAReview
        const newReview: QAReview = {
          reviewId: `review-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          callId,
          recordingId,
          reviewedBy: "current-user", // In production, this would come from auth context
          reviewedByName: "You",
          reviewedAt: new Date().toISOString(),
          overallScore,
          status: data.status,
          criteriaScores: criteriaScores.map((s) => ({
            criterion: s.criterion,
            score: s.score, // Already on 0-10 scale
            weight: s.weight,
            notes: s.comment,
          })),
          strengths: data.strengths,
          improvementAreas: data.improvementAreas,
          actionItems: data.actionItems,
          finalDisposition: data.finalDisposition,
        };

        // Add to reviews map
        setQaReviewsMap((prev) => ({
          ...prev,
          [callId]: [...(prev[callId] || []), newReview],
        }));
        showToast("QA review saved successfully", "success");
      }
    },
    [showToast],
  );

  // Handle deleting QA reviews
  const handleDeleteQAReview = useCallback(
    (reviewId: string) => {
      // Find and remove the review from the map
      setQaReviewsMap((prev) => {
        const newMap: Record<string, QAReview[]> = {};
        for (const [callId, reviews] of Object.entries(prev)) {
          newMap[callId] = reviews.filter((r) => r.reviewId !== reviewId);
        }
        return newMap;
      });
      showToast("QA review deleted", "success");
    },
    [showToast],
  );

  // Handle all row actions
  const handleRowAction = useCallback(
    async (action: string, task: OutreachTask) => {
      switch (action) {
        case "view_details":
          setSelectedTaskId(task.taskId);
          setIsDetailsDrawerOpen(true);
          break;
        case "explainability":
          setSelectedTaskId(task.taskId);
          setIsDetailsDrawerOpen(true);
          break;
        case "retry":
          showToast(
            `Retry initiated for ${task.providerIdentifier}`,
            "success",
          );
          break;
        case "switch_method":
          showToast(
            `Switched from ${task.currentMethod} to HUMAN_CALL`,
            "success",
          );
          break;
        case "send_self_service":
          setModalTask(task);
          setIsSendSelfServiceModalOpen(true);
          break;
        case "mark_unreachable":
          showToast(
            `Provider ${task.providerIdentifier} marked as unreachable`,
            "success",
          );
          break;
        case "close_partial":
          showToast(
            `Task closed with partial info for ${task.providerIdentifier}`,
            "success",
          );
          break;
        case "add_note":
          setModalTask(task);
          setIsAddNoteModalOpen(true);
          break;
        case "update_contact":
          setModalTask(task);
          setIsUpdateContactModalOpen(true);
          break;
        default:
          console.log("Unknown action:", action);
      }
    },
    [handleOpenConfigDrawer, showToast],
  );

  // Handle bulk actions
  const handleBulkAction = useCallback(
    async (action: string, data?: any) => {
      const count = selectedTaskIds.length;
      switch (action) {
        case "reassign":
          showToast(
            `Reassigned ${count} task(s) to ${data?.targetId || "queue"}`,
            "success",
          );
          handleClearSelection();
          break;
        case "escalate":
          showToast(
            `Escalated ${count} task(s) to ${data?.targetQueue || "supervisor"}`,
            "success",
          );
          handleClearSelection();
          break;
        case "pause":
          showToast(
            `Paused ${count} task(s) for ${data?.ttlHours || 24} hours`,
            "success",
          );
          handleClearSelection();
          break;
        case "retry_bulk":
          showToast(`Retry triggered for ${count} task(s)`, "success");
          handleClearSelection();
          break;
        default:
          console.log("Unknown bulk action:", action);
      }
    },
    [selectedTaskIds, handleClearSelection, showToast],
  );

  // Get task details - use useMemo to avoid recalculating on every render
  const taskDetails = useMemo(
    () =>
      selectedTaskId ? allTasks.find((t) => t.taskId === selectedTaskId) : null,
    [selectedTaskId, allTasks],
  );

  const details = useMemo(
    () =>
      taskDetails ? (getMockTaskDetails(taskDetails.taskId) ?? null) : null,
    [taskDetails],
  );

  const explainability = useMemo(
    () =>
      taskDetails ? (getMockExplainability(taskDetails.taskId) ?? null) : null,
    [taskDetails],
  );

  const recordings = useMemo(
    () => (selectedTaskId ? getMockCallRecordings(selectedTaskId) : []),
    [selectedTaskId],
  );

  const transcripts = useMemo(
    () => (selectedTaskId ? getMockCallTranscripts(selectedTaskId) : []),
    [selectedTaskId],
  );

  const callAnalysis = useMemo(
    () => (selectedTaskId ? getMockCallAnalysis(selectedTaskId) : []),
    [selectedTaskId],
  );

  const qaReviews = useMemo(
    () => {
      if (!selectedTaskId) return [];
      // Get mock reviews + any user-created reviews
      const mockReviews = getMockQAReviews(selectedTaskId);
      const savedReviews = qaReviewsMap[selectedTaskId] || [];
      return [...mockReviews, ...savedReviews];
    },
    [selectedTaskId, qaReviewsMap],
  );

  // Ensure drawer is closed if no valid details (prevent "No details available" state)
  React.useEffect(() => {
    if (isDetailsDrawerOpen && !details && !explainability) {
      setIsDetailsDrawerOpen(false);
      setSelectedTaskId(null);
    }
  }, [isDetailsDrawerOpen, details, explainability]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Call Monitoring & QA
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review call recordings, transcriptions, and quality assurance for
              manager, supervisor, and QA teams
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/outreach/queue-management"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Target className="w-4 h-4" />
              Campaign Dashboard
            </a>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by call ID, provider, agent, phone number..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
                activeFilterCount > 0
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-violet-600 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {isFilterOpen && (
              <OutreachFilterPopup
                filters={filters}
                onUpdateFilter={updateFilter}
                onClearFilters={clearFilters}
                onClose={() => setIsFilterOpen(false)}
              />
            )}
          </div>
        </div>
      </header>

      {/* Summary KPI Cards */}
      <div className="px-6 pt-6">
        <OutreachSummaryCards
          summary={summary}
          isLoading={false}
          filteredTaskCount={filteredTasks.length}
        />
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedTaskIds.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedTaskIds.length} call
              {selectedTaskIds.length !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSelection}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear selection
              </button>
              <div className="h-4 w-px bg-blue-300" />
              <OutreachBulkActions
                selectedCount={selectedTaskIds.length}
                onClearSelection={handleClearSelection}
                onAction={handleBulkAction}
                userRole={CURRENT_USER_ROLE}
                isActionInProgress={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <OutreachWorklistTable
            tasks={sortedTasks}
            isLoading={false}
            selectedTaskIds={selectedTaskIds}
            onSelectTask={handleSelectTask}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onRowClick={handleRowClick}
            userRole={CURRENT_USER_ROLE}
            onRowAction={handleRowAction}
          />

          {/* Pagination */}
          {total > 0 && (
            <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, total)}</span>{" "}
                of <span className="font-medium">{total.toLocaleString()}</span>{" "}
                calls
                {selectedTaskIds.length > 0 && (
                  <span className="ml-3 text-violet-600">
                    ({selectedTaskIds.length} selected)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-violet-600 text-white"
                            : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 text-gray-400">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Drawer */}
      {isDetailsDrawerOpen && (details || explainability) && (
        <OutreachDetailsDrawer
          isOpen={isDetailsDrawerOpen}
          onClose={handleCloseDetailsDrawer}
          details={details}
          explainability={explainability}
          isLoading={false}
          recordings={recordings}
          transcripts={transcripts}
          callAnalysis={callAnalysis}
          qaReviews={qaReviews}
          callId={selectedTaskId ?? undefined}
          onSaveReview={handleSaveQAReview}
          onDeleteReview={handleDeleteQAReview}
        />
      )}

      {/* Config Drawer */}
      <OutreachConfigDrawer
        isOpen={isConfigDrawerOpen}
        onClose={handleCloseConfigDrawer}
        task={editingTask}
        onSave={handleSaveConfig}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        task={modalTask}
        onClose={() => {
          setIsAddNoteModalOpen(false);
          setModalTask(null);
        }}
        onSave={handleAddNote}
      />

      {/* Update Contact Modal */}
      <UpdateContactModal
        isOpen={isUpdateContactModalOpen}
        task={modalTask}
        onClose={() => {
          setIsUpdateContactModalOpen(false);
          setModalTask(null);
        }}
        onSave={handleUpdateContact}
      />

      {/* Send Self-Service Modal */}
      <SendSelfServiceModal
        isOpen={isSendSelfServiceModalOpen}
        task={modalTask}
        onClose={() => {
          setIsSendSelfServiceModalOpen(false);
          setModalTask(null);
        }}
        onSend={handleSendSelfService}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8 12.414l-1.293 1.293a1 1 0 101.414 1.414l2-2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
