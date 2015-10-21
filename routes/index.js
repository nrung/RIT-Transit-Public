var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var _ = require('lodash');

var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    port: '3306',
    database: 'SCHEDULE'
});

connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected ... \n\n");
    } else {
        console.log("Error connecting database ... \n\n" + err);
    }
});

/* GET home page. */
router.get('/', function (req, res, next) {

    var date = new Date();

    console.log(date);
    connection.query('Select * FROM RCINN_WKD', [], function (err, rows) {

        if (err) throw err;
        var timeArray = [];
        console.log(rows[0]);

        for (var i = 0; i < rows.length; i++) {

            while (rows[i].isNull) {
                i++;
            }

            var ft = Time(rows[i].gleasonCircle);
            console.log(ft);
            var fr = Time(date);
            console.log(fr);
            console.log((ft.hours > fr.hours) || ((ft.hours = fr.hours) && (ft.minutes >= ft.minutes)));
            var flag = (ft.hours > fr.hours);
            if (flag) {
                timeArray.push(rows[i].gleasonCircle);
            }
        }
        timeArray = [];

        res.render('index', {
            title: 'RIT Transit',
            time: timeArray,
            currTime: new Date()
        });
    });
});

router.post('/', function (req, res, next) {
    var date = new Date();
    var permitted =
        ['gleasonCircle', 'ResHalls', 'barnesAndNoble', 'mktplaceMall', 'RITINN', 'raquetClub', 'UCWest', 'riverknollSouth', 'globalVillage'];

    console.log(date);
    connection.query('SELECT * FROM RCINN_WKD', [], function (err, rows) {

        var reqLoc = req.body.fromloc;
        if (err) throw err;
        var timeArray = [];
        if (_.includes(permitted, req.body.fromloc)) {

            console.log(rows[0]);
            for (var i = 0; i < rows.length; i++) {

                while (rows[i][req.body.fromloc] == null) {
                    i++;
                }

                console.log("From: " + rows[i][req.body.fromloc]);
                console.log("To: " + rows[i][req.body.toloc]);


                var ft = Time(rows[i][req.body.fromloc]);
                var ct = Time(date);
                //console.log((ft.hours > ct.hours) || ((ft.hours = ct.hours) && (ft.minutes >= ft.minutes)));
                var temp = rows[i][req.body.toloc];


                var flag = (ft.hours > ct.hours) || ((ft.hours = ct.hours) && (ft.minutes >= ft.minutes));


                var resStr = "Shuttle Departing at: " + ft.hrsStr + ":" + ft.minsStr; //+ ", Arriving at: " + tt.hours + ":" + tt.minutes;

                if (flag) {
                    timeArray.push(resStr);
                }
            }

        } else {
            timeArray = ["ERR: Action Not Permitted"]
        }

        res.render('index', {
            title: 'RIT Transit',
            time: timeArray,
            currTime: new Date()
        });
    });
});

module.exports = router;

// Parses dates into integers and strings as a "Time" object
function Time(d) {

    var theDate = d.toString();

    return {

        dayOfWeek: theDate.substring(0, 3),
        month: theDate.substring(4, 7),
        day: parseInt(theDate.substring(8, 10)),
        hours: parseInt(theDate.substring(16, 18)),
        minutes: parseInt(theDate.substring(19, 21)),
        hrsStr: theDate.substring(8, 10),
        minsStr: theDate.substring(19, 21)
    };
}
