/**
 * Created by jean-sebastiencote on 11/26/14.
 */

(function (util, EventEmitter, _) {

    'use strict';

    var internalConfig;

    var generateUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };


    var MessageBase = function MessageBase(options) {
        EventEmitter.call(this);
        options = options || {};
        var _id = generateUUID();
        Object.defineProperty(this, "id", {writable: true, value: _id});
        Object.defineProperty(this, "correlationId", {writable: true, value: options.correlationId || null});
        Object.defineProperty(this, "originalId", {writable: true, value: options.originalId || _id});
        Object.defineProperty(this, "timestamp", {
            writable: true,
            value: options.timestamp || new Date().toUTCString()
        });
        Object.defineProperty(this, "transactionTimestamp", {
            writable: true,
            value: options.transactionTimestamp || new Date().toUTCString()
        });
        Object.defineProperty(this, "originalTransactionTimestamp", {
            writable: true,
            value: options.originalTransactionTimestamp || new Date().toUTCString()
        });
        Object.defineProperty(this, "data", {writable: true, value: options.data || {}});
        Object.defineProperty(this, "identity", {writable: true, value: options.identity || null});

        this.listenToEvents();
    };

    MessageBase.config = function (config) {
        internalConfig = config;
    };

    util.inherits(MessageBase, EventEmitter);

    MessageBase.prototype.listenToEvents = function () {
        if (!_.isUndefined(internalConfig)) {
            if (!_.isUndefined(internalConfig.messageCreatedHandler) &&
                _.isFunction(internalConfig.messageCreatedHandler)) {
                this.on('message.created', function (args) {
                    process.nextTick(function () {
                        internalConfig.messageCreatedHandler(args);
                    });
                });
            }

            if (!_.isUndefined(internalConfig.messageUpdatedHandler) &&
                _.isFunction(internalConfig.messageUpdatedHandler)) {
                this.on('message.updated', function (args) {
                    process.nextTick(function () {
                        internalConfig.messageUpdatedHandler(args);
                    });
                });
            }

            if (!_.isUndefined(internalConfig.messageContextCreatedHandler) &&
                _.isFunction(internalConfig.messageContextCreatedHandler)) {
                this.on('message.context.created', function (args) {
                    process.nextTick(function () {
                        internalConfig.messageContextCreatedHandler(args);
                    });
                });
            }

            if (!_.isUndefined(internalConfig.messageContextUpdatedHandler) &&
                _.isFunction(internalConfig.messageContextUpdatedHandler)) {
                this.on('message.context.updated', function (args) {
                    process.nextTick(function () {
                        internalConfig.messageContextUpdatedHandler(args);
                    });
                });
            }
        }

    };

    MessageBase.prototype.update = function () {
        this.timestamp = new Date().toUTCString();
        this.emit('message.updated', this);
    };


    MessageBase.prototype.setCorrelationId = function () {
        this.correlationId = generateUUID();
    };

    MessageBase.prototype.toJSON = function () {
        return {
            id: this.id,
            correlationId: this.correlationId,
            data: this.data,
            identity: this.identity,
            originalId: this.originalId,
            timestamp: this.timestamp,
            transactionTimestamp: this.transactionTimestamp,
            originalTransactionTimestamp: this.originalTransactionTimestamp
        };
    };

    MessageBase.prototype.fromJSON = function (obj) {
        this.id = obj.id || this.id;
        this.correlationId = obj.correlationId || this.correlationId;
        this.data = obj.data || this.data;
        this.identity = obj.identity || this.identity;
        this.originalId = obj.originalId || this.originalId;
        this.timestamp = obj.timestamp || this.timestamp;
        this.transactionTimestamp = obj.transactionTimestamp || this.transactionTimestamp;
        this.originalTransactionTimestamp = obj.originalTransactionTimestamp || this.originalTransactionTimestamp;
    };


    var ServiceMessage = function ServiceMessage(options) {
        MessageBase.call(this, options);
        this.emit('message.created', this);
    };

    util.inherits(ServiceMessage, MessageBase);

    ServiceMessage.prototype.createServiceMessageFrom = function () {
        if (_.isUndefined(this.correlationId) || this.correlationId == null) {
            this.setCorrelationId();
        }
        return new ServiceMessage({
            correlationId: this.correlationId,
            identity: this.identity,
            data: this.data,
            originalId: this.originalId,
            originalTransactionTimestamp: this.originalTransactionTimestamp
        });
    };

    ServiceMessage.prototype.createServiceResponseFrom = function () {
        if (_.isUndefined(this.correlationId) || this.correlationId == null) {
            this.setCorrelationId();
        }
        return new ServiceResponse({
            correlationId: this.correlationId,
            identity: this.identity,
            data: this.data,
            originalId: this.originalId,
            originalTransactionTimestamp: this.originalTransactionTimestamp
        });
    };

    var ServiceResponse = function ServiceResponse(options) {
        MessageBase.call(this, options);
        Object.defineProperty(this, "isSuccess", {writable: true, value: true});
        Object.defineProperty(this, "errors", {writable: true, value: []});
        Object.defineProperty(this, "warnings", {writable: true, value: []});
        Object.defineProperty(this, "hasErrors", {
            get: function () {
                return this.errors.length > 0;
            }
        });
        Object.defineProperty(this, "hasWarnings", {
            get: function () {
                return this.warnings.length > 0;
            }
        });

        this.emit('message.created', this);

    };

    util.inherits(ServiceResponse, MessageBase);

    ServiceResponse.prototype.toJSON = function () {

        var data = null;
        if(_.isArray(this.data)) {
            data = [];
            this.data.forEach(function(item) {
                if(!_.isUndefined(item.toJSON)) {
                    data.push(item.toJSON());
                } else {
                    data.push(item);
                }
            });
        } else {
            if(!_.isUndefined(this.data.toJSON)) {
                data = this.data.toJSON();
            } else {
                data = this.data;
            }

        }

        return {
            id: this.id,
            correlationId: this.correlationId,
            data: data,
            identity: this.identity,
            isSuccess: this.isSuccess,
            errors: this.errors,
            originalId: this.originalId,
            timestamp: this.timestamp,
            transactionTimestamp: this.transactionTimestamp,
            originalTransactionTimestamp: this.originalTransactionTimestamp
        };
    };

    ServiceResponse.prototype.fromJSON = function (obj) {
        this.id = obj.id || this.id;
        this.correlationId = obj.correlationId || this.correlationId;
        this.data = obj.data || this.data;
        this.identity = obj.identity || this.identity;
        this.isSuccess = obj.isSuccess;
        this.errors = obj.errors || this.errors;
        this.originalId = obj.originalId || this.originalId;
        this.timestamp = obj.timestamp || this.timestamp;
        this.transactionTimestamp = obj.transactionTimestamp || this.transactionTimestamp;
        this.originalTransactionTimestamp = obj.originalTransactionTimestamp || this.originalTransactionTimestamp;

    };

    ServiceResponse.prototype.addError = function (error) {
        if(_.isUndefined(error) || _.isNull(error)) return;
        this.errors.push(error);
        this.isSuccess = false;
    };

    ServiceResponse.prototype.addWarning = function (warning) {
        if(_.isUndefined(warning) || _.isNull(warning)) return;
        this.warnings.push(warning);
    };

    ServiceResponse.prototype.createMessageContext = function (isCompleted) {
        if (_.isUndefined(this.correlationId) || this.correlationId == null) {
            this.setCorrelationId();
        }
        return new MessageContext({
            id: this.originalId, //Make sure the id of the message is equal to the original id so we keep track of only one message context per original id
            originalId: this.originalId,
            correlationId: this.correlationId,
            errors: this.errors,
            warnings: this.warnings,
            isCompleted: _.isUndefined(isCompleted) ? false : _.isBoolean(isCompleted) ? isCompleted : false
        });
    };

    ServiceResponse.prototype.createServiceMessageFrom = function () {
        if (_.isUndefined(this.correlationId) || this.correlationId == null) {
            this.setCorrelationId();
        }
        return new ServiceMessage({
            correlationId: this.correlationId,
            identity: this.identity,
            data: this.data,
            originalId: this.originalId,
            originalTransactionTimestamp: this.originalTransactionTimestamp
        });
    };




    var MessageContext = function MessageContext(options) {
        options = options || {};
        ServiceResponse.call(this, options);
        var optCompleted = _.isUndefined(options.isCompleted) ? false : options.isCompleted;
        var isCompleted = _.isBoolean(optCompleted) ? optCompleted : false;
        Object.defineProperty(this, "isCompleted", {writable: true, value: isCompleted});
        this.emit('message.context.created', this);
    };

    util.inherits(MessageContext, ServiceResponse);

    MessageContext.prototype.update = function () {
        this.emit('message.context.updated', this);
    };

    MessageContext.prototype.toJSON = function () {
        return {
            id: this.id,
            correlationId: this.correlationId,
            isCompleted: this.isCompleted,
            errors: this.errors,
            warnings: this.warnings,
            isSuccess: this.isSuccess,
            originalId: this.originalId,
            timestamp: this.timestamp,
            transactionTimestamp: this.transactionTimestamp,
            originalTransactionTimestamp: this.originalTransactionTimestamp
        };
    };

    MessageContext.prototype.fromJSON = function (obj) {
        this.id = obj.id || this.id;
        this.correlationId = obj.correlationId || this.correlationId;
        this.isCompleted = obj.isCompleted || this.isCompleted;
        this.errors = obj.errors || this.errors;
        this.warnings = obj.warnings || this.warnings;
        this.isSuccess = obj.isSuccess || this.isSuccess;
        this.originalId = obj.originalId || this.originalId;
        this.timestamp = obj.timestamp || this.timestamp;
        this.transactionTimestamp = obj.transactionTimestamp || this.transactionTimestamp;
        this.originalTransactionTimestamp = obj.originalTransactionTimestamp || this.originalTransactionTimestamp;
    };

    module.exports.ServiceMessage = ServiceMessage;
    module.exports.ServiceResponse = ServiceResponse;
    module.exports.MessageContext = MessageContext;
    module.exports.configure = MessageBase.config;

})(require('util'), require('events').EventEmitter, require('lodash'));