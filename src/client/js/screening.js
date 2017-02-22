/* global $, document */

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
  function toggleScreeningDropdown(elem, action, selector) {
    var screening = $(elem).closest('.screening_actions')
    var show = (action !== null ? action :
                screening.find('.dropdown_screening:visible').length === 0)
    // If any items were temporarily toggled, toggle them back when hiding dropdowns.
    $('li.tempswitched').toggleClass('included excluded tempswitched')
    $('.dropdown_screening').hide()
    if (show) {
      screening.find(selector).show()
    }
  }

  // For an active user's screening, show dropdown with edit options when the user is clicked.
  $('.screenuser.active').click(function (e) {
    e.stopPropagation()
    toggleScreeningDropdown($(this).next(), null, '.screening_menu')
  })

  // When Remove button (link) is clicked, so the remove-screening confirmation.
  $('li.remove').click(function (e) {
    e.stopPropagation()
    toggleScreeningDropdown(this, true, '.removing')
  })

  // When Switch button (link) is clicked, toggle between included and excluded.
  $('li.switch').click(function (e) {
    e.stopPropagation()
    var li = $(this).parent().closest('li')
    toggleScreeningDropdown(this, true,
      li.hasClass('included') ? '.editexclusions' : '.editinclusion')
    li.toggleClass('included excluded tempswitched')
  })

  // When Edit button (link) is clicked, show the edit-exclusions dropdown.
  $('li.edit_screening_exclusions').click(function (e) {
    e.stopPropagation()
    toggleScreeningDropdown(this, true, '.editexclusions')
  })

  // When a cancel button is clicked in a dropdown, hide dropdowns and toggle back the
  // included/excluded classes if needed.
  $('.dropdown_screening a.cancel').click(function (e) {
    e.stopPropagation()
    e.preventDefault()
    toggleScreeningDropdown(this, false)
  })


  // ----------------------------------------------------------------------
  /*
  function doReview (elem, status, excludeReasons) {
    var studyElem = $(elem).closest('[data-study-id]')
    var studyId = studyElem.attr('data-study-id')
    $.ajax('/reviews/' + reviewId + '/citations/screenings/' + studyId, {
      method: 'POST',
      data: { status: status, exclude_reasons: excludeReasons }
    })
    .done(function () { studyElem.slideUp() })
    .fail(function (jqXHR, textStatus, error) {
      console.log('Request failed', error)
      Materialize.toast('Review action failed: ' + error, 3000, 'red')
    })
  }

  $('.editexclusions a.ok').on('click', function (e) {
    var excludeReasons = $(this).closest('.editexclusions').find(':checked')
    .map(function (el) { return $(el).attr('data-label') }).get()
    doReview(this, 'excluded', excludeReasons)
  })

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
  $('.editinclusion a.ok').click(function (e) {
  $('.editexclusions a.ok').click(function (e) {
  $('.row').on('click', '.editexclusions a.ok', function (e) {

  $('.removing a.cancel').click(function (e) {
  $('.removing a.ok').click(function (e) {
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
