import { LANGUAGES } from '../../utils/languageCodes';

interface Props {
  value: string;
  onChange: (code: string) => void;
  label: string;
}

export default function LanguageSelector({ value, onChange, label }: Props) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-[--color-text-muted] whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-4 py-2.5 rounded-xl border border-[--color-border-strong] bg-[--color-surface] text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:border-transparent transition-shadow text-sm"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
}
