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
 *  });
 * ```
 */
import './index.css';


let generatedCsvPath = '';

// DOM要素の取得（型アサーションを使って具象型を指定）
const inputPath = document.getElementById('input-path') as HTMLInputElement;
const btnSelect = document.getElementById('btn-select') as HTMLButtonElement;
const btnStart = document.getElementById('btn-start') as HTMLButtonElement;

const actionArea = document.getElementById('action-area') as HTMLDivElement;
const progressArea = document.getElementById('progress-area') as HTMLDivElement;
const completeArea = document.getElementById('complete-area') as HTMLDivElement;

const progressBar = document.getElementById('progress-bar') as HTMLProgressElement;
const progressText = document.getElementById('progress-text') as HTMLSpanElement;
const csvLink = document.getElementById('csv-link') as HTMLAnchorElement;

// UIを最初の状態に戻すリセット関数
function showActionState(): void {
    actionArea.style.display = 'block';
    progressArea.style.display = 'none';
    completeArea.style.display = 'none';

    progressBar.value = 0;
    progressText.textContent = '0%';
    generatedCsvPath = '';

    btnSelect.disabled = false;
    inputPath.disabled = false;
}

// 入力値の状態に応じて実行ボタンの活性/非活性を切り替える
function toggleStartButton(): void {
    btnStart.disabled = inputPath.value.trim() === '';
}

// テキストボックス入力時
inputPath.addEventListener('input', () => {
    showActionState();
    toggleStartButton();
});

// フォルダ参照ボタンクリック時
btnSelect.addEventListener('click', async () => {
    showActionState();

    // 型定義のおかげで window.electronAPI が安全に補完されます
    const selectedPaths = await window.electronAPI.selectFolder();
    if (selectedPaths && selectedPaths.length > 0) {
        // 複数選択でないなら最初のパスを代入（または join）
        inputPath.value = selectedPaths[0];
    }
    toggleStartButton();
});

// 実行ボタンクリック時
btnStart.addEventListener('click', () => {
    const targetFolder = inputPath.value.trim();
    if (!targetFolder) return;

    btnSelect.disabled = true;
    inputPath.disabled = true;

    actionArea.style.display = 'none';
    completeArea.style.display = 'none';
    progressArea.style.display = 'block';

    window.electronAPI.startProcess(targetFolder);
});

// 進捗の更新を受信 (value は自動で number 型になります)
window.electronAPI.onProgress((value) => {
    progressBar.value = value;
    progressText.textContent = `${value}%`;
});

// 完了を受信 (csvPath は自動で string 型になります)
window.electronAPI.onComplete((csvPath) => {
    generatedCsvPath = csvPath;

    btnSelect.disabled = false;
    inputPath.disabled = false;

    actionArea.style.display = 'none';
    progressArea.style.display = 'none';
    completeArea.style.display = 'block';
});

// リンククリック時にエクスプローラーを開く
csvLink.addEventListener('click', () => {
    if (generatedCsvPath) {
        window.electronAPI.openExplorer(generatedCsvPath);
    }
});