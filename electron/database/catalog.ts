import { commitDatabase, getDatabase } from './connection'

export type CategoryType = 'Income' | 'Expense'

export interface CatalogItem {
  id: number
  name: string
  icon: string | null
  color: string | null
  isDefault: boolean
  transactionCount: number
  type?: CategoryType
}

export interface CatalogItemInput {
  name: string
  icon: string | null
  color: string | null
}

function requireRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid request payload.')
  return value as Record<string, unknown>
}

function requirePositiveId(value: unknown): number {
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('A valid record ID is required.')
  return id
}

function validateInput(value: unknown): CatalogItemInput {
  const payload = requireRecord(value)
  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  const icon = payload.icon === undefined || payload.icon === null ? null : String(payload.icon).trim()
  const color = payload.color === undefined || payload.color === null ? null : String(payload.color).trim()

  if (!name || name.length > 80) throw new Error('Name must contain 1 to 80 characters.')
  if (icon && icon.length > 64) throw new Error('Icon identifier is too long.')
  if (color && !/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Color must be a six-digit hexadecimal value.')

  return { name, icon, color }
}

function validateCategoryType(value: unknown): CategoryType {
  if (value === 'Income' || value === 'Expense') return value
  throw new Error('Category type must be Income or Expense.')
}

function firstRow(result: ReturnType<Awaited<ReturnType<typeof getDatabase>>['exec']>): unknown[] | undefined {
  return result[0]?.values[0]
}

function ensureCatalogSchema(db: Awaited<ReturnType<typeof getDatabase>>): boolean {
  let changed = false
  const categoryColumns = db.exec('PRAGMA table_info(Categories)')[0]?.values ?? []
  if (!categoryColumns.some((column) => column[1] === 'Updated_At')) {
    db.run('ALTER TABLE Categories ADD COLUMN Updated_At DATETIME NULL')
    changed = true
  }

  const paymentMethodColumns = db.exec('PRAGMA table_info(Payment_Methods)')[0]?.values ?? []
  if (!paymentMethodColumns.some((column) => column[1] === 'Icon')) {
    db.run('ALTER TABLE Payment_Methods ADD COLUMN Icon TEXT NULL')
    changed = true
  }
  if (!paymentMethodColumns.some((column) => column[1] === 'Color')) {
    db.run('ALTER TABLE Payment_Methods ADD COLUMN Color TEXT NULL')
    changed = true
  }
  if (!paymentMethodColumns.some((column) => column[1] === 'Updated_At')) {
    db.run('ALTER TABLE Payment_Methods ADD COLUMN Updated_At DATETIME NULL')
    changed = true
  }

  const categoryIndexes = db.exec('PRAGMA index_list(Categories)')[0]?.values ?? []
  if (!categoryIndexes.some((index) => index[1] === 'idx_categories_name_type')) {
    db.run('CREATE UNIQUE INDEX idx_categories_name_type ON Categories(Name, Type)')
    changed = true
  }
  return changed
}

export async function listCategories(type?: unknown): Promise<CatalogItem[]> {
  const categoryType = type === undefined ? undefined : validateCategoryType(type)
  const db = await getDatabase()
  if (ensureCatalogSchema(db)) await commitDatabase(db)
  const result = db.exec(`
    SELECT
      c.Category_ID, c.Name, c.Type, c.Icon, c.Color, c.Is_Default,
      (SELECT COUNT(*) FROM Income i WHERE i.Category_ID = c.Category_ID) +
      (SELECT COUNT(*) FROM Expense e WHERE e.Category_ID = c.Category_ID) AS Transaction_Count
    FROM Categories c
    ${categoryType ? 'WHERE c.Type = ?' : ''}
    ORDER BY c.Is_Default DESC, c.Name COLLATE NOCASE
  `, categoryType ? [categoryType] : [])[0]

  return (result?.values ?? []).map((row) => ({
    id: Number(row[0]), name: String(row[1]), type: row[2] as CategoryType,
    icon: row[3] === null ? null : String(row[3]), color: row[4] === null ? null : String(row[4]),
    isDefault: Boolean(row[5]), transactionCount: Number(row[6]),
  }))
}

export async function createCategory(type: unknown, input: unknown): Promise<CatalogItem> {
  const categoryType = validateCategoryType(type)
  const { name, icon, color } = validateInput(input)
  const db = await getDatabase()
  ensureCatalogSchema(db)
  db.run('INSERT INTO Categories (Name, Type, Icon, Color) VALUES (?, ?, ?, ?)', [name, categoryType, icon, color])
  const row = firstRow(db.exec('SELECT Category_ID FROM Categories WHERE rowid = last_insert_rowid()'))
  await commitDatabase(db)
  return (await listCategories(categoryType)).find((item) => item.id === Number(row?.[0]))!
}

export async function updateCategory(idValue: unknown, input: unknown): Promise<CatalogItem> {
  const id = requirePositiveId(idValue)
  const { name, icon, color } = validateInput(input)
  const db = await getDatabase()
  ensureCatalogSchema(db)
  const existing = firstRow(db.exec('SELECT Type FROM Categories WHERE Category_ID = ?', [id]))
  if (!existing) throw new Error('Category not found.')
  db.run('UPDATE Categories SET Name = ?, Icon = ?, Color = ?, Updated_At = CURRENT_TIMESTAMP WHERE Category_ID = ?', [name, icon, color, id])
  await commitDatabase(db)
  return (await listCategories(existing[0])).find((item) => item.id === id)!
}

export async function deleteCategory(idValue: unknown): Promise<void> {
  const id = requirePositiveId(idValue)
  const db = await getDatabase()
  ensureCatalogSchema(db)
  const existing = firstRow(db.exec('SELECT Is_Default FROM Categories WHERE Category_ID = ?', [id]))
  if (!existing) throw new Error('Category not found.')
  if (Boolean(existing[0])) throw new Error('Default categories cannot be deleted.')
  const inUse = firstRow(db.exec('SELECT (SELECT COUNT(*) FROM Income WHERE Category_ID = ?) + (SELECT COUNT(*) FROM Expense WHERE Category_ID = ?)', [id, id]))
  if (Number(inUse?.[0]) > 0) throw new Error('Categories with transactions cannot be deleted.')
  db.run('DELETE FROM Categories WHERE Category_ID = ?', [id])
  await commitDatabase(db)
}

export async function listPaymentMethods(): Promise<CatalogItem[]> {
  const db = await getDatabase()
  if (ensureCatalogSchema(db)) await commitDatabase(db)
  const result = db.exec(`
    SELECT p.Payment_Method_ID, p.Name, p.Icon, p.Color, p.Is_Default,
      (SELECT COUNT(*) FROM Expense e WHERE e.Payment_Method_ID = p.Payment_Method_ID) AS Transaction_Count
    FROM Payment_Methods p
    ORDER BY p.Is_Default DESC, p.Name COLLATE NOCASE
  `)[0]

  return (result?.values ?? []).map((row) => ({
    id: Number(row[0]), name: String(row[1]), icon: row[2] === null ? null : String(row[2]),
    color: row[3] === null ? null : String(row[3]), isDefault: Boolean(row[4]), transactionCount: Number(row[5]),
  }))
}

export async function createPaymentMethod(input: unknown): Promise<CatalogItem> {
  const { name, icon, color } = validateInput(input)
  const db = await getDatabase()
  ensureCatalogSchema(db)
  db.run('INSERT INTO Payment_Methods (Name, Icon, Color) VALUES (?, ?, ?)', [name, icon, color])
  const row = firstRow(db.exec('SELECT Payment_Method_ID FROM Payment_Methods WHERE rowid = last_insert_rowid()'))
  await commitDatabase(db)
  return (await listPaymentMethods()).find((item) => item.id === Number(row?.[0]))!
}

export async function updatePaymentMethod(idValue: unknown, input: unknown): Promise<CatalogItem> {
  const id = requirePositiveId(idValue)
  const { name, icon, color } = validateInput(input)
  const db = await getDatabase()
  ensureCatalogSchema(db)
  if (!firstRow(db.exec('SELECT 1 FROM Payment_Methods WHERE Payment_Method_ID = ?', [id]))) throw new Error('Payment method not found.')
  db.run('UPDATE Payment_Methods SET Name = ?, Icon = ?, Color = ?, Updated_At = CURRENT_TIMESTAMP WHERE Payment_Method_ID = ?', [name, icon, color, id])
  await commitDatabase(db)
  return (await listPaymentMethods()).find((item) => item.id === id)!
}

export async function deletePaymentMethod(idValue: unknown): Promise<void> {
  const id = requirePositiveId(idValue)
  const db = await getDatabase()
  ensureCatalogSchema(db)
  const existing = firstRow(db.exec('SELECT Is_Default FROM Payment_Methods WHERE Payment_Method_ID = ?', [id]))
  if (!existing) throw new Error('Payment method not found.')
  if (Boolean(existing[0])) throw new Error('Default payment methods cannot be deleted.')
  const inUse = firstRow(db.exec('SELECT COUNT(*) FROM Expense WHERE Payment_Method_ID = ?', [id]))
  if (Number(inUse?.[0]) > 0) throw new Error('Payment methods with transactions cannot be deleted.')
  db.run('DELETE FROM Payment_Methods WHERE Payment_Method_ID = ?', [id])
  await commitDatabase(db)
}
