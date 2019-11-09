
export default class LogicManager{
    private static _instance:LogicManager;
    static camera:Laya.Camera = null;
    static scene:Laya.Scene3D = null;

    private boxHeight:number = 0.25; 
    private tower_y:number = 0.5;
    private tower_top_box_x:Laya.MeshSprite3D = null;
    private tower_max_x:number = 1.5;
    private tower_box_speed = 0.02;
    
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
        this.tower_y += this.boxHeight/2;
        this.tower_top_box_x = this.CreateBox(new Laya.Vector3(this.tower_max_x,this.tower_y,0),new Laya.Vector4(0,1.0,0,1));
        this.ToMinX(this.tower_top_box_x);
    }

    private CreateBox(pos:Laya.Vector3,color:Laya.Vector4):Laya.MeshSprite3D{
        let box: Laya.MeshSprite3D = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, this.boxHeight, 1))) as Laya.MeshSprite3D;
        box.transform.translate(pos);
        let material: Laya.BlinnPhongMaterial = new Laya.BlinnPhongMaterial();
        material.albedoColor = color;
        box.meshRenderer.material = material;
        return box;
    }

    private ToMinX(box:Laya.MeshSprite3D):void{
        Laya.timer.frameLoop(1,this,this.CBToMinX,[box])
    }

    private CBToMinX(box:Laya.MeshSprite3D){
        box.transform.localPositionX -= this.tower_box_speed;
        if(box.transform.localPositionX <= -this.tower_max_x){
            box.transform.localPositionX = -this.tower_max_x;
            this.ToMaxX(box);
            Laya.timer.clear(this,this.CBToMinX);            
        }
    }

    private ToMaxX(box:Laya.MeshSprite3D):void{
        Laya.timer.frameLoop(1,this,this.CBToMaxX,[box])
    }

    private CBToMaxX(box:Laya.MeshSprite3D){
        box.transform.localPositionX += this.tower_box_speed;
        if(box.transform.localPositionX >= this.tower_max_x){
            box.transform.localPositionX = this.tower_max_x;
            this.ToMinX(box);
            Laya.timer.clear(this,this.CBToMaxX);
        }
    }
}