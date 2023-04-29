import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { AnnouncementService } from 'src/app/core/services/announcement.service';
import { RequestModification } from 'src/app/core/types/emails.types';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit, OnDestroy {
  data$: any;
  randomProfile: any[] = [];
  constructor(
    private router: Router,
    private func: AngularFireFunctions,
    private announceProfile: AnnouncementService,
    private translateService: TranslateService
  ) {}
  ngOnDestroy(): void {
    // this.subs.forEach((sub) => sub?.unsubscribe());
  }
  searchTerm: string = '';
  transPath = 'homepage.component.';
  subs: Subscription[] = [];
  searchBy: string = 'fullName';

  fakeProfile = [
    {
      name: 'Chu Wenlang',
      email: 'johnDoe@aol.com',
      profile: 'theguy.png',
    },
    {
      name: 'Jane Doe',
      email: 'JaneDoe@aol.com',
      profile: 'default-profile.png',
      desc: `In 1957, he was accused of “setting fire`,
    },
    {
      name: 'John Smith',
      email: 'johnSmith@aol.com',
      profile: 'default-profile.png',
    },
  ];

  ngOnInit(): void {
    console.log(this.randomProfile);
    this.subs.push(
      this.translateService.onLangChange.subscribe(async (res) => {
        this.getRandomProfile(res.lang);
      })
    );
    if (this.randomProfile.length === 0) {
      this.getRandomProfile();
    }
  }

  async getRandomProfile(lang = this.translateService.currentLang) {
    this.randomProfile = [];
    let randomProfile = await firstValueFrom<any>(
      this.announceProfile.getRandomProfile(lang)
    ) ?? [];
    if (randomProfile.length < 3) {
      randomProfile.push(...(await firstValueFrom<any>(
        this.announceProfile.getRandomProfile(lang, false)
      ) ?? []));
    }
    console.log(randomProfile);
    while (this.randomProfile.length < 3 && randomProfile.length >= 3) {
      const random = Math.floor(Math.random() * randomProfile.length);
      if (!this.randomProfile.includes(randomProfile[random])) {
        this.randomProfile.push(randomProfile[random]);
      }
    }
  }

  searchArchives() {
    if (this.searchTerm) {
      this.router.navigate(['/browse/main'], {
        queryParams: { searchTerm: this.searchTerm, searchBy: this.searchBy },
      });
    } else {
      this.router.navigate(['/browse/main']);
    }
  }

  sendRequestForm() {
    // Example for Yule's request form API call. Please remove function call after checking.
    const payload: RequestModification = {
      email: 'test@gmail.com',
      rightistId: 'A00000000',
      modifyRequest: 'HJ 23232H3JJ23H2J3H2J3H23HJ23',
      reasonRequest: 'I want to modify my request',
      url: location.href,
    };
    this.func
      .httpsCallable('modifyRightistRequest')(payload)
      .subscribe((res) => {});
  }
}
