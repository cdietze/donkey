var express = require('express');
var router = express.Router();
var wol = require('wake_on_lan');

router.put('/:mac', function (req, res) {
    var mac = req.params.mac;

    wol.wake(mac, function(error) {
        if(error) {
            res.send(500, 'Error while waking ' + mac + ', error: ' + error);
        } else {
            res.send(200);
        }
    });
});

module.exports = router;
