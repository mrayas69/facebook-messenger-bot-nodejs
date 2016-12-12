var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

var port = process.env.PORT || 8080;
app.use(bodyParser.json());

//Your FanPageToken Generated in your FB App
var token = "EAAJ1IPDkOIEBAKJpSJscO2PhlZBASOR6byTnQA0TEEaXKQHHQnvrf14BMVCZARbgyQBWtemv8LsAjepeCHBVSPJ7B5oNlHtfZBc0QV0TU9wug4y28mXwnSDWZC2kEE51WZC3yZBa5T8f14E3SAhBIwklZAdgfueYVlk6zDmyVgpGgZDZD";
var verify_token = "Hola";

var cMensajeFaceBook = function () {
	var id_usuario = "";
	var nombre_usuario = "";
	var correo_usuario = "";
	var mensaje = "";
	var respuesta = "";
	var fecha_hora_mensaje = "";
	var fecha_hora_respuesta = "";
	}

//Root EndPoint
//Modificado MR
app.get('/', function (req, res) {

    res.send('botMensajero para Trip ver 1.0.161212');

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

			var oMensajeFaceBook = new cMensajeFaceBook();
			  oMensajeFaceBook.id_usuario = sender;
			  oMensajeFaceBook.nombre_usuario = "Nombre";
			  oMensajeFaceBook.correo_usuario = "Correo";
			  oMensajeFaceBook.mensaje = sMensaje;
			  oMensajeFaceBook.respuesta = "";
			  oMensajeFaceBook.fecha_hora_mensaje = fFechaHora();
			  oMensajeFaceBook.fecha_hora_respuesta = "";
			
			//sendTextMessage(sender,JSON.stringify(oMensajeFaceBook).substring(0, 300));
			//fRest(sender,'MensajeFaceBook',sMensaje);
			
			wsProcesaMensajeFaceBook(sender,oMensajeFaceBook);

			
        }
    }

    res.sendStatus(200);

});



//App listen
app.listen(port, function () {

    console.log('Facebook Messenger Bot on port: ' + port);

});

function wsProcesaMensajeFaceBook (sender,oMensajeFaceBook){
	
	var request = require('request');
	request({
		url: "http://ryac.no-ip.com/SmartTaxi/rest_smarttaxi.svc/ProcesaMensajeFaceBook",
		method: "POST",
		json: true,   // <--Very important!!!
		body: oMensajeFaceBook
	}, function (error, response, body){
		var sRespuesta="";
		if (!error && response.statusCode == 200) {
			sRespuesta=body.respuesta;
			//sRespuesta=JSON.stringify(body);
		}else{
			sRespuesta="Ocurrio error:"+error;
		}
		sendTextMessage(sender,sRespuesta);
	});
}

function fRest(sender,Metodo,Parametro){
	
	var rRequest = require('request');
	var url ='http://ryac.no-ip.com/smarttaxi/rest_smarttaxi.svc/'+Metodo+'/'+Parametro;
	//var url ='http://taxiver.com/rest_smarttaxi.svc/'+Metodo+'/'+Parametro;
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
		sendTextMessage(sender,sRespuesta.substring(0, 300));
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

function fFechaHora () {
	var hoy = new Date(),
            d = hoy.getDate(),
            m = hoy.getMonth() + 1,
            y = hoy.getFullYear(),
            data;

        if (d < 10) {
            d = "0" + d;
        };
        if (m < 10) {
            m = "0" + m;
        };
		
		var H = hoy.getHours();
		var M = hoy.getMinutes();
		var S = hoy.getSeconds();
		
		if (H < 10) {
            H = "0" + H;
        };
        if (M < 10) {
            M = "0" + M;
        };
		if (S < 10) {
            S = "0" + S;
        };

		data = d+"/"+m+"/"+ y +" " + H + ":" + M + ":" + S;
        
		return data;
}

function sendMenuMessage(sender, text) {

    var messageData = {
        text: text
    };

    request({
        url: 'https://graph.facebook.com/v2.6/me/thread_settings',
        qs: {access_token: token},
        method: 'POST',
        json:{
			setting_type : "call_to_actions",
			thread_state : "existing_thread",
			call_to_actions:[
				{
				  type:"web_url",
				  title:"FAQ",
				  payload:"http://ryac.no-ip.com/smarttaxi/index.html"
				},
				{
				  type:"web_url",
				  title:"Politica de privacidad",
				  payload:"http://taxiver.com/privacidad.html"
				},
				{
				  type:"web_url",
				  title:"Sitio Web",
				  url:"http://ryac.no-ip.com/smarttaxi/index.html"
				}
			  ]
		}
    }, function (error, response) {

        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }

    });

}