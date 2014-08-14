var q = require('q');
var express = require('express');
var router = express.Router();
var ping = require('net-ping');

var pingSession = ping.createSession({
    timeout: 2000 // in ms
});

/** A map from IPs to promises */
var pingCache = {};

var pingHost = function (ip) {
    var deferred = q.defer();
    pingSession.pingHost(ip, function (error, target) {
        if (error) {
            if (error instanceof ping.RequestTimedOutError) {
                deferred.resolve(false);
            } else {
                console.log('Error while pinging ' + ip + ', error: ' + error);
                deferred.reject(new Error('Error while pinging ' + ip + ', error: ' + error));
            }
        } else {
            deferred.resolve(true);
        }
    });
    return deferred.promise;
};

var cachedPing = function (ip) {
    if (!pingCache[ip]) {
        console.log('Updating ping value of ' + ip);
        pingCache[ip] = pingHost(ip);
        setTimeout(function () {
            console.log('Invalidating ping value of ' + ip);
            delete pingCache[ip];
        }, 5000);
    }
    return pingCache[ip];
};

router.get('/:ip', function (req, res) {
    var ip = req.params.ip;
    cachedPing(ip).then(function (pingOk) {
        if (pingOk) {
            res.send(200);
        } else {
            res.send(404, 'Timeout while pinging ' + ip);
        }
    }, function (err) {
        res.send(404, err.toString());
    });
});

module.exports = router;
