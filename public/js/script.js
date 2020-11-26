let currentGroup = [];

$(function(){

  $('[data-close-login]').click(function(){
    if ($('[name="pseudo"]').val() == '') {
      $('#login-container').addClass('wrong');
    } else {
      $('#login-container').removeClass('wrong').addClass('hide');
    }
  });

  socket.on('toclient/set/group', function (data) {
    currentGroup = data.group;
    setGroup();
  });

  socket.on('toclient/refresh', function (data) {
    document.location.reload(true);
  });

  socket.on('toclient/clear', function (data) {
    $('.group').empty();
  });



  $(document).on('click', '.field', function(){

    if ( !$(this).hasClass('button-disabled') ) {
      const value = $(this).find('.field-value').text().trim();
      socket.emit('toserver/userChoice', {
        value: value,
        pseudo: $('[name="pseudo"]').val()
      });
     disableVote();
    }

  });


  function setGroup() {
    if (currentGroup.fields == undefined) return false;

    $('.group').empty();
    let questionDOM = $('#clones .question').clone();
    questionDOM.find('.question-value').text(currentGroup.question);
    questionDOM.appendTo($('.group'));

    currentGroup.fields.forEach(function(field){
      // TODO : compute snippet/field
      if (field.type == 'button') {
        let fieldDOM = $('#clones [data-field-type="button"]').clone();
        fieldDOM.find('.field-value').text(field.value);
        fieldDOM.appendTo($('.group'));
      }
    });
    enableVote();
  }

  function disableVote() {
    $('.field').addClass('button-disabled');
  }

  function enableVote() {
    $('.field').removeClass('button-disabled');
  }
});
