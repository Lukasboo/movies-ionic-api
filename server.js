var express     =   require("express");
var app         =   express();
var bodyParser  =   require("body-parser");
var router      =   express.Router();
var mongoose    =   require("mongoose");
mongoose.connect('mongodb://localhost:27017/moviesDb');
/*
   * MongoDB port is 27017 by default.
   * Assuming you have created mongoDB database named "demoDb".
*/
var mongoSchema =   mongoose.Schema;
var userSchema  = {
    "userEmail" : String,
    "userPassword" : String
};
var mongoOp     =   require("./model/mongo");


mongoose.model('user_login',userSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

router.get("/",function(req,res){
    res.json({"error" : false,"message" : "Hello World"});
});

//route() will allow you to use same path for different HTTP operation.
//So if you have same URL but with different HTTP OP such as POST,GET etc
//Then use route() to remove redundant code.

router.route("/users")
.get(function(req,res){
    var response = {};
    mongoOp.find({},function(err,data){
    // Mongo command to fetch all data from collection.
        if(err) {
            response = {"error" : true,"message" : "Error fetching data"};
        } else {
            response = {"error" : false,"message" : data};
        }
        res.json(response);
    });
})

.post(function(req,res){

    mongoOp.findOne({ userEmail: req.body.userEmail}, function(err, userlogins) {
        if (err) {
            return handleError(err);
        } else {
            if(userlogins != null){
                console.log("Usuário já existe, escolha outro nome de usuário!");
                res.json({"Erro": "Usuário já existe, escolha outro nome de usuário!"});
            } else {
                
                var db = new mongoOp();
                var response = {};
                // fetch email and password from REST request.
                // Add strict validation when you use this in Production.
                db.userEmail = req.body.userEmail; 
                // Hash the password using SHA1 algorithm.
                db.userPassword =  require('crypto')
                                  .createHash('sha1')
                                  .update(req.body.userPassword)
                                  .digest('base64');
                db.save(function(err){
                // save() will run insert() command of MongoDB.
                // it will add new data in collection.
                    if(err) {
                        response = {"error" : false,"message" : "Erro ao salvar usuário"};
                    } else {
                        response = {"error" : true,"message" : "Usuário salvo com sucesso!"};
                    }
                    res.json(response);
                });
                //res.json(false);
            }
        }    
    })
});

router.route("/users/:id")
.get(function(req,res){
    var response = {};
    mongoOp.findById(req.params.id,function(err,data){
    // This will run Mongo Query to fetch data based on ID.
        if(err) {
            response = {"error" : true,"message" : "Error fetching data"};
        } else {
            response = {"error" : false,"message" : data};
        }
        res.json(response);
    });
})

.put(function(req,res){
    var response = {};
    // first find out record exists or not
    // if it does then update the record
    mongoOp.findById(req.params.id,function(err,data){
        if(err) {
            response = {"error" : true,"message" : "Error fetching data"};
        } else {
        // we got data from Mongo.
        // change it accordingly.
            if(req.body.userEmail !== undefined) {
                // case where email needs to be updated.
                data.userEmail = req.body.userEmail;
            }
            if(req.body.userPassword !== undefined) {
                // case where password needs to be updated
                data.userPassword = req.body.userPassword;
            }
            // save the data
            data.save(function(err){
                if(err) {
                    response = {"error" : true,"message" : "Error updating data"};
                } else {
                    response = {"error" : false,"message" : "Data is updated for "+req.params.id};
                }
                res.json(response);
            })
        }
    });
})
.delete(function(req,res){
    var response = {};
    // find the data
    mongoOp.findById(req.params.id,function(err,data){
        if(err) {
            response = {"error" : true,"message" : "Error fetching data"};
        } else {
            // data exists, remove it.
            mongoOp.remove({_id : req.params.id},function(err){
                if(err) {
                    response = {"error" : true,"message" : "Error deleting data"};
                } else {
                    response = {"error" : true,"message" : "Data associated with "+req.params.id+"is deleted"};
                }
                res.json(response);
            });
        }
    });
})


router.route("/users/login")
.post(function(req,res){
    console.log("antes de findOne");
    mongoOp.findOne({ 
        userEmail: req.body.userEmail, userPassword: 
        req.body.userPassword 
    }, function(err, userlogins) {
        console.log("Entrou em findOne");
        if (err) {
            console.log("Error findOne");
            return handleError(err);
        } else {
            console.log("antes de findOne");
            if(userlogins != null){
                console.log('%s %s is a %s.', userlogins.userEmail);
                res.json( { resp: "true" } );
            } else {
                console.log('usuário não encontrado!!!');
                res.json({ resp: "false" });
            }
        }    
    })
});  

app.use('/',router);

app.listen(3000);
console.log("Listening to PORT 3000");