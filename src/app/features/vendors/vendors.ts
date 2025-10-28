import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';
import { CommonModule } from '@angular/common';
import { VendorItems, VendorListResponse, VendorContact } from '../../interfaces/vendors';
import { MyUtilityButton } from '../../utility-components/my-utility-button/my-utility-button';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PaginationUtility } from '../../utility-components/pagination-utility/pagination-utility';
import { Candidates } from '../requirements/candidates/candidates';


@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [ 
    CommonModule, 
    MyUtilityButton, PaginationUtility, Candidates,
    MatFormFieldModule, MatSelectModule, MatOptionModule, MatInputModule, MatAutocompleteModule, MatCheckboxModule, MatPaginatorModule, MatProgressSpinner,
    FormsModule, ReactiveFormsModule
  ],
  templateUrl: './vendors.html',
  styleUrls: ['./vendors.css'],
})
export class Vendors implements OnInit {

  vendorsData: VendorItems[] = [];

  addNewVendorForm!: FormGroup;
  isAddNewVendorFormSubmitted = false;
  isAddNewVendorFormOpen = false;
  openContactsForm : boolean = false;
  savedContacts: VendorContact[] = [];
  saveContact: boolean = false;

  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  isLoading: boolean = false;

  showVendorsComponent: boolean = true;
  showCandidatesComponent: boolean = false;
  selectedVendorId! : string;

  plusIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14"/>
      <path d="M12 5v14"/>
    </svg>
  `;

  constructor(private api: Api, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addNewVendorForm = this.fb.group({
      vendorName: ['', Validators.required],
      Location: [''],
      Contacts: this.fb.array([]),
    });

    this.loadVendorsData(this.currentPage, this.pageSize);
  }

  loadVendorsData(page: number, pageSize: number) {
    this.isLoading = true;
    this.api.getVendorsData(page, pageSize).subscribe({
      next: (data: VendorListResponse) => {
        this.vendorsData = data.items;
        console.log('Data fetched successfully', data);
        this.totalItems = data.total || 0;
        this.pageSize = data.page_size || pageSize;
        this.currentPage = data.page || page;
        this.isLoading = false;
        console.log('Pagination res', data);
      },
      error: (err) => {
        console.error('Error fetching vendors data', err);
      },
    });
  }

  // Candidates Reuse
  toggleRequirementsComponent(vendorId : string) {
    this.selectedVendorId = vendorId;
    console.log("Vendor Id", vendorId);
    this.showVendorsComponent = false;
    this.showCandidatesComponent = true;
  }


  onPageChange(page: number) {
    this.currentPage = page;
    
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
    this.loadVendorsData(this.currentPage, this.pageSize);
  }


  onJumpToPage(page: number) {
    this.currentPage = page;
    this.loadVendorsData(this.currentPage, this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadVendorsData(this.currentPage, this.pageSize);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadVendorsData(this.currentPage, this.pageSize);
    }
  }

  loadPage() {
    this.loadVendorsData(this.currentPage, this.pageSize);
  }

  get contacts(): FormArray {
    return this.addNewVendorForm.get('Contacts') as FormArray;
  }

  addContact(): void {
    this.openContactsForm = true;
    this.contacts.push(
      this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
      })
    );
  }

  cancelContact(index: number): void {
    this.contacts.removeAt(index);
  }

  saveContactInfo(index: number): void {
    const contactGroup = this.contacts.at(index);

    if (contactGroup.valid) {
      const contact = contactGroup.value;
      this.savedContacts.push(contact);
      this.contacts.removeAt(index);
      this.saveContact = true;
    } else {
      contactGroup.markAllAsTouched();
    }
  }

  openAddNewVendorForm() {
    this.isAddNewVendorFormOpen = true;
  }

  closeAddNewVendorForm() {
    this.isAddNewVendorFormOpen = false;
    this.addNewVendorForm.reset();
    this.savedContacts = [];
    this.contacts.clear();
  }

  onAddVendorFormSubmit(): void {
    this.isAddNewVendorFormSubmitted = true;
    this.isLoading = true;
    if (this.addNewVendorForm.invalid) return;

    console.log('Form Data', this.addNewVendorForm.value);
    const name = this.addNewVendorForm.value.vendorName;
    const location = this.addNewVendorForm.value.Location;
    const contacts = this.savedContacts;

    console.log('Form Data', this.addNewVendorForm.value);
    console.log('Contact Form Data', this.contacts.value);

    this.api.postAddVendors(name, location, contacts).subscribe({
      next: (res) => {
        console.log('Vendors data posted successfully', res);
        this.loadVendorsData(this.currentPage, this.pageSize);
        this.closeAddNewVendorForm();
        this.isLoading = false;
      },
      error: (err) => {
        console.log('Error while fetching the data', err);
        this.isLoading = false;
      },
    });
  }
}
