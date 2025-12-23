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
