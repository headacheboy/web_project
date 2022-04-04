"use strict";

/*
 * Defined the Mongoose Schema and return a Model for a Photo
 */

/* jshint node: true */

var mongoose = require('mongoose');

/*
 * Photo can have comments and we stored them in the Photo object itself using
 * this Schema:
 */

// create a schema for Photo
var rateSchema = new mongoose.Schema({
    sample_id: String, // 	Name of a file containing the actual photo (in the directory project6/images).
    rate: Number, // 	The date and time when the photo was added to the database
    user_id: mongoose.Schema.Types.ObjectId, // The ID of the user who created the photo.
});

// the schema is useless so far
// we need to create a model using it 此处已经创建好了表
var Rate = mongoose.model('rate', rateSchema);

// make this available to our photos in our Node applications
module.exports = Rate;
