import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';
import { CommonModule } from '@angular/common';
import { Employees, EmployeeRoles, RoleAssignmentItems, EmployeesWithPractices, Practices } from '../../interfaces/role-management';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Roles } from '../../interfaces/role-management';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoaderService } from '../../services/loader-service';
import { Observable } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { startWith } from 'rxjs/operators';
import { MyUtilityButton } from '../../utility-components/my-utility-button/my-utility-button';
import { RouterModule, Routes } from '@angular/router';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';


@Component({
  selector: 'app-role-assignment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, FormsModule,
    MatInputModule, MatAutocompleteModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule,
    NgSelectModule,
    MyUtilityButton
  ],
  templateUrl: './role-assignment.html',
  styleUrl: './role-assignment.css'
})
export class RoleAssignmentComponent implements OnInit {

  roleAssignmentData?: RoleAssignmentItems[];
  employeeWithPractices?: EmployeesWithPractices[];
  practices?: Practices[];
  employees!: Employees[];
  empRoles: EmployeeRoles[] = [];
  roles: Roles[] = [];

  assignRoleForm!: FormGroup;
  isAssignRoleFormOpen = false;
  isAssignRoleFormSubmitted: boolean = false;
  error: boolean = false;

  employeeFilter: string = '';
  filteredEmployees: any[] = [];

  employeeSearchCtrl = new FormControl('');
  filteredEmployees$: Observable<Employees[]> = new Observable<Employees[]>();

  isLoading: boolean = false;

  shieldIcon =
    `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
  class="lucide lucide-shield w-4 h-4 ">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
  </svg>
  `;

  constructor(private api: Api, private fb: FormBuilder) { }

  ngOnInit() {
    this.assignRoleForm = this.fb.group({
      selectedEmployee: ['', Validators.required],
      selectedRole: [[], Validators.required]
    });

    this.setupSearchListener();
    // this.loadEmployeePracticesData();
    this.loadRoleAssignmentData();
  }


  loadRoleAssignmentData() {
    this.api.getRoleAssignmentData().subscribe({
      next: d => {
        this.roleAssignmentData = d.items;
        this.employeeWithPractices = d.employees_with_practices;
        this.employees = d.employees;
        this.roles = d.roles;

        const map = new Map<number, {
          emp_id: number;
          name: string;
          email: string;
          roleSet: string[];
          practices: string[];
        }>();

       
        for (const item of this.roleAssignmentData) {
          const empId = item.employee_id;
          const name = item.employee_name?.trim();
          const email = item.employee_email?.trim();
          const roleName = item.role_display_name;

         
          const empPractices = this.employeeWithPractices?.find(e => e.employee_id === empId)?.practices.map(p => p.practice_name) || [];

          if (!map.has(empId)) {
            map.set(empId, {
              emp_id: empId,
              name,
              email,
              roleSet: [roleName],
              practices: empPractices
            });
          } else {
            map.get(empId)!.roleSet.push(roleName);
            map.get(empId)!.practices = empPractices; 
          }
        }

        this.empRoles = Array.from(map.values()).map(emp => ({
          emp_id: emp.emp_id,
          name: emp.name,
          email: emp.email,
          roles: emp.roleSet.map(role => ({ role })),
          rolesDisplay: emp.roleSet.join(', '),
          practices: emp.practices,

        }));

        
        const assignedEmpIds = new Set(this.empRoles.map(e => e.emp_id));
        const filteredEmp = this.employees.filter(e => !assignedEmpIds.has(e.employee_id));
        this.employees = filteredEmp;
        this.filteredEmployees = [...this.employees];
      },
      error: err => {
        console.error('Error while fetching Role Assignment Data:', err);
      }
    });
  }

  setupSearchListener() {
    this.employeeSearchCtrl.valueChanges.pipe(startWith('')).subscribe(searchText => {
      const lowerSearch = searchText?.toLowerCase() || '';
      this.filteredEmployees = this.employees.filter(emp =>
        emp.name.toLowerCase().includes(lowerSearch)
      );
    });
  }

  onEmployeeSelected(event: MatAutocompleteSelectedEvent) {
    const selectedName = event.option.value;
    const selectedEmp = this.employees.find(e => e.name === selectedName);

    if (selectedEmp) {
      this.assignRoleForm.get('selectedEmployee')?.setValue(selectedEmp.employee_id);
    }
  }

  openAssignRoleForm() {
    this.isAssignRoleFormOpen = true;
  }

  closeAssignRoleForm() {
    this.assignRoleForm.reset();
    this.isAssignRoleFormOpen = false;
  }

  onAssignRoleFormSubmit() {
    this.isAssignRoleFormSubmitted = true;

    if (this.assignRoleForm.invalid) {
      this.error = true;
      return;
    }

    this.isLoading = true;

    const employee_id = this.assignRoleForm.value.selectedEmployee;
    const role_ids = this.assignRoleForm.value.selectedRole;

    this.api.PostAssignRoles(employee_id, role_ids).subscribe({
      next: () => {
        console.log('Role assigned successfully');
        this.assignRoleForm.reset();
        this.employeeSearchCtrl.setValue('');
        this.closeAssignRoleForm();
        this.loadRoleAssignmentData();
        this.isLoading = false;
      },
      error: err => {
        console.error('Error during role assignment:', err);
        this.isLoading = false;
      }
    });
  }
}
