import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Input,
  TemplateRef,
  OnDestroy,
} from '@angular/core';

import { ArchieveApiService } from 'src/app/core/services/archives-api-service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { jsPDF } from 'jspdf';
import { ClipboardService } from 'ngx-clipboard';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { ImagesService } from 'src/app/core/services/images.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Rightist } from 'src/app/core/types/adminpage.types';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ContributionsService } from 'src/app/core/services/contributions.service';
import { TypeaheadOptions } from 'ngx-bootstrap/typeahead';
import { StorageApIService } from 'src/app/core/services/storage-api.service';

@Component({
  selector: 'app-browse-archive',
  templateUrl: './browse-archive.component.html',
  styleUrls: ['./browse-archive.component.scss'],
})
export class BrowseArchiveComponent implements OnInit, OnDestroy {
  @ViewChild('memContent') memContent!: ElementRef;
  @ViewChild('infoContent') infoContent!: ElementRef;

  [x: string]: any;
  id = this.route.snapshot.paramMap.get('id') as string;
  profile = {} as any;
  url = location.href;
  isAdmin: boolean = false;
  // drop: boolean = true;
  drop: boolean[] = [];

  modalRef?: BsModalRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private arch: ArchieveApiService,
    private clipboardApi: ClipboardService,
    private auth: AuthServiceService,
    private images: ImagesService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private contributionAPI: ContributionsService,
    private storageAPI: StorageApIService
  ) {}

  language: string = '';
  otherLanguage: string = '';

  languageSubscription?: Subscription;

  sub: Subscription[] = [];
  src: string = 'assets/browsepage/STIP_Logo_PlaceholderBox.svg';

  loaded: boolean = false;

  initialize() {
    this.sub.push(
      this.arch
        .getRightistById(this.language!, this.id)
        .subscribe((res: any) => {
          this.profile = res;
          console.log(res);

          if (res.imageId) {
            this.sub.push(
              this.images
                .getImage(this.language!, this.profile.imageId)
                .subscribe((image: any) => {
                  this.src = image.imagePath;
                  this.loaded = true;
                })
            );
          } else {
            this.loaded = true;
          }

          //sorting event based on starting year
          if (this.profile.events) {
            this.profile.events.sort(function (a, b) {
              return (
                new Date(a.start_year).getTime() -
                new Date(b.start_year).getTime()
              );
            });
          }

          this.replaceNewline();
        })
    );
  }

  ngOnInit(): void {
    this.loaded = false;
    this.language = localStorage.getItem('lang')!
    this.otherLanguage = this.language === 'en' ? 'cn' : 'en';

    this.languageSubscription = this.translate.onLangChange.subscribe(
      (langChange: any) => {
        console.log(langChange.lang);
        this.language = langChange.lang;
        this.otherLanguage = this.language === 'en' ? 'cn' : 'en';
        this.sub.forEach((x) => x.unsubscribe());
        this.initialize();
      }
    );

    this.initialize();
  }

  ngOnDestroy(): void {
    this.sub.forEach((x) => x.unsubscribe());
    this.languageSubscription?.unsubscribe();
  }

  ngDoCheck() {
    this.auth.isAdmin.subscribe((x) => {
      this.isAdmin = x;
    });
  }

  replaceNewline() {
    if (this.profile.memoirs) {
      this.profile.memoirs.forEach((element: any, index: number) => {
        this.profile.memoirs[index].memoirContent =
          element.memoirContent.split('\\n');
      });
    }
  }
  SavePDF(pdfName: string): void {
    let doc = new jsPDF('p', 'pt', 'a4');
    let content;
    if (pdfName === 'memoirContent') {
      this.addWrappedText(this.profile.memoirs[0].memoirContent, 540, doc);
      doc.save(pdfName + '.pdf');
    } else {
      content = this.infoContent.nativeElement;
      doc.html(content, {
        callback: function (doc) {
          doc.save(pdfName + '.pdf');
        },
        x: 50,
        y: 50,
      });
    }
  }
  copyURL() {
    this.clipboardApi.copyFromContent(this.url);
  }

  updateCollapse(index: number) {
    this.drop[index] = !this.drop[index];
  }
  expandAll() {
    this.drop = new Array(this.profile.memoirs.length).fill(false);
  }
  addWrappedText(
    text,
    textWidth,
    doc,
    fontSize = 10,
    fontType = 'normal',
    lineSpacing = 20,
    xPosition = 40,
    initialYPosition = 50,
    pageWrapInitialYPosition = 50
  ) {
    var textLines = doc.splitTextToSize(text, textWidth); // Split the text into lines
    var pageHeight = doc.internal.pageSize.height; // Get page height, well use this for auto-paging

    doc.setFont(undefined, fontSize);
    doc.setFont(undefined, fontType);

    var cursorY = initialYPosition;

    textLines.forEach((lineText) => {
      if (cursorY + 50 > pageHeight) {
        doc.addPage();
        cursorY = pageWrapInitialYPosition;
      }
      doc.text(xPosition, cursorY, lineText);
      cursorY += lineSpacing;
    });
  }

  onDelete(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { backdrop: 'static' });
  }

  onYes() {
    this.loaded = false;
    console.log(this.profile);
    this.modalService.hide();
    this.sub.push(
      this.contributionAPI
        .getUserContributionsList(this.language!, this.profile.contributorId)
        .subscribe((data: any) => {
          let contributions = [...data];
          console.log(contributions);

          for (let contribution of contributions) {
            if (this.profile.rightistId === contribution.rightistId) {
              console.log(contribution);
              console.log(this.profile);
              if (this.profile.imageId) {
                console.log('Has Image');
                Promise.all([
                  this.contributionAPI.deleteUserContribution(
                    this.language!,
                    this.profile.contributorId,
                    contribution.contributionId
                  ),
                  this.contributionAPI.deleteUserContribution(
                    this.otherLanguage!,
                    this.profile.contributorId,
                    contribution.contributionId
                  ),
                  this.arch.removeRightistById(
                    this.language!,
                    this.profile.rightistId
                  ),
                  this.arch.removeRightistById(
                    this.otherLanguage!,
                    this.profile.rightistId
                  ),
                  this.images.deleteImage(this.language!, this.profile.imageId),
                  this.images.deleteImage(
                    this.otherLanguage!,
                    this.profile.imageId
                  ),
                  this.storageAPI.removeGalleryImage(this.profile.imageId),
                ]).then(() => {
                  this.router.navigateByUrl('/account');
                });
              } else {
                Promise.all([
                  this.contributionAPI.deleteUserContribution(
                    this.language!,
                    this.profile.contributorId,
                    contribution.contributionId
                  ),
                  this.arch.removeRightistById(
                    this.language!,
                    this.profile.rightistId
                  ),
                ]).then(() => {
                  this.router.navigateByUrl('/account');
                });
              }
            }
          }
        })
    );
  }

  onNo() {
    this.modalService.hide();
  }
}
