import { Component, Input, EventEmitter, Output } from "@angular/core";
import { NzModalModule } from "ng-zorro-antd/modal";
import {
  TranslateService,
  TranslatePipe,
} from "@ngx-translate/core";
import { format } from "date-fns";
import { ProfileInfoComponent } from "../profile-info/profile-info.component";
import { NzFlexModule } from "ng-zorro-antd/flex";

import { NzGridModule } from "ng-zorro-antd/grid";
import { NzButtonModule } from "ng-zorro-antd/button";
import {StatusComponent} from '../status/status.component';
import {ExaminationResult} from '../examinations.models';

@Component({
  selector: "app-modal",
  standalone: true,
  imports: [
    NzModalModule,
    TranslatePipe,
    StatusComponent,
    NzFlexModule,
    NzGridModule,
    ProfileInfoComponent,
    NzButtonModule,
  ],
  templateUrl: "./modal.component.html",
  styleUrl: "./modal.component.less",
})
export class ModalComponent {
  @Input() selected: any;
  @Output() dataEvent = new EventEmitter<boolean>();
  visible: boolean = false;

  constructor(private translate: TranslateService) {
    this.visible = true;
  }
  getSelectedResult(data: string) {
    const item: any = this?.selected?.results?.find(
      (item: ExaminationResult) => item.criteria === data,
    );
    if (
      data === "temperature" ||
      data === "pressure" ||
      data === "alco" ||
      data === "pulse"
    ) {
      return item?.result || "--";
    } else {
      return item
        ? item[this.translate.instant("asmo.pmo.selectedResult")]
        : "--";
    }
  }
  getSelectedCreatedAt() {
    if (this.selected?.createdAt) {
      return format(this.selected.createdAt, "dd LLLL. yyyy, HH:mm");
    }
    return "--";
  }

  handleOk(): void {
    this.dataEvent.emit(false);
  }
  handleCancel(): void {
    this.dataEvent.emit(false);
  }
  ngOnChanges(changes: any): void {
    // console.log("value changed", changes);
  }
}
