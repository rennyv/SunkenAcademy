enchant();
window.onload = function () {
  var game = new Game(window.screen.height, window.screen.width);
  
  game.keybind(32, 'a');
  game.spriteSheetWidth = 512;
  game.spriteSheetHeight = 32;
  game.itemSpriteSheetWidth = 128; 
  game.preload(['../img/items.png', '../img/sprites.png']); 
  game.items = [{ price: 1000, decription: "Hurter", id: 0},
              {price: 5000, decription: "Drg. Paw", id: 1 },
              {price: 5000, decription: "Ice Magic", id: 2},
              {price: 60, decription: "Chess Set", id: 3}];
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
      var playerFacing = player.facing();

      if (!playerFacing || !spriteRoles[playerFacing]) {
        player.displayStatus();
      } else {
        spriteRoles[playerFacing].action();
      };
    }


    stage.addChild(foregroundMap);
    stage.addChild(player.statusLabel);
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
    player.inventory = [0,1,2,3];

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
        player.statusLabel.height = 210;
        player.showInventory(0);    
  };

  player.clearStatus = function(){
    player.statusLabel.text = "";
    player.statusLabel.height = 0;
    player.hideInventory();
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

  player.square = function(){
      return {x: Math.floor(this.x / game.spriteWidth), y: Math.floor(this.y / game.spriteHeight) };
  };

  player.facingSquare = function(){
    var playerSquare = player.square();
    var facingSquare;
    if(player.direction === 0){
      facingSquare = { x:playerSquare.x, y: playerSquare.y + 1}
    } else if (player.direction === 1){
      facingSquare = { x:playerSquare.x, y: playerSquare.y - 1}
    }else if (player.direction === 2){
      facingSquare = { x:playerSquare.x + 1, y: playerSquare.y}
    }else if (player.direction === 3){
      facingSquare = { x:playerSquare.x - 1, y: playerSquare.y}
    }
    if ((facingSquare.x < 0 || facingSquare >= map.width / 32) ||(facingSquare.y < 0 || facingSquare >= map.height / 32)){
      return null;
    }else{
      return facingSquare;
    }
  };

  player.facing = function(){
    var facingSquare = player.facingSquare();
    if(!facingSquare){
      return null;
    } else {
      return foregroundData[facingSquare.y][facingSquare.x];
    }
  }

  player.visibleItems = [];
  player.itemSurface = new Surface(game.itemSpriteSheetWidth, game.spriteSheetHeight);
  player.inventory = [];

  player.hideInventory = function (){
      for(var i = 0; i < player.visibleItems.length; i++){
        player.visibleItems[i].remove();
      }
      player.visibleItems = [];
  };

  player.showInventory = function(yOffset) {
      if(player.visibleItems.length === 0){
          player.itemSurface.draw(game.assets['../img/items.png']);
          for ( var i = 0; i < player.inventory.length; i++){
            var item = new Sprite(game.spriteWidth, game.spriteHeight);
            item.y = 130 + yOffset;
            item.x = 30 + 105 * i;
            item.frame = player.inventory[i];
            item.scaleX = 2;
            item.scaleY = 2;
            item.image = player.itemSurface;
            player.visibleItems.push(item);
            game.currentScene.addChild(item);
          }
      }
  };

//end player

  var npc = {
      say: function (message){
          player.statusLabel.height = 18;
          player.statusLabel.text = message;
      }
  };

  var greeter = {
    action: function(){
      npc.say("Hello!");
    }
  };

  var shopScene = new Scene();

  var shopkeep = {
    action: function(){

    }
  };

  var spriteRoles = [, , greeter, ];

  game.onload = function () {
    setMaps();
    setPlayer();
    setStage();
    //setShopping();
    //setBattle();

    player.on('enterframe', function(){
      player.move();
      if(game.input.a){
        var playerFacing = player.facing();
        if(!playerFacing || !spriteRoles[playerFacing]){
          player.displayStatus();
        }else{
          spriteRoles[playerFacing].action();
        };
      };
    });


    game.rootScene.on('enterframe', function(e) {
      //game.focusViewport();
    });
  };
  game.start();
}