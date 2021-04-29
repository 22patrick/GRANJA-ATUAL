//---------------------------- BIBLIOTECA  CONEXAO_MYSQL--------------------------
const express = require('express');
const bodyParser = require('body-parser');
let fs = require('fs');
const app = express();
const { exec } = require("child_process");
//---------------------------- BIBLIOTECA  PROGRAMACAO -----------------------------
var Gpio = require('onoff').Gpio;
var Wiegand = require('wiegand-node');   //Leitor rfid
var delay = require('delay');
//==================================================================================

//---------------------------- SERVER WEB PORTA 5000 -------------------------------
app.listen(process.env.PORT || 5000);

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json());

app.post('/usuario', function (req, res) {
  var comando = `SELECT usuario ,senha FROM usuario where usuario = '${req.body.usuario}' `;
  //console.log(comando);
  //console.log(req.body);
  execSQLQuery(comando, res);
});

app.get('/testewifi', function (req, res) {
  var itens = [{
    "id": 1,
    "nome": "Patrick",
    "qtde": 10
  }];


  const contents = '192.168.190.199\n'
  fs.appendFile('/etc/network/teste_de_rede.txt', contents, {

  }, (err) => {

    console.log("Error: ", err)
  });

  res.json(itens);
  //exec("sudo reboot");
});

app.post('/novo', (req, res) => {
  //const nome = req.body.nome.substring(0,150);
  //const cpf = req.body.cpf.substring(0,11);
  execSQLQuery(`INSERT INTO usuario(usuario, email, senha) VALUES('juliano','juliano@onevoip.com.br', 242424)`, res);
});


app.get('/conexao', function (req, res) {
  var conexao = { "conexao": "conectado" };
  res.json(conexao);
});

app.get('/usuario', function (req, res) {
  var comando = "SELECT * FROM usuario;"
  execSQLQuery(comando, res);
});


app.get('/funcionarios', function (req, res) {
  var comando = "SELECT * FROM funcionarios;"
  execSQLQuery(comando, res);
});

app.get('/tags', function (req, res) {
  var comando = "SELECT * FROM tags;"
  execSQLQuery(comando, res);
});

//=================================Conexao com o banco=======================//
var mysql = require('mysql');
const { query, response } = require('express');
const { json } = require('body-parser');

function execSQLQuery(sqlQry, res) {
  const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'admin',
    password: 'maringa',
    database: 'twitter_clone'
  });

  connection.query(sqlQry, function (error, results, fields) {
    if (error) {
      console.log('Comando no banco não executou!');
      res.json(error);
    }
    else {
      res.json(results);
      connection.end();
      console.log('Comando no banco executou!');
    }
  });
}


//======================= PROGRAMACAO PARA RELES , PORTAO ETC ======================//
"use strict";

//------------------------------- SETANDO RELE 1-4-------------------
var luzsala = new Gpio(12, 'out');
var arsala = new Gpio(16, 'out');
var portasala = new Gpio(20, 'out');
var persianasala = new Gpio(21, 'out');

//-------------------------------- SETANDO RELE 5-8-------------------
var luzq1 = new Gpio(6, 'out');
var arq1 = new Gpio(13, 'out');
var portaq1 = new Gpio(19, 'out');
var persianaq1 = new Gpio(26, 'out');
//----------------------------- SETANDO RELE PORTAO-------------------
var portao = new Gpio(25, 'out');

//------------------ SETANDO AS PORTAS DO RASP LEITOR TAG -----------
var pinL1D0 = 4,  //DATA0 of Wiegand connects to RPi GPIO04 (Pin 7)
  pinL1D1 = 17; //DATA1 of Wiegand connects to RPi GPIO17 (Pin 11)

var pinL2D0 = 8,  //DATA0 of Wiegand connects to RPi GPIO04 (Pin 7)
  pinL2D1 = 23; //DATA1 of Wiegand connects to RPi GPIO17 (Pin 11)

var wgL1 = new Wiegand(pinL1D0, pinL1D1);  //LEITOR SALA
var wgL2 = new Wiegand(pinL2D0, pinL2D1);  //LEITOR COZINHA

//------------------------- SERVER WEB -----------------------------
app.get('/', function (req, res) {


  //=================== Exemplo do link ->  http://192.168.190.50:3000/?id=portao ===================

  res.header("Access-Control-Allow-Origin", "*");
  // ============ STATUS MODULO ============
  if (req.query.id == 'status') {
    var wifi = { conectado: true };
    res.json(wifi);
  }
  // ============ LUZ ============
  if (req.query.id == 'luzl') {
    luzsala.writeSync(1);
    res.json(req.query);
  }
  if (req.query.id == 'luzd') {
    luzsala.writeSync(0);
    res.json(req.query);
  }
  //=======EXAUSTOR========
  if (req.query.id == 'exaustor_ligado') {

    (async () => {

      luzq1.writeSync(1);
      await delay(1000);
      arq1.writeSync(1);
      await delay(4000);
      portaq1.writeSync(1);
      await delay(1000);
      persianaq1.writeSync(1);
      exaustor_on = { id: "exaustor ligado" }
      res.json(exaustor_on);

    })();
  }
  if (req.query.id == 'exaustor_desligado') {

    (async () => {

      luzq1.writeSync(0);

      await delay(1000);
      arq1.writeSync(0);
      await delay(4000);
      portaq1.writeSync(0);
      await delay(1000);
      persianaq1.writeSync(0);

      exaustor_off = { id: "exaustor desligado" };

      res.json(exaustor_off);

    })();
  }
  //=======AR========
  if (req.query.id == 'arl') {
    arsala.writeSync(1);
    res.json(req.query);
  }
  if (req.query.id == 'ard') {
    arsala.writeSync(0);
    res.json(req.query);
  }
  //=======PORTA========

  if (req.query.id == 'portaa') {
    portasala.writeSync(1);
    res.json(req.query);
  }
  if (req.query.id == 'portaf') {
    portasala.writeSync(0);
    res.json(req.query);
  }
  //=======PERSIANA========

  if (req.query.id == 'pera') {
    persianasala.writeSync(1);
    res.json(req.query);
  }
  if (req.query.id == 'perf') {
    persianasala.writeSync(0);
    res.json(req.query);
  }
  //======PORTAO===========
  if (req.query.id == 'portao') {

    (async () => {

      luzq1.writeSync(1);
      await delay(1000);
      arq1.writeSync(1);
      await delay(6000);
      portaq1.writeSync(1);
      await delay(1000);
      persianaq1.writeSync(1);

      res.json(req.query);

    })();

  }

  // ---------------------------------- LENDO ARQUIVO STATUS_APP ----------------------------------
  if (req.query.id == 'status_app') {

    fs.readFile('/home/pi/Automacao/node_modules/status_app.json', 'utf8', (err, data) => {
      if (err) throw err;
      console.log(data);     
      var resul = data.toString();
      res.json(resul);

    });


  }

});
app.listen(3000);

//--------------------------- REGAR PLANTA--------------------------
function regar() {
  var d = new Date();
  var t = d.toLocaleTimeString();

  //console.log(t);

  if (t == '17:13:10') {
    ligar();
  } if (t == '17:13:30') {
    desligado();
  }
}
function ligar() {
  luzsala.writeSync(1);
  console.log("Tornei ligada");
}
function desligado() {
  luzsala.writeSync(0);
  console.log("Desligado");
}

setInterval(regar, 1000);

//--------------------------- LEITOR RFID 1-----------------------------
function getCode() {

  var tags = ['0001762530', '00116267013'];

  if (wgL1.available()) {

    if (wgL1.getCode() == tags[0]) {
      console.log("cadastrado Leitor 1 Sala");
      //console.log(wgL1.getCode()); //Display code
      ligarsala();
    } if (wgL1.getCode() == tags[1]) {
      console.log("cadastrado Leitor 1 quarto 1");
      //console.log(wgL1.getCode()); //Display code
      ligarq1();
    } else
      if (wgL1.getCode() != tags[0] && wgL1.getCode() != tags[1]) {
        //console.log("nao cadastrado Leitor 1 Sala");
        console.log("Tag não cadastrada.." + wgL1.getCode()); //Display code
      }
  }
  //--------------------------- LEITOR RFID 2-----------------------------

  //    if (wgL2.available()){

  //   if(wgL1.getCode() == tags[0] || wgL1.getCode() == tags[1]){
  //        console.log("cadastrado Leitor 2");
  //    }else{
  //        console.log("nao cadastrado Leitor 2");
  //        console.log(wgL2.getCode()); //Display code
  //        }
  // }
}
//-------------------------- FUNCOES LEITOR -----------------------------
function ligarsala() {

  if (luzsala.readSync() === 0) { //check the pin state, if the state is 0 (or off)

    (async () => {

      luzsala.writeSync(1); //set pin state to 1 (turn LED on)
      await delay(500);
      arsala.writeSync(1);
      await delay(500);
      persianasala.writeSync(1);
      await delay(500);
      portasala.writeSync(1);

    })();
  } else {

    (async () => {
      luzsala.writeSync(0); //set pin state to 0 (turn LED off)
      await delay(500);
      arsala.writeSync(0);
      await delay(500);
      persianasala.writeSync(0);
      await delay(500);
      portasala.writeSync(0);
    })();


  }
}

function ligarq1() {

  if (luzq1.readSync() === 0) { //check the pin state, if the state is 0 (or off)
    luzq1.writeSync(1); //set pin state to 1 (turn LED on)

  } else {
    luzq1.writeSync(0); //set pin state to 0 (turn LED off)

  }
}
setInterval(getCode); //Infinite loop

