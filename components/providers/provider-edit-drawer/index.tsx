"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Save,
  RotateCcw,
  User,
  MapPin,
  Award,
  GraduationCap,
  CreditCard,
  FileCheck,
  Building2,
  Shield,
  FileText,
  Loader2,
} from "lucide-react";
import type { Provider, FieldConfig } from "@/lib/provider-types";
import {
  useProviderEditState,
  useTabSearch,
} from "@/lib/hooks/use-provider-edit-state";
import { DEFAULT_RECORD_VALUES } from "./types";
import { generateId } from "@/lib/utils/deep-utils";

// Tab Components
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { LocationsTab } from "./tabs/locations-tab";
import { SpecialtiesTab } from "./tabs/specialties-tab";
import { EducationTab } from "./tabs/education-tab";
import { MedicareTab } from "./tabs/medicare-tab";
import { LicensesTab } from "./tabs/licenses-tab";
import { AffiliationsTab } from "./tabs/affiliations-tab";
import { MalpracticeTab } from "./tabs/malpractice-tab";
import { DocumentsTab } from "./tabs/documents-tab";

// Shared Components
import { AddRecordModal } from "./add-record-modal";
import {
  DeleteConfirmation,
  UnsavedChangesDialog,
} from "./confirmation-dialog";

interface ProviderEditDrawerProps {
  provider: Provider;
  fieldConfig: FieldConfig[];
  onClose: () => void;
  onSave: (provider: Provider) => void;
}

const TAB_CONFIG = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "specialties", label: "Specialties", icon: Award },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "medicare", label: "Medicare", icon: CreditCard },
  { id: "licenses", label: "Licenses", icon: FileCheck },
  { id: "affiliations", label: "Affiliations", icon: Building2 },
  { id: "malpractice", label: "Malpractice", icon: Shield },
  { id: "documents", label: "Documents", icon: FileText },
];

export function ProviderEditDrawer({
  provider,
  fieldConfig,
  onClose,
  onSave,
}: ProviderEditDrawerProps) {
  const editState = useProviderEditState(provider);
  const { editedProvider, isDirty, revertAll, addArrayItem, removeArrayItem } =
    editState;

  const [activeTab, setActiveTab] = useState("basic");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [addRecordModal, setAddRecordModal] = useState<{
    isOpen: boolean;
    recordType: string;
    parentPath?: string;
  }>({ isOpen: false, recordType: "" });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    path: string;
    index: number;
    name: string;
  }>({ isOpen: false, path: "", index: -1, name: "" });

  const [unsavedDialog, setUnsavedDialog] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty) handleSave();
      }

      // Escape to close
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDirty]);

  const handleClose = useCallback(() => {
    if (isDirty) {
      setUnsavedDialog(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleSave = useCallback(async () => {
    // Validate required fields
    const errors: Record<string, string> = {};

    if (!editedProvider.firstName?.trim()) {
      errors.firstName = "First name is required";
    }
    if (!editedProvider.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!editedProvider.npi) {
      errors.npi = "NPI is required";
    } else if (String(editedProvider.npi).length !== 10) {
      errors.npi = "NPI must be 10 digits";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setActiveTab("basic"); // Switch to basic tab to show errors
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSave(editedProvider);
    } catch (error) {
      console.error("Error saving provider:", error);
    } finally {
      setIsSaving(false);
    }
  }, [editedProvider, onSave]);

  const handleAddRecord = useCallback(
    (recordType: string, parentPath?: string) => {
      setAddRecordModal({ isOpen: true, recordType, parentPath });
    },
    [],
  );

  const handleAddRecordSubmit = useCallback(
    (record: Record<string, unknown>) => {
      const { recordType, parentPath } = addRecordModal;

      // Determine the full path for the array
      let arrayPath: string;

      if (parentPath) {
        // Adding to a nested array (e.g., health plan within address)
        arrayPath = `${parentPath}.healthPlan`;
      } else if (recordType.includes(".")) {
        // License types like license.DEA
        arrayPath = recordType;
      } else if (recordType === "specialty") {
        arrayPath = "specialties";
      } else if (recordType === "education") {
        arrayPath = "educations";
      } else if (recordType === "affiliation") {
        arrayPath = "affiliations";
      } else {
        arrayPath = recordType;
      }

      // Ensure record has an ID
      const recordWithId = {
        ...record,
        id: record.id || generateId(),
      };

      addArrayItem(arrayPath, recordWithId);
      setAddRecordModal({ isOpen: false, recordType: "" });
    },
    [addRecordModal, addArrayItem],
  );

  const handleDeleteRecord = useCallback(
    (path: string, index: number, name: string) => {
      setDeleteConfirm({ isOpen: true, path, index, name });
    },
    [],
  );

  const handleDeleteConfirm = useCallback(() => {
    const { path, index } = deleteConfirm;
    removeArrayItem(path, index);
    setDeleteConfirm({ isOpen: false, path: "", index: -1, name: "" });
  }, [deleteConfirm, removeArrayItem]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <BasicInfoTab
            editState={editState}
            validationErrors={validationErrors}
          />
        );

      case "locations":
        return (
          <LocationsTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case "specialties":
        return (
          <SpecialtiesTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case "education":
        return (
          <EducationTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case "medicare":
        return (
          <MedicareTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case "licenses":
        return (
          <LicensesTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case "affiliations":
        return (
          <AffiliationsTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case "malpractice":
        return (
          <MalpracticeTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case "documents":
        return (
          <DocumentsTab
            providerId={editedProvider.provider_Id}
            providerName={`${editedProvider.firstName} ${editedProvider.lastName}`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-7xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-400">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-violet-700">
                {editedProvider.firstName?.[0] || ""}
                {editedProvider.lastName?.[0] || ""}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Provider: {editedProvider.firstName}{" "}
                {editedProvider.lastName}
              </h2>
              <p className="text-sm text-gray-500">
                NPI: {editedProvider.npi} • ID: {editedProvider.provider_Id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {editState.modifiedFields.size} unsaved changes
              </span>
            )}
            <button
              onClick={revertAll}
              disabled={!isDirty}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Revert all changes (Ctrl+Z)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50/50">
          <nav className="flex gap-0.5 overflow-hidden px-1">
            {TAB_CONFIG.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-1.5 px-2 py-2.5 text-sm font-medium border-b-2 transition-colors rounded-t-lg flex-1 min-w-0 ${
                    isActive
                      ? "text-violet-700 border-violet-600 bg-white"
                      : "text-gray-500 border-gray-200 hover:text-gray-700 hover:bg-white/50"
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
          {/* Bottom border - positioned behind active tab */}
          <div className="h-px bg-gray-200 -mt-px relative z-0" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderTabContent()}</div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">
              Ctrl+S
            </kbd>{" "}
            to save •{" "}
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">
              Esc
            </kbd>{" "}
            to close
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={revertAll}
              disabled={!isDirty}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Revert All
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={addRecordModal.isOpen}
        onClose={() => setAddRecordModal({ isOpen: false, recordType: "" })}
        recordType={addRecordModal.recordType}
        parentPath={addRecordModal.parentPath}
        onAdd={handleAddRecordSubmit}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, path: "", index: -1, name: "" })
        }
        onConfirm={handleDeleteConfirm}
        itemType={deleteConfirm.path.split(".")[0]}
        itemName={deleteConfirm.name}
      />

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={unsavedDialog}
        onClose={() => setUnsavedDialog(false)}
        onDiscard={onClose}
        onSave={() => {
          handleSave();
          setUnsavedDialog(false);
        }}
        changeCount={editState.modifiedFields.size}
      />
    </div>
  );
}

// Re-export for backward compatibility
export { ProviderEditDrawer as default };
