import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryComponent } from './gallery.component';

describe('GalleryComponent', () => {
  let component: GalleryComponent;
  let fixture: ComponentFixture<GalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GalleryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes selectedCategory', () => {
    expect(component.selectedCategory).toBe('All')
  })

  it('initializes currentImageIndex', () => {
    expect(component.currentImageIndex).toBe(-1)
  })

  it('changes selectedCategory', () => {
    component.setActive('new')
    expect(component.selectedCategory).toBe('new')
  })

  it('changes currentImageIndex', () => {
    component.onEnter(5)
    expect(component.currentImageIndex).toBe(5)
  })

  it('resets currentImageIndex', () => {
    component.onLeave()
    expect(component.currentImageIndex).toBe(-1)
  })
});
