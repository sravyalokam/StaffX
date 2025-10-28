import { Injectable, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RootObject } from '../interfaces/dashboard';
import { Employees, EmployeesWithPractices, Practices, RoleAssignment, Roles } from '../interfaces/role-management';
import { environment } from '../../environment/environment';
import { ClientContact, ClientItem } from '../interfaces/clients';
import { ClientsData } from '../interfaces/clients';
import { VendorListResponse } from '../interfaces/vendors';
import { VendorItems, VendorContact } from '../interfaces/vendors';
import { RequirementsData } from '../interfaces/requirements';
import { RequirementsContact } from '../interfaces/requirements';
import { CandidatesResponse } from '../interfaces/resources';
import { ClientRequirementContact, RequirementItem, RequirementsResponse } from '../interfaces/client-requirement';
import { CandidateDocumentUpload } from '../interfaces/resources';

const headers = new HttpHeaders({
    'Authorization': `Bearer ${environment.bearerToken}`
});

@Injectable({
  providedIn: 'root'
})

export class Api {

  constructor(private http: HttpClient) {}

  // Dashboard API
  
  getCurrentEmployeeData() : Observable<RootObject> {
    return this.http.get<RootObject>(`${environment.Url}dashboard`, { headers })
  }

  // Role Assignment API

  getRoleAssignmentData(): Observable<RoleAssignment> {
    return this.http.get<RoleAssignment>(`${environment.Url}employee-role-mappings/`, { headers });
  }

  getEmployeeWithPracticesData() : Observable<RoleAssignment> {
    return this.http.get<RoleAssignment>(`${environment.Url}employee-role-mappings/`, {headers});
  }

  PostAssignRoles(employee_id: number, role_ids: number[]): Observable<Roles> {
    const body = { employee_id: employee_id, role_ids: role_ids };
    return this.http.post<Roles>(`${environment.Url}employee-role-mappings/`, body, { headers });
  }

  // Clients API

  getClientsData(): Observable<ClientsData> {
    return this.http.get<ClientsData>(`${environment.Url}clients/`, { headers });
  }

  getClientPaginationData(page: number, pageSize: number): Observable<ClientsData> {
  return this.http.get<ClientsData>(
    `${environment.Url}clients/?page=${page}&page_size=${pageSize}`,  { headers } );
  }

  PostAddClient(payload: {
    name: string,
    location: string,
    account_manager_role_ids: string[],
    sales_manager_role_ids: string[],
    contacts: ClientContact[]
  }): Observable<ClientItem> {
    return this.http.post<ClientItem>(`${environment.Url}clients/`, payload, { headers });
  }

  // Clients - Requirements API

  getClientRequirementData(client_id: string) : Observable<RequirementsResponse> {
    return this.http.get<RequirementsResponse>(`${environment.Url}jobs/`, { params: {client_id: client_id}, headers: headers});
  }

  getClientRequirementsPaginationData(clientId: string, page: number, pageSize: number) : Observable<RequirementsResponse> {
    return this.http.get<RequirementsResponse>(`${environment.Url}jobs/?job_id=${clientId}&page=${page}&page_size=${pageSize}`, { headers })
  }

  getClientRequirementsDataByClientId(clientId: string, page: number, pageSize: number) : Observable<RequirementsData> {
    return this.http.get<RequirementsData>(`${environment.Url}jobs/?client_id=${clientId}&page=${page}&page_size=${pageSize}`, { headers });
  }

  postClientRequirements(
    client_id : string,
    title : string,
    recruiter_role_ids : string[],
    status : string,
    priority : string,
    start_date : Date,
    relative_experience : string,
    total_experience : string,
    positions : string,
    location : string,
    skills_required : string,
    description : string,
    practice_ids : string[],
    documents : CandidateDocumentUpload[],
    contacts : ClientRequirementContact[]
  ) : Observable<RequirementItem> {

    const body = {
      client_id : client_id,
      title : title,
      recruiter_role_ids : recruiter_role_ids,
      status : status,
      priority : priority,
      start_date : start_date,
      relative_experience : relative_experience,
      total_experience : total_experience,
      positions : positions,
      location : location,
      skills_required : skills_required,
      description : description,
      practice_ids : practice_ids,
      documents : documents,
      contacts : contacts
    }
    return this.http.post<RequirementItem>(`${environment.Url}jobs/`, body , { headers })
  }

  // Vendors API

  getVendorsData(page?: number, pageSize?: number): Observable<VendorListResponse> {
    const params: any = {};

    if (page !== undefined) params.page = page;
    if (pageSize !== undefined) params.page_size = pageSize;

    return this.http.get<VendorListResponse>(`${environment.Url}vendors/`, {
      params,
      headers
    });
  }


  getVendorsPaginationData(page: number, pageSize: number): Observable<VendorListResponse> {
    return this.http.get<VendorListResponse>(`${environment.Url}vendors/?page=${page}&page_size=${pageSize}`, { headers })
  }

  postAddVendors(name: string, location: string, contacts: VendorContact[]) : Observable<VendorItems[]> {
    const body = {
      name: name,
      location: location,
      contacts: contacts
    }
    return this.http.post<VendorItems[]>(`${environment.Url}vendors/`,  body, {headers});
  }

  // Requirements API

  getRequirementsData(page: number, pageSize: number) : Observable<RequirementsData> {
    return this.http.get<RequirementsData>(`${environment.Url}jobs/?page=${page}&page_size=${pageSize}`, { headers });
  }

  // getRequirementsPaginationData(page: number, pageSize: number) : Observable<RequirementsData> {
  //   return this.http.get<RequirementsData>(`${environment.Url}jobs/?page=${page}&page_size=${pageSize}`, {headers})
  // }

  getRequirementsDataBySearch(job_role : string, job_title : string) : Observable<RequirementsData> {
    return this.http.get<RequirementsData>(`${environment.Url}jobs/?job_role=${job_role}&job_title=${job_title}`, { headers });
  }

  getFilteredRequirements(clientId: string, priority: string, status: string): Observable<RequirementsData> {
    const params: any = {};
    
    if (clientId) params.client_id = clientId;
    if (priority) params.priority = priority;
    if (status) params.job_status = status;

    return this.http.get<RequirementsData>(`${environment.Url}jobs/`, { params, headers });
  }


  deleteRequirements(client_id: string) : Observable<RequirementItem> {
    return this.http.delete<RequirementItem>(`${environment.Url}jobs/?client_id=${client_id}`);
  }

  postRequirements(
    client_id : string, 
    title : string,
    recruiter_role_ids : number[],
    status : string,
    priority : string,
    start_date : Date,
    relative_experience : number,
    total_experience : number,
    positions : number,
    location : string,
    skills_required : string,
    description : string,
    practice_ids : Practices[],
    documents : RequirementsContact[],
    contacts : RequirementsContact[]
  ) : Observable<RequirementsData> {

    const body = {
    client_id : client_id, 
    title : title,
    recruiter_role_ids : recruiter_role_ids,
    status : status,
    priority : priority,
    start_date : start_date,
    relative_experience : relative_experience,
    total_experience : total_experience,
    positions : positions,
    location : location,
    skills_required : skills_required,
    description : description,
    practice_ids : practice_ids,
    documents : documents,
    contacts : contacts
    }
    return this.http.post<RequirementsData>(`${environment.Url}jobs/`, body, {headers})
  }


  // Requirements - Candidates API

  getCandidatesDataByRequirementId(jobId: string): Observable<CandidatesResponse> {
      return this.http.get<CandidatesResponse>(`${environment.Url}resources/`, {
      params: { job_id: jobId },  
      headers: headers            
    });
  }

  getCandidatesDataByVendorsId(vendor_id : string) : Observable<CandidatesResponse> {
    return this.http.get<CandidatesResponse>(`${environment.Url}resources/`, { params: {vendor_id: vendor_id},  headers })
  }

  getCandidatesPaginationData(requirementId: string, page: number, pageSize: number): Observable<CandidatesResponse> {
    return this.http.get<CandidatesResponse>(
      `${environment.Url}resources/?job_id=${requirementId}&page=${page}&page_size=${pageSize}`, 
      { headers }
    );
  }


  postCandidates(
    job_id : string,
    jobId : string,
    resource_type : string,
    employee_id : number | null,
    name : string,
    email : string,
    phone : string,
    location : string,
    vendorId : string,
    vendor_id : string,
    experience : string,
    total_experience: string,
    skills : string,
    interviewStatus : string,
    status : string,
    attachments : CandidateDocumentUpload[]
  ) : Observable<any> {

    const body = {
      job_id : job_id,
      jobId : jobId,
      resource_type : resource_type,
      employee_id : employee_id,
      name : name,
      email : email,
      phone : phone,
      location : location,
      vendorId : vendorId,
      vendor_id : vendor_id,
      experience : experience,
      total_experience : total_experience,
      skills : skills,
      interviewStatus : interviewStatus,
      status : status,
      attachments : attachments
    }
    return this.http.post<any>(`${environment.Url}resources/` , body , {headers});
  }

}
