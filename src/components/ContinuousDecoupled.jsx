import React, { useEffect, useState } from "react";
import Col from 'react-bootstrap/Col';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import RightPanel from "./RightPanel";
import SingleScaleGraph from "./SingleScaleGraph";

export default function ContinuousDecoupled({ itemdata }) {

	const [communityList, setCommunityList] = useState([]);
	const [userList, setUserList] = useState([]);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [activeItem, setActiveItem] = useState(undefined);

	useEffect(() => {
		if (Object.keys(itemdata).length > 0) {
			let communityList = [];
			let userList = [];
			for (let itemkey of Object.keys(itemdata)) {
				communityList.push({
					item_id: itemdata[itemkey].movie_id,
					score: itemdata[itemkey].community_score
				});
				userList.push({
					item_id: itemdata[itemkey].movie_id,
					score: itemdata[itemkey].user_score
				});
			}
			setCommunityList(communityList);
			setUserList(userList);
		}
	}, [itemdata])

	useEffect(() => {
		if (userList.length > 0 && communityList.length > 0) {
			setDataLoaded(true);
		}
	}, [userList, communityList])

	return (
		<Container>
			{dataLoaded ?
				<Row>
					<Col lg={9} md={8} sm={12}>
						<Row style={{ margin: "2em 0 2em 0" }}>
							<h2>Your Movie Preferences</h2>
							<SingleScaleGraph key={"user"}
								graphID={"user_graph"}
								width={900} height={300}
								data={userList} dataInfo={itemdata}
								pairingID={"community_graph"}
								onItemHover={setActiveItem} />
						</Row>

						<Row style={{ margin: "2em 0 2em 0" }}>
							<h2>Community's Movie Preferences</h2>
							<SingleScaleGraph key={"community"}
								graphID={"community_graph"}
								width={900} height={300}
								data={communityList} dataInfo={itemdata}
								pairingID={"user_graph"}
								onItemHover={setActiveItem} />
						</Row>
					</Col>
					<Col lg={3} md={4} sm={12}>
						<Row style={{ margin: "2em 0 2em 0" }}>
							<RightPanel movie={itemdata[activeItem]} />
						</Row>
					</Col>
				</Row>
				:
				<Row><h1> Please wait some time.... </h1></Row>}

		</Container>
	)
}
