// AI Engine — generates briefings, proposals, scopes, summaries, contracts via Lovable AI Gateway
// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  client_summary:
    "Você é um analista sênior de CRM da SevenDevX. Receba dados de um cliente e suas interações e produza um resumo estratégico em PT-BR com: perfil do cliente, principais necessidades, oportunidades comerciais e próximas ações sugeridas. Use markdown com seções curtas e bullets. IMPORTANTE: a data atual será fornecida no contexto — use sempre essa data como referência temporal, NUNCA invente datas de outros anos.",
  stage_output:
    "Você é um consultor sênior da SevenDevX especializado em produtos digitais. Receba o JSON com 'instruction' (o que gerar), 'project', 'client', 'stage', 'recent_interactions' e 'current_date'. Gere o documento solicitado em PT-BR usando markdown profissional, pronto para enviar ao cliente. Seja específico, prático, estratégico, sem placeholders genéricos. Use o contexto real fornecido. Estruture com cabeçalhos, listas e seções claras. IMPORTANTE: SEMPRE use o valor de 'current_date' como data de referência. NUNCA escreva datas de 2024 ou anos anteriores se a data atual for outra.",
  dashboard_insights:
    "Você é um diretor de operações analisando KPIs da SevenDevX. Receba números do dashboard e retorne 3 insights acionáveis curtos em PT-BR (markdown com bullets), priorizando alertas, oportunidades e próximos passos.",
  faq_suggestions:
    "Você é um especialista em conteúdo. Sugira 5 novas perguntas frequentes em PT-BR para uma agência de produtos digitais, com pergunta + resposta curta. Retorne em markdown numerado.",
  contract_generate:
    `Você é um advogado sênior especializado em contratos de prestação de serviços de tecnologia, com prática consolidada em software houses brasileiras (LGPD, Marco Civil, Código Civil arts. 593-609).

Você está redigindo um CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO DE SOFTWARE para a SevenDevX (CONTRATADA).

DADOS DA CONTRATADA (use SEMPRE estes, nunca invente):
- Razão social: SevenDevX — Desenvolvimento de Software e Produtos Digitais
- Atividade: Desenvolvimento de software, landing pages, sistemas web, automações e produtos digitais sob demanda
- Contato: contato@sevendevx.com

DADOS DO CONTRATANTE: leia o objeto \`contract_config\` do contexto. Esses dados são REAIS e foram preenchidos pelo time comercial — use-os EXATAMENTE como vieram. Campos disponíveis em \`contract_config\`:
- project_name, project_scope
- client_name, client_document, client_address, client_email
- price_total, price_total_formatted, installments_count, price_entry_formatted, price_remaining_formatted
- payment_method (pix|boleto|transferencia|cartao), pix_key
- deadline_days, delivery_type (remoto|presencial|hibrido)
- revisions_limit, support_days
- foro, extras

REGRAS DE PREENCHIMENTO — CRÍTICAS:
- NUNCA escreva "[A DEFINIR]", "[A PREENCHER]", "a definir" ou qualquer placeholder. Se um campo opcional vier vazio (ex.: client_address sem valor), OMITA a linha em vez de inventar ou colocar placeholder.
- Use SEMPRE os valores formatados (price_total_formatted, etc.) para dinheiro.
- DATA DO INSTRUMENTO: SEMPRE use o valor de \`current_date\` do contexto.

ESTRUTURA OBRIGATÓRIA — gere EXATAMENTE estes cabeçalhos, nesta ordem, em markdown:

# CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO DE SOFTWARE

**CONTRATANTE:** {client_name}{ se houver client_document: ", inscrito(a) sob {client_document}"}{ se houver client_address: ", com endereço em {client_address}"}{ se houver client_email: ", e-mail {client_email}"}.

**CONTRATADA:** SevenDevX — Desenvolvimento de Software e Produtos Digitais, e-mail contato@sevendevx.com.

**DATA:** {current_date formatado em PT-BR, ex.: "29 de abril de 2026"}.

**As partes acima qualificadas, doravante denominadas em conjunto "Partes" e individualmente "Parte", têm entre si justo e contratado o presente instrumento particular de prestação de serviços, mediante as cláusulas e condições a seguir pactuadas:**

## CLÁUSULA 1ª — DO OBJETO
Descreva DETALHADAMENTE o objeto com base em \`project_name\` e \`project_scope\`. Especifique tecnologias, finalidade, público-alvo e resultado esperado. Linguagem técnica e jurídica.

## CLÁUSULA 2ª — DO ESCOPO E LIMITAÇÕES
- Itens incluídos: derivados de \`project_scope\` (liste em bullets).
- Revisões inclusas: {revisions_limit} ciclo(s) de revisão por entrega.
- Modalidade de execução: {delivery_type}.
- Itens NÃO incluídos: criação de identidade visual completa, produção de conteúdo textual extenso, hospedagem além de 12 meses, integrações com sistemas legados não mencionadas no escopo, manutenção evolutiva pós-entrega.

## CLÁUSULA 3ª — DAS SOLICITAÇÕES DE ALTERAÇÃO (CHANGE REQUEST)
"Qualquer alteração, inclusão de funcionalidade ou modificação fora do escopo definido na Cláusula 2ª será objeto de orçamento complementar por escrito, com novo prazo e valor, somente executada após aprovação formal da CONTRATANTE."

## CLÁUSULA 4ª — DO VALOR E DA FORMA DE PAGAMENTO
- Valor total: {price_total_formatted}.
- Parcelamento: {installments_count} parcelas — entrada de {price_entry_formatted} no ato da assinatura e {price_remaining_formatted} na entrega final (ou conforme cronograma acordado).
- Forma de pagamento: {payment_method em PT-BR}{ se PIX: ", chave PIX: {pix_key}"}.
- Multa por atraso: 2% (dois por cento) sobre o valor da parcela em atraso, acrescida de juros moratórios de 1% (um por cento) ao mês, calculados pro rata die.
- Suspensão: o atraso superior a 15 (quinze) dias autoriza a CONTRATADA a suspender os trabalhos até a regularização.

## CLÁUSULA 5ª — DO PRAZO E DA ENTREGA
- Prazo total: {deadline_days} dias corridos, contados da data da assinatura e do pagamento da primeira parcela.
- Entregas serão validadas em ambiente de homologação. A CONTRATANTE terá 5 (cinco) dias úteis para apresentar feedback formal. O silêncio implica aceite tácito.

## CLÁUSULA 6ª — DO SUPORTE E DO SLA
- Período de garantia técnica: {support_days} dias corridos após a entrega final, restrito à correção de bugs do código entregue.
- Tempo de resposta: até 48 (quarenta e oito) horas úteis.
- NÃO inclui: novas funcionalidades, alterações de escopo, problemas de hospedagem de terceiros, modificações feitas pela CONTRATANTE no código.
- Suporte estendido pode ser contratado em plano à parte.

## CLÁUSULA 7ª — DA PROPRIEDADE INTELECTUAL
- A titularidade do código-fonte e dos artefatos desenvolvidos será transferida integralmente à CONTRATANTE APÓS a quitação total do valor pactuado.
- Bibliotecas open source de terceiros permanecem sob suas respectivas licenças.
- A CONTRATADA poderá manter referência ao projeto em portfólio, salvo confidencialidade expressa.

## CLÁUSULA 8ª — DA CONFIDENCIALIDADE
As Partes obrigam-se reciprocamente, durante a vigência e por 5 (cinco) anos após o término, a manter sob sigilo absoluto toda informação técnica, comercial, estratégica ou operacional a que tiverem acesso. A violação implica perdas, danos e tutela específica.

## CLÁUSULA 9ª — DA PROTEÇÃO DE DADOS (LGPD — Lei nº 13.709/2018)
- A CONTRATADA atuará como operadora dos dados pessoais eventualmente tratados em nome da CONTRATANTE, controladora.
- Compromete-se a adotar medidas técnicas e administrativas adequadas (criptografia em trânsito, controle de acesso, logs).
- Notificará a CONTRATANTE em até 48h sobre qualquer incidente de segurança.
- Ao término, devolverá ou eliminará os dados conforme orientação formal.

## CLÁUSULA 10ª — DA LIMITAÇÃO DE RESPONSABILIDADE
- A CONTRATADA NÃO garante volume de vendas, conversões, lucro, posicionamento em buscadores ou desempenho comercial decorrente da utilização do produto entregue.
- Não responde por falhas de serviços de terceiros (hospedagem, gateways, APIs externas, redes sociais).
- A responsabilidade total da CONTRATADA, em qualquer hipótese, fica limitada ao valor efetivamente pago no presente contrato.

## CLÁUSULA 11ª — DA RESCISÃO
- Por qualquer das Partes, mediante aviso prévio escrito de 15 (quinze) dias, ressalvado o pagamento dos serviços já executados e despesas comprovadas.
- Por inadimplemento de qualquer cláusula, a Parte inocente poderá rescindir imediatamente, sem prejuízo das perdas e danos cabíveis.

## CLÁUSULA 12ª — DAS DISPOSIÇÕES GERAIS
{ se extras presente: incorpore as observações de \`extras\` aqui em linguagem jurídica; caso contrário OMITA esta cláusula e renumere as seguintes }.

## CLÁUSULA 13ª — DO FORO
Fica eleito o foro da Comarca de {foro}, com renúncia expressa de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer dúvidas oriundas do presente contrato.

E, por estarem assim justas e contratadas, as Partes assinam o presente instrumento em duas vias de igual teor e forma.

**{cidade extraída de \`foro\`}, {current_date}.**

___________________________________________
**CONTRATANTE** — {client_name}

___________________________________________
**CONTRATADA** — SevenDevX

REGRAS CRÍTICAS DE GERAÇÃO:
- Linguagem jurídica formal brasileira ("As Partes acordam…", "Fica pactuado que…", "instrumento contratual", "obrigações ora pactuadas", "inadimplemento").
- NUNCA use a palavra "engenharia"; sempre "desenvolvimento de software".
- NUNCA escreva placeholders. OMITA o trecho se o dado opcional não existir.
- NUNCA escreva datas anteriores a current_date.
- Sem comentários, sem texto fora do contrato, sem emojis, sem markdown decorativo extra.
- Numeração de cláusulas SEMPRE sequencial e correta.
- Pronto para imprimir / exportar PDF.`,
};

const formatDateBR = () => {
  const d = new Date();
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { task, context, model } = await req.json();
    const system = SYSTEM_PROMPTS[task];
    if (!system) {
      return new Response(JSON.stringify({ error: "Unknown task" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Inject current date into every context object so the AI never invents dates
    const enrichedContext =
      typeof context === "string"
        ? { instruction: context, current_date: formatDateBR(), current_iso: new Date().toISOString() }
        : { ...(context || {}), current_date: formatDateBR(), current_iso: new Date().toISOString() };

    const userMsg = JSON.stringify(enrichedContext, null, 2);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Limite de requisições atingido. Aguarde um minuto." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (resp.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-engine error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
