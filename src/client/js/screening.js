/* global $, document, Materialize, nunjucks, reviewContext, window */

// Same as Materialize.toast, but interprets text as text rather than html.
function textToast (text, displayLength, className, completeCallback) {
  Materialize.toast($('<span>').text(text), displayLength, className, completeCallback)
}

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
  $('.screening_box').on('click', '.screenuser.active', function (e) {
    e.stopPropagation()
    toggleScreeningDropdown($(this).next(), null, '.screening_menu')
  })

  // When Remove button (link) is clicked, so the remove-screening confirmation.
  $('.screening_box').on('click', 'li.remove', function (e) {
    e.stopPropagation()
    toggleScreeningDropdown(this, true, '.removing')
  })

  // When Switch button (link) is clicked, toggle between included and excluded.
  $('.screening_box').on('click', 'li.switch', function (e) {
    e.stopPropagation()
    var li = $(this).parent().closest('li')
    toggleScreeningDropdown(this, true,
      li.hasClass('included') ? '.editexclusions' : '.editinclusion')
    li.toggleClass('included excluded tempswitched')
  })

  // When Edit button (link) is clicked, show the edit-exclusions dropdown.
  $('.screening_box').on('click', 'li.edit_screening_exclusions', function (e) {
    e.stopPropagation()
    toggleScreeningDropdown(this, true, '.editexclusions')
  })

  // When a cancel button is clicked in a dropdown, hide dropdowns and toggle back the
  // included/excluded classes if needed.
  $('.screening_box').on('click', '.dropdown_screening a.cancel', function (e) {
    e.stopPropagation()
    e.preventDefault()
    toggleScreeningDropdown(this, false)
  })

  // ----------------------------------------------------------------------

  // Performs a 'submit' or 'delete' screening action for the study containing the given element.
  // Shows a toast on failure. The caller should handle the success case.
  function doScreeningAction (elem, actionSuffix, data) {
    var studyElem = $(elem).closest('[data-study-url]')
    var studyUrl = studyElem.attr('data-study-url')
    var screeningType = studyElem.attr('data-screening-type')
    return $.ajax(studyUrl + '/screening/' + screeningType + actionSuffix, {
      method: 'POST',
      data: data
    })
    .fail(function (jqXHR, textStatus, error) {
      var message = jqXHR.responseJSON.error || error
      console.log('Action failed:', message)
      textToast('Action failed: ' + message, 3000, 'red')
    })
  }

  // Submits edits to a screening. On success, shows a toast and re-renders the
  // 'user_screening.html' template on success.
  function submitScreening (elem, status, excludeReasons) {
    return doScreeningAction(elem, '/submit',
      { status: status, exclude_reasons: excludeReasons })
    .done(function (data, textStatus, jqXHR) {
      var context = $.extend({screen: data}, reviewContext)
      var container = $(elem).closest('li.user_screening')
      if (container.length > 0) {
        container.html(nunjucks.render('shared/user_screening.html', context))
        container.removeClass('tempswitched')
      }
      textToast('Saved', 1000, 'green', () => {
        var studyElem = $(elem).closest('[data-study-url]')

        // Hide on submit, if set
        if (studyElem.attr('data-hide-on-submit')) {
          studyElem.slideUp()
        }

        // And also redirect on submit, if set
        var url = studyElem.attr('data-redirect-on-submit')
        if (url) {
          window.location = url
        }
      })
    })
    .always(function () {
      toggleScreeningDropdown(this, false)
    })
  }

  // Deletes a screening for the study containing the given element.
  function deleteScreening (elem) {
    return doScreeningAction(elem, '/delete', null)
    .done(function (data, textStatus, jqXHR) {
      textToast('Deleted', 1000, 'green')
      /* studyElem.slideUp() */
    })
    .always(function () {
      toggleScreeningDropdown(this, false)
    })
  }

  // ----------------------------------------------------------------------

  // On setting the screening to Included.
  $('.screening_box').on('click', '.editinclusion a.ok', function (e) {
    e.stopPropagation()
    e.preventDefault()
    submitScreening(this, 'included')
  })

  // On setting the screening to Excluded, with reasons.
  $('.screening_box').on('click', '.editexclusions a.ok', function (e) {
    e.stopPropagation()
    e.preventDefault()
    var excludeReasons = $(this).closest('.editexclusions').find(':checked').get()
        .map(function (el) { return $(el).attr('data-label') })
    submitScreening(this, 'excluded', excludeReasons)
  })

  // On clicking the Include button.
  $('.include-btn').on('click', function (e) {
    e.stopPropagation()
    e.preventDefault()
    submitScreening(this, 'included')
  })

  // Skipping a screening: just hide the entire study listing.
  $('.skip-btn').on('click', function (e) {
    e.stopPropagation()
    e.preventDefault()
    var studyElem = $(this).closest('[data-study-url]')
    studyElem.slideUp()
  })

  // On removing a screening.
  $('.screening_box').on('click', '.removing a.ok', function (e) {
    e.stopPropagation()
    e.preventDefault()
    var studyElem = $(this).closest('[data-study-url]')
    deleteScreening(this)
    .then(function () {
      studyElem.slideUp()
    })
  })

  // Clicks within any dropdown or on any button shouldn't propagate up.
  $('.screening_box').on('click', '.dropdown_screening, .btn', function (e) {
    e.stopPropagation()
  })

  // Clicks that do propagate to the window should close any open dropdowns.
  $(window).on('click', function (e) {
    toggleScreeningDropdown(this, false)
  })

  // ----------------------------------------------------------------------
  // Activate Materialize "chips" for tags.
  $('.chips').each(function () {
    var tags = JSON.parse($(this).attr('data-tags'))
    $(this).material_chip({
      data: tags.map(function (t) { return { tag: t } }),
      placeholder: 'Enter a tag',
      secondaryPlaceholder: '+Tag'
    })
  })

  // Whenever a chip is added or removed, save it to the server.
  $('.chips').on('chip.add chip.delete', function (e, chip) {
    var tags = $(this).material_chip('data').map(function (obj) { return obj.tag })
    var studyUrl = $(this).closest('[data-study-url]').attr('data-study-url')
    return $.ajax(studyUrl + '/tags', { method: 'POST', data: { tags: tags } })
    .done(function (data, textStatus, jqXHR) {
      textToast('Saved', 1000, 'green')
    })
    .fail(function (jqXHR, textStatus, error) {
      var message = jqXHR.responseJSON.error || error
      console.log('Failed to save tags:', message)
      textToast('Failed to save tags: ' + message, 3000, 'red')
    })
  })
})
