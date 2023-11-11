var express = require("express");
var router = express.Router();
var app = express();
var req = express();
const fs = require("fs");
const mongoose = require("mongoose");
/*
var {LocalStorage} = require('node-localstorage') ;
var localStorage = new LocalStorage('./ls'); 
*/
app.use(express.json()) ;
app.use(express.urlencoded({ extended: true })) ;

var arrUnitc = [];
var arrCateg = [];
var arrCapac = [];
var arrColor = [];
var arrGarant = [];
var datam = "";
var arrConsumator = [];
var arrAmbalaj = [];
var total = Number(0);
var antValUnitc = "";
var rand = Number(0);

function ftotal() {
  total = 0;
  for (let i=0; i<arrAmbalaj.length; i++) {
    total = total + arrAmbalaj[i].cant * arrAmbalaj[i].garant ;
  }
  return total;
}

const { MongoClient } = require("mongodb");

async function runWrite(colectie, doc) {
  try {
    var client = new MongoClient(process.env.DATABASE_URL);
    const database = client.db("sgr");
    await database.collection(colectie).insertOne(doc);
  } finally {
    await client.close();
  }
}

router.get('/', (req, res, next) => {
  // read a JSON file
  // reading a JSON file asynchronously

  fs.readFile("sgrInit.json", (err, dataObj, next) => {
    if (err) {
      console.log(err);
      throw err;
    }
      // parsing the JSON object to convert it to a JavaScript object
    const sgrInit = JSON.parse(dataObj);

    arrUnitc = sgrInit.arrUnitc ;
    arrCateg = sgrInit.arrCateg;
    arrCapac = new Map(sgrInit.arrCapac) ;
    arrColor = sgrInit.arrColor ;
    arrGarant = new Map(sgrInit.arrGarant) ;
    datam = sgrInit.datam ;

    res.render('inregistrare', {
      arrUnitc, 
      arrCateg, 
      arrCapac, 
      arrColor, 
      arrGarant,
      datam,
      arrConsumator,
      arrAmbalaj,
      antValUnitc,
      total,
      rand
    })
  })
})


router.post('/add', (req, res, next) => {
/*
  console.log(req.body.unitc) ;
  console.log(req.body.datam);
  console.log(req.body.nume) ;
  console.log(req.body.loco) ;
  console.log(arrCateg[req.body.categ]);
  console.log(req.body.capac) ;
  console.log(arrColor[req.body.color]);
  console.log(req.body.cant) ;
  console.log(Array.from(arrGarant)[req.body.garant][1]);
*/
  const ambalaj = {
    categ: arrCateg[req.body.categ],
    capac: req.body.capac,
    color: arrColor[req.body.color],
    cant: req.body.cant,
    garant: Array.from(arrGarant)[req.body.garant][1],
    unitTotal: req.body.cant * Array.from(arrGarant)[req.body.garant][1]
  }
  arrAmbalaj.push(ambalaj);
  total = ftotal();
  if ( arrConsumator.length == 0) {
    const consumator = {
      unitc: req.body.unitc,
      datam,
      nume: req.body.nume,
      loco: req.body.loco,
      total
    }
    arrConsumator.push(consumator);
    antValUnitc = req.body.unitc;
  }  
  res.redirect('/inregistrare')
})

router.post('/wrVoucher', (req, res, next) => {
  var ambalaj = {};
  for( let i=0; i<arrAmbalaj.length; i++) {
    ambalaj[i] = {
       ky: i,
       categ: arrAmbalaj[i].categ,
       capac: arrAmbalaj[i].capac,
       color: arrAmbalaj[i].color,
       cant: arrAmbalaj[i].cant,
       garant: arrAmbalaj[i].garant,
       unitTotal: arrAmbalaj[i].unitTotal
    }
  };
  var voucher = {
    consumator: {
      unitc: arrConsumator[0].unitc,
      datam,
      nume: arrConsumator[0].nume,
      loco: arrConsumator[0].loco,
      total
    },
    ambalaj: ambalaj
  }
  runWrite ("voucher", voucher).catch(console.dir);

//    write a JSON file
//     converting the JSON object to a string
  const sgrVoucher = JSON.stringify(voucher.consumator);
  
//     writing the JSON string content to a file
  fs.writeFile("sgrVoucher.json", sgrVoucher, (err) => {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log("sgrVoucher.json written correctly");
  });

  arrAmbalaj.splice(0);
  antValUnitc = arrConsumator[0].unitc ;
  arrConsumator.splice(0);
  total = 0;
  res.redirect('/inregistrare')
})

router.post('/mrow', (req, res, next) => {
  rand = req.body.opinput;
  res.redirect('/inregistrare')
})

router.post('/change', (req, res, next) => {
  if (req.body.cant == 0 ) {
    arrAmbalaj.splice(rand - 1, 1) ;
  } else {
    categ = arrAmbalaj[rand - 1].categ;
    if ( req.body.categ != -1 ) {
      categ = arrCateg[req.body.categ];
    }
    capac = req.body.capac,
    color = arrAmbalaj[rand - 1].color;
    if ( req.body.color != -1 ){
      color = arrColor[req.body.color];
    } 
    cant = req.body.cant;
    garant = arrAmbalaj[rand - 1].garant;
    if ( req.body.garant != -1 ) {
      garant = Array.from(arrGarant)[req.body.garant][1];
    }
    unitTotal = cant * garant ;

    const ambalaj = {
      categ,
      capac,
      color,
      cant,
      garant,
      unitTotal
    }
    arrAmbalaj[rand - 1] = ambalaj;
  }
  total = ftotal();
  rand = 0;
  res.redirect('/inregistrare')
})

module.exports = router;
