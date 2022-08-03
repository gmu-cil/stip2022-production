import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/core/services/alert.service';
import { AnnouncementService } from 'src/app/core/services/announcement.service';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { EmailService } from 'src/app/core/services/email.service';
import { Profile } from 'src/app/core/types/auth.types';

@Component({
  selector: 'app-modal-template',
  templateUrl: './modal-template.component.html',
  styleUrls: ['./modal-template.component.scss'],
})
export class ModalTemplateComponent implements OnInit {
  modalRef?: BsModalRef;
  @Input() isNotifyEnabled = false;

  @ViewChild('announceModal') announceModal!: TemplateRef<any>;
  @ViewChild('changeEmailTemplate') changeEmailTemplate!: TemplateRef<any>;
  @ViewChild('deleteConfirmation') deleteConfirmation!: TemplateRef<any>;
  @ViewChild('logoutModal') logoutModal!: TemplateRef<any>;
  @ViewChild('saveAccountChanges') saveAccountChanges!: TemplateRef<any>;
  @ViewChild('sentEmailResetPassword')
  sentEmailResetPassword!: TemplateRef<any>;

  changeEmailForm = this.formBuilder.group({
    newEmail: ['', [Validators.required, Validators.email]],
  });

  sub: Subscription[] = [];
  announceText!: string;
  edit_form!: Profile;
  hasAdminNotification = false;
  constructor(
    private auth: AuthServiceService,
    private modalService: BsModalService,
    private announce: AnnouncementService,
    private formBuilder: FormBuilder,
    private emailService: EmailService,
    private alertService: AlertService
  ) {}
  ngOnInit(): void {
    // For annuncement template.
    this.sub.push(
      this.announce.getAnnounce().subscribe((x: any) => {
        this.announceText = x;
      })
    );

    // unsubscribe from all observable.
    if (this.modalRef?.onHidden) {
      this.sub.push(
        this.modalRef.onHidden.subscribe(() => {
          this.sub?.forEach((x) => x?.unsubscribe());
        })
      );
    }
  }

  // open Modals
  openLogoutModal(template: TemplateRef<any> = this.logoutModal) {
    this.modalRef = this.modalService.show(template);
  }

  openAnnounceModal(template: TemplateRef<any> = this.announceModal) {
    this.modalRef = this.modalService.show(template);
  }
  openDeleteConfirmModal(template: TemplateRef<any> = this.deleteConfirmation) {
    this.modalRef = this.modalService.show(template);
  }

  openChangeEmailModal(template: TemplateRef<any> = this.changeEmailTemplate) {
    this.modalRef = this.modalService.show(template);
  }
  openSaveAccountModal(
    form: Profile,
    template: TemplateRef<any> = this.saveAccountChanges
  ) {
    this.edit_form = form;
    this.modalRef = this.modalService.show(template);
  }

  openSendEmailResettModal(
    form: Profile,
    template: TemplateRef<any> = this.sentEmailResetPassword
  ) {
    this.edit_form = form;
    this.modalRef = this.modalService.show(template);
  }

  // function to close modal
  changeEmail() {
    const email = this.changeEmailForm.value.newEmail;
    this.auth
      .changeEmail(email)
      .then(() => {
        this.modalRef?.hide();
        this.emailService.adminEmailsNotification({
          email,
          isNotified: this.isNotifyEnabled,
        });
        this.changeEmailForm.reset();
      })
      .catch((e) => {
        this.changeEmailForm.reset();
        this.alertService.emitAlert(e.message);
      });
  }

  deleteAccount() {
    this.auth
      .deleteAccount()
      .then(() => {
        this.modalRef?.hide();
      })
      .catch((e) => {
        this.alertService.emitAlert(e.message);
      });
  }

  logout() {
    this.auth.signOut().then(() => {
      this.modalRef?.hide();
    });
  }

  updateAnnouncement() {
    this.announce.trackAdminChange(this.announceText).then(() => {
      this.modalRef?.hide();
    });
  }

  saveAllAccountChanges() {
    this.auth
      .editProfile(this.edit_form)
      .then(() => {
        this.modalRef?.hide();
        this.edit_form = {} as Profile;
      })
      .catch((e) => {
        this.alertService.emitAlert(e.message);
      });
  }

  sendEmailResetPassword() {
    this.auth
      .changePassword(this.edit_form.email)
      .then(() => {
        this.modalRef?.hide();
        this.edit_form = {} as Profile;
      })
      .catch((e) => {
        this.alertService.emitAlert(e.message);
      });
  }
}
