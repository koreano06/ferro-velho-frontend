import { requestJson } from "../config/api";

export function getFinancialReport({ startDate, endDate }) {
  const query = new URLSearchParams({ startDate, endDate }).toString();
  return requestJson(`/reports/financial?${query}`);
}

export function getProfitByMaterialReport({ startDate, endDate }) {
  const query = new URLSearchParams({ startDate, endDate }).toString();
  return requestJson(`/reports/profit-by-material?${query}`);
}
