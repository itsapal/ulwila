// Note colors mapping
const noteColors = {
    'C': '#000000', // Black
    'D': '#8B4513', // Brown
    'E': '#000080', // Navy Blue
    'F': '#006400', // Dark Green
    'G': '#FF0000', // Red
    'A': '#FF8C00', // Dark Orange
    'H': '#FFD700'  // Yellow (formerly B)
};

// Note duration mapping
const durationShapes = {
    'w': 4,    // whole note
    'h': 2,    // half note
    'q': 1,    // quarter note
    'e': 0.5   // eighth note
};

// Canvas setup
const canvas = document.getElementById('sheetMusic');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Global variable for note size
let noteRadius = 15;
let fontSize = 16;
let textOffset = -5;

// Parse input text into notes
function parseNotes(input) {
    // Split input into rows
    const rows = input.split('\n');
    
    return rows.map((row, rowIndex) => {
        return row.split(/\s+/).map(note => {
            // Updated regex to capture duration, primes, and accidentals
            const match = note.match(/([A-H])('{0,2})([#b])?([whqe])?/);
            if (!match || !note.trim()) return null;
            
            return {
                note: match[1],
                prime: match[2] || '',  // '' for base note, "'" for prime, "''" for double prime
                accidental: match[3] || '',
                row: rowIndex,
                duration: match[4] || 'q' // Default to quarter note if no duration specified
            };
        }).filter(note => note !== null);
    }).filter(row => row.length > 0); // Remove empty rows
}

// Draw a note on the canvas
function drawNote(x, y, note, duration) {
    const radius = noteRadius;
    const color = noteColors[note.note];
    const durationValue = durationShapes[duration];
    
    // Calculate number of circles and whether to use half circle
    let numCircles = 1;
    let isHalf = false;
    
    if (durationValue === 4) { // whole note - 4 overlapping circles
        numCircles = 4;
    } else if (durationValue === 2) { // half note - 2 overlapping circles
        numCircles = 2;
    } else if (durationValue === 0.5) { // eighth note - half circle
        isHalf = true;
    }
    
    // Draw the circles
    if (isHalf) {
        // Draw half circle for eighth note - opening to the left
        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI/2, -Math.PI/2, false); // Draw the half circle opening to the left
        ctx.lineTo(x, y - radius); // Close the shape
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = Math.max(1, radius / 8);
        ctx.stroke();
    } else {
        // Draw the required number of circles with overlap
        const overlapFactor = 0.7; // Controls how much circles overlap
        const circleSpacing = radius * 1.4; // Fixed ratio for circle spacing
        const totalWidth = (numCircles - 1) * circleSpacing + (radius * 2);
        const startOffsetX = -totalWidth / 2;
        
        for (let i = 0; i < numCircles; i++) {
            const circleX = x + startOffsetX + (i * circleSpacing);
            
            // Draw the main circle
            ctx.beginPath();
            ctx.arc(circleX, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = Math.max(1, radius / 8);
            ctx.stroke();

            // Draw the center dot based on prime notation
            if (note.prime === '') {  // Base note - black dot
                ctx.beginPath();
                ctx.arc(circleX, y, radius * 0.25, 0, Math.PI * 2);
                ctx.fillStyle = '#000';
                ctx.fill();
            } else if (note.prime === "''") {  // Double prime - white dot
                ctx.beginPath();
                ctx.arc(circleX, y, radius * 0.25, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            // For single prime (note.prime === "'"), no dot is drawn
        }
    }
    
    // Draw accidental if present
    if (note.accidental) {
        ctx.fillStyle = '#333';
        ctx.font = Math.floor(radius * 1.1) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(note.accidental, x, y - radius - 5);
    }
}

// Draw the sheet music
function drawSheetMusic(rows) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const startX = 80;
    const startY = 50;
    const spacingX = 120; // Fixed spacing between notes
    const spacingY = 80;  // Fixed vertical spacing
    
    // Get text lines
    const textInput = document.getElementById('textInput').value;
    const textLines = textInput.split('\n');
    
    rows.forEach((row, rowIndex) => {
        row.forEach((note, noteIndex) => {
            const x = startX + (noteIndex * spacingX);
            const y = startY + (rowIndex * spacingY);
            drawNote(x, y, note, note.duration);
            
            // Draw text if available for this row
            if (textLines[rowIndex]) {
                const words = textLines[rowIndex].split(' ');
                if (words[noteIndex]) {
                    ctx.fillStyle = '#333';
                    ctx.font = `${fontSize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.fillText(words[noteIndex], x + textOffset, y + (noteRadius * 1.8));
                }
            }
        });
    });
}

// Event listeners
document.getElementById('sizeSlider').addEventListener('input', (e) => {
    noteRadius = parseInt(e.target.value);
    document.getElementById('sizeValue').textContent = noteRadius + 'px';
    const input = document.getElementById('musicInput').value;
    if (input.trim()) {
        const noteRows = parseNotes(input);
        drawSheetMusic(noteRows);
    }
});

document.getElementById('fontSizeSlider').addEventListener('input', (e) => {
    fontSize = parseInt(e.target.value);
    document.getElementById('fontSizeValue').textContent = fontSize + 'px';
    const input = document.getElementById('musicInput').value;
    if (input.trim()) {
        const noteRows = parseNotes(input);
        drawSheetMusic(noteRows);
    }
});

document.getElementById('textOffsetSlider').addEventListener('input', (e) => {
    textOffset = parseInt(e.target.value);
    document.getElementById('textOffsetValue').textContent = textOffset + 'px';
    const input = document.getElementById('musicInput').value;
    if (input.trim()) {
        const noteRows = parseNotes(input);
        drawSheetMusic(noteRows);
    }
});

document.getElementById('convertBtn').addEventListener('click', () => {
    const input = document.getElementById('musicInput').value;
    const noteRows = parseNotes(input);
    drawSheetMusic(noteRows);
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'sheet-music.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Help section toggle
document.querySelector('.help-toggle').addEventListener('click', function() {
    const helpContent = document.getElementById('helpContent');
    const isExpanded = helpContent.classList.contains('show');
    
    // Toggle the content
    helpContent.classList.toggle('show');
    
    // Update the button text
    this.textContent = isExpanded ? 'Help ▼' : 'Help ▲';
    
    // Toggle the active class for styling
    this.classList.toggle('active');
}); 