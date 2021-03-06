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
/*global define,Promise*/

/**
 * Module defining NameColumn. Created by vwoeltje on 11/18/14.
 */
define(
    [],
    function () {
        "use strict";

        /**
         * A column which will report the name of the domain object
         * which exposed specific telemetry values.
         *
         * @memberof platform/features/rtscrolling
         * @constructor
         */
        function NameColumn() {
            return {
                /**
                 * Get the title to display in this column's header.
                 * @returns {string} the title to display
                 * @memberof platform/features/rtscrolling.NameColumn#
                 */
                getTitle: function () {
                    return "Name";
                },
                /**
                 * Get the text to display inside a row under this
                 * column. This returns the domain object's name.
                 * @returns {string} the text to display
                 * @memberof platform/features/rtscrolling.NameColumn#
                 */
                getValue: function (domainObject) {
                    return {
                        text: domainObject.getModel().name
                    };
                }
            };
        }

        return NameColumn;
    }
);

