import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutResearchComponent } from './about-research.component';

describe('AboutResearchComponent', () => {
  let component: AboutResearchComponent;
  let fixture: ComponentFixture<AboutResearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AboutResearchComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutResearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
