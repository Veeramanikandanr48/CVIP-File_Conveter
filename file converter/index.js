window.jsPDF = window.jspdf.jsPDF;

// Convert pdf to text button
const pdfToTxtBtn = document.querySelector('#pdf_txt');
// Convert text to pdf button
const txtToPdfBtn = document.querySelector('#txt_pdf');
const arrowIcon = document.querySelector('.arrow');
const dropArea = document.querySelector('.drop_area');
const browseBtn = document.getElementById('browseBtn');
const inputFile = dropArea.querySelector('input');
let pdfToText = true; // Change this to false if converting text to pdf, true for pdf to text
let a = document.createElement('a');
let outputFileName = "";
let doc = null;

inputFile.addEventListener('change', async () => {
	const file = inputFile.files[0];
	await openFile(file);
});

browseBtn.addEventListener('click', () => {
	inputFile.click();
});

pdfToTxtBtn.addEventListener('click', () => {
	arrowIcon.classList.remove('opposite');
	pdfToText = true;
});

txtToPdfBtn.addEventListener('click', () => {
	arrowIcon.classList.add('opposite');
	pdfToText = false;
});

dropArea.addEventListener("dragover", event => {
	event.preventDefault();
	dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
	dropArea.classList.remove("dragover");
});

document.addEventListener("drop", async event => {
	event.preventDefault();
	const file = event.dataTransfer.files[0];
	await openFile(file);
});

document.getElementById('downloadButton').addEventListener('click', event => {
	if (pdfToText) {
		a.download = outputFileName;
		a.click();
	} else {
		doc.save(outputFileName);
	}
});

async function openFile(file) {
	dropArea.classList.remove("dragover");
	if (pdfToText) {
		saveToTextFile(file, file.type);
	} else {
		saveToPdfFile(file, file.type);
	}
}

function saveToPdfFile(inputFile, contentType) {
	if (contentType != 'text/plain') {
		alert('Expected a txt file');
		return;
	}
	doc = new jsPDF();
	const fileName = inputFile.name.split('.')[0] + '.pdf';
	const reader = new FileReader();

	outputFileName = fileName;
	document.getElementById('fileName').innerHTML = fileName;
	reader.readAsText(inputFile);
	reader.onload = () => {
		let result = doc.splitTextToSize(reader.result, 180);
		let pageHeight = doc.internal.pageSize.height;
		let y = 15;
		result.forEach(item => {
			if (y + 10 > pageHeight) {
				y = 15;
				doc.addPage();
			}
			doc.text(item, 10, y);
			y += 7;
		});
	}
	document.querySelector('.Download').style.display = 'block';
}

function saveToTextFile(inputFile, contentType) {
	if (contentType != 'application/pdf') {
		alert('Expected a pdf file');
		return;
	}
	const fileName = inputFile.name.split('.')[0] + '.txt';
	outputFileName = fileName;
	document.getElementById('fileName').innerHTML = fileName;
	const reader = new FileReader();
	reader.readAsDataURL(inputFile);
	reader.onload = async () => {
		const content = await pdfjsLib.getDocument(reader.result).promise;
		const textContent = await getPDFText(content);
		const file = new Blob([textContent], { type: 'text/plain' });
		a.href = URL.createObjectURL(file);
	}
	document.querySelector('.Download').style.display = 'block';
}

async function getPDFText(pdfContent) {
	let resultText = "";
	let page = null;
	let temp = "";
	const totalPageNum = pdfContent._pdfInfo.numPages;
	for (let i = 1; i <= totalPageNum; i++) {
		page = await pdfContent.getPage(i);
		temp = await page.getTextContent();
		temp.items.map((item) => {
			resultText += item.str;
		});
	}
	return resultText;
}
