#!/usr/bin/env node

function connectMessage(RoomId, message) {

    var amqp = require('amqplib/callback_api');
    var queue = RoomId;
    amqp.connect('amqp://localhost', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }

            channel.assertQueue(queue, {
                durable: false
            });
            channel.sendToQueue(queue, Buffer.from(message));

            channel.consume(queue, function (msg) {
                console.log(" [x] Received %s", msg.content.toString());
            }, {
                noAck: true
            });
        });
        setTimeout(function () {
            connection.close();
            process.exit(0);
        }, 500);
    });
}

module.exports = connectMessage