import type { ReactNode } from 'react';

/**
 * Render simple markdown: **bold**, /respelling/, and line breaks.
 */
export function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts: ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*)|(\/([\w\s'-]+(?:-[\w\s'-]+)*)\/)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }

      if (match[1]) {
        parts.push(
          <strong key={`${lineIdx}-b-${match.index}`} className="text-[--color-text-primary] font-bold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(
          <span key={`${lineIdx}-r-${match.index}`} className="text-[--color-accent-text] font-mono font-semibold">
            {match[3]}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    return (
      <span key={lineIdx}>
        {parts.length > 0 ? parts : line}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
}
