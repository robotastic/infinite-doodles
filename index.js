//include all the modules needed
const http = require('https');
const paper = require("paper-jsdom"); // paper
const fs = require('fs'); //file system
const sketch = require("sketchrnn"); // sketch-rnn
const LineUs = require('@beardicus/line-us')



//"https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models/bus.gen.json"
   
// initialize paper
paper.setup();
bot = new LineUs()
// utility function to load data either locally or remotely (possibly add http in addition later)
function loadData(_uri, _cb) {
    if (_uri.substring(0, 8) == "https://") {
        // load from https
        const request = http.get(_uri,
            res => {
                res.setEncoding("utf8");
                let body = ""
                res.on("data", data => {
                    body += data;
                });
                res.on('end', () => _cb(body));
            });
    } else {
        // load locally
        fs.readFile(_uri, (_err, _data) => {
            if (_err) {
                throw _err;
            }

            _cb(_data);
        });
    }
}

// load the model
loadData("cat.gen.json", setupModel);

function generateDrawing(_model) {
    return _model.generate();
}


function setupModel(_json) {
    var modelData = JSON.parse(_json);
    var model = new sketch.SketchRNN(modelData);
    model.set_pixel_factor(1.0);

  
        //const inputStrokes = svgToStroke5(_inputSVGBuffer.toString('utf8'), 4);
        //const strokes = finishDrawing(model, inputStrokes, 0.25);
        const strokes = generateDrawing(model);

        let grp = new paper.Group();
        let currentPath = new paper.Path();
        grp.addChild(currentPath);

        let x = 0,
            y = 0,
            maxX = 0,
            minX = 0,
            maxY = 0,
            minY = 0;
          
        let dx, dy;
        let pen_down, pen_up, pen_end;
        let prev_pen = [1, 0, 0];
        for (let value of strokes) {
            // sample the next pen's states from our probability distribution
            [dx, dy, pen_down, pen_up, pen_end] = value;

            if (prev_pen[2] == 1) { // end of drawing.
                console.log("Drawing done");
                break;
            }

            if (prev_pen[0] == 1) {
                if (!currentPath.segments.length) {
                    
                    currentPath.add(x, y);
                }
                
                currentPath.add(x + dx, y + dy);
            }

            if (pen_up == 1) {

                currentPath.smooth();
                currentPath = new paper.Path();
                grp.addChild(currentPath);
            }

            // update the absolute coordinates from the offsets
            x += dx;
            y += dy;
            if (x > maxX)
                maxX = x
            if (y > maxY)
                maxY = y
            if (x < minX)
                minX = x
            if (y < minY)
                minY = y

            // update the previous pen's state to the current one we just sampled
            prev_pen = [pen_down, pen_up, pen_end];
        }
        console.log("Min X: " + minX + " Min Y: " + minY + " Max X: " + maxX + " Max Y: " + maxY)
     
        grp.strokeColor = "black";
        grp.strokeWidth = 1.0;
        grp.fillColor = undefined;

        //fit the document to the drawing bounds
        paper.project.view.size = grp.bounds.size;
        paper.project.view.viewSize = grp.bounds.size;
        paper.project.view.center = grp.position;

        const str = paper.project.exportSVG({ asString: true });

        fs.writeFile("drawing.svg", str, function(err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });

        let line_us_width = 1075
        let line_us_height = 2000
        let drawing_width = maxX - minX
        let drawing_height = maxY - minY
        let width_ratio = line_us_width / drawing_width
        let height_ratio = line_us_height / drawing_height
        let ratio = width_ratio < height_ratio ? width_ratio : height_ratio


        let line_us_center_x = 537;
        let line_us_center_y = 1000;
        let drawing_center_x = (maxX - minX) / 2 + minX
        let drawing_center_y = (maxY - minY) / 2 + minY


        x = line_us_center_x - (drawing_center_x * ratio);
        y = line_us_center_y - (drawing_center_y * ratio);
        console.log("Drawing center x: " + drawing_center_x)
        console.log("Drawing center y: " + drawing_center_y)
        console.log("Drawing width: " + drawing_width)
        console.log("Drawing height: " + drawing_height)
        console.log("Ratio: " + ratio)
        console.log("Starting at: " + x + ", " + y)
        prev_pen = [1, 0, 0];
        let pen_is_up = true;
        bot.on('connected', async () => {
        for (let value of strokes) {
            // sample the next pen's states from our probability distribution
            [dx, dy, pen_down, pen_up, pen_end] = value;
            //dx = dx + 400
            //dy = dy + 400
            if (prev_pen[2] == 1) { // end of drawing.
                console.log("Drawing done");
                break;
            }

            if (prev_pen[0] == 1) {
                if (pen_is_up) {
                    bot.moveTo({
                        x: x,
                        y: y
                      })
                    bot.penDown();
                    console.log("Pen down, path at: " +x + ", " +y)
                    pen_is_up = false;
                }
                bot.lineTo({
                    x: x + (dx * ratio),
                    y: y + (dy * ratio)
                  })
                
                console.log("Moving to: " + (x + (dx * ratio)) + ", " +(y + (dy*ratio)))
            }

            if (pen_up == 1) {
                bot.penUp();
                console.log("Pen up")
                pen_is_up = true;
            }

            // update the absolute coordinates from the offsets
            x = x + (dx * ratio);
            y = y + (dy * ratio);

             // update the previous pen's state to the current one we just sampled
            prev_pen = [pen_down, pen_up, pen_end];
        }
        
        await bot.home()
        await bot.disconnect()
        console.log(`job's done!`)
      })
}