import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
const require = createRequire(import.meta.url);
const loadSqlJs = require('sql.js');
let dbPromise;
export function getDatabasePath() {
	return path.join(app.getPath('userData'), 'dystomentum.db');
}
export function getDatabase() {
	if (!dbPromise) {
		dbPromise = (async () => {
			const dbPath = getDatabasePath();
			const wasmPath = app.isPackaged
				? path.join(process.resourcesPath, 'sqlite', 'sql-wasm.wasm')
				: path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
			const SQL = await loadSqlJs({ locateFile: () => wasmPath });
			const database = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();
			console.log('DATABASE OPENED:', dbPath);
			return database;
		})();
	}
	return dbPromise;
}
