'use client';

import React from 'react';
import {
  User,
  Building2,
  MapPin,
  CheckCircle,
  Copy,
  Award,
  Shield,
} from 'lucide-react';
import type { Provider } from '@/lib/provider-types';

// State ID to state name mapping
const STATE_MAP: Record<number, string> = {
  1: 'AL', 2: 'AK', 3: 'AZ', 4: 'AR', 5: 'CA', 6: 'CO', 7: 'CT', 8: 'DE', 9: 'FL',
  10: 'GA', 11: 'HI', 12: 'ID', 13: 'IL', 14: 'IN', 15: 'IA', 16: 'KS', 17: 'KY',
  18: 'LA', 19: 'LA', 20: 'ME', 21: 'MD', 22: 'MA', 23: 'MI', 24: 'MN', 25: 'MS',
  26: 'MO', 27: 'MT', 28: 'NE', 29: 'NV', 30: 'NH', 31: 'NJ', 32: 'NM', 33: 'NY',
  34: 'NC', 35: 'ND', 36: 'OH', 37: 'OK', 38: 'OR', 39: 'PA', 40: 'RI', 41: 'SC',
  42: 'SD', 43: 'TN', 44: 'TX', 45: 'UT', 46: 'VT', 47: 'VA', 48: 'WA', 49: 'WV',
  50: 'WI', 51: 'WY',
};

interface CallerInfoPanelProps {
  className?: string;
  provider?: Provider | null;
}

export function CallerInfoPanel({ className = '', provider }: CallerInfoPanelProps) {
  // When provider is available from mock-provider-data.ts, use it exclusively
  // This ensures consistency with ProviderFormPanel
  if (!provider) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 px-3 py-2 ${className}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <User className="w-4 h-4" />
          <span className="text-xs">No provider info - Start a call</span>
        </div>
      </div>
    );
  }

  // Build display data from provider only (consistent with form)
  const displayName = `${provider.firstName} ${provider.middleName ? provider.middleName + ' ' : ''}${provider.lastName}`.trim();
  const displayNpi = provider.npi?.toString() || '';
  const displayOrganization = provider.groupEntity || provider.basicInfo?.cumc_department || '';
  const displaySpecialty = provider.specialties?.[0]?.name || provider.basicInfo?.degree_description || '';
  const displayDegree = provider.basicInfo?.degree || '';
  const displayCity = provider.address?.[0]?.city || '';
  const displayState = provider.address?.[0]?.stateId
    ? (STATE_MAP[provider.address[0].stateId] || '')
    : '';
  const displayAddress = provider.address?.[0]
    ? `${provider.address[0].addressLineFirst}${provider.address[0].addressLineSecond ? ', ' + provider.address[0].addressLineSecond : ''}`
    : '';

  // Get initials for avatar
  const initials = displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(-2)
    .toUpperCase() || 'DR';

  const fullLocation = [displayCity, displayState].filter(Boolean).join(', ');

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      <div className="p-3 sm:p-4">
        {/* Header: Avatar + Name + Badges */}
        <div className="flex items-start gap-2 sm:gap-3 mb-3">
          {/* Avatar */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm sm:text-base font-bold text-white">{initials}</span>
          </div>

          {/* Name and Badges */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{displayName}</h3>
              {displayDegree && (
                <span className="inline-flex items-center px-2 py-0.5 bg-violet-50 rounded text-xs text-violet-700 font-medium">
                  {displayDegree}
                </span>
              )}
              {provider.basicInfo?.cred_approval_status && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  provider.basicInfo.cred_approval_status === 'APPROVED'
                    ? 'bg-green-100 text-green-700'
                    : provider.basicInfo.cred_approval_status === 'PENDING'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {provider.basicInfo.cred_approval_status === 'APPROVED' ? 'Approved' : provider.basicInfo.cred_approval_status}
                </span>
              )}
            </div>
            {displayOrganization && (
              <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{displayOrganization}</span>
              </div>
            )}
          </div>

          {/* Provider ID */}
          {provider.provider_Id && (
            <div className="flex-shrink-0 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
              ID: {provider.provider_Id}
            </div>
          )}
          
        </div>

        {/* Details Grid - 1 column on mobile, 4 on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
          {/* NPI */}
          {displayNpi && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-500 truncate">NPI:</span>
              <span className="font-semibold text-gray-900 truncate">{displayNpi}</span>
              <CopyButton value={displayNpi} />
            </div>
          )}

          {/* Specialty */}
          {displaySpecialty && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Award className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 truncate">{displaySpecialty}</span>
              <CopyButton value={displaySpecialty} />
            </div>
          )}

          {/* Location */}
          {fullLocation && (
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 truncate">{fullLocation}</span>
              <CopyButton value={fullLocation} />
            </div>
          )}

          {/* Provider Type */}
          {provider.providerType && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                {provider.providerType}
              </span>
            </div>
          )}
        </div>

        {/* Full Address - Full width below the grid */}
        {/* {displayAddress && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100 min-w-0">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 truncate">{displayAddress}</span>
            <CopyButton value={displayAddress} />
          </div>
        )} */}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors flex-shrink-0"
      title="Copy"
    >
      {copied ? (
        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export default CallerInfoPanel;
