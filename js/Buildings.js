function buildBox(x, y, width, height, depth, scene, goal) {

    const boxMat = new BABYLON.StandardMaterial("boxMat");
    boxMat.diffuseTexture = new BABYLON.Texture("images/plat.png", scene);

    let firstBuilding = new BABYLON.MeshBuilder.CreateBox("fistbuilding", {width: width, height: height, depth: depth}, scene);
    firstBuilding.position.x = x;
    firstBuilding.position.y = height/2;  //box created with default size so height is 1
    firstBuilding.position.z = y;
            
    firstBuilding.physicsImpostor = new BABYLON.PhysicsImpostor(
    firstBuilding, 
        BABYLON.PhysicsImpostor.BoxImpostor, { 
            mass: 0,
            restitution: 0,
            friction: 0.5, 
            }, 
            scene
            );
    firstBuilding.physicsImpostor.physicsBody.linearDamping = 0.999;
    firstBuilding.physicsImpostor.physicsBody.angularDamping = 0.999999999999;
            
    firstBuilding.material = boxMat;

    if (goal==true){
        const goalMat = new BABYLON.StandardMaterial("goalMat");
        goalMat.diffuseTexture = new BABYLON.Texture("images/titanHead.jpg", scene);

        let goalBuilding = new BABYLON.MeshBuilder.CreateBox("heroTank", {width: 2, height: 2, depth: 2}, scene);
        goalBuilding.position.x = 0;
        goalBuilding.position.z = 0;
        goalBuilding.position.y = 252;

        goalBuilding.physicsImpostor = new BABYLON.PhysicsImpostor(
        goalBuilding, 
            BABYLON.PhysicsImpostor.BoxImpostor, { 
                mass: 0,
                restitution: 0,
                friction: 1, 
                }, 
                scene
                );
        goalBuilding.physicsImpostor.physicsBody.linearDamping = 0.999;
        goalBuilding.physicsImpostor.physicsBody.angularDamping = 0.999999999999;
                    
        goalBuilding.material = goalMat;

            // Create and load the sound async
        var music = new BABYLON.Sound("rumblingCut", "musics/rumblingCut.mp3", scene, function () {
            // Call with the sound is ready to be played (loaded & decoded)
            // TODO: add your logic
            console.log("Sound ready to be played!");
        }, { loop: true, autoplay: true });

        // Sound will now follow the mesh position
        music.attachToMesh(goalBuilding);
    }
}

function createLights(scene) {

    var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 800, 0), scene);
    // Lights colors
    light0.diffuse = new BABYLON.Color3(50, 50, 300);
    light0.specular = new BABYLON.Color3(1, 1, 1);

    var light1 = new BABYLON.PointLight("Omni1", new BABYLON.Vector3(500, 0, 0), scene);
    // Lights colors
    light1.diffuse = new BABYLON.Color3(1, 1, 1);
    light1.specular = new BABYLON.Color3(1, 1, 1);

    var light2 = new BABYLON.PointLight("Omni1", new BABYLON.Vector3(0, 0,500), scene);
    // Lights colors
    light2.diffuse = new BABYLON.Color3(1, 1, 1);
    light2.specular = new BABYLON.Color3(1, 1, 1);

    var light3 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, -500, 0), scene);
    // Lights colors
    light3.diffuse = new BABYLON.Color3(1, 1, 1);
    light3.specular = new BABYLON.Color3(1, 1, 1);

    var light4 = new BABYLON.PointLight("Omni1", new BABYLON.Vector3(-500, 0, 0), scene);
    // Lights colors
    light4.diffuse = new BABYLON.Color3(1, 1, 1);
    light4.specular = new BABYLON.Color3(1, 1, 1);

    var light5 = new BABYLON.PointLight("Omni1", new BABYLON.Vector3(0, 0, -500), scene);
    // Lights colors
    light5.diffuse = new BABYLON.Color3(1, 1, 1);
    light5.specular = new BABYLON.Color3(1, 1, 1);

}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function startChrono() {
    var startTime = performance.now();
    return startTime;
}

function getChrono(startTime, start) {
    var getChrono = 0;
    if(start != false){
        getChrono = (performance.now()-startTime)/100;
    }
    return getChrono;
}



export {buildBox} ;
export {getRandomInt} ;
export {createLights} ;
export {startChrono} ;
export {getChrono} ;