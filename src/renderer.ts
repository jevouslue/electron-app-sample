/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  })
 * ```
 */
import './index.css'

let generatedCsvPath = ''

// DOM要素の取得（型アサーションを使って具象型を指定）
const inputPath = document.getElementById('input-path') as HTMLInputElement
const btnSelect = document.getElementById('btn-select') as HTMLButtonElement
const btnStart = document.getElementById('btn-start') as HTMLButtonElement

const actionArea = document.getElementById('action-area') as HTMLDivElement
const progressArea = document.getElementById('progress-area') as HTMLDivElement
const completeArea = document.getElementById('complete-area') as HTMLDivElement

const progressBar = document.getElementById('progress-bar') as HTMLProgressElement
const progressText = document.getElementById('progress-text') as HTMLSpanElement
const progressingFile = document.getElementById('progressing-file') as HTMLSpanElement
const csvLink = document.getElementById('csv-link') as HTMLAnchorElement
const csvFolderLink = document.getElementById('csv-folder-link') as HTMLAnchorElement

/**
 * 各種UIの表示状態初期化
 */
function resetUI(): void {
    actionArea.style.display = 'block'
    progressArea.style.display = 'none'
    completeArea.style.display = 'none'

    progressBar.value = 0
    progressText.textContent = '0%'
    generatedCsvPath = ''

    btnSelect.disabled = false
    inputPath.disabled = false
}

/**
 * 入力値の状態に応じて実行ボタンの活性/非活性を切り替え
 */
async function toggleStartButton(): Promise<void> {
    btnStart.disabled = true
    btnStart.textContent = 'パスを指定してください'

    const dirPath = inputPath.value.trim()
    if (dirPath !== '') {
        const targetFiles = await window.electronAPI.getTargetFiles()
        if (targetFiles.length === 0) {
            btnStart.textContent = `対象のファイルが見つかりません`
            return
        }
        btnStart.disabled = false
        btnStart.textContent = `${targetFiles.length}ファイルを処理`
    }
}

/**
 * テキストボックス入力時のイベントリスナー
 */
inputPath.addEventListener('input', async () => {
    resetUI()
    await toggleStartButton()
})

/**
 * フォルダ参照ボタンクリック時のイベントリスナー
 * ディレクトリ選択ダイアログを開く
 */
btnSelect.addEventListener('click', async () => {
    resetUI()

    const selectedPaths = await window.electronAPI.selectFolder()
    if (selectedPaths) {
        inputPath.value = selectedPaths
    }
    await toggleStartButton()
})

/**
 * 実行ボタンクリック時のイベントリスナー
 */
btnStart.addEventListener('click', () => {
    const targetFolder = inputPath.value.trim()
    if (!targetFolder) return

    resetUI()
    btnSelect.disabled = true
    inputPath.disabled = true

    actionArea.style.display = 'none'
    progressArea.style.display = 'block'

    window.electronAPI.startProcess(targetFolder)
})

/**
 * 進捗の更新時のイベントリスナー
 * プログレスバーの更新
 */
window.electronAPI.onProgress((doneNum, totalNum, filePath) => {
    const value = Math.floor((doneNum / totalNum) * 100)
    progressBar.value = value
    progressText.textContent = `${doneNum} / ${totalNum} (${value}%)`
    progressingFile.textContent = filePath
})

/**
 * 完了時のイベントリスナー
 */
window.electronAPI.onComplete((csvPath) => {
    generatedCsvPath = csvPath

    btnSelect.disabled = false
    inputPath.disabled = false

    actionArea.style.display = 'none'
    progressArea.style.display = 'none'
    completeArea.style.display = 'block'
})

/**
 * リンククリック時のイベントリスナー
 * エクスプローラーを開く
 */
csvLink.addEventListener('click', () => {
    if (generatedCsvPath) {
        window.electronAPI.openFile(generatedCsvPath)
    }
})

/**
 * フォルダリンククリック時のイベントリスナー
 * エクスプローラーを開く
 */
csvFolderLink.addEventListener('click', () => {
    if (generatedCsvPath) {
        window.electronAPI.openInExplorer(generatedCsvPath)
    }
})

/**
 * エラー時のイベントリスナー
 * ディレクトリ再選択可能に
 */
window.electronAPI.onError(() => {
    btnSelect.disabled = false
    inputPath.disabled = false
})