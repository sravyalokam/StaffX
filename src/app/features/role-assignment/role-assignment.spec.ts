import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAssignmentComponent } from './role-assignment';

describe('RoleAssignment', () => {
  let component: RoleAssignmentComponent;
  let fixture: ComponentFixture<RoleAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
