var SQiggL = require('sqiggl');

var result = SQiggL.parse('{% for name of names using ";"} SELECT * FROM Dragons WHERE name = {name} {% endfor }');

console.log(result);