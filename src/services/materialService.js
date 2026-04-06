import { requestJson } from "../config/api";

export function getMateriais() {
  return requestJson("/materiais");
}

export function createMaterial(payload) {
  return requestJson("/materiais", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateMaterial(id, payload) {
  return requestJson(`/materiais/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteMaterial(id) {
  return requestJson(`/materiais/${id}`, {
    method: "DELETE",
  });
}
