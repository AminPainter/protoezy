const fs = require('fs-extra');

async function copyFilesLean(src, dest, globalDest = dest) {
    const stats = await fs.stat(src);
    const isDir = stats.isDirectory();

    if (isDir) {
        const files = await fs.readdir(src);

        for (const f of files)
            await copyFilesLean(`${src}/${f}`, `${dest}/${f}`, globalDest);

        return;
    }

    await fs.copy(src, `${globalDest}/${dest.split('/').slice(-1)}`);
}

const s = './chess';
const d = './results';
copyFilesLean(s, d);