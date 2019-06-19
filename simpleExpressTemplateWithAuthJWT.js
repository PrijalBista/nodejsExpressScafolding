const fs = require("fs");


const createDirectory = dirname => {
	return new Promise( ( resolve, reject ) => {
		if(fs.existsSync(dirname)) reject("Directory'"+dirname+"' already Exists");
		
		fs.mkdir(dirname, err => {
			if (err) reject(err);
			else resolve("Directory: "+dirname+" created");
		});
		
	});
	
}

const createFile = ( file, content )  => {
	return new Promise( ( resolve, reject ) => {
		let pathToFile = file;
		fs.stat(pathToFile, "utf8", (err, data) => {

			if(err == null) reject("File exists");
			else if(err.code == "ENOENT"){
				//file doesnot exist so creating one
				//check if routeContent is a string

				fs.writeFile(pathToFile,content, err => {
					if(err) reject(err);
					else resolve("FILE: "+file+" created");
				});
			}
		});
	});	
}

if(!process.argv[2]){
	console.log(` ERR:// One Argument missing <project name>
------------------------------------------------------------------------------------
	Custom NodeJs + Express + MongoDB + Authentication with JWT(JsonWebtoken) template generator :)

	Make sure u have mongodb installed 

	Usage: node simpleExpressTemplateWithAuthJWT.js <project-name>
------------------------------------------------------------------------------------
	Example:
	$ node simpleExpressTemplateWithAuthJWT.js expressWithAuth
------------------------------------------------------------------------------------
	`);
	process.exit(-1);
}

PROJECT_NAME = process.argv[2];

( async() => {
	try {
		//create project directory
		console.log(await createDirectory(PROJECT_NAME));

		//Create simple package.json file

		packageJson = {
		  "name": PROJECT_NAME,
		  "version": "1.0.0",
		  "description": "",
		  "main": "index.js",
		  "scripts": {
		    "start": "nodemon index.js"
		  },
		  "author": "",
		  "license": "ISC",
		  "dependencies": {
		    "express": "latest",
		    "morgan" : "latest",
		    "bcryptjs": "latest",
		    "dotenv": "latest",
		    "jsonwebtoken": "latest",
		    "mongoose": "latest"
		  }
		};

		console.log(await createFile(PROJECT_NAME+"/package.json",JSON.stringify(packageJson, null, 4 )));


		//Create directories for Basic project Structure
		console.log(await createDirectory(PROJECT_NAME+"/routes"));
		console.log(await createDirectory(PROJECT_NAME+"/routes/auth"));
		console.log(await createDirectory(PROJECT_NAME+"/public"));
		console.log(await createDirectory(PROJECT_NAME+"/model"));
		console.log(await createDirectory(PROJECT_NAME+"/middlewares"));
		console.log(await createDirectory(PROJECT_NAME+"/middlewares/auth"));

		//Create index.js

		indexFile = `
		const express = require("express");
		const app = express();
		const mongoose = require("mongoose");
		const dotenv = require("dotenv");

		const morgan = require("morgan"); //logging -> express.logger is deprecated.

		//Routes
		const indexRoute = require("./routes/index");
		const usersRoute = require("./routes/users");
		const authRoute = require("./routes/auth/auth");
		
		//initiate dotenv
		dotenv.config();

		//connect to mongoDB
		mongoose.connect(
			process.env.MONGODB_CONNECT,
			{ useNewUrlParser: true },
			() => console.log("MONGODB > connected to mongo db")
			);

		//Middlewares
		app.use(express.json());
		app.use(morgan("tiny"));
		app.use(express.static("public"));

		//Route Middlewares
		app.use("/", indexRoute);
		app.use("/auth", authRoute);
		app.use("/users", usersRoute);


		app.listen(3000, ()=>{
			console.log("Server running at port 3000");
		});
		`
		console.log(await createFile(PROJECT_NAME+"/index.js",indexFile));


		//create simple User Model (mongoose)
		userModelFile =`
		const mongoose = require("mongoose");

		const userSchema = new mongoose.Schema({
			name: {
				type: String,
				required: true,
				min: 6,
				max: 255
			},
			email: {
				type: String,
				required: true,
				min: 6,
				max: 255
			},
			password: {
				type: String,
				required: true,
				min: 6,
				max: 1024
			},
		}, {timestamps: true});


		module.exports = mongoose.model("User", userSchema);
		`
		console.log(await createFile(PROJECT_NAME+"/model/User.js",userModelFile));

		//Create indexRoute .. routes/index.js
		indexRouteFile = `
		const router = require("express").Router();

		router.get("/", (req,res) => {
			res.send("Welcome to custom Express Generator :)");
		});

		module.exports = router;
		`
		console.log(await createFile(PROJECT_NAME+"/routes/index.js", indexRouteFile));

		//create authRoute .. routes/auth/auth.js
		authRouteFile = `
		const router = require("express").Router();
		const jwt = require("jsonwebtoken");
		const bcrypt = require("bcryptjs");

		const User = require("../../model/User");

		router.post("/register", async (req, res) => {

			//perform data validation (according to your will)

			//Check if user is already in database
			
			const emailExists = await User.findOne({email:req.body.email});
			
			if(emailExists) return res.status(400).send("email already exists");
			
			//if everything is fine we move forward
			
			//Hash the password
			
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(req.body.password,salt);

			//Create a new user
			
			const user = new User({
				name: req.body.name,
				email: req.body.email,
				password: hashedPassword,
			});

			//Store info in database

			try {

				let savedUser = user.save();
				res.status(200).send({status:true, user: savedUser._id});

			}catch(err) {

				console.log(err);
				res.status(400).send(err);
			}

		});


		router.post("/login", async (req, res) => {

			//perform data validation (according to your will)

			//Check if user is already exists in database

			const user = await User.findOne({email:req.body.email});
			
			if(!user) return res.status(400).send("Email or password is wrong");
			
			//Check if password is correct
			const validPass = await bcrypt.compare(req.body.password, user.password);
			
			if(!validPass) return res.status(400).send("Email or password is wrong");


			//LOGIN SUCCESSFUL
			//create and assign a token // you can add more key:value to the token
			
			const token = jwt.sign({_id: user._id, role: "user"},process.env.TOKEN_SECRET);
			
			res.json({ status: true,token: token });

		});

		module.exports = router;
		`
		console.log(await createFile(PROJECT_NAME+"/routes/auth/auth.js", authRouteFile));

		//create auth middleware (it can be used for protecting  the routes with authentication)
		authMiddleWareFile = `
		const jwt = require("jsonwebtoken");

		module.exports = (req, res, next) => {
			const token = req.header("auth-token");
			if(!token) return res.status(401).send("Access Denied");

			try {
				const verified = jwt.verify(token, process.env.TOKEN_SECRET);
				req.user = verified;
				next();

			}catch(err){
				res.status(400).send("Invalid Token");
			}
		}
		`
		console.log(await createFile(PROJECT_NAME+"/middlewares/auth/verifyJWTToken.js", authMiddleWareFile));


		//create usersRoute .. routes/users.js
		usersRouteFile = `
		const router = require("express").Router();
		const verifyJWTToken = require("../middlewares/auth/verifyJWTToken");

		router.get("/", verifyJWTToken, (req,res) => {

			res.send("Protected route i.e only logged in users can view this");
			
			//res.json({msg:"Protected API"});
		
		});

		module.exports = router;
		`
		
		console.log(await createFile(PROJECT_NAME+"/routes/users.js", usersRouteFile));

		//create .env file
		envFile = `
TOKEN_SECRET = my_secret
MONGODB_CONNECT = mongodb://localhost:27017/myapp
		`
		console.log(await createFile(PROJECT_NAME+"/.env", envFile));

		console.log("-------------------------------------------------------------------------------------");
		console.log("PROJECT "+PROJECT_NAME+" Created ! Now You can");
		console.log("-------------------------------------------------------------------------------------");
		console.log("\n$ cd "+PROJECT_NAME+"\n\n$ npm install\n\n$ npm start\n");
		console.log("-------------------------------------------------------------------------------------");
		console.log("start script uses nodemon so if u dont have it you can install it globally using\n$ npm install -g nodemon");

	}catch(err) {
		console.log("ERR://"+err);		
	}
})();