import { requestJson } from "../config/api";

export function createCompra(payload) {
  return requestJson("/purchases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
