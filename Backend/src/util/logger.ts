import { createLogger, format, transports } from 'winston'
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports'
import util from 'util'
import { EApplicationEnvironment } from '../constant/application'
import config from '../config/config'
import path from 'path'
import * as sourceMapSupport from 'source-map-support'
import { blue, green, red, yellow } from 'colorette'

sourceMapSupport.install()

const colorizeLevel = (level: string) => {
    switch (level) {
        case 'ERROR':
            return red(level)
        case 'INFO':
            return blue(level)
        case 'WARN':
            return yellow(level)
        default:
            return level
    }
}

const consoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info

    const customLevel = colorizeLevel(level.toUpperCase())
    const customTimestamp = green(timestamp as string)
    const customMessage = message

    const customMeta = util.inspect(meta, {
        showHidden: false,
        depth: null,
        colors: true
    })

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return `${customLevel} [${customTimestamp}] ${customMessage}\nMETA ${customMeta}\n`
})

const consoleTransport = (): Array<ConsoleTransportInstance> => {
    return [
        new transports.Console({
            level: config.ENV === EApplicationEnvironment.DEVELOPMENT ? 'debug' : 'info',
            format: format.combine(format.timestamp(), consoleLogFormat)
        })
    ]
}

const fileLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info

    const logMeta: Record<string, unknown> = {}

    if (typeof meta === 'object' && meta !== null && !Array.isArray(meta)) {
        for (const [key, value] of Object.entries(meta)) {
            if (value instanceof Error) {
                logMeta[key] = {
                    name: value.name,
                    message: value.message,
                    trace: value.stack || ''
                }
            } else {
                logMeta[key] = value
            }
        }
    }

    const logData = {
        level: level.toUpperCase(),
        message,
        timestamp,
        meta: logMeta
    }

    return JSON.stringify(logData)
})

const fileTransport = (): Array<FileTransportInstance> => {
    return [
        new transports.File({
            filename: path.join(__dirname, '..', '..', 'logs', `${config.ENV}.log`),
            level: 'info',
            format: format.combine(format.timestamp(), fileLogFormat),
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5
        })
    ]
}

export default createLogger({
    defaultMeta: {
        service: 'learnhub-api',
        env: config.ENV
    },
    transports: [...fileTransport(), ...consoleTransport()]
})
