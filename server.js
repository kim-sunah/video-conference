const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require('fs');
const connectMessage = require('./rabbitmq/send');
server.listen(process.env.PORT || 8081);


app.use(express.static('public'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render('frontpage');
})

const { v4: uuidv4 } = require('uuid');
var un, pc;
app.get('/newroom', (req, res) => {
  un = req.query.username;
  pc = req.query.passcode;
  var roomId = uuidv4();
  fs.appendFileSync("public/meeting-log.txt", roomId + ":" + pc + "\n", "utf-8");
  res.redirect(`/${roomId}`);
})

var unJ, inJ, pcJ;
app.get('/joinroom', (req, res) => {
  unJ = req.query.username;
  inJ = req.query.invitation;
  pcJ = req.query.passcode;
  var log = fs.readFileSync("public/meeting-log.txt", "utf-8");
  var findInvitation = log.indexOf(inJ + ":" + pcJ);
  if (findInvitation != -1) {
    res.redirect(`/${inJ}`);
    un = unJ,
      pc = pcJ
  } else {
    var findInvitation = log.indexOf(inJ);
    if (findInvitation == -1) {
      res.send("Invalid invitation. Please <a href=/>go back</a>");
    } else {
      var findPassCode = log.indexOf(inJ + ":" + pcJ);
      if (findPassCode == -1) {
        res.send("Invalid password. Please <a href=/>go back</a>");
      }
    }
  }
});

app.get('/:room', (req, res) => {
  res.render('meeting-room', {
    roomId: req.params.room,
    username: un,
  });
})

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
app.use('/peerjs', peerServer);

const io = require('socket.io')(server);
io.on('connection', socket => {
  socket.on('join-room', (roomId, peerId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', peerId);

    socket.on('stop-screen-share', (peerId) => {
      io.to(roomId).emit('no-share', peerId);
    })

    socket.on('message', (message, sender, color, time) => {
      io.to(roomId).emit('createMessage', message, sender, color, time);

      connectMessage(roomId, JSON.stringify({
        message, sender, color, time
      }))
    })

    socket.on('leave-meeting', (peerId, peerName) => {
      io.to(roomId).emit('user-leave', peerId, peerName);
    })
  })
})

app.post('/upload', (req, res) => {
  const fileName = req.headers['file-name'];
  req.on('data', (chunk) => {
    fs.appendFileSync(__dirname + '/public/uploaded-files/' + fileName, chunk);
  })
  res.end('uploaded');
});

// let globalChannel
// const amqp = require('amqplib/callback_api');
// const queueName = 'pre_news'
// amqp.connect('amqp://localhost', function (error0, connection) {
//   if (error0) {
//     throw error0;
//   }
//   connection.createChannel(function (error1, channel) {
//     if (error1) {
//       throw error1;
//     }

//     channel.assertQueue(queueName, {
//       durable: false
//     });
//     globalChannel = channel
//   });
// });