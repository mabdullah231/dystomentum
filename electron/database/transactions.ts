import { commitDatabase, getDatabase } from './connection'

export type TransactionType = 'INCOME' | 'EXPENSE'

export interface TransactionInput {
  type: TransactionType
  date: string
  description: string
  amount: number
  categoryId: number | null
  paymentMethodId: number | null
  notes: string
}

export interface TransactionRow {
  type: TransactionType
  id: string
  date: string
  description: string
  amount: number
  category: string
  categoryId: number | null
  method: string
  paymentMethodId: number | null
  notes: string
}

export interface IncomeOverview {
  metrics: {
    totalMonthlyIncome: number
    recordCount: number
    largestDeposit: number
    largestDepositSource: string
    averageTransaction: number
    trendPercent: number
  }
  categoryBreakdown: Array<{ label: string; amount: number; percentage: number }>
  ledgerShares: Array<{ category: string; amount: number; percentage: number }>
  entries: Array<{ id: string; date: string; description: string; subtext: string; method: string; amount: number }>
}

export interface ExpenseOverview {
  metrics: {
    totalExpenses: number
    numberOfExpenses: number
    recordCountDelta: number
    highestExpense: number
    highestExpenseCategory: string
    avgDailySpending: number
    previousAvgDailySpending: number
    largestCategory: string
    largestCategoryShare: number
    trendPercent: number
  }
  categoryBreakdown: Array<{ name: string; amount: number; share: number }>
  entries: Array<{ id: string; date: string; description: string; category: string; method: string; amount: number }>
}

export interface ComparisonMetric {
  current: number
  previous: number
  changePercent: number
}

export interface ReportsOverview {
  kpis: {
    income: ComparisonMetric
    expenses: ComparisonMetric
    savings: ComparisonMetric
    savingsRate: ComparisonMetric
  }
  trend: Array<{ label: string; income: number; expenses: number }>
  paymentMethods: Array<{ method: string; share: number }>
}

export interface DashboardOverview {
  metrics: {
    monthlyIncome: number
    monthlyExpenses: number
    savings: number
    savingsRate: number
    incomeTrend: number
    expenseTrend: number
    savingsTrend: number
    balanceTrend: number
  }
  chart: Array<{ label: string; income: number; expense: number }>
  expenseBreakdown: Array<{ name: string; amount: number; share: number }>
  recentTransactions: Array<{ id: string; date: string; description: string; category: string; type: TransactionType; amount: number }>
}

function firstRow(result: ReturnType<Awaited<ReturnType<typeof getDatabase>>['exec']>): unknown[] | undefined {
  return result[0]?.values[0]
}

function requireRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid transaction payload.')
  return value as Record<string, unknown>
}

function parseTransactionId(value: unknown): { type: TransactionType; id: number } {
  if (typeof value !== 'string') throw new Error('A valid transaction ID is required.')
  const match = value.match(/^(INC|EXP)-(\d+)$/)
  if (!match) throw new Error('A valid transaction ID is required.')
  return { type: match[1] === 'INC' ? 'INCOME' : 'EXPENSE', id: Number(match[2]) }
}

function optionalPositiveId(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('A valid related record ID is required.')
  return id
}

function validateInput(value: unknown): TransactionInput {
  const payload = requireRecord(value)
  const type = payload.type === 'INCOME' || payload.type === 'EXPENSE' ? payload.type : null
  const date = typeof payload.date === 'string' ? payload.date.trim() : ''
  const description = typeof payload.description === 'string' ? payload.description.trim() : ''
  const amount = Number(payload.amount)
  const categoryId = optionalPositiveId(payload.categoryId)
  const paymentMethodId = optionalPositiveId(payload.paymentMethodId)
  const notes = typeof payload.notes === 'string' ? payload.notes.trim() : ''

  if (!type) throw new Error('Transaction type must be income or expense.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('A valid transaction date is required.')
  if (!description || description.length > 160) throw new Error('Description must contain 1 to 160 characters.')
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be greater than zero.')
  if (notes.length > 1000) throw new Error('Notes cannot exceed 1000 characters.')

  return {
    type,
    date,
    description,
    amount,
    categoryId,
    paymentMethodId: type === 'EXPENSE' ? paymentMethodId : null,
    notes,
  }
}

function rowToTransaction(row: unknown[]): TransactionRow {
  return {
    type: String(row[0]) as TransactionType,
    id: String(row[1]),
    date: String(row[2]),
    description: String(row[3]),
    amount: Number(row[4]),
    category: String(row[5]),
    categoryId: row[6] === null ? null : Number(row[6]),
    method: String(row[7]),
    paymentMethodId: row[8] === null ? null : Number(row[8]),
    notes: String(row[9]),
  }
}

export async function listTransactions(): Promise<TransactionRow[]> {
  const db = await getDatabase()
  const result = db.exec(`
    SELECT
      'INCOME' AS Type,
      'INC-' || i.Income_ID AS ID,
      i.Date,
      i.Title,
      i.Amount,
      COALESCE(c.Name, 'Uncategorized') AS Category,
      i.Category_ID,
      '' AS Method,
      NULL AS Payment_Method_ID,
      COALESCE(i.Notes, '') AS Notes
    FROM Income i
    LEFT JOIN Categories c ON c.Category_ID = i.Category_ID

    UNION ALL

    SELECT
      'EXPENSE' AS Type,
      'EXP-' || e.Expense_ID AS ID,
      e.Date,
      e.Title,
      e.Amount,
      COALESCE(c.Name, 'Uncategorized') AS Category,
      e.Category_ID,
      COALESCE(pm.Name, 'Unspecified') AS Method,
      e.Payment_Method_ID,
      COALESCE(e.Notes, '') AS Notes
    FROM Expense e
    LEFT JOIN Categories c ON c.Category_ID = e.Category_ID
    LEFT JOIN Payment_Methods pm ON pm.Payment_Method_ID = e.Payment_Method_ID

    ORDER BY Date DESC, ID DESC
  `)[0]

  return (result?.values ?? []).map(rowToTransaction)
}

export async function createTransaction(value: unknown): Promise<TransactionRow> {
  const input = validateInput(value)
  const db = await getDatabase()

  if (input.type === 'INCOME') {
    db.run(
      'INSERT INTO Income (Date, Title, Amount, Category_ID, Notes) VALUES (?, ?, ?, ?, ?)',
      [input.date, input.description, input.amount, input.categoryId, input.notes],
    )
  } else {
    db.run(
      'INSERT INTO Expense (Date, Title, Amount, Category_ID, Payment_Method_ID, Notes) VALUES (?, ?, ?, ?, ?, ?)',
      [input.date, input.description, input.amount, input.categoryId, input.paymentMethodId, input.notes],
    )
  }

  const insertedId = Number(firstRow(db.exec(`SELECT last_insert_rowid()`))?.[0])
  await commitDatabase(db)
  const generatedId = `${input.type === 'INCOME' ? 'INC' : 'EXP'}-${insertedId}`
  return (await listTransactions()).find((transaction) => transaction.id === generatedId)!
}

export async function updateTransaction(idValue: unknown, value: unknown): Promise<TransactionRow> {
  const current = parseTransactionId(idValue)
  const input = validateInput(value)
  const db = await getDatabase()

  if (current.type !== input.type) {
    if (input.type === 'INCOME') {
      db.run(
        'INSERT INTO Income (Date, Title, Amount, Category_ID, Notes) VALUES (?, ?, ?, ?, ?)',
        [input.date, input.description, input.amount, input.categoryId, input.notes],
      )
      db.run('DELETE FROM Expense WHERE Expense_ID = ?', [current.id])
    } else {
      db.run(
        'INSERT INTO Expense (Date, Title, Amount, Category_ID, Payment_Method_ID, Notes) VALUES (?, ?, ?, ?, ?, ?)',
        [input.date, input.description, input.amount, input.categoryId, input.paymentMethodId, input.notes],
      )
      db.run('DELETE FROM Income WHERE Income_ID = ?', [current.id])
    }

    const insertedId = Number(firstRow(db.exec(`SELECT last_insert_rowid()`))?.[0])
    await commitDatabase(db)
    const generatedId = `${input.type === 'INCOME' ? 'INC' : 'EXP'}-${insertedId}`
    return (await listTransactions()).find((transaction) => transaction.id === generatedId)!
  }

  if (current.type === 'INCOME') {
    db.run(
      'UPDATE Income SET Date = ?, Title = ?, Amount = ?, Category_ID = ?, Notes = ?, Updated_At = CURRENT_TIMESTAMP WHERE Income_ID = ?',
      [input.date, input.description, input.amount, input.categoryId, input.notes, current.id],
    )
  } else {
    db.run(
      'UPDATE Expense SET Date = ?, Title = ?, Amount = ?, Category_ID = ?, Payment_Method_ID = ?, Notes = ?, Updated_At = CURRENT_TIMESTAMP WHERE Expense_ID = ?',
      [input.date, input.description, input.amount, input.categoryId, input.paymentMethodId, input.notes, current.id],
    )
  }

  await commitDatabase(db)
  return (await listTransactions()).find((transaction) => transaction.id === String(idValue))!
}

export async function deleteTransaction(idValue: unknown): Promise<boolean> {
  const transaction = parseTransactionId(idValue)
  const db = await getDatabase()
  if (transaction.type === 'INCOME') db.run('DELETE FROM Income WHERE Income_ID = ?', [transaction.id])
  else db.run('DELETE FROM Expense WHERE Expense_ID = ?', [transaction.id])
  await commitDatabase(db)
  return true
}

function formatLocalIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseYearMonth(value: unknown, fallback = new Date()): { year: number; month: number } {
  if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    return { year: Number(value.slice(0, 4)), month: Number(value.slice(5, 7)) - 1 }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const payload = value as Record<string, unknown>
    if (typeof payload.yearMonth === 'string') return parseYearMonth(payload.yearMonth, fallback)
    if (typeof payload.baseMonth === 'string') return parseYearMonth(payload.baseMonth, fallback)
  }
  return { year: fallback.getFullYear(), month: fallback.getMonth() }
}

function monthWindow(year: number, month: number) {
  const startDate = new Date(year, month, 1)
  const nextDate = new Date(year, month + 1, 1)
  const previousDate = new Date(year, month - 1, 1)
  return {
    start: formatLocalIsoDate(startDate),
    next: formatLocalIsoDate(nextDate),
    previous: formatLocalIsoDate(previousDate),
    daysInMonth: new Date(year, month + 1, 0).getDate(),
    label: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(startDate),
    yearMonth: `${year}-${String(month + 1).padStart(2, '0')}`,
  }
}

function daysForAverage(year: number, month: number): number {
  const now = new Date()
  if (year === now.getFullYear() && month === now.getMonth()) return Math.max(1, now.getDate())
  return new Date(year, month + 1, 0).getDate()
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function comparison(current: number, previous: number): ComparisonMetric {
  return { current, previous, changePercent: percentChange(current, previous) }
}

function execRows(db: Awaited<ReturnType<typeof getDatabase>>, sql: string, params: Array<string | number | null> = []): unknown[][] {
  const statement = db.prepare(sql)
  try {
    statement.bind(params)
    const rows: unknown[][] = []
    while (statement.step()) rows.push(statement.get())
    return rows
  } finally {
    statement.free()
  }
}

function sumAmount(db: Awaited<ReturnType<typeof getDatabase>>, table: 'Income' | 'Expense', start: string, next: string): number {
  return Number(execRows(db, `SELECT COALESCE(SUM(Amount), 0) FROM ${table} WHERE Date >= ? AND Date < ?`, [start, next])[0]?.[0] ?? 0)
}

function categoryShares(rows: Array<{ category: string; amount: number }>, total: number): Array<{ name: string; amount: number; share: number }> {
  const totals = new Map<string, number>()
  for (const row of rows) totals.set(row.category, (totals.get(row.category) ?? 0) + row.amount)
  return [...totals.entries()]
    .map(([name, amount]) => ({ name, amount, share: total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0 }))
    .sort((a, b) => b.amount - a.amount)
}

export async function getIncomeOverview(yearMonth?: unknown): Promise<IncomeOverview> {
  const db = await getDatabase()
  const { year, month } = parseYearMonth(yearMonth)
  const window = monthWindow(year, month)

  const currentRows = execRows(db, `
    SELECT i.Income_ID, i.Date, i.Title, i.Amount, COALESCE(c.Name, 'Uncategorized') AS Category
    FROM Income i
    LEFT JOIN Categories c ON c.Category_ID = i.Category_ID
    WHERE i.Date >= ? AND i.Date < ?
    ORDER BY i.Date DESC, i.Income_ID DESC
  `, [window.start, window.next])

  const previousTotal = sumAmount(db, 'Income', window.previous, window.start)
  const totalMonthlyIncome = currentRows.reduce((sum, row) => sum + Number(row[3]), 0)
  const recordCount = currentRows.length
  const largestRow = [...currentRows].sort((a, b) => Number(b[3]) - Number(a[3]))[0]
  const categoryBreakdown = categoryShares(
    currentRows.map((row) => ({ category: String(row[4]), amount: Number(row[3]) })),
    totalMonthlyIncome,
  ).map((item) => ({ label: item.name, amount: item.amount, percentage: item.share }))

  return {
    metrics: {
      totalMonthlyIncome,
      recordCount,
      largestDeposit: largestRow ? Number(largestRow[3]) : 0,
      largestDepositSource: largestRow ? String(largestRow[2]) : 'No income yet',
      averageTransaction: recordCount > 0 ? totalMonthlyIncome / recordCount : 0,
      trendPercent: percentChange(totalMonthlyIncome, previousTotal),
    },
    categoryBreakdown,
    ledgerShares: categoryBreakdown.map((item) => ({ category: item.label, amount: item.amount, percentage: item.percentage })),
    entries: currentRows.map((row) => ({
      id: `INC-${row[0]}`,
      date: String(row[1]),
      description: String(row[2]),
      subtext: String(row[4]),
      method: '—',
      amount: Number(row[3]),
    })),
  }
}

export async function getExpenseOverview(yearMonth?: unknown): Promise<ExpenseOverview> {
  const db = await getDatabase()
  const { year, month } = parseYearMonth(yearMonth)
  const window = monthWindow(year, month)

  const currentRows = execRows(db, `
    SELECT e.Expense_ID, e.Date, e.Title, e.Amount, COALESCE(c.Name, 'Uncategorized') AS Category, COALESCE(pm.Name, 'Unspecified') AS Method
    FROM Expense e
    LEFT JOIN Categories c ON c.Category_ID = e.Category_ID
    LEFT JOIN Payment_Methods pm ON pm.Payment_Method_ID = e.Payment_Method_ID
    WHERE e.Date >= ? AND e.Date < ?
    ORDER BY e.Date DESC, e.Expense_ID DESC
  `, [window.start, window.next])

  const previousRows = execRows(db, 'SELECT Amount FROM Expense WHERE Date >= ? AND Date < ?', [window.previous, window.start])
  const totalExpenses = currentRows.reduce((sum, row) => sum + Number(row[3]), 0)
  const previousTotal = previousRows.reduce((sum, row) => sum + Number(row[0]), 0)
  const numberOfExpenses = currentRows.length
  const largestRow = [...currentRows].sort((a, b) => Number(b[3]) - Number(a[3]))[0]
  const categories = categoryShares(
    currentRows.map((row) => ({ category: String(row[4]), amount: Number(row[3]) })),
    totalExpenses,
  )
  const topCategory = categories[0]

  return {
    metrics: {
      totalExpenses,
      numberOfExpenses,
      recordCountDelta: numberOfExpenses - previousRows.length,
      highestExpense: largestRow ? Number(largestRow[3]) : 0,
      highestExpenseCategory: largestRow ? String(largestRow[4]) : 'No expenses yet',
      avgDailySpending: totalExpenses / daysForAverage(year, month),
      previousAvgDailySpending: previousTotal / daysForAverage(year, month - 1),
      largestCategory: topCategory?.name ?? 'None',
      largestCategoryShare: topCategory?.share ?? 0,
      trendPercent: percentChange(totalExpenses, previousTotal),
    },
    categoryBreakdown: categories,
    entries: currentRows.map((row) => ({
      id: `EXP-${row[0]}`,
      date: String(row[1]),
      description: String(row[2]),
      category: String(row[4]),
      method: String(row[5]),
      amount: Number(row[3]),
    })),
  }
}

export async function getReportsOverview(value?: unknown): Promise<ReportsOverview> {
  const db = await getDatabase()
  const payload = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  const base = parseYearMonth(payload.baseMonth)
  const compare = parseYearMonth(payload.compareMonth, new Date(base.year, base.month - 1, 1))
  const baseWindow = monthWindow(base.year, base.month)
  const compareWindow = monthWindow(compare.year, compare.month)

  const currentIncome = sumAmount(db, 'Income', baseWindow.start, baseWindow.next)
  const previousIncome = sumAmount(db, 'Income', compareWindow.start, compareWindow.next)
  const currentExpenses = sumAmount(db, 'Expense', baseWindow.start, baseWindow.next)
  const previousExpenses = sumAmount(db, 'Expense', compareWindow.start, compareWindow.next)
  const currentSavings = currentIncome - currentExpenses
  const previousSavings = previousIncome - previousExpenses
  const currentRate = currentIncome > 0 ? (currentSavings / currentIncome) * 100 : 0
  const previousRate = previousIncome > 0 ? (previousSavings / previousIncome) * 100 : 0

  const trend = [2, 1, 0].map((offset) => {
    const window = monthWindow(base.year, base.month - offset)
    return {
      label: window.label,
      income: sumAmount(db, 'Income', window.start, window.next),
      expenses: sumAmount(db, 'Expense', window.start, window.next),
    }
  })

  const paymentRows = execRows(db, `
    SELECT COALESCE(pm.Name, 'Unspecified') AS Method, COALESCE(SUM(e.Amount), 0) AS Total
    FROM Expense e
    LEFT JOIN Payment_Methods pm ON pm.Payment_Method_ID = e.Payment_Method_ID
    WHERE e.Date >= ? AND e.Date < ?
    GROUP BY COALESCE(pm.Name, 'Unspecified')
    ORDER BY Total DESC
  `, [baseWindow.start, baseWindow.next])
  const paymentTotal = paymentRows.reduce((sum, row) => sum + Number(row[1]), 0)

  return {
    kpis: {
      income: comparison(currentIncome, previousIncome),
      expenses: comparison(currentExpenses, previousExpenses),
      savings: comparison(currentSavings, previousSavings),
      savingsRate: {
        current: Number(currentRate.toFixed(1)),
        previous: Number(previousRate.toFixed(1)),
        changePercent: Number((currentRate - previousRate).toFixed(1)),
      },
    },
    trend,
    paymentMethods: paymentRows.map((row) => ({
      method: String(row[0]),
      share: paymentTotal > 0 ? Number(((Number(row[1]) / paymentTotal) * 100).toFixed(1)) : 0,
    })),
  }
}

export async function getDashboardOverview(yearMonth?: unknown): Promise<DashboardOverview> {
  const db = await getDatabase()
  const { year, month } = parseYearMonth(yearMonth)
  const window = monthWindow(year, month)
  const previous = monthWindow(year, month - 1)

  const monthlyIncome = sumAmount(db, 'Income', window.start, window.next)
  const monthlyExpenses = sumAmount(db, 'Expense', window.start, window.next)
  const previousIncome = sumAmount(db, 'Income', previous.start, previous.next)
  const previousExpenses = sumAmount(db, 'Expense', previous.start, previous.next)
  const savings = monthlyIncome - monthlyExpenses
  const previousSavings = previousIncome - previousExpenses
  const previousBalance = previousIncome - previousExpenses

  const expenseRows = execRows(db, `
    SELECT COALESCE(c.Name, 'Uncategorized') AS Category, COALESCE(SUM(e.Amount), 0) AS Total
    FROM Expense e
    LEFT JOIN Categories c ON c.Category_ID = e.Category_ID
    WHERE e.Date >= ? AND e.Date < ?
    GROUP BY COALESCE(c.Name, 'Uncategorized')
    ORDER BY Total DESC
  `, [window.start, window.next])

  const recentTransactions = execRows(db, `
    SELECT Type, ID, Date, Description, Category, Amount FROM (
      SELECT 'INCOME' AS Type, 'INC-' || i.Income_ID AS ID, i.Date, i.Title AS Description, COALESCE(c.Name, 'Uncategorized') AS Category, i.Amount
      FROM Income i
      LEFT JOIN Categories c ON c.Category_ID = i.Category_ID
      WHERE i.Date >= ? AND i.Date < ?
      UNION ALL
      SELECT 'EXPENSE' AS Type, 'EXP-' || e.Expense_ID AS ID, e.Date, e.Title AS Description, COALESCE(c.Name, 'Uncategorized') AS Category, e.Amount
      FROM Expense e
      LEFT JOIN Categories c ON c.Category_ID = e.Category_ID
      WHERE e.Date >= ? AND e.Date < ?
    ) AS ledger
    ORDER BY Date DESC, ID DESC
    LIMIT 8
  `, [window.start, window.next, window.start, window.next])

  const chart = Array.from({ length: 12 }, (_, index) => {
    const offset = 11 - index
    const bar = monthWindow(year, month - offset)
    return {
      label: bar.label.slice(0, 3),
      income: sumAmount(db, 'Income', bar.start, bar.next),
      expense: sumAmount(db, 'Expense', bar.start, bar.next),
    }
  })

  return {
    metrics: {
      monthlyIncome,
      monthlyExpenses,
      savings,
      savingsRate: monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0,
      incomeTrend: percentChange(monthlyIncome, previousIncome),
      expenseTrend: percentChange(monthlyExpenses, previousExpenses),
      savingsTrend: percentChange(savings, previousSavings),
      balanceTrend: percentChange(savings, previousBalance),
    },
    chart,
    expenseBreakdown: categoryShares(
      expenseRows.map((row) => ({ category: String(row[0]), amount: Number(row[1]) })),
      monthlyExpenses,
    ),
    recentTransactions: recentTransactions.map((row) => ({
      id: String(row[1]),
      date: String(row[2]),
      description: String(row[3]),
      category: String(row[4]),
      type: String(row[0]) as TransactionType,
      amount: Number(row[5]),
    })),
  }
}
