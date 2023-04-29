import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom, Observable, Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { StorageApIService } from 'src/app/core/services/storage-api.service';
import { UploadImagesType } from 'src/app/core/types/adminpage.types';
import { FormCustomProvider } from 'src/app/core/utils/helper';
import { createUniqueUID } from 'src/app/core/utils/uuid';

type UploadType = 'single' | 'multiple';
type PageType = 'gallery' | 'profile';

@Component({
  selector: 'app-upload-images-form',
  templateUrl: './upload-images-form.component.html',
  styleUrls: ['./upload-images-form.component.scss'],
  providers: [FormCustomProvider(UploadImagesFormComponent)],
})
export class UploadImagesFormComponent implements OnInit, ControlValueAccessor {
  disabled: boolean = false;
  private newImage(a = {} as UploadImagesType): FormGroup {
    return this.formBuilder.group({
      image: this.formBuilder.control(a.image || ''),
      file: this.formBuilder.control(a.file || ''),
      imageId: this.formBuilder.control(a.imageId || createUniqueUID()),
      imageCategory: this.formBuilder.control(a.imageCategory || 'People'),
      imageDes: this.formBuilder.control(a.imageDes || ''),
      imageDetails: this.formBuilder.control(a.imageDetails || ''),
      imageSource: this.formBuilder.control(a.imageSource || ''),
      imageTitle: this.formBuilder.control(a.imageTitle || ''),
      imageUpload: this.formBuilder.control(a.imageUpload || this.pageType === 'gallery' || false),
      isProfile: this.formBuilder.control(a.isProfile || ''),
      imageUrl: this.formBuilder.control(a.imageUrl || ''),
      otherImage: this.formBuilder.control(a.otherImage || ''),
      otherImageCategory: this.formBuilder.control(a.otherImageCategory || ''),
      otherImageDes: this.formBuilder.control(a.otherImageDes || ''),
      otherImageDetails: this.formBuilder.control(a.otherImageDetails || ''),
      otherImageSource: this.formBuilder.control(a.otherImageSource || ''),
      otherImageTitle: this.formBuilder.control(a.otherImageTitle || ''),
      otherImageUpload: this.formBuilder.control(a.otherImageUpload || this.pageType === 'gallery'  || false),
      otherImageUrl: this.formBuilder.control(a.otherImageUrl || ''),
    });
  }
  @Input() type: UploadType = 'multiple';
  @Input() pageType: PageType = 'profile';
  @Input() showOnlyDetails: boolean = false;
  imageArray = this.formBuilder.array([]);
  sub: Subscription[] = [];
  subLang: Subscription[] = [];
  subImageChange: Subscription[] = [];
  isAdmin: boolean = false;
  imageCategories: string[] = [];
  otherImageCategories: string[] = [];

  profileControl = this.formBuilder.control('');

  language?: string;
  otherLanguage?: string;

  get controls(): FormGroup[] {
    return this.imageArray.controls as FormGroup[];
  }

  get onlyDetails(): boolean {
    return this.showOnlyDetails && this.pageType === 'gallery' && this.disabled;
  }

  // imageValue!: UploadImagesType[];

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthServiceService,
    private transService: TranslateService,
    private storageAPI: StorageApIService,
    private _ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub.push(
      this.auth.isAdmin.subscribe((isAdmin) => {
        this.isAdmin = isAdmin;
      })
    );
    this.language = this.transService.currentLang;
    this.otherLanguage = this.language === 'en' ? 'cn' : 'en';
    this.subLang.push(
      this.transService.onLangChange.subscribe((lang) => {
        this.language = lang.lang;
        this.otherLanguage = lang.lang === 'en' ? 'cn' : 'en';
      })
    );
  }

  onChange = (imageArray) => {};

  onTouched = (event) => {};

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.imageArray.disable();
    } else {
      this.imageArray.enable();
    }
  }

  async onselectFile(e, i) {
    if (e.target.files) {
      var reader = new FileReader();
      const file = e.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        this.imageArray.controls[i].patchValue({
          imageUrl: event.target.result,
          file,
        });
      };
    }
  }
  writeValue(obj: UploadImagesType[]): void {
    if (obj) {
      if (obj.length > 0) {
        this.imageArray.clear();
        obj.map((item) => this.imageArray.push(this.newImage(item)));
      }
      if (this.imageArray.controls.length === 0) {
        this.addImage();
      }
      this.imagesChange();
      if (this.disabled) {
        this.imageArray.disable();
      } else {
        this.imageArray.enable();
      }
    } else {
      this.imageArray.controls = [];
      if (this.imageArray.controls.length === 0) {
        this.addImage();
        this.imagesChange();
      }
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  addImage() {
    this.imageArray.push(this.newImage());
  }

  remove(i: number) {
    this.imageArray.removeAt(i);
  }
  onImageCategoryChange(data: any, i: number) {}

  imagesChange() {
    this.subImageChange.forEach((sub) => sub.unsubscribe());
    this.onChange(this.imageArray.value);
    this.subImageChange.push(
      this.imageArray.valueChanges.subscribe((data) => {
        this.onChange(data);
      })
    );
  }

  selectDefaultProfile(i) {
    this.imageArray.controls.forEach((e, idx) => {
      if (idx !== i) {
        e.get('isProfile')?.setValue(false);
      }
    });
  }
}
