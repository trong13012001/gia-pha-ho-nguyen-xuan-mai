import { Lunar, Solar } from "lunar-javascript";

const THIEN_CAN: Record<string, string> = {
  甲: "Giáp",
  乙: "Ất",
  丙: "Bính",
  丁: "Đinh",
  戊: "Mậu",
  己: "Kỷ",
  庚: "Canh",
  辛: "Tân",
  壬: "Nhâm",
  癸: "Quý",
};

const DIA_CHI: Record<string, string> = {
  子: "Tý",
  丑: "Sửu",
  寅: "Dần",
  卯: "Mão",
  辰: "Thìn",
  巳: "Tỵ",
  午: "Ngọ",
  未: "Mùi",
  申: "Thân",
  酉: "Dậu",
  戌: "Tuất",
  亥: "Hợi",
};

const VN_TZ = "Asia/Ho_Chi_Minh";

function ganZhiToVietnamese(ganZhi: string): string {
  if (!ganZhi || ganZhi.length < 2) return ganZhi;
  const can = THIEN_CAN[ganZhi[0]] ?? ganZhi[0];
  const chi = DIA_CHI[ganZhi[1]] ?? ganZhi[1];
  return `${can} ${chi}`;
}

/** Ngày dương lịch theo giờ Việt Nam — không parse locale string (RN/Hermes hay trả Invalid Date). */
function getVietnamSolarParts(now = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: VN_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  const year = read("year");
  const month = read("month");
  const day = read("day");

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }

  return { year, month, day };
}

export function getTodayLunar() {
  const now = new Date();
  const { year, month, day } = getVietnamSolarParts(now);

  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const solarStr = new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return {
    solarStr,
    lunarDayStr: `${lunar.getDay()} tháng ${Math.abs(lunar.getMonth())}`,
    lunarYear: ganZhiToVietnamese(lunar.getYearInGanZhi()),
  };
}
