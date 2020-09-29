import { Component, ElementRef, HostListener, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { MultiLineChartService } from './multi-line-chart.service';
import { faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-multi-line-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './multi-line-chart.component.html',
  styleUrls: ['./multi-line-chart.component.scss'],
})

export class MultiLineChartComponent implements OnInit {
  @Input() lineChartData: any;
  @ViewChild('container', { static: false })
  container: ElementRef;
  barIcon = faBars;

  chartData: any;
  tableData: any;
  tableColumns = [];
  months = [];
  newValue;

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};

  constructor(private chartService: MultiLineChartService) { }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.chartService.onResize();
  }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      maxHeight: 172
    };

    this.getChartData();
  }

  onItemSelect(item: any) {
    this.filterSelectedData(this.selectedItems);
  }

  onSelectAll(items: any) {
    this.filterSelectedData(items);
  }

  onDeSelectAll(items: any) {
    this.filterSelectedData(items);
  }

  onDeSelect(item: any) {
    this.filterSelectedData(this.selectedItems);
  }

  getChartData() {
    d3.json('../assets/chart-data.json').then((data) => {
      this.generateChartData(data);
      this.setSelectionData(data);
    });
  }

  generateChartData(data: any) {
    const monthName = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    this.tableColumns = Object.keys(data[0]);

    this.tableColumns.forEach((column) => {
      if (monthName.indexOf(column) !== -1) {
        this.months.push(column);
      }
    });

    const series = [];
    const chartData = { series: [], months: [] };

    data.forEach((d, i) => {
      const values = [];
      this.months.forEach((month) => {
        values.push(d[month]);
      });
      const obj = { name: d['Name'], values: values, color: d3.hsl(Math.random() * 360, 0.40, 0.40) };
      series.push(obj);
    });

    chartData.series = series;
    chartData.months = this.months;

    this.chartData = chartData;
    this.chartService.init(this.chartData, this.container);
  }

  setSelectionData(data: any) {
    const dropdownList = [];
    const selectedItems = [];

    data.forEach((d, i) => {
      dropdownList.push({ id: i, text: d['Name'] });
      selectedItems.push({ id: i, text: d['Name'] });
    });

    this.dropdownList = dropdownList;
    this.selectedItems = selectedItems;

    this.filterSelectedData(selectedItems);
  }

  filterSelectedData(selectedItem) {
    const selectedItemsName = [];
    selectedItem.forEach(item => {
      selectedItemsName.push(item.text);
    });

    const filteredData = this.chartData.series.filter((data) => {
      return (selectedItemsName.indexOf(data.name) !== -1);
    });

    this.tableData = filteredData;

    const chartData = { series: filteredData, months: this.months };

    this.chartService.updateChart(chartData);
  }

  onInputChange(value, name, index) {
    this.chartData.series.forEach(data => {
      if (data.name === name) {
        data.values[index] = value;
      }
    });

    this.chartService.updateChart(this.chartData);
  }

  onTableRowHover(data) {
    this.chartService.onTableRowHover(data);
  }

  onTableRowOut() {
    this.chartService.onTableRowOut();
  }
}
