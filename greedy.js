"use strict";

class Greedy extends BreadthFirst {

   get cellType() { return GreedyCell; }

    step() {
        let cell = this.frontier.shift();

        cell.neighbors().forEach(n => {
            if (n.isWalkable && n.origin === null) {
                this.frontier.push(n);
                n.origin = cell;
            }
        });

        // We prioritize cells depending on their distance to the goal
        // so that the closest ones are explored first
        this.frontier.sort((c1, c2) => c1.manhattan(this.goal) - c2.manhattan(this.goal));

        this.update();
    }
}

class GreedyCell extends BreadthFirstCell {

    constructor(algo, index) {
        super(algo, index);

        // Cached priority
        this._priority = Infinity;
    }

    get priority() {
        if (this._priority === Infinity)
            this._priority = this.manhattan(this.algo.goal);

        return this._priority;
    }

    manhattan(cell) {
        return Math.abs(this.x - cell.x) + Math.abs(this.y - cell.y);
    }
}
