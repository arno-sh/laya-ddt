import { ui } from "./../ui/layaMaxUI";
import LogicManager from "../LogicManager";
import Event = Laya.Event;
/**
 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
export default class GameUI extends ui.test.TestSceneUI {
	private allLables:Array<Laya.Text> = new Array<Laya.Text>();
	private bestScore:number = 0;
    constructor() {
		super();     
		LogicManager.game_ui = this;
		// LogicManager.getInstance().Init(); 
		// console.log(Laya.stage.designHeight);
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
		this.allLables.forEach(element=>{
			element.text = "";
		})
		this.btn_start.on(Event.MOUSE_DOWN,this,this.OnStart);
		this.OnRestart();
	}

	public OnRestart(){
		this.bestScore = GameUI.getLocalStorage("bestScore",0);
		this.lblBestScore.text = "" + this.bestScore;
	}
	
	public OnStart(e: Laya.Event):void{
		e.stopPropagation();
		this.box_start.visible = false;
		this.lable_score.visible = true;
		this.box_tower.visible = false;
		LogicManager.getInstance().Init();		
				
	}

	public SetCombo(num:number):void{
		this.box_combo.visible = true;
		this.box_combo.scaleX = 0;
		this.box_combo.scaleY = 0;
		if(num >= 100){
			let n1 = num%10;
			let n2 = Math.floor(num/10)%10;
			let n3 = Math.floor(num/100)%10;
			this.img_digtal_0.visible = true;
			this.img_digtal_1.visible = true;
			this.img_digtal_2.visible = true;
			this.img_digtal_0.skin = "comp/img_ddt_n"+n3+".png";
			this.img_digtal_1.skin = "comp/img_ddt_n"+n2+".png";
			this.img_digtal_2.skin = "comp/img_ddt_n"+n1+".png";
		}else if( num >= 10){
			let n1 = num%10;
			let n2 = Math.floor(num/10)%10;
			this.img_digtal_0.visible = true;
			this.img_digtal_1.visible = true;
			this.img_digtal_2.visible = false;
			this.img_digtal_0.skin = "comp/img_ddt_n"+n2+".png";
			this.img_digtal_1.skin = "comp/img_ddt_n"+n1+".png";
		}else{
			let n1 = num%10;
			this.img_digtal_0.visible = true;
			this.img_digtal_1.visible = false;
			this.img_digtal_2.visible = false;
			this.img_digtal_0.skin = "comp/img_ddt_n"+n1+".png";
		}

		Laya.Tween.to(this.box_combo,{scaleX:1,scaleY:1},250,Laya.Ease.elasticOut,Laya.Handler.create(this,()=>{
			Laya.Tween.to(this.box_combo,{scaleX:0,scaleY:0},250,Laya.Ease.linearInOut,Laya.Handler.create(this,()=>{
				this.box_combo.visible = false;
			}),100);
		}));		
	}

	public ShowTowerName(score:number):void{
		this.box_tower.visible = true;
		this.allLables.forEach(element=>{
			element.scaleX = 0;
			element.scaleY = 0;
			element.text = "";
		});
		let tower:string = "香格里拉大酒店";
		if(score < 40){
			tower = "香格里拉大酒店";
		}else if(score < 80){
			tower = "南京紫峰大厦";
		}else if(score < 100){
			tower = "长沙国际金融中心";
		}else if(score < 120){
			tower = "武汉绿地中心";
		}else if(score < 140){
			tower = "香港环球贸易广场";
		}else if(score < 160){
			tower = "上海环球金融中心";
		}else if(score < 180){
			tower = "台北101大厦";
		}else if(score < 200){
			tower = "北京中国尊";
		}else if(score < 220){
			tower = "广州周大福金融中心";
		}else if(score < 240){
			tower = "天津周大福滨海中心";
		}else if(score < 260){
			tower = "深圳平安国际金融中心";
		}else if(score < 280){
			tower = "天津117大厦";
		}else{
			tower = "上海中心";
		}
		if(score > this.bestScore){
			this.bestScore = score;
			GameUI.setLocalStorage("bestScore",score);
		}
		for(let i=0; i<tower.length; ++i){
			this.allLables[i].text = tower[i];
			Laya.Tween.to(this.allLables[i],{scaleX:1,scaleY:1},500,Laya.Ease.sineOut,null,i*300);
		}
	}

	public static getLocalStorage(key, def) {
        var num = def
        var temp1 = Laya.LocalStorage.getItem(key)
        if (temp1) {
            if (isNaN(temp1)) {
                num = def
                Laya.LocalStorage.setItem(key, num)
            } else {
                num = parseInt(temp1)
            }

        } else {
            num = def
            Laya.LocalStorage.setItem(key, num)
        }
        return num
	}
	
	public static setLocalStorage(key, num) {
        Laya.LocalStorage.setItem(key, num)
    }
	
}