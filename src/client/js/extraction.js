/* global $ */

$(document).ready(function () {
  function _updateListing (listingSelect, color, status) {
    listingSelect.attr('data-status', status)
    listingSelect.find('.tagreview-body').slideUp()
    listingSelect.find('.tagreview-header').removeClass('grey').addClass(color)
    listingSelect.find('.tagreview-status').text(status.toUpperCase())
  }

  function _skip (listingSelect) {
    _updateListing(listingSelect, 'grey', 'skipped')
  }

  function _unskip (listingSelect) {
    listingSelect.attr('data-status', 'pending')
    listingSelect.find('.tagreview-status').text('Under Review')
    listingSelect.find('.tagreview-body').slideDown()
  }

  $('.review-btn').click(function (e) {
    e.stopPropagation()
  })

  $('.include-btn').click(function () {
    _updateListing($(this).closest('.tagreview-listing'), 'green', 'accepted')
  })

  $('.skip-btn').click(function () {
    _skip($(this).closest('.tagreview-listing'))
  })

  $('.reject-btn').click(function () {
    _updateListing($(this).closest('.tagreview-listing'), 'red', 'rejected')
  })

  $('.tagreview-header').click(function () {
    let listingSelect = $(this).closest('.tagreview-listing')
    let status = listingSelect.attr('data-status')
    if (status === 'pending') {
      _skip(listingSelect)
    } else if (status === 'skipped') {
      _unskip(listingSelect)
    }
  })
})
