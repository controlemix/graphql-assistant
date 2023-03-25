"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: lzw
 * @Date: 2020-09-18 09:52:53
 * @LastEditors: lzw
 * @LastEditTime: 2020-09-22 21:23:51
 * @Description: 子线程 worker
 */
const worker_threads_1 = require("worker_threads");
const console_log_colors_1 = require("console-log-colors");
const utils_1 = require("./utils");
const config_1 = __importDefault(require("./config"));
/** 启动子线程 */
function startChild() {
    if (worker_threads_1.workerData.config)
        Object.assign(config_1.default, worker_threads_1.workerData.config);
    (0, utils_1.logPrint)(`子线程 ${worker_threads_1.workerData.idx} 已启动，收到待处理文件数为：`, console_log_colors_1.color.yellow(worker_threads_1.workerData.filePathList.length));
    // startTime = workerData.startTime;
    (0, utils_1.fileCopy)(worker_threads_1.workerData.filePathList, {
        onProgress: (stats) => {
            worker_threads_1.parentPort.postMessage({
                type: 'progress',
                idx: worker_threads_1.workerData.idx,
                ...stats,
            });
        },
        onEnd: (stats) => {
            worker_threads_1.parentPort.postMessage({
                type: 'done',
                idx: worker_threads_1.workerData.idx,
                ...stats,
            });
        },
    });
}
function start() {
    if (worker_threads_1.isMainThread) {
        console.log('子线程处理文件仅支持使用 new workerThreads.Worker 方式调用');
    }
    else {
        startChild();
    }
}
start();
