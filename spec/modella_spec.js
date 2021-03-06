/*global modella,jasmine,describe,beforeEach,it,expect,spyOn*/
describe('Modella', function(){
    'use strict';

    var $modella;

    beforeEach(function(){
        $modella = new modella();
    });

    it('Should be an object', function(){
        expect(typeof $modella).toBe('object');
    });

    describe('createInstance', function(){

        it('should be a function', function(){
            expect(typeof $modella.createInstance).toBe('function');
        });

        it('should return an instance of a modella object', function(){
            var modellaInstance = $modella.createInstance();
            expect(modellaInstance instanceof window.modella).toBe(true);
        });

    });

    describe('init', function(){

        beforeEach(function(){
            $modella.modelConfig = {};
            $modella.modelConfig.service = {
                getByParentId: function(parentId, callback){
                    callback([
                        {},
                        {},
                        {}
                    ]);
                }
            };
        });

        it('should be a function', function(){
            expect(typeof $modella.init).toBe('function');
        });

        it('should call the passed callback', function(){
            var callback = jasmine.createSpy('passedCallback');

            $modella.init(callback);

            expect(callback).toHaveBeenCalled();
        });

        it('should call initByObject when configuration contains an initialObject', function(){
            var spyHandle = spyOn($modella, 'initByObject');

            $modella.modelConfig.initialObject = {};

            $modella.init();

            expect(spyHandle).toHaveBeenCalled();
        });

        it('should call initById when configuration contains an initialId', function(){
            var spyHandle = spyOn($modella, 'initById');
            $modella.modelConfig.initialId = '1234abc';

            $modella.init();

            expect(spyHandle).toHaveBeenCalled();
        });

        it('should call initByParentId when configuration contains an initialParentId', function(){
            var spyHandle = spyOn($modella, 'initByParentId');

            $modella.modelConfig.initialParentId = '1234';

            $modella.init();

            expect(spyHandle).toHaveBeenCalled();
        });

        it('should call initByQuery when configuration contains an initialQuery', function(){
            var spyHandle = spyOn($modella, 'initByQuery');

            $modella.modelConfig.initialQuery = 'query test';

            $modella.init();

            expect(spyHandle).toHaveBeenCalled();
        });

        it('should call initByIds when configuration contains initialIds', function(){
            var spyHandle = spyOn($modella, 'initByIds');

            $modella.modelConfig.initialIds = ['123'];

            $modella.init();

            expect(spyHandle).toHaveBeenCalled();
        });

        it('should call callback with null and an error if configuration has no initial values', function(){
            var callValues,
                callback = function(model, error){
                    callValues = [
                        model,
                        error instanceof Error
                    ];
                };

            $modella.init(callback);

            expect(JSON.stringify(callValues)).toBe(JSON.stringify([null, true]));
        });

    });

    describe('initById', function(){

        var afterGetTester;

        beforeEach(function(){
            afterGetTester = jasmine.createSpy('afterGet');

            $modella.modelConfig = {
                service: {
                    get: function(id, callback){
                        callback({});
                    }
                },
                initialId: '1234abc',
                afterGet: function(dataObj){
                    afterGetTester();
                    return dataObj;
                }
            };
        });

        it('should be a function', function(){
            expect(typeof $modella.initById).toBe('function');
        });

        it('should call service defined in config with passed id', function(){
            var spyHandle = spyOn($modella.modelConfig.service, 'get');

            $modella.initById('1234abc');

            expect(spyHandle).toHaveBeenCalled();
        });

        it('should call passed callback', function(){
            var passedCallback = jasmine.createSpy('passedCallback');

            $modella.initById('1234abc', passedCallback);

            expect(passedCallback).toHaveBeenCalled();
        });

        it('should call passed callback with an object if service succeeds', function(){
            var returnedValue,
                passedCallback = function(value){
                    returnedValue = value;
                };

            $modella.initById('1234abc', passedCallback);

            expect(typeof returnedValue).toBe('object');
        });

        it('should call passed callback with null and an error if service fails', function(){
            var passedCallback = jasmine.createSpy('passedCallback');

            $modella.modelConfig.service.get = function(id, callback){
                callback(null, 'This is an error');
            };

            $modella.initById('1234abc', passedCallback);

            expect(passedCallback).toHaveBeenCalledWith(null, 'This is an error');
        });

        it('should call initByObject on success', function(){
            $modella.initByObject = jasmine.createSpy('initByObject');

            $modella.initById('1234abc');

            expect($modella.initByObject).toHaveBeenCalled();
        });

        it('should call afterGet', function(){
            $modella.initById('1234abc');

            expect(afterGetTester).toHaveBeenCalled();
        });

    });

    describe('initByIds', function(){

        var idSet,
            afterGetTester;

        beforeEach(function(){
            afterGetTester = jasmine.createSpy('afterGet');

            $modella.modelConfig = {
                service: {
                    get: function(id, callback){
                        callback({});
                    }
                },
                afterGet: function(dataObj){
                    afterGetTester();
                    return dataObj;
                }
            };

            idSet = ['123', '234', '345'];

        });

        it('should be a function', function(){
            expect(typeof $modella.initByIds).toBe('function');
        });

        it('should call service.get for each record id', function(){
            var spyHandle = spyOn($modella.modelConfig.service, 'get');
            $modella.initByIds(idSet);

            expect(spyHandle.calls.count()).toBe(3);
        });

        it('should call passed callback once', function(){
            var passedCallback = jasmine.createSpy('passedCallback');

            $modella.initByIds(idSet, passedCallback);
        });

        it('should return an array of models', function(){
            var returnedValue,
                passedCallback = function(modelSet){
                    returnedValue = modelSet;
                }

            $modella.initByIds(idSet, passedCallback);

            expect(returnedValue.length).toBe(3);
        });

        it('should call with null and an error when the service fails', function(){
            var passedCallback = jasmine.createSpy('passedCallback');

            $modella.modelConfig.service.get = function(id, callback){
                callback(null, "This is an error.");
            };

            $modella.initByIds(idSet, passedCallback);

            expect(passedCallback).toHaveBeenCalledWith(null, "This is an error.");
        });

        it('should call initByObject for each record id', function(){
            var callTracker = jasmine.createSpy('callTracker');

            $modella.initByObject = function(object, callback){
                callTracker();
                callback(object);
            };

            $modella.initByIds(idSet);

            expect(callTracker.calls.count()).toBe(3);
        });

        it('should call afterGet three times', function(){
            $modella.initByIds(idSet);

            expect(afterGetTester.calls.count()).toBe(3);
        });

    });
    
    describe('initByParentId', function(){

        var afterGetTester;

        beforeEach(function(){
            afterGetTester = jasmine.createSpy('afterGet');

            $modella.modelConfig.service = {
                getByParentId: function(parentId, callback){
                    callback([
                        {},
                        {},
                        {}
                    ]);
                }
            }

            $modella.modelConfig.afterGet = function(dataObj){
                afterGetTester();
                return dataObj;
            }
        });

        it('should be a function', function(){
            expect(typeof $modella.initByParentId).toBe('function');
        });

        it('should call service.getByParentId', function(){

            var spyHandle = spyOn($modella.modelConfig.service, 'getByParentId');

            $modella.initByParentId('1234abc');

            expect(spyHandle).toHaveBeenCalled();

        });

        it('should call the passed callback', function(){
            var passedCallback = jasmine.createSpy('passedCallback');

            $modella.initByParentId('1234abc', passedCallback);

            expect(passedCallback).toHaveBeenCalled();
        });

        it('should call the passed callback with null and an error when the service fails', function(){
            var passedCallback = jasmine.createSpy('passedCallbcak');

            $modella.modelConfig.service.getByParentId = function(id, callback){
                callback(null, 'This is an error');
            }

            $modella.initByParentId('1234abc', passedCallback);

            expect(passedCallback).toHaveBeenCalledWith(null, 'This is an error');
        });

        it('should call initByObject 3 times when getByParentId returns a 3 element array', function(){
            var spyHandle = spyOn($modella, 'initByObject');

            $modella.initByParentId('1234abc');

            expect(spyHandle.calls.count()).toBe(3);
        });

        it("should return an array of 3 model objects", function(){
            var returnedValue,
                callback = function(modelSet){
                    returnedValue = modelSet;
                };

            $modella.initByParentId('1234abc', callback);

            expect(returnedValue.length).toBe(3);
        });

        it("should call afterGet 3 times", function(){
            $modella.initByParentId('1234abc');

            expect(afterGetTester.calls.count()).toBe(3);
        });

    });

    describe('initByObject', function(){

        it('should be a function', function(){
            expect(typeof $modella.initByObject).toBe('function');
        });

        it('should call the passed callback', function(){
            var callback = jasmine.createSpy('initCallback');

            $modella.initByObject({}, callback);

            expect(callback).toHaveBeenCalled();
        });

        it('should call the passed callback with an object', function(){
            var returnedValue,
                callback = function(model){
                    returnedValue = model;
                };

            $modella.initByObject({}, callback);

            expect(typeof returnedValue).toBe('object');
        });

        it('should call $modella.initModel', function(){
            var initModelSpy = spyOn($modella, 'initModel');

            $modella.initByObject({});

            expect(initModelSpy).toHaveBeenCalled();
        });

    });

    describe('initByQuery', function(){

        var afterGetTester;

        beforeEach(function(){
            afterGetTester = jasmine.createSpy('afterGet');

            $modella.modelConfig.service = {
                query: function(queryParams, callback){
                    callback([
                        {},
                        {},
                        {}
                    ]);
                }
            };

            $modella.modelConfig.afterGet = function(dataObj){
                afterGetTester();
                return dataObj;
            };
        });

        it('should be a function', function(){
            expect(typeof $modella.initByQuery).toBe('function');
        });

        it('should call service query', function(){
            var spyHandle = spyOn($modella.modelConfig.service, 'query');

            $modella.initByQuery('query');

            expect(spyHandle).toHaveBeenCalled();
        });

        it('should call the passed callback', function(){
            var callback = jasmine.createSpy('passedCallback');

            $modella.initByQuery("", callback);

            expect(callback).toHaveBeenCalled();
        });

        it('should call the passed callback with null and an error when the service fails', function(){
            var passedCallback = jasmine.createSpy('passedCallbcak');

            $modella.modelConfig.service.query = function(id, callback){
                callback(null, 'This is an error');
            }

            $modella.initByQuery('', passedCallback);

            expect(passedCallback).toHaveBeenCalledWith(null, 'This is an error');
        });

        it('should call initByObject 3 times when getByParentId returns a 3 element array', function(){
            var spyHandle = spyOn($modella, 'initByObject');

            $modella.initByQuery('1234abc');

            expect(spyHandle.calls.count()).toBe(3);
        });

        it("should return an array of 3 model objects", function(){
            var returnedValue,
                callback = function(modelSet){
                    returnedValue = modelSet;
                };

            $modella.initByQuery('', callback);

            expect(returnedValue.length).toBe(3);
        });

        it("should call afterGet 3 times", function(){
            $modella.initByQuery('');

            expect(afterGetTester.calls.count()).toBe(3);
        });

    });

    describe('initModel', function(){

        var returnedValue,
            callback;

        beforeEach(function(){

            $modella.modelConfig = {
                service: {
                    get: function(id, callback){
                        callback({});
                    },
                    post: function(object, callback){
                        callback({});
                    },
                    put: function(object, callback){
                        callback({});
                    },
                    del: function(object, callback){
                        callback({});
                    },
                    getByParentId: function(id, callback){
                        callback({});
                    }
                },
                customFunctions: {
                    testFxn1: function(){},
                    testFxn2: function(){},
                    testFxn3: "not a function"
                }
            };
            callback = function(model){
                returnedValue = model;
            };
        });

        it('should be a function', function(){
            expect(typeof $modella.initModel).toBe('function');
        });

        it('should call the passed callback', function(){
            var callback = jasmine.createSpy('passedCallback');

            $modella.initModel({}, callback);

            expect(callback).toHaveBeenCalled();
        });

        it('should call the passed callback with an object', function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue).toBe('object');
        });

        it('should return an object with a saveRecord function attached', function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue.saveRecord).toBe('function');
        });

        it('should return an object with a deleteRecord function attached', function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue.deleteRecord).toBe('function');
        });

        it('should return an object with a createRecord function attached', function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue.createRecord).toBe('function');
        });

        it('should return an object with a updateRecord function attached', function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue.updateRecord).toBe('function');
        });

        it('should append all custom functions to model', function(){
            var hasCustomFunctions = true;
            $modella.initModel({}, callback);

            hasCustomFunctions = (typeof returnedValue.testFxn1 !== 'function') ? false : hasCustomFunctions;
            hasCustomFunctions = (typeof returnedValue.testFxn2 !== 'function') ? false : hasCustomFunctions;

            expect(hasCustomFunctions).toBe(true);
        });

        it('should not append items in custom functions that are not functions', function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue.testFxn3).toBe('undefined');
        });
    });

});