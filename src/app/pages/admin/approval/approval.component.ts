import {
  animate,
  AnimationEvent,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { forkJoin, mergeMap, Subscription, zip } from 'rxjs';
import { ArchieveApiService } from 'src/app/core/services/archives-api-service';
import { ContributionsService } from 'src/app/core/services/contributions.service';
import { ImagesService } from 'src/app/core/services/images.service';
import { StorageApIService } from 'src/app/core/services/storage-api.service';
import {
  Categories,
  CategoryList,
  Contribution,
  ContributionJson,
  ContributionSchema,
  Event,
  ImageSchema,
  Memoir,
  Publish,
  Rightist,
  RightistSchema,
} from 'src/app/core/types/adminpage.types';
import { UUID } from 'src/app/core/utils/uuid';

@Component({
  selector: 'app-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss'],
  animations: [
    trigger('contributionAnimation', [
      state('void', style({ opacity: 1 })),
      state('removed', style({ opacity: 0, display: 'none' })),
      transition('void -> removed', animate('800ms ease-in-out')),
    ]),
  ],
})
export class ApprovalComponent implements OnInit, OnDestroy {
  currentState: string = 'void';
  loaded: boolean = false;

  newContributions: Contribution[] = [];
  approvedContributions: Contribution[] = [];
  rejectedContributions: Contribution[] = [];

  selectedContributions: Contribution[] = [];

  activeCategory!: Categories;
  selectedContribution!: Contribution;
  updatedContribution!: Contribution;
  otherUpdatedContribution!: Contribution;

  categoriesList: Categories[] = [
    'New Contributions',
    'Approved Contributions',
    'Rejected Contributions',
  ];
  categories: CategoryList = {
    'New Contributions': this.newContributions,
    'Approved Contributions': this.approvedContributions,
    'Rejected Contributions': this.rejectedContributions,
  };

  disabled: boolean = false;
  modalRef?: BsModalRef;

  contributions: any[] = [];
  publish: Publish = 'new';
  isLoaded: boolean = false;
  limit: number = 3;

  emptyContributionMessage = 'Nothing Here!';

  url: string = '';
  image: ImageSchema = {
    imageId: '',
    rightistId: '',
    isGallery: false,
    galleryCategory: '',
    galleryTitle: '',
    galleryDetail: '',
    gallerySource: '',
  };

  otherImage: ImageSchema = {
    imageId: '',
    rightistId: '',
    isGallery: false,
    galleryCategory: '',
    galleryTitle: '',
    galleryDetail: '',
    gallerySource: '',
  };

  languageSubscription?: Subscription;
  sub: Subscription[] = [];

  language: string = '';
  otherLanguage: string = '';

  constructor(
    private modalService: BsModalService,
    private contributionAPI: ContributionsService,
    private archiveAPI: ArchieveApiService,
    private storageAPI: StorageApIService,
    private imageAPI: ImagesService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.language = localStorage.getItem('lang')!;
    this.otherLanguage = this.language === 'en' ? 'cn' : 'en';

    this.languageSubscription = this.translate.onLangChange.subscribe(
      (langChange: any) => {
        this.sub.forEach((x) => x.unsubscribe());
        this.sub.length = 0;
        this.language = langChange.lang;
        this.otherLanguage = this.language === 'en' ? 'cn' : 'en';
        this.initialize();
      }
    );

    this.initialize();
  }

  initialize() {
    this.sub.push(
      this.contributionAPI
        .fetchAllContributions(this.language)
        .subscribe((data: any) => {
          console.log(data);
          this.contributions.length = 0;
          this.newContributions.length = 0;
          this.approvedContributions.length = 0;
          this.rejectedContributions.length = 0;
          const test: ContributionJson[] = Object.values(data);
          for (let lol of test) {
            for (const contribution of Object.values(lol)) {
              this.contributions.push(contribution);
            }
          }

          this.contributions.sort(function (a, b) {
            return (
              new Date(b.lastUpdatedAt).getTime() -
              new Date(a.lastUpdatedAt).getTime()
            );
          });

          console.log(this.contributions);

          for (let contribution of this.contributions) {
            let data: Contribution = {
              ...contribution,
              lastUpdatedAt: new Date(contribution.lastUpdatedAt),
              contributedAt: new Date(contribution.contributedAt),
              approvedAt: new Date(contribution.approvedAt),
              state: 'void',
            };

            if (data.rightist) {
              data.rightist!.lastUpdatedAt = new Date(
                data.rightist!.lastUpdatedAt
              );
            }

            if (contribution.publish == 'new') {
              console.log(data);
              this.newContributions.push(data);
            }

            if (contribution.publish == 'approved') {
              this.sub.push(
                this.archiveAPI
                  .getRightistById(this.language, data.rightistId)
                  .subscribe((rightist: any) => {
                    // console.log(rightist);
                    this.sub.push(
                      this.imageAPI
                        .getImage(this.language, rightist.imageId)
                        .subscribe((image: any) => {
                          data.rightist = rightist;
                          data.image = image;
                          this.loaded = true;
                        })
                    );
                  })
              );
              this.approvedContributions.push(data);
            }

            if (contribution.publish == 'rejected') {
              this.rejectedContributions.push(data);
            }
          }

          console.log(this.approvedContributions);

          this.approvedContributions.sort(function (a, b) {
            return (
              new Date(b.lastUpdatedAt).getTime() -
              new Date(a.lastUpdatedAt).getTime()
            );
          });
        })
    );

    this.selectedContributions = this.newContributions;
    this.activeCategory = 'New Contributions';
  }

  ngOnDestroy(): void {
    this.sub.forEach((x) => x.unsubscribe());
    this.languageSubscription?.unsubscribe();
  }

  onApprove() {
    this.modalRef?.hide();
    this.publish = 'approved';
    this.selectedContribution.state = 'removed';
  }

  onSave(data: any) {
    console.log(this.updatedContribution);
    console.log(this.otherUpdatedContribution);

    this.updatedContribution.image = this.image;
    this.otherUpdatedContribution.image = this.otherImage;

    if (data.type == 'save') {
      Promise.all([
        this.contributionAPI.updateUserContribution(
          this.language,
          this.updatedContribution
        ),
        this.contributionAPI.updateUserContribution(
          this.otherLanguage,
          this.otherUpdatedContribution
        ),
      ]).then(() => {
        this.modalRef?.hide();
      });
    }
  }

  onReject() {
    this.modalRef?.hide();
    this.publish = 'rejected';
    this.selectedContribution.state = 'removed';
  }

  onReconsider() {
    this.modalRef?.hide();
    this.publish = 'approved';
    this.selectedContribution.state = 'removed';
  }

  onEdit() {
    this.modalRef?.hide();
    this.publish = 'approved';
    this.selectedContribution.state = 'removed';
  }

  setActiveCategory(category: Categories) {
    this.activeCategory = category;
    this.selectedContributions = this.categories[this.activeCategory];
  }

  animationStart(event: AnimationEvent) {
    this.disabled = true;
  }

  async animationDone(event: AnimationEvent) {
    this.disabled = false;
    console.log(this.updatedContribution);

    if (
      this.selectedContribution &&
      this.selectedContribution.state === 'removed'
    ) {
      if (this.publish === 'approved') {
        this.updatedContribution.publish = this.publish;
        this.otherUpdatedContribution.publish = this.publish;

        if (this.url) {
          this.image!.imagePath = this.url;
        }

        if (this.image!.imagePath!) {
          let imageId = `Image-${UUID()}`;
          this.image!.imageId = imageId;
          this.otherImage!.imageId = imageId;
          await fetch(this.image?.imagePath!).then(async (response) => {
            console.log(imageId);
            const contentType = response.headers.get('content-type');
            const blob = await response.blob();
            const file = new File([blob], imageId, { type: contentType! });
            await this.storageAPI.uploadGalleryImage(imageId, file);
            this.sub.push(
              this.storageAPI
                .getGalleryImageURL(imageId)
                .subscribe(async (imageUrl: any) => {
                  console.log(imageUrl);
                  this.image!.imagePath = imageUrl;
                  this.otherImage!.imagePath = imageUrl;
                  this.image!.rightistId = this.updatedContribution.rightistId;
                  this.otherImage!.rightistId =
                    this.updatedContribution.rightistId;
                  // update the current timestamp
                  this.updatedContribution.lastUpdatedAt = new Date();
                  this.updatedContribution.rightist!.lastUpdatedAt = new Date();

                  if (this.updatedContribution.rightist) {
                    this.updatedContribution.publish = this.publish;

                    const { state, ...contribution } = this.updatedContribution;
                    const { state: otherState, ...otherContribution } =
                      this.otherUpdatedContribution;

                    let { rightist, image, ...result } = contribution;
                    let {
                      rightist: otherRightist,
                      image: otherImage,
                      ...otherResult
                    } = otherContribution;

                    result.rightistId = rightist!.rightistId;
                    result.approvedAt = new Date();

                    otherResult.rightistId = otherRightist!.rightistId;
                    otherResult.approvedAt = new Date();

                    rightist!.imageId = imageId;
                    otherRightist!.imageId = imageId;

                    Promise.all([
                      this.contributionAPI.updateUserContribution(
                        this.language,
                        result
                      ),
                      this.contributionAPI.updateUserContribution(
                        this.otherLanguage,
                        otherResult
                      ),
                      this.archiveAPI.addRightist(this.language, rightist!),
                      this.archiveAPI.addRightist(
                        this.otherLanguage,
                        otherRightist!
                      ),
                      this.imageAPI.updateImage(this.language, this.image!),
                      this.imageAPI.updateImage(
                        this.otherLanguage,
                        this.otherImage!
                      ),
                    ]);
                  }
                })
            );
          });
        } else {
          this.updatedContribution.lastUpdatedAt = new Date();
          this.updatedContribution.rightist!.lastUpdatedAt = new Date();

          if (this.updatedContribution.rightist) {
            this.updatedContribution.publish = this.publish;

            const { state, ...contribution } = this.updatedContribution;
            const { state: otherState, ...otherContribution } =
              this.otherUpdatedContribution;

            let { rightist, image, ...result } = contribution;
            let {
              rightist: otherRightist,
              image: otherImage,
              ...otherResult
            } = otherContribution;

            result.rightistId = rightist!.rightistId;
            result.approvedAt = new Date();

            otherResult.rightistId = otherRightist!.rightistId;
            otherResult.approvedAt = new Date();

            Promise.all([
              this.contributionAPI.updateUserContribution(
                this.language,
                result
              ),
              this.contributionAPI.updateUserContribution(
                this.otherLanguage,
                otherResult
              ),
              this.archiveAPI.addRightist(this.language, rightist!),
              this.archiveAPI.addRightist(this.otherLanguage, otherRightist!),
            ]);
          }
        }
      } else {
        this.updatedContribution.publish = this.publish;
        this.otherUpdatedContribution.publish = this.publish;

        const { state, ...contribution } = this.updatedContribution;
        const { state: otherState, ...otherContribution } =
          this.otherUpdatedContribution;
        if (this.url) {
          this.updatedContribution!.image!.imagePath = this.url;
          this.otherUpdatedContribution!.image!.imagePath = this.url;
        }

        Promise.all([
          this.contributionAPI.updateUserContribution(
            this.language,
            contribution
          ),
          this.contributionAPI.updateUserContribution(
            this.otherLanguage,
            otherContribution
          ),
        ]);
      }
      this.selectedContribution.state = 'void';
    }
  }

  onReadMore(template: TemplateRef<any>, contribution: Contribution) {
    this.selectedContribution = contribution;
    this.updatedContribution = { ...contribution };
    this.otherUpdatedContribution = { ...contribution };
    this.image = { ...contribution.image! };
    this.modalRef = this.modalService.show(template, { class: 'modal-xl' });
  }

  onEventChange(source: any) {
    let events: Event[] = [];
    let otherEvents: Event[] = [];

    for (let data of source) {
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

    this.updatedContribution.rightist!.events = events;
    this.otherUpdatedContribution.rightist!.events = otherEvents;
  }

  onMemoirChange(source: any) {
    let memoirs: Memoir[] = [];
    let otherMemoirs: Memoir[] = [];

    for (let data of source) {
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

    this.updatedContribution.rightist!.memoirs = memoirs;
    this.otherUpdatedContribution.rightist!.memoirs = otherMemoirs;
  }

  onFormChange(data: any) {
    console.log(data);
    this.updatedContribution = {
      ...this.updatedContribution,
      rightist: {
        ...this.updatedContribution.rightist!,
        fullName: data.name,
        gender: data.gender,
        status: data.status,
        ethnicity: data.ethnic,
        job: data.occupation,
        workplace: data.workplace,
        rightistYear: data.rightistYear,
        birthYear: data.birthYear,
      },
    };

    this.otherUpdatedContribution = {
      ...this.otherUpdatedContribution,
      rightist: {
        ...this.otherUpdatedContribution.rightist!,
        fullName: data.otherName,
        gender: data.otherGender,
        status: data.otherStatus,
        ethnicity: data.otherEthnic,
        job: data.otherOccupation,
        workplace: data.otherWorkplace,
        rightistYear: data.rightistYear,
        birthYear: data.birthYear,
      },
    };
  }

  onImageChange(data: any) {
    this.url = data.url;
    console.log(data);
    this.image = { ...data.image };
    this.otherImage = { ...data.otherImage };
  }

  onDescriptionChange(data: any) {
    if (data.type == 'original') {
      this.updatedContribution = {
        ...this.updatedContribution,
        rightist: {
          ...this.updatedContribution.rightist!,
          description: data.value,
        },
      };
    }

    if (data.type == 'other') {
      console.log(data)
      this.otherUpdatedContribution = {
        ...this.otherUpdatedContribution,
        rightist: {
          ...this.otherUpdatedContribution.rightist!,
          description: data.value,
        },
      };
    }
  }
}
