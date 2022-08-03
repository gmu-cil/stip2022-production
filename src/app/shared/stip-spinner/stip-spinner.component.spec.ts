import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StipSpinnerComponent } from './stip-spinner.component';

describe('StipSpinnerComponent', () => {
  let component: StipSpinnerComponent;
  let fixture: ComponentFixture<StipSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StipSpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StipSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
