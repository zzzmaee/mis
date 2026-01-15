import { Component } from "@angular/core";
import { NzTableModule } from "ng-zorro-antd/table";

import { NzDividerModule } from "ng-zorro-antd/divider";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { FormsModule } from "@angular/forms";
import { NzImageModule } from "ng-zorro-antd/image";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzFlexModule } from "ng-zorro-antd/flex";

import { NzCardModule } from "ng-zorro-antd/card";
import { NzGridModule } from "ng-zorro-antd/grid";

import { NzButtonModule } from "ng-zorro-antd/button";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzSkeletonModule } from "ng-zorro-antd/skeleton";
import { NzSelectModule } from "ng-zorro-antd/select";

import {
  TranslateService,
  TranslatePipe,
} from "@ngx-translate/core";
import { format, subMonths, startOfMonth } from "date-fns";
import {Examination} from '../asmo/examinations.models';
import {AsmoService} from '../asmo/asmo.service';
import {ActivatedRoute, Params, Router} from '@angular/router';

@Component({
  selector: "app-list",
  standalone: true,
  imports: [
    NzTableModule,
    NzModalModule,
    NzDividerModule,
    NzGridModule,
    NzTableModule,
    NzCheckboxModule,
    FormsModule,
    NzImageModule,
    NzIconModule,
    NzButtonModule,
    NzSkeletonModule,
    NzCardModule,
    NzInputModule,
    FormsModule,
    NzFlexModule,
    NzAvatarModule,
    TranslatePipe,
    NzSelectModule,
  ],

  templateUrl: "./list.component.html",
  styleUrl: "./list.component.less",
})
export class ListComponent {
  listOfData: Examination[] = [];
  isModalVisible: boolean = false;
  tableLoading: boolean = true;
  activeFilter: string = "";
  constructor(
    private asmoService: AsmoService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.search(params);
    });
  }

  params = {
    page: 1,
    size: 10,
    term: "",
    fails: "",
    from: "",
    to: "",
  };
  total: number = 0;
  pageSize: number = 10;
  pageIndex: number = 1;
  fails: string = "";
  month: number = 1;

  isFilterVisible: boolean = false;

  search(params: any = {}) {
    if (params.fails) {
      this.fails = params.fails;
      if (this.fails == "pressure") {
        this.fails = "sis,dia";
      }
    }
    if (params.month) {
      this.month = params.month;
    }
    if (params.pageIndex) {
      this.pageIndex = params.pageIndex;
    }
    if (params.pageSize) {
      this.pageSize = params.pageSize;
    }
    this.tableLoading = true;
    this.params = {
      ...this.params,
      page: this.pageIndex,
      size: this.pageSize,
      fails: this.fails,
      from: format(
        subMonths(startOfMonth(new Date()), this.month - 1),
        "yyyy-MM-dd HH:mm:ss",
      ),
      to: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    };
    console.log(this.params);
    if (params.term) {
      this.params.term = params.term;
    }
    this.asmoService.search(this.params).subscribe({
      next: (data) => {
        this.pageSize = data.size;
        this.pageIndex = data.number + 1;
        this.tableLoading = false;
        this.total = data.totalElements;
        this.listOfData = [...data.content.map((c) => new Examination(c))];
      },
      error: (err) => {
        this.tableLoading = false;
      },
    });
  }
  getResult(data: any) {
    let result = data.filter((obj: any) => {
      if (this.fails == "sis,dia") {
        return obj.criteria == "sis" || obj.criteria == "dia";
      }
      return obj.criteria == this.fails;
    });

    console.log(result);
    return result.map((x: any) => x.result).join("/") || "--";
  }
  selectChange(event: any) {
    this.search();
  }
}
