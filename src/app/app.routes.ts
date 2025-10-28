import { Routes } from '@angular/router';
import { Clients } from './features/clients/clients';
import { RoleAssignmentComponent } from './features/role-assignment/role-assignment';
import { Vendors } from './features/vendors/vendors';
import { Requirements } from './features/requirements/requirements';
import { Candidates } from './features/requirements/candidates/candidates';
import { ClientRequirements } from './features/clients/client-requirements/client-requirements';

export const routes: Routes = [

    { path: '', redirectTo: '/clients', pathMatch: 'full' },

    { path: 'clients', component: Clients },
    { path: 'client-requirements/:client_id', component: ClientRequirements},
    { path: 'vendors', component: Vendors },
    { path: 'requirements', component: Requirements },
    { path: 'candidates/:requirementId', component: Candidates},
    { path: 'role-assignment', component: RoleAssignmentComponent },
 ];
