import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Question from './components/Question';
import Results from './components/Results';
import UserForm from './components/UserForm';
import { UserProvider } from './components/UserContext';

const questions = [
  {
    question: "What's your favorite color?",
    options: ["Red 🔴", "Blue 🔵", "Green 🟢", "Yellow 🟡"],
  },
];

const keywords = {
  Fire: "fire",
  Water: "water",
  Earth: "earth",
  Air: "air",
};

const elements = {
  "Red 🔴": "Fire",
  "Blue 🔵": "Water",
  "Green 🟢": "Earth",
  "Yellow 🟡": "Air",
};

export default function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userName, setUserName] = useState('');
  const [element, setElement] = useState('');
  const [artwork, setArtwork] = useState(null);

  function handleAnswer(answer) {
    setAnswers([...answers, answer]);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }

  function determineElement(answers) {
    const counts = {};
    answers.forEach(answer => {
      const element = elements[answer];
      counts[element] = (counts[element] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  }

  function fetchArtwork(keyword) {
    // Example API call to fetch artwork from the Met Museum API
    fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${keyword}`)
      .then(response => response.json())
      .then(data => {
        if (data.objectIDs && data.objectIDs.length > 0) {
          return fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${data.objectIDs[9]}`);
        } else {
          throw new Error("No artwork found.");
        }
      })
      .then(response => response.json())
      .then(data => setArtwork(data))
      .catch(error => console.error(error));
  }

  useEffect(() => {
    if (currentQuestionIndex === questions.length) {
      const selectedElement = determineElement(answers);
      setElement(selectedElement);
      fetchArtwork(keywords[selectedElement]);
    }
  }, [currentQuestionIndex]);

  return (
    <UserProvider value={{ name: userName, setName: setUserName }}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<UserForm />} />
          <Route
            path="/quiz"
            element={
              currentQuestionIndex < questions.length ? (
                <Question
                  question={questions[currentQuestionIndex].question}
                  options={questions[currentQuestionIndex].options}
                  onAnswer={handleAnswer}
                />
              ) : (
                <Results element={element} artwork={artwork} />
              )
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}
