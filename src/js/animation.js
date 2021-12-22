// use a scale of the canvas for better resolution of drawn objects
const SCALE = 10;

class Color {
    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    set alpha(a) {
        this.a = a;
        return this;
    }

    str() {
        return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    }

    copy() {
        return new Color(this.r, this.g, this.b, this.a)
    }
}

class Line {
    constructor(x, y, length, min_length, max_length, color, stepsize) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.min_length = min_length;
        this.max_length = max_length;
        this.color = color;
        this.stepsize = stepsize;
        this.ascending = false;
    }
}

class LineAnimation {
    constructor(
            ctx,
            {
                nlines = 10,
                linewidth = 4,
                minstepsize = 1.0,
                maxstepsize = 1.0,
                shortest = 10,
                longest = 100,
                color = undefined,
                origin = {x: 0, y: 0},
                direction = {x: 1, y: 1}
            }
        ) {
        this.ctx = ctx;
        this.width = linewidth * SCALE;
        this.minstepsize = minstepsize * SCALE;
        this.maxstepsize = maxstepsize * SCALE;
        this.shortest = shortest * SCALE;
        this.longest = longest * SCALE;
        this.color = color;
        this.origin = origin;
        var abs = Math.sqrt(direction.x**2 + direction.y**2);
        this.direction = {x: direction.x/abs, y: direction.y/abs};
        this.lines = [];
        this._createLines(nlines);
    }

    _createLines(nlines) {
        var start_x = (this.origin.x
                       - Math.floor(nlines/2) * this.width * this.direction.y);
        var start_y = (this.origin.y
                       - Math.floor(nlines/2) * SCALE * (-this.direction.x));
        var offset, stepsize, color, length, max_length, min_length;
        for (let i = 0; i < nlines; i++) {
            offset = i * this.width;
            color = this.color.copy()
            color.alpha = 0.3 * Math.random() + 0.1;
            stepsize = (this.maxstepsize - this.minstepsize) * Math.random() + this.minstepsize;
            // random length of the line
            length = (this.longest - this.shortest) * Math.random() + this.shortest;
            max_length = (this.longest - this.shortest) * Math.random() + this.shortest;
            min_length = (max_length - this.shortest) * Math.random() + this.shortest;
            this.lines.push(new Line(
                start_x + offset * this.direction.y,
                start_y + offset * (-this.direction.x),
                length,
                min_length,
                max_length,
                color,
                stepsize
            ));
        }
    }

    drawLines() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.lines.forEach((line) => {
            this.ctx.beginPath();
            this.ctx.moveTo(line.x, line.y);
            this.ctx.lineWidth = this.width;
            this.ctx.lineCap = 'round';
            this.ctx.strokeStyle = line.color.str();
            this.ctx.lineTo(line.x + line.length*this.direction.x,
                            line.y + line.length*this.direction.y);
            this.ctx.stroke();
        });
    }

    step() {
        this.drawLines();
        this.lines.forEach((line) => {
            if (line.ascending) {
                line.length += line.stepsize;
                if (line.length > line.max_length) {
                    line.ascending = false;
                    line.stepsize = (
                        (this.maxstepsize - this.minstepsize) * Math.random() + this.minstepsize
                    );
                    line.max_length = (
                        (this.longest - this.shortest) * Math.random() + this.shortest
                    );
                    line.min_length = (
                        (line.max_length - this.shortest) * Math.random() + this.shortest
                    );
                }
            }
            else {
                line.length -= line.stepsize;
                if (line.length < line.min_length) {
                    line.ascending = true;
                    line.stepsize = (
                        (this.maxstepsize - this.minstepsize) * Math.random() + this.minstepsize
                    );
                    line.max_length = (
                        (this.longest - this.shortest) * Math.random() + this.shortest
                    );
                    line.min_length = (
                        (line.max_length - this.shortest) * Math.random() + this.shortest
                    );
                }
            }
        })
    }
}

function main() {
    var canvas = document.getElementById("canvas");
    canvas.width = SCALE * canvas.width;
    canvas.height = SCALE * canvas.height;

    var ctx = canvas.getContext("2d");

    const animation = new LineAnimation(ctx, {
        nlines: 300,
        linewidth: 1,
        minstepsize: 0.05,
        maxstepsize: 0.1,
        shortest: 0,
        longest: 10,
        color: new Color(150, 5, 150),
        origin: {x: canvas.width / 2, y: canvas.height},
        direction: {x: 0, y: -1},
    });

    animation.step();
    canvas.addEventListener("mousemove", function() {animation.step();})
}

main();
