/// <reference types="node" />
import * as fs from 'fs';
import CONFIG from './config';
import type { DfcConfig, DfcStats, FsStatInfo } from './type';
export declare function help(): void;
/** 日志打印 */
export declare function logPrint(...args: any[]): void;
/** 执行文件复制（获取到全部文件后） */
export declare function fileCopy(filePathList: DfcStats['allFilePaths'], opts?: {
    onProgress?: DfcConfig['onProgress'];
    onEnd?: DfcConfig['onEnd'];
}): Promise<DfcStats>;
export declare function formatTime(timeMs: any): string;
/** 显示从指定的时间到此刻花费的时间 */
export declare function showCostTime(startTime: number): string;
export declare function isExclude(srcFilePath: string): boolean;
/**
 * 文件校验
 * @returns
 * 返回 null 表示文件或目录被忽略
 * 返回 false 表示文件或目录不执行处理
 */
export declare function checkFile(srcFilePath: string, destFilePath: string, srcStat: FsStatInfo, config?: DfcConfig): false | FsStatInfo | "dir";
/** 复制一个文件 */
export declare function cpFileSync(srcPath: any, destPath: any, srcStat: FsStatInfo): Promise<void>;
/** 复制一个文件(异步) */
export declare function cpFile(srcPath: any, destPath: any, srcStat: FsStatInfo): Promise<void>;
/** 复制一个目录(不作任何检查以保证速度) */
export declare function cpDir(srcDir: any, destDir: any, srcStat?: FsStatInfo): void;
export declare function toFSStatInfo(fstat: fs.Stats): FsStatInfo;
/** 在当前行打印日志信息(主要用于显示进度信息) */
export declare function logInline(msg: any): void;
/** 获取所有需处理的文件列表（后续分割为多线程处理） */
export declare function getAllFiles(_srcDir: string, _destDir?: string, onProgress?: typeof CONFIG['onProgress']): Promise<DfcStats>;
/** 单线程模式，执行目录复制（递归） */
export declare function dirCopyRecursive(src: string, dest: string, onProgress?: (stats: any) => void): DfcStats;
/** 等待并获取用户输入内容 */
export declare function readSyncByRl(tips: string): Promise<unknown>;
export declare function formatFileSize(size: number): string;
