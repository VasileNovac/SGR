var express = require('express');
var router = express.Router();
var app = express();
var req = express();
const fs = require("fs");
const mongoose = require("mongoose");

var unitc = "";
var datam = "";
var nume = "";
var loco = "";
var total = Number(0);
var nrConsumator = 0 ;
var nrVoucher = 0 ;

app.use(express.json()) ;
app.use(express.urlencoded({ extended: true })) ;

const { MongoClient } = require("mongodb");

router.get('/', (req, res, next) => {
  fs.readFile("sgrVoucher.json", (err, voucher, next) => {
    if (err) {
      console.log(err);
      throw err;
  }
    // parsing the JSON object to convert it to a JavaScript object
    const sgrVoucher = JSON.parse(voucher);

    unitc = sgrVoucher.unitc;
    datam = sgrVoucher.datam;
    nume = sgrVoucher.nume;
    loco = sgrVoucher.loco;
    total = sgrVoucher.total;
    nrConsumator = 1;
    nrVoucher = 1;
      
    res.render('voucher', {
      unitc,
      datam,
      nume,
      loco,
      total,
      nrConsumator,
      nrVoucher
    })
  })
})

router.post('/generare', function (req, res, next) {

  datam = req.body.datam;
  nume= req.body.nume;
  loco = req.body.loco;

  const client = new MongoClient(process.env.DATABASE_URL);
  const database = client.db("sgr");
  async function runRead() {
    try {
      var nrVoucher = await database.collection("voucher").countDocuments() ;
      if ( nrVoucher != 0 ) {
        const query = { 
          "consumator.unitc": unitc,
          "consumator.datam": datam,
          "consumator.nume": nume,
          "consumator.loco": loco
        } ;
        nrConsumator = await database.collection("voucher").countDocuments( query ) ;
        if ( nrConsumator != 0) {
          var oneVoucher = await database.collection("voucher").findOne( query, { projection: {_id: 0}} ) ;
          datam = oneVoucher.consumator.datam;
          nume = oneVoucher.consumator.nume;
          loco = oneVoucher.consumator.loco;
          total = oneVoucher.consumator.total;
        }
      }
    } finally {
      await client.close();
    }
    res.redirect('/voucher');
  };
  runRead().catch(console.dir) ;
});

module.exports = router;
