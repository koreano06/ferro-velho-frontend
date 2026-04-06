const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000/api").replace(/\/$/, "");

export async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    let message = "Falha ao processar a requisicao.";

    try {
      const errorData = await response.json();
      if (typeof errorData?.error === "string" && errorData.error.trim()) {
        message = errorData.error;
      }
    } catch {
      // Mantem a mensagem padrao quando a API nao retorna JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export { API_BASE_URL };
