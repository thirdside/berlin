/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * author: Jodi Giordano <giordano.jodi@gmail.com> @jodi
 * website: thirdside.ca
 * date: 12/04/2011
 */


 TS.SVG = Class.create(TS.Drawable, {
	initialize: function ($super, container, position, size, translate)
	{
		$super(container, position, size, translate);
		this.raphael = Raphael(this.position.x, this.position.y, this.size.width, this.size.height);
		container.insert(this.raphael.canvas);
		
		this.objects = {};
	},
	
	clear: function ()
	{
		this.raphael.clear();
	},
	
	addObject: function (object, attrs)
	{
		if (object.type == 'spawn')
			this.objects[object.id] = this._createSpawnObject(object.count, attrs);
		else if (object.type == 'soldiers')
			this.objects[object.id] = this._createSoldiersObject(object.count, attrs);
		else if (object.type == 'city')
			this.objects[object.id] = this._createCityObject(attrs);
		else if (object.type == 'node')
			this.objects[object.id] = this._createNodeObject(attrs);
		else if (object.type == 'arrow')
			this.objects[object.id] = this._createArrowObject(object, attrs);
		else if (object.type == 'background')
			this.objects[object.id] = this._createBackgroundObject(object.img);
		else if (object.type == 'path')
			this.objects[object.id] = this._createPathObject(object.from, object.to, object.controlRatio);					
	},
	
	addAnimation: function (id, attrs, length)
	{
		if (Object.keys(attrs).length != 0) {
			if (attrs.start)
				attrs.start = null;
			
			this.objects[id].animate(attrs, length);
		}
	},
	
	_createBackgroundObject: function (img, tile)
	{
		if (!tile)
		{
			this.raphael.image(img.src, 0, 0, img.width, img.height);
			return;
		}
		
		for (var i = 0; i < 6; i++) //todo: don't haaaaaaardcode.
			this.raphael.image(
				img.src,
				(i % 3 | 0) * img.width,
				(i / 3 | 0) * img.height,
				img.width,
				img.height
			);
	},
	
	_createPathObject: function (from, to, controlRatio)
	{
		options = {
			color: "#000000",
			blurryColor: '#636363',
			strokeWidth: 3,
			lineJoin: 'round'
		};
		
		// format and data of the path
		var pathFormat = "M #{from.x} #{from.y} Q #{control.x} #{control.y} #{to.x} #{to.y}";
		
		var data =
		{
		    'from': from,
			'to': to,
			'control': this.getQuadraticCurvePoint(from, to, controlRatio)
		};

		var pathData = pathFormat.interpolate(data);
		
		// draw the blurry path
		var blurryPath = this.raphael.path(pathData);
		blurryPath.attr({
			'stroke': 			options.blurryColor,
			'stroke-width': 	options.strokeWidth + 3,
			'stroke-linejoin': 	options.lineJoin
		});		
		blurryPath.blur(1);
		
		// draw the path
		var path = this.raphael.path(pathData);
		path.attr({
			'stroke': 			options.color,
			'stroke-width': 	options.strokeWidth,
			'stroke-linejoin': 	options.lineJoin
		});
		
		var set = this.raphael.set();
		set.push(blurryPath, path);
		
		return set;
	},

	_createSoldiersObject: function (count, attrs)
	{
		// draw blurry back
		var blurryText = this.raphael.text(attrs.x, attrs.y, count);
		
		blurryText.attr({
			'font': attrs.font,
			'font-weight': attrs.fontWeight,
			'font-size': attrs.fontSize + 5,
			'fill': attrs.blurColor,
			'opacity': attrs.opacity
		});
		
		blurryText.blur(2);
		
		
		// draw text
		var text = this.raphael.text(attrs.x, attrs.y, count);
		
		text.attr({
			'font': attrs.font,
			'font-weight': attrs.fontWeight,
			'font-size': attrs.fontSize,
			'fill': attrs.fill,
			'opacity': attrs.opacity
		});
		
		var set = this.raphael.set();
		set.push(text, blurryText);
		
		return set;
	},	

	_createSpawnObject: function (count, attrs)
	{
		// draw blurry back
		var blurryText = this.raphael.text(attrs.x, attrs.y, count);
		
		blurryText.attr({
			'font': attrs.font,
			'font-weight': attrs.fontWeight,
			'font-size': attrs.fontSize + 5,
			'fill': attrs.blurColor,
			'opacity': attrs.opacity
		});
		
		blurryText.blur(2);
		
		
		// draw text
		var text = this.raphael.text(attrs.x, attrs.y, count);
		
		text.attr({
			'font': attrs.font,
			'font-weight': attrs.fontWeight,
			'font-size': attrs.fontSize,
			'fill': attrs.fill,
			'opacity': attrs.opacity
		});
		
		var set = this.raphael.set();
		set.push(text, blurryText);
		
		return set;
	},
	
	_createCityObject: function (attrs)
	{
		var city = this.raphael.set();
		
		$A(TS.cities[attrs.layout]).each(function(position)
		{
			var realPosition =
			{
				x: attrs.x + (position.x * attrs.radius * attrs.spacing) + (position.x * 3),
				y: attrs.y + (position.y * attrs.radius * attrs.spacing) + (position.y * 3)
			};
			
			city.push(
				this.raphael.image(
					attrs.img.src,
					realPosition.x,
					realPosition.y,
					attrs.width,
					attrs.height
				)
			);
			
			//colorize
			var rectPosition = {
				x: realPosition.x + 5,
				y: realPosition.y + 5
			};
			
			var rect = this.raphael.rect(rectPosition.x, rectPosition.y, attrs.width - 10, attrs.height - 10);
			rect.attr({'opacity': 0.8, 'fill': attrs.color, 'stroke': 'none'});
			city.push(rect);
			
		}, this);
		
		return city;
	},
	
	_createNodeObject: function (attrs)
	{
		var image = this.raphael.image(
			attrs.img.src,
			attrs.x,
			attrs.y,
			attrs.width,
			attrs.height
		);
		
		// colorize
		var circlePosition = {
			x: attrs.x + attrs.width / 2,
			y: attrs.y + attrs.height / 2
		};		
		
		var circle = this.raphael.circle(circlePosition.x, circlePosition.y, attrs.radius + 1);
		circle.attr({'opacity': 0.8, 'fill': attrs.color, 'stroke': 'none'});
		
		var node = this.raphael.set();
		node.push(image, circle);
		
		return node;
	},
	
	_createArrowObject: function (object, attrs)
	{
		// format and data of the path
		var pathFormat = "M #{from.x} #{from.y} Q #{control.x} #{control.y} #{to.x} #{to.y}";
		var pathFormatStraight = "M #{from.x} #{from.y} L #{to.x} #{to.y}";
		
		// find starting and ending points of the curve
		var data =
		{
		    from: object.backPointer ? Object.clone(object.to) : Object.clone(object.from),
			to: object.backPointer ? Object.clone(object.from) : Object.clone(object.to),
		};
		
		data.from.x += this.raphael.width; //todo: Point object
		data.from.y += this.raphael.height;
		data.to.x += this.raphael.width;
		data.to.y += this.raphael.height;
		
		data.control = this.getQuadraticCurvePoint(data.from, data.to, object.controlRatio);
		
		var pathData = pathFormat.interpolate(data);
		
		var path = this.raphael.path(pathData);
		
		var pathLength = path.getTotalLength();
		data.from = path.getPointAtLength(pathLength * (object.backPointer ? 0.95 : 0.05));
		data.to = path.getPointAtLength(pathLength * (object.backPointer ? 0.85 : 0.15));
		
		data.from.x -= this.raphael.width; //todo: Point object
		data.from.y -= this.raphael.height;
		data.to.x -= this.raphael.width;
		data.to.y -= this.raphael.height;
		data.control.x -= this.raphael.width;
		data.control.y -= this.raphael.height;		
		
		// draw the path
		pathData = pathFormatStraight.interpolate(data);
		
		var straightPath = this.raphael.path(pathData);
		straightPath.attr({
			'stroke': 			object.color,
			'stroke-width': 	3,
			'stroke-linejoin': 	'round',
			'opacity': attrs.opacity
		});
		
		// format and data of the arrow
		var arrowFormat = "M #{to.x} #{to.y} L #{arrow1.x} #{arrow1.y} M #{to.x} #{to.y} L #{arrow2.x} #{arrow2.y}";


		pathLength = straightPath.getTotalLength();
		var positionBeforeEnd = straightPath.getPointAtLength(pathLength * (object.backPointer ? 0.02 : 0.98));

		var angle = Math.atan2(data.to.y - positionBeforeEnd.y, data.to.x - positionBeforeEnd.x);
		var angle1 = angle + Math.PI / 8;
		var angle2 = angle - Math.PI / 8;
		var data = Object.extend(data, {
			arrow1: {'x': Math.round(data.to.x - Math.cos(angle1) * 15), 'y': Math.round(data.to.y - Math.sin(angle1) * 15)},
			arrow2: {'x': Math.round(data.to.x - Math.cos(angle2) * 15), 'y': Math.round(data.to.y - Math.sin(angle2) * 15)}
		});
		
		pathData = arrowFormat.interpolate(data);
		
		// draw the arrow		
		var arrowPath = this.raphael.path(pathData);
		arrowPath.attr({
			'stroke': 			object.color,
			'stroke-width': 	3,
			'stroke-linejoin': 	'round',
			'opacity': attrs.opacity
		});
		
		// draw soldier count
		positionBeforeEnd = straightPath.getPointAtLength(pathLength * (object.backPointer ? 0.20 : 0.80));
		positionBeforeEnd = this.getRelativePosition(positionBeforeEnd);

		var textAttrs = object.countAttrs;
		textAttrs.x = data.from.x;
		textAttrs.y = data.from.y;
		textAttrs.opacity = attrs.opacity;

		var set = this._createSoldiersObject(object.count, textAttrs);
		
		set.push(straightPath);
		set.push(arrowPath);
		
		return set;
	}	
});
