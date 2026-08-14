import type { UserProfile, ThreeJSExport, ThreeJSNode, ThreeJSConnection } from '../types/index.js';
import { getLanguageColor } from '../utils/colors.js';

/**
 * Round a scene value to a fixed precision.
 *
 * `Math.sin`/`Math.cos`/`Math.sqrt` are not required to be bit-identical across
 * platforms or engine versions, and they are not: the same profile exported on
 * macOS and on Linux differed in the last significant digit
 * (4.044661788320042 vs ...043). That makes the scene undiffable and the export
 * unreproducible across machines, which defeats the point of a stable contract.
 *
 * Applies to every derived float in the scene — positions, sizes and edge
 * weights all run through Math.sin/cos/sqrt/log2. Six decimals is far finer
 * than any renderer can resolve at this scale.
 */
function coord(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/**
 * Generate Three.js-compatible scene data from a user profile.
 *
 * The shape emitted here is a published contract consumed by
 * github-3d-visualizer; it is pinned by snapshot in the test suite.
 */

export function generateThreeJSExport(profile: UserProfile): ThreeJSExport {
  const nodes: ThreeJSNode[] = [];
  const connections: ThreeJSConnection[] = [];

  // Central user node
  nodes.push({
    id: `user-${profile.user.login}`,
    type: 'user',
    position: { x: 0, y: 0, z: 0 },
    color: '#ffffff',
    size: coord(Math.max(1, Math.log2(profile.user.followers + 1) * 0.5)),
    label: profile.user.login,
    metadata: {
      name: profile.user.name,
      followers: profile.user.followers,
      score: profile.score.total,
      grade: profile.score.grade,
    },
  });

  // Language nodes arranged in a circle
  const langEntries = Object.entries(profile.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const langRadius = 5;
  langEntries.forEach(([lang, count], i) => {
    const angle = (i / langEntries.length) * Math.PI * 2;
    const nodeId = `lang-${lang.replace(/[^a-zA-Z0-9]/g, '_')}`;

    nodes.push({
      id: nodeId,
      type: 'language',
      position: {
        x: coord(Math.cos(angle) * langRadius),
        y: coord(Math.sin(angle) * langRadius),
        z: 0,
      },
      color: getLanguageColor(lang),
      size: coord(Math.max(0.3, Math.log2(count + 1) * 0.4)),
      label: lang,
      metadata: { repoCount: count },
    });

    connections.push({
      source: `user-${profile.user.login}`,
      target: nodeId,
      weight: coord(count / Math.max(1, langEntries[0][1])),
    });
  });

  // Repo nodes arranged in a sphere
  const topRepos = [...profile.repos]
    .filter(r => !r.fork)
    .sort((a, b) => (b.stargazers_count * 3 + b.forks_count * 2) - (a.stargazers_count * 3 + a.forks_count * 2))
    .slice(0, 20);

  const repoRadius = 10;
  topRepos.forEach((repo, i) => {
    const phi = Math.acos(-1 + (2 * i) / topRepos.length);
    const theta = Math.sqrt(topRepos.length * Math.PI) * phi;
    const nodeId = `repo-${repo.name.replace(/[^a-zA-Z0-9]/g, '_')}`;

    nodes.push({
      id: nodeId,
      type: 'repo',
      position: {
        x: coord(repoRadius * Math.cos(theta) * Math.sin(phi)),
        y: coord(repoRadius * Math.sin(theta) * Math.sin(phi)),
        z: coord(repoRadius * Math.cos(phi)),
      },
      color: repo.language ? getLanguageColor(repo.language) : '#888888',
      size: coord(Math.max(0.2, Math.log2(repo.stargazers_count + 1) * 0.3)),
      label: repo.name,
      metadata: {
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
      },
    });

    // Connect repo to user
    connections.push({
      source: `user-${profile.user.login}`,
      target: nodeId,
      weight: coord(Math.log2(repo.stargazers_count + 1) * 0.1),
    });

    // Connect repo to its language
    if (repo.language) {
      const langNodeId = `lang-${repo.language.replace(/[^a-zA-Z0-9]/g, '_')}`;
      if (nodes.find(n => n.id === langNodeId)) {
        connections.push({
          source: langNodeId,
          target: nodeId,
          weight: 0.3,
        });
      }
    }
  });

  return {
    metadata: {
      generator: 'gitpulse',
      version: '1.0.0',
      username: profile.user.login,
      // Taken from the profile's own fetch time rather than the wall clock, so
      // the same profile always exports the same scene. An export that differs
      // byte-for-byte on every run cannot be diffed, cached, or snapshot-tested.
      generatedAt: profile.fetchedAt,
    },
    scene: { nodes, connections },
  };
}
