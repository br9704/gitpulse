import type { UserProfile, ThreeJSExport, ThreeJSNode, ThreeJSConnection } from '../types/index.js';
import { getLanguageColor } from '../utils/colors.js';

/**
 * Generate Three.js-compatible scene data from a user profile
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
    size: Math.max(1, Math.log2(profile.user.followers + 1) * 0.5),
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
        x: Math.cos(angle) * langRadius,
        y: Math.sin(angle) * langRadius,
        z: 0,
      },
      color: getLanguageColor(lang),
      size: Math.max(0.3, Math.log2(count + 1) * 0.4),
      label: lang,
      metadata: { repoCount: count },
    });

    connections.push({
      source: `user-${profile.user.login}`,
      target: nodeId,
      weight: count / Math.max(1, langEntries[0][1]),
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
        x: repoRadius * Math.cos(theta) * Math.sin(phi),
        y: repoRadius * Math.sin(theta) * Math.sin(phi),
        z: repoRadius * Math.cos(phi),
      },
      color: repo.language ? getLanguageColor(repo.language) : '#888888',
      size: Math.max(0.2, Math.log2(repo.stargazers_count + 1) * 0.3),
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
      weight: Math.log2(repo.stargazers_count + 1) * 0.1,
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
      generatedAt: new Date().toISOString(),
    },
    scene: { nodes, connections },
  };
}
