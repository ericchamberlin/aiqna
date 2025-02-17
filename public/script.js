import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://aqrimvmnaeehptmsealp.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcmltdm1uYWVlaHB0bXNlYWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjQwMjgsImV4cCI6MjA1Mjk0MDAyOH0.nz0-xavEoPp_JwQkTWfjP0ZMomPnnlRwJrZdipH_I4M'; // Replace with your Supabase anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase initialized:', supabase);

let questions = [];
let sortBy = 'latest';

// Fetch historical questions and set up real-time subscription
// Add this after initializePage() function
// Add this new function to fetch videos
async function fetchTutorialVideos() {
    try {
        const { data, error } = await supabase
            .from('video_content')
            .select('*')
            .eq('section', 'tutorials')
            .eq('active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching tutorial videos:', error);
        return [];
    }
}

// Add new function to fetch AI Answer videos
async function fetchAIAnswerVideos() {
    try {
        const { data, error } = await supabase
            .from('video_content')
            .select('*')
            .eq('section', 'ai_answers')
            .eq('active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;
        console.log("Fetched AI Answer Videos:", data);
        return data || [];
    } catch (error) {
        console.error('Error fetching AI Answer videos:', error);
        return [];
    }
}

// Update createContentSections to be async
// Update createContentSections function
async function createContentSections() {
    const bottomSection = document.querySelector('.bottom-section');
    if (!bottomSection) return;

    // Fetch AI Answer videos
    const aiAnswerVideos = await fetchAIAnswerVideos();

    if (!document.getElementById('ai-vocabulary')) {
        bottomSection.innerHTML += `
            <div id="ai-vocabulary" class="content-section" style="display: none;">
                <div style="max-width: 800px; margin: 0 auto;">
                    <h2>Combined Basics of AI Terminology</h2>
                    <dl style="margin: 0; padding: 0;">
                        <dt style="font-weight: bold; margin-top: 20px; font-size: 1.2em;">Artificial Intelligence (AI)</dt>
                        <dd style="margin-left: 0; margin-top: 8px; line-height: 1.5;">
                            <strong>Definition:</strong> A branch of computer science that enables machines to perform tasks that typically require human intelligence, such as learning, decision-making, and problem-solving.<br>
                            <strong>Example:</strong> AI is like a really smart assistant that can help you plan a trip, suggest recipes based on what's in your fridge, or even recognize your voice when you ask your phone a question.
                        </dd>
                        
                        <dt style="font-weight: bold; margin-top: 20px; font-size: 1.2em;">Algorithm</dt>
                        <dd style="margin-left: 0; margin-top: 8px; line-height: 1.5;">
                            <strong>Definition:</strong> A set of rules or steps a computer follows to solve a problem or complete a task.<br>
                            <strong>Example:</strong> An algorithm is like a recipe for baking a cake—it gives the computer step-by-step instructions to follow.
                        </dd>
                        
                        <dt style="font-weight: bold; margin-top: 20px; font-size: 1.2em;">Machine Learning (ML)</dt>
                        <dd style="margin-left: 0; margin-top: 8px; line-height: 1.5;">
                            <strong>Definition:</strong> A subset of AI that enables systems to learn and improve from experience.<br>
                            <strong>Example:</strong> Like how a child learns to recognize cats after seeing many pictures of cats, ML systems learn patterns from data.
                        </dd>
                    </dl>
                </div>
            </div>
            <div id="ai-answers" class="content-section" style="display: none;">
                <h2>AI Answers</h2>
                <div class="video-content" style="max-width: 800px; margin: 0 auto;">
                    ${aiAnswerVideos.map(video => `
                        <div class="video-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
                            <h3>${video.title}</h3>
                            ${video.description ? `<p style="margin: 10px 0;">${video.description}</p>` : ''}
                            <div class="video-actions" style="margin-top: 15px;">
                                <a href="${video.youtube_url}" target="_blank" rel="noopener"
                                   style="display: inline-block; padding: 8px 16px; background: #1a73e8; color: white; text-decoration: none; border-radius: 4px;">
                                    Watch Video
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div id="ai-placeholder" class="content-section" style="display: none;">
                <h2>AI Tutorials</h2>
                ${tutorialVideos.length > 0 ? `
                    <div class="tutorials-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        ${tutorialVideos.map(video => `
                            <div class="tutorial-item">
                                <h3>${video.title}</h3>
                                ${video.description ? `<p>${video.description}</p>` : ''}
                                <a href="${video.youtube_url}" target="_blank" class="tutorial-link">
                                    Watch Tutorial
                                </a>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p>Future tutorials will be available here. Have a suggestion for what you'd like to learn?</p>
                `}
            </div>
        `;
    }
}

// Update initializePage to handle async createContentSections
async function initializePage() {
    try {
        await fetchQuestions();
        await createContentSections();
        setupRealTimeSubscription();
        showInfoPanel();
        console.log('Page initialized successfully');
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}
supabase
    .channel('public:test_messages')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'test_messages' },
        (payload) => {
            console.log('Real-time event received:', payload);
        }
    )
    .subscribe();
initializePage();

// Function to submit a new question
async function submitQuestion() {
    const questionInput = document.getElementById('questionInput');
    const questionText = questionInput.value.trim();
    const sessionId = getUserToken();  // Use existing getUserToken function

    if (!questionText) {
        alert('Please enter a question.');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('questions')
            .insert([{ 
                text: questionText, 
                upvotes: 0,
                session_id: sessionId  // Add session ID
            }])
            .select();

        if (error) {
            console.error('Error submitting question:', error);
            alert('Failed to submit question: ' + error.message);
            return;
        }

        questionInput.value = '';
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
    const sessionId = getUserToken();
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
        const deleteButton = question.session_id === sessionId ? 
            `<button class="delete-button" onclick="deleteQuestion('${question.id}')">Delete</button>` : '';

        listItem.innerHTML = `
            <span>${question.text} ${fireEmoji}</span>
            <div class="button-group">
                <button class="upvote-button" onclick="upvoteQuestion('${question.id}')">Upvote (${question.upvotes})</button>
                ${deleteButton}
            </div>
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
// Add these functions
function showModal(content) {
    const modal = document.getElementById('contentModal');
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = content;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    const modal = document.getElementById('contentModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}
function extractYouTubeID(url) {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match && match[1] ? match[1] : null;
}
async function showContent(sectionId) {
    const modal = document.getElementById('contentModal');
    const modalBody = modal.querySelector('.modal-body');
  
    switch(sectionId) {
      case 'ai-vocabulary':
        const vocabContent = document.getElementById('ai-vocabulary').innerHTML;
        modalBody.innerHTML = `
          <div style="
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
  
            /* Force single column */
            column-count: 1 !important;
            -webkit-column-count: 1 !important;
            -moz-column-count: 1 !important;
            column-gap: 0 !important;
          ">
            ${vocabContent}
          </div>
        `;
  
        // Style terms and definitions
        modalBody.querySelectorAll('dt').forEach(term => {
          term.style.cssText = `
            font-weight: bold;
            margin-top: 20px;
            font-size: 1.2em;
            color: #333;
            break-inside: avoid;
            page-break-inside: avoid;
            -webkit-column-break-inside: avoid;
          `;
        });
        modalBody.querySelectorAll('dd').forEach(def => {
          def.style.cssText = `
            margin-left: 0;
            margin-top: 8px;
            margin-bottom: 24px;
            line-height: 1.5;
            color: #666;
            break-inside: avoid;
            page-break-inside: avoid;
            -webkit-column-break-inside: avoid;
          `;
        });
        break;

        case 'ai-answers':
            // Fetch AI Answer videos from Supabase
            const aiAnswerVideos = await fetchAIAnswerVideos();
            if (aiAnswerVideos.length === 0) {
                modalBody.innerHTML = `<p>No AI Answer videos available.</p>`;
            } else {
                modalBody.innerHTML = `
                    <h2>AI Answers</h2>
                    <div class="video-content" style="max-width: 800px; margin: 0 auto;">
                        ${aiAnswerVideos.map(video => {
                            const videoID = extractYouTubeID(video.youtube_url);
                            return `
                                <div class="video-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
                                    <h3>${video.title}</h3>
                                    <p>${video.description || "No description available."}</p>
                                    <iframe width="100%" height="400px" 
                                        src="https://www.youtube.com/embed/${videoID}" 
                                        frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                                    </iframe>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            break;

        case 'ai-placeholder':
            modalBody.innerHTML = `
                <h2>AI Tutorials</h2>
                <p>Future Tutorials will be here...have a suggestion for the first one?</p>
            `;
            break;

            default:
                modalBody.innerHTML = `<p>Content not found</p>`;
            }
          
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
          }

// Add event listener for clicking outside modal to close
window.onclick = function(event) {
    const modal = document.getElementById('contentModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Make sure to expose the functions
window.showContent = showContent;
window.closeModal = closeModal;

// Function to show the subscription prompt
function showSubscriptionPrompt() {
    const subscriptionPrompt = document.getElementById('subscriptionPrompt');
    subscriptionPrompt.innerHTML = `
        <div class="subscription-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        ">
            <div class="subscription-container" style="
                width: 90%;
                max-width: 600px;
                background: white;
                border-radius: 8px;
                position: relative;
                border: 4px solid #1a4789;
                overflow: hidden;
            ">
                <div style="
                    background: #1a4789;
                    color: white;
                    padding: 15px;
                    text-align: center;
                    font-size: 1.1em;
                ">
                    Sign up for our free newsletter to never miss a new tutorial or video
                </div>
                <button onclick="closeSubscriptionPrompt()" style="
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    z-index: 1001;
                    color: white;
                ">×</button>
                <iframe 
                    src="https://aiqna.beehiiv.com/subscribe" 
                    style="
                        width: 100%;
                        height: 75vh;
                        border: none;
                        border-radius: 0 0 8px 8px;
                    "
                ></iframe>
            </div>
        </div>
    `;
    subscriptionPrompt.style.display = 'block';
}

// Keep the close function
function closeSubscriptionPrompt() {
    const subscriptionPrompt = document.getElementById('subscriptionPrompt');
    subscriptionPrompt.style.display = 'none';
    subscriptionPrompt.innerHTML = '';
}
// Function to show the ebook prompt
function showEbookPrompt() {
    const ebookPrompt = document.getElementById('ebookPrompt');
    ebookPrompt.innerHTML = `
        <div class="ebook-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        ">
            <div class="ebook-container" style="
                width: 90%;
                max-width: 600px;
                height: 80vh;
                background: white;
                border-radius: 8px;
                position: relative;
            ">
                <button onclick="closeEbookPrompt()" style="
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    z-index: 1001;
                ">×</button>
                <iframe 
                    src="https://chamberlin5.gumroad.com/l/ixuug" 
                    style="
                        width: 100%;
                        height: 100%;
                        border: none;
                        border-radius: 8px;
                    "
                ></iframe>
            </div>
        </div>
    `;
    ebookPrompt.style.display = 'block';
}

// Update the close function to clear the content
function closeEbookPrompt() {
    const ebookPrompt = document.getElementById('ebookPrompt');
    ebookPrompt.style.display = 'none';
    ebookPrompt.innerHTML = '';
}

// Function to handle ebook subscription
async function subscribeForEbook() {
    const email = document.getElementById('ebookEmail').value.trim();
    if (email) {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .insert([{ 
                    email: email
                }]);

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    alert('Thank you for your interest! This email is already subscribed to receive our eBook.');
                } else {
                    console.error('Detailed subscription error:', error);
                    alert('Failed to subscribe. Please try again later.');
                }
                return;
            }

            alert('Thank you! The eBook will be sent to your email shortly.');
            closeEbookPrompt();
        } catch (error) {
            console.error('Detailed error:', error);
            alert('An unexpected error occurred while subscribing.');
        }
    } else {
        alert('Please enter a valid email address.');
    }
}

// Add to window object
window.showEbookPrompt = showEbookPrompt;
window.closeEbookPrompt = closeEbookPrompt;
window.subscribeForEbook = subscribeForEbook;
// Function to subscribe a user
async function subscribeUser() {
    const email = document.getElementById('subscriptionEmail').value.trim();
    if (email) {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .insert([{ 
                    email: email
                }]);

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    alert('Thank you for your interest! This email is already subscribed to our newsletter.');
                } else {
                    console.error('Error subscribing user:', error);
                    alert('Failed to subscribe. Please try again later.');
                }
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
// Function to delete a question
async function deleteQuestion(id) {
    try {
        const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', id)
            .eq('session_id', getUserToken());  // Only delete if session matches

        if (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question');
            return;
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred while deleting the question.');
    }
}

// Attach functions to the window object
window.submitQuestion = submitQuestion;
window.sortQuestions = sortQuestions;
window.showContent = showContent;
window.closeInfoPanel = closeInfoPanel;
window.closeSubscriptionPrompt = closeSubscriptionPrompt;
window.subscribeUser = subscribeUser;
window.upvoteQuestion = upvoteQuestion;
window.deleteQuestion = deleteQuestion;  // Add this line
// Function to fetch and render content sections
// Replace Supabase initialization with Airtable
// Remove these lines
// import Airtable from 'airtable';
// const base = new Airtable({apiKey: '...'}).base('...');

// Restore the original fetchContentSections function
async function fetchContentSections() {
    try {
        const { data: sections, error } = await supabase
            .from('content_sections')
            .select('*')
            .eq('active', true)
            .order('order', { ascending: true });

        if (error) {
            console.error('Error fetching content sections:', error);
            return;
        }

        // Generate buttons
        const buttonSection = document.querySelector('.button-section');
        
        // Create static buttons first
        buttonSection.innerHTML = `
            <button onclick="showContent('ai-vocabulary')">AI Vocabulary</button>
            <button onclick="showContent('ai-answers')">AI Answers</button>
            <button onclick="showContent('ai-placeholder')">AI Tutorials</button>
            <button onclick="showEbookPrompt()">Free eBook</button>
        `;

        // Generate content containers
        const bottomSection = document.querySelector('.bottom-section');
        bottomSection.innerHTML = ''; // Clear existing content

        sections.forEach(section => {
            // Create content section
            const contentDiv = document.createElement('div');
            contentDiv.id = `section_${section.id}`;
            contentDiv.className = 'content-section';
            contentDiv.innerHTML = section.content;
            bottomSection.appendChild(contentDiv);
        });

    } catch (error) {
        console.error('Error fetching content:', error);
    }
}

function generateVocabularyHTML(fields) {
    return `
        <div class="vocabulary-section">
            <h2>AI Vocabulary</h2>
            <dl>
                ${fields.terms.map(term => `
                    <dt>${term.name}</dt>
                    <dd>${term.definition}</dd>
                `).join('')}
            </dl>
        </div>
    `;
}

function generateAnswersHTML(fields) {
    return `
        <div class="answers-section">
            <h2>Common AI Questions</h2>
            ${fields.qa.map(item => `
                <h3>${item.question}</h3>
                <p>${item.answer}</p>
            `).join('')}
        </div>
    `; // ✅ Closing the template literal correctly
}

// Call this function when page loads
initializePage();