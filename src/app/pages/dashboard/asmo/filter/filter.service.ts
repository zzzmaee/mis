import { Router } from "@angular/router";
import {
  HttpClient
} from "@angular/common/http";
import { map } from "rxjs/operators";
import { Injectable} from "@angular/core";
import {Result, ResultWrapper} from '../../../../shared/interfaces/pagination.model';
import {EmployeeDto} from '../user.models';

@Injectable({ providedIn: "root" })
export class FilterService {
  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  searchOrganization(term: string) {
    return this.http.get<Result<any[]>>(`/api/organizations?term=` + term).pipe(
      map((result) => {
        console.log(result);
        return result;
      }),
    );
  }
  searchDictionary(type: string, params: any) {
    return this.http
      .post<Result<any[]>>(`/api/dicts/${type}/search`, params)
      .pipe(
        map((result) => {
          console.log(result);
          return result;
        }),
      );
  }
  searchEmployee(params: any) {
    return this.http.post<ResultWrapper<EmployeeDto[]>>(`/api/employees/v2/search`, params).pipe(
      map((result) => {
        return result.data;
      }),
    );
  }
}
