export type Movie = {
	id: string
	movielens_id: number,
	imdb_id: number,
	title: string,
	year: number,
	runtime: number,
	genre: string,
	aveRating: number,
	director?: string,
	writer: string,
	description: string,
	cast: string,
	poster: string,
	poster_identifier?: string,
	anger?: number,
	anticipation?: number,
	disgust?: number,
	fear?: number,
	joy?: number,
	sadness?: number,
	surprise?: number,
	trust?: number,
	rating?: number
}

export type MovieRating = {
	id: string,
	movielens_id: number,
	rating: number
}

export interface MovieGridItemProps {
	movieItem: Movie,
	ratingCallback: (rating: number, movie_id: string) => void
}
