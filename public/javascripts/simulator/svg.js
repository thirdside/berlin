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
			this.objects[object.id] = this._createSoldiersObject(attrs);
		else if (object.type == 'city')
			this.objects[object.id] = this._createCityObject(attrs);
		else if (object.type == 'node')
			this.objects[object.id] = this._createNodeObject(attrs);
		else if (object.type == 'background')
			this.objects[object.id] = this._createBackgroundObject(object.img, object.tile);
		else if (object.type == 'path')
			this.objects[object.id] = this._createPathObject(object.from, object.to, object.controlRatio);
		else if (object.type == 'move')
			this.objects[object.id] = this._createMoveObject(object, attrs);
		else if (object.type == 'combat')
			this.objects[object.id] = this._createCombatObject(object, attrs);			
	},
	
	addAnimation: function (id, attrs, length)
	{
		if (Object.keys(attrs).length != 0) {
			if (attrs.start)
				attrs.start = null;
			
			if (attrs['animateAlong'])
				this._animateAlong(this.objects[id], attrs['animateAlong'], length);
				//this.objects[id].animateAlong(attrs['path'], length, attrs['rotate']);
			
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
			color: "#ffffff",
			blurryColor: '#ffffff',
			strokeWidth: 3,
			lineJoin: 'round',
			blurryOpacity: 0.3,
			opacity: 0.1,
			dashes: '5,5'
		};
		
		// format and data of the path
		var pathFormat = "M #{from.x} #{from.y} Q #{control.x} #{control.y} #{to.x} #{to.y}";
		
		var data =
		{
		    'from': from,
			'to': to,
			'control': controlRatio
		};

		var pathData = pathFormat.interpolate(data);
		
		// draw the blurry path
		var blurryPath = this.raphael.path(pathData);
		blurryPath.attr({
			'stroke': 			options.blurryColor,
			'stroke-width': 	options.strokeWidth,
			'stroke-linejoin': 	options.lineJoin,
			'stroke-dasharray': options.dashes,
			'opacity':			options.blurryOpacity
		});		
		blurryPath.blur(1);
		
		return blurryPath;
	},

	_createSoldiersObject: function (attrs)
	{
		// draw blurry back
		var blurryText = this.raphael.text(attrs.x, attrs.y, attrs.count);
		
		blurryText.attr({
			'font': attrs.font,
			'font-weight': attrs.fontWeight,
			'font-size': attrs.fontSize + 5,
			'fill': attrs.blurColor,
			'opacity': attrs.opacity
		});
		
		blurryText.blur(2);
		
		
		// draw text
		var text = this.raphael.text(attrs.x, attrs.y, attrs.count);
		
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
		// colorize
		var circlePosition = {
			x: attrs.x + attrs.width / 2,
			y: attrs.y + attrs.height / 2
		};		
		
		var circle = this.raphael.circle(circlePosition.x, circlePosition.y, attrs.radius + 20);
		circle.attr({'opacity': 1, 'fill': attrs.color, 'stroke': 'none'});
		
		// draw the city
		var image = this.raphael.image(
			attrs.img.src,
			attrs.x,
			attrs.y,
			attrs.width,
			attrs.height
		);
		
		if (attrs.color == '#FFFFFF')
		{
			circle.remove();
			return image;
		}
		
		var city = this.raphael.set();
		city.push(image, circle);
		
		return city;
	},
	
	_createNodeObject: function (attrs)
	{
		// colorize
		var circlePosition = {
			x: attrs.x + attrs.width / 2,
			y: attrs.y + attrs.height / 2
		};		
		
		var circle = this.raphael.circle(circlePosition.x, circlePosition.y, attrs.radius + 10);
		circle.attr({'opacity': 1, 'fill': attrs.color, 'stroke': 'none'});
		
		var image = this.raphael.image(
			attrs.img.src,
			attrs.x,
			attrs.y,
			attrs.width,
			attrs.height
		);
		
		if (attrs.color == '#FFFFFF')
		{
			circle.remove();
			return image;
		}
		
		var node = this.raphael.set();
		node.push(image, circle);
		
		return node;
	},
	
	_createMoveObject: function (object, attrs)
	{
		// get the position
		var position = (attrs['setPositionFromPath']) ? this._getPositionFromPath(attrs['setPositionFromPath']) : {
			x: object.from.x,
			y: object.from.y
		};
		
		// create the background circle
		var circle = this.raphael.circle(position.x, position.y, object.radius);
		circle.attr({'opacity': attrs['opacity'], 'fill': object['color'], 'stroke': 'none'});

		// create the army graphic
		var army = this.raphael.image(
			attrs.img.src,
			position.x - attrs.img.width / 2,
			position.y - attrs.img.height / 2,
			attrs.img.width,
			attrs.img.height);
			
		army.attr({
			'opacity': attrs['opacity'],
			'rotation': 180
		});

        // create the soldiers count
		var textAttrs = object.countAttrs;
		textAttrs.x = position.x;
		textAttrs.y = position.y;		
		textAttrs.opacity = attrs['opacity'];
		textAttrs.count = object.count;
		
		var set = this._createSoldiersObject(textAttrs);

		set.push(circle);
		set.push(army);	
		return set;
	},
	
	_createCombatObject: function (object, attrs)
	{
		// create the combat graphic
		var image = this.raphael.image(
			attrs.img.src,
			attrs.x - attrs.img.width / 2,
			attrs.y - attrs.img.height / 2,
			attrs.img.width,
			attrs.img.height);
		
		image.attr({
			'scale': attrs['scale'],
			'opacity': attrs['opacity']
			});
			
		// create the combat quote
		var text = this.raphael.text(attrs.x, attrs.y, object.text);
		text.attr(object.textAttrs);

		var combat = this.raphael.set();
		combat.push(image, text);

		return combat;
	},	
	
	_animateAlong: function (object, attrs, length)
	{
		// get the full path
		var path = this.raphael.path(attrs['path']);
		
		// prepare the partial path
		var pathLength = path.getTotalLength();
		var sub = path.getSubpath(attrs['start'] * pathLength, attrs['end'] * pathLength);
		
		// remove the full path
		path.remove();
		
		// get the starting angle
		//var rotationStart = this._getRotationFromPath(sub, 1, true);
		//var tmp = this.raphael.path(sub);
		//var rotationStart = tmp.getPointAtLength(1).alpha;
		//var rotationEnd = rotationStart; //tmp.getPointAtLength(tmp.getTotalLength() * 0.999).alpha;
		//tmp.remove();
		
		// animate along the partial path
		//object.attr({'rotation': 180});
		object.animateAlong(sub, length, true, function() {
			//object.attr({'rotation': 0});
		});
	},
	
	_getPositionFromPath: function (data)
	{
		// get the full path
		var path = this.raphael.path(data['path']);
		
		// prepare the partial path
		var pathLength = path.getTotalLength();
		var position = path.getPointAtLength(path.getTotalLength() * data['at']);
		
		// remove the full path
		path.remove();
		
		return position;
	},
	
	_getRotationFromPath: function (pathData, positionPourc, reverse)
	{
		// prepare the path
		var path = this.raphael.path(pathData);
		var length = path.getTotalLength();
		var positionBegin = path.getPointAtLength(length * positionPourc);
		var positionEnd = path.getPointAtLength(length * (reverse? Math.max(0, positionPourc - 0.001) : Math.min(100, positionPourc + 0.001)));

		// remove the path
		path.remove();

		// compute the angle
		var vector =
		{
			x: positionEnd.x - positionBegin.x,
			y: positionEnd.y - positionBegin.y
		}
		
		var angleRad = Math.atan2(vector.y, vector.x);
		
		return angleRad * (180 / Math.PI);
	}
});
