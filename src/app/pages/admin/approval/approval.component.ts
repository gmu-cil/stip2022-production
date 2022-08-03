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
import { Subscription } from 'rxjs';
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
  ImageSchema,
  Publish,
  Rightist,
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
  loaded: boolean = false

  newContributions: Contribution[] = [];
  approvedContributions: Contribution[] = [];
  rejectedContributions: Contribution[] = [];

  selectedContributions: Contribution[] = [];

  activeCategory!: Categories;
  selectedContribution!: Contribution;
  updatedContribution!: Contribution;

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

  contributionSubcription?: Subscription;
  rightistSubscription?: Subscription;

  contributions: any[] = [];
  publish: Publish = 'new';
  isLoaded: boolean = false;
  limit: number = 3;

  emptyContributionMessage = 'Nothing Here!';

  url?: string;
  image?: ImageSchema;

  sub: Subscription[] = [];

  language: string = ''

  constructor(
    private modalService: BsModalService,
    private contributionAPI: ContributionsService,
    private archiveAPI: ArchieveApiService,
    private storageAPI: StorageApIService,
    private imageAPI: ImagesService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.language = localStorage.getItem('lang')!

    this.sub.push(this.translate.onLangChange.subscribe((langChange: any) => {
      this.language = langChange
    }))

    this.contributionSubcription = this.contributionAPI
      .fetchAllContributions()
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

        console.log(this.contributions)

        
        for (let contribution of this.contributions) {
          let data: Contribution = {
            ...contribution,
            lastUpdatedAt: new Date(contribution.lastUpdatedAt),
            contributedAt: new Date(contribution.contributedAt),
            approvedAt: new Date(contribution.approvedAt),
            state: 'void',
          };

          if (data.rightist) {
            data.rightist!.lastUpdatedAt = new Date(data.rightist!.lastUpdatedAt)
          }

          if (contribution.publish == 'new') {
            this.newContributions.push(data);
          }

          if (contribution.publish == 'approved') {
            this.sub.push(
              this.archiveAPI
                .getPersonById(data.rightistId)
                .subscribe((rightist: any) => {
                  data.rightist = rightist
                  this.loaded = true
                })
            );

            this.approvedContributions.push(data);
          }

          if (contribution.publish == 'rejected') {
            this.rejectedContributions.push(data);
          }
        }

      });

    this.selectedContributions = this.newContributions;
    this.activeCategory = 'New Contributions';
  }

  ngOnDestroy(): void {
    this.contributionSubcription?.unsubscribe();
    this.rightistSubscription?.unsubscribe();
    this.sub.forEach((x) => x.unsubscribe());
  }

  onApprove() {
    this.modalRef?.hide();
    this.publish = 'approved';
    this.selectedContribution.state = 'removed';
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
    console.log(this.updatedContribution)

    if (
      this.selectedContribution &&
      this.selectedContribution.state === 'removed'
    ) {
      // New Image Added
      if (this.url) {
        console.log("New Image")
        let imageId = UUID();
        this.image!.imageId = imageId
        await fetch(this.url).then(async (response) => {
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
                this.image!.rightistId = this.updatedContribution.rightistId
                // update the current timestamp
                this.updatedContribution.lastUpdatedAt = new Date()
                this.updatedContribution.rightist!.lastUpdatedAt = new Date();

                if (this.updatedContribution.rightist) {
                  this.updatedContribution.publish = this.publish;

                  const { state, ...contribution } = this.updatedContribution;

                  if (this.publish === 'approved') {
                    let { rightist, ...result } = contribution;
                    result.rightistId = rightist!.rightistId;
                    result.approvedAt = new Date();

                    rightist!.imageId = imageId

                    Promise.all([
                      this.contributionAPI.updateUserContribution(
                        this.updatedContribution.contributorId,
                        this.updatedContribution.contributionId,
                        result
                      ),
                      this.archiveAPI.addNewArchieve(rightist!),
                      this.imageAPI.updateImage(this.language, this.image!)
                    ]);
                  } else {
                    Promise.all([
                      this.contributionAPI.updateUserContribution(
                        this.updatedContribution.contributorId,
                        this.updatedContribution.contributionId,
                        contribution
                      ),
                      this.imageAPI.updateImage(this.language, this.image!)
                    ])
                  }
                }
              })
          );
        });
      // No new Image
      } else {
        this.updatedContribution.rightist!.lastUpdatedAt = new Date();
        this.updatedContribution.lastUpdatedAt = new Date()

        if (this.updatedContribution.rightist) {
          this.updatedContribution.publish = this.publish;

          const { state, ...contribution } = this.updatedContribution;

          if (this.publish === 'approved') {
            let { rightist, ...result } = contribution;
            result.rightistId = rightist!.rightistId;
            result.approvedAt = new Date();

            Promise.all([
              this.contributionAPI.updateUserContribution(
                this.updatedContribution.contributorId,
                this.updatedContribution.contributionId,
                result
              ),
              this.archiveAPI.addNewArchieve(rightist!),
              this.imageAPI.updateImage(this.language, this.image!)
            ]);
          } else {
            Promise.all([
              await this.contributionAPI.updateUserContribution(
                this.updatedContribution.contributorId,
                this.updatedContribution.contributionId,
                contribution
              ),
              this.imageAPI.updateImage(this.language, this.image!)
            ])
          }
        }
      }
      this.selectedContribution.state = 'void';
    }
  }

  onReadMore(template: TemplateRef<any>, contribution: Contribution) {
    this.selectedContribution = contribution;
    this.updatedContribution = { ...contribution };
    this.imageAPI.getImage(contribution.rightist!.imageId).subscribe((data: any) => {
      this.image = {...data}
    })
    this.modalRef = this.modalService.show(template, { class: 'modal-xl' });
  }

  onEventChange(data: any) {
    this.updatedContribution.rightist!.events = data;
  }

  onMemoirChange(data: any) {
    this.updatedContribution.rightist!.memoirs = data;
  }

  onFormChange(data: any) {
    this.updatedContribution = {
      ...this.updatedContribution,
      rightist: {
        ...this.updatedContribution.rightist!,
        fullName: data.name,
        gender: data.gender,
        status: data.status,
        ethnicity: data.ethnic,
        workplaceCombined: data.occupation,
        rightistYear: data.rightestYear,
        birthYear: data.birthYear
      }
    }
  }

  onImageChange(data: any) {
    this.url = data.url;
    console.log(data);
    this.image = { ...data.image };
  }
}
