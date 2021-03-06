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
/*global define*/

define(
    [],
    function () {
        "use strict";

        /**
         * The `info` gesture displays domain object metadata in a
         * bubble on hover.
         *
         * @memberof platform/commonUI/inspect
         * @constructor
         * @implements {Gesture}
         * @param $timeout Angular's `$timeout`
         * @param {InfoService} infoService a service which shows info bubbles
         * @param {number} delay delay, in milliseconds, before bubble appears
         * @param element jqLite-wrapped DOM element
         * @param {DomainObject} domainObject the domain object for which to
         *        show information
         */
        function InfoGesture($timeout, infoService, delay, element, domainObject) {
            var self = this;

            // Callback functions to preserve the "this" pointer (in the
            // absence of Function.prototype.bind)
            this.showBubbleCallback = function (event) {
                self.showBubble(event);
            };
            this.hideBubbleCallback = function (event) {
                self.hideBubble(event);
            };
            this.trackPositionCallback = function (event) {
                self.trackPosition(event);
            };

            // Also make sure we dismiss bubble if representation is destroyed
            // before the mouse actually leaves it
            this.scopeOff = element.scope().$on('$destroy', this.hideBubbleCallback);

            this.element = element;
            this.$timeout = $timeout;
            this.infoService = infoService;
            this.delay = delay;
            this.domainObject = domainObject;

            // Show bubble (on a timeout) on mouse over
            element.on('mouseenter', this.showBubbleCallback);
        }

        InfoGesture.prototype.trackPosition = function (event) {
            // Record mouse position, so bubble can be shown at latest
            // mouse position (not just where the mouse entered)
            this.mousePosition = [ event.clientX, event.clientY ];
        };

        InfoGesture.prototype.hideBubble = function () {
            // If a bubble is showing, dismiss it
            if (this.dismissBubble) {
                this.dismissBubble();
                this.element.off('mouseleave', this.hideBubbleCallback);
                this.dismissBubble = undefined;
            }
            // If a bubble will be shown on a timeout, cancel that
            if (this.pendingBubble) {
                this.$timeout.cancel(this.pendingBubble);
                this.element.off('mousemove', this.trackPositionCallback);
                this.element.off('mouseleave', this.hideBubbleCallback);
                this.pendingBubble = undefined;
            }
            // Also clear mouse position so we don't have a ton of tiny
            // arrays allocated while user mouses over things
            this.mousePosition = undefined;
        };

        InfoGesture.prototype.showBubble = function (event) {
            var self = this;

            this.trackPosition(event);

            // Also need to track position during hover
            this.element.on('mousemove', this.trackPositionCallback);

            // Show the bubble, after a suitable delay (if mouse has
            // left before this time is up, this will be canceled.)
            this.pendingBubble = this.$timeout(function () {
                self.dismissBubble = self.infoService.display(
                    "info-table",
                    self.domainObject.getModel().name,
                    self.domainObject.useCapability('metadata'),
                    self.mousePosition
                );
                self.element.off('mousemove', self.trackPositionCallback);
                self.pendingBubble = undefined;
            }, this.delay);

            this.element.on('mouseleave', this.hideBubbleCallback);
        };

        /**
         * Detach any event handlers associated with this gesture.
         * @method
         */
        InfoGesture.prototype.destroy = function () {
            // Dismiss any active bubble...
            this.hideBubble();
            // ...and detach listeners
            this.element.off('mouseenter', this.showBubbleCallback);
            this.scopeOff();
        };

        return InfoGesture;

    }

);

