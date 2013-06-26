var NODES_PER_LAYER = 6;

var Renderer = {};

Renderer.init = function(canvasId, resourceId, navigationListener){
    Renderer.engine.initParticleSystem();
    Renderer.canvas.init(canvasId);

    Renderer.engine.centerOn(resourceId, function(centralNodeData, childrenNodesData) {
        Renderer.engine.jsonOriginData = centralNodeData;
        Renderer.engine.jsonChildrenData = childrenNodesData;

        Renderer.layers.count = Math.ceil(Renderer.engine.jsonChildrenData.length / NODES_PER_LAYER);

        Renderer.canvas.resize();

        Renderer.engine.particleSystem.renderer = Renderer.loop;
        Renderer.nodes.central = new Renderer.Node(Renderer.engine.jsonOriginData);
        Renderer.layers.init();
        Renderer.layers.display(0);
        Renderer.navigation.navigationListener = navigationListener;
    });
};

Renderer.navigation = {};

Renderer.http = {
    getData: function(resourceId, callback) {
        $.get('/knownodes/:' + resourceId, function(centralNode) {
            $.get('/concepts/:' + resourceId + '/getRelatedKnownodes', function(relatedNodes) {
                callback(centralNode.success, relatedNodes.success);
            });
        });
    }
};

Renderer.engine = {};
Renderer.engine.centerOn = function(resourceId, callback) {
    Renderer.http.getData(resourceId, function(centralNodeData, childrenNodesData) {
        if(callback) callback(centralNodeData, childrenNodesData);
    });
}
Renderer.engine.particleSystem = null;
Renderer.engine.jsonOriginData = null;
Renderer.engine.jsonChildrenData = null;
Renderer.engine.isReady = function(){
    return Renderer.engine.particleSystem !== null && Renderer.canvas.stage !== null;
};

Renderer.engine.initParticleSystem = function(){
    this.particleSystem = arbor.ParticleSystem(1000, 600, 0.5);// create the system with sensible repulsion/stiffness/friction
    this.particleSystem.parameters({gravity:true}); // use center-gravity to make the graph settle nicely (ymmv)
    this.particleSystem.fps(40);

    this.particleSystem.originalPruneEdge = this.particleSystem.pruneEdge;
    this.particleSystem.pruneEdge = function(e){e.data.edge.delete();};
    this.particleSystem.originalPruneNode = this.particleSystem.pruneNode;
    this.particleSystem.pruneNode = function(e){e.data.node.delete();};
};

Renderer.canvas = {};
Renderer.canvas.stage = null;
Renderer.canvas.init = function(canvasId){
    this.stage = new Kinetic.Stage({
        container: canvasId,
        width: 800,
        height: 600,
        fill: "black"
    });
    this.stage.add(Renderer.edges.layer);
    this.stage.add(Renderer.nodes.layer);
    this.stage.add(Renderer.layers.layer);
};
Renderer.canvas.resize = function(){
    var div = $(".ui-layout-center");
    Renderer.engine.particleSystem.screenSize(div.width(), div.height());
    Renderer.engine.particleSystem.screenPadding(80,200,80,80);
    this.stage.setSize(div.width(), div.height());
    Renderer.loop.redraw();
};

Renderer.Layer = function(id){
    this.id = id;
    this.shape = new Kinetic.Rect({
        width: this.width,
        height: this.height,
        x: 0,
        y: id * (this.height + 3) + 20,
        fill: "white"
    });
    this.checkAndSetColor();
    this.shape.layer = this;
    Renderer.layers.layer.add(this.shape);
    this.bindEvents();
    Renderer.layers.list.push(this);
};
Renderer.Layer.prototype = {
    width: 50,
    height: 20,
    delete: function(){
        this.shape.destroy();
        delete this;
    },
    bindEvents: function(){
        this.shape.on('click', this.mouseClick);
        this.shape.on('mouseover', this.mouseOver);
        this.shape.on('mouseout', this.mouseOut);
    },
    mouseOver: function(e){
        new Kinetic.Tween({
            node: this,
            easing: Kinetic.Easings['StrongEaseOut'],
            duration: 0.5,
            scaleX: 1.3
        }).play();
    },
    mouseOut: function(e){
        new Kinetic.Tween({
            node: this,
            easing: Kinetic.Easings['StrongEaseOut'],
            duration: 1,
            scaleX: 1
        }).play();
    },
    mouseClick: function(e){
        Renderer.layers.display(this.layer.id);
    },
    checkAndSetColor: function(){
        var intensity = 255;
        if(this.id === Renderer.layers.current)
            intensity = 150;

        this.shape.setAttrs({
            fillR: intensity,
            fillG: intensity,
            fillB: intensity
        });
    }
};
Renderer.layers = {};
Renderer.layers.list = [];
Renderer.layers.current = -1;
Renderer.layers.layer = new Kinetic.Layer({});
Renderer.layers.init = function(){
    for(var layer in this.list){
        this.list[layer].delete();
    }
    this.list = [];
    for(var i = 0; i < this.count; i++) {
        new Renderer.Layer(i);
    }
};
Renderer.layers.display = function(layer){
    if(layer !== this.current){
        this.current = layer;
        for (var layerId in this.list) {
            this.list[layerId].checkAndSetColor();
        }

        var edges = Renderer.engine.particleSystem.getEdgesFrom(Renderer.nodes.central.node);
        for(var edge in edges)
            Renderer.engine.particleSystem.pruneNode(edges[edge].target);

        for(var i = this.current * NODES_PER_LAYER; i < (this.current + 1) * NODES_PER_LAYER && i < Renderer.engine.jsonChildrenData.length; i++){
            var node = new Renderer.Node(Renderer.engine.jsonChildrenData[i].article);
            new Renderer.Edge(Renderer.nodes.central, node, Renderer.engine.jsonChildrenData[i].connection);
        }
    }
};

Renderer.Node = function(data){
    this.data = data;
    this.displayGroup = new  Kinetic.Group({x:-200, y:-200});
    this.displayPolygon = this.newPolygon();
    this.displayText = this.newText();
    this.node =  Renderer.engine.particleSystem.addNode(this.data.id, {node: this});
    this.displayPolygon.node = this;
    Renderer.nodes.layer.add(this.displayGroup);
    this.tweenPolygonHover = new Kinetic.Tween({
        node: this.displayPolygon,
        duration: 0.3,
        easing: Kinetic.Easings['StrongEaseOut'],
        fillB: 200,
        scaleX: 1.1,
        scaleY: 1.1,
        strokeWidth: 5
    });
    this.tweenTextHover = new Kinetic.Tween({
        node: this.displayText,
        duration: 0.3,
        easing: Kinetic.Easings['StrongEaseOut'],
        fontSize: 20,
        x: 38,
        y: -6,
        width: 300
    });
    this.bindEvents();
};
Renderer.Node.prototype = {
    shape: [[26,15],[0,30],[-26,15],[-26,-15],[0,-30],[26,-15]],
    delete: function(){
        this.displayGroup.destroy();
        Renderer.engine.particleSystem.originalPruneNode(this.node);
        delete this;
    },
    newPolygon: function(){
        var polygon = new Kinetic.Polygon({
            points: this.shape,
            fill: "black",
            stroke: "white",
            strokeWidth: 3
        });
        polygon.node = this;
        this.displayGroup.add(polygon);
        return polygon;
    },
    newText: function(){
        var text = new Kinetic.Text({
            text: this.data.title,
            fill: "white",
            width: 120,
            fontSize: 16
        });
        text.node = this;
        this.displayGroup.add(text);
        text.setPosition(31, -5);
        return text;
    },
    moveTo: function (pos){
        this.displayGroup.setPosition(pos.x, pos.y);
    },
    bindEvents: function(){
        this.displayPolygon.on('mouseover', this.mouseOver);
        this.displayPolygon.on('mouseout', this.mouseOut);
        this.displayPolygon.on('click', this.mouseClick);
        this.displayPolygon.on('dblclick dbltap', this.mouseDblClick);
    },
    mouseDblClick: function() {
        var id = this.node.data.KN_ID;
        Renderer.engine.centerOn(id, function(centralNodeData, childrenNodesData) {

            Renderer.engine.jsonOriginData = centralNodeData;
            Renderer.engine.jsonChildrenData = childrenNodesData;
            Renderer.navigation.navigationListener(id);

            var edges = Renderer.engine.particleSystem.getEdgesFrom(Renderer.nodes.central.node);
            var newCentral;
            for(var edge in edges) {
                var node = edges[edge].target;
                if(node.data.node.data.KN_ID !== id) {
                    Renderer.engine.particleSystem.pruneNode(node);
                } else {
                    newCentral = node.data.node;
                }
            }

            Renderer.nodes.central.delete();

            Renderer.nodes.central = newCentral;

            Renderer.layers.count = Math.ceil(Renderer.engine.jsonChildrenData.length / NODES_PER_LAYER);

            Renderer.layers.init();
            Renderer.layers.current = -1;
            Renderer.layers.display(0);
        });
    },
    mouseOver: function(){
       this.node.tweenPolygonHover.play();
       this.node.tweenTextHover.play();
    },
    mouseOut: function(){
        this.node.tweenPolygonHover.reverse();
        this.node.tweenTextHover.reverse();
    },
    mouseClick: function(){
        Renderer.nodes.selected = this.node;
        var data = this.node.data;
        $("#node-link").attr('href', data.url).text(data.title);
        $("#node-content").html(data.bodyText);
        PanelsHandler.layout.open("west");
    }
};

Renderer.nodes = {};
Renderer.nodes.selected = null;
Renderer.nodes.central = null;
Renderer.nodes.layer = new Kinetic.Layer({});

Renderer.Edge = function(from, to, data){
    this.from = from;
    this.to = to;
    this.data = data;
    this.edge = Renderer.engine.particleSystem.addEdge(from.node, to.node, {edge: this});
    this.line = this.newLine(data);

    this.bindEvents();
};
Renderer.Edge.prototype = {
    delete: function(){
        this.line.destroy();
        Renderer.engine.particleSystem.originalPruneEdge(this.edge);
        delete this;
    },
    newLine: function(connection){
        var color = "white";
        if (connection.connectionType === "explain") {
            color = '#1C75BC';
        } else if (connection.connectionType === "inspire") {
            color = '#FFDE17';
        } else if (connection.connectionType === "question") {
            color = '#39B54A';
        } else if (connection.connectionType === "Wikipedia Link") {
            color = "gray";
        }

        var line =  new Kinetic.Polygon({
            points: [0,0,0,0],
            stroke: color,
            strokeWidth: 2,
            fill: color
        });
        line.edge = this;
        Renderer.edges.layer.add(line);
        return line;
    },
    bindEvents: function(){
        this.line.on("mouseover", this.mouseOver);
        this.line.on("mouseout", this.mouseOut);
    },
    moveTo: function(pos1, pos2){

        function generatePoints(fromx, fromy, tox, toy){
            var hexagon = 30;
            var headlen = 12;
            var angle = Math.atan2(toy-fromy,tox-fromx);

            var newTox = tox-hexagon*Math.cos(angle);
            var newToy = toy-hexagon*Math.sin(angle);

            return [fromx, fromy
                    ,newTox,newToy
                    ,newTox-headlen*Math.cos(angle-Math.PI/6),newToy-headlen*Math.sin(angle-Math.PI/6)
                    ,newTox-headlen*Math.cos(angle+Math.PI/6),newToy-headlen*Math.sin(angle+Math.PI/6)
                    ,newTox,newToy
                    ];
        }

        var points = generatePoints(pos1.x, pos1.y, pos2.x, pos2.y);

        this.line.setAttr('points',points);
    },
    mouseOver: function(){
        new Kinetic.Tween({
            node: this,
            duration: 1,
            easing: Kinetic.Easings['StrongEaseOut'],
            strokeWidth: 5
        }).play();
    },
    mouseOut: function(){
        new Kinetic.Tween({
            node: this,
            duration: 1,
            easing: Kinetic.Easings['StrongEaseOut'],
            strokeWidth: 2
        }).play();
    }
};
Renderer.edges = {};
Renderer.edges.layer = new Kinetic.Layer({});

Renderer.loop = {}
Renderer.loop.init = function(){};
Renderer.loop.redraw = function(){
    //pt1 is centralNode
    Renderer.engine.particleSystem.eachEdge(function(edge, pt1, pt2){
        if(edge.data.edge.data.fromNodeId === Renderer.engine.jsonOriginData.id) {
            edge.data.edge.moveTo(pt1, pt2);
        } else {
            edge.data.edge.moveTo(pt2, pt1);
        }
    });
    Renderer.engine.particleSystem.eachNode(function(node, pt){
        node.data.node.moveTo(pt);
    });
    Renderer.canvas.stage.draw();
};
