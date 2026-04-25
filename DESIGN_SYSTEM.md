# Design System — Observatório Público

Estilo: **Dark Hacker / Data Terminal**
Referência visual: interfaces modernas de plataformas de dados e segurança (HackTheBox, Linear, Vercel dark)

---

## 1. Princípios de Design

- **Clareza sobre ornamentação** — dados legíveis em primeiro lugar
- **Densidade controlada** — informação densa, mas sem poluição visual
- **Hierarquia forte** — o usuário sempre sabe onde está e o que importa
- **Contraste como ênfase** — o verde fosforescente guia o olhar

---

## 2. Paleta de Cores

### Base

| Nome         | Hex       | Uso                                      |
|--------------|-----------|------------------------------------------|
| `bg-base`    | `#0a0f0a` | Background principal (quase preto-verde) |
| `bg-surface` | `#111713` | Cards, painéis, sidebar                  |
| `bg-raised`  | `#192018` | Hover states, inputs, dropdowns          |
| `bg-overlay` | `#1e2b1e` | Modais, tooltips                         |

### Acento Principal (Verde)

| Nome            | Hex       | Uso                                   |
|-----------------|-----------|---------------------------------------|
| `accent`        | `#9ffe57` | CTAs primários, links ativos, destaques |
| `accent-muted`  | `#4a7a28` | Ícones secundários, badges sutis      |
| `accent-glow`   | `rgba(159,254,87,0.12)` | Glow/halo em elementos em foco |

### Texto

| Nome            | Hex       | Uso                            |
|-----------------|-----------|--------------------------------|
| `text-primary`  | `#e8f5e0` | Títulos, dados principais      |
| `text-secondary`| `#8a9e80` | Labels, subtítulos, meta info  |
| `text-muted`    | `#4a5e42` | Placeholders, disabled         |

### Bordas

| Nome             | Hex                   | Uso                        |
|------------------|-----------------------|----------------------------|
| `border-default` | `rgba(159,254,87,0.1)`| Bordas padrão de cards      |
| `border-focus`   | `rgba(159,254,87,0.4)`| Input focus, item selecionado |

### Semânticas

| Nome       | Hex       | Uso                              |
|------------|-----------|----------------------------------|
| `positive` | `#57fe9f` | Valores positivos, presença alta |
| `warning`  | `#ffd557` | Alertas, gasto acima da média    |
| `danger`   | `#fe5757` | Ausências, gastos críticos       |
| `neutral`  | `#8a9e80` | Neutro / sem dados               |

---

## 3. Tipografia

### Fonte

- **Display / Headings:** `Inter` ou `Geist` — peso 600–700
- **Body / Labels:** `Inter` — peso 400–500
- **Dados / Monospace:** `JetBrains Mono` ou `Geist Mono` — valores numéricos, IDs, datas

### Escala

| Token    | Size    | Weight | Uso                          |
|----------|---------|--------|------------------------------|
| `h1`     | 36px    | 700    | Títulos de página            |
| `h2`     | 24px    | 600    | Títulos de seção             |
| `h3`     | 18px    | 600    | Subtítulos, card headers     |
| `body`   | 14px    | 400    | Texto corrido                |
| `small`  | 12px    | 400    | Labels, meta info            |
| `mono`   | 13px    | 500    | Valores monetários, IDs      |

---

## 4. Espaçamento

Grid base de **4px**.

| Token | Value | Uso                    |
|-------|-------|------------------------|
| `xs`  | 4px   | Gap entre ícone e texto |
| `sm`  | 8px   | Padding interno de badge |
| `md`  | 16px  | Padding de card         |
| `lg`  | 24px  | Gap entre cards         |
| `xl`  | 32px  | Espaçamento de seção    |
| `2xl` | 48px  | Margens de página       |

---

## 5. Componentes

### Layout Geral

```
┌─────────────────────────────────────────────────┐
│  Topbar (logo + nav global + user avatar)        │
├──────────┬──────────────────────────────────────┤
│          │                                        │
│ Sidebar  │   Main Content Area                   │
│ (240px)  │                                        │
│          │                                        │
└──────────┴──────────────────────────────────────┘
```

- Topbar: `h-14`, `bg-surface`, border-bottom sutil
- Sidebar colapsável em mobile (`<768px`)
- Content área com padding `24px`

---

### Card

```
border: 1px solid border-default
border-radius: 8px
background: bg-surface
padding: 20px
transition: border-color 150ms ease

hover:
  border-color: border-focus
  box-shadow: 0 0 0 1px accent-glow
```

---

### Botão Primário

```
background: accent (#9ffe57)
color: #0a0f0a (preto)
font-weight: 600
border-radius: 6px
padding: 8px 20px
font-size: 14px

hover: brightness(1.1) + sutil box-shadow verde
active: scale(0.98)
```

### Botão Secundário (Ghost)

```
background: transparent
border: 1px solid border-default
color: text-primary
border-radius: 6px

hover: background bg-raised, border border-focus
```

---

### Input / Search

```
background: bg-raised
border: 1px solid border-default
border-radius: 6px
padding: 10px 14px
color: text-primary
font-size: 14px

focus:
  border-color: accent
  box-shadow: 0 0 0 3px accent-glow
  outline: none

placeholder: text-muted
```

---

### Badge / Tag

```
Variantes:
  default  → bg: bg-overlay,   text: text-secondary,  border: border-default
  positive → bg: #57fe9f15,    text: #57fe9f,          border: #57fe9f30
  warning  → bg: #ffd55715,    text: #ffd557,          border: #ffd55730
  danger   → bg: #fe575715,    text: #fe5757,          border: #fe575730
  accent   → bg: accent-glow,  text: accent,           border: #9ffe5730

border-radius: 4px
padding: 2px 8px
font-size: 12px
font-weight: 500
```

---

### Sidebar Nav Item

```
Inativo:
  color: text-secondary
  padding: 8px 12px
  border-radius: 6px
  icon: text-muted

Ativo:
  background: accent-glow
  color: accent
  border-left: 2px solid accent
  icon: accent
  font-weight: 500

Hover (inativo):
  background: bg-raised
  color: text-primary
```

---

### Stat Card (KPI)

```
┌────────────────────────────────┐
│  Label (text-secondary, 12px)  │
│  R$ 1.234.567   [badge +12%]   │  ← valor em mono, badge colorida
│  ▁▂▃▄▅ sparkline (opcional)   │
└────────────────────────────────┘
```

---

### Tabela de Dados

```
thead:
  background: bg-raised
  color: text-secondary
  font-size: 12px
  text-transform: uppercase
  letter-spacing: 0.05em
  border-bottom: 1px solid border-default

tbody tr:
  border-bottom: 1px solid rgba(border-default)
  color: text-primary
  font-size: 14px

  hover: background bg-raised

tbody tr:last-child:
  border-bottom: none

valores monetários: font-family mono, text-align right
```

---

### Gráficos (Recharts)

```
Cores das séries:
  primária:    accent     (#9ffe57)
  secundária:  #57fe9f
  terciária:   #ffd557
  quaternária: #fe5757

Grid:        stroke border-default, strokeDasharray "4 4"
Eixos:       color text-muted, fontSize 12
Tooltip:     bg bg-overlay, border border-focus, text text-primary
Legenda:     fontSize 12, color text-secondary

Linha:       strokeWidth 2, dot false (clean)
Área:        fillOpacity 0.08 (suave, não polui)
```

---

## 6. Iconografia

- Biblioteca: **Lucide Icons** (consistente com shadcn/ui)
- Tamanho padrão: `16px` inline, `20px` em nav/botões
- Cor: herda do contexto (text-muted → text-primary → accent)
- Stroke width: `1.5` (mais leve e moderno)

---

## 7. Efeitos e Animações

```
Transições padrão:
  duration: 150ms
  easing: ease

Hover em cards/botões:
  border/shadow transition

Focus rings:
  box-shadow com accent-glow (não outline nativo)

Entrada de conteúdo:
  fade-in + translateY(4px → 0)
  duration: 200ms
  evitar animações longas ou chamariz

Skeleton loading:
  bg: bg-raised → bg-overlay (shimmer)
  border-radius: igual ao componente real
```

---

## 8. Tokens Tailwind (tailwind.config.ts)

```ts
colors: {
  bg: {
    base:    '#0a0f0a',
    surface: '#111713',
    raised:  '#192018',
    overlay: '#1e2b1e',
  },
  accent: {
    DEFAULT: '#9ffe57',
    muted:   '#4a7a28',
    glow:    'rgba(159,254,87,0.12)',
  },
  text: {
    primary:   '#e8f5e0',
    secondary: '#8a9e80',
    muted:     '#4a5e42',
  },
  border: {
    default: 'rgba(159,254,87,0.1)',
    focus:   'rgba(159,254,87,0.4)',
  },
  positive: '#57fe9f',
  warning:  '#ffd557',
  danger:   '#fe5757',
},
fontFamily: {
  sans: ['Inter', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
},
borderRadius: {
  sm: '4px',
  DEFAULT: '6px',
  md: '8px',
  lg: '12px',
},
```

---

## 9. Diretrizes de UX

- **Fonte dos dados sempre visível** — cada painel exibe "Fonte: Câmara dos Deputados"
- **Loading states** — skeleton em vez de spinner global
- **Estados vazios** — mensagem clara quando não há dados, nunca uma tela em branco
- **Valores monetários** — sempre formatados em BRL com `Intl.NumberFormat`
- **Datas** — formato `DD/MM/AAAA` (padrão brasileiro)
- **Responsividade** — sidebar colapsa em mobile; tabelas viram cards empilhados
- **Acessibilidade** — contraste mínimo AA, foco visível em todos os elementos interativos
