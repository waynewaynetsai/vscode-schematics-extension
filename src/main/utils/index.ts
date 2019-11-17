// Schematics Extension's serval utilities were edited from 'Angular schematics extension for Visual Studio Code ', Author: Cyrille Tuzi. 
// MIT LICENSE: "https://github.com/cyrilletuzi/vscode-angular-schematics/blob/master/LICENSE"

import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as childProcess from 'child_process';
import { normalize as normalizePath, relative as relativePath} from './path';

export const relative = (from: string, to: string) => path.relative(from, to);

export const normalize = (path: string) => normalizePath(path);

export const existsAsync = (path: string): Promise<boolean> => (util.promisify(fs.exists))(path);

export const readFileAsync = (path: string): Promise<string> => (util.promisify(fs.readFile))(path, 'utf8');

export const getDirFromFilePath = (filePath: string): string => path.dirname(filePath);

export const trimRelativePath = (path: string): string => path.replace('./', '');

export const getDirectoryFromFilename = (filename: string): string => filename.replace(/[^\/]*$/, '');

export const execCommand = (command: string, cwd?: string): Promise<string> => new Promise((resolve, reject) => {
    childProcess.exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
            reject([stdout, stderr]);
        } else {
            resolve(stdout!);
        }
    });
});
// tslint:disable-next-line:no-unused-expression
export const parseJSONFile = async <T extends unknown>(path: string): Promise<T | null> => {
    let json: T | null = null;
    try {
        let data: string = await readFileAsync(path);
        /* Angular Material schematics have comments, Angular Schematics Extension Team remove them as it's not JSON compliant */
        if (path.includes('@angular/material')) {
            data = data.split('\n').map((line) => line.replace(/^ *\/\/.*/, '')).join('\n');
        }
        json = JSON.parse(data) as T;
    } catch (error) {
        console.log('ParseJSON ERROR', error);
    }
    return json;
};