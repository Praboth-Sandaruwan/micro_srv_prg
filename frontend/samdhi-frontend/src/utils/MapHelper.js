export function samplePoints(path, count) {
  if (!path || path.length <= count) return path;

  const step = Math.floor(path.length / (count - 1));
  const sampled = [];

  for (let i = 0; i < path.length; i += step) {
    sampled.push(path[i]);
  }

  if (sampled[sampled.length - 1] !== path[path.length - 1]) {
    sampled.push(path[path.length - 1]);
  }

  return sampled;
}
