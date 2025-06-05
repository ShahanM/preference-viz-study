import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { useRecoilValue } from "recoil";
import { movieSelectionState } from "../../state/ItemState";
import "./RightPanel.css";

export default function RightPanel({ likeCuttoff, dislikeCuttoff }) {

    const [ratingSummary, setRatingSummary] = useState("");
    const selectedMovie = useRecoilValue(movieSelectionState);

    useEffect(() => {
        if (!selectedMovie) {
            setRatingSummary("Select a movie to see details.");
            return;
        }
        const comm_score = selectedMovie.community_score;
        const user_score = selectedMovie.user_score;
        if (comm_score < dislikeCuttoff && user_score < dislikeCuttoff) {
            setRatingSummary("You and your community both dislike this movie.");
        } else if (comm_score < dislikeCuttoff && user_score > likeCuttoff) {
            setRatingSummary("You like this movie, but your community dislikes it.");
        } else if (comm_score > likeCuttoff && user_score < dislikeCuttoff) {
            setRatingSummary("You dislike this movie, but your community likes it.");
        } else if (comm_score > likeCuttoff && user_score > likeCuttoff) {
            setRatingSummary("You and your community both like this movie.");
        }
    }, [selectedMovie, likeCuttoff, dislikeCuttoff]);

    return (
        <Container className="rightpanel">
            {/* <Row className="header">
                <h3>{ratingSummary}</h3>
            </Row> */}
            <hr />

            {!selectedMovie ?
                <></> :
                <>
                    <Row>
                        <img
                            src={selectedMovie.poster}
                            alt={selectedMovie.title} />
                    </Row>
                    <Row>
                        <h3 className="movie-title">
                            {selectedMovie.title} ({selectedMovie.year})
                        </h3>
                    </Row>
                    <Row style={{ textAlign: "left", fontWeight: "bold" }}>
                        <p>{ratingSummary}</p>
                    </Row>
                    <Row className="details">
                        <p>
                            <strong>Cast: </strong>{`${selectedMovie.cast.split("|").slice(0, 3).join(", ")}`}
                            <span className="more"> [more]</span>
                        </p>
                        <p>
                            <strong>Director: </strong>{selectedMovie.director}
                        </p>
                        <p>
                            {selectedMovie.description.split(" ").slice(0, 25).join(" ")}
                            <span className="more"> [more]</span>
                        </p>
                    </Row>
                </>
            }
        </Container>
    )
}
