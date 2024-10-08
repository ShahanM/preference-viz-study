import { useEffect, useState } from "react";
import LoadingScreen from "../components/loadingscreen/LoadingScreen";
import CartesianGraph from "./CartesianGraph";

// This component is used to display the continuous coupled graph
// @ < 1200px=> the study is unavailable
// @ 1200px to 1399px => width:800, height:900 
// @ 1400px to 1599px => width:700, height:900
// @ >1600px => width:800, height:900 (default)

export default function Continuouscoupled({ itemdata, activeItemCallback }) {

	const [width, setWidth] = useState(800);
	const [height, setHeight] = useState(900);
	const handleHover = (item) => {
		activeItemCallback(item);
	}

	useEffect(() => {
		const handleResize = () => {
			const windowWidth = window.innerWidth;
			if (windowWidth < 1400) {
				setWidth(900 - (1400 - windowWidth) / 2);
				setHeight(900);
			}
			else if (windowWidth < 1800) {
				setWidth(800 - (1800 - windowWidth) / 2);
				setHeight(900);
			}
			else {
				setWidth(1200);
				setHeight(1200);
			}
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<>
			{itemdata ?
				<CartesianGraph key={"user"}
					graphID={"user_comm_graph"}
					width={width} height={height}
					data={itemdata}
					xCol={"community_score"} yCol={"user_score"}
					onItemHover={handleHover}
					showToggle={false}
					variant={1} />
				: <LoadingScreen loading={true} message="Loading Recommendations" />
			}
		</>
	)
}
