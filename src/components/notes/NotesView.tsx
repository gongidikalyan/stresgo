import React, { useState } from 'react';
import {
  BookOpen,
  Send,
  Trash2,
  ChevronLeft,
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { JournalEntry } from '../../types';

interface NotesViewProps {
  onBackToHome?: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onBackToHome }) => {
  const [entries, setEntries] = useState<JournalEntry[]>(
    storageService.getJournalEntries()
  );
  const [newContent, setNewContent] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    storageService.addJournalEntry('Gratitude Reflection', newContent.trim());
    setEntries(storageService.getJournalEntries());
    setNewContent('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleDelete = (id: string) => {
    storageService.deleteJournalEntry(id);
    setEntries(storageService.getJournalEntries());
  };

  return (
    <div className="pb-28 md:pb-16 max-w-xl mx-auto px-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-xl text-[#827666] hover:text-[#244C3A]"
              aria-label="Back"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h1 className="font-serif text-2xl font-medium text-[#244C3A]">
            Private Notes
          </h1>
        </div>
      </div>

      {/* New Reflection Form */}
      <form onSubmit={handleSave} className="p-4 rounded-3xl bg-[#EDE9DC]/60 border border-[#91A88C]/30 space-y-3">
        <textarea
          rows={3}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Capture a quiet thought or moment of gratitude..."
          className="w-full p-3.5 rounded-2xl bg-white border border-[#91A88C]/40 text-xs text-[#27332C] focus:outline-none focus:border-[#244C3A] resize-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#827666]">
            Stored only on this device.
          </span>

          <button
            type="submit"
            disabled={!newContent.trim()}
            className="px-4 py-2 rounded-full bg-[#244C3A] disabled:opacity-40 hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium flex items-center gap-1.5 shadow-sm"
          >
            <span>Save note</span>
            <Send size={12} />
          </button>
        </div>

        {savedNotice && (
          <p className="text-xs text-emerald-800 font-medium text-center">
            Saved to your notes.
          </p>
        )}
      </form>

      {/* Notes List */}
      <div className="space-y-2.5">
        {entries.length === 0 ? (
          <div className="text-center py-8 space-y-1 text-[#827666]">
            <BookOpen size={24} className="mx-auto opacity-50 mb-2" />
            <p className="font-serif text-sm">No notes yet.</p>
            <p className="text-xs">Write a thought above whenever you pause.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-2xl bg-[#EDE9DC]/50 border border-[#91A88C]/25 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] text-[#827666]">
                <span className="font-mono">{entry.date}</span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-[#827666] hover:text-red-700"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="text-xs text-[#27332C] leading-relaxed italic bg-white/70 p-3 rounded-xl border border-[#91A88C]/20">
                "{entry.content}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
