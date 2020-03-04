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

	var Event = Laya.Event;
	var SoundManager = Laya.SoundManager;
	class LogicManager {
	    constructor() {
	        this.top_box_color = null;
	        this.bg_front = null;
	        this.bg_black = null;
	        this.move_is_x = false;
	        this.boxHeight = 0.14;
	        this.top_y = 0.5;
	        this.top_max_x = 1.5;
	        this.top_max_z = 1.5;
	        this.top_box_speed = 0.02;
	        this.top_box = null;
	        this.last_box_postion = null;
	        this.last_box_x_len = 0;
	        this.last_box_z_len = 0;
	        this.top_box_x_len = 0;
	        this.top_box_z_len = 0;
	        this.camera_org_pos = null;
	        this.layer = 0;
	        this.camera_target_pos = null;
	        this.camera_temp_pos = null;
	        this.camera_size = 1;
	        this.score = 0;
	        this.listBox = new Array();
	        this.init = false;
	        this.life = 2;
	        this.color_idx = -1;
	        this.color_dir = 1;
	        this.soundLayer = 1;
	        this.combo = 0;
	    }
	    static getInstance() {
	        if (this._instance == null) {
	            this._instance = new LogicManager();
	        }
	        return this._instance;
	    }
	    Reset() {
	        if (this.top_box)
	            this.top_box.destroy();
	        Laya.timer.clearAll(this);
	        Laya.stage.off(Event.MOUSE_DOWN, this, this.OnClick);
	        LogicManager.game_ui.btn_continue.off(Event.MOUSE_DOWN, this, this.OnContinueGame);
	        LogicManager.game_ui.btn_reset.off(Event.MOUSE_DOWN, this, this.OnResetGame);
	        this.listBox.forEach(element => {
	            element.destroy();
	        });
	        this.listBox = new Array();
	        LogicManager.camera.transform.position = this.camera_org_pos;
	        LogicManager.camera.orthographicVerticalSize = this.camera_size;
	        this.top_box_color = new Laya.Vector4(Math.random(), Math.random(), Math.random(), 1);
	        let mat = LogicManager.bottomCube.meshRenderer.material;
	        mat.albedoColor = this.top_box_color;
	        this.Init();
	    }
	    Init() {
	        console.log("init");
	        if (!this.init) {
	            this.camera_org_pos = LogicManager.camera.transform.position;
	            this.camera_size = LogicManager.camera.orthographicVerticalSize;
	            this.camera_org_pos = new Laya.Vector3(this.camera_org_pos.x, this.camera_org_pos.y, this.camera_org_pos.z);
	            this.init = true;
	        }
	        this.camera_target_pos = new Laya.Vector3(this.camera_org_pos.x, this.camera_org_pos.y, this.camera_org_pos.z);
	        this.color_idx = -1;
	        this.top_y = 0.5;
	        this.top_y += this.boxHeight / 2;
	        this.top_box_color = this.GetNextColor(this.top_box_color);
	        this.last_box_postion = new Laya.Vector3(0, 0, 0);
	        this.last_box_x_len = 1;
	        this.last_box_z_len = 1;
	        this.top_box_x_len = 1;
	        this.top_box_z_len = 1;
	        this.layer = 1;
	        this.score = 0;
	        this.life = 0;
	        this.top_box_speed = 0.02;
	        this.soundLayer = 1;
	        this.combo = 0;
	        LogicManager.game_ui.lable_score.text = "" + this.score;
	        this.top_box = this.CreateBox(new Laya.Vector3(this.top_max_x * -1, this.top_y, 0), this.top_box_color, this.top_box_x_len, this.top_box_z_len);
	        this.ToMaxX(this.top_box);
	        this.move_is_x = true;
	        Laya.stage.on(Event.MOUSE_DOWN, this, this.OnClick);
	        LogicManager.game_ui.btn_continue.on(Event.MOUSE_DOWN, this, this.OnContinueGame);
	        LogicManager.game_ui.btn_reset.on(Event.MOUSE_DOWN, this, this.OnResetGame);
	    }
	    ChangeSpeed() {
	        let factor = Math.floor(this.layer / 5);
	        this.top_box_speed = 0.02 + (0.004 * factor);
	    }
	    OnGameOver(e) {
	        e.stopPropagation();
	        LogicManager.game_ui.box_tower.visible = false;
	        if (this.top_box)
	            this.top_box.destroy();
	        Laya.timer.clearAll(this);
	        Laya.stage.off(Event.MOUSE_DOWN, this, this.OnGameOver);
	        Laya.stage.off(Event.MOUSE_DOWN, this, this.OnClick);
	        LogicManager.game_ui.btn_continue.off(Event.MOUSE_DOWN, this, this.OnContinueGame);
	        LogicManager.game_ui.btn_reset.off(Event.MOUSE_DOWN, this, this.OnResetGame);
	        this.listBox.forEach(element => {
	            element.destroy();
	        });
	        this.listBox = new Array();
	        LogicManager.camera.transform.position = this.camera_org_pos;
	        LogicManager.camera.orthographicVerticalSize = this.camera_size;
	        LogicManager.game_ui.lable_score.visible = false;
	        LogicManager.game_ui.box_start.visible = true;
	        LogicManager.game_ui.OnRestart();
	        this.top_box_color = new Laya.Vector4(Math.random(), Math.random(), Math.random(), 1);
	        let mat = LogicManager.bottomCube.meshRenderer.material;
	        mat.albedoColor = this.top_box_color;
	    }
	    OnResetGame(e) {
	        e.stopPropagation();
	        LogicManager.game_ui.box_continue.visible = false;
	        LogicManager.game_ui.box_start.visible = false;
	        this.Reset();
	    }
	    OnClick(e) {
	        e.stopPropagation();
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
	                    this.CreateEffect(pos, new Laya.Vector4(1.0, 1.0, 1.0, 1.0), this.last_box_x_len + 0.15, this.last_box_z_len + 0.15);
	                    this.combo++;
	                    this.score += (1 + this.combo);
	                    this.ScoreAnimation(1 + this.combo);
	                    this.listBox.push(this.top_box);
	                    LogicManager.game_ui.SetCombo(this.combo);
	                }
	                else {
	                    let reserved_box = this.CreateBox(new Laya.Vector3(reserved_box_pos_x, this.top_y, this.last_box_postion.z), this.top_box_color, overlap, this.last_box_z_len);
	                    let drop_box = this.CreateBox(new Laya.Vector3(drop_box_pos_x, this.top_y, this.last_box_postion.z), this.top_box_color, drop_box_x_len, this.last_box_z_len);
	                    this.listBox.push(reserved_box);
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
	                    this.score += 1;
	                    this.ScoreAnimation(1);
	                    this.combo = 0;
	                }
	                this.top_box_color = this.GetNextColor(this.top_box_color);
	                this.top_y += this.boxHeight;
	                ++this.layer;
	                this.ChangeSpeed();
	                this.BGAni();
	                SoundManager.playSound("mp3/s" + Math.abs(this.soundLayer) + ".mp3", 1);
	                if (this.soundLayer > 0) {
	                    this.soundLayer++;
	                    if (this.soundLayer > 8) {
	                        this.soundLayer = -7;
	                    }
	                }
	                else {
	                    this.soundLayer++;
	                    if (this.soundLayer === 0) {
	                        this.soundLayer = 2;
	                    }
	                }
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
	                this.combo = 0;
	                --this.life;
	                if (this.life < 0) {
	                    this.top_box.destroy();
	                    this.top_box = null;
	                }
	                let size = Math.ceil(this.camera_size + this.top_y);
	                let speed = (size - LogicManager.camera.orthographicVerticalSize) / 50;
	                Laya.timer.loop(20, this, this.CameraFarAni, [size, speed]);
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
	                    this.CreateEffect(pos, new Laya.Vector4(1.0, 1.0, 1.0, 1.0), this.last_box_x_len + 0.15, this.last_box_z_len + 0.15);
	                    this.combo++;
	                    this.score += (1 + this.combo);
	                    this.ScoreAnimation(1 + this.combo);
	                    this.listBox.push(this.top_box);
	                    LogicManager.game_ui.SetCombo(this.combo);
	                }
	                else {
	                    let reserved_box = this.CreateBox(new Laya.Vector3(this.last_box_postion.x, this.top_y, reserved_box_pos_z), this.top_box_color, this.last_box_x_len, overlap);
	                    let drop_box = this.CreateBox(new Laya.Vector3(this.last_box_postion.x, this.top_y, drop_box_pos_z), this.top_box_color, this.last_box_x_len, drop_box_z_len);
	                    this.listBox.push(reserved_box);
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
	                    this.score += 1;
	                    this.ScoreAnimation(1);
	                    this.combo = 0;
	                }
	                this.top_box_color = this.GetNextColor(this.top_box_color);
	                this.top_y += this.boxHeight;
	                ++this.layer;
	                this.ChangeSpeed();
	                this.BGAni();
	                SoundManager.playSound("mp3/s" + Math.abs(this.soundLayer) + ".mp3", 1);
	                if (this.soundLayer > 0) {
	                    this.soundLayer++;
	                    if (this.soundLayer > 8) {
	                        this.soundLayer = -7;
	                    }
	                }
	                else {
	                    this.soundLayer++;
	                    if (this.soundLayer >= 0) {
	                        this.soundLayer = 2;
	                    }
	                }
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
	                this.top_box = this.CreateBox(new Laya.Vector3(this.top_max_x * -1, this.top_y, this.last_box_postion.z), this.top_box_color, this.last_box_x_len, this.last_box_z_len);
	                this.ToMaxX(this.top_box);
	                Laya.timer.once(300, this, () => {
	                    Laya.stage.on(Event.MOUSE_DOWN, this, this.OnClick);
	                });
	            }
	            else {
	                console.log("失败!!!!!!!!!!!!!!");
	                this.combo = 0;
	                --this.life;
	                if (this.life < 0) {
	                    this.top_box.destroy();
	                    this.top_box = null;
	                }
	                let size = Math.ceil(this.camera_size + this.top_y);
	                let speed = (size - LogicManager.camera.orthographicVerticalSize) / 50;
	                Laya.timer.loop(20, this, this.CameraFarAni, [size, speed]);
	            }
	        }
	    }
	    BGAni() {
	        this.bg_front.colorA += 0.01;
	        if (this.bg_front.colorA >= 0.06) {
	            this.bg_front.colorA = 0.01;
	            Laya.Texture2D.load("bg/img_fyd_bg" + LogicManager.randomNum(10) + ".jpg", Laya.Handler.create(this, function (tex) {
	                this.bg_front.texture = tex;
	            }));
	            Laya.Texture2D.load("bg/img_fyd_bg" + LogicManager.randomNum(9) + ".jpg", Laya.Handler.create(this, function (tex) {
	                this.bg_black.albedoTexture = tex;
	            }));
	        }
	    }
	    CameraFarAni(size, speed) {
	        LogicManager.camera.orthographicVerticalSize += speed;
	        if (LogicManager.camera.orthographicVerticalSize >= size) {
	            LogicManager.camera.orthographicVerticalSize = size;
	            Laya.timer.clear(this, this.CameraFarAni);
	            this.camera_temp_pos = new Laya.Vector3(LogicManager.camera.transform.position.x, LogicManager.camera.transform.position.y, LogicManager.camera.transform.position.z);
	            let _y = this.camera_temp_pos.y - Math.ceil(this.top_y / 3);
	            Laya.Tween.to(this.camera_temp_pos, { y: _y, update: new Laya.Handler(this, function () {
	                    LogicManager.camera.transform.position = this.camera_temp_pos;
	                }) }, 500, Laya.Ease.linearInOut, new Laya.Handler(this, function () {
	                if (this.life >= 0) {
	                    LogicManager.game_ui.box_continue.visible = true;
	                }
	                else {
	                    LogicManager.game_ui.ShowTowerName(this.score);
	                    Laya.timer.once(5000, this, () => {
	                        Laya.stage.on(Event.MOUSE_DOWN, this, this.OnGameOver);
	                    });
	                }
	            }));
	        }
	    }
	    CameraNearAni(size, speed) {
	        LogicManager.camera.orthographicVerticalSize -= speed;
	        if (LogicManager.camera.orthographicVerticalSize <= size) {
	            LogicManager.camera.orthographicVerticalSize = size;
	            this.last_box_postion = new Laya.Vector3(0, 0, 0);
	            this.last_box_x_len = 1;
	            this.last_box_z_len = 1;
	            this.top_box_x_len = 1;
	            this.top_box_z_len = 1;
	            this.top_box = this.CreateBox(new Laya.Vector3(this.top_max_x * -1, this.top_y, 0), this.top_box_color, this.top_box_x_len, this.top_box_z_len);
	            this.ToMaxX(this.top_box);
	            this.move_is_x = true;
	            Laya.stage.on(Event.MOUSE_DOWN, this, this.OnClick);
	            Laya.timer.clear(this, this.CameraNearAni);
	        }
	    }
	    OnContinueGame(e) {
	        console.log("ContinueGame");
	        e.stopPropagation();
	        this.top_box.destroy();
	        LogicManager.game_ui.box_continue.visible = false;
	        this.listBox.push(this.CreateBox(new Laya.Vector3(0, this.top_y, 0), this.top_box_color, 0.3, 0.3));
	        this.top_box_color = this.GetNextColor(this.top_box_color);
	        this.top_y += this.boxHeight;
	        for (let i = 1; i <= 5; ++i) {
	            this.listBox.push(this.CreateBox(new Laya.Vector3(0, this.top_y, 0), this.top_box_color, i / 5, i / 5));
	            this.top_y += this.boxHeight;
	            this.top_box_color = this.GetNextColor(this.top_box_color);
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
	        }
	        let speed = (LogicManager.camera.orthographicVerticalSize - this.camera_size) / 25;
	        Laya.timer.loop(20, this, this.CameraNearAni, [this.camera_size, speed]);
	    }
	    CreateEffect(pos, color, x_len, z_len) {
	        let box = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(x_len, 0.005, z_len)));
	        box.transform.translate(pos);
	        box.layer = 1;
	        let material = new Laya.UnlitMaterial();
	        material.albedoColor = color;
	        material.albedoColorA = 0;
	        material.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
	        box.meshRenderer.material = material;
	        Laya.timer.frameLoop(1, this, this.AlphaIn, [box, material]);
	        return box;
	    }
	    AlphaIn(box, material) {
	        let alpha = material.albedoColorA;
	        alpha += 0.05;
	        material.albedoColorA = alpha;
	        if (alpha >= 0.4) {
	            Laya.timer.clear(this, this.AlphaIn);
	            Laya.timer.frameLoop(1, this, this.AlphaOut, [box, material]);
	        }
	    }
	    AlphaOut(box, material) {
	        let alpha = material.albedoColorA;
	        alpha -= 0.05;
	        material.albedoColorA = alpha;
	        if (alpha <= 0) {
	            Laya.timer.clear(this, this.AlphaOut);
	            box.destroy();
	        }
	    }
	    CreateBox(pos, color, x_len, z_len) {
	        let box = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(x_len, this.boxHeight, z_len)));
	        box.transform.translate(pos);
	        box.layer = 1;
	        let material = new Laya.BlinnPhongMaterial();
	        material.albedoColor = color;
	        box.meshRenderer.material = material;
	        return box;
	    }
	    CreateCylinder(pos, color, radius) {
	        let box = LogicManager.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCylinder(radius, this.boxHeight, 30)));
	        box.transform.translate(pos);
	        box.layer = 1;
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
	    ScoreAnimation(score) {
	        let text = new Laya.Text();
	        text.text = "+" + score;
	        text.align = "center";
	        text.fontSize = 50;
	        text.color = "#ffffff";
	        LogicManager.game_ui.addChild(text);
	        text.x = Laya.stage.width / 2 - 30;
	        text.y = LogicManager.game_ui.lable_score.y;
	        Laya.Tween.from(text, { x: Laya.stage.width / 2, y: LogicManager.game_ui.lable_score.y + 200, scaleX: 0, scaleY: 0 }, 500, Laya.Ease.linearInOut, Laya.Handler.create(this, () => {
	            text.destroy();
	            LogicManager.game_ui.lable_score.text = "" + this.score;
	        }));
	    }
	    GetNextColor(curColor) {
	        let color = new Laya.Vector4(curColor.x, curColor.y, curColor.z, 1);
	        let step = 20;
	        let vels = [color.x, color.y, color.z];
	        while (this.color_idx < 0) {
	            let rand = Math.random();
	            this.color_idx = rand < 0.33 ? 0 : (rand < 0.66 ? 1 : 2);
	            this.color_dir = 1;
	            if (vels[this.color_idx] > 0.95) {
	                this.color_dir = -1;
	            }
	        }
	        switch (this.color_idx) {
	            case 0:
	                color.x += (1 / step * this.color_dir);
	                vels[0] = color.x;
	                break;
	            case 1:
	                color.y += (1 / step * this.color_dir);
	                vels[1] = color.y;
	                break;
	            case 2:
	                color.z += (1 / step * this.color_dir);
	                vels[2] = color.z;
	                break;
	        }
	        if (this.color_dir == 1 && vels[this.color_idx] > 0.95) {
	            this.color_dir = -1;
	            this.color_idx = -1;
	        }
	        if (this.color_dir == -1 && vels[this.color_idx] < 0.05) {
	            this.color_dir = 1;
	            this.color_idx = -1;
	        }
	        return color;
	    }
	    static randomNum(num) {
	        return Math.floor(Math.random() * num);
	    }
	}
	LogicManager.camera = null;
	LogicManager.scene = null;
	LogicManager.game_ui = null;
	LogicManager.bottomCube = null;

	var Event$1 = Laya.Event;
	class GameUI extends ui.test.TestSceneUI {
	    constructor() {
	        super();
	        this.allLables = new Array();
	        this.bestScore = 0;
	        this.gID = "";
	        this.lblRanks = new Array();
	        LogicManager.game_ui = this;
	        this.box_combo.visible = false;
	        this.box_tower.visible = false;
	        this.allLables.push(this.lable_0);
	        this.allLables.push(this.lable_1);
	        this.allLables.push(this.lable_2);
	        this.allLables.push(this.lable_3);
	        this.allLables.push(this.lable_4);
	        this.allLables.push(this.lable_5);
	        this.allLables.push(this.lable_6);
	        this.allLables.push(this.lable_7);
	        this.allLables.push(this.lable_8);
	        this.allLables.push(this.lable_9);
	        this.allLables.forEach(element => {
	            element.text = "";
	        });
	        this.lblRanks.push(this.lblRank_1);
	        this.lblRanks.push(this.lblRank_2);
	        this.lblRanks.push(this.lblRank_3);
	        this.lblRanks.push(this.lblRank_4);
	        this.lblRanks.push(this.lblRank_5);
	        this.lblRanks.push(this.lblRank_6);
	        this.lblRanks.push(this.lblRank_7);
	        this.lblRanks.push(this.lblRank_8);
	        this.lblRanks.push(this.lblRank_9);
	        this.lblRanks.push(this.lblRank_10);
	        this.btn_start.on(Event$1.MOUSE_DOWN, this, this.OnStart);
	        this.btn_more.on(Event$1.MOUSE_DOWN, this, this.onMore);
	        this.btn_rank.on(Event$1.MOUSE_DOWN, this, this.onRank);
	        this.btn_rank_return.on(Event$1.MOUSE_DOWN, this, this.onCloseRank);
	        this.gID = this.cans();
	        this.OnRestart();
	    }
	    OnRestart() {
	        this.bestScore = GameUI.getLocalStorage("bestScore", 0);
	        this.lblBestScore.text = "" + this.bestScore;
	        this.textGID.text = "ID-" + this.gID;
	        if (this.bestScore > 0) {
	            this.netPushScore(this.bestScore);
	        }
	        this.boxRank.visible = false;
	        this.btn_rank_return.visible = false;
	    }
	    OnStart(e) {
	        e.stopPropagation();
	        this.box_start.visible = false;
	        this.lable_score.visible = true;
	        this.box_tower.visible = false;
	        LogicManager.getInstance().Init();
	    }
	    onMore(e) {
	        e.stopPropagation();
	        window.location.href = 'http://www.doudoubird.com/ddn/newGame.html?from=groupmessage';
	    }
	    onRank(e) {
	        e.stopPropagation();
	        this.boxRank.visible = true;
	        this.btn_rank_return.visible = true;
	        this.httpGet("http://www.ask4kid.com:9001/get_rank?canvas_id=" + this.gID + "&game=ddt", (res) => {
	            if (res && res.status === 0) {
	                if (res.info) {
	                    for (let index = 0; index < res.info.length; index++) {
	                        const element = res.info[index];
	                        if (element.canvas_id === this.gID) {
	                            this.lblRanks[index].text = "" + (index + 1) + "-" + element.canvas_id + ":(我)     " + element.score;
	                            this.lblRanks[index].color = "#ff0000";
	                        }
	                        else {
	                            this.lblRanks[index].text = "" + (index + 1) + "-" + element.canvas_id + ":         " + element.score;
	                            this.lblRanks[index].color = "#1aa000";
	                        }
	                    }
	                }
	            }
	        });
	    }
	    onCloseRank(e) {
	        e.stopPropagation();
	        this.boxRank.visible = false;
	        this.btn_rank_return.visible = false;
	    }
	    SetCombo(num) {
	        this.box_combo.visible = true;
	        this.box_combo.scaleX = 0;
	        this.box_combo.scaleY = 0;
	        if (num >= 100) {
	            let n1 = num % 10;
	            let n2 = Math.floor(num / 10) % 10;
	            let n3 = Math.floor(num / 100) % 10;
	            this.img_digtal_0.visible = true;
	            this.img_digtal_1.visible = true;
	            this.img_digtal_2.visible = true;
	            this.img_digtal_0.skin = "comp/img_ddt_n" + n3 + ".png";
	            this.img_digtal_1.skin = "comp/img_ddt_n" + n2 + ".png";
	            this.img_digtal_2.skin = "comp/img_ddt_n" + n1 + ".png";
	        }
	        else if (num >= 10) {
	            let n1 = num % 10;
	            let n2 = Math.floor(num / 10) % 10;
	            this.img_digtal_0.visible = true;
	            this.img_digtal_1.visible = true;
	            this.img_digtal_2.visible = false;
	            this.img_digtal_0.skin = "comp/img_ddt_n" + n2 + ".png";
	            this.img_digtal_1.skin = "comp/img_ddt_n" + n1 + ".png";
	        }
	        else {
	            let n1 = num % 10;
	            this.img_digtal_0.visible = true;
	            this.img_digtal_1.visible = false;
	            this.img_digtal_2.visible = false;
	            this.img_digtal_0.skin = "comp/img_ddt_n" + n1 + ".png";
	        }
	        Laya.Tween.to(this.box_combo, { scaleX: 1, scaleY: 1 }, 250, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
	            Laya.Tween.to(this.box_combo, { scaleX: 0, scaleY: 0 }, 250, Laya.Ease.linearInOut, Laya.Handler.create(this, () => {
	                this.box_combo.visible = false;
	            }), 100);
	        }));
	    }
	    ShowTowerName(score) {
	        this.box_tower.visible = true;
	        this.allLables.forEach(element => {
	            element.scaleX = 0;
	            element.scaleY = 0;
	            element.text = "";
	        });
	        let tower = "香格里拉大酒店";
	        if (score < 40) {
	            tower = "香格里拉大酒店";
	        }
	        else if (score < 80) {
	            tower = "南京紫峰大厦";
	        }
	        else if (score < 100) {
	            tower = "长沙国际金融中心";
	        }
	        else if (score < 120) {
	            tower = "武汉绿地中心";
	        }
	        else if (score < 140) {
	            tower = "香港环球贸易广场";
	        }
	        else if (score < 160) {
	            tower = "上海环球金融中心";
	        }
	        else if (score < 180) {
	            tower = "台北101大厦";
	        }
	        else if (score < 200) {
	            tower = "北京中国尊";
	        }
	        else if (score < 220) {
	            tower = "广州周大福金融中心";
	        }
	        else if (score < 240) {
	            tower = "天津周大福滨海中心";
	        }
	        else if (score < 260) {
	            tower = "深圳平安国际金融中心";
	        }
	        else if (score < 280) {
	            tower = "天津117大厦";
	        }
	        else {
	            tower = "上海中心";
	        }
	        if (score > this.bestScore) {
	            this.bestScore = score;
	            GameUI.setLocalStorage("bestScore", score);
	            this.netPushScore(this.bestScore);
	        }
	        for (let i = 0; i < tower.length; ++i) {
	            this.allLables[i].text = tower[i];
	            Laya.Tween.to(this.allLables[i], { scaleX: 1, scaleY: 1 }, 500, Laya.Ease.sineOut, null, i * 300);
	        }
	    }
	    static getLocalStorage(key, def) {
	        var num = def;
	        var temp1 = Laya.LocalStorage.getItem(key);
	        if (temp1) {
	            var temp2 = Number(temp1);
	            if (isNaN(temp2)) {
	                num = def;
	                Laya.LocalStorage.setItem(key, num);
	            }
	            else {
	                num = parseInt(temp1);
	            }
	        }
	        else {
	            num = def;
	            Laya.LocalStorage.setItem(key, num);
	        }
	        return num;
	    }
	    static setLocalStorage(key, num) {
	        Laya.LocalStorage.setItem(key, num);
	    }
	    bin2hex(str) {
	        var result = "";
	        for (let i = 0; i < str.length; i++) {
	            result += this.int16_to_hex(str.charCodeAt(i));
	        }
	        return result;
	    }
	    int16_to_hex(i) {
	        var result = i.toString(16);
	        var j = 0;
	        while (j + result.length < 4) {
	            result = "0" + result;
	            j++;
	        }
	        return result;
	    }
	    cans() {
	        var canvas = document.createElement('canvas');
	        var ctx = canvas.getContext('2d');
	        var txt = 'www.flashflora.com';
	        ctx.textBaseline = "top";
	        ctx.font = "14px 'Arial'";
	        ctx.fillStyle = "#f60";
	        ctx.fillRect(125, 1, 62, 20);
	        ctx.fillStyle = "#069";
	        ctx.fillText(txt, 2, 15);
	        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
	        ctx.fillText(txt, 4, 17);
	        var b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
	        var bin = atob(b64);
	        var crc = this.bin2hex(bin.slice(-16, -12));
	        return crc;
	    }
	    httpGet(url, callback) {
	        let xhr = new Laya.HttpRequest();
	        xhr.once(Event$1.COMPLETE, this, () => {
	            callback(xhr.data);
	        });
	        xhr.http.withCredentials = false;
	        xhr.http.timeout = 8000;
	        xhr.send(url, "", "get", "json", ["Content-Type", "application/json", 'Access-Control-Allow-Origin', '*', 'Access-Control-Allow-Methods', 'GET, POST', 'Access-Control-Allow-Headers', 'x-requested-with,content-type,authorization']);
	    }
	    netPushScore(score) {
	        this.httpGet("http://www.ask4kid.com:9001/update_rank_asc?canvas_id=" + this.gID + "&game=ddt&score=" + score, (res) => {
	        });
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

	class Main {
	    constructor() {
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
	        Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onPreLoadFinish));
	    }
	    onPreLoadFinish() {
	        Laya.Scene3D.load("scene/LayaScene_SampleScene/Conventional/SampleScene.ls", Laya.Handler.create(this, function (scene) {
	            LogicManager.scene = scene;
	            Laya.stage.addChild(scene);
	            console.log("--" + Laya.stage.numChildren);
	            LogicManager.camera = scene.getChildByName("Main Camera");
	            LogicManager.camera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY;
	            LogicManager.bottomCube = scene.getChildByName("Cube");
	            LogicManager.getInstance().top_box_color = new Laya.Vector4(Math.random(), Math.random(), Math.random(), 1);
	            let matBox = LogicManager.bottomCube.meshRenderer.material;
	            matBox.albedoColor = LogicManager.getInstance().top_box_color;
	            LogicManager.camera.removeAllLayers();
	            LogicManager.camera.addLayer(1);
	            LogicManager.bottomCube.layer = 1;
	            let BGCamera = scene.getChildByName("BGCamera");
	            let Plane_1 = scene.getChildByName("Plane_1");
	            let Plane_2 = scene.getChildByName("Plane_2");
	            Plane_1.layer = 10;
	            Plane_2.layer = 10;
	            BGCamera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY;
	            BGCamera.removeAllLayers();
	            BGCamera.addLayer(10);
	            let matP1 = new Laya.EffectMaterial();
	            Laya.Texture2D.load("bg/img_fyd_bg" + LogicManager.randomNum(10) + ".jpg", Laya.Handler.create(this, function (tex) {
	                matP1.texture = tex;
	            }));
	            matP1.colorA = 0.01;
	            Plane_1.meshRenderer.material = matP1;
	            LogicManager.getInstance().bg_front = matP1;
	            let matP2 = new Laya.BlinnPhongMaterial();
	            Laya.Texture2D.load("bg/img_fyd_bg" + LogicManager.randomNum(9) + ".jpg", Laya.Handler.create(this, function (tex) {
	                matP2.albedoTexture = tex;
	            }));
	            matP2.albedoColorA = 0.1;
	            Plane_2.meshRenderer.material = matP2;
	            LogicManager.getInstance().bg_black = matP2;
	            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene, false);
	        }));
	    }
	}
	new Main();

}());
