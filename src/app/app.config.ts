import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
  provideZoneChangeDetection
} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {registerLocaleData} from '@angular/common';
import ru from '@angular/common/locales/ru';
import kk from '@angular/common/locales/kk';
import en from '@angular/common/locales/en';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './core/interceptors/auth.interceptor';
import {TRANSLATION_PROVIDERS} from './core/i18n/translation.config';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {IconRegisterService} from './core/services/icon-register.service';
import {provideNzIcons} from 'ng-zorro-antd/icon';
import {icons} from './icons-provider';
import {NZ_DATE_CONFIG, provideNzI18n, ru_RU} from 'ng-zorro-antd/i18n';
import {FormsModule} from '@angular/forms';
import {NzNotificationModule} from 'ng-zorro-antd/notification';

registerLocaleData(ru);
registerLocaleData(kk);
registerLocaleData(en);

function initializeIcons(iconService: IconRegisterService) {
  return () => iconService.registerIcons();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideNzIcons(icons),
    provideNzI18n(ru_RU),
    importProvidersFrom(FormsModule, NzNotificationModule),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    TRANSLATION_PROVIDERS,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIcons,
      deps: [IconRegisterService],
      multi: true,
    },
    {
      provide: NZ_DATE_CONFIG,
      useValue: {
        firstDayOfWeek: 1,
      },
    },
    {
      provide: LOCALE_ID,
      useValue: 'ru',
    },
  ]
};
