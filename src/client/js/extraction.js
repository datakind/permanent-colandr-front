/* global $, document, Materialize */

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

  $('.tag-review-form').click(function (ev) {
    ev.preventDefault()

    var label = this.elements.label.value
    var value = this.elements.value.value

    switch (ev.target.name) {
      case 'accept':
        $.post(this.action, { action: 'UPDATE', label: label, value: value })
          .done(() => {
            _updateListing($(this).closest('.tagreview-listing'), 'green', 'accepted')
          })
          .fail(e => {
            Materialize.toast(e.responseText, 5000, 'red')
          })
        break
      case 'skip':
        _skip($(this).closest('.tagreview-listing'))
        break
      case 'reject':
        _updateListing($(this).closest('.tagreview-listing'), 'red', 'rejected')
        break
    }
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

  $('.extract-buttons > a').click(function (ev) {
    console.warn('extract-buttons')
    ev.stopPropagation()
  })
})
