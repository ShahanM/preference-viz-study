/**
 * Fisheye distortion function for 1D coordinates in a 2D space.
 * @param val The value to distort (coordinate).
 * @param focus The focus point (mouse position).
 * @param distortionFactor The strength of the distortion.
 * @param min The minimum value of the range (bounds).
 * @param max The maximum value of the range (bounds).
 * @returns The distorted value.
 */
export const fisheye = (val: number, focus: number, distortionFactor: number, min: number, max: number): number => {
    const leftDist = focus - min;
    const rightDist = max - focus;

    if (val < focus) {
        if (leftDist === 0) return val;
        const t = (focus - val) / leftDist;
        const d = distortionFactor;
        const t_distorted = ((d + 1) * t) / (d * t + 1);
        return focus - t_distorted * leftDist;
    } else {
        if (rightDist === 0) return val;
        const t = (val - focus) / rightDist;
        const d = distortionFactor;
        const t_distorted = ((d + 1) * t) / (d * t + 1);
        return focus + t_distorted * rightDist;
    }
};
