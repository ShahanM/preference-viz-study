import React from 'react';
import Container from "react-bootstrap/Container"
import { Row } from 'react-bootstrap';

class LeftPanel extends React.Component{
    render(){
        return(
            <div class = "my-container">
                <div class = "row">
                <hr></hr>
                <h3 style={{ textAlign: "center" }}>Discover your taste!</h3>

                <p>
                    You are on a self-discovery journey trying to understand your likes and dislikes
                    You start with movie preferences, where you see your movie likes and dislikes 
                    based on your movie preference behavior and compares that to your community.

                    Some cues to get you started with your self discovery:
                    <ul>
                        <li> Is there anything about my or community's preference that surpised me? </li>
                        <li> Is there something new about my preferences that you learned? Take a moment to reflect on it</li>
                        <li> </li>
                    </ul>
                </p>
                </div>
            </div>
        )
    }
}

export default LeftPanel

                // eslint-disable-next-line no-lone-blocks
                {/* <Row> */}
                    // eslint-disable-next-line no-lone-blocks
                    {/* <h2>What can I do with this visualization?</h2>
                    This visualization intends to help you discover the many facets of your preferences by exploring your recommendations.
                </Row>
                <Row>
                    <h2>How do I use this visualization?</h2>
                    Click on the dots to explore the your movie preferences. To  faciliate your self-discovery process you can also see how your preferences compare to  your community’s.
                </Row>
                    Please feel free to take your time exploring your preferences! Happy exploring! Click on the i icon to see this */}