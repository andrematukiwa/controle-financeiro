# Controle Financeiro

Aplicação web para controle de gastos e receitas pessoais, com importação automática de faturas e extratos do Nubank em PDF.

🔗 **App em produção:** https://controle-financeiro-rho-teal.vercel.app

## Funcionalidades

- **Registro de entradas e saídas** — cadastro manual com categoria, data e descrição.
- **Importação de PDF do Nubank** — envie a fatura do cartão ou o extrato da conta e o app identifica automaticamente qual dos dois é, extrai as transações e sugere a categoria de cada uma.
- **Conciliação automática** — quando a fatura e o extrato do mesmo mês são importados, o pagamento da fatura que aparece no extrato não é somado de novo como gasto, evitando contar o mesmo dinheiro duas vezes.
- **Categorias** — gastos (Mercado, Transporte, Alimentação, Pix, Fatura Cartão, etc.) e entradas (Salário, Transferência, Reembolso) com cores e ícones próprios.
- **Dashboard** — total de saídas, entradas e saldo do mês, com variação percentual em relação ao mês anterior.
- **Filtros** — por tipo (entrada/saída), categoria e dia.
- **Exportação de relatório em PDF** — resumo do mês com lançamentos e totais por categoria.

## Stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) — leitura dos PDFs importados
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) — geração do relatório em PDF
- [Recharts](https://recharts.org/) — gráfico de gastos por categoria
- [Lucide React](https://lucide.dev/) — ícones

## Rodando localmente

```bash
npm install
npm run dev
```

Outros scripts:

```bash
npm run build    # build de produção
npm run lint     # checagem de lint
npm run preview  # preview do build de produção
```

## Dados

Os lançamentos ficam salvos no `localStorage` do navegador — não há backend nem banco de dados.
