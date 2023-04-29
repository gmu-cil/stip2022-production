import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, zip } from 'rxjs';
import { LIST_OF_IMAGE_CATEGORIES } from 'src/app/core/constants/group.constants';
import { ImagesService } from 'src/app/core/services/images.service';
import { StorageApIService } from 'src/app/core/services/storage-api.service';
import { Image, ImagesSchema } from 'src/app/core/types/adminpage.types';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
})
export class OverlayComponent implements OnInit, OnDestroy {
  private _language?: string;
  private _otherLanguage?: string;
  @Input() type?: string;
  @Input() status?: string;
  @Input() image?: Image;
  @Input() set isDisabled(value: boolean) {
    if (value) {
      this.imagesDetails.disable();
    } else {
      this.imagesDetails.enable();
    }
  }

  imagesDetails = new FormControl([]);

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

  constructor(
    private imageAPI: ImagesService,
    private storageAPI: StorageApIService,
    private imagesAPI: ImagesService
  ) {}

  sub: Subscription[] = [];

  ngOnInit(): void {
    if (this.image?.imageId) {
      this.sub.push(
        zip(
          this.imageAPI.getGalleryImageById(this.language, this.image?.imageId),
          this.imageAPI.getGalleryImageById(
            this.otherLanguage,
            this.image?.imageId
          )
        ).subscribe(([i, o]: any) => {
          this.imagesDetails.patchValue([
            {
              file: undefined,
              image: '',
              imageId: i?.imageId,
              imageCategory: i?.category,
              imageDes: i?.detail,
              imageDetails: i?.detail,
              imageSource: i?.source,
              imageTitle: i?.title,
              imageUpload: i?.isGallery,
              isProfile: i?.isProfile,
              imageUrl: i?.imageUrl || i?.imagePath,
              // other fields
              otherImage: '',
              otherImageCategory: o?.category,
              otherImageDes: o?.detail,
              otherImageDetails: o?.detail,
              otherImageSource: o?.source,
              otherImageTitle: o?.title,
              otherImageUpload: o?.isGallery,
              otherImageUrl: o?.imageUrl || i?.imagePath,
            },
          ]);
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.sub.forEach((x) => x.unsubscribe());
  }

  async onSubmitGallery() {
    const imgX = this.imagesDetails.value?.[0];
    let file = '';
    if (imgX.imageUrl?.includes('firebasestorage')) {
      file = imgX.imageUrl;
    } else if (imgX.file) {
      file =
        (await this.storageAPI.uploadContributionImage(
          imgX.imageId,
          imgX.imageId,
          imgX.imageId,
          imgX.file
        )) || '';
    }
    let images: ImagesSchema = {
      imageId: imgX.imageId,
      imagePath: file,
      rightistId: '',
      imageUrl: file || '',
      isProfile: imgX.isProfile || '',
      isGallery: imgX.imageUpload || '',
      category: imgX.imageCategory || '',
      title: imgX.imageTitle || '',
      detail: imgX.imageDes || '',
      source: imgX.imageSource || '',
    };

    const otherImages: ImagesSchema = {
      imageId: imgX.imageId,
      rightistId: '',
      imagePath: images.imageUrl || '',
      imageUrl: images.imageUrl || '',
      isProfile: images.isProfile || '',
      isGallery: imgX.imageUpload || '',
      category: imgX.otherImageCategory || '',
      title: imgX.otherImageTitle || '',
      detail: imgX.otherImageDes || '',
      source: imgX.otherImageSource || '',
    };
    await Promise.all([
      this.imageAPI.addImage(this.language, images),
      this.imageAPI.addImage(this.otherLanguage, otherImages),
    ]);
  }

  async onDelete() {
    if (!this.image?.rightistId && this.image?.imageId) {
      this.storageAPI.deleteConrtibutionImages(
        this.image?.imageId,
        this.image?.imageId,
        this.image?.imageId
      );
    }
    await Promise.all([
      this.imagesAPI.deleteImage(this.language, this.image?.imageId || ''),
      this.imagesAPI.deleteImage(this.otherLanguage, this.image?.imageId || ''),
    ]);
  }
}
