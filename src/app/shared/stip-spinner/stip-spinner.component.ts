import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-stip-spinner',
  template: `<div
    class="position-relative"
    style="height: 10rem"
    *ngIf="isLoading"
  >
    <ngx-spinner
      size="medium"
      class="text-white"
      type="ball-scale-multiple"
      [fullScreen]="false"
    >
      {{ spinnerText }}
    </ngx-spinner>
  </div> `,
})
export class StipSpinnerComponent implements OnInit {
  private _isLoading: boolean = false;
  @Input() get isLoading() {
    return this._isLoading;
  }
  set isLoading(value: boolean) {
    if (value) {
      this.spinnerService.show();
    } else {
      this.spinnerService.hide();
    }
    this._isLoading = value;
  }
  @Input() spinnerText: string = 'Fetching archives...';
  constructor(private spinnerService: NgxSpinnerService) {}

  ngOnInit(): void {}
}
