//app.js
var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();
 
//app.use(express.static(__dirname + '/'));
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
app.use('/', require('./routes/index.js'));

var users = {};
var ArrayMessage = new Array();

//接続時
wss.on('connection', function (ws) {
    //var key = ws.upgradeReq.headers['sec-websocket-key'];
    var key = ws.upgradeReq.headers.cookie;
    console.log('connect:' + key);
    //console.log(ws);

    //配列にWebSocket接続を保存
    connections.push(ws);
    users[key] = ws;
    var type = 'connect';
    ws.send(JSON.stringify([type,key,'dummy']));
    
    //再接続時にmessageを再送する
    recast(ws,ArrayMessage);

    //切断時
    ws.on('close', function () {
        console.log('disconnect:' + key);
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
    });

    //メッセージ受信時
    ws.on('message', function (message,req,res) {
        //get server time
        var timestamp = getTime();

        switch (ws.upgradeReq.url){
          case '/':
            var type = 'text';
            break;
          case '/image':
            var type = 'img';
            break;
          case '/movie':
            var type = 'movie';
            break;
          default:
            var type = 'other';
            break;
        }

        //メッセージが100件以上溜まったらshiftする
        if (ArrayMessage.length >= 100) {
          ArrayMessage.shift;
        }
        ArrayMessage.push(JSON.stringify([type,message,key,timestamp]));

        console.log(ArrayMessage.length,ArrayMessage[ArrayMessage.length - 1]);

        broadcast(ArrayMessage[ArrayMessage.length - 1]);
    });
});
 
//ブロードキャストを行う
function broadcast(message) {
    connections.forEach(function (con, i) {
        //con.set('Content-Type','image/jpeg');
        //console.log(message);
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
  //var yyyy = date.getFullYear();
  //var mm = toDoubleDigits(date.getMonth() + 1);
  //var dd = toDoubleDigits(date.getDate());
  var hh = toDoubleDigits(date.getHours());
  var mi = toDoubleDigits(date.getMinutes());
  //return yyyy + '/' + mm + '/' + dd + ' ' + hh + ':' + mi;
  return hh + ':' + mi;
};

server.listen(5000);

// アプリケーション開始ログ
console.log('Server running at http://localhost:5000');
