var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', (req, res, next) =>
  
  res.render('index', { titlu: 'Sistem de garantie-returnare (SGR) ambalaje nereutilizabile, gestionat de comercianti'})

  );

module.exports = router;
