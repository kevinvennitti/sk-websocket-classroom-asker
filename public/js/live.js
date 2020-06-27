$(function(){

  // For live streaming without admin UI (/live)
  socket.on('tolive/set/group', function(data) {
    group = data.group;
    addLogGroupFromJSON(group);
  });

  socket.on('tolive/userChoice', function(data) {
    const value = data.value;
    const pseudo = data.pseudo;

    const logGroup = $('.log-group').first();

    logGroup.find('.log-group-content').prepend($('<div class="log"><div class="log-pseudo">'+pseudo+'</div><div class="log-value">'+value+'</div></div>'));
    logGroup.find('.log-group-header-field[data-field-value="'+value+'"] .log-group-header-field-count')
      .text(parseInt(logGroup.find('.log-group-header-field[data-field-value="'+value+'"] .log-group-header-field-count').text())+1);
  });

// The same function as above, but working with a JSON object, not a DOM
// This is for /live UI.
function addLogGroupFromJSON(group) {
  let logGroup = $('<div class="log-group"></div>');
  let logGroupHeader = $('<div class="log-group-header"></div>');
  
  group.fields.forEach(function(field){
    let value = field.value.trim();

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
});