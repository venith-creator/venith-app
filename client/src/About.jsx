import React from 'react';
import './About.css';

export default function About() {
    return (
        <div className="about-card">
            <h1>🛍️ Welcome to Venith Store + Expense Tracker</h1>
            <p>This full-stack web app was built as part of my journey to becoming a complete web developer 
                — using React, Node.js, Express, and PostgreSQL.</p>

            <h2>💡 What You Can Do:</h2>
            <ul>
                <li><strong>Sign up</strong> with your name, email, and password</li>
                <li><strong>Log in</strong> to access personalized features</li>
                <li><strong>Explore products</strong> — including food, clothes, and shoes</li>
                <li><strong>Buy products</strong> using the “Buy Now” button — and automatically track your expenses</li>
                <li><strong>Add custom requests</strong> if a product isn’t exactly what you want</li>
                <li><strong>Leave a review</strong> with your thoughts and a star rating after purchase</li>
                <li><strong>Check your spending</strong> in the “My Expenses” page</li>
                <li><strong>Message other users</strong> with the built-in chat system</li>
            </ul>

             <h2>🚀 Tech Stack</h2>
            <ul>
                <li>Frontend: React + modular CSS</li>
                <li>Backend: Express.js + JWT authentication</li>
                <li>Database: PostgreSQL</li>
                <li>Deployment Target: Railway (Compact full-stack deployment)</li>
            </ul>

            <h2>👑 Admin Features:</h2>
            <ul>
                <li>View confirmed purchases from users</li>
                <li>Reply to custom requests and reviews</li>
            </ul>
            <h2>📌 Why This Matters:</h2>
            <p>This app brings together real-world features like authentication, product listings, purchase tracking, user feedback,
                 and admin control — making it a complete and practical web development project.</p>

            <p>Everything is responsive, styled, and connected — and this About page is here to help you navigate the journey.</p>

            <p>
                Every feature you see here was built step-by-step — with persistence, learning, and plenty of debugging. Thanks for checking it out!
            </p>

            <p>— Built with ❤️ by Venith</p>
        </div>
    );
}