import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Component to display success message after password reset
 * Note: API returns 204 with no body, so this component just shows a success message
 */
@Component({
  selector: 'app-user-reset-password',
  imports: [
    CommonModule,
    NzModalModule,
    NzAlertModule,
    NzTypographyModule,
    NzButtonModule,
    TranslatePipe,
  ],
  templateUrl: './user-reset-password.component.html',
  styleUrl: './user-reset-password.component.less',
})
export class UserResetPasswordComponent {
  private readonly _modalRef = inject(NzModalRef);

  public closeModal(): void {
    this._modalRef.close();
  }
}
