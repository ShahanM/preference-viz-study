import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import LoadingScreen from "../../components/loadingscreen/LoadingScreen";
import Baseline from '../../components/visualiations/Baseline';
import ContinuousCoupled from '../../components/visualiations/ContinuousCoupled';
import ContinuousDecoupled from '../../components/visualiations/ContinuousDecoupled';
import ContinuousSelf from '../../components/visualiations/ContinuousSelf';
import DiscreteDecoupled from '../../components/visualiations/DiscreteDecoupled';
import DiscreteSelf from '../../components/visualiations/DiscreteSelf';
import { movieSelectionState } from '../../states/ItemState';
import { PrefVizRecItemDetail } from './VisualizationTypes.types';


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

	const setSelectedMovie = useSetRecoilState(movieSelectionState);

	useEffect(() => {
		const handleResize = () => {
			const windowWidth = window.innerWidth;
			if (windowWidth < 1400) {
				setWidth(900 - (1400 - windowWidth) / 2);
				setHeight(900);
			}
			else if (windowWidth < 1800) {
				setWidth(800 - (1600 - windowWidth) / 2);
				setHeight(900);
			} else if (windowWidth < 2000) {
				setWidth(1000 - (1900 - windowWidth) / 2);
				setHeight(1000);
			}
			else {
				setWidth(1000);
				setHeight(1000);
			}
			console.log("window width", windowWidth);
		}
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleHover = (item: string) => {
		const selectedMovie = prefItemDetails.get(item);
		if (selectedMovie) setSelectedMovie(selectedMovie);
	}

	if (prefItemDetails && prefItemDetails.size > 0) {
		switch (condition) {
			case 1:
			case 11:
				return <ContinuousCoupled
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover} />
			case 2:
			case 21:
				return <ContinuousDecoupled
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover} />
			case 3:
			case 31:
				return <DiscreteDecoupled
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover}
				/>
			case 4:
				return <Baseline
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover}
				/>
			case 5:
			case 51:
				return <ContinuousSelf
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover} />
			case 6:
			case 61:
				return <DiscreteSelf
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover} />
			default: return <LoadingScreen loading={true} message="Loading Recommendations" />;
		}
	} else {
		return <LoadingScreen loading={true} message="Loading Recommendations" />;
	}
}

export default ConditionView;