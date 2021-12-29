import React, { useState, useEffect, useContext, useRef } from "react";
import { IonCard, IonCol } from "@ionic/react";
import TrainerVisualPanel from "./TrainerVisualPanel";
import TrainerControlPanel from "./TrainerControlPanel";
import CardsContext, { Step } from "../../data/cards-context";
import { useSpeechSynthesis } from "react-speech-kit";

const getWordAt = (str: string, pos: number) => {
  // Perform type conversions.
  str = String(str);
  pos = Number(pos) >>> 0;
  
  // Search for the word's beginning and end.
  const left = str.slice(0, pos + 1).search(/\S+$/),
  right = str.slice(pos).search(/\s/);
  
  // The last word in the string is a special case.
  if (right < 0) {
    return str.slice(left);
  }

  // Return the word, using the located bounds to extract it from the string.
  return str.slice(left, right + pos);
};

const TrainerPanel: React.FC<{ showConfetti: () => void }> = ({
  showConfetti,
}) => {
  const cardsCtx = useContext(CardsContext);
  const { selectedCard, cards, updateSelectedCard } = cardsCtx;
  const [speakingWord, setSpeakingWord] = useState<string>("");
  const [spokenWords, setSpokenWords] = useState<string[]>([]);

  const voiceIndex = useRef<number | null>(null);
  const unlockMasteryFeedback = useRef<boolean>(false);
  
  const stepsQueu = useRef<Step[] | []>([...selectedCard.steps]);
  const [stepsStack, setStepsStack] = useState<Step[]>([]);

  const { voices, cancel, speaking } = useSpeechSynthesis();
  
  const utterance = new SpeechSynthesisUtterance();

  utterance.onboundary = (event) => {
    const stepsStackCopy = [...stepsStack];
    const text = stepsStackCopy.pop()!.text;
    const word = getWordAt(text, event.charIndex);

    console.log(word);

    setSpeakingWord(word);
    setSpokenWords((prevWords) => [...prevWords, word]);
  };

  utterance.onend = () => {
    setSpeakingWord("");
    setSpokenWords([]);
  };

  const voice: SpeechSynthesisVoice | null = voices[voiceIndex.current] || null;

  useEffect(() => {
    if (stepsStack.length > 0) {
      const stepsStackCopy = [...stepsStack];
      const text = stepsStackCopy.pop()!.text;

      utterance.text = text;
      utterance.voice = voice;
      utterance.rate = 0.7;

      speechSynthesis.speak(utterance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepsStack]);

  const updateVoiceIndex = (value: number) => {
    voiceIndex.current = value;
  };

  const addStepToStepsStack = () => {
    
    // Then, update the selectedCard to be the next card on the cards array
    // And, add the first step of the new card to the stepsStack
    // And, add the rest of the steps of the cards to the stepsQueu

    cancel(); // Stop TTS

    if (stepsQueu.current.length === 1) {
    // Unlock the feedback buttons:
    unlockMasteryFeedback.current = true;
    } else {
      // Lock the feedback buttons:
      unlockMasteryFeedback.current = false;
    }

    if (stepsQueu.current.length === 0) { // If there is no more steps on the stepsQueu array:
      const indexOfCurrentCard = cards.findIndex(
        (card) => card.id === selectedCard.id
      );

      // console.log('Index of Current card: ', indexOfCurrentCard);
      if (!!cards[indexOfCurrentCard + 1]) { // If there are cards remaining on the cards array:
        const newCard = cards[indexOfCurrentCard + 1];
        updateSelectedCard(newCard); // Update the selectedCard to be the next card on the cards array
        setStepsStack([newCard.steps[0]]); // Reset the steps stacks to contain the first step of the just updated card
        stepsQueu.current = newCard.steps.slice(1);
      } else { // If the are no more cards:
        // Training done logic:
        showConfetti();
        // Then, set the selected card to be the first card of the cards array
        updateSelectedCard(cards[0]);
        setStepsStack([cards[0].steps[0]]);
        stepsQueu.current = cards[0].steps.slice(1);
      }
    } else { // If there are steps remaining in the stepsQueu array
      const stepsStackCopy = [...stepsStack];
      const stepsQueuCopy = [...stepsQueu.current];

      // then shift the first step of the stepsQueu array
      // and add this shifted step to the the stepsStack:
      stepsStackCopy.push(stepsQueuCopy.shift()!);

      setStepsStack(stepsStackCopy);
      stepsQueu.current = stepsQueuCopy;
    }
  };

  const removeStepFromStepsStack = () => {
    // Lock the feedback buttons:
    unlockMasteryFeedback.current = false;
    cancel(); // Stop TTS
    if (stepsStack.length === 1) {
      const indexOfCurrentCard = cards.findIndex(
        (card) => card.id === selectedCard.id
      );
      if (!!cards[indexOfCurrentCard - 1]) {
        const newCard = cards[indexOfCurrentCard - 1];
        updateSelectedCard(newCard);
        setStepsStack([newCard.steps[0]]);
        stepsQueu.current = newCard.steps.slice(1);
      }
    } else {
      const stepsStackCopy = [...stepsStack];
      const stepsQueuCopy = [...stepsQueu.current];

      stepsQueuCopy.unshift(stepsStackCopy.pop()!);

      setStepsStack(stepsStackCopy);
      stepsQueu.current = stepsQueuCopy;
    }
  };

  const reStartTraining = () => {
    // Lock the feedback buttons:
    unlockMasteryFeedback.current = false;
    cancel(); // Stop TTS
    // Reset from first Step of current Card
    // setStepsStack([selectedCard.steps[0]]);
    // setStepsQueu(selectedCard.steps.slice(1));

    // Reset from first card
    updateSelectedCard(cards[0]);
    setStepsStack([cards[0].steps[0]]);
    stepsQueu.current = cards[0].steps.slice(1);
  };

  const nextCard = () => {
    // Lock the feedback buttons:
    unlockMasteryFeedback.current = false;
    cancel(); // Stop TTS
    const indexOfCurrentCard = cards.findIndex(
      (card) => card.id === selectedCard.id
    );
    const next_card = cards[indexOfCurrentCard + 1];
    if (!!next_card) {
      updateSelectedCard(next_card);
      setStepsStack([next_card.steps[0]]);
      stepsQueu.current = next_card.steps.slice(1);
    } else {
      updateSelectedCard(cards[0]);
      setStepsStack([cards[0].steps[0]]);
      stepsQueu.current = cards[0].steps.slice(1);
    }
  };

  const previousCard = () => {
    // Lock the feedback buttons:
    unlockMasteryFeedback.current = false;
    cancel(); // Stop TTS
    const indexOfCurrentCard = cards.findIndex(
      (card) => card.id === selectedCard.id
    );
    const previous_card = cards[indexOfCurrentCard - 1];
    if (!!previous_card) {
      updateSelectedCard(previous_card);
      setStepsStack([previous_card.steps[0]]);
      stepsQueu.current = previous_card.steps.slice(1);
    }
  };

  // useEffect(() => {
  //   console.log('cards: ', cards);
  //   console.log('Steps Stack: ', stepsStack);
  //   console.log('Steps Queu: ', stepsQueu);
  //   console.log('SelectedCard: ', selectedCard);
  //   console.log('__________________________');
  // }, [selectedCard, stepsStack])

  return (
    <>
      <IonCol size="12" size-md="6" size-lg="6" size-xl="3">
        <IonCard className="ion-card-section">
          <TrainerVisualPanel
            stepsStack={stepsStack}
            speakingWord={speakingWord}
            spokenWords={spokenWords}
            speaking={speaking}
          />
        </IonCard>
      </IonCol>
      {/* Splitted into 2-columns TrainerControlPanel */}
      <IonCol size="12" size-md="6" size-lg="6" size-xl="3">
        <IonCard className="ion-card-section">
          <TrainerControlPanel
            selectedCard={selectedCard}
            addStepToStepsStack={addStepToStepsStack}
            removeStepFromStepsStack={removeStepFromStepsStack}
            nextCard={nextCard}
            previousCard={previousCard}
            reStartTraining={reStartTraining}
            voices={voices}
            voiceIndex={voiceIndex.current}
            updateVoiceIndex={updateVoiceIndex}
            unlockMasteryFeedback={unlockMasteryFeedback}
          />
        </IonCard>
      </IonCol>
    </>
    // One-column TrainerControlPanel
    // <IonCard className="ion-card-section">
    //   <TrainerVisualPanel stepsStack={stepsStack} />
    //   <TrainerControlPanel
    //     selectedCard={selectedCard}
    //     addStepToStepsStack={addStepToStepsStack}
    //     removeStepFromStepsStack={removeStepFromStepsStack}
    //     nextCard={nextCard}
    //     previousCard={previousCard}
    //     reStartTraining={reStartTraining}
    //     voices={voices}
    //     voiceIndex={voiceIndex}
    //     updateVoiceIndex={updateVoiceIndex}
    //   />
    // </IonCard>
  );
};

export default TrainerPanel;
