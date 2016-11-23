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
			
			var factory = new ClickProcessorFactory();
			var dictionaryProcessor = factory.getDictionaryProcessor();
			var irrVerbsProcessor =factory.getIrrVerbsProcessor();

			var url = event.currentTarget.dataset.url;
			$.ajax({
				url:url,
				dataType: 'html',
				success: function(html){
					$('.contentContainer').html(html);
					initialize(dictionaryProcessor,irrVerbsProcessor);
				}
			});
		});
	});	
	
	var modalPronounce= document.querySelector('#modalPronounceIcon');
	modalPronounce.addEventListener('click', function(event) {
		event.stopPropagation();
		var pronounceValue=document.querySelector('#modalPronounceValue').innerHTML;
		responsiveVoice.speak(pronounceValue);
	});
	var resultPronounce= document.querySelector('#resultIcon');
	resultPronounce.addEventListener('click', function(event) {
		event.stopPropagation();
		var pronounceValue=document.querySelector('#resultValue').innerHTML;
		responsiveVoice.speak(pronounceValue);
	});
	
	menuLinks[0].click();
});
function initialize(dictionaryProcessor,irrVerbsProcessor)
{
	var cells=document.querySelectorAll('.pronounce');
	Array.from(cells).forEach(cell => {
		cell.addEventListener('click', function(event) {
			event.stopPropagation()
			responsiveVoice.speak(cell.innerText);
	
		});
	});
	
	initializeTable(dictionaryProcessor,irrVerbsProcessor);
	initializeGroup(dictionaryProcessor,irrVerbsProcessor);
};

function initializeTable(dictionaryProcessor,irrVerbsProcessor){
	var tables=document.querySelectorAll('table');
	Array.from(tables).forEach(table => {
		table.addEventListener('click', function(event) {
			if(event.currentTarget.classList.contains("word"))
				return;
			event.preventDefault();
			var columnNumber = table.querySelector('tr').querySelectorAll('th').length;
			switch (columnNumber) {
			  case 2:
				dictionaryProcessor.tableClick(event.currentTarget);
				break;
			  case 4:
				irrVerbsProcessor.tableClick(event.currentTarget);
				break;
			  default:
				alert( 'Неверное число столбцов!' );
				}
		});
	});	
}
function initializeGroup(dictionaryProcessor,irrVerbsProcessor){
	var groupTitles=document.querySelectorAll('.groupTitle');
	Array.from(groupTitles).forEach(group => {
		group.onmouseover =function(event)
		{
			event.preventDefault();
			event.currentTarget.parentNode.style.backgroundColor="rgba(192, 205, 221, 0.33)";
		}
		
		group.onmouseout =function(event)
		{
			event.preventDefault();
			event.currentTarget.parentNode.style.backgroundColor="";
		}
			
		group.addEventListener('click', function(event) {
			event.preventDefault();
			var columnNumber = group.parentNode.querySelector('table').querySelector('tr').querySelectorAll('th').length;
			switch (columnNumber) {
			  case 2:
				dictionaryProcessor.groupClick(event.currentTarget.parentNode);
				break;
			  case 4:
				irrVerbsProcessor.groupClick(event.currentTarget.parentNode);
				break;
			  default:
				alert( 'Неверное число столбцов!' );
			}
		});
	});	
}
function ClickProcessorFactory()
{
	prototypeProcessor = new ClickProcessor();
	DictionaryProcessor.prototype=prototypeProcessor;
	IrrVerbsProcessor.prototype=prototypeProcessor;
	
	this.getDictionaryProcessor=function(){
		return new DictionaryProcessor();
	}
	
	this.getIrrVerbsProcessor=function(){
		return new IrrVerbsProcessor();
	}
};
 
function ClickProcessor()
{
	this.getDataFormRow = function(row)	
	{
		var cells =row.querySelectorAll('td');
		var rowData=[];
		for(var i=0;i<cells.length;i++)
		{
			rowData.push(cells[i].innerText.replace(/\n/g,", "));
		}
		return rowData;
	};
	
	this.initializeQuizModal=function(quiz,modalId){
		document.getElementById(modalId).onkeypress = function(e)
		{
			if (!e) e = window.event;
			var keyCode = e.keyCode || e.which;
			if (keyCode == '13'){
			quiz.Check();}
		}
	}
} 

function DictionaryProcessor()
{
	var quiz= new DictQuiz('DicQuizModal','ResultModal');
	this.initializeQuizModal(quiz,"DicQuizModal");
	var wordsFrom=document.getElementById('wordsFrom');	
			
	this.tableClick = function (table){
		wordsFrom.innerText="Слова из выбранной таблицы";	
		var words=this.getDataFromTable(table)
		quiz.SetWords(words);
		quiz.Show();
	}
	
	this.groupClick=function(group){
		wordsFrom.innerText=group.querySelector(".groupTitle").innerText
		var words=this.getGroupData(group);
		quiz.SetWodrs(words);
		quiz.Show();
	}
	
	this.getDataFromTable=function(table){
		var tableBody=table.querySelector('tbody');
		var rows=tableBody.querySelectorAll('tr');
		var words=[];
		for(i=0;i<rows.length;i++)
		{
			var data = this.getDataFormRow(rows[i]);
			var word = new Word(data[0],data[1]);
			words.push(word)
		}
		return words;		
	};
	
	this.getGroupData=function(group){
		var words=[];
		var tables=group.querySelectorAll('table');
		for(j=0;j<tables.length;j++)
		{
			var tableBody=tables[j].querySelector('tbody');
			var rows=tableBody.querySelectorAll('tr');
			for(i=0;i<rows.length;i++)
			{
				var data = this.getDataFormRow(rows[i]);
				var word = new Word(data[0],data[1]);
				words.push(word)
			}
		}
		return words;
	};
	
}
function IrrVerbsProcessor()
{
	var quiz= new VerbQuiz('QuizModal','ResultModal');
	this.initializeQuizModal(quiz,"QuizModal");	
	var verbsFrom=document.getElementById('verbsFrom');	

	this.tableClick = function (table){
		verbsFrom.innerText="Глаголы из выбранной таблицы";
		var verbs=this.getDataFromTable(table)
		quiz.SetVerbsList(verbs);
		quiz.Show();
	}
	
	this.groupClick=function(group){
		verbsFrom.innerText=group.querySelector(".groupTitle").innerText
		var verbs=this.getGroupData(group);
		quiz.SetVerbsList(verbs);
		quiz.Show();
	}
	
	this.getDataFromTable=function(table){
		var tableBody=table.querySelector('tbody');
		var rows=tableBody.querySelectorAll('tr');
		var verbs=[];
		for(i=0;i<rows.length;i++)
		{
			var data = this.getDataFormRow(rows[i]);
			var verb=new IrrVerb(data[0],data[1],data[2],data[3]);
			verbs.push(verb)
		}
		return verbs;		
	};
	
	this.getGroupData=function(group){
		var verbs=[];
		var tables=group.querySelectorAll('table');
		for(j=0;j<tables.length;j++)
		{
			var tableBody=tables[j].querySelector('tbody');
			var rows=tableBody.querySelectorAll('tr');
			for(i=0;i<rows.length;i++)
			{
				var data = this.getDataFormRow(rows[i]);
				var verb=new IrrVerb(data[0],data[1],data[2],data[3]);
				verbs.push(verb)
			}
		}
		return verbs;
	};	
}

function IrrVerb(Infinitive,PastTense,PastParticiple,Translation)
{
	this.Infinitive=Infinitive;
	this.PastTense=PastTense;
	this.PastParticiple=PastParticiple;
	this.Translation=Translation;
}

function Word(Original,Translation)
{
	this.Original=Original;
	this.Translation=Translation;
}

function VerbQuiz(ModalQuizId, ModalResultId)
{
	var verbsList=[];
	var verbs =[];
	
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
	
	var verbDone=modal.querySelector("#verbDone");
	var verbAll=modal.querySelector("#verbAll");
	
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
		verbDone.innerHTML = verbsList.length - verbs.length;		
	}
	
	function clear()
	{
		translationField.value="";
		infinitiveField.value="";
		pastTenseField.value="";
		pastParticipleField.value="";
	}
	
	this.SetVerbsList= function(VerbsList)
	{
		verbsList=VerbsList;
		verbs =Array.prototype.slice.call(verbsList)		
	}
	
	this.Show=function()
	{	
		clear();
		verbAll.innerHTML = verbsList.length;		
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
		if((verbs[currentVerbNumber].Infinitive.trim()==infinitiveField.value.trim())&&
		   (verbs[currentVerbNumber].PastTense.trim()==pastTenseField.value.trim())&&
		   (verbs[currentVerbNumber].PastParticiple.trim()==pastParticipleField.value.trim()))
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

function DictQuiz(ModalQuizId, ModalResultId)
{
	var wordsList=[]
	var words =[];
	
	var modal=document.getElementById(ModalQuizId);
	var translationField=modal.querySelector('#translation');
	var originalField=modal.querySelector('#original');
	var visualiseResult=modal.querySelector('#resultValue');
	var resultSpeaker = modal.querySelector('.resultVisualisation .modal-pronounce-icon');
	var pronounceValue=modal.querySelector('#modalPronounceValue');
	var wordDone=modal.querySelector("#wordDone");
	var wordAll=modal.querySelector("#wordAll");
	
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
		currentVerbNumber=random(words.length-1);
		translationField.value=words[currentVerbNumber].Translation.replace(/<br>/g, ", " );
		pronounceValue.innerHTML=words[currentVerbNumber].Original;
		wordDone.innerHTML = wordsList.length - words.length;
	}
	
	function clear()
	{
		translationField.value="";
		originalField.value="";
	}
	
	this.SetWords=function(WordsList)
	{
		wordsList=WordsList;
		words =Array.prototype.slice.call(wordsList)		
	}
	
	this.Show=function()
	{	
		clear();
		wordAll.innerHTML = wordsList.length;
		if(words.length>0)
		{
			update();
			visualiseResult.innerText="";
			resultSpeaker.style.display = 'none';
			$('#'+ModalQuizId).on('shown.bs.modal', function () {
				original.focus();});
			$('#'+ModalQuizId).modal('show');
		}
	}
	
	this.Check=function()
	{
		if((words[currentVerbNumber].Original.trim()==original.value.trim()))
		{
			correct++;
			words.splice(currentVerbNumber,1);
			visualiseResult.style.color='green';
			visualiseResult.innerText="Верно!"
			resultSpeaker.style.display = 'none';
		}
		else
		{
			error++;
			visualiseResult.style.color='red';
			if($('#showAnswerDict').prop('checked'))
			{
				visualiseResult.innerText= words[currentVerbNumber].Original;
				resultSpeaker.style.display = 'inline-block';
			}
			else
				visualiseResult.innerText="Неверно!"
		}
		clear();
		originalField.focus();
		if(words.length>0)
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