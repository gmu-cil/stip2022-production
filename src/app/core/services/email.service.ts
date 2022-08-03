import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(
    private func: AngularFireFunctions,
    private firestore: AngularFirestore,
    private auth: AuthServiceService
  ) {}

  sendEmail(subject: string, text: string) {
    return this.func.httpsCallable('genericEmail')({ subject, text });
  }

  adminEmailsNotification({ email, isNotified }) {
    return this.firestore
      .doc<any>(`adminEmailsNotification/${this.auth.uid}`)
      .set({ email, isNotified });
  }

  adminNotificationStatus() {
    return this.firestore
      .doc<any>(`adminEmailsNotification/${this.auth.uid}`)
      .valueChanges();
  }
}
