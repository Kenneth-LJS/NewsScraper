// npm install jsdom
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// npm install xmlhttprequest
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var xhr = new XMLHttpRequest();

var newsUrls = [
	'http://www.straitstimes.com/world/united-states/las-vegas-shooting-still-no-clear-motive-say-police',
	'https://uk.news.yahoo.com/las-vegas-strip-shooting-multiple-061006202.html',
	'http://prntly.com/2017/08/18/neo-japanese-imperialists-%E5%A4%A7%E6%97%A5%E6%9C%AC%E5%B8%9D%E5%9C%8B-vow-to-take-part-in-next-u-s-nazi-rally-along-side-allies/'
];
var url = newsUrls[newsUrls.length - 1];

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

	// find <h1> element with the biggest font size
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
	elements = Array.prototype.slice.call(elements);

	var bestCount = -1;
	var bestItem = elements[0];

	while (elements.length > 0) {
		var curItem = elements[0];
		var oldLen = elements.length;
		elements = elements.filter(x => x.parentElement != curItem.parentElement);
		var newLen = elements.length;
		var count = oldLen - newLen;
		if (count > bestCount) {
			bestCount = count;
			bestItem = curItem;
		}
	}

	var articleStyle = window.getComputedStyle(bestItem);
	var articleFontSize = articleStyle.getPropertyValue('font-size');
	var articleFontFamily = articleStyle.getPropertyValue('font-family');

	elements = document.getElementsByTagName('p');
	elements = Array.prototype.slice.call(elements);


	var paragraphs = [];
	for (var i = 0; i < elements.length; i++) {
		// either the element before or the element after share the same parent
		var hasNeighbours = (i > 0 && elements[i - 1].parentElement == elements[i].parentElement) ||
							(i < elements.length - 1 && elements[i].parentElement == elements[i + 1].parentElement);
		if (!hasNeighbours) {
			continue;
		}
		var curStyle = window.getComputedStyle(elements[i]);
		if (curStyle.getPropertyValue('font-size') != articleFontSize ||
			curStyle.getPropertyValue('font-family') != articleFontFamily ||
			elements[i].textContent.trim().length == 0) {
			continue;
		}
		paragraphs.push(elements[i].textContent.trim());
	}
	return paragraphs;
}

function getArticleText(dom) {
	var paragraphs = getArticleTextAsParagraphs(dom);
	if (paragraphs.length == 0) {
		return '';
	}
	return '[' + paragraphs.join(']\n[') + ']';
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