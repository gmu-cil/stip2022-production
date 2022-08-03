import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    firstName: [''],
    lastName: [''],
    confirmEmail: [''],
  });
  forgetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  modalRef?: BsModalRef;

  errorMessage = '';
  sub: Subscription[] = [];

  get loginControls() {
    return this.loginForm.controls;
  }

  @ViewChild('template') template!: TemplateRef<any>;
  @ViewChild('templateLogout') templateLogout!: TemplateRef<any>;

  isSignIn: 'signin' | 'signup' | 'forgetpassword' = 'signup';
  constructor(
    private fb: FormBuilder,
    private authService: AuthServiceService,
    private modalService: BsModalService
  ) {}
  ngOnDestroy(): void {
    this.sub.forEach((x) => x.unsubscribe());
  }

  openModal(template: TemplateRef<any> = this.template) {
    this.modalRef = this.modalService.show(template);
    this.isSignIn = 'signin';
    if (this.modalRef?.onHide) {
      this.sub.push(
        this.modalRef.onHide.subscribe(() => {
          this.loginForm.reset();
          this.forgetForm.reset();
          this.isSignIn = 'signup';
          this.switchState();
          this.errorMessage = '';
          this.sub.forEach((x) => x.unsubscribe());
        })
      );
    }
  }

  ngOnInit(): void {
    this.sub.push(
      this.loginForm.valueChanges.subscribe((value) => {
        this.errorMessage = '';
        if (
          this.loginForm?.errors?.['notValid'] &&
          value.email &&
          value.confirmEmail
        ) {
          this.errorMessage = this.loginForm?.errors?.['notValid'];
        }
      })
    );

    this.loginForm.updateValueAndValidity();
  }

  switchState() {
    this.errorMessage = '';
    this.isSignIn = this.isSignIn === 'signin' ? 'signup' : 'signin';
    if (this.isSignIn === 'signin') {
      this.loginForm.get('confirmEmail')?.clearValidators();
      this.loginForm.get('firstName')?.clearValidators();
      this.loginForm.get('lastName')?.clearValidators();
      this.loginForm.setValidators([]);
    } else {
      this.loginForm
        .get('confirmEmail')
        ?.setValidators([Validators.required, Validators.email]);
      this.loginForm.get('firstName')?.setValidators([Validators.required]);
      this.loginForm.get('lastName')?.setValidators([Validators.required]);
      this.loginForm.setValidators([this.checkEmails]);
    }
    this.loginForm.get('firstName')?.updateValueAndValidity();
    this.loginForm.get('lastName')?.updateValueAndValidity();
    this.loginForm.get('confirmEmail')?.updateValueAndValidity();
    this.loginForm.updateValueAndValidity();
  }
  signInWithEmail() {}

  signUpwithEmail() {
    if (this.loginForm?.value?.email && this.loginForm.value.password) {
      if (this.isSignIn === 'signup') {
        this.authService
          .signUpwithEmail({
            email: this.loginForm.value.email,
            password: this.loginForm.value.password,
          })
          ?.then((x) => {
            this.loginForm.reset();
            this.modalRef?.hide();
          })
          .catch((e) => {
            this.errorMessage = e.message;
          });
      } else if (this.isSignIn === 'signin') {
        this.authService
          .signInWithEmail({
            email: this.loginForm.value.email,
            password: this.loginForm.value.password,
          })
          ?.then(() => {
            this.loginForm.reset();
            this.modalRef?.hide();
            this.errorMessage = '';
          })
          .catch((e) => {
            this.errorMessage = e.message;
          });
      }
    }
  }
  checkEmails(group: AbstractControl) {
    const email = group?.get('email')?.value;
    const confirmEmail = group?.get('confirmEmail')?.value;
    return email === confirmEmail ? null : { notValid: 'Email does not match' };
  }

  userGoogleLogin() {
    this.errorMessage = '';
    this.authService
      .googleSignIn()
      .then(() => {
        this.modalRef?.hide();
      })
      .catch((e) => {
        this.errorMessage = e.message;
      });
  }

  userFacebookLogin() {
    this.errorMessage = '';
    this.authService
      .facebookSignIn()
      .then(() => {
        this.modalRef?.hide();
      })
      .catch((e) => {
        this.errorMessage = e.message;
      });
  }

  forgetPassword() {
    this.authService
      .forgetPassword(this.forgetForm.value.email)
      .then(() => {
        this.modalRef?.hide();
        this.forgetForm.reset();
        this.errorMessage = '';
      })
      .catch((e) => {
        this.errorMessage = e.message;
      });
  }
}
