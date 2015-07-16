"use strict"; 

var conn = {
  host     : '127.0.0.1',
  user     : 'recursion',
  charset  : 'utf8'
};

// connect to real db in order to drop test db
conn.database = 'flyptox';
var knex = require('knex')({ client: 'pg', connection: conn});

//create role flyptox with login;
//grant all privileges on database flyptox to flyptox;
var database = 'flyptox_test';
knex.raw('DROP DATABASE IF EXISTS ' + database + ';')
  .then(function(){
    // connect with database selected
    return knex.raw('CREATE DATABASE ' + database + ';');
  })
  .then(function(knex){
    // destroy connection?
    knex.destroy(); 

    // now connect to our test db
    conn.database = 'flyptox_test';
    return require('knex')({ client: 'pg', connection: conn});
  })
  .then(function(knex){
    return knex.raw('create role flyptox_test with login;');
  })
  .then(function(knex){
    return knex.raw('grant all privileges on database flyptox_test to flyptox_test;');
  })
  .then(function(knex){
    knex.destroy();
    console.log('done!');
  })
  .catch(function(err){
    console.error('Error when creating database. ', err);
  })
  .finally(function(err, data){
    console.log(err,data);
  });
