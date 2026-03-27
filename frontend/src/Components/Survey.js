import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Loader from './CustomizeLoader'; // Assuming same Loader as in Chatroom


const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";
const Survey = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [installEase, setInstallEase] = useState('');
  const [visualAppeal, setVisualAppeal] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [effectiveness, setEffectiveness] = useState('');
  const [enjoyment, setEnjoyment] = useState('');
  const [newFeatures, setNewFeatures] = useState('');
  const [satisfaction, setSatisfaction] = useState('');
  const [technicalIssues, setTechnicalIssues] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [learnBaybayin, setLearnBaybayin] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const surveyData = {
      userType,
      installEase,
      visualAppeal,
      accessibility,
      effectiveness,
      enjoyment,
      newFeatures,
      satisfaction,
      technicalIssues,
      recommendation,
      learnBaybayin,
    };

    try {
      const response = await fetch(url_t + 'survey/survey_answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      });

      if (response.ok) {
        setPage(4);
      } else {
        alert('Failed to submit survey. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('An error occurred while submitting the survey.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (page < 3 && (userType && installEase && visualAppeal)) {
      setPage(page + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const isNextDisabled = page === 1 && (!userType || !installEase || !visualAppeal);
  const isSubmitDisabled = page === 3 && (!satisfaction || !technicalIssues || !recommendation);

  return (
    <Container>
      {isLoading && <Loader />}
      <SurveyForm onSubmit={handleSubmit}>
        <SurveyTitle>eBaybayMo User Survey</SurveyTitle>

        {page === 1 && (
          <>
            <Question>
              <Label htmlFor="userType">What type of user are you?</Label>
              <Options>
                {['Student', 'Teacher/Coach', 'Graphic Designer', 'Visual Artist', 'Cultural Enthusiast', 'Other'].map((type) => (
                  <Option key={type}>
                    <input
                      type="radio"
                      id={`userType-${type}`}
                      name="userType"
                      value={type}
                      checked={userType === type}
                      onChange={(e) => setUserType(e.target.value)}
                      aria-label={`User type: ${type}`}
                    />
                    <span>{type}</span>
                  </Option>
                ))}
              </Options>
            </Question>

            <Question>
              <Label htmlFor="installEase">Was the app easy to install and set up?</Label>
              <Options>
                <Option>
                  <input
                    type="radio"
                    id="installEase-yes"
                    name="installEase"
                    value="yes"
                    checked={installEase === 'yes'}
                    onChange={(e) => setInstallEase(e.target.value)}
                    aria-label="Easy to install: Yes"
                  />
                  <span>Yes</span>
                </Option>
                <Option>
                  <input
                    type="radio"
                    id="installEase-no"
                    name="installEase"
                    value="no"
                    checked={installEase === 'no'}
                    onChange={(e) => setInstallEase(e.target.value)}
                    aria-label="Easy to install: No"
                  />
                  <span>No</span>
                </Option>
              </Options>
            </Question>

            <Question>
              <Label htmlFor="visualAppeal">How visually appealing is the app's design?</Label>
              <Options>
                {['Very Appealing', 'Appealing', 'Unappealing', 'Very Unappealing'].map((appeal) => (
                  <Option key={appeal}>
                    <input
                      type="radio"
                      id={`visualAppeal-${appeal}`}
                      name="visualAppeal"
                      value={appeal}
                      checked={visualAppeal === appeal}
                      onChange={(e) => setVisualAppeal(e.target.value)}
                      aria-label={`Visual appeal: ${appeal}`}
                    />
                    <span>{appeal}</span>
                  </Option>
                ))}
              </Options>
            </Question>
          </>
        )}

        {page === 2 && (
          <>
            <Question>
              <Label htmlFor="learnBaybayin">Did the app help you understand and learn Baybayin effectively?</Label>
              <Options>
                <Option>
                  <input
                    type="radio"
                    id="learnBaybayin-yes"
                    name="learnBaybayin"
                    value="yes"
                    checked={learnBaybayin === 'yes'}
                    onChange={(e) => setLearnBaybayin(e.target.value)}
                    aria-label="Learn Baybayin: Yes"
                  />
                  <span>Yes</span>
                </Option>
                <Option>
                  <input
                    type="radio"
                    id="learnBaybayin-no"
                    name="learnBaybayin"
                    value="no"
                    checked={learnBaybayin === 'no'}
                    onChange={(e) => setLearnBaybayin(e.target.value)}
                    aria-label="Learn Baybayin: No"
                  />
                  <span>No</span>
                </Option>
              </Options>
            </Question>

            <Question>
              <Label htmlFor="accessibility">Did you find the eBaybayMo app accessible for your specific needs?</Label>
              <Options>
                {['Accessible', 'Somewhat Accessible', 'Not Accessible'].map((option) => (
                  <Option key={option}>
                    <input
                      type="radio"
                      id={`accessibility-${option}`}
                      name="accessibility"
                      value={option}
                      checked={accessibility === option}
                      onChange={(e) => setAccessibility(e.target.value)}
                      aria-label={`Accessibility: ${option}`}
                    />
                    <span>{option}</span>
                  </Option>
                ))}
              </Options>
            </Question>

            <Question>
              <Label htmlFor="effectiveness">Did the app help you understand and learn Baybayin effectively?</Label>
              <Options>
                {['Very Helpful', 'Somewhat Helpful', 'Not Helpful'].map((helpfulness) => (
                  <Option key={helpfulness}>
                    <input
                      type="radio"
                      id={`effectiveness-${helpfulness}`}
                      name="effectiveness"
                      value={helpfulness}
                      checked={effectiveness === helpfulness}
                      onChange={(e) => setEffectiveness(e.target.value)}
                      aria-label={`Effectiveness: ${helpfulness}`}
                    />
                    <span>{helpfulness}</span>
                  </Option>
                ))}
              </Options>
            </Question>

            <Question>
              <Label htmlFor="enjoyment">Do you enjoy learning Baybayin through this app?</Label>
              <Options>
                <Option>
                  <input
                    type="radio"
                    id="enjoyment-yes"
                    name="enjoyment"
                    value="yes"
                    checked={enjoyment === 'yes'}
                    onChange={(e) => setEnjoyment(e.target.value)}
                    aria-label="Enjoyment: Yes"
                  />
                  <span>Yes</span>
                </Option>
                <Option>
                  <input
                    type="radio"
                    id="enjoyment-no"
                    name="enjoyment"
                    value="no"
                    checked={enjoyment === 'no'}
                    onChange={(e) => setEnjoyment(e.target.value)}
                    aria-label="Enjoyment: No"
                  />
                  <span>No</span>
                </Option>
              </Options>
            </Question>

            <Question>
              <Label htmlFor="newFeatures">What new features or improvements would you like to see in the app?</Label>
              <TextArea
                id="newFeatures"
                value={newFeatures}
                onChange={(e) => setNewFeatures(e.target.value)}
                rows="4"
                placeholder="Enter your response"
                aria-label="New features or improvements"
              />
            </Question>
          </>
        )}

        {page === 3 && (
          <>
            <Question>
              <Label htmlFor="satisfaction">How satisfied are you with the eBaybayMo App?</Label>
              <Rating>
                {['1', '2', '3', '4', '5'].map((rating) => (
                  <Option key={rating}>
                    <input
                      type="radio"
                      id={`satisfaction-${rating}`}
                      name="satisfaction"
                      value={rating}
                      checked={satisfaction === rating}
                      onChange={(e) => setSatisfaction(e.target.value)}
                      aria-label={`Satisfaction rating: ${rating}`}
                    />
                    <span>{rating}</span>
                  </Option>
                ))}
              </Rating>
            </Question>

            <Question>
              <Label htmlFor="technicalIssues">Have you experienced any technical issues?</Label>
              <Options>
                <Option>
                  <input
                    type="radio"
                    id="technicalIssues-yes"
                    name="technicalIssues"
                    value="yes"
                    checked={technicalIssues === 'yes'}
                    onChange={(e) => setTechnicalIssues(e.target.value)}
                    aria-label="Technical issues: Yes"
                  />
                  <span>Yes</span>
                </Option>
                <Option>
                  <input
                    type="radio"
                    id="technicalIssues-no"
                    name="technicalIssues"
                    value="no"
                    checked={technicalIssues === 'no'}
                    onChange={(e) => setTechnicalIssues(e.target.value)}
                    aria-label="Technical issues: No"
                  />
                  <span>No</span>
                </Option>
              </Options>
            </Question>

            <Question>
              <Label htmlFor="recommendation">Would you recommend this app to others?</Label>
              <Options>
                <Option>
                  <input
                    type="radio"
                    id="recommendation-yes"
                    name="recommendation"
                    value="yes"
                    checked={recommendation === 'yes'}
                    onChange={(e) => setRecommendation(e.target.value)}
                    aria-label="Recommendation: Yes"
                  />
                  <span>Yes</span>
                </Option>
                <Option>
                  <input
                    type="radio"
                    id="recommendation-no"
                    name="recommendation"
                    value="no"
                    checked={recommendation === 'no'}
                    onChange={(e) => setRecommendation(e.target.value)}
                    aria-label="Recommendation: No"
                  />
                  <span>No</span>
                </Option>
              </Options>
            </Question>
          </>
        )}

        {page === 4 && (
          <ThankYouContainer>
            <CheckmarkIcon>✔️</CheckmarkIcon>
            <ThankYouMessage>Maraming Salamat!</ThankYouMessage>
            <ThankYouSubtext>
              We appreciate your time and feedback. It helps us improve the eBaybayMo app!
            </ThankYouSubtext>
            <PreviousButton type="button" onClick={() => navigate('/')}>
              Back to App
            </PreviousButton>
          </ThankYouContainer>
        )}

        {(page < 4) && (
          <ButtonContainer>
            {page > 1 && (
              <PreviousButton type="button" onClick={handlePrevious}>
                Previous
              </PreviousButton>
            )}
            {page < 3 ? (
              <NextButton type="button" onClick={handleNext} disabled={isNextDisabled}>
                Next
              </NextButton>
            ) : (
              <SubmitButton type="submit" disabled={isSubmitDisabled}>
                Submit
              </SubmitButton>
            )}
          </ButtonContainer>
        )}
      </SurveyForm>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  width: 100%;
  background: linear-gradient(135deg, #f5e6cc 0%, #f9d1b7 100%);
  padding: 20px;
  box-sizing: border-box;
`;

const SurveyForm = styled.form`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 80vh; /* Allow scrolling within form */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'Inter', sans-serif;
  border: 2px solid #8b5a2b;
`;

const SurveyTitle = styled.h2`
  background: linear-gradient(90deg, #8b5a2b, #a67c00);
  color: #ffffff;
  padding: 15px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
`;

const Question = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fffaf0;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #fef5e7;
  }
`;

const Label = styled.label`
  font-size: 18px;
  font-weight: 600;
  display: block;
  margin-bottom: 12px;
  color: #3c2f2f;
  font-family: 'Inter', sans-serif;
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Option = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  cursor: pointer;
  color: #3c2f2f;
  font-family: 'Inter', sans-serif;
  transition: color 0.2s ease;

  input {
    margin-right: 10px;
    accent-color: #8b5a2b;
    width: 20px;
    height: 20px;
  }

  span {
    margin-left: 5px;
  }

  &:hover {
    color: #a67c00;
  }
`;

const Rating = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #8b5a2b;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #a67c00;
    box-shadow: 0 0 5px rgba(166, 124, 0, 0.3);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding-bottom: 20px; /* Ensure space at the bottom */

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const PreviousButton = styled.button`
  background-color: #8b5a2b;
  color: #ffffff;
  padding: 12px 30px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #6b4e31;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
`;

const NextButton = styled.button`
  background-color: #a67c00;
  color: #ffffff;
  padding: 12px 30px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #805e00;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
`;

const SubmitButton = styled.button`
  background-color: #a67c00;
  color: #ffffff;
  padding: 15px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 100%;
  max-width: 300px;
  align-self: center;

  &:hover {
    background-color: #805e00;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
`;

const ThankYouContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #8b5a2b;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const ThankYouMessage = styled.h3`
  font-size: 32px;
  color: #3c2f2f;
  margin-bottom: 15px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
`;

const ThankYouSubtext = styled.p`
  font-size: 18px;
  color: #6b4e31;
  margin-bottom: 30px;
  font-family: 'Inter', sans-serif;
`;

const CheckmarkIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
  color: #2e7d32;
  text-align: center;
`;

export default Survey;