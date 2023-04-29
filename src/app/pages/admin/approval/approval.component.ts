import {
  animate,
  AnimationEvent,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnDestroy, OnInit, Output, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
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
  ContributionDetails,
  ContributionJson,
  ContributionSchema,
  Event,
  ImagesSchema,
  Memoir,
  Publish,
  Rightist,
  RightistSchema,
} from 'src/app/core/types/adminpage.types';
import { UUID } from 'src/app/core/utils/uuid';
import { UploadComponent } from '../../requestForms/upload/upload.component';

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
  selectedContribution!: ContributionDetails;
  updatedContribution!: Contribution;
  otherUpdatedContribution!: Contribution;

  @ViewChild('readMoreTemplate') appUpload: TemplateRef<any> | undefined;

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
  limit: number = 10;

  emptyContributionMessage = 'Nothing Here!';

  url: string = '';
  image: ImagesSchema = {
    imageId: '',
    rightistId: '',
    isGallery: false,
    category: '',
    title: '',
    detail: '',
    source: '',
    imageUrl: '',
    isProfile: undefined
  };

  otherImage: ImagesSchema = {
    imageId: '',
    rightistId: '',
    isGallery: false,
    category: '',
    title: '',
    detail: '',
    source: '',
    imageUrl: '',
    isProfile: undefined
  };

  languageSubscription?: Subscription;
  sub: Subscription[] = [];
  subFetchAll!: Subscription;

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

  onScroll() {
    this.initialize();
  }

  ngOnInit(): void {
    this.language = localStorage.getItem('lang')!;
    this.otherLanguage = this.language === 'en' ? 'cn' : 'en';

    this.languageSubscription = this.translate.onLangChange.subscribe(
      (langChange: any) => {
        this.sub.forEach((x) => x.unsubscribe());
        this.subFetchAll?.unsubscribe();
        this.sub.length = 0;
        this.language = langChange.lang;
        this.otherLanguage = this.language === 'en' ? 'cn' : 'en';
        this.initialize();
      }
    );

    this.initialize();
  }

  initialize() {
    this.subFetchAll?.unsubscribe();
    this.subFetchAll = this.contributionAPI
        .fetchAllContributionsList(this.language, this.limit)
        .subscribe((data: any) => {
          this.contributions.length = 0;
          this.newContributions.length = 0;
          this.approvedContributions.length = 0;
          this.rejectedContributions.length = 0;
          const test: ContributionJson[] = data;
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
              this.newContributions.push(data);
            }

            if (contribution.publish == 'approved') {
              this.sub.forEach((x) => x.unsubscribe());
              this.sub.push(
                this.archiveAPI
                  .getRightistById(this.language, data.rightistId)
                  .subscribe((rightist: any) => {
                    if (rightist ?.imageId) {
                      this.sub.push(
                        this.imageAPI
                          .getImage(this.language, rightist.imageId)
                          .subscribe((image: any) => {
                            data.rightist = rightist;
                            data.image = image;
                            this.loaded = true;
                          })
                      );
                    }
                  })
              );
              this.approvedContributions.push(data);
            }

            if (contribution.publish == 'rejected') {
              this.rejectedContributions.push(data);
            }
          }

          this.approvedContributions.sort(function (a, b) {
            return (
              new Date(b.lastUpdatedAt).getTime() -
              new Date(a.lastUpdatedAt).getTime()
            );
          });
        });
    this.limit += 1;
    this.selectedContributions = this.newContributions;
    console.log(this.activeCategory)
    if (!this.activeCategory) {
      this.activeCategory = 'New Contributions';
    } else {
      this.selectedContributions = this.categories[this.activeCategory];
    }
  }

  ngOnDestroy(): void {
    this.sub.forEach((x) => x.unsubscribe());
    this.languageSubscription?.unsubscribe();
  }

  onApprove(el: UploadComponent) {
    this.publish = 'approved';
    this.selectedContribution.state = 'removed';
    el.onSubmit('approved').then(()=> {
      this.modalRef?.hide();
    })
  }

  onReject(el: UploadComponent) {
    this.modalRef?.hide();
    this.publish = 'rejected';
    this.selectedContribution.state = 'removed';
    el.onSubmit('rejected').then(()=> {
      this.modalRef?.hide();
    })
  }

  onReconsider(el: UploadComponent) {
    this.modalRef?.hide();
    this.publish = 'approved';
    this.selectedContribution.state = 'removed';
    el.onSubmit('new').then(()=> {
      this.modalRef?.hide();
    })
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

    if (
      this.selectedContribution &&
      this.selectedContribution.state === 'removed'
    ) {
      this.selectedContribution.state = 'void';
    }
  }

  onReadMore(template: TemplateRef<any>, contribution: ContributionDetails) {
    this.selectedContribution = contribution;
    this.modalRef = this.modalService.show(template, { class: 'modal-custom-style' });
  }
}
