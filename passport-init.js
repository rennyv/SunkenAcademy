var mongoose = require('mongoose');
var Users = mongoose.model('User');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser(function(user, done) {
		console.log('serializing user:',user.username);
		//return the unique id for the user
		done(null, user._id);
	});

	//Desieralize user will call with the unique id provided by serializeuser
	passport.deserializeUser(function(id, done) {
		Users.findById(id, function(err, user){
			console.log('deserializing user: ', user.username);
			return done(err, user);
		});
	});

	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done) { 
			//does user exist?
			Users.findOne({'username': username},
				function(err, user){
					//if err return using the done method
					if(err){
						return done(err);
					}
					//Username doesn't exist
					if(!user){
						console.log('User Not Found with username: ' + username);
						return done(null, false);
					}
					//User exists but wrong password. log
					if(!isValidPassword(user, password)){
						console.log('Invalid password');
						return done(null, false);
					}
					
					//if you get to here both user and password match which is a success
					return done(null, user);
				}
			);	
		}
	));	
		
	passport.use('signup', new LocalStrategy({
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, username, password, done) {
			Users.findOne({'username' : username }, function(err, user){
				if(err){
					console.log('Err in SignUp: ' + err);
					return done(err);
				}
				//already exists
				if(user){
					console.log('User already exists with username: ' + username);
					return done(null, false);
				} else {
					var newUser = new Users();
					newUser.username = username;
					newUser.password = createHash(password);
					
					newUser.save(function(err){
						if(err){
							console.log('Error in Saving user: ' + err);
							throw err;
						}
						console.log(newUser.username + ' registration successful');
						return done(null, newUser);
					});
				}
				
			});
		})
	);
	
	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	};
	// Generates hash using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

};
