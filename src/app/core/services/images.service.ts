import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ImagesSchema } from '../types/adminpage.types';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  constructor(private db: AngularFireDatabase) {}

  getAllImages(language: string) {
    return this.db.object(`persons/data/${language}/images`).valueChanges();
  }

  getAllImagesList(language: string) {
    return this.db.list(`persons/data/${language}/images`).valueChanges();
  }

  getGalleryImages(language: string) {
    return this.db
      .list(`persons/data/${language}/images`, (ref) =>
        ref.orderByChild('isGallery').equalTo(true)
      )
      .valueChanges();
  }

  getGalleryImageById(language: string, imageId: string) {
    return this.db.object(`persons/data/${language}/images/${imageId}`).valueChanges();
  }

  addImage(language: string, image: ImagesSchema) {
    return this.db
      .object(`persons/data/${language}/images`)
      .update({ [image.imageId]: image });
  }

  updateImage(language: string, image: ImagesSchema) {
    return this.db
      .object(`persons/data/${language}/images`)
      .update({ [image.imageId]: image });
  }

  deleteImage(language: string, imageId: string) {
    return this.db.object(`persons/data/${language}/images/${imageId}`).remove();
  }

  getImage(language: string, imageId:string) {
    return this.db.object(`persons/data/${language}/images/${imageId}`).valueChanges()
  }
}
