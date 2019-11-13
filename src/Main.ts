import GameConfig from "./GameConfig";
import LogicManager from "./LogicManager";
class Main {

	constructor() {
		console.log("===1");
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
		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
	}

	onConfigLoaded(): void {
		     
		Laya.Scene3D.load("scene/LayaScene_SampleScene/Conventional/SampleScene.ls",Laya.Handler.create(null,function(scene){
			LogicManager.scene = scene;
			//加载完成获取到了Scene3d
			// console.log(Laya.stage.numChildren);
			Laya.stage.addChild(scene);
			// Laya.stage.setChildIndex(scene,0);
			//获取摄像机
			LogicManager.camera = scene.getChildByName("Main Camera");
			//清除摄像机的标记
			LogicManager.camera.clearFlag = Laya.BaseCamera.CLEARFLAG_SOLIDCOLOR;
			//添加光照
			//创建方向光
			var directionLight = scene.addChild(new Laya.DirectionLight()) as Laya.DirectionLight;
			//方向光的颜色
			directionLight.color = new Laya.Vector3(1, 0.9, 0.8);
			//设置平行光的方向
			var mat = directionLight.transform.worldMatrix;
			mat.setForward(new Laya.Vector3(0, -1.0, -1.0));
			directionLight.transform.worldMatrix=mat;			

			// console.log("width="+Laya.stage.width);
			//加载IDE指定的场景
			GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
		}));


	}
}
//激活启动类
new Main();
