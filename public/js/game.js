enchant();
window.onload = function () {
  var game = new Game(320, 320);
  game.preload('../img/chara0.png');
  game.onload = function () {
    var scene = new Scene();
      var sprite = new Sprite(32, 32);
      sprite.image = game.assets['../img/chara0.png'];
      scene.addChild(sprite);
      game.pushScene(scene);
  };
  game.start();
}