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
    stage.addChild(player);

    var pad = new enchant.ui.Pad();
    pad.moveTo(0, 650);
    stage.addChild(pad);

    var buttonB = new enchant.ui.Button("B", "light");
    buttonB.moveTo(180,710);
    game.currentScene.addChild(buttonB);

    var buttonA = new enchant.ui.Button("A", "blue");
    buttonA.moveTo(230,710);
    game.currentScene.addChild(buttonA);
    
    buttonA.ontouchstart = function() {
      //var playerFacing = player.facing();

      //if (!playerFacing || !spriteRoles[playerFacing]) {
        player.displayStatus();
      //}else{
      //  spriteRoles[playerFacing].action();
      //};
    }


    stage.addChild(foregroundMap);
    
    game.rootScene.addChild(stage);
  }

  var player = new Sprite(game.spriteWidth, game.spriteHeight);

  var setPlayer = function(){
    player.spriteOffset = 5;
    player.startingX = 6;
    player.startingY = 14;
    player.x = player.startingX * game.spriteWidth;
    player.y = player.startingY * game.spriteHeight;
    player.direction = 0;
    player.walk = 0;
    player.frame = player.spriteOffset + player.direction;
    player.image = new Surface(game.spriteSheetWidth, game.spriteSheetHeight);
    player.image.draw(game.assets['../img/sprites.png']);

    player.name = "Steve";
    player.characterClass = "Knight";
    player.exp = 0;
    player.level = 1;
    player.gp = 100;
    player.inventory = [];

    player.levelStats = [{}, { attack: 4, maxHp: 10, maxMp: 0, expMax: 10},
                             { attack: 6, maxHp: 14, maxMp: 0, expMax: 30},
                             { attack: 7, maxHp: 20, maxMp: 5, expMax: 50}
                        ];
        
    player.attack = function() {
      return player.levelStats[player.level].attack;
    };

    player.hp = player.levelStats[player.level].maxHp;
    player.mp = player.levelStats[player.level].maxMp;

    player.statusLabel = new Label("");
    player.statusLabel.width = game.width;
    player.statusLabel.y = undefined;
    player.statusLabel.x = undefined;
    player.statusLabel.color = '#fff';
    player.statusLabel.backgroundColor = '#000';
  };

  player.displayStatus = function()
  {
      player.statusLabel.text = 
        "--" + player.name + " the " + player.characterClass +
        "<br />--HP: " + player.hp + "/" + player.levelStats[player.level].maxHp +
        "<br />--MP: " + player.mp + "/" + player.levelStats[player.level].maxMp +  
        "<br />--Exp: " + player.exp +
        "<br />--Level: " + player.level +
        "<br />--GP: " + player.gp +
        "<br /><br />--Inventory:";
        player.statusLabel.height = 170;
        //player.showInventory(0);    
  };

  player.clearStatus = function(){
    player.statusLabel.text = "";
    player.statusLabel.height = 0;
    //player.hideInventory();
  }

  player.move = function() {
    this.frame = this.spriteOffset + this.direction * 2 + this.walk;

    if(this.isMoving){
      this.moveBy(this.xMovement, this.yMovement);
      if(!(game.frame % 2)){
        this.walk++;
        this.walk %= 2;
      }
      if ((this.xMovement && this.x % 32 === 0) || (this.yMovement && this.y % 32 === 0))
      {
        this.isMoving = false;
        this.walk = 1;
      }
    } else {
      this.xMovement = 0;
      this.yMovement = 0;
      if(game.input.up) {
        this.direction = 1;
        this.yMovement = -4;
        player.clearStatus();
      } else if (game.input.right){
        this.direction = 2;
        this.xMovement = 4;
        player.clearStatus();
      } else if (game.input.left){
        this.direction = 3;
        this.xMovement = -4;
        player.clearStatus();
      } else if (game.input.down){
        this.direction = 0;
        this.yMovement = 4;
        player.clearStatus();
      }
      if(this.xMovement || this.yMovement){
        var x = this.x + (this.xMovement ? this.xMovement / Math.abs(this.xMovement) * 32 : 0  );
        var y = this.y + (this.yMovement ? this.yMovement / Math.abs(this.yMovement) * 32 : 0 );
        if(0<=x&& x < map.width && 0 <= y && y < map.height && !map.hitTest(x,y)){
          this.isMoving = true;
          this.move();
        }
      }
    }
  };

  game.onload = function () {


    setMaps();
    setPlayer();
    setStage();
    //setShopping();
    //setBattle();

    player.on('enterframe', function(){
      player.move();
      if(game.input.a){
      //  var playerFacing = player.facing();
      //  if(!playerFacing || !spriteRoles[playerFacing]){
          player.displayStatus();
      //  }else{
      //    spriteRoles[playerFacing].action;
      //  };
      };
    });


    //game.rootScene.on('enterframe', function(e) {
    //  game.focusViewport();
    //});
  };
  game.start();
}