"use client";

export default function BookingSlotsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold text-[#591727]">
        Booking Slot couldn’t load
      </h2>
      <p className="max-w-md text-sm text-[#7A6040]">
        Something went wrong opening this page. Try again.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
        style={{ backgroundColor: "#591727" }}
      >
        Reload
      </button>
    </div>
  );
}
