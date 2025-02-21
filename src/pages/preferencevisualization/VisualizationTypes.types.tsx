import { Movie} from "../../widgets/moviegrid/moviegriditem/MovieGridItem.types";

export type PrefVizRecItem = {
	item_id: number;
	community_score: number;
	user_score: number;
	community_label: number;
	user_label: number;
	cluster: number;
}

export type PrefVizMetadata = {
	algo: string;
	randomize: boolean;
	init_sample_size: number;
	min_rating_count: number;
	num_rec: number;
}

export type PrefVizItem = {
	metadata: PrefVizMetadata;
	recommendations: PrefVizRecItem[];
}

export interface PrefVizRecItemDetail extends Movie, PrefVizRecItem { }