import React from 'react';
import { X } from 'lucide-react';
import { StressToolId } from '../../types';
import { StressToolsView } from './StressToolsView';

interface StressToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToolId?: StressToolId;
}

export const StressToolsModal: React.FC<StressToolsModalProps> = ({
  isOpen,
  onClose,
  initialToolId = 'teddy_bop',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[92vh] bg-[#F7F5EE] rounded-3xl shadow-2xl border border-[#91A88C]/30 overflow-y-auto flex flex-col relative"
        role="dialog"
        aria-modal="true"
        aria-label="Stress Relief Tools"
      >
        {/* Sticky Close Button */}
        <div className="sticky top-0 z-20 bg-[#F7F5EE]/95 backdrop-blur-md px-4 py-3 border-b border-[#91A88C]/20 flex items-center justify-between">
          <span className="font-serif text-base font-medium text-[#244C3A]">
            Stress Go Tools
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#827666] hover:text-[#244C3A] hover:bg-[#EDE9DC]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Embedded Stress Tools View */}
        <div className="p-2 sm:p-3">
          <StressToolsView initialToolId={initialToolId} />
        </div>
      </div>
    </div>
  );
};
