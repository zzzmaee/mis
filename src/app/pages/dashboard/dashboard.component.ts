import {Component, OnDestroy} from "@angular/core";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzCardComponent} from "ng-zorro-antd/card";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzGridModule} from "ng-zorro-antd/grid";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {NzFlexModule} from "ng-zorro-antd/flex";
import {NzProgressModule} from "ng-zorro-antd/progress";
import {NzToolTipModule} from "ng-zorro-antd/tooltip";
import {Router} from "@angular/router";
import {NgApexchartsModule, ChartType} from "ng-apexcharts";
import {NzDropDownModule} from "ng-zorro-antd/dropdown";
import {getMonthRange} from '../../shared/utils/month-rage';
import {DashboardService} from "./dashboard.service";
import {NzIconModule} from "ng-zorro-antd/icon";
import {Subscription} from "rxjs";

@Component({
    selector: "app-dashboard",
    standalone: true,
    imports: [
        NzCardModule,
        NzColDirective,
        NzRowDirective,
        NzCardComponent,
        NzGridModule,
        TranslatePipe,
        NzFlexModule,
        NzProgressModule,
        NzToolTipModule,
        NgApexchartsModule,
        NzDropDownModule,
        NzIconModule,
    ],
    templateUrl: "./dashboard.component.html",
    styleUrl: "./dashboard.component.less",
})
export class DashboardComponent implements OnDestroy {
    chartType: ChartType = "donut";

    loading: Boolean = true;
    topOrgs: any = [];
    totalExamsDwmy: any = [];
    filterMonth: any = "12";
    filterOrgs: any = "1";
    labelsName: any[] = [];
    chartData: any = {};
    chartTotal: number = 0;
    private langChangeSubscription?: Subscription;

    selectFilter(number: any) {
        this.filterMonth = number;
        this.searchFails();
    }

    selectFilterOrgs(number: any) {
        this.filterOrgs = number;
        this.searchOrgs();
    }

    constructor(
        private dashboardService: DashboardService,
        private translateService: TranslateService,
        private router: Router,
    ) {
        dashboardService.search({}, "total-exams-dwmy").subscribe({
            next: (data: any) => {
                this.totalExamsDwmy = data;
            },
        });
        this.searchFails();
        this.searchOrgs();

        // Подписка на изменение языка
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.updateChartLabels();
        });
    }

    ngOnDestroy() {
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
    }

    searchOrgs() {
        this.dashboardService
            .search(getMonthRange(this.filterOrgs), "top-fail-orgs")
            .subscribe({
                next: (data: any) => {
                    this.topOrgs = data;
                },
            });
    }

    searchFails() {
        this.dashboardService
            .search(getMonthRange(this.filterMonth), "top-exam-fail-reasons")
            .subscribe({
                next: (data: any) => {
                    let series: any = [];
                    let total = 0;
                    let item: any = {};

                    data.forEach((i: any) => {
                        for (const j in i) {
                            if (j != "month" && i[j] != 0) {
                                total += i[j];
                            }
                            if (!item[j]) {
                                item[j] = i[j];
                            } else {
                                item[j] += i[j];
                            }
                        }
                    });

                    // Сохраняем данные для пересчета labels при смене языка
                    this.chartData = item;
                    this.chartTotal = total;
                    this.labelsName = [];

                    for (const i in item) {
                        if (i != "month" && item[i] != 0) {
                            series.push(item[i]);
                            this.labelsName.push(i);
                        }
                    }

                    this.chartOptions.series = series;
                    this.updateChartLabels();
                    this.loading = false;
                },
            });
    }

    updateChartLabels() {
        if (!this.chartData || Object.keys(this.chartData).length === 0) {
            return;
        }

        let labels: any = [];
        for (const i in this.chartData) {
            if (i != "month" && this.chartData[i] != 0) {
                labels.push(
                    Math.round((this.chartData[i] / this.chartTotal) * 100) +
                    "%  " +
                    this.translateService.instant("DASHBOARD.CHARTS." + i.toUpperCase()),
                );
            }
        }

        this.chartOptions.labels = labels;
    }

    chartOptions: any = {
        plotOptions: {
            pie: {
                expandOnClick: false,
            },
        },
        series: [],
        chart: {
            type: this.chartType,
            height: 340,

            events: {
                click: (e: any) => this.navigateTo(e, this.router, this.labelsName),
            },
        },
        dataLabels: {enabled: false},
        labels: [],
        colors: ["#56CCF2", "#6FCF97", "#F2994A", "#BB6BD9B2", "#FFE500"],

        legend: {},

        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 150,
                    },
                },
            },
        ],
    };

    navigateTo(event: any, router: Router, labelsName: string[]) {
        if (event.target.classList.contains("apexcharts-legend-text")) {
            router.navigate([
                "/dashboard/list",
                {
                    month: this.filterMonth,
                    fails: labelsName[event.target.getAttribute("i")],
                },
            ]);
            // this.router.navigate([
            //   "list?reason=" + this.labelsName[event.target.getAttribute("i")],
            // ]);
        }
    }

    data: any = {};
}
