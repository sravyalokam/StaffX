import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employees, RoleAssignment, Roles } from '../interfaces/role-management';
import { environment } from '../../environment/environment';


const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.bearerToken}`
});

@Injectable({
  providedIn: 'root'
})
export class Api {

  constructor(private http: HttpClient) { }

  getData(): Observable<RoleAssignment> {

    return this.http.get<RoleAssignment>(`${environment.Url}`, { headers });
  }


  AssignRoles(employee_id: number, role_ids: number[]): Observable<Roles> {

    const body = { employee_id: employee_id, role_ids: role_ids };
    return this.http.post<Roles>(environment.Url, body, { headers });
  }


}
