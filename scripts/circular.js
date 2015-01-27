jQuery(document).ready(function($){

var w = 500,
	h = 500,
	radius = Math.min(w,h) / 2,
	circle_size = 40,
	white_key_size = 60,
	black_key_size = 46,
	padding = 60;

var full_circle = 2 * Math.PI;

var note_orders = {
	fifths: [0,7,2,9,4,11,6,1,8,3,10,5],
	semitones: [0,1,2,3,4,5,6,7,8,9,10,11]
};

function getNotes() {
	var layout_input = $('#select-layout').attr('data-selected');
	var order_input = $('#select-pitch-order').attr('data-selected');
	var order = note_orders[order_input];
	var notes = [];
	for (var i = 0; i < order.length; i++) {
		notes[i] = Motive.primitives.pitch_classes[order[i]];
	}
	return notes;
}

var viz = d3.select('#viz').append('svg:svg')
	.attr('class', 'svg-base')
	.attr('width', 500)
	.attr('height', 500)
	.attr('preserveAspectRatio', 'xMidYMid meet')
	.attr('viewBox', '0 0 ' + w + ' ' + h);

var center = viz.append('svg:g')
	.attr('transform', 'translate(' + w/2 + ',' + h/2 + ')')
	.attr('class', 'center');

//GUITAR
var string_numbers = [1,2,3,4,5,6],
	fret_numbers = [0,1,2,3,4];
var string_spacing = 60,
	fret_spacing = 90;

var fretboard = center.append('svg:g')
	.attr('class', 'fretboard')
	.attr('opacity', 0);

var frets = fretboard.selectAll('.fret')
	.data(fret_numbers)
	.enter().append('svg:line')
		.attr('class', function(d){ return d !== 0 ? 'fret' : 'nut'; })
		.attr('data-fret-number', function(d){ return d; })
		.attr('x1', function(d){ return (-0.5 * (fret_numbers.length * fret_spacing)) + ((d + 1) * fret_spacing) -10; })
		.attr('x2', function(d){ return (-0.5 * (fret_numbers.length * fret_spacing)) + ((d + 1) * fret_spacing) -10; })
		.attr('y1', function(d){ return (-0.5 * ((string_numbers.length - 1) * string_spacing)); })
		.attr('y2', function(d){ return (0.5 * ((string_numbers.length - 1) * string_spacing)); })
		.attr('stroke-width', function(d){ return d !== 0 ? 12 : 20; })
		.attr('stroke', function(d){ return d !== 0 ? '#ccc' : '#ffffef'; })
		.attr('stroke-linecap', function(d){ return d !== 0 ? 'round' : 'square'; });
var strings = fretboard.selectAll('.string')
	.data(string_numbers)
	.enter().append('svg:line')
		.attr('class', 'string')
		.attr('data-string-number', function(d){ return d; })
		.attr('x1', function(d){ return -0.5 * (fret_numbers.length * fret_spacing); })
		.attr('x2', function(d){ return 0.5 * (fret_numbers.length * fret_spacing); })
		.attr('y1', function(d){ return (-0.5 * ((string_numbers.length - 1) * string_spacing)) + ((d - 1) * string_spacing); })
		.attr('y2', function(d){ return (-0.5 * ((string_numbers.length - 1) * string_spacing)) + ((d - 1) * string_spacing); })
		.attr('stroke-width', function(d){ return 1 + (1 * d); })
		.attr('stroke', '#bbb')
		.attr('stroke-linecap', 'round');


function update() {
	var layout = $('#select-layout').attr('data-selected');
	var data = getNotes();
	var dots = center.selectAll('.dot')
		.data(data, function(d){ return d.value; });

	//ENTER
	var dotEnter = dots.enter().append('svg:g')
		.attr('class', function(d){
			if (d.natural) { return 'white dot'; }
			else { return 'black dot'; }
		})
		.attr('data-natural', function(d){ return d.natural; })
		.attr('data-flat', function(d){ return d.flat; })
		.attr('data-sharp', function(d){ return d.sharp; })
		.attr('data-dblflat', function(d){ return d.dblflat; })
		.attr('data-dblsharp', function(d){ return d.dblsharp; })
		.attr('transform', function(d,i){ return 'translate(' + Math.sin(i/12 * full_circle) * (radius - padding) + ',' + (-1 * Math.cos(i/12 * full_circle) * (radius - padding)) + ')'; });

	dotEnter.append('svg:rect')
		.attr('class', 'note')
		.attr('x', -1 * circle_size)
		.attr('y', -1 * circle_size)
		.attr('width', 2 * circle_size)
		.attr('height', 2 * circle_size)
		.attr('rx', circle_size)
		.attr('ry', circle_size)
		.attr('stroke-width', 1);

	dotEnter.append('svg:text')
		.attr('class', 'label')
		.attr('x', 0)
		.attr('y', 0)
		.attr('dy', '0.34em')
		.attr('opacity', 1)
		.style('text-anchor', 'middle')
		.text(function(d){ return d.common; });

	//necessary in order to keep black keys on top of white keys
	d3.selectAll('.dot').sort(function(a,b){
		return a.natural ? -1 : 1;
	});

	//LAYOUT FUNCTIONS FOR UPDATE STAGE
	function layoutCircle() {
		d3.select('.fretboard').transition().duration(2000)
			.attr('opacity', 0);
		dots.transition().duration(2000)
			.attr('transform', function(d,i){ return 'translate(' + Math.sin(i/12 * full_circle) * (radius - padding) + ',' + (-1 * Math.cos(i/12 * full_circle) * (radius - padding)) + ')'; });
		dots.selectAll('.note').transition().duration(2000)
			.attr('x', -1 * circle_size)
			.attr('y', -1 * circle_size)
			.attr('width', 2 * circle_size)
			.attr('height', 2 * circle_size)
			.attr('rx', circle_size)
			.attr('ry', circle_size);
		dots.selectAll('.label').transition().duration(2000)
			.attr('x', 0)
			.attr('y', 0);
	}
	function layoutPiano() {
		d3.select('.fretboard').transition().duration(2000)
			.attr('opacity', 0);
		dots.transition().duration(2000)
			.attr('transform', function(d,i){
				var top = -0.5 * (4 * white_key_size),
					left = -0.5 * (7 * white_key_size);

				var translation = '';
				switch(d.value) {
					case 0: translation = 'translate(' + (left + 0) + ',' + top + ')';
					break;
					case 1: translation = 'translate(' + (left + ((1 * white_key_size) - (0.5 * black_key_size))) + ',' + top + ')';
					break;
					case 2: translation = 'translate(' + (left + (1 * white_key_size)) + ',' + top + ')';
					break;
					case 3: translation = 'translate(' + (left + ((2 * white_key_size) - (0.5 * black_key_size))) + ',' + top + ')';
					break;
					case 4: translation = 'translate(' + (left + (2 * white_key_size)) + ',' + top + ')';
					break;
					case 5: translation = 'translate(' + (left + (3 * white_key_size)) + ',' + top + ')';
					break;
					case 6: translation = 'translate(' + (left + ((4 * white_key_size) - (0.5 * black_key_size))) + ',' + top + ')';
					break;
					case 7: translation = 'translate(' + (left + (4 * white_key_size)) + ',' + top + ')';
					break;
					case 8: translation = 'translate(' + (left + ((5 * white_key_size) - (0.5 * black_key_size))) + ',' + top + ')';
					break;
					case 9: translation = 'translate(' + (left + (5 * white_key_size)) + ',' + top + ')';
					break;
					case 10: translation = 'translate(' + (left + ((6 * white_key_size) - (0.5 * black_key_size))) + ',' + top + ')';
					break;
					case 11: translation = 'translate(' + (left + (6 * white_key_size)) + ',' + top + ')';
					break;
				}
				return translation;
			});
		dots.selectAll('.note').transition().duration(2000)
			.attr('x', 0)
			.attr('y', 0)
			.attr('rx', white_key_size / 6)
			.attr('ry', white_key_size / 6)
			.attr('width', function(d){ return d.natural ? white_key_size : black_key_size; })
			.attr('height', function(d){ return d.natural ? 4 * white_key_size : 8/3 * white_key_size; });
		dots.selectAll('.label').transition().duration(2000)
			.attr('x', function(d){ return d.natural ? 0.5 * white_key_size : 0.5 * black_key_size; })
			.attr('y', function(d){ return d.natural ? 3.6 * white_key_size : 3 * black_key_size; });
	}
	function layoutGuitar() {
		var gtr_circle_size = 0.6 * circle_size;
		d3.select('.fretboard').transition().duration(2000)
			.attr('opacity', 1);
		dots.transition().duration(2000)
			.attr('transform', function(d,i){
				var top = (-0.5 * (string_numbers.length * string_spacing)) - (0.5 * string_spacing),
					left = (-0.5 * (fret_numbers.length * fret_spacing)) + (0.5 * fret_spacing) - 10;

				var translation = '';
				switch(d.value) {
					case 0: translation = 'translate(' + (left + (3 * fret_spacing)) + ',' + (top + (5 * string_spacing)) + ')';
					break;
					case 1: translation = 'translate(' + (left + (4 * fret_spacing)) + ',' + (top + (5 * string_spacing)) + ')';
					break;
					case 2: translation = 'translate(' + (left + (0 * fret_spacing)) + ',' + (top + (4 * string_spacing)) + ')';
					break;
					case 3: translation = 'translate(' + (left + (1 * fret_spacing)) + ',' + (top + (4 * string_spacing)) + ')';
					break;
					case 4: translation = 'translate(' + (left + (2 * fret_spacing)) + ',' + (top + (4 * string_spacing)) + ')';
					break;
					case 5: translation = 'translate(' + (left + (3 * fret_spacing)) + ',' + (top + (4 * string_spacing)) + ')';
					break;
					case 6: translation = 'translate(' + (left + (4 * fret_spacing)) + ',' + (top + (4 * string_spacing)) + ')';
					break;
					case 7: translation = 'translate(' + (left + (0 * fret_spacing)) + ',' + (top + (3 * string_spacing)) + ')';
					break;
					case 8: translation = 'translate(' + (left + (1 * fret_spacing)) + ',' + (top + (3 * string_spacing)) + ')';
					break;
					case 9: translation = 'translate(' + (left + (2 * fret_spacing)) + ',' + (top + (3 * string_spacing)) + ')';
					break;
					case 10: translation = 'translate(' + (left + (3 * fret_spacing)) + ',' + (top + (3 * string_spacing)) + ')';
					break;
					case 11: translation = 'translate(' + (left + (0 * fret_spacing)) + ',' + (top + (2 * string_spacing)) + ')';
					break;
				}
				return translation;
			});
		dots.selectAll('.note').transition().duration(2000)
			.attr('x', -1 * gtr_circle_size)
			.attr('y', -1 * gtr_circle_size)
			.attr('rx', gtr_circle_size)
			.attr('ry', gtr_circle_size)
			.attr('width', 2 * gtr_circle_size)
			.attr('height', 2 * gtr_circle_size);
		dots.selectAll('.label').transition().duration(2000)
			.attr('x', 0)
			.attr('y', 0);

	}
	//UPDATE

	if (layout === 'circle') {
		layoutCircle();
	} else if (layout === 'piano') {
		layoutPiano();
	} else if (layout === 'guitar') {
		layoutGuitar();
	}
}



//events

$(window).resize(function(){
	$('.inputs').css('height', $(window).innerHeight());
});

$('.select').children('.option').click(function(){
	var value = $(this).attr('value');
	$(this).siblings().attr('data-selected', 'unselected');
	$(this).attr('data-selected', 'selected');
	$(this).parent().attr('data-selected', value);
	showContextualInputs();
	update();
});

$('#select-accidentals').children('.option').click(function(){
	d3.selectAll('.label').transition().duration(300)
		.attr('opacity', 0)
	.transition().delay(300).duration(500)
		.attr('opacity', 1)
		.text(function(d){
			var accidentals = $('#select-accidentals').attr('data-selected');
			var text = '';
			switch(accidentals) {
				case 'common': text = d.common;
				break;
				case 'flats': text = d.natural ? d.natural : d.flat;
				break;
				case 'sharps': text = d.natural ? d.natural : d.sharp;
				break;
			}
			return text;
		});
});

function showContextualInputs(){
	if ($('#select-layout').attr('data-selected') !== 'circle') {
		$('#select-pitch-order, label[for="select-pitch-order"]').slideUp();
	} else {
		$('#select-pitch-order, label[for="select-pitch-order"]').slideDown();
	}

	$('.labeled-select').animate('all', 1000);
}

//initialize view
update();

});