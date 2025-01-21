import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://aqrimvmnaeehptmsealp.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcmltdm1uYWVlaHB0bXNlYWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjQwMjgsImV4cCI6MjA1Mjk0MDAyOH0.nz0-xavEoPp_JwQkTWfjP0ZMomPnnlRwJrZdipH_I4M'; // Replace with your Supabase anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase initialized:', supabase);

let questions = [];
let sortBy = 'latest';

// Fetch historical questions and set up real-time subscription
async function initializePage() {
    try {
        await fetchQuestions();
        setupRealTimeSubscription();
        console.log('Page initialized successfully');
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

initializePage();

// Function to submit a new question
async function submitQuestion() {
    const questionInput = document.getElementById('questionInput');
    const questionText = questionInput.value.trim();

    if (!questionText) {
        alert('Please enter a question.');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('questions')
            .insert([{ text: questionText, upvotes: 0 }])
            .select();

        if (error) {
            console.error('Error submitting question:', error);
            alert('Failed to submit question: ' + error.message);
            return;
        }

        questionInput.value = ''; // Clear input
        console.log('Question submitted:', data);
    } catch (error) {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred while submitting the question.');
    }
}

// Function to upvote a question
async function upvoteQuestion(id) {
    try {
        // Fetch the current question
        const { data: question, error: fetchError } = await supabase
            .from('questions')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching question:', fetchError);
            return;
        }

        // Check if the user has already voted
        const hasVoted = localStorage.getItem(`voted_${id}`);
        if (hasVoted) {
            alert('You have already voted for this question.');
            return;
        }

        // Update the upvote count
        const { data: updatedQuestion, error: updateError } = await supabase
            .from('questions')
            .update({ upvotes: question.upvotes + 1 })
            .eq('id', id)
            .select();

        if (updateError) {
            console.error('Error upvoting question:', updateError);
            return;
        }

        // Update the UI
        questions = questions.map(q => q.id === id ? updatedQuestion[0] : q);
        renderQuestions();

        // Mark the user as having voted
        localStorage.setItem(`voted_${id}`, 'true');
        localStorage.setItem('userInteracted', 'true');
        showSubscriptionPrompt();
    } catch (error) {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred while upvoting the question.');
    }
}

// Function to fetch questions from Supabase
async function fetchQuestions() {
    try {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching questions:', error);
            return;
        }

        questions = data || [];
        renderQuestions();
    } catch (error) {
        console.error('Unexpected error fetching questions:', error);
    }
}

// Function to render questions on the page
function renderQuestions() {
    const questionList = document.getElementById('questionList');
    questionList.innerHTML = '';

    let sortedQuestions;

    if (sortBy === 'latest') {
        sortedQuestions = questions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'popular') {
        sortedQuestions = questions.sort((a, b) => b.upvotes - a.upvotes);
    }

    sortedQuestions.forEach((question, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'question-item';

        const fireEmoji = index < 3 && sortBy === 'popular' ? '&#128293;' : '';

        listItem.innerHTML = `
            <span>${question.text} ${fireEmoji}</span>
            <button class="upvote-button" onclick="upvoteQuestion('${question.id}')">Upvote (${question.upvotes})</button>
        `;
        questionList.appendChild(listItem);
    });
}

// Function to sort questions by latest or popular
function sortQuestions(option) {
    sortBy = option;
    renderQuestions();
}

// Function to get a unique user token
function getUserToken() {
    let userToken = localStorage.getItem('userToken');
    if (!userToken) {
        userToken = generateUniqueToken();
        localStorage.setItem('userToken', userToken);
    }
    return userToken;
}

// Function to generate a unique token
function generateUniqueToken() {
    return Math.random().toString(36).substr(2, 9);
}

// Function to show the info panel
function showInfoPanel() {
    const infoPanel = document.getElementById('infoPanel');
    infoPanel.style.display = 'block';
}

// Function to close the info panel
function closeInfoPanel() {
    const infoPanel = document.getElementById('infoPanel');
    infoPanel.style.display = 'none';
}

// Function to show content sections
function showContent(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Function to show the subscription prompt
function showSubscriptionPrompt() {
    const subscriptionPrompt = document.getElementById('subscriptionPrompt');
    subscriptionPrompt.style.display = 'block';
}

// Function to close the subscription prompt
function closeSubscriptionPrompt() {
    const subscriptionPrompt = document.getElementById('subscriptionPrompt');
    subscriptionPrompt.style.display = 'none';
}

// Function to subscribe a user
async function subscribeUser() {
    const email = document.getElementById('subscriptionEmail').value.trim();
    if (email) {
        try {
            const { error } = await supabase
                .from('subscribers')
                .insert([{ email }]);

            if (error) {
                console.error('Error subscribing user:', error);
                alert('Failed to subscribe. Please try again.');
                return;
            }

            alert('Thank you for subscribing!');
            closeSubscriptionPrompt();
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('An unexpected error occurred while subscribing.');
        }
    } else {
        alert('Please enter a valid email address.');
    }
}

// Set up real-time subscription
function setupRealTimeSubscription() {
    try {
        supabase
            .channel('public:questions')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'questions' },
                (payload) => {
                    console.log('Real-time event received:', payload);

                    switch (payload.eventType) {
                        case 'INSERT':
                            questions.unshift(payload.new);
                            break;
                        case 'UPDATE':
                            questions = questions.map(q =>
                                q.id === payload.new.id ? payload.new : q
                            );
                            break;
                        case 'DELETE':
                            questions = questions.filter(q => q.id !== payload.old.id);
                            break;
                        default:
                            console.warn('Unhandled real-time event type:', payload.eventType);
                    }

                    renderQuestions();
                }
            )
            .subscribe();
    } catch (error) {
        console.error('Error setting up real-time subscription:', error);
    }
}

// Show the info panel 1 second after the page loads
setTimeout(showInfoPanel, 1000);

// Attach functions to the window object to make them globally accessible
window.submitQuestion = submitQuestion;
window.sortQuestions = sortQuestions;
window.showContent = showContent;
window.closeInfoPanel = closeInfoPanel;
window.closeSubscriptionPrompt = closeSubscriptionPrompt;
window.subscribeUser = subscribeUser;
window.upvoteQuestion = upvoteQuestion;