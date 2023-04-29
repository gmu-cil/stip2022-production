import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ArchieveApiService } from 'src/app/core/services/archives-api-service';
import { FilterTypes } from 'src/app/core/types/filters.type';
import { LETTERS } from '../browse/main-browse/main-browse.constant';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() db_result: any[] = [];
  //variables for search functionalities
  archSubAPI: Subscription[] = [];
  currentLanguage = this.translate.currentLang;
  currentLetter = 'All';
  curView = 'List';
  display: any[] = [];
  isloading!: boolean;
  letter_changed: boolean = false;
  letters = LETTERS;
  limit: number = 50;
  original: any;
  searchBy: string =
    this.route.snapshot.queryParamMap.get('searchBy') || 'fullName';
  searchInput = this.route.snapshot.queryParamMap.get('searchTerm') || '';
  searchSelect: string = 'All Fields';
  searchState = {
    key: this.route.snapshot.queryParamMap.get('searchBy') || 'initial',
    value: this.route.snapshot.queryParamMap.get('searchTerm') || 'All',
  };
  sub: Subscription[] = [];

  constructor(
    private archApi: ArchieveApiService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetection: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  /**
   * An initilizer to reset varaiables to initial states.
   * @param letter letters from A to Z and "All"
   */
  initLetter(letter) {
    this.currentLetter = letter;
    this.callAPI(letter, this.searchState);
    this.searchSelect =
      this.currentLanguage == 'en' ? 'All Fields' : '所有信息栏';
    this.db_result = [];
  }

  ngOnInit(): void {
    this.sub.push(
      this.route.queryParams.subscribe((params) => {
        this.searchInput = params['searchTerm'] || '';
        this.initLetter(this.currentLetter ?? 'All');
      })
    );
    this.translate.onLangChange.subscribe((res) => {
      this.currentLanguage = res.lang;
      this.translate
        .get(['archive.archive_searchbar_all'])
        .subscribe((translations) => {
          this.searchSelect = translations['archive.archive_searchbar_all'];
        });
      // clean up cache, so different languages can use the cache.
      this.ngOnDestroy();
      this.initLetter(this.currentLetter ?? 'All');
    });
  }
  ngOnDestroy(): void {
    this.archSubAPI.forEach((sub) => sub.unsubscribe());
  }

  onScroll() {
    this.callAPI(this.currentLetter, this.searchState, true);
  }

  /**
   * This methods reacts to the change of different "letter" buttons click
   * @param letter Letters from A to Z, and "All"
   */
  lettersBtnClickOrReset(letter: string) {
    this.currentLetter = letter;
    this.limit = 50;
    this.searchState = { key: 'initial', value: letter };
    this.callAPI(letter, this.searchState);
  }

  /**
   * This method helps to remove the initial letter of each original source documents' desciption.
   * This is just a temp fix.
   * If possible, the Database needs to clean up the data.
   */
  removeInitialForDesciption() {
    this.db_result.forEach((document) => {
      if (document.source == 'original') {
        document.description = document.description.slice(1);
      }
    });
  }

  /**
   * This methods helps to fetch data using API calls from Firebase.
   * For efficiency, fetched data would get placed into "cache"
   * @param letter Letters from A to Z, and "All"
   */
  callAPI(
    letter: string = this.currentLetter,
    search = { key: 'initial', value: 'All' },
    isScroll = false
  ) {
    //clear up display
    const archKey = `person_arch_${letter}`;
    let res;
    this.isloading = true;
    if (letter) {
      this.archSubAPI.forEach((sub) => sub.unsubscribe());
      // replace api when database change. An we need to add profileId to json data.
      res = this.archApi
        .getAllArchieveList(this.currentLanguage, { ...search }, this.limit)
        .subscribe((datas: any) => {
          this.display = datas.slice();
          this.removeInitialForDesciption();
          this.isloading = false;
          setTimeout(() => {
            const idIdx =
              this.display.length !== this.limit
                ? this.display.length - 1
                : this.limit - 51;
            if (isScroll) {
              // document.getElementById('local_id_' + idIdx)?.focus();
              this.changeDetection.detectChanges();
            }
            this.limit = this.display.length + 50;
          }, 500);
        });
    }
    if (res) {
      this.archSubAPI.push(res);
    }
  }
  search() {
    this.limit = 50;
    if (this.searchInput) {
      this.currentLetter = 'All';
      this.searchState = { key: this.searchBy, value: this.searchInput };
      this.callAPI('All', this.searchState);
      // set query params to url for searchInput
      this.router.navigate([], {
        queryParams: { searchBy: this.searchBy, searchTerm: this.searchInput },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate([], {
        queryParams: {}
      });
      this.searchState = { key: 'initial', value: 'All' };
      this.callAPI(this.currentLetter, this.searchState);
    }
  }

  //sort filtered searching documents base on 'Name' only.
  sortByNameAlphabet() {
    this.db_result = this.db_result.sort(function (a, b) {
      return a.lastName.localeCompare(b.lastName);
    });
  }
}
