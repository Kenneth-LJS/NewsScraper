const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

const cheerio = require('cheerio')
const $ = cheerio.load('<h2 class="title">Hello world</h2>')

var url = 'http://www.straitstimes.com/world/united-states/las-vegas-shooting-still-no-clear-motive-say-police';

function step1() {
	//getHTML(url, step2);
	JSDOM.fromURL(url).then(step2);
}

function step2(dom) {
	var window = dom.window;
	console.log(window.document);
	console.log(getArticleTitle(window));
}

function getHTML(url, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.send(null);
	request.onreadystatechange = function() {
		if (request.readyState == 4)
			callback(request.responseText);
	};
}

function getArticleTitle(window) {
	var document = window.document;

	var elements = document.getElementsByTagName('h1');

	var bestSize = -1;
	var bestTitle = undefined;
	for (var i = 0; i < elements.length; i++) {
		var fontSize = parseFloat(window.getComputedStyle(elements[i]).getPropertyValue('font-size'));
		if (fontSize > bestSize) {
			bestSize = fontSize;
			bestTitle = elements[i].innerText;
		}
	}
	return bestTitle;
}

function getArticleTextAsParagraphs(window) {
	var document = window.document;

	var elements = document.getElementsByTagName('p');
	var parents = [];
	for (var i = 0; i < elements.length; i++) {
		parents.push(elements[i].parentElement);
	}
	var bestCount = -1;
	var bestItem = parents[0];

	while (parents.length > 0) {
		var curItem = parents[0];
		var oldLen = parents.length;
		parents = parents.filter(x => x != curItem);
		var newLen = parents.length;
		var count = oldLen - newLen;
		if (count > bestCount) {
			bestCount = count;
			bestItem = curItem;
		}
	}

	var newsArticleElement = bestItem;
	elements = newsArticleElement.getElementsByTagName('p');
	var paragraphs = [];
	for (var i = 0; i < elements.length; i++) {
		if (elements[i].parentElement != newsArticleElement) {
			continue;
		}
		paragraphs.push(elements[i].innerText);
	}
	return paragraphs;
}

function getArticleText(window) {
	return getArticleTextAsParagraphs(window).join('\n');
}

step1();
//console.log('================ Title ================\n' + getArticleTitle() + '\n\n================ Text ================\n' + getArticleText());