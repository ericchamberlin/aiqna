import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Check authentication
if (!sessionStorage.getItem('adminAuthenticated')) {
    window.location.href = 'admin-login.html';
}

const supabase = createClient(
    'https://aqrimvmnaeehptmsealp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcmltdm1uYWVlaHB0bXNlYWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjQwMjgsImV4cCI6MjA1Mjk0MDAyOH0.nz0-xavEoPp_JwQkTWfjP0ZMomPnnlRwJrZdipH_I4M'
);

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