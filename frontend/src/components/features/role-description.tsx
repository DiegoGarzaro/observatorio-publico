import { Card } from "@/components/ui"

// ─── Role data ─────────────────────────────────────────────────────────────────

interface RoleInfo {
  summary: string
  facts: { label: string; value: string }[]
  benefits?: { label: string; value: string }[]
  footnote?: string
}

const ROLE_INFO: Record<string, RoleInfo> = {
  presidente: {
    summary:
      "Chefe de Estado e de Governo da República. Comanda as Forças Armadas, sanciona ou veta leis, edita Medidas Provisórias com força de lei imediata e nomeia ministros, o Procurador-Geral da República e os ministros do STF.",
    facts: [
      { label: "Mandato", value: "4 anos · reeleição uma vez" },
      { label: "Eleição", value: "Maioria absoluta (dois turnos)" },
      { label: "Subsídio bruto", value: "R$ 46.366/mês" },
      { label: "Impeachment", value: "Câmara autoriza (2/3) · Senado julga" },
    ],
    benefits: [
      { label: "Moradia", value: "Palácio da Alvorada (residência oficial) + Granja do Torto (37 ha com lago, piscina e heliponto) — ambos custeados pelo Estado" },
      { label: "Equipe de apoio", value: "Cerca de 160 funcionários no Alvorada: cozinheiros, médicos, seguranças, motoristas e equipe de manutenção — todos pagos pelo Estado" },
      { label: "Transporte", value: "Uso irrestrito de aeronaves da FAB (Força Aérea Brasileira) para viagens pessoais e oficiais, além de comboio presidencial com veículos blindados" },
      { label: "Saúde", value: "Plano de saúde completo para o Presidente e toda a família direta, sem custo algum, incluindo cobertura no exterior" },
      { label: "Segurança", value: "Equipe do GSI (Gabinete de Segurança Institucional) — cobertura 24h para o Presidente e sua família" },
      { label: "Benefícios pós-mandato (vitalícios)", value: "4 funcionários (segurança e assessores) + 2 carros oficiais com motoristas pagos pelo Estado pelo resto da vida. Custo estimado: R$ 7,7 milhões/ano em 2024" },
    ],
    footnote:
      "Subsídio vigente desde fev/2025, fixado pela Lei 14.520/2023 — reajuste de ~40% após 9 anos sem correção desde 2014. O subsídio é bruto; após Imposto de Renda (~27%), o valor líquido é aproximadamente R$ 33.800/mês.",
  },

  vice_presidente: {
    summary:
      "Substitui o Presidente da República nos seus impedimentos ou ausências e assume definitivamente o cargo em caso de vacância. Preside o Conselho da República e o Conselho de Defesa Nacional. Na prática, cada governo atribui funções específicas ao vice por delegação do Presidente.",
    facts: [
      { label: "Mandato", value: "4 anos · reeleição uma vez" },
      { label: "Eleição", value: "Chapa com o Presidente (2 turnos)" },
      { label: "Subsídio bruto", value: "R$ 46.366/mês" },
      { label: "Linha de sucessão", value: "1º a assumir em caso de vacância" },
    ],
    benefits: [
      { label: "Moradia", value: "Palácio do Jaburu — residência oficial em Brasília, custeada pelo Estado" },
      { label: "Transporte", value: "Acesso a aeronaves da FAB para viagens oficiais e, por extensão, pessoais" },
      { label: "Segurança", value: "Equipe de segurança do GSI, cobertura 24h para o Vice e sua família" },
      { label: "Saúde", value: "Plano de saúde completo para o Vice-Presidente e família direta, sem custo" },
    ],
    footnote:
      "Subsídio vigente desde fev/2025 (Lei 14.520/2023). O Vice-Presidente não tem atribuições executivas fixas além da substituição presidencial — cada governo define funções por delegação.",
  },

  ministro: {
    summary:
      "Chefe de uma pasta do Executivo federal, nomeado e exonerado livremente pelo Presidente da República. Dirige o ministério, comanda seu orçamento, edita portarias e regulamentos, e responde pela execução das políticas públicas da sua área perante o Congresso e a sociedade.",
    facts: [
      { label: "Nomeação", value: "Livre escolha do Presidente" },
      { label: "Mandato", value: "Enquanto durar a confiança do Presidente" },
      { label: "Subsídio bruto", value: "R$ 46.366/mês" },
      { label: "Fiscalização", value: "Convocado pelo Congresso a qualquer momento" },
    ],
    benefits: [
      { label: "Auxílio-moradia", value: "Até R$ 11.591/mês (equivalente a 25% do subsídio) — pago mediante comprovante de aluguel ou nota de hotel. Não cobre condomínio, IPTU nem contas" },
      { label: "Transporte", value: "Carro oficial com motorista para uso no exercício do cargo" },
      { label: "Viagens oficiais", value: "Passagens aéreas e hospedagem integralmente custeadas pelo Estado para viagens a serviço" },
      { label: "Segurança", value: "Equipe de segurança pessoal para ministros de pastas sensíveis (Justiça, Defesa, Fazenda etc.)" },
      { label: "Estrutura de gabinete", value: "Equipe de assessores, infraestrutura de escritório e serviços de apoio custeados pelo ministério" },
    ],
    footnote:
      "Subsídio vigente desde fev/2025 (Lei 14.520/2023). Ministros são cargos de confiança — não são eleitos e não têm estabilidade. Podem ser exonerados sem justificativa a qualquer momento e respondem pessoalmente por atos de improbidade administrativa.",
  },

  senador: {
    summary:
      "Representa os estados no Congresso Nacional com poder igual ao de qualquer outro estado, independente do tamanho. Aprova tratados internacionais, autoriza empréstimos externos e julga o Presidente da República em crimes de responsabilidade.",
    facts: [
      { label: "Mandato", value: "8 anos (2 legislaturas)" },
      { label: "Vagas", value: "81 · 3 por estado + DF" },
      { label: "Eleição", value: "Maioria simples (1 turno)" },
      { label: "Subsídio bruto", value: "R$ 46.366/mês" },
    ],
    benefits: [
      { label: "Cota parlamentar", value: "Média de R$ 46.402/mês (varia por estado: R$ 36.582 no DF até R$ 52.798 no AM). Cobre passagens aéreas, hospedagem, aluguel de escritório, combustível, serviços postais e material de divulgação" },
      { label: "Verba de gabinete", value: "~R$ 240.803/mês para contratar até 50 assessores parlamentares com salários de R$ 1.710 a R$ 12.979 cada. Custo total em assessores: R$ 668 milhões/ano no Senado inteiro" },
      { label: "Auxílio-moradia", value: "R$ 5.500/mês — para quem não ocupa um dos 72 apartamentos funcionais do Senado em Brasília (gratuitos para quem conseguir vaga)" },
      { label: "Saúde vitalícia", value: "Plano de saúde completo e gratuito para o senador, cônjuge ou companheiro(a), filhos até 33 anos, enteados e pais. Cobre consultas, internações, cirurgias, emergências e cobertura no exterior. O benefício é VITALÍCIO — continua mesmo após o fim do mandato" },
      { label: "Custo total ao contribuinte", value: "~R$ 340.000 a R$ 355.000 por senador/mês, incluindo salário, cotas, gabinete, saúde e infraestrutura" },
    ],
    footnote:
      "Subsídio vigente desde fev/2025 (Lei 14.520/2023). A cota parlamentar não é salário — é verba de reembolso para gastos comprovados de mandato. Os gastos são públicos e podem ser consultados no Portal da Transparência do Senado.",
  },

  deputado_federal: {
    summary:
      "Integra a Câmara dos Deputados, câmara baixa do Congresso. Inicia a maioria dos projetos de lei, aprova o Orçamento da União e pode autorizar o impeachment do Presidente com 2/3 dos votos.",
    facts: [
      { label: "Mandato", value: "4 anos · reeleições ilimitadas" },
      { label: "Vagas", value: "513 · proporcional por estado" },
      { label: "Eleição", value: "Sistema proporcional (listas abertas)" },
      { label: "Subsídio bruto", value: "R$ 46.366/mês" },
    ],
    benefits: [
      { label: "CEAP (cota de mandato)", value: "R$ 36.582 a R$ 51.406/mês dependendo do estado (roraima tem a maior cota por ser mais distante). Cobre passagens aéreas, hospedagem, aluguel de escritório, combustível, alimentação de trabalho, material de escritório e telecomunicações" },
      { label: "Verba de gabinete", value: "R$ 165.806/mês para contratar até 25 assessores parlamentares com salários de R$ 1.710 a R$ 12.979 cada — válido em Brasília e no escritório do estado" },
      { label: "Auxílio-moradia", value: "R$ 4.253/mês — para quem não ocupa um dos 447 apartamentos funcionais da Câmara em Brasília (gratuitos para quem conseguir vaga)" },
      { label: "Saúde", value: "Plano de saúde para o deputado e todos os dependentes diretos, custeado pela Câmara. Custo total: mais de R$ 360 milhões/ano para os 513 deputados" },
      { label: "Custo total ao contribuinte", value: "~R$ 253.000 a R$ 268.000 por deputado/mês, incluindo salário, CEAP, verba de gabinete, saúde e infraestrutura" },
    ],
    footnote:
      "Subsídio vigente desde fev/2025 (Lei 14.520/2023). A CEAP não é salário — é verba de reembolso para gastos comprovados de mandato, com notas fiscais. Todos os gastos são públicos e estão disponíveis no Portal da Transparência da Câmara.",
  },

  ministro_stf: {
    summary:
      "Membro do Supremo Tribunal Federal — o tribunal de cúpula do Poder Judiciário e guardião da Constituição Federal. Julga ações de inconstitucionalidade, conflitos entre estados e a União, crimes de altas autoridades (como o Presidente e senadores) e recursos de última instância em matéria constitucional.",
    facts: [
      { label: "Nomeação", value: "Indicado pelo Presidente · aprovado pelo Senado (maioria absoluta)" },
      { label: "Mandato", value: "Vitalício até os 75 anos" },
      { label: "Subsídio bruto", value: "R$ 46.366/mês (teto constitucional)" },
      { label: "Membros", value: "11 ministros · quórum de 6 para sessão plenária" },
    ],
    benefits: [
      { label: "Aposentadoria", value: "Integral com subsídio cheio após 30 anos de serviço público ou completar 75 anos — custeada pelo Estado" },
      { label: "Vitaliciedade", value: "Não pode ser demitido, aposentado compulsoriamente antes dos 75 anos, nem ter salário reduzido — garantia constitucional de independência" },
      { label: "Foro privilegiado", value: "Só pode ser processado criminalmente pelo próprio STF (julgamento entre pares)" },
      { label: "Segurança", value: "Escolta e segurança pessoal custeadas pelo Estado para ministros no exercício do cargo" },
      { label: "Auxílio-moradia", value: "Direito a residência oficial ou auxílio-moradia enquanto no cargo" },
    ],
    footnote:
      "O subsídio do STF é o teto remuneratório constitucional — nenhum servidor público no Brasil pode receber mais do que R$ 46.366/mês (bruto) por essa razão. A vitaliciedade não significa impunidade: ministros podem ser afastados ou perder o cargo por crime de responsabilidade julgado pelo Senado Federal.",
  },

  ministro_tribunal_superior: {
    summary:
      "Membro de um dos tribunais superiores da Justiça federal especializada: STJ (Superior Tribunal de Justiça), TSE (Tribunal Superior Eleitoral), STM (Superior Tribunal Militar) ou TST (Tribunal Superior do Trabalho). Cada tribunal é a instância máxima de sua área de competência.",
    facts: [
      { label: "Nomeação", value: "Indicado pelo Presidente · aprovado pelo Senado" },
      { label: "Mandato", value: "Vitalício até os 75 anos (STJ/TST) · 2 anos renovável (TSE)" },
      { label: "Subsídio bruto", value: "~R$ 44.047/mês (95% do teto do STF)" },
      { label: "Composição", value: "STJ: 33 · TST: 27 · TSE: 7 · STM: 15" },
    ],
    footnote:
      "Os ministros do TSE são indicados pelo STF e STJ e têm mandato de 2 anos (renovável por mais 2), não vitalício. Os demais tribunais têm vitaliciedade até os 75 anos.",
  },

  governador: {
    summary:
      "Chefe do Poder Executivo estadual. Administra o orçamento do estado, comanda a Polícia Militar e Civil, e pode intervir em municípios em situações específicas. Tem papel central na segurança pública e educação básica.",
    facts: [
      { label: "Mandato", value: "4 anos · reeleição uma vez" },
      { label: "Vagas", value: "27 · um por estado + DF" },
      { label: "Eleição", value: "Maioria absoluta (dois turnos)" },
      { label: "Subsídio", value: "Fixado por cada estado" },
    ],
  },

  prefeito: {
    summary:
      "Chefe do Executivo municipal. Responde pelos serviços de saúde básica, coleta de lixo, transporte urbano, licenciamento de obras e zeladoria da cidade. É o gestor público mais próximo do cotidiano do cidadão.",
    facts: [
      { label: "Mandato", value: "4 anos · reeleição uma vez" },
      { label: "Vagas", value: "5.570 municípios" },
      { label: "Eleição", value: "1 turno (até 200 mil eleitores) ou 2 turnos" },
      { label: "Subsídio", value: "Limitado ao do Governador" },
    ],
  },

  deputado_estadual: {
    summary:
      "Legisla na Assembleia Legislativa do estado — aprova o orçamento estadual, fiscaliza o Executivo, cria e extingue municípios e pode autorizar o impeachment do Governador.",
    facts: [
      { label: "Mandato", value: "4 anos · reeleições ilimitadas" },
      { label: "Vagas", value: "~1.059 no total · mínimo 24 por estado" },
      { label: "Eleição", value: "Sistema proporcional" },
      { label: "Subsídio", value: "Até 75% do salário de Dep. Federal" },
    ],
  },

  vereador: {
    summary:
      "Legisla na Câmara Municipal — aprova a Lei Orgânica, o Plano Diretor e o orçamento do município. Fiscaliza os atos do Prefeito e pode propor a abertura de processo de impeachment.",
    facts: [
      { label: "Mandato", value: "4 anos · reeleições ilimitadas" },
      { label: "Vagas", value: "9 a 55 por município (pop. proporcional)" },
      { label: "Eleição", value: "Sistema proporcional" },
      { label: "Subsídio", value: "Até 20–75% do salário de Dep. Estadual" },
    ],
  },
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface RoleDescriptionProps {
  role: string
}

export function RoleDescription({ role }: RoleDescriptionProps) {
  const info = ROLE_INFO[role]
  if (!info) return null

  return (
    <Card>
      <div className="space-y-4 p-1">
        <p className="text-sm text-text-secondary leading-relaxed">{info.summary}</p>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
          {info.facts.map((fact) => (
            <div key={fact.label} className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                {fact.label}
              </dt>
              <dd className="text-xs font-medium text-text-primary">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {info.benefits && info.benefits.length > 0 && (
          <div className="border-t border-border-default pt-4 space-y-2">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
              Benefícios além do subsídio
            </p>
            <dl className="space-y-2">
              {info.benefits.map((b) => (
                <div key={b.label} className="grid grid-cols-[auto_1fr] gap-x-3 items-baseline">
                  <dt className="text-xs font-semibold text-text-secondary whitespace-nowrap">{b.label}</dt>
                  <dd className="text-xs text-text-muted leading-relaxed">{b.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {info.footnote && (
          <p className="text-[11px] text-text-muted leading-relaxed border-t border-border-default pt-3">
            {info.footnote}
          </p>
        )}
      </div>
    </Card>
  )
}
