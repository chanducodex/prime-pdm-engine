'use client';

import { useState, useCallback } from 'react';
import { X, Delete } from 'lucide-react';

interface DialPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDTMF: (digit: string) => void;
  onCall?: (phoneNumber: string) => void;
  showCallButton?: boolean;
}

const dialPadKeys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

const dialPadLabels: Record<string, string> = {
  '1': '',
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
  '0': '+',
  '*': '',
  '#': '',
};

export function DialPadModal({
  isOpen,
  onClose,
  onDTMF,
  onCall,
  showCallButton = false,
}: DialPadModalProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyPress = useCallback(
    (key: string) => {
      onDTMF(key);
      if (showCallButton) {
        setInputValue((prev) => prev + key);
      }
    },
    [onDTMF, showCallButton]
  );

  const handleBackspace = useCallback(() => {
    setInputValue((prev) => prev.slice(0, -1));
  }, []);

  const handleCall = useCallback(() => {
    if (onCall && inputValue) {
      onCall(inputValue);
      setInputValue('');
      onClose();
    }
  }, [onCall, inputValue, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Dial Pad</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input display (only for outbound calls) */}
        {showCallButton && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <input
                type="text"
                value={inputValue}
                readOnly
                placeholder="Enter number"
                className="flex-1 bg-transparent text-xl font-mono text-gray-900 outline-none"
              />
              {inputValue && (
                <button
                  onClick={handleBackspace}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dial pad grid */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {dialPadKeys.flat().map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="
                  flex flex-col items-center justify-center
                  h-16 rounded-xl
                  bg-gray-50 hover:bg-gray-100 active:bg-gray-200
                  transition-colors
                  focus:outline-none focus:ring-2 focus:ring-violet-500
                "
              >
                <span className="text-2xl font-semibold text-gray-900">{key}</span>
                {dialPadLabels[key] && (
                  <span className="text-[10px] tracking-widest text-gray-500 mt-0.5">
                    {dialPadLabels[key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Call button (only for outbound calls) */}
        {showCallButton && (
          <div className="px-4 pb-4">
            <button
              onClick={handleCall}
              disabled={!inputValue}
              className="
                w-full py-3.5 rounded-xl font-medium
                bg-green-500 hover:bg-green-600 active:bg-green-700
                text-white transition-colors
                disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              "
            >
              Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DialPadModal;
