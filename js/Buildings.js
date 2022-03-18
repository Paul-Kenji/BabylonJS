function buildBox(x, y, height, depth, scene) {

    const boxMat = new BABYLON.StandardMaterial("boxMat");
    boxMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/cubehouse.png")
/*
    const faceUV = [];
    faceUV[0] = new BABYLON.Vector4(0.5, 0.0, 0.75, 1.0); //rear face
    faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.25, 1.0); //front face
    faceUV[2] = new BABYLON.Vector4(0.25, 0, 0.5, 1.0); //right side
    faceUV[3] = new BABYLON.Vector4(0.75, 0, 1.0, 1.0); //left side
    faceUV[4] = new BABYLON.Vector4(0.75, 0, 1.0, 1.0); //top side*/

    let firstBuilding = new BABYLON.MeshBuilder.CreateBox("fistbuilding", {width: 5, height: height, depth: depth}, scene);
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
}

export {buildBox} ;