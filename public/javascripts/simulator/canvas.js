/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * author: Jodi Giordano <giordano.jodi@gmail.com> @jodi
 * website: thirdside.ca
 * date: 12/04/2011
 */

 TS.Canvas = Class.create(TS.Drawable, {
	initialize: function ($super, container, position, size)
	{
		$super(container, position, size);
		
		this.canvas = new Element(
			'canvas',
			{width: this.size.width, height: this.size.height}); //todo: position?
		
		this.canvas.setStyle({
			position: "absolute",
			top: 0
		});
		
		this.context = this.canvas.getContext('2d');
		
		container.insert(this.canvas);
	},
	
	clear: function ()
	{
		this.context.clearRect(0, 0, this.size.width, this.size.height);
	},
	
	image: function (img, position, options)
	{
		options = Object.extend({
			ratio: 1
		}, options || {});
		
		var dimension = {
			width: img.width * options.ratio,
			height: img.height * options.ratio
		}
		
		this.context.drawImage(
			img,
			this.getRelativePosition(position.x, 'width') - dimension.width / 2,
			this.getRelativePosition(position.y, 'height') - dimension.height / 2,
			dimension.width,
			dimension.height);
	},
	
	drawArrow: function (from, to, options)
	{
		options = Object.extend({
			arrow: false,
			bezier: false,
			color: "#000000",
			controlRatio: .035,
			strokeWidth: 4,
			lineJoin: "round",
			arrowSize: 15
		}, options || {});
		
		var inter = {
			fromX: this.getRelativePosition(from.x, 'width'), 
			fromY: this.getRelativePosition(from.y, 'height'), 
			toX: this.getRelativePosition(to.x, 'width'), 
			toY: this.getRelativePosition(to.y, 'height')
		}		
	
		// draw the line	
		this.context.save();
		this.context.fillStyle = options.color;
		this.context.strokeStyle = options.color;
		this.context.lineWidth = options.strokeWidth;
		
		this.context.beginPath();
		this.context.moveTo(inter.fromX, inter.fromY);
		
		if (options.bezier)
		{
			var controlPoints = this.getQuadraticCurvePoint(
				{x: inter.fromX, y: inter.fromY},
				{x: inter.toX, y: inter.toY},
				options.controlRatio);
			
			this.context.quadraticCurveTo(controlPoints.x, controlPoints.y, inter.toX, inter.toY);
		}
		else 
			this.context.lineTo(inter.toX, inter.toY);
		
		this.context.stroke();
		
		this.context.restore();
		
		// draw the arrow
		if (options.arrow)
		{
			var angle = Math.atan2(inter.toY - inter.fromY, inter.toX - inter.fromX);
			var angle1 = angle + Math.PI / 8;
			var angle2 = angle - Math.PI / 8;
			
			var inter = Object.extend(inter, {
				a1X: Math.round(inter.toX - Math.cos(angle1) * options.arrowSize),
				a1Y: Math.round(inter.toY - Math.sin(angle1) * options.arrowSize),
				a2X: Math.round(inter.toX - Math.cos(angle2) * options.arrowSize),
				a2Y: Math.round(inter.toY - Math.sin(angle2) * options.arrowSize)
			});
			

			this.context.save();
			this.context.fillStyle = options.color;
			this.context.strokeStyle = options.color;
			this.context.lineWidth = options.strokeWidth;

			this.context.beginPath();
			this.context.moveTo(inter.toX, inter.toY);
			this.context.lineTo(inter.a1X, inter.a1Y);
			this.context.stroke();
	
			this.context.beginPath();
			this.context.moveTo(inter.toX, inter.toY);
			this.context.lineTo(inter.a2X, inter.a2Y);
			this.context.stroke();

			this.context.restore();
		}
	},
	
	drawBox: function (position, text, options)
	{
		options = Object.extend({
			stroke_color: "#000000",
			text_color:  "#000000",
			fill_color: "#FFFFFF", 
			padding_x: 10,
			padding_y: 7,
			font_size: 14,
			corner_radius: 6,
			width: null,
			height: null
		}, options || {});		

		
		// text dimension
		var textDimension =
		{
			x: this.getRelativePosition(position.x, 'width'),
			y: this.getRelativePosition(position.y, 'height'),
			width: ("" + text).length * (options.font_size / 2),
			height: options.font_size //todo: arbritary
		};
		
		// rectangle dimension
		var rectangleDimension = {
			x: textDimension.x - textDimension.width / 2 - options.padding_x,
			y: textDimension.y - textDimension.height / 2 - options.padding_y,
			width: textDimension.width + options.padding_x * 2,
			height: textDimension.height + options.padding_y * 2
		};

		// draw the rectangle
		this.context.save();
		this.context.fillStyle = options.fill_color;
		this.context.strokeStyle = options.stroke_color;
		
		this.context.fillRect(
			rectangleDimension.x,
			rectangleDimension.y,
			options.width || rectangleDimension.width,
			options.height || rectangleDimension.height
		);
		
		this.context.restore();

		// draw the text		
		this.context.save();
		this.context.font = options.font_size + 'px Verdana';
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";

		this.context.fillText(
			text,
			textDimension.x,
			textDimension.y);

		this.context.restore();
		
		return null;
	}	
});
