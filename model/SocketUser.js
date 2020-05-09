var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var suSchema = new Schema({
    usermail: String,
    usersockeiId: String,
    created_at: { type : Date, default: Date.now },
    updated_at: { type : Date, default: Date.now },
});

var SocketUser = mongoose.model('SocketUser', suSchema);

// make this available to our users in our Node applications
module.exports = SocketUser;