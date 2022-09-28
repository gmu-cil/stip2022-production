import {
  Component,
  Input,
  OnInit,
  EventEmitter,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LIST_OF_IMAGE_CATEGORIES } from 'src/app/core/constants/group.constants';
import { ImagesService } from 'src/app/core/services/images.service';
import { ImageSchema } from 'src/app/core/types/adminpage.types';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.scss'],
})
export class UploadImageComponent implements OnInit {
  private _cleared?: boolean;

  @Input() set cleared(value: boolean) {
    this._cleared = value;
    if (value == true) {
      this.clearImage();
      this.imageForm.reset();
    }
  }

  get cleared(): boolean {
    return this._cleared!;
  }

  @Input() page?: string;
  @Input() imageData?: ImageSchema;
  @Input() otherImageData?: ImageSchema;
  @Input() imageDisabled?: boolean;
  @Output() imageChange: EventEmitter<any> = new EventEmitter();

  language: string = '';
  otherLanguage: string = '';

  imageCategories: string[] = [];
  otherImageCategories: string[] = [];

  url = '';

  imageForm = new FormGroup({
    imageUpload: new FormControl(''),
    image: new FormControl(''),
    imageTitle: new FormControl(''),
    otherImageTitle: new FormControl(''),
    imageDes: new FormControl(''),
    otherImageDes: new FormControl(''),
    imageSource: new FormControl(''),
    otherImageSource: new FormControl(''),
    imageCategory: new FormControl(''),
    otherImageCategory: new FormControl(''),
  });

  sub: Subscription[] = [];

  constructor(private imageAPI: ImagesService) {}
  ngOnInit(): void {
    this.language = localStorage.getItem('lang')!;
    this.otherLanguage = this.language === 'en' ? 'cn' : 'en';

    this.imageCategories = LIST_OF_IMAGE_CATEGORIES[this.language];
    this.otherImageCategories = LIST_OF_IMAGE_CATEGORIES[this.otherLanguage];

    this.sub.push(
      this.imageForm.controls['imageCategory'].valueChanges.subscribe(
        (value) => {
          let index = this.imageCategories.indexOf(value);

          this.imageForm.patchValue({
            otherImageCategory:
              LIST_OF_IMAGE_CATEGORIES[this.otherLanguage][index],
          });
        }
      )
    );

    console.log(this.imageData);
    console.log(this.otherImageData);

    if (this.imageForm) {
      this.url = this.imageData!.imagePath!;
      this.imageForm.patchValue({
        imageUpload: this.imageData!.isGallery ? 'yes' : 'no',
        image: '',
        imageTitle: this.imageData!.galleryTitle,
        imageDes: this.imageData!.galleryDetail,
        imageSource: this.imageData!.gallerySource,
        imageCategory: this.imageData!.galleryCategory,
      })
    }

    if (this.otherImageData) {
      this.imageForm.patchValue({
        otherImageTitle: this.otherImageData.galleryTitle,
        otherImageDes: this.otherImageData.galleryDetail,
        otherImageSource: this.otherImageData.gallerySource,
        otherImageCategory: this.otherImageData.galleryCategory,
      });
    

    // if (this.imageData!.imageId) {
    //   this.sub.push(
    //     this.imageAPI
    //       .getImage(this.otherLanguage, this.imageData!.imageId)
    //       .subscribe((otherImage: any) => {
    //         if (this.otherImageData) {
              
    //           console.log(otherImage);

    //           this.imageForm.patchValue({
    //             imageUpload: this.imageData!.isGallery ? 'yes' : 'no',
    //             image: '',
    //             otherImageTitle: otherImage.galleryTitle,
    //             otherImageDes: otherImage.galleryDetail,
    //             otherImageSource: otherImage.gallerySource,
    //             otherImageCategory: otherImage.galleryCategory,
    //           });
    //         }
    //       })
    //   );
    }

    this.sub.push(
      this.imageForm.valueChanges.subscribe((data: any) => {
        this.imageChange.emit({
          type: 'image',
          value: data,
        });
      })
    );
  }

  clearImage() {
    this.url = '';
    this.imageForm.patchValue({
      image: '',
    });

    this.imageChange.emit({
      type: 'clear',
    });
  }

  onselectFile(e) {
    if (e.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.imageChange.emit({
          type: 'url',
          value: this.url,
        });
      };
    }
  }
}
