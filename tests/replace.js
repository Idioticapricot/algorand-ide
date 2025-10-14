/**
 * Replace URLs in puya-ts resolve-puya-path file
 */
export async function replacePuyaUrls(webcontainer) {
  if (!webcontainer) {
    console.error('WebContainer not available');
    return;
  }

  try {
    // Find the resolve-puya-path file
    const nodeModulesPath = 'node_modules/@algorandfoundation/puya-ts';
    const files = await webcontainer.fs.readdir(nodeModulesPath);
    
    console.log('Files in puya-ts directory:', files);
    
    // Also check puya subdirectory
    try {
      const puyaPath = `${nodeModulesPath}/puya`;
      const puyaFiles = await webcontainer.fs.readdir(puyaPath);
      console.log('Files in puya-ts/puya directory:', puyaFiles);
      
      // Read run-puya.d.ts content
      try {
        const runPuyaContent = await webcontainer.fs.readFile(`${puyaPath}/run-puya.d.ts`, 'utf-8');
        console.log('Content of run-puya.d.ts:');
        console.log(runPuyaContent);
      } catch (error) {
        console.log('run-puya.d.ts not found or error:', error.message);
      }
    } catch (error) {
      console.log('puya subdirectory not found or error:', error.message);
    }
    
    const resolveFile = files.find(file => file.startsWith('resolve-puya-path-') && file.endsWith('.js'));
    
    if (!resolveFile) {
      console.error('resolve-puya-path file not found');
      console.error('Available files:', files);
      return;
    }

    const filePath = `${nodeModulesPath}/${resolveFile}`;
    console.log(`Found resolve file: ${filePath}`);
    
    // Read the file content
    let content = await webcontainer.fs.readFile(filePath, 'utf-8');
    
    // Replace the URLs
    const originalArchivePattern = /const archiveUrl = `https:\/\/github\.com\/\$\{Constants\.puyaGithubRepo\}\/releases\/download\/v\$\{version\.formatted\}\/\$\{archiveFileName\}`;/g;
    const originalChecksumPattern = /const checksumUrl = `https:\/\/github\.com\/\$\{Constants\.puyaGithubRepo\}\/releases\/download\/v\$\{version\.formatted\}\/\$\{checksumFileName\}`;/g;
    
    content = content.replace(originalArchivePattern, 'const archiveUrl = `https://nickthelegend.github.io/puya-mirror/src/puya-4.7.0-linux_x64.tar.gz`;');
    content = content.replace(originalChecksumPattern, 'const checksumUrl = `https://nickthelegend.github.io/puya-mirror/src/puya-4.7.0-linux_x64.sha256.txt`;');
    
    // Write back the modified content
    await webcontainer.fs.writeFile(filePath, content);
    
    console.log('Successfully replaced puya URLs');
    console.log('Modified file content:');
    console.log(content);
    return true;
  } catch (error) {
    console.error('Error replacing puya URLs:', error);
    return false;
  }
}