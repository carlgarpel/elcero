/**
 * 
 */

var app = {
	
	inicio: function() {
		// Inicio Variables
		alto = document.documentElement.clientHeight;
		ancho = document.documentElement.clientWidth;
		dificultad = 0;
		//velocidadY = 0;
		velocidadX = 0; // Registraremos el movimiento horizontal del player
		puntuacion = 0;
		
		// Inicio Funciones
		app.vigilaSensores();
		app.iniciaJuego();
	},
	
	vigilaSensores: function() {
		
		function onError() {
			console.log('onError!');
		}
		
		function onSuccess(datosAceleracion) {
			app.registraDireccion(datosAceleracion);
		}
		
		navigator.accelerometer.watchAcceleration(onSuccess, onError, {frequency: 10});
	},
	
	
	iniciaJuego: function() {
		
		function preload() {
			game.physics.startSystem(Phaser.Physics.ARCADE);
			game.stage.backgroundColor = '#000000';
			game.load.image('alien', 'assets/alien.png');
			game.load.image('bullet', 'assets/bullet.png');
			game.load.image('kaboom', 'assets/kaboom.png');
			game.load.image('player', 'assets/player.png');
		}
		
		function create() {
			// Text
			scoreText = game.add.text(16, 10, puntuacion, {fontSize: '50px', fill: '#757676'})
			stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '24px Arial', fill: '#fff' });
		    stateText.anchor.setTo(0.5, 0.5);
		    stateText.visible = false;
			
			// Player
			var posicionPlayerX = Math.floor(ancho / 2);
			var posicionPlayerY = Math.floor(alto - 100);
			player = game.add.sprite(posicionPlayerX, posicionPlayerY, 'player');
			game.physics.arcade.enable(player);
			player.body.collideWorldBounds = true;
			
			// Alien
			aliens = game.add.group();
		    aliens.enableBody = true;
		    aliens.physicsBodyType = Phaser.Physics.ARCADE;
		    createAliens();
		    
		    // Player bullet
		    bullets = game.add.group();
		    bullets.enableBody = true;
		    bullets.physicsBodyType = Phaser.Physics.ARCADE;
		    bullets.createMultiple(30, 'bullet');
		    bullets.setAll('anchor.x', 0.5);
		    bullets.setAll('anchor.y', 1);
		    bullets.setAll('outOfBoundsKill', true);
		    bullets.setAll('checkWorldBounds', true);
		    
		    // Player dispara
		    game.input.onTap.add(playerDispara, this);
		    
		    // Kaboom
		    explosions = game.add.group();
		    explosions.createMultiple(30, 'kaboom');
		    explosions.forEach(setupInvader, this);
		}
		
		function update() {
			// Inicio Variables
			var factorVelocidadPlayer = 200;
			
			// Player
			player.body.velocity.x = (velocidadX * (-1 * factorVelocidadPlayer));
		    
		    // Run collision
	        game.physics.arcade.overlap(bullets, aliens, alienKaboom, null, this);
		}
		
		function createAliens() {
		    for (var y = 0; y < 2; y++) {
		        for (var x = 0; x < 3; x++) {
		            var alien = aliens.create(x * 65, y * 50, 'alien');
		            alien.anchor.setTo(0.5, 0.5);
		            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
		            alien.play('fly');
		            alien.body.moves = false;
		        }
		    }
		    aliens.x = 40;
		    aliens.y = 100;
		    // Alien movimiento horizontal
		    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
		}
		
		function playerDispara(pointer, doubleTap) {
			//  Grab the first bullet we can from the pool
	        bullet = bullets.getFirstExists(false);
	        if (bullet) {
	            //  And fire it
	            bullet.reset(player.x + 30, player.y + 8);
	            bullet.body.velocity.y = -400;
	            bulletTime = game.time.now + 200;
	        }
		}
		
		function setupInvader (invader) {
		    invader.anchor.x = 0.5;
		    invader.anchor.y = 0.5;
		    invader.animations.add('kaboom');
		}
		
		function alienKaboom(bullet, alien) {
			puntuacion = puntuacion + 1;
			scoreText.text = puntuacion;
			
			bullet.kill();
		    alien.kill();
		    
		    //  And create an explosion :)
		    var explosion = explosions.getFirstExists(false);
		    explosion.reset(alien.body.x + 20, alien.body.y + 20);
		    explosion.play('kaboom', 30, false, true);
		    
		    if (aliens.countLiving() == 0) {
		    	puntuacion += 10;
		        scoreText.text = puntuacion;

		    	
		        stateText.text = " Felicitaciones has ganado! \n Click para reiniciar el juego.";
		        stateText.visible = true;

		        //the "click to restart" handler
		        game.input.onTap.addOnce(restart,this);
		        
		    }
		}
		
		function restart () {
		    //  And brings the aliens back from the dead :)
		    aliens.removeAll();
		    createAliens();

		    //revives the player
		    player.revive();
		    //hides the text
		    stateText.visible = false;

		}
		
		var estados = {preload: preload, create: create, update: update};
		var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser', estados);
	},
	
	registraDireccion: function(datosAceleracion) {
		velocidadX = datosAceleracion.x;
		//velocidadY = datosAceleracion.y;
	},
	
};

if('addEventListener' in document) {
	document.addEventListener('deviceready', function(){
		app.inicio();
	}, false);
}