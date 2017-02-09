/* global $, document, nunjucks, Materialize */

$(document).ready(function () {
  $('form.add-tag-form').on('submit', function (ev) {
    console.warn('submit')
    ev.preventDefault()

    var label = this.elements.label.value
    var value = this.elements[label].value

    console.warn('label, value', label, value)

    updateField('UPDATE', this, label, value)
    .then(() => {
      this.elements[label].value = ''
    })
  })

  $('.btn-toggle-pdf').click(function (ev) {
    ev.preventDefault()

    $('#pdfdoc').toggle()
    $('.tags-column').toggleClass('offset-s9')
    $('.tags-column').toggleClass('s3')
    $('.tags-column').toggleClass('s12')
  })

  initChipClose()

  function initChipClose () {
    $('form.add-tag-form i.close').on('click', function (ev) {
      console.warn('delete')
      ev.stopPropagation()
      ev.preventDefault()

      var form = $(this).closest('form')[0]
      var label = form.elements.label.value
      var value = this.previousSibling.textContent

      updateField('DELETE', form, label, value)
      console.warn('label, value', label, value)
    })
  }

  function updateField (action, form, label, value) {
    let btn = $(form).find('.add-tag-btn')
    let btnStatus = btn.find('i')[0]
    let oldStatus = btnStatus.textContent
    let spinner = $(form).find('.preloader-wrapper')

    btn.hide()
    spinner.show().addClass('active')

    return $.post(form.action, { action: action, label: label, value: value })
      .done(data => {
        console.warn('data', data.multi)
        if (data.multi) {
          updateChips(label, data.multi.value)
        } else {
          updateChips(label, action === 'UPDATE' ? value : '')
        }

        spinner.hide().removeClass('active')
        btn.show()
        setTimeout(() => { btnStatus.textContent = oldStatus }, 1250)
      })
      .fail(e => {
        Materialize.toast(e.responseText, 3000, 'red')
        spinner.hide().removeClass('active')
        btnStatus.textContent = 'error'
        btn.addClass('red')
        btn.removeClass('blue')
        btn.show()
        setTimeout(() => {
          btn.addClass('blue')
          btn.removeClass('red')
          btnStatus.textContent = oldStatus
        }, 1250)
      })
  }

  function updateChips (label, value) {
    console.warn('updateChips', label, value)
    var multiForm = document.querySelector(`.field-form-${label} .multi-chips`)
    var templ = nunjucks.render('extraction/multi-chips.html', {
      field: {
        field_type: Array.isArray(value) ? 'select_many' : 'select_one',
        label: label,
        value: value
      }
    })
    var el = $.parseHTML($.trim(templ))[0]
    multiForm.innerHTML = ''
    multiForm.appendChild(el)
    initChipClose() // To listen for events on the newly created elements
  }
})
