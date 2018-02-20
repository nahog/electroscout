const electron = require('electron');
const {ipcRenderer} = electron;
const Store = require('electron-store');
const store = new Store();
const settings = store.get('settings');
var serverSettings = null;

function displaySgv(sgv) {
    if (serverSettings) {
        if (serverSettings.units == 'mmol') {
            return Math.round(sgv * 10.0 / 18.0) / 10;
        }
        return sgv;
    }
    return sgv;
}

function displayDelta(sgv0, sgv1) {
    if (serverSettings) {
        if (serverSettings.units == 'mmol') {
            const sgv0diplay =  Math.round(sgv0 * 10.0 / 18.0) / 10;
            const sgv1diplay =  Math.round(sgv1 * 10.0 / 18.0) / 10;
            return formatDelta(sgv0diplay - sgv1diplay);
        }
        return formatDelta(sgv0 - sgv1);
    }
    return formatDelta(sgv0 - sgv1);
}

function formatDelta(delta) {
    if (delta >= 0) {
        return '+' + Math.round(delta * 10) / 10;
    }
    return Math.round(delta * 10) / 10;
}

const dir2Char = {
    NONE: '⇼'
    , DoubleUp: '⇈'
    , SingleUp: '↑'
    , FortyFiveUp: '↗'
    , Flat: '→'
    , FortyFiveDown: '↘'
    , SingleDown: '↓'
    , DoubleDown: '⇊'
    , 'NOT COMPUTABLE': '-'
    , 'RATE OUT OF RANGE': '⇕'
};

function displayDirection(direction) {
    return dir2Char[direction] || '-';
}