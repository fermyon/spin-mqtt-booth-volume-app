import { ResponseBuilder, Sqlite } from "@fermyon/spin-sdk";
import { getDateByDayString, getRelativeDate } from "./utils";

const sqlSelectAll = "SELECT * FROM noise_log";
const sqlSelectSubset = "SELECT * FROM noise_log WHERE DATETIME(noise_log.timestamp) > $1";
const sqlSelectSubsetByDay = "SELECT * FROM noise_log WHERE DATE(noise_log.timestamp) = $1";




const getSubsetByDay = (dayString: string, res: ResponseBuilder) => {
    const d = getDateByDayString(dayString);
    if (d === "") {
        res.status(400)
        res.send()
        return;
    }
    try {
        let conn = Sqlite.openDefault();
        let result = conn.execute(sqlSelectSubsetByDay.replace('$1', '\'' + d + '\''), []);
        let items = result.rows.map(row => { return asNoiseLogItem(row) });
        sendJson(res, items)
    } catch (e: any) {
        console.log(e);
        console.log(e.payload);
    }

}
const getSubsetByRelativeTime = (relativeTimeExpression: string, res: ResponseBuilder) => {
    let filter = getRelativeDate(relativeTimeExpression);
    if (filter == "") {
        res.status(400)
        res.send()
        return;
    }
    try {
        let conn = Sqlite.openDefault();
        let result = conn.execute(sqlSelectSubset.replace('$1', '\'' + filter + '\''), []);
        let items = result.rows.map(row => { return asNoiseLogItem(row) });
        sendJson(res, items)
    } catch (e: any) {
        console.log(e);
        console.log(e.payload);
    }
}

const getAll = (res: ResponseBuilder) => {
    let conn = Sqlite.openDefault();
    let result = conn.execute(sqlSelectAll, []);
    let items = result.rows.map(row => { return asNoiseLogItem(row) });
    sendJson(res, items)
};

const sendJson = (res: ResponseBuilder, data: any) => {
    res.set({ "content-type": "application/json" });
    res.send(JSON.stringify(data));
}

interface NoiseLogItem {
    source: string
    volume: number
    timestamp: string
}

const asNoiseLogItem = (row: any): NoiseLogItem => {
    return {
        source: row["source"],
        volume: Number(row["volume"]),
        timestamp: row["timestamp"],
    }
}


export {
    getAll,
    getSubsetByRelativeTime,
    getSubsetByDay
}
