
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require('passport-local-mongoose')
const users = []

const app = express();
app.use(bodyParser.urlencoded({
    extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));


app.use(session({
    secret:"statistiques des clients",
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/userDB' , {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set('useCreateIndex', true)

const userSchema = new mongoose.Schema({
    
    username : String ,
    password : String,
    email : String ,
    page_facebook : String , 
    page_instagram : String,
    montant : Number,
    imageURL: String
})
// const adminSchema = new mongoose.Schema({
//     username : String,
//     password : String
// })

userSchema.plugin(passportLocalMongoose)
// adminSchema.plugin(passportLocalMongoose)


const User = mongoose.model('User' , userSchema)

// const Admin = mongoose.model('Admin' , adminSchema)


passport.use(User.createStrategy());

 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport.use(Admin.createStrategy());

// passport.serializeUser(Admin.serializeUser());
// passport.deserializeUser(Admin.deserializeUser());
 
app.get('/' , function(req,res) {
    res.render('home')
})



app.get('/dashb' , function(req,res) {
    if (req.isAuthenticated()){
        res.render("dashb");
      } else {
        res.redirect("/login");
      }
})


app.get('/register' , function(req,res) {
   res.render('register')
})

app.post('/register' , function(req,res) {
  User.register({username : req.body.username, email : req.body.email, page_facebook : req.body.facebook, page_instagram : req.body.instagram, imageURL : req.body.image},  req.body.password, function(err , user) {
      if (err) {
          console.log(err)
          res.redirect('/register')
      }
      else {
          passport.authenticate("local")(req , res , function(){
              res.redirect('/dashb')
          })
      }


})
})


app.get('/tableau' , function(req,res) {
  User.find({}, function(err, foundItems){
    if (!err) {
    if (foundItems) 
    res.render('tableau', {foundItems:foundItems})
    }
  

})

})

// app.post('/addClient' , function(req,res) {
//   const newUser = new User({
//       username : req.body.username,
//       email : req.body.email,
//       page_facebook:req.body.page_facebook ,
//       page_instagram:req.body.page_instagram ,
//       montant : req.body.montantRestant
//   })
//   newUser.save(function(err) {
//       if (err) {
//           console.log(err)
//       } 
//       else {
//           console.log("succesfully addded new client")
//       }
  
//   })
//   res.redirect('/tableau')
//   })
  
  
  app.post('/:id' , function(req,res) {
      User.findOneAndDelete({_id:req.params.id} , function (err) {
          if (err) {
              console.log(err)
          }
          else {
              res.redirect('/tableau')
          }
      })
  })


  app.get('/edit/:id' , function(req,res) {
    let editableId = req.params.id
    User.find({_id: editableId} , function(err,data) {
        if (err) {
            console.log(err)
        }
        else {
    res.render('edit' , {data:data})
        }
    })
    
    }) 
        
    
    app.post('/edit/:id' , function(req,res) {
    
        const editableId = req.params.id 
    
    
        User.updateOne({_id:editableId} , 
            {   name:req.body.username,
                page_facebook:req.body.facebookPage,
                page_instagram:req.body.instagramPage,
                montant:req.body.montantApayer
            
            
            
            },function(err) {
                if(err) {
                    console.log(err)
                }
                else{
                  console.log("document succsesfully updated")
                }
            }
            
            
            )
    
    
    res.redirect('/tableau')
    
    })




app.get('/login' , function(req,res) {
    res.render("login")
})


app.post('/login' , function(req,res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
      });
    
      req.login(user, function(err){
        if (err) {
          res.redirect('/login')
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/dashb");
          });
        }
      });
})


app.get('/registeradmin' , function(req,res) {
    res.render('registeradmin')
 })
 
 
 
 
//  app.post('/registeradmin' , function(req,res) {
    
//      Admin.register({username : req.body.username} , req.body.password , function(err , user) {
//          if (err) {
             
           
//              console.log(err)
//              res.redirect('/registeradmin')
//          }
//          else {
//              console.log(user)
//              passport.authenticate("local")(req , res , function(){
//                  res.redirect('/dashb')
//              })
//          }
 
 
//  })
//  })

app.get('/loginadmin' , function(req,res) {
    res.render('loginadmin')
})


app.post('/loginadmin' , function(req,res) {
        // const req.body.username = "mourad"
        // const req.body.password = "123456"

    const user = new User({
        username: req.body.username,
        password: req.body.password
      });
    
      req.login(user, function(err){
        if (err) {
          res.redirect('/loginadmin')
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/");
          });
        }
      });
})

// app.post("/delete", function(req, res){
//   const checkedItemId = req.body.button;

//   User.findByIdAndRemove(checkedItemId, function(err){
//     if (!err){
//       console.log("sucessfully deleted")
//       res.redirect("/tableau")
//     }

//   })

// })





app.get("/dashb", function (req, res) {
 
    if (req.isAuthenticated()){
      res.render("/dashb");
    } else {
      res.redirect("/login");
    }
  });
   
  


app.get("/payer", function (req, res) { 
  if (req.isAuthenticated()){
    User.find({"montant": {$ne: null}}, function(err, foundUsers){
      if (err){
        console.log(err);
      } else {
        if (foundUsers) {
          res.render("payer", {usersWithSecrets: foundUsers});
        }
      }
    });
}
else {
  res.redirect("/login");
}
 })

 app.get("/choix", function (req, res) { 
  if (req.isAuthenticated()){
    User.find({"imageURL": {$ne: null}}, function(err, foundUsers){
      if (err){
        console.log(err);
      } else {
        if (foundUsers) {
          res.render("choix", {usersphotos: foundUsers});
        }
      }
    });
}
else {
  res.redirect("/login");
}
 })






 

app.listen(3000 , function() {
    console.log("port is succesfully running ")
})