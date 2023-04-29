import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  ETHNIC_GROUP_CONSTANTS,
  LIST_OF_GENDER,
  LIST_OF_STATUS,
  ObJ_OF_GENDERS,
  ObJ_OF_STATUS,
} from 'src/app/core/constants/group.constants';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { FormCustomProvider } from 'src/app/core/utils/helper';

@Component({
  selector: 'app-rightist-info-form',
  templateUrl: './rightist-info-form.component.html',
  // styleUrls: ['./upload-images-form.component.scss'],
  providers: [
    FormCustomProvider(RightistInfoFormComponent),
    FormCustomProvider(RightistInfoFormComponent, NG_VALIDATORS),
  ],
})
export class RightistInfoFormComponent
  implements OnInit, ControlValueAccessor, Validator
{
  private _disabled: boolean = false;
  minDate: Date = new Date('1940-01-01');
  maxDate: Date = new Date('1965-01-01');
  minDate2: Date = new Date('1850-01-01');
  maxDate2: Date = new Date('2050-01-01');

  otherEthnicGroup: any;
  Obj_Genders: any;
  Obj_Status: any;
  private newForm(a = {} as any) {
    return this.formBuilder.group({
      name: [a.name || '', Validators.required],
      otherName: [a.otherName || ''],
      gender: [a.gender || '', Validators.required],
      otherGender: [a.otherGender || ''],
      status: [a.status || '', Validators.required],
      otherStatus: [a.otherStatus || ''],
      ethnic: [a.ethnic || '', Validators.required],
      otherEthnic: [a.otherEthnic || ''],
      occupation: [a.occupation || '', Validators.required],
      otherOccupation: [a.otherOccupation || ''],
      rightistYear: [a.rightistYear || ''],
      birthYear: [a.birthYear || '', Validators.required],
      deathYear: [a.deathYear || ''],
    });
  }
  form = this.newForm();
  sub: Subscription[] = [];
  subLang: Subscription[] = [];
  subImageChange: Subscription[] = [];
  isAdmin: boolean = false;
  ethnicGroup: string[] = [];
  genders: string[] = [];
  otherGenders: string[] = [];
  statuses: string[] = [];
  otherStatuses: string[] = [];
  otherImageCategories: string[] = [];


  language: string = this.transService.currentLang;
  otherLanguage: string = this.language === 'en' ? 'cn' : 'en';

  allEn_CnEnthic = ETHNIC_GROUP_CONSTANTS[`${this.language}_${this.otherLanguage}`];
  allcn_enEnthic = ETHNIC_GROUP_CONSTANTS[`${this.otherLanguage}_${this.language}`];

  // imageValue!: UploadImagesType[];

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthServiceService,
    private transService: TranslateService
  ) {}
  validate(control: AbstractControl): ValidationErrors | null {
    return this.form.valid ? null : { invalid: true };
  }

  ngOnInit(): void {
    this.sub.push(
      this.auth.isAdmin.subscribe((isAdmin) => {
        this.isAdmin = isAdmin;
      })
    );
    this.initializeConstants();
    this.subLang.push(
      this.transService.onLangChange.subscribe((lang) => {
        this.language = lang.lang;
        this.otherLanguage = lang.lang === 'en' ? 'cn' : 'en';
        this.allEn_CnEnthic = ETHNIC_GROUP_CONSTANTS[`${this.language}_${this.otherLanguage}`];
        this.allcn_enEnthic = ETHNIC_GROUP_CONSTANTS[`${this.otherLanguage}_${this.language}`];
        this.initializeConstants();
      })
    );
  }

  onChange = (imageArray) => {};

  onTouched = (event) => {};

  setDisabledState?(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  writeValue(obj: any): void {
    if (!obj) {
      obj = {} as any;
    }
    this.form = this.newForm(obj?.[0] || obj);
    this.form.patchValue(obj?.[0] || obj);
    this.onFormChange();
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onImageCategoryChange(data: any, i: number) {}

  onFormChange() {
    this.subImageChange.forEach((sub) => sub.unsubscribe());
    this.onChange(this.form.value);
    this.subImageChange.push(
      this.form.valueChanges.subscribe((data) => {
        this.onChange(data);
      })
    );
  }

  onEthnicChange(data: any) {}
  onGenderChange(data: any, i: number) {}
  onStatusChange(data: any, i: number) {}
  clear() {
    this.form.reset();
  }

  initializeConstants() {
    this.ethnicGroup = Object.keys(ETHNIC_GROUP_CONSTANTS[`${this.language}_${this.otherLanguage}`]);
    this.otherEthnicGroup = ETHNIC_GROUP_CONSTANTS[this.otherLanguage];

    this.genders = LIST_OF_GENDER[this.language];
    this.otherGenders = LIST_OF_GENDER[this.otherLanguage];

    this.Obj_Genders = ObJ_OF_GENDERS[this.language];
    this.Obj_Status = ObJ_OF_STATUS[this.language];

    this.statuses = LIST_OF_STATUS[this.language];
    this.otherStatuses = LIST_OF_STATUS[this.otherLanguage];
  }
  radioChange(key: string, otherKey: string, obj: any) {
    this.form.get(otherKey)!.setValue(obj[this.form.value[key]]);
  }
  patchChange(key: string, otherKey: string) {
    this.form.get(otherKey)!.setValue(this.allEn_CnEnthic[this.form.get(key)!.value]);
  }
}
