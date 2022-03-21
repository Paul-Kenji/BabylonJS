import {buildBox} from "./Buildings.js";
import {getRandomInt} from "./Buildings.js";
import {createLights} from "./Buildings.js";
import {startChrono} from "./Buildings.js";
import {getChrono} from "./Buildings.js";

let canvas;
let engine;
let scene;
// vars for handling inputs
let inputStates = {};
window.onload = startGame;

var mMouseR = false;
var mMouseL = false;
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
/*start chrono*/
var sc = 0;
var score = 0;

/*for test the contact*/
var count = 0;
var start = false;
var countRay = 0;
var rayHelper = null;
var startHit = 0;
var hitMoment = 0;
var b = 0;
var c = 0;
var rayList = [];

//mouse
var ex = 0;
var ey = 0;
var pex = 0;
var pey = 0;
var left, right;
left = 0;
right = 2;
var oraCount = 0;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    //add music
    var music = new BABYLON.Sound("music", 'musics/musicFond.mp3', scene, soundReady, {loop:true,volume: 0.1})
    function soundReady(){
        music.play();
    }

    // modify some default settings (i.e pointer events to prevent cursor to go 
    // out of the game window)
    modifySettings();

    let tank = scene.getMeshByName("heroTank");
    engine.runRenderLoop(() => {
        document.getElementById("timer").innerText = " TIME : " + getChrono(sc, start);
        document.getElementById("rules").innerText = "PRESS 'F' TO RETRY! \n Play with Mouse: \n Right click: grap wall& Left click: attack \n Find the the noisy box and kill it as quick as possible\n";
        document.getElementById("score").innerText = " SCORE : " + score;
        let deltaTime = engine.getDeltaTime(); // remind you something ?
        scene.render();
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    // enable physics
    scene.collisionsEnabled = true;
	scene.enablePhysics(new BABYLON.Vector3(0, -100, 0));
    scene.gravity = new BABYLON.Vector3(0, 0, 0);
    let ground = createGround(scene);
    let tank = createTank(scene);
    tank.actionManager = new BABYLON.ActionManager(scene);
    
    let followCamera = createFollowCamera(scene, tank);
    scene.activeCameras = followCamera;
    createLights(scene);
    /*building*/
    buildMap(scene);
    return scene;
}

function createGround(scene) {
    
    const groundOptions = { width: 1000, height: 1000, subdivisions: 10, minHeight: 0, maxHeight: 300, onReady: onGroundCreated };
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", 'images/hmap1.png', groundOptions, scene);

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/plat.png", scene);
        ground.material = groundMaterial;
        // to be taken into account by collision detection
        ground.checkCollisions = true;
        //to see all meshes
        groundMaterial.wireframe=false;

        // for physic engine
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
                BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0,
                restitution:0,
                friction:.01
                },
                scene);   
    }  
    return ground;
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
    camera.position.y = 0.60;
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

    //init
    canvas.addEventListener("pointermove", onPointerMove, false);
    camera.position = tank.position.add(new BABYLON.Vector3(0, 2.5, 0));
    var eulerRot = BABYLON.Vector3.Zero();

    var update = function() {
        
            //4. In which direction camera is looking?
            var origin = camera.position;

            //5. Get camera's looking direction according to it's location in 3D
            function vecToLocal(vector, mesh) {
                var m = mesh.getWorldMatrix();
                var v = BABYLON.Vector3.TransformCoordinates(vector, m);
                return v;
            }

            var forward = new BABYLON.Vector3(0,0,1);
            forward = vecToLocal(forward, camera);

            var direction = forward.subtract(origin);
            direction = BABYLON.Vector3.Normalize(direction);

            //6. Create a ray in that direction
            var ray = new BABYLON.Ray(origin, direction);

            //7. Get the picked mesh and the distance
            var hit = scene.pickWithRay(ray);
            

        if (mMouseR == true){
            if (hit.pickedMesh){
                var distPicked = BABYLON.Vector3.Distance(camera.position, hit.pickedMesh.position);

                if(distPicked<150){
                    /*if good touch*/
                    if(hit.hit) {
                        var distTank = BABYLON.Vector3.Distance(tank.position, hit.pickedMesh.position);
                        if (distTank>5){
                            if (count <3){
                                /*add sound grap*/
                                var musicJump = new BABYLON.Sound("grap", 'musics/grap.mp3', scene, soundReady, {loop:false,volume: 0.5})
                                function soundReady(){
                                musicJump.play();
                                }
                                count++;
                                var rayP = camera.getForwardRay(distTank);
                                rayHelper = new BABYLON.RayHelper(rayP);
                                rayHelper.show(scene, BABYLON.Color3.Red());
                                countRay++;
                                hit.position = hit.pickedPoint;
                                b = hit.position.y;
                                c = hit.position.z;
                                rayList.push(rayHelper);
                            }
                            else if (count>3) {
                                count = 0;
                            }
                            translate(tank, new BABYLON.Vector3(0,b/1.75,c/2), transpower);
                        }
                        else if (distTank <= 5){
                            translate(tank, new BABYLON.Vector3(0,0,0), 0);
                            console.log("counter" + count);
                            mMouseR = false; 
                        }
                        distTank = BABYLON.Vector3.Distance(tank.position, hit.pickedMesh.position);
                    }
                }  
            }  
        } 
        if (mf == true) translate(tank, new BABYLON.Vector3(0, 0, 4+spood*howmuchairmove+bhops), transpower*1.5); 
        if (mb == true) translate(tank, new BABYLON.Vector3(0, 0, -(2+spood*howmuchairmove+bhops)), transpower);
        if (ml == true) translate(tank, new BABYLON.Vector3(-(3+spood*howmuchairmove+bhops), 0, 0), transpower*1.5);
        if (mr == true) translate(tank, new BABYLON.Vector3(3+spood*howmuchairmove+bhops, 0, 0), transpower*1.5);
        if (mup == true) {
            let origine = new BABYLON.Vector3(tank.position.x, tank.position.y, tank.position.z);
            if( mjump == 0){ // first jump
                tank.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 75, 0), origine);
                var musicJump = new BABYLON.Sound("musicjump", 'musics/jump.mp3', scene, soundReady, {loop:false,volume: 0.5})
                function soundReady(){
                    musicJump.play();
                }
                
            }
            else if( mjump == 1){ //second jump
                tank.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 40, 0), origine);
                var musicJump = new BABYLON.Sound("musicjump", 'musics/jump.mp3', scene, soundReady, {loop:false,volume: 0.5})
                function soundReady(){
                    musicJump.play();
                }
                setTimeout(chargeJump, 1500);
            }
            mjump ++;
            mup = false;
        }

        // Raise cam.pos.y 0.45 ...
        camera.position = tank.position.add(new BABYLON.Vector3(0, 2.5, 0));
        tank.physicsImpostor.physicsBody.quaternion.toEuler(eulerRot); // adjust eulerRot value
        camera.rotation.y = eulerRot.y; // use adjusted value

        /*delete ray when tank touch the ground*/
        if (tank.position.y <=3){
            countRay = 0;
            rayList.forEach(rayHelper => {
                rayHelper.dispose();
            });
        }

        /*increase the speed of the fall*/
        if (tank.position.y >=3 && start !=false){
            translate(tank, new BABYLON.Vector3(0, -1, 0), transpower); 
        }

        /*attack on titan*/
        if (mMouseL == true){
            /*add sound JOJO*/
            var ora = new BABYLON.Sound("ora", 'musics/ora.mp3', scene, soundReady, {loop:false,volume: 2})
            function soundReady(){
                ora.play();
            }
            if (hit.pickedMesh){
                var distPicked = BABYLON.Vector3.Distance(camera.position, hit.pickedMesh.position);
                if(distPicked<5){
                    oraCount++;
                    if(oraCount == 5){
                        score = getChrono(sc, start);
                    }
                }
            }
            mMouseL = false;
        }
        
    }
    scene.registerBeforeRender(function() {
        update();
    });
}

function createTank(scene) {
    let tank = new BABYLON.MeshBuilder.CreateBox("heroTank", {width: 2, height: 1, depth: 2}, scene);
    let tank1 = new BABYLON.MeshBuilder.CreateBox("tank1", {width: 2, height: 1, depth: 2}, scene);
    tank.position.x = 295;
    tank.position.z = 295;
    tank.position.y = 15;
    tank1.parent = tank;

    let tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseTexture = new BABYLON.Texture("images/bob.png", scene);
    tank1.material = tankMaterial;
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
        scene.onPointerDown = (e) => {
            if (!scene.alreadyLocked) {
                console.log("requesting pointer lock");
                canvas.requestPointerLock();
                start = true;
                sc = startChrono();
            } else if(e.button === right){
                count =0;
                mMouseR = true;
            }
            else if(e.button === left){
                mMouseL = true;
            }
        }

        scene.onPointerUp = (e) => {
            if (e.button === right) {
                mMouseR = false;
                console.log("Mouse up ");
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
            //to reload the page
            } else if ((event.key === "f") || (event.key === "F")) {
                window.location.reload();
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
function buildMap(scene){
    var taMaison = [];
    var randomIndexLoop = getRandomInt(50, 80);
    while (randomIndexLoop>0){
        var randomX = getRandomInt(-300, 280);
        var randomY = getRandomInt(-300, 280);
        var randomW = getRandomInt(5, 50);
        var randomH = getRandomInt(5, 300);
        var randomD = getRandomInt(5, 50);
        taMaison.push(buildBox(randomX, randomY, randomW, randomH, randomD, scene, false));
        randomIndexLoop--;
    }
    /*build goal*/
    taMaison.push(buildBox(0, 0, 30, 250, 30, scene, true));
}
////////////////////////////////////////////////////////////////