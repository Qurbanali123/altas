import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import {
  DASHBOARD_IMAGE_COMPRESS_OPTIONS,
  compressImageForUpload,
} from "@/utils/compressImage";
import { getToken } from "@/utils/auth";

export interface AdminStaff {
  id: string;
  fullName: string;
  roleTitle: string;
  bio: string;
  specialties: string[];
  profilePhotoUrl: string;
  status: "active" | "inactive";
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicStaff {
  id: string;
  fullName: string;
  roleTitle: string;
  bio: string;
  specialties: string[];
  profilePhotoUrl: string;
  order: number;
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

import { mediaImageUrl, type OptimizeImageOptions } from "@/utils/mediaUrl";

export function staffPhotoUrl(
  path: string | undefined | null,
  options?: OptimizeImageOptions
): string {
  return mediaImageUrl(path, options);
}

export async function fetchPublicStaff(): Promise<PublicStaff[]> {
  const response = await publicCmsFetch(apiUrl("/api/staffs/public"));
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load team");
  }
  return data.staff;
}

export async function fetchStaffOverview(): Promise<{
  staff: AdminStaff[];
  total: number;
}> {
  const response = await fetch(apiUrl("/api/staffs/overview"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load staff");
  }
  return { staff: data.staff, total: data.total };
}

export async function fetchStaffById(id: string): Promise<AdminStaff> {
  const response = await fetch(apiUrl(`/api/staffs/${id}`), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load staff member");
  }
  return data.staff;
}

export async function createStaff(
  payload: Omit<AdminStaff, "id" | "createdAt" | "updatedAt">
): Promise<AdminStaff> {
  const response = await fetch(apiUrl("/api/staffs"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create doctor");
  }
  return data.staff;
}

export async function updateStaff(
  id: string,
  payload: Partial<AdminStaff>
): Promise<AdminStaff> {
  const response = await fetch(apiUrl(`/api/staffs/${id}`), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update doctor");
  }
  return data.staff;
}

export async function deleteStaff(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/staffs/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete doctor");
  }
}

export async function uploadStaffPhoto(file: File): Promise<string> {
  const token = getToken();
  const formData = new FormData();
  formData.append(
    "image",
    await compressImageForUpload(file, DASHBOARD_IMAGE_COMPRESS_OPTIONS),
  );

  const response = await fetch(apiUrl("/api/staffs/upload-photo"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Image upload failed");
  }
  return data.url as string;
}
