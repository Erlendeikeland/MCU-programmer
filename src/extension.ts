import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let workspaceState: vscode.Memento;

let sourcePath : string | undefined;
let destinationPath : string | undefined;

export async function activate(context: vscode.ExtensionContext) {
    workspaceState = context.workspaceState;

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    statusBarItem.text = '$(files) .hex';
    statusBarItem.command = 'mcu-programmer.copyFirmwareHex';
    statusBarItem.show();

    vscode.commands.registerCommand('mcu-programmer.resetStoredPaths', async () => {
        // Reset all stored path keys
        workspaceState.update('sourcePath', undefined);
        workspaceState.update('destinationPath', undefined);
        
        vscode.window.showInformationMessage('Stored paths reset');
    });

    vscode.commands.registerCommand('mcu-programmer.setSourcePath', async () => {
        // Open file dialog and set sourcePath to the selected file
        const tempPath = await openFileDialog();

        if (tempPath !== undefined) {
            sourcePath = tempPath;

            workspaceState.update('sourcePath', sourcePath);

            vscode.window.showInformationMessage('firmware.hex source path set to: ' + sourcePath);
            return;
        }

        vscode.window.showErrorMessage('Could not set firmware.hex source path');
    });

    vscode.commands.registerCommand('mcu-programmer.setDestinationPath', async () => {
        // Open folder dialog and set destinationPath to the selected folder + firmware.hex
        const tempPath = await openFolderDialog();

        if (tempPath !== undefined) {
            destinationPath = tempPath;

            workspaceState.update('destinationPath', tempPath);

            vscode.window.showInformationMessage('firmware.hex destination path set to: ' + destinationPath);
            return;
        }

        vscode.window.showErrorMessage('Could not set firmware.hex destination path');
    });

    vscode.commands.registerCommand('mcu-programmer.copyFirmwareHex', async () => {
        // Update source and destination paths
        if (!await chooseSourcePath()) {
            vscode.window.showErrorMessage('Could not set source path');
            return;
        }

        if (!await chooseDestinationPath()) {
            vscode.window.showErrorMessage('Could not set destination path');
            return;
        }

        // Copy file
        if (sourcePath !== undefined && destinationPath !== undefined) {
            fs.copyFile(sourcePath, path.resolve(destinationPath, 'firmware.hex'), (err) => {
                if (err) {
                    vscode.window.showErrorMessage('Could not copy file: ' + err);
                }
                else {
                    vscode.window.showInformationMessage('File copied from: ' + sourcePath + ' to: ' + destinationPath + '\\firmware.hex');
                }
            });
        }
        else {
            vscode.window.showErrorMessage('Could not copy file');
        }
    });
}

async function chooseDestinationPath() {
    // Check if stored path is valid
    const storedPath = workspaceState.get('destinationPath');

    if (storedPath !== undefined) {
        // Check if path stored in destinationPath key is a valid path
        if (storedPath !== undefined && typeof storedPath === 'string') {
            if (fs.existsSync(storedPath)) {
                destinationPath = storedPath;

                return true;
            }
        }
        else {
            // Remove destinationPath key if path is not valid
            workspaceState.update('destinationPath', undefined);
        }
    }

    // If no valid path is found, ask the user to select a path
    const tempPath = await openFolderDialog();

    if (tempPath !== undefined) {
        destinationPath = tempPath;

        workspaceState.update('destinationPath', destinationPath);

        return true;
    }

    return false;
}

async function chooseSourcePath() {
    // Check if stored path is valid
    const storedPath = workspaceState.get('sourcePath');

    if (storedPath !== undefined) {
        // Check if path stored in sourcePath key is a valid path
        const storedPath = workspaceState.get('sourcePath');

        if (storedPath !== undefined && typeof storedPath === 'string') {
            if (fs.existsSync(storedPath)) {
                sourcePath = storedPath;
                return true;
            }
        }
        else {
            // Remove sourcePath key if path is not valid
            workspaceState.update('sourcePath', undefined);
        }
    }

    // If no valid path is stored in sourcePath key, try to find the default path
    if (vscode.workspace.workspaceFolders !== undefined) {
        const foundHexFilePath = findHexFileInFolders(path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, '.pio'));

        if (foundHexFilePath !== undefined) {
            sourcePath = foundHexFilePath;

            workspaceState.update('sourcePath', sourcePath);

            return true;
        }
    }

    // If no valid path is found, ask the user to select a path
    const tempPath = await openFileDialog();

    if (tempPath !== undefined) {
        sourcePath = tempPath;

        workspaceState.update('sourcePathSet', true);
        workspaceState.update('sourcePath', sourcePath);

        return true;
    }

    return false;
}

async function openFolderDialog() {
    // Open folder dialog and return the path
    const result = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: 'Select firmware.hex destination folder'
    });

    if (result !== undefined) {
        return result[0].fsPath;
    }
    return undefined;
}

async function openFileDialog() {
    // Open file dialog and return the path
    const result = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        title: 'Select firmware.hex source folder'
    });

    if (result !== undefined) {
        if (result[0].fsPath.endsWith('firmware.hex')) {
            return result[0].fsPath;
        }
    }
    return undefined;
}

function findHexFileInFolders(startPath: string): string | undefined {
    // Recursively search for firmware.hex file in all subfolders, return the path if found
    if (!fs.existsSync(startPath)) {
        return undefined;
    }

    if (startPath.endsWith('firmware.hex')) {
        return startPath;
    }

    const files = fs.readdirSync(startPath);

    for (const file of files) {
        const filePath = path.join(startPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            const result = findHexFileInFolders(filePath);

            if (result !== null) {
                return result;
            }
        }
        else if (file === 'firmware.hex') {
            return filePath;
        }
    }
}