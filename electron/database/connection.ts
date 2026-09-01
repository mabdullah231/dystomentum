// import { createRequire } from 'node:module'
// import type initSqlJs from 'sql.js'
// import type { Database } from 'sql.js'
// import fs from 'node:fs'
// import path from 'node:path'
// import { app } from 'electron'

// const require = createRequire(import.meta.url)
// const loadSqlJs = require('sql.js') as typeof initSqlJs
// let dbPromise: Promise<Database> | undefined

// export function getDatabasePath(): string {
// 	return path.join(app.getPath('userData'), 'dystomentum.db')
// }

// export function getDatabase(): Promise<Database> {
// 	if (!dbPromise) {
// 		dbPromise = (async () => {
// 			const dbPath = getDatabasePath()
// 			const wasmPath = app.isPackaged
// 				? path.join(process.resourcesPath, 'sqlite', 'sql-wasm.wasm')
// 				: path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
// 			const SQL = await loadSqlJs({ locateFile: () => wasmPath })
// 			const database = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database()
// 			database.run('PRAGMA foreign_keys = ON;')
// 			console.log('DATABASE OPENED:', dbPath)
// 			return database
// 		})()
// 	}

// 	return dbPromise
// }

// export async function resetDatabaseConnection(): Promise<void> {
// 	if (!dbPromise) return

// 	const database = await dbPromise
// 	database.close()
// 	dbPromise = undefined
// }

// /** Persist the in-memory sql.js database using an atomic file replacement. */
// export async function commitDatabase(database?: Database): Promise<void> {
// 	const db = database ?? await getDatabase()
// 	const databasePath = getDatabasePath()
// 	const directory = path.dirname(databasePath)
// 	const temporaryPath = path.join(directory, `.dystomentum-${process.pid}-${Date.now()}.tmp`)

// 	fs.mkdirSync(directory, { recursive: true })

// 	try {
// 		fs.writeFileSync(temporaryPath, Buffer.from(db.export()))
// 		fs.renameSync(temporaryPath, databasePath)
// 	} catch (error) {
// 		if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath)
// 		throw error
// 	}
// }


import { createRequire } from 'node:module'
import type initSqlJs from 'sql.js'
import type { Database } from 'sql.js'
import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

const require = createRequire(import.meta.url)
const loadSqlJs = require('sql.js') as typeof initSqlJs
let dbPromise: Promise<Database> | undefined
let currentMode: 'wasm' | 'asm' = 'wasm' // track which mode is used

export function getDatabasePath(): string {
  return path.join(app.getPath('userData'), 'dystomentum.db')
}

function getWasmPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'sqlite', 'sql-wasm.wasm')
    : path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
}

function getAsmPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'sqlite', 'sql-asm.js')
    : path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-asm.js')
}

async function createDatabaseWithFallback(): Promise<Database> {
  const dbPath = getDatabasePath()
  const exists = fs.existsSync(dbPath)
  const fileBuffer = exists ? fs.readFileSync(dbPath) : undefined

  // First, try WASM
  try {
    const wasmPath = getWasmPath()
    const SQL = await loadSqlJs({
      locateFile: () => wasmPath,
    })
    const db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database()
    db.run('PRAGMA foreign_keys = ON;')
    currentMode = 'wasm'
    console.log('DATABASE OPENED (WASM):', dbPath)
    return db
  } catch (wasmError) {
    console.warn('WASM initialization failed, falling back to asm.js:', wasmError)
    // Fallback to asm.js
    try {
      const asmPath = getAsmPath()
      const SQL = await loadSqlJs({
        locateFile: () => asmPath,
        useAsmJS: true,
      })
      const db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database()
      db.run('PRAGMA foreign_keys = ON;')
      currentMode = 'asm'
      console.log('DATABASE OPENED (asm.js):', dbPath)
      return db
    } catch (asmError) {
      console.error('Both WASM and asm.js failed:', asmError)
      throw new Error('Unable to initialize SQLite. Please ensure your system meets the minimum requirements.')
    }
  }
}

export function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = createDatabaseWithFallback()
  }
  return dbPromise
}

export async function resetDatabaseConnection(): Promise<void> {
  if (!dbPromise) return
  const database = await dbPromise
  database.close()
  dbPromise = undefined
}

export async function commitDatabase(database?: Database): Promise<void> {
  const db = database ?? await getDatabase()
  const databasePath = getDatabasePath()
  const directory = path.dirname(databasePath)
  const temporaryPath = path.join(directory, `.dystomentum-${process.pid}-${Date.now()}.tmp`)

  fs.mkdirSync(directory, { recursive: true })

  try {
    fs.writeFileSync(temporaryPath, Buffer.from(db.export()))
    fs.renameSync(temporaryPath, databasePath)
  } catch (error) {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath)
    throw error
  }
}