(function () {
    'use strict';

    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        var test;
        (function (test) {
            class TestSceneUI extends Laya.Scene {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("test/TestScene");
                }
            }
            test.TestSceneUI = TestSceneUI;
            REG("ui.test.TestSceneUI", TestSceneUI);
        })(test = ui.test || (ui.test = {}));
    })(ui || (ui = {}));

    class GameUI extends ui.test.TestSceneUI {
        constructor() {
            super();
            this.newScene = Laya.stage.addChild(new Laya.Scene3D());
            var camera = this.newScene.addChild(new Laya.Camera(0, 0.1, 100));
            camera.transform.translate(new Laya.Vector3(0, 6, 9.5));
            camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            var directionLight = new Laya.DirectionLight();
            this.newScene.addChild(directionLight);
            directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
            var mat = directionLight.transform.worldMatrix;
            mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
            directionLight.transform.worldMatrix = mat;
            var plane = this.newScene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(10, 10, 10, 10)));
            var planeMat = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/grass.png", Laya.Handler.create(this, function (tex) {
                planeMat.albedoTexture = tex;
            }));
            var tilingOffset = planeMat.tilingOffset;
            tilingOffset.setValue(5, 5, 0, 0);
            planeMat.tilingOffset = tilingOffset;
            plane.meshRenderer.material = planeMat;
            var planeStaticCollider = plane.addComponent(Laya.PhysicsCollider);
            var planeShape = new Laya.BoxColliderShape(10, 0, 10);
            planeStaticCollider.colliderShape = planeShape;
            planeStaticCollider.friction = 2;
            planeStaticCollider.restitution = 0.3;
            this.mat1 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/wood.jpg", Laya.Handler.create(this, function (tex) {
                this.mat1.albedoTexture = tex;
                Laya.timer.once(100, this, function () {
                    this.addBox();
                });
            }));
        }
        addBox() {
            var box = this.newScene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(0.75, 0.5, 0.5)));
            box.meshRenderer.material = this.mat1;
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(0, 10, 0);
            transform.position = pos;
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(0.75, 0.5, 0.5);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/GameUI.ts", GameUI);
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1200;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    var Event = Laya.Event;
    class LogicManager {
        constructor() {
            this.move_is_x = false;
            this.boxHeight = 0.14;
            this.top_y = 0.5;
            this.top_max_x = 1.5;
            this.top_max_z = 1.5;
            this.top_box_speed = 0.02;
            this.top_box = null;
            this.top_box_color = null;
            this.last_box_postion = null;
            this.last_box_x_len = 0;
            this.last_box_z_len = 0;
            this.top_box_x_len = 0;
            this.top_box_z_len = 0;
            this.camera_org_pos = null;
            this.layer = 0;
            this.camera_target_pos = null;
            this.camera_temp_pos = null;
        }
        static getInstance() {
            if (this._instance == null) {
                this._instance = new LogicManager();
            }
            return this._instance;
        }
        Init() {
            console.log("init");
            this.camera_org_pos = LogicManager.camera.transform.position;
            this.camera_org_pos = new Laya.Vector3(this.camera_org_pos.x, this.camera_org_pos.y, this.camera_org_pos.z);
            this.camera_target_pos = new Laya.Vector3(this.camera_org_pos.x, this.camera_org_pos.y, this.camera_org_pos.z);
            this.top_y += this.boxHeight / 2;
            this.top_box_color = new Laya.Vector4(0, 1.0, 0, 1);
            this.last_box_postion = new Laya.Vector3(0, 0, 0);
            this.last_box_x_len = 1;
            this.last_box_z_len = 1;
            this.top_box_x_len = 1;
            this.top_box_z_len = 1;
            this.layer = 1;
            this.top_box = this.CreateBox(new Laya.Vector3(this.top_max_x, this.top_y, 0), this.top_box_color, this.top_box_x_len, this.top_box_z_len);
            this.ToMinX(this.top_box);
            this.move_is_x = true;
            Laya.stage.on(Event.MOUSE_DOWN, this, this.OnClick);
        }
        OnClick() {
            console.log("OnClick");
            Laya.timer.clearAll(this);
            Laya.stage.off(Event.MOUSE_DOWN, this, this.OnClick);
            if (this.move_is_x) {
                let distX = Math.abs(this.top_box.transform.position.x - this.last_box_postion.x);
                let halfX = (this.top_box_x_len + this.last_box_x_len) / 2;
                if (distX < halfX) {
                    let overlap = halfX - distX;
                    let reserved_box_pos_x = 0;
                    let drop_box_pos_x = 0;
                    let drop_box_x_len = this.top_box_x_len - overlap;
                    let x_force = 0;
                    if (this.top_box.transform.position.x > this.last_box_postion.x) {
                        reserved_box_pos_x = this.last_box_postion.x + (this.last_box_x_len / 2 - overlap) + overlap / 2;
                        drop_box_pos_x = this.last_box_postion.x + this.last_box_x_len / 2 + drop_box_x_len / 2;
                        x_force = 2.0;
                    }
                    else {
                        reserved_box_pos_x = this.last_box_postion.x - (this.last_box_x_len / 2 - overlap) - overlap / 2;
                        drop_box_pos_x = this.last_box_postion.x - this.last_box_x_len / 2 - drop_box_x_len / 2;
                        x_force = -2.0;
                    }
                    if (distX < 0.1) {
                        let pos = new Laya.Vector3(this.last_box_postion.x, this.top_y, this.last_box_postion.z);
                        this.top_box.transform.position = new Laya.Vector3(pos.x, pos.y, pos.z);
                        pos.y -= this.boxHeight / 2;
                        this.CreateEffect(pos, new Laya.Vector4(1.0, 1.0, 1.0, 0), this.last_box_x_len + 0.2, this.last_box_z_len + 0.2);
                    }
                    else {
                        let reserved_box = this.CreateBox(new Laya.Vector3(reserved_box_pos_x, this.top_y, this.last_box_postion.z), this.top_box_color, overlap, this.last_box_z_len);
                        let drop_box = this.CreateBox(new Laya.Vector3(drop_box_pos_x, this.top_y, this.last_box_postion.z), this.top_box_color, drop_box_x_len, this.last_box_z_len);
                        this.last_box_postion = reserved_box.transform.position;
                        this.last_box_x_len = overlap;
                        this.top_box_x_len = overlap;
                        this.top_box.destroy();
                        let box_shape = new Laya.BoxColliderShape(drop_box_x_len, this.boxHeight, this.last_box_z_len);
                        let drop_box_rigid = drop_box.addComponent(Laya.Rigidbody3D);
                        drop_box_rigid.colliderShape = box_shape;
                        drop_box_rigid.applyImpulse(new Laya.Vector3(x_force, 0, 0));
                        drop_box_rigid.applyTorqueImpulse(new Laya.Vector3(0, 0, x_force / 30));
                        Laya.timer.once(3000, this, () => {
                            drop_box.destroy();
                            console.log("drop_box_x destroy!!!!");
                        });
                    }
                    this.top_box_color = new Laya.Vector4(1.0, 1.0, 0, 1);
                    this.top_y += this.boxHeight;
                    ++this.layer;
                    if (this.layer > 4) {
                        this.camera_target_pos.y += this.boxHeight;
                        this.camera_temp_pos = LogicManager.camera.transform.position;
                        Laya.Tween.to(this.camera_temp_pos, {
                            y: this.camera_target_pos.y,
                            update: new Laya.Handler(this, function () {
                                LogicManager.camera.transform.position = this.camera_temp_pos;
                            })
                        }, 500, Laya.Ease.linearInOut);
                    }
                    this.move_is_x = false;
                    this.top_box = this.CreateBox(new Laya.Vector3(this.last_box_postion.x, this.top_y, this.top_max_z), this.top_box_color, this.last_box_x_len, this.last_box_z_len);
                    this.ToMinZ(this.top_box);
                    Laya.timer.once(300, this, () => {
                        Laya.stage.on(Event.MOUSE_DOWN, this, this.OnClick);
                    });
                }
                else {
                    console.log("失败!!!!!!!!!!!!!!");
                }
            }
            else {
                let distZ = Math.abs(this.top_box.transform.position.z - this.last_box_postion.z);
                let halfZ = (this.top_box_z_len + this.last_box_z_len) / 2;
                if (distZ < halfZ) {
                    let overlap = halfZ - distZ;
                    let reserved_box_pos_z = 0;
                    let drop_box_pos_z = 0;
                    let drop_box_z_len = this.top_box_z_len - overlap;
                    let z_force = 0;
                    if (this.top_box.transform.position.z > this.last_box_postion.z) {
                        reserved_box_pos_z = this.last_box_postion.z + (this.last_box_z_len / 2 - overlap) + overlap / 2;
                        drop_box_pos_z = this.last_box_postion.z + this.last_box_x_len / 2 + drop_box_z_len / 2;
                        z_force = 2.0;
                    }
                    else {
                        reserved_box_pos_z = this.last_box_postion.z - (this.last_box_z_len / 2 - overlap) - overlap / 2;
                        drop_box_pos_z = this.last_box_postion.z - this.last_box_z_len / 2 - drop_box_z_len / 2;
                        z_force = -2.0;
                    }
                    if (distZ < 0.1) {
                        let pos = new Laya.Vector3(this.last_box_postion.x, this.top_y, this.last_box_postion.z);
                        this.top_box.transform.position = new Laya.Vector3(pos.x, pos.y, pos.z);
                        pos.y -= this.boxHeight / 2;
                        this.CreateEffect(pos, new Laya.Vector4(1.0, 1.0, 1.0, 0), this.last_box_x_len + 0.2, this.last_box_z_len + 0.2);
                    }
                    else {
                        let reserved_box = this.CreateBox(new Laya.Vector3(this.last_box_postion.x, this.top_y, reserved_box_pos_z), this.top_box_color, this.last_box_x_len, overlap);
                        let drop_box = this.CreateBox(new Laya.Vector3(this.last_box_postion.x, this.top_y, drop_box_pos_z), this.top_box_color, this.last_box_x_len, drop_box_z_len);
                        this.last_box_postion = reserved_box.transform.position;
                        this.last_box_z_len = overlap;
                        this.top_box_z_len = overlap;
                        this.top_box.destroy();
                        let box_shape = new Laya.BoxColliderShape(this.last_box_x_len, this.boxHeight, drop_box_z_len);
                        let drop_box_rigid = drop_box.addComponent(Laya.Rigidbody3D);
                        drop_box_rigid.colliderShape = box_shape;
                        drop_box_rigid.applyImpulse(new Laya.Vector3(0, 0, z_force));
                        drop_box_rigid.applyTorqueImpulse(new Laya.Vector3(z_force / 30 * -1, 0, 0));
                        Laya.timer.once(3000, this, () => {
                            drop_box.destroy();
                            console.log("drop_box_z destroy!!!!");
                        });
                    }
                    this.top_box_color = new Laya.Vector4(0.0, 1.0, 0, 1);
                    this.top_y += this.boxHeight;
                    ++this.layer;
                    if (this.layer > 4) {
                        this.camera_target_pos.y += this.boxHeight;
                        this.camera_temp_pos = LogicManager.camera.transform.position;
                        Laya.Tween.to(this.camera_temp_pos, {
                            y: this.camera_target_pos.y,
                            update: new Laya.Handler(this, function () {
                                LogicManager.camera.transform.position = this.camera_temp_pos;
                            })
                        }, 500, Laya.Ease.linearInOut);
                    }
                    this.move_is_x = true;
                    this.top_box = this.CreateBox(new Laya.Vector3(this.top_max_x, this.top_y, this.last_box_postion.z), this.top_box_color, this.last_box_x_len, this.last_box_z_len);
                    this.ToMinX(this.top_box);
                    Laya.timer.once(300, this, () => {
                        Laya.stage.on(Event.MOUSE_DOWN, this, this.OnClick);
                    });
                }
                else {
                    console.log("失败!!!!!!!!!!!!!!");
                }
            }
        }
        CreateEffect(pos, color, x_len, z_len) {
            let box = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(x_len, 0.005, z_len)));
            box.transform.translate(pos);
            let material = new Laya.EffectMaterial();
            material.color = color;
            box.meshRenderer.material = material;
            Laya.timer.frameLoop(1, this, this.AlphaIn, [box, material]);
            return box;
        }
        AlphaIn(box, material) {
            let alpha = material.colorA;
            alpha += 0.1;
            material.colorA = alpha;
            if (alpha >= 0.5) {
                Laya.timer.clear(this, this.AlphaIn);
                Laya.timer.frameLoop(1, this, this.AlphaOut, [box, material]);
            }
        }
        AlphaOut(box, material) {
            let alpha = material.colorA;
            alpha -= 0.1;
            material.colorA = alpha;
            if (alpha <= 0) {
                Laya.timer.clear(this, this.AlphaOut);
                box.destroy();
            }
        }
        CreateBox(pos, color, x_len, z_len) {
            let box = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(x_len, this.boxHeight, z_len)));
            box.transform.translate(pos);
            let material = new Laya.BlinnPhongMaterial();
            material.albedoColor = color;
            box.meshRenderer.material = material;
            return box;
        }
        ToMinX(box) {
            Laya.timer.frameLoop(1, this, this.CBToMinX, [box]);
        }
        CBToMinX(box) {
            box.transform.localPositionX -= this.top_box_speed;
            if (box.transform.localPositionX <= -this.top_max_x) {
                box.transform.localPositionX = -this.top_max_x;
                this.ToMaxX(box);
                Laya.timer.clear(this, this.CBToMinX);
            }
        }
        ToMaxX(box) {
            Laya.timer.frameLoop(1, this, this.CBToMaxX, [box]);
        }
        CBToMaxX(box) {
            box.transform.localPositionX += this.top_box_speed;
            if (box.transform.localPositionX >= this.top_max_x) {
                box.transform.localPositionX = this.top_max_x;
                this.ToMinX(box);
                Laya.timer.clear(this, this.CBToMaxX);
            }
        }
        ToMinZ(box) {
            Laya.timer.frameLoop(1, this, this.CBToMinZ, [box]);
        }
        CBToMinZ(box) {
            box.transform.localPositionZ -= this.top_box_speed;
            if (box.transform.localPositionZ <= -this.top_max_z) {
                box.transform.localPositionZ = -this.top_max_z;
                this.ToMaxZ(box);
                Laya.timer.clear(this, this.CBToMinZ);
            }
        }
        ToMaxZ(box) {
            Laya.timer.frameLoop(1, this, this.CBToMaxZ, [box]);
        }
        CBToMaxZ(box) {
            box.transform.localPositionZ += this.top_box_speed;
            if (box.transform.localPositionZ >= this.top_max_z) {
                box.transform.localPositionZ = this.top_max_z;
                this.ToMinZ(box);
                Laya.timer.clear(this, this.CBToMaxZ);
            }
        }
    }
    LogicManager.camera = null;
    LogicManager.scene = null;

    class Main {
        constructor() {
            console.log("===1");
            let _config = new Config3D();
            _config.isAntialias = true;
            _config.isAlpha = false;
            Laya3D.init(GameConfig.width, GameConfig.height, _config);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            Laya.Scene3D.load("scene/LayaScene_SampleScene/Conventional/SampleScene.ls", Laya.Handler.create(null, function (scene) {
                LogicManager.scene = scene;
                Laya.stage.addChild(scene);
                LogicManager.camera = scene.getChildByName("Main Camera");
                LogicManager.camera.clearFlag = Laya.BaseCamera.CLEARFLAG_SOLIDCOLOR;
                var directionLight = scene.addChild(new Laya.DirectionLight());
                directionLight.color = new Laya.Vector3(1, 0.9, 0.8);
                var mat = directionLight.transform.worldMatrix;
                mat.setForward(new Laya.Vector3(0, -1.0, -1.0));
                directionLight.transform.worldMatrix = mat;
                LogicManager.getInstance().Init();
            }));
        }
    }
    new Main();

}());
