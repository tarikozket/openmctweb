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
    ['../src/LogLevel'],
    function (LogLevel) {
        "use strict";

        var LOG_METHODS = [
            'error',
            'warn',
            'info',
            'log',
            'debug'
        ];

        describe("The logging level handler", function () {
            var mockLog,
                mockApp,
                mockProvide,
                mockDelegate,
                mockMethods;

            function logAll(v) {
                LOG_METHODS.forEach(function (m) {
                    mockLog[m](v);
                    mockDelegate[m](v);
                });
            }

            function expectCalls(calls, v) {
                LOG_METHODS.forEach(function (m) {
                    if (calls.indexOf(m) > -1) {
                        expect(mockMethods[m]).toHaveBeenCalledWith(v);
                    } else {
                        expect(mockMethods[m]).not.toHaveBeenCalledWith(v);
                    }
                });
            }

            beforeEach(function () {
                mockMethods = jasmine.createSpyObj("levels", LOG_METHODS);
                mockLog = jasmine.createSpyObj('$log', LOG_METHODS);
                mockApp = jasmine.createSpyObj('app', ['config']);
                mockProvide = jasmine.createSpyObj('$provide', ['decorator']);
                mockDelegate = jasmine.createSpyObj('$delegate', LOG_METHODS);

                LOG_METHODS.forEach(function (m) {
                    mockLog[m].andCallFake(mockMethods[m]);
                    mockDelegate[m].andCallFake(mockMethods[m]);
                });

                mockApp.config.andCallFake(function (callback) {
                    callback(mockProvide);
                });

                mockProvide.decorator.andCallFake(function (key, callback) {
                    // Only $log should be configured in any case
                    expect(key).toEqual('$log');
                    callback(mockDelegate);
                });
            });

            it("defaults to 'warn' level", function () {
                new LogLevel("garbage").configure(mockApp, mockLog);
                logAll("test");
                expectCalls(['error', 'warn'], 'test');
            });

            LOG_METHODS.forEach(function (m, i) {
                it("supports log level '" + m + "'", function () {
                    // Note: This is sensitive to ordering of LOG_METHODS,
                    // which needs to be highest-level-first above.
                    var expected = LOG_METHODS.slice(0, i + 1),
                        message = "test " + m;

                    new LogLevel(m).configure(mockApp, mockLog);
                    logAll(message);
                    expectCalls(expected, message);
                });
            });

        });
    }
);