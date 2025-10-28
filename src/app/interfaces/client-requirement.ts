export interface RequirementItem {
  id: string;
  title: string;
  positions: number;
  positions_fulfilled: number;
  status: string;
  client_name: string;
  clientId: string;
  resources_count: number;
  start_date: string;     
  location: string;
  created_date: string;   
  priority: string;
}

export interface RequirementsResponse {
  total: number;
  page: number;
  page_size: number;
  items: RequirementItem[];
}

export interface ClientRequirementContact {
  id: string;
  name: string;
  email: string;
  phone: string;
}
