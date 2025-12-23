import { inject, Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _translate = inject(TranslateService);
  private readonly _notification = inject(NzNotificationService);

  public success(messageKey: string, titleKey = 'NOTIFICATION.STATUS.SUCCESS'): void {
    this._translate.get([messageKey, titleKey]).subscribe((translations): void => {
      this._notification.success(translations[titleKey], translations[messageKey]);
    });
  }

  public info(messageKey: string, titleKey = 'NOTIFICATION.STATUS.INFO'): void {
    this._translate.get([messageKey, titleKey]).subscribe((translations): void => {
      this._notification.info(translations[titleKey], translations[messageKey]);
    });
  }

  public error(messageKey: string, titleKey = 'NOTIFICATION.STATUS.ERROR'): void {
    this._translate.get([messageKey, titleKey]).subscribe((translations): void => {
      this._notification.error(translations[titleKey], translations[messageKey]);
    });
  }

  public warning(messageKey: string, titleKey = 'NOTIFICATION.STATUS.WARNING'): void {
    this._translate.get([messageKey, titleKey]).subscribe((translations): void => {
      this._notification.warning(translations[titleKey], translations[messageKey]);
    });
  }
}
