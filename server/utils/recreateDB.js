// logs into an admin account on postgres 
// (should be your user account)
// configure the admin info in the knexfile
//
// from the admin account it drops the test db, creates it again
// and adds proper privileges, and runs migrations and seeds
// TODO: same thing for the development db
"use strict"; 
var database = 'flyptox_test';

var knexConfig = require('../../knexfile');
var knex = require('knex')(knexConfig.admin);

console.log('Dropping database!' + database);
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
    return knex.raw('grant all privileges on database flyptox_test to flyptox_test;');
  })
  .then(function(){
    console.log('Disconnecting from DB');
    return knex.destroy();
  })
  .then(function(){
    knex = require('knex')(knexConfig.test);
    console.log('Migrating latest to test');
    return knex.migrate.latest({env: 'test'});
  })
  .then(function(){
    console.log('Seeding test');
    return knex.seed.run({env: 'test'});
  })
  .then(function(){
    console.log('Migration and seeding complete');
  })
  .catch(function(err){
    console.error('Error when creating database. ', err);
  })
  .finally(function(){
    console.log('Done!');
    knex.destroy();
  });
