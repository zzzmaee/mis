export interface Response<T> {
  content: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface Result<T> {
  content: T;
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  // pageable: Object {
  // offset: 0
  // pageNumber: 0
  // pageSize: 10
  // paged: true
  // sort: Object { sorted: true, unsorted: false, empty: false }
  // }
  unpaged: false;
  size: number;
  // sort: Object { sorted: true, unsorted: false, empty: false }
  totalElements: number;
  totalPages: number;
}

export interface ResultWrapper<T> {
  data: Result<T>;
  status: number;
  message: string;
  timestamp: number;
}

export interface EmployeeWrapper<T> {
  data: T;
  status: number;
  message: string;
  timestamp: number;
}

export interface Criteria {
  key?: string;
  operator?: string;
  value?: any;
  values?: string[];
}

export interface Payload {
  page?: number;
  pageSize?: number;
  criteria?: Criteria[];
  sort?: string;
  direction?: string;
}
