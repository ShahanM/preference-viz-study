import React, { useState } from "react";
import Col from 'react-bootstrap/Col';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import CartesianGraph from "./CartesianGraph";
import RightPanel from "./RightPanel";
import { LIKE_CUTOFF, DISLIKE_CUTOFF } from "../utils/constants";

export default function Continuouscoupled({ itemdata }) {

	const [activeItem, setActiveItem] = useState(undefined);

	return (
		<Container>
			{Object.keys(itemdata['movies']).length ?
				<Row>
					<Col xl={9} lg={9} md={8} sm={12}>
						<Row style={{ margin: "0 0 2em 0" }}>
							<CartesianGraph key={"user"}
								graphID={"user_comm_graph"}
								width={800} height={800}
								data={itemdata['movies']}
								xCol={"user_score"} yCol={"community_score"}
								onItemHover={setActiveItem} />
						</Row>
					</Col>
					<Col xl={3} lg={3} md={4} sm={12}>
						<Row style={{ margin: "2em 0 2em 0" }}>
							<RightPanel movie={itemdata['movies'][activeItem]}
								likeCuttoff={LIKE_CUTOFF} dislikeCuttoff={DISLIKE_CUTOFF} />
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
