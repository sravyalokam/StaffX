export interface Employee {
  id: number;
  name: string;
  email: string;
  job_title: string;
  department: string;
  date_of_joining: string;
  is_active: boolean;
}

export interface AssignedRole {
  mapping_id: string;
  role_id: string;
  role_name: string;
  role_display_name: string;
  assigned_at: string;
  is_active: boolean;
}

export interface Practice {
  id: number;
  name: string;
  management_email: string;
  group_email: string;
  is_active: boolean;
}

export interface ConstantType {
  key: string;
  value: string;
}

export interface Constants {
  round_types: ConstantType[];
  interview_status_types: ConstantType[];
  requirement_status_types: ConstantType[];
  candidate_status_types: ConstantType[];
  resource_types: ConstantType[];
  priority_types: ConstantType[];
}

export interface Client {
  id: string;
  name: string;
}

export interface Vendor {
  id: string;
  name: string;
}

export interface RootObject {
  employee: Employee;
  assigned_roles: AssignedRole[];
  total_roles: number;
  practices: Practice[];
  constants: Constants;
  clients: Client[];
  vendors: Vendor[];
}
