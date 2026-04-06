import { requestJson } from "../config/api";

export async function getEstoque() {
  return requestJson("/estoque");
}
