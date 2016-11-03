var
   express = require('express'),
   cors = require('cors'),
   app = express();

// include before other routes
app.options('*', cors({
   "preflightContinue": true,
   origin: true,
   credentials: true
}));

app.use(cors());

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST","PUT");
    next();

});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('app'));

app.listen(process.env.PORT || 3000, function () {
    console.log('Listening...');
});

exports.app = app;