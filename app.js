var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

var Slack = require('slack-node');

var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var apiToken = process.env.SLACK_API_TOKEN || ''; // set token

var slack = new Slack(apiToken);
var rtm = new RtmClient(apiToken);
rtm.start();

var channel = '', // set channel ID
    botName = 'BOT NAME';

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    if (typeof message.user != 'undefined') {
        var user = rtm.dataStore.getUserById(message.user);

        io.emit('chat message', user.real_name + ': ' + message.text);
    }
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        slack.api('chat.postMessage', {
            text: msg,
            channel: channel,
            username: botName
        }, function(err, response){});

        io.emit('chat message', 'My message: ' + msg);
    });
});

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
