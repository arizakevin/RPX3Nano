import {
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
} from "@ionic/react";
import React from "react";
import TrainingSessionSetup from "./TrainingSessionSetup";
import TrainingSessionNavigation from "./TrainingSessionNavigation";
import MasteryFeedback from "./MasteryFeedback";
import { Card } from "../../../data/cards-context";

const TrainerControlPanel: React.FC<{
  voices: SpeechSynthesisVoice[];
  voiceIndex: number | null;
  selectedCard: Card;
  updateVoiceIndex: (value: number) => void;
  addStepToStepsStack: () => void;
  removeStepFromStepsStack: () => void;
  nextCard: () => void;
  previousCard: () => void;
  reStartTraining: () => void;
}> = ({
  voices,
  voiceIndex,
  selectedCard,
  updateVoiceIndex,
  addStepToStepsStack,
  removeStepFromStepsStack,
  nextCard,
  previousCard,
  reStartTraining,
}) => {
  return (
    <>
      <IonCardHeader>
        <IonCardTitle>Trainer Control Panel</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          <TrainingSessionSetup
            selectedCard={selectedCard}
            reStartTraining={reStartTraining}
            voices={voices}
            voiceIndex={voiceIndex}
            updateVoiceIndex={updateVoiceIndex}
          />
          <TrainingSessionNavigation
            addStepToStepsStack={addStepToStepsStack}
            removeStepFromStepsStack={removeStepFromStepsStack}
            nextCard={nextCard}
            previousCard={previousCard}
          />
          <MasteryFeedback />
        </IonList>
      </IonCardContent>
    </>
  );
};

export default TrainerControlPanel;
