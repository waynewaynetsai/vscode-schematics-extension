
import * as vscode from 'vscode';
import * as path from 'path';
import { loadConfig } from './loader';
import { Rule, SchematicConfig, TreeItemOptions } from './model';

export function setupTreeDataProvider(context: vscode.ExtensionContext) {
    vscode.window.registerTreeDataProvider('SchematicsView', new TreeDataProvider());
}

class TreeItem extends vscode.TreeItem {
    children: TreeItem[] | undefined;
    constructor(label: string, children?: TreeItem[]) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None :
                vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
    }
}

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    onDidChangeTreeData?: vscode.Event<TreeItem | null | undefined> | undefined;

    data: TreeItem[] = [];
    items: vscode.TreeItem[] = [];
    constructor() {
        this.setupTreeItem();
    }
    async setupTreeItem() {
        
        const jsonArray: any[] = await loadConfig();
        this.data = await !!jsonArray.map&&jsonArray.map((sch: SchematicConfig) => {
            return !!sch.rules.map&&new TreeItem(sch.schname,
                sch.rules.map((rule: Rule) => {
                    const item = new TreeItem(rule.rulename);
                    item.command = {
                        title: `Generate ${rule.rulename}`,
                        command: 'extension.treeItem',
                        arguments: [null, { 
                            schname: sch.schname, 
                            rulename: rule.rulename 
                        } as TreeItemOptions]
                    };
                    const schematicsExtension = vscode.extensions.getExtension('shangweitsai.schematics-extension') as vscode.Extension<unknown>;
                    const defaultIconPath = path.join(schematicsExtension.extensionPath, 'schematics.svg');
                    item.iconPath = vscode.Uri.file(defaultIconPath);
                   return item;
                })
            );
        });
    }

    getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
}