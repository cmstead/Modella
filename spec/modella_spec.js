describe("Modella", function(){
    'use strict';

    var $modella;

    beforeEach(function(){
        $modella = window.modella;
    });

    it("Should be an object", function(){
        expect(typeof $modella).toBe('object');
    });

    describe("init", function(){

        it('should be a function', function(){
            expect(typeof $modella.init).toBe('function');
        });

        it('should call the passed callback', function(){
            var callback = jasmine.createSpy("passedCallback");

            $modella.init({}, callback);

            expect(callback).toHaveBeenCalled();
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