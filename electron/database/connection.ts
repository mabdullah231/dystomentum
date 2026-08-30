import { createRequire } from 'node:module'
import type initSqlJs from 'sql.js'
import type { Database } from 'sql.js'
import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

const require = createRequire(import.meta.url)
const loadSqlJs = require('sql.js') as typeof initSqlJs
let dbPromise: Promise<Database> | undefined

export function getDatabasePath(): string {
	return path.join(app.getPath('userData'), 'dystomentum.db')
}

export function getDatabase(): Promise<Database> {
	if (!dbPromise) {
		dbPromise = (async () => {
			const dbPath = getDatabasePath()
			const wasmPath = app.isPackaged
				? path.join(process.resourcesPath, 'sqlite', 'sql-wasm.wasm')
				: path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
			const SQL = await loadSqlJs({ locateFile: () => wasmPath })
			const database = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database()
			database.run('PRAGMA foreign_keys = ON;')
			console.log('DATABASE OPENED:', dbPath)
			return database
		})()
	}

	return dbPromise
}

export async function resetDatabaseConnection(): Promise<void> {
	if (!dbPromise) return

	const database = await dbPromise
	database.close()
	dbPromise = undefined
}

/** Persist the in-memory sql.js database using an atomic file replacement. */
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
