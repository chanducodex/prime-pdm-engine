'use client';

import { useState, useCallback } from 'react';
import {
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
} from 'lucide-react';
import type { Provider, FieldConfig } from '@/lib/provider-types';
import { useProviderEditState } from '@/lib/hooks/use-provider-edit-state';
import { DEFAULT_RECORD_VALUES } from '@/components/providers/provider-edit-drawer/types';
import { generateId } from '@/lib/utils/deep-utils';

// Tab Components from provider-edit-drawer
import { BasicInfoTab } from '@/components/providers/provider-edit-drawer/tabs/basic-info-tab';
import { LocationsTab } from '@/components/providers/provider-edit-drawer/tabs/locations-tab';
import { SpecialtiesTab } from '@/components/providers/provider-edit-drawer/tabs/specialties-tab';
import { EducationTab } from '@/components/providers/provider-edit-drawer/tabs/education-tab';
import { MedicareTab } from '@/components/providers/provider-edit-drawer/tabs/medicare-tab';
import { LicensesTab } from '@/components/providers/provider-edit-drawer/tabs/licenses-tab';
import { AffiliationsTab } from '@/components/providers/provider-edit-drawer/tabs/affiliations-tab';
import { MalpracticeTab } from '@/components/providers/provider-edit-drawer/tabs/malpractice-tab';
import { DocumentsTab } from '@/components/providers/provider-edit-drawer/tabs/documents-tab';

// Shared Components
import { AddRecordModal } from '@/components/providers/provider-edit-drawer/add-record-modal';
import { DeleteConfirmation } from '@/components/providers/provider-edit-drawer/confirmation-dialog';

const TAB_CONFIG = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'specialties', label: 'Specialties', icon: Award },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'medicare', label: 'Medicare', icon: CreditCard },
  { id: 'licenses', label: 'Licenses', icon: FileCheck },
  { id: 'affiliations', label: 'Affiliations', icon: Building2 },
  { id: 'malpractice', label: 'Malpractice', icon: Shield },
  { id: 'documents', label: 'Documents', icon: FileText },
];

interface ProviderFormPanelProps {
  provider: Provider | null;
  isCallActive?: boolean;
  onSave?: (provider: Provider) => void;
}

export function ProviderFormPanel({ provider, isCallActive = false, onSave }: ProviderFormPanelProps) {
  // Default empty provider when no call is active
  const defaultProvider: Provider = {
    provider_Id: 0,
    npi: 0,
    firstName: '',
    lastName: '',
    middleName: '',
    providerType: '',
    groupEntity: '',
    basicInfo: {
      affiliation_status: '',
      cumc_division: '',
      initial_appr_date: '',
      degree_description: '',
      cred_approval_status: '',
      prior_appr_date: '',
      current_appr_date: '',
      date_hire: '',
      dateOfBirth: '',
      current_exp_date: '',
      fellow_y_n: '',
      genderTypeId: 0,
      caqhId: 0,
      degree: '',
      cumc_department: '',
      uni: '',
      id: 0,
    },
    medicare: [],
    license: {},
    specialties: [],
    affiliations: [],
    malpractice: [],
    educations: [],
    groupcollab: [],
    languages: [],
    billingAddress: [],
    address: [],
    wheelChairAccess: false,
  };

  const editState = useProviderEditState(provider || defaultProvider);
  const { editedProvider, isDirty, revertAll, addArrayItem, removeArrayItem } = editState;

  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [addRecordModal, setAddRecordModal] = useState<{
    isOpen: boolean;
    recordType: string;
    parentPath?: string;
  }>({ isOpen: false, recordType: '' });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    path: string;
    index: number;
    name: string;
  }>({ isOpen: false, path: '', index: -1, name: '' });

  const handleSave = useCallback(async () => {
    if (!onSave) return;

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!editedProvider.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!editedProvider.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!editedProvider.npi) {
      errors.npi = 'NPI is required';
    } else if (String(editedProvider.npi).length !== 10) {
      errors.npi = 'NPI must be 10 digits';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setActiveTab('basic');
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSave(editedProvider);
    } catch (error) {
      console.error('Error saving provider:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editedProvider, onSave]);

  const handleAddRecord = useCallback((recordType: string, parentPath?: string) => {
    setAddRecordModal({ isOpen: true, recordType, parentPath });
  }, []);

  const handleAddRecordSubmit = useCallback(
    (record: Record<string, unknown>) => {
      const { recordType, parentPath } = addRecordModal;

      // Determine the full path for the array
      let arrayPath: string;

      if (parentPath) {
        arrayPath = `${parentPath}.healthPlan`;
      } else if (recordType.includes('.')) {
        arrayPath = recordType;
      } else if (recordType === 'specialty') {
        arrayPath = 'specialties';
      } else if (recordType === 'education') {
        arrayPath = 'educations';
      } else if (recordType === 'affiliation') {
        arrayPath = 'affiliations';
      } else {
        arrayPath = recordType;
      }

      const recordWithId = {
        ...record,
        id: record.id || generateId(),
      };

      addArrayItem(arrayPath, recordWithId);
      setAddRecordModal({ isOpen: false, recordType: '' });
    },
    [addRecordModal, addArrayItem]
  );

  const handleDeleteRecord = useCallback((path: string, index: number, name: string) => {
    setDeleteConfirm({ isOpen: true, path, index, name });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    const { path, index } = deleteConfirm;
    removeArrayItem(path, index);
    setDeleteConfirm({ isOpen: false, path: '', index: -1, name: '' });
  }, [deleteConfirm, removeArrayItem]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicInfoTab editState={editState} validationErrors={validationErrors} />;

      case 'locations':
        return (
          <LocationsTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case 'specialties':
        return (
          <SpecialtiesTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case 'education':
        return (
          <EducationTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case 'medicare':
        return (
          <MedicareTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case 'licenses':
        return (
          <LicensesTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case 'affiliations':
        return (
          <AffiliationsTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case 'malpractice':
        return (
          <MalpracticeTab
            editState={editState}
            validationErrors={validationErrors}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        );

      case 'documents':
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

  // Empty state when no call is active
  if (!provider) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Provider Data</h3>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Start or simulate a call to load provider information. The form will be populated with
          caller details.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-violet-700">
              {editedProvider.firstName?.[0] || ''}
              {editedProvider.lastName?.[0] || ''}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {editedProvider.firstName} {editedProvider.lastName}
            </h3>
            <p className="text-xs text-gray-500">
              NPI: {editedProvider.npi} • ID: {editedProvider.provider_Id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {editState.modifiedFields.size} unsaved
            </span>
          )}
          {onSave && (
            <>
              <button
                onClick={revertAll}
                disabled={!isDirty}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Revert all changes"
              >
                Reload
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </>
          )}
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
                    ? 'text-violet-700 border-violet-600 bg-white'
                    : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:bg-white/50'
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
      <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto">{renderTabContent()}</div>

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={addRecordModal.isOpen}
        onClose={() => setAddRecordModal({ isOpen: false, recordType: '' })}
        recordType={addRecordModal.recordType}
        parentPath={addRecordModal.parentPath}
        onAdd={handleAddRecordSubmit}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, path: '', index: -1, name: '' })}
        onConfirm={handleDeleteConfirm}
        itemType={deleteConfirm.path.split('.')[0]}
        itemName={deleteConfirm.name}
      />
    </div>
  );
}
