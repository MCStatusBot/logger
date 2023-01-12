const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment');

let logPath = path.join(__dirname, '../logs');
let isDefaultPath = true;
if (process.env.MCSB_LOGGER_PATH && process.env.MCSB_LOGGER_PATH != "" && process.env.MCSB_LOGGER_PATH != " ") {
    if (!fs.existsSync(path.join(__dirname, '../', process.env.MCSB_LOGGER_PATH))) {
        if (!fs.existsSync(logPath)) fs.mkdirSync(logPath);
        return process.stderr.write(chalk.gray(`${time} [${chalk.yellow('warn')}]: `) + "the path you provided in your env file does not exist defaulting to ./logs\n");
    }
    logPath = path.join(__dirname, '../', process.env.MCSB_LOGGER_PATH);
    isDefaultPath = false;
}

async function append(text, prefix) {
    let stats;

    if (isDefaultPath) {
        if (!fs.existsSync(logPath)) await fs.mkdirSync(logPath);
    }
    const logFilePath = process.env.MCSB_LOGGER_FILE_PREFIX ? process.env.MCSB_LOGGER_FILE_PREFIX.toString().toLowerCase() == 'true' ? logPath + '/' + prefix + '-log.log' : logPath + '/log.log' : logPath + '/log.log';

    try {
        stats = fs.statSync(logFilePath);
        console.log(stats.size)
        let fileSizeInkilobytes = stats.size / 1000;
        console.log(fileSizeInkilobytes)
        if (fileSizeInkilobytes > 300) {
            const logArchiveFilePath = process.env.MCSB_LOGGER_FILE_PREFIX ? process.env.MCSB_LOGGER_FILE_PREFIX.toString().toLowerCase() == 'true' ? logPath + '/' + prefix + '-' + moment().format('YYYY-MM-DD-HH-SS') + '.archive.log' : logPath + '/' + moment().format('YYYY-MM-DD-HH-SS') + '.archive.log' : logPath + '/' + moment().format('YYYY-MM-DD-HH-SS') + '.archive.log';
            await fs.renameSync(logFilePath, logArchiveFilePath);
            await fs.writeFileSync(logFilePath, "");
        }
    } catch (er) {
        await fs.writeFileSync(logFilePath, "");
    }

    fs.appendFileSync(logFilePath, text + '\n', function(err) {
        if (err) console.error(chalk.red('Error writing logs to file: ' + err));
    });
}

module.exports = logger = {
    info: function(text) {
        let time = moment().format('YYYY-MM-DD HH:mm:ss')
        process.stdout.write(chalk.gray(`${time} [info]: `) + text + '\n')

        append(time + ' [info]: ' + text, "info")
    },
    success: function(text) {
        let time = moment().format('YYYY-MM-DD HH:mm:ss')
        process.stdout.write(chalk.gray(`${time} [${chalk.green('success')}]: `) + text + '\n')

        append(time + ' [success]: ' + text, "success")
    },
    error: function(text) {
        let time = moment().format('YYYY-MM-DD HH:mm:ss')
        process.stderr.write(chalk.gray(`${time} [${chalk.red('error')}]: `) + chalk.red(text) + '\n')

        append(time + ' [error]: ' + text, "error")
    },
    warn: function(text) {
        let time = moment().format('YYYY-MM-DD HH:mm:ss')
        process.stderr.write(chalk.gray(`${time} [${chalk.yellow('warn')}]: `) + text + '\n')

        append(time + ' [warn]: ' + text, "warn")
    },
    crash: function(text) {
        let time = moment().format('YYYY-MM-DD HH:mm:ss')
        process.stderr.write(chalk.gray(`${time} [${chalk.red('CRASH')}]: `) + text + '\n')

        append(time + ' [CRASH]: ' + text, "crash")
    }
}