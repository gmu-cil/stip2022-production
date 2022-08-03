import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { LIST_OF_IMAGE_CATEGORIES } from 'src/app/core/constants/group.constants';
import { ImagesService } from 'src/app/core/services/images.service';
import { Image } from 'src/app/core/types/adminpage.types';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
})
export class OverlayComponent implements OnInit, OnDestroy {
  @Input() type?: string;
  @Input() status?: string;
  @Input() image?: Image;
  @Input() otherImage?: Image;
  @Input() isAdmin?: boolean;
  @Output() add: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() submit: EventEmitter<any> = new EventEmitter();
  @Output() update: EventEmitter<any> = new EventEmitter();
  @Output() cancel: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() remove: EventEmitter<any> = new EventEmitter();

  private _language?: string;
  private _otherLanguage?: string;

  @Input() set language(value: string) {
    this._language = value;
    this.imageCategories = LIST_OF_IMAGE_CATEGORIES[this.language!];
    this.otherImageCategories = LIST_OF_IMAGE_CATEGORIES[this.otherLanguage!];
  }

  @Input() set otherLanguage(value: string) {
    this._otherLanguage = value;
  }

  get language(): string {
    return this._language!;
  }

  get otherLanguage(): string {
    return this._otherLanguage!;
  }

  modalRef?: BsModalRef;

  imageCategories: string[] = [];
  otherImageCategories: string[] = [];

  constructor(private imageAPI: ImagesService) {}

  isEditMode: boolean = false;

  category: string = '';
  title: string = '';
  detail: string = '';
  source: string = '';

  otherCategory: string = '';
  otherTitle: string = '';
  otherDetail: string = '';
  otherSource: string = '';

  imageAdded: boolean = false;
  url: string = '/assets/account/template-profile.png';

  sub: Subscription[] = [];

  ngOnInit(): void {
    if (this.image) {
      
    }
  }

  ngOnDestroy(): void {
    this.sub.forEach((x) => x.unsubscribe());
  }

  onClose() {
    this.close.emit({
      status: 'close',
    });
  }

  onCategoryChange(value: any) {
    this.otherCategory =
      LIST_OF_IMAGE_CATEGORIES[this.otherLanguage][value.target.value];
  }

  onEdit() {
    this.isEditMode = true;

    this.category = Object.keys(LIST_OF_IMAGE_CATEGORIES[this.language!]).find(
      (k) =>
        LIST_OF_IMAGE_CATEGORIES[this.language!][k] ===
        this.image!.galleryCategory
    )!;

    this.title = this.image!.galleryTitle;
    this.detail = this.image!.galleryDetail;
    this.source = this.image!.gallerySource;

    // Fetch the image in other language
    this.sub.push(
      this.imageAPI
        .getImageUpdate(this.otherLanguage!, this.image!.imageId)
        .subscribe((data: any) => {
          this.otherImage = {
            ...this.image!,
            galleryCategory: data.galleryCategory,
            galleryTitle: data.galleryTitle,
            galleryDetail: data.galleryDetail,
            gallerySource: data.gallerySource,
          };

          this.otherCategory = this.otherImage?.galleryCategory;
          this.otherTitle = this.otherImage?.galleryTitle;
          this.otherDetail = this.otherImage?.galleryDetail;
          this.otherSource = this.otherImage?.gallerySource;
        })
    );
  }

  onSubmit() {
    this.submit.emit({
      image: {
        ...this.image,
        galleryCategory:
          LIST_OF_IMAGE_CATEGORIES[this.language!][this.category] ||
          LIST_OF_IMAGE_CATEGORIES[this.language!][
            LIST_OF_IMAGE_CATEGORIES[this.language!].length - 1
          ],
        galleryTitle: this.title,
        galleryDetail: this.detail,
        gallerySource: this.source,
      },
      otherImage: {
        ...this.otherImage,
        galleryCategory: this.otherCategory,
        galleryTitle: this.otherTitle,
        galleryDetail: this.otherDetail,
        gallerySource: this.otherSource,
      },
      status: 'submit',
    });
  }

  onRemove() {
    this.remove.emit({
      status: 'remove',
    });
  }

  onUpdate() {
    this.update.emit({
      image: this.image,
      otherImage: this.otherImage,
      status: 'update',
    });
  }

  onDelete() {
    this.delete.emit({
      image: this.image,
      status: 'delete',
    });
  }

  onCancel() {
    this.cancel.emit({
      status: 'cancel',
    });
  }

  onAdd() {
    let image = {
      imageId: '',
      rightistId: '',
      isGallery: true,
      galleryCategory:
        LIST_OF_IMAGE_CATEGORIES[this.language!][this.category] ||
        LIST_OF_IMAGE_CATEGORIES[this.language!][
          LIST_OF_IMAGE_CATEGORIES[this.language!].length - 1
        ],
      galleryTitle: this.title,
      galleryDetail: this.detail,
      gallerySource: this.source,
    };
    let otherImage = {
      imageId: '',
      rightistId: '',
      isGallery: true,
      galleryCategory: this.otherCategory,
      galleryTitle: this.otherTitle,
      galleryDetail: this.otherDetail,
      gallerySource: this.otherSource,
    };

    this.add.emit({
      status: 'add',
      value: image,
      otherValue: otherImage,
      url: this.url,
    });
  }

  onselectFile(e) {
    if (e.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.imageAdded = true;
      };
    }
  }
}
