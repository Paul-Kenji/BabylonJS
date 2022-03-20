function buildBox(x, y, width, height, depth, scene) {

    const boxMat = new BABYLON.StandardMaterial("boxMat");
    boxMat.diffuseTexture = new BABYLON.Texture("images/plat.png", scene);
/*
    const faceUV = [];
    faceUV[0] = new BABYLON.Vector4(0.5, 0.0, 0.75, 1.0); //rear face
    faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.25, 1.0); //front face
    faceUV[2] = new BABYLON.Vector4(0.25, 0, 0.5, 1.0); //right side
    faceUV[3] = new BABYLON.Vector4(0.75, 0, 1.0, 1.0); //left side
    faceUV[4] = new BABYLON.Vector4(0.75, 0, 1.0, 1.0); //top side*/

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
}

function createLights(scene) {

    var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 500, 0), scene);
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