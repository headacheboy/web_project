/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer'); // 用multer才可以将FormData解析
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
// processFormBody will look at the form for a field named "uploadedphoto" and pull the file out of it and place the information is a property named file on the request object. 
const fs = require('fs');
var crypto = require('crypto');


var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

var express = require('express');
var app = express();
// 下面两行才能使用post中的request.body
app.use(
    session(
        { 
            // 有store关键词，可以将其设置为redisClient，与redis缓存结合
            secret: "secretKey", resave: false, saveUninitialized: false, cookie: {maxAge: 2*60*1000}, 
            name: 'test', 
        }
    )
  );
app.use(bodyParser.json());

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var Rate = require('./schema/rate.js');
var UserRate = require('./schema/userrate.js');

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user_id){
        response.status(401).send("Please login!");
        return;
    }
    // console.log(User.findOne());
    User.find({}, function(err, data){
        // {}为查询条件
        if (err){
            response.status(400).send("Not Found!");
            return;
        }
        response.status(200).send(data);
    })
    // response.status(200).send(cs142models.userListModel());
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user_id){
        response.status(401).send("Please login!");
        return;
    }
    var id = request.params.id;
    User.findOne({
        _id: id
    }, function(err, data){
        if (err){
            response.status(400).send("User Not Found!");
            return;
        }
        response.status(200).send(data);
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    // photo.js定义的schema中，没有comments对应的user，只有user_id，所以需要添加回去
    if (!request.session.user_id){
        response.status(401).send("Please login!");
        return;
    }
    var id = request.params.id;
    console.log('photos of user _id= ', id);
    Photo.
    find({'user_id' : id}).
    select({_id: 1, user_id: 1, comments: 1, file_name: 1, date_time: 1}).
    exec(function(err, info) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        var photos = JSON.parse(JSON.stringify(info));
        if (photos.length === 0) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        // 异步的多循环：async。
        // async.each(数组，处理函数，结束函数(err))
        // 其中处理函数f(param, callback){}在函数返回前需要callback内置其他error，如：
        // 
        // function readIt(fileName, callback) {
        //  fs.readFile(fileName, function (error, dataBuffer) {
        //     fileContents[fileName] = dataBuffer;
        //     callback(error);
        //     });
        // }
        async.each(photos, function (photo, callback1) {
            delete photo._v;
            async.each(photo.comments, function (comment, callback2) {
                var comQuery = {_id : comment.user_id};
                User.findOne(comQuery, '_id first_name last_name', function(err, user) {
                    // findOne(查询条件，查询字段，处理函数(err, data))，其中查询条件是一个{}，查询字段是用空格隔开的string
                    if (err) {
                        callback2(err);
                        return;
                    }
                    if (!user || user.length === 0) {
                            response.status(400).send('User with _id:' + id + ' not found');
                            return;
                    }
                    comment.user = user;
                    delete comment.user_id;
                    console.log(comment.user, "user");
                    callback2(err);
                });
            }, function (err) {
                callback1(err);
            });
        }, function (err) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
            } else {
                response.status(200).send(photos);
            }
        });
    });
});

app.post("/admin/login", function(request, response) {
    let loginName = request.body.login_name;
    let isLoggedIn = false;
    if (request.session.login_name){
        console.log("has been logged in! name: " + request.session.login_name, " with pwd?: ", request.body.password);
        loginName = request.session.login_name;
        isLoggedIn = true;
        if (request.body.password){
            response.status(400).send("do not login again");
            return;
        }
    }
    else{
        console.log("not logged in!");
    }
    let salt_password_attempt;
    if (request.body.password) 
        salt_password_attempt = crypto.createHash('sha1').update(request.body.password).digest('hex').toUpperCase();
    else
        salt_password_attempt = "";
    console.log(salt_password_attempt);
    // console.log(request.session.cookie);
    // console.log(request.sessionID);
    // console.log(request.headers.cookie);
    //request.session is an object you can read or write
    //parameter in request body is accessed using request.body.parameter_name
    User.findOne({ login_name: loginName }, (err, user) => {
      if (err || !user) {
        console.log("User with login_name: " + loginName + " not found.");
        response.status(400).send("Login name was not recognized");
        return;
      }
      if (!isLoggedIn && user.salt_password != salt_password_attempt) {
        response.status(400).send("Wrong password");
        console.log("error password");
        return;
      }
      console.log("200");
      request.session.login_name = loginName;
      request.session.user_id = user._id;
      request.session.cookie.originalMaxAge = 24*60*60*1000;
      // 生命周期  
      request.session.cookie.reSave = true;
      let { _id, first_name, last_name, login_name } = user;
      let newUser = { _id, first_name, last_name, login_name };
  
      response.status(200).send(newUser);
    });
    //store into request.session.user_id so that others can read.
});

app.post("/admin/logout", function(request, response) {
    //request.session is an object you can read or write
    // destroy the session
    request.session.destroy(function(err) {
      if (err) {
        response.status(400).send("unable to logout");
        return;
      }
      response.status(200).send();
    });
  });

app.post('/commentsOfPhoto/:photo_id', function(request, response){
    // find photoObj in Photos with photo_id
    // photoObj keys: [_id, file_name, date_time, user_id, comments]
    // comments is a list, elements are {"comment": "xxx", "date_time": xxx, "user_id": xxx",}
    if (!request.session.user_id){
        response.status(401).send("Please login!");
        return;
    }
    let photoId = request.params.photo_id;
    let newComment = {"comment": request.body.comment, "date_time": new Date(), "user_id": request.session.user_id};
    Photo.findOne({
        _id: photoId
    }).exec(function(err, photo){
        if (err){
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
        }
        photo.comments = photo.comments.concat(newComment);
        photo.save();   // 可以有callback
        response.status(200).send("comment sucessfully");
    });
})

app.post("/photos/new", function(request, response) {
    if (!request.session.user_id) {
      response.status(401).send("not logged in");
      return;
    }
  
    processFormBody(request, response, function(err) {
      if (err || !request.file) {
        response.status(400).send("file not valid");
        return;
      }
      // request.file has the following properties of interest
      //      fieldname      - Should be 'uploadedphoto' since that is what we sent
      //      originalname:  - The name of the file the user uploaded
      //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
      //      buffer:        - A node Buffer containing the contents of the file
      //      size:          - The size of the file in bytes
  
      // XXX - Do some validation here.
      // We need to create the file in the directory "images" under an unique name. We make
      // the original file name unique by adding a unique prefix with a timestamp.
      var timestamp = new Date().valueOf();
      var filename = "U" + String(timestamp) + request.file.originalname;
  
      fs.writeFile("./images/" + filename, request.file.buffer, function(err) {
        // XXX - Once you have the file written into your images directory under the name
        // filename you can create the Photo object in the database
        if (err) {
          response.status(400).send("unable to write file");
          return;
        }
        Photo.create(
          {
            file_name: filename,
            date_time: timestamp,
            user_id: request.session.user_id,
            comments: []
          },
          function(err, newPhoto) {
            if (err) {
              response.status(400).send("unable to create new photo");
              return;
            }
            newPhoto.save();
            response.status(200).send();
          }
        );
      });
    });
    //place file in images directory
    //make new photo object and store in database;
  });

app.post('/user', function(request, response){
    let {
        login_name,
        password,
        first_name,
        last_name,
        location,
        description,
        occupation
      } = request.body;
    if (!password){
        response.status(400).send("password cannot be blank");
        return;
    }
    let salt_password = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    User.findOne({login_name: login_name}, function(err, data){
        if (data){
            response.status(400).send("username already existed");
            return;
        }
        User.create({
            first_name: first_name, 
            last_name: last_name, 
            location: location, 
            description: description, 
            occupation: occupation, 
            login_name: login_name,
            salt_password: salt_password
        }, function(err, newUser){
            if (err){
                response.status(400).send("create error");
                return;
            }
            newUser.save();
            response.status(200).send();
        });
    })
})

app.post('/rating', function(request, response){
    if (!request.session.user_id){
        response.status(401).send("please login first");
        return;
    }
    let {
        rate, sample_id, idx
    } = request.body;
    let user_id = request.session.user_id;
    UserRate.findOne({
        user_id: user_id
    }, function(err, data){
        if (data){
            response.status(400).send("no user.");
            return;
        }
        if (data.rate.length != idx){
            response.status(400).send("you have rated this sample");
            return;
        }
        let newRate = {sample_id: sample_id, user_id: user_id, rate: rate};
        data.rate = data.rate.concat(newRate);
        data.save();
        response.status(200).send();
    })
})
  
app.get('/testing', function(req, res) {
	if (req.session.isFirst) {
        res.send("欢迎再一次访问。");
        console.log(req.session)
    } else {
        req.session.isFirst = 1;
        res.send("欢迎第一次访问。");
    }
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


