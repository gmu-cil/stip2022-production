import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsContributionComponent } from './terms-contribution.component';

describe('TermsContributionComponent', () => {
  let component: TermsContributionComponent;
  let fixture: ComponentFixture<TermsContributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermsContributionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsContributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
