// Require necessary modules
const fs = require('fs-extra'),
  path = require('path');

// Extension-purpose datastructure
const types = JSON.parse(fs.readFileSync('./gerberTypes.json'));

// Get list of gerber files
const dir = process.argv[2];
const files = fs.readdirSync(dir).map(f => path.join(__dirname, dir, f));

// Utility method to remove special characters from output
const purifyStringArray = arr => {
  const purifiedArr = arr.map(p => p.replace(/[^a-zA-Z0-9 ]/g, ''));
  return !purifiedArr[0] ? null : purifiedArr;
};

// Utility method to find purpose by extension
const tryByExt = extension => {
  const extensionRefined =
    typeof extension === 'object' ? extension[0] : extension;
  return types.find(({ ext }) => ext === extensionRefined)?.desc;
};

// MAIN METHOD
const getPurpose = async (filePath, keywords = ['FileFunction', '%IN']) => {
  // Try finding purpose by file extension
  const ext = filePath.split('.').slice(-1);
  const attemptedPurpose = tryByExt(ext);
  if (attemptedPurpose) return attemptedPurpose;

  // Read gerber file using native fs module in a string
  const content = await fs.readFile(filePath, 'utf-8');

  // Split the string into an array using new line as divider
  const contentLines = content.split(/\r?\n/);

  // Loop over all the keywords that identify the purpose of a gerber
  for (const keyword of keywords) {
    // Find a line in the array (contentLines) that match the keyword
    let purposeLine = contentLines
      .filter(line => line.includes(keyword))
      .join('\n');

    // If no line could be found, try another keyword
    if (!purposeLine) continue;

    // Parse the line that matched with keyword
    switch (keyword) {
      case 'FileFunction': {
        const [purpose] = purposeLine.split(keyword).slice(-1);
        return purifyStringArray(purpose.split(',').slice(1));
      }

      case '%IN': {
        const [, purpose] = purposeLine.split('%IN');
        return purifyStringArray(purpose.split(' '));
      }
    }
  }
};

// Loop over all files and get their purpose
(async () => {
  console.log('[FILE]' + '--------------' + '[PURPOSE]');
  for (const f of files) {
    const purpose = await getPurpose(f);
    console.log(f.split('\\').slice(-1), purpose, !purpose ? '💣💣💣' : '');
  }
})();
