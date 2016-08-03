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

define(
    [
        "zepto",
        "d3"
    ],
    function ($, d3) {

        /**
         * The mct-conductor-axis renders a horizontal axis with regular
         * labelled 'ticks'. It requires 'start' and 'end' integer values to
         * be specified as attributes.
         */
        function MCTConductorAxis(conductorService, formatService) {
            var conductor = conductorService.conductor();

            function link(scope, element, attrs, ngModelController) {
                var target = element[0].firstChild,
                    height = target.offsetHeight,
                    padding = 1;

                var vis = d3.select(target)
                            .append('svg:svg')
                            .attr('width', '100%')
                            .attr('height', height);
                var xScale = d3.scaleUtc();
                var xAxis = d3.axisTop();
                // draw x axis with labels and move to the bottom of the chart area
                var axisElement = vis.append("g")
                    .attr("transform", "translate(0," + (height - padding) + ")");

                function setScale(start, end) {
                    var width = target.offsetWidth;
                    xScale.domain([new Date(start), new Date(end)])
                        .range([padding, width - padding * 2]);
                    xAxis.scale(xScale);
                    axisElement.call(xAxis);
                }

                function changeTimeSystem(timeSystem) {
                    var key = timeSystem.formats()[0];
                    if (key !== undefined) {
                        var format =  formatService.getFormat(key);
                        var b = conductor.bounds();

                        //Define a custom format function
                        xAxis.tickFormat(function (date) {
                            return format.format(date.getTime(), {min: b.start, max: b.end});
                        });
                        axisElement.call(xAxis);
                    }
                }

                scope.resize = function () {
                    var b = conductor.bounds();
                    setScale(b.start, b.end);
                };

                conductor.on('timeSystem', changeTimeSystem);

                //On conductor bounds changes, redraw ticks
                conductor.on('bounds', function (bounds) {
                    setScale(bounds.start, bounds.end);
                });
                //Set initial scale.
                var bounds = conductor.bounds();
                setScale(bounds.start, bounds.end);

                if (conductor.timeSystem() !== undefined) {
                    changeTimeSystem(conductor.timeSystem());
                }
            }

            return {
                // Only show at the element level
                restrict: "E",

                template: "<div class=\"l-axis-holder\" mct-resize=\"resize()\"></div>",

                // ngOptions is terminal, so we need to be higher priority
                priority: 1000,

                // Link function
                link: link
            };
        }

        return MCTConductorAxis;
    }
);
