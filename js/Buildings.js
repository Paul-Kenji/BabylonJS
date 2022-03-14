function buildBox(x, y, size, scene) {
    let firstBuilding = new BABYLON.MeshBuilder.CreateBox("fistbuilding", {width: 5, height: 10, depth: 1.5}, scene);
    firstBuilding.position.x = 10;
    firstBuilding.position.y = 5;  //box created with default size so height is 1

    firstBuilding.physicsImpostor = new BABYLON.PhysicsImpostor(
        firstBuilding, 
        BABYLON.PhysicsImpostor.BoxImpostor, { 
            mass: 0,
            friction:1, 
        }, 
        scene
    );
    firstBuilding.physicsImpostor.physicsBody.linearDamping = 0.999;
    firstBuilding.physicsImpostor.physicsBody.angularDamping = 0.999999999999;
}

export {buildBox} ;