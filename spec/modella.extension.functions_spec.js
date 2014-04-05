/*global describe,it,expect,modella*/

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
});