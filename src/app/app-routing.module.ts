import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MultiLineChartComponent } from './multi-line-chart/multi-line-chart.component';

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    {
        path: 'dashboard', component: MultiLineChartComponent,
    }

];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
