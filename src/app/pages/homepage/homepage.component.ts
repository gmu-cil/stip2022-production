import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Router } from '@angular/router';
import { RequestModification } from 'src/app/core/types/emails.types';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  data$: any;
  constructor(private router: Router, private func: AngularFireFunctions) {}
  searchTerm: string = '';
  transPath = 'homepage.component.';

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
      desc: `In 1957, he was accused of “setting fire`
    },
    {
      name: 'John Smith',
      email: 'johnSmith@aol.com',
      profile: 'default-profile.png',
    },
  ];

  ngOnInit(): void {}
  searchArchives() {
    this.router.navigate(['/browse/main'], {
      queryParams: { searchTerm: this.searchTerm },
    });
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
      .subscribe((res) => {
        console.log('Function: ', res);
      });
  }
}
