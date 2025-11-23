const fs = require('fs');

// Read the questions.txt file
const content = fs.readFileSync('questions.txt', 'utf-8');

// Split by lines
const lines = content.split('\n').map(line => line.trim());

const questions = [];
let currentQuestion = null;
let currentAnswers = [];
let correctAnswer = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if it's a question line (starts with a number followed by a period)
    const questionMatch = line.match(/^\d+\.\s+(.+)/);
    
    if (questionMatch) {
        // Save previous question if exists
        if (currentQuestion && currentAnswers.length > 0) {
            questions.push({
                question: currentQuestion,
                answers: currentAnswers,
                correct_answer: correctAnswer || currentAnswers[0]
            });
        }
        
        // Start new question
        currentQuestion = questionMatch[1].replace(/\(correct\)/gi, '').trim();
        currentAnswers = [];
        correctAnswer = null;
    }
    // Check if it's an answer line (starts with a letter followed by a period)
    else if (line.match(/^[A-Z]\.\s+/)) {
        const answer = line.substring(3).trim(); // Remove "A. " part
        const isCorrect = answer.includes('(correct)');
        const cleanAnswer = answer.replace(/\(correct\)/gi, '').trim();
        
        if (cleanAnswer) {
            currentAnswers.push(cleanAnswer);
            
            if (isCorrect) {
                correctAnswer = cleanAnswer;
            }
        }
    }
}

// Don't forget the last question
if (currentQuestion && currentAnswers.length > 0) {
    questions.push({
        question: currentQuestion,
        answers: currentAnswers,
        correct_answer: correctAnswer || currentAnswers[0]
    });
}

// Write to JSON file
fs.writeFileSync('questions.json', JSON.stringify(questions, null, 2), 'utf-8');

console.log(`Successfully parsed ${questions.length} questions!`);
console.log('Output saved to questions.json');
