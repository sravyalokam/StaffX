import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoleAssignmentItems } from '../../interfaces/role-management';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ClientContact } from '../../interfaces/clients';
import { MyUtilityButton } from '../../utility-components/my-utility-button/my-utility-button';
import { ClientItem } from '../../interfaces/clients';
import { ClientsData } from '../../interfaces/clients';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaginationUtility } from '../../utility-components/pagination-utility/pagination-utility';
import { ClientRequirements } from './client-requirements/client-requirements';
import { Requirements } from '../requirements/requirements';
import { Candidates } from '../requirements/candidates/candidates';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule,
    CommonModule, 
    MatFormFieldModule, MatSelectModule, MatOptionModule, MatInputModule, MatAutocompleteModule, MatCheckboxModule,  MatPaginatorModule, MatProgressSpinnerModule,
    MyUtilityButton, PaginationUtility, ClientRequirements, Requirements, Candidates,
    RouterModule
  ],
  templateUrl: './clients.html',
  styleUrls: ['./clients.css']
})
export class Clients implements OnInit {

  clientsData?: ClientItem[] = [];

  addNewClientForm!: FormGroup;
  isAddNewClientFormOpen: boolean = false;
  isAddNewClientFormSubmitted: boolean = false;
  salesManagers!: RoleAssignmentItems[];
  savedContacts: ClientContact[] = [];
  saveContact: boolean = false;
  addContactsFormOpen: boolean = false;
  salesManagerFilterControl = new FormControl('');
  filteredSalesEmployees: RoleAssignmentItems[] = [];
  accountManagerFilterControl = new FormControl('');
  filteredAccountEmployees: RoleAssignmentItems[] = [];
  isSubmitting: boolean = false;

  roleAssignment!: RoleAssignmentItems[];
  accountManagers!: RoleAssignmentItems[];

  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  isLoading: boolean = false;

  selectedClientId! : string;

  showClientsComponent: boolean = true;
  showRequirementsComponent: boolean = false;

  private readonly ACCOUNT_MANAGER_ROLE = 'Account Manager';
  private readonly SALES_MANAGER_ROLE = 'Sales Manager';

  plusIcon =
  `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
    </svg>
  `;

  constructor(private api: Api, private fb: FormBuilder, private router: RouterModule) { }

  ngOnInit(): void {
    this.addNewClientForm = this.fb.group({
      ClientName: ['', Validators.required],
      Location: ['', Validators.required],
      AccountManagers: [[]],
      SalesManagers: [[]],
      Contacts: this.fb.array([]),
    });

    this.loadClientsData();
    this.loadRoleAssignmentData();
    this.loadClientsPaginationData(this.currentPage, this.pageSize);
  }

  loadClientsData(): void {
    this.api.getClientsData().subscribe({
      next: (c: ClientsData) => {
        this.clientsData = c.items;
        console.log("Data from client api", c.items);
      },
      error: err => {
        console.log("Error while fetching data from client");
      }
    });
  }

  loadRoleAssignmentData() {
    this.api.getRoleAssignmentData().subscribe({
      next: (d) => {
        this.roleAssignment = d.items;

        this.accountManagers = this.roleAssignment.filter(
          (e) => e.role_display_name === this.ACCOUNT_MANAGER_ROLE
        );
        this.filteredAccountEmployees = [...this.accountManagers];
        console.log("Account Managers", this.accountManagers);

        this.salesManagers = this.roleAssignment.filter(
          (e) => e.role_display_name === this.SALES_MANAGER_ROLE
        );
        this.filteredSalesEmployees = [...this.salesManagers];
        console.log("Sales Managers", this.salesManagers);
      },
      error: (err) => {
        console.log("Error while fetching the role assignment data", err);
      }
  });

  this.salesManagerFilterControl.valueChanges.subscribe((value) => {
      const search = value?.toLowerCase() || '';
      this.filteredSalesEmployees = this.salesManagers.filter((manager) =>
        manager.employee_name.toLowerCase().includes(search)
    );
  });

  this.accountManagerFilterControl.valueChanges.subscribe((value) => {
      const search = value?.toLowerCase() || '';
      this.filteredAccountEmployees = this.accountManagers.filter((manager) =>
      manager.employee_name.toLowerCase().includes(search)
      );
    });
  }

  toggleRequirementsComponent(index: string) {
    // this.index = this.showCandidatesIndex === index ? null : index;
    this.selectedClientId = index;
    this.showClientsComponent = false;
    this.showRequirementsComponent = true;
    console.log("Selected cliend Id", this.selectedClientId);
  }


  loadClientsPaginationData(page: number, pageSize: number) {
    this.isLoading = true;
    this.api.getClientPaginationData(page, pageSize).subscribe({
      next: (res: ClientsData) => {
        this.clientsData = res.items || [];
        this.totalItems = res.total || 0;
        this.pageSize = res.page_size || pageSize;
        this.currentPage = res.page || page;
        this.isLoading = false;
        console.log('Paginated clients:', res);
      },
      error: (err) => {
        console.error('Failed to load clients:', err);
        this.isLoading = false;
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }


  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadClientsPaginationData(this.currentPage, this.pageSize);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadClientsPaginationData(this.currentPage, this.pageSize);
    }
  }

  loadPage() {
    this.loadClientsPaginationData(this.currentPage, this.pageSize);
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.loadClientsPaginationData(this.currentPage, this.pageSize);
  }


  onJumpToPage(page: number) {
    this.currentPage = page;
    this.loadClientsPaginationData(this.currentPage, this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadClientsPaginationData(this.currentPage, this.pageSize);
  }


  get contacts() {
    return this.addNewClientForm.get('Contacts') as FormArray;
  }

  addContact(): void {
    this.addContactsFormOpen = true;
    this.contacts.push(this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    }));
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  cancelContact(index: number): void {
    this.contacts.removeAt(index);
    this.saveContact = false;
  }

  saveContactInfo(index: number): void {
    const contactGroup = this.contacts.at(index);

    if (contactGroup.valid) {
      const contact = contactGroup.value;
      this.savedContacts.push(contact);
      this.contacts.removeAt(index);
      this.saveContact = true;
      this.saveContactsInformation();
    } else {
      contactGroup.markAllAsTouched();
    }
  }

  saveContactsInformation(): void {
    console.log("Contacts", this.savedContacts);
  }

  openAddClientForm(): void {
    this.isAddNewClientFormOpen = true;
  }

  closeAddClientForm(): void {
    this.isAddNewClientFormOpen = false;
    this.addNewClientForm.reset();
    this.savedContacts = [];
  }

  addContactFormSubmit(): void {
    this.addContactsFormOpen = false;
    this.contacts.reset();
  }

  onAddClientSubmit(): void {
    this.isAddNewClientFormSubmitted = true;
    console.log("Form data", this.addNewClientForm.value);
    this.isLoading = true;

    if (this.addNewClientForm.valid) {
      const formValue = this.addNewClientForm.value;

      const payload = {
        name: formValue.ClientName,
        location: formValue.Location,
        account_manager_role_ids: formValue.AccountManagers.map((manager: RoleAssignmentItems) => manager.id),
        sales_manager_role_ids: formValue.SalesManagers.map((manager: RoleAssignmentItems) => manager.id),
        contacts: this.savedContacts
      };

      console.log("Payload", payload);

      this.api.PostAddClient(payload).subscribe({
        next: () => {
          console.log('Client added successfully');
          this.loadClientsData();
          this.addNewClientForm.reset();
          this.contacts.clear();
          this.savedContacts = [];
          this.isAddNewClientFormOpen = false;
          this.isLoading = false;
        },
        error: (err) => {
          this.isAddNewClientFormOpen = false;
          console.error('Error posting the add client data', err);
          this.isLoading = false;
        }
      });
    }
  }

}
