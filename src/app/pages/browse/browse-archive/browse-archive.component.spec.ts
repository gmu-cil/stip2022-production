import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseArchiveComponent } from './browse-archive.component';

describe('BrowseArchiveComponent', () => {
  let component: BrowseArchiveComponent;
  let fixture: ComponentFixture<BrowseArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowseArchiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
