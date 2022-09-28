import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ContributionSchema } from '../types/adminpage.types';
import { UUID } from '../utils/uuid';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class ContributionsService {
  constructor(
    private store: AngularFirestore,
    private auth: AuthServiceService,
    private db: AngularFireDatabase
  ) {}

  private callAPI(language: string) {
    return this.db.object(
      `/persons/data/${language}/contributions/${this.auth.uid}`
    );
  }

  private callAPI_List(language: string) {
    return this.db.list(
      `/persons/data/${language}/contributions/${this.auth.uid}`,
      (ref) => ref.orderByChild('contributedAt')
    );
  }

  fetchContributorByContributionId(contId: string) {
    return this.db
      .object(
        `/persons/requestArchieve/contributions/${this.auth.uid}/${contId}`
      )
      .valueChanges();
  }

  fetchUserContributions(language: string) {
    return this.callAPI_List(language).valueChanges();
  }

  editUserContributions(
    language: string,
    contributionId: string,
    obj: ContributionSchema
  ) {
    return this.callAPI(language).update({ [contributionId]: obj });
  }

  addUserContributions(language: string, obj: ContributionSchema) {
    const st = this.callAPI(language);
    const contributionId = UUID();
    obj.contributionId = contributionId;
    obj.contributedAt = new Date();
    obj.contributorId = this.auth.uid;
    return st.update({ [contributionId]: obj }).catch((e) => {
      return st.set({ [contributionId]: obj });
    });
  }

  contributionsAddEdit(language: string, obj: ContributionSchema) {
    if (obj.contributionId) {
      return this.editUserContributions(language, obj.contributionId, obj);
    } else {
      return this.addUserContributions(language, obj);
    }
  }

  removeAllUserContributions(language: string) {
    return this.callAPI(language).remove();
  }

  // remove method 1
  removeContributionById(language: string, id: string) {
    return this.db
      .object(`/persons/data/${language}/contributions/${this.auth.uid}/${id}`)
      .remove();
  }

  // Admin get all contribution
  fetchAllContributions(language: string) {
    return this.db
      .object(`/persons/data/${language}/contributions`)
      .valueChanges();
  }

  updateUserContribution(
    language: string,
    obj: ContributionSchema
  ) {
    return this.db
      .object(`/persons/data/${language}/contributions/${obj.contributorId}`)
      .update({ [obj.contributionId]: obj });
  }

  getUserContribution(
    language: string,
    contributorId: string,
    contributionId: string
  ) {
    return this.db
      .object(
        `/persons/data/${language}/contributions/${contributorId}/${contributionId}`
      )
      .valueChanges();
  }

  getUserContributionsList(language: string, contributorId: string) {
    return this.db
      .list(`/persons/data/${language}/contributions/${contributorId}`)
      .valueChanges();
  }

  fetchContributionsList(language: string) {
    return this.db.object(`/persons/data/${language}`);
  }

  deleteUserContribution(language: string, contributorId: string, contributionId: string) {
    this.db
      .object(
        `/persons/data/${language}/contributions/${contributorId}/${contributionId}`
      )
      .remove();
  }
}
