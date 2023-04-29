import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';

import { NgxBootstrapModule } from './module/ngx-bootrap.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMasonryModule } from 'ngx-masonry';
import { NgxSpinnerModule } from 'ngx-spinner';

// Index Components
import { allLayoutComponents } from './layout';
import { pagesComponents } from './pages';
import { sharedComponents } from './shared';

// Firebase Modules
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import {
  AngularFireFunctionsModule,
  ORIGIN,
} from '@angular/fire/compat/functions';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';

import { environment } from 'src/environments/environment';
import { AuthServiceService } from './core/services/auth-service.service';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

//Pipe: used to transfrom db data
import { UpdateRowsPipe } from './core/pipes/update-rows-pipe.pipe';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShareComponent } from './pages/browse/share/share.component';

import { UploadComponent } from './pages/requestForms/upload/upload.component';

import { AppComponent } from './app.component';
import { ContributionComponent } from './pages/admin/contribution/contribution.component';
import { EditAccountComponent } from './pages/account/edit-account/edit-account.component';
import { LangInterceptor } from './core/interceptors/lang.interceptor';
import { OverlayComponent } from './pages/gallery/overlay/overlay.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { RequestModifyComponent } from './pages/requestForms/upload/request-modify/request-modify.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SearchComponent } from './pages/search/search.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    ...allLayoutComponents,
    ...pagesComponents,
    ...sharedComponents,
    UpdateRowsPipe,
    ShareComponent,
    EditAccountComponent,
    UploadComponent,
    OverlayComponent,
    ContributionComponent,
    RequestModifyComponent,
    SearchComponent,
  ],
  imports: [
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    HttpClientModule,
    AngularFirestoreModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgxBootstrapModule,
    HttpClientModule,
    NgxMasonryModule,
    NgxSpinnerModule,
    InfiniteScrollModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    AuthServiceService,
    {
      provide: ORIGIN,
      useValue: 'https://us-central1-stip-demo.cloudfunctions.net/',
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LangInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
