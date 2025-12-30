import { useEffect } from 'react';
import { Business } from '@/types/business';

interface UseKeyboardShortcutsProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
  onBuild?: () => void;
}

export function useKeyboardShortcuts({
  businesses,
  selectedBusiness,
  onSelectBusiness,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const currentIndex = selectedBusiness
        ? businesses.findIndex((b) => b.id === selectedBusiness.id)
        : -1;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            onSelectBusiness(businesses[currentIndex - 1]);
          } else if (businesses.length > 0) {
            onSelectBusiness(businesses[businesses.length - 1]);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < businesses.length - 1) {
            onSelectBusiness(businesses[currentIndex + 1]);
          } else if (businesses.length > 0) {
            onSelectBusiness(businesses[0]);
          }
          break;

        case 'Escape':
          // Could be used to deselect
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [businesses, selectedBusiness, onSelectBusiness]);
}
