import * as log from 'npmlog';



log.enableColor();
log.enableProgress();
log.enableUnicode();
log.addLevel('info', 2000, {bg: 'black', fg: 'cyan'}, 'INFO\t');
log.addLevel('error', 5000, {bg: 'black', fg: 'red'}, 'ERROR!\t');

function format(x: number) {
    return x < 10 ? '0' + x : x;
}

function getDate() {
    const date = new Date();

    const time = format(date.getHours()) + ':' + format(date.getMinutes()) + ':' + format(date.getSeconds()) + '.' + date.getMilliseconds()
    const dd = date.getFullYear() + '-' + format((date.getMonth() + 1)) + '-' + format(date.getDate())

    return dd + ' ' + time;
}

function parse(header: any, message: string, ...args) {
    let headerName = header;
    if(typeof header == 'object') {
        headerName = header.constructor.name;
    } else if(typeof header == 'function') {
        headerName = header.name;
    }

    let msg = message;

    for(const arg of args) {
        if (typeof arg === 'object') {
            msg = msg.replace('{}', '%j');
        } else {
            msg = msg.replace('{}', '%s');
        }
    }

    return {
        header: getDate() + ' --- ' + headerName + '\t' + (headerName.length <= 10 ? '\t' : ''),
        message: msg,
        args
    }
}

const logger = {
    info: (header: Object | string, message, ...args) => {
        const out = parse(header, message, ...args);
        log.info(out.header, out.message, ...out.args);
    },
    error: (header: Object | string, message, ...args) => {
        const out = parse(header, message, ...args);
        log.error(out.header, out.message, ...out.args);
    }
}

export default logger;