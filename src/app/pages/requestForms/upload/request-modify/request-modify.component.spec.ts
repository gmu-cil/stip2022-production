import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestModifyComponent } from './request-modify.component';

describe('RequestModifyComponent', () => {
  let component: RequestModifyComponent;
  let fixture: ComponentFixture<RequestModifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestModifyComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
