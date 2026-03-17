interface Props {
  progress: number;
}

export default function ProgressBar({ progress }: Props) {
  return (
    <div className="w-full rounded-full h-4 overflow-hidden border border-[--color-border-strong] bg-gray-200 dark:bg-gray-700">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
