import GameConfig from "./GameConfig";
import LogicManager from "./LogicManager";
class Main {

	constructor() {
		//console.log("===2");
		//根据IDE设置初始化引擎		
		// if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
		// else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);

		//创建一个config3D
		let _config:Config3D = new Config3D();
		//设置不开启抗锯齿
		_config.isAntialias = true;
		//设置画布不透明
		_config.isAlpha = false;
		//使用创建的config3d
		Laya3D.init(GameConfig.width, GameConfig.height, _config);


		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		Laya.stage.scaleMode = GameConfig.scaleMode;
		Laya.stage.screenMode = GameConfig.screenMode;
		Laya.stage.alignV = GameConfig.alignV;
		Laya.stage.alignH = GameConfig.alignH;
		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		if (GameConfig.stat) Laya.Stat.show();
		Laya.alertGlobalError = true;

		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
	}

	onVersionLoaded(): void {
		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onPreLoadFinish));
	}

	onPreLoadFinish():void{
		// console.log("onPreLoadFinish=");
		Laya.Scene3D.load("scene/LayaScene_SampleScene/Conventional/SampleScene.ls",Laya.Handler.create(this,function(scene){
			LogicManager.scene = scene;
			Laya.stage.addChild(scene);
			console.log("--"+Laya.stage.numChildren);
			//获取摄像机
			LogicManager.camera = scene.getChildByName("Main Camera");
			//清除摄像机的标记
			// LogicManager.camera.de
			LogicManager.camera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY;
			LogicManager.bottomCube = scene.getChildByName("Cube");
			LogicManager.getInstance().top_box_color = new Laya.Vector4(Math.random(),Math.random(),Math.random(),1);
			let matBox:Laya.BlinnPhongMaterial = LogicManager.bottomCube.meshRenderer.material as Laya.BlinnPhongMaterial;
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
			let matP1:Laya.EffectMaterial = new Laya.EffectMaterial();

			Laya.Texture2D.load("bg/img_fyd_bg"+LogicManager.randomNum(10)+".jpg", Laya.Handler.create(this, function(tex) {
				matP1.texture = tex;
			}));			
			matP1.colorA = 0.01;
			
			Plane_1.meshRenderer.material = matP1;
			LogicManager.getInstance().bg_front = matP1;

			let matP2:Laya.BlinnPhongMaterial = new Laya.BlinnPhongMaterial();
			Laya.Texture2D.load("bg/img_fyd_bg"+LogicManager.randomNum(9)+".jpg", Laya.Handler.create(this, function(tex) {
				matP2.albedoTexture = tex;
			}));		
			matP2.albedoColorA = 0.1;			
			Plane_2.meshRenderer.material = matP2;
			LogicManager.getInstance().bg_black = matP2;
			  
			//添加光照
			//创建方向光
			// var directionLight = scene.addChild(new Laya.DirectionLight()) as Laya.DirectionLight;
			// //方向光的颜色
			// directionLight.color = new Laya.Vector3(0.3, 0.3, 0.3);
			// directionLight.intensity = 0.3;
			// //设置平行光的方向
			// var mat = directionLight.transform.worldMatrix;
			// mat.setForward(new Laya.Vector3(1.0, -1.0, -1.0));
			// directionLight.transform.worldMatrix=mat;	
	
			
			//加载IDE指定的场景
			// console.log('============++++++++++++++')
			GameConfig.startScene && Laya.Scene.open(GameConfig.startScene,false);	
		}));

	}

	
}
//激活启动类
new Main();
