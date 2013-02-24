var tetris = {
    /**
     * The canvas
     * @type object
     */
    canvas: null,

    /**
     * The canvas context
     * @type object
     */
    ctx: null,

    /**
     * Height
     * @type integer
     */
    height: 20,

    /**
     * Width
     * @type integer
     */
    width: 10,

    /**
     * The map
     * @type array
     */
    map: [],

    /**
     * Ticker
     * @type object
     */
    interval: null,

    /**
     * The current block
     * @type array
     */
    currentBlock: null,

    /**
     * Current block position
     * @type array
     */
    currentBlockPos: [0, 0],

    /**
     * Available blocks
     * @type array
     */
    blocks: [
        [
            // I
            [1],
            [1],
            [1],
            [1]
        ],
        [
            // T
            [2, 2, 2],
            [0, 2, 0]
        ],
        [
            // J
            [3, 3, 3],
            [0, 0, 3]
        ],
        [
            // L
            [4, 4, 4],
            [4, 0, 0]
        ],
        [
            // Z
            [5, 5, 0],
            [0, 5, 5]
        ],
        [
            // S
            [0, 6, 6],
            [6, 6, 0]
        ],
        [
            // O
            [7, 7],
            [7, 7]
        ]
    ],

    /**
     * Colours
     * @type array
     */
    colours: [
        "",
        "rgba(38, 118, 217, 1)",
        "rgba(40, 174, 22, 1)",
        "rgba(244, 247, 18, 1)",
        "rgba(113, 207, 251, 1)",
        "rgba(240, 82, 82, 1)",
        "rgba(174, 50, 220, 1)",
        "rgba(243, 157, 33, 1)"
    ],

    /**
     * Score
     * @type integer
     */
    score: 0,

    /**
     * Speed
     * @type integer
     */
    speed: 500,

    /**
     * On score change
     * @type closure
     */
    onscorechange: null,

    /**
     * Start
     * @return void
     */
    start: function() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Reset score and
        this.score = 0;
        this.speed = 500;

        // Create the map
        this.map = this.createMap();
        this.currentBlock = this.getBlock();
        this.currentBlockPos = this.calculateInitialBlockPos(this.currentBlock);

        // Trigger score event
        this.addScore(0);

        // Draw
        this.draw();
        this.createInterval();
    },

    /**
     * Score
     * @param integer score
     */
    addScore: function(score) {
        this.score = this.score + score;

        if (this.onscorechange !== null) {
            this.onscorechange(this.score);
        }

        this.speed = this.speed - 2;
        this.createInterval();
    },

    /**
     * Create interval
     * @return void
     */
    createInterval: function() {
        clearInterval(this.interval);

        this.interval = setInterval(function() {
            tetris.tick();
        }, this.speed);
    },

    /**
     * Tick
     * @return void
     */
    tick: function() {
        try {
            var collision = this.checkCollision();
        } catch(err) {
            alert("Game over");

            this.start();
            return;
        }

        if (collision) {
            this.checkFullLine();

            this.currentBlock = this.getBlock();
            this.currentBlockPos = this.calculateInitialBlockPos(this.currentBlock);
        } else {
            this.currentBlockPos[0] = this.currentBlockPos[0] + 1;
        }

        this.draw();
    },

    /**
     * Get block
     * @return void
     */
    getBlock: function() {
        var block = Math.floor(Math.random() * 7);
        return this.blocks[block];
    },

    /**
     * Calculate initial block pos
     * @param  array block
     * @return array
     */
    calculateInitialBlockPos: function(block) {
        return [(-block[0].length + 1), Math.floor((this.width - block[0].length) / 2)];
    },

    /**
     * Create map
     * @return array
     */
    createMap: function() {
        var map = [];

        for (i = 0; i < this.height; i++) {
            map[i] = [];

            for (c = 0; c < this.width; c++) {
                map[i][c] = 0;
            }
        }

        return map;
    },

    /**
     * Get map
     * @return array
     */
    getMap: function() {
        var map = [];

        // Clone map
        for (i = 0; i < this.map.length; i++) {
            map[i] = [];

            for (c = 0; c < this.map[i].length; c++) {
                map[i][c] = this.map[i][c];
            }
        }

        // Add current block to map
        for (i = 0; i < this.currentBlock.length; i++) {
            for (c = 0; c < this.currentBlock[i].length; c++) {
                if (this.currentBlock[i][c] !== 0 && (this.currentBlockPos[0] + i >= 0)) {
                    map[i + this.currentBlockPos[0]][c + this.currentBlockPos[1]] = this.currentBlock[i][c];
                }
            }
        }

        return map;
    },

    /**
     * Draw
     * @return void
     */
    draw: function() {
        tetris.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        map = this.getMap();

        // Draw
        for (i = 0; i < this.height; i++) {
            for (c = 0; c < this.width; c++) {
                if (map[i][c] !== 0) {
                    this.ctx.fillStyle = this.colours[map[i][c]];
                    this.ctx.fillRect(c * 30, i * 30, 30, 30);

                    this.ctx.strokeStyle = "rgba(0, 0, 0, .3)";
                    this.ctx.strokeRect((c * 30) + 1, (i * 30) + 1, 28, 28);
                }
            }
        }
    },

    /**
     * Move right
     * @return void
     */
    moveRight: function() {
        var y = this.currentBlockPos[0];
        var x = this.currentBlockPos[1];
        var height = this.currentBlock.length;
        var width = this.currentBlock[0].length;

        if ((x + width) >= this.width) {
            return;
        }

        for (i = 0; i < height; i++) {
            if (this.currentBlock[i][width - 1] !== 0 && this.map[y + i][x + width] !== 0) {
                return;
            }
        }

        this.currentBlockPos[1]++;
        this.draw();
    },

    /**
     * Move left
     * @return void
     */
    moveLeft: function() {
        var y = this.currentBlockPos[0];
        var x = this.currentBlockPos[1];
        var height = this.currentBlock.length;
        var width = this.currentBlock[0].length;

        if (x <= 0) {
            return;
        }

        // THIS IS NOT WORKING PROPERLY
        // TODO: fix
        for (i = 0; i < height; i++) {
            if (this.currentBlock[i][0] !== 0 && this.map[y + i][x - 1] !== 0) {
                return;
            }
        }

        this.currentBlockPos[1]--;
        this.draw();
    },

    /**
     * Move down
     * @return void
     */
    moveDown: function() {
        if (this.currentBlockPos[0] !== this.height - 1) {
            if (this.checkCollision()) {
                return;
            }

            this.currentBlockPos[0]++;
            this.draw();
        }
    },

    /**
     * Rotate
     * @return void
     */
    rotate: function() {
        var currentBlock = this.currentBlock;
        var height = currentBlock[0].length;
        var width = currentBlock.length;
        var newBlock = [];

        for (i = 0; i < height; i++) {
            newBlock[i] = [];

            for (c = 0; c < width; c++) {
                newBlock[i][c] = 0;
            }
        }

        for (i = 0; i < currentBlock.length; i++) {
            for (c = 0; c < currentBlock[i].length; c++) {
                newBlock[c][Math.abs(i - width)] = currentBlock[i][c];
            }
        }

        for (i = 0; i < newBlock.length; i++) {
            newBlock[i].shift();

            if ((i + this.currentBlockPos[0] + 1) > this.height) {
                return;
            }

            for (c = 0; c < newBlock[i].length; c++) {
                if ((c + this.currentBlockPos[1] + 1) > this.width) {
                    return;
                }

                if (this.map[i + this.currentBlockPos[0]][c + this.currentBlockPos[1]] !== 0) {
                    return;
                }
            }
        }

        this.currentBlock = newBlock;
        this.draw();
    },

    /**
     * Drop
     * @return void
     */
    drop: function() {
        while (this.currentBlockPos[0] !== this.height - 1) {
            try {
                var collision = this.checkCollision();
            } catch(err) {
                alert("Game over");

                this.start();
                return;
            }

            if (collision) {
                this.tick();

                return;
            }

            this.currentBlockPos[0]++;
            this.draw();
        }
    },

    /**
     * Check collision
     * @return void
     */
    checkCollision: function() {
        var collided = false;

        for (i = 0; i < this.currentBlock.length; i++) {
            for (c = 0; c < this.currentBlock[i].length; c++) {
                if (i + this.currentBlockPos[0] >= this.height - 1) {
                    collided = true;
                    break;
                } else if(this.currentBlock[i][c] !== 0) {
                    var x = this.currentBlockPos[1] + c;
                    var y = this.currentBlockPos[0] + i + 1;

                    if (typeof this.map[y] !== "undefined" && typeof this.map[y][x] !== "undefined" && this.map[y][x] !== 0) {
                        collided = true;
                        break;
                    }
                }
            }
        }

        // If the block has collided, add it to the map
        if (collided) {
            for (i = 0; i < this.currentBlock.length; i++) {
                for (c = 0; c < this.currentBlock[i].length; c++) {
                    if (this.currentBlock[i][c] !== 0) {
                        if (this.currentBlockPos[0] + i < 0) {
                            throw "end";
                        }

                        this.map[i + this.currentBlockPos[0]][c + this.currentBlockPos[1]] = this.currentBlock[i][c];
                    }
                }
            }
        }

        return collided;
    },

    /**
     * Check full line
     * @return bool
     */
    checkFullLine: function() {
        var combo = 0;

        for (i = 0; i < this.map.length; i++) {
            var full = true;

            for (c = 0; c < this.map[i].length; c++) {
                if (this.map[i][c] == 0) {
                    full = false;
                    break;
                }
            }

            if (full) {
                this.map.splice(i, 1);
                this.map.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

                switch (combo) {
                    case 0:
                        this.addScore(10);
                        break;

                    case 1:
                        this.addScore(12);
                        break;

                    case 2:
                        this.addScore(15);
                        break;

                    case 3:
                        this.addScore(20);
                        break;
                }

                combo++;
            }
        }
    }
};

tetris.start();