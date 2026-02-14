// voice_ptt_module.js

let accessToken = null;
let userShortcut = null;
let isRecording = false;
let mediaRecorder, chunks = [];
let sequence = 0, results = {}, lastRendered = -1;
let output = null;

function handleKeyDown(e) {
	if (matchesShortcut(e)) {
		e.preventDefault()
		if (!isRecording) {
			startRecording();
			isRecording = true;
		}
	}
}

function isKeyPartOfShortcut(e) {
	if (!userShortcut) return false;

	// Check the physical key code (e.g., 'Space')
	if (e.code === userShortcut.code) return true;

	// Check modifiers by key name on release
	const key = e.key;
	if (key === 'Control' && userShortcut.ctrl) return true;
	if (key === 'Alt' && userShortcut.alt) return true;
	if (key === 'Shift' && userShortcut.shift) return true;
	if (['Meta', 'OS', 'Command'].includes(key) && userShortcut.meta) return true;

	return false;
}

function handleKeyUp(e) {
	if (isRecording && isKeyPartOfShortcut(e)) {
		stopRecording();
		isRecording = false;
		e.preventDefault();
	}
}

function parseShortcutString(str) {
	const parts = str.split('+');
	return {
		ctrl: parts.includes('Ctrl'),
		shift: parts.includes('Shift'),
		alt: parts.includes('Alt'),
		meta: parts.includes('Meta') || parts.includes('Cmd') || parts.includes('Command'),
		code: parts.find(p =>
			['Space', 'Enter', 'Tab'].includes(p) || p.length === 1 || p.startsWith('Key')
		) || ''
	};
}

function matchesShortcut(e) {
	return userShortcut &&
		e.ctrlKey === !!userShortcut.ctrl &&
		e.shiftKey === !!userShortcut.shift &&
		e.altKey === !!userShortcut.alt &&
		e.metaKey === !!userShortcut.meta &&
		e.code === userShortcut.code;
}

function startRecording() {

	navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
		let mediaStream = stream;
		const mimeType = MediaRecorder.isTypeSupported('audio/mp3') ? 'audio/mp3' : 'audio/webm';
		mediaRecorder = new MediaRecorder(stream, { mimeType });
		chunks = [];
		mediaRecorder.ondataavailable = e => chunks.push(e.data);
		mediaRecorder.onstop = () => {
			const audioBlob = new Blob(chunks, { type: mimeType });
			handleAudioBlob(audioBlob);
			if (mediaStream) {
				mediaStream.getTracks().forEach(track => track.stop()); // <--- stop all tracks
				mediaStream = null;
			}
		};
		setMicButtonState('recording');
		mediaRecorder.start();
	});
}

function stopRecording() {
	if (mediaRecorder && mediaRecorder.state !== 'inactive') {
		mediaRecorder.stop();
		setMicButtonState('processing');
	}
}

function handleAudioBlob(audioBlob) {
	const seq = sequence++;

	// Download recorded audio for debugging
	// const a = document.createElement('a');
	// a.href = URL.createObjectURL(audioBlob);
	// a.download = 'recording.mp3';
	// a.click();

	remoteVoice2Text(audioBlob, accessToken).then(text => {
		results[seq] = text;
		tryRenderResults();
	});
}

function tryRenderResults() {
	while (results.hasOwnProperty(lastRendered + 1)) {
		lastRendered++;
		appendTextToOutput(results[lastRendered]);
	}
	const micSvg = document.querySelector('button[aria-label="Dictate button"] svg');
	const isProcessing = micSvg && micSvg.classList.contains('gpt-mic-processing');
	if (isProcessing && Object.keys(results).length === sequence) {
		setMicButtonState(null); // all finished, and was in processing
	}
}

function appendTextToOutput(text) {
	const success = document.execCommand('insertText', false, text);
	if (!success) {
		if (confirm("Insert failed.\nDo you want to copy the text to the clipboard instead?")) {
			navigator.clipboard.writeText(text);
		}
	}
}

async function remoteVoice2Text(audioBlob, token) {
	const formData = new FormData();
	let ext = mediaRecorder.mimeType === 'audio/mp3' ? 'mp3' : 'webm';
	formData.append('file', audioBlob, `audio.${ext}`);

	const response = await fetch('https://chatgpt.com/backend-api/transcribe', {
		method: 'POST',
		headers: {
			'authorization': 'Bearer ' + token
		},
		body: formData
	});

	if (!response.ok) throw new Error('Voice2Text failed');
	const data = await response.json();
	return data.text || '';
}


function setMicButtonState(state) {
	const micSvg = document.querySelector('button[aria-label="Dictate button"] svg');
	if (!micSvg) return;
	micSvg.classList.remove('gpt-mic-recording', 'gpt-mic-processing');
	if (state === 'recording') micSvg.classList.add('gpt-mic-recording');
	else if (state === 'processing') micSvg.classList.add('gpt-mic-processing');
	// else idle: remove all
}

export function initialize() {
	// Fetch shortcut from chrome.storage
	if (chrome && chrome.storage && chrome.storage.local) {
		chrome.storage.local.get('shortcutS2T', (res) => {
			if (res.shortcutS2T) {
				userShortcut = parseShortcutString(res.shortcutS2T);
			} else {
				console.warn('No shortcut set for shortcutS2T in chrome.storage.local');
			}
		});
	}

	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	window.addEventListener('blur', () => {
		if (isRecording) {
			stopRecording();
			isRecording = false;
		}
	});

	window.addEventListener('GPTaccessTokenEvent', function (event) {
		accessToken = event.detail;
	});
}