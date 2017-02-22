/* global $, document, FormData, XMLHttpRequest, nunjucks */

$(document).ready(function () {
  /**
   * Adds a question to the list of research questions by cloning the templates.
   */
  function replaceUploadForm (container, context) {
    var templ = nunjucks.render('fulltext/partials/fields/_include-form.html', context)
    var el = $.parseHTML($.trim(templ))[0]
    container.html(el)
  }

  $('.uploaded-fulltext').change(function (e) {
    e.stopPropagation()
    e.preventDefault()
    var formData = new FormData()
    var form = $(this).closest('form')
    var action = form.find('.action')
    var studyId = form.find('.studyId').val()
    action.val('included')
    formData.append('studyId', studyId)
    formData.append('uploaded_file', this.files[0])
    var request = new XMLHttpRequest()
    request.open('POST', form.attr('action'))
    request.send(formData)
    let decisionBox = $(this).closest('.decision-form-box')
    let uploadStatus = decisionBox.find('.upload-status')
    uploadStatus.html(`Uploading ${this.files[0].name}`)
    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        let response = JSON.parse(request.responseText)
        if (request.status === 200) {
          // Success
          replaceUploadForm(decisionBox, response)
        } else {
          // Error uploading
          uploadStatus.html('')
        }
      }
    }
  })
})
