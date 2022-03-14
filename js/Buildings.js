function buildBox(x, y, height, depth, scene) {
    let firstBuilding = new BABYLON.MeshBuilder.CreateBox("fistbuilding", {width: 5, height: height, depth: depth}, scene);
    firstBuilding.position.x = x;
    firstBuilding.position.y = height/2;  //box created with default size so height is 1
    firstBuilding.position.z = y;

    firstBuilding.physicsImpostor = new BABYLON.PhysicsImpostor(
        firstBuilding, 
        BABYLON.PhysicsImpostor.BoxImpostor, { 
            mass: 0,
            friction:0.5, 
        }, 
        scene
    );
    firstBuilding.physicsImpostor.physicsBody.linearDamping = 0.999;
    firstBuilding.physicsImpostor.physicsBody.angularDamping = 0.999999999999;
}

export {buildBox} ;