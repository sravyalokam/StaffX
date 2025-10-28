export interface VendorListResponse {
  total: number;
  page: number;
  page_size: number;
  items: VendorItems[];
}

export interface VendorItems {
  id: string;
  name: string;
  location: string;
  contacts: VendorContact[];
  resources_count: number;
}

export interface VendorContact {
  id: string;
  name: string;
  email: string;
  phone: string;
}
