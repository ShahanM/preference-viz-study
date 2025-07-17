import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import LoadingScreen from "../../components/loadingscreen/LoadingScreen";
import Baseline from '../../components/visualiations/Baseline';
import ContinuousCoupled from '../../components/visualiations/ContinuousCoupled';
import ContinuousDecoupled from '../../components/visualiations/ContinuousDecoupled';
import ContinuousSelf from '../../components/visualiations/ContinuousSelf';
import DiscreteCoupled from '../../components/visualiations/DiscreteCoupled';
import DiscreteDecoupled from '../../components/visualiations/DiscreteDecoupled';
import DiscreteSelf from '../../components/visualiations/DiscreteSelf';
import { movieSelectionState } from '../../states/ItemState';
import { PrefVizRecItemDetail } from './VisualizationTypes.types';
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

	const [selectedMovie, setSelectedMovie] = useRecoilState(movieSelectionState)

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
		if (selectedMovie) setSelectedMovie(selectedMovie);
	}

	if (prefItemDetails && prefItemDetails.size > 0) {
		switch (condition) {
			case 1:
				return <ContinuousCoupled
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover} />;
			case 2:
				return <ContinuousDecoupled
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover} />;
			case 3:
				return <DiscreteCoupled
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover}
				/>;
			case 4:
				return <DiscreteDecoupled
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover}
				/>;
			case 5:
				return <Baseline
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover}
				/>
			case 6:
				return <ContinuousSelf
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover} />;
			case 7:
				return <DiscreteSelf
					width={width}
					height={height}
					data={prefItemDetails}
					xCol={"community_score"} yCol={"user_score"}
					onHover={handleHover} />;
			default: return <LoadingScreen loading={true} message="Loading Recommendations" />;
		}
	} else {
		return <LoadingScreen loading={true} message="Loading Recommendations" />;
	}
}

export default ConditionView;