import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FilterTypes } from 'src/app/core/types/filters.type';
import { GROUPS, OCCUPATIONS } from './browse-search-filter.constant';
import { MainBrowseComponent } from 'src/app/pages/browse/main-browse/main-browse.component';
import { DatepickerDateCustomClasses } from 'ngx-bootstrap/datepicker';
import { TranslateService } from '@ngx-translate/core';

const LIST_OF_GENDER = {
  en: ['Male', 'Female', 'Unknown'],
  cn: ['男性', '女性', '未知'],
};
const LIST_OF_STATUS = {
  en: ['Alive', 'Deceased', 'Unknown'],
  cn: ['在世', '亡故', '未知'],
};
@Component({
  selector: 'app-browse-search-filter',
  templateUrl: './browse-search-filter.component.html',
  styleUrls: ['./browse-search-filter.component.scss'],
})
export class BrowseSearchFilterComponent implements OnInit {
  private FILTERS: FilterTypes = {} as FilterTypes;
  drop!: boolean;
  minDate: Date = new Date('1950-01-01');
  maxDate: Date = new Date('1960-01-01');
  formValues = this.formgroup.group({
    gender: [''],
    job: [''],
    status: [''],
    ethnicity: [''],
    date: [''],
  });
  groups = GROUPS;
  occupations = OCCUPATIONS;
  statusChecked = false;
  statuses: any;
  genders: any;
  constructor(
    private formgroup: FormBuilder,
    private translate: TranslateService
  ) {}

  formSub!: Subscription;

  @Output() filterValuesChange = new EventEmitter<any>();

  @Input()
  get filterValues() {
    return this.FILTERS;
  }
  set filterValues(value: FilterTypes) {
    this.FILTERS = value;
    this.formSub?.unsubscribe();
    this.formValues.patchValue(value);
    this.subForm();
  }
  ngOnInit(): void {
    this.translate.onLangChange.subscribe((res) => {
      this.genders = LIST_OF_GENDER[res.lang];
      this.statuses = LIST_OF_STATUS[res.lang];
      this.translate.get(['archive.GROUPS']).subscribe((translations) => {
        this.groups = translations['archive.GROUPS'];
      });
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  subForm() {
    this.formSub = this.formValues.valueChanges.subscribe((value) => {
      let date = '';
      if (value.date) {
        value.date = [new Date(value.date[0]), new Date(value.date[1])];
      }
      this.filterValues = { ...value, date } as any;
      this.filterValuesChange.emit(value);
    });
  }

  updateCollapse() {
    this.drop = !this.drop;
  }

  submit() {
    this.filterValuesChange.emit(this.formValues.value);
  }

  clear() {
    this.formValues.reset({
      gender: '',
      job: '',
      status: '',
      ethnicity: '',
      date: '',
    });
  }
}
