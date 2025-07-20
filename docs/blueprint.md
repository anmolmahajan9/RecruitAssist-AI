# **App Name**: RecruitAssist AI

## Core Features:

- Job Description Input: Input fields for job title and description.
- Job Description Analysis: Use Gemini API to break down job description into role-specific tasks, definitions, and simplified explanations. The tool will incorporate the appropriate info or terminology into its output, based on its assessment of the input job description.
- Boolean Query Generation: Generate a Boolean search query optimized for Naukri.com based on the analyzed job description.
- Structured Output Display: Display the job role breakdown, definitions, explanations, and Boolean query in collapsible cards.
- Boolean Query Editing: Enable users to copy or edit the generated Boolean search query.
- Data Persistence: Enable users to save the input and output to Firebase Firestore (no user login at this point).

## Style Guidelines:

- Primary color: Light blue (#ADD8E6), evoking calmness and clarity.
- Background color: Off-white (#F5F5F5), provides a clean, spacious feel.
- Accent color: Soft green (#90EE90) for actionable items and success indicators.
- Recommended font: 'Inter' (sans-serif) for a clean, readable UI. 
- Use a mobile-first, responsive layout built with Tailwind CSS, incorporating whitespace and rounded corners inspired by the Oura app.
- Use simple, line-based icons to represent job-related categories and actions.
- Implement subtle transitions and animations for UI elements, such as collapsible cards and button interactions, for a modern feel.