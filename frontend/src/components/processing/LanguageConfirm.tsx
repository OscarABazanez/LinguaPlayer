import { LANGUAGES } from '../../utils/languageCodes';

interface Props {
  detectedLanguage: string;
  onConfirm: (lang: string) => void;
}

export default function LanguageConfirm({ detectedLanguage, onConfirm }: Props) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[--color-surface-alt] rounded-xl">
      <span className="text-sm text-[--color-text-muted]">Detected language:</span>
      <select
        value={detectedLanguage}
        onChange={(e) => onConfirm(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-[--color-border-strong] bg-[--color-surface] text-sm text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-accent]"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
