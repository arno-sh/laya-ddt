
export default class LogicManager{
    private static _instance:LogicManager;
    static camera:Laya.Camera = null;
    static scene:Laya.Scene3D = null;

    private boxHeight:number = 0.25; 
    
    constructor(){
    }
    public static getInstance():LogicManager{
        if(this._instance == null){
            this._instance = new LogicManager();
        }
        return this._instance;
    }

    public Init():void{
        console.log("init");
        let box: Laya.MeshSprite3D = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, this.boxHeight, 1))) as Laya.MeshSprite3D;
        box.transform.translate(new Laya.Vector3(0, 0.5+this.boxHeight/2, 0));
        let material: Laya.BlinnPhongMaterial = new Laya.BlinnPhongMaterial();
        material.albedoColor = new Laya.Vector4(0,1.0,0,1);
        box.meshRenderer.material = material;
    }
}