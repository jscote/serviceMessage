/**
 * Created by jean-sebastiencote on 1/24/15.
 */

var base = require('../index.js');

module.exports = {
    setUp: function (callback) {


        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    instantiate_serviceMessage_willtriggerevent: function (test) {
        var isOk = false;
        base.configure({
            messageCreatedHandler: function (message) {
                isOk = true;

            },
            messageUpdatedHandler: function (message) {
            }
        });

        var serviceMessage = new base.ServiceMessage();
        process.nextTick(function () {
            test.ok(isOk);
            test.done();
        });
    },

    instantiate_serviceResponse_willtriggerevent: function (test) {
        var isOk = false;
        base.configure({
            messageCreatedHandler: function (message) {
                isOk = true;

            },
            messageUpdatedHandler: function (message) {
            }
        });
        var serviceResponse = new base.ServiceResponse();
        process.nextTick(function () {
            test.ok(isOk);
            test.done();
        });

    },
    serviceResponse_update_willtriggerevent: function (test) {
        var isOk = false;
        base.configure({
            messageCreatedHandler: function (message) {
            },
            messageUpdatedHandler: function (message) {
                isOk = true;

            }
        });
        var serviceResponse = new base.ServiceResponse();
        serviceResponse.update();
        process.nextTick(function () {
            test.ok(isOk);
            test.done();
        });
    },
    serviceResponse_createdFromServiceMessage_willTriggerEvent: function (test) {
        var isOk = false;
        base.configure({
            messageCreatedHandler: function (message) {
                if(message instanceof base.ServiceResponse) {
                    isOk = true;
                }
            },
            messageUpdatedHandler: function (message) {

            }
        });
        var msg = new base.ServiceMessage();
        msg.createServiceResponseFrom();
        process.nextTick(function () {
            test.ok(isOk);
            test.done();
        });
    },
    serviceMessage_instantiate_hasAnId: function (test) {
        var msg = new base.ServiceMessage();
        test.ok(msg.id != null);
        test.done();
    },
    serviceResponse_instantiate_hasAnId: function (test) {
        var msg = new base.ServiceResponse();
        test.ok(msg.id != null);
        test.done();
    },
    serviceMessage_instantiate_hasOriginalIdEqualsToIdWhenNotProvided: function (test) {
        var msg = new base.ServiceMessage();
        test.ok(msg.id != null);
        test.ok(msg.originalId != null);
        test.ok(msg.id === msg.originalId);
        test.done();
    },
    serviceMessage_instantiate_hasOriginalIdDifferentThenIdWhenProvided: function (test) {
        var msg = new base.ServiceMessage({originalId: 'testId'});
        test.ok(msg.id != null);
        test.ok(msg.originalId != null);
        test.ok(msg.id !== msg.originalId);
        test.ok(msg.originalId === 'testId');
        test.done();
    },
    serviceMessage_toJSON_worksOk: function (test) {
        var msg = new base.ServiceMessage({data: 'testData', identity: {user: 1}});
        msg.setCorrelationId();
        var obj = msg.toJSON();
        test.ok(obj.id == msg.id);
        test.ok(obj.identity.user == msg.identity.user);
        test.ok(obj.data == msg.data);
        test.ok(obj.correlationId == msg.correlationId);

        test.done();
    },
    serviceMessage_fromJSON_worksOk: function (test) {
        var msg = new base.ServiceMessage();
        var obj = {id: 'id', data: 'data', correlationId: 'correlationId', identity: {user: 1}};

        msg.fromJSON(obj);
        test.ok(obj.id == msg.id);
        test.ok(obj.identity.user == msg.identity.user);
        test.ok(obj.data == msg.data);
        test.ok(obj.correlationId == msg.correlationId);

        test.done();
    },
    serviceMessage_createMessageFrom_returnsProperMessage: function (test) {
        var msg = new base.ServiceMessage({data: 'testData', identity: {user: 1}});
        var obj = msg.createServiceMessageFrom();

        test.ok(obj.id != msg.id);
        test.ok(obj.identity.user == msg.identity.user);
        test.ok(obj.data == msg.data);
        test.ok(obj.correlationId == msg.correlationId);
        test.ok(obj.originalId == msg.id);
        test.ok(obj.correlationId !== null);
        test.ok(obj.originalTransactionTimestamp == msg.originalTransactionTimestamp);
        test.ok(obj.originalTransactionTimestamp == msg.transactionTimestamp);

        test.ok(obj instanceof base.ServiceMessage);

        test.done();
    },
    serviceMessage_createResponseFrom_returnsProperMessage: function (test) {
        var msg = new base.ServiceMessage({data: 'testData', identity: {user: 1}});
        var obj = msg.createServiceResponseFrom();

        test.ok(obj.id != msg.id);
        test.ok(obj.identity.user == msg.identity.user);
        test.ok(obj.data == msg.data);
        test.ok(obj.correlationId == msg.correlationId);
        test.ok(obj.originalId == msg.id);
        test.ok(obj.correlationId !== null);
        test.ok(obj.originalTransactionTimestamp == msg.originalTransactionTimestamp);
        test.ok(obj.originalTransactionTimestamp == msg.transactionTimestamp);

        test.ok(obj instanceof base.ServiceResponse);

        test.done();
    },
    serviceMessage_createServiceAndResponseFromMultipleTimes_keepsOriginalId: function (test) {
        var msg = new base.ServiceMessage({data: 'testData', identity: {user: 1}});
        var obj = msg.createServiceMessageFrom();
        obj = obj.createServiceResponseFrom();

        test.ok(obj.id != msg.id);
        test.ok(obj.identity.user == msg.identity.user);
        test.ok(obj.data == msg.data);
        test.ok(obj.correlationId == msg.correlationId);
        test.ok(obj.originalId == msg.id);
        test.ok(obj.correlationId !== null);

        test.ok(obj.originalTransactionTimestamp == msg.originalTransactionTimestamp);
        test.ok(obj.originalTransactionTimestamp == msg.transactionTimestamp);

        test.ok(obj instanceof base.ServiceResponse);

        test.done();
    },
    serviceResponse_addError_setsIsSuccessToFalse: function (test) {
        var msg = new base.ServiceResponse();
        msg.addError("some error");

        test.ok(msg.isSuccess == false);
        test.ok(msg.errors.length > 0);
        test.ok(msg.warnings.length == 0);
        test.ok(!msg.hasWarnings);
        test.ok(msg.hasErrors);
        test.done();
    },
    serviceResponse_addWarning_setsHasWarningsToTrue: function (test) {
        var msg = new base.ServiceResponse();
        msg.addWarning("some warning");

        test.ok(msg.isSuccess == true);
        test.ok(msg.errors.length == 0);
        test.ok(msg.warnings.length > 0);
        test.ok(msg.hasWarnings);
        test.ok(!msg.hasErrors);


        test.done();
    },
    messageContext_instantiate_willTriggerEvent: function(test) {
        var isOk = false;
        base.configure({
            messageCreatedHandler: function (message) {
            },
            messageUpdatedHandler: function (message) {
            },
            messageContextCreatedHandler: function(message) {
                isOk = true;
            }
        });

        var msgCtx = new base.MessageContext();
        process.nextTick(function () {
            test.ok(isOk);
            test.done();
        });
    },
    messageContext_fromServiceResponse_willTriggerEvent: function(test) {
        var isOk = false;
        base.configure({
            messageCreatedHandler: function (message) {
            },
            messageUpdatedHandler: function (message) {
            },
            messageContextCreatedHandler: function(message) {
                isOk = true;
            }
        });

        var msg = new base.ServiceResponse();
        var msgCtx = msg.createMessageContext(true);
        test.ok(msgCtx.isCompleted, "ctx should be completed");
        test.ok(msg.originalId == msgCtx.originalId);
        test.ok(msg.correlationId == msgCtx.correlationId);
        process.nextTick(function () {
            test.ok(isOk, 'should trigger event');
            test.done();
        });
    },
    messageContext_whenUpdated_willTriggerEvent: function(test) {
        var isOk = false;
        base.configure({
            messageCreatedHandler: function (message) {
            },
            messageUpdatedHandler: function (message) {
            },
            messageContextCreatedHandler: function(message) {
            },
            messageContextUpdatedHandler: function(message) {
                isOk = true;
            }
        });

        var msg = new base.ServiceResponse();
        var msgCtx = msg.createMessageContext(true);
        msgCtx.update();
        process.nextTick(function () {
            test.ok(isOk, 'should trigger event');
            test.done();
        });
    }
};
