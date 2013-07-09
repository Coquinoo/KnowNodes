LogModule = require('../modules/log')

module.exports =
	isAdmin: (request, response, next) ->
		console.log("checking it's admin")
		next()
		###
		if([1,2,3].indexOf(request.params.article) >= 0) {
		next()
		} else {
		response.redirect('/articles')
		}
		###

	isLoggedIn: (request, response, next) ->
		console.log "checking if user is loggedin"
		next()

	callBack: (response) ->
		return (err, result) ->
			if err then response.json(error: err) else response.json(success: result)

	logActivity: (user, title, description, callback) ->
		logger = new LogModule user
		logger.logActivity title, description, callback