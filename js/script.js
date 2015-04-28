;(function (window, d3) {
    var $wrap = d3.select('#chart-wrap'),
        $chart = $wrap.select('.chart'),
        $newVector = d3.select('#new-vector'),
        width = 400,
        height = 400,
        gridSize = 10,
        padding = 40,
        arrowHeadSize = 10,
        arrowAngle = Math.PI / 6,
        arrowHeadMargin = 2,
        svg,lines,
        xAxis, yAxis,
        xScale, yScale;

    svg = $chart.append('svg:svg');

    function init () {
        setPadding();
        drawGrid(gridSize);
        setupScale();
        setupAxis();
        createLinesContainer();
        drawLine();

        $newVector.on('click', onClickNewVector);
    }

    function createLinesContainer () {
        lines = svg.append('svg:g')
            .attr('class', 'lines');
    }

    function setPadding () {
        svg.attr('width', width + padding * 2);
        svg.attr('height', height + padding * 2);

        $wrap.style({
            width: width + padding * 2 + 'px',
            height: height + padding * 2 + 'px'
        })
    }

    /**
     * Setups linear scales to layout
     */
    function setupScale () {
        xScale = d3.scale.linear()
            .domain([0, width])
            .range([0, width]);

        yScale = d3.scale.linear()
            .domain([0, height])
            .range([0, height]);
    }

    /**
     * Defines main axis, and appends them to the svg
     */
    function setupAxis () {
        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');

        svg.append('g')
            .attr('class','x-axis axis')
            .attr('transform','translate(' + padding +  ',' + (height + padding) + ')')
            .call(xAxis);

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        svg.append('g')
            .attr('class','y-axis axis')
            .attr('transform','translate(' + padding +  ',' + padding + ')')
            .call(yAxis);
    }

    /**
     * Draws back grid
     * @param {Number} gridSize - What size grid should be in 'px'
     */
    function drawGrid(gridSize) {
        var max = width / gridSize,
            grid = svg.append('svg:g')
                .attr('class', 'grid')
                .attr('transform','translate(' + padding + ',' + padding + ')');

        for (var i = 0; i <= max; i++) {
            grid.append('svg:path')
                .attr('stroke', '#ddd')
                .attr('stroke-width', 1)
                .attr('fill', 'none')
                .attr('d', 'M ' + i * gridSize + ' 0 ' + ' L ' + i * gridSize + ' ' + height);

            grid.append('svg:path')
                .attr('stroke', '#eee')
                .attr('stroke-width', 1)
                .attr('fill', 'none')
                .attr('d', 'M ' + ' 0 ' + i * gridSize + ' L ' + width + ' ' + i * gridSize)
        }
    }


    /**
     * Generates random line coordinates
     * @returns {{x1: number, y1: number, x2: number, y2: number}}
     */
    function generateRandomLine () {
        return {
            x1: Math.random() * width + padding,
            y1: Math.random() * height + padding,
            x2: Math.random() * width + padding,
            y2: Math.random() * height + padding
        }
    }

    /**
     * Draws randomly created line on canvas
     */
    function drawLine () {
        var line = generateRandomLine(),
            arrow = getArrowCoords(line.x1, line.y1, line.x2, line.y2),
            paths = lines.selectAll('.line').data([line]),
            arrows = lines.selectAll('.arrow').data([arrow]),
            arrowsEnter,
            lineEnter;

        paths
            .transition()
            .attr('d', function (d) {
                return 'M' + d.x1 + ',' + d.y1 + ' L ' + d.x2 + ',' + d.y2;
            });

        lineEnter = paths.enter()
            .append('path')
            .attr('class', 'line')
            .attr('d', function (d) {
                return 'M' + d.x1 + ',' + d.y1 + ' L ' + d.x2 + ',' + d.y2;
            })
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('stroke', '#000');

        arrows
            .transition()
            .attr('d', function (d) {
                return 'M ' + d.x1 + ',' + d.y1 + 'L' + d.x2 + ',' + d.y2 + 'L' + d.x3 + ',' + d.y3;
            });

        arrowsEnter = arrows.enter()
            .append('path')
            .attr('class', 'arrow')
            .attr('d',function (d) {
                return 'M ' + d.x1 + ',' + d.y1 + 'L' + d.x2 + ',' + d.y2 + 'L' + d.x3 + ',' + d.y3;
            })
            .attr('fill', '#F4777F')
            .attr('stroke-width', 0);

    }

    /**
     * Computes arrow head coordinates. Returns three point.
     * @param {Number} x1 - Line coordinate
     * @param {Number} y1 - Line coordinate
     * @param {Number} x2 - Line coordinate
     * @param {Number} y2 - Line coordinate
     * @returns {{x1: *, y1: *, x2: number, y2: number, x3: number, y3: number}}
     */
    function getArrowCoords (x1, y1, x2, y2) {
        var x = x2 - x1,
            y = y2 - y1,
            length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
            unitVector = {
                x: x / length,
                y: y / length
            },
            endPoint = {
                x: unitVector.x * arrowHeadMargin + x2,
                y: unitVector.y * arrowHeadMargin + y2
            },
            arrowVector = {
                x: unitVector.x * arrowHeadSize,
                y: unitVector.y * arrowHeadSize
            },
            angle = arrowAngle,
            edge1, edge2;

        edge1 = {
            x: Math.cos(angle) * arrowVector.x - Math.sin(angle) * arrowVector.y,
            y: Math.sin(angle) * arrowVector.x + Math.cos(angle) * arrowVector.y
        };

        edge2 = {
            x: Math.cos(-angle) * arrowVector.x - Math.sin(-angle) * arrowVector.y,
            y: Math.sin(-angle) * arrowVector.x + Math.cos(-angle) * arrowVector.y
        };

        return {
            x1: endPoint.x,
            y1: endPoint.y,
            x2: endPoint.x - edge1.x,
            y2: endPoint.y - edge1.y,
            x3: endPoint.x - edge2.x,
            y3: endPoint.y - edge2.y
        }
    }

    //  Events
    // -------------------------------------------------

    function onClickNewVector () {
        drawLine()
    }

    init();

})(window, d3);
