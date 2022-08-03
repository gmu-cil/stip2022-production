import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';

import { ArchieveApiService } from 'src/app/core/services/archives-api-service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { jsPDF } from 'jspdf';
import { ClipboardService } from 'ngx-clipboard';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { ImagesService } from 'src/app/core/services/images.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-browse-archive',
  templateUrl: './browse-archive.component.html',
  styleUrls: ['./browse-archive.component.scss'],
})
export class BrowseArchiveComponent implements OnInit {
  @ViewChild('memContent') memContent!: ElementRef;
  @ViewChild('infoContent') infoContent!: ElementRef;


  [x: string]: any;
  id = this.route.snapshot.paramMap.get('id') as string;
  profile = {} as any;
  url = location.href;
  isAdmin: boolean = false;
  // drop: boolean = true;
  drop: boolean[] = [];

  constructor(
    private route: ActivatedRoute,
    private arch: ArchieveApiService,
    private clipboardApi: ClipboardService,
    private auth: AuthServiceService,
    private images: ImagesService,
    private translate: TranslateService
  ) {}

  language?: string
  sub: Subscription[] = []
  subApi: Subscription[] = []
  src: string = 'assets/browsepage/STIP_Logo_PlaceholderBox.svg'

  ngOnInit(): void {
    this.language = localStorage.getItem('lang')!
    this.subApi.push(this.arch.getPersonById(this.id).subscribe((res) => {

      this.profile = res;
      //sorting event based on starting year
      this.profile.events.sort(function (a, b) {
        return new Date(a.start_year).getTime() - new Date(b.start_year).getTime();
      });
      this.replaceNewline();
    }));

    this.sub.push(this.translate.onLangChange.subscribe((langChange: any) => {
      this.language = langChange.lang;
      this.subApi.forEach((sub) => sub.unsubscribe());
      this.subApi.push(this.arch.getPersonById(this.id).subscribe((res) => {
        this.profile = res;
        //sorting event based on starting year
        this.profile.events.sort(function (a, b) {
          return new Date(a.start_year).getTime() - new Date(b.start_year).getTime();
        });
        this.replaceNewline();
      }));
      // this.images.getImage(this.profile.profileImageId).subscribe((res) => {
      //   this.profile.profileImageId = res;
      // });
      this.auth.isAdmin.subscribe((x) => {
        this.isAdmin = x;
      });
      this.auth.isLoggedIn.subscribe((x) => {
        this.isAdmin = this.isAdmin && x;
      });
    }))


  }
  ngDoCheck() {
    this.auth.isAdmin.subscribe((x) => {
      this.isAdmin = x;
    });
  }

  replaceNewline() {
    this.profile.memoirs.forEach((element: any, index: number) => {
      this.profile.memoirs[index].memoirContent = element.memoirContent.split('\\n');
    });
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
}
