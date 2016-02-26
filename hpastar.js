"use strict";

class Cluster {

    constructor(hpa, x, y, width, height, cells) {
        this.hpa = hpa;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Cache the cells belonging to this cluster
        this.cells = [];
        for (let x_ = x; x_ < x + width; ++x_)
            for (let y_ = y; y_ < y + height; ++y_) {
                let cell = this.hpa.cells[this.hpa.positionToIndex(x_, y_)];
                cell.cluster = this;
                this.cells.push(cell);
            }

        // Add an SVG rect to represent the cluster's boundaries
        let cluster = this.hpa.svg.append('rect')
            .attr('x', this.hpa.scale(x % this.hpa.width))
            .attr('y', this.hpa.scale(y % this.hpa.height))
            .attr('width', this.hpa.scale(width))
            .attr('height', this.hpa.scale(height))
            .attr('class', 'cluster');
    }

    get edgeCells() {
        let edge = [];

        for (let cell of this.cells)
            if (cell.x == this.x || cell.x == this.x + this.width - 1 ||
                cell.y == this.y || cell.y == this.y + this.height - 1)
                edge.push(cell)

        return edge;
    }
}

class Entrance {

    constructor(cell1, cell2) {
        this.cell1 = cell1;
        this.cell2 = cell2;
    }

    get midpoint() {
        return [
            this.cell1.x + (this.cell2.x - this.cell1.x) / 2,
            this.cell1.y + (this.cell2.y - this.cell1.y) / 2
        ];
    }

    get positionDiff() {
        return [
            Math.sign(this.cell2.x - this.cell1.x),
            Math.sign(this.cell2.y - this.cell1.y)
        ];
    }

    toString() {
        return this.cell1.toString() + '_' + this.cell2.toString();
    }
}

const RESOLUTION = 5;

class HPAStar extends Algorithm {

    get cellType() { return HPAStarCell; }

    constructor(width, height, startX, startY, goalX, goalY) {
        super(width, height, startX, startY, goalX, goalY);

        this.clusters = [];
        for (let x = 0; x < this.width; x += RESOLUTION)
            for (let y = 0; y < this.height; y += RESOLUTION)
                this.clusters.push(new Cluster(this, x, y, RESOLUTION, RESOLUTION));

        this.entrances = [];
    }

    execute() {
        this.computeEntrances();

        super.execute();
    }

    computeEntrances() {

        // An entrance is a pair of neighbors belonging to different clusters
        for (let cluster of this.clusters)
            for (let cell of cluster.edgeCells)
                for (let neighbor of cell.neighbors(false))
                    if (neighbor.cluster !== cluster && cell.isWalkable && neighbor.isWalkable && !this.isEntranceKnown(cell, neighbor))
                        this.entrances.push(new Entrance(cell, neighbor));

        let entrances = this.svg.selectAll('circle')
            .data(this.entrances)
            .enter()
            .append('circle')
            .attr('cx', entrance => this.scale(entrance.cell1.index % this.width + entrance.positionDiff[0]))
            .attr('cy', entrance => this.scale(Math.floor(entrance.cell1.index / this.width) + entrance.positionDiff[1]))
            .attr('r', 3)
            .attr('class', 'entrance');
    }

    isEntranceKnown(cell1, cell2) {
        return this.entrances.some(e => e.cell1 == cell1 || e.cell2 == cell1 || e.cell1 == cell2 || e.cell2 == cell2);
    }

    step() {
    }

    over() {
        return true;
    }
}

class HPAStarCell extends Cell {

    constructor(algo, index) {
        super(algo, index);
    }

    classes() {
        let classes = super.classes();
        return classes;
    }
}
