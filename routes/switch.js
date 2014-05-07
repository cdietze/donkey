var express = require('express');
var router = express.Router();
var _ = require('underscore');
var childProcess = require('child_process');

router.put('/:systemCode/:deviceCode', function (req, res) {
    var systemCode = req.params.systemCode;
    var deviceCode = req.params.deviceCode;
    var state = stateToBoolean(req.query.state);

    console.log("systemCode: " + systemCode + ", deviceCode: " + deviceCode + ", state: " + state);
    execSend(systemCode, deviceCode, state, res);
});

function execSend(systemCode, deviceCode, state, res) {
    var command = 'send ' + systemCode + ' ' + deviceCode + ' ' + (state ? '1' : '0');
    childProcess.exec(command,
        function (error, stdout, stderr) {
            var data = {
                stdout: stdout,
                stderr: stderr
            };
            if (error !== null) {
                data = _.extend(data, error);
                console.log('exec error: ' + JSON.stringify(data));
                res.send(500, data);
            } else {
                res.send(200, data);
            }
        }
    );
}

var stateToBoolean = function (state) {
    state = state.toLowerCase();
    if (state === 'on') return true;
    if (state === 'off' || state === '0' || state === 'false') return false;
    return !!state;
}

module.exports = router;
