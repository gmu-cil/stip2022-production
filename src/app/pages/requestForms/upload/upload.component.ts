import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, zip } from 'rxjs';
import {
  ETHNIC_GROUP_CONSTANTS,
  LIST_OF_GENDER,
  LIST_OF_STATUS,
} from 'src/app/core/constants/group.constants';
import { ArchieveApiService } from 'src/app/core/services/archives-api-service';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { ContributionsService } from 'src/app/core/services/contributions.service';
import { ImagesService } from 'src/app/core/services/images.service';
import { StorageApIService } from 'src/app/core/services/storage-api.service';
import {
  Contribution,
  ContributionSchema,
  Event,
  ImageSchema,
  Memoir,
  Rightist,
  RightistSchema,
} from 'src/app/core/types/adminpage.types';
import { UUID } from 'src/app/core/utils/uuid';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit, OnDestroy {
  private _contribution!: Contribution;
  contributionId!: string;
  rightist?: Rightist;

  ethnicGroup: string[] = [];
  genders: string[] = [];
  statuses: string[] = [];

  otherGenders: string[] = [];
  otherStatuses: string[] = [];

  occupation: string[] = [];

  selected?: string;
  selected2?: string;
  sub: Subscription[] = [];
  url = '';
  minDate: Date = new Date('1940-01-01');
  maxDate: Date = new Date('1965-01-01');
  minDate2: Date = new Date('1850-01-01');
  maxDate2: Date = new Date('2050-01-01');

  isAdmin: boolean = false;
  imageDisabled: boolean = false;

  @Input() get contribution() {
    return this._contribution;
  }
  set contribution(contribution: Contribution) {
    if (contribution.rightist) {
      this._contribution = contribution;
    }
  }

  @Input() page: string = '';

  @Output() formChange: EventEmitter<any> = new EventEmitter();
  @Output() eventChange: EventEmitter<any> = new EventEmitter();
  @Output() memoirChange: EventEmitter<any> = new EventEmitter();
  @Output() imageChange: EventEmitter<any> = new EventEmitter();
  @Output() descriptionChange: EventEmitter<any> = new EventEmitter();
  @Output() save: EventEmitter<any> = new EventEmitter();

  language: string = '';
  otherLanguage: string = '';

  languageSubscription?: Subscription;
  authSubscription?: Subscription;

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    otherName: new FormControl('', Validators.required),
    gender: new FormControl(''),
    otherGender: new FormControl(''),
    status: new FormControl(''),
    otherStatus: new FormControl(''),
    ethnic: new FormControl(''),
    otherEthnic: new FormControl(''),
    occupation: new FormControl('', Validators.required),
    otherOccupation: new FormControl('', Validators.required),
    workplace: new FormControl(''),
    otherWorkplace: new FormControl(''),
    birthYear: new FormControl('', Validators.required),
    deathYear: new FormControl('', Validators.required),
    rightistYear: new FormControl('', Validators.required),
  });

  description: string = '';
  otherDescription: string = '';

  cleared: boolean = false;
  imageLoaded: boolean = false;

  imageData: ImageSchema = {
    imageId: '',
    rightistId: '',
    isGallery: false,
    galleryCategory: '',
    galleryTitle: '',
    galleryDetail: '',
    gallerySource: '',
  };

  otherImageData: ImageSchema = {
    imageId: '',
    rightistId: '',
    isGallery: false,
    galleryCategory: '',
    galleryTitle: '',
    galleryDetail: '',
    gallerySource: '',
  };

  eventArray = new FormArray([]);
  memoirArray = new FormArray([]);

  private newEvent() {
    return new FormGroup({
      startYear: new FormControl(''),
      endYear: new FormControl(''),
      event: new FormControl(''),
      otherEvent: new FormControl(''),
    });
  }

  private newMemoir() {
    return new FormGroup({
      memoirTitle: new FormControl(''),
      memoirContent: new FormControl(''),
      memoirAuthor: new FormControl(''),
      otherMemoirTitle: new FormControl(''),
      otherMemoirAuthor: new FormControl(''),
      otherMemoirContent: new FormControl(''),
    });
  }

  get eventControls() {
    return this.eventArray.controls as FormGroup[];
  }

  get memoirControls() {
    return this.memoirArray.controls as FormGroup[];
  }

  removeMemoir(i: number) {
    this.memoirArray.removeAt(i);
  }

  constructor(
    private contributionService: ContributionsService,
    private auth: AuthServiceService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private imageAPI: ImagesService,
    private archiveAPI: ArchieveApiService,
    private storageAPI: StorageApIService,
    private translate: TranslateService,
    private contributionAPI: ContributionsService
  ) {}

  clear() {
    this.form.reset();
  }

  clear2() {
    this.url = '';
    this.description = '';
    this.cleared = true;
    this.eventArray.reset();
    this.memoirArray.reset();

    this.imageData.imagePath = this.imageData.imagePath || '';
    this.url = this.url || '';

    setTimeout(() => {
      this.cleared = false;
    }, 500);
  }

  addEvent() {
    this.eventArray.push(this.newEvent());
  }

  removeEvent(i: number) {
    this.eventArray.removeAt(i);
  }

  addMemoir() {
    this.memoirArray.push(this.newMemoir());
  }

  ngOnDestroy(): void {
    this.sub.forEach((sub) => sub.unsubscribe());
    this.languageSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  descriptionChanged(data: any) {
    this.descriptionChange.emit({
      type: 'original',
      value: data
    });
  }

  otherDescriptionChanged(data: any) {
    this.descriptionChange.emit({
      type: 'other',
      value: data,
    });
  }

  onImageChange(data: any) {
    console.log(data);
    if (data.type == 'image') {
      this.imageData = {
        ...this.imageData,
        isGallery: data.value.imageUpload === 'yes',
        galleryCategory: data.value.imageCategory || '',
        galleryTitle: data.value.imageTitle || '',
        galleryDetail: data.value.imageDes || '',
        gallerySource: data.value.imageSource || '',
      };

      this.otherImageData = {
        ...this.otherImageData,
        isGallery: data.value.imageUpload === 'yes',
        galleryCategory: data.value.otherImageCategory || '',
        galleryTitle: data.value.otherImageTitle || '',
        galleryDetail: data.value.otherImageDes || '',
        gallerySource: data.value.otherImageSource || '',
      };
    }

    if (data.type == 'url') {
      this.url = data.value;
    }

    if (data.type == 'clear') {
      this.url = '';
      this.imageData.imagePath = '';
    }

    this.imageChange.emit({
      image: this.imageData,
      otherImage: this.otherImageData,
      url: this.url,
    });

    console.log(this.imageData);
    console.log(this.otherImageData);
  }

  ngOnInit(): void {
    this.language = localStorage.getItem('lang')!
    this.otherLanguage = this.language === 'en' ? 'cn' : 'en';

    this.ethnicGroup = ETHNIC_GROUP_CONSTANTS[this.language];
    this.genders = LIST_OF_GENDER[this.language];
    this.statuses = LIST_OF_STATUS[this.language];

    this.initialize();

    this.languageSubscription = this.translate.onLangChange.subscribe(
      (langChange: any) => {
        this.language = langChange.lang;
        this.otherLanguage = this.language === 'en' ? 'cn' : 'en';

        this.ethnicGroup = ETHNIC_GROUP_CONSTANTS[this.language];
        this.genders = LIST_OF_GENDER[this.language];
        this.statuses = LIST_OF_STATUS[this.language];

        this.eventArray = new FormArray([]);
        this.memoirArray = new FormArray([]);

        this.sub.forEach((x) => x.unsubscribe());
        this.sub.length = 0;
        this.initialize();
      }
    );

    this.authSubscription = this.auth.isAdmin.subscribe((isAdmin: any) => {
      this.isAdmin = isAdmin;
    });
  }

  initialize() {
    if (this.page === 'contribution') {
      this.ethnicGroup = ETHNIC_GROUP_CONSTANTS[this.language];
      this.genders = LIST_OF_GENDER[this.language];
      this.statuses = LIST_OF_STATUS[this.language];

      this.otherGenders = LIST_OF_GENDER[this.otherLanguage!];
      this.otherStatuses = LIST_OF_STATUS[this.otherLanguage!];

      if (this.contribution) {
        if (this.contribution.image?.imagePath) {
          this.imageDisabled = true;
        }

        if (this.contribution.contributionId && this.contribution.rightist) {
          const rightist: Rightist = this.contribution.rightist;

          this.mapForm(rightist);

          this.sub.push(
            this.contributionAPI
              .getUserContribution(
                this.otherLanguage,
                this.contribution.contributorId,
                this.contribution.contributionId
              )
              .subscribe((otherContribution: any) => {
                console.log(otherContribution);

                if (otherContribution.rightist) {
                  this.otherDescription =
                    otherContribution.rightist.description;

                    this.descriptionChange.emit({
                      type: 'other',
                      value: this.otherDescription,
                    });

                  this.form.patchValue({
                    otherName: otherContribution.rightist.fullName,
                    otherGender: otherContribution.rightist.gender,
                    otherStatus: otherContribution.rightist.status,
                    otherEthnic: otherContribution.rightist.ethnicity,
                    otherOccupation: otherContribution.rightist.job,
                    otherWorkplace: otherContribution.rightist.workplace,
                  });

                  if (otherContribution.rightist.events) {
                    for (let [
                      index,
                      event,
                    ] of otherContribution.rightist.events.entries()) {
                      this.eventArray.at(index).patchValue({
                        otherEvent: event.event,
                      });
                    }
                  }

                  if (otherContribution.rightist.memoirs) {
                    for (let [
                      index,
                      memoir,
                    ] of otherContribution.rightist.memoirs.entries()) {
                      this.memoirArray.at(index).patchValue({
                        otherMemoirTitle: memoir.memoirTitle,
                        otherMemoirAuthor: memoir.memoirAuthor,
                        otherMemoirContent: memoir.memoirContent,
                      });
                    }
                  }
                }

                if (otherContribution.image) {
                  this.otherImageData = { ...otherContribution.image };
                }

                if (this.contribution.image) {
                  this.url = this.imageData!.imagePath!;
                  this.imageData = { ...this.contribution.image };
                  this.imageLoaded = true;
                } else {
                  this.imageLoaded = true;
                }
              })
          );

          this.sub.push(
            this.form.controls['gender'].valueChanges.subscribe((value) => {
              let index = this.genders.indexOf(value);
              this.form.patchValue({
                otherGender: LIST_OF_GENDER[this.otherLanguage][index],
              });
            })
          );

          this.sub.push(
            this.form.controls['status'].valueChanges.subscribe((value) => {
              let index = this.statuses.indexOf(value);
              this.form.patchValue({
                otherStatus: LIST_OF_STATUS[this.otherLanguage][index],
              });
            })
          );

          this.sub.push(
            this.form.controls['ethnic'].valueChanges.subscribe((value) => {
              let index = this.ethnicGroup.indexOf(value);
              this.form.patchValue({
                otherEthnic: ETHNIC_GROUP_CONSTANTS[this.otherLanguage][index],
              });
            })
          );

          this.sub.push(
            this.form.valueChanges.subscribe((data: any) => {
              this.formChange.emit(data);
            })
          );

          this.sub.push(
            this.eventArray.valueChanges.subscribe((events: any) => {
              this.eventChange.emit(events);
            })
          );

          this.sub.push(
            this.memoirArray.valueChanges.subscribe((memoirs: any) => {
              this.memoirChange.emit(memoirs);
            })
          );
        }
      }
    } else {
      this.sub.push(
        this.activatedRoute.queryParams.subscribe((params) => {
          let value = params['value'];
          this.page = params['page'];
          if (this.page === 'account') {
            this.contributionId = value;
            if (this.contributionId) {
              this.sub.push(
                this.contributionService
                  .getUserContribution(
                    this.language,
                    this.auth.uid,
                    this.contributionId
                  )
                  .subscribe((contribution: any) => {
                    this.contribution = contribution;

                    if (this.contribution.image) {
                      this.imageData = { ...this.contribution.image };
                      this.imageLoaded = true;
                      this.imageDisabled = true;
                    } else {
                      this.imageLoaded = true;
                    }

                    console.log(this.imageData);
                    this.mapForm(contribution.rightist);
                  })
              );
            }
          } else if (this.page == 'profile') {
            let rightistId = value;
            this.sub.push(
              this.archiveAPI
                .getRightistById(this.language!, rightistId)
                .subscribe((rightist: any) => {
                  this.rightist = rightist;
                  this.mapForm(rightist);
                  if (rightist.imageId) {
                    this.imageDisabled = true;
                    this.sub.push(
                      this.imageAPI
                        .getImage(this.language!, rightist.imageId)
                        .subscribe((image: any) => {
                          this.imageData = image;
                          this.imageLoaded = true;
                        })
                    );
                    // Call Image API
                  } else {
                    this.imageLoaded = true;
                  }
                })
            );
          } else {
            this.form.patchValue({
              gender: 'unknown',
              status: 'unknown'
            })

            this.sub.push(
              this.form.controls['gender'].valueChanges.subscribe((value) => {
                let index = this.genders.indexOf(value);
                this.form.patchValue({
                  otherGender: LIST_OF_GENDER[this.otherLanguage][index],
                });
              })
            );

            this.sub.push(
              this.form.controls['status'].valueChanges.subscribe((value) => {
                let index = this.statuses.indexOf(value);
                this.form.patchValue({
                  otherStatus: LIST_OF_STATUS[this.otherLanguage][index],
                });
              })
            );

            this.sub.push(
              this.form.controls['ethnic'].valueChanges.subscribe((value) => {
                let index = this.ethnicGroup.indexOf(value);
                this.form.patchValue({
                  otherEthnic:
                    ETHNIC_GROUP_CONSTANTS[this.otherLanguage][index],
                });
              })
            );
            this.eventArray.push(this.newEvent());
            this.memoirArray.push(this.newMemoir());
            this.imageLoaded = true;
          }
        })
      );
    }
  }

  mapForm(rightist: Rightist) {
    this.form.patchValue({
      name: rightist.fullName,
      occupation: rightist.job,
      ethnic: rightist.ethnicity,
      righistYear: rightist.rightistYear,
      ...rightist,
    });

    console.log(rightist);

    this.description = rightist.description;

    if (rightist.events) {
      for (const event of rightist.events) {
        this.eventArray.push(
          new FormGroup({
            startYear: new FormControl(event.startYear),
            endYear: new FormControl(event.endYear),
            event: new FormControl(event.event),
            otherEvent: new FormControl(''),
          })
        );
      }
      this.eventArray.markAllAsTouched();
    } else {
      this.eventArray.push(this.newEvent());
    }

    if (rightist.memoirs) {
      for (const memoir of rightist.memoirs) {
        this.memoirArray.push(
          new FormGroup({
            memoirTitle: new FormControl(memoir.memoirTitle),
            memoirAuthor: new FormControl(memoir.memoirAuthor),
            memoirContent: new FormControl(memoir.memoirContent),
            otherMemoirTitle: new FormControl(''),
            otherMemoirAuthor: new FormControl(''),
            otherMemoirContent: new FormControl(''),
          })
        );
      }
      this.memoirArray.markAllAsTouched();
    } else {
      this.memoirArray.push(this.newMemoir());
    }
  }

  onSave() {
    this.save.emit({
      type: 'save',
    });
  }

  async onSubmit() {
    const {
      name,
      gender,
      status,
      ethnic,
      occupation,
      workplace,
      otherName,
      otherGender,
      otherStatus,
      otherEthnic,
      otherOccupation,
      otherWorkplace,
      rightistYear,
      deathYear,
      birthYear,
    } = this.form.value;

    console.log(this.contribution?.rightist?.rightistId);

    // remove last event if untouched
    if (!this.eventArray.at(this.eventArray.length - 1).touched) {
      this.eventArray.removeAt(this.eventArray.length - 1);
    }

    // remove last memoir if untouched
    if (!this.memoirArray.at(this.memoirArray.length - 1).touched) {
      this.memoirArray.removeAt(this.memoirArray.length - 1);
    }

    const rightistId =
      this.contribution?.rightist?.rightistId ||
      this.rightist?.rightistId ||
      `Rightist-${UUID()}`;

    let events: Event[] = [];
    let otherEvents: Event[] = [];

    let memoirs: Memoir[] = [];
    let otherMemoirs: Memoir[] = [];

    for (let data of this.eventArray.value) {
      let event: Event = {
        startYear: data.startYear,
        endYear: data.endYear,
        event: data.event,
      };

      let otherEvent: Event = {
        startYear: data.startYear,
        endYear: data.endYear,
        event: data.otherEvent,
      };

      events.push(event);
      otherEvents.push(otherEvent);
    }

    for (let data of this.memoirArray.value) {
      let memoir: Memoir = {
        memoirTitle: data.memoirTitle,
        memoirAuthor: data.memoirAuthor,
        memoirContent: data.memoirContent,
      };

      let otherMemoir: Memoir = {
        memoirTitle: data.otherMemoirTitle,
        memoirAuthor: data.otherMemoirAuthor,
        memoirContent: data.otherMemoirContent,
      };

      memoirs.push(memoir);
      otherMemoirs.push(otherMemoir);
    }

    // console.log(this.form.value);
    // console.log(this.imageData);
    // console.log(this.description);
    // console.log(this.eventArray.value);
    // console.log(this.memoirArray.value);

    let image: ImageSchema = {
      ...this.imageData,
      imageId: '',
      rightistId: rightistId,
    };

    let otherImage: ImageSchema = {
      ...this.otherImageData,
      imageId: '',
      rightistId: rightistId,
    };

    let rightist: RightistSchema = {
      rightistId: rightistId,
      imageId: '',
      contributorId: this.auth.uid,
      initial: '',
      firstName: '',
      lastName: '',
      fullName: name,
      gender: gender || 'unknown',
      birthYear: birthYear,
      deathYear: deathYear,
      rightistYear: rightistYear,
      status: status || 'unknown',
      ethnicity: ethnic || '',
      education: '',
      birthplace: '',
      job: occupation,
      detailJob: '',
      workplace: workplace,
      workplaceCombined: '',
      events: events,
      memoirs: memoirs,
      reference: '',
      description: this.description,
      source: 'contributed',
      lastUpdatedAt: new Date(),
    };

    let otherRightist: RightistSchema = {
      rightistId: rightistId,
      imageId: '',
      contributorId: this.auth.uid,
      initial: '',
      firstName: '',
      lastName: '',
      fullName: otherName,
      gender: otherGender || '',
      birthYear: birthYear,
      deathYear: 0,
      rightistYear: rightistYear,
      status: otherStatus || 'Unknown',
      ethnicity: otherEthnic || '',
      education: '',
      birthplace: '',
      job: otherOccupation,
      detailJob: '',
      workplace: otherWorkplace,
      workplaceCombined: '',
      events: otherEvents,
      memoirs: otherMemoirs,
      reference: '',
      description: this.otherDescription,
      source: 'contributed',
      lastUpdatedAt: new Date(),
    };

    if (this.language === 'en') {
      rightist.initial = name.trim().charAt(0).toUpperCase();
      otherRightist.initial = name.trim().charAt(0).toUpperCase();
    }

    console.log(rightist);
    console.log(otherRightist);
    console.log(image);
    console.log(otherImage);

    if (this.page === 'account') {

      if (this.url) {
        image.imagePath = this.url;
      }

      this.contributionService
        .updateUserContribution(this.language, {
          contributionId: this.contributionId,
          contributorId: this.auth.uid,
          contributedAt: new Date(),
          rightistId: rightistId,
          lastUpdatedAt: new Date(),
          approvedAt: new Date(),
          publish: 'new',
          rightist: rightist,
          image: {
            ...image,
          },
        })
        .then(() => {
          this.clear();
          this.clear2();
          this.route.navigateByUrl('/account');
        });
    } else if (this.page == 'profile') {
      if (this.url) {
        const imageId = `Image-${UUID()}`;
        await fetch(this.url).then(async (response) => {
          console.log(imageId);
          const contentType = response.headers.get('content-type');
          const blob = await response.blob();
          const file = new File([blob], imageId, { type: contentType! });
          await this.storageAPI.uploadGalleryImage(imageId, file);
          this.sub.push(
            this.storageAPI
              .getGalleryImageURL(imageId)
              .subscribe((imageUrl: any) => {
                console.log(imageUrl);
                rightist.imageId = imageId;

                image.imageId = imageId;
                otherImage.imageId = imageId;

                image.imagePath = imageUrl;
                otherImage.imagePath = imageUrl;
                Promise.all([
                  this.archiveAPI.addRightist(this.language, rightist),
                  this.archiveAPI.updateRightistImageId(
                    this.otherLanguage,
                    rightist.rightistId,
                    imageId
                  ),
                  this.imageAPI.addImage(this.language, image),
                  this.imageAPI.addImage(this.otherLanguage, otherImage),
                ]).then(() => {
                  const url = `browse/main/memoir/${rightist.rightistId}`;
                  this.clear();
                  this.clear2();
                  this.route.navigateByUrl(url);
                });
              })
          );
        });
      } else {
        Promise.all([
          this.archiveAPI.addRightist(this.language!, rightist),
        ]).then(() => {
          const url = `browse/main/memoir/${rightist.rightistId}`;
          this.clear();
          this.clear2();
          this.route.navigateByUrl(url);
        });
      }
    } else {
      // in upload component
      let contributionId = `Contribution-${UUID()}`;
      // has image
      if (this.url) {
        Promise.all([
          this.contributionService.updateUserContribution(this.language, {
            contributionId: contributionId,
            contributorId: this.auth.uid,
            contributedAt: new Date(),
            rightistId: rightistId,
            lastUpdatedAt: new Date(),
            approvedAt: new Date(),
            publish: 'new',
            rightist: rightist,
            image: {
              ...image,
              imagePath: this.url,
            },
          }),
          this.contributionService.updateUserContribution(this.otherLanguage, {
            contributionId: contributionId,
            contributorId: this.auth.uid,
            contributedAt: new Date(),
            rightistId: rightistId,
            lastUpdatedAt: new Date(),
            approvedAt: new Date(),
            publish: 'new',
            rightist: otherRightist,
            image: {
              ...otherImage,
              imagePath: this.url,
            },
          }),
        ]).then(() => {
          this.clear();
          this.clear2();
          this.route.navigateByUrl('/account');
        });

        // no image
      } else {
        console.log('No Image');
        let contributionId = `Contribution-${UUID()}`;
        Promise.all([
          this.contributionService.updateUserContribution(this.language, {
            contributionId: contributionId,
            contributorId: this.auth.uid,
            contributedAt: new Date(),
            rightistId: rightistId,
            approvedAt: new Date(),
            lastUpdatedAt: new Date(),
            publish: 'new',
            rightist: rightist,
          }),
          this.contributionService.updateUserContribution(this.otherLanguage, {
            contributionId: contributionId,
            contributorId: this.auth.uid,
            contributedAt: new Date(),
            rightistId: rightistId,
            approvedAt: new Date(),
            lastUpdatedAt: new Date(),
            publish: 'new',
            rightist: otherRightist,
          }),
        ]).then(() => {
          this.clear();
          this.clear2();
          this.route.navigateByUrl('/account');
        });
      }
    }
  }
}
