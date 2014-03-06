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

        beforeEach(function(){
            $modella.modelConfig = {
                service: {
                    get: function(id, callback){
                        callback({});
                    }
                },
                initialId: '1234abc'
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

    });

    describe('initByIds', function(){

        var idSet;

        beforeEach(function(){
            $modella.modelConfig = {
                service: {
                    get: function(id, callback){
                        callback({});
                    }
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

    });
    
    describe('initByParentId', function(){

        beforeEach(function(){
            $modella.modelConfig.service = {
                getByParentId: function(parentId, callback){
                    callback([
                        {},
                        {},
                        {}
                    ]);
                }
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

    describe('initModel', function(){

        var returnedValue,
            callback;

        beforeEach(function(){
            callback = function(model){
                returnedValue = model;
            }
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
        })

        it('should return an object with a updateRecord function attached', function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue.updateRecord).toBe('function');
        })

    });

});

describe('Modella returned object', function(){
    var $modella,
        dataService,
        configAttributes;

    beforeEach(function(){

        dataService = {
            post: jasmine.createSpy("service.post"),
            put: jasmine.createSpy("service.put"),
            delete: jasmine.createSpy("service.delete")
        };

        configAttributes = {
            beforeSave: jasmine.createSpy("beforeSave"),
            beforeCreate: jasmine.createSpy("beforeCreate"),
            beforeUpdate: jasmine.createSpy("beforeUpdate"),
            beforeDelete: jasmine.createSpy("beforeDelete")
        };

        $modella = new modella();

    });

    describe("model.createRecord", function(){

        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {},
                service: dataService,
                beforeCreate: configAttributes.beforeCreate
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model, error){
                $model = model;
            });
        });

        it('should call service.post', function(){
            $model.createRecord();

            expect(dataService.post).toHaveBeenCalled();
        });

        it('should call beforeCreate', function(){
            $model.createRecord();

            expect(configAttributes.beforeCreate).toHaveBeenCalled();
        });

    });

    describe("model.updateRecord", function(){

        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {},
                service: dataService,
                beforeUpdate: configAttributes.beforeUpdate
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model, error){
                $model = model;
            });
        });

        it('should call service.put', function(){
            $model.updateRecord();

            expect(dataService.put).toHaveBeenCalled();
        });

        it('should call beforeUpdate', function(){
            $model.updateRecord();

            expect(configAttributes.beforeUpdate).toHaveBeenCalled();
        });


    });

    describe("model.deleteRecord", function(){

        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {},
                service: dataService,
                beforeDelete: configAttributes.beforeDelete
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model, error){
                $model = model;
            });
        });

        it('should call service.delete', function(){
            $model.deleteRecord();

            expect(dataService.delete).toHaveBeenCalled();
        });

        it('should call beforeDelete', function(){
            $model.deleteRecord();

            expect(configAttributes.beforeDelete).toHaveBeenCalled();
        });


    });

    describe("model.saveRecord", function(){

        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {},
                service: dataService
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model, error){
                $model = model;
            });

            $model.createRecord = jasmine.createSpy("createRecord");
            $model.updateRecord = jasmine.createSpy("updateRecord");
        });

        it('should call createRecord if no id exists', function(){
            $model.saveRecord();

            expect($model.createRecord).toHaveBeenCalled();
        });

        it('should call updateRecord if id exists', function(){
            $model.id = "1234";
            $model.saveRecord();

            expect($model.updateRecord).toHaveBeenCalled();
        });

    });

    describe("model.revise", function(){

        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {
                    test1: "test 1",
                    test2: "test 2",
                    test3: "test 3"
                },
                service: dataService
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model){
                $model = model;
            });

        });

        it('should be a function', function(){
            expect(typeof $model.revise).toBe('function');
        });

        it('should update values in the model based on passed object', function(){
            var updateObject = {
                    test1: "test value 1",
                    test3: "test value 3"
                },
                finalStr;

            $model.revise(updateObject);

            finalStr = $model.test1 + ", " + $model.test3;

            expect(finalStr).toBe("test value 1, test value 3");
        });

        it('should not update the function values', function(){
            var updateObj = { saveRecord: 'test' };
            $model.revise(updateObj);

            expect(typeof $model.saveRecord).toBe('function');
        });

    });

    describe('model.copy', function(){
        var $localModella,
            $model;

        beforeEach(function(){
            var modelConfig = {
                initialObject: {
                    test1: "test 1",
                    test2: "test 2",
                    test3: "test 3"
                },
                service: dataService
            };

            $localModella = $modella.createInstance(modelConfig);

            $localModella.init(function(model){
                $model = model;
            });

        });

        it('should be a function', function(){
            expect(typeof $model.copy).toBe('function');
        });

        it('should return an object matching the stringified original model', function(){
            var returnedValue = $model.copy();

            expect(JSON.stringify($model)).toBe(JSON.stringify(returnedValue));
        });

        it('should return an object with no functions attached', function(){
            var returnedValue = $model.copy(),
                hasFunction = false;

            for(var key in returnedValue){
                if(typeof returnedValue[key] === 'function'){
                    hasFunction = true;
                }
            }

            expect(hasFunction).toBe(false);
        });
    });

});