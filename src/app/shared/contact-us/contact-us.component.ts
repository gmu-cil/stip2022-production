import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-us-btn',
  templateUrl: './contact-us.component.html',
})
export class ContactUsComponent implements OnInit, OnDestroy {
  @ViewChild('contactUsTemplate') contactUsTemplate!: TemplateRef<any>;
  @ViewChild('exitTemplate') exitTemplate!: TemplateRef<any>;
  sub!: Subscription;
  modalRef?: BsModalRef;
  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    message: ['', Validators.required],
  });
  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private customApi: AngularFireFunctions
  ) {}
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  openContactUsModal(template: TemplateRef<any> = this.contactUsTemplate) {
    this.modalRef = this.modalService.show(template);
  }

  openExitModal(template: TemplateRef<any> = this.exitTemplate) {
    this.modalRef = this.modalService.show(template);
  }

  ngSubmit() {
    this.sub = this.customApi
      .httpsCallable('contactUs')(this.contactForm.value)
      .subscribe((res) => {
        this.modalRef?.hide();
        this.contactForm.reset();
      });
    this.openExitModal();
  }
}
