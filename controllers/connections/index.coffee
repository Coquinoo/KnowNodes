ConnectionController = require('./ConnectionController')
Callback = require('../Callback')

module.exports =

  create: (request, response) ->
    new ConnectionController(request).create(Callback.bind(response))

  show: (request, response) ->
    new ConnectionController(request).show(Callback.bind(response))

  update: (request, response) ->
    new ConnectionController(request).update(Callback.bind(response))

  destroy: (request, response) ->
    new ConnectionController(request).destroy(Callback.bind(response))

  getTripletByConnectionId: (request, response) ->
    console.log("we are at the controller index")
    new ConnectionController(request).getTripletByConnectionId(Callback.bind(response))

  latestTriplets: (request, response) ->
    new ConnectionController(request).latestTriplets(Callback.bind(response))

  hottestTriplets: (request, response) ->
    new ConnectionController(request).hottestTriplets(Callback.bind(response))