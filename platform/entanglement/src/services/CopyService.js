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

/*global define */

define(
    function () {
        "use strict";

        /**
         * CopyService provides an interface for deep copying objects from one
         * location to another.  It also provides a method for determining if
         * an object can be copied to a specific location.
         * @constructor
         * @memberof platform/entanglement
         * @implements {platform/entanglement.AbstractComposeService}
         */
        function CopyService($q, creationService, policyService) {
            this.$q = $q;
            this.creationService = creationService;
            this.policyService = policyService;
        }

        CopyService.prototype.validate = function (object, parentCandidate) {
            if (!parentCandidate || !parentCandidate.getId) {
                return false;
            }
            if (parentCandidate.getId() === object.getId()) {
                return false;
            }
            return this.policyService.allow(
                "composition",
                parentCandidate.getCapability('type'),
                object.getCapability('type')
            );
        };

        CopyService.prototype.perform = function (domainObject, parent) {
            var model = JSON.parse(JSON.stringify(domainObject.getModel())),
                $q = this.$q,
                self = this;

            // Wrapper for the recursive step
            function duplicateObject(domainObject, parent) {
                return self.perform(domainObject, parent);
            }

            if (domainObject.hasCapability('composition')) {
                model.composition = [];
            }

            return this.creationService
                .createObject(model, parent)
                .then(function (newObject) {
                    if (!domainObject.hasCapability('composition')) {
                        return;
                    }

                    return domainObject
                        .useCapability('composition')
                        .then(function (composees) {
                            // Duplicate composition serially to prevent
                            // write conflicts.
                            return composees.reduce(function (promise, composee) {
                                return promise.then(function () {
                                    return duplicateObject(composee, newObject);
                                });
                            }, $q.when(undefined));
                        });
                });
        };

        return CopyService;
    }
);

