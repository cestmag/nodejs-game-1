const socket=io('https://gamyyy.onrender.com')//io('http://localhost:3000')//io('https://boxersintheuniverse.herokuapp.com') // io('https://boxersintheuniverse.herokuapp.com')//io('http://localhost:3000')

//let playername=socket.id//=prompt("put player name")

//const playername="asshole"
const canvas= document.querySelector('canvas')
/*
・shoot とshootEnd一つのemitにできる like movement


*/
//試合中に人が抜けて一人になった時!!!!!!!!!!!

const c = canvas.getContext("2d")

const pics=["/static/pics/0/syomen.png","/static/pics/1/girlpink.png","/static/pics/2/pirate.png","/static/pics/3/marco.png","/static/pics/4/orange0.png"]
let place=0
//const pic=document.getElementById('mypic')

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

let image;
let image2;
let image3;
let image4;

const i00=document.getElementById("00")
const i01=document.getElementById("01")
const i02=document.getElementById("02")
//const i03=document.getElementById("03")

const i10=document.getElementById("10")
const i11=document.getElementById("11")
const i12=document.getElementById("12")
//const i13=document.getElementById("13")

const i20=document.getElementById("20")
const i21=document.getElementById("21")
const i22=document.getElementById("22")
//const i23=document.getElementById("23")

const i30=document.getElementById("30")
const i31=document.getElementById("31")
const i32=document.getElementById("32")

const i40=document.getElementById("40")
const i41=document.getElementById("41")
const i42=document.getElementById("42")
//const i33=document.getElementById("33")

const hpplusImage= document.getElementById("hpplus-image1")
const enemyImage=document.getElementById("enemy-image1")
const enemyImage2=document.getElementById("enemy-image2")
const invisible=document.getElementById("invisible-image")

const usernametag=document.getElementById("username")
const photo=document.getElementById("photo")

const stbtn=document.getElementById("startBtn")
const zikan=document.getElementById('timer')
const discrip=document.getElementById('setume')
const itom=document.getElementById('item')
//const copyTarget = document.getElementById("copyTarget")
//const clip=document.getElementById('clip')
//const disc=document.getElementById('disc')
const messagelist=document.getElementById('message')
const playerslist=document.getElementById('message2')
const form=document.getElementById('sen')
const input=document.getElementById('txtbox')
const chckb=document.getElementById('checkbo')
const buttonIt=document.getElementById('chbox')
const hype=document.getElementById('haa')

const lanuit=document.getElementById('stromae')

const MoreBtn=document.getElementById('MoreBtn')
const OutBtn=document.getElementById('OutBtn')

//const nextpage=document.getElementById('nextpage')
//nextpage.setAttribute('href','/'+roomName+'/arena')
/*const image = new Image();
image.src='IMG_1899.PNG'*/
const explain=["-Left: A key","-Right: D key","-Jump: W key","-Left beam: L key","-Reft beam: J key","-Punch: I key"]
const whojoin=[]

lanuit.setAttribute('href',encodeURI('/'+roomName+'?id='+idd))
//copyTarget.setAttribute('value',location.href)
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
socket.emit('online', roomName, idd/*playername, thetype*/)//idだけ

socket.on('current',(situation)=>{
   // console.log(" current situation match ", situ)
   const nagas=playerslist.children.length
   for(let i=0; i<nagas; i++){
        playerslist.removeChild(playerslist.children[0])
    }

    if(situation.entrances){
        Object.values(situation.entrances).forEach(person=>{//名前の右横に緑の四角
            let list=document.createElement('li')
           // list.textContent=person.playername
           list.innerHTML=photodeliver(person.type)+person.playername
           if(idd==person.id){
            list.innerHTML+='(You)'
            list.classList.add('orangena')
           }

           //+theMark(0)
           if(person.ready==true){
            list.innerHTML+=theMark(1)
           }
           // gazo.setAttribute('src',pics[person.type])
           // list.appendChild(gazo)
            playerslist.appendChild(list)
        })
        }
        if( situation.rooms){
        Object.values(situation.rooms).forEach(person=>{//名前の右横に赤の四角
            let list=document.createElement('li')
           // list.textContent=person.playername
           list.innerHTML=photodeliver(person.type)+person.playername//+theMark(1)
           if(person.ready==true){
            list.innerHTML+=theMark(1)
           }
            //gazo.setAttribute('src',pics[person.type])
            //list.appendChild(gazo)
            playerslist.appendChild(list)
        })
        }
})

socket.on('state', (rooms, platforms/*,beams*/ /*hpbars*/)=>{
   // console.log("working....")
  // console.log("timer: ",rooms.temps)
    c.globalAlpha=1
    //console.log("q:",rooms.NameOfroom)
    c.clearRect(0,0, canvas.width, canvas.height)
   // countUpdate(rooms[roomName].temps)
   if((rooms.incount==true||rooms.during==true)&&rooms.timeOn==true){
    countUpdate(rooms.temps,1)
    
   }else/*(rooms.end==true&&rooms.timeOn2==true)*/{
    countUpdate(rooms.temps,2)
    
   }
   //console.log("hype :",rooms.temps)
   c.font = '18px serif';
    Object.values(platforms).forEach(platform=>{
        c.fillStyle= '#000000'
        c.fillRect(platform.positionx, platform.positiony, platform.width, platform.height)
    })
    //console.log("ll:"+rooms[roomName].temps)
    Object.values(rooms.hps).forEach(hpplus=>{
        if(hpplus.finish==false){
        c.drawImage(hpplusImage,hpplus.positionx,hpplus.positiony, hpplus.width, hpplus.height)
        }
        if(hpplus.effect!=null){
        c.fillStyle ='#ffffff'
        c.fillText('+10 HP', hpplus.effect.positionx, hpplus.effect.positiony)
        }

        
    })
    Object.values(rooms.buls).forEach(enemy=>{
        if(!enemy.ahhh){
        if(enemy.borw<6){
        c.drawImage(enemyImage,enemy.positionx,enemy.positiony, enemy.width, enemy.height)
        }else{
        c.drawImage(enemyImage2,enemy.positionx,enemy.positiony, enemy.width, enemy.height)   
        }
        }else{
            c.fillStyle= '#000000'
            c.fillRect(enemy.positionx, enemy.positiony,enemy.width, enemy.height )
        }
        c.fillStyle= '#ff0000'//red
        //c.fillText("hp:"+player.hp+"/"+player.hpMax,player.positionx, player.positiony-35)
        c.fillRect(enemy.positionx, enemy.positiony-30, enemy.hp*1, 5)//playerの上 0.5 sizeOfbar
        c.fillStyle= '#808080'//' gray'
        c.fillRect(enemy.positionx+enemy.hp*1, enemy.positiony-30, (enemy.hpMax-enemy.hp)*1, 5)
    })
    Object.values(rooms.invisible).forEach((cloak)=>{
        if(cloak.finish==false){
        c.drawImage(invisible,cloak.positionx,cloak.positiony, cloak.width, cloak.height)
        }
        if(cloak.effect!=null){
        c.fillStyle ='#ffffff'
        c.fillText('Invisible', cloak.effect.positionx, cloak.effect.positiony)  
        }
    })

    Object.values(rooms.players).forEach(player=>{//rooms[roomName].players
        
       Object.values(player.beamclub).forEach(beam=>{
           // console.log("uewegwgegwggweg", beam)
           if(beam!=undefined){
                //console.log("qwe")
               
                c.fillStyle= '#ffff00'//'yellow'
                
                c.fillRect(beam.positionx, beam.positiony, beam.width, beam.height)
            }
        })
        //console.log("yo")
        //console.log("tt",player.gotshot,player.gotshot2, player.socketID)
    //if player.invisi==false and player.socketID==
    if(player.invisi==false||player.socketID==socket.id){
       if(player.invisi==true){
        c.globalAlpha=0.5
       }else{
        c.globalAlpha=1
       }
       //image をplayer.typeによってかえる
       let numberr=player.type

       image=eval("i"+String(numberr)+"0")//動的な変数の作成 eval
       image2=eval("i"+String(numberr)+"1")
       image3=eval("i"+String(numberr)+"2")

       if(!player.ahhh){
        if(player.gunRight){
            c.drawImage(image2,player.positionx, player.positiony, player.width, player.height)
        }else if(player.gunLeft){
            c.drawImage(image3,player.positionx, player.positiony, player.width, player.height) 
        }/*else if(player.punc){
            c.drawImage(image4,player.positionx, player.positiony, player.width, player.height) 
        }*/else{
            c.drawImage(image,player.positionx, player.positiony, player.width, player.height) //eroor :Uncaught DOMException: Failed to execute 'drawImage' on 'CanvasRenderingContext2D': The HTMLImageElement provided is in the 'broken' state
        }
        //player.gotshot2+=1
    }else if(player.ahhh){
        c.fillStyle= '#ff0000'
        c.fillRect(player.positionx, player.positiony,player.width, player.height )
    }
    
        //ダメージを受けたら赤色にする

        //c.drawImage(image,player.position.x, player.position.y, player.width, player.height)
        //c.fillRect(player.position.x, player.position.y, player.width, player.height)//画像になる
        c.fillStyle= '#ff0000'//red
        //c.fillText("hp:"+player.hp+"/"+player.hpMax,player.positionx, player.positiony-35)
        c.fillRect(player.positionx, player.positiony-35, player.hp*sizeOfbar, 5)//playerの上
        c.fillStyle= '#808080'//' gray'
        c.fillRect(player.positionx+player.hp*sizeOfbar, player.positiony-35, (player.hpMax-player.hp)*sizeOfbar, 5)
        c.fillStyle ='#008000'//' green'
        //c.fillText("bullets:"+player.shootRemain+"/"+player.beamMax,player.positionx, player.positiony-20)
        c.fillRect(player.positionx, player.positiony-30, player.shootRemain*sizeOfbullets, 5)
        c.fillStyle= '#808080 '
        c.fillRect(player.positionx+player.shootRemain*sizeOfbullets, player.positiony-30, (player.beamMax-player.shootRemain)*sizeOfbullets, 5)
        c.font = '12px serif';
        if(player.socketID==socket.id){
           c.fillStyle='#ffff00'//black 'yellow'
        }else{
           c.fillStyle ='#ffffff'//'white'
        }
        
        //c.globalAlpha=1
        c.fillText("lv."+player.level+"_"+player.playername, player.positionx, player.positiony - 40);//lvもつけたす？
     /*   if((rooms.hiroba==true||rooms.incount==true)&&player.ready==true){
        c.fillStyle='#ff0000'    
        c.fillText("Ready to fight", player.positionx, player.positiony - 55);   
        }*/

     /*   if(player.invisi==true){
            
        c.fillStyle='#ff0000'
        c.fillText("Invisible", player.positionx, player.positiony - 55); 
        }*/
    }
        //c.fillText('hp: '+player.hp, player.position.x, player.position.y - 25)
        //c.fillText('lv.'+player.hp, player.position.x, player.position.y - 15)
        //ここにhpbarもかく
    
    })
    
   /* Object.values(beams).forEach(beam=>{
        
        c.fillStyle= 'yellow'
        c.fillRect(beam.position.x, beam.position.y, beam.width, beam.height)
    
    })*/
    
    //red zone
    c.globalAlpha=0.5
    c.fillStyle='#ffff00'//yellow
    c.fillRect(0,526, 1024, 40)//576-500=76 500以上だとdamage
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
//socket.emit('online', roomName, playername, thetype)

socket.on('dead', place=>{
    let item=document.createElement('li')
    if(place.outPlayer==socket.id){
      item.textContent="You: dead, place:"+place.place
      item.classList.add('mark')
    }else{
      item.textContent=place.name+": dead, place:"+place.place
    }
    messagelist.appendChild(item)
    scrolll()
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
    discrip.textContent="Back to the top page in"
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
    kyo.textContent="---------------"
    messagelist.appendChild(kyo)
    scrolll()
   /* MoreBtn.style.display='block'
    OutBtn.style.display='block'*/
    lanuit.style.display='inherit'
   
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
    scrolll()
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
    //clip.style.display='none'
    chckb.style.display='none'
    stbtn.style.display='none'
    hype.style.display='none'

    zikan.style.display='block'
    discrip.textContent="The game starts in"
    discrip.style.display='block'

    lanuit.style.display='none'

    //image の写真を設定
    
    // choose the pics to show based on value place
    /*switch(place){
        case 0:
            image.setAttribute("src","/static/pics/syomen.png")
            image2.setAttribute("src","/static/pics/0/dotpict (1).png")
            image3.setAttribute("src","/static/pics/0/dotpict.png")
        break

        case 1:
           image.setAttribute("src","/static/pics/girlpink.png")
           image2.setAttribute("src","/static/pics/1/girlpink1.png")
           image3.setAttribute("src","/static/pics/1/girlpink2.png")
        break

        case 2:
            image.setAttribute("src","/static/pics/pirate.png")
            image2.setAttribute("src","/static/pics/2/pirate2.png")
            image3.setAttribute("src","/static/pics/2/pirate3.png")
        break

        case 3:
           image.setAttribute("src","/static/pics/marco.png")
           image2.setAttribute("src","/static/pics/3/marco1.png")
           image3.setAttribute("src","/static/pics/3/marco2.png")

        break
    }*/
    //image3
    //image4

    place=0
    
    for(let i=0; i<explain.length; i++){
        let item=document.createElement('li')
         item.textContent=explain[i]
         item.classList.add('banana')
         
         messagelist.appendChild(item)
    }
    let itemm=document.createElement('li')
    
    itemm.textContent="The match is going to start in 10 seconds!"
    messagelist.appendChild(itemm)
})
socket.on('joined',val=>{
    
    let item=document.createElement('li')
    if(val.socketid!=socket.id){
        item.textContent=val.who+": joined"
        messagelist.appendChild(item)
    }else{
       
        item.textContent="You: joined"
        messagelist.appendChild(item)
    }
})

socket.on('room-delete',val=>{
      window.location = "/"+val
})
socket.on('restart',val=>{
    window.location=encodeURI("/"+val+'?id='+idd)

   /* chckb.style.display='block'//'inline'
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
    }*/
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

socket.on('countupdate',val=>{
    let showDisplay;
    var showMinute=(val-val%60)/60;
    var showSecond=val%60;
     if(showSecond<10){
        showDisplay=showMinute+":0"+showSecond
    }else{
        showDisplay=showMinute+":"+showSecond
    }
    zikan.textContent=showDisplay
})

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
    window.location='/'
}

function more(){
    socket.emit('OneMoreTime')
}

function back(){
    
}

function photodeliver(bango){
    let info='<img height="20px" weight="20px" class="smallpics" src="'
    let tail=' "> '
    return info+pics[bango]+tail
}

function theMark(ver){
    switch(ver){
        case 0:
           return '<div class="midori"&gt;&lt;/div>'//escape ><

        case 1:
           return '<div class="aka"&gt;&lt;/div>'
       
    }
}

function scrolll(){
  messagelist.scrollTop = messagelist.scrollHeight;
}

/*function change(which){
  place+=which
  place=mod(place, pics.length)
  //console.log("place :",place) 
  pic.setAttribute('src',pics[place])
  


}*/

//正の余りをかえす
/*function mod(i, j) {
    return (i % j) < 0 ? (i % j) + 0 + (j < 0 ? -j : j) : (i % j + 0);
}*/

/*function next(){
    let whatname=document.getElementById("yourname")
    //console.log("whatname",whatname)
    playername=whatname.value

    usernametag.textContent=whatname.value
    //let fornow=nextpage.getAttribute('href')
    //nextpage.setAttribute('href', encodeURI('/'+roomName+'/arena?name='+playername) )

    socket.emit("rename",playername)

    let namae=document.getElementById("chooseName")

    namae.style.display= "none"

    let chara=document.getElementById("displayBox")

    chara.style.display="inline"

    let title=document.getElementById("title")

    title.textContent="Choose your character"
}*/

/*function startg(){
    socket.emit('decided',place)

    photo.setAttribute('src',pics[place])

    nextpage.setAttribute('href', encodeURI('/'+roomName+'/arena?name='+playername+'&type='+place) )

    let choose=document.getElementById("choose")

    choose.style.display="none"

    itom.style.display="inline"

    canvas.style.display="inline"
}*/
