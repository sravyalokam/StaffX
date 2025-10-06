import { Component, OnInit } from '@angular/core';
import { Api } from '../services/api';
import { CommonModule } from '@angular/common';
import { Employees, EmpRoles, Items } from '../interfaces/role-management';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Roles } from '../interfaces/role-management';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-role-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, 
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule 
  ],
  templateUrl: './role-assignment.html',
  styleUrl: './role-assignment.css'
})
export class RoleAssignmentComponent implements OnInit {

  assignRoleForm!: FormGroup;
  isOpenModel = false;

  data?: Items[];
  emp!: Employees[];
 
  empRoles: EmpRoles[] = [];
  roles: Roles[] = [];
  isSubmitted: boolean = false;

  error: boolean = false;

  constructor(private api: Api, private fb: FormBuilder) {}

  ngOnInit() {

    this.assignRoleForm = this.fb.group({
      selectedEmployee: ['', Validators.required],
      selectedRole: ['', Validators.required]
    });

    this.api.getData().subscribe({
      next: d => {
        this.data = d.items;
        this.emp = d.employees;
        this.roles = d.roles; 
        

        console.log('API response:', this.data);


        const map = new Map<number, {
          emp_id: number;
          name: string;
          email: string;
          roleSet: string[];
        }
        >();

        for (const item of this.data) {
          const empId = item.employee_id;
          const name = item.employee_name?.trim();
          const email = item.employee_email?.trim();
          const roleName = item.role_display_name;

          if (!map.has(empId)) {
            map.set(empId, {
              emp_id: empId,
              name,
              email,
              roleSet: [roleName]
            });
          } else {
            map.get(empId)!.roleSet.push(roleName);
          }
        }


        this.empRoles = Array.from(map.values()).map(emp => ({
          emp_id: emp.emp_id,
          name: emp.name,
          email: emp.email,
          roles: Array.from(emp.roleSet).map(role => ({ role }))
        }));

      const assignedEmpIds = new Set(this.empRoles.map(e => e.emp_id));

      const filteredEmp = this.emp.filter(e => !assignedEmpIds.has(e.employee_id));

      this.emp = filteredEmp;

      console.log(' empRoles:', this.empRoles);
      },
      error: err => {
        console.error('API error:', err);
      }
    });
  }

  openModel() {
    this.assignRoleForm.reset();
    this.isOpenModel = true;
    console.log("Model is open");
  }

  closeModel() {
    this.isOpenModel = false;
    this.assignRoleForm.reset();
  }

  onSubmit() {
  this.isSubmitted = true;
  if(this.assignRoleForm.invalid)
  {
    this.error=true;
    return;
  }
  if (this.assignRoleForm.valid) {
    const employee_id = this.assignRoleForm.value.selectedEmployee;
    const role_ids = [this.assignRoleForm.value.selectedRole]; 

    console.log("Submitting role assignment:", { employee_id, role_ids });

    this.api.AssignRoles(employee_id, role_ids).subscribe({
      next: () => {
        console.log('Role assigned successfully');
      },
      error: err => {
        console.error('Error:', err);
      }
    });
  } else {
    console.error('Form is invalid');
  }
}


}
