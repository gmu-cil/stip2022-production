import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @ViewChild('chart')
  chartElement?: ElementRef;

  @Input() total?: number;
  @Input() data?: any;
  @Input() type?: string;
  @Input() id?: string;

  private svg;
  private colors;
  private margin = 50;
  private width = 750 - this.margin * 2;
  private height = 600 - this.margin * 2;
  private radius = Math.min(this.width, this.height) / 2 - this.margin * 2;

  constructor() {}

  ngOnInit() {}

  ngAfterContentInit() {
    if (this.type == 'bar') {
      this.createBarChartSvg();
      this.drawBars();
    }

    if (this.type == 'pie') {
      this.createPieChartSvg();
      this.createColors();
      this.drawPie();
    }
  }

  createBarChartSvg(): void {
    this.svg = d3
      .select(`#${this.id}`)
      .append('svg')
      .attr('width', this.width + this.margin * 2)
      .attr('height', this.height + this.margin * 2)
      .append('g')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');
  }

  private createPieChartSvg(): void {
    this.svg = d3
      .select(`#${this.id}`)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
      );
  }

  private drawBars(data = this.data): void {
    // Create the X-axis band scale
    const x = d3
      .scaleBand()
      .range([0, this.width])
      .domain(data.map((d) => d.filter))
      .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '1rem')
      .style('text-anchor', 'center');

    // Create the Y-axis band scale
    const y = d3
      .scaleLinear()
      .domain([0, Math.max(...data.map((o) => o.count))])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append('g').call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.filter))
      .attr('y', (d) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d) => this.height - y(d.count))
      .attr('fill', '#09363C');

    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', (d) => x(d.filter)! + x.bandwidth() / 2)
      .attr('y', (d) => y(d.count) - 10)
      .text(function (d) {
        return d.count;
      });
  }

  private createColors(data = this.data): void {
    this.colors = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.count.toString()))
      .range(['#0096FF', '#FF69B4', '#9370DB']);
  }

  private drawPie(data = this.data, total = this.total) {
    const pie = d3.pie<any>().value((d: any) => d.count);

    // Build pie chart
    this.svg
      .selectAll('pieces')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', d3.arc().innerRadius(0).outerRadius(this.radius))
      .attr('fill', (d, i) => this.colors(i))
      .attr('stroke', '#121926')
      .style('stroke-width', '1px');

    // Add labels
    const labelLocation = d3.arc().innerRadius(100).outerRadius(this.radius);

    this.svg
      .selectAll('pieces')
      .data(pie(data))
      .enter()
      .append('text')
      .text(function (d) {
        let percentage = (d.data.count / total!) * 100;
        return '' + d.data.filter + ': ' + percentage.toFixed(2) + '%';
      })
      .attr('transform', function (d) {
        let c = labelLocation.centroid(d);
        return 'translate(' + c[0] * 2.0 + ', ' + c[1] * 1.4 + ')';
      })
      .style('text-anchor', 'middle')
      .style('font-size', 20);
  }
}
