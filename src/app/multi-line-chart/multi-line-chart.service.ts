import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import * as d3Array from 'd3-array';

@Injectable({
  providedIn: 'root',
})
export class MultiLineChartService {
  container;
  chartData;

  SVG: any;
  svgGroup: any;
  circleGroup: any;
  x: any;
  y: any;
  xAxis: any;
  yAxis: any;
  path: any;
  line: any;

  margin = { top: 20, right: 40, bottom: 30, left: 35 };

  width: number;
  height: number;
  xInvert;
  tooltipDiv;
  mouseG;
  lineCirclesGroup: any;
  lineCircles: any;

  constructor() { }

  generateChartData(data) {
    data.series.forEach((d) => {
      d.values.forEach((i, index) => {
        d.values[index] = +i;
      });
    });

    this.chartData = data;
  }

  init(data, container) {
    this.generateChartData(data);
    this.container = container.nativeElement;

    this.width =
      this.container.clientWidth - this.margin.left - this.margin.right;
    this.height =
      this.container.clientHeight - this.margin.top - this.margin.bottom;

    this.SVG = d3
      .select(container.nativeElement)
      .append('svg')
      .attr('class', 'multi-line-chart')
      .attr('width', this.container.clientWidth)
      .attr('height', this.container.clientHeight);

    this.svgGroup = this.SVG.append('g')
      .attr('class', 'mainGroup')
      .attr('transform', 'translate(' + 0 + ', ' + 0 + ')');

    this.xAxis = this.svgGroup
      .append('g')
      .attr('class', 'axis xAxis')
      .attr('transform', `translate(${this.margin.right}, ${this.height})`);

    this.yAxis = this.svgGroup
      .append('g')
      .attr('class', 'axis yAxis')
      .attr(
        'transform',
        `translate(${this.margin.right}, ${this.margin.bottom})`
      );

    this.path = this.svgGroup
      .append('g')
      .attr('class', 'pathGroup')
      .attr(
        'transform',
        `translate(${this.margin.right}, ${this.margin.bottom})`
      );

    this.circleGroup = this.svgGroup
      .append('g')
      .attr('class', 'circleGroup');

    this.circleGroup
      .append('circle')
      .attr('r', 6.5)
      .attr('fill', 'steelblue')
      .attr('stroke', '#191919')
      .attr('stroke-width', 2)
      .style('display', 'none');

    this.lineCirclesGroup = this.svgGroup
      .append('g')
      .attr('class', 'lineCirclesGroup');

    this.tooltipDiv = d3.select('body').append('div')
      .attr('id', 'tooltip')
      .attr('class', 'tooltipDiv')
      .style('position', 'absolute')
      .style('background-color', '#fff')
      .style('padding', 6)
      .style('display', 'none');

    this.tooltipDiv.append('span').attr('class', 'title').attr('align', 'center');

    this.renderChart();
  }

  renderChart() {
    this.x = d3
      .scalePoint()
      .domain(this.chartData.months.map((d) => d))
      .range([0, this.width]);

    const values = this.chartData.series.map((e) => {
      return d3.max(e.values);
    });

    this.y = d3
      .scaleLinear()
      .domain([1, d3.max(values)])
      .nice()
      .range([this.height - this.margin.bottom, 0]);

    this.xAxis
      .transition()
      .duration(500)
      .call(d3.axisBottom(this.x).tickSizeOuter(0));

    this.yAxis
      .transition()
      .duration(500)
      .call(d3.axisLeft(this.y).ticks(this.height / 80, '.0s'));

    this.xAxis.selectAll('.tick').selectAll('line').attr('y1', - (this.height - this.margin.bottom));

    this.line = d3
      .line()
      .defined((d) => !isNaN(d))
      .x((d, i) => this.x(this.chartData.months[i]))
      .y((d) => this.y(d))
      .curve(d3.curveBasis);

    const path = this.path
      .selectAll('path')
      .data(this.chartData.series, (d) => {
        return d.name;
      });

    path
      .enter()
      .append('path')
      .attr('id', d => d.name)
      .attr('class', 'line')
      .transition()
      .duration(500)
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('r', 3)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', (d) => this.line(d.values));

    path.exit().remove();

    this.renderTooltipField();

    const self = this;

    const lines = document.getElementsByClassName('line');

    this.mouseG = this.SVG.append('g')
      .attr('class', 'mouse-over-effects');

    this.mouseG.append('path')
      .attr('class', 'mouse-line')
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', '0')
      .attr('transform', `translate(${this.margin.right}, ${this.margin.bottom})`);

    this.renderTooltipLine();

    this.mouseG.append('rect')
      .attr('width', this.width)
      .attr('height', this.height - this.margin.bottom)
      .attr('transform', `translate(${this.margin.right}, ${this.margin.bottom})`)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function () {
        d3.select('.mouse-line')
          .style('opacity', '0');
        d3.selectAll('.mouse-per-line circle')
          .style('opacity', '0');
        d3.selectAll('.mouse-per-line text')
          .style('opacity', '0');
        d3.select('.tooltipDiv')
          .style('display', 'none');
      })
      .on('mouseover', function () {
        d3.select('.mouse-line')
          .style('opacity', '1');
        d3.selectAll('.mouse-per-line circle')
          .style('opacity', '1');
        d3.selectAll('.mouse-per-line text')
          .style('opacity', '1');
      })
      .on('mousemove', function () {
        const xPos = d3.mouse(this)[0];
        const xDomain = self.x.domain();
        const xRange = self.x.range();
        const xRangePoints = d3.range(xRange[0], xRange[1], self.x.step());
        self.xInvert = xDomain[d3.bisect(xRangePoints, xPos) - 1];

        const mouse = d3.mouse(this);
        d3.select('.mouse-line')
          .attr('d', function () {
            let d = 'M' + mouse[0] + ',' + (self.height - self.margin.bottom);
            d += ' ' + mouse[0] + ',' + 0;
            return d;
          });

        d3.selectAll('.mouse-per-line')
          .attr('transform', function (d, i) {
            const xDate = self.xInvert;
            const bisect = d3.bisector(function (d) { return d.name; }).right;
            const idx = bisect(d.values, xDate);

            let beginning = 0;
            let end = d3.select(lines[i]).node().getTotalLength();
            let target = null;
            let pos;

            while (true) {
              target = Math.floor((beginning + end) / 2);
              pos = d3.select(lines[i]).node().getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                break;
              }
              if (pos.x > mouse[0]) { end = target; }
              else if (pos.x < mouse[0]) { beginning = target; }
              else break;
            }

            const index = self.chartData.months.indexOf(self.xInvert);
            d3.select('.tooltipDiv').select('.title').text(self.xInvert);

            const newName = d.name.split(/\s/).join('');
            const ele = d3.select(document.getElementById(newName));
            ele.select('.name').text(d.name);
            ele.select('.value').text(self.y.invert(pos.y).toFixed(2));

            // document.getElementById(newName).innerHTML = '<span class="name">' + d.name + '</span>'
            //   + '<span class="value">' + self.y.invert(pos.y).toFixed(2) + '</span>';

            self.tooltipDiv
              .style('display', 'block')
              .style('left', (d3.event.pageX + 50) + 'px')
              .style('top', (d3.event.pageY - 34) + 'px');

            self.tooltipDiv
              .selectAll('div')
              .sort((a, b) => b.values[index + 1] - a.values[index + 1]);

            return 'translate(' + mouse[0] + ',' + pos.y + ')';
          });
      });
  }

  renderTooltipLine() {
    const self = this;
    const mousePerLine = this.mouseG.selectAll('.mouse-per-line')
      .data(this.chartData.series);

    mousePerLine
      .enter()
      .append('g')
      .attr('class', 'mouse-per-line')
      .attr('transform', `translate(${this.margin.right}, ${this.margin.bottom})`)
      .each(function () {
        d3.select(this).append('circle')
          .attr('r', 7)
          .style('stroke', function (d) {
            return d.color;
          })
          .style('fill', 'white')
          .style('stroke-width', '2px')
          .style('opacity', '0')
          .attr('transform', `translate(${self.margin.right}, ${self.margin.bottom})`);
      });

    mousePerLine
      .attr('class', 'mouse-per-line')
      .attr('transform', `translate(${this.margin.right}, ${this.margin.bottom})`)
      .each(function () {
        d3.select(this).select('circle')
          .attr('r', 7)
          .style('stroke', function (d) {
            return d.color;
          })
          .style('fill', 'white')
          .style('stroke-width', '2px')
          .style('opacity', '0')
          .attr('transform', `translate(${self.margin.right}, ${self.margin.bottom})`);
      });

    mousePerLine.exit().remove();
  }

  renderTooltipField() {
    const tooltipField = this.tooltipDiv.selectAll('.tooltipField').data(this.chartData.series);

    tooltipField
      .enter()
      .append('div')
      .attr('id', d => {
        return d.name.split(/\s/).join('');
      })
      .attr('class', d => {
        const newName = d.name.split(/\s/).join('');
        return `tooltipField ${newName}`;
      })
      .style('color', d => d.color)
      .each(function () {
        d3.select(this).append('span')
          .attr('class', 'name');
        d3.select(this).append('span')
          .attr('class', 'value');
      });

    // d3.selectAll('.tooltipField')
    //   .append('span')
    //   .attr('class', 'name');

    // d3.selectAll('.tooltipField')
    //   .append('span')
    //   .attr('class', 'value');

    tooltipField
      .attr('id', d => {
        return d.name.split(/\s/).join('');
      })
      .attr('class', d => {
        const newName = d.name.split(/\s/).join('');
        return `tooltipField ${newName}`;
      })
      .style('color', d => d.color);

    tooltipField.exit().remove();
  }

  updateChart(data) {
    this.generateChartData(data);

    this.x.domain(this.chartData.months.map((d) => d));

    const values = this.chartData.series.map((e) => {
      return d3.max(e.values);
    });

    this.y.domain([1, d3.max(values)]);

    this.xAxis
      .transition()
      .duration(500)
      .call(d3.axisBottom(this.x).tickSizeOuter(0));

    this.xAxis.selectAll('.tick').selectAll('line').attr('y1', - (this.height - this.margin.bottom));

    this.yAxis
      .transition()
      .duration(500)
      .call(d3.axisLeft(this.y).ticks(this.height / 80, '.0s'));

    this.line = d3
      .line()
      .defined((d) => !isNaN(d))
      .x((d, i) => this.x(this.chartData.months[i]))
      .y((d) => this.y(d))
      .curve(d3.curveBasis);

    const path = this.path
      .selectAll('path')
      .data(this.chartData.series, (d) => {
        return d.name;
      });

    path
      .enter()
      .append('path')
      .attr('id', d => d.name)
      .attr('class', 'line')
      .transition()
      .duration(500)
      .attr('fill', 'none')
      .attr('r', 3)
      .attr('stroke-width', 2)
      .attr('stroke', (d) => d.color)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', (d) => this.line(d.values));

    path
      .attr('id', d => d.name)
      .attr('class', 'line')
      .transition()
      .duration(500)
      .attr('fill', 'none')
      .attr('r', 3)
      .attr('stroke-width', 2)
      .attr('stroke', (d) => d.color)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', (d) => this.line(d.values));

    path.exit().remove();

    this.renderTooltipLine();
    this.renderTooltipField();

  }

  onResize() {
    this.width =
      this.container.clientWidth - this.margin.left - this.margin.right;
    this.height =
      this.container.clientHeight - this.margin.top - this.margin.bottom;

    this.SVG
      .attr('width', this.container.clientWidth)
      .attr('height', this.container.clientHeight);

    this.x.range([0, this.width]);

    this.y
      .nice()
      .range([this.height - this.margin.bottom, 0]);

    this.xAxis
      .transition()
      .duration(500)
      .call(d3.axisBottom(this.x).tickSizeOuter(0));

    this.xAxis.selectAll('.tick').selectAll('line').attr('y1', - (this.height - this.margin.bottom));

    this.yAxis
      .transition()
      .duration(500)
      .call(d3.axisLeft(this.y).ticks(this.height / 80, '.0s'));

    this.line = d3
      .line()
      .defined((d) => !isNaN(d))
      .x((d, i) => this.x(this.chartData.months[i]))
      .y((d) => this.y(d))
      .curve(d3.curveBasis);

    this.path
      .selectAll('path')
      .attr('class', 'line')
      .transition()
      .duration(500)
      .attr('fill', 'none')
      .attr('r', 3)
      .attr('stroke-width', 2)
      .attr('stroke', (d) => d.color)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', (d) => this.line(d.values));

    this.mouseG
      .select('rect')
      .attr('width', this.width)
      .attr('height', this.height - this.margin.bottom);
  }

  onTableRowHover(data: any) {
    console.log(d3.select('.pathGroup').selectAll('path'));
    const pathSelection = d3.select('.pathGroup').selectAll('path');
    // pathSelection.each();
    d3.select('.pathGroup').selectAll('path')
      .attr('stroke-opacity', d => d.name === data.name ? '1' : '0.2')
      .attr('stroke-width', d => d.name === data.name ? '4' : '2');

    // this.path.each(console.log(this));
  }

  onTableRowOut() {
    d3.select('.pathGroup').selectAll('path').attr('stroke-opacity', '1').attr('stroke-width', '2');
  }
}
