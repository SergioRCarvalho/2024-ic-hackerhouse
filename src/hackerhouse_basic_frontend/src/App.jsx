import React, { useState } from 'react';
import NfidLogin from "./components/NfidLogin";


function App() {
  const [backendActor, setBackendActor] = useState();
  const [userId, setUserId] = useState(null);  // Default to null to avoid showing empty sections
  const [userName, setUserName] = useState(null);  // Default to null to avoid showing empty sections
  const [sentimentResult, setSentimentResult] = useState(null);  // To hold the sentiment result

  function handleSubmitUserProfile(event) {
    event.preventDefault();
    const name = event.target.elements.name.value;  // Get the name from the input field

    backendActor.setUserProfile(name).then((response) => {
      if (response.ok) {
        // If the response is successful, update the userId and userName state
        setUserId(response.ok.id.toString());
        setUserName(response.ok.name);

        // Now, call the AI model for sentiment analysis
        const paragraph = "This is a sample paragraph for sentiment analysis."; // Replace this with dynamic content if needed

        backendActor.outcall_ai_model_for_sentiment_analysis(paragraph).then((sentimentResponse) => {
          if (sentimentResponse.ok) {
            // Process the sentiment analysis response to show the highest score
            const highestSentiment = processSentimentResults(sentimentResponse.ok);
            setSentimentResult(highestSentiment);
          } else {
            setSentimentResult("Error fetching sentiment analysis.");
          }
        });
      } else if (response.err) {
        // If there's an error, set the userId to the error message
        setUserId(response.err);
      } else {
        console.error(response);
        setUserId("Unexpected error, check the console");
      }
    });

    return false; // Prevent page refresh after form submission
  }

  function processSentimentResults(results) {
    // Loop through parsed results and find the entry with the highest score
    let maxScore = -1.0;
    let maxLabel = "";

    for (let entry of results) {
      if (entry.score > maxScore) {
        maxScore = entry.score;
        maxLabel = entry.label_;
      }
    }

    // Return the label and score with the highest score
    return `Highest sentiment: ${maxLabel} with a score of ${maxScore}`;
  }

  return (
    <main>
      <img src="/logo2.svg" alt="DFINITY logo" />
      <br />
      <br />
      <h1>Welcome to IC AI Hacker House!</h1>
      {!backendActor && (
        <section id="nfid-section">
          <NfidLogin setBackendActor={setBackendActor}></NfidLogin>
        </section>
      )}
      {backendActor && (
        <>
          <form action="#" onSubmit={handleSubmitUserProfile}>
            <label htmlFor="name">Enter your name: &nbsp;</label>
            <input id="name" alt="Name" type="text" />
            <button type="submit">Save</button>
          </form>
          
          {/* Show the user profile result */}
          {userId && (
            <section className="response">
              <strong>User ID:</strong> {userId}
            </section>
          )}
          {userName && (
            <section className="response">
              <strong>User Name:</strong> {userName}
            </section>
          )}

          {/* Show the sentiment analysis result */}
          {sentimentResult && (
            <section className="response">
              <strong>Sentiment Analysis:</strong> {sentimentResult}
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default App;

