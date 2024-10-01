import React, { useState } from 'react';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { Link } from 'react-router-dom';


export default function InformedConsentModal(props) {

	const [isConsentGiven, setIsConsentGiven] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleConsent = (e) => {
		setIsLoading(true);
		props.consentCallback(isConsentGiven);
	}

	return (

		<Modal className="informedConsent"
			show={props.show} dialogClassName="modal-80w" style={{ zIndex: "2050" }
			}>
			<Modal.Header>
				<Modal.Title>
					<h2>
						Testing preferences visualization for movie recommendations
					</h2>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<h3>
					Call for Participation and Consent
				</h3>
				<p>
					Dr. Bart Knijnenburg is inviting you to volunteer for a 
					research study. Dr. Bart Knijnenburg is an Associate 
					Professor at Clemson University conducting the study with 
					graduate students. In this study, you will be asked to 
					interact with a movie recommender system.
				</p>
				<h4>
					Study Purpose
				</h4>
				<p>
					The goal of this study is to support users in developing, 
					exploring, and understanding their unique personal 
					preferences to help them escape the trap of 
					"Filter bubbles," a problematic side effect of 
					recommendation technology that is otherwise meant to help 
					make decisions. To support users and understand their unique
					personal taste, we designed a movie rating system that 
					displays items beyond the top-rated ones to help both the
					users understand their tastes and recommenders get a better 
					idea of users' tastes. In this experiment, we will ask users
					to rate N number of movies in our system and complete a 
					survey pertaining to their thoughts about how the movies 
					helped them learn, grow, and expand their preferences.
				</p>

				<h4>
					Eligibility
				</h4>
				<p>
					Please note that you may only participate in this study 
					once. Previous participants in this study are not eligible 
					to participate again. When you participate, please carefully
					perform every task and read each question before you provide
					your answers. We are not able to pay workers who just click 
					through without paying attention to what they are doing. If 
					your attention drops or your mouse hand gets tired, please 
					take a short break before continuing the study. Feel free to
					take it easy. Please feel free to reach out to Sushmita Khan
					(sushmik@clemson.edu) if you have any questions.
					Thank you for your time!
				</p>

				<h4>
					Time and Compensation
				</h4>
				<p>
					It will take about 15 to 20 minutes to complete the study, 
					and you will receive&nbsp;
					<span className="textemph">$2.75</span>&nbsp;
					upon completion. Participation is voluntary. Please feel 
					free to reach out to Sushmita Khan (sushmik@clemson.edu) if 
					you have any questions. Thank you for your time!
				</p>

				<Form.Check style={{ fontWeight: "500", marginTop: "9px" }}
					label="I have read and understood this consent form and I agree to participate in this
					research study"
					onChange={(evt) => setIsConsentGiven(evt.target.checked)}
					default={false} />
			</Modal.Body>
			<Modal.Footer>
				<Link to="/quit">
					<Button variant="ersCancel">
						Exit
					</Button>
				</Link>
				<Button variant="ers" disabled={!isConsentGiven || isLoading}
					onClick={(e) => handleConsent(e)}>
					{!isLoading ? 'Continue'
						:
						<>
							<Spinner
								as="span"
								animation="grow"
								size="sm"
								role="status"
								aria-hidden="true"
							/>
							Loading...
						</>
					}
				</Button>
			</Modal.Footer>
		</Modal >

	)
}