Resources = require '../data/Resources'
Users = require '../data/Users'
Type = require '../model/Type'
Logger = require '../log/logger'
Error = require '../error/Error'

module.exports = class WikiDAO

  makeWikipediaUrl: (title) ->
    'http://en.wikipedia.org/wiki/' + title.replace(/\ /g, "_")

  constructor: ->
    @logger = new Logger('WikiDAO')

  findOrCreate: (title, userId, _) ->
    url = @makeWikipediaUrl(title)
    # Check resource doesn't already exist
    try
      ResourceService.findByUrl(url, _) # Return resource if exists
    catch error
      if error.isCustom and error.type is Error.Type.NOT_FOUND
        # Resource does not exist, proceed to create it
        data =
          title: title
          url: url
          resourceType: Type.WIKIPEDIA_ARTICLE
        creator = UserService.find(userId, _)
        ResourceService.create(data, creator, _)
      else # Unexpected error
        throw error

  findByTitle: (title, _) ->
    @logger.debug("findByTitle (title: #{title})")
    url = @makeWikipediaUrl(title)
    ResourceService.findByUrl(url, _)