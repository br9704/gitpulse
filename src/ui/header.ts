import chalk from 'chalk';

const LOGO = `
 ██████╗ ██╗████████╗██████╗ ██╗   ██╗██╗     ███████╗███████╗
██╔════╝ ██║╚══██╔══╝██╔══██╗██║   ██║██║     ██╔════╝██╔════╝
██║  ███╗██║   ██║   ██████╔╝██║   ██║██║     ███████╗█████╗  
██║   ██║██║   ██║   ██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝  
╚██████╔╝██║   ██║   ██║     ╚██████╔╝███████╗███████║███████╗
 ╚═════╝ ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝`;

export function renderHeader(): string {
  const gradient = [
    chalk.hex('#FF6B6B'),
    chalk.hex('#FF8E53'),
    chalk.hex('#FED330'),
    chalk.hex('#45B7D1'),
    chalk.hex('#4ECDC4'),
    chalk.hex('#96E6A1'),
  ];

  const lines = LOGO.trim().split('\n');
  const colored = lines.map((line, i) => {
    const colorFn = gradient[i % gradient.length];
    return colorFn(line);
  }).join('\n');

  const subtitle = chalk.dim('  ⚡ Developer Profile Report Card ⚡');

  return `\n${colored}\n${subtitle}\n`;
}

export function renderDivider(width: number = 64): string {
  return chalk.dim('─'.repeat(width));
}

export function renderSectionTitle(title: string): string {
  const icon = getSectionIcon(title);
  return '\n' + chalk.bold.cyan(`${icon} ${title}`);
}

function getSectionIcon(title: string): string {
  const icons: Record<string, string> = {
    'Profile': '👤',
    'Statistics': '📊',
    'Languages': '💻',
    'Top Repositories': '⭐',
    'Contribution Heatmap': '🔥',
    'Commit Patterns': '⏰',
    'Coding Streak': '🔥',
    'Hire-ability Score': '🎯',
    'Comparison': '⚖️',
  };
  return icons[title] || '▸';
}
