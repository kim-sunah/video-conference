let globalChannel;
const amqp = require('amqplib/callback_api');
const queueName = 'pre_news'

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
        exportChannel = channel;

        crawlingByNewsHome();
    });
    setTimeout(function () {
        connection.close();
        process.exit(0);
    }, 1000 * 30);
});
