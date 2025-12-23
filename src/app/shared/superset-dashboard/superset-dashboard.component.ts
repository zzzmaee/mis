import { Component, OnInit, inject, Input } from '@angular/core';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import {SupersetEmbedService, SupersetResource, SupersetRls} from '../services/superset-embed.service';

@Component({
  selector: 'app-superset-dashboard',
  templateUrl: './superset-dashboard.component.html',
  styleUrls: ['./superset-dashboard.component.less'],
  standalone: true,
})
export class SupersetDashboardComponent implements OnInit {
  @Input() public dashboardId!: string;
  @Input() public rlsValues?: string[];
  @Input() public headerHeight: number = 64;

  private supersetEmbedService: SupersetEmbedService = inject(SupersetEmbedService);

  public ngOnInit(): void {
    if (!this.dashboardId) {
      console.error('Dashboard ID is not provided');
      return;
    }

    const resources: SupersetResource[] = [
      { type: 'dashboard', id: this.dashboardId }
    ];

    let finalRls: SupersetRls[] | undefined;
    // Проверяем наличие значений
    if (this.rlsValues && this.rlsValues.length > 0) {
      // Собираем RLS с статическим clause и динамическим значением
      finalRls = this.rlsValues.map(value => ({
        clause: `id = '${value}'`, // Статический clause + динамическое значение
        dataset: 0 // Статический dataset
      }));
    }

    this.supersetEmbedService.fetchGuestToken(resources, finalRls).subscribe({
      next: (token) => {
        this.embed(this.dashboardId, token);
      },
      error: (err) => {
        console.error('Failed to get token:', err);
      }
    });
  }

  private embed(dashboardId: string, token: string): void {
    const container = document.getElementById('superset-dashboard-container');
    if (container) {
      embedDashboard({
        id: dashboardId,
        iframeTitle: '',
        supersetDomain: 'https://superset.yurtech.kz',
        mountPoint: container,
        fetchGuestToken: () => Promise.resolve(token),
        dashboardUiConfig: {
          hideTitle: true,
          hideChartControls: true,
          hideTab: true,
          filters: {
            expanded: false,
            visible: false,
          }
        }
      });
    }
  }
}
