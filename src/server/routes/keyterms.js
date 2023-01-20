const _ = require('lodash')

function getKeytermsRE (keyterms) {
  // Collect all keyterms and synonyms.
  let termSet = new Set()
  for (let term of keyterms) {
    termSet.add(term.term)
    for (let syn of term.synonyms) {
      termSet.add(syn)
    }
  }

  // Convert to an array, sorted by decreasing length.
  let sortedTerms = Array.from(termSet).sort((a, b) => (b.length - a.length))
  let escapedTerms = sortedTerms.map(term => _.escapeRegExp(term))
  return new RegExp(escapedTerms.join('|'), 'gi')
}

function markKeywordsCitation (citation, keytermsRE) {
  if (citation) {
    citation.title = markKeywords(citation.title, keytermsRE)
    citation.abstract = markKeywords(citation.abstract, keytermsRE)
    citation.keywords = citation.keywords && citation.keywords.map(k => markKeywords(k, keytermsRE))
  }
}

function markKeywords (text, keytermsRE) {
  return text && text.replace(keytermsRE, '<span class="keyterm">$&</span>')
}

module.exports = { getKeytermsRE, markKeywordsCitation, markKeywords }
