import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SupersetResource {
  type: string;
  id: string;
}

export interface SupersetRls {
  clause: string;
  dataset?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SupersetEmbedService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl: string = `/api/superset`;

  public fetchGuestToken(resources: SupersetResource[], rls?: SupersetRls[]): Observable<string> {
    const request: { resources: SupersetResource[]; rls?: SupersetRls[] } = {
      resources,
    };

    if (rls && rls.length > 0) {
      request.rls = rls;
    }

    return this.http
      .post<{ token: string }>(`${this.apiUrl}/guest-token`, request)
      .pipe(map((response) => response.token));
  }
}
