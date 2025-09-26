import InformedConsent from './ConsentPage';
import DemographicsPage from './DemographicsPage';
import FeedbackPage from './FeedbackPage';
import FinalPage from './FinalPage';
import MovieRatingPage from './MovieRatingPage';
import PreferenceVisualization from './preferencevisualization/PreferenceVisualization';
import ScenarioPage from './ScenarioPage';
import StudyOverviewPage from './StudyOverviewPage';
import SurveyPage from './SurveyPage';

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
