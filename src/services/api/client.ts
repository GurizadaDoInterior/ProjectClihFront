export const isDemo = !process.env.EXPO_PUBLIC_API_URL?.trim();
export const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/(?:\/api\/v1)?$/, '/api/v1');
let tokenProvider: (() => Promise<string | null>) | undefined;
// OIDC integration supplies a short-lived token in memory, never in public environment variables.
export function setAccessTokenProvider(provider?: () => Promise<string | null>) {
  tokenProvider = provider;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await tokenProvider?.();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        error.code ?? 'HTTP_ERROR',
        response.status === 401
          ? 'Sua sessão expirou. Entre novamente.'
          : (error.message ?? 'Não foi possível concluir a solicitação.'),
      );
    }
    return response.status === 204 ? (undefined as T) : await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Sem conexão com o servidor. Verifique a rede e tente novamente.',
    );
  } finally {
    clearTimeout(timeout);
  }
}
