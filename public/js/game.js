enchant();
window.onload = function () {
    var game = new Game(window.screen.height, window.screen.width);
  
    game.keybind(32, 'a');
    game.spriteSheetWidth = 512;
    game.spriteSheetHeight = 32;
    game.itemSpriteSheetWidth = 128; 
    game.preload(['../img/items.png', '../img/sprites.png']); 
    game.items = [{ price: 1000, decription: 'Hurter', id: 0},
        {price: 5000, decription: 'Drg. Paw', id: 1 },
        {price: 5000, decription: 'Ice Magic', id: 2},
        {price: 60, decription: 'Chess Set', id: 3}];
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

        var buttonB = new enchant.ui.Button('B', 'light');
        buttonB.moveTo(180,710);
        game.currentScene.addChild(buttonB);

        var buttonA = new enchant.ui.Button('A', 'blue');
        buttonA.moveTo(230,710);
        game.currentScene.addChild(buttonA);
    
        buttonA.ontouchstart = function() {
            var playerFacing = player.facing();

            if (!playerFacing || !spriteRoles[playerFacing]) {
                player.displayStatus();
            } else {
                spriteRoles[playerFacing].action();
            }
        };

        stage.addChild(foregroundMap);
        stage.addChild(player.statusLabel);
        game.rootScene.addChild(stage);
    };

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

        player.name = 'Steve';
        player.characterClass = 'Knight';
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

        player.statusLabel = new Label('');
        player.statusLabel.width = game.width;
        player.statusLabel.y = undefined;
        player.statusLabel.x = undefined;
        player.statusLabel.color = '#fff';
        player.statusLabel.backgroundColor = '#000';
    };

    player.displayStatus = function()
    {
        player.statusLabel.text = 
            '--' + player.name + ' the ' + player.characterClass +
            '<br />--HP: ' + player.hp + '/' + player.levelStats[player.level].maxHp +
            '<br />--MP: ' + player.mp + '/' + player.levelStats[player.level].maxMp +  
            '<br />--Atk: ' + player.levelStats[player.level].attack +
            '<br />--Exp: ' + player.exp +
            '<br />--Level: ' + player.level +
            '<br />--GP: ' + player.gp +
            '<br /><br />--Inventory:';
        player.statusLabel.height = 210;
        player.showInventory(0);   
    };

    player.clearStatus = function(){
        player.statusLabel.text = '';
        player.statusLabel.height = 0;
        player.hideInventory();
    };

    player.move = function() {
        this.frame = this.spriteOffset + this.direction * 2 + this.walk;

        if(this.isMoving){
            this.moveBy(this.xMovement, this.yMovement);
            if(!(game.frame % 2)){
                this.walk++;
                this.walk %= 2;
            }
            if ((this.xMovement && this.x % 32 === 0) || (this.yMovement && this.y % 32 === 0)) {
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
            facingSquare = { x:playerSquare.x, y: playerSquare.y + 1 };
        } else if (player.direction === 1){
            facingSquare = { x:playerSquare.x, y: playerSquare.y - 1 };
        } else if (player.direction === 2){
            facingSquare = { x:playerSquare.x + 1, y: playerSquare.y };
        } else if (player.direction === 3){
            facingSquare = { x:playerSquare.x - 1, y: playerSquare.y };
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
    };

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
            npc.say('Hello!');
        }
    };

    var shopScene = new Scene();

    var shopkeep = {
        action: function(){
            game.pushScene(shopScene);
        }
    };

    var battleScene = new Scene();

    var brawler = {
        maxHp: 20,
        hp: 20,
        sprite: 15,
        attack: 3,
        exp: 3,
        gp: 5,
        action: function(){
            player.currentEnemy = this;
            game.pushScene(battleScene);
        }
    };

    var spriteRoles = [null, null, greeter, null, shopkeep, null, null, null, null, null, null, null, null, null, null, brawler];

    var setBattle = function() {
        battleScene.backgroundColor = '#000';
        var battle = new Group();
        battle.menu = new Label();
        battle.menu.x = 20;
        battle.menu.y = 170;
        battle.menu.color = '#fff';
        battle.activeAction = 0;

        battle.getPlayerStatus = function() {
            return 'HP: ' + player.hp + '<br />MP: ' + player.mp;
        };

        battle.playerStatus = new Label(battle.getPlayerStatus());
        battle.playerStatus.color = '#fff';
        battle.playerStatus.x = 200;
        battle.playerStatus.y = 120;

        battle.hitStrength = function(hit){
            return Math.round((Math.random() + .5) * hit);
        };

        battle.won = function () {
            battle.over = true;
            player.exp += player.currentEnemy.exp;
            player.gp += player.currentEnemy.gp;

            //TODO: remove when you get a better enemies
            player.currentEnemy.hp = player.currentEnemy.maxHp;

            player.statusLabel.text = 'You won!<br />' +
                'You gained ' + player.currentEnemy.exp + ' exp<br />' +
                'and ' + player.currentEnemy.gp + ' gold pieces!';
            player.statusLabel.height = 45;
            if(player.exp > player.levelStats[player.level].expMax && player.level < player.level < player.levelStats.length -1) {
                player.level += 1;
                player.statusLabel.text = player.statusLabel.text +
                    '<br />And you gained a level!' +
                    '<br />You are now at level ' + player.level + '!';
                player.statusLabel.height = 75;
            }
        };

        battle.lost = function() {
            battle.over = true;
            player.hp = player.levelStats[player.level].maxHp;
            player.mp = player.levelStats[player.level].maxMp;
            player.gp = Math.round(player.gp / 2);
            player.statusLabel.text = 'You Lost!';
            player.statusLabel.height = '12';
        };

        battle.playerAttack = function () {
            var currentEnemy = player.currentEnemy;
            var playerHit = battle.hitStrength(player.attack());
            currentEnemy.hp = currentEnemy.hp - playerHit;
            battle.menu.text = 'You did ' + playerHit + ' damage!';
            if(currentEnemy.hp <= 0) {
                battle.won();
            }
        };

        battle.enemyAttack = function() {
            var currentEnemy = player.currentEnemy;
            var enemyHit = battle.hitStrength(currentEnemy.attack);
            player.hp = player.hp - enemyHit;
            battle.menu.text = 'You took ' + enemyHit + ' damage!';
            if(player.hp <= 0) {
                battle.lost();
            }
        };

        battle.actions = [{
            name: 'Fight', 
            action: function(){
                battle.wait = true;
                battle.playerAttack();

                setTimeout(function (){
                    if(!battle.over){
                        battle.enemyAttack();
                    }
                    if(!battle.over){
                        setTimeout(function() {
                            battle.menu.text = battle.listActions();
                            battle.wait = false;
                        }, 1000);
                    } else {
                        setTimeout(function (){
                            battle.menu.text =  '';
                            game.popScene();
                        }, 1000);
                    }
                }, 1000);
            }
        },{
            name: 'Magic',
            action: function(){
                battle.menu.text = 'You don\'t know any magic yet!';
                battle.wait = true;
                battle.activeAction = 0;

                setTimeout(function() {
                    battle.menu.text = battle.listActions();
                    battle.wait = false;
                }, 1000);
            }
        },{
            name: 'Run',
            action: function() {
                game.pause();
                player.statusLabel.text = 'You ran away!';
                player.statusLabel.height = 12;
                battle.menu = '';
                game.popScene();
            }
        }];

        battle.listActions = function() {
            battle.optionText = [];
            for(var i = 0; i < battle.actions.length; i++){
                if(i===battle.activeAction){
                    battle.optionText[i] = '-->' + battle.actions[i].name;
                } else {
                    battle.optionText[i] = battle.actions[i].name;
                }
            }

            return battle.optionText.join('<br />');
        };

        battle.addCombatants = function() {
            var image = new Surface(game.spriteSheetWidth, game.spriteSheetHeight);
            image.draw(game.assets['../img/sprites.png']);
            battle.player = new Sprite(game.spriteWidth, game.spriteHeight);
            battle.player.image = image;
            battle.player.frame = 7;
            battle.player.x = 150;
            battle.player.y = 120;
            battle.player.scaleX = 2;
            battle.player.scaleY = 2;

            battle.enemy = new Sprite(game.spriteWidth, game.spriteHeight);
            battle.enemy.image = image;
            battle.enemy.x = 150;
            battle.enemy.y = 70;
            battle.enemy.scaleX = 2;
            battle.enemy.scaleY = 2;
            battle.addChild(battle.enemy);
        };

        battle.addCombatants();

        battleScene.on('enter', function(){
            battle.over = false;
            battle.wait = true;
            battle.menu.text = '';
            battle.enemy.frame = player.currentEnemy.sprite;

            setTimeout(function() {
                battle.menu.text = battle.listActions();
                battle.wait = false;
            }, 500);
        });

        battleScene.on('enterframe', function() {
            if(!battle.wait){
                if(game.input.a){
                    battle.actions[battle.activeAction].action();
                } else if ( game.input.down) {
                    battle.activeAction = (battle.activeAction + 1) % battle.actions.length;
                    battle.menu.text = battle.listActions();
                } else if ( game.input.up){
                    battle.activeAction = (battle.activeAction -1 + battle.actions.length ) % battle.actions.length;
                    battle.menu.text = battle.listActions();
                }
                battle.playerStatus.text = battle.getPlayerStatus();
            }
        });

        battleScene.on('exit', function() {
            setTimeout(function() {
                battle.menu.text = '';
                battle.activeAction = 0;
                battle.playerStatus.text = battle.getPlayerStatus();
                game.resume();
            }, 1000);
        });

        battle.addChild(battle.playerStatus);
        battle.addChild(battle.menu);
        battle.addChild(battle.player);
        battleScene.addChild(battle);

        var battlePad = new enchant.ui.Pad();
        battlePad.moveTo(0, 650);
        battleScene.addChild(battlePad);

        var battleButtonB = new enchant.ui.Button('B', 'light');
        battleButtonB.moveTo(180,710);
        battleScene.addChild(battleButtonB);

        var battleButtonA = new enchant.ui.Button('A', 'blue');
        battleButtonA.moveTo(230,710);
        battleButtonA.ontouchstart = function(){
            if(!battle.wait){
                battle.actions[battle.activeAction].action();
            }
        };
    
        battleScene.addChild(battleButtonA);
    };

    var setShopping = function(){
        var shop = new Group();
        shop.itemSelected = 0;

        shop.shoppingFunds = function() {
            return 'Gold: ' + player.gp;
        };

        shop.drawShopkeeper = function() {
            var image = new Surface(game.spriteSheetWidth, game.spriteSheetHeight);
            var shopkeeper = new Sprite(game.spriteWidth, game.spriteHeight);
      
            image.draw(game.assets['../img/sprites.png']);
            shopkeeper.image = image;
            shopkeeper.frame = 4;
            shopkeeper.y = 10;
            shopkeeper.x = 10;
            shopkeeper.scaleX = 2;
            shopkeeper.scaleY = 2;
            this.addChild(shopkeeper);
            this.message.x = 40;
            this.message.y = 10;
            this.message.color = '#fff';
            this.addChild(this.message);
        };

        shop.drawItemsForSale = function(){
            for(var i = 0; i < game.items.length; i ++){
                var image = new Surface(game.itemSpriteSheetWidth, game.spriteSheetHeight);
                var item = new Sprite(game.spriteWidth, game.spriteHeight);
                image.draw(game.assets['../img/items.png']);
                itemLocationX = 30 + 70 * i;
                itemLocationY = 70;
                item.y = itemLocationY;
                item.x = itemLocationX;
                item.frame = i;
                //item.scaleX = 2;
                //item.scaleY = 2;
                item.image = image;
                this.addChild(item);

                var itemDescription = new Label(game.items[i].price + '<br />' + game.items[i].decription);
                itemDescription.x = itemLocationX - 8;
                itemDescription.y = itemLocationY + 40;
                itemDescription.color = '#fff';
                this.addChild(itemDescription);

                if(i === this.itemSelected) {
                    image = new Surface(game.spriteSheetWidth, game.spriteSheetHeight);
                    this.itemSelector = new Sprite(game.spriteWidth, game.spriteHeight);
                    image.draw(game.assets['../img/sprites.png']);
                    itemLocationX = 30 + 70 * i;
                    itemLocationY = 160;
                    this.itemSelector.x = itemLocationX;
                    this.itemSelector.y = itemLocationY;
                    //this.itemSelector.scaleX = 2;
                    //this.itemSelector.scaleY = 2;
                    this.itemSelector.frame = 7;
                    this.itemSelector.image = image;
                    this.addChild(this.itemSelector);
                }
            }
        };

        shop.on('enter', function(){
            shoppingFunds.text = shop.shoppingFunds();
        });

        shop.on('enterframe', function() {
            setTimeout(function() {
                if (game.input.a){
                    shop.attemptToBuy();
                } else if (game.input.down){
                    shop.message.text = shop.farewell;
                    setTimeout(function() {
                        game.popScene();
                        shop.message.text = shop.greeting;
                    }, 1000);
                } else if (game.input.left){
                    shop.itemSelected = shop.itemSelected + game.items.length -1;
                    shop.itemSelected = shop.itemSelected % game.items.length;
                    shop.itemSelector.x = 30 + 70 * shop.itemSelected;
                    shop.message.text = shop.greeting;
                } else if (game.input.right) {
                    shop.itemSelected = (shop.itemSelected + 1) % game.items.length;
                    shop.itemSelector.x = 30 + 70 * shop.itemSelected;
                    shop.message.text = shop.greeting;
                }
            }, 500);
            player.showInventory(100);
            shoppingFunds.text = shop.shoppingFunds();
        });

        shop.attemptToBuy = function(){
            var itemPrice = game.items[this.itemSelected].price;
            if(player.gp < itemPrice){
                this.message.text = this.apology;
            } else {
                player.visibleItems = [];
                player.gp = player.gp - itemPrice;
                player.inventory.push(game.items[this.itemSelected].id);
                this.message.text = this.sale;
            }
        };

        shop.greeting  = 'Hi! I\'m the shopkeeper. I sell things.';
        shop.apology = 'Sorry, you don\'t have the money for this.';
        shop.sale = 'Here you go!';
        shop.farewell = 'Come again!';
        shop.message = new Label(shop.greeting);
        shop.drawShopkeeper();

        var shoppingFunds = new Label(shop.shoppingFunds());
        shoppingFunds.color = '#fff';
        shoppingFunds.y = 200;
        shoppingFunds.x = 10;
        shop.addChild(shoppingFunds);
        shop.drawItemsForSale();
        shopScene.backgroundColor = '#000';
        shopScene.addChild(shop);

        var shopPad = new enchant.ui.Pad();
        shopPad.moveTo(0, 650);
        shopScene.addChild(shopPad);

        var shopButtonB = new enchant.ui.Button('B', 'light');
        shopButtonB.moveTo(180,710);
        shopScene.addChild(shopButtonB);

        var shopButtonA = new enchant.ui.Button('A', 'blue');
        shopButtonA.moveTo(230,710);
        shopButtonA.ontouchstart = function(){
            shop.attemptToBuy();
        };
        shopScene.addChild(shopButtonA);
    };

    game.focusViewport = function() {
        //unknown
    };

    game.onload = function () {
        setMaps();
        setPlayer();
        setStage();
        setShopping();
        setBattle();

        player.on('enterframe', function(){
            player.move();
            if(game.input.a){
                var playerFacing = player.facing();
                if(!playerFacing || !spriteRoles[playerFacing]){
                    player.displayStatus();
                } else {
                    spriteRoles[playerFacing].action();
                }
            }
        });

        game.rootScene.on('enterframe', function(e) {
            //game.focusViewport();
        });
    };
    game.start();
};