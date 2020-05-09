// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Address = new Schema({
   address     : String, 
   city      : String, 
   state      : String,
   zip      : String,
   created_at: { type : Date, default: Date.now },
});

/* var Cuisine = new Schema({
   name: String
}); */

// create a schema
var userSchema = new Schema({
    fname: String,
    lname: String,
    role: String,
    email: { type: String },
    password: { type: String },
    status: { type: Boolean, default: true },
    created_at: { type : Date, default: Date.now },
    updated_at: { type : Date, default: Date.now },
    address: [Address]
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;