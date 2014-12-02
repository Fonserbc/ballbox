define("js/Game",
[
], function (
) {
	"use strict";

	var camera, scene, renderer;
    var effect, controls;
    var element, container;
    var clock;
    var shadows = false;
    var player;
    var light, lightPos;

    var lookAtObjects = [];
    var lookAtIt = 0;
    var lookAtTime = 0;
    var lookAtLerp = 0;

    var textures;

    var cameraOriginalPos = new THREE.Vector3();
    var controlOriginalPos = new THREE.Vector3();
    var originalEyeSeparation;
    var originalFocalLength;

	function Game (config) {
		shadows = config.shadows;

		this.physics = new GUNNER();
		this.physics.adaptativeRate = true;

		this.init();
		this.run();
	}

	Game.prototype.init = function () {

		// CANNON init
		//var bouncyMaterial = new CANNON.Material("bouncy");
		//var bouncyContactMaterial = new CANNON.ContactMaterial(bouncyMaterial, bouncyMaterial, 0.3, 0.1);
		//this.physics.world.addContactMaterial(bouncyContactMaterial);

		// THREE init
		clock = new THREE.Clock();

		scene = new THREE.Scene();
		scene.fog = new THREE.Fog (0xccffff, 0, 300);

		var ambient = new THREE.AmbientLight( 0x222222 );
		scene.add(ambient);
		light = new THREE.DirectionalLight ( 0xffffff);
		lightPos = new THREE.Vector3(7,17,-4);
		light.position.copy(lightPos);

		light.castShadow = true;
		//light.shadowCameraVisible = true;
		light.shadowCameraNear = 10;
        light.shadowCameraFar = 30;//camera.far;
        light.shadowCameraLeft = -10;
     	light.shadowCameraRight = 10;
     	light.shadowCameraTop = 10;
     	light.shadowCameraBottom = -10;

        light.shadowMapBias = 0.1;
        light.shadowMapDarkness = 0.7;
        light.shadowMapWidth = 512;
        light.shadowMapHeight = 512;

		scene.add(light);

		camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
		scene.add(camera);

		renderer = new THREE.WebGLRenderer();
		renderer.shadowMapEnabled = shadows;
		renderer.shadowMapSoft = true;
		renderer.setClearColor(scene.fog.color, 1);

		effect = new THREE.StereoEffect(renderer);
		effect.separation = 0.3;
		effect.eyeSeparation = 0.3;
		effect.focalLength = 7.0;

		element = renderer.domElement;
		container = document.getElementById('gamecanvas');
		container.appendChild(element);

		window.addEventListener('deviceorientation', setOrientationControls, true);

		// Resources
		textures = {
			'grass': THREE.ImageUtils.loadTexture( 'textures/grass.png' ),
			'golf': THREE.ImageUtils.loadTexture( 'textures/golf.png' ),
			'cube': THREE.ImageUtils.loadTexture( 'textures/cube_full.png' ),
			'ceil': THREE.ImageUtils.loadTexture( 'textures/cube.png' ),
		};

		textures["grass"].wrapS = THREE.RepeatWrapping;
		textures["grass"].wrapT = THREE.RepeatWrapping;
		textures["grass"].repeat = new THREE.Vector2(50, 50);
		textures["grass"].anisotropy = renderer.getMaxAnisotropy();

		textures["golf"].wrapS = THREE.RepeatWrapping;
		textures["golf"].wrapT = THREE.RepeatWrapping;
		textures["golf"].repeat = new THREE.Vector2(2, 2);
		textures["golf"].anisotropy = renderer.getMaxAnisotropy();

		textures['ceil'].magFilter = THREE.NearestFilter;
		textures['cube'].magFilter = THREE.NearestFilter;
		// Grass
		var material = new THREE.MeshLambertMaterial({
			color: 0xdddddd,
			map: textures["grass"]
		});

		var floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(500, 500, 100, 100), material);
		floorMesh.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI / 2);
		floorMesh.receiveShadow = true;
		floorMesh.castShadow = true;
		scene.add(floorMesh);

		var floor = this.physics.load(floorMesh, {
			shape: new CANNON.Plane(),
			mass: 0,
//			material: bouncyMaterial
		});

		// Balls
        var ballGeometry = new THREE.SphereGeometry(1.0, 32, 32);
        var ballMaterial = new THREE.MeshLambertMaterial({
        	color: 0xffffff,
        	map: textures["golf"]
        });
		var ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
		ballMesh.castShadow = true;
		ballMesh.receiveShadow = true;
		ballMesh.position.set(0,10,0);
		scene.add(ballMesh);

		player = this.physics.load(ballMesh, {
			shape: new CANNON.Sphere(1.0),
			mass : 1,
//			material: bouncyMaterial
		});
		player.body.linearDamping = 0.9;
		player.body.angularDamping = 0.5;

		controls = new THREE.OrbitControls(camera, element);
		controls.rotateUp(Math.PI / 4);
		controls.target.set(
			camera.position.x,
			camera.position.y,
			camera.position.z + 0.1
		);
		controls.noZoom = true;
		controls.noPan = true;

		lookAtObjects.push({
			to: player.position,
			from: new THREE.Vector3(0, 5, -5),
			time: 6,
			eyeDist: 0.3
		});

		var cubeGeometry = new THREE.BoxGeometry(10, 10, 10, 1, 1, 1);
		var cubeMaterial = new THREE.MeshLambertMaterial({
        	color: 0xffffff,
        	map: textures["cube"],
        });
		var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		cube.position.set(0,5,50);
		scene.add(cube);

		lookAtObjects.push({
			to: cube.position,
			from: new THREE.Vector3(0, 5, -5),
			time: 6,
			eyeDist: 5
		});

		// Other balls
		var ball2 = new THREE.Mesh(ballGeometry, ballMaterial);
		ball2.castShadow = true;
		ball2.receiveShadow = true;
		ball2.position.set(0.1,7,10.03);
		scene.add(ball2);
		var b2 = this.physics.load(ball2, {
			shape: new CANNON.Sphere(1.0),
			mass : 1,
//			material: bouncyMaterial
		});
		b2.body.linearDamping = 0.9;
		b2.body.angularDamping = 0.5;

		lookAtObjects.push({
			to: ball2.position,
			from: new THREE.Vector3(0, 5, -5),
			time: 6,
			eyeDist: 0.3
		});

		var ball3 = new THREE.Mesh(ballGeometry, ballMaterial);
		ball3.castShadow = true;
		ball3.receiveShadow = true;
		ball3.position.set(-0.03,2,-0.1);
		scene.add(ball3);
		var b3 = this.physics.load(ball3, {
			shape: new CANNON.Sphere(1.0),
			mass : 1,
//			material: bouncyMaterial
		});
		b3.body.linearDamping = 0.9;
		b3.body.angularDamping = 0.5;

		lookAtObjects.push({
			to: ball3.position,
			from: new THREE.Vector3(0, 7, -12),
			time: 6,
			eyeDist: 2.0
		});

		// Ceil
		var ceilGeometry = new THREE.BoxGeometry(100, 100, 100, 1, 1, 1);
		var ceilMaterial = new THREE.MeshLambertMaterial({
        	color: 0xffffff,
        	map: textures["ceil"],
        	side: THREE.DoubleSide,
        	transparent: true
        });
		var ceil = new THREE.Mesh(ceilGeometry, ceilMaterial);
		ceil.position.set(0,0,0);
		ceil.frustumCulled = false;
		scene.add(ceil);

		lookAtObjects.push({
			to: ceil.position,
			from: new THREE.Vector3(0, 100, -120),
			time: 5,
			eyeDist: 2.0
		});

		lookAtObjects.push({
			to: ceil.position,
			from: new THREE.Vector3(0, 100, -120),
			time: 4,
			lerpTime: 4,
			eyeDist: 40
		});

		lookAtObjects.push({
			to: new THREE.Vector3(0,1,120),
			from: new THREE.Vector3(0, 100, -120),
			time: 3,
			eyeDist: 40
		});

		lookAtObjects.push({
			to: new THREE.Vector3(0,1,120),
			from: new THREE.Vector3(0, 1, -120),
			time: 6,
			eyeDist: 0.05
		});

		var aux = new THREE.Vector3(-0.02, 0.02, -1);
		aux.add(b3.position);
		lookAtObjects.push({
			to: b3.position,
			from: aux,
			time: 5,
			eyeDist: 0.05
		});

		//

		cameraOriginalPos.copy(camera.position);
		controlOriginalPos.copy(controls.target);
		originalFocalLength = effect.focalLength;
		originalEyeSeparation = effect.eyeSeparation;

		window.addEventListener('resize', this.resize.bind(this), false);
		setTimeout(this.resize.bind(this), 1);
	}

	Game.prototype.resize = function () {
		var width = container.offsetWidth;
		var height = container.offsetHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		effect.setSize(width, height);
    }

    Game.prototype.update = function (dt) {
    	this.physics.update(dt);

    	var lo = lookAtObjects[lookAtIt];
    	var invLerp = 1.0 - lookAtLerp;

    	effect.eyeSeparation = originalEyeSeparation * invLerp + lo.eyeDist * lookAtLerp;
    	effect.focalLength = originalFocalLength * invLerp + lo.to.distanceTo(lo.from)  * lookAtLerp;

    	camera.position.copy(cameraOriginalPos);
    	camera.position.lerp(lo.from, lookAtLerp);
    	camera.updateMatrix();

    	controls.target.copy(controlOriginalPos);
    	controls.target.lerp(lo.to, lookAtLerp);

    	light.position.copy(lightPos);
    	light.position.add(player.position);

    	this.resize();

    	camera.updateProjectionMatrix();

    	controls.update(dt);

    	//

    	lookAtTime += dt;

    	if (lookAtTime > lo.time) {
    		lookAtIt = ( lookAtIt + 1 ) % lookAtObjects.length;
    		lookAtTime = 0.0;

    		cameraOriginalPos.copy(camera.position);
    		controlOriginalPos.copy(controls.target);
    		originalFocalLength = effect.focalLength;
    		originalEyeSeparation = effect.eyeSeparation;
    	}

    	lookAtLerp = Math.min(1.0, lookAtTime / (lo.lerpTime || lo.time * 0.7));
    }

    Game.prototype.render = function (dt) {
		effect.render(scene, camera);
    }

    Game.prototype.run = function (t) {
    	requestAnimationFrame(this.run.bind(this));

    	this.update(clock.getDelta());
    	this.render(clock.getDelta());
    }


    function setOrientationControls (e) {
		if (!e.alpha) {
			return;
		}

		controls = new THREE.DeviceOrientationControls(camera, true);
		controls.connect();
		controls.update();

		element.addEventListener('click', fullscreen, false);

		window.removeEventListener('deviceorientation', setOrientationControls, true);
	}

    function fullscreen () {
    	if (container.requestFullscreen) {
    		container.requestFullscreen();
    	} else if (container.msRequestFullscreen) {
    		container.msRequestFullscreen();
    	} else if (container.mozRequestFullScreen) {
    		container.mozRequestFullScreen();
    	} else if (container.webkitRequestFullscreen) {
    		container.webkitRequestFullscreen();
    	}
    }

    return Game;
});