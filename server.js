/*
@TODO :
- afficher la question dans chaque groupe
- distinguer les réponses multiples des réponses uniques
  => Pour l'instant c'est bloqué sur des réponses uniques
  Peut-être faut-il ajouter un paramètre sur la question pour déterminer si la réponse peut êêtre multiple ou pas.
- page récap des questions/réponses avec des stats ?
*/

const GLOBAL_CONFIG = require('./config/config.js');

const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const bodyParser = require('body-parser')

// the selected group of student (to be evaluated by peers)
// By default the first element of the list above.
let groupName = GLOBAL_CONFIG.studentsGroupList[0];

let userList = [];

let GROUPS = [];

getGroupsFromJson();

let currentGroup = [];
let responses = {groupId : 0, question : "", data : [] };
let respIndex = 0;

server.listen(3000);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/live', function (req, res) {
  res.render('live');
});

app.get('/admin', function (req, res) {
  res.render('admin', {
    groups: GROUPS,
    studentsGroupList: GLOBAL_CONFIG.studentsGroupList
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
  // keep this connection in a list
  userList.push(socket.id);

  socket.emit('toclient/set/group', {
    group: currentGroup
  });

  // Admin : send new group to client
  socket.on('admin/set/groupId', function (data) {
    // If there was responses sate to Json file
    if (responses.data.length > 0) {
      saveResponsesInJson();
    }

    setCurrentGroupByGroupId(data.groupId);

    responses = {groupId : currentGroup.id, question: currentGroup.question, data : [] };
    respIndex = 0;

    io.sockets.emit('toclient/set/group', {
      group: currentGroup
    });
    io.sockets.emit('tolive/set/group', {
      group: currentGroup
    });
  });

  // Setting group of students to be evaluated
  socket.on('admin/set/studentGroupName', function (data) {
    // If there was responses sate to Json file
    if (responses.data.length > 0) {
      saveResponsesInJson();
    }
    console.log("New project group set : ", data.groupName);
    groupName = data.groupName;
    // Clear clients when changing
    io.sockets.emit('toclient/clear');
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
    data.userId = socket.id;
    let alreadySent = responses.data.filter(r => r.userId == data.userId);
    // Only on vote per User.
    if ( alreadySent[0] == undefined ) {
      responses.data[respIndex] = data;
      respIndex++;
      io.sockets.emit('toadmin/userChoice', data);
      io.sockets.emit('tolive/userChoice', data);
    } 
    //else {
    //  console.log("This user has already voted !");
    //}
  });

});


function setCurrentGroupByGroupId(groupId) {
  GROUPS.forEach(group => {
    if (group.id == groupId) {
      currentGroup = group;
      return;
    }
  })
}

function getGroupsFromJson() {
  fs.readFile("data/groups.json", 'utf8', function (err, data) {
    if (err) {
      console.log("Error reading JSON file");
      return false;
    }

    data = JSON.parse(data);
    GROUPS = data.groups;
  });
}


function saveGroupsInJson() {
  let json = JSON.stringify({ "groups": GROUPS }, null, 2);

  fs.writeFile("data/groups.json", json, 'utf8', function (err) {
    if (err) {
      console.log("Error writing to JSON file");
      return console.log(err);
    }

    console.log("JSON saved.");
  });

}

function saveResponsesInJson() {
  let filename = "data/" + groupName + "-" + responses.groupId + ".json";
  let json = JSON.stringify(responses, null, 2);

  fs.writeFile(filename, json, 'utf8', function (err) {
    if (err) {
      console.log("Error writing to JSON file");
      return console.log(err);
    }

    console.log("JSON Responses saved for "+ responses.groupId +".");
  });

}
