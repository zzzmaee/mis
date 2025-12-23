import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Provider } from '@angular/core';

export function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

export const TRANSLATION_PROVIDERS: Provider[] = [
  TranslateModule.forRoot({
    defaultLanguage: 'ru',
    loader: {
      provide: TranslateLoader,
      useFactory: httpLoaderFactory,
      deps: [HttpClient],
    },
  }).providers!,
];
