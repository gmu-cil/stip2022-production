import { Component, OnDestroy, OnInit, VERSION } from '@angular/core';
import { Subscription, firstValueFrom, lastValueFrom } from 'rxjs';
import { ArchieveApiService } from 'src/app/core/services/archives-api-service';
import { RightistSchema } from 'src/app/core/types/adminpage.types';
import * as d3 from 'd3';
import { Arc, DefaultArcObject } from 'd3';
import { TranslateService } from '@ngx-translate/core';

interface FilterData {
  filter: string;
  count: number;
}

@Component({
  selector: 'app-about-research',
  templateUrl: './about-research.component.html',
  styleUrls: ['./about-research.component.scss'],
})
export class AboutResearchComponent implements OnInit, OnDestroy {
  total?: number;
  rightistSubscription?: Subscription;
  maleRightistList: RightistSchema[] = [];
  femaleRightistList: RightistSchema[] = [];

  rightist1957List: RightistSchema[] = [];
  rightist1958List: RightistSchema[] = [];
  rightist1959List: RightistSchema[] = [];

  rightistYearData: FilterData[] = [];
  genderData: FilterData[] = [];

  constructor(private archiveAPI: ArchieveApiService,     private translate: TranslateService,) {}

  ngOnInit(): void {
    // this.translate.onLangChange.subscribe( async (event) => {
    //   this.maleRightistList = []
    //   this.femaleRightistList = [];
    //   const unknown = (await firstValueFrom(this.archiveAPI.getGenderList(event.lang, 'unknown')));
    //   // const male = (await lastValueFrom(this.archiveAPI.getGenderList(event.lang, 'male')));
    //   // const female = (await lastValueFrom(this.archiveAPI.getGenderList(event.lang, 'female')));

    //   console.log(unknown);
    //   console.log(male)
    //   console.log(female)

    //   // console.log(v);
    //   // console.log(v);
    //   console.log(event);
    // });
    this.rightistSubscription = this.archiveAPI
      .getArchiveList()
      .subscribe(async (data: any) => {
        this.total = data.length;
        this.maleRightistList = data.filter((x) => x.gender == 'male');
        this.femaleRightistList = data.filter((x) => x.gender == 'female');
        this.rightist1957List = data.filter((x) => x.rightistYear == 1957);
        this.rightist1958List = data.filter((x) => x.rightistYear == 1958);
        this.rightist1959List = data.filter((x) => x.rightistYear == 1959);

        this.rightistYearData = [
          { filter: '1957', count: this.rightist1957List.length },
          { filter: '1958', count: this.rightist1958List.length },
          { filter: '1959', count: this.rightist1959List.length },
          {
            filter: 'unknown',
            count:
              this.total! -
              this.rightist1957List.length -
              this.rightist1958List.length -
              this.rightist1959List.length,
          },
        ];

        this.genderData = [
          { filter: 'male', count: this.maleRightistList.length },
          { filter: 'female', count: this.femaleRightistList.length },
          {
            filter: 'unknown',
            count:
              this.total! -
              this.maleRightistList.length -
              this.femaleRightistList.length,
          },
        ];
        this.bindChart();
      });
  }

  bindChart() {
    const chartId = document.getElementById('chart');
    const chartElement = document.getElementById('chartElement');
    if (chartId) {
      chartId.remove();
    }
    if (chartElement) {
      const newChart = document.createElement('div');
      newChart.setAttribute('id', 'chart');
      chartElement.appendChild(newChart);
    }
    let datatest = [
      {
        name: 'Female',
        value: ((this.femaleRightistList.length / this.total!) * 100).toFixed(
          2
        ),
        color: '#a76724',
      },

      {
        name: 'Male',
        value: ((this.maleRightistList.length / this.total!) * 100).toFixed(2),
        color: 'gray',
      },

      {
        name: 'Unknown',
        value: (
          ((this.total! -
            this.maleRightistList.length -
            this.femaleRightistList.length) /
            this.total!) *
          100
        ).toFixed(2),
        color: '#df4008',
      },
    ];
    var width = 300,
      height = 300;

    var outerRadius = width / 2;
    var innerRadius = 100;
    var pie1 = d3
      .pie()
      .value((d: any) => {
        return d.value;
      })
      .sort(null);

    let arc: Arc<any, DefaultArcObject> = d3
      .arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius)
      .cornerRadius(3)
      .padAngle(0.015);

    var outerArc = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);

    var svg: any = d3
      .select('#chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + (width )/ 2 + ',' + height / 2 + ')');

    svg.append('g').attr('class', 'slices');
    svg.append('g').attr('class', 'labelName');
    svg.append('g').attr('class', 'lines');

    var path = svg
      .selectAll('path')
      .data(pie1(datatest as any))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => {
        return d.data.color;
      });

    path
      .transition()
      .duration(1000)
      .attrTween('d', (d) => {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(interpolate(t));
      });

    var restOfTheData = () => {
      var text = svg
        .selectAll('text')
        .data(pie1(datatest as any))
        .enter()
        .append('text')
        .transition()
        .duration(200)
        .attr('transform', (d) => {
          return 'translate(' + arc.centroid(d) + ')';
        })
        .attr('dy', '.4em')
        .attr('text-anchor', 'middle')
        .text(function (d) {
          return d.data.value + '%';
        })
        .style('fill', 'black')
        .style('font-size', '1rem');

      var legendRectSize = 20;
      var legendSpacing = 7;
      var legendHeight = legendRectSize + legendSpacing;

      var legend = svg
        .selectAll('.legend')
        .data(datatest)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => {
          //Just a calculation for x & y position
          return 'translate(-78,' + (i * legendHeight - 55) + ')';
        });
      legend
        .append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .attr('rx', 20)
        .attr('ry', 20)
        .style('fill', (d) => {
          return d.color;
        })
        .style('stroke', (d) => {
          return d.color;
        });

      legend
        .append('text')
        .attr('x', 30)
        .attr('y', 15)
        .text((d) => {
          return d.name + ' ' + d.value + '%';
        })
        .style('fill', (d) => {
          return d.color;
        })
        .style('font-size', '15px');
    };
    const chartNewId = document.getElementById('chart');
    if (chartNewId) {
      const svg = chartNewId.getElementsByTagName('svg')?.item(0);
      if (svg) {
        svg.setAttribute(
          'class',
          'shadow rounded-circle border border-opacity-25 border-success bg-info bg-opacity-10 pl-5'
        );
      }
    }
    setTimeout(restOfTheData, 1000);
  }

  ngOnDestroy() {
    this.rightistSubscription?.unsubscribe();
  }
}
