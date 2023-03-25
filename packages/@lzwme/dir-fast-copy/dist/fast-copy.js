"use strict";
/*
 * @Author: lzw
 * @Date: 2020-09-18 09:52:53
 * @LastEditors: lzw
 * @LastEditTime: 2022-11-02 15:07:26
 * @Description: 对指定文件夹内的文件进行复制，只复制指定日期之后创建的文件
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fastCopy = void 0;
const workerThreads = __importStar(require("worker_threads"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const console_log_colors_1 = require("console-log-colors");
const config_1 = __importDefault(require("./config"));
const utils_1 = require("./utils");
const parseConfig_1 = require("./parseConfig");
/** 简单处理单文件的复制 */
function cpSingleFile(srcFilePath, destFilePath) {
    const startTime = Date.now();
    const srcStat = fs.statSync(destFilePath);
    (0, utils_1.logPrint)('单文件复制');
    if (fs.existsSync(destFilePath) && srcStat.isFile()) {
        (0, utils_1.logPrint)('目的文件已存在，将被源文件替换');
    }
    (0, utils_1.cpFileSync)(srcFilePath, destFilePath, (0, utils_1.toFSStatInfo)(srcStat));
    (0, utils_1.logPrint)(`复制完成，耗时 ${console_log_colors_1.color.green((Date.now() - startTime) / 1000)} 秒`);
    return true;
}
/** 多线程复制模式 */
function mutiThreadCopy(allFilePathList, opts = {}) {
    const stats = {
        totalFile: allFilePathList.length,
    };
    /** 当前运行的子线程，当为 0 时表示全部执行结束 */
    let threadRuningNum = config_1.default.threads;
    const sepCount = Math.ceil(allFilePathList.length / config_1.default.threads);
    /** 各子线程的统计信息，以 idx 为 key */
    const threadsStats = {};
    /** 最近一次执行 onProgress 的时间 */
    let preNotifyProgressTime = 0;
    const workerOnData = (worker, data) => {
        // logPrint(`子线程${idx}发来消息：`, data);
        threadsStats[data.idx] = data;
        if (data.type === 'progress') {
            if (Date.now() - preNotifyProgressTime < config_1.default.progressInterval)
                return;
            preNotifyProgressTime = Date.now();
        }
        stats.totalFileHandler = 0;
        stats.totalFileNew = 0;
        stats.totalFileNewSize = 0;
        stats.totalFileSize = 0;
        stats.totalDirNew = 0;
        Object.keys(threadsStats).forEach((key) => {
            const item = threadsStats[key];
            stats.totalFileHandler += item.totalFileHandler;
            stats.totalFileNew += item.totalFileNew;
            stats.totalFileNewSize += item.totalFileNewSize;
            stats.totalFileSize += item.totalFileSize;
            stats.totalDirNew += item.totalDirNew;
        });
        if (data.type === 'progress' && opts.onProgress)
            process.nextTick(() => opts.onProgress(stats));
        // if (stats.totalFileHandler && 0 === stats.totalFileHandler % 1000) {}
        if (data.type === 'done') {
            threadRuningNum--;
            if (!threadRuningNum) {
                worker.terminate();
                if (opts.onEnd)
                    process.nextTick(() => opts.onEnd(stats));
            }
        }
    };
    if (opts.onStart)
        opts.onStart(config_1.default.threads);
    const childCfg = { ...config_1.default };
    Object.keys(childCfg).forEach((key) => {
        // postMessage 不能传递函数类型
        if (typeof childCfg[key] === 'function')
            delete childCfg[key];
    });
    for (let idx = 0; idx < config_1.default.threads; idx++) {
        const workerFile = path.resolve(__dirname, './worker.js');
        const worker = new workerThreads.Worker(workerFile, {
            workerData: {
                idx,
                sepCount,
                config: childCfg,
                startTime: opts.startTime || Date.now(),
                filePathList: allFilePathList.slice(idx * sepCount, (idx + 1) * sepCount),
            },
        });
        worker.on('message', workerOnData.bind(globalThis, worker));
    }
}
function startMain(_config) {
    const STATS = {
        allFilePaths: [],
        allDirPaths: [],
        totalFile: 0,
        totalFileSize: 0,
        totalFileHandler: 0,
        totalFileNew: 0,
        totalFileNewSize: 0,
        totalDir: 0,
        totalDirNew: 0,
    };
    /** 开始时间 */
    const startTime = Date.now();
    /** 打印进度信息 */
    const logProgress = (showPercent = true, s = STATS) => {
        if (config_1.default.slient)
            return;
        const percent = showPercent ? `[${((100 * s.totalFileHandler) / s.totalFile).toFixed(2)}%]` : '';
        (0, utils_1.logInline)(`[${(0, utils_1.showCostTime)(startTime)}] ${percent} 已处理了${console_log_colors_1.color.yellow(s.totalFileHandler)} 个文件，其中复制了 ${console_log_colors_1.color.magenta(s.totalFileNew)} 个文件${s.totalFileNewSize ? `(${console_log_colors_1.color.magentaBright((0, utils_1.formatFileSize)(s.totalFileNewSize))})` : ''}`);
    };
    return new Promise(async (resolve) => {
        const cfg = (0, parseConfig_1.parseConfig)(_config);
        if (!cfg)
            return resolve(false);
        // 单文件复制
        if (fs.statSync(cfg.src).isFile()) {
            cpSingleFile(cfg.src, cfg.dest);
            STATS.totalFileNew = STATS.totalFile = 1;
            return resolve(STATS);
        }
        if (!fs.existsSync(cfg.dest)) {
            (0, utils_1.cpDir)(cfg.src, cfg.dest);
            STATS.totalDirNew++;
        }
        /** 执行完成后回调方法 */
        const onEnd = () => {
            (0, utils_1.logInline)(`\n处理完成，总耗时 ${console_log_colors_1.color.green((Date.now() - startTime) / 1000)} 秒！共处理了 ${console_log_colors_1.color.yellow(STATS.totalFile)} 个文件${STATS.totalFileSize ? `(${console_log_colors_1.color.yellowBright((0, utils_1.formatFileSize)(STATS.totalFileSize))})` : ''}，包含于 ${console_log_colors_1.color.cyan(STATS.totalDir)} 个文件夹中。其中复制了 ${console_log_colors_1.color.magenta(STATS.totalFileNew)} 个文件${STATS.totalFileNewSize ? `(${console_log_colors_1.color.magentaBright((0, utils_1.formatFileSize)(STATS.totalFileNewSize))})` : ''}\n`);
            // 执行了 ${color.cyan(STATS.totalDirNew)} 次文件夹创建命令 // 由于多线程模式下用了递归创建参数，该值不准确
            if (cfg.onEnd)
                cfg.onEnd(STATS);
            resolve(STATS);
        };
        if (+config_1.default.threads < 2) {
            (0, utils_1.logPrint)(console_log_colors_1.color.cyan('单线程模式'));
            /** 最近一次执行 onProgress 的时间 */
            let preNotifyProgressTime = 0;
            const stats = (0, utils_1.dirCopyRecursive)(cfg.src, cfg.dest, (s) => {
                if (Date.now() - preNotifyProgressTime < config_1.default.progressInterval)
                    return;
                preNotifyProgressTime = Date.now();
                Object.assign(STATS, s);
                logProgress(false);
            });
            Object.assign(STATS, stats);
            onEnd();
        }
        else {
            (0, utils_1.logPrint)(console_log_colors_1.color.cyan('开始收集源目录内文件信息'));
            /** 待复制的文件列表 */
            let allFileListTodo = [];
            /** 已发送给子线程处理的文件数 */
            let sendedToCpFileNum = 0;
            /** 子线程是否已处理完毕 */
            let isDone = true;
            const stats = await (0, utils_1.getAllFiles)(cfg.src, cfg.dest, (s) => {
                (0, utils_1.logInline)(`[${(0, utils_1.showCostTime)(startTime)}] 已发现目录数：${s.totalDir} 个，包含文件 ${s.totalFile} 个`);
                // TODO: 可以在获取到文件后立即执行多线程复制
                if (config_1.default.cpDuringStats && isDone && s.totalFile > config_1.default.mutiThreadMinFiles) {
                    allFileListTodo = s.allFilePaths.slice(sendedToCpFileNum);
                    if (allFileListTodo.length > config_1.default.mutiThreadMinFiles) {
                        isDone = false;
                        sendedToCpFileNum = s.totalFile;
                        mutiThreadCopy(allFileListTodo, {
                            startTime,
                            onStart: () => {
                                (0, utils_1.logPrint)(console_log_colors_1.color.gray('\n\n  数据收集过程中启动线程复制，本次处理文件数：'), allFileListTodo.length, '\n');
                            },
                            // onProgress: (s) => logProgress(true, s),
                            onEnd: (s) => {
                                // 只记录复制了的文件和文件夹，因为他们还会在后面被处理
                                ['totalDirNew', 'totalFileNew', 'totalFileSize', 'totalFileNewSize'].forEach((key) => {
                                    if (s[key])
                                        STATS[key] += s[key];
                                });
                                (0, utils_1.logPrint)(console_log_colors_1.color.gray(`\n  首批子线程处理完成\n`));
                                isDone = true;
                            },
                        });
                    }
                }
            });
            Object.assign(STATS, stats);
            allFileListTodo = STATS.allFilePaths.slice(sendedToCpFileNum);
            let tip = `[${(0, utils_1.showCostTime)(startTime)}] 目录预处理完成，发现目录总数：${console_log_colors_1.color.yellow(STATS.totalDir)}，文件总数：${console_log_colors_1.color.yellowBright(STATS.totalFile)}`;
            if (config_1.default.cpDuringStats && isDone) {
                tip += `。已处理了${console_log_colors_1.color.yellow(STATS.totalFileHandler)} 个文件，其中复制了 ${console_log_colors_1.color.magenta(STATS.totalFileNew)} 个文件`;
            }
            (0, utils_1.logInline)(tip);
            const onProgress = (s) => {
                logProgress(true, s);
                if (cfg.onProgress)
                    cfg.onProgress(STATS);
            };
            const onEndCallback = (s) => {
                ['totalDirNew', 'totalFileNew', 'totalFileSize', 'totalFileNewSize'].forEach((key) => {
                    if (s[key])
                        STATS[key] += s[key];
                });
                onEnd();
            };
            if (config_1.default.threads < 2 || STATS.totalFile < config_1.default.mutiThreadMinFiles) {
                (0, utils_1.logPrint)(console_log_colors_1.color.yellow('\n\n单线程执行'));
                (0, utils_1.fileCopy)(STATS.allFilePaths, {
                    onProgress,
                    onEnd: onEndCallback,
                });
            }
            else {
                mutiThreadCopy(allFileListTodo, {
                    startTime,
                    onStart: (threadNum) => {
                        (0, utils_1.logPrint)(console_log_colors_1.color.cyan('\n\n开始多线程处理，线程数：'), console_log_colors_1.color.green(threadNum));
                    },
                    onProgress,
                    onEnd: onEndCallback,
                });
            }
        }
    });
}
async function fastCopy(cfg) {
    if (workerThreads.isMainThread)
        return startMain(cfg);
    console_log_colors_1.log.red('只能以主线程模式启动');
    return false;
}
exports.fastCopy = fastCopy;
