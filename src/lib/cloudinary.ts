// Upload-helper voor Cloudinary (unsigned upload preset).
//
// We gebruiken Cloudinary in plaats van Firebase Storage voor foto/video-
// uploads, omdat Firebase Storage sinds eind 2024 het betaalde Blaze-plan
// vereist. Cloudinary's gratis plan werkt zonder creditcard en is voor
// deze schaal ruim voldoende (25 credits/maand: 1 credit = 1GB opslag of
// 1GB bandbreedte of 1000 transformaties).
//
// Zie README voor de setup: een gratis Cloudinary-account aanmaken en
// een "unsigned" upload preset instellen.

export interface CloudinaryUploadResult {
  url: string;
  type: "image" | "video";
}

export async function uploadToCloudinary(
  file: File,
  folder: string = "posts"
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is niet geconfigureerd. Zet NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (zie .env.local.example)."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Upload naar Cloudinary mislukt: ${detail || response.statusText}`
    );
  }

  const data = await response.json();
  const type: "image" | "video" = data.resource_type === "video" ? "video" : "image";

  return { url: data.secure_url as string, type };
}
