export interface RoleAssignment {
    employees: Employees[];
    employees_with_practices: EmployeesWithPractices[];
    items: Items[];
    roles: Roles[];
}

export interface Employees{
    name: string;
    email: string;
    employee_id: number;
}

export interface EmployeesWithPractices{
    employee_id: number;
    employee_name: string;
    employee_email: string;
    practices: Practices[];
}

export interface Practices{
    practice_id: number;
    practice_name: string;
}

export interface Items{
    created_at?: Date;
    updated_at?: Date;
    id: number;
    employee_id: number;
    employee_name: string;
    employee_email: string;
    practices: Practices[];
    isActive?: boolean;
    role_id: number;
    role_name: string;
    role_display_name: string;
}

export interface Roles{
    id: number;
    name: string;
    display_name: string;
    type? : string;
}

export interface EmpRoles{
    emp_id: number;
    name: string;
    email: string;
    roles: { role: string }[] 
    // practices?: [];
    // actions?: [];
}
