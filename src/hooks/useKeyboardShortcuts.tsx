import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  callback: () => void;
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );

      if (isTyping) return;

      const matchingShortcut = shortcuts.find(shortcut => {
        const modifiersMatch = !shortcut.modifiers || (
          (!shortcut.modifiers.ctrl || event.ctrlKey) &&
          (!shortcut.modifiers.alt || event.altKey) &&
          (!shortcut.modifiers.shift || event.shiftKey) &&
          (!shortcut.modifiers.meta || event.metaKey)
        );

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                          event.code.toLowerCase() === shortcut.key.toLowerCase();

        return modifiersMatch && keyMatches;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

// Common keyboard shortcuts for the app
export const createAppShortcuts = (handlers: {
  onNewEnvelope: () => void;
  onStartChat: () => void;
  onSearch: () => void;
  onGoToDashboard: () => void;
  onGoToInbox: () => void;
  onGoToDrafts: () => void;
  onGoToArchive: () => void;
}) => [
  {
    key: 'n',
    callback: handlers.onNewEnvelope,
  },
  {
    key: 'c',
    callback: handlers.onStartChat,
  },
  {
    key: '/',
    callback: handlers.onSearch,
  },
  {
    key: '1',
    callback: handlers.onGoToDashboard,
    modifiers: { alt: true }
  },
  {
    key: '2',
    callback: handlers.onGoToInbox,
    modifiers: { alt: true }
  },
  {
    key: '3',
    callback: handlers.onGoToDrafts,
    modifiers: { alt: true }
  },
  {
    key: '4',
    callback: handlers.onGoToArchive,
    modifiers: { alt: true }
  },
  {
    key: 'Escape',
    callback: handlers.onGoToDashboard,
  }
];