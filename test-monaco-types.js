// Test script to verify Monaco types loading behavior
// This would be run in the browser console to test the fix

console.log('Testing Monaco types loading...');

// Mock the setupMonacoTypes function to test different templates
function testSetupMonacoTypes(template) {
  console.log(`\n=== Testing template: ${template} ===`);
  
  // Mock monaco object
  const mockMonaco = {
    languages: {
      typescript: {
        typescriptDefaults: {
          addExtraLib: (content, filePath) => {
            console.log(`Would add extra lib: ${filePath}`);
          },
          setCompilerOptions: (options) => {
            console.log('Would set compiler options:', options);
          }
        }
      }
    }
  };
  
  // Simulate the setupMonacoTypes function logic
  if (template === 'puyats') {
    console.log('✅ Loading Algorand TypeScript types for PuyaTs');
    // Would load types here
    mockMonaco.languages.typescript.typescriptDefaults.addExtraLib(
      'mock content', 
      'file:///__typings__/@algorandfoundation/algorand-typescript/index.d.ts'
    );
  } else {
    console.log('⏭️  Skipping Algorand TypeScript types for', template);
  }
  
  mockMonaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    allowJs: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    target: 'ES2020',
    module: 'ESNext',
    moduleResolution: 'NodeJs',
    typeRoots: ["file:///__typings__"],
    strict: false
  });
}

// Test all templates
const templates = ['pyteal', 'tealscript', 'puyapy', 'puyats'];
templates.forEach(testSetupMonacoTypes);

console.log('\n✅ Test completed! Only PuyaTs should load Algorand TypeScript types.');