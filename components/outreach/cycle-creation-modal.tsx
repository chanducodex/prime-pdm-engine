// ============================================================================
// Cycle Creation Modal - Filter Provider Data
// ============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { mockFilterAPIResponse, transformFilterAPIResponse } from '@/lib/provider-mock-data';

interface FilterOption {
  id: number | string;
  name: string;
}

interface FilterColumn {
  filter_key: string;
  filter_display_name: string;
  filter_data: FilterOption[];
  filter_value: string;
}

interface FilterConfig {
  category: string;
  control_type?: string;
  is_required?: boolean;
  filter_columns: FilterColumn[];
}

interface SelectedFilters {
  [key: string]: string[] | boolean;
}

interface CycleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    cycleName: string;
    selectedFilters: SelectedFilters;
    includeAll: boolean;
  }) => void;
  mode?: 'create' | 'view';
  viewData?: {
    cycleName: string;
    selectedFilters: SelectedFilters;
    includeAll: boolean;
  };
}

export const CycleCreationModal: React.FC<CycleCreationModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  mode = 'create',
  viewData,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [cycleName, setCycleName] = useState('');
  const [includeAll, setIncludeAll] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const filterConfigs = transformFilterAPIResponse(mockFilterAPIResponse);

  // Load view data when mode changes or viewData changes
  useEffect(() => {
    if (mode === 'view' && viewData) {
      setCycleName(viewData.cycleName);
      setIncludeAll(viewData.includeAll);
      setSelectedFilters(viewData.selectedFilters);
    } else if (mode === 'create' && isOpen) {
      // Reset form when opening in create mode
      setCycleName('');
      setIncludeAll(true);
      setSelectedFilters({});
      setSearchTerms({});
    }
  }, [mode, viewData, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close all dropdowns first, then the popup if no dropdowns are open
        if (Object.values(openDropdowns).some(isOpen => isOpen)) {
          setOpenDropdowns({});
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, openDropdowns]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdowns({});
      }
    };

    if (Object.values(openDropdowns).some(isOpen => isOpen)) {
      document.addEventListener('mousedown', handleDocumentClick);
      return () => document.removeEventListener('mousedown', handleDocumentClick);
    }
  }, [openDropdowns]);

  const toggleDropdown = (category: string) => {
    setOpenDropdowns((prev) => {
      // Close all other dropdowns and toggle the current one
      const newState: Record<string, boolean> = {};
      newState[category] = !prev[category];
      return newState;
    });
  };

  const handleCheckboxChange = (filterKey: string, optionId: number | string, checked: boolean) => {
    // Handle boolean filters (Location Status, Wheelchair Access)
    if (filterKey === 'locationStatus' || filterKey === 'wheelChairAccess') {
      setSelectedFilters((prev) => ({
        ...prev,
        [filterKey]: checked,
      }));
      return;
    }

    // Handle array-based filters
    setSelectedFilters((prev) => {
      const current = prev[filterKey] as string[] || [];
      const optionStr = String(optionId);

      if (checked) {
        return { ...prev, [filterKey]: [...current, optionStr] };
      } else {
        return { ...prev, [filterKey]: current.filter((id: string) => id !== optionStr) };
      }
    });
  };

  const getFilteredOptions = (category: FilterConfig, searchTerm: string) => {
    const options = category.filter_columns[0].filter_data;
    if (!searchTerm) return options;

    const search = searchTerm.toLowerCase();
    return options.filter((option) =>
      option.name?.toLowerCase().includes(search)
    );
  };

  const handleCreate = () => {
    if (!cycleName.trim()) return;

    onCreate({
      cycleName: cycleName.trim(),
      selectedFilters: includeAll ? {} : selectedFilters,
      includeAll,
    });

    // Reset form
    setCycleName('');
    setIncludeAll(true);
    setSelectedFilters({});
    setOpenDropdowns({});
    setSearchTerms({});
  };

  const handleCancel = () => {
    setCycleName('');
    setIncludeAll(true);
    setSelectedFilters({});
    setOpenDropdowns({});
    setSearchTerms({});
    onClose();
  };

  const getSelectedCount = (filterKey: string) => {
    const value = selectedFilters[filterKey];
    if (typeof value === 'boolean') return value ? 1 : 0;
    return value?.length || 0;
  };

  const activeFilterCount = Object.values(selectedFilters).reduce((acc, vals) => {
    if (typeof vals === 'boolean') return acc + (vals ? 1 : 0);
    return acc + vals.length;
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={popupRef}
        className="relative max-w-2xl w-full mx-4 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-[95vh] overflow-hidden flex flex-col"
      >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">
            {mode === 'view' ? 'Cycle Details' : 'Create New Cycle'}
          </h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-violet-700 bg-violet-100 rounded-full">
              {activeFilterCount} filters
            </span>
          )}
        </div>
        <button onClick={handleCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[750px] overflow-y-auto">
        {/* Cycle Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cycle Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={cycleName}
            onChange={(e) => setCycleName(e.target.value)}
            placeholder="e.g., Q1 2025 CA Provider Verification"
            disabled={mode === 'view'}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white disabled:bg-gray-50 disabled:text-gray-600"
          />
        </div>

        {/* Data Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider Data Selection
          </label>
          <div className="space-y-2">
            <label className={`flex items-center gap-2 ${mode === 'view' ? 'cursor-default' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name="dataSelection"
                checked={includeAll}
                onChange={() => mode !== 'view' && setIncludeAll(true)}
                disabled={mode === 'view'}
                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-gray-700">Include All Providers</span>
            </label>
            <label className={`flex items-center gap-2 ${mode === 'view' ? 'cursor-default' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name="dataSelection"
                checked={!includeAll}
                onChange={() => mode !== 'view' && setIncludeAll(false)}
                disabled={mode === 'view'}
                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-gray-700">Filter Specific Data</span>
            </label>
          </div>
        </div>

        {/* Filters Grid - Only show when not including all */}
        {!includeAll && (
          <div className="grid grid-cols-2 gap-4">
            {filterConfigs.map((category) => {
              const filterKey = category.filter_columns[0].filter_key;
              const currentValues = (selectedFilters[filterKey] as string[]) || [];
              const searchTerm = searchTerms[category.category] || '';
              const filteredOptions = getFilteredOptions(category, searchTerm);
              const totalOptions = category.filter_columns[0].filter_data.length;
              const showSearch = totalOptions > 6;
              const isOpen = openDropdowns[category.category];

              return (
                <div key={category.category}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    {category.category}
                    {category.is_required && (
                      <span className="text-red-500" title="Required">*</span>
                    )}
                  </h4>

                  {category.control_type === 'checkbox' ? (
                    // Single Checkbox for boolean filters
                    <label className={`flex items-center gap-2 ${mode === 'view' ? 'cursor-default' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={!!selectedFilters[category.category === 'Location Status' ? 'locationStatus' : 'wheelChairAccess']}
                        onChange={(e) => mode !== 'view' && handleCheckboxChange(category.category === 'Location Status' ? 'locationStatus' : 'wheelChairAccess', 'Yes', e.target.checked)}
                        disabled={mode === 'view'}
                        className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700">
                        {category.category === 'Wheelchair Access' ? 'Wheelchair Accessible' : 'Active Locations'}
                      </span>
                    </label>
                  ) : (
                    // Custom Multiselect Dropdown
                    <div className="relative dropdown-container">
                      {/* Dropdown Trigger */}
                      <button
                        type="button"
                        onClick={() => mode !== 'view' && toggleDropdown(category.category)}
                        disabled={mode === 'view'}
                        className={`w-full px-3 py-2 text-sm text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white flex items-center justify-between transition-colors ${
                          mode === 'view' ? 'border-gray-200 cursor-default' : 'hover:border-gray-300 cursor-pointer'
                        }`}
                      >
                        <span className={currentValues.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
                          {currentValues.length === 0
                            ? `Select ${category.category}`
                            : `${currentValues.length} selected`}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-hidden flex flex-col">
                          {/* Search for large lists */}
                          {showSearch && (
                            <div className="p-2 border-b border-gray-100">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerms({ ...searchTerms, [category.category]: e.target.value })}
                                  className="w-full pl-3 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          )}

                          {/* Options List */}
                          <div className="overflow-y-auto">
                            {filteredOptions
                              .filter((option) => option.name && option.name.trim() !== '')
                              .map((option) => (
                                <label
                                  key={option.id}
                                  className={`flex items-center gap-2 px-3 py-2 text-sm ${
                                    mode === 'view' ? 'cursor-default' : 'hover:bg-gray-50 cursor-pointer'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={currentValues.includes(String(option.id))}
                                    onChange={(e) => mode !== 'view' && handleCheckboxChange(filterKey, option.id, e.target.checked)}
                                    disabled={mode === 'view'}
                                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 disabled:cursor-not-allowed"
                                  />
                                  <span className="text-gray-700">{option.name}</span>
                                </label>
                              ))}
                          </div>

                          {showSearch && (
                            <div className="p-2 border-t border-gray-100 bg-gray-50">
                              <p className="text-xs text-gray-500">
                                {filteredOptions.filter((o) => o.name && o.name.trim()).length} of {totalOptions}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Selected Items Tags */}
                      {currentValues.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {currentValues.map((value) => {
                            const option = category.filter_columns[0].filter_data.find((o) => o.id === value);
                            if (!option) return null;

                            return (
                              <span
                                key={value}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 rounded"
                              >
                                {option.name}
                                {mode !== 'view' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCheckboxChange(filterKey, value, false);
                                    }}
                                    className="hover:text-violet-900"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Filters Summary */}
        {!includeAll && Object.keys(selectedFilters).length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-900 mb-2">Selected Filters Summary</h4>
            <div className="space-y-1">
              {Object.entries(selectedFilters).map(([key, values]) => {
                const filterConfig = filterConfigs
                  .flatMap((f) => f.filter_columns)
                  .find((col) => col.filter_key === key);

                if (!filterConfig) return null;

                // Handle boolean filters
                if (typeof values === 'boolean') {
                  if (!values) return null;
                  return (
                    <div key={key} className="text-xs">
                      <span className="font-medium text-blue-800">{filterConfig.filter_display_name}:</span>
                      <span className="text-blue-700 ml-2">Yes</span>
                    </div>
                  );
                }

                // Handle array filters
                if (values.length === 0) return null;

                return (
                  <div key={key} className="text-xs">
                    <span className="font-medium text-blue-800">{filterConfig.filter_display_name}:</span>
                    <span className="text-blue-700 ml-2">
                      {filterConfig.filter_data
                        .filter((opt) => values.includes(String(opt.id)))
                        .map((opt) => opt.name)
                        .join(', ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
        {mode === 'view' ? (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        ) : (
          <>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!cycleName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Cycle
            </button>
          </>
        )}
      </div>
    </div>
    </div>
  );
};
