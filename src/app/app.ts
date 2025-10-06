import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoleAssignmentComponent } from './role-assignment/role-assignment';
import { Clients } from './clients/clients';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RoleAssignmentComponent, Clients],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('app');
}
