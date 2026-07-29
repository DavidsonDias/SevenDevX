/**
 * authErrors.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/utils/authErrors.ts
 * @module Utils
 *
 * @description
 * Tradução de erros de autenticação para mensagens compreensíveis.
 *
 * @see src/utils/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// src/utils/authErrors.ts

export type AuthFlowContext = "login" | "signup";

type ToastInfo = {
  title: string;
  description: string;
  /** usado pelo caller para decisões de UX (ex.: trocar pra login) */
  action?: "switch_to_login";
};

// Normaliza erro do provider de auth (AuthApiError / AuthRetryableFetchError / TypeError)
export function getAuthErrorToast(error: any, context: AuthFlowContext): ToastInfo {
  const status: number | undefined =
    typeof error?.status === "number" ? error.status : undefined;
  const code: string | undefined =
    typeof error?.code === "string" ? error.code : undefined;

  const rawMessage = String(error?.message || "");
  const msg = rawMessage.toLowerCase();

  const isNetwork =
    status === 0 ||
    error?.name === "NetworkError" ||
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("fetch");

  if (isNetwork) {
    return {
      title: "Falha de conexão",
      description:
        "Não foi possível conectar ao servidor de autenticação. Tente novamente.",
    };
  }

  // Email não confirmado
  if (msg.includes("email not confirmed")) {
    return {
      title: "Email não confirmado",
      description: "Verifique sua caixa de entrada para confirmar a conta.",
    };
  }

  // Credenciais inválidas
  if (
    msg.includes("invalid login") ||
    msg.includes("invalid login credentials") ||
    status === 401
  ) {
    return {
      title: "Dados inválidos",
      description: "Email ou senha incorretos.",
    };
  }

  // Email já cadastrado (signup)
  const isAlreadyRegistered =
    status === 409 ||
    code === "user_already_exists" ||
    msg.includes("already registered") ||
    msg.includes("user already registered") ||
    msg.includes("already been registered") ||
    msg.includes("already exists");

  if (context === "signup" && isAlreadyRegistered) {
    return {
      title: "Email já possui conta",
      description: "Este email já possui uma conta. Faça login para continuar.",
      action: "switch_to_login",
    };
  }

  return {
    title: context === "login" ? "Erro ao entrar" : "Erro ao cadastrar",
    description: rawMessage || "Tente novamente.",
  };
}
