import { Component, OnInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { FormCustomProvider } from 'src/app/core/utils/helper';

@Component({
  selector: 'app-memoir-info-form',
  templateUrl: './memoir-info-form.component.html',
  providers: [FormCustomProvider(MemoirInfoFormComponent)],
})
export class MemoirInfoFormComponent implements OnInit, ControlValueAccessor {
  private _disabled: boolean = false;
  private newMemior(a = {} as any): FormGroup {
    return this.formBuilder.group({
      memoirTitle: this.formBuilder.control(a.memoirTitle || ''),
      otherMemoirTitle: this.formBuilder.control(a.otherMemoirTitle || ''),
      memoirContent: this.formBuilder.control(a.memoirContent || ''),
      otherMemoirContent: this.formBuilder.control(a.otherMemoirContent || ''),
      memoirAuthor: this.formBuilder.control(a.memoirAuthor || ''),
      otherMemoirAuthor: this.formBuilder.control(a.otherMemoirAuthor || ''),
    });
  }
  memiorArray = this.formBuilder.array([]);
  sub: Subscription[] = [];
  subLang: Subscription[] = [];
  subImageChange: Subscription[] = [];
  isAdmin: boolean = false;

  language?: string;
  otherLanguage?: string;

  get controls(): FormGroup[] {
    return this.memiorArray.controls as FormGroup[];
  }

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthServiceService,
    private transService: TranslateService
  ) {}

  ngOnInit(): void {
    this.sub.push(
      this.auth.isAdmin.subscribe((isAdmin) => {
        this.isAdmin = isAdmin;
      })
    );
    this.language = this.transService.currentLang;
    this.otherLanguage = this.language === 'en' ? 'cn' : 'en';
    this.subLang.push(
      this.transService.onLangChange.subscribe((lang) => {
        this.language = lang.lang;
        this.otherLanguage = lang.lang === 'en' ? 'cn' : 'en';
      })
    );
  }

  onChange = (imageArray) => {};

  onTouched = (event) => {};

  setDisabledState?(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  writeValue(obj: any[]): void {
    if (obj) {
      if (obj.length > 0) {
        this.memiorArray.clear();
        obj.map((item) => this.memiorArray.push(this.newMemior(item)));
      }
      if (this.memiorArray.controls.length === 0) {
        this.addMemior();
      }
      this.eventsChange();
    } else {
      this.memiorArray.controls = [];
      if (this.memiorArray.controls.length === 0) {
        this.addMemior();
        this.eventsChange();
      }
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  addMemior() {
    this.memiorArray.push(this.newMemior());
  }

  remove(i: number) {
    this.memiorArray.removeAt(i);
  }

  eventsChange() {
    this.subImageChange.forEach((sub) => sub.unsubscribe());
    this.onChange(this.memiorArray.value);
    this.subImageChange.push(
      this.memiorArray.valueChanges.subscribe((data) => {
        this.onChange(data);
      })
    );
  }
}
