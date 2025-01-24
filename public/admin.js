import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Check authentication
if (!sessionStorage.getItem('adminAuthenticated')) {
    window.location.href = 'admin-login.html';
}

const supabase = createClient(
    'https://aqrimvmnaeehptmsealp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcmltdm1uYWVlaHB0bXNlYWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjQwMjgsImV4cCI6MjA1Mjk0MDAyOH0.nz0-xavEoPp_JwQkTWfjP0ZMomPnnlRwJrZdipH_I4M'
);

// Add after supabase initialization and before loadContent()
async function initializeSections() {
    const defaultSections = [
        {
            title: 'AI Vocabulary',
            type: 'text',
            content: document.getElementById('contentEditor').value || '<div class="vocabulary-section">...</div>',
            order: 1,
            active: true
        },
        {
            title: 'AI Answers',
            type: 'text',
            content: '<div class="answers-section"><h2>Common AI Questions</h2><p>This section will be updated with frequently asked questions and their answers.</p></div>',
            order: 2,
            active: true
        },
        {
            title: 'AI Tutorials',
            type: 'video',
            content: '<div class="video-container"><iframe src="https://www.youtube.com/embed/q_2_7qEph9Y" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>',
            order: 3,
            active: true
        }
    ];

    for (const section of defaultSections) {
        const { data, error } = await supabase
            .from('content_sections')
            .select('title')
            .eq('title', section.title)
            .single();
            
        if (error) {
            // Section doesn't exist, create it
            const { error: insertError } = await supabase
                .from('content_sections')
                .insert([section]);
                
            if (insertError) {
                console.error(`Error creating section ${section.title}:`, insertError);
            }
        }
    }
}

// Add before loadContent() call
await initializeSections();

async function loadContent() {
    const select = document.getElementById('sectionSelect');
    const editor = document.getElementById('contentEditor');
    
    const { data, error } = await supabase
        .from('content_sections')
        .select('content')
        .eq('title', select.value)
        .single();
        
    if (error) {
        alert('Error loading content');
        return;
    }
    
    editor.value = data.content;
}

async function updateContent() {
    const select = document.getElementById('sectionSelect');
    const editor = document.getElementById('contentEditor');
    
    const { error } = await supabase
        .from('content_sections')
        .update({ content: editor.value })
        .eq('title', select.value);
        
    if (error) {
        alert('Error updating content');
        return;
    }
    
    alert('Content updated successfully!');
}

// Add event listeners
document.getElementById('sectionSelect').addEventListener('change', loadContent);
document.getElementById('updateButton').addEventListener('click', updateContent);

// Load initial content
loadContent();

window.updateContent = updateContent;