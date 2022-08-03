import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseSearchFilterComponent } from './browse-search-filter.component';

describe('BrowseSearchFilterComponent', () => {
  let component: BrowseSearchFilterComponent;
  let fixture: ComponentFixture<BrowseSearchFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowseSearchFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseSearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
