
const mojis="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const ringName=document.getElementById('ring')
const butto=document.getElementById('but')
const lik=document.getElementById('linkk')
const desc=document.getElementById('desc')

function startbutton(){
    //30桁の英数字のランダム文字列を作る
    
    randomLetters=""

    for(let i=0; i<20; i++){
        var x = Math.floor(Math.random() * mojis.length);//0~mojis.length-1までの整数
        randomLetters+=mojis.charAt(x)
    }
    //add this room to rooms
    //localhost:3000/randomLetters
    desc.textContent="Tout d'abord, envoyez le lien ci-dessous à vos amis:"//Tout d'abord, envoyez le lien ci-dessous à vos amis
    lik.textContent="And then, click here to enter the new room"
    lik.href="/"+encodeURIComponent(randomLetters)
    butto.textContent="ReCreate a new room"
    ringName.textContent="localhost:3000/"+randomLetters//+を使うのは良くない
    //return "localhost:3000/"+randomLetters
}

//console.log(startbutton())