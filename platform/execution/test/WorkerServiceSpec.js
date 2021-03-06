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
/*global define,describe,it,expect,beforeEach,jasmine*/

define(
    ["../src/WorkerService"],
    function (WorkerService) {
        "use strict";

        describe("The worker service", function () {
            var mockWindow,
                testWorkers,
                mockWorker,
                service;

            beforeEach(function () {
                mockWindow = jasmine.createSpyObj('$window', ['Worker']);
                testWorkers = [
                    {
                        key: 'abc',
                        scriptUrl: 'c.js',
                        bundle: { path: 'a', sources: 'b' }
                    },
                    {
                        key: 'xyz',
                        scriptUrl: 'z.js',
                        bundle: { path: 'x', sources: 'y' }
                    },
                    {
                        key: 'xyz',
                        scriptUrl: 'bad.js',
                        bundle: { path: 'bad', sources: 'bad' }
                    }
                ];
                mockWorker = {};

                mockWindow.Worker.andReturn(mockWorker);

                service = new WorkerService(mockWindow, testWorkers);
            });

            it("instantiates workers at registered paths", function () {
                expect(service.run('abc')).toBe(mockWorker);
                expect(mockWindow.Worker).toHaveBeenCalledWith('a/b/c.js');
            });

            it("prefers the first worker when multiple keys are found", function () {
                expect(service.run('xyz')).toBe(mockWorker);
                expect(mockWindow.Worker).toHaveBeenCalledWith('x/y/z.js');
            });

            it("returns undefined for unknown workers", function () {
                expect(service.run('def')).toBeUndefined();
            });

        });
    }
);
