


export default function DiscreteDecoupled({ itemdata }) {

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

                                </Col>
                                <Col lg={5} style={testContainerStyle}>

                                </Col>
                            </Row>
                            <Row style={{ testContainerStyle, padding: "0" }}>
                                <Col lg={2} style={{ ...testContainerStyle, textAlign: "center" }}>
                                    <p style={{ fontWeight: "bold", marginTop: "127px" }}>Community dislikes</p>
                                </Col>
                                <Col lg={5} style={testContainerStyle}>

                                </Col>
                                <Col lg={5} style={testContainerStyle}>

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
