export interface ClientContact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ClientAccess {
  id: string;
  employee_role_id: string;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  role_id: string;
  role_name: string;
}

export interface SalesManagerClientAccess {
  id: string;
  employee_role_id: string;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  role_id: string;
  role_name: string;
}

export interface ClientItem {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
  contacts: ClientContact[];
  jobs_count: number;
  client_accesses: ClientAccess[];
  sales_manager_client_accesses: SalesManagerClientAccess[];
}


export interface ClientsData {
  total: number;
  page: number;
  page_size: number;
  items: ClientItem[];
}
