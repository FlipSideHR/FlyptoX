//npm install coinbase-exchange
var CoinbaseExchange = require('coinbase-exchange');
var publicClient = new CoinbaseExchange.PublicClient();
var _ = require("underscore");
var fs = require("fs");

//default but this is how to select differnet products
publicClient.productID = "BTC-USD";

function coinbaseToChartData(data) {
  return _.map(data, function(item){
    return {
      // "Date": new Date(item[0] * 1000),
      "Date": new Date(item[0] * 1000),
      "Open": item[3],
      "High": item[2],
      "Low": item[1],
      "Close": item[4],
      "Volume": item[5]
    };
  });
}

// returns a csv from an array of objects with
// values separated by commas and rows separated by newlines
function CSV(array) {
    // use first element to choose the keys and the order
    var keys = [];
    for (var k in array[0]) keys.push(k);

    // build header
    var result = keys.join(",") + "\n";

    // add the rows
    array.forEach(function(obj){
        keys.forEach(function(k, ix){
            if (ix) result += ",";
            result += obj[k];
        });
        result += "\n";
    });

    return result;
}

/* returned data
[ [ 1436468100, 271.01, 271.13, 271.02, 271.01, 17.378599999999995 ],
  [ 1436468040, 271.01, 271.03, 271.03, 271.01, 2.3335999999999997 ],
  [ 1436467980, 271.04, 271.04, 271.04, 271.04, 3.2955 ],
  [ 1436467920, 271.02, 271.13, 271.03, 271.05, 3.0127000000000006 ],
]
time bucket start time
low lowest price during the bucket interval
high highest price during the bucket interval
open opening price (first trade) in the bucket interval
close closing price (last trade) in the bucket interval
volume volume of trading activity during the bucket interval
*/
//granuality is number of seconds between data points
//api will limit answers to 200 data points
//start and end dates are in YYYY-MM-DD format (see docs for details)
//https://docs.exchange.coinbase.com/#get-historic-rates
publicClient.getProductHistoricRates({'granularity': 5*60, 'start':'2015-07-6', 'end':'2015-7-7'}, function(err, resp, data){
  if(data) {
    var obj = coinbaseToChartData(data);
    var jsonString = JSON.stringify(obj);
    // fs.writeFileSync('./data.json', jsonString, "utf-8");
    console.log(jsonString);
    // console.log(CSV(coinbaseToChartData(data)));
  }
});

// data needs to be converted to this format for charting
// https://github.com/andredumas/techan.js/wiki/Data-Structures#ohlc--volume
/*
[
    {
        date: new Date(2014, 2, 11),
        open: 12.3,
        high: 12.45,
        low: 12.22,
        close: 12.25
        volume: 1987289
    },
    {
        date: new Date(2014, 2, 12),
        open: 12.35,
        high: 12.40,
        low: 12.10,
        close: 12.25
        volume: 2325432
    }
]
*/
