// validation for the registration page


let password = document.getElementById('pass');
let passwordCon = document.getElementById('conpass');
let message = document.getElementById('msg');
let chat = document.querySelector('.chatbox');
let send = document.querySelector('#send');



;(()=>{
	chat.maxScrollTop = chat.scrollHeight - chat.offsetHeight;

	send.addEventListener('click',()=>{
		if(chat.maxScrollTop-chat.scrollTop <= chat.offsetHeight){
			chat.scrollTop = chat.scrollHeight;
		}else{
			console.log('uh oh')
		}
	},false)
})();








const confirm = ()=>{
	if (password.value !== passwordCon.value){


	
		
		message.innerHTML =`<div id="error">Not matching</div>`;
		
	}else{

		
		
		message.innerHTML =`<div id="confam">Match!</div>`;
	}
}

passwordCon.addEventListener("input",confirm);
