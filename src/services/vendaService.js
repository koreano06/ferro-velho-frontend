import { requestJson } from "../config/api";

export function createVenda(payload) {
  return requestJson("/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
