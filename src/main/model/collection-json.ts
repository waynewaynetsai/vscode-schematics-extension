import { SchemaData } from "./schema-json";

export interface SchematicConfig {
	type: string;
    schname: string;
	rules: Rule[];
	path: string;
}
export interface Rule {
    rulename: string;
    json: SchemaData;
}

export interface PackageJSON {
	schematics?: string;
}
export interface CollectionData {
	path: string;
	schematics: {
		[key: string]: CollectionDataSchema;
	};
}
export interface CollectionDataSchema {
	schema: string;
	description: string;
	hidden?: boolean;
	extends?: string;
}