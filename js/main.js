let canvas;
let engine;
let scene;
// vars for handling inputs
let inputStates = {};
window.onload = startGame;

var mMouse = false;
var mf = false;
var mb = false;
var ml = false;
var mr = false;
var mup = false;
var mjump = 0;
var indicJump = false;
var spood = 0;
var howmuchairmove = 1;
var bhops = 0;
var transpower = 1;

//mouse
var ex = 0;
var ey = 0;
var pex = 0;
var pey = 0;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    
    //add music
   /*var music = new BABYLON.Sound("music", 'musics/musicFond.mp3', scene, soundReady, {loop:true,volume: 0.5})
    function soundReady(){
        music.play();
    }*/

    

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
    scene.collisionsEnabled = true;
	scene.enablePhysics(new BABYLON.Vector3(0, -100, 0));
    scene.gravity = new BABYLON.Vector3(0, -100, 0);
    let ground = createGround(scene);
    let tank = createTank(scene);
    //////

    //////
    let followCamera = createFollowCamera(scene, tank);
    scene.activeCameras = followCamera;
    createLights(scene);

//////////////////////////////////////
    buildDwellings();
//////////////////////////////////////

    return scene;
}

function createGround(scene) {
    const groundOptions = { width: 1000, height: 1000, subdivisions: 200, minHeight: 0, maxHeight: 100, onReady: onGroundCreated };
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", 'images/hmap1.png', groundOptions, scene);

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg");
        ground.material = groundMaterial;
        // to be taken into account by collision detection
        ground.checkCollisions = true;
        //to see all meshes
        groundMaterial.wireframe=true;

        // for physic engine
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
                BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0,
                restitution:0,
                friction:.01
                },
                scene);   
    }
    let firstBuilding = new BABYLON.MeshBuilder.CreateBox("fistbuilding", {width: 5, height: 10, depth: 1.5}, scene);
    firstBuilding.position.x = 10;
    firstBuilding.position.y = 5;  //box created with default size so height is 1

    firstBuilding.physicsImpostor = new BABYLON.PhysicsImpostor(
        firstBuilding, 
        BABYLON.PhysicsImpostor.BoxImpostor, { 
            mass: 0, 
        }, 
        scene
    );
    firstBuilding.physicsImpostor.physicsBody.linearDamping = 0.999;
    firstBuilding.physicsImpostor.physicsBody.angularDamping = 0.999999999999;

    ///////////////////////////////////d
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

    var firePistol = function () {
        var ray = camera.getForwardRay(100);
        var hit = scene.pickWithRay(ray);
        if (hit.hit) {
            var hitt = BABYLON.Mesh.CreateSphere("hitt", 16, 1, scene);
            hitt.position = hit.pickedPoint;
        }
    }

    //init
    canvas.addEventListener("pointermove", onPointerMove, false);
    camera.position = tank.position.add(new BABYLON.Vector3(0, 2.5, 0));
    var eulerRot = BABYLON.Vector3.Zero();

    var update = function() {
        
        if (mMouse == true){
        /**
         * 4. In which direction camera is looking?
         */
        var origin = camera.position;

        /**
        * 5. Get camera's looking direction according to it's location in 3D
        */
        function vecToLocal(vector, mesh) {
            var m = mesh.getWorldMatrix();
            var v = BABYLON.Vector3.TransformCoordinates(vector, m);
            return v;
        }

        var forward = new BABYLON.Vector3(0,0,1);
	    forward = vecToLocal(forward, camera);

	    var direction = forward.subtract(origin);
	    direction = BABYLON.Vector3.Normalize(direction);

        /**
         * 6. Create a ray in that direction
         */
        var ray = new BABYLON.Ray(origin, direction);

        /**
         * 7. Get the picked mesh and the distance
         */
        var hit = scene.pickWithRay(ray);

        if (hit.pickedMesh){
            var dist = BABYLON.Vector3.Distance(camera.position, hit.pickedMesh.position);
            if(dist<50){
                firePistol();
            }  
        }
                

            mMouse = false;
        } 
        if (mf == true) translate(tank, new BABYLON.Vector3(0, 0, 4+spood*howmuchairmove+bhops), transpower);
        if (mb == true) translate(tank, new BABYLON.Vector3(0, 0, -(2+spood*howmuchairmove+bhops)), transpower);
        if (ml == true) translate(tank, new BABYLON.Vector3(-(3+spood*howmuchairmove+bhops), 0, 0), transpower);
        if (mr == true) translate(tank, new BABYLON.Vector3(3+spood*howmuchairmove+bhops, 0, 0), transpower);
        if (mup == true) {
            let origine = new BABYLON.Vector3(tank.position.x, tank.position.y, tank.position.z);
            if( mjump == 0){ // first jump
                tank.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 20, 0), origine);
                var musicJump = new BABYLON.Sound("musicjump", 'musics/jump.mp3', scene, soundReady, {loop:false,volume: 0.5})
                function soundReady(){
                    musicJump.play();
                }
                
            }
            else if( mjump == 1){ //second jump
                tank.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 10, 0), origine);
                var musicJump = new BABYLON.Sound("musicjump", 'musics/jump.mp3', scene, soundReady, {loop:false,volume: 0.5})
                function soundReady(){
                    musicJump.play();
                }
                setTimeout(chargeJump, 800);
            }
            mjump ++;
            mup = false;
        }

        // Raise cam.pos.y 0.45 ...
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

    tank.position.y = 15;
    tank1.parent = tank;

    let tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseTexture = new BABYLON.Texture("images/lightning.jpg", scene);
    tank.material = tankMaterial;
    // By default the box/tank is in 0, 0, 0, let's change that...
    tank.physicsImpostor = new BABYLON.PhysicsImpostor(
        tank, 
        BABYLON.PhysicsImpostor.BoxImpostor, { 
            mass: 0.5, 
            restitution: 0,
            friction: .01,
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
                mMouse = true;
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
                inputStates.space = false;
                mup = false;
            }
        }, false);
    }

function chargeJump(){
    indicJump = false;
    mjump = 0;
}

////////////////////////////////////////////////////////////////////////////
/******Build Functions***********/
const buildDwellings = () => {

    const detached_house = buildHouse(1);
    detached_house.rotation.y = -Math.PI / 16;
    detached_house.position.x = -6.8;
    detached_house.position.z = 2.5;

    const semi_house = buildHouse(2);
    semi_house .rotation.y = -Math.PI / 16;
    semi_house.position.x = -4.5;
    semi_house.position.z = 3;

    const places = []; //each entry is an array [house type, rotation, x, z]
    places.push([1, -Math.PI / 16, -6.8, 2.5 ]);
    places.push([2, -Math.PI / 16, -4.5, 3 ]);
    places.push([2, -Math.PI / 16, -1.5, 4 ]);
    places.push([2, -Math.PI / 3, 1.5, 6 ]);
    places.push([2, 15 * Math.PI / 16, -6.4, -1.5 ]);
    places.push([1, 15 * Math.PI / 16, -4.1, -1 ]);
    places.push([2, 15 * Math.PI / 16, -2.1, -0.5 ]);
    places.push([1, 5 * Math.PI / 4, 0, -1 ]);
    places.push([1, Math.PI + Math.PI / 2.5, 0.5, -3 ]);
    places.push([2, Math.PI + Math.PI / 2.1, 0.75, -5 ]);
    places.push([1, Math.PI + Math.PI / 2.25, 0.75, -7 ]);
    places.push([2, Math.PI / 1.9, 4.75, -1 ]);
    places.push([1, Math.PI / 1.95, 4.5, -3 ]);
    places.push([2, Math.PI / 1.9, 4.75, -5 ]);
    places.push([1, Math.PI / 1.9, 4.75, -7 ]);
    places.push([2, -Math.PI / 3, 5.25, 2 ]);
    places.push([1, -Math.PI / 3, 6, 4 ]);

    //Create instances from the first two that were built 
    const houses = [];
    for (let i = 0; i < places.length; i++) {
        if (places[i][0] === 1) {
            houses[i] = detached_house.createInstance("house" + i);
        }
        else {
            houses[i] = semi_house.createInstance("house" + i);
        }
        houses[i].rotation.y = places[i][1];
        houses[i].position.x = places[i][2];
        houses[i].position.z = places[i][3];
    }
}

const buildHouse = (width) => {
    const box = buildBox(width);
    const roof = buildRoof(width);
    return BABYLON.Mesh.MergeMeshes([box, roof], true, false, null, false, true);
}
/*
ground.checkCollisions = true;
//groundMaterial.wireframe=true;
        // for physic engine
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
            BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0,
                                                         restitution:0,
                                                         friction:.001
                                                         },
                                                         scene); 
*/
const buildBox = (width) => {
    //texture
    const boxMat = new BABYLON.StandardMaterial("boxMat");
    if (width == 2) {
       boxMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/semihouse.png") 
    }
    else {
        boxMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/cubehouse.png");   
    }

    //options parameter to set different images on each side
    const faceUV = [];
    if (width == 2) {
        faceUV[0] = new BABYLON.Vector4(0.6, 0.0, 1.0, 1.0); //rear face
        faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.4, 1.0); //front face
        faceUV[2] = new BABYLON.Vector4(0.4, 0, 0.6, 1.0); //right side
        faceUV[3] = new BABYLON.Vector4(0.4, 0, 0.6, 1.0); //left side
    }
    else {
        faceUV[0] = new BABYLON.Vector4(0.5, 0.0, 0.75, 1.0); //rear face
        faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.25, 1.0); //front face
        faceUV[2] = new BABYLON.Vector4(0.25, 0, 0.5, 1.0); //right side
        faceUV[3] = new BABYLON.Vector4(0.75, 0, 1.0, 1.0); //left side
    }
    // top 4 and bottom 5 not seen so not set

    /**** World Objects *****/
    const box = BABYLON.MeshBuilder.CreateBox("box", {width: width, faceUV: faceUV, wrap: true});
    box.material = boxMat;
    box.position.y = 0.5;

    return box;
}

const buildRoof = (width) => {
    //texture
    const roofMat = new BABYLON.StandardMaterial("roofMat");
    roofMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/roof.jpg");

    const roof = BABYLON.MeshBuilder.CreateCylinder("roof", {diameter: 1.3, height: 1.2, tessellation: 3});
    roof.material = roofMat;
    roof.scaling.x = 0.75;
    roof.scaling.y = width;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;

    return roof;
}
////////////////////////////////////////////////////////////////

