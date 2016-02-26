"use strict";

class BreadthFirst extends Algorithm {

    get cellType() { return BreadthFirstCell; }

    constructor(width, height, startX, startY, goalX, goalY) {
        super(width, height, startX, startY, goalX, goalY);

        this.frontier = [this.start];
    }

    step() {
        let cell = this.frontier.shift();

        cell.neighbors().forEach(n => {
            if (n.isWalkable && n.origin === null) {
                this.frontier.push(n);
                n.origin = cell;
            }
        });

        this.update();
    }

    over() {
        return this.frontier.length === 0 || this.goal.origin !== null;
    }
}

class BreadthFirstCell extends Cell {

    constructor(algo, index) {
        super(algo, index);

        // The previous cell in the path
        this.origin = null;
    }

    classes() {
        let classes = super.classes();
        if (this.algo.frontier.indexOf(this) > -1) classes.push('frontier');
        if (this.origin !== null) classes.push('visited');
        return classes;
    }
}
