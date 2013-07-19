NodeWrapper = require './NodeWrapper'
NodeType = require './NodeType'
ResourceValidator = require './validation/resourceValidator'
Connection = require './Connection'
Error = require '../error/Error'

module.exports = class Resource extends NodeWrapper

  @Type:
    WIKIPEDIA_ARTICLE: 'Wikipedia Article'

  ###
        CLASS METHODS
  ###

  @getNodeType: -> NodeType.RESOURCE

  @wrap: (node) -> new Resource(node)

  # Overrides parent method to make sure the resource has a CREATED_BY relationship
  @create: (data, creator, _) ->
    data.active = true
    created = super(data, _)
    creator.setAsCreator(created, _)
    return created

  @searchByKeyword: (userQuery, _) ->
    nodes = []
    cypherQuery = [
      'START results=node(*)',
      'Where has(results.title)',
      'and results.nodeType="kn_Post"',
      'and results.title =~ {regex}',
      'RETURN results'
    ].join('\n');
    regex = '(?i).*' + userQuery + '.*'
    params = {regex: regex}
    results = @DB.query(cypherQuery, params, _)
    for item in results
      nodes.push item.results.data
    nodes

  @findByUrl: (url, _) ->
    @findByTextProperty('url', url, _)

  @findTripletsByResourceId: (id,_) ->
    nodes = []
    query = [
      'START resource=node({resourceNodeId})',
      'MATCH (resource) -[:RELATED_TO]- (connection) -[:RELATED_TO]- (otherResource) -[:CREATED_BY]- (otherResourceCreator),',
      '(otherConnections)-[?:RELATED_TO]-(otherResource),',
      '(connection) -[:CREATED_BY]- (connectionCreator),',
      '(connection) -[?:COMMENT_OF]- (comments)',
      'WHERE otherResource <> resource AND otherConnections <> connection ',
      'RETURN otherResource, otherResourceCreator, connection, connectionCreator, count(comments) AS commentCount, count(otherConnections) AS otherConnectionsCount'
    ].join('\n');

    resource = @find(id, _)
    params =
      resourceNodeId: resource.node.id

    results = @DB.query(query, params, _)
    for item in results
      toPush =
        otherResource: item.otherResource.data,
        connection: item.connection.data,
        commentCount: item.commentCount,
        otherConnectionsCount: item.otherConnectionsCount
      toPush.otherResource.creator = item.otherResourceCreator.data
      toPush.connection.creator = item.connectionCreator.data
      nodes.push toPush
    nodes

  ###
        INSTANCE METHODS
  ###

  constructor: (node) ->
    super node

  connectTo: (other, user, data, _) ->
    Connection.connect(@, other, user, data, _)

  validate: ->
    new ResourceValidator().validate(@node.data)

  index: (_) ->
    super _
    if @node.data['url']?
      @indexTextProperty('url', _)