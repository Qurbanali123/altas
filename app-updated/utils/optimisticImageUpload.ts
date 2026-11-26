export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeImagePreview(url: string): void {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export async function runOptimisticImageUpload({
  file,
  upload,
  onPreview,
  onSuccess,
  onError,
}: {
  file: File;
  upload: (file: File) => Promise<string>;
  onPreview: (previewUrl: string) => void;
  onSuccess: (url: string) => void;
  onError?: (error: Error) => void;
}): Promise<void> {
  const previewUrl = createImagePreview(file);
  onPreview(previewUrl);

  try {
    const url = await upload(file);
    onSuccess(url);
  } catch (err) {
    const error =
      err instanceof Error ? err : new Error("Image upload failed");
    onError?.(error);
    onSuccess("");
  } finally {
    revokeImagePreview(previewUrl);
  }
}
