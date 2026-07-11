// global.d.ts
import { IElectronAPI } from '../preload'; // preload.ts の場所に合わせてパスを調整してください

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}