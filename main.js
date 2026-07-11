const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 220,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // シンプルにするため一時的に無効化
        }
    });
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// フォルダ選択ダイアログを開く
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (result.canceled) {
        return []; // キャンセル時は空の配列を返す
    }
    return result.filePaths;
});

// メインのNode.js処理を実行
ipcMain.on('start-process', async (event, folderPath) => {
    if (!folderPath) return;

    // 模擬処理（プログレスバーを動かす例）
    for (let i = 1; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 30)); // 300ms待機
        event.reply('process-progress', i); // 進捗を画面に送信
    }

    // CSVの作成処理 (例としてフォルダ内に「result.csv」を作成)
    const csvPath = path.join(folderPath, 'result.csv');
    fs.writeFileSync(csvPath, 'Name,Value\nItem1,100\nItem2,200', 'utf-8');

    // 完了通知とCSVパスを送信
    event.reply('process-complete', csvPath);
});

// エクスプローラーでファイルを表示
ipcMain.on('open-explorer', (event, filePath) => {
    shell.showItemInFolder(filePath);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
