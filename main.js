/*
    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/
/*All required nodejs modules*/
var express = require('express'); /*express for handlebars*/
var session = require('express-session'); /*For keeping a session open*/
var handlebars = require('express-handlebars');
var MySQLStore = require('express-mysql-session')(session);
var cookieParser = require('cookie-parser'); /*For parsing given cookies*/
var mysql = require('./js/dbcon.js');/*used for connecting to the database*/
var bodyParser = require('body-parser'); /*This allows for body parsing*/
var passport = require('passport'); /*used for keeping a user logged in*/
var LocalStrategy = require('passport-local').Strategy; /*used with passport to use local database*/
const bcrypt = require('bcrypt'); /*for password hashing and verifying*/
var moment = require('moment'); //used for  date manipulation
moment().format();


var schedule = require('node-schedule'); //used for Scheduled tasks.

var helpers = require('handlebars-helpers')();

var moment_helper = require('helper-moment')

/*used for verifiction*/
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');


const nodemailer = require('nodemailer'),
    creds = require('./js/creds.js'),
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: creds.user,
            pass: creds.pass,
        },
    }),
    EmailTemplate = require('email-templates').EmailTemplate,
    Promise = require('bluebird');

var email = require('./js/email.js');

/*end of required node modules*/

/*Setting up templating engine*/
var app = express();

var port = process.argv[2]

//helper function to format the given date from database
var hbs = handlebars.create({

		helpers: {
			formatTime: function( date, format) {
				var mmnt = moment(date);
				return mmnt.format(format);
			 }
		}
})

/*helper function import*/

app.engine('handlebars', handlebars({
	 defaultLayout: 'main',
	 helpers: require('./js/helperFunctions')
}));

const path = require("path");

app.use(bodyParser.urlencoded({extended:true}));

app.use(cookieParser());
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);

/* End of setting up templeting engine*/

/*used for creating sessions and cookies*/


var options = require('./js/options.js');

var sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'ABQAZSCKLONPMSTDERF',
	store: sessionStore,
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

/*end of sessions and cookies*/

//setting global variables
app.use(function(req, res, next){
	res.locals.isAuthenticated = req.isAuthenticated(); //check if authenticated
	res.locals.user = req.user || null; //get user id if logged in

	//if logged in get staff type
	if(req.user){
		res.locals.user_id = req.user.user_id;
		var sql = "SELECT type, username FROM _Staff WHERE id = ?";
		var inserts = req.user.user_id;

		mysql.pool.query(sql, inserts, function(error, results, fields){
			if(error){
				res.write(JSON.stringify(error));
				res.end();
			}
				res.locals.user_type = results[0].type;
				res.locals.username = results[0].username;
		});
	}
	next();
});

/* redirects from base http://localhost:[port] to /temp */
app.get('/', function(req, res){
	res.redirect('/temp');
});

/*routes*/
app.use('/temp', require('./js/temp.js')); /* home page */
app.use('/available', require('./js/available.js')); /* available hours page */
app.use('/staffhours', require('./js/staffhours.js')); /* "temo your shift" page */
app.use('/contacts', require('./js/contacts.js')); /* contacts page */
app.use('/add_staff', require('./js/add_staff.js')); /*add_staff page */
app.use('/login', require('./js/login.js')); /*login page*/
app.use('/logout', require('./js/logout.js'));/*logout page*/
app.use('/createhelpschedule', require('./js/helpdeskschedule.js')); /* helpdesk schedule */
app.use('/createlabschedule', require('./js/labschedule.js')); /* lab schedule */
app.use('/updatecontacts', require('./js/updatecontacts.js')); /* update contacts */
app.use('/forgot', require('./js/forgot.js')); /* forgot password page */
app.use('/reset', require('./js/passwordreset.js')); /* reset password page */
/*end of routes*/

/*Authentication*/
passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
		// console.log("user is being deserialized");
		// console.log(user_id);
    done(null, user_id);
});

/*How passport will use the local strategy*/
passport.use(new LocalStrategy(
  function(username, password, done) {
			// console.log(username);
			// console.log(password);

			var sql = "SELECT id,  password_hash FROM _Staff WHERE username = ?";
			var inserts = [username];

			mysql.pool.query(sql,inserts,function(error, results, fields){
				if(error){done(error)};

				//if no user is found with that user name return false
				if(results.length === 0){
					done(null, false);
				}else{
					const hash = results[0].password_hash;
					bcrypt.compare(password, hash, function(err, response){
							if (response === true){
								return done(null, {user_id: results[0].id});
							}else{
								return done(null, false);
							}
					});
				}
			});
    }
	));


function authenticationMiddleware () {
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
	    if (req.isAuthenticated()) return next();
	    res.redirect('/temp')
	}
}


/*End of Authentication*/
/* Error routes */
/* 404 error page -not found */
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

/* 500 error page -error */
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.use(function(err, req, res, next){
	res.status(401);
	res.render('401');
});

/* lets us know when the app is running on the console. */
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});


/***************************** EMAIL *****************************/
/* Send Emails to Labs and Help Desk */
function getHelpdeskUsers(mysql, helpdesk, complete){
    mysql.pool.query("Select _Staff.first_name, _Staff.last_name, _Staff.email, _Staff.type From _Staff WHERE _Staff.type = 'Help Desk' OR _Staff.type = 'Hybrid' OR _Staff.type = 'Lead'; ", function(error, results, fields){
        if(error){
            console.log("Cannont Find Helpdesk Database");
            return;
        }
        helpdesk.users = results;
        complete(helpdesk);
    });
}

function getLabsUsers(mysql, labs, complete){

    mysql.pool.query("Select _Staff.first_name, _Staff.last_name, _Staff.email From _Staff WHERE _Staff.type = 'Labs' OR _Staff.type = 'Hybrid' OR _Staff.type = 'Lead' ", function(error, results, fields){
        if(error){
            console.log("Cannot Find Helpdesk Database");
            return;
        }
        labs.users = results;
        complete(labs);
    });
}

function getHelpDeskTemp(mysql, helpdesk, givenDay, complete){

    sql = "SELECT tmp.id, tmp.original_owner, s.first_name, s.last_name, tmp.help_desk_schedule_id, tmp.shift_type, tmp.comments, hs.day, sh.start_time, sh.end_time FROM _Temped_Shifts tmp INNER JOIN _Staff s ON tmp.original_owner = s.id LEFT JOIN _Help_Desk_Schedule hs ON tmp.help_desk_schedule_id = hs.id LEFT JOIN _Help_Desk_Shifts sh ON hs.shift_id = sh.id  WHERE tmp.help_desk_schedule_id IS NOT NULL AND hs.day >= ? ORDER BY hs.day, sh.start_time";

    var inserts  = [givenDay];

    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            console.log("Cannot Find Helpdesk Database");
            return;
        }
        helpdesk.temp = results;
        complete(helpdesk);
    });
}

function getLabsTemp(mysql, labs, givenDay, complete){

    sql = "SELECT tmp.id, tmp.original_owner, s.first_name,s.last_name, tmp.lab_schedule_id, tmp.shift_type,tmp.comments, ls.day, sl.start_time, sl.end_time FROM _Temped_Shifts tmp INNER JOIN _Staff s ON tmp.original_owner = s.id LEFT JOIN _Lab_Schedule ls ON tmp.lab_schedule_id = ls.id LEFT JOIN _Lab_Shifts sl ON ls.shift_id = sl.id WHERE tmp.lab_schedule_id IS NOT NULL AND ls.day >= ? ORDER BY ls.day, sl.start_time";

    var inserts  = [givenDay];

    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            console.log("Cannot Find Helpdesk Database");
            return;
        }
        labs.temp = results;
        complete(labs);
    });
}

function getLabsTemp(mysql, labs, givenDay, complete){

    sql = "SELECT tmp.id, tmp.original_owner, s.first_name,s.last_name, tmp.lab_schedule_id, tmp.shift_type,tmp.comments, ls.day, sl.start_time, sl.end_time FROM _Temped_Shifts tmp INNER JOIN _Staff s ON tmp.original_owner = s.id LEFT JOIN _Lab_Schedule ls ON tmp.lab_schedule_id = ls.id LEFT JOIN _Lab_Shifts sl ON ls.shift_id = sl.id WHERE tmp.lab_schedule_id IS NOT NULL AND ls.day >= ? ORDER BY ls.day, sl.start_time";

    var inserts  = [givenDay];

    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            console.log("Cannot Find Helpdesk Database");
            return;
        }
        labs.temp = results;
        complete(labs);
    });
}

function sendEmail(obj) {
    if(obj){
      return transporter.sendMail(obj);
   } else{
       console.log("No temp shifts.");
    }
}

function loadTemplate (templateName, contexts) {
    let template = new EmailTemplate(path.join(__dirname, 'Email_Templates', templateName));
    return Promise.all(contexts.map((context) => {
        //console.log("Context: " + JSON.stringify(context, null, 4))
        return new Promise((resolve, reject) => {
            template.render(context, (err, result) => {
                if (err) reject(err);
                else resolve({
                    email: result,
                    context,
                });
            });
        });
    }));
}


/* sends email for help desk temp shifts */
function sendHelpDesk(){
    var helpdesk = {};
    callbackCount = 0;

    givenDay = moment().format('YYYY-MM-DD');

    getHelpdeskUsers(mysql, helpdesk, complete);
    getHelpDeskTemp(mysql, helpdesk, givenDay, complete);

    function complete(helpdesk){
      callbackCount++;
      if(callbackCount >= 2){
          //add the temps to the users
          var afterMap = helpdesk.users.map(function(el){
              var o = Object.assign({}, el);
              o.temp = helpdesk.temp;
              return o;
          });
          //format time into YYYY-MM-DD to display to user
           afterMap.forEach(function(user){
               user.temp.forEach(function(userTemp){
                userTemp.day = moment(userTemp.day).format("YYYY-MM-DD");
            });
           });

          loadTemplate('Helpdesk', afterMap).then((results) => {
          return Promise.all(results.map((result) => {
              sendEmail({
                  to: result.context.email,
                  from: 'COE Help Desk Temp Site',
                  subject: result.email.subject,
                  html: result.email.html,
                  text: result.email.text,
              });
               }));
          }).then(() => {
              console.log("Help desk Email Sent");
          });

       }
    }

}

/* sends email for lab temp shifts */
function sendLabs(){
    var labs = {};
    callbackCount = 0;

    givenDay = moment().format('YYYY-MM-DD');

    getLabsUsers(mysql, labs, complete);
    getLabsTemp(mysql, labs, givenDay, complete)

    function complete(labs){
      callbackCount++;
      if(callbackCount >= 2){
          //add the temps to the users
          var afterMapLab = labs.users.map(function(el){
              var o = Object.assign({}, el);
              o.temp = labs.temp;
              return o;
            });
          //format time into YYYY-MM-DD to display to user
           afterMapLab.forEach(function(user){
               user.temp.forEach(function(userTemp){
                userTemp.day = moment(userTemp.day).format("YYYY-MM-DD");
            });
           });

          loadTemplate('Labs', afterMapLab).then((results) => {
          return Promise.all(results.map((result) => {
              sendEmail({
                  to: result.context.email,
                  from: 'COE Help Desk Temp Site',
                  subject: result.email.subject,
                  html: result.email.html,
                  text: result.email.text,
              });
               }));
          }).then(() => {
              console.log('Lab Email Sent!');
          });

       }
    }

}

/* Setting up the schedule for sending emails */
var Labrule = new schedule.RecurrenceRule();
Labrule.dayOfWeek = [new schedule.Range(0, 6)];
Labrule.hour = 17;
Labrule.minute = 00;


var j = schedule.scheduleJob(Labrule, function(){
  sendLabs();
});


var HelpDeskrule = new schedule.RecurrenceRule();
HelpDeskrule.dayOfWeek = [new schedule.Range(0, 6)];
HelpDeskrule.hour = 17;
HelpDeskrule.minute = 01;


var j = schedule.scheduleJob(HelpDeskrule, function(){
  sendHelpDesk();
});


exports.loadTemplate = loadTemplate;
//exports.router = router;