import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class StorageApIService {
  constructor(
    private afs: AngularFireStorage,
    private auth: AuthServiceService
  ) {
  }

  profileImage(uid = this.auth.uid) {
    return this.afs.ref(`userProfile/${uid}`);
  }

  profileImgeUrl(uid = this.auth.uid) {
    try {
      return this.profileImage(uid).getDownloadURL();
    } catch (error) {
      return undefined;
    }
  }

  uploadProfileImage(file: File, uid = this.auth.uid) {
    const ref = this.profileImage(uid);
    const upload = ref.put(file);
    return upload;
  }

  getGalleryImageURL(imageId: string) {
    return this.afs.ref(`images/galleries/${imageId}`).getDownloadURL();
  }

  uploadGalleryImage(uid: string, file: File) {
    const ref = this.afs.ref(`images/galleries/${uid}`);
    const upload = ref.put(file);
    return upload;
  }

   async uploadContributionImage(uid: string, contributionid: string, imageid: string, file: File) {
    const url = `/images/contribution/${uid}/${contributionid}/${imageid}`;
    const ref = this.afs.ref(`/images/contribution/${uid}/${contributionid}/${imageid}`);
    const ff = await lastValueFrom(this.afs.upload(url, file).snapshotChanges())
    return ff?.ref.getDownloadURL();
  }

   async deleteConrtibutionImages(uid: string, contributionid: string, imageid: string) {
    return this.afs.ref(`/images/contribution/${uid}/${contributionid}/${imageid}`).delete()
  }

  removeGalleryImage(uid: string) {
    const ref = this.afs.ref(`images/galleries/${uid}`);
    const upload = ref.delete();
    return upload;
  }

  getImageUrl(imageId: string) {
    return this.afs.ref(`images/${imageId}`).getDownloadURL();
  }

  uploadImage(imageId: string, file: File) {
    return this.afs.ref(`images/${imageId}`).put(file)
  }

  removeImage(imageId: string) {
    return this.afs.ref(`images/${imageId}`).delete()
  }
}
