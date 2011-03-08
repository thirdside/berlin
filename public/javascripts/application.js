/**
 * author: Christian Blais
 * website: thirdside.ca
 * twitter: @christianblais
 * date: 07/03/2011
 */
var TS = Class.create ({});

TS.AI = Class.create(TS, {
    initialize: function (container, config_path)
    {
        // TODO : create a layer0 canvas for a background image
        this.container = $(container);
        this.config   = null;
        this.canvas   = new Hash();
        this.contexts = new Hash();
        this.images   = new Hash();
        this.nodes    = new Hash();
        this.paths    = new Hash();

        // load config
        new Ajax.Request( config_path, {method: 'get', onComplete: this.onConfigLoad.bindAsEventListener(this)});
    },

    onConfigLoad: function (event)
    {
        this.config = event.responseText.evalJSON();

        this.canvas.set('layer1', new Element('canvas', {id: 'layer1', width: this.config.map.width,  height: this.config.map.height}));
        this.canvas.set('layer2', new Element('canvas', {id: 'layer2', width: this.config.map.width,  height: this.config.map.height}));
        this.canvas.set('layer3', new Element('canvas', {id: 'layer3', width: this.config.map.width,  height: this.config.map.height}));
        
        this.canvas.each(function(canvas){
          this.contexts.set(canvas.key, canvas.value.getContext('2d'));
        }, this);
        
        this.config.types.each(function(type){
            var img = new Image();
            img.onload = this.onImageLoad.bindAsEventListener(this, type.name);
            img.src = type.image;
        }, this);
    },

    onImageLoad: function (event, type)
    {
        this.images.set(type, event.currentTarget);
        
        if (this.images.size() == this.config.types.size())
            this.build();
    },

    build: function ()
    {
        // NODES & CITIES
        this.config.nodes.each(function(node){
            this.nodes.set(node.id, node);
            this.contexts.get('layer2').drawImage(
                    this.images.get(node.type),
                    node.x - this.images.get(node.type).width / 2,
                    node.y - this.images.get(node.type).height / 2
            );
        }, this);

        // PATHS
        this.config.paths.each(function(path){            
            var node1 = this.nodes.get(path.from);
            var node2 = this.nodes.get(path.to);

            if (node1 != null && node2 != null) {
                this.contexts.get('layer1').beginPath();
                this.contexts.get('layer1').moveTo(node1.x, node1.y);
                this.contexts.get('layer1').lineTo(node2.x, node2.y);
                this.contexts.get('layer1').lineWidth = 2;
                this.contexts.get('layer1').stroke();
            } else {
                console.log("Invalid paths");
            }
        }, this);

        // PLAYERS
        this.contexts.get('layer3').globalAlpha = 0.8;
        var soldiers_box_width      = 50;
        var soldiers_box_height     = 25;
        var soldiers_box_padding_x  = 10;
        var soldiers_box_padding_y  = 7;

        this.config.players.each(function(player){
            player.starting_nodes.each(function(starting_node){
                var node = this.nodes.get(starting_node.node);

                this.contexts.get('layer3').fillStyle = player.color;
                this.contexts.get('layer3').fillRect (node.x + soldiers_box_padding_x, node.y + soldiers_box_padding_y, soldiers_box_width, soldiers_box_height);

                this.contexts.get('layer3').fillStyle    = '#000000';
                this.contexts.get('layer3').font         = '20px sans-serif';
                this.contexts.get('layer3').textAlign    = 'center';
                this.contexts.get('layer3').textBaseline = 'top';
                this.contexts.get('layer3').fillText(starting_node.soldiers, node.x + soldiers_box_width / 2 + soldiers_box_padding_x, node.y + soldiers_box_padding_y);
            }, this);
        }, this);

        this.show();
    },

    show:function ()
    {
        this.container.insert(this.canvas.get('layer1'));
        this.container.insert(this.canvas.get('layer2'));
        this.container.insert(this.canvas.get('layer3'));
    }
});
