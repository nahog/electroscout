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

const utils = {
    displayUnits: function(serverSettings) {
        if (serverSettings) {
            if (serverSettings.units == 'mmol') {
                return 'mmol/L';
            }
        }
        return 'mg/dL';
    },
    displaySgv: function(serverSettings, sgv) {
        if (serverSettings) {
            if (serverSettings.units == 'mmol') {
                return Math.round(sgv * 10.0 / 18.0) / 10.0;
            }
            return sgv;
        }
        return sgv;
    },
    displayDelta: function(serverSettings, sgv0, sgv1) {
        if (serverSettings) {
            if (serverSettings.units == 'mmol') {
                const sgv0diplay =  Math.round(sgv0 * 100.0 / 18.0) / 100.0;
                const sgv1diplay =  Math.round(sgv1 * 100.0 / 18.0) / 100.0;
                return utils.formatDelta(sgv0diplay - sgv1diplay);
            }
            return utils.formatDelta(sgv0 - sgv1);
        }
        return utils.formatDelta(sgv0 - sgv1);
    },
    formatDelta: function(delta) {
        if (delta >= 0) {
            return '+' + Math.round(delta * 100) / 100;
        }
        return Math.round(delta * 100) / 100;
    },
    displayDirection: function(direction) {
        return dir2Char[direction] || '-';
    }
}

module.exports = utils;