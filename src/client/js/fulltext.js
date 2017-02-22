/* global $, FormData, XMLHttpRequest, nunjucks */

$(document).ready(function () {
  /**
   * Adds a question to the list of research questions by cloning the templates.
   */
  function replaceUploadForm (container, context) {
    var templ = nunjucks.render('fulltext/partials/fields/_include-form.html', context)
    var el = $.parseHTML($.trim(templ))[0]
    container.html(el)
  }

  $('.decision-form-box').click(function (ev) {
    ev.stopPropagation()
  })

  $('.decision-form-box').on('click', '.include-btn', function (e) {
    e.stopPropagation()
    e.preventDefault()
    console.log('JSON Request')
    var form = $(this).closest('form')
    var action = form.find('.action')
    action.val('included')
    console.log(action)
    console.log(form)
    var serialized = form.serialize()
    console.log(serialized)
    $.ajax({
      url: '/reviews/{{ reviewId }}/fulltext/screenings/submit',
      context: document.body,
      method: 'POST',
      type: 'POST',
      data: serialized,
      error: function (jqXHR, textStatus, errorThrown) {
        // alert(errorThrown)
      },
      success: function (data, textStatus, jqXHR) {
        console.log(data)
        form.closest('li').slideUp()
      }
    })
    // $(this).parent().parent().children('.editexclusions').attr('style', 'display:block')
  })

  $('.decision-form-box').on('click', '.skip-btn', function (e) {
    e.stopPropagation()
    e.preventDefault()
    $(this).closest('li').slideUp()
  })

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

  $(window).click(function (e) {
    console.log(e.target.className)
    var target = $(e.target)
    if (!target.is('.dropdown li a')) {
      $('.dropdown').each(function (index) {
        $(this).attr('style', 'display:none')
      })
    }
    if (!target.is('.removing')) {
      $('.removing').each(function (index) {
        $(this).attr('style', 'display:none')
      })
    }
    if (!target.is('.switching')) {
      $('.switching').each(function (index) {
        $(this).attr('style', 'display:none')
      })
    }
  })

  $('.chips').each(function (index) {
    var chip = $(this)
    var tagsString = chip.parent().find('input').val()
    var objects = []
    if (tagsString.length > 0) {
      try {
        console.log('tag string:' + tagsString)
        var tags = tagsString.split(',')
        for (var tag in tags) {
          objects.push({
            tag: tags[tag]
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
    chip.material_chip({
      data: objects,
      placeholder: 'Enter a tag',
      secondaryPlaceholder: '+Tag'
    })
  })
  $('.chips').on('chip.add', function (e, chip) {
    // you have the added chip here
    console.log('added')
    console.log(chip)
    console.log(chip.tag)
    var data = $(this).closest('.chips').material_chip('data')
    var form = $(this).closest('li').find('form')
    console.log(form)
    var citationId = form.find('input.citationId').val()
    console.log(citationId)
    var tags = []
    for (var tag in data) {
      tags.push(data[tag].tag)
    }
    console.log(tags)
    $.ajax({
      url: '/reviews/{{ reviewId }}/citations/tags/' + citationId,
      context: document.body,
      method: 'POST',
      type: 'POST',
      data: {
        tags: tags
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // alert(errorThrown)
      },
      success: function (data, textStatus, jqXHR) {
        console.log(data)
      }
    })
  })

  $('.chips').on('chip.delete', function (e, chip) {
    console.log('removed')
    console.log(chip)
    console.log(chip.tag)
    var data = $(this).closest('.chips').material_chip('data')
    var form = $(this).closest('li').find('form')
    console.log(form)
    var citationId = form.find('input.citationId').val()
    console.log(citationId)
    var tags = []
    for (var tag in data) {
      tags.push(data[tag].tag)
    }
    console.log(tags)
    $.ajax({
      url: '/reviews/{{ reviewId }}/citations/tags/' + citationId,
      context: document.body,
      method: 'POST',
      type: 'POST',
      data: {
        tags: tags
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // alert(errorThrown)
      },
      success: function (data, textStatus, jqXHR) {
        console.log(data)
      }
    })
  })
})
