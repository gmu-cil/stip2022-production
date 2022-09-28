import { Component, OnInit } from '@angular/core';

type Views = 'T' | 'P' | 'F';

const HeadTitles = {
  T: 'Terms & Conditions',
  P: 'Privacy Policy',
  F: 'Frequently Asked Questions',
};

@Component({
  selector: 'app-terms-contribution',
  templateUrl: './terms-contribution.component.html',
  styleUrls: ['./terms-contribution.component.scss'],
})
export class TermsContributionComponent implements OnInit {
  curView: Views = 'T';
  header_titles = HeadTitles;
  get curHeaderTitle() {
    return this.header_titles[this.curView];
  }
  constructor() {}

  ngOnInit(): void {}
}
