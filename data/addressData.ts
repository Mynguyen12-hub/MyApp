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
