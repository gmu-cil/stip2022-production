import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';
import { Subscription } from 'rxjs';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Image, ImagesSchema } from 'src/app/core/types/adminpage.types';

import { ImagesService } from 'src/app/core/services/images.service';
import { StorageApIService } from 'src/app/core/services/storage-api.service';
import { UUID } from 'src/app/core/utils/uuid';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { ArchieveApiService } from 'src/app/core/services/archives-api-service';
import { OverlayComponent } from './overlay/overlay.component';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit, OnDestroy {
  selectedCategory: string = this.translate.currentLang.includes('e')
    ? 'All'
    : '所有';
  currentImageIndex?: number;

  title?: string;
  galleries: string[] = [];
  imageButton?: string;

  public masonryOptions: NgxMasonryOptions = {
    gutter: 20,
    resize: true,
    itemSelector: '.masonry-item',
    // fitWidth: true,
    // horizontalOrder: true,
    // percentPosition: true,
    // columnWidth: 120,
  };

  images: Image[] = [];
  categoryImages: Image[] = [];
  display: Image[] = [];

  translationSubscription?: Subscription;
  imageSubscription?: Subscription;

  currentPage: number = 1;
  showBoundaryLinks: boolean = true;
  itemsPerPage: number = 6;

  modalRef?: BsModalRef;
  selectedImage?: Image;
  otherImage?: Image;

  status: string = 'initial';
  type?: string;

  @ViewChild('imagegallery') imageRef?: ElementRef;
  @ViewChild(NgxMasonryComponent) masonry?: NgxMasonryComponent;
  @ViewChild(OverlayComponent) overlay?: OverlayComponent;

  sub: Subscription[] = [];
  searchTerm?: string;

  language: string = '';
  otherLanguage: string = '';

  isAdmin?: boolean;
  loaded: boolean = false;

  resultCache = {} as { [x: string]: Image[] };

  subAPI: { [x: string]: Subscription } = {} as any;
  disabled: boolean = false;

  constructor(
    private translate: TranslateService,
    private imagesAPI: ImagesService,
    public modalService: BsModalService,
    private auth: AuthServiceService
  ) {}

  ngAfterViewInit(): void {}

  callAPI() {
    this.subAPI[this.language]?.unsubscribe();
    this.subAPI[this.language] = this.imagesAPI
      .getGalleryImages(this.language || this.translate.currentLang)
      .subscribe((imagesList: any) => {
        this.categoryImages.length = 0;
        this.display.length = 0;
        this.images.length = 0;
        this.images = imagesList;

        if (this.images.length == 0) {
          this.loaded = true;
        } else {
          this.resultCache[this.selectedCategory] = this.images;
          this.categoryImages.push(...this.resultCache[this.selectedCategory]);

          setTimeout(() => {
            this.loaded = true;
            this.display = this.categoryImages.slice(0, this.itemsPerPage);
            this.reloadMasonryLayout();
          }, 50);
        }
      });
  }

  ngOnInit(): void {
    this.language = this.translate.currentLang;
    this.otherLanguage = this.language === 'en' ? 'cn' : 'en';
    this.sub.push(
      this.auth.isAdmin.subscribe((isAdmin: any) => {
        this.isAdmin = isAdmin;
      })
    );

    this.sub.push(
      // Translation
      this.translate.stream('gallery').subscribe((data) => {
        this.language = this.translate.currentLang;
        this.otherLanguage = this.language === 'en' ? 'cn' : 'en';
        this.galleries.length = 0;

        this.galleries.push(data['gallery_top_cat_one_button']);
        this.galleries.push(data['gallery_top_cat_two_button']);
        this.galleries.push(data['gallery_top_cat_three_button']);
        this.galleries.push(data['gallery_top_cat_four_button']);
        this.galleries.push(data['gallery_top_cat_five_button']);
        this.title = data['gallery_top_title'];
        this.imageButton = data['gallery_image_button'];
        this.callAPI();
        this.selectedCategory = this.galleries[0];
        this.currentImageIndex = -1;
      })
    );
  }

  reloadMasonryLayout() {
    if (this.masonry !== undefined) {
      // this.masonry.reloadItems();
      this.masonry.layout();
    }
  }

  ngOnDestroy(): void {
    this.translationSubscription?.unsubscribe();
    this.imageSubscription?.unsubscribe();
    this.sub.forEach((x) => x.unsubscribe());
  }

  setActive(gallery: string) {
    this.selectedCategory = gallery;

    let result: Image[] = [];

    if (gallery == 'All' || gallery == '全部') {
      result = this.resultCache[gallery];
    } else if (!this.resultCache[gallery]) {
      for (const image of this.images) {
        if (image.category == gallery) {
          result.push(image);
        }
      }
      this.resultCache[gallery] = result;
    }

    this.currentPage = 1;

    // issue with ngx pagination (can only update one field at a time)
    setTimeout(() => {
      this.categoryImages = this.resultCache[gallery];
      this.display = this.categoryImages.slice(0, this.itemsPerPage);
      this.reloadMasonryLayout();
    }, 100);
  }

  onEnter(index: number) {
    this.currentImageIndex = index;
  }

  onLeave() {
    this.currentImageIndex = -1;
  }

  pageChanged(event: PageChangedEvent): void {
    this.currentPage = event.page;
    var start = (this.currentPage - 1) * this.itemsPerPage;
    var end = start + this.itemsPerPage;
    this.display = this.categoryImages.slice(start, end);
    window.scroll(0, 0);
    this.imageRef?.nativeElement.focus();
  }

  onLearnMore(template: TemplateRef<any>, image: Image) {
    this.disabled = true;
    this.selectedImage = image;
    this.type = 'edit';
    this.status = 'initial';
    this.modalService.show(template, { class: 'modal-xl' });
  }

  addImage(template: TemplateRef<any>) {
    this.type = 'add';
    this.status = 'initial';
    this.selectedImage = undefined;
    this.disabled = false;
    this.modalService.show(template, { class: 'modal-xl'});
  }
}
