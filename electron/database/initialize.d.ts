export interface SetupPreferences {
	username: string;
	currency: string;
	theme: string;
	backupPath: string;
	automaticBackups: boolean;
	frequency: string;
}
export declare function getSetupPreferences(): Promise<SetupPreferences | null>;
export declare function initializeDatabase(preferences: SetupPreferences): Promise<void>;
