const fs = require("fs");


const createDirectory = dirname => {

	if (!fs.existsSync(dirname)){
	    fs.mkdirSync(dirname);
	    console.log("Directory: "+dirname+" created");
	}
}

const createFile = ( file, content )  => {
	
	let pathToFile = file;
	fs.stat(pathToFile, "utf8", (err, data) => {

		if(err == null) { console.log("File exists"); return}
		else if(err.code == "ENOENT"){
			//file doesnot exist so creating one
			//check if routeContent is a string

			fs.writeFileSync(pathToFile,content);
			console.log(file+" created");
		}
	});
}


PROJECT_NAME = "testing1";

//create project directory
createDirectory(PROJECT_NAME);

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
    "morgan" : "latest"
  }
};

createFile(PROJECT_NAME+"/package.json",JSON.stringify(packageJson, null, 4 ));


//Create directories for Basic project Structure
createDirectory(PROJECT_NAME+"/routes")
createDirectory(PROJECT_NAME+"/public")

//Create index.js

indexFile = `
const express = require("express");
const app = express();

const morgan = require("morgan"); //logging -> express.logger is deprecated.

//Routes
const indexRoute = require("./routes/index");
const usersRoute = require("./routes/users");

//Middlewares
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static('public'));

//Route Middlewares
app.use("/", indexRoute);
app.use("/users", usersRoute);


app.listen(3000, ()=>{
	console.log("Server running at port 3000");
});
`
createFile(PROJECT_NAME+"/index.js",indexFile);


//Create indexRoute .. routes/index.js
indexRouteFile = `
const router = require("express").Router();

router.get("/", (req,res) => {
	res.send("Welcome to custom Express Generator :)");
});

module.exports = router;
`
createFile(PROJECT_NAME+"/routes/index.js", indexRouteFile);

//create usersRoute .. routes/users.js
usersRouteFile = `
const router = require("express").Router();

router.get("/", (req,res) => {
	res.send("Serve resources to the users ..");
	//res.json({msg:"Or Share JSON datas"});
});

module.exports = router;
`
createFile(PROJECT_NAME+"/routes/users.js", usersRouteFile);


console.log("PROJECT "+PROJECT_NAME+" Created !");
console.log("$ cd "+PROJECT_NAME+"\n$ npm install\n$ npm start");
console.log("start script uses nodemon so if u dont have it you can install it globally using\n$ npm install -g nodemon");