import { useState } from "react";
import Col from 'react-bootstrap/Col';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from "../utils/constants";
import CartesianGraph from "./CartesianGraph";
import RightPanel from "./rightpanel/RightPanel";
import LoadingScreen from "../components/loadingscreen/LoadingScreen";

export default function Continuouscoupled({ itemdata, activeItemCallback }) {

	const handleHover = (item) => {
		activeItemCallback(item);
	}

	return (
		<Container>
			{itemdata ?
				<Row style={{margin: "0 0 0 0"}}>
					{/* <Col xl={9} lg={9} md={8} sm={12}> */}
					{/* <Row style={{ margin: "0 0 2em 0" }}> */}
						<CartesianGraph key={"user"}
							graphID={"user_comm_graph"}
							width={800} height={800}
							data={itemdata}
							xCol={"community_score"} yCol={"user_score"}
							onItemHover={handleHover}
							showToggle={false}
							variant={1} />
					{/* </Row> */}
					{/* </Col> */}
					{/* <Col xl={3} lg={3} md={4} sm={12}> */}
					{/* <Row style={{ margin: "2em 0 2em 0" }}>
							<RightPanel movie={itemdata.get(activeItem)}
								likeCuttoff={LIKE_CUTOFF} dislikeCuttoff={DISLIKE_CUTOFF} />
						</Row> */}
					{/* </Col> */}
				</Row>
				: <LoadingScreen loading={true} message="Loading Recommendations" />
			}
		</Container>
	)
}
