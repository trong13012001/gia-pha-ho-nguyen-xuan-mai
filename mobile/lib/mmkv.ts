import { createMMKV } from "react-native-mmkv";

/** MMKV instance dùng chung (auth, cache nhẹ, v.v.). */
export const mmkv = createMMKV({
  id: "giapha-storage",
});
