import { Component, Input, EventEmitter, Output } from "@angular/core";
import { NzModalModule } from "ng-zorro-antd/modal";
import {
  TranslateService,
  TranslatePipe,
} from "@ngx-translate/core";
import { format } from "date-fns";
import { NzFlexModule } from "ng-zorro-antd/flex";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzGridModule } from "ng-zorro-antd/grid";

import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { FormsModule } from "@angular/forms";
import { NzButtonModule } from "ng-zorro-antd/button";
import {FilterService} from './filter.service';

// const statusOptions: Status[] = [
//   Status.Success,
//   Status.Fail,
//   Status.Retake,
//   Status.Canceled,
// ];
// const failOptions: FailReason[] = [
//   FailReason.Alco,
//   FailReason.HighPressure,
//   FailReason.LowPressure,
//   FailReason.Temperature,
//   FailReason.Complaints,
//   FailReason.Pupillometer,
//   FailReason.HighPulse,
//   FailReason.LowPulse,
// ];
@Component({
  selector: "app-filter",
  standalone: true,
  imports: [
    NzButtonModule,
    TranslatePipe,
    NzSelectModule,
    NzModalModule,
    NzDatePickerModule,
    NzFlexModule,
    NzGridModule,
    NzCheckboxModule,
    FormsModule,
  ],
  templateUrl: "./filter.component.html",
  styleUrl: "./filter.component.less",
})
export class FilterComponent {
  @Output() dataEvent = new EventEmitter<{ visible: boolean; params: any }>();
  @Input() visible: boolean = true;
  @Input() params: any = {};
  organizations: any[] = [];
  diagnosis: any[] = [];
  loading: boolean = false;
  date: any = null;
  fail: string = "";

  organizationsId: any[] = [];
  diagnosisId: any[] = [];
  status: string = "";
  reason: any[] = [];

  constructor(
    private translate: TranslateService,
    private filterService: FilterService,
  ) {}

  handleSubmit(): void {
    console.log(this.reason);
    if (this.organizationsId.length > 0) {
      this.params.organizationId = this.organizationsId.join(",");
    }
    if (this.diagnosisId.length > 0) {
      this.params.positionId = this.diagnosisId.join(",");
    }
    if (this.status) {
      this.params.status = this.status;
    }
    if (this.date) {
      this.params.from = format(this.date[0], "yyyy-MM-dd HH:mm:ss");
      this.params.to = format(this.date[1], "yyyy-MM-dd HH:mm:ss");
    }
    if (this.fail) {
      this.params.fails = this.fail;
    }
    this.dataEvent.emit({ visible: false, params: this.params });
  }
  handleReset(): void {
    this.params = {};
    this.organizationsId = [];
    this.diagnosisId = [];
    this.status = "";
    this.reason = [];
    this.date = [];

    this.dataEvent.emit({ visible: false, params: {} });
  }
  handleCancel(): void {
    this.dataEvent.emit({ visible: false, params: {} });
  }
  statusCheck(event: string[]) {
    this.status = event.join(",");
    console.log(event, this.status);
  }
  handleDateChange(event: any) {
    console.log(event);
  }
  failCheck(event: any) {
    this.fail = event.join(",");
    console.log(event);
  }
  organizationSearch(value: any) {
    this.loading = true;
    this.filterService.searchOrganization(value).subscribe({
      next: (data) => {
        this.organizations = data.content;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }
  diagnosisSearch(value: any) {
    this.loading = true;
    this.filterService.searchDictionary("employee_positions", {}).subscribe({
      next: (data) => {
        this.diagnosis = data.content;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }
}
