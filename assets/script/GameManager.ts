import { _decorator, Component, Node, instantiate, Vec3, JsonAsset, systemEvent, SystemEvent, EventKeyboard, loader, AudioSource, AudioClip, tween } from 'cc';
import { BallCtrl } from './BallCtrl';
import { PlatCtrl } from './PlatCtrl';
const { ccclass, property } = _decorator;

@ccclass('Typescript')
export class Typescript extends Component {

    @property(BallCtrl)
    ctrl : BallCtrl = null; 

    @property(Node)
    private platRoot: Node = null;

    private curIndex : number = 0;
    private curIndexMidi : number = 0;
    private platPrefab: Node = null;
    private startPos : Vec3 = new Vec3(0,0,0);
    private isReady : boolean = false;
    
    @property(AudioClip)
    music : AudioClip = null;
    @property(JsonAsset)
    midiJson : JsonAsset = null;

    private notes = [];

    start () {
        this.preLoadMusic();
        this.init();
        systemEvent.on(SystemEvent.EventType.KEY_DOWN,(event : EventKeyboard) => {
            let char = String.fromCharCode(event.keyCode);
            // if(this.isReady){
            //     this.isReady = false;
            //     this.music.play();
            //     this.music.setLoop(true);
            //     this.jumpToNext();
            // }
            if(char == 'A'){
                
            }
            if(char == 'D'){
                
            }
        },this);
    }

    preLoadMusic(){
        let self = this;
        loader.loadRes("Sound/AnhSaiRoi_ST",AudioClip,function(err,audio){
            console.log("load audio done!",audio);
            self.music = audio;
            self.isReady = true;
            if(self.isReady){
                self.isReady = false;
                self.music.play();
                self.jumpToNext();
            }
        });
    }

    init(){
        this.platPrefab = instantiate(this.node.getChildByName('platStart'));

        let info = this.midiJson.json;
        let duration = info["duration"];
        this.notes = info["notes"];
        for(let i = 0; i < 5; i++){
            this.genPlat();
            this.curIndexMidi++;
        }

    }

    jumpToNext(){
        if(this.curIndex >= this.platRoot.children.length){
            return;
        }
        let plat = this.platRoot.children[this.curIndex];
        let platComp : PlatCtrl = plat.getComponent(PlatCtrl);
        let dst = plat.getWorldPosition();
        dst.y = 0.5;
        this.ctrl.jumpTo(dst,platComp.getTime(),(missing_time : number) => {
            this.curIndex ++;
            this.genPlat(missing_time);
            this.curIndexMidi ++;
            this.jumpToNext();
        });
    }

    resetGame(){
        this.curIndexMidi = 0;
        for(let i = 0; i < 5; i++){
            this.genPlat();
            this.curIndexMidi++;
        }
        this.isReady = true;
        if(this.isReady){
            this.isReady = false;
            this.music.play();
            this.jumpToNext();
        }
    }

    genPlat(missing_time = 0) {
        let plat: Node = instantiate(this.platPrefab);
        let platComp : PlatCtrl = plat.getComponent(PlatCtrl);
        let pos : Vec3 = this.startPos;
        if(this.platRoot.children.length > 0){
            pos = this.platRoot.children[this.platRoot.children.length - 1].getWorldPosition();
        }
        if(this.curIndexMidi >= this.notes.length){
            // this.resetGame();
            return;
        }
        let time = this.notes[this.curIndexMidi]["space"];
        pos.z += time * this.ctrl.getVz();
        pos.x = -1.5 + Math.random() * 3.5;
        platComp.init(time);
        this.platRoot.addChild(plat);
        plat.setWorldPosition(pos);

        //========= rever time missing from BallCtrl
        for(let i = 0; i < this.platRoot.children.length; i++){
            let posNew = this.platRoot.children[i].getWorldPosition();
            posNew.z -= missing_time * this.ctrl.getVz();
            this.platRoot.children[i].setWorldPosition(posNew);
        }

        if (this.curIndex > 10) {
          for(let i = 0; i < 10; i++) {
            this.platRoot.children[0].removeFromParent();
          }
          this.curIndex -= 10;
        }
      }
}
