import { DemographicsPage, MovieRatingPage, SurveyPage, FeedbackPage, FinalPage } from '@rssa-project/study-template';
import InformedConsent from './ConsentPage';
import PreferenceVisualization from './preferencevisualization/PreferenceVisualization';
import ScenarioPage from './ScenarioPage';
import StudyOverviewPage from './StudyOverviewPage';

export const componentMap: { [key: string]: React.FC } = {
    ConsentStep: InformedConsent,
    StudyOverviewStep: StudyOverviewPage,
    InstructionStep: ScenarioPage,
    SurveyStep: SurveyPage,
    PreferenceElicitationStep: MovieRatingPage,
    TaskStep: PreferenceVisualization,
    ExtraStep: FeedbackPage,
    DemographicsStep: DemographicsPage,
    CompletionStep: FinalPage,
};
