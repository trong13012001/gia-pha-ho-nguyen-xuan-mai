# Migrate sang repo mới + React Native (Expo)

## Cấu trúc mới

```
/
├── shared/          # Logic dùng chung (sự kiện, lịch thông báo 49/100 ngày)
├── mobile/          # Ứng dụng Expo (nền tảng chính)
├── app/             # Next.js web (có thể giữ tạm hoặc tách repo riêng)
├── docs/
└── ...
```

## Tech stack (giữ nguyên)

| Thành phần | Web (cũ) | Mobile (mới) |
|------------|----------|--------------|
| Backend | Supabase | Supabase |
| Data fetching | TanStack Query | TanStack Query |
| Form / validation | Zod + RHF | Zod (auth sau) |
| State | Zustand | Zustand |
| Lịch âm | lunar-javascript | lunar-javascript |

## Tính năng mới: Lễ 49 & 100 ngày

- Tính từ **ngày mất dương lịch** (`death_year`, `death_month`, `death_day`).
- Hiển thị trong tab **Sự kiện** (web + app).
- **Thông báo local** (chỉ app): 8:00 sáng, từ **3 ngày trước** đến **đúng ngày lễ**, mỗi ngày một lần.

## Tách repo mới (GitHub)

```bash
# Trên máy bạn — tạo repo trống trên GitHub, ví dụ: gia-pha-mobile

cd /đường/dẫn/gia-pha-ho-nguyen-xuan-mai
git remote rename origin old-origin   # nếu cần giữ remote cũ
git remote add origin git@github.com:<user>/gia-pha-mobile.git

# Hoặc clone chỉ mobile + shared:
mkdir gia-pha-mobile && cd gia-pha-mobile
cp -r ../gia-pha-ho-nguyen-xuan-mai/mobile .
cp -r ../gia-pha-ho-nguyen-xuan-mai/shared .
cp ../gia-pha-ho-nguyen-xuan-mai/docs/schema.sql docs/
git init && git add . && git commit -m "Initial Expo app"
git push -u origin main
```

## Chạy app mobile

```bash
cd mobile
cp .env.example .env
# Điền EXPO_PUBLIC_SUPABASE_URL và EXPO_PUBLIC_SUPABASE_ANON_KEY
# (cùng project Supabase với web — dùng anon key)

bun install
bun run start
```

Mở Expo Go hoặc build dev client (`npx expo run:ios` / `run:android`).

## Biến môi trường

| Biến | Mô tả |
|------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | URL Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key |
| `EXPO_PUBLIC_SITE_NAME` | Tên hiển thị |

## Phạm vi mobile (v1)

- Đăng nhập Supabase
- Danh sách thành viên + chi tiết
- Sự kiện (sinh nhật, giỗ, 49/100 ngày, tuỳ chỉnh)
- Thông báo lễ 49/100 ngày

Chưa port trong v1: sơ đồ cây, mindmap, import/export, quản trị user — có thể bổ sung sau.

## Database

Không cần migration SQL mới: dùng bảng `persons` hiện có. Đảm bảo người mất có đủ `death_year`, `death_month`, `death_day` (dương lịch).
