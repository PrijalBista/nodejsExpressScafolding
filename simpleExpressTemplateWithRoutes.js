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
	Custom NodeJs + Express template generator :)

	Usage: node simpleExpressTemplateWithRoute.js <project-name>
------------------------------------------------------------------------------------
	Example:
	$ node simpleExpressTemplateWithRoute.js myExpressProject
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
		    "morgan" : "latest"
		  }
		};

		console.log(await createFile(PROJECT_NAME+"/package.json",JSON.stringify(packageJson, null, 4 )));


		//Create directories for Basic project Structure
		console.log(await createDirectory(PROJECT_NAME+"/routes"));
		console.log(await createDirectory(PROJECT_NAME+"/public"));

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
		console.log(await createFile(PROJECT_NAME+"/index.js",indexFile));


		//Create indexRoute .. routes/index.js
		indexRouteFile = `
		const router = require("express").Router();

		router.get("/", (req,res) => {
			res.send("Welcome to custom Express Generator :)");
		});

		module.exports = router;
		`
		console.log(await createFile(PROJECT_NAME+"/routes/index.js", indexRouteFile));

		//create usersRoute .. routes/users.js
		usersRouteFile = `
		const router = require("express").Router();

		router.get("/", (req,res) => {
			res.send("Serve resources to the users ..");
			//res.json({msg:"Or Share JSON datas"});
		});

		module.exports = router;
		`
		console.log(await createFile(PROJECT_NAME+"/routes/users.js", usersRouteFile));

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