var express = require('express');
var router = express.Router();
var app = express();
var req = express();
const fs = require("fs");
const mongoose = require("mongoose");

var deladata = "";
var panaladata = "";
var xCateg = "";
var arrCateg = [];
var arrTotal = [];

app.use(express.json()) ;
app.use(express.urlencoded({ extended: true })) ;

const { MongoClient } = require("mongodb");

router.get('/', (req, res, next) => {
  if ( arrTotal.length == 0) {
    fs.readFile("sgrInit.json", (err, dataObj, next) => {
      if (err) {
        console.log(err);
        throw err;
      }
        // parsing the JSON object to convert it to a JavaScript object
      const sgrInit = JSON.parse(dataObj);
      arrCateg = sgrInit.arrCateg;
      for ( let i=0; i<arrCateg.length; i++) {
        arrTotal.push(Number(0));
      }
    })
  }

  res.render('statistica', {
    deladata,
    panaladata,
    arrCateg,
    arrTotal
  })
});

router.post('/', (req, res, next) => {

  arrTotal.splice(0);
  for ( let i=0; i<arrCateg.length; i++) {
    arrTotal.push(Number(0));
  }

  deladata = req.body.deladata;
  panaladata = req.body.panaladata;

  const client = new MongoClient(process.env.DATABASE_URL);
  const database = client.db("sgr");
  async function runRead() {
    try {
      var nrStatis = await database.collection("voucher").countDocuments() ;
      if ( nrStatis != 0 ) {
        const query = { "consumator.datam": {$gte: deladata, $lte: panaladata}} ;
        const options = {
          projection: {
            _id: 0,
            "consumator.datam": 1,
            "ambalaj": 1,
          }
        }
        const oneStatis = database.collection("voucher").find( query, options ) ;

        for await ( const doc of oneStatis) {
          for ( let i=0; i<Object.keys(doc.ambalaj).length; i++) {
            xCateg = doc.ambalaj[i].categ ;
            if ( arrCateg.indexOf(xCateg) != -1 ) {
              arrTotal[arrCateg.indexOf(xCateg)] +=  Number(doc.ambalaj[i].cant) ;
            }

          }
        }
      }
    } finally {
      await client.close();
    }
    res.redirect('/statistica');
  };
  runRead().catch(console.dir) ;
})

module.exports = router;
