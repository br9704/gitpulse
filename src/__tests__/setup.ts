import chalk from 'chalk';

/**
 * Renderer snapshots are compared as plain text.
 *
 * Chalk otherwise picks a colour level from the environment, which would make
 * snapshots pass locally and fail in CI (or vice versa) for reasons that have
 * nothing to do with the code. Pinning to 0 also makes the snapshot files
 * readable, so a diff shows the actual report rather than a wall of escapes.
 */
chalk.level = 0;
