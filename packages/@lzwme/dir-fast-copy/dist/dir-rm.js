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
exports.dirRm = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const console_log_colors_1 = require("console-log-colors");
const config_1 = __importDefault(require("./config"));
const utils_1 = require("./utils");
async function doDirRm(src, option) {
    if (!src)
        return console.log('请指定要删除的文件或目录路径');
    src = path.resolve(src);
    if (!fs.existsSync(src))
        return console.log('要删除的文件或目录路径不存在！', console_log_colors_1.color.red(src));
    const srcTip = fs.statSync(src).isFile() ? '文件' : '目录';
    if (option.slient)
        config_1.default.slient = true;
    if (!option.force) {
        const force = await (0, utils_1.readSyncByRl)(`是否删除该${srcTip}(y/)？[${console_log_colors_1.color.red(src)}] `);
        if ('y' !== String(force).trim().toLowerCase())
            return;
    }
    const startTime = Date.now();
    if (typeof fs.rmSync === 'function')
        fs.rmSync(src, { recursive: true });
    else
        fs.rmdirSync(src, { recursive: true });
    (0, utils_1.logPrint)(`$[${(0, utils_1.showCostTime)(startTime)}] ${srcTip}已删除：`, console_log_colors_1.color.green(src));
    return true;
}
async function dirRm(option) {
    if (!Array.isArray(option.src))
        return console.log('请指定要删除的文件或目录路径');
    if (option.src.length === 1)
        return doDirRm(option.src[0], option);
    for (const src of option.src) {
        await doDirRm(src, option);
    }
    return true;
}
exports.dirRm = dirRm;
