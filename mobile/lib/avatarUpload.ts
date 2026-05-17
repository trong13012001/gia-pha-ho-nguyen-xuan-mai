import { invalidatePersonsAndSyncNotifications } from "@/lib/invalidateAndSyncNotifications";
import { getSupabaseClient } from "@/lib/supabase";
import { QueryClient } from "@tanstack/react-query";
import { Database } from "@/types/database.types";
import * as ImagePicker from "expo-image-picker";

type PersonUpdate = Database["public"]["Tables"]["persons"]["Update"];

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 40);
}

export async function pickAvatarImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Cần quyền truy cập thư viện ảnh để chọn avatar.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0];
}

export async function uploadPersonAvatar(
  personId: string,
  fullName: string,
  asset: ImagePicker.ImagePickerAsset,
  queryClient?: QueryClient,
): Promise<string> {
  const supabase = getSupabaseClient();
  const ext = asset.uri.split(".").pop()?.split("?")[0] ?? "jpg";
  const filePath = `${personId}_${slugify(fullName || "member")}.${ext}`;
  const contentType = asset.mimeType ?? `image/${ext}`;

  const response = await fetch(asset.uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, arrayBuffer, {
      upsert: true,
      contentType,
    });

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const updatePayload: PersonUpdate = { avatar_url: publicUrl };
  const personsTable = supabase.from("persons") as unknown as {
    update: (values: PersonUpdate) => {
      eq: (
        column: "id",
        value: string,
      ) => Promise<{ error: { message: string } | null }>;
    };
  };
  const { error: updateError } = await personsTable
    .update(updatePayload)
    .eq("id", personId);

  if (updateError) throw new Error(updateError.message);

  if (queryClient) {
    await invalidatePersonsAndSyncNotifications(queryClient);
  }

  return publicUrl;
}

export async function removePersonAvatarFromStorage(
  avatarUrl: string,
): Promise<void> {
  const fileName = avatarUrl.split("/").pop();
  if (!fileName) return;

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from("avatars").remove([fileName]);
  if (error) throw new Error(error.message);
}
