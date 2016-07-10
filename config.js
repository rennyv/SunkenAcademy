var config = {};

//need to add in path variables from Azure... these are local variables no the actual.  Please change them online
config.dbConnection =  process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'mongodb://localhost:27017/sunkenacademydb';
config.secretHash = process.env.SECRETHASH || '27d3fce4-e4ac-4615-a372-0521d7360d96';
	
module.exports = config;