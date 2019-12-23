# infinite-doodles
Use Sketch-RNN to make ML generated doodles for Line-Us to draw

## Background
Sketch-RNN is a genarative recurrent nueral network that can draw common objects. I am not going to even try to explain how it works.
I will let the geniuses at Google do [that](https://ai.googleblog.com/2017/04/teaching-machines-to-draw.html).

Sketch-RNN is great a drawing crappy doodles of everyday objects. It can be a bit unpredictable. Sometimes what it comes up with are totally recognizable, others are a bit of a mess.
It is an adventure!

(Line-Us)[https://www.line-us.com] is the perfect pairing for Sketch-RNN. It is a little robot drawing arm, that does an ok job of recreating art work. It is a little wobbly and the lines aren't perfect.
This compliments the crazy stuff that Sketch-RNN comes up with.

## Using It

You should already have setup up Line-Us and tried doing a couple drawings. The computer you are running this on should be on the same network as your Line-Us.

First - get **Node** setup on your system.

Then, load all of the required modules:

`npm install`

and now run it!

`node index.js`


## CATS!

It is setup to run using the Cat model. You can switch out it for other models that are in the json format. I have also included the bus model.
