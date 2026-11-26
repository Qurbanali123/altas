import { apiUrl } from "@/utils/api";
import { getToken } from "@/utils/auth";

export type BookingAvailabilityRecord = {
  id: string;
  date: string;
  fullDayBlocked: boolean;
  blockedSlots: string[];
  updatedAt?: string;
};

export type BookingSlotsOverview = {
  records: BookingAvailabilityRecord[];
  slotIntervalMinutes: number;
  allSlots: string[];
  metadata: {
    lastUpdated: string;
    totalRecords: number;
  };
};

export type DayAvailability = {
  date: string;
  fullDayBlocked: boolean;
  blockedSlots: string[];
  availableSlots: string[];
  closed: boolean;
};

export type PublicAvailableSlots = {
  date: string;
  slots: string[];
  closed: boolean;
};

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchBookingSlotsOverview(): Promise<BookingSlotsOverview> {
  const response = await fetch(apiUrl("/api/booking-slots/overview"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to load booking slots.");
  }
  const data = json.data ?? {};
  return {
    records: Array.isArray(data.records) ? data.records : [],
    slotIntervalMinutes: Number(data.slotIntervalMinutes) || 30,
    allSlots: Array.isArray(data.allSlots) ? data.allSlots : [],
    metadata: data.metadata ?? {
      lastUpdated: new Date().toISOString(),
      totalRecords: 0,
    },
  };
}

export async function fetchDayAvailability(date: string): Promise<DayAvailability> {
  const response = await fetch(apiUrl(`/api/booking-slots/day/${date}`), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to load day availability.");
  }
  const data = json.data ?? {};
  return {
    date: data.date || date,
    fullDayBlocked: Boolean(data.fullDayBlocked),
    blockedSlots: Array.isArray(data.blockedSlots) ? data.blockedSlots : [],
    availableSlots: Array.isArray(data.availableSlots) ? data.availableSlots : [],
    closed: Boolean(data.closed),
  };
}

export async function saveDayAvailability(payload: {
  date: string;
  fullDayBlocked: boolean;
  blockedSlots: string[];
}): Promise<void> {
  const response = await fetch(apiUrl("/api/booking-slots/day"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to save availability.");
  }
}

export async function clearDayRules(date: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/booking-slots/day/${date}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to clear day rules.");
  }
}

export async function clearDaySlotBlocks(date: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/booking-slots/day/${date}/slots`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to clear slot blocks.");
  }
}

export async function fetchPublicAvailableSlots(date: string): Promise<PublicAvailableSlots> {
  const response = await fetch(
    apiUrl(`/api/booking-slots/public/available?date=${encodeURIComponent(date)}`),
    { cache: "no-store" }
  );
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to load available slots.");
  }
  return json.data;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
