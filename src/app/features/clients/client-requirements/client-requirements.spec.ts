import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRequirements } from './client-requirements';

describe('ClientRequirements', () => {
  let component: ClientRequirements;
  let fixture: ComponentFixture<ClientRequirements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientRequirements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientRequirements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
