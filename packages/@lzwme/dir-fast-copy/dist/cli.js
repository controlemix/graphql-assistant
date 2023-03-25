#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const fast_copy_1 = require("./fast-copy");
const dir_rm_1 = require("./dir-rm");
const pkg = require('../package.json');
const program = commander_1.default.program;
program.version(pkg.version, '-V, --version', '当前版本').helpOption('-h, --help', '查看帮助信息').description(pkg.description);
const cp = program
    .command('cp <srcPath> <destPath>')
    .description('高效的复制目录')
    .option('--debug', '调试模式', false)
    .option('-s, --slient', '静默模式', false)
    .option('--threads <num>', '启动多线程的数量。小于 2 表示不启用多线程模式')
    .option('--muti-thread-min-files', '启用多线程的最小文件数，文件总数低于该值则使用单线程模式(最小值 1000，默认为 3000)', '3000')
    .option('--exclude <reg...>', '文件排除规则。普通的 glob 规则，支持多个参数')
    .option('--min-date-time <1970-01-01T00:00:00>', '文件最小日期，低于该日期的文件会被忽略(处理速度更快)')
    .option('--no-skip-same-file', '文件<名称与大小均相同>已存在时不跳过(覆盖)。')
    .option('--skip-same-file', '文件<名称与大小均相同>已存在时则跳过。', true)
    .option('--progress-interval', 'onProgress 进度回调(进度日志更新)的最小间隔时间(ms)，不低于 100ms。默认值 2000', '2000')
    .option('--cp-during-stats', '多线程模式下，在收集文件信息过程中即开始文件复制（适用于文件数量多信息收集时间长的场景）', false)
    .action((...args) => {
    const config = {
        src: args[0],
        dest: args[1],
        iscmd: true,
        onEnd: () => process.exit(0),
        ...cp.opts(),
    };
    Object.keys(config).forEach((key) => {
        if (null == config[key])
            delete config[key];
    });
    // console.debug('config', config);
    (0, fast_copy_1.fastCopy)(config);
});
const rm = program
    .command('rm <dirpath>')
    .description('删除一个目录及其子目录')
    .option('-f, --force', '强制删除，无需确认(否则删除前需确认)', false)
    .option('-s, --slient', '静默模式', false)
    .action(() => {
    (0, dir_rm_1.dirRm)(Object.assign({ src: rm.args }, rm.opts()));
});
program.parse(process.argv);
