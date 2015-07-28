#!/usr/local/bin/node
"use strict";
// Create a new instance of vantage.
var vantage = require('vantage')();
var chalk = require('chalk');
var prompt = require('prompt');

// track if we are doing a package setup
var setup = false;

// intro banner
var banner = '-----------------------------\n' +
             'FlyptoX Administration Tool\n' +
             '-----------------------------';

// check arguments
process.argv.forEach(function(val){
  if(val === 'setup'){
    setup = true;
  }
});

// if use used the setup argument `./flyptox setup`
if (setup){
  runSetup();

} else {

  // Run admin Tool

  // display an intro banner
  console.log(chalk.blue(banner));

  // Add the command "foo", which logs "bar".
  vantage
    .command("foo")
    .description("Outputs 'bar'.")
    .action(function(args, callback) {
      this.log("bar");
      callback();
    });

  // Name your prompt delimiter
  // "websvr~$", listen on port 80
  // and show the Vantage prompt.
  vantage
    .delimiter("flyptoX$")
    .listen(8888)
    .show();
}


// run application setup
// this should really only ever happen once
function runSetup(){

  // customize the prompt
  prompt.message = "FX>".green;
  // prompt.delimitier = "><".green;

  // store our config info
  var config = {}

  // Run Setup Tool
  console.log(chalk.yellow(banner));
  console.log(chalk.red('Beginning Setup Process'));
  prompt.start();

  // get user settings
  prompt.get([{
      name: 'username',
      required: true
    }, {
      name: 'password',
      hidden: true,
      required: true,
      message: 'Must be 8 characters or more',
      conform: function (value) {
        if (value.length >= 8){
          return true;
        } else {
          return false;
        }
      }
    }, {
      name: 'exchangeName',
      type: 'string',
      description: 'Your exchanges unique name',
      required: true,
    }, {
      name: 'marginRequirements',
      type: 'number',
      message: 'Must be a number between 1 and 100',
      conform: function(value){
        if (value < 0 || value > 100){
          return false;
        } else {
          return true;
        }
      },
      description: 'Margin requirements: default(100%) Meaning 100% of the order cost is required for the order. (i.e. 0 margin)',
      default: 100
    }],

    function (err, result) {
      config.username = result.username;
      config.password = result.password;
      config.email = result.email;
      config.exchangeName = result.exchangeName;
      config.marginRequirements = result.marginRequirements;

      console.log(config);

      // write this config somewhere?

      // run npm install && bower install
      // run utils/dbTools --all

  });


}
