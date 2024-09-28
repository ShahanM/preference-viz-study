import React, { useMemo, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { imgurl } from "../middleware/requests";
import RightPanel from "./RightPanel";
import { LIKE_CUTOFF, DISLIKE_CUTOFF } from "../utils/constants";


const testContainerStyle = { border: "1px solid black" }

const posterWidth = 36;
const posterHeight = 63;

const likeCuttoff = LIKE_CUTOFF;
const dislikeCuttoff = DISLIKE_CUTOFF;

export default function DiscreteCoupled({ itemdata }) {

    const [activeItem, setActiveItem] = useState(undefined);

    const mylikesCommLikes = useMemo(() => Object.entries(itemdata['movies']).filter((d) =>
        parseFloat(d[1].user_score) > likeCuttoff && parseFloat(d[1].community_score) > likeCuttoff
    ).map((d) => d[1]), [itemdata])

    const mylikesCommDislikes = useMemo(() => Object.entries(itemdata['movies']).filter((d) =>
        parseFloat(d.user_score) > likeCuttoff && parseFloat(d.community_score) < dislikeCuttoff
    ).map((d) => d[1]), [itemdata])

    const mydislikesCommLikes = useMemo(() => Object.entries(itemdata['movies']).filter((d) =>
        parseFloat(d[1].user_score) < dislikeCuttoff && parseFloat(d[1].community_score) > likeCuttoff
    ).map((d) => d[1]), [itemdata])

    const mydislikesCommDislikes = useMemo(() => Object.entries(itemdata['movies']).filter((d) =>
        parseFloat(d[1].user_score) < dislikeCuttoff && parseFloat(d[1].community_score) < dislikeCuttoff
    ).map((d) => d[1]), [itemdata])

    return (
        <Container>
            {Object.keys(itemdata['movies']).length ?
                <Row>
                    <Col xl={8} lg={9} md={8} sm={12}>
                        <Row style={{ margin: "0 0 2em 0" }}>
                            <Row style={{ ...testContainerStyle, padding: "0" }}>
                                <Col lg={2} style={testContainerStyle}></Col>
                                <Col lg={5} style={{ ...testContainerStyle, textAlign: "center" }}>
                                    <p style={{ fontWeight: "bold" }}>My Likes</p>
                                </Col>
                                <Col lg={5} style={{ testContainerStyle, textAlign: "center" }}>
                                    <p style={{ fontWeight: "bold" }}>My Dislikes</p>
                                </Col>
                            </Row>
                            <Row style={{ ...testContainerStyle, padding: "0" }}>
                                <Col lg={2} style={{ ...testContainerStyle, textAlign: "center" }}>
                                    <p style={{ fontWeight: "bold", marginTop: "127px" }}>Community Likes</p>
                                </Col>
                                <Col lg={5} style={testContainerStyle}>
                                    {mylikesCommLikes.length > 0 ?
                                        <PreferenceContainer graphID={"mylikes_commlikes"}
                                            movies={mylikesCommLikes}
                                            width={300} height={300}
                                            onItemHover={setActiveItem} />
                                        : <></>
                                    }
                                </Col>
                                <Col lg={5} style={testContainerStyle}>
                                    {mydislikesCommLikes.length > 0 ?
                                        <PreferenceContainer graphID={"mydislikes_commlikes"}
                                            movies={mydislikesCommLikes}
                                            width={300} height={300}
                                            onItemHover={setActiveItem} />
                                        : <></>
                                    }
                                </Col>
                            </Row>
                            <Row style={{ testContainerStyle, padding: "0" }}>
                                <Col lg={2} style={{ ...testContainerStyle, textAlign: "center" }}>
                                    <p style={{ fontWeight: "bold", marginTop: "127px" }}>Community dislikes</p>
                                </Col>
                                <Col lg={5} style={testContainerStyle}>
                                    {mylikesCommDislikes.length > 0 ?
                                        <PreferenceContainer graphID={"mylikes_commdislikes"}
                                            movies={mylikesCommDislikes}
                                            width={300} height={300}
                                            onItemHover={setActiveItem} />
                                        : <></>
                                    }
                                </Col>
                                <Col lg={5} style={testContainerStyle}>
                                    {mydislikesCommDislikes.length > 0 ?
                                        <PreferenceContainer graphID={"mydislikes_commdislikes"}
                                            movies={mydislikesCommDislikes}
                                            width={300} height={300}
                                            onItemHover={setActiveItem} />
                                        :
                                        <></>
                                    }
                                </Col>
                            </Row>
                        </Row>
                    </Col>
                    <Col xl={4} lg={3} md={4} sm={12}>
                        <Row style={{ margin: "2em 0 2em 0" }}>
                            <RightPanel movie={itemdata['movies'][activeItem]}
                                likeCuttoff={likeCuttoff} dislikeCuttoff={dislikeCuttoff} />
                        </Row>
                    </Col>
                </Row>
                :
                <Row style={{ height: "800px", width: "900px" }}>
                    <h1 style={{ margin: "auto" }}> Please wait some time.... </h1>
                </Row>}
        </Container>
    )
}

function PreferenceContainer({ graphID, movies, width, height, onItemHover }) {

    // Compute coordinates for the graph by spreading out contents furthest 
    // from each other and from the boundaries of the box
    const coords = useMemo(() => {
        if (movies.length === 0) return [];
        if (movies.length === 1) return [{ x: 150, y: 150 }]

        const numrows = Math.ceil(Math.sqrt(movies.length));
        const numcols = Math.floor(movies.length / numrows);
        const danglingRow = movies.length % numrows;

        const yStep = (height - posterHeight / 2) / numrows;
        const danglingXStep = (width - posterWidth / 2) / (danglingRow + 1);
        const xStep = (width - posterWidth / 2) / numcols;
        let coords = [];
        for (let i = 1; i <= danglingRow; i++) {
            coords.push({
                x: (i * danglingXStep) + posterWidth / 2,
                y: yStep - posterHeight / 2
            })
        }

        for (let col = 0; col < numcols; col++) {
            for (let row = 1; row <= numrows; row++) {
                coords.push({
                    x: col * xStep + xStep - posterWidth,
                    y: row * yStep + yStep - posterHeight
                })
            }
        }

        return coords;

    }, [movies, width, height])


    const handleHover = (evt, effect) => {
        let target = evt.target;
        const item_id = target.getAttribute("item_id");
        imgHoverEffect(target, effect);
        onItemHover(item_id);
    }

    const imgHoverEffect = (target, effect) => {
        switch (effect) {
            case "out":
                const itemX = target.getAttribute("x_val");
                const itemY = target.getAttribute("y_val");
                target = transformImg(target, posterWidth, posterHeight,
                    itemX, itemY);
                break;
            case "in":
                const parent = target.parentNode;
                target = transformImg(target, posterWidth * 2, posterHeight * 2,
                    target.getAttribute("x") - posterWidth / 2,
                    target.getAttribute("y") - posterHeight / 2);
                parent.appendChild(target);
                break;
            default:
                break;
        }
    }

    const transformImg = (target, w, h, x, y) => {
        target.setAttribute("width", w);
        target.setAttribute("height", h);
        target.setAttribute("x", x);
        target.setAttribute("y", y);

        return target;
    }

    return (
        <svg key={graphID} id={graphID} width={width} height={height}>
            {movies.map((d, i) =>
                <image key={`img-${graphID}-cc-${d.movie_id}`}
                    id={`img-${graphID}-cc-${d.movie_id}`}
                    width={posterWidth} height={posterHeight}
                    x={coords[i].x}
                    y={coords[i].y}
                    xlinkHref={imgurl(d.poster_identifier)}
                    cursor={"pointer"}
                    item_id={d.movie_id}
                    x_val={coords[i].x} y_val={coords[i].y}
                    item_type={"img"}
                    onMouseEnter={evt => handleHover(evt, "in")}
                    onMouseLeave={evt => handleHover(evt, "out")}
                />
            )}
        </svg>
    )
}
