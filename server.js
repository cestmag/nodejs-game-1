const express = require('express')//server end ctrl+c
//const { platform } = require('os')
const app= express()
const server= require('http').Server(app)

//server.listen(process.env.PORT||3000)
//部屋mに誰もいなくなったら削除する
const io= require('socket.io')(server)
const gravity=0.3//0.5
const hane=1.5 //跳ね返る計数的な
const mojis="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const url = require('url');  
const matchLen=180
const countD=10
const playerHpMAx=100
//let totalPlayers=0
let platforms={}
//let players={}
let beams={}

app.set('views','./views')
app.set('view-engine','ejs')
app.use('/static', express.static(__dirname + '/static'));
app.use(express.urlencoded({extended: true}))

//var timer=180
const rooms={/*name:{}*/}
//when a room is created, add the room to the imagina array rooms
//rooms[the random room name]={players:{}}

app.get('/',(req, res)=>{
    var message=req.query.error
    console.log("errror",message)
    if(message==undefined){
    res.render('departure.ejs',{message:"Welcome to the game, mother fucker"})
    }else if(message==0){
        res.render('departure.ejs',{message:"The room doesn't exsit. If you want to play, click the button below"}) 
    }else if(message==1){
        res.render('departure.ejs',{message:"The match already started and you cannot enter the room. If you want to play, click the button below"})
    }
    //res.render('mainpage.ejs')
})

app.post('/room',(req, res)=>{
    //const mojis="abcdefghijklmnopqrstuvwxyz0123456789"
    randomLetters=""

    do{
    for(let i=0; i<20; i++){
        var x = Math.floor(Math.random() * mojis.length);//0~mojis.length-1までの整数
        randomLetters+=mojis.charAt(x)
    }
    }while(rooms[randomLetters]!=null)
    //console.log("heyyy")
    rooms[randomLetters]={
        NameOfroom:randomLetters,
        during:false, 
        end:false ,
        players:{}, 
        result:[], result2:[],
        zikan:function(set,ver){
        //console.log("ah",set)
        let targ=this.NameOfroom
        let timer=set
       
        function decreaseTimer(){
            
            if(timer>=0){

                if(rooms[targ].onway==true){
                    rooms[targ].realend==true
                    return
                }
                if(rooms[targ].end==true&&ver==1){// 試合後outtahereの時 playerがrestがいない場合(でplayersにいる場合)はエラーにならず、otherwise error
                    return
                }
            
                if(rooms[targ].hiroba==true&&ver==2){
                    return
                }
               if(timer==matchLen&&ver==1){
                    //試合開始
                    rooms[targ].incount=false
                    //rooms[targ].timeOn=false
                    rooms[targ].during=true//ここでゲームスタートをemit
                }
                if(rooms[targ].hpplusTime.includes(timer)&&rooms[targ].during==true){
                    //+hpをインスタンス化
                    let hpplus=null
                    hpplus=new HpPlus(RandomNum(80,950,1)[0],targ)//出現座標指定 x座標80から950
                    rooms[targ].hps[hpplus.id]=hpplus
                }
                if(rooms[targ].beamPlusTime.includes(timer)&&rooms[targ].during==true){
                    //+hpをインスタンス化
                    let deadmonkey=null
                    deadmonkey=new DeadMonkey(RandomNum(100,930,1)[0],targ)//出現座標指定 x座標80から950
                    rooms[targ].buls[deadmonkey.id]=deadmonkey
                }
                if(rooms[targ].invisibleTime.includes(timer)&&rooms[targ].during==true){
                    //+hpをインスタンス化
                    let invisiblea=null
                    invisiblea=new InvisibleCloak(RandomNum(100,930,1)[0],targ)//出現座標指定 x座標80から950
                    rooms[targ].invisible[invisiblea.id]=invisiblea
                }
                
                rooms[targ].temps=timer
                timer--
                
                setTimeout(decreaseTimer, 1000)
              
            }else{
                switch(ver){
                    case 1:
                        rooms[targ].end=true
                        rooms[targ].during=false
                        //let zyun=[[0]]
                        //let max=0
                        //rooms[targ].result2[0][0]=0
                        Object.values(rooms[targ].players).forEach(player=>{
                            player.ready=false
                            let atai=player.hp
                            
                            let placeToPut=0
                            let same=false
                            let howmany=0

                            for(let i=0;i<rooms[targ].result2.length;i++){
                                let expl=placeToPut
                                if(rooms[targ].result2[i][2]>=atai){ 
                                    placeToPut++
                                    if(rooms[targ].result2[i][2]==atai){
                                      howmany++
                                    }
                                }
                                if(expl==placeToPut){
                                    break
                                }
                            }
                            rooms[targ].result2.splice(placeToPut,0,[player.socketID, player.playername,atai,howmany])
                            //rooms[targ].result2.push(player.socketID)
                           
                        })
                        let kari=rooms[targ].result
                        rooms[targ].result=rooms[targ].result2.concat(kari)
                        io.to(targ).emit('end',{result:rooms[targ].result})
                        console.log('t',rooms[targ].result)
                    break

                    case 2:
                        //room deleted
                        console.log("delete")
                        rooms[targ].deletee=true
                    break


                }
                return 
            }
        }
        
        decreaseTimer()
        return
        //console.log(timer)
    
    } , 
    temps:undefined,
    timeOn:false, 
    timeOn2:false,
    deletee:false,
    incount:false,
    hiroba:true,
    letsgo:false,
    hpplusTime:[],//hpplusが落とされるランダムな時間が入る、5つ　90sec以上
    beamPlusTime:[],//enemy ga syutugen suru toki
    invisibleTime:[],
    hps:{},//+hp
    buls:{},//enemy
    rest:{},//losers
    invisible:{},//invisible cloak 
    onway:false,
    realend:false,
    connect:false}//結果箱 
    //console.log("hey",randomLetters," ", rooms)
    res.redirect(randomLetters)

})

app.get('/:room',(req, res)=>{
  if(rooms[req.params.room]==null){//そして試合中であったら入れないようにする。
       //return res.redirect('/?error='+"theRoomNotExist")//query
       return res.redirect(url.format({
        pathname:"/",
        query:{"error":0}
       }))
    }
   if(rooms[req.params.room].during==true||rooms[req.params.room].incount==true||rooms[req.params.room].end==true){//sould
        return res.redirect(url.format({
            pathname:"/",
            query:{"error":1}
           }))
    }
    //console.log("attention",rooms)
    res.render('mainpage.ejs', {roomName: req.params.room})//mainpage.ejs
})

//server.listen(process.env.PORT||3000)

//const players=[]

class Player{//巨大化したりする
    constructor(num, roomName, playername, socketID){
        this.position={
           x:200*num,
           y:100
        }

        this.velocity = {
           x:0,
           y:0
        }
        this.width =30
        this.height=30   

        this.hpMax=playerHpMAx
        this.hp=this.hpMax

        //this.notup=false

        this.id=Math.floor(Math.random()*1000000000);

        this.movement = {}

        this.gun={
            right:false,
            left:false
        }

        //this.image= new 
        //beam打てる回数制限する？
        this.beamclub={}

        this.beamMax=120
        this.shootRemain=this.beamMax

        this.beamCount=0

        this.ExbeamCount=0

        this.attackPower=5

        this.playername=playername;

        this.inRoom=roomName;

        this.ready=false;

        this.socketID=socketID;

        this.result;

        this.bvelocity=19;
        
        this.punc=false;

        this.die=false;

        this.again=false;

        this.onfloor=false;

        this.onPlayer=false;

      //-----change the photo to show when attacked
        this.gotshot=0;

        this.gotshot2=0;

        this.ahhh=false;

        this.countSt=0
     //------
        this.invisibleNow=false

        this.invisibleTime=0

        this.invisibleDuration=500
        //this.attackNow=false
        //this.whyy={1:'a',2:'b',3:'c'}
        //this.beam = null //new Beam()//player has a beam
        //this.hpbar= new HpBar()//player has a hpbar
        //this.beam.bulletsMax=60
        //this.beam.bullets=this.beam.bulletsMax
    }
    move(ver){
      switch(ver){
        case 1://right
            this.velocity.x=4 //5
            //console.log("right")
            //do
        break

        case 2://left
            this.velocity.x=-4 //-5
            //console.log("aaaaa",this.velocity.x)
        break

        case 3://stop
            this.velocity.x=0
            //console.log("stop")
        break

        case 4:
            this.velocity.y-=1 //-1.8
        break

        case 5:
            this.velocity.y=0
        break

        case 6:
            this.velocity.y+=gravity
        break
        
      }
    }

    update(){
        //console.log("mada")

        if(this.position.y<this.height||this.judgementFloor2()){
            if(this.velocity.y<0){
              this.velocity.y=0
            }else{
                this.velocity.y+=gravity
            }
           //this.velocity.y+=gravity
        }
        if((this.position.x>=0&&this.position.x+this.velocity.x<0)||(this.position.x+this.width<=1024&&this.position.x+this.velocity.x+this.width>1024)){
            
            this.velocity.x=0
        }

        //ここにplatformの下側から突き抜けるの防止
        let line=this.conflictWithPlayers()
        for(let i=0; i<line.length; i++){
           this.velocity.x=(line[i].velocity.x*(1+hane)+this.velocity.x*(1-hane))*0.5
           this.velocity.y=(line[i].velocity.y*(1+(hane+0.5))+this.velocity.y*(1-(hane+0.5)))*0.5
   /*   if(line[i].onfloor==false){
            this.velocity.y=(line[i].velocity.y*(1+(hane+0.5))+this.velocity.y*(1-(hane+0.5)))*0.5
            
        }else if(line[i].onfloor==true){
            this.velocity.y=0
            this.onPlayer=true//+ this.real=true!!!!!!
        }*/
          // console.log("sok",this.playername,"v",this.velocity.y,"p",this.position.y,"o",line[i].velocity.y,"p",line[i].position.y)
        }
        if(this.judgementFloor()){
            //this.velocity.y=0
            this.onfloor=true
        }else if(!this.judgementFloor()){
            this.onfloor=false//ここをかえる !!!!の時はthis.onfloor=trueのままにする
        }
        if(this.judgementPlayers()){
            //this.velocity.y=0
            this.onPlayer=true
            //console.log("now")
        }else if(!this.judgementPlayers()){
            this.onPlayer=false
        }

        if(this.onPlayer||this.onfloor){
            this.velocity.y=0
        }
        
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        //console.log("pos:",this.position.x, this.position.y, this.velocity.x, this.velocity.y)
        if(this.position.y + this.height + this.velocity.y < 576/*canvas.height*/){
             this.velocity.y +=gravity 
        }else{
            this.velocity.y=0 
        }
        //gotshot gotshot2
        if(this.gotshot-this.gotshot2>0/*&&this.ahhh==false*/){
            //do something to hide the character for a moment
            this.ahhh=true
            this.countSt+=1
            if(this.countSt>1){
                this.gotshot2=this.gotshot
                this.countSt=0 
            }
        }else{
            this.ahhh=false
        }

        if(this.invisibleNow==true){
            this.invisibleTime+=1
            if(this.invisibleTime>this.invisibleDuration){
                this.invisibleNow=false
                this.invisibleTime=0
            }
        }
    }

    getDamaged(damage){
        //console.log("getdamaged", this.playername)
        this.gotshot+=1
     if(rooms[this.inRoom].during==true||rooms[this.inRoom].hiroba==true){
       this.hp -=damage
       if(this.hp<=0&&rooms[this.inRoom].during==true){
         this.remove()
       }else if(this.hp<=0&&rooms[this.inRoom].during==false){
         this.hp=this.hpMax
       }
       //表示される画像を変える。
    }
    }

    getHp(plus){
    let hpkari=this.hp
      hpkari+=plus// this.hpMax
      if(hpkari>this.hpMax){
        hpkari=this.hpMax
      }
      this.hp=hpkari
    }

    getBullets(plus){
        let bulletskari=this.shootRemain
      bulletskari+=plus// this.hpMax
      if(bulletskari>this.hpMax){
        bulletskari=this.hpMax
      }
      this.shootRemain=bulletskari
    }

    punch(){
       let tekiteki=this.conflictWithPlayers()
       for(let i=0; i<tekiteki.length; i++){
        tekiteki[i].getDamaged(this.attackPower)
       }
       
    }

    shoot(posix, posiy, which){
       if(rooms[this.inRoom].during==true||rooms[this.inRoom].hiroba==true){
       this.shootRemain--
       if(this.shootRemain<=0&&rooms[this.inRoom].during==false){
        this.shootRemain=this.beamMax
       }else if(this.shootRemain<=0&&rooms[this.inRoom].during==true){
        //玉切れというめせっーじを送る
        this.shootRemain=0
        io.to(this.socketID).emit('run-out-of-bullets')
        return 
       }
       const zyu = new Beam(posix, posiy, which, this, this.bvelocity*(this.hp/this.hpMax))
       this.beamclub[zyu.id]=zyu
       //this.shootRemain--
        
       //console.log("hey yo", zyu)
       //beams[zyu.id]=zyu
    }
    }
    
    //kick
    //防御等
    judgement(obj){//floorにひっとしてるか
        return this.position.y + this.height<= obj.position.y &&this.position.y + this.height + this.velocity.y> obj.position.y&&this.position.x+ this.width >= obj.position.x && this.position.x <= obj.position.x+ obj.width
    }
    judgement2(obj){
        return this.position.y > obj.position.y+obj.height &&this.position.y +this.velocity.y< obj.position.y + obj.height&&this.position.x+ this.width >= obj.position.x && this.position.x <= obj.position.x+ obj.width
        //return this.position.y + this.height<= obj.position.y &&this.position.y + this.height + this.velocity.y> obj.position.y&&this.position.x+ this.width >= obj.position.x && this.position.x <= obj.position.x+ obj.width
    }

    judgementFloor(){
        //Onplat={}
        return Object.values(platforms).some((platform) => {//some 1つでも条件を満たせばtrue otherwise false
            if(this.judgement(platform)){
                //Onplat[platform.id]=platform
                return true;
            }
        });
    }

    judgementFloor2(){
        return Object.values(platforms).some((platform) => {//some 1つでも条件を満たせばtrue otherwise false
            if(this.judgement2(platform)){
                //Onplat[platform.id]=platform
                return true;
            }
        });

    }
    conflictWithPlayers(){
        var hitplayerss=[]
        Object.values(rooms[this.inRoom].players).forEach((player)=>{
            if(this.newJudge(player)&&this!=player/*&&player.die==false*/){
                hitplayerss.push(player)
            }
        })

     //  Object.values(rooms[this.inRoom].buls).forEach((bul)=>{
         //   if(this.newJudge(bul)/*&&player.die==false*/){
         //       hitplayerss.push(bul)
         //   }
      //  })
        return hitplayerss
    }
    judgementPlayers(){
        //Onplat={}
        return Object.values(rooms[this.inRoom].players).some((player) => {//some 1つでも条件を満たせばtrue otherwise false
            if(this.newJudge2(player)){
                //Onplat[platform.id]=platform
                return true;
            }
        });
    }
    newJudge(obj){
        


        return (this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/           //1
        && obj.position.x/*+obj.velocity.x*/<=this.position.x+this.width/*+this.velocity.x*/
        && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/
        && obj.position.y/*+obj.velocity.y*/<=this.position.y+this.width/*+this.velocity.y*/
      /*  && (this.position.x>obj.position.x|| obj.position.x>this.position.x+this.width
            ||this.position.y>obj.position.y||obj.position.y>this.position.y+this.height)*/
        )
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/+obj.width
            && obj.position.x/*+obj.velocity.x*/+obj.width<=this.position.x+this.width/*+this.velocity.x*/ //2
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/+obj.height
            && obj.position.y/*+obj.velocity.y*/+obj.height<=this.position.y+this.width/*+this.velocity.y*/
            /*&& (this.position.x>obj.position.x+obj.width|| obj.position.x+obj.width>this.position.x+this.width
                ||this.position.y>obj.position.y+obj.height||obj.position.y+obj.height>this.position.y+this.height)*/)
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/+obj.width //4
            && obj.position.x/*+obj.velocity.x*/+obj.width<=this.position.x+this.width/*+this.velocity.x*/
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/
            && obj.position.y/*+obj.velocity.y*/<=this.position.y+this.width/*+this.velocity.y*/
          /*  && (this.position.x>obj.position.x+obj.width|| obj.position.x+obj.width>this.position.x+this.width
                ||this.position.y>obj.position.y||obj.position.y>this.position.y+this.height)*/)
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/ //3
            && obj.position.x/*+obj.velocity.x*/<=this.position.x+this.width/*+this.velocity.x*/
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/+obj.height
            && obj.position.y/*+obj.velocity.y*/+obj.height<=this.position.y+this.width/*+this.velocity.y*/
            /*&& (this.position.x>obj.position.x|| obj.position.x>this.position.x+this.width
                ||this.position.y>obj.position.y+obj.height||obj.position.y+obj.height>this.position.y+this.height)*/)
    }
    newJudge2(obj){
        return (this.position.x+this.velocity.x<=obj.position.x+obj.velocity.x+obj.width
            && obj.position.x+obj.velocity.x+obj.width<=this.position.x+this.width+this.velocity.x //2kore
            && this.position.y+this.velocity.y<=obj.position.y+obj.velocity.y+obj.height
            && obj.position.y+obj.velocity.y+obj.height<=this.position.y+this.width+this.velocity.y
            && (this.position.x<obj.position.x+obj.width&&obj.position.x+obj.width<this.position.x+this.width
                &&this.position.y>obj.position.y+obj.height))
        ||(this.position.x+this.velocity.x<=obj.position.x+obj.velocity.x //3
            && obj.position.x+obj.velocity.x<=this.position.x+this.width+this.velocity.x
            && this.position.y+this.velocity.y<=obj.position.y+obj.velocity.y+obj.height
            && obj.position.y+obj.velocity.y+obj.height<=this.position.y+this.width+this.velocity.y
            && (this.position.x<obj.position.x&& obj.position.x<this.position.x+this.width
                &&this.position.y>obj.position.y+obj.height))
    }

    toJSON(){
        return { id:this.id, positionx: this.position.x, positiony: this.position.y, width:this.width, height:this.height,
            beamclub: this.beamclub, hp:this.hp, hpMax:this.hpMax, shootRemain:this.shootRemain, beamMax:this.beamMax, gunLeft:this.gun.left,
            gunRight:this.gun.right, playername:this.playername, ready:this.ready,socketID:this.socketID,punc:this.punc, die:this.die,ahhh:this.ahhh,
            invisi:this.invisibleNow,
     }
    }


    remove(){
        delete rooms[this.inRoom].players[this.id]
        this.die=true
        this.ready=false
        rooms[this.inRoom].rest[this.id]=this//別のとこに移す
        let place=Object.values(rooms[this.inRoom].players).length
        rooms[this.inRoom].result.unshift([this.socketID,this.playername,undefined,0])
        this.result=place+1
        io.to(this.inRoom).emit('dead',{outPlayer:this.socketID, name:this.playername,place:this.result})//this.result);
        //this=null//!!!!!!!!!!!!!!!!!!!!!!!
        if(place==1){
            Object.values(rooms[this.inRoom].players).forEach(player=>{
                //winner=player
                io.to(this.inRoom).emit('win',{who:player.playername, sid:player.socketID})
                rooms[this.inRoom].result.unshift([player.socketID,player.playername, undefined,0])
                player.ready=false
            })
            rooms[this.inRoom].end=true
            rooms[this.inRoom].during=false
            io.to(this.inRoom).emit('end',{result:rooms[this.inRoom].result})
            //io.to(this.inRoom).emit('win',{who:winner.playername, sid:winner.socketID})
            //console.log("end")
           //this=null
        }
    }

    beInvisible(){
       //console.log("invisible", this.playername)
       this.invisibleNow=true
     
    }

}

class Platform{
    constructor(posix, posiy, whatwidth, whatheight){
       this.position = {
           x:posix,
           y:posiy
       }

       this.velocity={
        x:0,
        y:0
       }

       this.limit={
        upper:0,
        bottom:500
       }

       this.width=whatwidth
       this.height=whatheight
       this.id=Math.floor(Math.random()*100000000);
       this.IU=1
       this.count=0
       this.hohaba=1


    }
    //drawはscript側に書く
    draw(){
        c.fillStyle= 'blue'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update(){
        //this.count++
        //this.velocity.y=5*this.IU
        this.position.y+= this.hohaba*this.IU
        this.count++
        if(this.count==500){
            this.count=0
            switch(this.IU){
                case 1:
                    this.IU=-1
                break
                case -1:
                    this.IU=1
                break
            }
        }

    }
    toJSON(){
        return { id:this.id, positionx: this.position.x, positiony: this.position.y, width:this.width, height:this.height,
            
     }
    }
    
}

class DeadMonkey{
    constructor(xStart,room){

        this.id=Math.floor(Math.random()*1000000000);
        this.inRoom=room;
        this.position={
            x:xStart,
            y:100
         }

         this.velocity={
            x:2,
            y:0
         }
         this.width =30
         this.height=30 

         this.power=3
         
         this.count=RandomNum(100,300,1)[0]

        this.hpMax=50
        this.hp=this.hpMax

        this.endcount=0
        if(RandomNum(1,10,1)[0]>5){
            this.leftRight=1
        }else{
            this.leftRight=-1 
        }

        

        this.landed=false

        this.landcount=0

        this.awake=0

        this.gotshot=0;

        this.gotshot2=0;

        this.ahhh=false;

        this.countSt=0
          
    }
    update(){
        

        this.count--
        if(this.position.y + this.height + this.velocity.y < 1000){//!!!!!!!!!!!!!!!!!!!!!!!!!1000=canvas.height
            this.velocity.y +=gravity 
       }else{
           this.velocity.y=0
       }
      if(this.judgementFloor()){
           // this.velocity.y=0//ここを変えればバウンドする
           this.velocity.y=-this.velocity.y*0.5
           this.landcount++
           if(this.landcount>5){
            this.landed=true
           }
       }
       let afterlike=this.judgementBeam() //letは同じブロック内からしか呼べない、varはどこからでも呼び出せる

       if(afterlike.length>0){
          for(let i=0; i<afterlike.length; i++){
              afterlike[i].getDamaged(this.power)
          }
          this.remove()
       }
    //letは同じブロック内からしか呼べない、varはどこからでも呼び出せる
      if(this.landed==true){
         this.position.x+=this.velocity.x*this.leftRight
      }else{
        this.position.x+=0
      }
         this.position.y+=this.velocity.y

         if(this.count==0){
           this.endcount++
           if(this.endcount==10){
            this.remove()
            return
           }
           this.leftRight*=-1
           this.count=this.count=RandomNum(10,300,1)[0]
           //折り返し
            //this.remove()
         }

         if(this.awake<10){
            this.awake+=1
         }else{
            this.awake=0
         }

         if(this.gotshot-this.gotshot2>0/*&&this.ahhh==false*/){
            this.ahhh=true
            this.countSt+=1
            if(this.countSt>1){
                this.gotshot2=this.gotshot
                this.countSt=0 
            }
        }else{
            this.ahhh=false
        }
    }

    getDamaged(damage){
        //console.log("getdamaged", this.playername)
        this.gotshot+=1
     if(rooms[this.inRoom].during==true||rooms[this.inRoom].hiroba==true){
       this.hp -=damage
       if(this.hp<=0&&rooms[this.inRoom].during==true){
         this.remove()
       }else if(this.hp<=0&&rooms[this.inRoom].during==false){
         this.hp=this.hpMax
       }
       //表示される画像を変える。
    }
    }

    judgement(obj){//floorにひっとしてるか
        return this.position.y + this.height<= obj.position.y &&this.position.y + this.height + this.velocity.y> obj.position.y&&this.position.x+ this.width >= obj.position.x && this.position.x <= obj.position.x+ obj.width
    }

    judgement2(obj){//! something wrong with this!!!!!!!!!!!!!!!!!!improve
        return obj.position.y-this.height/2<=this.position.y+this.height/2 
        &&this.position.y+this.height/2<=obj.position.y-this.height/2+obj.height 
        &&obj.position.x-this.width/2<=this.position.x+this.width/2 
        &&this.position.x+this.width/2<=obj.position.x+this.width/2+obj.width
    }

    newJudge(obj){
        


        return (this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/           //1
        && obj.position.x/*+obj.velocity.x*/<=this.position.x+this.width/*+this.velocity.x*/
        && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/
        && obj.position.y/*+obj.velocity.y*/<=this.position.y+this.width/*+this.velocity.y*/
      /*  && (this.position.x>obj.position.x|| obj.position.x>this.position.x+this.width
            ||this.position.y>obj.position.y||obj.position.y>this.position.y+this.height)*/
        )
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/+obj.width
            && obj.position.x/*+obj.velocity.x*/+obj.width<=this.position.x+this.width/*+this.velocity.x*/ //2
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/+obj.height
            && obj.position.y/*+obj.velocity.y*/+obj.height<=this.position.y+this.width/*+this.velocity.y*/
            /*&& (this.position.x>obj.position.x+obj.width|| obj.position.x+obj.width>this.position.x+this.width
                ||this.position.y>obj.position.y+obj.height||obj.position.y+obj.height>this.position.y+this.height)*/)
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/+obj.width //4
            && obj.position.x/*+obj.velocity.x*/+obj.width<=this.position.x+this.width/*+this.velocity.x*/
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/
            && obj.position.y/*+obj.velocity.y*/<=this.position.y+this.width/*+this.velocity.y*/
          /*  && (this.position.x>obj.position.x+obj.width|| obj.position.x+obj.width>this.position.x+this.width
                ||this.position.y>obj.position.y||obj.position.y>this.position.y+this.height)*/)
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/ //3
            && obj.position.x/*+obj.velocity.x*/<=this.position.x+this.width/*+this.velocity.x*/
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/+obj.height
            && obj.position.y/*+obj.velocity.y*/+obj.height<=this.position.y+this.width/*+this.velocity.y*/
            /*&& (this.position.x>obj.position.x|| obj.position.x>this.position.x+this.width
                ||this.position.y>obj.position.y+obj.height||obj.position.y+obj.height>this.position.y+this.height)*/)
    }

    judgementFloor(){
        return Object.values(platforms).some((platform) => {//some 1つでも条件を満たせばtrue otherwise false
            if(this.judgement(platform)){
                return true;
            }
        });
    }

    judgementBeam(){
        //当たったプレイヤーを入れる（連想)配列
        var hitplayers=[]
        Object.values(rooms[this.inRoom].players).forEach((player)=>{
            if(this.newJudge(player)&&this.owner!=player){
                //t
                //this.hitplayers.push(player)
                hitplayers.push(player)
            }
        })
        //console.log(hitplayers)
        return hitplayers
    }


    remove(){
        delete rooms[this.inRoom].buls[this.id]
        //this=null
     }
     toJSON(){
        return { id:this.id, positionx: this.position.x, positiony: this.position.y, width:this.width, height:this.height,
            borw:this.awake,  ahhh:this.ahhh, hp:this.hp, hpMax:this.hpMax,
            
     }

  }
     
    
}

class HpPlus{
    constructor(xStart,room){

        this.id=Math.floor(Math.random()*1000000000);
        this.inRoom=room;
        this.position={
            x:xStart,
            y:100
         }

         this.velocity={
            x:0,
            y:0
         }
         this.width =30
         this.height=30 

         this.power=3
         
         this.count=0

         this.duration=300
          
    }
    update(){
        this.count++
        if(this.position.y + this.height + this.velocity.y < 1000){//!!!!!!!!!!!!!!!!!!!!!!!!!1000=canvas.height
            this.velocity.y +=gravity 
       }else{
           this.velocity.y=0
       }
      if(this.judgementFloor()){
           // this.velocity.y=0//ここを変えればバウンドする
           this.velocity.y=-this.velocity.y*0.5
       }
       let afterlike=this.judgementBeam() //letは同じブロック内からしか呼べない、varはどこからでも呼び出せる

       if(afterlike.length>0){

          for(let i=0; i<afterlike.length; i++){
              afterlike[i].getHp(this.power)
              //ここでeffect this.eff=null, this.eff= new HpplusEffect()
          }
          this.remove()
          return
       }
     
         this.position.x+=this.velocity.x
         this.position.y+=this.velocity.y

         if(this.count>this.duration){
            this.remove()
            return
         }

    }
    remove(){
       delete rooms[this.inRoom].hps[this.id]
       //this=null
    }
    judgement(obj){//floorにひっとしてるか
        return this.position.y + this.height<= obj.position.y &&this.position.y + this.height + this.velocity.y> obj.position.y&&this.position.x+ this.width >= obj.position.x && this.position.x <= obj.position.x+ obj.width
    }
    judgementFloor(){
        return Object.values(platforms).some((platform) => {//some 1つでも条件を満たせばtrue otherwise false
            if(this.judgement(platform)){
                return true;
            }
        });
    }
    judgement2(obj){//! something wrong with this
        return obj.position.y-this.height/2<=this.position.y+this.height/2 
        &&this.position.y+this.height/2<=obj.position.y-this.height/2+obj.height 
        &&obj.position.x-this.width/2<=this.position.x+this.width/2 
        &&this.position.x+this.width/2<=obj.position.x+this.width/2+obj.width
    }

    newJudge(obj){//extends
        


        return (this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/           //1
        && obj.position.x/*+obj.velocity.x*/<=this.position.x+this.width/*+this.velocity.x*/
        && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/
        && obj.position.y/*+obj.velocity.y*/<=this.position.y+this.width/*+this.velocity.y*/
      /*  && (this.position.x>obj.position.x|| obj.position.x>this.position.x+this.width
            ||this.position.y>obj.position.y||obj.position.y>this.position.y+this.height)*/
        )
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/+obj.width
            && obj.position.x/*+obj.velocity.x*/+obj.width<=this.position.x+this.width/*+this.velocity.x*/ //2
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/+obj.height
            && obj.position.y/*+obj.velocity.y*/+obj.height<=this.position.y+this.width/*+this.velocity.y*/
            /*&& (this.position.x>obj.position.x+obj.width|| obj.position.x+obj.width>this.position.x+this.width
                ||this.position.y>obj.position.y+obj.height||obj.position.y+obj.height>this.position.y+this.height)*/)
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/+obj.width //4
            && obj.position.x/*+obj.velocity.x*/+obj.width<=this.position.x+this.width/*+this.velocity.x*/
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/
            && obj.position.y/*+obj.velocity.y*/<=this.position.y+this.width/*+this.velocity.y*/
          /*  && (this.position.x>obj.position.x+obj.width|| obj.position.x+obj.width>this.position.x+this.width
                ||this.position.y>obj.position.y||obj.position.y>this.position.y+this.height)*/)
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/ //3
            && obj.position.x/*+obj.velocity.x*/<=this.position.x+this.width/*+this.velocity.x*/
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/+obj.height
            && obj.position.y/*+obj.velocity.y*/+obj.height<=this.position.y+this.width/*+this.velocity.y*/
            /*&& (this.position.x>obj.position.x|| obj.position.x>this.position.x+this.width
                ||this.position.y>obj.position.y+obj.height||obj.position.y+obj.height>this.position.y+this.height)*/)
    }

    judgementBeam(){
        //当たったプレイヤーを入れる（連想)配列
        var hitplayers=[]
        Object.values(rooms[this.inRoom].players).forEach((player)=>{
            if(this.newJudge(player)&&this.owner!=player/*&&player.die*/){
                //t
                //this.hitplayers.push(player)
                hitplayers.push(player)
            }
        })
        //console.log(hitplayers)
        return hitplayers
    }

    toJSON(){
        return { id:this.id, positionx: this.position.x, positiony: this.position.y, width:this.width, height:this.height,
            
     }

  }
}

class InvisibleCloak extends HpPlus{
   constructor(xStart,room){
     super(xStart,room)

   }
   update(){
    this.count++
    if(this.position.y + this.height + this.velocity.y < 1000){//!!!!!!!!!!!!!!!!!!!!!!!!!1000=canvas.height
        this.velocity.y +=gravity 
   }else{
       this.velocity.y=0
   }
  if(this.judgementFloor()){
       // this.velocity.y=0//ここを変えればバウンドする
       this.velocity.y=-this.velocity.y*0.5
   }
   let afterlike=this.judgementBeam() //letは同じブロック内からしか呼べない、varはどこからでも呼び出せる

   if(afterlike.length>0){

      for(let i=0; i<afterlike.length; i++){
        if(afterlike[i].invisibleNow==false){
          afterlike[i].beInvisible()
          this.remove()
          break
      }
          //ここでeffect this.eff=null, this.eff= new HpplusEffect()
          
      }
      //this.remove()
      return
   }
 
     this.position.x+=this.velocity.x
     this.position.y+=this.velocity.y

     if(this.count>this.duration){//when to be removed
        this.remove()
        return
     }

   }
   remove(){
    delete rooms[this.inRoom].invisible[this.id]
    //this=null
 }
}

class HpplusEffect{

}

class Beam{
    constructor(posix, posiy, which, obj,shosoku){//objはbeamの持ち主
        this.beamApper=false  // false &&false なら発射　otherwise not
        this.ongoing=false
        this.owner=obj
        
        this.position = {
            x:0,
            y:0
        }
        this.velocity={
            x:shosoku,// 0
            y:0
        }

        this.rad=5//not used 
        
        this.which=which

        switch(this.which){
            case 1:
                this.position.x=posix+this.owner.width/2//player.width !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                this.position.y=posiy+this.owner.height/2//player.height(=20)-10 //  player.height/2 
            break

            case -1://hidari
                this.position.x=posix+this.owner.width/2//player.width !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                this.position.y=posiy+this.owner.height/2//player.height(=20)-10 //  player.height/2 
            break
        }



        this.width=30
        this.height=5
        this.finalX;
        this.finalY;
        this.LazerLen=100
        this.lenNow=0
        this.ix=0
        this.iy=0
        this.count=0
        this.speed=15
        //this.which=0;
        this.id=Math.floor(Math.random()*100000000);
        this.power=10
       // this.bullets;
        this.bulletsMax;
        this.hitbeam=0
        //this.hitplayers=[]
    }
    //posix, posiy
    update(){
          
        if(this.judgementFloor22()){
            this.velocity.y=-this.velocity.y*1.2
           }
        //this.velocity.x=(this.owner.hp/this.owner.hpMax)*this.velocity.x
        this.position.x += this.velocity.x*this.which
        this.position.y +=this.velocity.y
        //this.draw()
        this.count++
        //console.log(this.count+"hhhh"+this.position.x)
        if(this.position.y + this.height + this.velocity.y < 1000){//!!!!!!!!!!!!!!!!!!!!!!!!!1000=canvas.height
            //this.velocity.y +=gravity 
            this.velocity.y=0
       }else{
           this.velocity.y=0
       }

       if(this.judgementFloor()){
          this.velocity.y=-this.velocity.y*0.8//ここを変えればバウンドする
       }

       let afterlike=this.judgementBeam() //letは同じブロック内からしか呼べない、varはどこからでも呼び出せる

       if(afterlike.length>0){
          for(let i=0; i<afterlike.length; i++){
              afterlike[i].getDamaged(this.power)
          }
          this.remove()
       }
       //console.log("lp",this.count)
        if(this.count>=100){//ここで持続時間きまる
          this.remove()
          //this.count=0
          //this.velocity.y=0

          //this.bullets--
          //this.ongoing=false
        }

        

    }

     judgement(obj){//floorにひっとしてるか
        return this.position.y + this.height<= obj.position.y &&this.position.y + this.height + this.velocity.y> obj.position.y&&this.position.x+ this.width >= obj.position.x && this.position.x <= obj.position.x+ obj.width
    }

     judgementFloor(){
        return Object.values(platforms).some((platform) => {//some 1つでも条件を満たせばtrue otherwise false
            if(this.judgement(platform)){
                return true;
            }
        });
    }

    //playerに当たったか
    judgement2(obj){//! something wrong with this!!!!!!!!!!!!!!!!!!improve
        return obj.position.y-this.height/2<=this.position.y+this.height/2 
        &&this.position.y+this.height/2<=obj.position.y-this.height/2+obj.height 
        &&obj.position.x-this.width/2<=this.position.x+this.width/2 
        &&this.position.x+this.width/2<=obj.position.x+this.width/2+obj.width
    }

    judgement22(obj){
        return this.position.y > obj.position.y+obj.height 
        &&this.position.y +this.velocity.y< obj.position.y + obj.height
        &&this.position.x+ this.width >= obj.position.x 
        &&this.position.x <= obj.position.x+ obj.width
        //return this.position.y + this.height<= obj.position.y &&this.position.y + this.height + this.velocity.y> obj.position.y&&this.position.x+ this.width >= obj.position.x && this.position.x <= obj.position.x+ obj.width
    }

    judgementFloor22(){
        return Object.values(platforms).some((platform) => {//some 1つでも条件を満たせばtrue otherwise false
            if(this.judgement2(platform)){
                //Onplat[platform.id]=platform
                return true;
            }
        });

    }

    newJudge(obj){
        


        return (this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/           //1
        && obj.position.x/*+obj.velocity.x*/<=this.position.x+this.width/*+this.velocity.x*/
        && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/
        && obj.position.y/*+obj.velocity.y*/<=this.position.y+this.width/*+this.velocity.y*/
      /*  && (this.position.x>obj.position.x|| obj.position.x>this.position.x+this.width
            ||this.position.y>obj.position.y||obj.position.y>this.position.y+this.height)*/
        )
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/+obj.width
            && obj.position.x/*+obj.velocity.x*/+obj.width<=this.position.x+this.width/*+this.velocity.x*/ //2
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/+obj.height
            && obj.position.y/*+obj.velocity.y*/+obj.height<=this.position.y+this.width/*+this.velocity.y*/
            /*&& (this.position.x>obj.position.x+obj.width|| obj.position.x+obj.width>this.position.x+this.width
                ||this.position.y>obj.position.y+obj.height||obj.position.y+obj.height>this.position.y+this.height)*/)
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/+obj.width //4
            && obj.position.x/*+obj.velocity.x*/+obj.width<=this.position.x+this.width/*+this.velocity.x*/
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/
            && obj.position.y/*+obj.velocity.y*/<=this.position.y+this.width/*+this.velocity.y*/
          /*  && (this.position.x>obj.position.x+obj.width|| obj.position.x+obj.width>this.position.x+this.width
                ||this.position.y>obj.position.y||obj.position.y>this.position.y+this.height)*/)
        ||(this.position.x/*+this.velocity.x*/<=obj.position.x/*+obj.velocity.x*/ //3
            && obj.position.x/*+obj.velocity.x*/<=this.position.x+this.width/*+this.velocity.x*/
            && this.position.y/*+this.velocity.y*/<=obj.position.y/*+obj.velocity.y*/+obj.height
            && obj.position.y/*+obj.velocity.y*/+obj.height<=this.position.y+this.width/*+this.velocity.y*/
            /*&& (this.position.x>obj.position.x|| obj.position.x>this.position.x+this.width
                ||this.position.y>obj.position.y+obj.height||obj.position.y+obj.height>this.position.y+this.height)*/)
    }
   

    judgementBeam(){
        //当たったプレイヤーを入れる（連想)配列
        var hitplayers=[]
        Object.values(rooms[this.owner.inRoom].players).forEach((player)=>{
            if(this.newJudge(player)&&this.owner!=player){
                //t
                //this.hitplayers.push(player)
                hitplayers.push(player)
            }
        })

        Object.values(rooms[this.owner.inRoom].buls).forEach((each)=>{
            if(this.newJudge(each)/*&&this.owner!=player*/){
                //t
                //this.hitplayers.push(player)
                hitplayers.push(each)
            }
        })
        //console.log(hitplayers)
        return hitplayers
    }
    /*velocityChange(){
        this.velocity.x
    }*/


    remove(){
        delete this.owner.beamclub[this.id]
        //this=null
        //delete beams[this.id]
    }

    toJSON(){
        return { id:this.id, positionx: this.position.x, positiony: this.position.y, width:this.width, height:this.height,
            rad:this.rad
     }
    }

}




//let hpbars={}//いらないかも
//const platforms =  [new Platform(400, 280, 500, 30), new Platform(180, 400, 200, 30),new Platform(900, 450, 200, 30)]
const plat1= new Platform(260, 320, 500, 20)//80 to 950 //260 320 500 20
const plat2= new Platform(60, 450, 150, 20) //80
const plat3= new Platform(820, 450, 150, 20)//800
const plat4= new Platform(120, 180, 150, 20)//80
const plat5= new Platform(760, 180, 150, 20)//800
//const plat6= new Platform()

platforms[plat1.id]=plat1
platforms[plat2.id]=plat2
platforms[plat3.id]=plat3
platforms[plat4.id]=plat4
platforms[plat5.id]=plat5

io.on('connection', (socket)=>{//function(socket){}
    
    let player = null;
    socket.on('online', (room, name) => {
       // console.log("current situation: ", rooms)
       /* if(rooms[room].connect==false){
        rooms[room].connect=true
    }*/
        //totalPlayers+=1
        //console.log("hello "+socket.id)
        socket.join(room)
        //console.log("moving...")
        let lenOfpl=Object.values(rooms[room].players).length
        player = new Player(lenOfpl+1, room, name, socket.id);
        //player.socketID=socket.id
        rooms[room].players[player.id] = player;//socket.id
        //io.to(player.socketID).emit('send-link')
        //player.playername=name
        //player.inRoom=room
        //player.id
        //beams[player.beam.id]=player.beam
        //hpbars[player.hpbar.id]=player.hpbar//いらないかも
        //socket.join(rooms[room])

        //console.log("user",player.id," joined in ",player.inRoom)
        //console.log("rooms",rooms)

        //console.log("total players",Object.keys(players).length)
       io.to(player.socketID).emit('current-situation',rooms)
    });

    socket.on('start-ready', config=>{
        if(!player){return;}
        player.ready=true 
        let NumOfplayer=0;
        //playerが属している部屋の全員がready=trueが確認 そうならemit game-start
        let startOk=Object.values(rooms[player.inRoom].players).every(player=>{//every() some()
            NumOfplayer++
             if(player.ready==true){
                return true
             }
        })
         //console.log("numOf:",NumOfplayer)
        if(startOk&&NumOfplayer>1){
            //console.log("hype boy", rooms[player.inRoom].during)
            //rooms[player.inRoom].during=true
            //
            rooms[player.inRoom].hiroba=false
            rooms[player.inRoom].incount=true
            Object.values(rooms[player.inRoom].players).forEach(each=>{
                each.hp=each.hpMax
                each.shootRemain=each.beamMax
                each.again=false
            })
            rooms[player.inRoom].hpplusTime=RandomNum(10,90,8)//170以上179以下 8ko
            rooms[player.inRoom].beamPlusTime=RandomNum(10,160,15)// 10ko
            rooms[player.inRoom].invisibleTime=RandomNum(30, 180,10)
             io.to(config).emit('game-start-soon')
            //io.to(config).emit('game-start')
            //console.log(rooms)
            //emit('game-start'), send this to all the players in the same room
        }else if(startOk&&NumOfplayer<=1){
            //console.log("stop",player.socketID) 
           // io.sockets.socket(player.socketID).emit('please-wait',{message:"Waiting for other players to join..."});
            //socket.to(config).emit('please-wait',{message:"Waiting for other players to join..."})
            io.to(player.socketID).emit('please-wait',{message:"Waiting for other players to join..."})
            //console.log("qw")
            //wating for another

        }else{
           // io.sockets.socket(player.socketID).emit('please-wait',{message:"Waiting for other players to get ready..."}); 
           //socket.to(player.socketID).emit('please-wait',{message:"Waiting for other players to get ready..."}) 
           io.to(player.socketID).emit('please-wait',{message:"Waiting for other players to get ready..."})
        }
        
    })

    socket.on('not-ready',val=>{
        if(!player){return;}
        player.ready=false
    })

    socket.on('movement', movement=> {
        if(!player){return;}
        player.movement = movement;// forward: true etc
    });

    socket.on('shoot',key=>{
        if(!player/*||player.shootRemain<=0*/ /*|| player.health===0*/){return;}  
        //player.ExbeamCount=player.beamCount
        player.beamCount++
        switch(key){
            case 'j':
                player.shoot(player.position.x, player.position.y, -1)
                //ongoing true
                player.gun.left=true
            break
            case 'l':
                player.shoot(player.position.x, player.position.y, 1)
                player.gun.right=true
            break
        }
    })
    //shoot end一つにまとめられる
    socket.on('shootEnd',key=>{
        if(!player /*|| player.health===0*/){return;}  
        switch(key){
            case 'j':
                //ongoing false
                player.gun.left=false
            break
            case 'l':
                player.gun.right=false
            break
        }
    })

    socket.on('attack', config=>{//attckEndと一つにまとめられる
        //give damage to enemies
        if(!player){return;}
        player.punc=true
        player.punch()
    })
    socket.on('attackEnd',val=>{
        if(!player){return;}
       player.punc=false
    })

    /*socket.on('send-message', val=>{
        //player.socketID
        io.to(player.inRoom).emit('hey',{content:val, who:player.playername, id:player.socketID})
    })*/
    socket.on('disconnect', () => {
        if(!player){return;}
     /*   if(rooms[player.inRoom].during==true){
           //試合終了
           rooms[player.inRoom].result.unshift([player.socketID, player.playername])
           if(Object.values(rooms[player.inRoom].players).length==2){
            let oliv=player.inRoom
            delete rooms[oliv].players[player.id];
            rooms[oliv].during=false
            rooms[oliv].end=true
           }
           
        }else{
           
        }*/
        //delete rooms[player.inRoom].players[player.id];
        //console.log("bye",player.playername, rooms[player.inRoom].end)
        //これが原因: 
      if(rooms[player.inRoom]){
        
      
       if(rooms[player.inRoom].players[player.id]){
        delete rooms[player.inRoom].players[player.id];
        }else{
        delete rooms[player.inRoom].rest[player.id]; 
        }

        if(Object.values(rooms[player.inRoom].players).length+Object.values(rooms[player.inRoom].rest).length==0){//if there's no one
             rooms[player.inRoom].deletee=true
        }
    }
        //rooms[player.inRoom].rest[player.id]=player
       // console.log("bye",player.playername, rooms[player.inRoom].end)

        player = null;

        
        
    });

    socket.on('OneMoreTime',val=>{
        if(!player){return}
        player.again=true
        let ninzu=0
        let which=0
        Object.values(rooms[player.inRoom].players).forEach(each=>{
           if(each.again==true){
                ninzu++
           }
        })
        Object.values(rooms[player.inRoom].rest).forEach(each=>{
            if(each.again==true){
                ninzu++
           }
           if(each.id==player.id){
            which=1
           }
        })
        if(which==1){
            rooms[player.inRoom].players[player.id]=player
            delete rooms[player.inRoom].rest[player.id]
        }
        if(ninzu==2&&rooms[player.inRoom].hiroba==false){
            console.log("ninzu is ",ninzu)
            rooms[player.inRoom].end=false
            rooms[player.inRoom].hiroba=true
            //rooms[player.inRoom].players[player.id]=player
            rooms[player.inRoom].letsgo=false
            rooms[player.inRoom].timeOn=false
            rooms[player.inRoom].timeOn2=false

            rooms[player.inRoom].result=[]
            rooms[player.inRoom].result2=[]

            Object.values(rooms[player.inRoom].players).forEach(each=>{
                if(each.again==true){
                io.to(each.socketID).emit('again')
                }
            })
          //ninzu=2の時
           // io.to(player.inRoom).emit('again')
            //stop watch ストップ
        }else if(ninzu>=2&&rooms[player.inRoom].hiroba==true){
            io.to(player.socketID).emit('again')
        }else{
            io.to(player.socketID).emit('wait-again',{message:"Now only you"})
        }
      
        player.hp=player.hpMax
        player.shootRemain=player.beamMax
    })
     socket.on('not-start',val=>{
        if(!player){return}
        if(player.ready==true){
            player.ready=false
        }
     })

    //socket.emit('game-start','Game start')
})

//if(Object.values(rooms).length>=1){
setInterval(() => {
    Object.values(rooms).forEach((room)=>{

        if(room.deletee==true){
            //console.log('deletee by moi',rooms[room.NameOfroom])
        
            if(Object.values(room.players).length>=1){
                io.to(room.NameOfroom).emit('room-delete') 
                Object.values(room.players).forEach(player=>{
                    player=null
                })
            }
          /*  Object.values(platforms).forEach(platform=>{
                delete platforms[platform.id] 
                platform=null
            })*/
            delete rooms[room.NameOfroom] 
            
            room=null//undefined
           // console.log("room-delete", room)
           
           /* if (typeof window !== 'undefined') {
                window.location.href="localhost:3000"
              }*/
            
            //window.location.href="localhost:3000"
            //ここでlocalhost3000に戻したい
            return;
         }
         if(Object.values(room.players).length==0&&Object.values(room.rest).length==0&&(room.end==true||room.during==true||room.incount==true)){//kokodaaaaaa
              room.onway=true
         }
         if(room.realend==true){
            delete rooms[room.NameOfroom] 
            room=null//undefined
            console.log("room-delete", room)
            return
         }
         
         if(room.incount==true&&room.timeOn==false){

            room.zikan(matchLen+countD,1)
            //console.log("aaa")
            room.timeOn=true
         }  
         if(room.end==true&&room.timeOn2==false){
           room.zikan(60,2)
           room.timeOn2=true
         }
         if(room.during==true&&room.letsgo==false){
            io.to(room.NameOfroom).emit('game-start')
            //console.log("fuck you")
            room.letsgo=true
         }


         Object.values(room.hps).forEach((hpp)=>{
            hpp.update()
         })
         Object.values(room.buls).forEach((monk)=>{
            monk.update()
         })
         Object.values(room.invisible).forEach((cloak)=>{
            cloak.update()
         })
    
          // if(room!=undefined||room!=null){
           Object.values(room.players).forEach((player)=>{
            
            const movement = player.movement;
            //console.log("qq",player.id," ",player.position.x, " ",player.position.y)
            
            if(movement.left){
                //console.log(players)
                player.move(2)
                //console.log("bazarr",movement.left)
            }
            if(!movement.left&&!movement.right){
                player.move(3)
            }
            if(movement.right){
                player.move(1)
            }
            if(!movement.right&&!movement.left){
                player.move(3)
            }
            if(movement.jump/*&&player.position.y>0*/){//player.position.y<=0
                player.move(4)
                
            }
         Object.values(player.beamclub).forEach(beam=>{
                if(beam!=undefined){
                    //console.log("fuu")
                beam.update()
                //console.log("fuu", beam.position.x, beam.position.y)
                }
            })  
            player.update()
        /*    if(player.judgementFloor()){
                player.move(5)//0
            } */
        
           })
        
       // }
        
        //console.log("llt",Object.keys(room)[0])
        
        io.to(room.NameOfroom).emit('state', room, platforms)
    
    //}
        })
        //io.sockets.emit('state', rooms, platforms/*, beams*/);
        
    }, 10);
    //1000/30
//}
    function RandomNum(min, max,kazu){
        //min以上 max以下のランダムな整数を重複なしでkazu個生成
        let array=[]
        for(let i=0;i<kazu; i++){
            let rand;
           do{
             rand = Math.floor(Math.random() * (max + 1 - min)) + min
           }while(array.includes(rand))
           array.push(rand)
        }
        //var rand = Math.floor(Math.random() * (max + 1 - min)) + min
     return array

    }

    server.listen(process.env.PORT||3000, function(error){
        if(error){
           console.log("errorrrr")
        }else{
           console.log("heyyyy")
        }
    }) 
