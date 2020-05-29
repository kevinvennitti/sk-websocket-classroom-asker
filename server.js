const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const bodyParser = require('body-parser')

let GROUPS = [];

getGroupsFromJson();

let currentGroup = [];

server.listen(3000);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));




app.get('/', function (req, res) {
  res.render('index');
});

app.get('/admin', function (req, res) {
  res.render('admin', {
    groups: GROUPS
  });
});

app.post('/snippet/group', function (req, res) {
  var data = req.body.data;
  res.render('snippets/group', data);
});

app.post('/snippet/field', function (req, res) {
  var data = req.body.data;
  res.render('snippets/field', data);
});



io.on('connection', function (socket) {
  console.log('New client connected', socket.id);
  console.log(currentGroup);

  socket.emit('toclient/set/group', {
    group: currentGroup
  });

  // Admin : send new group to client
  socket.on('admin/set/groupId', function (data) {
    console.log(data);

    setCurrentGroupByGroupId(data.groupId);

    console.log(currentGroup);

    io.sockets.emit('toclient/set/group', {
      group: currentGroup
    })
  });

  // Admin : refresh client
  socket.on('admin/client/refresh', function (data) {
    io.sockets.emit('toclient/refresh');
  });

  // Admin : clear client
  socket.on('admin/client/clear', function (data) {
    io.sockets.emit('toclient/clear');
  });

  // Admin : save groups
  socket.on('admin/saveAllGroups', function (data) {
    GROUPS = data.groups;
    saveGroupsInJson();
  });

  // Client : user choice
  socket.on('toserver/userChoice', function (data) {
    io.sockets.emit('toadmin/userChoice', data);
  });
});


function setCurrentGroupByGroupId(groupId) {
  GROUPS.forEach(group => {
    console.log(group);
    if (group.id == groupId) {
      currentGroup = group;
      return;
    }
  })
}



// setTimeout(function(){
//   saveGroupsInJson();
// }, 15000);





function getGroupsFromJson() {
  fs.readFile("data/groups.json", 'utf8', function (err, data) {
    if (err) {
      console.log("Error reading JSON file");
      return false;
    }

    data = JSON.parse(data);
    console.log(data);

    GROUPS = data.groups;
  });
}



function saveGroupsInJson() {
  let json = JSON.stringify({ "groups": GROUPS }, null, 2);

  console.log(json);

  fs.writeFile("data/groups.json", json, 'utf8', function (err) {
    if (err) {
      console.log("Error writing to JSON file");
      return console.log(err);
    }

    console.log("JSON saved.");
  });

}
