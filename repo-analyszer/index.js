require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Groq = require('groq-sdk'); // <-- 1. Import Groq

const app = express();
const PORT = 3000;
app.use(cors());

// 2. Initialize Groq with your new key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/test', (req, res) => {
    res.send("Server is alive and Groq is loaded!");
});

app.get('/analyze', async (req, res) => {
    const userUrl = req.query.url;
    if (!userUrl) return res.status(400).send("Error: Please provide a GitHub URL");

    try {
        const urlParts = userUrl.split('/');
        const owner = urlParts[3]; 
        const repo = urlParts[4];  
        const path = 'package.json'; 

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const githubResponse = await axios.get(apiUrl);
        const decodedCode = Buffer.from(githubResponse.data.content, 'base64').toString('utf-8');

        // 3. The Prompt (Slightly tweaked for Groq's JSON mode)
     const prompt = `
        Act as a Senior Software Engineer conducting a strict code review. Analyze this package.json file.
        You MUST return ONLY a valid JSON object. Do not use markdown, do not use backticks.
        Use this exact JSON structure:
        {
          "description": "A 2-sentence summary of what this project does.",
          "architecture": "The likely architecture pattern (e.g., Monorepo, MVC, Microservice)",
          "techStack": ["React", "Express", "Vite", "etc"],
          "keyDependencies": [
            { "name": "axios", "purpose": "Used for making HTTP requests" }
          ],
          "healthScore": "A single letter grade (A, B, C, D, or F) evaluating the repository's setup based on missing testing frameworks, missing linters, or outdated Node versions.",
          "actionableImprovements": [
            { "issue": "No testing framework found", "fixCommand": "npm install -D jest" },
            { "issue": "No linter configured", "fixCommand": "npm install -D eslint" }
          ]
        }
        
        If the setup is perfect, the improvements array can be empty.
        Here is the code:
        ${decodedCode}
        `;

        // 4. Call Groq's insanely fast Llama 3 model
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
           model: "llama-3.1-8b-instant", // Meta's lightning-fast model
            response_format: { type: "json_object" }, // Force strict JSON
        });

        // 5. Extract the text and send it directly to React
        const finalAnalysis = chatCompletion.choices[0].message.content;
        res.send(finalAnalysis);

    } catch (error) {
        console.error("System Error:", error.message);
        res.status(500).send("Something went wrong during the fetch or analysis.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});