/* global $, nunjucks */

$(document).ready(function () {
  function getPrisma () {
    let reviewId = $('.export-container').attr('data-review-id')
    $.ajax({
      url: `/reviews/${reviewId}/export/prisma`,
      context: document.body,
      method: 'GET',
      type: 'GET',
      contentType: 'application/json',
      success: function (data, textStatus, jqXHR) {
        // This adds a filter function to the nunjucks environment used to render _prisma-result.
        var env = nunjucks.configure('export/partials/')
        env.addFilter('values', obj => Object.keys(obj).map(key => obj[key]))
        var templ = nunjucks.render('export/partials/_prisma-result.html', data)
        var el = $.parseHTML($.trim(templ))[0]
        $('.prisma-result').html(el)
      }
    })
  }

  $('.export-prisma-btn').click(function () {
    getPrisma()
  })

  $('.export-csv-btn').click(function () {
    // TODO: Implement csv download.
  })

  getPrisma()
})
