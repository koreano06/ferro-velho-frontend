import { requestJson } from "./api";

export async function getEstoque() {
  return requestJson("/estoque");
}
