// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// HTML側に公開するAPIのインターフェース定義
export interface IElectronAPI {
    selectFolder: () => Promise<string[] | undefined>;
    startProcess: (folderPath: string) => void;
    onProgress: (callback: (value: number) => void) => () => void;
    onComplete: (callback: (csvPath: string) => void) => () => void;
    openExplorer: (csvPath: string) => void;
}

const electronAPI: IElectronAPI = {
    // フォルダ選択
    selectFolder: () => ipcRenderer.invoke('select-folder'),

    // 処理開始
    startProcess: (folderPath: string) => ipcRenderer.send('start-process', folderPath),

    // 進捗の更新を受信
    onProgress: (callback: (value: number) => void) => {
        const subscription = (_event: any, value: number) => callback(value);
        ipcRenderer.on('process-progress', subscription);
        return () => ipcRenderer.removeListener('process-progress', subscription);
    },

    // 完了を受信
    onComplete: (callback: (csvPath: string) => void) => {
        const subscription = (_event: any, csvPath: string) => callback(csvPath);
        ipcRenderer.on('process-complete', subscription);
        return () => ipcRenderer.removeListener('process-complete', subscription);
    },

    // エクスプローラーを開く
    openExplorer: (csvPath: string) => ipcRenderer.send('open-explorer', csvPath)
};

// 画面側にAPIを露出させる
contextBridge.exposeInMainWorld('electronAPI', electronAPI);