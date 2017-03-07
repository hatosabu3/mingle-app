//app.js
var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();
var server = http.createServer(app);
var wss = new WebSocketServer({server:server});
 
//Websocket接続を保存しておく
var connections = [];

// テンプレートエンジンを EJS に設定
app.set('views', './views');
app.set('view engine', 'ejs');

// 静的ファイルは無条件に公開
app.use('/public', express.static('public'));
app.use('/js',express.static('js'));

// ルーティング設定
app.use('/', require('./routes/index'));

users = {};
var ArrayMessage = new Array();
var key = "";
var box_id = "dummy";

//接続時
wss.on('connection', function (ws) {

    key = ws.upgradeReq.url.split("/")[2];
    console.log('connect:' + key + ' box_id:' + box_id);

    //userを設定
    users[key] = [ws,'connected',getTime(),box_id];

    //配列にWebSocket接続を保存
    connections.push(ws);
    var type = 'connect';
    
    //接続時に配信済のmessageを再送する
    ws.send(JSON.stringify([type,'dummy',key,'dummy']));
    recast(ws,ArrayMessage);

    //切断時
    ws.on('close', function () {
        console.log('disconnect:' + key);
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });

        //user情報をクリアする
        //wsをクリア、ステータス:disconnected,タイムスタンプ、box_idはそのまま
        users[key] = [null,'disconnected',getTime(),box_id];
    });

    //メッセージ受信時
    ws.on('message', function (message,req,res) {
        //get server time
        var timestamp = getTime();
        var data = JSON.parse(message);

        //メッセージが100件以上溜まったらshiftする
        if (ArrayMessage.length >= 100) {
          ArrayMessage.shift;
        }
        ArrayMessage.push(JSON.stringify([data[0],data[2],data[1],timestamp]));

        console.log(ArrayMessage.length,ArrayMessage[ArrayMessage.length - 1]);

        broadcast(ArrayMessage[ArrayMessage.length - 1]);
    });
});
 
//ブロードキャストを行う
function broadcast(message) {
    connections.forEach(function (con, i) {
        con.send(message);
    });
};

//再接続時に再送する
function recast(ws,ArrayMessage) {
  for (var i = 0; i < ArrayMessage.length; i++) {
    ws.send(ArrayMessage[i]);
  }
}

//1桁の数字を0埋めで2桁にする
var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;
};

//時刻書式変換
var getTime = function() {
  var date = new Date();
  var hh = toDoubleDigits(date.getHours());
  var mi = toDoubleDigits(date.getMinutes());
  return hh + ':' + mi;
};

server.listen(5000);

// アプリケーション開始ログ
console.log('Server running at http://localhost:5000');
