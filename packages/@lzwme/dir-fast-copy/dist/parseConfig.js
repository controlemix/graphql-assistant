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
exports.parseConfig = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const console_log_colors_1 = require("console-log-colors");
const glob_to_regexp_1 = __importDefault(require("glob-to-regexp"));
const config_1 = __importDefault(require("./config"));
const utils_1 = require("./utils");
/** 处理入参信息 */
function parseConfig(cfg) {
    cfg.src = String(cfg.src || '').trim();
    cfg.dest = String(cfg.dest || '').trim();
    if (!cfg.src) {
        console_log_colors_1.log.red('未指定要复制的源目录！');
        (0, utils_1.help)();
        return;
    }
    if (!cfg.dest) {
        console_log_colors_1.log.red('未指定要复制至的目的目录！');
        (0, utils_1.help)();
        return;
    }
    cfg.src = path.resolve(cfg.src);
    cfg.dest = path.resolve(cfg.dest);
    if (!fs.existsSync(cfg.src))
        return console.log(' 源目录不存在，请检查确认：', console_log_colors_1.color.red(cfg.src));
    if (cfg.dest === cfg.src || cfg.dest.includes(cfg.src + path.sep)) {
        console_log_colors_1.log.red('\n源路径不能与目的路径相同或是目的路径的子目录！');
        return;
    }
    cfg.minDateTime = cfg.minDateTime ? new Date(cfg.minDateTime).getTime() || 0 : config_1.default.minDateTime;
    cfg.mutiThreadMinFiles = Number(cfg.mutiThreadMinFiles) >= 1000 ? Number(cfg.mutiThreadMinFiles) : config_1.default.mutiThreadMinFiles;
    cfg.progressInterval = Number(cfg.progressInterval) > 99 ? Number(cfg.progressInterval) : config_1.default.progressInterval;
    Object.assign(config_1.default, cfg);
    (0, utils_1.logPrint)('源路径  : ', console_log_colors_1.color.cyan(config_1.default.src), '\n目的路径: ', console_log_colors_1.color.cyan(config_1.default.dest), '\n');
    // 文件排除规则
    if (!config_1.default.exclude)
        config_1.default.exclude = [];
    config_1.default.exclude.forEach((val, i) => {
        if (val instanceof RegExp)
            return;
        config_1.default.exclude[i] = (0, glob_to_regexp_1.default)(val, { extended: true, flags: 'gi' });
    });
    // console.debug('CONFIG.exclude', CONFIG.exclude);
    return config_1.default;
}
exports.parseConfig = parseConfig;
