"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const config = {
    slient: false,
    iscmd: false,
    src: '',
    dest: '',
    threads: Math.max((0, os_1.cpus)().length - 1, 1),
    mutiThreadMinFiles: 3000,
    exclude: [],
    minDateTime: 0,
    skipSameFile: true,
    progressInterval: 2000,
    /** 结束时回调方法 */
    onEnd: null,
    onProgress: null,
};
exports.default = config;
