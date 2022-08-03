import { Component, Input, OnInit } from '@angular/core';
import { ContributionsService } from 'src/app/core/services/contributions.service';
import { Contribution } from 'src/app/core/types/adminpage.types';

@Component({
  selector: 'app-View-card',
  templateUrl: './view.component.html',
})
export class ViewComponent implements OnInit {
  @Input() data: Contribution = {} as Contribution;

  constructor(private contributionService: ContributionsService) {}

  ngOnInit(): void {}

  deleteContribution() {
    this.contributionService.removeContributionById(this.data.contributionId);
  }
}
