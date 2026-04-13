import { DemographicsPage as GenericDemographicsPage } from '@rssa-project/study-template';

const DemographicsPage: React.FC = () => {
    return (
        <GenericDemographicsPage
            iCountry={false}
            countryState="United States"
            iStateRegion={true}
            iUrbanicity={true}
            iAge={true}
            iGender={true}
            iRaceEthnicity={true}
            iEducation={true}
            stateRegionState={undefined}
        />
    );
};

export default DemographicsPage;
