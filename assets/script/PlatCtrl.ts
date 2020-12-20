import { _decorator, Component, Node, AnimationComponent , tween, Vec3} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlatCtrl')
export class PlatCtrl extends Component {
    private time : number = 0;
    @property(Node)
    plat1 : Node = null;
    @property(Node)
    plat2 : Node = null;
    @property(Node)
    it : Node = null;

    start () {
        
    }

    init(time){
        this.time = time;
    }

    getTime() : number{
        return this.time;
    }

    playAnim(){
        this.bounce();
        this.playAnim1();
        this.playAnim2();
    }

    bounce(){
        tween(this.it)
        .by(0.1,{position : new Vec3(0,-0.004,0)})
        .by(0.1,{position : new Vec3(0,0.004,0)})
        .start();
    }

    playAnim1(){
        this.plat1.getComponent(AnimationComponent).play();
    }

    playAnim2(){
        this.plat2.getComponent(AnimationComponent).play();
    }
}
