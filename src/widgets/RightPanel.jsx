import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { imgurl } from "../middleware/requests";

export default function RightPanel({ movie, likeCuttoff, dislikeCuttoff }) {

    const [ratingSummary, setRatingSummary] = useState("");

    useEffect(() => {
        if (movie === undefined) return;
        const comm_score = movie.community_score;
        const user_score = movie.user_score;
        if (comm_score < dislikeCuttoff && user_score < dislikeCuttoff) {
            setRatingSummary("You and your community both dislike this movie.");
        } else if (comm_score < dislikeCuttoff && user_score > likeCuttoff) {
            setRatingSummary("You like this movie, but your community dislikes it.");
        } else if (comm_score > likeCuttoff && user_score < dislikeCuttoff) {
            setRatingSummary("You dislike this movie, but your community likes it.");
        } else if (comm_score > likeCuttoff && user_score > likeCuttoff) {
            setRatingSummary("You and your community both like this movie.");
        }
    }, [movie, likeCuttoff, dislikeCuttoff]);

    return (
        <Container>
            <Row>
                <h3 style={{ textAlign: "center" }}>Preference Status</h3>
            </Row>

            {movie !== undefined ?
                <>
                    <Row style={{ height: "36em" }}>
                        <Row>
                            <img className="imgRightPanel"
                                src={imgurl(movie.poster_identifier)}
                                alt={movie.title} />
                        </Row>

                        <Row>
                            <h3 style={{ fontSize: 20, fontFamily: "Helvetica Neue", textAlign: "center" }}>
                                {movie.title} ({movie.year})
                            </h3>
                        </Row>
                        <Row style={{ height: "12em", overflowY: "scroll" }}>
                            <p style={{ fontSize: 12, fontFamily: "Helvetica Neue", textAlign: "left" }}>
                                {movie.description}
                            </p>
                        </Row>
                    </Row>
                    <Row style={{ marginTop: "2em" }}>
                        <p style={{ fontSize: 12, fontFamily: "Helvetica Neue", textAlign: "left" }}>
                            <b><i>{ratingSummary}</i></b>
                        </p>
                    </Row>
                </> : <></>
            }
        </Container>
    )
}
