import { Router } from "@angular/router";
import {
  HttpClient,
} from "@angular/common/http";
import { map } from "rxjs/operators";
import { Injectable} from "@angular/core";
import {Result} from '../../../shared/interfaces/pagination.model';

@Injectable({ providedIn: "root" })
export class AsmoService {
  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  search(params: any) {
    return this.http
      .post<Result<any[]>>(`/api/examinations/search`, params)
      .pipe(
        map((result) => {
          return result;
        }),
      );
  }
}
