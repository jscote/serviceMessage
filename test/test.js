/**
 * Created by jean-sebastiencote on 1/24/15.
 */

var base = require('../index.js');

module.exports = {
    setUp: function (callback) {

        base.configure({
            messageCreatedHandler: function (message) {
                console.log('event created');
                console.log(message instanceof base.ServiceMessage);
                console.log(message.toJSON());

            },
            messageUpdatedHandler: function(message) {
                console.log('event updated');
            }
        });

        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    instantiate_serviceMessage_willtriggerevent: function (test) {

        var serviceMessage = new base.ServiceMessage();
        test.ok(true);
        test.done();
    },

    instantiate_serviceResponse_willtriggerevent: function (test) {

        var serviceResponse = new base.ServiceResponse();
        test.ok(true);
        test.done();
    },
    serviceResponse_update_willtriggerevent: function (test) {

        var serviceResponse = new base.ServiceResponse();
        serviceResponse.update();
        test.ok(true);
        test.done();
    }
};