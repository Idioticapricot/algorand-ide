# Monaco Types Fix - Template-Specific Loading

## Problem
The `@algorandfoundation/algorand-typescript` types were being loaded for all templates (PyTeal, TealScript, PuyaPy, and PuyaTs), but they should only be loaded for the PuyaTs template.

## Solution
Modified the Monaco editor setup to conditionally load types based on the template:

### Changes Made

1. **Modified `lib/setupMonaco.ts`**:
   - Added `Template` type definition
   - Modified `setupMonacoTypes` function to accept an optional `template` parameter
   - Added conditional loading logic - only loads Algorand TypeScript types when `template === 'puyats'`
   - Lazy-loaded the types using a cached approach for better performance

2. **Modified `components/code-editor.tsx`**:
   - Added `Template` type definition
   - Added `template` prop to `CodeEditorProps` interface
   - Updated `CodeEditor` component to accept and pass the template parameter
   - Updated both `beforeMount` and `handleEditorDidMount` to pass template to `setupMonacoTypes`

3. **Modified `components/algorand-ide.tsx`**:
   - Updated the `CodeEditor` usage to pass the template parameter
   - Added type conversion to ensure template matches expected type union
   - Added placeholder `PyodideCompiler` class to fix compilation errors

### Template-Specific Behavior

- **PuyaTs**: ✅ Loads `@algorandfoundation/algorand-typescript` types for full TypeScript support
- **PyTeal**: ⏭️ Skips Algorand TypeScript types (uses Python)
- **TealScript**: ⏭️ Skips Algorand TypeScript types (uses different TypeScript setup)
- **PuyaPy**: ⏭️ Skips Algorand TypeScript types (uses Python)

### Benefits

1. **Reduced Memory Usage**: Types are only loaded when needed
2. **Faster Startup**: Other templates don't need to load unnecessary type definitions
3. **Better Performance**: Monaco editor initialization is faster for non-PuyaTs templates
4. **Cleaner Separation**: Each template gets only the types it needs

### Testing

To test the fix:
1. Open different template pages (PyTeal, TealScript, PuyaPy, PuyaTs)
2. Check browser console for Monaco setup logs
3. Verify that only PuyaTs shows "Loading PuyaTs modules from require.context..."
4. Confirm TypeScript IntelliSense works correctly in PuyaTs but doesn't interfere with other templates

### PuyaPy IntelliSense Features

**Core Types**: UInt64, BigUInt, Bytes, String, Account, Application, Asset, Contract, ARC4Contract, GlobalState, LocalState, Box, BoxMap, BoxRef, Txn, Global

**ARC-4 Types**: arc4.String, arc4.Bool, arc4.UInt64, arc4.Address, arc4.DynamicArray, arc4.StaticArray, arc4.Struct

**Functions & Decorators**: log(), urange(), @arc4.abimethod, @subroutine

**Code Snippets**: Complete contract templates, ABI method templates, state management patterns

**Smart Suggestions**: Context-aware completions based on import statements and code structure

**Hover Documentation**: Detailed explanations for all algopy types and functions

### Files Modified

- `lib/setupMonaco.ts` - Core logic for conditional type loading and PuyaPy IntelliSense
- `components/code-editor.tsx` - Template parameter passing
- `components/algorand-ide.tsx` - Template parameter integration