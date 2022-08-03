import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  constructor() {}
  fakeProfile = [
    {
      name: 'John Doe',
      email: 'johnDoe@aol.com',
      profile: 'default-profile.png',
    },
    {
      name: 'Jane Doe',
      email: 'JaneDoe@aol.com',
      profile: 'default-profile.png',
    },
    {
      name: 'John Smith',
      email: 'johnSmith@aol.com',
      profile: 'default-profile.png',
    },
    {
      name: 'John Smith',
      email: 'johnSmith@aol.com',
      profile: 'default-profile.png',
    },
    {
      name: 'John Smith',
      email: 'johnSmith@aol.com',
      profile: 'default-profile.png',
    },
    {
      name: 'John Smith',
      email: 'johnSmith@aol.com',
      profile: 'default-profile.png',
    },
    {
      name: 'John Smith',
      email: 'johnSmith@aol.com',
      profile: 'default-profile.png',
    },
    {
      name: 'John Smith',
      email: 'johnSmith@aol.com',
      profile: 'default-profile.png',
    },
    {
      name: 'John Smith',
      email: 'johnSmith@aol.com',
      profile: 'default-profile.png',
    },
  ];
  ngOnInit(): void {}
}
