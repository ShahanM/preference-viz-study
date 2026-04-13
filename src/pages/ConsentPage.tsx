import { ConsentPage as GenericConsentPage } from '@rssa-project/study-template';
import { PCallout, PSubhead, PVSpaced } from '../components/styled/Font';

const ConsentContent: React.FC = () => {
    return (
        <div>
            <PCallout>KEY INFORMATION ABOUT THE RESEARCH STUDY</PCallout>
            <PVSpaced>
                Dr. Bart Knijnenburg is inviting you to volunteer for a research study. Dr. Bart Knijnenburg is an
                Associate Professor at Clemson University conducting the study with graduate students.
            </PVSpaced>
            <PSubhead>Study Purpose</PSubhead>
            <p>
                The goal of this project is to support users in developing, exploring, and understanding their unique
                personal preferences to help them escape the trap of "Filter bubbles" a problematic side effect of
                recommendation technology which is otherwise meant to help make decisions. To support users, understand
                their unique personal taste we designed a movie rating system that displays items beyond the top-rated
                ones to help both the users understand their taste and recommenders get better idea of users taste. In
                this experiment we will ask users to rate movies in our system and complete a survey pertaining to their
                thoughts about how the movies helped their learn, grow, and expand their preferences.
            </p>

            <PSubhead>Voluntary Consent</PSubhead>
            <p>
                Participation is voluntary, and you have the option to not participate. Activities and Procedures: Your
                part in the study will be to rate movies in our system and complete a survey pertaining to your thoughts
                about how the movies helped their learn, grow, and expand their preferences.
            </p>

            <PSubhead>Participation Time</PSubhead>
            <p>
                It will take you about 15 to 20 minutes to be in this study. Risks and Discomforts: We do not know of
                any risks or discomforts to you in this research study.
            </p>
            <PSubhead>Possible Benefits</PSubhead>
            <p>
                This study will help create technology that will help users leverage recommendations to explore, learn,
                and develop their unique personal preferences.
            </p>

            <PCallout>INCENTIVES</PCallout>
            <p>You must complete all step in the study to get a compensation of $4.45.</p>

            <PCallout>PROTECTION OF PRIVACY AND CONFIDENTIALITY</PCallout>
            <p>
                The results of this study may be published in scientific journals, professional publications, or
                educational presentations. The information collected during the study could be used for future research
                studies or distributed to another investigator for future research studies without additional informed
                consent from the participants or legally authorized representative. No identifiable information will be
                collected during the study.
            </p>
            <PCallout>CONTACT INFORMATION</PCallout>
            <p>
                If you have any questions or concerns about your rights in this research study, please contact the
                Clemson University Office of Research Compliance (ORC) at 864-656-0636 or irb@clemson.edu. If you are
                outside of the Upstate South Carolina area, please use the ORC's toll-free number, <u>866-297-3071</u>.
                The Clemson IRB will not be able to answer some study-specific questions. However, you may contact the
                Clemson IRB if the research staff cannot be reached or if you wish to speak with someone other than the
                research staff. If you have any study related questions or if any problems arise, please contact
                Sushmita Khan at{' '}
                <a className="text-blue-500" href="mailto:sushmik@clemson.edu">
                    sushmik@clemson.edu
                </a>
                .
            </p>
            <PCallout>CONSENT</PCallout>
            <p>
                By participating in the study, you indicate that you have read the information written above, been
                allowed to ask any questions, and you are voluntarily choosing to take part in this research. You do not
                give up any legal rights by taking part in this research study.
            </p>
        </div>
    );
};

const ConsentPage: React.FC = () => {
    return (
        <GenericConsentPage itemTitle="" title="">
            <ConsentContent />
        </GenericConsentPage>
    );
};

export default ConsentPage;
