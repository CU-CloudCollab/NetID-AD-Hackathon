const AWS = require('aws-sdk');
const redis = require('redis').createClient({
    host: 'netid-emplid.uqlz1q.0001.use1.cache.amazonaws.com'
});

module.exports.handler = function(event, context, cb) {
    const id = event.id;

    if (!id) {
        context.succeed({
            message: 'No id provided.'
        });
        return;
    }

    redis.get(id.trim().toLowerCase(), (err, data) => {
        if (err) {
            context.succeed({
                message: 'Error reading from database.'
            });
            return;
        }

        context.succeed({
            requestId: id,
            result: data
        });
    });
};
