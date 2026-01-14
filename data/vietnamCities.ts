export interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
}

export const VIETNAM_CITIES: City[] = [
  // Miền Bắc
  { id: 'hanoi', name: 'Hà Nội', latitude: 21.0285, longitude: 105.8542, region: 'Miền Bắc' },
  { id: 'hai_phong', name: 'Hải Phòng', latitude: 20.8445, longitude: 106.6881, region: 'Miền Bắc' },
  { id: 'nam_dinh', name: 'Nam Định', latitude: 20.4279, longitude: 106.1654, region: 'Miền Bắc' },
  { id: 'hai_duong', name: 'Hải Dương', latitude: 20.9426, longitude: 106.3253, region: 'Miền Bắc' },
  { id: 'quang_ninh', name: 'Quảng Ninh', latitude: 21.0285, longitude: 107.0847, region: 'Miền Bắc' },
  { id: 'bac_kan', name: 'Bắc Kạn', latitude: 22.1449, longitude: 105.8369, region: 'Miền Bắc' },
  { id: 'cao_bang', name: 'Cao Bằng', latitude: 22.6758, longitude: 106.2576, region: 'Miền Bắc' },
  { id: 'lang_son', name: 'Lạng Sơn', latitude: 21.8547, longitude: 106.7594, region: 'Miền Bắc' },
  { id: 'tuyen_quang', name: 'Tuyên Quang', latitude: 21.8154, longitude: 105.2156, region: 'Miền Bắc' },
  { id: 'yen_bai', name: 'Yên Bái', latitude: 21.7202, longitude: 104.9111, region: 'Miền Bắc' },
  { id: 'phu_tho', name: 'Phú Thọ', latitude: 21.5946, longitude: 105.3344, region: 'Miền Bắc' },
  { id: 'vinh_phuc', name: 'Vĩnh Phúc', latitude: 21.3073, longitude: 105.6032, region: 'Miền Bắc' },
  { id: 'bac_giang', name: 'Bắc Giang', latitude: 21.2815, longitude: 106.1936, region: 'Miền Bắc' },
  { id: 'bac_ninh', name: 'Bắc Ninh', latitude: 21.1829, longitude: 106.0744, region: 'Miền Bắc' },

  // Trung Bộ
  { id: 'thanh_hoa', name: 'Thanh Hóa', latitude: 19.8075, longitude: 105.7715, region: 'Trung Bộ' },
  { id: 'nghe_an', name: 'Nghệ An', latitude: 19.0343, longitude: 104.9281, region: 'Trung Bộ' },
  { id: 'ha_tinh', name: 'Hà Tĩnh', latitude: 18.3378, longitude: 105.9014, region: 'Trung Bộ' },
  { id: 'quang_binh', name: 'Quảng Bình', latitude: 17.4779, longitude: 106.6230, region: 'Trung Bộ' },
  { id: 'quang_tri', name: 'Quảng Trị', latitude: 16.7475, longitude: 107.1905, region: 'Trung Bộ' },
  { id: 'thua_thien_hue', name: 'Thừa Thiên Huế', latitude: 16.4637, longitude: 107.5909, region: 'Trung Bộ' },
  { id: 'da_nang', name: 'Đà Nẵng', latitude: 16.0544, longitude: 108.2022, region: 'Trung Bộ' },
  { id: 'quang_nam', name: 'Quảng Nam', latitude: 15.5339, longitude: 108.3261, region: 'Trung Bộ' },
  { id: 'quang_ngai', name: 'Quảng Ngãi', latitude: 15.1206, longitude: 108.7955, region: 'Trung Bộ' },
  { id: 'binh_dinh', name: 'Bình Định', latitude: 13.7892, longitude: 109.2247, region: 'Trung Bộ' },
  { id: 'phu_yen', name: 'Phú Yên', latitude: 13.1939, longitude: 109.2026, region: 'Trung Bộ' },
  { id: 'khanh_hoa', name: 'Khánh Hòa', latitude: 12.2258, longitude: 109.1967, region: 'Trung Bộ' },

  // Tây Nguyên
  { id: 'kon_tum', name: 'Kon Tum', latitude: 14.9667, longitude: 108.0042, region: 'Tây Nguyên' },
  { id: 'gia_lai', name: 'Gia Lai', latitude: 13.9833, longitude: 108.0042, region: 'Tây Nguyên' },
  { id: 'dak_lak', name: 'Đắk Lắk', latitude: 12.6667, longitude: 108.0333, region: 'Tây Nguyên' },
  { id: 'dak_nong', name: 'Đắk Nông', latitude: 12.0167, longitude: 107.7667, region: 'Tây Nguyên' },
  { id: 'lam_dong', name: 'Lâm Đồng', latitude: 11.9386, longitude: 108.4493, region: 'Tây Nguyên' },

  // Nam Bộ
  { id: 'ninh_thuan', name: 'Ninh Thuận', latitude: 11.5622, longitude: 108.9755, region: 'Nam Bộ' },
  { id: 'binh_thuan', name: 'Bình Thuận', latitude: 10.9248, longitude: 108.1050, region: 'Nam Bộ' },
  { id: 'tay_ninh', name: 'Tây Ninh', latitude: 11.3118, longitude: 106.1326, region: 'Nam Bộ' },
  { id: 'dong_nai', name: 'Đồng Nai', latitude: 10.9641, longitude: 106.8216, region: 'Nam Bộ' },
  { id: 'ba_ria_vung_tau', name: 'Bà Rịa - Vũng Tàu', latitude: 10.3528, longitude: 107.0681, region: 'Nam Bộ' },
  { id: 'ho_chi_minh', name: 'Hồ Chí Minh', latitude: 10.7769, longitude: 106.7009, region: 'Nam Bộ' },
  { id: 'long_an', name: 'Long An', latitude: 10.5347, longitude: 106.2156, region: 'Nam Bộ' },
  { id: 'tien_giang', name: 'Tiền Giang', latitude: 10.3667, longitude: 106.3667, region: 'Nam Bộ' },
  { id: 'ben_tre', name: 'Bến Tre', latitude: 10.2381, longitude: 106.3747, region: 'Nam Bộ' },
  { id: 'vinh_long', name: 'Vĩnh Long', latitude: 9.8828, longitude: 106.0206, region: 'Nam Bộ' },
  { id: 'can_tho', name: 'Cần Thơ', latitude: 10.0341, longitude: 105.7469, region: 'Nam Bộ' },
  { id: 'an_giang', name: 'An Giang', latitude: 10.5167, longitude: 105.1167, region: 'Nam Bộ' },
  { id: 'kien_giang', name: 'Kiên Giang', latitude: 9.8750, longitude: 105.0083, region: 'Nam Bộ' },
  { id: 'ca_mau', name: 'Cà Mau', latitude: 9.1768, longitude: 104.7564, region: 'Nam Bộ' },
];
