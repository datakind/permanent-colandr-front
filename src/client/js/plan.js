/* global $, document, nunjucks, Materialize */

(function () {
  $(function () {
    $('[id^="add-field-"]').on('click', appendQ)
    $('form').on('click', '.research-question-remove', removeQuestion)
    $('form').on('change', '[id^="data_extraction_form_field_type_"]', updateDataExtractionField)

    // Prevent submission of bad research question
    $('#form-research-questions').submit(function (ev) {
      let invalidEls = $(this).find('.invalid')
      if (invalidEls.length > 0) {
        ev.preventDefault()
        invalidEls.parent().effect('highlight', {}, 3000)
        Materialize.toast('Research questions form contains invalid entries!', 3000, 'red')
      }
    })
  })

  function appendQ (e) {
    e.preventDefault()
    var $el = $(this)
    var section = $el.attr('id').replace('add-field-', '')
    switch (section) {
      case 'research-questions':
        addQuestion()
        break
      case 'keyterms':
        newKeytermField()
        warnOfOutOfDateSearchQuery()
        break
      case 'selection-criteria':
        newSectionCriteriaField()
        break
      case 'data-extraction-form':
        newDataExtractionFormField()
        break
      default:
        console.log('Something went wrong.')
    }
  }

  /**
   * Adds a question to the list of research questions by cloning the templates.
   */
  function addQuestion () {
    var questionList = document.querySelector('#form-research-questions > ul')
    var templ = nunjucks.render('plans/partials/fields/_research.html', {
      loop: {
        index: questionList.children.length + 1
      }
    })
    var el = $.parseHTML($.trim(templ))[0]

    questionList.appendChild(el)
  }

  /**
   * Removes the question from the list of research questions.
   */
  function removeQuestion (e) {
    e.preventDefault() // Prevents following the <a> link
    $(this).closest('.question-wrap').remove()
  }

  function newKeytermField () {
    var $form = $('#form-keyterms')
    var idNum = $form.find('input').length + 1

    var $row = $('<div class="row question-wrap"></div>')
    var $fields = ['term', 'synonyms', 'group']

    var $columns = $fields.map(addKeytermColumn(idNum))
    $row.append($columns)

    var $removeBtn = newRemoveButton()
    $row.find('input').last().after($removeBtn)

    $form.find('.row').last().after($row)
  }

  function newSectionCriteriaField () {
    var $form = $('#form-selection-criteria')
    var idNum = $form.find('input').length + 1

    var $row = $('<div class="row question-wrap"></div>')
    var $labelCol = selectionCriteriaInputField(idNum, 's4', 'label')
    var $descripCol = selectionCriteriaInputField(idNum, 's8', 'description')

    $row.append($labelCol).append($descripCol)

    var $removeBtn = newRemoveButton()
    $row.find('input').last().after($removeBtn)

    $form.find('button').first().before($row)
  }

  function newDataExtractionFormField () {
    var $form = $('#form-data-extraction-form')
    var idNum = $form.find('input').length + 1

    var $row = $('<div class="row question-wrap"></div>')
    var fieldTypes = ['label', 'description', 'field_type']
    var $columns = fieldTypes.map(dataExtractionFormColumn(idNum))

    $columns.forEach(function (column) { $row.append(column) })

    var $emptyCol = $('<div class="col s3 input-field"></div>')
    var $removeBtn = newRemoveButton()

    $emptyCol.append($removeBtn)
    $row.append($emptyCol)

    $form.find('button').first().before($row)
  }

  function newRemoveButton () {
    var $a = $('<a class="btn-floating waves-effect waves-light red remove-field-button"></a>')
    var $i = $('<i class="material-icons">remove</i>')

    $a.append($i)
    return $a
  }

  function addKeytermColumn (idNum) {
    return function (key) {
      var $col = $('<div class="col s4 input-field"></div>')
      var $input = $('<input type="text" class="validate"></input>')

      $input.attr('id', 'keyterm_' + key + '_' + idNum)
      $input.attr('name', 'keyterms[' + idNum + '][' + key + ']')

      $col.append($input)
      return $col
    }
  }

  function selectionCriteriaInputField (id, colSize, fieldName) {
    var $col = $('<div class="col input-field ' + colSize + '"></div>')
    var $input = $('<input type="text" class="validate">')
    $input.attr('id', 'selection_criteria_' + fieldName + '_' + id)
    $input.attr('name', 'selection_criteria[' + id + '][' + fieldName + ']')

    var $label = $('<label></label>')
    var labelText = fieldName[0].toUpperCase() + fieldName.substr(1)
    $label.attr('for', $input.attr('name')).text(labelText)

    $col.append($input)
    $col.append($label)

    return $col
  }

  function dataExtractionFormColumn (idNum) {
    return function (key) {
      var $col = $('<div class="col s3 input-field"></div>')
      var $input
      if (key !== 'field_type') {
        $input = $('<input type="text" class="validate">')
      } else {
        $input = $('<select class="browser-default"></select>')
        var options = [
          ['', '-- Select An Option --'],
          ['str', 'Text'],
          ['int', 'Integer'],
          ['float', 'Float'],
          ['date', 'Date'],
          ['bool', 'Boolean'],
          ['select_one', 'Select One'],
          ['select_many', 'Select Many']
        ]

        options.forEach(function (optInfo) {
          var $option = $('<option value="' +
            optInfo[0] + '">' +
            optInfo[1] + '</option>')

          $input.append($option)
        })
      }

      $input.attr('id', 'data_extraction_form_' + key + '_' + idNum)
      $input.attr('name', 'data_extraction_form[' + idNum + '][' + key + ']')
      $col.append($input)

      return $col
    }
  }

  function warnOfOutOfDateSearchQuery () {
    $('.boolean-search-query span').text('query is potentially out of date')
  }

  function updateDataExtractionField (e) {
    var $select = $(this)
    var idArr = $select.attr('id').split('_')
    var id = idArr[idArr.length - 1]

    if ($select.val().indexOf('select_') > -1) {
      var $allowedValuesCol = $select.parent().next()
      if (!$allowedValuesCol.find('input').length) {
        var $input = $('<input type="text" class="validate">')
        $input.attr('id', 'data_extraction_form_allowed_values_' + id)
        $input.attr('name', 'data_extraction_form[' + id + '][allowed_values]')
        $allowedValuesCol.prepend($input)
      }
    } else {
      $('#data_extraction_form_allowed_values_' + id).remove()
    }
  }
})()
