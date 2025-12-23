import { Component } from '@angular/core';
import {SupersetDashboardComponent} from '../../shared/superset-dashboard/superset-dashboard.component';

@Component({
  selector: 'app-reports',
  imports: [
    SupersetDashboardComponent
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.less'
})
export class ReportsComponent {

}
