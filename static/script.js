const socket=io('http://localhost:3000')//io('https://boxers-in-the-universe.onrender.com')//io('http://localhost:3000')//io('https://boxersintheuniverse.herokuapp.com') // io('https://boxersintheuniverse.herokuapp.com')//io('http://localhost:3000')

let playername=kiminonawa//=prompt("put player name")
//const playername="asshole"
//const canvas= document.querySelector('canvas')
/*
・shoot とshootEnd一つのemitにできる like movement


*/
//試合中に人が抜けて一人になった時!!!!!!!!!!!
let nankai=0
//const c = canvas.getContext("2d")

const pics=["/static/pics/0/syomen.png","/static/pics/1/girlpink.png","/static/pics/2/pirate.png","/static/pics/3/marco.png","/static/pics/4/orange0.png"]
let place=0;//character type
const pic=document.getElementById('mypic')

let kojinid;

var btnVer=0
 
const countdown=5
const kaisan=30

const gravity = 0.5
//canvas.width = 1024//window.innerWidth
//canvas.height= 576//window.innerHeight
let movement={}
let gun={}
const sizeOfbar=0.6
const sizeOfbullets=0.5// max/bullets =0.5 max=60

const choose=document.getElementById("choose")
const title=document.getElementById("title")
const chooseName=document.getElementById("chooseName")

const usernametag=document.getElementById("username")
const photo=document.getElementById("photo")

//const stbtn=document.getElementById("startBtn")
//const zikan=document.getElementById('timer')
//const discrip=document.getElementById('setume')
const itom=document.getElementById('item')
const item2=document.getElementById('item2')
const copyTarget = document.getElementById("copyTarget")
const clip=document.getElementById('clip')
//const disc=document.getElementById('disc')
const messagelist=document.getElementById('message')

const messageform=document.getElementById('sen')
const txtbox=document.getElementById('txtbox')
const chatting=document.getElementById('chatting')
//const form=document.getElementById('sen')
//const input=document.getElementById('txtbox')

//const chckb=document.getElementById('checkbo')
//const buttonIt=document.getElementById('chbox')
//const hype=document.getElementById('haa')

//const MoreBtn=document.getElementById('MoreBtn')
//const OutBtn=document.getElementById('OutBtn')

const nextpage=document.getElementById('nextpage')
nextpage.setAttribute('href','/'+roomName+'/arena?id='+idd)
/*const image = new Image();
image.src='IMG_1899.PNG'*/
const explain=["-Left: A key","-Right: D key","-Jump: W key","-Left beam: L key","-Reft beam: J key","-Punch: I key"]
const whojoin=[]

var url = new URL(window.location.href);
// URLSearchParamsオブジェクトを取得
var params = url.searchParams;
params.delete('id');
copyTarget.setAttribute('value',url)//idも含まれてしまう string a=location.href 以降削除 部屋番号20桁

//console.log("back:", again)
if(again==0){//戻ってきた
    console.log("fuuuuuuuuuuck")
    choose.style.display="none"
    itom.style.display="block"
    item2.style.display="block"
  //  canvas.style.display="inline"
    usernametag.textContent=kiminonawa
    photo.setAttribute('src',pics[kind])
    place=kind
    //kojinid=idd
}

//これだと戻ってきたらキャラクタが
socket.emit('preonline',{/*nam:playername, taipu:place, *//*socketid:socket.id, */heya:roomName,id:idd})

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      console.log('this is NOT the first time loading this page',roomName, idd, socket.id);
      //preplayerがなくなっているから生成するsocket emit
     // socket.emit('preonline',{heya:roomName, id:idd})
      this.window.location.reload()
      console.log('reload done')
    } else {
      console.log('this is the first time loading this page');
    }
  });

messageform.addEventListener('submit', e=>{
    e.preventDefault()
    const message=txtbox.value
    if(message){
    socket.emit('send-message', {room:roomName, who:playername, /*type:place,*/ message:message,id:idd})
}
    txtbox.value=''
})

socket.on('get-message',val=>{
  messageappend(val.who, val.content, val.id)
  scrolll()
})

socket.on('chat-content',val=>{
    for(let a=0; a<val.length; a++){
        messageappend(val[a][0], val[a][1], val[a][2])
    }
})

socket.on('current-situation',(situation)=>{
    //memeber　のリストが送られてくる
    //situation.lobby situation.entrances situation.rooms
    const nagas=messagelist.children.length
    for(let i=0; i<nagas; i++){
         messagelist.removeChild(messagelist.children[0])
     }
  // let daimei=document.createElement('li')
 /*  daimei.textContent="Members in this room now"
   daimei.classList.add("under")
   messagelist.appendChild(daimei)*/
   // let gazo=document.createElement('img')
    Object.values(situation.lobby).forEach(person=>{ //arenaにいって戻るとエラーが起こる
        if(person.name){
        console.log("id:",idd,"person:", person.id)
        let list=document.createElement('li')
      //  list.textContent=person.name
        list.innerHTML=photodeliver(person.type)+person.name
       if(idd&&person.id==idd){
        list.innerHTML+='(You)'
        list.classList.add('orangena')
        }
      //  gazo.setAttribute('src',pics[person.type])
      //  list.appendChild(gazo)
        messagelist.appendChild(list)
        }
    })
    if(situation.entrances){
    Object.values(situation.entrances).forEach(person=>{//名前の右横に緑の四角
        let list=document.createElement('li')
       // list.textContent=person.playername
       list.innerHTML=photodeliver(person.type)+person.playername+theMark(0)
       // gazo.setAttribute('src',pics[person.type])
       // list.appendChild(gazo)
        messagelist.appendChild(list)
    })
    }
    if( situation.rooms){
    Object.values(situation.rooms).forEach(person=>{//名前の右横に赤の四角
        let list=document.createElement('li')
       // list.textContent=person.playername
       list.innerHTML=photodeliver(person.type)+person.playername+theMark(1)
        //gazo.setAttribute('src',pics[person.type])
        //list.appendChild(gazo)
        messagelist.appendChild(list)
    })
    }
    nankai++
    console.log(" current situation: lobby ", nankai,situation.lobby)
    console.log(" current situation: entrances ", nankai,situation.entrances)
    console.log(" current situation: rooms", nankai,situation.rooms)
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

socket.on('idRegister',val=>{
    idd=val
    nextpage.setAttribute('href', encodeURI('/'+roomName+'/arena?id='+val) )
})

socket.on('hey',val=>{
   
    let item=document.createElement('li')
    if(val.id==socket.id){
        item.classList.add('mark')
        item.textContent="You: "+val.content
    }else{
        item.textContent=val.who+": "+val.content
    }
    messagelist.appendChild(item)
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

function change(which){
  //0 left 10 right
  console.log("now place:", place)
  if(which==0){
    place--
  }else{
    place++
  }
  //place+=which
  console.log("place:dah",place)
  place=mod(place, pics.length)
  console.log("now place:ver", place, pics.length)
  //console.log("place :",place) 
  pic.setAttribute('src',pics[place])
  console.log("src:",pics[place])


}

//正の余りをかえす
function mod(i, j) {
    return (i % j) < 0 ? (i % j) + 0 + (j < 0 ? -j : j) : (i % j + 0);
}

function next(){//name
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

    chara.style.display="block"
}

function startg(){//character
   

    title.textContent="Choose your character"
    
    socket.emit('decided',place)

    photo.setAttribute('src',pics[place])
    
  //  nextpage.setAttribute('href', encodeURI('/'+roomName+'/arena?name='+playername+'&type='+place) )
    //console.log("id:", idd)
   // nextpage.setAttribute('href', encodeURI('/'+roomName+'/arena?id='+idd) )
   // let choose=document.getElementById("choose")

    choose.style.display="none"

    itom.style.display="block"
    item2.style.display="block"

    //canvas.style.display="inline"

    socket.emit('settings',{nam:playername, taipu:place, socketid:socket.id, heya:roomName})


}

function changeaa(){
    itom.style.display="none"
   // canvas.style.display="none"
  //  let choose=document.getElementById("choose")
    item2.style.display="none"
    choose.style.display="block"//"inlineだとだめ chooseのなかにもさらに要素があるから、block"
    chooseName.style.display="none"
 /* let namae=document.getElementById("chooseName")
    
    namae.style.display= "none"*/
    //ここで
    pic.setAttribute('src',pics[place])
    let chara=document.getElementById("displayBox")
    chara.style.display="block"
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

function messageappend(who, content, idy){
    const messageelement=document.createElement('li')
    if(idy==idd){
        messageelement.innerHTML='You: '+content  
        messageelement.classList.add('orangena')
    }else{
        messageelement.innerHTML=who+': '+content  
    }
    messageelement.classList.add('listright')
    chatting.appendChild(messageelement)
}

function scrolll(){
    chatting.scrollTop = chatting.scrollHeight;
}
