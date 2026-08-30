# Dystomentum Distribution Notes

Dystomentum is an offline-first desktop ledger for personal income and expense tracking. It runs as an Electron application with a React renderer and a local SQLite database powered by `sql.js`.

## Current Feature Set

- First-run onboarding for username, currency, theme, database location display, backup folder, automatic backups, and backup frequency.
- Application settings for username, app name, currency, theme, backup folder, automatic backup toggle, backup schedule, and preference reset.
- Transaction ledger with create, read, update, delete, filtering, sorting, pagination, and detail inspection.
- Category and payment method management with icon/color selection and database-backed CRUD.
- Dashboard, income, expense, and reports views backed by local ledger aggregation APIs.
- Export workspace for CSV, JSON, XLSX, and SQLite database copy exports.
- Backup and restore manager with snapshot creation, restore, deletion, and integrity checks.
- Desktop-style keyboard shortcuts with browser refresh shortcuts disabled.
- Local-only data storage. No account, server, cloud sync, telemetry, or internet dependency is required.

## Local Data

The primary database is stored under Electron's app data directory:

```text
%APPDATA%\Dystomentum\dystomentum.db
```

The application currently uses these database tables:

- `Application_Settings`: persisted user preferences such as username, app name, currency, theme, backup location, automatic backup state, and first-launch status.
- `Categories`: income and expense categories, including icon/color metadata.
- `Payment_Methods`: payment methods for expenses, including icon/color metadata.
- `Income`: income ledger records.
- `Expense`: expense ledger records.
- `Backup_History`: local backup snapshot records and disk-existence checks.
- `Export_History`: recent export file records.

## Build

Install dependencies first:

```powershell
npm install
```

Create the production build and Windows installer:

```powershell
npm run build
```

Expected Windows outputs:

```text
release\0.0.0\win-unpacked\Dystomentum.exe
release\0.0.0\Dystomentum-Windows-0.0.0-Setup.exe
```

For taskbar identity testing, launch the packaged executable:

```powershell
.\release\0.0.0\win-unpacked\Dystomentum.exe
```

Running the dev process can still show Electron in some Windows shell surfaces because the active executable is Electron's development binary.

## Packaging Identity

The Electron Builder config uses:

- `appId`: `com.dystomentum.app`
- `productName`: `Dystomentum`
- `executableName`: `Dystomentum`
- App icon: `public/branding/Icon.png`
- Windows target: NSIS x64 installer

If Windows keeps an old taskbar icon/name after installing a new build, unpin the old icon, uninstall the older build if needed, and pin the new `Dystomentum.exe`.

## Export And Backup

Exports are written to the selected folder and tracked in `Export_History`.

Backups are database snapshot copies written to the configured backup folder and tracked in `Backup_History`. The backend integrity job checks whether recorded backup files still exist and creates a scheduled backup when automatic backups are enabled and due.

Restore replaces the current database with the selected backup and creates a pre-restore checkpoint beside the active database.

## Free Distribution Options

Good free places to publish early builds:

- GitHub Releases: best default for open-source or public beta installers.
- Itch.io: good for simple public downloads with a nicer project page.
- SourceForge: acceptable for traditional Windows installer hosting.
- Google Drive, OneDrive, or Dropbox public links: quick private testing, less polished for public release.

For a public launch, GitHub Releases plus a short landing README is the simplest clean path.

## Pre-Release Checklist

- Run `npm run build`.
- Launch `release\0.0.0\win-unpacked\Dystomentum.exe`.
- Confirm taskbar name/icon from the packaged executable.
- Create one income transaction and one expense transaction.
- Confirm dashboard, income, expense, and reports update.
- Change currency in settings and confirm non-dashboard pages reflect it.
- Create CSV, JSON, XLSX, and SQLite exports.
- Create a backup, delete one backup, and restore from a test backup.
- Run `npm audit` and decide whether to replace or accept vulnerable dependencies before public release.
