const socket= io('https://boxersintheuniverse.herokuapp.com')//io('http://localhost:3000')

//const playername=prompt("put player name")
const playername="asshole"
const canvas= document.querySelector('canvas')
/*
・shoot とshootEnd一つのemitにできる like movement


*/

const c = canvas.getContext("2d")

var btnVer=0
 
const countdown=5
const kaisan=30

const gravity = 0.5
canvas.width = 1024//window.innerWidth
canvas.height= 576//window.innerHeight
let movement={}
let gun={}
const sizeOfbar=0.6
const sizeOfbullets=0.5// max/bullets =0.5 max=60

const image=document.getElementById("player-image")
const image2= document.getElementById("player-image2")
const image3= document.getElementById("player-image3")
const image4= document.getElementById("player-image4")
const hpplusImage= document.getElementById("hpplus-image1")
const enemyImage=document.getElementById("enemy-image1")

const stbtn=document.getElementById("startBtn")
const zikan=document.getElementById('timer')
const discrip=document.getElementById('setume')
const itom=document.getElementById('item')
const copyTarget = document.getElementById("copyTarget")
const clip=document.getElementById('clip')
//const disc=document.getElementById('disc')
const messagelist=document.getElementById('message')
const form=document.getElementById('sen')
const input=document.getElementById('txtbox')
const chckb=document.getElementById('checkbo')
const buttonIt=document.getElementById('chbox')
const hype=document.getElementById('haa')

const MoreBtn=document.getElementById('MoreBtn')
const OutBtn=document.getElementById('OutBtn')
/*const image = new Image();
image.src='IMG_1899.PNG'*/

copyTarget.setAttribute('value',location.href)
//copyTarget.style.value=location.href

const KeyToCommand = {
    'w': 'jump',
    'a': 'left',
    'd': 'right',
};

addEventListener('keydown',(event)=>{

    const command = KeyToCommand[event.key];
    if(command){
        
            movement[command] = true;
            //console.log("keudown",event.key)
            socket.emit('movement', movement);
    } 
    if(event.key=="j"||event.key=="l"){
        socket.emit('shoot',event.key)
    }
    if(event.key=="i"){
        socket.emit('attack')
    } 
    
})

addEventListener('keyup',(event)=>{//改善の余地大有り
    const command= KeyToCommand[event.key];
    if(command){
        movement[command]=false
        //console.log("keyup", event.key)
        socket.emit('movement', movement)
    }
    if(event.key=="j"||event.key=="l"){
        socket.emit('shootEnd',event.key)
    }  
    if(event.key=="i"){
        socket.emit('attackEnd')
    }
    

})

/*form.addEventListener("submit",(e)=>{
   e.preventDefault()
   if(input.value){
    socket.emit('send-message',input.value)
    input.value=""
   }

})*/
//serverからgame startを受け取ったら//decreaseTimer()


socket.on('state', (rooms, platforms/*,beams*/ /*hpbars*/)=>{
    //console.log("q:",rooms.NameOfroom)
    c.clearRect(0,0, canvas.width, canvas.height)
   // countUpdate(rooms[roomName].temps)
   if((rooms.incount==true||rooms.during==true)&&rooms.timeOn==true){
    countUpdate(rooms.temps,1)
   }else if(rooms.end==true&&rooms.timeOn2==true){
    countUpdate(rooms.temps,2)
   }
   //console.log("hype :",rooms.temps)
    Object.values(platforms).forEach(platform=>{
        c.fillStyle= 'black'
        c.fillRect(platform.positionx, platform.positiony, platform.width, platform.height)
    })
    //console.log("ll:"+rooms[roomName].temps)
    Object.values(rooms.hps).forEach(hpplus=>{
        c.drawImage(hpplusImage,hpplus.positionx,hpplus.positiony, hpplus.width, hpplus.height)
    })
    Object.values(rooms.buls).forEach(enemy=>{
        c.drawImage(enemyImage,enemy.positionx,enemy.positiony, enemy.width, enemy.height)
    })

    Object.values(rooms.players).forEach(player=>{//rooms[roomName].players
        
       Object.values(player.beamclub).forEach(beam=>{
           // console.log("uewegwgegwggweg", beam)
           if(beam!=undefined){
                //console.log("qwe")
               
                c.fillStyle= 'yellow'
                
                c.fillRect(beam.positionx, beam.positiony, beam.width, beam.height)
            }
        })
        //console.log("yo")
       
        if(player.gunRight){
            c.drawImage(image2,player.positionx, player.positiony, player.width, player.height)
        }else if(player.gunLeft){
            c.drawImage(image3,player.positionx, player.positiony, player.width, player.height) 
        }else if(player.punc){
            c.drawImage(image4,player.positionx, player.positiony, player.width, player.height) 
        }else{
            c.drawImage(image,player.positionx, player.positiony, player.width, player.height) 
        }

        //ダメージを受けたら赤色にする

        //c.drawImage(image,player.position.x, player.position.y, player.width, player.height)
        //c.fillRect(player.position.x, player.position.y, player.width, player.height)//画像になる
        c.fillStyle= 'red'
        //c.fillText("hp:"+player.hp+"/"+player.hpMax,player.positionx, player.positiony-35)
        c.fillRect(player.positionx, player.positiony-35, player.hp*sizeOfbar, 5)//playerの上
        c.fillStyle= ' gray'
        c.fillRect(player.positionx+player.hp*sizeOfbar, player.positiony-35, (player.hpMax-player.hp)*sizeOfbar, 5)
        c.fillStyle =' green'
        //c.fillText("bullets:"+player.shootRemain+"/"+player.beamMax,player.positionx, player.positiony-20)
        c.fillRect(player.positionx, player.positiony-30, player.shootRemain*sizeOfbullets, 5)
        c.fillStyle= ' gray'
        c.fillRect(player.positionx+player.shootRemain*sizeOfbullets, player.positiony-30, (player.beamMax-player.shootRemain)*sizeOfbullets, 5)
        c.font = '12px serif';
        if(player.socketID==socket.id){
           c.fillStyle='yellow'
        }else{
           c.fillStyle ='white'
        }
        
        
        c.fillText(player.playername, player.positionx, player.positiony - 40);
        if((rooms.hiroba==true||rooms.incount==true)&&player.ready==true){
        c.fillStyle='red'    
        c.fillText("Ready to fight", player.positionx, player.positiony - 55);   
        }
        //c.fillText('hp: '+player.hp, player.position.x, player.position.y - 25)
        //c.fillText('lv.'+player.hp, player.position.x, player.position.y - 15)
        //ここにhpbarもかく
    
    })
    
   /* Object.values(beams).forEach(beam=>{
        
        c.fillStyle= 'yellow'
        c.fillRect(beam.position.x, beam.position.y, beam.width, beam.height)
    
    })*/

})

socket.on('please-wait', config=>{
  /*  let item=document.createElement('li')
    console.log("please-wait",config.message)
    item.textContent=config.message
    messagelist.appendChild(item)*/
    jsFrame.showToast({
        html: config.message, align: 'top', duration: 5000
    });

   /* discrip.textContent=config.message
    discrip.style.display='inline'*/
    //disc.textContent=config.message
})
socket.emit('online', roomName, playername)

socket.on('dead', place=>{
    let item=document.createElement('li')
    if(place.outPlayer==socket.id){
      item.textContent="You: dead, place:"+place.place
      item.classList.add('mark')
    }else{
      item.textContent=place.name+": dead, place:"+place.place
    }
    messagelist.appendChild(item)
})
/*socket.on('send-link',val=>{
    let item=document.createElement('li')
    item.textContent="Send the link above to your friends to play with."
    messagelist.appendChild(item)
})*/

socket.on('run-out-of-bullets',config=>{
    jsFrame.showToast({
        html: 'Run out of bullets', align: 'top', duration: 1000
    });
   // console.log('run out of bullets')
    //disc.textContent="run out of bullets"
    //ホップアップみたいに
})

socket.on('end',val=>{
    jsFrame.showToast({
        html: 'Game end', align: 'top', duration: 1000
    });
    discrip.textContent="This room vanishes in"
    let item=document.createElement('li')
    let im=document.createElement('strong')
    //console.log('end')
    item.textContent="Game end!!"
    //item.classList.add('bg')
    im.appendChild(item)
    messagelist.appendChild(im)

    item=document.createElement('li')
    //item.classList.add('res')
    item.textContent="Game result>>"
    messagelist.appendChild(item)
    //val.result array
    for(let i=1; i<=val.result.length; i++){
     let item2=document.createElement('li')

     //item2.classList.add('res')
     if(val.result[i-1][0]==socket.id){
        item2.textContent=(i-val.result[i-1][3])+": YOU"+" ("+val.result[i-1][1]+")"

        let kyo=document.createElement('span')
        kyo.appendChild(item2)
        messagelist.appendChild(kyo)
     }else{
        item2.textContent=(i-val.result[i-1][3])+": "+val.result[i-1][1]
        messagelist.appendChild(item2)
     }
     //退出ボタンform ともう一回ボタン
    /* if(i==1){
        item2.textContent+=" ☆Winner☆"
     }*/
     //messagelist.appendChild(item2)
    }
    kyo=document.createElement('li')
    kyo.textContent="------------------"
    messagelist.appendChild(kyo)

    MoreBtn.style.display='block'
    OutBtn.style.display='block'

  /*  let oneMore=document.createElement('button')
    oneMore.textContent="One More Time"
    oneMore.onclick=function(){
        socket.emit('OneMoreTime')
    }
    let ite3=document.createElement('li')
    ite3.appendChild(oneMore)
    messagelist.appendChild(ite3)

    let oneMore2=document.createElement('button')
    oneMore2.textContent="Nah get outta here"
    oneMore2.onclick=function(){
        //socket.emit('OneMoreTime')
        window.location="/"
    }
    let ite32=document.createElement('li')
    ite32.appendChild(oneMore2)
    messagelist.appendChild(ite32)*/
    //let item2=document.createElement('li')

    //result表示
})

socket.on('win',val=>{
    let item=document.createElement('li')
    if(val.sid==socket.id){
        item.textContent="YOU WON!!"
        item.classList.add('mark')
    }else{
        item.textContent=val.who+" WON!!"
    }
    messagelist.appendChild(item)
})

socket.on('game-start',config=>{
    //zikan.style.display='inline'
    jsFrame.showToast({
        html: 'Game start!!', align: 'top', duration: 1000
    });
    discrip.textContent="The game ends in"
    let item=document.createElement('li')
    let im=document.createElement('strong')
    //console.log("yeah")
    item.textContent="Game start!!"
    //item.classList.add('bg')
    im.appendChild(item)
    
    messagelist.appendChild(im)

})

socket.on('game-start-soon',val=>{
    clip.style.display='none'
    chckb.style.display='none'
    stbtn.style.display='none'
    hype.style.display='none'

    zikan.style.display='block'
    discrip.textContent="The game starts in"
    discrip.style.display='block'
   
    let item=document.createElement('li')
    item.textContent="The match is going to start in 10 seconds!"
    messagelist.appendChild(item)
})

socket.on('room-delete',val=>{
      window.location = "/";
})

socket.on('again',config=>{
    //clip.style.display='none'
    chckb.style.display='block'//'inline'
    buttonIt.checked=false

    //stbtn.style.display='inline'
    hype.style.display='block'//'inline'

    stbtn.textContent="Ready to fight"

    zikan.style.display='none'
    discrip.style.display='none'
    MoreBtn.style.display='none'
    OutBtn.style.display='none'

    const nagas=messagelist.children.length
   for(let i=0; i<nagas; i++){
        messagelist.removeChild(messagelist.children[0])
    }
})

socket.on('wait-again',val=>{
    jsFrame.showToast({
        html: 'Waiting for other players to re-join...', align: 'top', duration: 3000
    });
})
//socket.on('room')

/*socket.on('countupdate',val=>{
    let showDisplay;
    var showMinute=(val-val%60)/60;
    var showSecond=val%60;
     if(showSecond<10){
        showDisplay=showMinute+":0"+showSecond
    }else{
        showDisplay=showMinute+":"+showSecond
    }
    zikan.textContent=showDisplay
})*/

/*socket.on('hey',val=>{
    let item=document.createElement('li')
    if(val.id==socket.id){
        item.classList.add('mark')
        item.textContent="You: "+val.content
    }else{
        item.textContent=val.who+": "+val.content
    }
    messagelist.appendChild(item)
})*/
function countUpdate(timee,ver){
    let showDisplay; 
    let showMinute;
    let showSecond;
   if(190>=timee&&timee>=180&&ver==1){
       showMinute=((timee-180)-(timee-180)%60)/60;
       showSecond=(timee-180)%60;
       zikan.style.color='blue'
       showDisplay=""
    }else{
       showMinute=(timee-timee%60)/60;
       showSecond=timee%60;
       zikan.style.color='red'
       showDisplay=""
    }

     if(showSecond<10){
        showDisplay+=showMinute+":0"+showSecond
    }else{
        showDisplay+=showMinute+":"+showSecond
    }

    zikan.textContent=showDisplay
}



function StartButton(){
    if(btnVer==0){
        socket.emit('start-ready',roomName)
        stbtn.textContent="Not ready to fight"
        btnVer=1
        return
    }
    if(btnVer==1){
        socket.emit('not-ready', roomName)
        stbtn.textContent="Ready to fight"
        btnVer=0
        return
    }
    //stbtn.style.visibility='hidden'
    //stbtn.style.display='none'

}
function copyToClipboard() {
    // コピー対象をJavaScript上で変数として定義する
    //var copyTarget = document.getElementById("copyTarget");

    // コピー対象のテキストを選択する

    copyTarget.select();

    // 選択しているテキストをクリップボードにコピーする
    document.execCommand("Copy");
jsFrame.showToast({
        html: 'copied the link of this room', align: 'top', duration: 2000
    });
    // コピーをお知らせする
    
}

function Yaay(obj){
    //var stbtn2=document.getElementById('startBtn')
    if(obj.checked){
    stbtn.style.display='inline'
    }else{
        socket.emit('not-start')
        stbtn.style.display='none'  
        stbtn.textContent="Ready to fight" 
        
    }
}

function outta(){
   // alert("You wanna really get out?")
    window.location='/'
}

function more(){
    socket.emit('OneMoreTime')
}


/*function getDate(){
    var now = new Date();
   
      //var target = document.getElementById("DateTimeDisp");

      var Year = now.getFullYear();
      var Month = now.getMonth()+1;
      var Date = now.getDate();
      var Hour = now.getHours();
      var Min = now.getMinutes();
      var Sec = now.getSeconds();

      //target.innerHTML = Year + "年" + Month + "月" + Date + "日" + Hour + ":" + Min + ":" + Sec;
     return Year + "年" + Month + "月" + Date + "日" + Hour + ":" + Min + ":" + Sec;
}*/



