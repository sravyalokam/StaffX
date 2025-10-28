import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationUtility } from './pagination-utility';

describe('PaginationUtility', () => {
  let component: PaginationUtility;
  let fixture: ComponentFixture<PaginationUtility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationUtility]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginationUtility);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
