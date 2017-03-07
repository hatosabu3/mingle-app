'use strict';

//Enterキーでサブミットを防止する
$(function() {
   $(document).on("keypress", "input:not(.allow_submit)", function(event) {
   return event.which !== 13;
  });
});

//画像アップロード時にBase64に変換する
function ImageToBase64(img, mime_type) {
  // New Canvas
  var canvas = document.createElement('canvas');
  canvas.width  = img.width;
  canvas.height = img.height;
  // Draw Image
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  // To Base64
  return canvas.toDataURL(mime_type);
}

//メッセージをサーバーへ送信する
function send() {
   if(document.getElementById('msg').value != ""){
      ws.send(JSON.stringify(['text',id,document.getElementById('msg').value]));
      document.getElementById('msg').value = "";
    }
}

//画像をサーバーへ送信する
function sendFile() {
    var file = document.getElementById('file').files[0];
    var reader = new FileReader();

    //console.log(document.js.myModal);
    console.log(document.getElementById('myModal'));

    reader.onload = function(evt){
        console.log(file.type.split("/")[0]);
        if ( file.type.split("/")[0] == "image") {
          ws.send(JSON.stringify(['img',evt.target.result]));
        }  else if ( file.type.split("/")[0] == "video") {
          ws.send(JSON.stringify(['mov',evt.target.result]));
        }
    }
    reader.readAsDataURL( file );
    clearValue( "file");
}

//Enterキー押下時にsend
function go(){
  if(window.event.keyCode==13) send();
}

//input fileタグの初期化
function clearValue(id){
  //$("#"+id).replaceWith($("#"+id).clone());
  $("#"+id).val("");
}

var host = window.document.location.host.replace(/:.*/, '');
var ws = new WebSocket('ws://' + host + ':5000/box/' + u_key);
var messageText = "";
var messageCount = 0;
var id = "";

ws.onmessage = function (event) {
    var message = JSON.parse(event.data);
    console.log(message);
    var type = message[0];
    var data = message[1];
    var client = message[2];
    var timeString = message[3];

    messageCount += 1;

    /* add */
    //messageText += "<div class=\"list-mv05\">";
    /* add */

    if ( type == "text" ) {
      if (message[2] == id) {
        messageText += "<div class=\"" + "right" + "_balloon" + "\" id=\"message_" + String(messageCount) + "\"> " + data + "</div>";
      } else {
        messageText += "<div class=\"" + "left" + "_balloon" + "\" id=\"message_" + String(messageCount) + "\"> " + data + "</div>";
      }
    } else if ( type == "img" ) {
      messageText += "<img class=\'img-responsive\' src=\"" + data + "\"</img> <br/>";
    } else if ( type == "mov") {
      messageText += "<video controls = true> \n <source src=\'" + data + "\' type=\'video/ogg; codecs=\"theora, vorbis\"\'> \n <source src=\'" + data + "\' type=\'video/mp4; codecs=\"avc1.42E01E, mp4a.40.2\"\'> \n <p>動画を再生するには、videoタグをサポートしたブラウザが必要です。</p> \n </video> <br/>";
    } else if ( type == "connect") {
      //初回アクセス時にはクライアントidを取得
      id = message[2];
      history.replaceState('','','/box/' + u_key);
    } else {
      console.log(type);
    }

    if ( type == "text" || type == "img" || type == "mov") {
      //display message
      document.getElementById("messages").innerHTML = messageText;

      //get message height and width
      var tval = document.getElementById("message_" + String(messageCount)).clientHeight + 10;
      var wval = document.getElementById("message_" + String(messageCount)).clientWidth + 25;

      /* add */
      //document.getElementById("messages").innerHTML += "<div class=\"list-mv05\">";
      /* add */

      //display time record
      if (message[2] == id) {
        document.getElementById("messages").innerHTML += "<div style=\"position:relative;color:#f9f9df;height:" + String(tval) + "px\"><div style=\"position:absolute;bottom:0;right:0;font-size:11px;margin-right:" + String(wval) + "px;\">" + timeString + "</div></div>";
        messageText += "<div style=\"position:relative;color:#f9f9df;height:" + String(tval) + "px\"><div style=\"position:absolute;bottom:0;right:0;font-size:11px;margin-right:" + String(wval) + "px;\">" + timeString + "</div></div>";
      } else {
        document.getElementById("messages").innerHTML += "<div style=\"position:relative;color:#f9f9df;height:" + String(tval) + "px\"><div style=\"position:absolute;bottom:0;left:0;font-size:11px;margin-left:" + String(wval) + "px;\">" + timeString + "</div></div>";
        messageText += "<div style=\"position:relative;color:#f9f9df;height:" + String(tval) + "px\"><div style=\"position:absolute;bottom:0;left:0;font-size:11px;margin-left:" + String(wval) + "px;\">" + timeString + "</div></div>";
      }

      /* add */
      //messageText += "</div>";
      /* add */

      //dummy empty record
      document.getElementById("messages").innerHTML += "<div style=\"position:relative;clear:both;width:100%;height:0px;\"></div>";
      messageText += "<div style=\"position:relative;clear:both;width:100%;height:0px;\"></div>";

      //dummy empty area
      document.getElementById("messages").innerHTML += "<div style=\"position:relative;clear:both;width:100%;height:80px\"/>";

      //scroll message
      document.getElementById("wrapper").scrollTop = document.getElementById("wrapper").scrollHeight;
    }
}

/*
$(function() {
	$('.list-mv05').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
		if(isInView){
			$(this).stop().addClass('mv05');
		}
		else{
			$(this).stop().removeClass('mv05');
		}
	});
});
*/
