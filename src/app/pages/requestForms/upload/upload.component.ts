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
import { image } from 'd3';
import { Subscription } from 'rxjs';
import {
  ETHNIC_GROUP_CONSTANTS,
  LIST_OF_JOB,
} from 'src/app/core/constants/group.constants';
import { ArchieveApiService } from 'src/app/core/services/archives-api-service';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { ContributionsService } from 'src/app/core/services/contributions.service';
import { ImagesService } from 'src/app/core/services/images.service';
import { StorageApIService } from 'src/app/core/services/storage-api.service';
import {
  Contribution,
  ImageSchema,
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
  ethnicGroup: string[] = ETHNIC_GROUP_CONSTANTS;
  occupation: string[] = LIST_OF_JOB;
  selected?: string;
  selected2?: string;
  sub: Subscription[] = [];
  url = '';
  minDate: Date = new Date('1940-01-01');
  maxDate: Date = new Date('1965-01-01');
  minDate2: Date = new Date('1840-01-01');
  maxDate2: Date = new Date('1950-01-01');

  isAdmin: boolean = false;
  imageDisabled: boolean = false

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

  language: string = ''

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    gender: new FormControl(''),
    status: new FormControl(''),
    ethnic: new FormControl(''),
    occupation: new FormControl('', Validators.required),
    rightestYear: new FormControl('', Validators.required),
    birthYear: new FormControl('', Validators.required),
  });

  description: string = '';
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

  eventArray = new FormArray([]);
  memoirArray = new FormArray([]);
  imageForm2 = new FormGroup({
    imageUpload: new FormControl(''),
    image: new FormControl(''),
  });

  private newEvent() {
    return new FormGroup({
      startYear: new FormControl(''),
      endYear: new FormControl(''),
      event: new FormControl(''),
    });
  }

  private newMemoir() {
    return new FormGroup({
      memoirTitle: new FormControl(''),
      memoirContent: new FormControl(''),
      memoirAuthor: new FormControl(''),
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
    private translate: TranslateService
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
  }

  onImageChange(data: any) {
    if (data.type == 'image') {
      this.imageData = {
        ...this.imageData,
        isGallery: data.value.imageUpload === 'yes',
        galleryCategory: data.value.imageCategory || '',
        galleryTitle: data.value.imageTitle || '',
        galleryDetail: data.value.imageDes || '',
        gallerySource: data.value.imageSource || '',
      };
    }

    if (data.type == 'url') {
      this.url = data.value;
    }

    this.imageChange.emit({
      image: this.imageData,
      url: this.url,
    });
  }

  ngOnInit(): void {
    this.language = localStorage.getItem('lang')!

    this.sub.push(
      this.translate.onLangChange.subscribe((langChange: any) => {
        this.language = langChange
      })
    )

    this.sub.push(
      this.auth.isAdmin.subscribe((isAdmin: any) => {
        this.isAdmin = isAdmin;
      })
    );

    if (this.page === 'contribution') {
      if (this.contribution) {

        if (this.contribution.rightist!.imageId) {
          this.imageDisabled = true
        }

        if (this.contribution.contributionId && this.contribution.rightist) {
          const rightist: Rightist = this.contribution.rightist;
          this.mapForm(rightist);

          this.sub.push(
            this.form.valueChanges.subscribe((data: any) => {
              this.formChange.emit(data)
            })
          )

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
          this.contributionId = params['contributionId'];
          this.page = params['page'];
          if (this.page === 'account') {
            if (this.contributionId) {
              this.sub.push(
                this.contributionService
                  .fetchContributorByContributionId(this.contributionId)
                  .subscribe((contribution: any) => {
                    this.contribution = contribution;
                    this.mapForm(contribution.rightist);
                  })
              );
            }
          } else {
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
      occupation: rightist.workplaceCombined,
      ethnic: rightist.ethnicity,
      rightestYear: rightist.rightistYear,
      ...rightist,
    });

    console.log(rightist);

    this.description = rightist.description;

    if (rightist.imageId) {
      this.sub.push(
        this.imageAPI.getImage(rightist.imageId).subscribe((data: any) => {
          this.imageData = { ...data };
          this.imageLoaded = true;
        })
      );
    }
    else {
      this.imageLoaded = true;
    }
  
    if (rightist.events) {
      for (const event of rightist.events) {
        this.eventArray.push(
          new FormGroup({
            startYear: new FormControl(event.startYear),
            endYear: new FormControl(event.endYear),
            event: new FormControl(event.event),
          })
        );
      }
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
          })
        );
      }
    } else {
      this.memoirArray.push(this.newMemoir());
    }
  }

  async onSubmit() {
    // remove last event if empty
    if (!this.eventArray.at(this.eventArray.length - 1).touched) {
      this.eventArray.removeAt(this.eventArray.length - 1);
    }

    // remove last memoir if empty
    if (!this.memoirArray.at(this.memoirArray.length - 1).touched) {
      this.memoirArray.removeAt(this.memoirArray.length - 1);
    }

    const {
      name,
      gender,
      status,
      ethnic,
      rightestYear,
      occupation,
      birthYear,
    } = this.form.value;

    const rightistId =
      this.contribution?.rightist?.rightistId || `Rightist-${UUID()}`;
    const imageId = `Image-${UUID()}`;

    console.log(this.form.value);
    console.log(this.imageData);
    console.log(this.description);
    console.log(this.eventArray.value);
    console.log(this.memoirArray.value);

    let image: ImageSchema = {
      ...this.imageData,
      imageId: imageId,
      rightistId: rightistId,
    };

    let rightist: RightistSchema = {
      rightistId: rightistId,
      imageId: imageId,
      initial: name.trim().charAt(0).toUpperCase(),
      firstName: '',
      lastName: '',
      fullName: name,
      gender: gender || '',
      birthYear: birthYear,
      deathYear: 0,
      rightistYear: rightestYear,
      status: status || 'Unknown',
      ethnicity: ethnic || '',
      education: '',
      birthplace: '',
      job: '',
      detailJob: '',
      workplace: '',
      workplaceCombined: occupation,
      events: this.eventArray.value,
      memoirs: this.memoirArray.value,
      reference: '',
      description: this.description,
      lastUpdatedAt: new Date(),
    };

    // has image
    if (this.url) {
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
              image.imagePath = imageUrl;

              if (this.isAdmin) {
                Promise.all([
                  this.contributionService.addUserContributions({
                    contributionId: this.contributionId,
                    contributorId: this.auth.uid,
                    contributedAt: new Date(),
                    lastUpdatedAt: new Date(),
                    rightistId: rightistId,
                    approvedAt: new Date(),
                    publish: 'approved',
                  }),
                  this.archiveAPI.addNewArchieve(rightist),
                  this.imageAPI.addImage(this.language, image),
                ]).then(() => {
                  this.clear();
                  this.clear2();
                  this.route.navigateByUrl('/account');
                });
              } else {
                Promise.all([
                  this.contributionService.contributionsAddEdit({
                    contributionId: this.contributionId,
                    contributorId: this.auth.uid,
                    contributedAt: new Date(),
                    rightistId: rightistId,
                    lastUpdatedAt: new Date(),
                    approvedAt: new Date(),
                    publish: 'new',
                    rightist: rightist,
                  }),
                  this.imageAPI.addImage(this.language, image),
                ]).then(() => {
                  this.clear();
                  this.clear2();
                  this.route.navigateByUrl('/account');
                });
              }
            })
        );
      });
    // no image
    } else {
      rightist.imageId = ''
      if (this.isAdmin) {
        Promise.all([
          this.contributionService.addUserContributions({
            contributionId: this.contributionId,
            contributorId: this.auth.uid,
            contributedAt: new Date(),
            rightistId: rightistId,
            lastUpdatedAt: new Date(),
            approvedAt: new Date(),
            publish: 'approved',
          }),
          this.archiveAPI.addNewArchieve(rightist),
        ]).then(() => {
          this.clear();
          this.clear2();
          this.route.navigateByUrl('/account');
        });
      } else {
        Promise.all([
          this.contributionService.contributionsAddEdit({
            contributionId: this.contributionId,
            contributorId: this.auth.uid,
            contributedAt: new Date(),
            rightistId: rightistId,
            approvedAt: new Date(),
            lastUpdatedAt: new Date(),
            publish: 'new',
            rightist: rightist,
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
