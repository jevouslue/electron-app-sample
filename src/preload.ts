// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// HTML側に公開するAPIのインターフェース定義
export interface IElectronAPI {
    selectFolder: () => Promise<string | null>
    getTargetFiles: () => Promise<string[]>
    startProcess: (folderPath: string) => void
    onProgress: (callback: (doneNum: number, totalNum: number, filePath: string) => void) => () => void
    onComplete: (callback: (csvPath: string) => void) => () => void
    openFile: (filePath: string) => void
    openInExplorer: (filePath: string) => void
}

const electronAPI: IElectronAPI = {
    // フォルダ選択
    selectFolder: () => ipcRenderer.invoke('select-folder'),

    getTargetFiles: () => ipcRenderer.invoke('get-target-files'),

    // 処理開始
    startProcess: (folderPath: string) => ipcRenderer.send('start-process', folderPath),

    // 進捗の更新を受信
    onProgress: (callback: (doneNum: number, totalNum: number, filePath: string) => void) => {
        const subscription = (_event: any, doneNum: number, totalNum: number, filePath: string) => callback(doneNum, totalNum, filePath)
        ipcRenderer.on('process-progress', subscription)
        return () => ipcRenderer.removeListener('process-progress', subscription)
    },

    // 完了を受信
    onComplete: (callback: (csvPath: string) => void) => {
        const subscription = (_event: any, csvPath: string) => callback(csvPath)
        ipcRenderer.on('process-complete', subscription)
        return () => ipcRenderer.removeListener('process-complete', subscription)
    },

    // ファイルを開く
    openFile: (filePath: string) => ipcRenderer.send('open-file', filePath),

    // エクスプローラーで開く
    openInExplorer: (filePath: string) => ipcRenderer.send('open-in-explorer', filePath),
}

// 画面側にAPIを露出させる
contextBridge.exposeInMainWorld('electronAPI', electronAPI)