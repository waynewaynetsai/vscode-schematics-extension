import * as vscode from 'vscode';

class OutputChannel {
    _channel: vscode.OutputChannel | null = null;
    constructor() { }
    get channel(): vscode.OutputChannel {
        if (!this._channel) {
            this._channel = vscode.window.createOutputChannel('Schematic Extension');
        }
        return this._channel;
    }
    dispose(): void {
        if (this._channel) {
            this._channel.dispose();
        }
    }
}

export const output = new OutputChannel();
