import * as vscode from 'vscode';
import { output } from './main/output';
import { setupTreeDataProvider } from './main/treeview';
import { command } from './main/command';

export function activate(context: vscode.ExtensionContext) {

	vscode.commands.executeCommand('setContext', 'isActive', true);
	
	setupTreeDataProvider(context);

	let palatteCmd = vscode.commands.registerCommand('extension.palatte', () => {
		command.execute('selectAll', context);
	});
	let treeItemCmd = vscode.commands.registerCommand('extension.treeItem', (context, options) => {
		command.execute('selectItem', context, options);
	});
	let explorerCmd = vscode.commands.registerCommand('extension.menu', async (context, options) => {
		command.execute('selectAll', context);
	});
	context.subscriptions.push(palatteCmd, explorerCmd, treeItemCmd);
}

export function deactivate(context: vscode.ExtensionContext) {
	output.dispose();
	command.dispose();
}

