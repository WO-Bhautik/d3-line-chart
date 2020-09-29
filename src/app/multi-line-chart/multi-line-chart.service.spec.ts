import { TestBed } from '@angular/core/testing';

import { MultiLineChartService } from './multi-line-chart.service';

describe('MultiLineChartService', () => {
  let service: MultiLineChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultiLineChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
