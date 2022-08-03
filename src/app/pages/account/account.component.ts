import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ArchieveApiService } from 'src/app/core/services/archives-api-service';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { ContributionsService } from 'src/app/core/services/contributions.service';
import { StorageApIService } from 'src/app/core/services/storage-api.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
  imageUrl!: Observable<string> | undefined;
  isAdmin = false;
  profile: any;
  subscription: Subscription[] = [];
  userContribution: any[] = [];
  userId = this.auth.uid;
  isVeryBtnClicked!: boolean;

  constructor(
    public auth: AuthServiceService,
    private storage: StorageApIService,
    private contributionService: ContributionsService,
    private archiveService: ArchieveApiService,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.subscription.push(
      this.contributionService.fetchUserContributions().subscribe((x: any) => {
        this.userContribution = [];
        for (const contribution of x) {
          if (contribution.publish === 'approved') {
            this.archiveService
              .getPersonById(contribution.rightistId)
              .subscribe((rightist: any) => {
                contribution.rightist = rightist;
              });
          }
        }
        this.userContribution = x.sort((a, b) => {
          return new Date(b.contributedAt).getTime() - new Date(a.contributedAt).getTime();
        });
      })
    );
    const h = this.storage.profileImgeUrl();
    if (h) {
      this.subscription.push(
        h.subscribe((url) => {
          this.imageUrl = url;
        })
      );
    }
    this.subscription.push(
      this.auth.isAdmin.subscribe((isAdmin) => {
        this.isAdmin = isAdmin;
      })
    );
    this.subscription.push(
      this.auth.userDetaills.subscribe((user: any) => {
        this.profile = user;
        if (user?.['uid']) {
          this.userId = user['uid'];
        }
      })
    );
  }

  navigateTo(url: string) {
    this.router.navigateByUrl(url);
  }

  sendverifyEmail() {
    this.isVeryBtnClicked = true;
    this.auth.sendEmailVerification();
  }
}
