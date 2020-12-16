import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlatCtrl')
export class PlatCtrl extends Component {
    private time : number = 0;

    start () {
        
    }

    init(time){
        this.time = time;
    }

    getTime() : number{
        return this.time;
    }
}
