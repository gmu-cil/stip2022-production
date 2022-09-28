import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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

  language: string = ''

  languageSubscription?: Subscription

  constructor(
    public auth: AuthServiceService,
    private storage: StorageApIService,
    private contributionService: ContributionsService,
    private archiveService: ArchieveApiService,
    private router: Router,
    private translate: TranslateService
  ) {}
  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
    this.languageSubscription?.unsubscribe()
  }

  ngOnInit(): void {
    this.language = localStorage.getItem('lang')!

    this.languageSubscription = this.translate.onLangChange.subscribe((langChange: any) => {
      this.language = langChange.lang
      this.subscription.forEach(x => x.unsubscribe())
      this.subscription.length = 0
      this.initialize()
    })

    this.initialize()
  }

  initialize() {
    this.subscription.push(
      this.contributionService.fetchUserContributions(this.language).subscribe((x: any) => {
        this.userContribution = [];
        for (const contribution of x) {
          if (contribution.publish === 'approved') {
            this.archiveService
              .getRightistById(this.language, contribution.rightistId)
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
