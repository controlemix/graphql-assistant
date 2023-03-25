"use strict";
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
exports.formatFileSize = exports.readSyncByRl = exports.dirCopyRecursive = exports.getAllFiles = exports.logInline = exports.toFSStatInfo = exports.cpDir = exports.cpFile = exports.cpFileSync = exports.checkFile = exports.isExclude = exports.showCostTime = exports.formatTime = exports.fileCopy = exports.logPrint = exports.help = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const config_1 = __importDefault(require("./config"));
const console_log_colors_1 = require("console-log-colors");
const pkg = require('../package.json');
function help() {
    console_log_colors_1.log.green(pkg.description);
    console.log(`\r\n ${console_log_colors_1.color.yellow('USEAGE:')}  dfc cf <src> <dest>`);
}
exports.help = help;
/** 日志打印 */
function logPrint(...args) {
    if (config_1.default.slient)
        return;
    console.log(...args);
}
exports.logPrint = logPrint;
/** 执行文件复制（获取到全部文件后） */
async function fileCopy(filePathList, opts = {}) {
    const stats = {
        totalFile: filePathList.length,
        totalFileSize: 0,
        totalFileHandler: 0,
        totalFileNew: 0,
        totalFileNewSize: 0,
        totalDirNew: 0,
    };
    if (!filePathList)
        return stats;
    const progressTipNum = filePathList.length > 10000 ? 1000 : 100;
    const queueSize = 5;
    let cpFileQueue = [];
    for (const item of filePathList) {
        const { src: srcPath, dest: destPath, srcStat } = item;
        const check = checkFile(srcPath, destPath, srcStat);
        stats.totalFileHandler++;
        if (stats.totalFileHandler > 1 && 0 === stats.totalFileHandler % progressTipNum) {
            if (opts.onProgress)
                opts.onProgress(stats);
        }
        if (check === 'dir')
            continue;
        stats.totalFileSize += srcStat.size;
        if (check === false)
            continue;
        try {
            // 创建目的文件的目录路径
            const destFileDir = path.dirname(destPath);
            if (!fs.existsSync(destFileDir)) {
                cpDir(path.dirname(srcPath), destFileDir, srcStat);
                stats.totalDirNew++;
            }
            if (cpFileQueue.length >= queueSize) {
                await Promise.allSettled(cpFileQueue);
                cpFileQueue = [];
            }
            cpFileQueue.push(cpFile(srcPath, destPath, srcStat));
            stats.totalFileNew++;
            stats.totalFileNewSize += srcStat.size;
        }
        catch (err) {
            console.log(`文件复制失败:\nsrc: ${srcPath}\ndest: ${destPath}\n`, err);
        }
    }
    await Promise.allSettled(cpFileQueue);
    if (opts.onEnd)
        opts.onEnd(stats);
    return stats;
}
exports.fileCopy = fileCopy;
function formatTime(timeMs) {
    // return timeMs / 1000 + 's';
    return new Date(new Date('1970-01-01T00:00:00').getTime() + timeMs).toTimeString().split(' ')[0];
}
exports.formatTime = formatTime;
/** 显示从指定的时间到此刻花费的时间 */
function showCostTime(startTime) {
    return console_log_colors_1.color.cyan(formatTime(Date.now() - startTime));
}
exports.showCostTime = showCostTime;
function isExclude(srcFilePath) {
    for (const d of config_1.default.exclude) {
        if (d instanceof RegExp) {
            if (srcFilePath.match(d))
                return true;
        }
        else {
            if (srcFilePath.includes(d))
                return false;
        }
    }
    return false;
}
exports.isExclude = isExclude;
/**
 * 文件校验
 * @returns
 * 返回 null 表示文件或目录被忽略
 * 返回 false 表示文件或目录不执行处理
 */
function checkFile(srcFilePath, destFilePath, srcStat, config = config_1.default) {
    // console.debug('checkFile:', srcFilePath, destFilePath);
    if (isExclude(srcFilePath))
        return false;
    if (srcStat.isDirectory)
        return 'dir';
    if (srcStat.mtime.getTime() < config.minDateTime)
        return false;
    // 相同大小的文件已存在
    if (config.skipSameFile) {
        if (fs.existsSync(destFilePath) && fs.statSync(destFilePath).size === srcStat.size)
            return false;
    }
    return srcStat;
}
exports.checkFile = checkFile;
/** 复制一个文件 */
async function cpFileSync(srcPath, destPath, srcStat) {
    try {
        fs.writeFileSync(destPath, fs.readFileSync(srcPath));
        fs.utimesSync(destPath, srcStat.atime, srcStat.mtime);
    }
    catch (err) {
        console.log(`文件复制失败:\nsrc: ${srcPath}\ndest: ${destPath}\n`, err);
    }
}
exports.cpFileSync = cpFileSync;
/** 复制一个文件(异步) */
async function cpFile(srcPath, destPath, srcStat) {
    try {
        await new Promise((rs, reject) => {
            fs.createReadStream(srcPath)
                .pipe(fs.createWriteStream(destPath))
                .on('close', () => {
                fs.utimes(destPath, srcStat.atime, srcStat.mtime, (err) => {
                    if (err)
                        reject(err);
                    else
                        rs(true);
                });
            });
        });
    }
    catch (err) {
        console.log(`文件复制失败:\nsrc: ${srcPath}\ndest: ${destPath}\n`, err);
    }
}
exports.cpFile = cpFile;
/** 复制一个目录(不作任何检查以保证速度) */
function cpDir(srcDir, destDir, srcStat) {
    try {
        if (!srcStat)
            srcStat = toFSStatInfo(fs.statSync(srcDir));
        fs.mkdirSync(destDir, { recursive: true });
        fs.utimesSync(destDir, srcStat.atime, srcStat.mtime);
    }
    catch (err) {
        console.log(`目录复制失败:\nsrc: ${srcDir}\ndest: ${destDir}\n`, err);
    }
}
exports.cpDir = cpDir;
function toFSStatInfo(fstat) {
    const info = {
        isFile: fstat.isFile(),
        isDirectory: fstat.isDirectory(),
        nlink: fstat.nlink,
        atime: fstat.atime,
        mtime: fstat.mtime,
        size: fstat.size,
    };
    return info;
}
exports.toFSStatInfo = toFSStatInfo;
/** 在当前行打印日志信息(主要用于显示进度信息) */
function logInline(msg) {
    if (config_1.default.slient)
        return;
    // console.log(msg);
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(msg, 'utf-8');
}
exports.logInline = logInline;
/** 获取所有需处理的文件列表（后续分割为多线程处理） */
async function getAllFiles(_srcDir, _destDir = '', onProgress) {
    const stats = {
        totalFile: 0,
        totalDir: 0,
        allDirPaths: [],
        allFilePaths: [],
    };
    let preProgressTime = Date.now();
    const handler = async (srcDir, destDir = '') => {
        if (isExclude(srcDir))
            return false;
        const filelist = await fs.promises.readdir(srcDir, { encoding: 'utf8' });
        const now = Date.now();
        if (onProgress && now - preProgressTime > 500) {
            preProgressTime = now;
            onProgress(Object.assign({}, stats));
        }
        const list = filelist.map(async (filename) => {
            if (!filename)
                return;
            const srcPath = path.resolve(srcDir, filename);
            const destPath = destDir ? path.resolve(destDir, filename) : '';
            if (!fs.existsSync(srcPath))
                return;
            if (isExclude(srcPath))
                return;
            const fstat = await fs.promises.stat(srcPath);
            const info = {
                src: srcPath,
                dest: destPath,
                srcStat: toFSStatInfo(fstat),
            };
            if (fstat.isDirectory()) {
                stats.totalDir++;
                stats.allDirPaths.push(info);
                return handler(srcPath, destPath);
            }
            else {
                stats.totalFile++;
                stats.allFilePaths.push(info);
            }
        });
        return Promise.all(list);
    };
    await handler(_srcDir, _destDir);
    return stats;
}
exports.getAllFiles = getAllFiles;
/** 单线程模式，执行目录复制（递归） */
function dirCopyRecursive(src, dest, onProgress) {
    const stats = {
        totalFile: 0,
        totalFileSize: 0,
        totalFileHandler: 0,
        totalFileNew: 0,
        totalFileNewSize: 0,
        totalDirNew: 0,
        totalDir: 0,
    };
    const handler = (srcDir, destDir, srcDirStat) => {
        if (!fs.existsSync(destDir)) {
            cpDir(srcDir, destDir, srcDirStat);
            stats.totalDirNew++;
        }
        const filelist = fs.readdirSync(srcDir, { encoding: 'utf8' });
        let srcPath = '';
        let destPath = '';
        filelist.forEach((filename) => {
            if (!filename || filename === '..')
                return;
            onProgress && onProgress(stats);
            srcPath = path.resolve(srcDir, filename);
            destPath = path.resolve(destDir, filename);
            const srcStat = fs.statSync(srcPath);
            const statInfo = toFSStatInfo(srcStat);
            const check = checkFile(srcPath, destPath, statInfo);
            if (srcStat.isFile()) {
                stats.totalFileHandler++;
                stats.totalFile = stats.totalFileHandler;
                stats.totalFileSize += srcStat.size;
            }
            else {
                stats.totalDir++;
            }
            if (!check)
                return;
            if (check === 'dir') {
                handler(srcPath, destPath, statInfo);
                // 移除空的文件夹
                if (!fs.readdirSync(destPath).length) {
                    fs.rmdirSync(destPath);
                    stats.totalDirNew--;
                }
                return;
            }
            cpFileSync(srcPath, destPath, statInfo);
            stats.totalFileNew++;
            stats.totalFileNewSize += srcStat.size;
        });
    };
    handler(src, dest);
    stats.totalFile = stats.totalFileHandler;
    return stats;
}
exports.dirCopyRecursive = dirCopyRecursive;
/** 等待并获取用户输入内容 */
function readSyncByRl(tips) {
    tips = tips || '> ';
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(tips, (answer) => {
            resolve(answer.trim());
            rl.close();
        });
    });
}
exports.readSyncByRl = readSyncByRl;
function formatFileSize(size) {
    if (size > 1 << 30)
        return (size / (1 << 30)).toFixed(2) + 'G';
    if (size > 1 << 20)
        return (size / (1 << 20)).toFixed(2) + 'M';
    if (size > 1 << 10)
        return (size / (1 << 10)).toFixed(2) + 'KB';
    return size + 'B';
}
exports.formatFileSize = formatFileSize;
