
import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { workspacePath, loadConfig } from './loader';
import { MenuContext, PromptPlayload, TreeItemOptions } from './model';
import { selectTreeItemHandler, selectMenuHandler } from './handlers';

const evtm = new EventEmitter();

evtm.on('selectAll', async (context: MenuContext) => {
    const path = context.path ? context.path : workspacePath;
    selectMenuHandler(path).handle({ 
        allconfigs: await loadConfig() 
    } as PromptPlayload);
});

evtm.on('selectItem', async  (__, options: TreeItemOptions) => {
    if (!options) {
        vscode.window.showInformationMessage('Please select explorer item instead of execute explorer command on palette!');
    }
    selectTreeItemHandler(workspacePath).handle({
        ...options,
        allconfigs: await loadConfig()  
    } as PromptPlayload);
});

export const command = {
    execute: (evtname: string, context: any, options?: any) => evtm.emit(evtname, context, options),
    dispose: () => evtm.eventNames().forEach(x => evtm.removeAllListeners(x))
};