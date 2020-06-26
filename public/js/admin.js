$(function(){

  socket.on('toadmin/userChoice', function(data) {
    const value = data.value;
    const pseudo = data.pseudo;

    const logGroup = $('.log-group').first();

    logGroup.find('.log-group-content').prepend($('<div class="log"><div class="log-pseudo">'+pseudo+'</div><div class="log-value">'+value+'</div></div>'));
    logGroup.find('.log-group-header-field[data-field-value="'+value+'"] .log-group-header-field-count')
      .text(parseInt(logGroup.find('.log-group-header-field[data-field-value="'+value+'"] .log-group-header-field-count').text())+1);
  });

  $('[data-emit]').click(function(){
    const emit = $(this).data('emit');
    const prop = $(this).data('prop') || null;
    const value = $(this).data('value') || null;

    socket.emit('admin/'+emit, {
      [prop]: value
    });
  });

  $(document).on('click', '[data-add-group]', function(){
    const newGroup = {
      id: Date.now(),
      fields: [
        { type: "button", value: "Encore ?!" },
        { type: "button", value: "Eh oui…!" }
      ]
    };

    addGroup(newGroup);
  });

  $(document).on('click', '[data-save-groups]', function(){
    saveAllGroups();
  });

  $(document).on('click', '[data-send-group]', function(){
    const group = $(this).closest('.group-container').find('.group');

    saveAllGroups();
    sendGroup(group);
    addLogGroup(group);
  });

  $(document).on('blur', '[contenteditable]', function(){
    saveAllGroups();
  });

  $(document).on('click', '[data-add-field]', function(){
    const group = $(this).closest('.group-container').find('.group');
    const field = { type: "button", value: ""};

    addFieldToGroup(field, group);
  });

  $(document).on('click', '.field-remove', function(){
    const field = $(this).closest('.field');
    field.remove();

    saveAllGroups();
  });

  $(document).on('click', '.group-remove', function(){
    const group = $(this).closest('.group-container');
    group.remove();

    saveAllGroups();
  });
});





function addLogGroup(group) {
  let logGroup = $('<div class="log-group"></div>');
  let logGroupHeader = $('<div class="log-group-header"></div>');

  group.find('.field').each(function(){
    let value = $(this).find('.field-value').text().trim();

    let logGroupHeaderField = $('<div class="log-group-header-field" data-field-value="'+value+'"></div>');
    let logGroupHeaderFieldValue = $('<div class="log-group-header-field-value">'+value+'</div>');
    let logGroupHeaderFieldCount = $('<div class="log-group-header-field-count">0</div>');

    logGroupHeaderField.append(logGroupHeaderFieldValue);
    logGroupHeaderField.append(logGroupHeaderFieldCount);
    logGroupHeader.append(logGroupHeaderField);
  });

  logGroup.append(logGroupHeader);

  let logGroupContent = $('<div class="log-group-content"></div>');
  logGroup.append(logGroupContent);

  $('.logs').prepend(logGroup);
}

function addGroup(group) {
  $.ajax({
    type: "POST",
    url: '/snippet/group',
    data: {
      data: {
        group: group
      }
    },
    success: function(groupDOM){
      groupDOM = $(groupDOM);

      groupDOM.insertBefore($('.slide-add-group'));
      groupDOM.find('.field:eq(0) .field-value').focus();
    }
  });
}


function addFieldToGroup(field, group) {
  $.ajax({
    type: "POST",
    url: '/snippet/field',
    data: {
      data: {
        field: field
      }
    },
    success: function(fieldDOM){
      fieldDOM = $(fieldDOM);
      fieldDOM.appendTo(group);
      fieldDOM.find('.field-value').focus();
    }
  });
}


function sendGroup(group) {
  const groupId = group.data('group-id');

  socket.emit('admin/set/groupId', {
    groupId: groupId
  });

  $('[data-send-group]').removeClass('is-current');
  $("#diff_"+groupId).addClass('is-current');
}









function saveAllGroups() {
  const groups = $('[data-content-scope] .group');

  let groupsData = [];

  groups.each(function(){
    const group = $(this);
    const fields = group.find('.field');

    let groupData = {
      id: group.data('group-id'),
      fields: []
    };

    fields.each(function(){
      let data = {};

      const field = $(this);

      data.type = field.data('field-type');
      data.value = field.find('.field-value').text().trim();

      console.log(data);

      groupData.fields.push(data);
    });

    groupsData.push(groupData);
  });

  console.log(groupsData);

  socket.emit('admin/saveAllGroups', {
    groups: groupsData
  });
}
