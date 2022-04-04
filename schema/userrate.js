"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

var rateSchema = new mongoose.Schema({
    sample_id: String, // 	Name of a file containing the actual photo (in the directory project6/images).
    rate: Number, // 	The date and time when the photo was added to the database
    user_id: mongoose.Schema.Types.ObjectId, // The ID of the user who created the photo.
});

// create a schema
var userRate = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId, 
    currentIdx: Number, 
    rates: [rateSchema], 
});

// the schema is useless so far
// we need to create a model using it
var UserRate = mongoose.model('UserRate', userRate);

// make this available to our users in our Node applications
module.exports = UserRate;
