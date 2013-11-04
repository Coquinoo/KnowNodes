Controller = require '../Controller'
parser = require 'jstoxml'
TripletConverter = require './TripletConverter'
Triplets = require '../../data/Triplets'

module.exports = class GexfController extends Controller

  getSampleXML: (_) ->
    triplet = Triplets.findByConnectionId('2086cf88-caf6-400e-91d1-ef517b630041', @getLoggedUserIdIfExists(), _)
    json = TripletConverter.toGexfFormat(triplet, _)
    xml = parser.toXML(json, { header: true, indent: '  ' })
    xml