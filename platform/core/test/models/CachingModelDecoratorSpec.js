/*****************************************************************************
 * Open MCT Web, Copyright (c) 2014-2015, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT Web is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT Web includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/
/*global define,Promise,describe,it,expect,beforeEach,waitsFor,jasmine*/

define(
    ["../../src/models/CachingModelDecorator"],
    function (CachingModelDecorator) {
        "use strict";

        describe("The caching model decorator", function () {
            var mockModelService,
                mockCallback,
                testModels,
                decorator;

            function asPromise(value) {
                return (value || {}).then ? value : {
                    then: function (callback) {
                        return asPromise(callback(value));
                    }
                };
            }

            function fakePromise() {
                var chains = [],
                    callbacks = [];

                return {
                    then: function (callback) {
                        var next = fakePromise();
                        callbacks.push(callback);
                        chains.push(next);
                        return next;
                    },
                    resolve: function (value) {
                        callbacks.forEach(function (cb, i) {
                            chains[i].resolve(cb(value));
                        });
                    }
                };
            }

            beforeEach(function () {
                mockCallback = jasmine.createSpy();
                mockModelService = jasmine.createSpyObj('modelService', ['getModels']);
                testModels = {
                    a: { someKey: "some value" },
                    b: { someOtherKey: "some other value" }
                };
                mockModelService.getModels.andReturn(asPromise(testModels));
                decorator = new CachingModelDecorator(mockModelService);
            });

            it("loads models from its wrapped model service", function () {
                decorator.getModels(['a', 'b']).then(mockCallback);
                expect(mockCallback).toHaveBeenCalledWith(testModels);
            });

            it("does not try to reload cached models", function () {
                mockModelService.getModels.andReturn(asPromise({ a: testModels.a }));
                decorator.getModels(['a']);
                mockModelService.getModels.andReturn(asPromise(testModels));
                decorator.getModels(['a', 'b']);
                expect(mockModelService.getModels).not.toHaveBeenCalledWith(['a', 'b']);
                expect(mockModelService.getModels.mostRecentCall.args[0]).toEqual(['b']);
            });

            it("does not call its wrapped model service if not needed", function () {
                decorator.getModels(['a', 'b']);
                expect(mockModelService.getModels.calls.length).toEqual(1);
                decorator.getModels(['a', 'b']).then(mockCallback);
                expect(mockModelService.getModels.calls.length).toEqual(1);
                // Verify that we still got back our models, even though
                // no new call to the wrapped service was made
                expect(mockCallback).toHaveBeenCalledWith(testModels);
            });

            it("ensures a single object instance, even for multiple concurrent calls", function () {
                var promiseA, promiseB, mockCallback = jasmine.createSpy();

                promiseA = fakePromise();
                promiseB = fakePromise();

                // Issue two calls before those promises resolve
                mockModelService.getModels.andReturn(promiseA);
                decorator.getModels(['a']);
                mockModelService.getModels.andReturn(promiseB);
                decorator.getModels(['a']).then(mockCallback);

                // Then resolve those promises. Note that we're whiteboxing here
                // to figure out which promises to resolve (that is, we know that
                // two thens are chained after each getModels)
                promiseA.resolve(testModels);
                promiseB.resolve({
                    a: { someNewKey: "some other value" }
                });

                // Ensure that we have a pointer-identical instance
                expect(mockCallback.mostRecentCall.args[0].a)
                    .toEqual({ someNewKey: "some other value" });
                expect(mockCallback.mostRecentCall.args[0].a)
                    .toBe(testModels.a);
            });

            it("is robust against updating with undefined values", function () {
                var promiseA, promiseB, mockCallback = jasmine.createSpy();

                promiseA = fakePromise();
                promiseB = fakePromise();

                // Issue two calls before those promises resolve
                mockModelService.getModels.andReturn(promiseA);
                decorator.getModels(['a']);
                mockModelService.getModels.andReturn(promiseB);
                decorator.getModels(['a']).then(mockCallback);

                // Some model providers might erroneously add undefined values
                // under requested keys, so handle that
                promiseA.resolve({
                    a: undefined
                });
                promiseB.resolve({
                    a: { someNewKey: "some other value" }
                });

                // Should still have gotten the model
                expect(mockCallback.mostRecentCall.args[0].a)
                    .toEqual({ someNewKey: "some other value" });
            });


        });
    }
);