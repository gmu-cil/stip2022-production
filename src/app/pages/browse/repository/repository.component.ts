import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss'],
})
export class RepositoryComponent implements OnInit {
  currentLanguage = this.translate.currentLang;

  selectedCategory: number = 0;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {}

  ngDoCheck() {
    this.switchLanguage();
  }

  setActive(index: number) {
    this.selectedCategory = index;
  }

  switchLanguage() {
    this.currentLanguage = this.translate.currentLang;
  }

  downloadFromAsset(filename: string, folder: string) {
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = `assets/repositoryData/EnglishPDF/${folder}/${filename}.pdf`;

    if (this.currentLanguage == 'en') {
      link.href = `assets/repositoryData/EnglishData/${folder}/${filename}.pdf`;
    } else {
      link.href = `assets/repositoryData/ChineseData/${folder}/${filename}.pdf`;
    }
    console.log(link.href);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
