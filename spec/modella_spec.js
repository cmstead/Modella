describe("Modella", function(){
    'use strict';

    var $modella;

    beforeEach(function(){
        $modella = Object.create(window.modella);
    });

    it("Should be an object", function(){
        expect(typeof $modella).toBe('object');
    });

    describe("init", function(){

        beforeEach(function(){
            $modella.modelConfig = {};
        });

        it('should be a function', function(){
            expect(typeof $modella.init).toBe('function');
        });

        it('should call the passed callback', function(){
            var callback = jasmine.createSpy("passedCallback");

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

    describe("initByObject", function(){

        it("should be a function", function(){
            expect(typeof $modella.initByObject).toBe('function');
        });

        it("should call the passed callback", function(){
            var callback = jasmine.createSpy("initCallback");

            $modella.initByObject({}, callback);

            expect(callback).toHaveBeenCalled();
        });

        it("should call the passed callback with an object", function(){
            var returnedValue,
                callback = function(model){
                    returnedValue = model;
                };

            $modella.initByObject({}, callback);

            expect(typeof returnedValue).toBe('object');
        });

        it("should call $modella.initModel", function(){
            var initModelSpy = spyOn($modella, 'initModel');

            $modella.initByObject({});

            expect(initModelSpy).toHaveBeenCalled();
        });

    });

    describe("initModel", function(){

        var returnedValue,
            callback;

        beforeEach(function(){
            callback = function(model){
                returnedValue = model;
            }
        });

        it("should be a function", function(){
            expect(typeof $modella.initModel).toBe('function');
        });

        it("should call the passed callback", function(){
            var callback = jasmine.createSpy("passedCallback");

            $modella.initModel({}, callback);

            expect(callback).toHaveBeenCalled();
        });

        it("should call the passed callback with an object", function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue).toBe('object');
        });

        it("should return an object with a save function attached", function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue.save).toBe('function');
        });

        it("should return an object with a delete function attached", function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue.delete).toBe('function');
        });

        it("should return an object with a create function attached", function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue.create).toBe('function');
        })

        it("should return an object with a update function attached", function(){
            $modella.initModel({}, callback);

            expect(typeof returnedValue.update).toBe('function');
        })

    });

});