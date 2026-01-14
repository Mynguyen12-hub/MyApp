// Vietnam Administrative Divisions: Provinces, Districts, Communes with coordinates

export interface Commune {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface District {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  communes: Commune[];
}

export interface Province {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  districts: District[];
}

// Allow loading a full administrative dataset from a JSON file named
// `vietnamAdministrative_full.json` placed next to this file. If present and
// non-empty, it will override the built-in sample list below. This lets you
// drop a complete provinces->districts->communes dataset (63 provinces,
// all districts and communes) without changing code.

let _fullData: Province[] | undefined;
try {
  // require at runtime so bundlers include JSON when present locally
  // (React Native Metro supports requiring JSON files).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maybeFull = require('./vietnamAdministrative_full.json');
  if (Array.isArray(maybeFull) && maybeFull.length > 0) {
    _fullData = maybeFull as Province[];
  }
} catch (e) {
  // ignore if file not present or invalid
}

const DEFAULT_VIETNAM_PROVINCES: Province[] = [
  // MIỀN BẮC (Northern Region)
  {
    id: 'ha-noi',
    name: 'Hà Nội',
    latitude: 21.0285,
    longitude: 105.8542,
    region: 'Miền Bắc',
    districts: [
      {
        id: 'ba-dinh',
        name: 'Ba Đình',
        latitude: 21.0395,
        longitude: 105.8342,
        communes: [
          { id: 'phuc-tan', name: 'Phúc Tân', latitude: 21.0355, longitude: 105.8382 },
          { id: 'hai-ba-trung', name: 'Hai Bà Trưng', latitude: 21.0445, longitude: 105.8342 },
          { id: 'kim-ma', name: 'Kim Mã', latitude: 21.0395, longitude: 105.8252 },
        ]
      },
      {
        id: 'hoan-kiem',
        name: 'Hoàn Kiếm',
        latitude: 21.0285,
        longitude: 105.8542,
        communes: [
          { id: 'hoan-kiem-1', name: 'Hoàn Kiếm 1', latitude: 21.0285, longitude: 105.8542 },
          { id: 'hang-dau', name: 'Hàng Dầu', latitude: 21.0255, longitude: 105.8592 },
        ]
      },
      {
        id: 'hai-ba-trung',
        name: 'Hai Bà Trưng',
        latitude: 21.0155,
        longitude: 105.8642,
        communes: [
          { id: 'hang-gai', name: 'Hàng Gai', latitude: 21.0185, longitude: 105.8642 },
          { id: 'ma-may', name: 'Mã Mây', latitude: 21.0155, longitude: 105.8692 },
        ]
      }
    ]
  },
  {
    id: 'ho-chi-minh',
    name: 'Thành phố Hồ Chí Minh',
    latitude: 10.7769,
    longitude: 106.7009,
    region: 'Miền Nam',
    districts: [
      {
        id: 'district-1',
        name: 'Quận 1',
        latitude: 10.7769,
        longitude: 106.7009,
        communes: [
          { id: 'ben-thanh', name: 'Bến Thành', latitude: 10.7719, longitude: 106.7109 },
          { id: 'co-giac', name: 'Cô Giang', latitude: 10.7769, longitude: 106.7009 },
          { id: 'da-kao', name: 'Đa Kao', latitude: 10.7819, longitude: 106.6909 },
        ]
      },
      {
        id: 'district-3',
        name: 'Quận 3',
        latitude: 10.7919,
        longitude: 106.6809,
        communes: [
          { id: 'ba-viet', name: 'Ba Việt', latitude: 10.7919, longitude: 106.6809 },
          { id: 'vo-thi-sau', name: 'Võ Thị Sáu', latitude: 10.7869, longitude: 106.6859 },
        ]
      },
      {
        id: 'district-7',
        name: 'Quận 7',
        latitude: 10.7319,
        longitude: 106.7309,
        communes: [
          { id: 'tan-phu', name: 'Tân Phú', latitude: 10.7369, longitude: 106.7259 },
          { id: 'tan-thuan-tay', name: 'Tân Thuận Tây', latitude: 10.7319, longitude: 106.7359 },
        ]
      }
    ]
  },
  {
    id: 'da-nang',
    name: 'Đà Nẵng',
    latitude: 16.0544,
    longitude: 108.2022,
    region: 'Trung Bộ',
    districts: [
      {
        id: 'hai-chau',
        name: 'Hải Châu',
        latitude: 16.0644,
        longitude: 108.2122,
        communes: [
          { id: 'thanh-khe', name: 'Thạnh Khê', latitude: 16.0644, longitude: 108.2122 },
          { id: 'an-khe', name: 'An Khê', latitude: 16.0594, longitude: 108.2072 },
        ]
      },
      {
        id: 'son-tra',
        name: 'Sơn Trà',
        latitude: 16.0944,
        longitude: 108.2422,
        communes: [
          { id: 'my-khe', name: 'Mỹ Khê', latitude: 16.0944, longitude: 108.2422 },
          { id: 'tho-quang', name: 'Thọ Quang', latitude: 16.0894, longitude: 108.2372 },
        ]
      }
    ]
  },
  {
    id: 'can-tho',
    name: 'Cần Thơ',
    latitude: 10.0379,
    longitude: 105.7869,
    region: 'Miền Nam',
    districts: [
      {
        id: 'ninh-kieu',
        name: 'Ninh Kiều',
        latitude: 10.0379,
        longitude: 105.7869,
        communes: [
          { id: 'tan-an', name: 'Tân An', latitude: 10.0379, longitude: 105.7869 },
          { id: 'tan-thoi', name: 'Tân Thới', latitude: 10.0329, longitude: 105.7919 },
        ]
      },
      {
        id: 'binh-thuy',
        name: 'Bình Thủy',
        latitude: 10.0079,
        longitude: 105.7569,
        communes: [
          { id: 've-sau', name: 'Vệ Sau', latitude: 10.0079, longitude: 105.7569 },
          { id: 'dong-thap', name: 'Đông Tháp', latitude: 10.0129, longitude: 105.7619 },
        ]
      }
    ]
  },
  {
    id: 'hai-phong',
    name: 'Hải Phòng',
    latitude: 20.8449,
    longitude: 106.6881,
    region: 'Miền Bắc',
    districts: [
      {
        id: 'hong-bang',
        name: 'Hồng Bàng',
        latitude: 20.8449,
        longitude: 106.6881,
        communes: [
          { id: 'hang-dau-hai-phong', name: 'Hàng Dâu', latitude: 20.8449, longitude: 106.6881 },
          { id: 'hang-khoai', name: 'Hàng Khoai', latitude: 20.8399, longitude: 106.6931 },
        ]
      },
      {
        id: 'le-chan',
        name: 'Lê Chân',
        latitude: 20.8549,
        longitude: 106.6781,
        communes: [
          { id: 'phu-lien', name: 'Phú Liên', latitude: 20.8549, longitude: 106.6781 },
          { id: 'ngo-quyen', name: 'Ngô Quyền', latitude: 20.8599, longitude: 106.6731 },
        ]
      }
    ]
  },
  {
    id: 'hue',
    name: 'Huế',
    latitude: 16.4637,
    longitude: 107.5909,
    region: 'Trung Bộ',
    districts: [
      {
        id: 'hue-city',
        name: 'Huế',
        latitude: 16.4637,
        longitude: 107.5909,
        communes: [
          { id: 'phu-hau', name: 'Phú Hậu', latitude: 16.4637, longitude: 107.5909 },
          { id: 'phu-hiep', name: 'Phú Hiệp', latitude: 16.4587, longitude: 107.5959 },
        ]
      },
      {
        id: 'phu-vang',
        name: 'Phú Vang',
        latitude: 16.3837,
        longitude: 107.5109,
        communes: [
          { id: 'tam-thanh', name: 'Tam Thạnh', latitude: 16.3837, longitude: 107.5109 },
          { id: 'vinh-thanh', name: 'Vĩnh Thạnh', latitude: 16.3887, longitude: 107.5159 },
        ]
      }
    ]
  },
  {
    id: 'da-lat',
    name: 'Đà Lạt',
    latitude: 11.9404,
    longitude: 108.4453,
    region: 'Tây Nguyên',
    districts: [
      {
        id: 'da-lat-city',
        name: 'Đà Lạt',
        latitude: 11.9404,
        longitude: 108.4453,
        communes: [
          { id: 'ward-1', name: 'Phường 1', latitude: 11.9404, longitude: 108.4453 },
          { id: 'ward-2', name: 'Phường 2', latitude: 11.9354, longitude: 108.4503 },
        ]
      }
    ]
  },
  {
    id: 'nha-trang',
    name: 'Nha Trang',
    latitude: 12.2588,
    longitude: 109.1967,
    region: 'Trung Bộ',
    districts: [
      {
        id: 'nha-trang-city',
        name: 'Nha Trang',
        latitude: 12.2588,
        longitude: 109.1967,
        communes: [
          { id: 'tan-lap', name: 'Tân Lập', latitude: 12.2588, longitude: 109.1967 },
          { id: 'vinh-phuong', name: 'Vĩnh Phương', latitude: 12.2538, longitude: 109.2017 },
        ]
      }
    ]
  },
  {
    id: 'quang-ninh',
    name: 'Quảng Ninh',
    latitude: 21.0097,
    longitude: 107.2953,
    region: 'Miền Bắc',
    districts: [
      {
        id: 'ha-long',
        name: 'Hạ Long',
        latitude: 20.9550,
        longitude: 107.0439,
        communes: [
          { id: 'bai-chay', name: 'Bãi Cháy', latitude: 20.9550, longitude: 107.0439 },
          { id: 'hong-gai', name: 'Hồng Gai', latitude: 20.9600, longitude: 107.0389 },
        ]
      }
    ]
  },
  {
    id: 'thanh-hoa',
    name: 'Thanh Hóa',
    latitude: 19.8099,
    longitude: 105.7741,
    region: 'Miền Bắc',
    districts: [
      {
        id: 'thanh-hoa-city',
        name: 'Thành phố Thanh Hóa',
        latitude: 19.8099,
        longitude: 105.7741,
        communes: [
          { id: 'le-loi', name: 'Lê Lợi', latitude: 19.8099, longitude: 105.7741 },
          { id: 'tran-hung-dao', name: 'Trần Hưng Đạo', latitude: 19.8049, longitude: 105.7791 },
        ]
      }
    ]
  },
  {
    id: 'vinh',
    name: 'Vinh',
    latitude: 18.6867,
    longitude: 105.6876,
    region: 'Trung Bộ',
    districts: [
      {
        id: 'vinh-city',
        name: 'Thành phố Vinh',
        latitude: 18.6867,
        longitude: 105.6876,
        communes: [
          { id: 'cua-south', name: 'Cửa Nam', latitude: 18.6867, longitude: 105.6876 },
          { id: 'cua-north', name: 'Cửa Bắc', latitude: 18.6917, longitude: 105.6826 },
        ]
      }
    ]
  },
  {
    id: 'hai-duong',
    name: 'Hải Dương',
    latitude: 20.9475,
    longitude: 106.3181,
    region: 'Miền Bắc',
    districts: [
      {
        id: 'hai-duong-city',
        name: 'Thành phố Hải Dương',
        latitude: 20.9475,
        longitude: 106.3181,
        communes: [
          { id: 'ho-nam', name: 'Hồ Nam', latitude: 20.9475, longitude: 106.3181 },
          { id: 'ho-bac', name: 'Hồ Bắc', latitude: 20.9525, longitude: 106.3131 },
        ]
      }
    ]
  },
  {
    id: 'lang-son',
    name: 'Lạng Sơn',
    latitude: 21.8545,
    longitude: 106.7567,
    region: 'Miền Bắc',
    districts: [
      {
        id: 'lang-son-city',
        name: 'Thành phố Lạng Sơn',
        latitude: 21.8545,
        longitude: 106.7567,
        communes: [
          { id: 'dong-kinh', name: 'Đông Kinh', latitude: 21.8545, longitude: 106.7567 },
          { id: 'tay-kinh', name: 'Tây Kinh', latitude: 21.8495, longitude: 106.7617 },
        ]
      }
    ]
  }
];

export const VIETNAM_PROVINCES: Province[] = _fullData && _fullData.length > 0 ? _fullData : DEFAULT_VIETNAM_PROVINCES;

// Helper functions
export const getProvinceById = (id: string): Province | undefined => {
  return VIETNAM_PROVINCES.find(p => p.id === id);
};

export const getDistrictById = (provinceId: string, districtId: string): District | undefined => {
  const province = getProvinceById(provinceId);
  return province?.districts.find(d => d.id === districtId);
};

export const getCommuneById = (provinceId: string, districtId: string, communeId: string): Commune | undefined => {
  const district = getDistrictById(provinceId, districtId);
  return district?.communes.find(c => c.id === communeId);
};

export const getProvincesByRegion = (region: string): Province[] => {
  return VIETNAM_PROVINCES.filter(p => p.region === region);
};
