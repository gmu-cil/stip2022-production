import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  constructor(
    private db: AngularFireDatabase,
    private auth: AuthServiceService
  ) {}

  getAnnounce() {
    return this.db.object(`/announcement/announce`).valueChanges();
  }

  // Update announcement and track which admin made the change.
  trackAdminChange(message: string) {
    return this.db.object(`/announcement`).update({
      track_change: {
        updated_by: this.auth.getUserDetails()?.email || '',
        created_by: new Date().toString(),
        last_updated: new Date().toString(),
      },
      announce: message,
    });
  }

  getRandomProfile(lang: string = 'en', asImage = true) {
    return this.db
      .list(`/persons/data/${lang}/rightists`, (ref) => asImage ? ref.orderByChild('images/0/isProfile').equalTo(true).limitToLast(15) : ref.limitToLast(15))
      .valueChanges();
  }
}
