import { Component, OnInit } from '@angular/core';
import { Api } from '../services/api';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Items } from '../interfaces/role-management';
import { RoleAssignment } from '../interfaces/role-management';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

interface Contacts {
  Name: string;
  Email: string;
  Phone: number;
  validations?: any[]; 
}

@Component({
  selector: 'app-clients',
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatSelectModule, MatOptionModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css'
})
export class Clients implements OnInit {

  addClientForm! : FormGroup;
  isAddClientModelOpen: boolean = false;
  data!: Items[];
  accountManagers!: string[];
  salesManagers!: string[];
  isAddClientModelSubmitted: boolean = false;
  savedContacts: Contacts[] = []; 
  // addContact: boolean = false;
  saveContact: boolean = false;
  addContactsFormOpen: boolean =false;

  isSalesDropdownOpen: boolean = false;
  selectedSalesManagers: string[] = [];

  constructor(private api : Api, private fb : FormBuilder) {}

  ngOnInit(): void {
    
    this.addClientForm=this.fb.group({
      ClientName: ['', Validators.required],
      Location: ['', Validators.required],
      AccountManagers: [''],
      SalesManagers: [''],
      // Contacts: ['']
      Contacts: this.fb.array([]),
      // Name: ['', Validators.required],
      // Email: ['', Validators.required],
      // Phone: ['', Validators.required]
    });

  
    this.api.getData().subscribe({
      next: d =>{
        this.data=d.items;

        const filteredAccountManagers = this.data.filter(e => e.role_display_name==='Account Manager');

        this.accountManagers = filteredAccountManagers.map(e => e.employee_name);

        console.log("Account Managers:",this.accountManagers);

        const filteredSalesManagers = this.data.filter(e => e.role_display_name==='Sales Manager');

        this.salesManagers = filteredSalesManagers.map(e => e.employee_name);

        console.log("Account Managers:",this.salesManagers);

      }
    })
  }

  get contacts(): FormArray {
    return this.addClientForm.get('Contacts') as FormArray;
  }

  addContact(): void {
    const contactForm = this.fb.group({
      Name: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Phone: ['', Validators.required,Validators.minLength(10)]
    });

    this.contacts.push(contactForm);
  }

   removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  onAddClientSubmit() {
    if (this.addClientForm.valid) {
      
      const ClientName = this.addClientForm.value.ClientName;
      const Location = this.addClientForm.value.Location;
      const AccountManager = this.addClientForm.value.AccountManagers;
      const SalesManagers = this.addClientForm.value.SalesManagers;
      const ClientN = this.contacts.value.Name;
      const ClientEmail = this.contacts.value.Email;
      const ClientPhone = this.contacts.value.Phone;

      console.log("Client Name:", ClientName);
      console.log("Location:", Location);
      console.log("AccountManager:", AccountManager);
      console.log("SalesManager:", SalesManagers);

      if (this.savedContacts.length > 0) {
      this.savedContacts.forEach((contact, index) => {
      console.log(`Contact ${index + 1}:`);
      console.log("Client Name:", contact.Name);
      console.log("Client Email:", contact.Email);
      console.log("Client Phone:", contact.Phone);
    });
    } else {
    console.log("No contacts have been saved.");
 

    }

      this.addClientForm.reset();
      this.isAddClientModelOpen = false;
      this.contacts.reset();
      this.savedContacts=[];
    }
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
    } else {
      contactGroup.markAllAsTouched();         
    }
  }


  openAddClientModel() {
    this.isAddClientModelOpen = true;
    
  }

  addContactFormSubmit() {
    this.addContactsFormOpen=false;
    this.contacts.reset();
  }


closeAddClientModel() {
  this.isAddClientModelOpen=false;
}

  
  
}
