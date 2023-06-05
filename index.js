const fs = require("fs");
const path = require("path");

const styles = require('./styles');
function getDate(timezone) {
    const date = new Date();
    const year = date.toLocaleString('en-GB', { timeZone: timezone, year: 'numeric' });
    const month = date.toLocaleString('en-GB', { timeZone: timezone, month: 'numeric' });
    const day = date.toLocaleString('en-GB', { timeZone: timezone, day: 'numeric' });
    const hour = date.toLocaleString('en-GB', { timeZone: timezone, hour: 'numeric' });
    const minute = date.toLocaleString('en-GB', { timeZone: timezone, minute: 'numeric' });
    const second = date.toLocaleString('en-GB', { timeZone: timezone, second: 'numeric' });

    return {
        year,
        month,
        day,
        hour,
        minute,
        second
    }
}

const colour = {
    red: function (str) {
        return `${styles.colourRed}${str}${styles.revert}`;
    },
    yellow: function (str) {
        return `${styles.colourYellow}${str}${styles.revert}`;
    },
    green: function (str) {
        return `${styles.colourGreen}${str}${styles.revert}`;
    },
    blue: function (str) {
        return `${styles.colourBlue}${str}${styles.revert}`;
    },
    grey: function (str) {
        return `${styles.colourGrey}${str}${styles.revert}`;
    },
};
function getDateTime(pathSafe) {
    const tr = getDate();
    if (pathSafe === true) {
        return `${tr.year}-${tr.month}-${tr.day}-${tr.hour}-${tr.minute}-${tr.second}`;
    } else {
        return `${tr.year}-${tr.month}-${tr.day} ${tr.hour}:${tr.minute}:${tr.second}`;
    }
}

let logPath = path.join(__dirname, "../../logs");
let isDefaultPath = true;
if (process.env.MCSB_LOGGER_PATH && process.env.MCSB_LOGGER_PATH != "" && process.env.MCSB_LOGGER_PATH != " ") {
    if (!fs.existsSync(path.join(__dirname, "../../", process.env.MCSB_LOGGER_PATH))) {
        if (!fs.existsSync(logPath)) fs.mkdirSync(logPath);

        let time = getDateTime();
        return process.stderr.write(
            `${colour.grey(time)} [${colour.yellow("warn")}]: ` +
            "the path you provided in your env file does not exist defaulting to ./logs\n"
        );
    }
    logPath = path.join(__dirname, "../../", process.env.MCSB_LOGGER_PATH);
    isDefaultPath = false;
}

async function append(text, prefix) {
    let stats;

    if (isDefaultPath) {
        if (!fs.existsSync(logPath)) await fs.mkdirSync(logPath);
    }
    const logFilePath = process.env.MCSB_LOGGER_FILE_PREFIX
        ? process.env.MCSB_LOGGER_FILE_PREFIX.toString().toLowerCase() == "true"
            ? logPath + "/" + prefix + "-log.log"
            : logPath + "/log.log"
        : logPath + "/log.log";

    try {
        stats = fs.statSync(logFilePath);
        let fileSizeInkilobytes = stats.size / 1000;
        if (fileSizeInkilobytes > 300) {
            const logArchiveFilePath = process.env.MCSB_LOGGER_FILE_PREFIX
                ? process.env.MCSB_LOGGER_FILE_PREFIX.toString().toLowerCase() == "true"
                    ? logPath + "/" + prefix + "-" + getDateTime(true) + ".archive.log"
                    : logPath + "/" + getDateTime(true) + ".archive.log"
                : logPath + "/" + getDateTime(true) + ".archive.log";
            await fs.renameSync(logFilePath, logArchiveFilePath);
            await fs.writeFileSync(logFilePath, "");
        }
    } catch (er) {
        await fs.writeFileSync(logFilePath, "");
    }

    fs.appendFileSync(logFilePath, text + "\n", function (err) {
        if (err) console.error(colour.red("Error writing logs to file: " + err));
    });
}

module.exports.info = function (text, logToFile) {
    let time = getDateTime();
    process.stdout.write(colour.grey(`${time} [info]: `) + text + "\n");

    if (logToFile !== false) append(time + " [info]: " + text, "info");
};
module.exports.success = function (text, logToFile) {
    let time = getDateTime();
    process.stdout.write(colour.grey(`${time} [${colour.green("success")}]: `) + text + "\n");

    if (logToFile !== false) append(time + " [success]: " + text, "success");
};
module.exports.error = function (text, logToFile) {
    let time = getDateTime();
    process.stderr.write(colour.grey(`${time} [${colour.red("error")}]: `) + colour.red(text) + "\n");

    if (logToFile !== false) append(time + " [error]: " + text, "error");
};
module.exports.warn = function (text, logToFile) {
    let time = getDateTime();
    process.stderr.write(colour.grey(`${time} [${colour.yellow("warn")}]: `) + text + "\n");

    if (logToFile !== false) append(time + " [warn]: " + text, "warn");
};
module.exports.crash = function (text, logToFile) {
    let time = getDateTime();
    process.stderr.write(colour.grey(`${time} [${colour.red("CRASH")}]: `) + text + "\n");

    if (logToFile !== false) append(time + " [CRASH]: " + text, "crash");
};
