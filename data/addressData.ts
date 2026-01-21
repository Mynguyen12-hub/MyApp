/**
 * Xuất ra console danh sách 63 tỉnh/thành phố (xổ đầy đủ các cấp) từ VIETNAM_PROVINCES
 */
export function printAll63ProvincesWithCommunes() {
  const data = getAllProvincesWithCommunes(VIETNAM_PROVINCES);
  console.log(JSON.stringify(data, null, 2));
  return data;
}
/**
 * Lấy danh sách tỉnh/thành phố đơn giản từ VIETNAM_CITIES (không xổ districts/communes)
 */
export function getSimpleCitiesList() {
  return VIETNAM_CITIES.map(({ id, name, latitude, longitude, region }) => ({ id, name, latitude, longitude, region }));
}
/**
 * Hàm thực thi: Xuất ra console danh sách tỉnh/thành phố từ VIETNAM_CITIES kèm xã/ấp (nếu có)
 */
export function printCitiesWithCommunes() {
  const data = getCitiesWithCommunes();
  console.log(JSON.stringify(data, null, 2));
  return data;
}
// --- Hướng dẫn sử dụng ---
// Để lấy danh sách tỉnh/thành phố đúng chuẩn VIETNAM_CITIES kèm xã/ấp:
// import { printCitiesWithCommunes } from './addressData';
// printCitiesWithCommunes();
// Hoặc lấy dữ liệu dạng object:
// const data = getCitiesWithCommunes();
import { Province, VIETNAM_PROVINCES } from "./vietnamAdministrative";
import { VIETNAM_CITIES } from "./vietnamCities";
/**
 * Lấy danh sách tỉnh/thành phố từ VIETNAM_CITIES, ghép với xã/ấp từ VIETNAM_PROVINCES nếu có
 */
export function getCitiesWithCommunes() {
  return VIETNAM_CITIES.map(city => {
    // Tìm province tương ứng theo tên (bỏ dấu, so sánh lower-case, loại bỏ ký tự đặc biệt)
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cityNorm = normalize(city.name);
    const province = VIETNAM_PROVINCES.find(p => normalize(p.name) === cityNorm);
    return {
      ...city,
      districts: province
        ? province.districts.map(d => ({
            district: d.name,
            communes: d.communes.map(c => c.name),
          }))
        : [],
    };
  });
}
// Hàm thực thi: Xuất ra danh sách tất cả tỉnh/thành phố và xã/ấp (console.log)
export function printAllProvincesWithCommunes() {
  const data = getAllProvincesWithCommunes(VIETNAM_PROVINCES);
  console.log(JSON.stringify(data, null, 2));
  return data;
}

/**
 * Lấy danh sách tất cả tỉnh/thành phố cùng toàn bộ xã/ấp (cấp xã/phường/thị trấn)
 * @param provinces Danh sách Province (có thể lấy từ DEFAULT_VIETNAM_PROVINCES hoặc dữ liệu đầy đủ)
 */
export function getAllProvincesWithCommunes(provinces: Province[]) {
  return provinces.map((province) => ({
    province: province.name,
    districts: province.districts.map((district) => ({
      district: district.name,
      communes: district.communes.map((commune) => commune.name),
    })),
  }));
}
// Address data - shared across all components
export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault?: boolean;
}

export const DEFAULT_ADDRESSES: Address[] = [
  {
    id: "1",
    name: "Office",
    street: "123 Main Street",
    city: "Ho Chi Minh City",
    state: "HCM",
    zip: "70000",
    phone: "+84 123 456 789",
    isDefault: true,
  },
  {
    id: "2",
    name: "My Home",
    street: "456 Nguyen Hue Boulevard",
    city: "Da Nang",
    state: "DA",
    zip: "50000",
    phone: "+84 987 654 321",
  },
  {
    id: "3",
    name: "Grandmothers house",
    street: "789 Tran Hung Dao Street",
    city: "Hanoi",
    state: "HN",
    zip: "10000",
    phone: "+84 555 666 777",
  },
];
