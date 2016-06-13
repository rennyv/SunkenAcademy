enchant();
window.onload = function () {
  var game = new Game(window.screen.height, window.screen.width);
  
  game.keybind(32, 'a');
  game.spriteSheetWidth = 512;
  game.spriteSheetHeight = 32;
  game.itemSpriteSheetWidth = 64; 
  game.preload(['../img/chara0.png', '../img/sprites.png']); //['../img/sprites.png', '../img/items.png']
 /* game.items = [{ price: 1000, decription: "Hurter", id: 0},
              {price: 5000, decription: "Drg. Paw", id: 1 },
              {price: 5000, decription: "Ice Magic", id: 2},
              {price: 60, decription: "Chess Set", id: 3}];
              */
  game.fps = 15;
  game.spriteWidth = 32;
  game.spriteHeight = 32;
  game.scale = 1.0;

  var map = new Map(game.spriteWidth, game.spriteHeight);
  var foregroundMap = new Map(game.spriteWidth, game.spriteHeight);

  var setMaps = function() {
    map.image = game.assets['../img/sprites.png'];
    map.loadData(mapData);
    foregroundMap.image = game.assets['../img/sprites.png'];
    foregroundMap.loadData(foregroundData);
    var collisionData = [];
    for(var i = 0; i < foregroundData.length; i++ ) {
      collisionData.push([]);
      for(var j = 0; j < foregroundData[0].length; j++){
        var collision = foregroundData[i][j] % 13 > 1 ? 1 : 0;
        collisionData[i][j] = collision;
      }
    }
    map.collisionData = collisionData;
  };

  var setStage = function(){
    var stage = new Group();
    stage.addChild(map);
    //stage.addChild(player);

    //var pad = new enchant.ui.Pad();
    //pad.moveTo(0, 300);
    //stage.addChild(pad);
    stage.addChild(foregroundMap);
    game.rootScene.addChild(stage);
  }

  game.onload = function () {
    //var map = new Map(32,32);
    //map.image = game.assets['../img/sprites.png'];
    //map.loadData(mapData);

    ///var scene = new Scene();
    ///scene.addChild(map);
    ///game.pushScene(scene);
    setMaps();
    setStage();
    ///var scene = new Scene();
    ///scene.addChild(map);
    //var sprite = new Sprite(32, 32);
    //sprite.image = game.assets['../img/chara0.png'];
    //scene.addChild(sprite);
    //game.pushScene(scene);
    //game.rootScene.on('enterframe', function(e) {
    //  game.focusViewport();
    //});
  };
  game.start();
}