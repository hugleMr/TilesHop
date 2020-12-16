import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BallCtrl')
export class BallCtrl extends Component {
    private gravity: number = -15;
    private vz : number = -25;
    private vx : number = 0;
    private vy : number = 0;
    private currentPosY : number = 0;

    private jumTime: number = 0;
    private passedTime : number = 0;
    private isJumping : boolean = false; 
    private endFunc : Function = null;
    private missing_time : number = 0;

    @property(Node)
    private camera: Node = null;

    private cameraOffetZ : number = 0;

    start(){
        this.cameraOffetZ = this.camera.worldPosition.z - this.node.worldPosition.z;
        this.currentPosY = this.node.worldPosition.y;
    }

    public getVz() : number{
        return this.vz;
    }

    public jumpTo(dst : Vec3,time : number,endFunc : Function){
        console.log("jump");
        if(this.isJumping === true){
            return;
        }

        this.endFunc = endFunc;
        let src = this.node.getWorldPosition();
        this.jumTime = time - this.missing_time;//(dst.z - src.z) / this.vz - this.prev_time;
        if(this.jumTime < 0){
            this.isJumping = false;
            return;
        }

        this.vx = 0;
        if(this.jumTime > 0){
            this.vx = (dst.x - src.x) / this.jumTime;
        }else{
            this.vx = dst.x - src.x;
        }
        this.vy = -this.gravity * this.jumTime * 0.5;

        this.isJumping = true;
        this.passedTime = 0;
    }

    update(dt) : void{
        if(this.isJumping === false){
            return;
        }

        this.passedTime += dt;
        if(this.passedTime > this.jumTime){
            this.missing_time = this.passedTime - this.jumTime;
            dt -= this.missing_time;
        }
        let pos = this.node.getWorldPosition();
        pos.x += this.vx * dt;
        pos.z += this.vz * dt;

        pos.y += this.vy * dt + this.gravity * dt * dt * 0.5;// s = s0 + v0*t + a*t*t*0.5;
        this.vy += this.gravity * dt; // v = v0 + a*t;

        this.node.setWorldPosition(pos);
        
        if(this.passedTime >= this.jumTime){
            this.isJumping = false;
            if(this.endFunc){
                this.endFunc(this.missing_time);
            }
        }
    }

    lateUpdate(): void{
        if(this.camera){
            let pos = this.camera.getWorldPosition();
            pos.z = this.node.worldPosition.z + this.cameraOffetZ;
            this.camera.setWorldPosition(pos);
        }
    }
}