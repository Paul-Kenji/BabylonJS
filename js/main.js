let canvas;
let engine;
let scene;
// vars for handling inputs
let inputStates = {};
window.onload = startGame;

var mf = false;
var mb = false;
var ml = false;
var mr = false;
var mup = false;
var spood = 0;
var howmuchairmove = 1;
var bhops = 0;
var transpower = 1;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    
    //add music
    var music = new BABYLON.Sound("music", 'musics/musicFond.mp3', scene, soundReady, {loop:true,volume: 0.5})
    function soundReady(){
        music.play();
    }

    // modify some default settings (i.e pointer events to prevent cursor to go 
    // out of the game window)
    modifySettings();

    let tank = scene.getMeshByName("heroTank");
    engine.runRenderLoop(() => {
        let deltaTime = engine.getDeltaTime(); // remind you something ?

        //tank.move();
        scene.render();
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    // enable physics

	scene.enablePhysics(new BABYLON.Vector3(0, -70, 0));
    scene.gravity = new BABYLON.Vector3(0, -70, 0);
    let ground = createGround(scene);
    let tank = createTank(scene);

    let followCamera = createFollowCamera(scene, tank);
    scene.activeCameras = followCamera;
    //scene.activeCameras = [];
    createLights(scene);

    return scene;
}

function createGround(scene) {
    const groundOptions = { width: 2000, height: 2000, subdivisions: 20, minHeight: 0, maxHeight: 100, onReady: onGroundCreated };
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", 'images/hmap1.png', groundOptions, scene);

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg");
        ground.material = groundMaterial;
        // to be taken into account by collision detection
        ground.checkCollisions = true;
        //groundMaterial.wireframe=true;

                // for physic engine
                ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
                    BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0,
                                                                 restitution:0,
                                                                 friction:.001
                                                                 },
                                                                 scene);   
    }
    return ground;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(10, -1, 0), scene);
    //var light = new BABYLON.PointLight("myPointLight", new BABYLON.Vector3(0, 3, 0), scene);
    light0.intensity = 15;
    light0.diffuse = new BABYLON.Color3(1, 1, 1);

}

function createFollowCamera(scene, tank) {
    var camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.inertia = 0.6;
    camera.fov = 2;
    camera.minX = 0;
    camera.minY = 0;
    camera.minZ = 0;
    camera.angularSensibility = 1000;
    camera.position.y = 0.45;
    camera.position = tank.position.add(new BABYLON.Vector3(0, 2.5, 0));

    var rotate = function (mesh, direction, power) {
        mesh.physicsImpostor.setAngularVelocity(
            mesh.physicsImpostor.getAngularVelocity().add(
                direction.scale(power)
            )
        );
    }

    var transformForce = function (mesh, vec) {
        var mymatrix = new BABYLON.Matrix();
        mesh.rotationQuaternion.toRotationMatrix(mymatrix);
        return BABYLON.Vector3.TransformNormal(vec, mymatrix);
    };

    var translate = function (mesh, direction, power) {
        mesh.physicsImpostor.setLinearVelocity(
            mesh.physicsImpostor.getLinearVelocity().add(
                transformForce(mesh, direction.scale(power))
            )
        );
    }
    
    var rotpower = .05;
    var onPointerMove = function (evt) {
        var ex = event.movementX;
        var ey = event.movementY;
        rotate(tank, new BABYLON.Vector3(0, ex, 0), rotpower);
    }
    canvas.addEventListener("pointermove", onPointerMove, false);
    camera.position = tank.position.add(new BABYLON.Vector3(0, 2.5, 0));
    var eulerRot = BABYLON.Vector3.Zero();

    var update = function() {

        if (mf == true) translate(tank, new BABYLON.Vector3(0, 0, 2+spood*howmuchairmove+bhops), transpower);
        if (mb == true) translate(tank, new BABYLON.Vector3(0, 0, -(2+spood*howmuchairmove+bhops)), transpower);
        if (ml == true) translate(tank, new BABYLON.Vector3(-(2+spood*howmuchairmove+bhops), 0, 0), transpower);
        if (mr == true) translate(tank, new BABYLON.Vector3(2+spood*howmuchairmove+bhops, 0, 0), transpower);
        if (mup == true) {
            let origine = new BABYLON.Vector3(tank.position.x, tank.position.y, tank.position.z);
            tank.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 10, 0), origine);
        }
        // make the camera be in same position as sphere, without parenting. 
        // Raise cam.pos.y 0.45 ...matching line 31.
        camera.position = tank.position.add(new BABYLON.Vector3(0, 2.5, 0));
        tank.physicsImpostor.physicsBody.quaternion.toEuler(eulerRot); // adjust eulerRot value
        camera.rotation.y = eulerRot.y; // use adjusted value
    }

    scene.registerBeforeRender(function() {
        update();
    });
}

function createTank(scene) {
    let tank = new BABYLON.MeshBuilder.CreateBox("heroTank", {width: 1.5, height: 0.5, depth: 1.5}, scene);
    let tank1 = new BABYLON.MeshBuilder.CreateBox("tank1", {width: 1.5, height: 0.5, depth: 1.5}, scene);

    tank.position.y = 5;
    tank1.parent = tank;

    let tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    //let tankBack = tank[0].position.add(new BABYLON.Vector3(1,10,0) );
    //tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    //tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tankMaterial.diffuseTexture = new BABYLON.Texture("images/lightning.jpg", scene);
    tank.material = tankMaterial;
    // By default the box/tank is in 0, 0, 0, let's change that...
    tank.physicsImpostor = new BABYLON.PhysicsImpostor(
        tank, 
        BABYLON.PhysicsImpostor.BoxImpostor, { 
            mass: 0.5, 
            restitution: 0,
            friction: .01 
        }, 
        scene
    );

    tank.physicsImpostor.physicsBody.linearDamping = 0.999;
    tank.physicsImpostor.physicsBody.angularDamping = 0.999999999999;

    return tank;
}

    window.addEventListener("resize", () => {
        engine.resize()
    });

    function modifySettings() {

        // as soon as we click on the game window, the mouse pointer is "locked"
        // you will have to press ESC to unlock it
        scene.onPointerDown = () => {
            if (!scene.alreadyLocked) {
                console.log("requesting pointer lock");
                canvas.requestPointerLock();
            } else {
                console.log("Pointer already locked");
            }
        }

        document.addEventListener("pointerlockchange", () => {
            let element = document.pointerLockElement || null;
            if (element) {
                // lets create a custom attribute
                scene.alreadyLocked = true;
            } else {
                scene.alreadyLocked = false;
            }
        })

        // key listeners for the tank
        inputStates.left = false;
        inputStates.right = false;
        inputStates.up = false;
        inputStates.down = false;
        inputStates.space = false;

        //add the listener to the main, window object, and update the states
        window.addEventListener('keydown', (event) => {
            if ((event.key === "ArrowLeft") || (event.key === "q") || (event.key === "Q")) {
                inputStates.left = true;
                ml = true;
            } else if ((event.key === "ArrowUp") || (event.key === "z") || (event.key === "Z")) {
                inputStates.up = true;
                mf = true;
            } else if ((event.key === "ArrowRight") || (event.key === "d") || (event.key === "D")) {
                inputStates.right = true;
                mr = true;
            } else if ((event.key === "ArrowDown") || (event.key === "s") || (event.key === "S")) {
                inputStates.down = true;
                mb = true;
            } else if (event.key === " ") {
                inputStates.space = true;
                mup = true;
            }
        }, false);

        //if the key will be released, change the states object 
        window.addEventListener('keyup', (event) => {
            if ((event.key === "ArrowLeft") || (event.key === "q") || (event.key === "Q")) {
                inputStates.left = false;
                ml = false;
            } else if ((event.key === "ArrowUp") || (event.key === "z") || (event.key === "Z")) {
                inputStates.up = false;
                mf = false;
            } else if ((event.key === "ArrowRight") || (event.key === "d") || (event.key === "D")) {
                inputStates.right = false;
                mr = false;
            } else if ((event.key === "ArrowDown") || (event.key === "s") || (event.key === "S")) {
                inputStates.down = false;
                mb = false;
            } else if (event.key === " ") {
                mup = false;
                inputStates.space = false;
            }
        }, false);
    }


