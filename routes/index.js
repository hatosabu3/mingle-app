var express = require('express');
var router = express.Router();

// デフォルトルーティング
router.get('/', function (request, response) {
    response.render('index');
});

// 初回接続
router.get('/box/init', function(req, res) {
    // IDを採番する
    var key = getId();

    // 採番したIDを保存する
    users[key] = [null,'init',null,null];

    // ID付き接続へリダイレクトする
    res.redirect('/box/' + key);
});

// ID付き接続
router.get('/box/:foo', function(req,res) {
    // IDをチェックする
    if( users[req.params.foo] ) {
      // チェックOKならばboxへ移動する
      res.render('box',{ u_key: req.params.foo });
    } else {
      // チェックNGばらばinitへ移動する
      res.redirect('/box/init');
    }
});

module.exports = router;

var getId = function(){
  // 生成する文字列の長さ
  var l = 16;

  // 生成する文字列に含める文字セット
  var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";

  var cl = c.length;
  var r = "u";
  for(var i=0; i<l; i++){
    r += c[Math.floor(Math.random()*cl)];
  }
  return r;
}
