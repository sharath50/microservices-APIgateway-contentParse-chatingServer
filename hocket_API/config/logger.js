/**
 * installing dependancies
 */

const { createLogger, transports, format } = require("winston");
const winstonMongo = require("winston-mongodb");
const config = require("./database");

logger = createLogger({
    transports: [
        new transports.File({
            level: 'info',
            filename: './logs/info.log',
            format : format.combine(format.timestamp(), format.json()),
        }),
        new transports.MongoDB({
            level: 'error',
            db : config.db,
            options : { useUnifiedTopology : true },
            collection : "appLogs",
            format : format.combine(format.timestamp(), format.json()),
        })
    ]
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.simple()
    }));
}


logger2 = createLogger({
    level : "info",
    filename : "./logs/info.log",
    format: format.combine(
        format.label({ label: 'right meow!' }),
        format.timestamp(),
        format.printf(({ level, message, label, timestamp }) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
        })
    ),
    transports : [new transports.Console()]
})
logger2.log({
    level: 'info',
    message: 'What time is the testing at?'
});



module.exports = logger;  




