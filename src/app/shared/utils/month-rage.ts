import { format, subMonths, startOfMonth } from "date-fns";

export function getMonthRange(range: number) {
  return {
    from: format(
      subMonths(startOfMonth(new Date()), range - 1),
      "yyyy-MM-dd HH:mm:ss",
    ),
    to: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
  };
}
