const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path'); // Import the path module

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

const supabaseUrl = 'https://aqrimvmnaeehptmsealp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcmltdm1uYWVlaHB0bXNlYWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjQwMjgsImV4cCI6MjA1Mjk0MDAyOH0.nz0-xavEoPp_JwQkTWfjP0ZMomPnnlRwJrZdipH_I4M';
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{ email }]);
        if (error) {
            console.error('Error subscribing user:', error);
            res.status(500).send(error.message);
        } else {
            console.log('User subscribed:', data);
            res.status(200).send('Subscribed successfully');
        }
    } catch (err) {
        console.error('Error in subscribe:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to fetch questions
app.get('/questions', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('questions')
            .select('*');
        if (error) {
            console.error('Error fetching questions:', error);
            res.status(500).send(error.message);
        } else {
            console.log('Fetched questions:', data);
            res.status(200).json(data || []); // Return an empty array if data is null
        }
    } catch (err) {
        console.error('Error in fetching questions:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to submit a new question
app.post('/submit-question', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).send('Question text is required.');
    }

    try {
        const { data, error } = await supabase
            .from('questions')
            .insert([{ text, upvotes: 0, voters: [] }])
            .select();

        if (error) {
            console.error('Database insert error:', error);
            return res.status(500).send('Error inserting question into database.');
        }

        res.status(201).json(data[0]); // Return the newly created question
    } catch (err) {
        console.error('Unexpected server error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to upvote a question
app.post('/upvote-question', async (req, res) => {
    const { id, userToken } = req.body;

    if (!id || !userToken) {
        return res.status(400).send('Invalid request payload');
    }

    try {
        const { data: questionData, error: fetchError } = await supabase
            .from('questions')
            .select('*')
            .eq('id', id)
            .single(); // Fetch single question

        if (fetchError || !questionData) {
            return res.status(404).send('Question not found');
        }

        // Check if the user has already voted
        if (questionData.voters.includes(userToken)) {
            return res.status(400).send('You have already voted for this question');
        }

        const updatedVoters = [...questionData.voters, userToken];

        // Update the question with the new upvotes and voters
        const { data: updatedData, error: updateError } = await supabase
            .from('questions')
            .update({ upvotes: questionData.upvotes + 1, voters: updatedVoters })
            .eq('id', id)
            .select();

        if (updateError) {
            return res.status(500).send('Error updating question');
        }

        res.status(200).json(updatedData[0]); // Return the updated question
    } catch (err) {
        console.error('Error in upvoting question:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});