import * as vscode from 'vscode';
import * as path from 'path';
import { PackageJSON, CollectionData, SchematicConfig } from './model';
import { pipe, wait, catchAsync } from './common/fp';
import * as utils from './utils/index';

const getWorkspaceSettings = () => ({
	nodemodules: vscode.workspace.getConfiguration().get<string[]>(`extschematics.nodemodules`, []),
	local: vscode.workspace.getConfiguration().get<string[]>(`extschematics.localpath`, [])
});

const getCollectionJson = (cwd: string) =>  (schnames: any) => {
	const fromNodemodules = schnames.nodemodules.map(async (schProjname: any) => {
		const packagejson = await utils.parseJSONFile<PackageJSON>(path.join(cwd, 'node_modules', schProjname, 'package.json'));
		if (!packagejson || !packagejson.schematics) return false;
		const _path = path.join(cwd,'node_modules', schProjname, utils.trimRelativePath(packagejson.schematics));
		return {
			'type': 'nodemodules',
			'schpath': _path,
			'name': schProjname,
			'json': {
				...await utils.parseJSONFile<CollectionData>(path.join(cwd, 'node_modules', schProjname, utils.trimRelativePath(packagejson.schematics))),
				path: _path
			}
		};
	});
	const fromAbsPath = schnames.local.map(async (absPath: any) => {
		const schProjname = path.basename(absPath);
		const packagejson = await utils.parseJSONFile<PackageJSON>(path.join(absPath,'package.json'));
		if (!packagejson || !packagejson.schematics) return false;
		const _path = path.join(absPath ,utils.trimRelativePath(packagejson.schematics));
		return {
			'schpath': absPath,
			'type': 'fromAbsPath', 
			'name': schProjname,
			'json': {
				...await utils.parseJSONFile<CollectionData>(path.join(absPath, utils.trimRelativePath(packagejson.schematics))),
				path: _path
			}
		};
	});
	return Promise.all([...fromNodemodules, ...fromAbsPath]);
};

const getSchemaJsonsSetting = (cwd: string) => (collectionSettings: any[]) => {
	const ret = !!collectionSettings.map&&collectionSettings.map(async (collection: any) => {
		const { name, json, type, schpath } = collection;
		const rules = !!json && Object.keys(json.schematics).map(async (schemaKey) => {
			const _path = !!(json.schematics[`${schemaKey}`].schema) && path.join(
				utils.getDirectoryFromFilename(json!.path),
				utils.trimRelativePath((json.schematics[`${schemaKey}`]).schema)
			);
			const schema_json = (_path) ? await utils.parseJSONFile<CollectionData>(_path) : {};
			return {
				'rulename': schemaKey,
				'json': schema_json
			};
		});
		return {
			'type': type,
			'path': schpath,
			'schname': name,
			'rules': rules&&await Promise.all(rules as any)
		};
	});
	return Promise.all(ret);
};

const log = (err: Error) => console.log('LoadingPipe Error', err.toString());

export const workspacePath = vscode.workspace.workspaceFolders![0].uri.path;

const schemaJsonsSetting = pipe(
	getWorkspaceSettings,
	wait(getCollectionJson(workspacePath)),
	wait(getSchemaJsonsSetting(workspacePath)),
	catchAsync(log)
);

const cache = new Map<string, SchematicConfig[]>();
const load = async () => {
		const configs = await schemaJsonsSetting();
		cache.set('JsonsSetting', configs);
		return configs;
};
export const loadConfig = async () => cache.get('JsonsSetting') ? cache.get('JsonsSetting') : await load(); 
