const rp = require('request-promise')
const { send } = require('./helpers')

function _extractionSend (path, opts = {}) {
  const uri = process.env.EXTRACTION_URL + path
  const options = Object.assign({
    uri,
    json: true,
    headers: {
      user: process.env.EXTRACTION_USER,
      passwd: process.env.EXTRACTION_PASSWORD
    }
  }, opts)
  return rp(options)
}

function getExtractedItems (user, studyId) {
  const uri = `/data_extractions/${studyId}`
  return send(uri, user)
}

function getRecord (studyId) {
  return _extractionSend(`/getRecord/${studyId}`)
}

function getLocations (studyId) {
  return _extractionSend(`/getLocations/${studyId}`)
}

function getMetadata (studyId, metadataName) {
  return _extractionSend(`/getMetadata/${studyId}/${metadataName}`)
}

module.exports = { getExtractedItems, getRecord, getLocations, getMetadata }
