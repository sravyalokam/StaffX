import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Api } from '../../../services/api';
import { CandidatesResponse, CandidatesItem } from '../../../interfaces/resources';
import { MyUtilityButton } from '../../../utility-components/my-utility-button/my-utility-button';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { RequirementsData, RequirementsItem } from '../../../interfaces/requirements';
import { RoleAssignment } from '../../../interfaces/role-management';
import { Employees } from '../../../interfaces/role-management';
import { CandidateDocumentUpload } from '../../../interfaces/resources';
import { VendorItems, VendorListResponse } from '../../../interfaces/vendors';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PaginationUtility } from '../../../utility-components/pagination-utility/pagination-utility';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-candidates',
  imports: [ 
    MyUtilityButton, PaginationUtility,
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, FormsModule,
    MatAutocompleteModule, MatSelectModule, MatOptionModule, MatInputModule, MatPaginatorModule, MatProgressSpinner
  ],
  templateUrl: './candidates.html',
  styleUrl: './candidates.css'
})
export class Candidates implements OnInit{

  candidatesData: CandidatesItem[] = [];
@Output() backToRequirementsEvent = new EventEmitter<void>();
  AddNewCandidateForm!: FormGroup;
  isAddNewCandidateFormOpen: boolean = false;
  isAddNewCandidateFormSubmitted: boolean = false;
  showEmployeeSelect: boolean = true;
  showFullNameField: boolean = false;
  showSelectVendor: boolean = false;
  requirementsData!: RequirementsItem[];
  emp!: Employees[];
  // requirementTitle!: string;
  clientName!: string;
  vendorsData!: VendorItems[];
  candidatesType: string[] = ['Cognine', 'Vendor', 'Consultant'];

  fileName: string = '';
  selectedFile: File | null = null;

  plusIcon = 
  `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14"/>
      <path d="M12 5v14"/>
    </svg>
  `;

  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  isLoading: boolean = false;

  constructor( private api : Api, private route: ActivatedRoute, private router : RouterModule, private fb: FormBuilder) {}

  @Input() requirementId!: string;
  @Input() requirementTitle!: string;
  @Input() vendorId!: string;

  filteredCandidatesType!: Observable<string[]>;
  filteredVendors!: Observable<VendorItems[]>;

  ngOnInit(): void {

    this.AddNewCandidateForm = this.fb.group({
      candidateType: ['Cognine', Validators.required],
      selectEmployee: ['', Validators.required],
      fullName: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      location: [''],
      selectVendor: ['', Validators.required],
      experience: ["0", Validators.required],
      skills: [''],
      candidateStatus: ['', Validators.required],
      attachments: [File]
    })

    console.log("Selected Requirement Title", this.requirementTitle);

  this.AddNewCandidateForm.get('candidateType')?.valueChanges.subscribe(value => {
  if (value === 'Cognine') {
    
    this.showEmployeeSelect = true;
    this.showFullNameField = false;
    this.showSelectVendor = false;

    this.AddNewCandidateForm.get('selectEmployee')?.setValidators([Validators.required]);
    this.AddNewCandidateForm.get('fullName')?.clearValidators();
    this.AddNewCandidateForm.get('selectVendor')?.clearValidators();

    console.log("Vendor Id", this.vendorId);
  } 
  else if (value === 'Vendor') {
    
    this.showEmployeeSelect = false;
    this.showFullNameField = true;
    this.showSelectVendor = true;

    this.AddNewCandidateForm.get('fullName')?.setValidators([Validators.required]);
    this.AddNewCandidateForm.get('selectVendor')?.setValidators([Validators.required]);
    this.AddNewCandidateForm.get('selectEmployee')?.clearValidators();
  } 
  else if (value === 'Consultant') {
   
    this.showEmployeeSelect = false;
    this.showFullNameField = true;
    this.showSelectVendor = false;

    this.AddNewCandidateForm.get('fullName')?.setValidators([Validators.required]);
    this.AddNewCandidateForm.get('selectEmployee')?.clearValidators();
    this.AddNewCandidateForm.get('selectVendor')?.clearValidators();
  }

    this.AddNewCandidateForm.get('selectEmployee')?.updateValueAndValidity();
    this.AddNewCandidateForm.get('fullName')?.updateValueAndValidity();
    this.AddNewCandidateForm.get('selectVendor')?.updateValueAndValidity();
  });


    // this.requirementId = this.route.snapshot.paramMap.get('requirementId')!;
    console.log('Requirement ID:', this.requirementId);
    if(this.requirementId) {
      this.loadCandidatesDataByRequirementId(this.requirementId);
      this.loadCandidatesPaginationData(this.requirementId, this.currentPage, this.pageSize);

    }
    else if(this.vendorId) {
      console.log("vendor id:", this.vendorId);
      this.loadCandidatesDataByVendorId(this.vendorId);
      console.log("Client name", this.clientName);
    }
    this.loadRequirementsData(this.requirementId, this.currentPage, this.pageSize);
    this.getAllEmployeees();
    this.loadVendorsData();

    this.filteredCandidatesType = this.AddNewCandidateForm.get('candidateType')!.valueChanges.pipe(
    startWith(''),
    map(value => this._filterCandidateType(value))
  );
  }

  private _filterCandidateType(value: string): string[] {
  const filterValue = value.toLowerCase();
  return this.candidatesType.filter(option => option.toLowerCase().includes(filterValue));
}

  loadCandidatesDataByRequirementId(requirementId: string) {
    this.api.getCandidatesDataByRequirementId(requirementId).subscribe({
      next: (data: CandidatesResponse) => {
        this.candidatesData = data.items;
        console.log("Successfully fetched data from resources by requirement id", requirementId, data.items);
         if (data.items && data.items.length > 0) {
        const clientName = data.items[0]?.client_name;
        console.log("Client Name:", clientName);
      }
      },
      error: (err) => {
        console.log("Error while fetching data from resources", err);
      }
    });
  }

  loadCandidatesDataByVendorId(vendorId : string) {
    this.api.getCandidatesDataByVendorsId(vendorId).subscribe({
      next: (data:  CandidatesResponse) =>{
        this.candidatesData = data.items;
        console.log("Successfully fetched candidates data by vendor id", data.items);
      },
      error: (err) => {
        console.log("Error while fetching candidates by vendor id", err);
      }
    })
  }

  loadRequirementsData(requirementId: string, page: number, pageSize: number) {
    this.api.getRequirementsData(page, pageSize).subscribe({
      next: (data: RequirementsData) => {
        this.requirementsData=data.items;
        console.log("Data from Requirements Api", data.items);
        const matchedTitle = data.items.find(job => job.id === requirementId);
        const matchedName = data.items.find(job => job.id === requirementId);
        this.requirementTitle = matchedTitle ? matchedTitle.title : '';
        this.clientName = matchedName ? matchedName.client_name: '';
        console.log("Requirement Title:", this.requirementTitle);
      },
        error: (err) => {
          console.log("Error fetching requirements data", err);
        }
    })
  }

  getAllEmployeees() {
    this.api.getRoleAssignmentData().subscribe({
      next: (data: RoleAssignment) => {
        this.emp = data.employees;
        console.log("Successfully fetched employees data", data);
      },
      error: (err) => {
        console.log("Error while fetching employees data", err);
      }
    })
  }

  loadVendorsData() {
    this.api.getVendorsData().subscribe({
      next: (data: VendorListResponse) => {
        this.vendorsData = data.items;
        console.log("Successfully fetched vendors data", data.items);

         this.filteredVendors = this.AddNewCandidateForm.get('selectVendor')!.valueChanges.pipe(
        startWith(''),
        map(value => this._filterVendors(value || ''))
      );
      },
      error: (err) => {
        console.log("Error while fetching vendors data", err);
      }
    })
  }

  private _filterVendors(value: string): VendorItems[] {
    const filterValue = value.toLowerCase();
    return this.vendorsData.filter(v => v.name.toLowerCase().includes(filterValue));
  }


  loadCandidatesPaginationData(requirementId: string, page: number, pageSize: number) {
    this.api.getCandidatesPaginationData(requirementId, page, pageSize).subscribe({
      next: (res: CandidatesResponse) => {
        this.candidatesData = res.items || [];
        this.totalItems = res.total || 0;
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
  
 
  onPageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.loadCandidatesPaginationData(this.requirementId, this.currentPage, this.pageSize);
    this.loadCandidatesDataByRequirementId(this.requirementId);
  }


  onJumpToPage(page: number) {
    this.currentPage = page;
    this.loadCandidatesPaginationData(this.requirementId, this.currentPage, this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCandidatesPaginationData(this.requirementId, this.currentPage, this.pageSize);
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCandidatesPaginationData(this.requirementId, this.currentPage, this.pageSize);
    }
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCandidatesPaginationData(this.requirementId, this.currentPage, this.pageSize);
    }
  }
  
  loadPage() {
    this.loadCandidatesPaginationData(this.requirementId, this.currentPage, this.pageSize);
  }
  

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only PDF, Word, and Excel documents are allowed.');
        this.AddNewCandidateForm.patchValue({ attachments: null });
        this.selectedFile = null;
        this.fileName = '';
        return;
      }

      this.selectedFile = file;
      this.fileName = file.name;
      this.AddNewCandidateForm.patchValue({ attachments: file });
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Not Submitted':
        return 'bg-gray-100 text-gray-800';
      case 'Hired':
        return 'bg-[#F1F5F9] text-[#334155]';
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Interviews in Progress':
        return 'bg-slate-100 text-slate-800';
      case 'Selected':
        return 'bg-green-100 text-green-800';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  }

  openAddNewCandidateForm() {
    this.isAddNewCandidateFormOpen = true;
    console.log("Add New Candidate form opened");
  }

  closeAddNewCandidateForm() {
    this.isAddNewCandidateFormOpen = false;
  }

  onAddNewCandidateFormSubmit() {
    this.isAddNewCandidateFormSubmitted = true;
    this.isLoading = true;
    console.log("After Add New Client Form Submission", this.AddNewCandidateForm.value);

    const resource_type = this.AddNewCandidateForm.value.candidateType;
    
    const employee_id = resource_type === 'Cognine'
    ? Number(this.AddNewCandidateForm.value.selectEmployee)
    : null;
    // const employee_id = this.AddNewCandidateForm.value.selectEmployee;
    const selectedEmployee = this.emp.find(e => e.employee_id === employee_id);
    const name = this.AddNewCandidateForm.value.fullName;
    const email = this.AddNewCandidateForm.value.email;
    const phone = this.AddNewCandidateForm.value.phone;
    const location = this.AddNewCandidateForm.value.location;
    const vendorId = this.AddNewCandidateForm.value.selectVendor;
    const vendor_id = this.AddNewCandidateForm.value.selectVendor;
    const experience = String(this.AddNewCandidateForm.value.experience ?? "");
    const total_experience = String(this.AddNewCandidateForm.value.experience ?? "");
    const skills = String(this.AddNewCandidateForm.value.skills ?? "");
    const interviewStatus = this.AddNewCandidateForm.value.candidateStatus;
    const attachments = this.AddNewCandidateForm.value.attachments;
    const job_id = this.requirementId;
    const jobId = this.requirementId;
    const status = this.AddNewCandidateForm.value.candidateStatus;

    this.api.postCandidates(
      job_id,
      jobId,
      resource_type,
      employee_id,
      name,
      email,
      phone,
      location,
      vendorId,
      vendor_id,
      experience,
      total_experience,
      skills,
      interviewStatus,
      status,
      attachments
    ).subscribe({
      next: (data) => {
        console.log("Successfully posted candidates data", data);
        this.loadCandidatesDataByRequirementId(this.requirementId);
        this.AddNewCandidateForm.reset();
        this.closeAddNewCandidateForm();
        this.isLoading = false;
      },
      error: (err) => {
        console.log("Error while posting candidates data", err);
        this.isLoading = false;
      }

    })
  }

}
