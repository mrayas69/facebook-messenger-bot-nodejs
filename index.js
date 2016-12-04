var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

var port = process.env.PORT || 8080;
app.use(bodyParser.json());

//Your FanPageToken Generated in your FB App
var token = "EAAJ1IPDkOIEBAKJpSJscO2PhlZBASOR6byTnQA0TEEaXKQHHQnvrf14BMVCZARbgyQBWtemv8LsAjepeCHBVSPJ7B5oNlHtfZBc0QV0TU9wug4y28mXwnSDWZC2kEE51WZC3yZBa5T8f14E3SAhBIwklZAdgfueYVlk6zDmyVgpGgZDZD";
var verify_token = "Hola";

//Root EndPoint
//Modificado MR
app.get('/', function (req, res) {

    res.send('botMensajero para Trip ver 1.0.161204');

});

//Setup Webhook
app.get('/webhook/', function (req, res) {
	try {

		if (req.query['hub.verify_token'] === verify_token) {
			res.send(req.query['hub.challenge']);
		}
		res.send('Error, token invalido');
	} catch (err) {
	  res.send('Error:'+err);
	}
	//res.sendStatus(200);

});

app.post('/webhook/', function (req, res) {

    var messaging_events = req.body.entry[0].messaging;

    for (var i = 0; i < messaging_events.length; i++) {

        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;

        if (event.message && event.message.text) {
            var text = event.message.text;
			var sMensaje=text;
			if (text==verify_token){
				sMensaje="SmartBot para Trip 1.161204 \nBienvenido a Trip http://ryac.no-ip.com/smarttaxi/index.html";
				sendTextMessage(sender,sMensaje.substring(0, 200));
			}else{
				/*var sDescargaApk="http://ryac.no-ip.com/smarttaxi/apps/TripPasajero.apk";
				var n = text.indexOf("Android");
				if (n>=0)
					sMensaje="Puedes descargar nuestra aplicacion para Android en "+sDescargaApk;
				else
					sMensaje="He recibido tu mensaje: "+ text.substring(0, 200);*/
				fRest(sender,'MensajeFaceBook',sMensaje);
								
			}
			
        }
    }

    res.sendStatus(200);

});



//App listen
app.listen(port, function () {

    console.log('Facebook Messenger Bot on port: ' + port);

});

function fRest(sender,Metodo,Parametro){
	
	var rRequest = require('request');
	//var url ='http://ryac.no-ip.com/smarttaxi/rest_smarttaxi.svc'+Metodo+Parametro;
	var url ='http://taxiver.com/rest_smarttaxi.svc/'+Metodo+'/'+Parametro;
	rRequest(url, function (error, response, body) {
		var sRespuesta="";
		if (!error && response.statusCode == 200) {
			sRespuesta=body;
			var oDatoJSON = JSON.parse(body);		
			if (oDatoJSON!=null)
				sRespuesta=oDatoJSON.MensajeFaceBookResult.respuesta;
		}else{
			sRespuesta="Ocurrio error:"+error;
		}
		sendTextMessage(sender,sRespuesta.substring(0, 200));
	});
}
//send Message with Facebook Graph Facebook v2.6
function sendTextMessage(sender, text) {

    var messageData = {
        text: text
    };

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function (error, response) {

        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }

    });

}