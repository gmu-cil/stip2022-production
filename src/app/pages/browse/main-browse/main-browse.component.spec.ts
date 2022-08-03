import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainBrowseComponent } from './main-browse.component';

describe('MainBrowseComponent', () => {
  let component: MainBrowseComponent;
  let fixture: ComponentFixture<MainBrowseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainBrowseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
