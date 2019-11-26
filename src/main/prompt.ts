import * as vscode from 'vscode';
import * as path from 'path';
import { workspacePath } from './loader';

export const selectedProjects = async (sortedChoices: any[]) => await vscode.window.showQuickPick(sortedChoices, {
    canPickMany: false,
    placeHolder: `Select your Schematics Project`,
    ignoreFocusOut: true,
}) || [];

export const selectSchnameOptions = async (sortedChoices: any[]) => await vscode.window.showQuickPick(sortedChoices, {
    canPickMany: false,
    placeHolder: `Select your Schematics Template Function`,
    ignoreFocusOut: true,
}) || [];

export const selectOptions = (_placeHolder?: string, _prompt?: string) => async (sortedChoices: any[]) => await vscode.window.showQuickPick(sortedChoices, {
    canPickMany: false,
    placeHolder: _placeHolder,
    prompt: _prompt,
    ignoreFocusOut: true,
} as vscode.QuickPickOptions) || [];

export const selectMultiOptions = (_placeHolder: string, _prompt?: string) => async (sortedChoices: any[]) => await vscode.window.showQuickPick(sortedChoices, {
    canPickMany: true,
    placeHolder: _placeHolder,
    prompt: _prompt,
    ignoreFocusOut: false,
} as vscode.QuickPickOptions) || [];

export const inputDefaultPath = async (selectedPath = ''): Promise<string | undefined> => {

    let prompt = `Enter Generate file path in your project.
    <HINT> If you right-click on the directory then the default path will be the path where you want to generate files.`;
    const isFile = path.basename(selectedPath).includes('.');
    const defaultPath = isFile ?
        path.relative(workspacePath, path.dirname(selectedPath))
        : path.relative(workspacePath, selectedPath);

    return vscode.window.showInputBox({
        prompt,
        value: defaultPath,
        valueSelection: [defaultPath.length, defaultPath.length],
        ignoreFocusOut: false,
    } as vscode.InputBoxOptions);

};