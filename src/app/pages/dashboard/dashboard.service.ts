import {Router} from "@angular/router";
import {
  HttpClient,
} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {Result} from '../../shared/interfaces/pagination.model';

@Injectable({providedIn: "root"})
export class DashboardService {
  constructor(
    private router: Router,
    private http: HttpClient,
  ) {
  }

  search(params: any, name: string) {
    return this.http
      .post<Result<any[]>>(`/api/examinations/report/${name}`, params)
      .pipe(
        map((result) => {
          return result;
        }),
      );
  }
}
