import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { imgurl } from "../../middleware/requests";
import "./RightPanel.css";

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
        <Container className="rightpanel">
            <Row className="header">
                <h3>{ratingSummary}</h3>
            </Row>
            <hr />

            {movie !== undefined ?
                <>
                    {/* <Row> */}
                    <Row>
                        <img
                            // src={imgurl(movie.poster_identifier)}
                            src={movie.poster}
                            alt={movie.title} />
                    </Row>
                    <Row>
                        <h3 className="movie-title">
                            {movie.title} ({movie.year})
                        </h3>
                    </Row>
                    <Row className="details">
                        <p>
                            <strong>Cast: </strong>{`${movie.cast.split("|").slice(0, 3).join(", ")}`}
                            <span className="more"> [more]</span>
                        </p>
                        <p>
                            <strong>Director: </strong>{movie.director}
                        </p>
                        <p>
                            {movie.description.split(" ").slice(0, 25).join(" ")}
                            <span className="more"> [more]</span>
                        </p>
                        {/* <p>User score: {movie.user_score}</p> */}
                        {/* <p>Community score: {movie.community_score}</p> */}
                    </Row>
                    {/* </Row> */}
                    {/* <Row style={{ marginTop: "2em" }}>
                        <p>
                            <b><i>{ratingSummary}</i></b>
                        </p>
                    </Row> */}
                </> : <></>
            }
        </Container>
    )
}
