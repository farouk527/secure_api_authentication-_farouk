const express = require('express')
const mongoose =require("mongoose");
const User = require("./model/user");
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken');
require("dotenv").config();




const app=express()
mongoose.set('strictQuery', true);

mongoose.connect(
   "mongodb://127.0.0.1:27017/example",
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (!err) console.log("MongoDB has connected successfully.");
      else console.error.bind("MongoDB connection error:");
    }
  );
app.get("/bonjour",(req,res)=> {
    res.send("test")
})


app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));




app.post("/register",async(req,res)=> {
  try {
const {email ,password } = req.body ;
if (!(email && password)) {
res.status(409).send("all input are required ");

  }


  const oldUser = await User.findOne({ email });
  if (oldUser) {
    return res.status(409).send("User Already Exist. Please Login");
  }



  const user = await User.create({
    
    email: email, 
    password: password,
  });


  const token = jwt.sign(
    { user_id: user._id,email },
    "RANDOM-TOKEN",{
      expiresIn: "1h",
    } );

  user.token = token;
res.status(201).json(user);
  }
  catch (err) {
console.log(err);
}
  /*try{
    let user = new User ({
      email:req.body.email,
      password:req.body.password
    })
    await user.save();
    res.send("saved");
  } catch(err) {
    console.log(err);
  }
  
*/


});



app.post("/login", async (req, res) => {

  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    const user = await User.findOne({ email });

    if (user && (password === user.password)) {
      const token = jwt.sign(
        { user_id: user._id, email },
        "RANDOM-TOKEN",
        {
          expiresIn: "1h",
        }
      );

      user.token = token;

      // user
      res.status(200).json(user.token);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});



app.get("/users",verifyToken,(req,res)=>{
  /*try{
    User.find({}).then(resultat=>{
      res.send(resultat);
    })
  }
  catch (err) {
    console.log(err);
  }*/
   

  jwt.verify(req.token,'secretkey',(err)=>{
    if(!err) {
      res.send("need  a authorization");
    } else {
      User.find({}).then(resultat=>{
        res.send(resultat);
      })
    }
  })
 
});


function verifyToken (req,res,next) {
  const bearerHeader =req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined' ) {
    const bearer = bearerHeader.split(' ');
    const bearerToken= bearer[1];
    req.token = bearerToken;
    next();
  }
  else {
    res.sendStatus(404);
  }
}




app.listen(3000,()=>{
    console.log("on port 3000 ")
})


