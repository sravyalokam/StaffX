import { Component, OnInit, HostListener, Input } from '@angular/core';
import { Api } from '../../services/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RequirementsData } from '../../interfaces/requirements';
import { RequirementsItem } from '../../interfaces/requirements';
import { MyUtilityButton } from '../../utility-components/my-utility-button/my-utility-button';
import { FormBuilder, FormGroup, FormsModule, Validators, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common'; 
import { RoleAssignmentItems, RoleAssignment, Practices, EmployeesWithPractices } from '../../interfaces/role-management';
import { MatNativeDateModule } from '@angular/material/core'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RequirementsContact } from '../../interfaces/requirements';
import { FormArray } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CandidateDocumentUpload } from '../../interfaces/resources';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { map, startWith } from 'rxjs/operators';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgSelectModule } from '@ng-select/ng-select';
import { Candidates } from './candidates/candidates';
import { PaginationUtility } from '../../utility-components/pagination-utility/pagination-utility';
import { ClientItem, ClientsData } from '../../interfaces/clients';

@Component({
  selector: 'app-requirements',
  standalone: true, 
  imports: [ 
    RouterModule,  
    CommonModule, 
    MyUtilityButton, Candidates, PaginationUtility,
    MatFormFieldModule,  MatInputModule, MatOptionModule, MatAutocompleteModule,  MatSelectModule, MatProgressSpinnerModule,  MatNativeDateModule, MatDatepickerModule, MatPaginatorModule, MatCheckboxModule,
    ReactiveFormsModule, FormsModule, 
    DatePipe,
    NgSelectModule,
    ],
  templateUrl: './requirements.html',
  styleUrl: './requirements.css'
})
export class Requirements implements OnInit{

  requirementsData!: RequirementsItem[];

  searchTerm: string = '';
  filteredRequirements: RequirementsItem[] = [];

  showClientDropdown = false;
  showStatusDropdown = false;
  showPriorityDropdown = false;
  clientList: string[] = []; 
  selectedClient = 'All';
  
  allStatuses: string[] = [];
  allPriorities: string[] = [];

  roleAssignmentItem!: RoleAssignmentItems[];
  recruiters!: RoleAssignmentItems[] ;
  employeeWithPractices!: EmployeesWithPractices[];
  practices!: Practices[];

  AddNewRequirementForm! : FormGroup;
  isAddNewRequirementFormOpen: boolean = false;
  isAddNewRequirementFormSubmitted: boolean = false;
  savedContacts: RequirementsContact[] = [];
  saveContact: boolean = false;
  addContactsFormOpen: boolean = false;
  filteredClients: any[] = [];
  statuses: string[] = ['Open', 'Fulfilled', 'Cancelled', 'On Hold', 'Closed'];
  filteredStatuses: string[] = [];
  priorities: string[] = ['High', 'Medium', 'Low'];
  filteredPriorities: string[] = this.priorities;
  filteredPractices: any[] = [];


  
  recruiterFilterControl = new FormControl('');
  filteredRecruiters: RoleAssignmentItems[] = [];
  private readonly RECRUITER_ROLE = 'Recruiter';

  showCandidatesComponent: boolean = false;
  showRequirementsComponent: boolean = true;

  selectedRequirementId!: string;
  selectedRequirementTitle!: string | undefined;

  clientsData! : ClientItem[];

   currentView: 'requirements' | 'candidates' = 'requirements';

  fileName: string = '';
  selectedFile: File | null = null;

  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  isLoading: boolean = false;

  plusIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>
`;

   @Input() clientId!: string;

  constructor(private api : Api, private fb: FormBuilder) {}

  ngOnInit(): void {

    this.AddNewRequirementForm = this.fb.group({
      selectClient : ['', Validators.required],
      requirementTitle: ['', Validators.required],
      recruiter: [[]],
      selectStatus: ['Open',Validators.required],
      selectPriority: ['Low', Validators.required],
      startDate: [''],
      relatedExperience: ['', Validators.required],
      totalExperience: ['', Validators.required],
      positions: ['', Validators.required],
      location: ['', Validators.required],
      skills: [''],
      description: [''],
      relatedPractices: [''],
      attachments: [File],
      contacts: this.fb.array([])
    })

    if(this.clientId) {
      this.loadRequirementsDataByClientId(this.clientId, this.currentPage, this.pageSize);
    }
    else{
      this.loadRequirementsData(this.currentPage, this.pageSize);
    }
    // this.loadClientsData();
    this.loadRecruiters();
    this.getPractices();
    
    this.allStatuses = ['All', ...this.statuses];
    this.allPriorities = ['All', ...this.priorities];
    
    this.AddNewRequirementForm.get('selectStatus')?.valueChanges
      .pipe(
        startWith(''),
        map(value => value?.toLowerCase() || ''),
        map(value => this.statuses.filter(status => status.toLowerCase().includes(value)))
      )
      .subscribe(filtered => {
        this.filteredStatuses = filtered;
    });

    this.AddNewRequirementForm.get('selectPriority')!.valueChanges
  .pipe(
    startWith(''),
    map(value => (typeof value === 'string' ? value.toLowerCase() : '')),
    map(value => this.priorities.filter(priorityOption => priorityOption.toLowerCase().includes(value)))
  )
  .subscribe(filtered => {
    this.filteredPriorities = filtered;
  });

  this.AddNewRequirementForm.get('relatedPractices')!.valueChanges
    .pipe(
      startWith(''),
      map(value => {
        if (!value) return '';
        return typeof value === 'string'
          ? value.toLowerCase()
          : value.practice_name?.toLowerCase() || '';
      }),
      map(name => this._filterPractices(name))
    )
    .subscribe(filtered => {
      this.filteredPractices = filtered;
    });

  }

  loadRequirementsData(page: number, pageSize: number) {
    this.api.getRequirementsData(page, pageSize).subscribe({
      next: (data: RequirementsData) => {
        this.requirementsData = data.items;
        this.filteredClients = this.requirementsData;
        this.filteredRequirements = data.items;
        console.log("Data from Requirements Api", data.items);
        this.totalItems = data.total || 0;
        this.pageSize = data.page_size || pageSize;
        this.currentPage = data.page || page;
        this.isLoading = false;
        console.log('Paginated clients:', data);
        this.clientList = this.requirementsData.map(item => item.client_name);
        console.log("Client List", this.clientList);

     
      this.AddNewRequirementForm.get('selectClient')!.valueChanges
      .pipe(
        startWith(''),
        map(value => {
          if (typeof value === 'string') {
            return value;
          } else if (value && typeof value === 'object' && 'client_name' in value) {
            return value.client_name;
          } else {
            return '';
          }
        }),
        map(name => this._filterClients(name))
      )
      .subscribe(filtered => {
        this.filteredClients = filtered;
      });

      },
      error: (err) => {
        console.log("Error", err);
      }
    });
  }

  loadClientsData() {
    this.api.getClientsData().subscribe({
      next: (data : ClientsData) => {
        this.clientsData = data.items;
        console.log("Clients name", this.clientsData);
        
        this.clientList = this.clientsData.map(item => item.name);
        console.log("Client List", this.clientList);
      },
      error: (err) => {
        console.log("Error while fetching clients data", err);
      }
    })
  }

  loadRequirementsDataByClientId(clientId : string, page: number, pageSize: number) {
    this.api.getClientRequirementsDataByClientId(clientId, page, pageSize).subscribe({
      next: (data: RequirementsData) => {
        this.requirementsData = data.items;
        this.filteredRequirements = data.items;
      
        this.totalItems = data.total || 0;
        
        this.pageSize = data.page_size || pageSize;
        this.currentPage = data.page || page;
        this.isLoading = false;
        console.log('Paginated clients:', data);
        console.log("Requirements data by client id", this.filteredRequirements);
      },
      error: (err) => {
        console.log("Error while fetching requirements using cliend id", err);
      }
    })
  }

   showCandidates(requirement: { title: string }) {
      this.showRequirementsComponent = false;
      this.showCandidatesComponent = true;
    this.selectedRequirementId = requirement.title;
    console.log("selectedRequirementId", this.selectedRequirementId);
    this.currentView = 'candidates';
  }

  showRequirements() {
    this.currentView = 'requirements';
    this.showRequirementsComponent = true;
    this.showCandidatesComponent = false;
  }
  

  toggleCandidates(index: string) {
   
    this.selectedRequirementId = index;

    const selectedTitle = this.requirementsData.find((item) => item.id === this.selectedRequirementId);
    this.selectedRequirementTitle = selectedTitle?.title;

    console.log("Selected Requirement Title", this.selectedRequirementTitle);
    
    this.showRequirementsComponent = false;
    this.showCandidatesComponent = true;
  }


  private _filterClients(name: string): RequirementsItem[] {
    const filterValue = name.toLowerCase();
    return this.requirementsData.filter(client =>
      client.client_name.toLowerCase().includes(filterValue)
    );
  }


  displayClientName(client: any): string {
    if (!client) return '';
    return client.client_name || client.clientName || '';
  }

  displayPriority(priority: string): string {
    return priority || '';
  }

  private _filterPractices(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.getAllPractices().filter(p =>
      p.practice_name.toLowerCase().includes(filterValue)
    );
  }


  displayPracticeName(practice: any): string {
    return practice?.practice_name || '';
  }
  
  loadRecruiters() {
      this.api.getRoleAssignmentData().subscribe({
      next: (data: RoleAssignment) => {
        this.roleAssignmentItem = data.items;

      
        this.recruiters = this.roleAssignmentItem.filter(
          (e: RoleAssignmentItems) => e.role_display_name === this.RECRUITER_ROLE
        );

      
        this.filteredRecruiters = [...this.recruiters];

        
        this.recruiterFilterControl.valueChanges.subscribe((value) => {
          const search = value?.toLowerCase() || '';
          this.filteredRecruiters = this.recruiters.filter((r: RoleAssignmentItems) =>
            r.employee_name.toLowerCase().includes(search)
          );
        });

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
      error : (err) => {
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
      this.AddNewRequirementForm.patchValue({ attachments: this.selectedFile });
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


  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.loadRequirementsData(this.currentPage, this.pageSize);
  }


  onJumpToPage(page: number) {
    this.currentPage = page;
    this.loadRequirementsData(this.currentPage, this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRequirementsData(this.currentPage, this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRequirementsData(this.currentPage, this.pageSize);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRequirementsData(this.currentPage, this.pageSize);
    }
  }

  loadPage() {
      this.loadRequirementsData(this.currentPage, this.pageSize);
  }


  onSearchChange() {
    const term = this.searchTerm.toLowerCase();

    this.api.getRequirementsDataBySearch(term, term).subscribe({
      next: (data : RequirementsData) => {
        this.filteredRequirements = data.items;
        console.log("Search Requirements", data.items);
      },
      error: (err) => {
        console.log("Error while searching requirements", err);
      }
    })
  }

  filterRequirements(clientId: string | 'All', priority: string | 'All', status: string | 'All') {
  this.isLoading = true;

 
  const clientParam = clientId === 'All' ? '' : clientId;
  const priorityParam = priority === 'All' ? '' : priority;
  const statusParam = status === 'All' ? '' : status;

  this.api.getFilteredRequirements(clientParam, priorityParam, statusParam).subscribe({
    next: (data: RequirementsData) => {
      this.filteredRequirements = data.items;
      this.isLoading = false;
      console.log('Filtered Requirements:', data.items);
    },
    error: (err) => {
      console.error('Error while filtering requirements:', err);
      this.isLoading = false;
    }
  });
}



onClientSelect(client: any, event: Event) {
  event.stopPropagation();
  this.showClientDropdown = false;


  let client_id = '';
  if (typeof client === 'string') {
    
    const matchedClient = this.requirementsData.find(c => c.client_name === client);
    client_id = matchedClient ? matchedClient.clientId : '';
  } else if (client && client.clientId) {
    
    client_id = client.clientId;
  }

  this.selectedClient = client; 

  const priority = '';
  const status =  '';

  
  this.api.getFilteredRequirements(client_id, priority, status).subscribe({
    next: (res) => {
      this.filteredRequirements = res.items;
      console.log('Filtered by client:', res.items);
    },
    error: (err) => console.error('Error fetching filtered requirements:', err)
    });
  }

  selectStatus(status: string) {
    this.showStatusDropdown = false;

    const client = this.selectedClient || '';
    const priority =  '';

    if (status === 'All') {
      this.loadRequirementsData(this.currentPage, this.pageSize);
    } else {
      let clientId = '';
      if (client !== 'All') {
        const clientObj = this.requirementsData.find(c => c.client_name === client);
        clientId = clientObj ? clientObj.clientId : '';
      }
      this.filterRequirements(clientId, priority, status);
    }
  }

  selectClient(client: string) {
    this.selectedClient = client;
    this.showClientDropdown = false;

    if (client === 'All') {
      this.loadRequirementsData(this.currentPage, this.pageSize);
    } else {
      const priority = this.AddNewRequirementForm.value.selectPriority || '';
      const status = this.AddNewRequirementForm.value.selectStatus || '';
      this.filterRequirements(client, priority, status);
    }
  }

  selectPriority(priority: string) {
    this.showPriorityDropdown = false;

    const client = this.selectedClient || '';
    const status = '';

    if (priority === 'All') {
      
      this.loadRequirementsData(this.currentPage, this.pageSize);
    } else {
      
      this.filterRequirements(client, priority, status);
    }
  }

  togglePriorityDropdown(event : MouseEvent) {
    event.stopPropagation();
    this.showPriorityDropdown = !this.showPriorityDropdown;
  }


  toggleClientDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showClientDropdown = !this.showClientDropdown;
  }


  @HostListener('document:click')
  closeDropdown() {
    this.showClientDropdown = false;
    this.showPriorityDropdown = false;
    this.showStatusDropdown = false;
  }

  toggleStatusDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showStatusDropdown = !this.showStatusDropdown;
  }

  
  get contacts() {
    return this.AddNewRequirementForm.get('contacts') as FormArray;
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
    this.isAddNewRequirementFormOpen = true;
  }

  closeAddNewRequirementForm() {
    this.isAddNewRequirementFormOpen = false;
    this.AddNewRequirementForm.reset();
  }

  async onAddRequirementFormSubmit() {
    this.isAddNewRequirementFormSubmitted = true;
    this.isLoading = true;
    console.log("After Form Submission", this.AddNewRequirementForm.value);


    let practice_ids = this.AddNewRequirementForm.value.relatedPractices;


  if (!Array.isArray(practice_ids)) {
    practice_ids = [practice_ids];
  }


  practice_ids = practice_ids
    .filter((p: any) => p != null && p.practice_id != null)
    .map((p: any) => Number(p.practice_id));

      let recruiter_role_ids = this.AddNewRequirementForm.value.recruiter;

  if (!Array.isArray(recruiter_role_ids)) {
    recruiter_role_ids = [recruiter_role_ids];
  }

  recruiter_role_ids = recruiter_role_ids
  .filter((r: any) => r && r.id)
  .map((r: any) => String(r.id));


      //  const documents = this.AddRequirementForm.value.attachments;
        let documents: any[] = [];
      if (this.selectedFile) {
        const documentObj = await this.convertFileToDocument(this.selectedFile);
        documents = [documentObj];
      } 

        const client_id = String(this.AddNewRequirementForm.value.selectClient.clientId);
        // const practice_ids = this.AddRequirementForm.value.relatedPractices;
        const contacts = this.savedContacts;
        const description = this.AddNewRequirementForm.value.description;
        // const documents = this.AddRequirementForm.value.attachments;
        const location = this.AddNewRequirementForm.value.location;
        const positions = this.AddNewRequirementForm.value.positions;
        const priority = this.AddNewRequirementForm.value.selectPriority;
        // const recruiter_role_ids = this.AddRequirementForm.value.recruiter;
        const relative_experience = this.AddNewRequirementForm.value.relatedExperience;
        const skills_required  = this.AddNewRequirementForm.value.skills;
        const start_date =  this.AddNewRequirementForm.value.startDate;
        const status  = this.AddNewRequirementForm.value.selectStatus;
        const title  = this.AddNewRequirementForm.value.requirementTitle;
        const total_experience  = this.AddNewRequirementForm.value.totalExperience;   

    this.api.postRequirements(
      client_id,
      title,
      recruiter_role_ids,
      status,
      priority,
      start_date,
      relative_experience,
      total_experience,
      positions,
      location,
      skills_required,
      description,
      practice_ids,
      documents,
      contacts
    ).subscribe({
        next: (res) => {
          console.log("Requirements Posted successfully", res);
          this.isAddNewRequirementFormOpen = false;
          this.AddNewRequirementForm.reset();
          this.contacts.reset();
          this.savedContacts = []
          this.loadRequirementsData(this.currentPage, this.pageSize);
          this.isLoading = false;
        },
        error : (err) => {
          console.log("Error while posting requirements data", err);
          this.isLoading = false;
        }
      })
    }
  
}
