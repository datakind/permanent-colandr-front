/* global $ */

$(document).ready(function () {
  // ----------------------------------------------------------------------
  $('.removing a.cancel').click(function (e) {
    e.stopPropagation()
    e.preventDefault()
    $('.removing').each(function (index) {
      $(this).attr('style', 'display:none')
    })
  })

  // ----------------------------------------------------------------------
  $('.removing a.ok').click(function (e) {
    e.stopPropagation()
    e.preventDefault()
    var form = $(this).closest('form')
    var serialized = form.serialize()
    console.log(serialized)
    var action = form.find('.action')
    $.ajax({
      url: 'http://localhost:3000/reviews/{{ reviewId }}/citations/screenings/delete',
      context: document.body,
      method: 'POST',
      type: 'POST',
      data: serialized,
      error: function (jqXHR, textStatus, errorThrown) {
        action.val('included')
        // alert(errorThrown)
        $('.removing').each(function (index) {
          $(this).attr('style', 'display:none')
        })
      },
      success: function (data, textStatus, jqXHR) {
        console.log(data)
        $('.removing').each(function (index) {
          $(this).attr('style', 'display:none')
        })
        form.parent().parent().slideUp()
      }
    })
  })

  // ----------------------------------------------------------------------
  $('.editinclusion a.ok').click(function (e) {
    e.stopPropagation()
    e.preventDefault()
    console.log('JSON Request')
    var form = $(this).closest('form')
    var action = form.find('.action')
    action.val('included')
    // var li = form.closest('li')
    var serialized = form.serialize()
    var url = 'http://localhost:3000/reviews/{{ reviewId }}/citations/screenings/change'
    console.log(url)
    console.log(serialized)
    $.ajax({
      url: url,
      context: document.body,
      method: 'POST',
      type: 'POST',
      data: serialized,
      error: function (jqXHR, textStatus, errorThrown) {
        // alert(errorThrown)
        $('.editinclusion').each(function (index) {
          $(this).attr('style', 'display:none')
        })
      },
      success: function (data, textStatus, jqXHR) {
        console.log(data)
        $('.editinclusion').each(function (index) {
          $(this).attr('style', 'display:none')
        })
        form.parent().parent().slideUp()
      }
    })
    // $(this).parent().parent().children('.editexclusions').attr('style', 'display:block')
  })

  // ----------------------------------------------------------------------
  $('.editexclusions a.ok').click(function (e) {
    e.stopPropagation()
    e.preventDefault()
    console.log('JSON Request')
    var form = $(this).closest('form')
    var action = form.find('.action')
    console.log(action)
    action.val('excluded')
    console.log(form)
    var serialized = form.serialize()
    console.log(serialized)
    action.val('included')
    var li = form.closest('li')
    var url = ''
    if (li.is('.pending')) {
      url = 'http://localhost:3000/reviews/{{ reviewId }}/citations/screenings/submit'
    } else {
      url = 'http://localhost:3000/reviews/{{ reviewId }}/citations/screenings/change'
    }
    console.log(url)
    $.ajax({
      url: url,
      context: document.body,
      method: 'POST',
      type: 'POST',
      data: serialized,
      error: function (jqXHR, textStatus, errorThrown) {
        action.val('included')
        // alert(errorThrown)
        $('.editexclusions').each(function (index) {
          $(this).attr('style', 'display:none')
        })
      },
      success: function (data, textStatus, jqXHR) {
        console.log(data)
        $('.editexclusions').each(function (index) {
          $(this).attr('style', 'display:none')
        })
        form.parent().parent().slideUp()
      }
    })
    // $(this).parent().parent().children('.editexclusions').attr('style', 'display:block')
  })

  // ----------------------------------------------------------------------
  $('.include-btn').click(function (e) {
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
      url: 'http://localhost:3000/reviews/{{ reviewId }}/citations/screenings/submit',
      context: document.body,
      method: 'POST',
      type: 'POST',
      data: serialized,
      error: function (jqXHR, textStatus, errorThrown) {
        // alert(errorThrown)
      },
      success: function (data, textStatus, jqXHR) {
        console.log(data)
        form.parent().parent().slideUp()
      }
    })
    // $(this).parent().parent().children('.editexclusions').attr('style', 'display:block')
  })

  // ----------------------------------------------------------------------
  $('.skip-btn').click(function (e) {
    e.stopPropagation()
    e.preventDefault()
    var form = $(this).closest('form')
    form.parent().parent().slideUp()
    // $(this).parent().parent().children('.editexclusions').attr('style', 'display:block')
  })

  // ----------------------------------------------------------------------
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

  // ----------------------------------------------------------------------
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
  // ----------------------------------------------------------------------
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
      url: 'http://localhost:3000/reviews/{{ reviewId }}/citations/tags/' + citationId,
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

  // ----------------------------------------------------------------------
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
      url: 'http://localhost:3000/reviews/{{ reviewId }}/citations/tags/' + citationId,
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
