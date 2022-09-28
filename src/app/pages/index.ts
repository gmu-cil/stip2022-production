import {
  AngularFireAuthGuard,
  customClaims,
} from '@angular/fire/compat/auth-guard';
import { map, pipe } from 'rxjs';
import { AboutComponent } from './about/AboutMovement/about.component';
import { AboutResearchComponent } from './about/AboutResearch/about-research.component';
import { AboutTeamComponent } from './about/AboutTeam/about-team.component';
import { ResourcesComponent } from './about/Resources/resources.component';
import { AccountComponent } from './account/account.component';
import { ApprovalComponent } from './admin/approval/approval.component';
import { MainBrowseComponent } from './browse/main-browse/main-browse.component';
import { BrowseArchiveComponent } from './browse/browse-archive/browse-archive.component';
import { BrowseSearchFilterComponent } from './browse/browse-search-filter/browse-search-filter.component';
import { GalleryComponent } from './gallery/gallery.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ShareComponent } from './browse/share/share.component';
import { UploadComponent } from './requestForms/upload/upload.component';

import { EditAccountComponent } from './account/edit-account/edit-account.component';
import { AuthGuard } from '../core/services/auth-guard.service';
import { RepositoryComponent } from './browse/repository/repository.component';
import { RequestModifyComponent } from './requestForms/upload/request-modify/request-modify.component';
import { TermsContributionComponent } from './terms-contribution/terms-contribution.component';

// AuthGuard pipe for admin pages
const adminOnly = () =>
  pipe(
    customClaims,
    map(
      (claims) =>
        claims.admin === true || (claims.user_id != null ? ['account'] : [''])
    )
  );
const viewUploadPage = () =>
  pipe(
    customClaims,
    map((claims) => {
      return (
        claims.email_verified === true ||
        claims.admin === true ||
        (claims.user_id != null ? ['account'] : [''])
      );
    })
  );
// Page components
export const pagesComponents = [
  AboutComponent,
  AboutResearchComponent,
  AboutTeamComponent,
  AccountComponent,
  ApprovalComponent,
  EditAccountComponent,
  MainBrowseComponent,
  BrowseSearchFilterComponent,
  GalleryComponent,
  HomepageComponent,
  ResourcesComponent,
  BrowseArchiveComponent,
  UploadComponent,
  RepositoryComponent,
  RequestModifyComponent,
  TermsContributionComponent,
];

// Page routes
export const pagesRoutes = [
  {
    path: 'about/movement',
    component: AboutComponent,
    data: {
      title: 'Movement',
    },
  },
  {
    path: 'about/resources',
    component: ResourcesComponent,
    data: {
      title: 'Other Resources',
    },
  },
  {
    path: 'about/team',
    component: AboutTeamComponent,
    data: {
      title: 'Team',
    },
  },
  {
    path: 'about/research',
    component: AboutResearchComponent,
    data: {
      title: 'Research',
    },
  },
  {
    path: 'browse/gallery',
    component: GalleryComponent,
    data: {
      title: 'Gallery',
    },
  },
  {
    path: 'repository',
    component: RepositoryComponent,
    data: {
      title: 'repository',
    },
  },
  {
    path: 'browse/repository',
    component: RepositoryComponent,
    data: {
      title: 'Repository',
    },
  },
  {
    path: 'browse/main',
    component: MainBrowseComponent,
    data: {
      title: 'Archive',
    },
  },
  {
    path: 'browse/main/memoir/:id',
    component: BrowseArchiveComponent,
    data: {
      title: 'Browse Archive',
    },
  },

  {
    path: 'account',
    component: AccountComponent,
    canActivate: [AngularFireAuthGuard, AuthGuard],
    data: {
      title: 'Account',
    },
  },
  {
    path: 'edit-account',
    component: EditAccountComponent,
    canActivate: [AngularFireAuthGuard, AuthGuard],
  },
  {
    path: 'upload',
    component: UploadComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      title: 'Edit Account',
      authGuardPipe: viewUploadPage,
    },
  },
  {
    path: 'share',
    component: ShareComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      title: 'share',
    },
  },
  {
    path: 'meetTeam',
    component: AboutTeamComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      title: 'meetTeam',
    },
  },
  {
    path: 'resources',
    component: ResourcesComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      title: 'resources',
    },
  },
  {
    path: 'research',
    component: AboutResearchComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      title: 'research',
    },
  },
  {
    path: 'request-modify',
    component: RequestModifyComponent,
    data: {
      title: 'request-modify',
    },
  },
  {
    path: 'terms-contribution',
    component: TermsContributionComponent,
    data: {
      title: 'Terms and Conditions of Contribution',
    },
  },
];

export const adminRoutes = [
  {
    path: 'admin/approval',
    component: ApprovalComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: adminOnly, title: 'Approval' },
  },
];
