export const mapKeyContainsAll = (mapA: Map<number, any>, arrayLike: number[]) => {
	for (let item of arrayLike) {
		if (!mapA.has(item)) {
			console.log("We got a false");
			return false;
		}
	}
	return true;
}