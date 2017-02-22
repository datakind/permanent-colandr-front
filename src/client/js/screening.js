/* global $, document, Materialize, nunjucks, reviewContext */

$(document).ready(function () {
  // User material style for select dropdowns.
  $('select').material_select()

  // Initialize materialize "collapsible" elements.
  $('.collapsible').collapsible()

  // When the "filters" select dropdown changes, submit the form to set the filters.
  $('#filters select').change(function () {
    this.form.submit()
  })

  // Allow toggling keyword highlights with the "Highlights On/Off" button.
  $('#filters .highlights').click(function (e) {
    e.stopPropagation()
    e.preventDefault()
    $(this).toggleClass('highlightson highlightsoff')
    $(this).text($(this).hasClass('highlightson') ? 'Highlights_On' : 'Highlights_Off')
    $('.reviews-list').toggleClass('hide-highlights')
  })

  // When Exclude button is clicked, show the edit-exclusions dropdown.
  $('a.doexclude').click(function (e) {
    e.stopPropagation()
    e.preventDefault()
    $(this).parent().find('.editexclusions').toggle()
  })

  /*
   * Show, hide, or toggle a screening dropdown.
   * Action may be true to show, false to hide, or null to toggle.
   * Selector is only used when showing.
   */
  function toggleScreeningDropdown (elem, action, selector) {
    var screening = $(elem).closest('.screening_actions')
    var show = (action !== null ? action
                : screening.find('.dropdown_screening:visible').length === 0)
    // If any items were temporarily toggled, toggle them back when hiding dropdowns.
    $('li.tempswitched').toggleClass('included excluded tempswitched')
    $('.dropdown_screening').hide()
    if (show) {
      screening.find(selector).show()
    }
  }

  // For an active user's screening, show dropdown with edit options when the user is clicked.
  $('li.user_screening').on('click', '.screenuser.active', function (e) {
    e.stopPropagation()
    toggleScreeningDropdown($(this).next(), null, '.screening_menu')
  })

  // When Remove button (link) is clicked, so the remove-screening confirmation.
  $('li.user_screening').on('click', 'li.remove', function (e) {
    e.stopPropagation()
    toggleScreeningDropdown(this, true, '.removing')
  })

  // When Switch button (link) is clicked, toggle between included and excluded.
  $('li.user_screening').on('click', 'li.switch', function (e) {
    e.stopPropagation()
    var li = $(this).parent().closest('li')
    toggleScreeningDropdown(this, true,
      li.hasClass('included') ? '.editexclusions' : '.editinclusion')
    li.toggleClass('included excluded tempswitched')
  })

  // When Edit button (link) is clicked, show the edit-exclusions dropdown.
  $('li.user_screening').on('click', 'li.edit_screening_exclusions', function (e) {
    e.stopPropagation()
    toggleScreeningDropdown(this, true, '.editexclusions')
  })

  // When a cancel button is clicked in a dropdown, hide dropdowns and toggle back the
  // included/excluded classes if needed.
  $('li.user_screening').on('click', '.dropdown_screening a.cancel', function (e) {
    e.stopPropagation()
    e.preventDefault()
    toggleScreeningDropdown(this, false)
  })

  // ----------------------------------------------------------------------

  // Submits edits to a review containing the given element. Shows a toast on success/failure, and
  // re-renders the 'user_screening.html' template on success.
  function submitReview (elem, status, excludeReasons) {
    var submitUrl = $(elem).closest('[data-submit-url]').attr('data-submit-url')
    $.ajax(submitUrl + '/submit', {
      method: 'POST',
      data: { status: status, exclude_reasons: excludeReasons }
    })
    .done(function (data, textStatus, jqXHR) {
      var container = $(elem).closest('li.user_screening')
      var context = $.extend({screen: data}, reviewContext)
      container.html(nunjucks.render('shared/user_screening.html', context))
      container.removeClass('tempswitched')

      Materialize.toast('Saved', 1000, 'green')
      /* studyElem.slideUp() */
    })
    .fail(function (jqXHR, textStatus, error) {
      var message = jqXHR.responseJSON.error || error
      console.log('Request failed:', message)
      Materialize.toast('Review action failed: ' + message, 3000, 'red')
    })
    .always(function () {
      toggleScreeningDropdown(this, false)
    })
  }

  // On setting the screening to Included.
  $('li.user_screening').on('click', '.editinclusion a.ok', function (e) {
    e.stopPropagation()
    e.preventDefault()
    submitReview(this, 'included')
  })

  // On setting the screening to Excluded, with reasons.
  $('li.user_screening').on('click', '.editexclusions a.ok', function (e) {
    e.stopPropagation()
    e.preventDefault()

    var excludeReasons = $(this).closest('.editexclusions').find(':checked').get()
        .map(function (el) { return $(el).attr('data-label') })
    submitReview(this, 'excluded', excludeReasons)
  })

  // On removing a screening.
  $('li.user_screening').on('click', '.removing a.ok', function (e) {
    e.stopPropagation()
    e.preventDefault()
    var submitUrl = $(this).closest('[data-submit-url]').attr('data-submit-url')
    $.ajax(submitUrl + '/delete', { method: 'POST' })
    .done(function (data, textStatus, jqXHR) {
      Materialize.toast('Deleted', 1000, 'green')
      /* studyElem.slideUp() */
    })
    .fail(function (jqXHR, textStatus, error) {
      var message = (jqXHR.responseJSON.error || error)
      console.log('Request failed:', message)
      Materialize.toast('Review action failed: ' +
        message .replace(/</g, '&lt;').replace(/>/g, '&gt;'),
        3000, 'red')
    })
    .always(function () {
      toggleScreeningDropdown(this, false)
    })
  })

  // ----------------------------------------------------------------------
  /*

  $('.include-btn').on('click', function (e) {
    doReview(this, 'included', null)
  })

  // Close the containing LI when the Skip button is clicked.
  $('.skip-btn').on('click', function (e) {
    $(this).closest('[data-study-id]').slideUp()
  })
 */
})

/*
citations AND fulltext

  $(window).click(function (e) {

  $('.chips').each(function (index) {
  $('.chips').on('chip.add', function (e, chip) {
  $('.chips').on('chip.delete', function (e, chip) {

citations only
  $('.include-btn').click(function (e) {
  $('.skip-btn').click(function (e) {

fulltext only
  $('.uploaded-fulltext').change(function (e) {
  $('.decision-form-box').click(function (ev) {
  $('.decision-form-box').on('click', '.include-btn', function (e) {
  $('.decision-form-box').on('click', '.skip-btn', function (e) {
 */
