export interface RequirementsData {
  total: number;
  page: number;
  page_size: number;
  items: RequirementsItem[];
}

export interface RequirementsItem {
  id: string;
  title: string;
  positions: number;
  positions_fulfilled: number;
  status: 'Open' | 'Fulfilled' | 'On Hold' | 'Cancelled' | 'Closed';
  client_name: string;
  clientId: string;
  resources_count: number;
  created_date : string;
  start_date: string | null; 
  location: string;
  priority: string;
  contacts : RequirementsContact[];
}

export interface RequirementsContact {
  id: string;
  name: string;
  email: string;
  phone: string;
}
