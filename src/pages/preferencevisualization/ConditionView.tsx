import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import LoadingScreen from "../../components/loadingscreen/LoadingScreen";
import DiscreteDecoupled from '../../components/visualiations/DiscreteDecoupled';
import CartesianGraph from "../../widgets/CartesianGraph";
import { activeItemState } from './PreferenceVisualization';
import { PrefVizRecItemDetail } from './VisualizationTypes.types';
import DiscreteCoupled from '../../components/visualiations/DiscreteCoupled';
import ContinuousCoupled from '../../components/visualiations/ContinuousCoupled';
import ContinuousDecoupled from '../../components/visualiations/ContinuousDecoupled';
// import { MySimDatum } from '../../components/visualiations/DiscreteDecoupled';


type ConditionViewProps = {
	condition: number;
	prefItemDetails: Map<string, PrefVizRecItemDetail>;
}

const ConditionView: React.FC<ConditionViewProps> = ({
	condition,
	prefItemDetails
}) => {

	const [width, setWidth] = useState(800);
	const [height, setHeight] = useState(900);

	const setActiveItem = useSetRecoilState(activeItemState);

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
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleHover = (item: string) => {
		const selectedMovie = prefItemDetails.get(item);
		if (selectedMovie) setActiveItem(selectedMovie);
	}

	if (prefItemDetails && prefItemDetails.size > 0) {
		switch (condition) {
			// Continuous coupled
			case 1:
				return <ContinuousCoupled
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover} />;
			// return <CartesianGraph key={"user"}
			// 	graphID={"user_comm_graph"}
			// 	width={width} height={height}
			// 	data={prefItemDetails}
			// 	xCol={"community_score"} yCol={"user_score"}
			// 	onItemHover={handleHover}
			// 	showToggle={false}
			// 	variant={1} />;
			// Continuous decoupled
			case 2: // TODO
				return <ContinuousDecoupled
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover} />;
			// Discrete coupled
			case 3: return <DiscreteCoupled
				width={width}
				height={height}
				data={prefItemDetails}
				xCol={"community_score"} yCol={"user_score"}
				onHover={handleHover}
			/>;
			// Discrete decoupled
			case 4: // TODO
				return <DiscreteDecoupled
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover}
				/>;
			default: return <LoadingScreen loading={true} message="Loading Recommendations" />;
		}
	} else {
		return <LoadingScreen loading={true} message="Loading Recommendations" />;
	}
}

export default ConditionView;