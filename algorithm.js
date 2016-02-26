"use strict";

const WIDTH = 300;

class Algorithm {

    // To be specified in chidl classes
    get cellType() { return Cell; }

    constructor(width, height, startX, startY, goalX, goalY) {

        this.width = width;
        this.height = height;

        // Instantiate the cells
        this.cells = new Array(width * height);
        for (let i = 0; i < this.cells.length; ++i)
            this.cells[i] = new this.cellType(this, i);

        this.start = this.cells[startY * width + startX];
        this.goal = this.cells[goalY * width + goalX];

        this.obstacles = [];

        // Fit in the predefined width
        this.scale = d3.scale.linear()
            .domain([0, width])
            .range([0, WIDTH]);

        this.container = d3.select('body').append('div');

        this.svg = this.container.append('svg')
            .attr('width', WIDTH)
            .attr('height', this.scale(height));

        // Create SVG rects for the cells
        this.cellRects = this.svg.selectAll('rect')
            .data(this.cells);

        this.cellRects.enter()
            .append('rect')
            .attr('x', cell => this.scale(cell.index % this.width))
            .attr('y', cell => this.scale(Math.floor(cell.index / this.width)))
            .attr('width', this.scale(1))
            .attr('height', this.scale(1));

        // Append the algorithm name below the SVG
        this.container.append('p').text(this.constructor.name)
    }

    update() {
        this.cellRects
            .data(this.cells)
            .attr('class', cell => cell.classes().join(' '));
    }

    indexToPosition(i) {
        return [Math.floor(i / this.width), i % this.width];
    }

    positionToIndex(x, y) {
        return y * this.width + x;
    }

    cellAt(x, y) {
        return this.cells[this.positionToIndex(x, y)];
    }

    obstacle(x, y, width, height) {
        for (let x_ = Math.max(x, 0); x_ < x + width && x_ < this.width; ++x_)
            for (let y_ = Math.max(y, 0); y_ < y + height && y_ < this.height; ++y_)
                this.obstacles.push(this.cellAt(x_, y_));

        this.update();
    }

    execute() {
        if (!this.over()) {
            this.step();
            setTimeout(this.execute.bind(this), 30);
        }
    }

    step() {
        // Implement this in derived classes
    }

    over() {
        return true;
    }
}

class Cell {

    constructor(algo, index) {
        this.algo = algo;
        this.index = index;
    }

    get x() { return this.index % this.algo.width }

    get y() { return Math.floor(this.index / this.algo.width) }

    get isWalkable() { return !this.algo.obstacles.includes(this) }

    get isStart() { return this === this.algo.start }

    get isGoal() { return this === this.algo.goal }

    neighbors(diagonal) {

        if (diagonal === undefined)
            diagonal = true;

        let neighbors = [];

        let cx = this.index % this.algo.width;
        let cy = Math.floor(this.index / this.algo.width);

        for (let x = Math.max(0, cx - 1); x < Math.min(this.algo.width, cx + 2); ++x)
            for (let y = Math.max(0, cy - 1); y < Math.min(this.algo.height, cy + 2); ++y)
                if (diagonal) {
                    if (x != this.x || y != this.y)
                        neighbors.push(this.algo.cells[y * this.algo.width + x]);
                }
                else {
                    if (x != this.x && y == this.y || x == this.x && y != this.y)
                        neighbors.push(this.algo.cells[y * this.algo.width + x]);
                }

        return neighbors;
    }

    classes() {
        let classes = [];
        if (this.isStart) classes.push('start');
        if (this.isGoal) classes.push('goal');
        if (!this.isWalkable) classes.push('unwalkable');
        return classes;
    }

    toString() {
        return '' + this.index;
    }
}
