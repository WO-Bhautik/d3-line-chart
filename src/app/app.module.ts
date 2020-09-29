import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MultiLineChartComponent } from './multi-line-chart/multi-line-chart.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent, MultiLineChartComponent],
  imports: [BrowserModule, AppRoutingModule, NgMultiSelectDropDownModule.forRoot(), FontAwesomeModule, FormsModule, NoopAnimationsModule, NgbModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
