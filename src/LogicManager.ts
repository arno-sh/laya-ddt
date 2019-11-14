import GameUI from "./script/GameUI"
import Event = Laya.Event;

export default class LogicManager{
    private static _instance:LogicManager;
    static camera:Laya.Camera = null;
    static scene:Laya.Scene3D = null;
    static game_ui:GameUI = null;

    private move_is_x:boolean = false;
    private boxHeight:number = 0.14; 
    private top_y:number = 0.5;
    private top_max_x:number = 1.5;
    private top_max_z:number = 1.5;
    private top_box_speed = 0.02;
    private top_box:Laya.MeshSprite3D = null;
    private top_box_color:Laya.Vector4 = null;
    private last_box_postion:Laya.Vector3 = null;
    private last_box_x_len:number = 0;
    private last_box_z_len:number = 0;
    private top_box_x_len:number = 0;
    private top_box_z_len:number = 0;

    private camera_org_pos:Laya.Vector3 = null;
    private layer:number = 0;
    private camera_target_pos:Laya.Vector3 = null;
    private camera_temp_pos:Laya.Vector3 = null;
    private camera_size:number = 1;
    private score:number = 0;

    private listBox:Array<Laya.Sprite3D> = new Array<Laya.MeshSprite3D>();
    private init:boolean = false;
    private life:number = 2;
    private color_idx:number = -1;
    private color_dir:number = 1;

    constructor(){
    }
    public static getInstance():LogicManager{
        if(this._instance == null){
            this._instance = new LogicManager();
        }
        return this._instance;
    }

    public Reset():void{
        if(this.top_box)
            this.top_box.destroy();

        Laya.timer.clearAll(this);
        Laya.stage.off(Event.MOUSE_DOWN, this, this.OnClick);
        LogicManager.game_ui.btn_continue.off(Event.MOUSE_DOWN,this,this.OnContinueGame);
        LogicManager.game_ui.btn_reset.off(Event.MOUSE_DOWN,this,this.OnResetGame);
        this.listBox.forEach(element => {
            element.destroy();
        });
        this.listBox = new Array<Laya.MeshSprite3D>();
        LogicManager.camera.transform.position = this.camera_org_pos;
        LogicManager.camera.orthographicVerticalSize = this.camera_size;
        this.Init();
    }


    public Init():void{
        console.log("init");
        if(!this.init){
            this.camera_org_pos = LogicManager.camera.transform.position;
            this.camera_size = LogicManager.camera.orthographicVerticalSize;
            this.camera_org_pos = new Laya.Vector3(this.camera_org_pos.x,this.camera_org_pos.y,this.camera_org_pos.z);
            this.init = true;
        }
        this.camera_target_pos = new Laya.Vector3(this.camera_org_pos.x,this.camera_org_pos.y,this.camera_org_pos.z);
        this.color_idx = -1;
        this.top_y = 0.5;
        this.top_y += this.boxHeight/2;
        this.top_box_color = new Laya.Vector4(Math.random(),Math.random(),Math.random(),1);
        this.last_box_postion = new Laya.Vector3(0,0,0);
        this.last_box_x_len = 1;
        this.last_box_z_len = 1;
        this.top_box_x_len = 1;
        this.top_box_z_len = 1;
        this.layer = 1;
        this.score = 0;
        this.life = 0;
        this.top_box_speed = 0.02;
        LogicManager.game_ui.lable_score.text = ""+this.score;
        this.top_box = this.CreateBox(new Laya.Vector3(this.top_max_x*-1,this.top_y,0), this.top_box_color,  this.top_box_x_len,  this.top_box_z_len);
        this.ToMaxX(this.top_box);
        this.move_is_x = true;
        Laya.stage.on(Event.MOUSE_DOWN, this, this.OnClick);
        LogicManager.game_ui.btn_continue.on(Event.MOUSE_DOWN,this,this.OnContinueGame);
        LogicManager.game_ui.btn_reset.on(Event.MOUSE_DOWN,this,this.OnResetGame);
    }

    private ChangeSpeed():void{
 
        let factor = Math.floor(this.layer / 5);
        this.top_box_speed = 0.02+(0.002*factor);
        // console.log(this.top_box_speed);
    }

    
    public OnGameOver(e: Laya.Event):void{
        e.stopPropagation();

        if(this.top_box)
            this.top_box.destroy();

        Laya.timer.clearAll(this);
        Laya.stage.off(Event.MOUSE_DOWN, this, this.OnGameOver);
        Laya.stage.off(Event.MOUSE_DOWN, this, this.OnClick);
        LogicManager.game_ui.btn_continue.off(Event.MOUSE_DOWN,this,this.OnContinueGame);
        LogicManager.game_ui.btn_reset.off(Event.MOUSE_DOWN,this,this.OnResetGame);
        this.listBox.forEach(element => {
            element.destroy();
        });
        this.listBox = new Array<Laya.MeshSprite3D>();
        LogicManager.camera.transform.position = this.camera_org_pos;
        LogicManager.camera.orthographicVerticalSize = this.camera_size;
        LogicManager.game_ui.lable_score.visible = false;
        LogicManager.game_ui.box_start.visible = true;
    }

    public OnResetGame(e: Laya.Event):void{
        e.stopPropagation();
        LogicManager.game_ui.box_continue.visible = false;
        LogicManager.game_ui.box_start.visible = false;
        this.Reset();		
    }

    public OnClick(e: Laya.Event):void{
        // console.log("OnClick");  
        e.stopPropagation();     
        Laya.timer.clearAll(this);
        Laya.stage.off(Event.MOUSE_DOWN, this, this.OnClick);
        if(this.move_is_x){
            let distX = Math.abs(this.top_box.transform.position.x - this.last_box_postion.x);
            let halfX = (this.top_box_x_len +  this.last_box_x_len)/2;
            if(distX < halfX){
                let overlap = halfX - distX;
                let reserved_box_pos_x = 0;
                let drop_box_pos_x = 0;
                let drop_box_x_len = this.top_box_x_len - overlap;
                let x_force = 0;
                if(this.top_box.transform.position.x > this.last_box_postion.x){
                    reserved_box_pos_x = this.last_box_postion.x + (this.last_box_x_len/2 - overlap) + overlap/2;
                    drop_box_pos_x = this.last_box_postion.x + this.last_box_x_len/2 + drop_box_x_len/2;
                    x_force = 2.0;
                }else{
                    reserved_box_pos_x = this.last_box_postion.x - (this.last_box_x_len/2 - overlap) - overlap/2;
                    drop_box_pos_x = this.last_box_postion.x - this.last_box_x_len/2 - drop_box_x_len/2;
                    x_force = -2.0;
                }


                if(distX < 0.1){
                    let pos = new Laya.Vector3(this.last_box_postion.x,this.top_y,this.last_box_postion.z);
                    this.top_box.transform.position = new Laya.Vector3(pos.x,pos.y,pos.z);
                    pos.y -= this.boxHeight/2;
                    this.CreateEffect(pos,new Laya.Vector4(1.0,1.0,1.0,0),this.last_box_x_len+0.2,this.last_box_z_len+0.2);
                    this.score += 3;
                    this.ScoreAnimation(3);
                    this.listBox.push(this.top_box);
                }else{
                    let reserved_box = this.CreateBox(new Laya.Vector3(reserved_box_pos_x, this.top_y,this.last_box_postion.z),this.top_box_color,overlap,this.last_box_z_len);
                    let drop_box = this.CreateBox(new Laya.Vector3(drop_box_pos_x,this.top_y,this.last_box_postion.z),this.top_box_color,drop_box_x_len,this.last_box_z_len);
                    this.listBox.push(reserved_box);

                    this.last_box_postion = reserved_box.transform.position;
                    this.last_box_x_len = overlap;
                    this.top_box_x_len = overlap;
                    this.top_box.destroy();
    
                    let box_shape:Laya.BoxColliderShape = new Laya.BoxColliderShape(drop_box_x_len,this.boxHeight,this.last_box_z_len);              
                    let drop_box_rigid:Laya.Rigidbody3D =   drop_box.addComponent(Laya.Rigidbody3D);
                    drop_box_rigid.colliderShape = box_shape;
                    drop_box_rigid.applyImpulse(new Laya.Vector3(x_force,0,0));
                    drop_box_rigid.applyTorqueImpulse(new Laya.Vector3(0,0,x_force/30));
                    Laya.timer.once(3000,this,()=>{
                        drop_box.destroy();
                        console.log("drop_box_x destroy!!!!")
                    });
                    this.score += 1;
                    this.ScoreAnimation(1);
                }

                this.top_box_color = this.GetNextColor(this.top_box_color);
                this.top_y += this.boxHeight;
                ++this.layer;
                this.ChangeSpeed();
                if(this.layer > 4){
                    this.camera_target_pos.y += this.boxHeight;
                    this.camera_temp_pos = LogicManager.camera.transform.position;
                    Laya.Tween.to(this.camera_temp_pos,{
                        y:this.camera_target_pos.y
                        ,update:new Laya.Handler(this,function(){
                            LogicManager.camera.transform.position = this.camera_temp_pos;
                        })
                    }, 500,Laya.Ease.linearInOut);
                }
                this.move_is_x = false;
                this.top_box = this.CreateBox(new Laya.Vector3(this.last_box_postion.x,this.top_y,this.top_max_z),this.top_box_color,this.last_box_x_len,this.last_box_z_len);
                this.ToMinZ(this.top_box);
                Laya.timer.once(300,this,()=>{
                    Laya.stage.on(Event.MOUSE_DOWN, this, this.OnClick);
                });
            }else{
                console.log("失败!!!!!!!!!!!!!!")
                // LogicManager.game_ui.box_continue.visible = true;
                --this.life;
                if(this.life < 0){
                    this.top_box.destroy();
                    this.top_box = null;
                }
                let size = Math.ceil(this.camera_size+this.top_y);
                let speed = (size - LogicManager.camera.orthographicVerticalSize)/50;  
                Laya.timer.loop(20,this,this.CameraFarAni,[size,speed]);
            }
        }else{
            let distZ = Math.abs(this.top_box.transform.position.z - this.last_box_postion.z);
            let halfZ = (this.top_box_z_len +  this.last_box_z_len)/2;
            if(distZ < halfZ){
                let overlap = halfZ - distZ;
                let reserved_box_pos_z = 0;
                let drop_box_pos_z = 0;
                let drop_box_z_len = this.top_box_z_len - overlap;
                let z_force = 0;
                if(this.top_box.transform.position.z > this.last_box_postion.z){
                    reserved_box_pos_z = this.last_box_postion.z + (this.last_box_z_len/2 - overlap) + overlap/2;
                    drop_box_pos_z = this.last_box_postion.z + this.last_box_x_len/2 + drop_box_z_len/2;
                    z_force = 2.0;
                }else{
                    reserved_box_pos_z = this.last_box_postion.z - (this.last_box_z_len/2 - overlap) - overlap/2;
                    drop_box_pos_z = this.last_box_postion.z - this.last_box_z_len/2 - drop_box_z_len/2;
                    z_force = -2.0;
                }

                if(distZ < 0.1){
                    let pos = new Laya.Vector3(this.last_box_postion.x,this.top_y,this.last_box_postion.z);
                    this.top_box.transform.position = new Laya.Vector3(pos.x,pos.y,pos.z);
                    pos.y -= this.boxHeight/2;
                    this.CreateEffect(pos,new Laya.Vector4(1.0,1.0,1.0,0),this.last_box_x_len+0.2,this.last_box_z_len+0.2);
                    this.score += 3;
                    this.ScoreAnimation(3);
                    this.listBox.push(this.top_box);
                }else{
                    let reserved_box = this.CreateBox(new Laya.Vector3(this.last_box_postion.x, this.top_y,reserved_box_pos_z),this.top_box_color,this.last_box_x_len,overlap);
                    let drop_box = this.CreateBox(new Laya.Vector3(this.last_box_postion.x,this.top_y,drop_box_pos_z),this.top_box_color,this.last_box_x_len,drop_box_z_len);
                    this.listBox.push(reserved_box);
                    this.last_box_postion = reserved_box.transform.position;
                    this.last_box_z_len = overlap;
                    this.top_box_z_len = overlap;
                    this.top_box.destroy();

                    let box_shape:Laya.BoxColliderShape = new Laya.BoxColliderShape(this.last_box_x_len,this.boxHeight,drop_box_z_len);              
                    let drop_box_rigid:Laya.Rigidbody3D =   drop_box.addComponent(Laya.Rigidbody3D);
                    drop_box_rigid.colliderShape = box_shape;
                    drop_box_rigid.applyImpulse(new Laya.Vector3(0,0,z_force));
                    drop_box_rigid.applyTorqueImpulse(new Laya.Vector3(z_force/30*-1,0,0));
                    Laya.timer.once(3000,this,()=>{
                        drop_box.destroy();
                        console.log("drop_box_z destroy!!!!")
                    });
                    this.score += 1;
                    this.ScoreAnimation(1);
                }

                
                this.top_box_color = this.GetNextColor(this.top_box_color);
                this.top_y += this.boxHeight;
                ++this.layer;
                this.ChangeSpeed();
                if(this.layer > 4){
                    this.camera_target_pos.y += this.boxHeight;
                    this.camera_temp_pos = LogicManager.camera.transform.position;
                    Laya.Tween.to(this.camera_temp_pos,{
                        y:this.camera_target_pos.y
                        ,update:new Laya.Handler(this,function(){
                            LogicManager.camera.transform.position = this.camera_temp_pos;
                        })
                    }, 500,Laya.Ease.linearInOut);
                }
                this.move_is_x = true;
                this.top_box = this.CreateBox(new Laya.Vector3(this.top_max_x*-1,this.top_y,this.last_box_postion.z),this.top_box_color,this.last_box_x_len,this.last_box_z_len);
                this.ToMaxX(this.top_box);
                Laya.timer.once(300,this,()=>{
                    Laya.stage.on(Event.MOUSE_DOWN, this, this.OnClick);
                });

            }else{
                console.log("失败!!!!!!!!!!!!!!") 
                // LogicManager.game_ui.box_continue.visible = true;
                // LogicManager.camera.orthographicVerticalSize = Math.ceil(this.camera_size+this.top_y);
                --this.life;
                if(this.life < 0){
                    this.top_box.destroy();
                    this.top_box = null;
                }
                let size = Math.ceil(this.camera_size+this.top_y);
                let speed = (size - LogicManager.camera.orthographicVerticalSize)/50;  
                Laya.timer.loop(20,this,this.CameraFarAni,[size,speed]);
                
            }
        }
    }

    public CameraFarAni(size:number,speed:number){
  
        LogicManager.camera.orthographicVerticalSize += speed;
        if(LogicManager.camera.orthographicVerticalSize >= size){
            LogicManager.camera.orthographicVerticalSize = size;
            Laya.timer.clear(this,this.CameraFarAni);
           
            this.camera_temp_pos = new Laya.Vector3(LogicManager.camera.transform.position.x,LogicManager.camera.transform.position.y,LogicManager.camera.transform.position.z);
            let _y = this.camera_temp_pos.y - Math.ceil(this.top_y/3);
            Laya.Tween.to(this.camera_temp_pos,{y:_y,update:new Laya.Handler(this,function(){
                LogicManager.camera.transform.position = this.camera_temp_pos;
            })},500,Laya.Ease.linearInOut,new Laya.Handler(this,function(){
                if(this.life >= 0){
                    LogicManager.game_ui.box_continue.visible = true;
                }else{
                    Laya.stage.on(Event.MOUSE_DOWN,this,this.OnGameOver);
                }
            }));
        }   
        
    }

    public CameraNearAni(size:number,speed:number){
        LogicManager.camera.orthographicVerticalSize -= speed;
        if(LogicManager.camera.orthographicVerticalSize <= size){
            LogicManager.camera.orthographicVerticalSize = size;

            this.last_box_postion = new Laya.Vector3(0,0,0);
            this.last_box_x_len = 1;
            this.last_box_z_len = 1;
            this.top_box_x_len = 1;
            this.top_box_z_len = 1;
            this.top_box = this.CreateBox(new Laya.Vector3(this.top_max_x*-1,this.top_y,0), this.top_box_color,  this.top_box_x_len,  this.top_box_z_len);
            this.ToMaxX(this.top_box);
            this.move_is_x = true;
    
            Laya.stage.on(Event.MOUSE_DOWN, this, this.OnClick);
    
            Laya.timer.clear(this,this.CameraNearAni);
        } 
    }

    public OnContinueGame(e:Laya.Event):void{
        console.log("ContinueGame"); 
        e.stopPropagation();

        this.top_box.destroy();
        LogicManager.game_ui.box_continue.visible = false;

        // this.listBox.push(this.CreateCylinder(new Laya.Vector3(0,this.top_y,0),this.top_box_color,0.5));

        this.listBox.push(this.CreateBox(new Laya.Vector3(0,this.top_y,0),this.top_box_color,0.3,0.3));

        this.top_box_color = this.GetNextColor(this.top_box_color);
        this.top_y += this.boxHeight;
        for(let i=1; i<=5; ++i){
            this.listBox.push(this.CreateBox(new Laya.Vector3(0,this.top_y,0),this.top_box_color,i/5,i/5));
            this.top_y += this.boxHeight;
            this.top_box_color = this.GetNextColor(this.top_box_color);
            ++this.layer;
            if(this.layer > 4){
                this.camera_target_pos.y += this.boxHeight;
                this.camera_temp_pos = LogicManager.camera.transform.position;
                Laya.Tween.to(this.camera_temp_pos,{
                    y:this.camera_target_pos.y
                    ,update:new Laya.Handler(this,function(){
                        LogicManager.camera.transform.position = this.camera_temp_pos;
                    })
                }, 500,Laya.Ease.linearInOut);
            }
        }


        let speed = (LogicManager.camera.orthographicVerticalSize - this.camera_size)/25;  
        // LogicManager.camera.transform.position = this.camera_org_pos;
        Laya.timer.loop(20,this,this.CameraNearAni,[this.camera_size,speed]);        
       
    }

    private CreateEffect(pos:Laya.Vector3,color:Laya.Vector4,x_len:number,z_len:number):Laya.MeshSprite3D{
        let box: Laya.MeshSprite3D = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(x_len, 0.005, z_len))) as Laya.MeshSprite3D;
        box.transform.translate(pos);
        let material: Laya.EffectMaterial = new Laya.EffectMaterial();
        material.color = color;
        box.meshRenderer.material = material;      
        Laya.timer.frameLoop(1,this,this.AlphaIn,[box,material]);
        return box;
    }

    private AlphaIn(box: Laya.MeshSprite3D,material: Laya.EffectMaterial):void{
        let alpha = material.colorA;
        alpha += 0.1;
        material.colorA = alpha;
        if(alpha >= 0.5){
            Laya.timer.clear(this,this.AlphaIn);
            Laya.timer.frameLoop(1,this,this.AlphaOut,[box,material]);
        }
    }

    private AlphaOut(box: Laya.MeshSprite3D,material: Laya.EffectMaterial):void{
        let alpha = material.colorA;
        alpha -= 0.1;
        material.colorA = alpha;
        if(alpha <= 0){
            Laya.timer.clear(this,this.AlphaOut);
            box.destroy();
        }
    }


    private CreateBox(pos:Laya.Vector3,color:Laya.Vector4,x_len:number,z_len:number):Laya.MeshSprite3D{
        let box: Laya.MeshSprite3D = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(x_len, this.boxHeight, z_len))) as Laya.MeshSprite3D;
        box.transform.translate(pos);
        let material: Laya.BlinnPhongMaterial = new Laya.BlinnPhongMaterial();
        material.albedoColor = color;
        box.meshRenderer.material = material;
        return box;
    }

    private CreateCylinder(pos:Laya.Vector3,color:Laya.Vector4,radius:number):Laya.MeshSprite3D{
        let box: Laya.MeshSprite3D = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCylinder(radius, this.boxHeight, 30))) as Laya.MeshSprite3D;
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
        box.transform.localPositionX -= this.top_box_speed;
        if(box.transform.localPositionX <= -this.top_max_x){
            box.transform.localPositionX = -this.top_max_x;
            this.ToMaxX(box);
            Laya.timer.clear(this,this.CBToMinX);            
        }
    }

    private ToMaxX(box:Laya.MeshSprite3D):void{
        Laya.timer.frameLoop(1,this,this.CBToMaxX,[box])
    }

    private CBToMaxX(box:Laya.MeshSprite3D){
        box.transform.localPositionX += this.top_box_speed;
        if(box.transform.localPositionX >= this.top_max_x){
            box.transform.localPositionX = this.top_max_x;
            this.ToMinX(box);
            Laya.timer.clear(this,this.CBToMaxX);
        }
    }

    private ToMinZ(box:Laya.MeshSprite3D):void{
        Laya.timer.frameLoop(1,this,this.CBToMinZ,[box])
    }

    private CBToMinZ(box:Laya.MeshSprite3D){
        box.transform.localPositionZ -= this.top_box_speed;
        if(box.transform.localPositionZ <= -this.top_max_z){
            box.transform.localPositionZ = -this.top_max_z;
            this.ToMaxZ(box);
            Laya.timer.clear(this,this.CBToMinZ);            
        }
    }

    private ToMaxZ(box:Laya.MeshSprite3D):void{
        Laya.timer.frameLoop(1,this,this.CBToMaxZ,[box])
    }

    private CBToMaxZ(box:Laya.MeshSprite3D){
        box.transform.localPositionZ += this.top_box_speed;
        if(box.transform.localPositionZ >= this.top_max_z){
            box.transform.localPositionZ = this.top_max_z;
            this.ToMinZ(box);
            Laya.timer.clear(this,this.CBToMaxZ);
        }
    }

    private ScoreAnimation(score:number):void{
        let text = new Laya.Text();
        text.text = "+"+score;
        text.align = "center";
        text.fontSize = 50;
        text.color = "#ffffff";
        LogicManager.game_ui.addChild(text);
        text.x = Laya.stage.width/2-30;
        text.y = LogicManager.game_ui.lable_score.y;
        Laya.Tween.from(text,{x:Laya.stage.width/2,y:LogicManager.game_ui.lable_score.y+200,scaleX:0,scaleY:0},500,Laya.Ease.linearInOut,Laya.Handler.create(this,()=>{
            text.destroy();
            LogicManager.game_ui.lable_score.text = ""+this.score;
        }));
        // Laya.Tween.from(text,{scaleX:0,scaleY:0},500,Laya.Ease.linearInOut);
    }

    private GetNextColor(curColor:Laya.Vector4):Laya.Vector4{
        let color = new Laya.Vector4(curColor.x,curColor.y,curColor.z,1);
        let step = 20;
        let vels = [color.x,color.y,color.z];

        while(this.color_idx < 0){
            let rand = Math.random();
            this.color_idx = rand < 0.33 ? 0 : ( rand < 0.66 ? 1 : 2);
            this.color_dir = 1;
            if(vels[this.color_idx] > 0.95){
                this.color_dir = -1;
            }
        }

        switch(this.color_idx){
            case 0:
            color.x += (1/step*this.color_dir);
            vels[0] =  color.x;
            break;
            case 1:
            color.y += (1/step*this.color_dir);
            vels[1] =  color.y;
            break;
            case 2:
            color.z += (1/step*this.color_dir);
            vels[2] =  color.z;
            break;
        }

        if(this.color_dir == 1 && vels[this.color_idx] > 0.95 ){
            this.color_dir = -1;
            this.color_idx = -1;
        }

        if(this.color_dir == -1 && vels[this.color_idx] < 0.05 ){
            this.color_dir = 1;
            this.color_idx = -1;
        }

        return color;
    }
}