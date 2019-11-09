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

    class LogicManager {
        constructor() {
            this.boxHeight = 0.25;
            this.tower_y = 0.5;
            this.tower_top_box_x = null;
            this.tower_max_x = 1.5;
            this.tower_box_speed = 0.02;
        }
        static getInstance() {
            if (this._instance == null) {
                this._instance = new LogicManager();
            }
            return this._instance;
        }
        Init() {
            console.log("init");
            this.tower_y += this.boxHeight / 2;
            this.tower_top_box_x = this.CreateBox(new Laya.Vector3(this.tower_max_x, this.tower_y, 0), new Laya.Vector4(0, 1.0, 0, 1));
            this.ToMinX(this.tower_top_box_x);
        }
        CreateBox(pos, color) {
            let box = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, this.boxHeight, 1)));
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
            box.transform.localPositionX -= this.tower_box_speed;
            if (box.transform.localPositionX <= -this.tower_max_x) {
                box.transform.localPositionX = -this.tower_max_x;
                this.ToMaxX(box);
                Laya.timer.clear(this, this.CBToMinX);
            }
        }
        ToMaxX(box) {
            Laya.timer.frameLoop(1, this, this.CBToMaxX, [box]);
        }
        CBToMaxX(box) {
            box.transform.localPositionX += this.tower_box_speed;
            if (box.transform.localPositionX >= this.tower_max_x) {
                box.transform.localPositionX = this.tower_max_x;
                this.ToMinX(box);
                Laya.timer.clear(this, this.CBToMaxX);
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
