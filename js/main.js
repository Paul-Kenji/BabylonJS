let canvas;
let engine;
let scene;
// vars for handling inputs
let inputStates = {};
window.onload = startGame;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    
    // modify some default settings (i.e pointer events to prevent cursor to go 
    // out of the game window)
    modifySettings();

    let tank = scene.getMeshByName("heroTank");
    engine.runRenderLoop(() => {
        let deltaTime = engine.getDeltaTime(); // remind you something ?

        tank.move();
        scene.render();
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    // enable physics
    scene.enablePhysics();
    let ground = createGround(scene);

    let tank = createTank(scene);

    // second parameter is the target to follow
    let followCamera = createFollowCamera(scene, tank);
    
    scene.activeCamera = followCamera;
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
                    BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, scene);   
    }
    return ground;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(1, -1, 0), scene);
    //var light = new BABYLON.PointLight("myPointLight", new BABYLON.Vector3(0, 3, 0), scene);
    light0.intensity = 15;
    light0.diffuse = new BABYLON.Color3(1, 1, 1);

}

function createFollowCamera(scene, target) {
    const camera = new BABYLON.ArcRotateCamera('thirdPersonCamera', 0, 0, 10, BABYLON.Vector3.Zero(), scene)

    camera.attachControl(canvas, false)
    camera.setPosition(new BABYLON.Vector3(0, 150, -500))
    camera.checkCollisions = true
    camera.applyGravity = true
  
    camera.lowerRadiusLimit = 10
    camera.upperRadiusLimit = 50
  
    camera.keysLeft = []
    camera.keysRight = []
    camera.keysUp = []
    camera.keysDown = []
    camera.ke

    camera.setTarget(target)

    return camera;
}

function createTank(scene) {
    let tank = new BABYLON.MeshBuilder.CreateBox("heroTank", { height: 1, depth: 6, width: 6 }, scene);
    let tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    //let tankBack = tank[0].position.add(new BABYLON.Vector3(1,10,0) );
    //tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    //tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tankMaterial.diffuseTexture = new BABYLON.Texture("images/lightning.jpg", scene);
    tank.material = tankMaterial;
    // By default the box/tank is in 0, 0, 0, let's change that...
    tank.position.y = 2;
    tank.physicsImpostor = new BABYLON.PhysicsImpostor(tank,
        BABYLON.PhysicsImpostor.BoxImpostor, { mass: 5, restitution: .05 }, scene);


    
    tank.move = () => {

        if (inputStates.up) {
            tank.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 100));
        }
        if (inputStates.down) {
            tank.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, -100));
        }
        if (inputStates.left) {
            //const axis = new BABYLON.Vector3(0, 1, 0);
            //const quaternion = new BABYLON.Quaternion.RotationAxis(axis, -Math.PI / 4);
            //tank.physicsImpostor.setAngularVelocity(quaternion);
            tank.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(-100, 0, 0));
        }
        if (inputStates.right) {
            //const axis = new BABYLON.Vector3(0, 1, 0);
            //const quaternion = new BABYLON.Quaternion.RotationAxis(axis, Math.PI / 4);
            //tank.physicsImpostor.setAngularVelocity(quaternion);
            tank.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(100, 0, 0));
        }
        if (inputStates.space) {
            let origine = new BABYLON.Vector3(tank.position.x, tank.position.y, tank.position.z);
            tank.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 200, 0), origine);
        }
    }
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
            } else if ((event.key === "ArrowUp") || (event.key === "z") || (event.key === "Z")) {
                inputStates.up = true;
            } else if ((event.key === "ArrowRight") || (event.key === "d") || (event.key === "D")) {
                inputStates.right = true;
            } else if ((event.key === "ArrowDown") || (event.key === "s") || (event.key === "S")) {
                inputStates.down = true;
            } else if (event.key === " ") {
                inputStates.space = true;
            }
        }, false);

        //if the key will be released, change the states object 
        window.addEventListener('keyup', (event) => {
            if ((event.key === "ArrowLeft") || (event.key === "q") || (event.key === "Q")) {
                inputStates.left = false;
            } else if ((event.key === "ArrowUp") || (event.key === "z") || (event.key === "Z")) {
                inputStates.up = false;
            } else if ((event.key === "ArrowRight") || (event.key === "d") || (event.key === "D")) {
                inputStates.right = false;
            } else if ((event.key === "ArrowDown") || (event.key === "s") || (event.key === "S")) {
                inputStates.down = false;
            } else if (event.key === " ") {
                inputStates.space = false;
            }
        }, false);
    }


