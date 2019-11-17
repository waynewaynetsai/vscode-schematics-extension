import * as vscode from 'vscode';
import { SchematicConfig, SchemaData } from ".";

export type PromptPlayload = {
    allconfigs?: SchematicConfig[];
    type?: string;
    schpath?: string;
    schname?: string;
    rulename?: string;
    contextPath?: string;
    path?: string;
    rulejson?: SchemaData;
    options?: Object;
    selectedOpts?: vscode.QuickPickItem[],
    optsCommands?: string;
};