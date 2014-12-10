"use strict";

/*
 * CANNONjs simple wrapper WIP
 */
if (CANNON)
{
	var GUNNER = function (cannonWorld) {

		var world = this.world = cannonWorld || new CANNON.World();

		/*
		 * If set to true, the physics tick period will adapt to the framerate
		 */
		this.adaptativeRate = false;
	
		// CANNON initialize
		world.quatNormalizeSkip = 0;
		world.quatNormalizeFast = false;

		var solver = new CANNON.GSSolver();

		world.defaultContactMaterial.contactEquationStiffness = 1e9;
		world.defaultContactMaterial.contactEquationRegularizationTime = 4;

		solver.iterations = 7;
		solver.tolerance = 0.1;
		var split = true;
		if(split)
			world.solver = new CANNON.SplitSolver(solver);
		else
			world.solver = solver;

		world.gravity.set(0, -20, 0);
		world.broadphase = new CANNON.NaiveBroadphase();

		// Other
		this.charges = [];

		this.physicsTick = 1/60;
		this.carryingTime = 0;
	}

	GUNNER.prototype.load = function (transformHolder, options) {

		options.position = options.position || transformHolder.position;
		
		options.quaternion = options.quaternion || transformHolder.quaternion
		
		var shape = options.shape || new CANNON.Box(new CANNON.Vector3(0.5, 0.5, 0.5));

		var body = new CANNON.Body(options);
		body.addShape(shape);
		this.world.add(body);	

		var charge = {
			id: this.charges.length,
			body: body,
			transform: transformHolder,
			position: body.position,
			quaternion: body.quaternion
		};
		this.charges.push(charge);

		return charge;
	};

	GUNNER.prototype.unload = function (charge) {
		var where = charge.id;
		this.charges.splice(where, 1);

		for (var i = where; i < this.charges.length; ++i) {
			this.charges[i].id --;
		}
	};

	GUNNER.prototype.update = function (deltaTime) {
		var aux = this.carryingTime + deltaTime;

		while (aux > this.physicsTick) {
			this.world.step(this.physicsTick);
			aux -= this.physicsTick;
		}
		this.carryingTime = aux;
		
		if (this.adaptativeRate) {
			this.physicsTick = this.physicsTick * 0.9 + deltaTime * 0.1;
		}

		var charge;
		for (var i in this.charges) {
			charge = this.charges[i];

			charge.transform.position.copy(charge.position);
			charge.transform.quaternion.copy(charge.quaternion);
		}
	};
}
else {
	console.log("You must have the CANNON before bringing the Gunner in!")
}	