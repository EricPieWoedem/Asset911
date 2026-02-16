module.exports = {
  '**/*.{ts,tsx,json}': (filenames) => {
    const nodejsFiles = filenames.filter((f) => f.includes('assets911-nodejs') && f.endsWith('.ts'));
    const nextjsFiles = filenames.filter((f) => f.includes('assets911-nextjs') && (f.endsWith('.ts') || f.endsWith('.tsx')));
    const jsonFiles = filenames.filter((f) => f.endsWith('.json'));
    
    const commands = [];
    
    if (nodejsFiles.length > 0) {
      const relativePaths = nodejsFiles.map((f) => f.replace(/^.*assets911-nodejs[\\/]/, ''));
      commands.push(`cd assets911-nodejs && node node_modules/.bin/prettier --write ${relativePaths.map(p => `"${p}"`).join(' ')}`);
    }
    
    if (nextjsFiles.length > 0) {
      const relativePaths = nextjsFiles.map((f) => f.replace(/^.*assets911-nextjs[\\/]/, ''));
      commands.push(`cd assets911-nextjs && node node_modules/.bin/prettier --write ${relativePaths.map(p => `"${p}"`).join(' ')}`);
    }
    
    if (jsonFiles.length > 0) {
      commands.push(`node node_modules/.bin/prettier --write ${jsonFiles.map(f => `"${f}"`).join(' ')}`);
    }
    
    return commands;
  },
};
