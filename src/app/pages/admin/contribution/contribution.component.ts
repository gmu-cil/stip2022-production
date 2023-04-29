import {
  animate,
  AnimationEvent,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  Input,
  OnInit,
  EventEmitter,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  Categories,
  Contribution,
  Publish,
} from 'src/app/core/types/adminpage.types';

@Component({
  selector: 'app-contribution',
  templateUrl: './contribution.component.html',
  styleUrls: ['./contribution.component.scss'],
  animations: [
    trigger('contributionAnimation', [
      state('void', style({ opacity: 1 })),
      state('removed', style({ opacity: 0, display: 'none' })),
      transition('void -> removed', animate('800ms ease-in-out')),
    ]),
  ],
})
export class ContributionComponent implements OnInit {
  @Input() contribution!: Contribution;
  @Input() activeCategory?: Categories;

  @Output() readMore: EventEmitter<Contribution | any> = new EventEmitter();
  @Output() rightistNavigation: EventEmitter<Contribution> = new EventEmitter()

  newDate

  // character limit
  limit: number = 50;

  _loaded: boolean = false
  @Input() set loaded(value: boolean) {
    this._loaded = value;
  }

  get loaded(): boolean {
    return this._loaded!
  }

  constructor() {}

  ngOnInit(): void {
  }

  onReadMore() {
    this.readMore.emit(this.contribution);
  }
}
