import { requestJson } from "./api";

export function getManagementOverview() {
  return requestJson("/management/overview");
}

export function getFinanceSummary() {
  return requestJson("/management/finance");
}

export function getPartnerSummary() {
  return requestJson("/management/partners");
}

export function getAuditLogs() {
  return requestJson("/management/audit");
}
