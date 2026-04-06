import { requestJson } from "./api";

export function createPurchase(payload) {
  return requestJson("/purchases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function createSale(payload) {
  return requestJson("/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
