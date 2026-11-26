export default function UploadingOverlay({
  label = "Uploading…",
}: {
  label?: string;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/45">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <span className="text-[11px] font-semibold text-white">{label}</span>
    </div>
  );
}
