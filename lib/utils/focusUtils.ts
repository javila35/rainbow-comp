import { RefObject } from 'react';

interface FocusableRef {
  focus: () => void;
}

export interface FocusManager {
  attemptFocus: (
    playerId: number,
    refs: RefObject<{ [key: number]: FocusableRef | null }>,
    maxAttempts?: number,
    baseDelay?: number
  ) => void;
  setStoredFocus: (playerId: number) => void;
  clearStoredFocus: () => void;
  getStoredFocus: () => number | null;
}

/**
 * Creates a focus manager for handling complex focus scenarios
 * Useful for maintaining focus after data updates or revalidations
 */
export function createFocusManager(): FocusManager {
  const STORAGE_KEY = "focusPlayerId";

  const attemptFocus = (
    playerId: number,
    refs: RefObject<{ [key: number]: FocusableRef | null }>,
    maxAttempts: number = 10,
    baseDelay: number = 100
  ) => {
    const tryFocus = (attempt: number) => {
      const ref = refs.current?.[playerId];
      if (ref && typeof ref.focus === "function") {
        ref.focus();
        clearStoredFocus();
      } else if (attempt < maxAttempts) {
        setTimeout(() => tryFocus(attempt + 1), attempt * baseDelay);
      } else {
        clearStoredFocus(); // Clean up after max attempts
      }
    };

    setTimeout(() => tryFocus(1), baseDelay);
  };

  const setStoredFocus = (playerId: number) => {
    localStorage.setItem(STORAGE_KEY, playerId.toString());
  };

  const clearStoredFocus = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const getStoredFocus = (): number | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : null;
  };

  return {
    attemptFocus,
    setStoredFocus,
    clearStoredFocus,
    getStoredFocus,
  };
}

/**
 * Hook-like function for managing focus with localStorage persistence
 */
export function useFocusWithPersistence(
  focusPlayerId: number | null,
  refs: RefObject<{ [key: number]: FocusableRef | null }>
) {
  const focusManager = createFocusManager();

  // Effect logic for handling stored focus (call this in useEffect)
  const handleStoredFocus = () => {
    const storedFocusId = focusManager.getStoredFocus();
    if (storedFocusId && !focusPlayerId) {
      focusManager.attemptFocus(storedFocusId, refs);
    }
  };

  // Effect logic for handling prop-based focus (call this in useEffect)
  const handlePropFocus = () => {
    if (focusPlayerId) {
      focusManager.attemptFocus(focusPlayerId, refs, 5, 200);
    }
  };

  return {
    handleStoredFocus,
    handlePropFocus,
    setStoredFocus: focusManager.setStoredFocus,
    clearStoredFocus: focusManager.clearStoredFocus,
  };
}
