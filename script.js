// npm install jsdom
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// npm install xmlhttprequest
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var xhr = new XMLHttpRequest();

var newsUrls = [
	'http://www.straitstimes.com/world/united-states/las-vegas-shooting-still-no-clear-motive-say-police',
	'https://uk.news.yahoo.com/las-vegas-strip-shooting-multiple-061006202.html'
];
var url = newsUrls[1];

function init() { // Code starts here
	step1();
}

function step1() {
	getHTML(url, step2);
}

function step2(html) {
	var dom = new JSDOM(html, { scripts: '', resources: 'usable' });
	dom.window.addEventListener('load', function() { step3(dom); });
}

function step3(dom) {
	var window = dom.window;
	var document = dom.window.document;

	console.log('=================== Title ===================');
	console.log(getArticleTitle(dom));
	console.log('=================== Article ===================');
	console.log(getArticleText(dom));
}


// =================== Helper Functions =================== 

function getHTML(url, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.send(null);
	request.onreadystatechange = function() {
		if (request.readyState == 4)
			callback(request.responseText);
	};
}

function getArticleTitle(dom) {
	var window = dom.window;
	var document = window.document;

	var elements = document.getElementsByTagName('h1');

	var bestSize = -1;
	var bestTitle = undefined;
	for (var i = 0; i < elements.length; i++) {
		var fontSize = getFontSizeInPx(window.getComputedStyle(elements[i]).getPropertyValue('font-size'));
		if (fontSize > bestSize) {
			bestSize = fontSize;
			bestTitle = elements[i].textContent;
		}
	}
	return bestTitle;
}

function getArticleTextAsParagraphs(dom) {
	var window = dom.window;
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
		paragraphs.push(elements[i].textContent);
	}
	return paragraphs;
}

function getArticleText(window) {
	return getArticleTextAsParagraphs(window).join('\n');
}

function getFontSizeInPx(rawFontSize) {
	var indexOfScale;
	for (indexOfScale = 0; indexOfScale < rawFontSize.length; indexOfScale++) {
		var charCode = rawFontSize.charCodeAt(indexOfScale);
		if (	charCode == 32 || // space
				charCode == 46 || // period
				(charCode >= 48 && charCode <= 57) // number
			) {
			// continue
		} else {
			break;
		}
	}
	
	var rawSize = parseFloat(rawFontSize.substr(0, indexOfScale));
	var sizeType = rawFontSize.substr(indexOfScale, rawFontSize.length).toLowerCase();
	if (sizeType == '' || sizeType.toLowerCase() == 'px') {
		return rawSize;
	} else {
		return rawSize * 24; // assume 24px browser display for em and rem
	}
}

// =================== Begin Runtime =================== 

init();