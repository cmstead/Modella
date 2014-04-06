/*global jasmine,describe,it,expect,modella*/

describe('modella.extension', function(){
    'use strict';

    it('should exist on the window', function(){
        expect(typeof window.modella.extension).toBe('object');
    });

    describe('getRelativesList', function(){

        it('should be a function', function(){
            expect(typeof modella.extension.getRelativesList).toBe('function');
        });

        it('should return an object', function(){
            var returnedValue = modella.extension.getRelativesList({});

            expect(typeof returnedValue).toBe('object');
        });

        it('should return an array containing a list of all parents', function(){
            var model = {
                    parents: [
                        { name: "parent1" },
                        { name: "parent2" }
                    ]
                },
                expectedValue = {
                    "parent1": "parent",
                    "parent2": "parent"
                },
                returnedValue = modella.extension.getRelativesList(model);

            expect(JSON.stringify(returnedValue)).toBe(JSON.stringify(expectedValue));
        });

        it('should return an array containing a list of all children', function(){
            var model = {
                    children: [
                        { name: "child1" },
                        { name: "child2" }
                    ]
                },
                expectedValue = {
                    "child1": "child",
                    "child2": "child"
                },
                returnedValue = modella.extension.getRelativesList(model);

            expect(JSON.stringify(returnedValue)).toBe(JSON.stringify(expectedValue));
        });

    });

    describe('appendSet', function(){

        it('should be a function', function(){
            expect(typeof modella.extension.appendSet).toBe('function');
        });

        it('should return the original set if no other set is passed', function(){
            var originalSet = {
                    item1: 'item1',
                    item2: 'item2'
                },
                returnedSet = modella.extension.appendSet(originalSet);

            expect(JSON.stringify(returnedSet)).toBe(JSON.stringify(originalSet));
        });

        it('should return set with original items and appended new items when a new set is passed', function(){
            var originalSet = {
                    item1: 'item1',
                    item2: 'item2'
                },
                newSet = {
                    item3: 'item3',
                    item4: 'item4'
                },
                expectedSet = {
                    item1: 'item1',
                    item2: 'item2',
                    item3: 'item3',
                    item4: 'item4'
                },
                returnedSet = modella.extension.appendSet(originalSet, newSet);

            expect(JSON.stringify(returnedSet)).toBe(JSON.stringify(expectedSet));
        });

    });

    describe('findRecordById', function(){

        it('should be a function', function(){
            expect(typeof modella.extension.findRecordById).toBe('function');
        });

        it('should return null if record is not found', function(){
            var returnedValue = modella.extension.findRecordById({}, '');

            expect(returnedValue).toBe(null);
        });

        it('should return a matching record if record exists', function(){
            var testData = [
                    {
                        id: '1',
                        value: 'test1'
                    },
                    {
                        id: '2',
                        value: 'test2'
                    },
                    {
                        id: '3',
                        value: 'test3'
                    },
                ],
                returnedRecord = modella.extension.findRecordById(testData, '2');

            expect(returnedRecord.value).toBe('test2');
        });

    });

    describe('buildDataAppender', function(){

        it('should be a function', function(){
            expect(typeof modella.extension.buildDataAppender).toBe('function');
        });

        it('should return a function', function(){
            var returnedValue = modella.extension.buildDataAppender({}, '');

            expect(typeof returnedValue).toBe('function');
        });

        it('should return a function that updates key in passed object with new data', function(){
            var testObject = {},
                expectedResult = {
                    test: "testData"
                },
                returnedFunction = modella.extension.buildDataAppender(testObject, "test");

            returnedFunction("testData");

            expect(JSON.stringify(testObject)).toBe(JSON.stringify(expectedResult));
        });

        it('should return a function that does not update data object when new data is null', function(){
            var testObject = {
                    test: 'testData'
                },
                expectedResult = {
                    test: "testData"
                },
                returnedFunction = modella.extension.buildDataAppender(testObject, "test");

            returnedFunction(null);

            expect(JSON.stringify(testObject)).toBe(JSON.stringify(expectedResult));
        });

        it('should return a function that calls the passed callback', function(){
            var testObject = {},
                callback = jasmine.createSpy('passedCallback'),
                returnedFunction = modella.extension.buildDataAppender(testObject, '', callback);

            returnedFunction(null, {});

            expect(callback).toHaveBeenCalled();
        });
    });

    describe('verifyObjectIsValid', function(){

        it('should be a function', function(){
            expect(typeof modella.extension.verifyObjectIsValid).toBe('function');
        });

        it('should return true if object exists', function(){
            var returnedValue = modella.extension.verifyObjectIsValid({});

            expect(returnedValue).toBe(true);
        });

        it('should return false if object is an array and the array contains no elements', function(){
            var dataObject = [],
                returnedValue = modella.extension.verifyObjectIsValid(dataObject);

            expect(returnedValue).toBe(false);
        });

    });

    describe('buildSafeObject', function(){

        it('should be a function', function(){
            expect(typeof modella.extension.buildSafeObject).toBe('function');
        });

        it('should return an object that matches the signature of the passed object', function(){
            var originalObject = {
                    property1: "property1",
                    property2: {}
                },
                returnedObject = modella.extension.buildSafeObject(originalObject);

            expect(JSON.stringify(returnedObject)).toBe(JSON.stringify(originalObject));
        });

        it('should return an object that is not pointed at the original object', function(){
            var originalObject = {
                    property1: "property1",
                    property2: {}
                },
                returnedObject = modella.extension.buildSafeObject(originalObject);

            expect(returnedObject).not.toBe(originalObject);
        });

    });

});