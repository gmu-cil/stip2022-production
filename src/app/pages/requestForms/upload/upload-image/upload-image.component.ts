import { Component, Input, OnInit, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ImageSchema } from 'src/app/core/types/adminpage.types';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.scss'],
})
export class UploadImageComponent implements OnInit {
  
  private _cleared?: boolean

  @Input() set cleared(value: boolean) {
    this._cleared = value
    console.log(value)
    if (value == true) {
      this.clearImage()
      this.imageForm.reset()
    }
  }

  get cleared(): boolean {
    return this._cleared!
  }

  @Input() imageData?: ImageSchema
  @Input() imageDisabled?: boolean
  @Output() imageChange : EventEmitter<any> = new EventEmitter();

  url = '';

  imageForm = new FormGroup({
    imageUpload: new FormControl(''),
    image: new FormControl(''),
    imageTitle: new FormControl(''),
    imageDes: new FormControl(''),
    imageSource: new FormControl(''),
    imageCategory: new FormControl('')
  });

  constructor() {}
  ngOnInit(): void {
    console.log(this.imageDisabled)
    if (this.imageData) {
      this.url = this.imageData.imagePath!

      this.imageForm.patchValue({
        imageUpload: this.imageData!.isGallery ? 'yes' : 'no',
        image: '',
        imageTitle: this.imageData!.galleryTitle,
        imageDes: this.imageData!.galleryDetail,
        imageSource: this.imageData!.gallerySource,
        imageCategory: this.imageData!.galleryCategory
      })
    }
    this.imageForm.valueChanges.subscribe((data: any) => {

      this.imageChange.emit({
        type: 'image',
        value: data,
      })
    })
  }

  clearImage() {
    this.url = ''
    this.imageForm.patchValue({
      image: ''
    })
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
        })
      };
    }
  }
}
