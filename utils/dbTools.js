#!/usr/local/bin/node
"use strict";

var utils = module.exports;
var argv = require('yargs').argv;
var testDB = 'flyptox_test';
var DB = 'flyptox';

// create a knex connection based on the
// current process env.
var getKnex = utils.getKnex = function() {

  var knexConfig = require('../knexfile');

  // use travis stuff if travis made the command
  // otherwise use normal test environment
  var kConfig = null;

  if (process.env.TRAVIS){
    kConfig = knexConfig.travis;
  } else {
    kConfig = knexConfig.test;
  }

  return require('knex')(kConfig);

};

// clean the db in the proper order
utils.clean = function(done){

  var startENV = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';

  var knex = getKnex();

  knex.raw('delete from transactions')
    .then(function(){
      return knex.raw('delete from trades;');
    })
    .then(function(){
      return knex.raw('delete from orders;');
    })
    .then(function(){
      return knex.raw('delete from accounts;');
    })
    .then(function(){
      return knex.raw('delete from users;');
    })
    .then(function(){
    })
    /* no need to delete these
    .then(function(){
      return bookshelf.knex.raw('delete from currency_pairs;');
    })
    .then(function(){
      return bookshelf.knex.raw('delete from currencies;');
    })
    */
    .catch(function(err){
      console.error(err);
    })
    .finally(function(){
      if(done){
        knex.destroy();
        process.env.NODE_ENV = startENV;
        done();
      }
    });
};
utils.recreateDB = recreateDB;

// if run as a script/from console run it this way
if (!module.parent){
  if (argv.all){
    recreateDB(testDB, 'test');
    console.log('---------------------------------');
    recreateDB(DB, 'development');
  } else if (argv.dev) {
    recreateDB(DB, 'development');
  } else {
    recreateDB(testDB, 'test');
  }
}

// create or recreate the DB.
function recreateDB(database, env, kConfig){

  // pass in a knexfile to use, or use main project knexfile
  var knexConfig = require('../knexfile');

  // assume its the test db unless otherwise specified
  database = database || testDB;

  // default knex config to use
  // (should be a local pg account with admin access)

  // if a kConfig arg was passed in, use that
  if (kConfig && knexConfig[kConfig]){
    kConfig = knexConfig[kConfig];

  // otherwise default to admin knexConfig
  } else {
    console.log('Using default kConfig');
    kConfig = knexConfig.admin;
  }

  // for tracking which environment we are in
  var ENV = env || 'test';

  // if this is a script check for
  // --options
  if (!module.parent){
    if (argv.dev){
      // set database to development
      console.log('Setting ENV and db to dev');
      database = 'flyptox';
      ENV = 'development';
    } else if (argv.travis){
      // set user to travis
      kConfig = knexConfig.travis;
    }
  }

  var knex = require('knex')(kConfig);

  console.log('Dropping database! -> ' + database);
  knex.raw('DROP DATABASE IF EXISTS ' + database + ';')
    .then(function(){
      console.log('Creating new database: ' + database);
      return knex.raw('CREATE DATABASE ' + database + ';');
    })
    .then(function(){
      console.log('Creating role ' + database);
      return knex.raw('create role ' + database + ' with login;');
    })
    .catch(function(){
      // role already exists
      return;
    })
    .then(function(){
      console.log('Granting privileges!');
      return knex.raw('grant all privileges on database '+database+' to '+database+';');
    })
    .then(function(){
      console.log('Disconnecting from DB');
      return knex.destroy();
    })
    .then(function(){
      console.log('ENV is: ', ENV);
      knex = require('knex')(knexConfig[ENV]);
      console.log('Migrating latest to ' + ENV);
      return knex.migrate.latest({env: ENV});
    })
    .then(function(){
      console.log('Seeding ' + ENV);
      return knex.seed.run({env: ENV});
    })
    .then(function(){
      console.log('Migration and seeding to ' + ENV + ' complete');
    })
    .catch(function(err){
      console.error('Error when creating database. ', err);
    })
    .finally(function(){
      console.log('Done!');
      knex.destroy();
      process.exit();
    });
}
