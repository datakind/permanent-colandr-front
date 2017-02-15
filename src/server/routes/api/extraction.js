const Promise = require('bluebird')
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

function getMetadata (studyId) {
  return _extractionSend(`/getMetadata/${studyId}`)
}

function getSuggestedLabels (user, studyId) {
  return Promise.join(
    getExtractedItems(user, studyId),
    getMetadata(studyId).catch(err => {
      console.warn(`Error retrieving metadata for study ${studyId}:`, err.message)
      return []
    }),
    _filterMetadataByAccepted
  )
}

function _filterMetadataByAccepted (accepted, metadata) {
  let extracted = accepted.extracted_items
  let labels = {}
  metadata.forEach(item => {
    let accepted = extracted.find(ex => (ex.label === item.metaData) &&
      Array.isArray(ex.value) && ex.value.includes(item.value))
    if (!accepted) {
      let label = `${item.metaData}: ${item.value}`
      labels[label] = labels[label] || []
      labels[label].push(item)
    }
  })
  return labels
}

module.exports = { getExtractedItems, getRecord, getLocations, getMetadata, getSuggestedLabels }
