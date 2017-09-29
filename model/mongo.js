var mongoose    =   require("mongoose");
mongoose.connect('mongodb://localhost:27017/moviesDb');
// create instance of Schema
var mongoSchema =   mongoose.Schema;
// create schema
var userSchema  = {
    "userEmail" : String,
    "userPassword" : String,
    "userName" : String,
    "userAge" : String
};
// create model if not exists.
module.exports = mongoose.model('userLogins',userSchema);