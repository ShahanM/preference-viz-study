export const mapKeyContainsAll = <T>(mapA: Map<T, any>, arrayLike: T[]) => {
	for (let item of arrayLike) {
		if (!mapA.has(item)) {
			console.log("We got a false");
			return false;
		}
	}
	return true;
}