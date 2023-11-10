const express = require('express');
var router = express.Router();
const fs = require("fs");
const app = express();
const req = express();
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
var opUnitc = "ADD" ;
var opCateg = "ADD" ;
var opCapac = "ADD" ;
var opColor = "ADD" ;
var opGarant = "ADD" ;
var antValUnitc = "";
var antValCateg = "";
var antValCapacMin = "";
var antValCapacMax = "";
var antValColor = "";
var antValGCateg = "";
var antValGarant = "";
var datam = new Date().toLocaleDateString("ro-RO");

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

async function runDelete(colectie, doc) {
  try {
    var client = new MongoClient(process.env.DATABASE_URL);
    const database = client.db("sgr");
    await database.collection(colectie).deleteOne(doc);
  } finally {
    await client.close();
  }
}

async function runReplace(colectie, doc) {
  try {
    var client = new MongoClient(process.env.DATABASE_URL);
    const database = client.db("sgr");
    await database.collection(colectie).replaceOne({}, doc);
  } finally {
    await client.close();
  }
}

async function runUpDate(colectie, doc, val ) {
  try {
    var client = new MongoClient(process.env.DATABASE_URL);
    const database = client.db("sgr");
    await database.collection(colectie).updateOne(doc, {$set: val });
  } finally {
    await client.close();
  }
}

/*
let arrUnitc = ['Carrefour Bv', 'Carrefour Bv AFI', 'Market Bv Astra', 'Market Bv Faget', 'Market Bv Magnolia', 'Market Bv Onix Grivitei'];
let arrCateg = ['plastic-pet', 'sticla-recipient', 'metal-doza al'];
let arrCapac = new Map();
arrCapac.set('min', 0.100);
arrCapac.set('max', 3.000);
let arrColor = ['transparent', 'albastru-transparent', 'verde-transparent', 'culoare nedefinita'];
let arrGarant = new Map();
arrGarant.set('plastic-pet', 0.5);
arrGarant.set('sticla-recipient', 0.5);
arrGarant.set('metal-doza al', 0.5);

write a JSON file
*/

router.get('/', async (req, res, next) => {
  const client = new MongoClient(process.env.DATABASE_URL);
  const database = client.db("sgr");
  async function runRead() {
    try {
      let nrUnitc = await database.collection("unitc").countDocuments() ;
      let nrCateg = await database.collection("categ").countDocuments() ;
      let nrCapac = await database.collection("capac").countDocuments() ;
      let nrColor = await database.collection("color").countDocuments() ;
      let nrGarant = await database.collection("garant").countDocuments() ;
      if ( nrUnitc != 0 ) {
        var arUnitc = await database.collection("unitc").find( { }, { projection: {_id: 0}} ).toArray() ;
        arrUnitc = arUnitc.map( object => object.unitc );
      }
      if ( nrCateg != 0 ) {
        var arCateg = await database.collection("categ").find( { }, { projection: {_id: 0}} ).toArray() ;
        arrCateg = arCateg.map( object => object.categ );
      }
      if ( nrCapac != 0 ) {
        var arCapac = await database.collection("capac").find( { }, { projection: {_id: 0}} ).toArray() ;
        opCapac = "DEL";
        antValCapacMin = arCapac[0].min;
        antValCapacMax = arCapac[0].max ;
        arrCapac = new Map();
          arrCapac.set('min', Number(arCapac.map( object => object.min )));
          arrCapac.set('max', Number(arCapac.map( object => object.max )));
      }
      if ( nrColor != 0 ) {
        var arColor = await database.collection("color").find( { }, { projection: {_id: 0}}).toArray() ;
        arrColor = arColor.map( object => object.color );
      }
      if ( nrGarant != 0 ) {
        var arGarant = await database.collection("garant").find( { }, { projection: {_id: 0}} ).toArray() ;
        arrGarant = new Map();
        for (let i=0; i<arGarant.map( object => object.gcateg).length; i++) {
          arrGarant.set( arGarant.map(object => object.gcateg)[i], Number(arGarant.map( object => object.garant )[i]));
        }
      }
    } finally {
      await client.close();
    }
/*
    console.log(arrUnitc) ;
    console.log(arrCateg);
    console.log(arrCapac);
    console.log(arrColor);
    console.log(arrGarant);
*/
    res.render('init', {
      arrUnitc,
      arrCateg,
      arrCapac: Array.from(arrCapac),
      arrColor,
      arrGarant: Array.from(arrGarant),
      opUnitc,
      opCateg,
      opCapac,
      opColor,
      opGarant,
      antValUnitc,
      antValCateg,
      antValCapacMin,
      antValCapacMax,
      antValColor,
      antValGCateg,
      antValGarant,
      datam
    })

//    write a JSON file
//    initializing a JavaScript object
   
    const dataObj = {
      arrUnitc: arrUnitc, 
      arrCateg: arrCateg,
      arrCapac: Array.from(arrCapac),
      arrColor: arrColor, 
      arrGarant: Array.from(arrGarant),
      datam: datam
    } ;
    
    // converting the JSON object to a string
    const sgrInit = JSON.stringify(dataObj);
    
    // writing the JSON string content to a file
    fs.writeFile("sgrInit.json", sgrInit, (err) => {
      if (err) {
        console.error(err);
        throw err;
      }
      console.log("sgrInit.json written correctly");
    });
  };
  runRead().catch(console.dir) ;
});

router.post('/initUnitc', (req, res, next) => {
  const unitc = {
    unitc: req.body.unitc
  }
  if (arrUnitc.length != 0) {
    if ( arrUnitc.findIndex( value => value === unitc.unitc) != -1 ) {
      if ( req.body.opinput == "DEL") {
        runDelete ("unitc", unitc).catch(console.dir) ;
        opUnitc = "ADD" ;
        antValUnitc = "";
      } else {
        opUnitc = "DEL";
        antValUnitc = unitc.unitc;
      }
    } else {
        opUnitc = "ADD";
        antValUnitc = "";
        runWrite ("unitc", unitc).catch(console.dir);
    }
  } else {
      opUnitc = "ADD";
      antValUnitc = "";
      runWrite ("unitc", unitc).catch(console.dir);
  }
  res.redirect('/init')
}) ;

router.post('/initCateg', (req, res, next) => {
  const categ = {
    categ: req.body.categ
  }
  if (arrCateg.length != 0) {
    if ( arrCateg.findIndex( value => value === categ.categ) != -1 ) {
      if ( req.body.opinput == "DEL") {
        opCateg = "ADD" ;
        antValCateg = "";
        runDelete ("categ", categ).catch(console.dir) ;
        const garant = {
          gcateg: req.body.categ
        }
        runDelete ("garant", garant).catch(console.dir);
      } else {
        opCateg = "DEL";
        antValCateg = categ.categ;
      }
    } else {
        opCateg = "ADD";
        antValCateg = "";
        runWrite ("categ", categ).catch(console.dir);
    }
  } else {
      opCateg = "ADD";
      antValCateg = "";
      runWrite ("categ", categ).catch(console.dir);
  }
  res.redirect('/init')
}) ;

router.post('/initCapac', (req, res, next) => {
  const capac = {
    min: req.body.min,
    max: req.body.max
  }
  antValCapacMin = req.body.min ;
  antValCapacMax = req.body.max ;
  if (opCapac == "ADD") {
    opCapac = "DEL";
    runWrite ("capac", capac).catch(console.dir);
  }
  if (opCapac == "DEL") {
    runReplace ("capac", capac).catch(console.dir);
  }
  res.redirect('/init')
}) ;

router.post('/initColor', (req, res, next) => {
  const color = {
    color: req.body.color
  }
  if (arrColor.length != 0) {
    if ( arrColor.findIndex( value => value === color.color) != -1 ) {
      if ( req.body.opinput == "DEL") {
        runDelete ("color", color).catch(console.dir) ;
        opColor = "ADD" ;
        antValColor = "";
      } else {
        opColor = "DEL";
        antValColor = color.color;
      }
    } else {
        opColor = "ADD";
        antValColor = "";
        runWrite ("color", color).catch(console.dir);
    }
  } else {
      opColor = "ADD";
      antValColor = "";
      runWrite ("color", color).catch(console.dir);
  }
  res.redirect('/init')
}) ;

router.post('/initGarant', (req, res, next) => {
  const garant = {
    gcateg: arrCateg[req.body.gcateg],
    garant: req.body.garant
  }
  if ( Array.from(arrGarant).length > req.body.gcateg) {
    if ( opGarant == "ADD" ) {
      opGarant = "DEL";
      antValGCateg = req.body.gcateg;
      antValGarant = Array.from(arrGarant)[req.body.gcateg][1];
    } else {
      opGarant ="ADD" ;
      antValGarant = "";
      runUpDate ("garant", { gcateg: arrCateg[req.body.gcateg] },{ garant: req.body.garant } ).catch(console.dir);
    }
  } else {
    opGarant = "ADD";
    runWrite ("garant", garant).catch(console.dir);
  }
  res.redirect('/init')
}) ;

module.exports = router;
