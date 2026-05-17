import { AnimatedPressable } from "@/components/AnimatedPressable";
import { colors } from "@/constants/theme";
import { pickAvatarImage, uploadPersonAvatar } from "@/lib/avatarUpload";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

export function AvatarPicker({
  personId,
  fullName,
  avatarUrl,
  onUploaded,
  compact = false,
}: {
  personId: string;
  fullName: string;
  avatarUrl: string | null;
  onUploaded: (url: string) => void;
  /** Nhúng trong màn chi tiết (avatar nhỏ, căn trái). */
  compact?: boolean;
}) {
  const queryClient = useQueryClient();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const displayUri = localUri ?? avatarUrl;

  const handlePick = async () => {
    try {
      const asset = await pickAvatarImage();
      if (!asset) return;
      setLocalUri(asset.uri);
      setUploading(true);
      const publicUrl = await uploadPersonAvatar(
        personId,
        fullName,
        asset,
        queryClient,
      );
      onUploaded(publicUrl);
      setLocalUri(publicUrl);
    } catch (e) {
      Alert.alert(
        "Không thể cập nhật ảnh",
        e instanceof Error ? e.message : "Lỗi không xác định",
      );
      setLocalUri(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <AnimatedPressable
        onPress={handlePick}
        disabled={uploading}
        style={[styles.ring, compact && styles.ringCompact]}
      >
        {displayUri ? (
          <Image source={{ uri: displayUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.initial}>
              {fullName.trim().charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.badge}>
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="camera" size={16} color="#fff" />
          )}
        </View>
      </AnimatedPressable>
      {!compact ? (
        <Text style={styles.hint}>Chạm để chọn ảnh từ thư viện</Text>
      ) : (
        <Text style={styles.hintCompact}>Chạm để đổi ảnh</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginBottom: 20 },
  wrapCompact: { alignItems: "flex-start", marginBottom: 0 },
  ring: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: colors.surface,
  },
  ringCompact: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
  },
  image: { width: "100%", height: "100%" },
  placeholder: {
    flex: 1,
    backgroundColor: "#f5f5f4",
    alignItems: "center",
    justifyContent: "center",
  },
  initial: { fontSize: 40, fontWeight: "700", color: colors.primary },
  badge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  hint: { marginTop: 10, fontSize: 13, color: colors.textMuted },
  hintCompact: { marginTop: 6, fontSize: 12, color: colors.textMuted },
});
