var quiz;
$(document).ready(function(){
	
	var height = document.querySelector(".main-menu").clientHeight;
	document.querySelector(".main-menu").style.top="-"+height+"px";
	document.querySelector(".main-menu").addEventListener("mouseenter", function(event){
		event.currentTarget.style.top="0px"
	});
	
	document.querySelector(".main-menu").addEventListener("mouseleave", function(event){
		var height = event.currentTarget.clientHeight;
		event.currentTarget.style.top="-"+height+"px";
	})	
	
	var menuLinks = document.querySelectorAll(".menu-link");
	Array.from(menuLinks).forEach(link => {
		link.addEventListener('click', function(event) {
			event.preventDefault();
			var url = event.currentTarget.dataset.url;
			$.ajax({
				url:url,
				dataType: 'html',
				success: function(html){
					$('.contentContainer').html(html);
					initializeTable();
				}
			});
		});
	});	
	menuLinks[0].click();
});
function initializeTable()
{
	var tables=document.querySelectorAll('table');
	for(i=0;i<tables.length;i++)
	{
		tables[i].onclick=function(event)
		{
			var verbFrom=document.getElementById('verbsFrom');
			verbFrom.innerText="Глаголы из выбранной таблицы";
			TableClick(event.currentTarget)
		}
	}

	var groupTitles=document.querySelectorAll('.groupTitle');
	for(i=0;i<groupTitles.length;i++)
	{
		groupTitles[i].onmouseover =function(event)
		{
			event.currentTarget.parentNode.style.backgroundColor="rgba(192, 205, 221, 0.33)";
		}
		
		groupTitles[i].onmouseout =function(event)
		{
			event.currentTarget.parentNode.style.backgroundColor="";
		}
		
		groupTitles[i].onclick=function(event)
		{
			var verbFrom=document.getElementById('verbsFrom');
			verbFrom.innerText=event.currentTarget.innerText;
			GroupClick(event.currentTarget.parentNode)
		}
	}

	document.getElementById('QuizModal').onkeypress = function(e)
	{
		if (!e) e = window.event;
		var keyCode = e.keyCode || e.which;
		if (keyCode == '13'){
		quiz.Check();}
	}
	
};
  
function GroupClick(Group)
{
	var verbs=[];
	var tables=Group.querySelectorAll('table');
	for(j=0;j<tables.length;j++)
	{
		var tableBody=tables[j].querySelector('tbody');
		var rows=tableBody.querySelectorAll('tr');
		for(i=0;i<rows.length;i++)
		{
			var currentColumn =rows[i].querySelectorAll('td');
			var verb=new IrrVerb(currentColumn[0].innerHTML,currentColumn[1].innerHTML,currentColumn[2].innerHTML,currentColumn[3].innerHTML);
			verbs.push(verb)
		}
	}
	quiz= new VerbQuiz(verbs,'QuizModal','ResultModal');
	quiz.Show();
} 

function TableClick(Table){
	var tableBody=Table.querySelector('tbody');
	var rows=tableBody.querySelectorAll('tr');
	var verbs=[];
	for(i=0;i<rows.length;i++)
	{
		var currentColumn =rows[i].querySelectorAll('td');
		var verb=new IrrVerb(currentColumn[0].innerHTML,currentColumn[1].innerHTML,currentColumn[2].innerHTML,currentColumn[3].innerHTML);
		verbs.push(verb)
	}
	quiz= new VerbQuiz(verbs,'QuizModal','ResultModal');
	quiz.Show();
}

function IrrVerb(Infinitive,PastTense,PastParticiple,Translation)
{
	this.Infinitive=Infinitive;
	this.PastTense=PastTense;
	this.PastParticiple=PastParticiple;
	this.Translation=Translation;
}

function VerbQuiz(VerbsList,ModalQuizId, ModalResultId)
{
	var verbs =Array.prototype.slice.call(VerbsList)
	
	var modal=document.getElementById(ModalQuizId);
	var translationField=modal.querySelector('#translation');
	var infinitiveField=modal.querySelector('#infinitive');
	var pastTenseField=modal.querySelector('#pastTense');
	var pastParticipleField=modal.querySelector('#pastParticiple');
	var visualiseResult=modal.querySelector('#resultVisualisation');
	
	var modalResult=document.getElementById(ModalResultId);
	var resultRight=modalResult.querySelector('#right');
	var resultWrong=modalResult.querySelector('#wrong');
	var resultPercent=modalResult.querySelector('#percent');
	
	var currentVerbNumber;
	var correct=0;
	var error=0;
	
	function random(maxValue)
	{
		var rand = Math.random() * (maxValue)
		rand = Math.round(rand);
		return rand;
	}
	
	function update()
	{
		currentVerbNumber=random(verbs.length-1);
		translationField.value=verbs[currentVerbNumber].Translation;
	}
	
	function clear()
	{
		translationField.value="";
		infinitiveField.value="";
		pastTenseField.value="";
		pastParticipleField.value="";
	}
	
	this.Show=function()
	{	
		if(verbs.length>0)
		{
			update();
			visualiseResult.innerText="";
			$('#'+ModalQuizId).on('shown.bs.modal', function () {
				infinitiveField.focus();});
			$('#'+ModalQuizId).modal('show');
		}
	}
	
	this.Check=function()
	{
		if((verbs[currentVerbNumber].Infinitive==infinitiveField.value)&&(verbs[currentVerbNumber].PastTense==pastTenseField.value)&&(verbs[currentVerbNumber].PastParticiple==pastParticipleField.value))
		{
			correct++;
			verbs.splice(currentVerbNumber,1);
			visualiseResult.style.color='green';
			visualiseResult.innerText="Верно!"
			
		}
		else
		{
			error++;
			visualiseResult.style.color='red';
			if($('#showAnswer').prop('checked'))
				visualiseResult.innerText= verbs[currentVerbNumber].Infinitive+" "+
										   verbs[currentVerbNumber].PastTense+" "+
										   verbs[currentVerbNumber].PastParticiple;
			else
				visualiseResult.innerText="Неверно!"
		}
		clear();
		infinitiveField.focus();
		if(verbs.length>0)
		{
			update();
		}
		else
		{
			resultRight.innerText="Верно: "+correct;
			resultWrong.innerText="Неверно: "+error;
			resultPercent.innerText=Math.round((correct/(correct+error))*100)+"%";
			$('#'+ModalQuizId).modal('hide');
			setTimeout(function(){$('#'+ModalResultId).modal('show');},400)
			
		}
	}
}

