import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { AnnouncementService } from 'src/app/core/services/announcement.service';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { LoginComponent } from 'src/app/layout/login/login.component';
import { NavBar } from '../layout.constants';
import { NavBarLinks } from '../layout.types';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @ViewChild('login') login!: LoginComponent;
  count = 15;
  isCollapsed = true;
  isLoggedIn = false;
  message: unknown;
  navbars: NavBarLinks = NavBar;
  timeId: any;
  transPath = 'header.component.';
  globalErrorMessage: string[] = [];
  constructor(
    private auth: AuthServiceService,
    private annoucement: AnnouncementService,
    private outsideScope: NgZone,
    private translate: TranslateService,
    private alertService: AlertService
  ) {}
  h = 'home_page';

  get lang() {
    return localStorage.getItem('lang') || 'en';
  }

  ngOnInit(): void {
    this.auth.isLoggedIn.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    });

    // this.annoucement.getAnnounce().subscribe((x) => {
    //   this.message = x;
    //   this.createCounter();
    //   this.outsideScope.run(this.createCounter);
    // });
    this.alertService.alerts.subscribe((x) => {
      this.globalErrorMessage = x;
    });
  }
  loginLogin() {
    this.login.openModal();
  }
  createCounter() {
    let count = 15;
    let timeId = setInterval(() => {
      count--;
      if (this?.count !== undefined) {
        this.count = count;
      }
      if (count <= 0) {
        clearInterval(timeId);
      }
    }, 2000);
  }

  changeLanguage(lang: string) {
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
    this.collapseNavbar();
  }

  collapseNavbar() {
    this.isCollapsed = true;
    const navbar = document.getElementById('navbarMobile');
    if (navbar) {
      navbar.classList.remove('show');
    }
  }
  clearGlobalErrorMessage() {
    this.globalErrorMessage = [];
    this.alertService.clearAlerts();
  }
}
