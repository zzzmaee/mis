import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { en_US, kk_KZ, NzI18nInterface, NzI18nService, ru_RU } from 'ng-zorro-antd/i18n';

type AvailableLanguages = 'ru' | 'en' | 'kk';

const LANGUAGE = 'selectedLanguage';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  public readonly isLoading = signal(true);
  public readonly currentLanguage = signal<AvailableLanguages>('ru');

  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _translate = inject(TranslateService);
  private readonly _nzConfigService = inject(NzConfigService);
  private readonly _nzI18nService = inject(NzI18nService);

  private readonly _nzLocaleMap: Record<AvailableLanguages, NzI18nInterface> = {
    ru: ru_RU,
    en: en_US,
    kk: kk_KZ,
  };

  constructor() {
    this._initializeLanguage();
  }

  public switchLanguage(lang: AvailableLanguages): void {
    this._translate.use(lang);
    this.currentLanguage.set(lang);

    const nzLocale = this._nzLocaleMap[lang];
    if (nzLocale) {
      this._nzI18nService.setLocale(nzLocale);
    }

    if (isPlatformBrowser(this._platformId)) {
      localStorage.setItem(LANGUAGE, lang);
    }

    this._nzConfigService.set('theme', { direction: 'ltr' });
  }

  private _initializeLanguage(): void {
    this._translate.addLangs(['ru', 'en', 'kk']);
    this._translate.setDefaultLang('ru');

    const savedLang = this._getSavedLanguage();
    this.switchLanguage(savedLang);
    this.isLoading.set(false);
  }

  private _getSavedLanguage(): AvailableLanguages {
    let savedLang: string | null | undefined = null;

    if (isPlatformBrowser(this._platformId)) {
      savedLang = localStorage.getItem(LANGUAGE);
    }

    if (!savedLang && isPlatformBrowser(this._platformId)) {
      savedLang = this._translate.getBrowserLang() || null;
    }

    return savedLang && ['ru', 'en', 'kk'].includes(savedLang)
      ? (savedLang as AvailableLanguages)
      : 'ru';
  }
}
