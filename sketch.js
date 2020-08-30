var generate;
var range;
var reset;
var canvas;
var speed;
var hide;

var info_button;
var info_text;
var info_header;
var resume;

var points = [];
var dot_size;
var dragged_point = -1;
var t = .5;
var phase = 0;
var automate = false;
var timestamp;
var red_dot;
var display_all = true;
var showing_info = false



function setup() {

	generate = createButton("START");		
	canvas = createCanvas(500, 500);
	reset = createButton('RESET');
	range = createSlider(0, 1, .5, 0)
	info_button = createButton("INFO")
	speed = createSlider(0, 1, 0.5, 0);
	hide = createSlider(0, 3, 0, 1);
	info_header = createP("Interactive animation of Bezier spline curves <br>programming by Thomas Koot<hr>")
	resume = createButton("RESUME >>")
	info_text = createP(info_string())

	reset.parent('reset-div')
	canvas.parent('sketch-div');
  	range.parent('extra_info');
  	generate.parent('generate-div')
  	info_button.parent('info_button')
  	speed.parent('extra_info')
  	hide.parent('extra_info')
  	info_header.parent('sketch-div')
  	info_text.parent('sketch-div')
  	resume.parent('sketch-div')
  	
  	info_button.id('info')
  	info_button.class('main_button')
  	generate.class('button_class')
  	reset.class('button_class')
  	range.style('order: 2;') 
  	speed.style('order: 4;')
  	hide.style('order: 6;')
  	info_text.hide();
	resume.id('resume');
	resume.hide();
	resume.class('main_button')
	info_header.id('info_header') 
	info_header.hide()
	info_text.id('info_text')

	canvas.mousePressed(check_points)
	reset.mousePressed(initialize)	
	canvas.mouseReleased(reset_mouse)	
	range.input(update_t)
	generate.mousePressed(toggle_automate)
	hide.input(prepare_canvas)
	info_button.mousePressed(show_info)
	resume.mousePressed(show_info)

  	dot_size = 16;
  	frame = createGraphics(500, 500)

  	
}

function draw() {
	if (hide.value() != 3) {background(255)} else {fill(255, 1); rect(0, 0, width, height)}
	increment_t();
	move_points()
	draw_lines(points)
	if (hide.value() === 0) { display_dots() }
	if (hide.value() === 1) {image(frame, 0, 0)}
	if (red_dot) { 
		fill(255, 20, 20)
		ellipse(main_dot.x, main_dot.y, dot_size, dot_size)
	}


}

function check_points() {
	if (hide.value() > 1) {return}

	removing = false;
	if (frameCount - timestamp < 12) {
		removing = true;
	}
	timestamp = frameCount;

	mouse = new p5.Vector(mouseX, mouseY);

	if (check_red_dot(mouse)) {
		return
	}
	
	for (var i = points.length - 1; i >= 0; i--) {
		if (mouse.dist(points[i]) < dot_size) {
			if (removing) {
				points.splice(i,1)
				if (points.length < 2) {red_dot = null}
			} else {
				dragged_point = i
			}
			display_dots_frame()
			return
		}
	}

	points.push(mouse);
	display_dots_frame()
	
}

function display_dots() {
	noStroke()
	fill(127)
	for (var i = 0; i<points.length; i++) {
		if (i == 0 || i == points.length - 1){
			fill(20, 200, 20)
			ellipse(points[i].x, points[i].y, dot_size, dot_size)
		} else {
			fill(10, 40, 10, 127)
			ellipse(points[i].x, points[i].y, dot_size, dot_size)
		}
	}
}

function display_dots_frame() {
	frame.clear()
	frame.noStroke()
	frame.fill(127)
	for (var i = 0; i<points.length; i++) {
		if (i == 0 || i == points.length - 1){
			frame.fill(20, 200, 20)
			frame.ellipse(points[i].x, points[i].y, dot_size, dot_size)
		} else {
			frame.fill(10, 40, 10, 127)
			frame.ellipse(points[i].x, points[i].y, dot_size, dot_size)
		}
	}
}


function reset_mouse() {
	dragged_point = -1
}

function move_points() {
	if (dragged_point >= 0) {
		points[dragged_point].x = mouseX
		points[dragged_point].y = mouseY
	}
	display_dots_frame()
}

function draw_lines(dots) {
	intermediary_dots = []
	if (dots.length === 2) {
		stroke(255, 20, 20, 200)
		if (hide.value() === 0) {
			strokeWeight(2)
			line(dots[0].x, dots[0].y, dots[1].x, dots[1].y)
			strokeWeight(1)
		}
		main_dot = p5.Vector.sub(dots[1], dots[0])
		main_dot.mult(t).add(dots[0])
		red_dot = main_dot
	}

	if (dots.length > 2) {
		for (var i = 1; i < dots.length; i++) {
			new_line = p5.Vector.sub(dots[i], dots[i-1])
			stroke(0, 127, 40, 50)
			fill(5, 10, 3, 50)
			if (hide.value() === 0) {
				line(dots[i-1].x, dots[i-1].y, dots[i].x, dots[i].y)
			}
			new_line.mult(t)
			new_line.add(dots[i-1])
			intermediary_dots.push(new_line)
			if (hide.value() === 0) {
				ellipse(new_line.x, new_line.y, dot_size/2, dot_size/2)
			}
		}
		draw_lines(intermediary_dots)
	}
}

function update_t() {
	if (!automate) {
		t = range.value();		
	}
}

function increment_t() {
	if (automate) {
		phase += speed.value()/70;
		phase = phase % 2;
		t = abs(phase - 1)
		range.value(t)
	} else {

	}
}

function initialize() {
	points = []
	red_dot = null;
}

function check_red_dot(mouse) {
	if (red_dot) {
		if (mouse.dist(red_dot) < dot_size) {
			if (display_all) {
				display_all = false;
				background(255);	
			} else {
				display_all = true;
			} return true
		}
	} return false;
}

function toggle_automate() {
	if (automate) {
		automate = false;
		range.value(t);
		generate.html('START')
	} else {
		if (phase > 1) {
			phase = 1+t
		} else {
			phase = 1-t;
		}
		automate = true;
		generate.html('STOP')
	}
}

function prepare_canvas() {
	if (hide.value() === 1) {
		display_dots_frame()
	}
}

function info_string() {
	message = "\
	The functioning of Bezier curves is best viewed graphically, so just click the screen to add points, press START\
	and see how the end-points and control points interact. This app allows you to make curves with as many control point\
	as your processor can handle. Points can be modified in real time to see the effect on the drawing of the curve\
	<br>\
	<ul>\
	<li>Click the screen to set a starting point</li>\
	<li>Subsequent clicks will set the end point. The other points will be used as control points</li>\
	<li>Double click to delete a point.</li>\
	<li>Drag to move points.</li>\
	<li>START runs the animation, when the animation is paused, you can manually adjust the LOCATION slider</li>\
	<li>SPEED determines the speed of the animation</li>\
	<li>DISPLAY MODE toggles between different view modes</li>\
	</ul>"
	return message
}

function show_info() {
	if (showing_info) {
		info_header.hide();
		info_text.hide();
		resume.hide();
		canvas.show();
		showing_info = false;
	} else {
		showing_info = true;
		canvas.hide();
		if (automate) {toggle_automate()}
		generate.html('START')
		info_header.show()
		info_text.show();
		resume.show()
	}
}



