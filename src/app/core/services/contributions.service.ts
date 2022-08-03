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

  private callAPI() {
    return this.db.object(
      `/persons/requestArchieve/contributions/${this.auth.uid}`
    );
  }

  private callAPI_List() {
    return this.db.list(`/persons/requestArchieve/contributions/${this.auth.uid}`, ref => ref.orderByChild('contributedAt'));
    }

  fetchContributorByContributionId(contId: string) {
    return this.db
      .object(
        `/persons/requestArchieve/contributions/${this.auth.uid}/${contId}`
      )
      .valueChanges();
  }

  fetchUserContributions() {
    return this.callAPI_List().valueChanges();
  }

  editUserContributions(contributionId: string, obj: ContributionSchema) {
    return this.callAPI().update({ [contributionId]: obj });
  }

  addUserContributions(obj: ContributionSchema) {
    const st = this.callAPI();
    const contributionId = UUID();
    obj.contributionId = contributionId;
    obj.contributedAt = new Date();
    obj.contributorId = this.auth.uid;
    return st.update({ [contributionId]: obj }).catch((e) => {
      return st.set({ [contributionId]: obj });
    });
  }

  contributionsAddEdit(obj: ContributionSchema) {
    if (obj.contributionId) {
      console.log('edit')
      return this.editUserContributions(obj.contributionId, obj);
    } else {
      console.log('add')
      return this.addUserContributions(obj);
    }
  }

  removeAllUserContributions() {
    return this.callAPI().remove();
  }

  // remove method 1
  removeContributionById(id: string) {
    return this.db
      .object(`/persons/requestArchieve/contributions/${this.auth.uid}/${id}`)
      .remove();
  }

  // Admin get all contribution
  fetchAllContributions() {
    return this.db
      .object(`/persons/requestArchieve/contributions`)
      .valueChanges();
  }

  updateUserContribution(
    contributorId: string,
    contributionId: string,
    obj: ContributionSchema
  ) {
    return this.db
      .object(`/persons/requestArchieve/contributions/${contributorId}`)
      .update({ [contributionId]: obj });
  }

  fetchContributionsList(language: string) {
    return this.db
      .object(`/persons/data/${language}`)
  }
}
