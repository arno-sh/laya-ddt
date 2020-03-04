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
	private gID:string = "";
	private lblRanks:Array<Laya.Text> = new Array<Laya.Text>();

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

		this.btn_start.on(Event.MOUSE_DOWN,this,this.OnStart);
		this.btn_more.on(Event.MOUSE_DOWN,this,this.onMore);
		this.btn_rank.on(Event.MOUSE_DOWN,this,this.onRank);
		this.btn_rank_return.on(Event.MOUSE_DOWN,this,this.onCloseRank);

		this.gID = this.cans();
		this.OnRestart();
	}

	public OnRestart(){
		this.bestScore = GameUI.getLocalStorage("bestScore",0);
		this.lblBestScore.text = "" + this.bestScore;
		this.textGID.text = "ID-"+this.gID;
		if(this.bestScore > 0){
			this.netPushScore(this.bestScore);
		}
		this.boxRank.visible = false;
		this.btn_rank_return.visible = false;
		
	}
	
	public OnStart(e: Laya.Event):void{
		e.stopPropagation();
		this.box_start.visible = false;
		this.lable_score.visible = true;
		this.box_tower.visible = false;
		LogicManager.getInstance().Init();		
				
	}

	public onMore(e:Laya.Event):void{
		e.stopPropagation();		
		window.location.href = 'http://www.doudoubird.com/ddn/newGame.html?from=groupmessage'; 		
	}

	public onRank(e:Laya.Event):void{
		e.stopPropagation();
		this.boxRank.visible = true;
		this.btn_rank_return.visible = true;
		this.httpGet("http://www.ask4kid.com:9001/get_rank?canvas_id="+this.gID+"&game=ddt",(res)=>{
            // console.log(res);
            if( res && res.status === 0){
                if(res.info){
                    for (let index = 0; index < res.info.length; index++) {
                        const element = res.info[index];                       
                        if(element.canvas_id === this.gID){
                            this.lblRanks[index].text = ""+(index+1)+"-"+element.canvas_id+":(我)     "+element.score;
                            this.lblRanks[index].color = "#ff0000";
                        }else{
                            this.lblRanks[index].text = ""+(index+1)+"-"+element.canvas_id+":         "+element.score;
                            this.lblRanks[index].color = "#1aa000";
                        }
                    }
                }
            }
        });
	}

	public onCloseRank(e:Laya.Event):void{
		e.stopPropagation();
		this.boxRank.visible = false;
		this.btn_rank_return.visible = false;
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
			this.netPushScore(this.bestScore);			
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
			var temp2 = Number(temp1);
            if (isNaN(temp2)) {
                num = def
                Laya.LocalStorage.setItem(key, num)
            } else {
                num = parseInt(temp1);
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


    bin2hex(str) {
        var result = "";
        for (let i = 0; i < str.length; i++ ) {
            result += this.int16_to_hex(str.charCodeAt(i));
        }
        return result;
    }
            
    int16_to_hex(i) {
        var result = i.toString(16);
        var j = 0;
        while (j+result.length < 4){
            result = "0" + result;
            j++;
        }
        return result;
    }

    cans(){
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var txt = 'www.flashflora.com';
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
        //     ctx.textBaseline = "tencent";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125,1,62,20);
            ctx.fillStyle = "#069";
            ctx.fillText(txt, 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText(txt, 4, 17);
            
            var b64 = canvas.toDataURL().replace("data:image/png;base64,","");
            var bin = atob(b64);
            var crc = this.bin2hex(bin.slice(-16,-12));
            return crc;
	}
	
	httpGet(url, callback) {
        // cc.myGame.gameUi.onShowLockScreen();
        let xhr = new Laya.HttpRequest();//cc.loader.getXMLHttpRequest();
		xhr.once(Event.COMPLETE, this, ()=>{
			callback(xhr.data);
		});


        // };
        xhr.http.withCredentials = false;
        // xhr.open('GET', url, true);

        // if (cc.sys.isNative) {
        // xhr.http.setRequestHeader('Access-Control-Allow-Origin', '*');
        // xhr.http.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST');
        // xhr.http.setRequestHeader('Access-Control-Allow-Headers', 'x-requested-with,content-type,authorization');
        // xhr.http.setRequestHeader("Content-Type", "application/json");
        // xhr.setRequestHeader('Authorization', 'Bearer ' + cc.myGame.gameManager.getToken());
        // xhr.setRequestHeader('Authorization', 'Bearer ' + "");
        // }

        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.http.timeout = 8000;// 8 seconds for timeout

        xhr.send(url,"","get","json",["Content-Type","application/json",'Access-Control-Allow-Origin', '*','Access-Control-Allow-Methods', 'GET, POST','Access-Control-Allow-Headers', 'x-requested-with,content-type,authorization']);
    }
	
	netPushScore(score){
        this.httpGet("http://www.ask4kid.com:9001/update_rank_asc?canvas_id="+this.gID+"&game=ddt&score="+score,(res)=>{
            // console.log(res);
        });
    }
}