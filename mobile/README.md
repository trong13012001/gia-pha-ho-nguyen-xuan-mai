# Gia Phả Mobile (Expo SDK 55)

Ứng dụng React Native trong monorepo, dùng chung Supabase và logic sự kiện từ [`../shared`](../shared).

## Tech stack

- **Expo SDK 55** + **Expo Router 55**
- **Native tabs** (`expo-router/unstable-native-tabs`) — tab bar hệ thống iOS/Android
- **Reanimated 4** + **Gesture Handler** — animation thẻ, nút, danh sách
- **expo-image-picker** — chọn ảnh avatar từ thư viện (native)
- Supabase Auth (session lưu **MMKV**) + React Query + Zustand

## Chạy app

```bash
cd mobile
bun install
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_SITE_NAME
bun start
```

Sau khi nâng SDK hoặc thêm native module (MMKV), **build lại native**:

```bash
npx expo run:ios
# hoặc npx expo run:android
```

Rồi Metro: `bun start --clear` (MMKV **không** chạy trên Expo Go — cần dev build).

## Tính năng chính

- Đăng nhập, tab Trang chủ / Sự kiện / Thành viên / Cài đặt
- Lễ **49 / 100 ngày** + thông báo local (T-3 → ngày lễ, 8:00 sáng)
- Chi tiết thành viên: **chạm avatar** để chọn ảnh và upload lên bucket `avatars`

## Đồng bộ logic

Sửa [`../shared/utils/eventHelpers.ts`](../shared/utils/eventHelpers.ts) — mobile import qua alias `@shared/*`.
