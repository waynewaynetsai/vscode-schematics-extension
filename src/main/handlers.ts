import * as vscode from 'vscode';
import { PromptPlayload, SchematicConfig, SchemaDataOptions } from "./model";
import { chain, actionHandler } from "./common/handlerDef";
import { selectedProjects, selectSchnameOptions, selectMultiOptions } from './prompt';
import { workspacePath } from './loader';
import { output } from './output';
import { condOptions } from './conditions';
import * as utils from './utils';

const selectTreeitemHandler = actionHandler((data: PromptPlayload) => {
    const { type, path, rules }  = data.allconfigs!.filter((v: SchematicConfig) => v.schname === data.schname)[0];
    const playload: PromptPlayload = {
        ...data,
        type: type,
        schpath: path,
        rulejson: rules.filter(r=>r.rulename===data.rulename).map(x => x.json)[0]
    };
    return playload;
});

const schSelectHandler = actionHandler(async (data: PromptPlayload) => {
    const replySchname = await selectedProjects(data.allconfigs!.map((x: SchematicConfig) => x.schname));
    const playload: PromptPlayload = {
        ...data,
        schname: replySchname
    };
    return playload;
});

const ruleSelectHandler = actionHandler(async (data: PromptPlayload) => {
    const { type, path, rules } = data.allconfigs!.filter((v: SchematicConfig) => v.schname === data.schname)[0];
    delete data.allconfigs;
    const _rulename = await selectSchnameOptions(rules.map((x) => x.rulename));
    const playload: PromptPlayload = {
        ...data,
        type: type,
        schpath: path,
        rulename: _rulename,
        rulejson: rules.filter(r=>r.rulename===_rulename).map(x => x.json)[0]
    };
    return playload;
});

const filePathHandler = (contextPath: string) => actionHandler(async (data: PromptPlayload) => {
    const playload: PromptPlayload = {
        ...data,
        path: contextPath
    };
    return playload;
});

const multiOptsSelectHandler = actionHandler(async (data: PromptPlayload) => {
    const choices: vscode.QuickPickItem[] = Object.entries(data.rulejson!.properties)
        .map((keyValuePair: [string, SchemaDataOptions]) => ({
            label: keyValuePair[0],
            description: keyValuePair[1].description || keyValuePair[0],
            picked: !!keyValuePair[1]["x-prompt"] || data.rulejson!.required!.includes(keyValuePair[0]) || (keyValuePair[1].format === 'path'),
            required: !!keyValuePair[1]["x-prompt"] || data.rulejson!.required!.includes(keyValuePair[0])
        }));
    const _selectedOptions = await selectMultiOptions('Select your custom setting options')(choices);
    if (_selectedOptions.length === 0) {
        return false;
    }
    // Force required item to be exist in selected array
    const _finalSelectedOpts = Array.from(new Set([..._selectedOptions,...choices.filter((quickpicked: any)=> quickpicked.required)]));
    const playload: PromptPlayload = {
        ...data,
        selectedOpts: _finalSelectedOpts
    };
    return playload;
});

const eachSelectedOptsHandler = actionHandler(async (data: PromptPlayload) => {
    const selectedOpts = data.selectedOpts as vscode.QuickPickItem[];
    const optsChain = (arr: any[]) => selectedOpts.reduce((chain: Promise<any>, item: vscode.QuickPickItem) => {
        return chain.then(async acc => {
            const ret = condOptions(data.path!)({
                setting: data.rulejson!.properties[item.label],
                item: item
            });
            return ret.then((result) => [...acc, result])
                      .catch(err=> console.log('eachSelectedOptsError:', err.toString()));
        });
    }, Promise.resolve([]) as Promise<any>);
    const optsSettings = await optsChain(selectedOpts);
    const playload: PromptPlayload = {
        ...data,
        optsCommands: optsSettings.join(' ')
    };
    return playload;
});

const composeCommandHandler = actionHandler(async (data: PromptPlayload) => {
    const commandStr = (schname: string, rulename: string, options = '') => {
        return (data.type === 'nodemodules') ? `schematics ./node_modules/${schname}/src/collection.json:${rulename} ${options} --dry-run=false`
        : `schematics ${data.schpath}/src/collection.json:${rulename} ${options} --dry-run=false`;
    };
    const command = commandStr(data.schname as string, data.rulename as string, data.optsCommands);
    output.channel.show();
    output.channel.appendLine(command);
    return command;
});

const execCommandHandler = actionHandler(async (cmd: string) => {
    try {
        const stdout = await utils.execCommand(cmd, workspacePath);
        return stdout;
    } catch (error) {
        return error.toString();
    }
});

const stdoutHandler = actionHandler(async (stdout: string) => {
    output.channel.appendLine('');
    output.channel.appendLine(stdout);
});

const commandEffectHandler = chain(
    composeCommandHandler,
    execCommandHandler,
    stdoutHandler
);

const optionsHandler = chain(
    multiOptsSelectHandler,
    eachSelectedOptsHandler
);

const schRuleHandler = chain(
    schSelectHandler,
    ruleSelectHandler
);

export const selectMenuHandler = (contextPath: string) => chain(
    filePathHandler(contextPath),
    schRuleHandler,
    optionsHandler,
    commandEffectHandler
);

export const selectTreeItemHandler = (workspacePath: string) => chain(
    filePathHandler(workspacePath),
    selectTreeitemHandler,
    optionsHandler,
    commandEffectHandler
);