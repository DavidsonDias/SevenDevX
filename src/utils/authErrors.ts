/**
 * 🚀 authErrors.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/utils/authErrors.ts
 * @module Utils
 * @layer Infrastructure / Utils
 * @status Active
 *
 * @description
 * Tradução de erros de autenticação para mensagens compreensíveis.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `AuthFlowContext`, `getAuthErrorToast`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/utils/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 🧾 TYPES
// ============================================================================

/** Fluxo em que o erro ocorreu — muda o título e habilita a ação de troca de aba. */
export type AuthFlowContext = "login" | "signup";

type ToastInfo = {
  title: string;
  description: string;
  /** usado pelo caller para decisões de UX (ex.: trocar pra login) */
  action?: "switch_to_login";
};

// ============================================================================
// 🧠 MAPPING
// ============================================================================

/**
 * Converte um erro do provider de auth em título/descrição prontos para toast.
 *
 * @param error - `AuthApiError`, `AuthRetryableFetchError`, `TypeError` de rede
 *                ou qualquer objeto com `message`/`status`/`code`.
 * @param context - fluxo em execução (`login` ou `signup`).
 * @returns Título, descrição e, quando aplicável, uma ação sugerida à UI.
 *
 * @remarks
 * REGRA DE SEGURANÇA
 * Em `login` nunca distinguimos "email inexistente" de "senha errada": ambos
 * viram "Email ou senha incorretos" para não permitir enumeração de contas.
 *
 * A ordem das checagens importa — rede primeiro (pode mascarar qualquer outro
 * sintoma), depois casos específicos, e só então o fallback com a mensagem crua.
 */
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
