import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyUtilityButton } from './my-utility-button';

describe('MyUtility', () => {
  let component: MyUtilityButton;
  let fixture: ComponentFixture<MyUtilityButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyUtilityButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyUtilityButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
