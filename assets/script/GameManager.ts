import { _decorator, Component, Node, instantiate, Vec3, JsonAsset, systemEvent, SystemEvent, EventKeyboard,geometry, loader, AudioClip, Animation, tween, Vec2, CameraComponent, UITransformComponent, Enum } from 'cc';
import { BallCtrl } from './BallCtrl';
import { PlatCtrl } from './PlatCtrl';
const { ccclass, property } = _decorator;

// define
enum Direction {
    IDLE,LEFT,RIGHT
}

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
    
    private music : AudioClip = null;
    @property(JsonAsset)
    midiJson : JsonAsset = null;

    @property(Node)
    loadingNode : Node = null;

    private notes = [];
    private touch_moved : boolean = false;
    private touch_offset : number = 0;
    private touch_move_speed : number = 0;

    @property({type : Enum(Direction)})
    direction: Direction = Direction.IDLE;

    @property(Node)
    canvas : Node = null;

    uiTransform : UITransformComponent = null;

    private originCameraPosition : Vec3 = new Vec3(0,0,0);

    start () {
        this.loadingNode.active = true;
        this.handleTouch();
        this.preLoadMusic();
        this.init();
        systemEvent.on(SystemEvent.EventType.KEY_DOWN,(event : EventKeyboard) => {
            let char = String.fromCharCode(event.keyCode);
            if(this.isReady){
                // this.isReady = false;
                // this.music.play();
                // this.music.setLoop(true);
                // this.jumpToNext();
            }
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
            self.loadingNode.active = false;
            if(self.isReady){
                self.isReady = false;
                self.music.play();
                self.jumpToNext();
            }
        });
    }

    handleTouch(){
        // this.uiTransform = this.canvas.getComponent(UITransformComponent);
        // this.canvas.on(SystemEvent.EventType.TOUCH_START, this.onTouchBegan, this);
        // this.canvas.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        // this.canvas.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnded, this);
    }

    onTouchBegan(event){
        let location = event.getUILocation();
        let pos = this.uiTransform.convertToNodeSpaceAR(new Vec3(location.x, location.y));
        this.touch_offset = pos.x;
    }
    onTouchMoved(event){
        let location = event.getUILocation();
        let pos = this.uiTransform.convertToNodeSpaceAR(new Vec3(location.x, location.y));
        let x = pos.x - this.touch_offset;
        console.log("delta : ",x);
        
        let newPos = this.ctrl.node.getWorldPosition();
        if(x == 0){
            this.direction = Direction.IDLE;
        }else{
            this.direction = x > 0 ? Direction.RIGHT : Direction.LEFT;
        }

        switch (this.direction) {
            case Direction.IDLE:
                return;
                break;
            case Direction.RIGHT:
                this.touch_move_speed = 1;
                break;
            case Direction.LEFT:
                this.touch_move_speed = -1;
                break;
            default:
                return;
                break;
        }
        newPos.x += this.touch_move_speed * 0.06;
        this.ctrl.node.setWorldPosition(newPos);
        this.touch_offset = pos.x;
    }
    onTouchEnded(event){
        // this.direction = Direction.IDLE;
        // this.touch_offset = 0;
    }

    init(){
        this.originCameraPosition = this.node.getChildByName("Main Camera").position;
        this.platPrefab = instantiate(this.node.getChildByName('platStart'));

        let info = this.midiJson.json;
        this.notes = info["notes"];
        for(let i = 0; i < 4; i++){
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
        let index = 0;
        if(this.curIndex > 0){
            index = this.curIndex - 1;
        }

        let prevPlat : Node = this.platRoot.children[index];
        let platOut = prevPlat.getChildByName("plat_out");
        let platOut2 = prevPlat.getChildByName("plat_out2");
        platOut.active = true;
        platOut2.active = true;
        platOut.getComponent(Animation).play();
        platOut2.getComponent(Animation).play();
        let platItem = prevPlat.getChildByName("it");
        tween(platItem)
            .by(0.1,{position : new Vec3(0,-0.004,0)})
            .by(0.1,{position : new Vec3(0,0.004,0)})
            .start();
        this.ctrl.jumpTo(dst,platComp.getTime(),index,(missing_time : number) => {
            if(this.checkContact()){
                this.curIndex ++;
                this.genPlat(missing_time);
                this.curIndexMidi ++;
                this.jumpToNext();
            }else{
                this.resetGame();
            }
        });
    }

    resetGame(){
        this.ctrl.reset();
        for(let i = 0; i < this.platRoot.children.length; i++) {
            this.platRoot.children[i].destroy();
        }

        console.log("platRoot.children : ",this.platRoot.children.length);

        this.node.getChildByName("Main Camera").setWorldPosition(this.originCameraPosition);
        
        this.curIndex = 0;
        this.curIndexMidi = 0;
        this.startPos = new Vec3(0,0,0);
        
        for(let i = 0; i < 4; i++){
            this.genPlat();
            this.curIndexMidi++;
        }

        this.music.stop();
        this.music.play();
        this.jumpToNext();
    }

    checkContact() : boolean{
        let ball = this.ctrl.node;
        let pos = this.ctrl.node.getWorldPosition();
        let plat : Node = this.platRoot.children[this.curIndex];
        let len = plat.position.clone().subtract(pos).length();
        if(len <= (plat.scale.x * 0.04 + ball.scale.x) * 0.5){
            return true;
        }else{
            return false;
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
        if(time > 0.2){
            pos.x = -1.5 + Math.random() * 3.5;
        }
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
