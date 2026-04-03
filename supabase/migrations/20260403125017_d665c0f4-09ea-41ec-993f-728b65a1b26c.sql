
ALTER TABLE public.blog_posts DROP CONSTRAINT blog_posts_author_id_fkey;

INSERT INTO public.blog_posts (title, slug, excerpt, content, status, published_at, read_time, tags, category_id, author_id) VALUES
(
  'Interfaces que Convertem: O que Separa um Site Bonito de um Site que Gera Resultado',
  'interfaces-que-convertem',
  'A maioria dos sites parece boa. Poucos geram resultado. A diferença está nos detalhes de UX que guiam o usuário até a ação.',
  E'## O problema invisível\n\nA maioria dos projetos digitais comete o mesmo erro: priorizar estética sobre funcionalidade. Um site pode ter animações incríveis, tipografia perfeita e paleta de cores harmoniosa — e ainda assim não converter.\n\n**Por quê?** Porque design bonito e design eficaz são coisas diferentes.\n\n## O que realmente converte\n\n### 1. Hierarquia visual clara\n\nO usuário precisa entender em **menos de 3 segundos** o que você oferece e o que ele deve fazer. Isso exige:\n\n- Um título direto (sem metáforas confusas)\n- Um CTA visível e com contraste\n- Espaçamento que guia o olhar\n\n### 2. Prova social posicionada\n\nDepoimentos, logos de clientes e métricas devem aparecer **antes** do formulário de contato, não depois.\n\n### 3. Velocidade real\n\nUm site que demora 4 segundos para carregar perde **53% dos visitantes** (Google). Performance não é detalhe técnico — é conversão.\n\n### 4. Micro-interações com propósito\n\nAnimações devem **reforçar a ação**, não distrair.\n\n## Aplicação prática\n\n```\n✅ Título comunica valor em 1 frase?\n✅ CTA está visível sem scroll?\n✅ Página carrega em < 2.5s?\n✅ Prova social antes do formulário?\n✅ Mobile-first implementado?\n```\n\n## Conclusão\n\nDesign que converte não é sobre ser bonito. É sobre ser **claro, rápido e confiável**.',
  'published', NOW() - INTERVAL '2 days', 7,
  ARRAY['UX', 'Conversão', 'Design', 'CTA'],
  'c4907297-5d3e-4419-9c7c-b3eb1b3e6ec4',
  gen_random_uuid()
),
(
  'Do Design ao Código: Como Traduzir um Layout Pixel-Perfect sem Perder Performance',
  'do-design-ao-codigo',
  'O gap entre design e desenvolvimento é onde a maioria dos projetos perde qualidade.',
  E'## O gap que ninguém fala\n\nTodo designer já entregou um layout e recebeu de volta algo que "não é bem isso". O problema não é incompetência — é **falta de processo**.\n\n## Framework de tradução\n\n### 1. Design Tokens primeiro\n\nAntes de escrever CSS, extraia os tokens do design: cores, espaçamentos, radii, fontes.\n\n### 2. Component-first\n\nNunca comece pela página inteira. Construa componentes isolados e reutilizáveis.\n\n### 3. Responsive não é "depois"\n\nImplemente mobile-first. Sempre. Ajustar depois gera retrabalho de 30-40%.\n\n### 4. Performance como constraint\n\n- Imagens: WebP, max 200KB\n- Fontes: max 2 famílias, font-display: swap\n- JavaScript: code-splitting por rota\n\n## Resultado\n\nQuando design e código compartilham o mesmo vocabulário, o resultado é **consistente, performático e fiel**.',
  'published', NOW() - INTERVAL '5 days', 8,
  ARRAY['Frontend', 'CSS', 'Design System', 'Performance'],
  'f91e6b1c-2fb5-418f-8456-1b3506d2b34e',
  gen_random_uuid()
),
(
  'Performance Web na Prática: Como Atingir 90+ no Lighthouse',
  'performance-web-pratica',
  'Lighthouse 90+ não é luxo — é requisito. Técnicas reais de produção para velocidade sem comprometer UX.',
  E'## Por que performance importa\n\n- **53%** dos usuários mobile abandonam sites > 3s\n- Cada 100ms de latência = **-1% conversão** (Amazon)\n- Core Web Vitals = fator de ranking Google\n\n## As 5 técnicas que mais impactam\n\n### 1. Lazy loading inteligente\nUse Intersection Observer para carregar sob demanda.\n\n### 2. Code splitting por rota\nReduz bundle inicial em **40-60%**.\n\n### 3. Otimização de fontes\nfont-display: swap + unicode-range.\n\n### 4. Imagens modernas\nWebP, width/height explícitos, srcset.\n\n### 5. Minimize JavaScript\nCada KB de JS custa mais que 1KB de imagem.\n\n## Checklist\n\n```\n✅ LCP < 2.5s\n✅ FID < 100ms\n✅ CLS < 0.1\n✅ Bundle < 200KB gzipped\n```\n\n## Conclusão\n\nPerformance é a feature mais invisível e mais impactante. Invista desde o início.',
  'published', NOW() - INTERVAL '8 days', 9,
  ARRAY['Performance', 'Lighthouse', 'Core Web Vitals'],
  '61a422aa-fb19-45c0-bd86-8001d6ca4e67',
  gen_random_uuid()
),
(
  'Por que 90% dos Sites Não Convertem (e Como Resolver em 5 Passos)',
  'por-que-sites-nao-convertem',
  'O problema não é tráfego — é a experiência entre o clique e a conversão.',
  E'## O diagnóstico\n\nVisitas existem. Leads não. O problema está na **experiência**.\n\n## Os 5 erros fatais\n\n### 1. Proposta de valor confusa\n❌ "Soluções inovadoras para transformar seu negócio"\n✅ "Criamos sites que geram leads para empresas B2B"\n\n### 2. CTA invisível\nDeve ser visível sem scroll, contrastante e específico.\n\n### 3. Sem prova social\nSem depoimentos = sem confiança.\n\n### 4. Formulário longo\nCada campo extra = -10% conversão.\n\n### 5. Lento no mobile\n60%+ do tráfego é mobile. 3s+ no 4G = abandono.\n\n## Framework de correção\n\n1. Audite a página principal\n2. Simplifique a proposta de valor\n3. Destaque o CTA\n4. Adicione prova social\n5. Otimize performance\n\n## Conclusão\n\nConversão = remover fricção. Não precisa de mais tráfego.',
  'published', NOW() - INTERVAL '12 days', 6,
  ARRAY['Conversão', 'UX', 'Landing Page'],
  'c4907297-5d3e-4419-9c7c-b3eb1b3e6ec4',
  gen_random_uuid()
),
(
  'React + TypeScript em Produção: Patterns que Escalam',
  'react-typescript-escalavel',
  'Os patterns de React + TypeScript que realmente funcionam em projetos de produção.',
  E'## Tutoriais vs. Produção\n\nA maioria dos tutoriais ensina patterns para projetos pequenos. Em produção, eles quebram.\n\n## Patterns que funcionam\n\n### 1. Composição > Props booleanas\nUse composição de componentes ao invés de 15 props condicionais.\n\n### 2. Custom Hooks para lógica\nToda lógica de negócio vive em hooks, separada do visual.\n\n### 3. Types que documentam\nTipos específicos comunicam intenção. Nunca use any.\n\n### 4. Error Boundaries por feature\nSe o chat quebrar, os projetos continuam funcionando.\n\n### 5. Performance por padrão\n- memo() em listas\n- useCallback para handlers\n- lazy() para rotas\n\n## Conclusão\n\nPatterns bons são os que **sobrevivem à produção**.',
  'published', NOW() - INTERVAL '15 days', 10,
  ARRAY['React', 'TypeScript', 'Patterns'],
  'f91e6b1c-2fb5-418f-8456-1b3506d2b34e',
  gen_random_uuid()
),
(
  'O que Define um Produto Digital Premium: Além do Visual',
  'o-que-define-produto-premium',
  'Premium não é animação bonita. É consistência, performance e atenção obsessiva aos detalhes.',
  E'## O equívoco\n\n"Premium" não é gradiente bonito. É **sistema**.\n\n## Os 4 pilares\n\n### 1. Consistência absoluta\n- Espaçamento: múltiplos de 8px\n- Cores: paleta definida\n- Tipografia: max 2 famílias\n- Animações: mesmo easing\n\n### 2. Performance como feature\nPremium = rápido. Não existe premium lento.\n\n### 3. Feedback constante\nO usuário nunca fica no vácuo. Cada ação tem resposta visual.\n\n### 4. Edge cases\nProdutos medianos funcionam no happy path. Premium funciona em **todos os cenários**.\n\n## Conclusão\n\nPremium é a soma de consistência + performance + feedback + atenção aos detalhes.',
  'published', NOW() - INTERVAL '20 days', 8,
  ARRAY['Produto', 'Premium', 'Design System'],
  'c5605389-a5c7-4fde-8420-8664bacb3234',
  gen_random_uuid()
);
