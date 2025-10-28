import { Component, OnInit, Input } from '@angular/core';
import { Api } from '../../../services/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MyUtilityButton } from '../../../utility-components/my-utility-button/my-utility-button';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormArray } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { RequirementItem, RequirementsResponse } from '../../../interfaces/client-requirement';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RequirementsContact } from '../../../interfaces/requirements';
import { Practices, EmployeesWithPractices } from '../../../interfaces/role-management';
import { RoleAssignment, RoleAssignmentItems } from '../../../interfaces/role-management';
import { ClientsData } from '../../../interfaces/clients';
import { ClientItem } from '../../../interfaces/clients';
import { PaginationUtility } from '../../../utility-components/pagination-utility/pagination-utility';

@Component({
  selector: 'app-client-requirements',
  imports: [
    RouterModule, 
    CommonModule, 
    MyUtilityButton, PaginationUtility,
    MatFormFieldModule, ReactiveFormsModule, FormsModule,
    MatInputModule, MatOptionModule, MatAutocompleteModule, MatSelectModule, MatProgressSpinnerModule, MatNativeDateModule, MatDatepickerModule,
    DatePipe,
  ],
  templateUrl: './client-requirements.html',
  styleUrl: './client-requirements.css'
})
export class ClientRequirements implements OnInit {

  clientRequirement: RequirementItem[] = [];

  isLoading: boolean = false;

  AddNewClientRequirementForm!: FormGroup
  isAddNewClientRequirementFormOpen: boolean = false;
  isAddNewClientRequirementFormSubmitted: boolean = false;
  savedContacts: RequirementsContact[] = [];
  saveContact: boolean = false;
  addContactsFormOpen: boolean = false;
  employeeWithPractices!: EmployeesWithPractices[];
  practices!: Practices[];
  roleAssignmentItem!: RoleAssignmentItems[];
  recruiters!: RoleAssignmentItems[];

  selectedFile: File | null = null;
  fileName: string = '';

  client?: ClientItem[] = [];
  clientName!: string;
  // clientId!: string;

  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;

   @Input() clientId!: string;

  plusIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>
`;

  constructor(private api: Api, private router: RouterModule, private fb: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit(): void {

    this.AddNewClientRequirementForm = this.fb.group({
      // selectClient : ['', Validators.required],
      requirementTitle: ['', Validators.required],
      recruiter: [''],
      selectStatus: ['Open', Validators.required],
      selectPriority: ['Low', Validators.required],
      startDate: [''],
      relatedExperience: ['', Validators.required],
      totalExperience: ['', Validators.required],
      positions: ['1', Validators.required],
      location: ['', Validators.required],
      skills: [''],
      description: [''],
      relatedPractices: [''],
      attachments: [File],
      contacts: this.fb.array([])
    })


    // this.clientId = this.route.snapshot.paramMap.get('client_id')!;
    console.log('Requirement ID:', this.clientId);
    this.loadClientRequirementData(this.clientId);
    this.getAllPractices();
    this.loadRecruiters();
    this.loadClientData(this.clientId);
    this.getPractices();

    

  }


  loadClientRequirementData(clientId: string) {
    this.api.getClientRequirementData(clientId).subscribe({
      next: (data: RequirementsResponse) => {
        this.clientRequirement = data.items;
        const matchedName = data.items.find(job => job.id === clientId);
        this.clientName = matchedName ? matchedName.client_name : '';
        console.log("clientName: ", this.clientName);

        console.log("Successfully fetched data from client Requirements", data.items);
      },
      error: (err) => {
        console.log("Error while fetching data from client requirements", err);
      }
    })
  }

  loadClientData(clientId: string) {
    this.api.getClientsData().subscribe({
      next: (data: ClientsData) => {
        this.client = data.items;

        const matchedName = data.items.find(job => job.id === clientId);
        this.clientName = matchedName ? matchedName.name : '';
        console.log("clientName: ", this.clientName);
        console.log("Data from client api", data);
      },
      error: (err) => {
        console.log("Error while fetching data from client", err);
      }
    })
  }

  loadRecruiters() {
    this.api.getRoleAssignmentData().subscribe({
      next: (data: RoleAssignment) => {
        this.roleAssignmentItem = data.items;

        this.recruiters = this.roleAssignmentItem.filter((e) => e.role_display_name === 'Recruiter');

      },
      error: (err) => {
        console.log("Error while fetching data");
      }
    })
  }

  getPractices() {
    this.api.getEmployeeWithPracticesData().subscribe({
      next: (data: RoleAssignment) => {
        this.employeeWithPractices = data.employees_with_practices;
        console.log("Employee with practices data successfully fetched", data.employees_with_practices);
      },
      error: (err) => {
        console.log("Error while fetching employee with practices data", err);
      }
    })
  }

  getAllPractices(): Practices[] {
    if (!this.employeeWithPractices) return [];
    const allPractices: Practices[] = [];
    this.employeeWithPractices.forEach(emp => {
      if (emp.practices && emp.practices.length) {
        allPractices.push(...emp.practices);
      }
    });
    
    return allPractices.filter(
      (p, index, self) =>
        index === self.findIndex(t => t.practice_id === p.practice_id)
    );
  }

  loadClientRequirementsPaginationData(clientId: string, page: number, pageSize: number) {
    this.api.getClientRequirementsPaginationData(clientId, page, pageSize).subscribe({
        next: (res: RequirementsResponse) => {
          this.clientRequirement = res.items || [];
          this.totalItems = res.total || 0;
          // this.filteredRequirements = this.requirementsData;
          this.pageSize = res.page_size || pageSize;
          this.currentPage = res.page || page;
          this.isLoading = false;
          console.log('Paginated clients:', res);
  
        },
        error: (err) => {
          console.log("Error while fetching candidates pagination data", err);
        }
      })
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
       this. loadClientRequirementsPaginationData(this.clientId, this.currentPage, this.pageSize);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
       this. loadClientRequirementsPaginationData(this.clientId, this.currentPage, this.pageSize);
    }
  }

  loadPage() {
     this. loadClientRequirementsPaginationData(this.clientId, this.currentPage, this.pageSize);
  }
  

   onPageSizeChange(pageSize: number) {
  this.pageSize = pageSize;
  this.currentPage = 1;
  this. loadClientRequirementsPaginationData(this.clientId, this.currentPage, this.pageSize);

}


  onJumpToPage(page: number) {
  this.currentPage = page;
  this. loadClientRequirementsPaginationData(this.clientId, this.currentPage, this.pageSize);
}

 onPageChange(page: number) {
  this.currentPage = page;
  this. loadClientRequirementsPaginationData(this.clientId, this.currentPage, this.pageSize);
}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
      this.AddNewClientRequirementForm.patchValue({ attachments: this.selectedFile });
    }
  }

  private convertFileToDocument(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve({
          filename: file.name,
          filetype: file.type,
          filedata: base64Data,
        });
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }


  get contacts() {
    return this.AddNewClientRequirementForm.get('contacts') as FormArray;
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

  openAddNewRequirementForm() {
    this.isAddNewClientRequirementFormOpen = true;
  }

  closeAddNewClientRequirementForm() {
    this.isAddNewClientRequirementFormOpen = false;
  }

  async onAddNewClientRequirementFormSubmit() {

    this.isAddNewClientRequirementFormSubmitted = true;
    console.log(" Add New Client Form Submitted", this.AddNewClientRequirementForm.value);

    const client_id = this.clientId;
    const title = this.AddNewClientRequirementForm.value.requirementTitle;
    const recruiter_role_ids = [this.AddNewClientRequirementForm.value.recruiter];
    const status = this.AddNewClientRequirementForm.value.selectStatus;
    const priority = this.AddNewClientRequirementForm.value.selectPriority;
    const start_date = this.AddNewClientRequirementForm.value.startDate;
    const relative_experience = this.AddNewClientRequirementForm.value.relatedExperience;
    const total_experience = this.AddNewClientRequirementForm.value.totalExperience;
    const positions = this.AddNewClientRequirementForm.value.positions;
    const location = this.AddNewClientRequirementForm.value.location;
    const skills_required = this.AddNewClientRequirementForm.value.skills;
    const description = this.AddNewClientRequirementForm.value.description;
    const practice_ids = [this.AddNewClientRequirementForm.value.relatedPractices];
    // const documents = this.AddNewClientRequirementForm.value.attachments;
    const contacts = this.AddNewClientRequirementForm.value.contacts;

    let documents: any[] = [];
    if (this.selectedFile) {
      const documentObj = await this.convertFileToDocument(this.selectedFile);
      documents = [documentObj];
    }


    this.api.postClientRequirements(client_id, title, recruiter_role_ids, status, priority, start_date, relative_experience, total_experience,
      positions, location, skills_required, description, practice_ids, documents, contacts

    ).subscribe({
      next: (data) => {
        console.log("Successfully posted candidates data", data);
        this.loadClientRequirementData(this.clientId);
        this.AddNewClientRequirementForm.reset();
        this.closeAddNewClientRequirementForm();
      },
      error: (err) => {
        console.log("Error while posting the client requirements data", err);
      }
    })
  }

}
