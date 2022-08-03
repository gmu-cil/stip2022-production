import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  OnDestroy,
  Attribute,
  ViewChild,
  SimpleChanges,
  NgZone,
  OnChanges,
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { concatAll, Subscription } from 'rxjs';
import { ArchieveApiService } from 'src/app/core/services/archives-api-service';
import { FilterTypes } from 'src/app/core/types/filters.type';
import { LETTERS } from './main-browse.constant';
import { BrowseSearchFilterComponent } from 'src/app/pages/browse/browse-search-filter/browse-search-filter.component';
import { BsDropdownModule, BsDropdownConfig } from 'ngx-bootstrap/dropdown';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main-browse',
  templateUrl: './main-browse.component.html',
  styleUrls: ['./main-browse.component.scss'],
})
export class MainBrowseComponent implements OnInit, OnDestroy {
  //search result panel variables
  currentLetter = 'All';
  currentPage = 1;
  curView = 'List';
  display: any[] = [];
  filterValues: FilterTypes = {} as FilterTypes;

  itemsPerPage = 30;
  searchInput = '';
  letters = LETTERS;
  maxPage = 1;
  olditemsPerPage = 30;

  //variables for search functionalities
  @Input() db_result: any[] = [];

  db_result_thousands_seperator: string = '0';
  letter_changed: boolean = false;
  nonFilterData: any[] = [];
  archCacheAPI: any = {};
  archSubAPI: Subscription[] = [];
  isloading!: boolean;
  original: any;

  searchSelect: string = 'All Fields';
  db_attr: string[] = [
    'initial',
    'firstName',
    'lastName',
    'fullName',
    'gender',
    'birthYear',
    'deathYear',
    'rightistYear',
    'rightistId',
    'status',
    'ethnicity',
    'job',
    'detailJob',
    'workplace',
    'workplaceCombined',
    'endYear',
    'event',
    'startYear',
    'memoirAuthor',
    'memoirContent',
    'memoirTitle',
    'reference',
    'description',
    'source',
  ];

  currentLanguage = this.translate.currentLang;

  @ViewChild(BrowseSearchFilterComponent)
  private browseSearchFilterComponent!: BrowseSearchFilterComponent;

  constructor(
    private archApi: ArchieveApiService,
    private route: ActivatedRoute,
    private changeDetection: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  sub: Subscription[] = [];

  initLetter(letter) {
    this.currentPage = 1;
    this.currentLetter = letter;
    this.setDisplayInfo(this.currentPage);
    this.callAPI(letter);
  }

  ngOnInit(): void {
    this.sub.push(
      this.route.queryParams.subscribe((params) => {
        this.searchInput = params['searchTerm'] || '';
        this.initLetter('All');
      })
    );
    this.translate.onLangChange.subscribe((res) => {
      this.currentLanguage = res.lang;

      this.translate
        .get(['archive.archive_searchbar_all'])
        .subscribe((translations) => {
          this.searchSelect = translations['archive.archive_searchbar_all'];
        });
    });
  }
  ngOnDestroy(): void {
    this.archSubAPI.forEach((sub) => sub.unsubscribe());
    this.archCacheAPI = {};
  }

  ngDoCheck() {
    this.thousandsSeperator();
  }

  itemPerPageChanged() {
    
    //casting
    this.itemsPerPage = +this.itemsPerPage;

    this.setDisplayInfo(this.itemsPerPage);
    this.olditemsPerPage = this.itemsPerPage;
  }

  setDisplayInfo(startItemsPerPage: number) {
    var start = (this.currentPage - 1) * startItemsPerPage;
    var end = start + this.itemsPerPage;

    this.display = this.db_result.slice(start, end);
    this.maxPage = Math.max(
      Math.ceil(this.db_result.length / this.itemsPerPage),
      1
    );
  
  }

  pageChanged(event: any, letter: string) {

    if (!this.letter_changed) {
 
      this.currentPage = event.page;
      this.setDisplayInfo(this.itemsPerPage);
    } else {

      this.currentPage = 1;
      this.currentLetter = letter;
      this.callAPI(letter);
    }
    this.letter_changed = false;
  }

  lettersBtnClickOrReset(letter: string) {
    this.currentLetter = letter;

  
    if (this.currentPage == 1) {
      this.setDisplayInfo(this.currentPage);
      this.callAPI(letter);
    } else {
      this.currentPage = 1;
      this.setDisplayInfo(this.currentPage);
      this.letter_changed = true;
    }
    
    this.searchBar();
  }

  //for testing data
  callAPI(letter: string) {

    //clear up display
    this.display = [];

    const alpha = letter === 'All' ? '' : letter;
    const archKey = `person_arch_${letter}`;

    let res;
    //'from cache data'
    if (this.archCacheAPI[archKey]) {

      this.db_result = this.archCacheAPI[archKey];
    
      this.setDisplayInfo(this.itemsPerPage);
      this.setNonFilterData('filterPanel');
      this.setNonFilterData('searchBar');
    } else {
    
      this.isloading = true;
      if (letter === 'All') {
        // replace api when database change. An we need to add profileId to json data.
        res = this.archApi
          .getAllArchieve(this.currentLanguage)
          .subscribe((datas: any) => {
            this.db_result = Object.entries(datas).map(([key, value]: any) => {
              return { profileId: key, ...value };
            });

            this.archCacheAPI[archKey] = this.db_result;
     
            this.setDisplayInfo(this.itemsPerPage);
            this.setNonFilterData('filterPanel');
            this.setNonFilterData('searchBar');
            if (this.searchInput) {
              this.searchBar();
            }

            this.isloading = false;
          });
      } else {

        // replace api when database change. An we need to add profileId to json data.
        // res = this.archApi
        //   .getAllArchieve()
        //   .subscribe((datas: any) => {

        this.db_result = this.archCacheAPI['person_arch_All'].filter(
          (r: any) => r.initial == letter
        );
        this.archCacheAPI[archKey] = this.db_result;
        this.setDisplayInfo(this.itemsPerPage);
        this.setNonFilterData('filterPanel');
        this.setNonFilterData('searchBar');
        this.isloading = false;
        if (this.searchInput) {
          this.searchBar();
        }
        // });
      }
    }
    if (res) {
      this.archSubAPI.push(res);
    }

  }

  searchBar() {
  
    this.browseSearchFilterComponent?.clear();
    const userValues = this.searchInput.split(' ');

    this.getNonFilterData('searchBar');
   

    this.db_result = this.db_result.filter((record: any): boolean => {
      return userValues.every((keyword) => {
        var res: boolean = false;

        if (
          this.searchSelect == 'All Fields' ||
          this.searchSelect == '所有信息栏'
        ) {
          Object.values(record).forEach((element) => {
            res =
              res ||
              this.containKeyword(
                JSON.stringify(element, this.db_attr),
                keyword
              );
          });
        } else {
          var values: string[] = [];
          this.db_attr.forEach((attribute) => {
            if (
              typeof record[attribute] === 'string' ||
              record[attribute] instanceof String
            )
              values.push(record[attribute]);
          });

          values.forEach((element) => {
            res =
              res ||
              this.containKeyword(
                JSON.stringify(element, this.db_attr),
                keyword
              );
          });
        }

        return res;
      });
    });

    if (!userValues.length) {
      this.getNonFilterData('searchBar');
    }

    //save search bar filtered values
    this.setNonFilterData('filterPanel');
    this.currentPage = 1;
    this.setDisplayInfo(this.itemsPerPage);
  }

  containKeyword(word: any, keyword: any) {
    let res;
    if (typeof word === 'string' && typeof keyword === 'string') {
      res = word.toLowerCase().includes(keyword.toLowerCase());
    } else {
      res = word.includes(keyword);
    }

    return res;
  }
  filterValueschanges(valueEmitted: any) {
    const empty = Object.values(this.filterValues).every((element) => {
      return element === '';
    });

    //reset db
    this.getNonFilterData('filterPanel');
    if (!empty) {
      let attr: any[] = ['gender', 'ethnicity', 'workplaceCombined', 'status'];
      let userValues: any[] = [
        this.filterValues.gender,
        this.filterValues.ethnicity,
        this.filterValues.job,
        this.filterValues.status,
      ];

      this.filterByFilterValues(attr, userValues);
    }

    this.currentPage = 1;

    this.setDisplayInfo(this.itemsPerPage);
  }

  filterByFilterValues(valuesAttr: any[], userValues: any[]) {
    this.db_result = this.db_result.filter((record): boolean => {
      var values: any = [];
      valuesAttr.forEach((value, index) => {
        values[index] = record[value];
      });

      userValues = userValues.filter((element) => {
        return element !== '';
      });

      var containsAll =
        userValues.every((keyword) => {
          return this.containKeyword(values, keyword);
        }) && this.getYearBecameRightist(record);

      return containsAll;
    });
  }
  getYearBecameRightist(record: any) {
    let res = true;

    if (this.filterValues.date) {
      var from = this.filterValues.date[0].getFullYear();
      var to = this.filterValues.date[1].getFullYear();

      res = from <= record.rightistYear && record.rightistYear <= to;
    }
    return res;
  }
  getNonFilterData(dataType: string) {
    if (dataType === 'searchBar') {
      this.db_result = this.original;
    } else {
      this.db_result = this.nonFilterData;
    }

   
  }

  setNonFilterData(dataType: string) {
    if (dataType === 'searchBar') {
      this.original = JSON.parse(JSON.stringify(this.db_result));
    } else {
      this.nonFilterData = this.db_result;
    }
  }

  onOpenChange(display: string) {
    this.searchSelect = display;

    if (this.searchSelect == 'Description' || this.searchSelect == '简介') {
      this.db_attr = ['description'];
    } else if (this.searchSelect == 'Name' || this.searchSelect == '姓名') {
      //An: need to add fullName attribute on db, otherwise this is a bug.
      this.db_attr = ['firstName', 'lastName', 'fullName'];
    } else {
      this.db_attr = [
        'initial',
        'firstName',
        'lastName',
        'fullName',
        'gender',
        'birthYear',
        'deathYear',
        'rightistYear',
        'rightistId',
        'status',
        'ethnicity',
        'job',
        'detailJob',
        'workplace',
        'workplaceCombined',
        'endYear',
        'event',
        'startYear',
        'memoirAuthor',
        'memoirContent',
        'memoirTitle',
        'reference',
        'description',
        'source',
      ];
    }

    this.searchBar();
  }

  //to-do: might need to test when more data is avalible
  thousandsSeperator() {
    this.db_result_thousands_seperator = this.db_result.length
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
