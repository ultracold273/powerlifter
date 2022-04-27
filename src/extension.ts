// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as https from 'https';
import * as fs from 'fs';
import * as zip from 'adm-zip';
import { IncomingMessage } from 'http';
import * as path from 'path';


function storeLogs(response: IncomingMessage, id: string, storage: vscode.Uri): Thenable<vscode.Uri> {
	return new Promise((resolve, reject) => {
		const filename = `files-${id}.zip`;
		const targetUri = vscode.Uri.joinPath(storage, filename);

		const file = fs.createWriteStream(targetUri.fsPath);
		response.pipe(file);
		file.on('finish', () => {
			resolve(targetUri);
		});
		file.on('error', (_) => {
			reject();
		});
	});
}

function downloadLogs(id: string, cookies: PowerliftCookie, storage: vscode.Uri): Thenable<vscode.Uri> {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: 'powerlift.acompli.net',
			port: 443,
			path: `/gym/incidents/${id}/files.zip`,
			method: 'GET'
		};

		const request = https.request(options, response => {
			console.log(`${response.statusCode}`);
			switch (response.statusCode) {
				case undefined:
					reject();
					break;
				case 200:
					resolve(storeLogs(response, id, storage));
					break;
				default: reject();
			}
		});

		request.setHeader('Cookie', [
			`ai_user=${cookies.aiUser}`,
			`ai_authUser=${cookies.aiAuthUser}`,
			`SESSION=${cookies.session}`
		]);

		request.on('error', reject);
		request.end();
	});
}

function uncompressLogs(zipUri: vscode.Uri): Thenable<vscode.Uri> {
	return new Promise((resolve, reject) => {
		const zipPath = zipUri.fsPath;
		console.log(`Zip file located at ${zipPath}`);
		if (!zipPath.endsWith('.zip')) {
			reject();
		}
		const folderPath = zipPath.substring(0, zipPath.length - 4);
		const folderUri = vscode.Uri.file(folderPath);
		console.log(`Extract to ${folderPath}`);
		const zipFile = new zip(zipPath);
		zipFile.extractAllTo(folderUri.fsPath);
		resolve(folderUri);
	});
}

function commonErrorHandler(reason: any) {
	console.error(`Error ${reason}`);
	vscode.window.showErrorMessage(`Error ${reason}`);
}

interface PowerliftCookie {
	session: string,
	aiUser: string,
	aiAuthUser: string
}

// Read powerlift cookies in the vscode settings
function readPowerliftCookies(): PowerliftCookie {
	const cookieConfig = vscode.workspace.getConfiguration('powerlifter.cookie');
	const cookies = {
		session: cookieConfig.get<string>('session')!,
		aiUser: cookieConfig.get<string>('aiUser')!,
		aiAuthUser: cookieConfig.get<string>('aiAuthUser')!,
	};

	return cookies;
}

// Validate the cookies 
function validateCookies(cookie: PowerliftCookie): boolean {
	return cookie.session !== "" && cookie.aiUser !== "" && cookie.aiAuthUser !== "";
}

function getLogStorage(defaultStorageUri: vscode.Uri) {
	const setting = vscode.workspace.getConfiguration('powerlifter.settings');
	const storageLocation = setting.get<string>('logStorageLocation')!;
	let useDefaultStorage = storageLocation === "";
	console.log(`Setting Storage Location: ${storageLocation}`);
	try {
		const stats = fs.statSync(storageLocation);
		useDefaultStorage = !stats.isDirectory();
	} catch (error) {
		useDefaultStorage = true;
	}
	console.log(`Use default storage: ${useDefaultStorage}`);

	if (useDefaultStorage) {
		if (!fs.existsSync(defaultStorageUri.fsPath)) {
			fs.mkdirSync(defaultStorageUri.fsPath);
		}
		return defaultStorageUri;
	} else {
		return vscode.Uri.file(storageLocation);
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "powerlifter" is now active!');

	const storageUri = getLogStorage(context.globalStorageUri);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let openLogsDisposable = vscode.commands.registerCommand('powerlifter.openLogs', () => {
		const cookies = readPowerliftCookies();
		if (validateCookies(cookies)) {
			vscode.window.showInputBox({ prompt: 'Enter Session Id: ' })
				.then(id => {
					console.log(`Get ID from input: ${id}`);
					if (id !== undefined) {
						// return downloadLogs(id, cookies, storageUri);
						return vscode.window.withProgress({
							location: vscode.ProgressLocation.Notification
						}, (progress, token) => {
							progress.report({ message: 'Downloading logs..' });
							return downloadLogs(id, cookies, storageUri).then(zipUri => {
								progress.report({ message: 'Uncompressing logs..' });
								return uncompressLogs(zipUri);
							}, commonErrorHandler);
						});
					}
				}, commonErrorHandler)
				.then(folderUri => {
					if (folderUri !== undefined) {
						console.log(`Opening folder ${folderUri.fsPath}`);
						if (fs.existsSync(folderUri.fsPath)) {
							vscode.commands.executeCommand('vscode.openFolder', folderUri);
						} else {
							vscode.window.showErrorMessage('Error!');
						}
					}
				});
		} else {
			vscode.window.showErrorMessage('Please check the cookie settings.');
		}
	});

	context.subscriptions.push(openLogsDisposable);

	let clearLogsDisposable = vscode.commands.registerCommand('powerlifter.clearLogs', () => {
		try {
			console.log(`Clearing all files in ${storageUri.fsPath}`);
			const files = fs.readdirSync(storageUri.fsPath);
			for (const file of files) {
				const isZipLog = file.match(/^files-[\w-]+.zip/g) !== null;
				const isLogFolder = file.match(/^files-[\w-]+$/g) !== null;
				if (isZipLog || isLogFolder) {
					console.log(`Deleting ${file}`);
					fs.rmSync(path.join(storageUri.fsPath, file), { recursive: true });
				}
			}
		} catch (error) {
			commonErrorHandler(error);
		}
		console.log('Clearing done!');
	});

	context.subscriptions.push(clearLogsDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
