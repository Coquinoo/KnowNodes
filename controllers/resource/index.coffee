Callback = require('../Callback')
ResourceController = require('./ResourceController')

module.exports =

  create: (request, response) ->
    new ResourceController(request).create(Callback.bind(response))

  show: (request, response) ->
    new ResourceController(request).show(Callback.bind(response))

  update: (request, response) ->
    new ResourceController(request).update(Callback.bind(response))

  destroy: (request, response) ->
    new ResourceController(request).destroy(Callback.bind(response))

  searchByKeyword: (request, response) ->
    dao = new ResourceDAO request.user
    cb = Callback.bind response
    query = request.params.resource.replace /:/g, ''
    dao.searchByKeyword query, cb