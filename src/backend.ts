// フォルダ選択ダイアログを開く
import {dialog, ipcMain, shell} from 'electron'
import path from 'path'
import fs from 'fs'

let selectedFilePath: string
let files: string[]
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (result.canceled) {
        return null
    }

    selectedFilePath = result.filePaths[0]
    return selectedFilePath
})
ipcMain.handle('get-target-files', async () => {
    if(isExistDirectory(selectedFilePath)) {
        files = fs.globSync(`${selectedFilePath}/**/*.sql`, {
            exclude: ['node_modules/**', 'dist/**'] // 除外したいパターン
        })
        return files
    }
    return []
})

// メインのNode.js処理を実行
ipcMain.on('start-process', async (event, folderPath) => {
    if (!folderPath) return

    // CSVの作成処理 (例としてフォルダ内に「result.csv」を作成)
    const csvPath = path.join(folderPath, 'result.csv')
    const bom = '\uFEFF';
    fs.writeFileSync(csvPath, `${bom}絶対パス,相対パス,サイズ
`, {encoding: 'utf-8'})
    files.forEach((filePath, index) => {
        event.reply('process-progress', index, files.length, filePath) // 進捗を画面に送信

        const fileSize = fs.statSync(filePath).size
        const relativeFilePath = filePath.replace(selectedFilePath, '')
        fs.writeFileSync(csvPath, `${filePath},${relativeFilePath},${fileSize}\n`, {flag: 'a', encoding: 'utf-8'})
    })

    // 完了通知とCSVパスを送信
    event.reply('process-complete', csvPath)
})

// エクスプローラーでファイルを表示
ipcMain.on('open-in-explorer', (event, filePath) => {
    shell.showItemInFolder(filePath)
})

// ファイルを開く
ipcMain.on('open-file', async (event, filePath) => {
    await shell.openPath(filePath)
})


/**
 * 実在するディレクトリか判定
 * @param dirPath
 */
function isExistDirectory(dirPath: string): boolean {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
}