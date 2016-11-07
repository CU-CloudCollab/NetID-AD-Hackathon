const AWS = require('aws-sdk');
const csv = require('csv');
const redis = require('redis').createClient({
    host: 'netid-emplid.uqlz1q.0001.use1.cache.amazonaws.com'
});
const s3 = new AWS.S3();

module.exports.handler = function(event, context, cb) {
    const params = {
        Bucket: 'cu-hackathon-data',
        Key: 'emplid-netid/emplid-netid-short.csv'
    };

    // Get file from S3
    console.log('Getting file from S3');
    s3.getObject(params).promise().then((file) => {
        console.log('GOT FILE.');
        return new Promise((resolve, reject) => {
            console.log('I made a promise!');
            csv.parse(file.Body, (err, data) => {
                if (err) {
                    console.log('There was an error parsing the CSV');
                    reject(err);
                }

                console.log('Successfully parsed CSV');

                resolve(data);
            });
        });
    }).then((data) => {
        console.log('Finished with CSV');
        // Don't really need headers, unshift off of array
        const headers = data.unshift();

        // Clear the cache
        console.log('Clearing Redis Cache');

        return new Promise((resolve, reject) => {
            redis.send_command('FLUSHALL', (err, response) => {
                if (err) {
                    reject(err);
                }

                resolve(response);
            })
        }).then(() => {
            return data;
        });
    }).then((data) => {
        // for each entry, set a row
        console.log('Mapping CSV rows into Redis');
        const promises = data.map((datum) => {
            return Promise.all([
                new Promise((resolve, reject) => {
                    redis.set(datum, (err, resp) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(resp);
                    })
                }),
                new Promise((resolve, reject) => {
                    redis.set(datum.reverse(), (err, resp) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(resp);
                    })
                })
            ]);
        });

        return Promise.all(promises);
    }).then((data) => {
        console.log('ALL DONE. MAGIC.');
        context.succeed();
    }).catch((error) => {
        console.log('SOMETHING WENT WRONG.', error);
        context.fail();
        process.exit(1);
    });
};
