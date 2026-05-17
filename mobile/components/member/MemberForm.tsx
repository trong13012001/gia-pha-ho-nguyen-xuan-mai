import { AnimatedPressable } from "@/components/AnimatedPressable";
import {
  FormField,
  FormNumberInput,
  FormTextInput,
} from "@/components/member/FormField";
import { FormSection } from "@/components/member/FormSection";
import { colors } from "@/constants/theme";
import {
  useCreatePersonMutation,
  useUpdatePersonMutation,
} from "@/hooks/usePersonMutations";
import {
  pickAvatarImage,
  removePersonAvatarFromStorage,
  uploadPersonAvatar,
} from "@/lib/avatarUpload";
import {
  memberFormSchema,
  MemberFormValues,
  NumberInput,
} from "@/schemas/memberForm";
import {
  deletePersonPrivateDetails,
  upsertPersonPrivateDetails,
} from "@/services/personPrivate";
import { updatePerson } from "@/services/persons";
import { Gender, Person } from "@/types";
import {
  formValuesToPersonPayload,
  personToFormValues,
  syncLunarDeathToSolar,
  syncSolarDeathToLunar,
} from "@/utils/memberFormDates";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { queryKeys } from "@/constants/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

function avatarPlaceholderColor(gender: Gender) {
  if (gender === "male") return "#38bdf8";
  if (gender === "female") return "#fb7185";
  return "#a8a29e";
}

export function MemberForm({
  initialPerson,
  isAdmin = false,
  onSuccess,
  onCancel,
}: {
  initialPerson?: Person | null;
  isAdmin?: boolean;
  onSuccess: (personId: string) => void;
  onCancel: () => void;
}) {
  const isEditing = Boolean(initialPerson?.id);
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingAvatar, setPendingAvatar] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialPerson?.avatar_url ?? null,
  );
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const createMutation = useCreatePersonMutation();
  const updateMutation = useUpdatePersonMutation();
  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadingAvatar;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: personToFormValues(initialPerson),
  });

  const isDeceased = watch("isDeceased");
  const gender = watch("gender");
  const fullName = watch("fullName");

  const clearDeathFields = () => {
    setValue("deathDay", "", { shouldDirty: true });
    setValue("deathMonth", "", { shouldDirty: true });
    setValue("deathYear", "", { shouldDirty: true });
    setValue("deathLunarDay", "", { shouldDirty: true });
    setValue("deathLunarMonth", "", { shouldDirty: true });
    setValue("deathLunarYear", "", { shouldDirty: true });
  };

  const applySolarDeath = (
    field: "deathDay" | "deathMonth" | "deathYear",
    val: NumberInput,
  ) => {
    setValue(field, val, { shouldDirty: true });
    const day = field === "deathDay" ? val : watch("deathDay");
    const month = field === "deathMonth" ? val : watch("deathMonth");
    const year = field === "deathYear" ? val : watch("deathYear");
    const lunar = syncSolarDeathToLunar(day, month, year);
    if (lunar) {
      setValue("deathLunarDay", lunar.deathLunarDay);
      setValue("deathLunarMonth", lunar.deathLunarMonth);
      setValue("deathLunarYear", lunar.deathLunarYear);
    }
  };

  const applyLunarDeath = (
    field: "deathLunarDay" | "deathLunarMonth" | "deathLunarYear",
    val: NumberInput,
  ) => {
    setValue(field, val, { shouldDirty: true });
    const day = field === "deathLunarDay" ? val : watch("deathLunarDay");
    const month = field === "deathLunarMonth" ? val : watch("deathLunarMonth");
    const year = field === "deathLunarYear" ? val : watch("deathLunarYear");
    const solar = syncLunarDeathToSolar(day, month, year);
    if (solar) {
      setValue("deathDay", solar.deathDay);
      setValue("deathMonth", solar.deathMonth);
      setValue("deathYear", solar.deathYear);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const asset = await pickAvatarImage();
      if (!asset) return;
      setPendingAvatar(asset);
      setAvatarPreview(asset.uri);
      setAvatarRemoved(false);
      setValue("avatarUrl", "", { shouldDirty: true });
    } catch (e) {
      Alert.alert(
        "Không chọn được ảnh",
        e instanceof Error ? e.message : "Lỗi không xác định",
      );
    }
  };

  const handleRemoveAvatar = async () => {
    if (
      initialPerson?.avatar_url &&
      !pendingAvatar &&
      avatarPreview === initialPerson.avatar_url
    ) {
      try {
        await removePersonAvatarFromStorage(initialPerson.avatar_url);
      } catch {
        // Storage cleanup is best-effort; person record will still clear URL.
      }
    }
    setPendingAvatar(null);
    setAvatarPreview(null);
    setAvatarRemoved(true);
    setValue("avatarUrl", "", { shouldDirty: true });
  };

  const savePrivateDetails = async (personId: string, values: MemberFormValues) => {
    const normalized = {
      person_id: personId,
      phone_number: values.phoneNumber.trim() || null,
      occupation: values.occupation.trim() || null,
      current_residence: values.currentResidence.trim() || null,
    };
    const hasData =
      normalized.phone_number ||
      normalized.occupation ||
      normalized.current_residence;

    if (hasData) {
      await upsertPersonPrivateDetails(normalized);
    } else {
      await deletePersonPrivateDetails(personId);
    }
  };

  const onSubmit = async (values: MemberFormValues) => {
    setSubmitError(null);
    try {
      let personId = initialPerson?.id;
      let avatarUrl: string | null =
        avatarRemoved ? null : values.avatarUrl || initialPerson?.avatar_url || null;

      const payload = formValuesToPersonPayload(values, avatarUrl);

      if (isEditing && personId) {
        await updateMutation.mutateAsync({ id: personId, payload });
      } else {
        const created = await createMutation.mutateAsync(payload);
        personId = created.id;
      }

      if (!personId) {
        throw new Error("Không lấy được ID thành viên sau khi lưu.");
      }

      if (pendingAvatar) {
        setUploadingAvatar(true);
        try {
          avatarUrl = await uploadPersonAvatar(
            personId,
            values.fullName,
            pendingAvatar,
            queryClient,
          );
          setValue("avatarUrl", avatarUrl);
        } finally {
          setUploadingAvatar(false);
        }
      } else if (avatarRemoved && initialPerson?.avatar_url) {
        await updatePerson(personId, { avatar_url: null });
      }

      if (isAdmin) {
        await savePrivateDetails(personId, values);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.personPrivate(personId),
        });
      }

      onSuccess(personId);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Không lưu được thành viên.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <FormSection title="Thông tin chung" icon="person-outline">
          <Controller
            control={control}
            name="fullName"
            render={({ field: { value, onChange } }) => (
              <FormTextInput
                label="Họ và tên *"
                value={value}
                onChangeText={onChange}
                placeholder="Nhập họ và tên..."
                error={errors.fullName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="otherNames"
            render={({ field: { value, onChange } }) => (
              <FormTextInput
                label="Tên gọi khác"
                value={value}
                onChangeText={onChange}
                placeholder="Nickname, tên thánh, bí danh..."
              />
            )}
          />

          <FormField label="Giới tính *">
            <View style={styles.chips}>
              {GENDERS.map((g) => (
                <Controller
                  key={g.value}
                  control={control}
                  name="gender"
                  render={({ field: { value, onChange } }) => (
                    <AnimatedPressable
                      onPress={() => onChange(g.value)}
                      style={[
                        styles.chip,
                        value === g.value && styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          value === g.value && styles.chipTextActive,
                        ]}
                      >
                        {g.label}
                      </Text>
                    </AnimatedPressable>
                  )}
                />
              ))}
            </View>
          </FormField>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Là con dâu hoặc con rể</Text>
            <Controller
              control={control}
              name="isInLaw"
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ true: colors.primary }}
                />
              )}
            />
          </View>

          <View style={styles.row2}>
            <View style={styles.col}>
              <Controller
                control={control}
                name="birthOrder"
                render={({ field: { value, onChange } }) => (
                  <FormNumberInput
                    label="Thứ tự sinh"
                    value={value}
                    onChangeValue={onChange}
                    placeholder="1, 2..."
                  />
                )}
              />
              <Text style={styles.fieldHint}>Để trống nếu không rõ</Text>
            </View>
            <View style={styles.col}>
              <Controller
                control={control}
                name="generation"
                render={({ field: { value, onChange } }) => (
                  <FormNumberInput
                    label="Thuộc đời thứ"
                    value={value}
                    onChangeValue={onChange}
                    placeholder="1, 2, 3..."
                  />
                )}
              />
              <Text style={styles.fieldHint}>Để trống nếu không rõ</Text>
            </View>
          </View>

          <FormField label="Ảnh đại diện">
            <View style={styles.avatarRow}>
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: avatarPreview
                      ? "transparent"
                      : avatarPlaceholderColor(gender),
                  },
                ]}
              >
                {avatarPreview ? (
                  <Image
                    source={{ uri: avatarPreview }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarInitial}>
                    {fullName.trim()
                      ? fullName.trim().charAt(0).toUpperCase()
                      : "?"}
                  </Text>
                )}
              </View>
              <View style={styles.avatarActions}>
                <AnimatedPressable
                  style={styles.avatarPickBtn}
                  onPress={handlePickAvatar}
                  disabled={uploadingAvatar}
                >
                  <Ionicons name="image-outline" size={18} color={colors.primary} />
                  <Text style={styles.avatarPickText}>Chọn ảnh mới</Text>
                </AnimatedPressable>
                {avatarPreview ? (
                  <AnimatedPressable
                    style={styles.avatarRemoveBtn}
                    onPress={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    <Text style={styles.avatarRemoveText}>Xóa ảnh</Text>
                  </AnimatedPressable>
                ) : null}
                <Text style={styles.avatarHint}>
                  PNG, JPG. Ảnh được lưu khi bấm Lưu.
                </Text>
              </View>
            </View>
          </FormField>

          <Text style={styles.subsectionTitle}>Ngày sinh (dương lịch)</Text>
          <View style={styles.row3}>
            <View style={styles.col}>
              <Controller
                control={control}
                name="birthDay"
                render={({ field: { value, onChange } }) => (
                  <FormNumberInput
                    label="Ngày"
                    value={value}
                    onChangeValue={onChange}
                    error={errors.birthDay?.message}
                    placeholder="Ngày"
                  />
                )}
              />
            </View>
            <View style={styles.col}>
              <Controller
                control={control}
                name="birthMonth"
                render={({ field: { value, onChange } }) => (
                  <FormNumberInput
                    label="Tháng"
                    value={value}
                    onChangeValue={onChange}
                    placeholder="Tháng"
                  />
                )}
              />
            </View>
            <View style={styles.col}>
              <Controller
                control={control}
                name="birthYear"
                render={({ field: { value, onChange } }) => (
                  <FormNumberInput
                    label="Năm"
                    value={value}
                    onChangeValue={onChange}
                    placeholder="Năm"
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.deathCard}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Đã mất</Text>
              <Controller
                control={control}
                name="isDeceased"
                render={({ field: { value, onChange } }) => (
                  <Switch
                    value={value}
                    onValueChange={(next) => {
                      onChange(next);
                      if (!next) clearDeathFields();
                    }}
                    trackColor={{ true: "#57534e" }}
                  />
                )}
              />
            </View>

            {isDeceased ? (
              <>
                <Text style={styles.deathHint}>
                  Nhập ngày âm lịch hoặc dương lịch — hệ thống tự đồng bộ phần
                  còn lại.
                </Text>

                <Text style={styles.subsectionTitle}>Ngày mất (âm lịch)</Text>
                <View style={styles.row3}>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="deathLunarDay"
                      render={({ field: { value } }) => (
                        <FormNumberInput
                          label="Ngày"
                          value={value}
                          onChangeValue={(v) =>
                            applyLunarDeath("deathLunarDay", v)
                          }
                          placeholder="Ngày"
                        />
                      )}
                    />
                  </View>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="deathLunarMonth"
                      render={({ field: { value } }) => (
                        <FormNumberInput
                          label="Tháng"
                          value={value}
                          onChangeValue={(v) =>
                            applyLunarDeath("deathLunarMonth", v)
                          }
                          placeholder="Tháng"
                        />
                      )}
                    />
                  </View>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="deathLunarYear"
                      render={({ field: { value } }) => (
                        <FormNumberInput
                          label="Năm"
                          value={value}
                          onChangeValue={(v) =>
                            applyLunarDeath("deathLunarYear", v)
                          }
                          placeholder="Năm"
                        />
                      )}
                    />
                  </View>
                </View>

                <Text style={styles.subsectionTitle}>Ngày mất (dương lịch)</Text>
                <View style={styles.row3}>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="deathDay"
                      render={({ field: { value } }) => (
                        <FormNumberInput
                          label="Ngày"
                          value={value}
                          onChangeValue={(v) => applySolarDeath("deathDay", v)}
                          error={errors.deathDay?.message}
                          placeholder="Ngày"
                        />
                      )}
                    />
                  </View>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="deathMonth"
                      render={({ field: { value } }) => (
                        <FormNumberInput
                          label="Tháng"
                          value={value}
                          onChangeValue={(v) =>
                            applySolarDeath("deathMonth", v)
                          }
                          placeholder="Tháng"
                        />
                      )}
                    />
                  </View>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="deathYear"
                      render={({ field: { value } }) => (
                        <FormNumberInput
                          label="Năm"
                          value={value}
                          onChangeValue={(v) => applySolarDeath("deathYear", v)}
                          error={errors.deathYear?.message}
                          placeholder="Năm"
                        />
                      )}
                    />
                  </View>
                </View>
              </>
            ) : null}
          </View>

          <Controller
            control={control}
            name="note"
            render={({ field: { value, onChange } }) => (
              <FormTextInput
                label="Ghi chú"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                placeholder="Thêm thông tin bổ sung, tiểu sử..."
                style={{ minHeight: 96, textAlignVertical: "top" }}
              />
            )}
          />
        </FormSection>

        {isAdmin ? (
          <FormSection
            title="Thông tin riêng tư"
            icon="lock-closed-outline"
            variant="private"
            badge="CHỈ ADMIN"
          >
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { value, onChange } }) => (
                <FormTextInput
                  label="Số điện thoại"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ví dụ: 0912345678"
                  keyboardType="phone-pad"
                  editable={!isDeceased}
                  style={isDeceased ? styles.inputDisabled : undefined}
                />
              )}
            />
            {isDeceased ? (
              <Text style={styles.phoneWarning}>
                Không thể nhập SĐT cho người đã mất
              </Text>
            ) : null}

            <Controller
              control={control}
              name="occupation"
              render={({ field: { value, onChange } }) => (
                <FormTextInput
                  label="Nghề nghiệp"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ví dụ: Kỹ sư, Bác sĩ..."
                />
              )}
            />

            <Controller
              control={control}
              name="currentResidence"
              render={({ field: { value, onChange } }) => (
                <FormTextInput
                  label="Nơi ở hiện tại"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Địa chỉ cư trú..."
                />
              )}
            />
          </FormSection>
        ) : null}

        {submitError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
            <Text style={styles.submitError}>{submitError}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AnimatedPressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={[styles.saveBtn, busy && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditing ? "Lưu thay đổi" : "Thêm thành viên"}
              </Text>
            )}
          </AnimatedPressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 48 },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  row3: { flexDirection: "row", gap: 8 },
  row2: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipText: { color: colors.textMuted, fontWeight: "600" },
  chipTextActive: { color: colors.primary },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
    paddingVertical: 4,
  },
  switchLabel: { fontSize: 15, color: colors.text, fontWeight: "500", flex: 1 },
  fieldHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -8,
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitial: { fontSize: 32, fontWeight: "700", color: "#fff" },
  avatarActions: { flex: 1, gap: 8 },
  avatarPickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avatarPickText: { color: colors.primary, fontWeight: "600", fontSize: 14 },
  avatarRemoveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  avatarRemoveText: { color: colors.danger, fontWeight: "600", fontSize: 14 },
  avatarHint: { fontSize: 12, color: colors.textMuted, lineHeight: 16 },
  deathCard: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deathHint: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: "italic",
    marginBottom: 12,
    lineHeight: 18,
  },
  inputDisabled: {
    backgroundColor: "#f5f5f4",
    color: colors.textMuted,
  },
  phoneWarning: {
    fontSize: 12,
    color: colors.danger,
    marginTop: -8,
    marginBottom: 12,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  submitError: {
    flex: 1,
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    minWidth: 140,
  },
  btnDisabled: { opacity: 0.7 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelBtnText: { color: colors.textMuted, fontSize: 15, fontWeight: "600" },
});
