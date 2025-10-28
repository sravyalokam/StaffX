import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoleAssignmentComponent } from './features/role-assignment/role-assignment';
import { Clients } from './features/clients/clients';
import { SideNavbar } from './side-navbar/side-navbar';
import { Vendors } from './features/vendors/vendors';
import { Requirements } from './features/requirements/requirements';
import { Employee, RootObject } from './interfaces/dashboard';
import { Api } from './services/api';

@Component({
  selector: 'app-root',
  imports: [  SideNavbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('app');

  currentEmployee?: Employee;

  constructor(private api : Api) {}

  ngOnInit(): void {
    this.api.getCurrentEmployeeData().subscribe({
      next: (data : RootObject) => {
        this.currentEmployee = data.employee;
        console.log("Successfully fetched current employee", data.employee);
      },
      error: (err) => {
        console.log("Error while fetching current employee data", err);
      }
    })
    
  }
  
}
