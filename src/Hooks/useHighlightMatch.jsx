import { useMemo } from "react";

export function useHighlightMatch(text, searchTerm) {
  return useMemo(() => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  }, [text, searchTerm]);
}
